# Nucleus Project Map & Master Checklist

> **Single Source of Truth for Nucleus Enterprise AI Search Engine**  
> Tracks all files, modules, plans, and technical components required to build Nucleus end-to-end.

---

## 📁 Master File Registry

### 1. Root & Infrastructure Setup
- [x] `pyproject.toml` - `uv` dependency management & `ruff` linter/formatter configuration
- [x] `requirements.txt` - Complete Python dependency specifications
- [x] `.env.example` - Environment configuration template
- [x] `README.md` - Developer setup guide & project overview
- [x] `docs/BACKEND_TODO.md` - Comprehensive Backend Engineering Roadmap & TODO Plan
- [x] `podman-compose.yml` - Podman container orchestration for Postgres, Redis, Data Plane & Control Plane
- [x] `Containerfile.api` - Podman image definition for Data Plane FastAPI Gateway
- [x] `Containerfile.control_plane` - Podman image definition for Control Plane License Server

### 2. Control Plane (`control_plane/`) - SaaS Monetization
- [x] `control_plane/main.py` - Control Plane FastAPI server (License issuing & Stripe webhook)
- [x] `control_plane/license_generator.py` - Ed25519 asymmetric cryptographic keypair manager & signed JWT issuer
- [x] `control_plane/models.py` - Pydantic models for license payloads & webhooks

### 3. Data Plane (`data_plane/`) - 100% Private VPC Engine
- [x] `data_plane/main.py` - FastAPI Gateway Application
- [x] `data_plane/config.py` - Environment & BYO-LLM router settings
- [x] `data_plane/database.py` - Async SQLAlchemy database session setup & pgvector extension initialization
- [x] `data_plane/models/auth.py` - Tenant, User, and ACL Group database models
- [x] `data_plane/models/document.py` - Document & DocumentChunk schemas with pgvector HNSW index and tsvector GIN index
- [x] `data_plane/models/audit.py` - SOC2/DPDP append-only audit log table
- [x] `data_plane/security/license_gate.py` - Offline Ed25519 signed JWT license verification gate (Air-Gapped)
- [x] `data_plane/security/auth.py` - Multi-tenant user context extractor
- [x] `data_plane/security/rls.py` - PostgreSQL Row-Level Security (RLS) & pre-filtering engine
- [x] `data_plane/search/hybrid.py` - Hybrid search combining BM25 keyword matching and pgvector Cosine distance
- [x] `data_plane/search/reranker.py` - Reciprocal Rank Fusion (RRF) algorithm implementation
- [x] `data_plane/llm/prompts.py` - Anti-hallucination system grounding prompt and citation formatter (`[Doc_ID]`)
- [x] `data_plane/llm/router.py` - BYO-LLM dynamic proxy router (LiteLLM / OpenAI)
- [x] `data_plane/connectors/base.py` - Abstract `BaseConnector` pluggable interface
- [x] `data_plane/connectors/local_directory.py` - Local Markdown/PDF/Text document scanner
- [x] `data_plane/connectors/gdrive_stub.py` - Google Drive SaaS connector stub
- [x] `data_plane/ingestion/chunker.py` - Recursive text chunker with overlap
- [x] `data_plane/ingestion/embedder.py` - Pluggable dual-engine embedding service (SentenceTransformers / OpenAI)
- [x] `data_plane/ingestion/queue.py` - Redis Streams ingestion queue producer
- [x] `data_plane/ingestion/worker.py` - Background worker processing document chunks & vector storage
- [x] `data_plane/audit/middleware.py` - Immutable SOC2 audit log writer

### 4. Interactive Web Search Portal (`frontend/`)
- [x] `frontend/index.html` - Glean-style search portal, persona switcher, audit inspector & license modal
- [x] `frontend/styles.css` - Modern dark-mode glassmorphism styling
- [x] `frontend/app.js` - Interactive RAG search, persona switching, and API client logic

### 5. Infrastructure as Code (`terraform/`)
- [x] `terraform/main.tf` - AWS VPC, Security Groups, Subnets, and Podman EC2 deployment host
- [x] `terraform/variables.tf` - Terraform configuration variables
- [x] `terraform/outputs.tf` - Terraform outputs (Data Plane Search Portal URL & VPC ID)

### 6. Automated Verification Suite (`tests/`)
- [x] `tests/test_hybrid_search.py` - RRF hybrid search fusion test
- [x] `tests/test_rls_security.py` - Postgres RLS array overlap pre-filter SQL test
- [x] `tests/test_byo_llm.py` - BYO-LLM citation grounding test
- [x] `tests/test_license_gate.py` - Ed25519 offline license verification test

---

## 🗺️ Future Roadmap & Planned Modules

1. [ ] `data_plane/connectors/slack.py` - Real-time Slack channel message connector.
2. [ ] `data_plane/connectors/jira.py` - Atlassian Jira issue & epic connector.
3. [ ] `data_plane/search/evaluator.py` - Automated search relevance & NDCG@5 evaluator script.
4. [ ] `terraform/gcp_deployment.tf` - Google Cloud Platform (GCP) Cloud Run & Podman IaC module.
