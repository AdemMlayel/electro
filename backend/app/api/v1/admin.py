from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional

from app.core.deps import get_db
from app.core.permissions import require_roles
from app.core.roles import Role
from app.models.user import User
from app.models.ticket import Ticket
from app.models.appliance import Appliance
from app.models.problem_type import ProblemType
from app.schemas.ticket import TicketListItemFull, TicketStatusUpdate
from app.schemas.common import PaginatedResponse
from app.schemas.ticket_filters import TicketFilters
from app.services.ticket_service import get_all_tickets_paginated, get_ticket_by_id, update_ticket_status, ticket_to_enriched_dict

router = APIRouter(prefix="/admin", tags=["Admin"])


# -----------------------------
# Pydantic Schemas
# -----------------------------
class UserRoleUpdate(BaseModel):
    role: str


class ApplianceCreate(BaseModel):
    name: str
    icon: Optional[str] = None


class ApplianceUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None


class ProblemTypeCreate(BaseModel):
    appliance_id: int
    label: str


class ProblemTypeUpdate(BaseModel):
    label: Optional[str] = None
    appliance_id: Optional[int] = None


# -----------------------------
# Admin: List all tickets (paginated & filtered)
# -----------------------------
@router.get("/tickets", response_model=PaginatedResponse[TicketListItemFull])
def admin_list_tickets(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    status: str | None = None,
    urgency: str | None = None,
    appliance_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    filters = TicketFilters(
        status=status,
        urgency=urgency,
        appliance_id=appliance_id,
    )

    total, items = get_all_tickets_paginated(db, limit, offset, filters)
    
    # Convert to enriched format
    enriched_items = [ticket_to_enriched_dict(item) for item in items]

    return {
        "items": enriched_items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


# -----------------------------
# Admin: Update ticket status
# -----------------------------
@router.patch("/tickets/{ticket_id}/status")
def admin_update_ticket_status(
    ticket_id: UUID,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    ticket = get_ticket_by_id(db, ticket_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return update_ticket_status(
        db=db,
        ticket=ticket,
        new_status=payload.new_status,
        changed_by=current_user.id,
        skip_transition_check=True,  # Admins can set any status
    )


# -----------------------------
# Admin: Get dashboard stats
# -----------------------------
@router.get("/stats")
def admin_get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    total_users = db.query(User).filter(User.role == "user").count()
    total_technicians = db.query(User).filter(User.role == "technician").count()
    total_tickets = db.query(Ticket).count()
    pending_tickets = db.query(Ticket).filter(Ticket.status == "pending").count()
    completed_tickets = db.query(Ticket).filter(Ticket.status == "completed").count()
    total_appliances = db.query(Appliance).count()

    return {
        "totalUsers": total_users,
        "totalTechnicians": total_technicians,
        "totalTickets": total_tickets,
        "pendingTickets": pending_tickets,
        "completedTickets": completed_tickets,
        "totalAppliances": total_appliances,
    }


# -----------------------------
# Admin: List all users
# -----------------------------
@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    return db.query(User).order_by(User.created_at.desc()).all()


# -----------------------------
# Admin: Get single user
# -----------------------------
@router.get("/users/{user_id}")
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# -----------------------------
# Admin: Update user role
# -----------------------------
@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: UUID,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if role_update.role not in ["user", "technician", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = role_update.role
    db.commit()
    db.refresh(user)

    return {"message": f"User role updated to {role_update.role}", "user": user}


# -----------------------------
# Admin: Promote user to technician (legacy endpoint)
# -----------------------------
@router.patch("/users/{user_id}/promote")
def promote_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = Role.TECHNICIAN.value
    db.commit()

    return {"message": "User promoted to technician"}


# -----------------------------
# Admin: Activate/Deactivate user
# -----------------------------
@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = not user.is_active
    db.commit()

    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}


# -----------------------------
# Admin: Delete user
# -----------------------------
@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}


# -----------------------------
# Admin: Appliance Management
# -----------------------------
@router.get("/appliances")
def admin_list_appliances(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    return db.query(Appliance).order_by(Appliance.id).all()


@router.post("/appliances")
def admin_create_appliance(
    appliance: ApplianceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    existing = db.query(Appliance).filter(Appliance.name == appliance.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Appliance already exists")

    db_appliance = Appliance(name=appliance.name, icon=appliance.icon)
    db.add(db_appliance)
    db.commit()
    db.refresh(db_appliance)
    return db_appliance


@router.put("/appliances/{appliance_id}")
def admin_update_appliance(
    appliance_id: int,
    appliance: ApplianceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    db_appliance = db.query(Appliance).filter(Appliance.id == appliance_id).first()
    if not db_appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")

    if appliance.name is not None:
        db_appliance.name = appliance.name
    if appliance.icon is not None:
        db_appliance.icon = appliance.icon

    db.commit()
    db.refresh(db_appliance)
    return db_appliance


@router.delete("/appliances/{appliance_id}")
def admin_delete_appliance(
    appliance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    db_appliance = db.query(Appliance).filter(Appliance.id == appliance_id).first()
    if not db_appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")

    db.delete(db_appliance)
    db.commit()
    return {"message": "Appliance deleted successfully"}


# -----------------------------
# Admin: Problem Type Management
# -----------------------------
@router.get("/problem-types")
def admin_list_problem_types(
    appliance_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    query = db.query(ProblemType)
    if appliance_id:
        query = query.filter(ProblemType.appliance_id == appliance_id)
    return query.order_by(ProblemType.id).all()


@router.post("/problem-types")
def admin_create_problem_type(
    problem_type: ProblemTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    appliance = db.query(Appliance).filter(Appliance.id == problem_type.appliance_id).first()
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")

    existing = db.query(ProblemType).filter(
        ProblemType.appliance_id == problem_type.appliance_id,
        ProblemType.label == problem_type.label
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Problem type already exists for this appliance")

    db_problem_type = ProblemType(
        appliance_id=problem_type.appliance_id,
        label=problem_type.label
    )
    db.add(db_problem_type)
    db.commit()
    db.refresh(db_problem_type)
    return db_problem_type


@router.put("/problem-types/{problem_type_id}")
def admin_update_problem_type(
    problem_type_id: int,
    problem_type: ProblemTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    db_problem_type = db.query(ProblemType).filter(ProblemType.id == problem_type_id).first()
    if not db_problem_type:
        raise HTTPException(status_code=404, detail="Problem type not found")

    if problem_type.label is not None:
        db_problem_type.label = problem_type.label
    if problem_type.appliance_id is not None:
        appliance = db.query(Appliance).filter(Appliance.id == problem_type.appliance_id).first()
        if not appliance:
            raise HTTPException(status_code=404, detail="Appliance not found")
        db_problem_type.appliance_id = problem_type.appliance_id

    db.commit()
    db.refresh(db_problem_type)
    return db_problem_type


@router.delete("/problem-types/{problem_type_id}")
def admin_delete_problem_type(
    problem_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.ADMIN)),
):
    db_problem_type = db.query(ProblemType).filter(ProblemType.id == problem_type_id).first()
    if not db_problem_type:
        raise HTTPException(status_code=404, detail="Problem type not found")

    db.delete(db_problem_type)
    db.commit()
    return {"message": "Problem type deleted successfully"}
