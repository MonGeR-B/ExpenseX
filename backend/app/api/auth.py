from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import UserCreate, UserRead, Token, UserUpdate, ForgotPasswordRequest, ResetPasswordRequest
import app.schemas as schemas
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=201)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Seed Default Categories
    from app.models.category import Category
    default_cats = [
        {"name": "Food", "icon": "🍔", "color": "#f87171"},
        {"name": "Transport", "icon": "🚗", "color": "#60a5fa"},
        {"name": "Entertainment", "icon": "🎬", "color": "#a78bfa"},
        {"name": "Shopping", "icon": "🛍️", "color": "#f472b6"},
        {"name": "Health", "icon": "💊", "color": "#34d399"},
        {"name": "Bills", "icon": "🧾", "color": "#fbbf24"},
        {"name": "Education", "icon": "📚", "color": "#818cf8"},
        {"name": "Income", "icon": "💰", "color": "#10b981"},
    ]
    
    for c in default_cats:
        cat = Category(user_id=user.id, name=c["name"], icon=c["icon"], color=c["color"])
        db.add(cat)
    
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(user.id)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserRead)
def update_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.username is not None:
        current_user.username = user_update.username
        db.commit()
        db.refresh(current_user)
    return current_user

@router.post("/forgot-password", status_code=200)
async def forgot_password(request: schemas.auth.ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Trigger password reset email.
    Always returns 200 to prevent user enumeration.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Return success even if user not found to prevent enumeration
        return {"msg": "If the email exists, a reset link has been sent."}
    
    # Generate 6-digit OTP
    import secrets
    otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    # print(f"-------------\nDEBUG RESET OTP: {otp}\n-------------")
    
    # Hash OTP
    import hashlib
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()
    
    # Save to DB
    from datetime import datetime, timedelta
    user.reset_token_hash = otp_hash
    user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # Send Email
    try:
        from app.core.email import send_reset_password_email
        await send_reset_password_email(user.email, otp)
    except Exception as e:
        print(f"Failed to send email: {e}")
    
    return {"msg": "If the email exists, a reset code has been sent."}

@router.post("/reset-password", status_code=200)
def reset_password(request: schemas.auth.ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using token.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request",
        )
        
    if not user.reset_token_hash or not user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )
        
    # Verify Expiry
    from datetime import datetime
    if datetime.utcnow() > user.reset_token_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired",
        )
        
    # Verify Hash
    import hashlib
    input_hash = hashlib.sha256(request.token.encode()).hexdigest()
    
    # Basic constant-time comparison (hashed vs hashed is relatively safe here)
    if input_hash != user.reset_token_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )
        
    # Update Password and Clear Token
    user.password_hash = hash_password(request.new_password)
    user.reset_token_hash = None
    user.reset_token_expires_at = None
    db.commit()
    
    return {"msg": "Password reset successfully"}
