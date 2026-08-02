import datetime
from typing import Any

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519


class Ed25519LicenseManager:
    """
    Control Plane Cryptographic Manager:
    Generates Ed25519 Private/Public key pairs and signs JWT license tokens.
    Data Plane uses the Public Key to verify license integrity offline (Air-Gapped).
    """

    def __init__(self):
        # Generate or load persistent Ed25519 keypair
        self.private_key = ed25519.Ed25519PrivateKey.generate()
        self.public_key = self.private_key.public_key()

    def get_public_key_pem(self) -> str:
        """Export Ed25519 public key as PEM formatted string."""
        pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
        return pem.decode("utf-8")

    def get_private_key_pem(self) -> str:
        """Export Ed25519 private key as PEM formatted string."""
        pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        return pem.decode("utf-8")

    def issue_license_jwt(
        self,
        customer_id: str,
        plan: str = "enterprise",
        features: list = None,
        valid_days: int = 365,
    ) -> tuple[str, str, dict[str, Any]]:
        """
        Creates a cryptographically signed JWT token with Ed25519 signature.
        """
        if features is None:
            features = ["rbac", "audit_logs", "sso", "custom_connectors"]

        now = datetime.datetime.now(datetime.UTC)
        expires_at = now + datetime.timedelta(days=valid_days)

        payload = {
            "iss": "nucleus-control-plane",
            "sub": customer_id,
            "aud": "nucleus-data-plane",
            "iat": int(now.timestamp()),
            "exp": int(expires_at.timestamp()),
            "plan": plan,
            "features": features,
            "license_id": f"NUC_ENT_{customer_id.upper()}_{int(now.timestamp())}",
        }

        # Encode JWT using EdDSA algorithm with Ed25519 private key
        private_pem = self.get_private_key_pem()
        token = jwt.encode(payload, private_pem, algorithm="EdDSA")

        metadata = {
            "license_id": payload["license_id"],
            "issued_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
        }

        return token, payload["license_id"], metadata


# Global singleton instance for Control Plane
license_manager = Ed25519LicenseManager()
