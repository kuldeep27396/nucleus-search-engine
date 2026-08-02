from fastapi import Header, HTTPException, status
from pydantic import BaseModel


class UserContext(BaseModel):
    user_id: str
    tenant_id: str
    email: str
    role: str
    acl_groups: list[str]


async def get_current_user_context(
    x_user_id: str | None = Header("usr_demo", alias="X-User-Id"),
    x_tenant_id: str | None = Header("tenant_acme", alias="X-Tenant-Id"),
    x_user_email: str | None = Header("alex@acme.com", alias="X-User-Email"),
    x_user_role: str | None = Header("employee", alias="X-User-Role"),
    x_user_acls: str | None = Header("group_all,group_eng", alias="X-User-ACLs"),
) -> UserContext:
    """
    Extracts multi-tenant User Context from request headers or auth payload.
    Default header fallbacks provided for interactive UI demo testing.
    """
    if not x_user_id or not x_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-User-Id or X-Tenant-Id headers",
        )

    acl_list = (
        [g.strip() for g in x_user_acls.split(",") if g.strip()] if x_user_acls else ["group_all"]
    )

    return UserContext(
        user_id=x_user_id,
        tenant_id=x_tenant_id,
        email=x_user_email,
        role=x_user_role,
        acl_groups=acl_list,
    )
