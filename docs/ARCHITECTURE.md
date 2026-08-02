# Nucleus Architecture & Security Design Document

## 1. Overview & Vision
Nucleus is an **open-core, multi-tenant, permission-aware internal AI search engine** designed as a self-hosted alternative to Glean. It deploys 100% inside a customer's private VPC using **Podman** containers, allowing enterprise teams to bring their own LLM API keys and proxies while guaranteeing zero data egress to 3rd-party SaaS platforms.

---

## 2. Security & Air-Gapped License Validation

```mermaid
flowchart TB
    subgraph DataPlane["🛡️ Customer VPC (Data Plane API)"]
        UI["💻 Web Search UI"]
        GW["⚡ FastAPI Gateway Engine"]
        GATE["🔐 Ed25519 License Gate (Offline)"]
        RLS["🔍 RLS ACL Pre-Filtering Engine"]
        BYO["🤖 BYO-LLM Router"]
    end

    subgraph ControlPlane["🔑 Control Plane (SaaS Server)"]
        LIC["🔑 Ed25519 Asymmetric Private-Key JWT Issuer"]
        STRIPE["💳 Stripe Webhook Subscription Lifecycle Listener"]
    end

    UI --> GW
    GW --> GATE & RLS & BYO
    GATE -.->|Offline Public-Key Verification| LIC

    %% Color Styles
    classDef dpStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    classDef cpStyle fill:#1e1b4b,stroke:#c084fc,stroke-width:2px,color:#f8fafc
    classDef uiNode fill:#0369a1,stroke:#38bdf8,stroke-width:2px,color:#ffffff
    classDef engineNode fill:#1e293b,stroke:#818cf8,stroke-width:2px,color:#f8fafc
    classDef cpNode fill:#7e22ce,stroke:#e9d5ff,stroke-width:2px,color:#ffffff

    class DataPlane dpStyle
    class ControlPlane cpStyle
    class UI uiNode
    class GW,GATE,RLS,BYO engineNode
    class LIC,STRIPE cpNode
```

### Ed25519 Offline Validation Algorithm:
1. Control Plane generates an asymmetric Ed25519 key pair.
2. Control Plane signs license JWT tokens containing customer entitlement claims (`features: ["rbac", "audit_logs"]`).
3. Customer receives the JWT license key and configures the Data Plane with the Control Plane's **Public Key PEM**.
4. The Data Plane validates the signature using `cryptography.hazmat.primitives.asymmetric.ed25519`. **Zero outbound network calls** are required to validate license state.

---

## 3. Hybrid Search & RLS Query Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 User / Persona
    participant UI as 💻 Search UI Portal
    participant API as ⚡ FastAPI Gateway
    participant Auth as 🔐 RLS Auth Engine
    participant DB as 🗄️ PostgreSQL (pgvector + BM25)
    participant RRF as 📊 RRF Reranker
    participant LLM as 🧠 BYO-LLM Router
    participant Audit as 📝 SOC2 Audit Logger

    User->>UI: Submit Search / RAG Query
    UI->>API: POST /v1/search or /v1/chat (with JWT)
    API->>Auth: Extract Tenant ID & User ACL Groups
    Auth-->>API: Authorized UserContext

    par Parallel Search Execution
        API->>DB: Execute BM25 Keyword Search (tsvector GIN + ACL Filter)
        API->>DB: Execute Vector Distance Search (HNSW + ACL Pre-Filter)
    end

    DB-->>API: Return Top Keyword & Vector Candidate Chunks
    API->>RRF: Fuse Scores using RRF: 1/(60 + Rank_bm25) + 1/(60 + Rank_vec)
    RRF-->>API: Return Ranked & Deduplicated Chunks

    opt RAG Generation Mode
        API->>LLM: Stream Grounded Prompt + Chunks [Doc_ID]
        LLM-->>API: Grounded Answer with Citations
    end

    API->>Audit: Write Immutable Audit Entry (Identity, Latency, Chunks)
    API-->>UI: Return Search Results & Grounded Response
    UI-->>User: Render Glassmorphism Results & Citations
```

---

## 4. Asynchronous Document Ingestion Pipeline

```mermaid
flowchart LR
    subgraph Connectors["📁 Data Source Connectors"]
        LOCAL["📄 Local Markdown/PDF Connector"]
        GDRIVE["☁️ Google Drive Connector"]
    end

    subgraph Processing["⚡ Ingestion Engine"]
        CHUNKER["✂️ Recursive Text Chunker\n(Chunk Size: 512, Overlap: 64)"]
        QUEUE["⚡ Redis Streams Ingestion Queue"]
        WORKER["⚙️ Background Worker Process"]
        EMBED["🧠 Dual Embedding Service\n(SentenceTransformers / OpenAI)"]
    end

    subgraph Storage["🗄️ Database Layer"]
        POSTGRES[("PostgreSQL 16\n- HNSW Vector Index\n- BM25 tsvector GIN Index")]
    end

    LOCAL & GDRIVE -->|Standardized Document| CHUNKER
    CHUNKER -->|Payload| QUEUE
    QUEUE -->|Pop Task| WORKER
    WORKER -->|Generate Vectors| EMBED
    EMBED -->|384d / 1536d Vectors| WORKER
    WORKER -->|Insert Chunks & Vectors| POSTGRES

    %% Color Styles
    classDef connStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    classDef procStyle fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#f8fafc
    classDef storeStyle fill:#065f46,stroke:#34d399,stroke-width:2px,color:#ffffff

    class LOCAL,GDRIVE connStyle
    class CHUNKER,QUEUE,WORKER,EMBED procStyle
    class POSTGRES storeStyle
```

---

## 5. Database Layer & PostgreSQL Pre-Filtered Hybrid Search

Nucleus utilizes **PostgreSQL 16 with pgvector** to provide unified relational storage, vector similarity, and BM25 full-text keyword search:

### Dual Indexing Strategy:
- **Vector Search**: `embedding vector(384)` column indexed with an HNSW graph (`vector_cosine_ops`).
- **Keyword Search**: `tsv tsvector` column indexed with a GIN index.

### Multi-Tenant Row-Level Security (RLS) & Pre-Filtering:
To prevent ACL leakage during HNSW graph traversal, Nucleus pre-filters vector queries using PostgreSQL array overlap operators:
```sql
SELECT chunk_id, content, title, 
       (embedding <=> :query_vector) AS distance
FROM document_chunks
WHERE tenant_id = :tenant_id
  AND acl_group_ids && :user_acl_groups
ORDER BY distance ASC
LIMIT 20;
```

### Reciprocal Rank Fusion (RRF):
BM25 keyword search ranks ($r_{bm25}$) and Cosine vector distance ranks ($r_{vec}$) are fused into a unified score:
$$RRF\_Score(d) = \frac{1}{60 + r_{bm25}(d)} + \frac{1}{60 + r_{vec}(d)}$$
