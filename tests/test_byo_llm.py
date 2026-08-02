from data_plane.llm.prompts import format_grounded_prompt
from data_plane.search.reranker import SearchResultChunk


def test_grounded_prompt_formatting():
    chunks = [
        SearchResultChunk(
            chunk_id="chk_101",
            document_id="doc_arch",
            title="System Design",
            content="Nucleus architecture uses PostgreSQL pgvector and tsvector.",
            url="file:///docs/design.md",
            source="local_directory",
        )
    ]

    system_prompt, user_prompt = format_grounded_prompt("How does Nucleus search work?", chunks)

    assert "[Doc_ID: <chunk_id>]" in system_prompt
    assert "chk_101" in system_prompt
    assert "System Design" in system_prompt
    assert "User Question: How does Nucleus search work?" == user_prompt
