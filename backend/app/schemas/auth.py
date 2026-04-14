from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    current_password: str  # Required for any profile change
    new_password: str | None = Field(default=None, min_length=8, max_length=72)
