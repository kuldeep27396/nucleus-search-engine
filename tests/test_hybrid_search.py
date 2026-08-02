from data_plane.search.reranker import ReciprocalRankFusionReranker


def test_rrf_hybrid_fusion():
    reranker = ReciprocalRankFusionReranker(k=60)

    bm25_matches = [
        {
            "chunk_id": "chk_code_01",
            "document_id": "doc_code",
            "title": "Auth Error Codes",
            "content": "Error code ERR_AUTH_4092 invalid token",
            "source": "local",
        },
        {
            "chunk_id": "chk_doc_02",
            "document_id": "doc_general",
            "title": "User Manual",
            "content": "Authentication guide",
            "source": "local",
        },
    ]

    vector_matches = [
        {
            "chunk_id": "chk_doc_02",
            "document_id": "doc_general",
            "title": "User Manual",
            "content": "Authentication guide",
            "source": "local",
        },
        {
            "chunk_id": "chk_code_01",
            "document_id": "doc_code",
            "title": "Auth Error Codes",
            "content": "Error code ERR_AUTH_4092 invalid token",
            "source": "local",
        },
    ]

    fused = reranker.fuse_results(bm25_matches, vector_matches, top_n=2)

    assert len(fused) == 2
    # Both items should be classified as hybrid since they appear in both result sets
    assert fused[0].match_type == "hybrid"
    assert fused[1].match_type == "hybrid"
    assert fused[0].score > 0.0
