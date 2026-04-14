from fastapi import Depends, HTTPException, status
from typing import Iterable

from app.core.auth import get_current_user
from app.models.user import User
from app.core.roles import Role


def require_roles(*allowed_roles: Iterable[Role]):
    """
    FastAPI dependency to restrict access by role.
    Usage: Depends(require_roles(Role.ADMIN, Role.TECHNICIAN))
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
