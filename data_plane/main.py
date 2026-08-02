import os
import time

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from data_plane.audit.middleware import audit_logger
from data_plane.connectors.gdrive_stub import GoogleDriveConnector
from data_plane.connectors.local_directory import LocalDirectoryConnector
from data_plane.database import get_db, init_db
from data_plane.ingestion.worker import worker
from data_plane.llm.router import llm_router
from data_plane.models.audit import AuditLog
from data_plane.search.hybrid import hybrid_search_engine
from data_plane.security.auth import UserContext, get_current_user_context
from data_plane.security.license_gate import license_gate

app = FastAPI(
    title="Nucleus Data Plane - Enterprise AI Search Engine",
    description="Multi-tenant, permission-aware self-hosted search engine with pgvector HNSW + BM25, BYO-LLM routing, and SOC2 Audit Logs.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active License Storage
ACTIVE_LICENSE_JWT: str | None = None

# --- Schemas ---


class IngestDocumentRequest(BaseModel):
    id: str | None = None
    title: str
    content: str
    source: str = "custom_api"
    url: str | None = ""
    acl_group_ids: list[str] = Field(default_factory=lambda: ["group_all"])


class SearchQueryRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatQueryRequest(BaseModel):
    query: str
    top_k: int = 5


class ActivateLicenseRequest(BaseModel):
    token: str


# --- Startup Event ---


@app.on_event("startup")
async def on_startup():
    await init_db()


# --- Endpoints ---


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "nucleus-data-plane"}


@app.get("/v1/enterprise/license-status")
async def license_status():
    global ACTIVE_LICENSE_JWT
    is_rbac = license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "rbac")
    is_audit = license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "audit_logs")

    return {
        "mode": "enterprise" if (is_rbac or is_audit) else "community",
        "license_active": ACTIVE_LICENSE_JWT is not None,
        "features": {"rbac": is_rbac, "audit_logs": is_audit, "air_gapped_verification": True},
    }


@app.post("/v1/enterprise/activate-license")
async def activate_license(req: ActivateLicenseRequest):
    global ACTIVE_LICENSE_JWT
    try:
        payload = license_gate.verify_license_token(req.token)
        ACTIVE_LICENSE_JWT = req.token
        return {
            "status": "success",
            "message": "Enterprise License Activated Successfully",
            "claims": payload,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"License Activation Failed: {str(e)}"
        ) from e


@app.post("/v1/documents")
async def ingest_document(
    doc: IngestDocumentRequest, user_ctx: UserContext = Depends(get_current_user_context)
):
    """Ingests a new text document into the vector search database."""
    payload = {
        "id": doc.id,
        "tenant_id": user_ctx.tenant_id,
        "title": doc.title,
        "content": doc.content,
        "source": doc.source,
        "url": doc.url,
        "acl_group_ids": doc.acl_group_ids,
    }
    doc_id = await worker.process_document_payload(payload)
    return {"status": "success", "document_id": doc_id}


@app.post("/v1/documents/sync-directory")
async def sync_directory(
    directory_path: str = "./", user_ctx: UserContext = Depends(get_current_user_context)
):
    """Syncs documents from a local directory path."""
    connector = LocalDirectoryConnector(
        directory_path=directory_path, tenant_id=user_ctx.tenant_id, acl_groups=user_ctx.acl_groups
    )
    docs = await connector.load_documents()
    processed_ids = []
    for doc in docs:
        payload = doc.dict()
        doc_id = await worker.process_document_payload(payload)
        processed_ids.append(doc_id)

    return {"status": "success", "synced_count": len(processed_ids), "document_ids": processed_ids}


@app.post("/v1/documents/sync-gdrive")
async def sync_gdrive(user_ctx: UserContext = Depends(get_current_user_context)):
    """Syncs documents from Google Drive Connector Stub."""
    connector = GoogleDriveConnector(tenant_id=user_ctx.tenant_id)
    docs = await connector.load_documents()
    processed_ids = []
    for doc in docs:
        payload = doc.dict()
        doc_id = await worker.process_document_payload(payload)
        processed_ids.append(doc_id)

    return {"status": "success", "synced_count": len(processed_ids), "document_ids": processed_ids}


