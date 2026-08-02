from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from data_plane.ingestion.embedder import embedder
from data_plane.models.document import Document, DocumentChunk
from data_plane.search.reranker import SearchResultChunk, rrf_reranker
from data_plane.security.auth import UserContext
from data_plane.security.rls import RLSFilterEngine


class HybridSearchEngine:
    """
    Nucleus Hybrid Search Engine:
    Combines BM25 Keyword Matching (tsvector) and Semantic Vector Distance (pgvector)
    with database-level RLS pre-filtering and Reciprocal Rank Fusion (RRF).
    """

    async def search(
        self,
        db: AsyncSession,
        query_text: str,
        user_ctx: UserContext,
        enterprise_rbac_enabled: bool = True,
        top_k: int = 5,
    ) -> list[SearchResultChunk]:
        if not query_text.strip():
            return []

        # 1. Generate query vector embedding
        query_vector = embedder.embed_query(query_text)

        # 2. Query BM25 Keyword Search
        bm25_matches = await self._execute_bm25_search(
            db, query_text, user_ctx, enterprise_rbac_enabled, limit=20
        )

        # 3. Query Semantic Vector Search
        vector_matches = await self._execute_vector_search(
            db, query_vector, user_ctx, enterprise_rbac_enabled, limit=20
        )

        # 4. Fuse results using Reciprocal Rank Fusion (RRF)
        grounded_chunks = rrf_reranker.fuse_results(
            bm25_results=bm25_matches, vector_results=vector_matches, top_n=top_k
        )

        return grounded_chunks

    async def _execute_bm25_search(
        self,
        db: AsyncSession,
        query_text: str,
        user_ctx: UserContext,
        enterprise_rbac_enabled: bool,
        limit: int = 20,
    ) -> list[dict]:
        # Formulate TSVector rank query
        stmt = (
            select(
                DocumentChunk.id.label("chunk_id"),
                DocumentChunk.document_id,
                DocumentChunk.content,
                Document.title,
                Document.url,
                Document.source,
                func.ts_rank_cd(
                    DocumentChunk.tsv, func.plainto_tsquery("english", query_text)
                ).label("bm25_score"),
            )
            .join(Document, DocumentChunk.document_id == Document.id)
            .where(DocumentChunk.tsv.op("@@")(func.plainto_tsquery("english", query_text)))
        )

        # Apply RLS Pre-filters
        stmt = RLSFilterEngine.apply_rls_filters(stmt, user_ctx, enterprise_rbac_enabled)
        stmt = stmt.order_by(text("bm25_score DESC")).limit(limit)

        result = await db.execute(stmt)
        rows = result.fetchall()

        results = []
        for r in rows:
            results.append(
                {
                    "chunk_id": r.chunk_id,
                    "document_id": r.document_id,
                    "content": r.content,
                    "title": r.title,
                    "url": r.url or "",
                    "source": r.source,
                    "score": float(r.bm25_score or 0.0),
                }
            )
        return results

    async def _execute_vector_search(
        self,
        db: AsyncSession,
        query_vector: list[float],
        user_ctx: UserContext,
        enterprise_rbac_enabled: bool,
        limit: int = 20,
    ) -> list[dict]:
        # Formulate pgvector Cosine Distance Query
        distance_col = DocumentChunk.embedding.cosine_distance(query_vector).label("distance")
        stmt = select(
            DocumentChunk.id.label("chunk_id"),
            DocumentChunk.document_id,
            DocumentChunk.content,
            Document.title,
            Document.url,
            Document.source,
            distance_col,
        ).join(Document, DocumentChunk.document_id == Document.id)

        # Apply RLS Pre-filters
        stmt = RLSFilterEngine.apply_rls_filters(stmt, user_ctx, enterprise_rbac_enabled)
        stmt = stmt.order_by(distance_col.asc()).limit(limit)

        result = await db.execute(stmt)
        rows = result.fetchall()

        results = []
        for r in rows:
            results.append(
                {
                    "chunk_id": r.chunk_id,
                    "document_id": r.document_id,
                    "content": r.content,
                    "title": r.title,
                    "url": r.url or "",
                    "source": r.source,
                    "distance": float(r.distance or 0.0),
                }
            )
        return results


hybrid_search_engine = HybridSearchEngine()
