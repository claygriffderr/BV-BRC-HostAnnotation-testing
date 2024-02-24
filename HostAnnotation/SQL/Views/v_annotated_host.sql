
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_annotated_host') IS NOT NULL
	DROP VIEW dbo.v_annotated_host
GO

CREATE VIEW dbo.v_annotated_host AS


SELECT 

	ah.id,
	ah.algorithm_id,
	ah.common_name,
	--ah.com_name_is_avian,
	--com_name_score,
	ah.com_name_synonyms,
	--com_name_taxonomy_db_tid,
	--com_name_taxonomy_id,
	--com_name_taxon_name_match_id,
	ah.[host_id],
	h.text AS host_text,
	ah.rank_name,
	ah.scientific_name,
	ah.sci_name_is_avian,
	ah.sci_name_score,
	snTaxDB.term_key AS sci_name_taxonomy_db,
	--ah.sci_name_taxonomy_db_tid,
	ah.sci_name_taxonomy_id,
	ah.sci_name_taxon_name_match_id,
	ah.status,
	ah.status_details,
	ah.taxon_class_cn,
	ah.taxon_class_sn
	--ah.taxon_order_sn,
	--ah.taxon_family_sn,
	--ah.taxon_genus_sn,
	--ah.taxon_species_sn

FROM annotated_host ah
JOIN hosts h ON h.id = ah.[host_id]
JOIN term snTaxDB ON snTaxDB.term_id = ah.sci_name_taxonomy_db_tid

