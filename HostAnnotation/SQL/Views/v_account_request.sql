
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_account_request') IS NOT NULL
	DROP VIEW dbo.v_account_request
GO

CREATE VIEW v_account_request AS

SELECT 

expires_on,
id,
person_id,
requested_by,
requested_on,
typeTerm.term_key AS request_type,
request_type_tid,
statusTerm.term_key AS [status],
status_tid,
token

FROM account_request
JOIN term statusTerm ON statusTerm.term_id = status_tid
JOIN term typeTerm ON typeTerm.term_id = request_type_tid

