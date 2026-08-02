from control_plane.license_generator import Ed25519LicenseManager
from data_plane.security.license_gate import EnterpriseLicenseGate


def test_ed25519_offline_license_verification():
    # 1. Control Plane generates keypair and issues signed token
    cp_manager = Ed25519LicenseManager()
    public_pem = cp_manager.get_public_key_pem()

    token, license_id, meta = cp_manager.issue_license_jwt(
        customer_id="acme_corp", plan="enterprise", features=["rbac", "audit_logs"]
    )

    # 2. Data Plane receives public key and verifies token offline (No network calls)
    dp_gate = EnterpriseLicenseGate(public_key_pem=public_pem)
    payload = dp_gate.verify_license_token(token)

    assert payload["sub"] == "acme_corp"
    assert payload["plan"] == "enterprise"
    assert "rbac" in payload["features"]
    assert "audit_logs" in payload["features"]

    # 3. Check feature entitlement flags
    assert dp_gate.is_feature_enabled(token, "rbac") is True
    assert dp_gate.is_feature_enabled(token, "audit_logs") is True
    assert dp_gate.is_feature_enabled(token, "custom_sso") is False
    assert dp_gate.is_feature_enabled(None, "rbac") is False
