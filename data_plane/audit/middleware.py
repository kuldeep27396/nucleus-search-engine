import uuid

from data_plane.database import AsyncSessionLocal
from data_plane.models.audit import AuditLog
from data_plane.security.auth import UserContext


class AuditLogger:
    """
    SOC2 / DPDP Immutable Audit Logger:
    Records every search query, retrieved document chunk IDs, execution time, and user identity.
    Writes strictly to the append-only audit_logs SQL table.
    """

    @staticmethod
    async def log_search_event(
        user_ctx: UserContext,
        query_text: str,
        retrieved_chunk_ids: list[str],
        llm_response: str | None,
        execution_time_ms: int,
        client_ip: str = "127.0.0.1",
        user_agent: str = "NucleusSearchClient/1.0",
    ):
        audit_entry = AuditLog(
            id=f"aud_{uuid.uuid4().hex[:14]}",
            tenant_id=user_ctx.tenant_id,
            user_id=user_ctx.user_id,
            query_text=query_text,
            retrieved_doc_ids=retrieved_chunk_ids,
            llm_response=llm_response,
            execution_time_ms=execution_time_ms,
            client_ip=client_ip,
            user_agent=user_agent,
        )

        async with AsyncSessionLocal() as db:
            async with db.begin():
                db.add(audit_entry)
                await db.flush()


audit_logger = AuditLogger()
