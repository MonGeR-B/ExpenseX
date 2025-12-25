from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    username: str | None = None
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    username: str | None = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
