from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UpdateProfileRequest
from app.services.auth_service import register_user, authenticate_user
from app.core.security import create_access_token, verify_password, hash_password
from app.core.deps import get_db
from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
):
    user = register_user(
        db=db,
        full_name=payload.full_name,
        email=payload.email,
        password=payload.password,
    )

    return {
        "id": user.id,
        "email": user.email,
    }


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        subject=str(user.id),
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


@router.put("/me")
def update_current_user_profile(
    payload: "UpdateProfileRequest",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify current password
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update profile info
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    
    # Update email
    if payload.email is not None and payload.email != current_user.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        current_user.email = payload.email
    
    # Update password
    if payload.new_password is not None:
        current_user.password_hash = hash_password(payload.new_password)
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


@router.post("/logout")
def logout():
    # Since we're using cookies, the frontend will handle clearing the cookie
    return {"message": "Logged out successfully"}
