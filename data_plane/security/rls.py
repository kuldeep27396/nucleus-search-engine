from sqlalchemy import and_
from sqlalchemy.sql import Select

from data_plane.models.document import DocumentChunk
from data_plane.security.auth import UserContext


class RLSFilterEngine:
    """
    Row-Level Security & Pre-Filtering Engine:
    Guarantees that database vector distance and keyword searches only evaluate chunks
    that the requesting user has explicit ACL permission to view.
    """

    @staticmethod
    def apply_rls_filters(
        query: Select, user_ctx: UserContext, enterprise_rbac_enabled: bool = True
    ) -> Select:
        """
        Applies SQL pre-filtering clauses to a SQLAlchemy query.
        1. Always filter by tenant_id (Strict Multi-Tenant Isolation).
        2. If enterprise RBAC is active, filter by acl_group_ids overlap.
        """
        # Tenant isolation
        filters = [DocumentChunk.tenant_id == user_ctx.tenant_id]

        # RBAC Group pre-filtering if enterprise RBAC feature is active
        if enterprise_rbac_enabled and user_ctx.role != "admin":
            # Document chunk must contain at least one ACL group that the user belongs to
            filters.append(DocumentChunk.acl_group_ids.op("&&")(user_ctx.acl_groups))

        return query.where(and_(*filters))
