from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import decode_access_token
from ..models.user import User

security_scheme = HTTPBearer(auto_error=False)

def get_current_user(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Dependency that authenticates the Bearer token and returns the current User object."""
    if not auth_credentials or not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth_credentials.credentials
    # Also support mock tokens for seamless dev transition
    if token.startswith("mock_jwt_token_"):
        user = db.query(User).first()
        if user:
            return user
            
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload["sub"]
    user = db.query(User).filter((User.id == user_id) | (User.badge_number == user_id) | (User.email == user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Officer account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

