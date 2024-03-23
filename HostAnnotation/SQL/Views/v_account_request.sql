
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_account_request') IS NOT NULL
	DROP VIEW dbo.v_account_request
GO

CREATE VIEW v_account_request AS

SELECT 

ar.expires_on,
ar.id,
p.email AS person_email,
ar.person_id,
ar.requested_by,
ar.requested_on,
typeTerm.term_key AS request_type,
ar.request_type_tid,
statusTerm.term_key AS [status],
ar.status_tid,
ar.token

FROM account_request ar
JOIN v_person p ON p.id = ar.person_id
JOIN term statusTerm ON statusTerm.term_id = ar.status_tid
JOIN term typeTerm ON typeTerm.term_id = ar.request_type_tid

