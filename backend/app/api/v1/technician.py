from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.deps import get_db
from app.core.permissions import require_roles
from app.core.roles import Role
from app.models.user import User
from app.models.ticket import Ticket
from app.models.ticket_status_history import TicketStatusHistory
from app.schemas.common import PaginatedResponse
from app.schemas.ticket import TicketListItemFull, TicketDetailFull
from app.schemas.ticket_filters import TicketFilters
from app.services.ticket_service import get_technician_tickets_paginated, ticket_to_enriched_dict

router = APIRouter(prefix="/technician", tags=["Technician"])


@router.get("/tickets", response_model=PaginatedResponse[TicketListItemFull])
def technician_dashboard(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: str | None = None,
    urgency: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN)),
):
    filters = TicketFilters(
        status=status,
        urgency=urgency,
    )

    total, items = get_technician_tickets_paginated(
        db=db,
        technician_id=current_user.id,
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


@router.get("/unassigned", response_model=PaginatedResponse[TicketListItemFull])
def get_unassigned_tickets(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    urgency: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN)),
):
    """Get all unassigned (pending) tickets that technicians can claim."""
    query = db.query(Ticket).filter(
        Ticket.status == "pending",
        Ticket.technician_id == None
    )
    
    if urgency:
        query = query.filter(Ticket.urgency == urgency)
    
    total = query.count()
    items = query.order_by(Ticket.created_at.desc()).limit(limit).offset(offset).all()
    
    # Convert to enriched format
    enriched_items = [ticket_to_enriched_dict(item) for item in items]
    
    return {
        "items": enriched_items,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.post("/tickets/{ticket_id}/claim")
def claim_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN)),
):
    """Allow a technician to claim an unassigned ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending tickets can be claimed")
    
    if ticket.technician_id is not None:
        raise HTTPException(status_code=400, detail="Ticket is already assigned to a technician")
    
    # Assign the ticket to this technician
    ticket.technician_id = current_user.id
    ticket.status = "assigned"
    
    # Create status history entry
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status="pending",
        new_status="assigned",
        changed_by=current_user.id,
    )
    
    db.add(history)
    db.commit()
    db.refresh(ticket)
    
    return {"message": "Ticket claimed successfully", "ticket": ticket_to_enriched_dict(ticket)}


@router.get("/tickets/{ticket_id}", response_model=TicketDetailFull)
def get_ticket_details(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN)),
):
    """Get detailed information about a specific ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Technician can view their assigned tickets or unassigned tickets
    if ticket.technician_id is not None and ticket.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return ticket_to_enriched_dict(ticket)


@router.post("/tickets/{ticket_id}/unassign")
def unassign_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.TECHNICIAN)),
):
    """Allow a technician to unassign themselves from a ticket."""
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if ticket.technician_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only unassign yourself from your own tickets")
    
    if ticket.status not in ["assigned", "in_progress"]:
        raise HTTPException(status_code=400, detail="Cannot unassign from completed or cancelled tickets")
    
    old_status = ticket.status
    
    # Unassign the technician and reset status to pending
    ticket.technician_id = None
    ticket.status = "pending"
    
    # Create status history entry
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status="pending",
        changed_by=current_user.id,
    )
    
    db.add(history)
    db.commit()
    db.refresh(ticket)
    
    return {"message": "Ticket unassigned successfully", "ticket": ticket}
