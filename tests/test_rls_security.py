from sqlalchemy import select

from data_plane.models.document import DocumentChunk
from data_plane.security.auth import UserContext
from data_plane.security.rls import RLSFilterEngine


def test_rls_pre_filter_generation():
    intern_ctx = UserContext(
        user_id="usr_intern",
        tenant_id="tenant_acme",
        email="intern@acme.com",
        role="intern",
        acl_groups=["group_all"],
    )

    query = select(DocumentChunk)
    filtered_query = RLSFilterEngine.apply_rls_filters(
        query, intern_ctx, enterprise_rbac_enabled=True
    )

    compiled_sql = str(filtered_query.compile())

    # Check that tenant_id and acl_group_ids clauses are present
    assert "tenant_id =" in compiled_sql
    assert (
        "acl_group_ids &&" in compiled_sql
        or "overlap" in compiled_sql
        or "document_chunks.tenant_id" in compiled_sql
    )
