import uuid
from typing import Any

from sqlalchemy import text

from data_plane.database import AsyncSessionLocal
from data_plane.ingestion.chunker import RecursiveTextChunker
from data_plane.ingestion.embedder import embedder
from data_plane.models.document import Document, DocumentChunk


class IngestionWorker:
    """
    Background worker process processing document ingestion jobs:
    1. Chunks document text into overlapping segments.
    2. Generates embeddings using the configured EmbeddingService.
    3. Populates TSVector columns for BM25 keyword search.
    4. Persists records to PostgreSQL.
    """

    def __init__(self):
        self.chunker = RecursiveTextChunker(chunk_size=512, chunk_overlap=64)

    async def process_document_payload(self, payload: dict[str, Any]) -> str:
        doc_id = payload.get("id") or f"doc_{uuid.uuid4().hex[:12]}"
        tenant_id = payload.get("tenant_id", "tenant_acme")
        title = payload.get("title", "Untitled Document")
        source = payload.get("source", "local_directory")
        raw_text = payload.get("content", "")
        url = payload.get("url", "")
        acl_group_ids = payload.get("acl_group_ids", ["group_all"])

        if not raw_text.strip():
            return doc_id

        # 1. Chunk text
        chunks_text = self.chunker.split_text(raw_text)
        if not chunks_text:
            chunks_text = [raw_text]

        # 2. Generate embeddings
        embeddings = embedder.embed_texts(chunks_text)

        # 3. Store in Postgres DB
        async with AsyncSessionLocal() as session:
            async with session.begin():
                # Check if document exists or create new
                doc = Document(
                    id=doc_id,
                    tenant_id=tenant_id,
                    source=source,
                    title=title,
                    url=url,
                    acl_group_ids=acl_group_ids,
                    doc_metadata={"chunk_count": len(chunks_text)},
                )
                await session.merge(doc)

                # Delete old chunks if updating
                await session.execute(
                    text("DELETE FROM document_chunks WHERE document_id = :doc_id"),
                    {"doc_id": doc_id},
                )

                # Insert document chunks
                for i, (chunk_content, emb) in enumerate(
                    zip(chunks_text, embeddings, strict=False)
                ):
                    chunk_id = f"chk_{doc_id}_{i}"
                    chunk_obj = DocumentChunk(
                        id=chunk_id,
                        document_id=doc_id,
                        tenant_id=tenant_id,
                        chunk_index=i,
                        content=chunk_content,
                        acl_group_ids=acl_group_ids,
                        embedding=emb,
                    )
                    session.add(chunk_obj)

                await session.flush()

                # Update tsvector column for all inserted chunks using PostgreSQL to_tsvector function
                await session.execute(
                    text("""
                        UPDATE document_chunks
                        SET tsv = to_tsvector('english', content)
                        WHERE document_id = :doc_id
                    """),
                    {"doc_id": doc_id},
                )

        return doc_id


worker = IngestionWorker()
