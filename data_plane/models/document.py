import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import ARRAY, Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR
from sqlalchemy.orm import relationship

from data_plane.config import settings
from data_plane.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(
        String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source = Column(String, nullable=False, index=True)  # local_directory | google_drive | slack
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    acl_group_ids = Column(ARRAY(String), default=list, nullable=False)  # Access Control List
    doc_metadata = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(
        String, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id = Column(String, nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    acl_group_ids = Column(
        ARRAY(String), default=list, nullable=False
    )  # Inherited from Document for pre-filtering

    # Vector Embedding Column (pgvector HNSW index target)
    embedding = Column(Vector(settings.EMBEDDING_DIMENSION))

    # TSVector Column for BM25 Keyword Search
    tsv = Column(TSVECTOR)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="chunks")


# Define GIN Index on TSVector column and HNSW Index on embedding vector column
Index("ix_document_chunks_tsv", DocumentChunk.tsv, postgresql_using="gin")

Index(
    "ix_document_chunks_embedding",
    DocumentChunk.embedding,
    postgresql_using="hnsw",
    postgresql_with={"m": 16, "ef_construction": 64},
    postgresql_ops={"embedding": "vector_cosine_ops"},
)
