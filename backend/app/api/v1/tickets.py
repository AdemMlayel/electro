from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db
from app.core.auth import get_current_user
from app.core.permissions import require_roles
from app.core.roles import Role

from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketListItem,
    TicketDetail,
    TicketDetailFull,
    TicketListItemFull,
    TicketStatusUpdate,
    TicketAssign,
    TicketUpdate,
)
from app.schemas.ticket_filters import TicketFilters
from app.services.ticket_service import (
    create_ticket,
    get_ticket_by_id,
    update_ticket_status,
    assign_technician,
    get_user_tickets_paginated,
    update_ticket,
    delete_ticket,
    ticket_to_enriched_dict,
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket_endpoint(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_ticket(db, current_user.id, payload)


@router.get("", response_model=PaginatedResponse[TicketListItemFull])
def list_my_tickets(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: str | None = None,
    urgency: str | None = None,
    appliance_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = TicketFilters(
        status=status,
        urgency=urgency,
        appliance_id=appliance_id,
    )

    total, items = get_user_tickets_paginated(
        db=db,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        filters=filters,
    )

    # Convert to enriched format
    enriched_items = [ticket_to_enriched_dict(item) for item in items]

    return {
        "items": enriched_items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get("/{ticket_id}", response_model=TicketDetailFull)
def get_ticket_details(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return ticket_to_enriched_dict(ticket)


@router.patch("/{ticket_id}/status")
def update_status(
    ticket_id: UUID,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Admins and technicians can update any status
    if current_user.role == Role.USER.value:
        if ticket.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        if payload.new_status != "cancelled":
            raise HTTPException(
                status_code=403,
                detail="Users can only cancel tickets",
            )
    elif current_user.role == Role.TECHNICIAN.value:
        # Technicians can only update tickets assigned to them
        if ticket.technician_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Admins can update any ticket status without restriction

    return update_ticket_status(
        db=db,
        ticket=ticket,
        new_status=payload.new_status,
        changed_by=current_user.id,
    )


@router.patch("/{ticket_id}/assign")
def assign_ticket(
    ticket_id: UUID,
    payload: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN, Role.ADMIN)),
):
    ticket = get_ticket_by_id(db, ticket_id)

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    technician = (
        db.query(User)
        .filter(
            User.id == payload.technician_id,
            User.role == Role.TECHNICIAN.value,
        )
        .first()
    )

    if not technician:
        raise HTTPException(status_code=400, detail="Invalid technician")

    return assign_technician(
        db=db,
        ticket=ticket,
        technician_id=payload.technician_id,
        assigned_by=current_user.id,
    )


@router.put("/{ticket_id}", response_model=TicketDetail)
def update_ticket_endpoint(
    ticket_id: UUID,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_ticket(db, ticket_id, current_user.id, payload)


@router.delete("/{ticket_id}")
def delete_ticket_endpoint(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_ticket(db, ticket_id, current_user.id)
    return {"message": "Ticket deleted successfully"}
