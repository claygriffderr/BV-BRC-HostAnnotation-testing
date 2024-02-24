
-- Delete any existing versions of the view.
IF OBJECT_ID('dbo.v_curation') IS NOT NULL
	DROP VIEW dbo.v_curation
GO

CREATE VIEW dbo.v_curation AS

SELECT 
	id,
    alternate_text,
    alternate_text_filtered,
    is_valid,
    search_text,
    search_text_filtered,
    taxonomy_db_tid,
    taxonomy_id,

	typeterm.term_key AS [type],
    type_tid,

    [uid],
    created_by,
    created_on,
    validated_by,
    validated_on

FROM curation
JOIN term typeterm ON typeterm.term_id = type_tid