@app.post("/v1/search")
async def search_documents(
    req: SearchQueryRequest,
    user_ctx: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    Enterprise Hybrid Search:
    Combines BM25 exact keyword matching (tsvector) and semantic search (pgvector HNSW)
    with database-level RLS pre-filtering and Reciprocal Rank Fusion (RRF).
    """
    start_time = time.time()

    # Check if Enterprise RBAC feature is enabled via license gate
    rbac_enabled = license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "rbac")

    results = await hybrid_search_engine.search(
        db=db,
        query_text=req.query,
        user_ctx=user_ctx,
        enterprise_rbac_enabled=rbac_enabled,
        top_k=req.top_k,
    )

    execution_time_ms = int((time.time() - start_time) * 1000)
    retrieved_ids = [r.chunk_id for r in results]

    # Append-only SOC2 Audit Logging if audit_logs feature enabled or community fallback
    if license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "audit_logs"):
        await audit_logger.log_search_event(
            user_ctx=user_ctx,
            query_text=req.query,
            retrieved_chunk_ids=retrieved_ids,
            llm_response=None,
            execution_time_ms=execution_time_ms,
        )

    return {
        "query": req.query,
        "user_id": user_ctx.user_id,
        "tenant_id": user_ctx.tenant_id,
        "rbac_filtered": rbac_enabled,
        "execution_time_ms": execution_time_ms,
        "total_results": len(results),
        "results": [r.dict() for r in results],
    }


@app.post("/v1/chat")
async def chat_rag(
    req: ChatQueryRequest,
    user_ctx: UserContext = Depends(get_current_user_context),
    db: AsyncSession = Depends(get_db),
):
    """
    BYO-LLM RAG Chat:
    Fetches grounded chunks with RLS pre-filtering and invokes the customer's BYO-LLM proxy.
    Returns response with explicit [Doc_ID: <id>] citations.
    """
    start_time = time.time()
    rbac_enabled = license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "rbac")

    # 1. Retrieve RRL hybridChunks
    chunks = await hybrid_search_engine.search(
        db=db,
        query_text=req.query,
        user_ctx=user_ctx,
        enterprise_rbac_enabled=rbac_enabled,
        top_k=req.top_k,
    )

    # 2. Invoke BYO-LLM Router
    llm_result = await llm_router.generate_grounded_response(query=req.query, context_chunks=chunks)

    execution_time_ms = int((time.time() - start_time) * 1000)

    # 3. Log Audit event
    if license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "audit_logs"):
        await audit_logger.log_search_event(
            user_ctx=user_ctx,
            query_text=req.query,
            retrieved_chunk_ids=[c.chunk_id for c in chunks],
            llm_response=llm_result["answer"],
            execution_time_ms=execution_time_ms,
        )

    return {
        "query": req.query,
        "user": user_ctx.dict(),
        "answer": llm_result["answer"],
        "citations": llm_result["citations"],
        "model_used": llm_result["model_used"],
        "retrieved_chunks": [c.dict() for c in chunks],
        "execution_time_ms": execution_time_ms,
    }


@app.get("/v1/audit/logs")
async def get_audit_logs(
    user_ctx: UserContext = Depends(get_current_user_context), db: AsyncSession = Depends(get_db)
):
    """Fetches SOC2 append-only audit logs for the current tenant."""
    if not license_gate.is_feature_enabled(ACTIVE_LICENSE_JWT, "audit_logs"):
        return {"message": "Enterprise License required for SOC2 Audit Logs viewer.", "logs": []}

    stmt = (
        select(AuditLog)
        .where(AuditLog.tenant_id == user_ctx.tenant_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    return {
        "tenant_id": user_ctx.tenant_id,
        "count": len(logs),
        "logs": [
            {
                "id": log_entry.id,
                "user_id": log_entry.user_id,
                "query": log_entry.query_text,
                "retrieved_doc_ids": log_entry.retrieved_doc_ids,
                "llm_response": log_entry.llm_response,
                "execution_time_ms": log_entry.execution_time_ms,
                "timestamp": log_entry.timestamp.isoformat(),
            }
            for log_entry in logs
        ],
    }


# --- Serve Static Frontend Dashboard ---

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/portal", StaticFiles(directory=frontend_path, html=True), name="portal")

if __name__ == "__main__":
    uvicorn.run("data_plane.main:app", host="0.0.0.0", port=8000, reload=True)
