from data_plane.connectors.base import BaseConnector, StandardizedDocument


class GoogleDriveConnector(BaseConnector):
    """
    Google Drive Connector (Stub):
    Demonstrates extensible architecture for SaaS cloud drive integrations.
    """

    def __init__(self, tenant_id: str = "tenant_acme", folder_id: str = "root"):
        self.tenant_id = tenant_id
        self.folder_id = folder_id

    def get_connector_name(self) -> str:
        return "google_drive"

    async def load_documents(self) -> list[StandardizedDocument]:
        # Return sample Google Drive standardized documents
        return [
            StandardizedDocument(
                id="doc_gdrive_salary_2026",
                tenant_id=self.tenant_id,
                source="google_drive",
                title="Q3 Executive & HR Salary Band Structure.pdf",
                content="CONFIDENTIAL: Executive salary bands for 2026. Software Engineering Lead: $180k-$240k. VP Product: $220k-$300k. HR Access Only.",
                url="https://drive.google.com/file/d/stub_salary_band/view",
                acl_group_ids=["group_hr", "group_exec"],
                metadata={"mime_type": "application/pdf", "author": "hr-admin@acme.com"},
            ),
            StandardizedDocument(
                id="doc_gdrive_architecture",
                tenant_id=self.tenant_id,
                source="google_drive",
                title="Nucleus Infrastructure & Security Design.md",
                content="Nucleus deployment architecture uses PostgreSQL pgvector and tsvector for hybrid search. Pre-filtered HNSW indexes enforce RLS and zero data egress.",
                url="https://drive.google.com/file/d/stub_arch_doc/view",
                acl_group_ids=["group_all", "group_eng"],
                metadata={"mime_type": "text/markdown", "author": "alex@acme.com"},
            ),
        ]
