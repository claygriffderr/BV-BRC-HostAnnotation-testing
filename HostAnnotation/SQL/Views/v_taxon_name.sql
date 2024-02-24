
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_taxon_name') IS NOT NULL
	DROP VIEW dbo.v_taxon_name
GO

CREATE VIEW v_taxon_name AS

SELECT 

id,
filtered_name,
is_valid,
[name],
nameclass.term_key AS name_class,
name_class_tid,
rank_name,
taxdb.term_key AS taxonomy_db,
taxonomy_db_tid,
taxonomy_id

FROM taxon_name
JOIN term nameclass ON nameclass.term_id = name_class_tid
JOIN term taxdb ON taxdb.term_id = taxonomy_db_tid