import hashlib
import hmac
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import jwt
from .config import settings

def get_password_hash(password: str) -> str:
    """Generate salted SHA-256 hash for secure password storage."""
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against salted hash or fallback plain check for mock seeds."""
    if not hashed_password:
        return False
    if "$" in hashed_password:
        salt, pwd_hash = hashed_password.split("$", 1)
        test_hash = hashlib.sha256((salt + plain_password).encode('utf-8')).hexdigest()
        return hmac.compare_digest(pwd_hash, test_hash)
    # Simple match fallback for development test passwords
    return hmac.compare_digest(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

