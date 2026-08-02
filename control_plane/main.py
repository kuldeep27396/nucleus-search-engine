import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from control_plane.license_generator import license_manager
from control_plane.models import LicenseIssueRequest, LicenseResponse, StripeWebhookPayload

app = FastAPI(
    title="Nucleus Control Plane - License & Monetization Server",
    description="Manages Enterprise License Keys, Ed25519 Signed JWT Issuance, and Stripe Webhook Events",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "nucleus-control-plane"}


@app.get("/v1/licenses/public-key")
async def get_public_key():
    """Returns the Control Plane's Ed25519 Public Key for Data Plane offline verification."""
    return {
        "algorithm": "EdDSA",
        "key_type": "Ed25519",
        "public_key_pem": license_manager.get_public_key_pem(),
    }


@app.post("/v1/licenses/issue", response_model=LicenseResponse)
async def issue_license(req: LicenseIssueRequest):
    """
    Issues a cryptographically signed Enterprise License Key.
    """
    try:
        token, license_id, meta = license_manager.issue_license_jwt(
            customer_id=req.customer_id,
            plan=req.plan,
            features=req.features,
            valid_days=req.valid_days,
        )

        return LicenseResponse(
            license_key=license_id,
            token=token,
            customer_id=req.customer_id,
            plan=req.plan,
            features=req.features,
            issued_at=meta["issued_at"],
            expires_at=meta["expires_at"],
            public_key_pem=license_manager.get_public_key_pem(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"License generation error: {str(e)}",
        ) from e


@app.post("/v1/webhooks/stripe")
async def stripe_webhook(payload: StripeWebhookPayload):
    """
    Mock Stripe Webhook Listener managing subscription lifecycles.
    """
    if payload.event_type == "customer.subscription.created":
        token, license_id, meta = license_manager.issue_license_jwt(
            customer_id=payload.customer_id, plan=payload.plan
        )
        return {
            "status": "success",
            "action": "license_issued",
            "license_id": license_id,
            "token": token,
        }
    elif payload.event_type == "customer.subscription.deleted":
        return {
            "status": "success",
            "action": "license_revoked",
            "customer_id": payload.customer_id,
        }

    return {"status": "ignored", "event_type": payload.event_type}


if __name__ == "__main__":
    uvicorn.run("control_plane.main:app", host="0.0.0.0", port=8001, reload=True)
