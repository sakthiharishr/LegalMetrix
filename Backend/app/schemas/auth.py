from typing import Optional
from pydantic import BaseModel, ConfigDict

class LoginRequest(BaseModel):
    username: str
    password: str
    rememberMe: Optional[bool] = False

class OfficerProfile(BaseModel):
    id: str
    name: str
    designation: str
    badgeNumber: str
    jurisdiction: str
    role: str
    email: str
    avatarUrl: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class LoginResponse(BaseModel):
    accessToken: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: OfficerProfile

class RefreshResponse(BaseModel):
    accessToken: str
    access_token: Optional[str] = None

