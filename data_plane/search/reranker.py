from typing import Any

from pydantic import BaseModel


class SearchResultChunk(BaseModel):
    chunk_id: str
    document_id: str
    title: str
    content: str
    url: str
    source: str
    score: float = 0.0
    bm25_rank: int = 0
    vector_rank: int = 0
    match_type: str = "hybrid"  # hybrid | bm25 | vector


class ReciprocalRankFusionReranker:
    """
    Reciprocal Rank Fusion (RRF) Strategy:
    Combines BM25 exact keyword matches (tsvector) and semantic vector search (pgvector)
    using the standard formula RRF_Score = 1 / (60 + rank_bm25) + 1 / (60 + rank_vec).
    """

    def __init__(self, k: int = 60):
        self.k = k

    def fuse_results(
        self,
        bm25_results: list[dict[str, Any]],
        vector_results: list[dict[str, Any]],
        top_n: int = 5,
    ) -> list[SearchResultChunk]:
        chunk_map: dict[str, SearchResultChunk] = {}
        scores: dict[str, float] = {}

        # 1. Process BM25 matches
        for rank, item in enumerate(bm25_results, start=1):
            cid = item["chunk_id"]
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.k + rank))

            if cid not in chunk_map:
                chunk_map[cid] = SearchResultChunk(
                    chunk_id=cid,
                    document_id=item["document_id"],
                    title=item["title"],
                    content=item["content"],
                    url=item.get("url", ""),
                    source=item.get("source", "unknown"),
                    bm25_rank=rank,
                    match_type="bm25",
                )
            else:
                chunk_map[cid].bm25_rank = rank
                chunk_map[cid].match_type = "hybrid"

        # 2. Process Vector matches
        for rank, item in enumerate(vector_results, start=1):
            cid = item["chunk_id"]
            scores[cid] = scores.get(cid, 0.0) + (1.0 / (self.k + rank))

            if cid not in chunk_map:
                chunk_map[cid] = SearchResultChunk(
                    chunk_id=cid,
                    document_id=item["document_id"],
                    title=item["title"],
                    content=item["content"],
                    url=item.get("url", ""),
                    source=item.get("source", "unknown"),
                    vector_rank=rank,
                    match_type="vector",
                )
            else:
                chunk_map[cid].vector_rank = rank
                chunk_map[cid].match_type = "hybrid"

        # 3. Apply final RRF score and sort descending
        final_list = []
        for cid, score in scores.items():
            res_item = chunk_map[cid]
            res_item.score = round(score, 4)
            final_list.append(res_item)

        final_list.sort(key=lambda x: x.score, reverse=True)
        return final_list[:top_n]


rrf_reranker = ReciprocalRankFusionReranker()
