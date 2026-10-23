from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email_or_username: str = Field(..., min_length=2, max_length=140)
    password_or_pin: str = Field(..., min_length=4, max_length=100)


class DemoLoginRequest(BaseModel):
    role: str = Field(..., description="Role to authenticate as: senco, teacher, parent, child, ta")


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class ThemePreferenceRequest(BaseModel):
    theme: str = Field(..., pattern="^(light|dark|system)$", description="UI theme preference")

