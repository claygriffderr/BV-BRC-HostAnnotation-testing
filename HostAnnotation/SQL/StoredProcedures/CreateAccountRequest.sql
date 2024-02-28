
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ============================================================================================================================
-- Author: don dempsey
-- Created on: 02/28/24
-- Description: Create an account requeat record
-- Updated: 
-- ============================================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.createAccountRequest') IS NOT NULL
	DROP PROCEDURE dbo.createAccountRequest
GO

CREATE PROCEDURE dbo.createAccountRequest
	@email AS VARCHAR(100),
	@token AS VARCHAR(100) OUT,
	@type AS VARCHAR(100)

AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	--==========================================================================================================
	-- Lookup term IDs
	--==========================================================================================================
	DECLARE @statusTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'account_request_status.pending')
	IF @statusTID IS NULL THROW @errorCode, 'No term ID found for account request status pending', 1

	DECLARE @typeTID AS INT = (SELECT TOP 1 term_id FROM term WHERE term_full_key = 'account_request_type.'+@type)
	IF @typeTID IS NULL THROW @errorCode, 'No term ID found for account request type', 1

	--==========================================================================================================
	-- Lookup the person by email address.
	--==========================================================================================================
	DECLARE @personID AS INT = (
		SELECT TOP 1 id
		FROM person
		WHERE email = @email
	)
	IF @personID IS NULL THROW @errorCode, 'Invalid email address', 1

	--==========================================================================================================
	-- Generate a new token
	--==========================================================================================================
	set @token = CAST(NEWID() AS VARCHAR(100))
	SET @token = REPLACE(@token, '-', '')

	--==========================================================================================================
	-- Create the new account request
	--==========================================================================================================
	INSERT INTO account_request (
		expires_on,
		person_id,
		requested_by,
		request_type_tid,
		status_tid,
		token
	) VALUES (
		NULL,
		@personID,
		@personID,
		@typeTID,
		@statusTID,
		@token
	)

END