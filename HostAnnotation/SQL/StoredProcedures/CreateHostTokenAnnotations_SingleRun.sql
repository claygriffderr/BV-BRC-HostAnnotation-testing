
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ==========================================================================================================
-- Author: don dempsey
-- Created on: 01/25/22
-- Description: Create host token annotation records for the specified host.
-- Updated: 01/25/22 dmd: Copied from "getHostInputAnnotationsAsTable" (function)
--			02/17/22 dmd: Updated with latest version of the scoring algorithm.
--			04/21/22 dmd: Updated with latest version of the scoring algorithm.
--			04/29/22 dmd: Added tax_rank_score, lowered importance of db_score, changed db_score calculation.
--			05/12/22 dmd: Removed dbref_count, updated composite score calculation.	  
--			05/18/22 dmd: Added 3 new token types
--			05/23/22 dmd: scoring algorithm factors are now input parameters.
--			08/18/22 dmd: Renamed from createHostnameInputAnnotations, updated schema.
--			09/07/22 dmd: Removed parameters @taxRankScoreFactor and @prependCommonTID
--			09/17/22 dmd: Lowered priority score for non-Avian NCBI result with dbref_count = 1
--			10/11/22 dmd: Remove tax ID and tax name consensus, penalized add_s_to_end hostname type.
--			12/08/22 dmd: Renamed from "createHostAnnotations"
--			03/16/23 dmd: Renamed from createHostAnnotationsFromHostTokens
--			03/19/23 dmd: Adjusted hostname type scoring so that base types are 8 points, non-minus
--						  variations are 7 points.
-- ==========================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.createHostTokenAnnotations_SingleRun') IS NOT NULL
	DROP PROCEDURE dbo.createHostTokenAnnotations_SingleRun
GO

CREATE PROCEDURE dbo.createHostTokenAnnotations_SingleRun
	@algorithmID AS INT,
	@hostID AS INT

AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000


	--==========================================================================================================
	-- Algorithm factors
	--==========================================================================================================
	DECLARE @crossRefScoreFactor AS FLOAT
	DECLARE @hostnameTypeScoreFactor AS FLOAT
	DECLARE @matchTypeScoreFactor AS FLOAT
	DECLARE @nameClassScoreFactor AS FLOAT
	DECLARE @priorityScoreFactor AS FLOAT
	DECLARE @rankNameScoreFactor AS FLOAT
	DECLARE @scoreMultiplier AS FLOAT

	-- Get the active factors.
	SELECT TOP 1
		@algorithmID = av.id,
		@crossRefScoreFactor = av.factor_crossref_score,
		@hostnameTypeScoreFactor = av.factor_hostname_type_score,
		@matchTypeScoreFactor = av.factor_match_type_score,
		@nameClassScoreFactor = av.factor_name_class_score,
		@priorityScoreFactor = av.factor_priority_score,
		@rankNameScoreFactor = av.factor_rank_name_score,
		@scoreMultiplier = av.score_multiplier

	FROM algorithm_version av
	WHERE av.is_active = 1
	AND (
		(@algorithmID IS NOT NULL AND av.id = @algorithmID)
		OR (@algorithmID IS NULL 
			AND av.id = (
				SELECT TOP 1 id
				FROM algorithm_version
				WHERE is_active = 1
				ORDER BY created_on DESC
			)
		) 
	)

	--==========================================================================================================
	-- Taxomomy IDs for class Aves.
	--==========================================================================================================
	DECLARE @avesTaxID AS INT = (SELECT TOP 1 tax_id FROM [NCBI_TAXONOMY].dbo.ncbi_names WHERE name = 'aves')
	DECLARE @avesTSN AS INT = (SELECT TOP 1 tsn FROM [ITIS_TAXONOMY].dbo.taxonomic_units tu WHERE tu.complete_name = 'aves')

	--==========================================================================================================
	-- Get hostname type term IDs
	--==========================================================================================================
	DECLARE @addSToEndTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.add_s_to_end')
	DECLARE @altSpellingOrSynonymTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.alt_spelling_or_synonym')
	DECLARE @appendSpDotTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.append_spdot')
	DECLARE @curationIgnoredTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.curation_ignored')
	DECLARE @minusOneWordTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_one_word')
	DECLARE @minusOneWordLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_one_word_left')
	DECLARE @minusTwoWordsTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_two_words')
	DECLARE @minusTwoWordsLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_two_words_left')
	DECLARE @minusThreeWordsTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_three_words')
	DECLARE @minusThreeWordsLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_three_words_left')
	DECLARE @removeCommonTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.remove_common_from_start')
	DECLARE @removeCommonAppendSpDotTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.remove_common_append_spdot')
	DECLARE @removeSAppendSpDotTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.remove_s_append_spdot')
	DECLARE @removeSFromEndTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.remove_s_from_end')
	DECLARE @removeSpDotFromEndTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.remove_spdot_from_end')
	DECLARE @stopWordsRemovedTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.stop_words_removed')
	DECLARE @unmodifiedTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.unmodified')

	--=====================================================================================================================
	-- Get term IDs for match types
	--=====================================================================================================================
	DECLARE @customTextTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.custom_text')
	IF @customTextTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.custom_text', 1
	
	DECLARE @directMatchTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.direct_match')
	IF @directMatchTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.direct_match', 1
	
	DECLARE @directMatchXRefTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.direct_match_cross_reference')
	IF @directMatchXRefTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.direct_match_cross_reference', 1
	
	DECLARE @indirectMatchTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.indirect_match')
	IF @indirectMatchTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.indirect_match', 1
	
	DECLARE @indirectMatchXRefTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.indirect_match_cross_reference')
	IF @indirectMatchXRefTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.indirect_match_cross_reference', 1

	DECLARE @manualSelectionTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxon_match_type.manual_selection')
	IF @manualSelectionTID IS NULL THROW @errorCode, 'Invalid term ID for taxon_match_type.manual_selection', 1
	
	--==========================================================================================================
	-- Get term IDs for NCBI name classes
	--==========================================================================================================
	DECLARE @blastNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.blast_name')
	DECLARE @commonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.common_name')
	DECLARE @equivalentNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.equivalent_name')
	DECLARE @gbCommonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.genbank_common_name')
	DECLARE @scientificNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.scientific_name')
	DECLARE @synonymNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.synonym')

	--==========================================================================================================
	-- Taxonomy databases
	--==========================================================================================================
	DECLARE @bvbrcDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.bv_brc')
	DECLARE @ebirdDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ebird')
	DECLARE @itisDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.itis')
	DECLARE @ncbiDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ncbi')


	--==========================================================================================================
	-- The number of taxonomy databases (excluding BV-BRC)
	--==========================================================================================================
	DECLARE @nonEbirdDbCount AS INT = 2

	--==========================================================================================================
	-- Get intermediate host token / taxon name match data.
	--==========================================================================================================
	DECLARE @hostTokenMatches AS dbo.HostTokenMatchesTableType
	INSERT INTO @hostTokenMatches
	SELECT
		-- Assign a score based on the specificity of the cross reference source's name class. 
		crossref_score = CASE
			WHEN crossref_source_tn.name_class_tid IS NULL THEN 5
			WHEN crossref_source_tn.name_class_tid = @scientificNameTID THEN 4
			WHEN crossref_source_tn.name_class_tid IN (@equivalentNameTID, @synonymNameTID) THEN 3
			WHEN crossref_source_tn.name_class_tid = @gbCommonNameTID THEN 2
			WHEN crossref_source_tn.name_class_tid IN (@blastNameTID, @commonNameTID) THEN 1
			ELSE 0
		END,
		crossref_source_tn.name AS crossref_source_name,
		crossref_source_tn.name_class_tid AS crossref_source_name_class_tid,
		crossref_source_tn.taxonomy_db_tid AS crossref_source_taxonomy_db_tid,

		tokens.filtered_host_token AS hostname,

		-- Assign a score based on our confidence in the hostname type
		hostname_type_score = CASE

			-- Base token types
			WHEN tokens.hostname_type_tid IN (
				@altSpellingOrSynonymTID,
				@stopWordsRemovedTID,
				@unmodifiedTID,
				@addSToEndTID, 
				@appendSpDotTID, 
				@removeCommonTID, 
				@removeCommonAppendSpDotTID,
				@removeSAppendSpDotTID,
				@removeSFromEndTID, 
				@removeSpDotFromEndTID
			) THEN 8

			/*-- Singular to plural, plural to singular, +/- common (more or same specificity), +/- .sp (less specificity)
			WHEN tokens.hostname_type_tid IN (
				
			) THEN 7 */

			-- Minus (1,2,3) words from the left and right
			WHEN tokens.hostname_type_tid = @minusOneWordTID THEN 6
			WHEN tokens.hostname_type_tid = @minusTwoWordsTID THEN 5
			WHEN tokens.hostname_type_tid = @minusThreeWordsTID THEN 4
			WHEN tokens.hostname_type_tid = @minusOneWordLeftTID THEN 3
			WHEN tokens.hostname_type_tid = @minusTwoWordsLeftTID THEN 2		
			WHEN tokens.hostname_type_tid = @minusThreeWordsLeftTID THEN 1
			ELSE 0
		END,

		tokens.hostname_type_tid,
		tokens.host_token_id,
		
		-- Avian results are handled differently
		is_avian = CASE
			WHEN tn.taxonomy_db_tid = @ebirdDbTID THEN 1
			WHEN [ITIS_TAXONOMY].dbo.itis_classes.class_tsn IS NOT NULL AND [ITIS_TAXONOMY].dbo.itis_classes.class_tsn = @avesTSN THEN 1
			WHEN [NCBI_TAXONOMY].dbo.ncbi_classes.class_tax_id IS NOT NULL AND [NCBI_TAXONOMY].dbo.ncbi_classes.class_tax_id = @avesTaxID THEN 1
			ELSE 0
		END,

		-- Is this a "curated" match (custom text or a manually-selected match) or an automated match?
		is_curated = CASE
			WHEN tnm.match_type_tid IN (@customTextTID, @manualSelectionTID) THEN 1 ELSE 0
		END,

		tokens.is_one_of_many,

		-- Is this a scientific name/synonym?
		is_scientific_name = CASE
			WHEN tn.name_class_tid IN (@scientificNameTID, @synonymNameTID, @equivalentNameTID) THEN 1 ELSE 0
		END,

		tn.is_valid,
			
		-- The hostname / taxon name match ID
		tnm.id AS match_id,

		-- Assign a score based on how the hostname was matched to a taxon name. For now, consider a "curated" match (custom text 
		-- or manually selected taxon) as good as a direct match to avoid penalizing non-curated matches with a lower score. Curated 
		-- matches will be prioritized over all other types when the host's highest-scoring annotations are selected.
		match_type_score = CASE			
			WHEN tnm.match_type_tid IN (@customTextTID, @directMatchTID, @manualSelectionTID) THEN 4
			WHEN tnm.match_type_tid = @indirectMatchTID THEN 3
			WHEN tnm.match_type_tid = @directMatchXRefTID THEN 2
			WHEN tnm.match_type_tid = @indirectMatchXRefTID THEN 1
			ELSE 0
		END,

		tnm.match_type_tid,

		-- Assign a score based on the name class specificity
		name_class_score = CASE
			WHEN tn.name_class_tid = @scientificNameTID THEN 4
			WHEN tn.name_class_tid IN (@equivalentNameTID, @synonymNameTID) THEN 3
			WHEN tn.name_class_tid = @gbCommonNameTID THEN 2
			WHEN tn.name_class_tid IN (@blastNameTID, @commonNameTID) THEN 1
			ELSE 0
		END,

		tn.name_class_tid,

		-- The taxonomic rank name
		tn.rank_name,

		-- A score for the taxonomic rank
		-- TODO: regularly query the taxon name matches to ensure all possible rank names are represented here.
		rank_name_score = CASE 
			WHEN tn.rank_name = 'kingdom' THEN 0
			WHEN tn.rank_name = 'subkingdom' THEN 1
			WHEN tn.rank_name = 'infrakingdom' THEN 2
			WHEN tn.rank_name = 'parvkingdom' THEN 3
			WHEN tn.rank_name IN ('superphylum', 'superdivision') THEN 4
			WHEN tn.rank_name IN ('phylum', 'division') THEN 5
			WHEN tn.rank_name IN ('subphylum', 'subdivision') THEN 6
			WHEN tn.rank_name = 'infraphylum' THEN 7
			WHEN tn.rank_name = 'microphylum' THEN 8
			WHEN tn.rank_name = 'superclass' THEN 9
			WHEN tn.rank_name = 'class' THEN 10
			WHEN tn.rank_name = 'subclass' THEN 11
			WHEN tn.rank_name = 'infraclass' THEN 12
			WHEN tn.rank_name = 'subterclass' THEN 13
			WHEN tn.rank_name = 'parvclass' THEN 14
			WHEN tn.rank_name = 'order' THEN 15
			WHEN tn.rank_name = 'parvorder' THEN 16
			WHEN tn.rank_name = 'suborder' THEN 17
			WHEN tn.rank_name = 'infraorder' THEN 18
			WHEN tn.rank_name = 'superfamily' THEN 19
			WHEN tn.rank_name = 'family' THEN 20
			WHEN tn.rank_name = 'subfamily' THEN 21
			WHEN tn.rank_name = 'supertribe' THEN 22
			WHEN tn.rank_name = 'tribe' THEN 23
			WHEN tn.rank_name = 'subtribe' THEN 24
			WHEN tn.rank_name = 'infratribe' THEN 25
			WHEN tn.rank_name = 'supergenus' THEN 26
			WHEN tn.rank_name = 'genus' THEN 27
			WHEN tn.rank_name = 'subgenus' THEN 28
			WHEN tn.rank_name = 'section' THEN 29
			WHEN tn.rank_name = 'subsection' THEN 30
			WHEN tn.rank_name = 'series' THEN 31
			WHEN tn.rank_name = 'subseries' THEN 32
			WHEN tn.rank_name IN ('superspecies', 'species group') THEN 33
			WHEN tn.rank_name IN ('species', 'species hybrid', 'subspecies group') THEN 34
			WHEN tn.rank_name IN ('subspecies') THEN 35
			ELSE -1
		END,

		-- The matching taxonomy database and ID
		tn.taxonomy_db_tid,
		tn.taxonomy_id,

		-- The matching taxon name
		tn.name AS taxon_name

	FROM (
		-- All host tokens associated with the host.
		SELECT 
			ht.id AS host_token_id,
			hm.relation_type_tid AS hostname_type_tid,
			ht.filtered_text AS filtered_host_token,
			hm.is_one_of_many

		FROM hosts_host_token_map hm
		JOIN host_token ht ON ht.id = hm.host_token_id
		WHERE hm.host_id = @hostID
	) tokens

	JOIN host_token_taxon_name_match tnm ON tnm.host_token_id = tokens.host_token_id
	JOIN taxon_name tn ON tn.id = tnm.taxon_name_id

	-- Existing host token annotations with the same host ID, host token ID, and taxon name match ID.
	LEFT JOIN host_token_annotation existing_hta ON (
		existing_hta.[host_id] = @hostID
		AND existing_hta.host_token_id = tnm.host_token_id
		AND existing_hta.taxon_name_match_id = tnm.id
	)

	-- The (indirect) source match for cross reference matches
	LEFT JOIN host_token_taxon_name_match crossref_source_match ON (
		crossref_source_match.id = tnm.parent_match_id
		AND crossref_source_match.match_type_tid IN (@directMatchXRefTID, @indirectMatchXRefTID)
	)

	-- The cross-referenced (source) taxon name
	LEFT JOIN taxon_name crossref_source_tn ON crossref_source_tn.id = crossref_source_match.taxon_name_id

	-- Include the ITIS lineage table to help determine whether the taxon is Avian.
	LEFT JOIN [ITIS_TAXONOMY].dbo.itis_classes ON (
		tn.taxonomy_db_tid = @itisDbTID
		AND [ITIS_TAXONOMY].dbo.itis_classes.tsn = tn.taxonomy_id
	)

	-- Include the NCBI lineage table to help determine whether the taxon is Avian.
	LEFT JOIN [NCBI_TAXONOMY].dbo.ncbi_classes ON (
		tn.taxonomy_db_tid = @ncbiDbTID
		AND [NCBI_TAXONOMY].dbo.ncbi_classes.tax_id = tn.taxonomy_id
	)

	-- Only include matches on valid taxon names.
	WHERE tn.is_valid = 1

	-- Exclude existing host token annotations with the same host ID, host token ID, and taxon name match ID.
	AND existing_hta.id	IS NULL

	ORDER BY filtered_host_token


	--==========================================================================================================
	-- Calculate aggregate data
	--==========================================================================================================

	-- TODO: what if @hostnameMatches is null???

	
	-- How many ebird matches were found?
	DECLARE @ebirdMatches AS INT = (
		SELECT COUNT(*)
		FROM @hostTokenMatches
		WHERE taxonomy_db_tid = @ebirdDbTID
	) 

	
	--========================================================================================================================
	-- Create a new host token annotation 
	--========================================================================================================================
	INSERT INTO host_token_annotation (
		algorithm_id,
		crossref_score,
		crossref_source_name,
		crossref_source_name_class_tid,
		crossref_source_taxonomy_db_tid,
		dbref_count,
		hostname,
		host_token_id,
		[host_id],
		hostname_type_score,
		hostname_type_tid,
		is_avian,
		is_curated,
		is_one_of_many,
		is_scientific_name,
		is_valid,
		match_type_score,
		match_type_tid,
		name_class_score,
		name_class_tid,
		priority_score,
		rank_name,
		rank_name_score,
		score,
		taxonomy_db_tid,
		taxonomy_id,
		taxon_name,
		taxon_name_match_id
	)
	
	SELECT 
		@algorithmID AS algorithm_id,
		crossref_score, 
		crossref_source_name, 
		crossref_source_name_class_tid, 
		crossref_source_taxonomy_db_tid,
		dbref_count,
		hostname, 
		host_token_id, 
		@hostID AS [host_id],
		hostname_type_score,
		hostname_type_tid,
		is_avian,
		is_curated,
		is_one_of_many,
		is_scientific_name,
		is_valid,
		match_type_score, 
		match_type_tid, 
		name_class_score, 
		name_class_tid,
		
		-- Priority score
		priority_score = CASE

			-- Ebird results have the highest priority.
			WHEN taxonomy_db_tid = @ebirdDbTID THEN 1

			-- Non-avian results without ebird matches that are in both ITIS and NCBI.
			WHEN is_avian = 0 AND @ebirdMatches < 1 AND dbref_count > 1 THEN 1

			-- Everything else
			ELSE 0
		END,

		rank_name,
		rank_name_score,

		-- Calculate the composite score
		score = (

			@scoreMultiplier * (

				-- Cross reference score
				@crossRefScoreFactor * CAST(crossref_score - 1 AS FLOAT)

				-- Hostname type score
				+ @hostnameTypeScoreFactor * CAST(hostname_type_score - 1 AS FLOAT)

				-- Match type score
				+ @matchTypeScoreFactor * CAST(match_type_score - 1 AS FLOAT)

				-- Name class score
				+ @nameClassScoreFactor * CAST(name_class_score - 1 AS FLOAT)

				-- Priority score
				+ @priorityScoreFactor * CASE
					
					-- Ebird results have the highest priority.
					WHEN taxonomy_db_tid = @ebirdDbTID THEN 1

					-- Non-avian results without ebird matches that are in both ITIS and NCBI.
					WHEN is_avian = 0 AND @ebirdMatches < 1 AND dbref_count > 1 THEN 1

					-- Non-avian results only in NCBI have a low priority.
					--WHEN is_avian = 0 AND taxonomy_db_tid = @ncbiDbTID AND dbref_count = 1 AND @ebirdMatches < 1 THEN 0

					-- Otherwise, non-avian results have a high priority.
					--WHEN is_avian = 0 AND @ebirdMatches < 1 THEN 1

					-- Everything else
					ELSE 0
				END

				-- Taxonomic rank score
				+ @rankNameScoreFactor * CAST(rank_name_score AS FLOAT)
			)

			-- If the annotation was manually curated, make sure it has the highest score.
			+ CASE
				WHEN is_curated = 1 OR taxonomy_db_tid = @bvbrcDbTID THEN 100 
				ELSE 0
			END
		), 

		taxonomy_db_tid, 
		taxonomy_id, 
		taxon_name,
		match_id AS taxon_name_match_id

	FROM (

		SELECT 
			-- Cross references
			crossref_score, 
			crossref_source_name, 
			crossref_source_name_class_tid, 
			crossref_source_taxonomy_db_tid,

			-- The number of different taxonomy DB's with a match for this name.
			dbref_count = (
				SELECT COUNT(DISTINCT taxonomy_db_tid)
				FROM @hostTokenMatches dcMatches
				WHERE dcMatches.taxon_name = hm.taxon_name
			),

			hostname, 
			hostname_type_score,
			hostname_type_tid,
			host_token_id, 
			is_avian,
			is_curated,
			is_one_of_many,
			is_scientific_name,
			is_valid,
			match_id,

			-- Match type
			match_type_score, 
			match_type_tid,
			
			-- Name class
			name_class_score, 
			name_class_tid, 

			rank_name,
			rank_name_score,

			-- Taxonomy database and ID
			taxonomy_db_tid, 
			taxonomy_id, 

			taxon_name

		FROM @hostTokenMatches hm

	) annotationResults

	ORDER BY score DESC

END