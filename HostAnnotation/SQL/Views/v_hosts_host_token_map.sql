
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_hosts_host_token_map') IS NOT NULL
	DROP VIEW dbo.v_hosts_host_token_map
GO

CREATE VIEW dbo.v_hosts_host_token_map AS

SELECT 

id,
host_id,
host_token_id,
is_one_of_many,
relationType.term_key AS relation_type,
relation_type_tid

FROM hosts_host_token_map
JOIN term relationType ON relationType.term_id = relation_type_tid