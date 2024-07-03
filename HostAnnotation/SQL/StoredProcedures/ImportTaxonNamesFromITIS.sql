USE [HOST_ANNOTATION]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[importTaxonNamesFromITIS]
AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		--==========================================================================================================
		-- Get the term ID for the ITIS taxonomy DB
		--==========================================================================================================
		DECLARE @itisDbTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'taxonomy_db.itis')
		IF @itisDbTID IS NULL THROW @errorCode, 'Invalid term for taxonomy_db.itis', 1

		--==========================================================================================================
		-- Get term IDs for NCBI name classes
		--==========================================================================================================
		DECLARE @commonNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.common_name')
		IF @commonNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.common_name term ID', 1

		DECLARE @scientificNameTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'ncbi_name_class.scientific_name')
		IF @scientificNameTID IS NULL THROW @errorCode, 'Invalid ncbi_name_class.scientific_name term ID', 1


		--==========================================================================================================
		-- Delete any existing ITIS taxon names
		--==========================================================================================================
		DELETE FROM taxon_name WHERE taxonomy_db_tid = @itisDbTID


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
		-- Get ITIS scientific names
		--==========================================================================================================
		SELECT
			is_valid = CASE
				WHEN tu.name_usage IN ('valid','accepted') THEN 1 ELSE 0
			END,
			filtered_name = LOWER(
				REPLACE(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(tu.complete_name, '-', ' ')
									, '_', ' ')
								, '''', '')
							, '"', '')
						, '`', '')
					, '!', '')
				, '?', '')
			),
			tu.complete_name AS [name],
			name_class_tid = @scientificNameTID,
			LOWER(tut.rank_name) AS rank_name,
			taxonomy_db_tid = @itisDbTID,
			taxonomy_id = tu.tsn

		FROM [ITIS_TAXONOMY].dbo.taxonomic_units tu
		JOIN [ITIS_TAXONOMY].dbo.taxon_unit_types tut ON (
			tut.rank_id = tu.rank_id
			AND tut.kingdom_id = tu.kingdom_id
		)

		UNION ALL (

			--==========================================================================================================
			-- Get ITIS common names
			--==========================================================================================================
			SELECT
				is_valid = CASE
					WHEN tu.name_usage IN ('valid','accepted') THEN 1 ELSE 0
				END,
				filtered_name = LOWER(
					REPLACE(
						REPLACE(
							REPLACE(
								REPLACE(
									REPLACE(
										REPLACE(
											REPLACE(v.vernacular_name, '-', ' ')
										, '_', ' ')
									, '''', '')
								, '"', '')
							, '`', '')
						, '!', '')
					, '?', '')
				),
				v.vernacular_name AS [name],
				name_class_tid = @commonNameTID,
				LOWER(tut.rank_name) AS rank_name,
				taxonomy_db_tid = @itisDbTID,
				taxonomy_id = v.tsn

			FROM [ITIS_TAXONOMY].dbo.vernaculars v
			JOIN [ITIS_TAXONOMY].dbo.taxonomic_units tu ON tu.tsn = v.tsn
			JOIN [ITIS_TAXONOMY].dbo.taxon_unit_types tut ON (
				tut.kingdom_id = tu.kingdom_id 
				AND tut.rank_id = tu.rank_id
			)
			WHERE v.[language] IN ('English','unspecified')
		)

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END
GO


