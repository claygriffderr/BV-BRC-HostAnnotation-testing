
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_person') IS NOT NULL
	DROP VIEW dbo.v_person
GO

CREATE VIEW v_person AS

SELECT 
	p.id,
	p.email,
	p.first_name,
	p.last_name,
	p.password_hash,

	-- Application role
	appRole.term_key AS [role],
	p.role_tid,

	-- Organization
	p.organization_id,
	o.[uid] AS organization_uid,

	-- User status
	userStatus.term_key AS [status],
	p.status_tid,

	p.[uid]

FROM person p
JOIN term appRole ON appRole.term_id = role_tid
JOIN term userStatus ON userStatus.term_id = status_tid
JOIN organization o ON o.id = p.organization_id

