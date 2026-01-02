from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime

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
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    remember_me: bool = False,
    db: Session = Depends(get_db)
):
    from app.core.security import create_refresh_token
    from datetime import timedelta
    from app.models.token import RefreshToken

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    # 1. Access Token (Short Lived)
    access_token = create_access_token(user.id)
    
    # 2. Refresh Token (Long Lived)
    refresh_expires = timedelta(days=30)
    refresh_token, jti = create_refresh_token(user.id, expires_delta=refresh_expires)
    
    # 3. Store JTI in DB (Whitelist)
    db_token = RefreshToken(
        user_id=user.id,
        token_jti=jti,
        expires_at=datetime.utcnow() + refresh_expires
    )
    db.add(db_token)
    db.commit()
    
    # 4. Set HttpOnly Cookie
    # If remember_me is False, max_age=None makes it a Session Cookie (deleted on close)
    # If True, max_age set to 30 days
    max_age_val = 30 * 24 * 60 * 60 if remember_me else None
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False, # Set to True in Production (HTTPS)
        samesite="lax",
        max_age=max_age_val
    )

    return Token(access_token=access_token)


@router.post("/refresh", response_model=Token)
def refresh_token(
    response: Response,
    request: Request,
    db: Session = Depends(get_db)
):
    from app.core.security import decode_token, create_refresh_token
    from app.models.token import RefreshToken
    from datetime import timedelta
    
    # 1. Get Token from Cookie
    old_token = request.cookies.get("refresh_token")
    if not old_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    try:
        payload = decode_token(old_token)
        if payload.get("type") != "refresh":
             raise HTTPException(status_code=401, detail="Invalid token type")
             
        jti = payload.get("jti")
        user_id = int(payload.get("sub"))
        
    except Exception:
         raise HTTPException(status_code=401, detail="Invalid token")

    # 2. Theft Detection
    # Check if JTI is in whitelist
    stored_token = db.query(RefreshToken).filter(RefreshToken.token_jti == jti).first()
    
    if not stored_token:
        # THEFT DETECTED! Token is valid signature but not in DB (means it was already used/rotated)
        # Action: Revoke ALL tokens for this user
        print(f"THEFT DETECTED for User {user_id}! Revoking all sessions.")
        db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
        db.commit()
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Token reuse detected. Please login again.")
        
    # 3. Rotation (Valid Token)
    # Delete old token
    db.delete(stored_token)
    db.commit()
    
    # Issue new pair
    new_access_token = create_access_token(user_id)
    refresh_expires = timedelta(days=30)
    new_refresh_token, new_jti = create_refresh_token(user_id, expires_delta=refresh_expires)
    
    # Save new to DB
    new_db_token = RefreshToken(
        user_id=user_id,
        token_jti=new_jti,
        expires_at=datetime.utcnow() + refresh_expires
    )
    db.add(new_db_token)
    db.commit()
    
    # Set new Cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False, # TODO: True in Prod
        samesite="lax",
        max_age=30 * 24 * 60 * 60 # Refreshing implies active user, extend session
    )
    
    return Token(access_token=new_access_token)

@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    # Standard logout to clear cookie
    token = request.cookies.get("refresh_token")
    if token:
        try:
            from app.core.security import decode_token
            # Optional: Remove specific token from DB
            payload = decode_token(token)
            jti = payload.get("jti")
            db.query(RefreshToken).filter(RefreshToken.token_jti == jti).delete()
            db.commit()
        except:
            pass
            
    response.delete_cookie("refresh_token")
    return {"msg": "Logged out successfully"}


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
    print(f"DEBUG: Password reset requested for '{request.email}'")
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        print(f"DEBUG: User not found for '{request.email}'")
        # Return success even if user not found to prevent enumeration
        return {"msg": "If the email exists, a reset link has been sent."}
    
    # Generate 6-digit OTP
    import secrets
    otp = "".join([str(secrets.randbelow(10)) for _ in range(6)])
    print(f"-------------\nDEBUG RESET OTP: {otp}\n-------------")
    
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
        print(f"DEBUG: Email sent to {user.email}")
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
