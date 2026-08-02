# Nucleus: The Open-Core Enterprise AI Search Engine

> **The Self-Hosted Glean Alternative**  
> A multi-tenant, permission-aware internal search engine. Companies deploy it inside their own VPC, bring their own LLM keys/proxies, and get Glean-style search with strict PostgreSQL Row-Level Security (RLS) and SOC2/DPDP append-only audit logs.

---

## 🚀 Key Highlights & Architecture

- **Hybrid Search Engine**: Combines PostgreSQL `tsvector` (BM25 exact keyword matching for error codes like `ERR_AUTH_4092`) and `pgvector` HNSW (Cosine semantic vector search) ranked via **Reciprocal Rank Fusion (RRF)**.
- **Multi-Tenant Row-Level Security (RLS)**: Enforces document ACL group pre-filtering directly in SQL before distance computation. Interns never see HR salary documents.
- **Bring Your Own LLM (BYO-LLM)**: Route all RAG prompts through internal LiteLLM proxies, Ollama, Azure, or OpenAI endpoints with zero third-party data retention.
- **Strict Grounding & Citations**: System prompts strictly enforce inline `[Doc_ID: <id>]` citations and prevent hallucinations.
- **Air-Gapped Ed25519 License Gate**: Control Plane issues cryptographically signed Ed25519 JWT license keys. Data Plane validates them **100% offline inside the customer VPC**.
- **SOC2 / DPDP Immutable Audit Logs**: Append-only SQL table recording query, identity, latency, retrieved chunk IDs, and LLM responses.
- **Pluggable Connectors**: Ships with `LocalDirectoryConnector` (Markdown/PDF/Code scanner) and `GoogleDriveConnector` stub.

---

## 📐 System Architecture

```
+---------------------------------------------------------------------------------------------------+
| DATA PLANE (Customer's VPC - 100% Private Data & Offline Capable)                                 |
|                                                                                                   |
|  +-------------------+       HTTPS       +------------------------------------+                    |
|  | Web Search UI     | <---------------> | FastAPI Gateway (Data Plane API)   |                    |
|  +-------------------+                   +------------------------------------+                    |
|                                            |  * Ed25519 License Gate (Offline) |                    |
|                                            |  * Auth & RLS Pre-Filter Engine    |                    |
|                                            |  * Hybrid Search Engine (RRF)     |                    |
|                                            |  * BYO-LLM Dynamic Router        |                    |
|                                            |  * SOC2 Immutable Audit Logger    |                    |
|                                            +------------------------------------+                    |
|                                              |                 |                 \                 |
|                                              v                 v                  v                |
|                                       +-------------+  +---------------+  +--------------------+   |
|                                       | Postgres +  |  | Redis Stream  |  | LiteLLM Proxy /    |   |
|                                       | pgvector    |  | Ingestion     |  | Customer OpenAI    |   |
|                                       | (HNSW+BM25) |  +---------------+  +--------------------+   |
|                                       +-------------+          |                                   |
|                                                                v                                   |
|                                                        +---------------+                           |
|                                                        | Ingestion     |                           |
|                                                        | Python Worker |                           |
|                                                        +---------------+                           |
+---------------------------------------------------------------------------------------------------+
                                            ||
                                            || Offline Ed25519 Verification (Zero Outbound Telemetry)
                                            \/
+---------------------------------------------------------------------------------------------------+
| CONTROL PLANE (Hosted Monetization Server - SaaS)                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | FastAPI License Server                                                                      |  |
|  |  * Ed25519 Key Pair Generator & Signed JWT Issuer                                         |  |
|  |  * Stripe Webhook Listener (Subscription lifecycle)                                         |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 📦 Quickstart & Running Locally

### Option 1: Running via Podman Compose

```bash
podman-compose up --build
```
- **Data Plane Search Gateway & UI**: `http://localhost:8000/portal`
- **Control Plane License Server**: `http://localhost:8001`
- **PostgreSQL pgvector Database**: `localhost:5432`

---

### Option 2: Running via Python Environment

1. **Install Dependencies**:
```bash
pip install -r requirements.txt
```

2. **Run Control Plane (License Server)**:
```bash
python -m control_plane.main
```

3. **Run Data Plane (Search Engine & Web Portal)**:
```bash
python -m data_plane.main
```

4. **Run Automated Test Suite**:
```bash
pytest tests/
```

---

## 🛠️ API Reference

### Data Plane APIs
- `POST /v1/search`: Execute RLS-filtered Hybrid Search (BM25 + Vector RRF).
- `POST /v1/chat`: Grounded BYO-LLM RAG Chat with `[Doc_ID]` citations.
- `POST /v1/documents`: Ingest custom document payload into vector database.
- `POST /v1/documents/sync-directory`: Scan and ingest local directory files.
- `POST /v1/documents/sync-gdrive`: Sync Google Drive connector stub.
- `GET /v1/audit/logs`: View SOC2 append-only audit logs (Enterprise feature).
- `POST /v1/enterprise/activate-license`: Submit Ed25519 signed JWT to activate Enterprise features.

### Control Plane APIs
- `POST /v1/licenses/issue`: Issue cryptographically signed Enterprise License JWT.
- `GET /v1/licenses/public-key`: Fetch Ed25519 Public Key for offline verification.
- `POST /v1/webhooks/stripe`: Stripe subscription lifecycle listener.

---

## 🛡️ License & Monetization Model

Nucleus uses an **Open-Core Model**:
- **Community Edition**: Core pgvector + tsvector hybrid search engine is 100% free and open-source.
- **Enterprise Edition**: Multi-Tenant Postgres Row-Level Security (RLS) enforcement and SOC2 Append-Only Audit Logging require a valid `NUC_ENT_...` Ed25519 license key.
