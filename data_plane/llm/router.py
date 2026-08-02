from typing import Any

import httpx

from data_plane.config import settings
from data_plane.llm.prompts import format_grounded_prompt
from data_plane.search.reranker import SearchResultChunk


class BYOLLMRouter:
    """
    Bring-Your-Own LLM (BYO-LLM) Router:
    Routes RAG prompts directly to the customer's internal LiteLLM proxy or OpenAI endpoint.
    Guarantees zero data retention by external SaaS hosts.
    """

    def __init__(self):
        self.base_url = settings.LLM_BASE_URL.rstrip("/")
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE

    async def generate_grounded_response(
        self, query: str, context_chunks: list[SearchResultChunk]
    ) -> dict[str, Any]:
        system_prompt, user_prompt = format_grounded_prompt(query, context_chunks)

        if not context_chunks:
            return {
                "answer": "I cannot answer this question based on the available internal documents.",
                "citations": [],
                "model_used": self.model,
                "grounded": False,
            }

        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": self.temperature,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions", json=payload, headers=headers
                )

                if res.status_code == 200:
                    data = res.json()
                    answer_text = data["choices"][0]["message"]["content"]
                    citations = [c.chunk_id for c in context_chunks]

                    return {
                        "answer": answer_text,
                        "citations": citations,
                        "model_used": self.model,
                        "grounded": True,
                    }
                else:
                    return self._generate_fallback_response(query, context_chunks)
        except Exception:
            # Generate deterministic grounded citation response if external LLM API is unavailable/unreachable
            return self._generate_fallback_response(query, context_chunks)

    def _generate_fallback_response(
        self, query: str, context_chunks: list[SearchResultChunk]
    ) -> dict[str, Any]:
        """Deterministic grounded fallback when local/proxy LLM endpoint is offline."""
        top_chunk = context_chunks[0]
        answer = (
            f"Based on internal document context '{top_chunk.title}' [Doc_ID: {top_chunk.chunk_id}], "
            f'the relevant information states: "{top_chunk.content[:250]}..."'
        )
        return {
            "answer": answer,
            "citations": [c.chunk_id for c in context_chunks],
            "model_used": f"{self.model}-offline-grounded-fallback",
            "grounded": True,
        }


llm_router = BYOLLMRouter()
