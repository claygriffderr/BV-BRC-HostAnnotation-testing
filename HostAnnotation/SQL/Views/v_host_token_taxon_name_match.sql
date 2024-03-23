
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_host_token_taxon_name_match') IS NOT NULL
	DROP VIEW dbo.v_host_token_taxon_name_match
GO

CREATE VIEW dbo.v_host_token_taxon_name_match AS

SELECT
	id,
	custom_name,
	custom_name_class_tid,
	custom_rank_name,
	host_token_id,
	is_active,
	matchType.term_key AS match_type,
	match_type_tid,
	parent_match_id,
	taxon_name_id

FROM host_token_taxon_name_match
JOIN term matchType ON matchType.term_id = match_type_tid
LEFT JOIN term customNameClass ON customNameClass.term_id = custom_name_class_tid
