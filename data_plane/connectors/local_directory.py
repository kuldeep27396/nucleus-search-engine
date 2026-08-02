import glob
import os

from data_plane.connectors.base import BaseConnector, StandardizedDocument


class LocalDirectoryConnector(BaseConnector):
    """
    Local Directory Connector:
    Scans specified folder paths for Markdown, PDF, and Text documents.
    """

    def __init__(
        self, directory_path: str, tenant_id: str = "tenant_acme", acl_groups: list[str] = None
    ):
        self.directory_path = directory_path
        self.tenant_id = tenant_id
        self.acl_groups = acl_groups or ["group_all"]

    def get_connector_name(self) -> str:
        return "local_directory"

    async def load_documents(self) -> list[StandardizedDocument]:
        documents = []
        if not os.path.exists(self.directory_path):
            return documents

        extensions = ["*.md", "*.txt", "*.py", "*.json", "*.pdf"]
        for ext in extensions:
            search_pattern = os.path.join(self.directory_path, "**", ext)
            for filepath in glob.glob(search_pattern, recursive=True):
                try:
                    filename = os.path.basename(filepath)
                    with open(filepath, encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    if content.strip():
                        doc_id = f"doc_local_{abs(hash(filepath))}"
                        documents.append(
                            StandardizedDocument(
                                id=doc_id,
                                tenant_id=self.tenant_id,
                                source="local_directory",
                                title=filename,
                                content=content,
                                url=f"file://{filepath}",
                                acl_group_ids=self.acl_groups,
                                metadata={
                                    "filepath": filepath,
                                    "size_bytes": os.path.getsize(filepath),
                                },
                            )
                        )
                except Exception:
                    continue

        return documents
