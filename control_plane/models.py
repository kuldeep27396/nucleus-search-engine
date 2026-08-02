from pydantic import BaseModel, Field


class LicenseIssueRequest(BaseModel):
    customer_id: str = Field(..., description="Enterprise Customer ID")
    customer_email: str = Field(..., description="Customer Billing Email")
    plan: str = Field("enterprise", description="Plan Tier: community | enterprise")
    features: list[str] = Field(
        default_factory=lambda: ["rbac", "audit_logs", "sso", "custom_connectors"],
        description="Features unlocked by license",
    )
    valid_days: int = Field(365, description="License validity period in days")


class LicenseResponse(BaseModel):
    license_key: str
    token: str
    customer_id: str
    plan: str
    features: list[str]
    issued_at: str
    expires_at: str
    public_key_pem: str


class StripeWebhookPayload(BaseModel):
    event_id: str
    event_type: str  # payment_intent.succeeded | customer.subscription.created | customer.subscription.deleted
    customer_id: str
    customer_email: str
    plan: str = "enterprise"
