import datetime

from sqlalchemy import ARRAY, Column, DateTime, Integer, String, Text

from data_plane.database import Base


class AuditLog(Base):
    """
    SOC2 / DPDP Compliant Append-Only Audit Log Table.
    Every search query and AI response is immutably stored here for compliance and security auditing.
    """

    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    retrieved_doc_ids = Column(ARRAY(String), default=list)
    llm_response = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, nullable=False)
    client_ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
