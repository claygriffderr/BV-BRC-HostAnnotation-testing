
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ==========================================================================================================
-- Author: don dempsey
-- Created on: 03/01/23
-- Description: 
-- Updated: 
-- ==========================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.mapHostTokenToHost') IS NOT NULL
	DROP PROCEDURE dbo.mapHostTokenToHost
GO

CREATE PROCEDURE dbo.mapHostTokenToHost

	@baseTokenID AS INT,
	@filteredText AS NVARCHAR(300),
	@isOneOfMany AS BIT,
	@hostID AS INT,
	@hostTokenID AS INT OUTPUT,
	@relationType AS VARCHAR(100)

AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		DECLARE @relationTypeTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'hostname_type.'+@relationType)
		IF @relationTypeTID IS NULL THROW @errorCode, 'No matching hostname type term ID was found', 1

		-- Does the host token already exist?
		SET @hostTokenID = (
			SELECT TOP 1 id
			FROM host_token
			WHERE filtered_text = @filteredText
		)

		IF @hostTokenID IS NULL 
		BEGIN
			-- Create the host token
			INSERT INTO host_token (
				direct_matches,
				direct_xref_matches,
				filtered_text,
				indirect_matches,
				indirect_xref_matches,
				search_text,
				text
			) VALUES (
				0, -- direct_matches,
				0, -- direct_xref_matches,
				@filteredText, -- filtered_text,
				0, -- indirect_matches,
				0, -- indirect_xref_matches,
				@filteredText, -- search_text,
				@filteredText -- text
			)
	
			SET @hostTokenID = (SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY])
		END


		--==========================================================================================================
		-- Map the host token to the host (if it hasn't already been mapped).
		--==========================================================================================================
		IF NOT EXISTS (
			SELECT 1 
			FROM hosts_host_token_map
			WHERE [host_id] = @hostID
			AND host_token_id = @hostTokenID
		)
		BEGIN
			INSERT INTO hosts_host_token_map (
				base_token_id,
				host_id,
				host_token_id,
				is_one_of_many,
				relation_type_tid
			) VALUES (
				@baseTokenID,
				@hostID,
				@hostTokenID,
				@isOneOfMany,
				@relationTypeTID
			)
		END

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END