from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class StandardizedDocument(BaseModel):
    id: str
    tenant_id: str
    source: str
    title: str
    content: str
    url: str = ""
    acl_group_ids: list[str] = ["group_all"]
    metadata: dict[str, Any] = {}


class BaseConnector(ABC):
    """
    Abstract Base Connector Framework:
    All Nucleus data connectors (Slack, Google Drive, Jira, Local Files) inherit from this interface.
    """

    @abstractmethod
    def get_connector_name(self) -> str:
        """Returns unique identifier for the connector."""
        pass

    @abstractmethod
    async def load_documents(self) -> list[StandardizedDocument]:
        """Fetches and standardizes documents from source system."""
        pass
