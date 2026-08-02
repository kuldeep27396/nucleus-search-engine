import datetime

from sqlalchemy import ARRAY, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from data_plane.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, index=True)  # e.g. tenant_acme_corp
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # e.g. usr_123
    tenant_id = Column(
        String, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    email = Column(String, nullable=False, index=True)
    role = Column(String, nullable=False, default="employee")  # admin | manager | employee | intern
    acl_groups = Column(ARRAY(String), default=list)  # e.g. ["group_eng", "group_all"]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")
