from fastapi import HTTPException, status

def ensure_ownership(resource_owner_id, current_user_id):
    if resource_owner_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this resource",
        )
