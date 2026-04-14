from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password, verify_password


def register_user(
    db: Session,
    full_name: str,
    email: str,
    password: str,
) -> User:
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists",
        )

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role="user",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> User | None:
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user
