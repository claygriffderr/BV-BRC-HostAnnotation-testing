USE [HOST_ANNOTATION]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[importTaxonNamesFromNCBI]
AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		--==========================================================================================================
		-- Get the term ID for the NCBI Taxonomy DB
		--==========================================================================================================
		DECLARE @ncbiDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ncbi')
		IF @ncbiDbTID IS NULL THROW @errorCode, 'Invalid term for taxonomy_db.ncbi', 1

		--==========================================================================================================
		-- Get term IDs for NCBI name classes
		--==========================================================================================================
		DECLARE @blastNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.blast_name')
		IF @blastNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.blast_name term ID', 1

		DECLARE @commonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.common_name')
		IF @commonNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.common_name term ID', 1

		DECLARE @equivalentNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.equivalent_name')
		IF @equivalentNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.equivalent_name term ID', 1

		DECLARE @gbCommonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.genbank_common_name')
		IF @gbCommonNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.genbank_common_name term ID', 1

		DECLARE @scientificNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.scientific_name')
		IF @scientificNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.scientific_name term ID', 1

		DECLARE @synonymNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.synonym')
		IF @synonymNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.synonym term ID', 1


		--==========================================================================================================
		-- Delete any existing NCBI taxon names
		--==========================================================================================================
		DELETE FROM taxon_name WHERE taxonomy_db_tid = @ncbiDbTID


		--==========================================================================================================
		-- Create new taxon name records from the query below.
		--==========================================================================================================
		INSERT INTO taxon_name (
			is_valid,
			filtered_name,
			[name],
			name_class_tid,
			rank_name,
			taxonomy_db_tid,
			taxonomy_id
		)

		--==========================================================================================================
		-- Get NCBI taxonomy names
		--==========================================================================================================
		SELECT
			1, -- is_valid
			filtered_name = LOWER(
				REPLACE(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(names.[name], '-', ' ')
									, '_', ' ')
								, '''', '')
							, '"', '')
						, '`', '')
					, '!', '')
				, '?', '')
			),
			names.[name],
			name_class_tid = CASE 
				WHEN names.name_class = 'blast name' THEN @blastNameTID 
				WHEN names.name_class = 'common name' THEN @commonNameTID
				WHEN names.name_class = 'equivalent name' THEN @equivalentNameTID
				WHEN names.name_class = 'genbank common name' THEN @gbCommonNameTID
				WHEN names.name_class = 'scientific name' THEN @scientificNameTID
				WHEN names.name_class = 'synonym' THEN @synonymNameTID
				ELSE NULL
			END,
			nodes.rank_name,
			taxonomy_db_tid = @ncbiDbTID,
			taxonomy_id = names.tax_id

		FROM [NCBI_TAXONOMY].dbo.ncbi_names names
		JOIN [NCBI_TAXONOMY].dbo.ncbi_nodes nodes ON nodes.tax_id = names.tax_id
		WHERE names.name_class IN ('blast name', 'common name', 'equivalent name', 'genbank common name', 'scientific name', 'synonym')
		AND nodes.division_id IN (
			SELECT id
			FROM [NCBI_TAXONOMY].dbo.division
			WHERE name IN ('Bacteria','Invertebrates','Mammals','Plants and Fungi','Primates','Rodents','Vertebrates','Environmental samples')
			-- Note: this excludes the following: 'Phages','Synthetic and Chimeric','Unassigned', and 'Viruses'
		)

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END
GO


