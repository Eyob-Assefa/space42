-- Helper function to insert handbook documents with proper VECTOR type handling
-- Run this in your Supabase SQL Editor before using the ingestion API

CREATE OR REPLACE FUNCTION insert_handbook_document(
  p_content TEXT,
  p_metadata JSONB,
  p_embedding TEXT  -- Pass as string format: '[0.1,0.2,...]'
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO handbook_documents (content, metadata, embedding)
  VALUES (p_content, p_metadata, p_embedding::vector)
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

