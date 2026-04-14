from datetime import datetime, timedelta
import os

from jose import jwt
from passlib.context import CryptContext


# ------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)

# ------------------------------------------------------------------
# PASSWORD UTILITIES
# ------------------------------------------------------------------

def hash_password(password: str) -> str:
    # Truncate password to 72 bytes to comply with bcrypt limit
    password_bytes = password.encode('utf-8')[:72]
    password = password_bytes.decode('utf-8', errors='replace')
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ------------------------------------------------------------------
# JWT UTILITIES
# ------------------------------------------------------------------

def create_access_token(
    subject: str,
    role: str = "user",
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.utcnow() + (
        expires_delta
        if expires_delta
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": subject,
        "role": role,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
