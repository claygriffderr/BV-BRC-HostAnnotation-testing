
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ==========================================================================================================
-- Author: don dempsey
-- Created on: 02/01/23
-- Description:	Create a new person (user)
-- Updated: 
-- ==========================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.createPerson') IS NOT NULL
	DROP PROCEDURE dbo.createPerson
GO

CREATE PROCEDURE dbo.createPerson
	@createdBy AS INT,
	@email AS NVARCHAR(200),
	@firstName AS NVARCHAR(100),
	@id AS INT OUTPUT,
	@lastName AS NVARCHAR(100),
	@orgUID AS UNIQUEIDENTIFIER,
	@passwordHash AS NVARCHAR(100),
	@role AS VARCHAR(100),
	@status AS VARCHAR(100)

AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		--=====================================================================================================================
		-- Validate parameters
		--=====================================================================================================================
		IF @createdBy IS NULL THROW @errorCode, 'Invalid created by parameter', 1

		SET @email = TRIM(@email)
		IF @email IS NULL OR LEN(@email) < 1 THROW @errorCode, 'Invalid email parameter', 1

		SET @firstName = TRIM(@firstName)
		IF @firstName IS NOT NULL AND LEN(@firstName) < 1 SET @firstName = NULL

		SET @lastName = TRIM(@lastName)
		IF @lastName IS NOT NULL AND LEN(@lastName) < 1 SET @lastName = NULL

		IF @orgUID IS NULL THROW @errorCode, 'Invalid org UID', 1

		SET @passwordHash = TRIM(@passwordHash)
		IF ISNULL(@passwordHash, '') = '' SET @passwordHash = NULL

		SET @role = TRIM(@role)
		IF ISNULL(@role, '') = '' THROW @errorCode, 'Invalid role parameter', 1

		SET @status = TRIM(@status)
		IF ISNULL(@status, '') = '' SET @status = 'pending'



		--=====================================================================================================================
		-- Look up term IDs
		--=====================================================================================================================
		DECLARE @roleTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'api_role.'+@role)
		IF @roleTID IS NULL THROW @errorCode, 'Invalid term ID for api_role term', 1

		DECLARE @statusTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'user_status.'+@status)
		IF @statusTID IS NULL THROW @errorCode, 'Invalid term ID for user_status term', 1


		--=====================================================================================================================
		-- Look up the organization ID
		--=====================================================================================================================
		DECLARE @orgID AS INT = (
			SELECT TOP 1 id
			FROM organization
			WHERE [uid] = @orgUID
		)

		IF @orgID IS NULL THROW @errorCode, 'Invalid organization UID', 1


		--=====================================================================================================================
		-- Make sure the person doesn't already exist.
		--=====================================================================================================================
		IF EXISTS (
			SELECT 1
			FROM person
			WHERE email = @email
		) THROW @errorCode, 'A person with this email address already exists', 1


		-- Create the person UID in advance
		DECLARE @personUID AS UNIQUEIDENTIFIER = NEWID()


		--=====================================================================================================================
		-- Create the person
		--=====================================================================================================================
		INSERT INTO person (
			created_by,
			email,
			first_name,
			last_name,
			organization_id,
			password_hash,
			role_tid,
			status_tid,
			[uid]
		) VALUES (
			@createdBy,
			@email,
			@firstName,
			@lastName,
			@orgID,
			@passwordHash,
			@roleTID,
			@statusTID,
			@personUID
		)

		SET @id = (SELECT SCOPE_IDENTITY() AS [SCOPE_IDENTITY])

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END
