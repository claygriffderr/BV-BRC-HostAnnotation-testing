
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_host_token_annotation') IS NOT NULL
	DROP VIEW dbo.v_host_token_annotation
GO

CREATE VIEW dbo.v_host_token_annotation AS

SELECT

	hta.id,
	algorithm_id,
	crossref_score,
	crossref_source_name,
	crNameClass.term_key AS crossref_source_name_class,
	crossref_source_name_class_tid,
	crTaxDB.term_key AS crossref_source_taxonomy_db,
	crossref_source_taxonomy_db_tid,
	dbref_count,
	hostname,
	hta.host_token_id,
	host_id,
	hostname_type_score,
	hnType.term_key AS hostname_type,
	hostname_type_tid,
	is_avian,
	is_curated,
	is_one_of_many,
	is_scientific_name,
	hta.is_valid,
	match_type_score,
	matchType.term_key AS match_type,
	hta.match_type_tid,
	name_class_score,
	nameClass.term_key AS name_class,
	hta.name_class_tid,
	priority_score,
	hta.rank_name,
	rank_name_score,
	score,
	taxDB.term_key AS taxonomy_db,
	hta.taxonomy_db_tid,
	hta.taxonomy_id,
	taxonomy_id_consensus,
	taxon_name,
	taxon_name_consensus,
	tnm.custom_name AS custom_name,
	tnm.custom_name_class_tid,
	tnm.custom_rank_name,
	taxon_name_match_id,
	hta.created_on

FROM host_token_annotation hta
JOIN term hnType ON hnType.term_id = hostname_type_tid
JOIN term matchType ON matchType.term_id = match_type_tid
JOIN term nameClass ON nameClass.term_id = name_class_tid
JOIN term taxDB ON taxDB.term_id = taxonomy_db_tid
JOIN v_host_token_taxon_name_match tnm ON tnm.id = taxon_name_match_id
LEFT JOIN term crNameClass ON crNameClass.term_id = crossref_source_name_class_tid
LEFT JOIN term crTaxDB ON crTaxDB.term_id = crossref_source_taxonomy_db_tid