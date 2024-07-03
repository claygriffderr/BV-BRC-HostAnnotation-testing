USE [HOST_ANNOTATION]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[importTaxonNamesFromEbird]
AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		--==========================================================================================================
		-- Get term ID for eBird Taxonomy DB
		--==========================================================================================================
		DECLARE @ebirdDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.ebird')
		IF @ebirdDbTID IS NULL THROW @errorCode, 'Invalid term for taxonomy_db.ebird', 1


		--==========================================================================================================
		-- Get term IDs for NCBI name classes
		--==========================================================================================================
		DECLARE @commonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.common_name')
		IF @commonNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.common_name term ID', 1

		DECLARE @scientificNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.scientific_name')
		IF @scientificNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.scientific_name term ID', 1


		--==========================================================================================================
		-- Delete any existing taxon names for eBird
		--==========================================================================================================
		DELETE FROM taxon_name WHERE taxonomy_db_tid = @ebirdDbTID


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
		-- Get eBird common names
		--==========================================================================================================
		SELECT
			is_valid = CASE 
				WHEN e.extinct = 1 THEN 0 ELSE 1 
			END,
			filtered_name = LOWER(
				REPLACE(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(e.common_name, '-', ' ')
									, '_', ' ')
								, '''', '')
							, '"', '')
						, '`', '')
					, '!', '')
				, '?', '')
			),
			e.common_name AS [name],
			name_class_tid = @commonNameTID,
			rank_name = CASE
				WHEN e.rank_name = 'domestic' THEN 'species'
				WHEN e.rank_name = 'form' THEN 'unclassified (form)'
				WHEN e.rank_name = 'group (monotypic)' THEN 'subspecies group'
				WHEN e.rank_name = 'group (polytypic)' THEN 'subspecies group'
				WHEN e.rank_name = 'hybrid' THEN 'species hybrid'
				WHEN e.rank_name = 'intergrade' THEN 'subspecies group'
				WHEN e.rank_name = 'slash' THEN 'species pair'
				WHEN e.rank_name = 'species' THEN 'species'
				WHEN e.rank_name = 'spuh' THEN 'species group'
				WHEN e.rank_name = 'subspecies' THEN 'subspecies'
				ELSE NULL
			END,
			taxonomy_db_tid = @ebirdDbTID,
			taxonomy_id = e.id
		FROM ebird e
		WHERE ISNULL(e.common_name,'') <> ''
		AND LEN(e.common_name) > 0

		UNION ALL (

			--==========================================================================================================
			-- Get eBird scientific names
			--==========================================================================================================
			SELECT
				is_valid = CASE 
					WHEN e.extinct = 1 THEN 0 ELSE 1 
				END,
				filtered_name = LOWER(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(
											REPLACE(e.scientific_name, '-', ' ')
										, '_', ' ')
									, '''', '')
								, '"', '')
							, '`', '')
						, '!', '')
					, '?', '')
				),	
				e.scientific_name AS [name],
				name_class_tid = @scientificNameTID,
				rank_name = CASE
					WHEN e.rank_name = 'domestic' THEN 'species'
					WHEN e.rank_name = 'form' THEN 'unclassified (form)'
					WHEN e.rank_name = 'group (monotypic)' THEN 'subspecies group'
					WHEN e.rank_name = 'group (polytypic)' THEN 'subspecies group'
					WHEN e.rank_name = 'hybrid' THEN 'species hybrid'
					WHEN e.rank_name = 'intergrade' THEN 'subspecies group'
					WHEN e.rank_name = 'slash' THEN 'species pair'
					WHEN e.rank_name = 'species' THEN 'species'
					WHEN e.rank_name = 'spuh' THEN 'species group'
					WHEN e.rank_name = 'subspecies' THEN 'subspecies'
					ELSE NULL
				END,
				taxonomy_db_tid = @ebirdDbTID,
				taxonomy_id = e.id
			FROM ebird e
		)

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END
GO


