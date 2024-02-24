
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ============================================================================================================================
-- Author: don dempsey
-- Created on: 04/25/22
-- Description: Create "final" annotated host record
-- Updated: 08/25/22 dmd: Renamed host_final table to host_result, renamed stored procedure from createHostFinal.
--			01/12/23 dmd: Updated the scoring for common names.
--			02/23/24 dmd: Removing parameters and looking up their term IDs instead.
-- ============================================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.createAnnotatedHost') IS NOT NULL
	DROP PROCEDURE dbo.createAnnotatedHost
GO

CREATE PROCEDURE dbo.createAnnotatedHost

	@annotatedHostID AS INT,
	@scoreThreshold AS FLOAT

AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	-- Get the algorithm ID.
	DECLARE @algorithmID AS INT = (
		SELECT TOP 1 id
		FROM algorithm_version
		WHERE is_active = 1
		ORDER BY created_on DESC
	)

	-- Lookup term IDs for taxonomy databases
	DECLARE @bvbrcDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.bv_brc')
	DECLARE @ebirdDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ebird')
	DECLARE @itisDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.itis')
	DECLARE @ncbiDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ncbi')

	-- Lookup term IDs for name classes
	DECLARE @blastNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.blast_name')
	DECLARE @commonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.common_name')
	DECLARE @equivalentNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.equivalent_name')
	DECLARE @gbCommonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.genbank_common_name')
	DECLARE @scientificNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.scientific_name')
	DECLARE @synonymNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.synonym')

	-- Lookup term IDs for "minus word from left" hostname types
	DECLARE @minusOneWordLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_one_word_left')
	DECLARE @minusTwoWordsLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_two_words_left')
	DECLARE @minusThreeWordsLeftTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.minus_three_words_left')


	-- Status text to describe the annotated host.
	DECLARE @status AS VARCHAR(100)

	-- Codes that determine displayed status
	DECLARE @statusAvianEbird AS INT = 1
	DECLARE @statusAvianNonEbird AS INT = 2
	DECLARE @statusNonAvian AS INT = 3
	DECLARE @statusUnknown AS INT = 4

	-- The scientific and common names of the host's taxonomic class.
	DECLARE @classCommonName AS NVARCHAR(300)
	DECLARE @classScientificName AS NVARCHAR(300)

	--==========================================================================================================
	-- Common name variables
	--==========================================================================================================
	DECLARE @commonName AS NVARCHAR(300)
	DECLARE @comNameAvianStatus AS INT
	DECLARE @comNameHostnameTypeTID AS INT
	DECLARE @comNameIsAvian AS BIT
	DECLARE @comNameRankName AS NVARCHAR(300)
	DECLARE @comNameMatchesSciNameRank AS INT

	-- Does the common name have the same taxonomy DB and ID of the highest-scoring scientific name?
	DECLARE @comNameMatchesSciNameTaxonomy AS INT
	DECLARE @comNameScore AS FLOAT
	DECLARE @comNameTaxonNameMatchID AS INT
	DECLARE @comNameTaxonomyDbTID AS INT
	DECLARE @comNameTaxonomyID AS INT
	DECLARE @commonNameSynonyms AS NVARCHAR(MAX) = NULL

	--==========================================================================================================
	-- Scientific name variables
	--==========================================================================================================
	DECLARE @scientificName AS NVARCHAR(300)
	DECLARE @sciNameAvianStatus AS INT
	DECLARE @sciNameHostnameTypeTID AS INT
	DECLARE @sciNameIsAvian AS BIT
	DECLARE @sciNameMatchType AS VARCHAR(100)
	DECLARE @sciNameRank AS NVARCHAR(200)
	DECLARE @sciNameScore AS FLOAT
	DECLARE @sciNameTaxonomyDbTID AS INT
	DECLARE @sciNameTaxonomyID AS INT
	DECLARE @sciNameTaxonNameMatchID AS INT


	--==========================================================================================================
	-- Delete an existing record for the host.
	--==========================================================================================================
	DELETE FROM annotated_host WHERE [host_id] = @annotatedHostID
	
	--==========================================================================================================
	-- Store all scientific name annotations in a table variable.
	--==========================================================================================================
	DECLARE @scientificNames AS dbo.ScoredTaxonomyMatchTableType 
	INSERT INTO @scientificNames (
		[hostname_type_tid],
		[is_avian],
		[is_taxonomy_match],
		[match_type],
		[name],
		[name_class_tid],
		[rank_name],
		[score],
		[taxonomy_db_tid],
		[taxonomy_id],
		[taxon_name_match_id]
	)
	SELECT 
		hostname_type_tid,
		is_avian,
		0, -- is_taxonomy_match
		tnm.match_type,
		taxon_name,
		name_class_tid,
		rank_name,
		score,
		taxonomy_db_tid,
		taxonomy_id,
		taxon_name_match_id
	
	FROM host_token_annotation hta
	JOIN v_host_token_taxon_name_match tnm ON tnm.id = hta.taxon_name_match_id
	WHERE hta.[host_id] = @annotatedHostID
	AND name_class_tid IN (@scientificNameTID, @synonymNameTID, @equivalentNameTID)
	AND is_valid = 1
	AND algorithm_id = @algorithmID
	ORDER BY score DESC

	--==========================================================================================================
	-- Populate variables using the highest-scoring scientific name.
	--==========================================================================================================
	SELECT TOP 1
		@scientificName = [name],
		@sciNameAvianStatus = CASE

			-- The (Avian) scientific name is from ebird.
			WHEN is_avian = 1 AND taxonomy_db_tid = @ebirdDbTID THEN @statusAvianEbird

			-- The (Avian) scientific name is NOT from ebird.
			WHEN is_avian = 1 AND taxonomy_db_tid <> @ebirdDbTID THEN @statusAvianNonEbird

			-- The scientific name match isn't Avian.
			ELSE @statusNonAvian
		END,
		@sciNameHostnameTypeTID = hostname_type_tid,
		@sciNameIsAvian = is_avian,
		@sciNameMatchType = match_type,
		@sciNameRank = rank_name,
		@sciNameScore = score,
		@sciNameTaxonomyDbTID = taxonomy_db_tid,
		@sciNameTaxonomyID = taxonomy_id,
		@sciNameTaxonNameMatchID = taxon_name_match_id

	FROM @scientificNames
	WHERE name_class_tid <> @equivalentNameTID
	ORDER BY score DESC


	--==========================================================================================================
	-- Store all common name annotations in a table variable.
	--==========================================================================================================
	DECLARE @commonNames AS dbo.CommonNameSynonymTableType
	INSERT INTO @commonNames (
		name,
		sort_order
	)
	SELECT TOP 20
		cn.name AS common_name,
		sort_order = CASE 
			WHEN sn.taxonomy_db_tid = @ebirdDbTID THEN 1 
			WHEN sn.taxonomy_db_tid = @ncbiDbTID AND cn.name_class_tid = @gbCommonNameTID THEN 2
			WHEN sn.taxonomy_db_tid = @ncbiDbTID THEN 3
			ELSE 4
		END
	FROM taxon_name sn
	JOIN taxon_name cn ON (
		cn.taxonomy_db_tid = sn.taxonomy_db_tid
		AND cn.taxonomy_id = sn.taxonomy_id
		AND cn.id <> sn.id
	)
	WHERE sn.filtered_name = @scientificName
	AND cn.name_class_tid IN (@blastNameTID, @commonNameTID, @gbCommonNameTID, @equivalentNameTID) -- 'blast_name','common_name','genbank_common_name','equivalent_name')
	ORDER BY sort_order ASC

	--==========================================================================================================
	-- Set the primary common name
	--==========================================================================================================
	SET @commonName = (
		SELECT TOP 1 [name] 
		FROM @commonNames
		ORDER BY sort_order
	)

	--==========================================================================================================
	-- Create a list of common name synonyms.
	--==========================================================================================================
	SET @commonNameSynonyms = (
		SELECT STRING_AGG(common_name, ';')
		FROM (
			SELECT TOP 20 common_name
			FROM (
				SELECT DISTINCT name AS common_name
				FROM @commonNames
				WHERE name <> @commonName
			) names
			ORDER BY common_name
		) orderedCommonNames
	)

	/*
	--==========================================================================================================
	-- Store all common name annotations in a table variable.
	--==========================================================================================================
	DECLARE @commonNames AS dbo.ScoredTaxonomyMatchTableType 
	INSERT INTO @commonNames (
		[hostname_type_tid],
		[is_avian],
		[is_taxonomy_match],
		[match_type],
		[name],
		[name_class_tid],
		[rank_name],
		[score],
		[taxonomy_db_tid],
		[taxonomy_id],
		[taxon_name_match_id]
	)
	SELECT 
		hostname_type_tid,
		is_avian,
		ISNULL(sciNames.isTaxonomyMatch, 0) AS isTaxonomyMatch,
		tnm.match_type,
		taxon_name,
		name_class_tid,
		rank_name,
		score,
		hta.taxonomy_db_tid,
		hta.taxonomy_id,
		taxon_name_match_id

	FROM host_token_annotation hta
	JOIN v_host_token_taxon_name_match tnm ON tnm.id = hta.taxon_name_match_id

	-- Does the common name have the same taxonomy DB/ID as a scientific name that matches the highest-scoring scientific name?
	JOIN (
		SELECT 
			isTaxonomyMatch = 1,
			taxonomy_db_tid, 
			taxonomy_id
		FROM @scientificNames
		WHERE [name] = @scientificName
	) AS sciNames ON (
		sciNames.taxonomy_db_tid = hta.taxonomy_db_tid 
		AND sciNames.taxonomy_id = hta.taxonomy_id
	)
	WHERE hta.[host_id] = @annotatedHostID
	AND name_class_tid IN (@blastNameTID, @commonNameTID, @gbCommonNameTID)
	AND is_valid = 1
	AND algorithm_id = @algorithmID
	ORDER BY score DESC

	--==========================================================================================================
	-- Populate variables with the highest-scoring common name.
	--==========================================================================================================
	SELECT TOP 1
		@commonName = [name],
		@comNameAvianStatus = avian_status,
		@comNameScore = score,
		@comNameHostnameTypeTID = hostname_type_tid,
		@comNameIsAvian = is_avian,
		@comNameMatchesSciNameRank = matches_sci_name_rank,
		@comNameMatchesSciNameTaxonomy = matches_sci_name_taxonomy,
		@comNameRankName = rank_name,
		@comNameTaxonNameMatchID = taxon_name_match_id,
		@comNameTaxonomyDbTID = taxonomy_db_tid,
		@comNameTaxonomyID = taxonomy_id
	FROM (
		SELECT 
			avian_status = CASE

				-- The (Avian) common name is from ebird.
				WHEN is_avian = 1 AND taxonomy_db_tid = @ebirdDbTID THEN @statusAvianEbird

				-- The (Avian) common name is NOT from ebird.
				WHEN is_avian = 1 AND taxonomy_db_tid <> @ebirdDbTID THEN @statusAvianNonEbird

				-- The common name match isn't Avian.
				ELSE @statusNonAvian
			END,
			hostname_type_tid,
			is_avian,
			matches_sci_name_rank = CASE
				WHEN rank_name = @sciNameRank THEN 1 ELSE 0
			END,
			matches_sci_name_taxonomy = CASE
				WHEN taxonomy_db_tid = @sciNameTaxonomyDbTID AND taxonomy_id = @sciNameTaxonomyID THEN 1
				ELSE 0
			END,
			match_type,
			[name],
			rank_name,
			score,
			taxonomy_db_tid,
			taxonomy_id,
			taxon_name_match_id

		FROM @commonNames
		WHERE is_taxonomy_match = 1
	) commonNames

	-- Note: previously the "matches rank" was before "matches taxonomy"...
	ORDER BY avian_status ASC, matches_sci_name_taxonomy DESC, matches_sci_name_rank DESC, score DESC
		
	--==========================================================================================================
	-- Create a list of common name synonyms.
	--==========================================================================================================
	SET @commonNameSynonyms = (
		SELECT STRING_AGG(common_name, ';')
		FROM (
			SELECT TOP 20 common_name
			FROM (
				SELECT DISTINCT [name] AS common_name
				FROM @commonNames
				WHERE [name] <> @commonName
				AND score >= @synonymThreshold
			) distinctNames
			ORDER BY common_name
		) cnSynonyms
	)
	*/

	--==========================================================================================================
	-- Make sure scores aren't over 100
	--==========================================================================================================
	SET @sciNameScore = CASE
		WHEN @sciNameScore > 100 THEN 100 ELSE @sciNameScore
	END
	--SET @comNameScore = CASE
	--	WHEN @comNameScore > 100 THEN 100 ELSE @comNameScore
	--END

	--==========================================================================================================
	-- Get the scientific and common names of the taxon's class.
	--==========================================================================================================
	EXEC dbo.getTaxonClassNames
		@classCommonName = @classCommonName OUTPUT,
		@classScientificName = @classScientificName OUTPUT,
		@scientificName = @scientificName


	--==========================================================================================================
	-- If the scientific name's match was a cross reference to ebird, add a note to the status.
	--==========================================================================================================
	DECLARE @ebirdXRef AS VARCHAR(100) = ''

	IF @sciNameAvianStatus = @statusAvianEbird
	BEGIN
		IF @sciNameMatchType = 'direct_match_cross_reference' SET @ebirdXRef = ', direct cross reference'
		ELSE IF @sciNameMatchType = 'indirect_match_cross_reference' SET @ebirdXRef = ', indirect cross reference'
	END


	--==========================================================================================================
	-- Is "is Avian" the same for all scientific names?
	--==========================================================================================================
	DECLARE @avianCount AS INT = (
		SELECT COUNT(*)
		FROM @scientificNames
		WHERE is_avian = 1
	)
	DECLARE @sciNameCount AS INT = (
		SELECT COUNT(*)
		FROM @scientificNames
	)
	DECLARE @consistentClasses AS BIT = CASE
		WHEN @avianCount = 0 OR @avianCount = @sciNameCount THEN 1 ELSE 0
	END

	--==========================================================================================================
	-- Determine the status
	--==========================================================================================================
	SET @status = CASE
	
		-- "Consistent classes" is set to zero (false) when there's a mixture of Avian and non-Avian results. 
		WHEN @consistentClasses = 0 THEN 'Needs review (both Avian and non-Avian results)'

		-- If a "minus word from the left" hostname type (mutant) was used, flag the result for review.
		WHEN @sciNameHostnameTypeTID IN (@minusOneWordLeftTID, @minusTwoWordsLeftTID, @minusThreeWordsLeftTID) THEN 'Needs review (minus words from left)'

		-- Avian, no common name
		WHEN @sciNameIsAvian = 1 AND (@commonName IS NULL OR LEN(@commonName) < 1) THEN 'Needs review (Avian, non-eBird, no common name)'

		-- High score, non-Avian
		WHEN @sciNameScore > @scoreThreshold AND @sciNameAvianStatus = @statusNonAvian THEN 'Success (non-Avian)'
		
		-- High score, Avian, and ebird
		WHEN @sciNameScore > @scoreThreshold AND @sciNameAvianStatus = @statusAvianEbird THEN 'Success (Avian, ebird'+@ebirdXRef+')'

		-- Any score, Avian, but not from ebird
		WHEN @sciNameScore > 0 AND @sciNameIsAvian = 1 AND @sciNameAvianStatus <> @statusAvianEbird THEN 'FAILURE (Avian, non-ebird)'
		
		-- Low score, non-Avian
		WHEN @sciNameScore <= @scoreThreshold AND @sciNameAvianStatus = @statusNonAvian THEN 'Needs review (non-Avian)'
		
		-- Low score, Avian, and ebird
		WHEN @sciNameScore <= @scoreThreshold AND @sciNameAvianStatus = @statusAvianEbird THEN 'Needs review (Avian, ebird'+@ebirdXRef+')'

		-- No results
		WHEN @sciNameScore = 0 THEN 'No results'

		-- Everything else
		ELSE 'Needs review'
	END
	
	
	--==========================================================================================================
	-- Create the annotated host
	--==========================================================================================================
	INSERT INTO annotated_host (
		algorithm_id,
		common_name,
		com_name_is_avian,
		com_name_score,
		com_name_synonyms,
		com_name_taxonomy_db_tid,
		com_name_taxonomy_id,
		com_name_taxon_name_match_id,
		[host_id],
		rank_name,
		scientific_name,
		sci_name_is_avian,
		sci_name_score,
		sci_name_taxonomy_db_tid,
		sci_name_taxonomy_id,
		sci_name_taxon_name_match_id,
		[status],
		taxon_class_cn,
		taxon_class_sn
	) VALUES (
		@algorithmID,
		@commonName,
		@comNameIsAvian,
		@comNameScore,
		@commonNameSynonyms,
		@comNameTaxonomyDbTID,
		@comNameTaxonomyID,
		@comNameTaxonNameMatchID,
		@annotatedHostID,
		@sciNameRank,
		@scientificName,
		@sciNameIsAvian,
		@sciNameScore,
		@sciNameTaxonomyDbTID,
		@sciNameTaxonomyID,
		@sciNameTaxonNameMatchID,
		@status,
		@classCommonName,
		@classScientificName
	)

END