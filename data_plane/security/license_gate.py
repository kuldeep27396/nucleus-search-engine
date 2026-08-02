from typing import Any

import jwt

from data_plane.config import settings


class EnterpriseLicenseGate:
    """
    Data Plane Security Gate:
    Verifies Control Plane signed JWT license keys OFFLINE using Ed25519 Public Key.
    Ensures zero outbound internet calls from customer VPC.
    """

    def __init__(self, public_key_pem: str | None = None):
        self.public_key_pem = public_key_pem or settings.ED25519_PUBLIC_KEY_PEM

    def set_public_key(self, pem_string: str):
        self.public_key_pem = pem_string

    def verify_license_token(self, token: str) -> dict[str, Any]:
        """
        Validates the Ed25519 signed JWT token offline.
        Returns decoded claims payload if valid, or raises Exception if invalid/expired.
        """
        if not self.public_key_pem:
            raise ValueError("No Ed25519 Public Key configured on Data Plane.")

        try:
            # Decode EdDSA signed JWT using public key
            payload = jwt.decode(
                token,
                self.public_key_pem,
                algorithms=["EdDSA"],
                audience="nucleus-data-plane",
                issuer="nucleus-control-plane",
            )
            return payload
        except jwt.ExpiredSignatureError as e:
            raise ValueError("Enterprise License Token has expired.") from e
        except jwt.InvalidTokenError as e:
            raise ValueError(f"Invalid Enterprise License Token: {str(e)}") from e

    def is_feature_enabled(self, token: str | None, feature_name: str) -> bool:
        """
        Checks if a specific enterprise feature (e.g. 'rbac', 'audit_logs') is unlocked.
        If no token is provided, Community Edition defaults apply (feature = False).
        """
        if not token:
            return False

        try:
            payload = self.verify_license_token(token)
            features = payload.get("features", [])
            return feature_name in features
        except Exception:
            return False


license_gate = EnterpriseLicenseGate()
