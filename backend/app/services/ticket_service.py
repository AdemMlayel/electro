import uuid
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.models.ticket_status_history import TicketStatusHistory
from app.schemas.ticket_filters import TicketFilters
from app.services.email_service import send_email


ALLOWED_STATUS_TRANSITIONS = {
    "pending": {"assigned", "cancelled"},
    "assigned": {"in_progress", "cancelled"},
    "in_progress": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


def create_ticket(
    db: Session,
    user_id: uuid.UUID,
    data,
) -> Ticket:
    ticket = Ticket(
        user_id=user_id,
        appliance_id=data.appliance_id,
        problem_type_id=data.problem_type_id,
        brand=data.brand,
        model=data.model,
        description=data.description,
        urgency=data.urgency,
        address=data.address,
        preferred_time_slot=data.preferred_time_slot,
        status="pending",
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=None,
        new_status="pending",
        changed_by=user_id,
    )

    db.add(history)
    db.commit()

    return ticket


def get_ticket_by_id(
    db: Session,
    ticket_id: UUID,
) -> Ticket | None:
    return (
        db.query(Ticket)
        .filter(Ticket.id == ticket_id)
        .first()
    )


def update_ticket_status(
    db: Session,
    ticket: Ticket,
    new_status: str,
    changed_by: UUID,
    skip_transition_check: bool = False,
) -> Ticket:
    current_status = ticket.status

    if not skip_transition_check and new_status not in ALLOWED_STATUS_TRANSITIONS[current_status]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition from '{current_status}' to '{new_status}'",
        )

    ticket.status = new_status
    db.add(ticket)

    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=current_status,
        new_status=new_status,
        changed_by=changed_by,
    )

    db.add(history)
    db.commit()
    db.refresh(ticket)

    # Get user email for notification
    from app.models.user import User
    user = db.query(User).filter(User.id == ticket.user_id).first()
    if user and user.email:
        send_email(
            to_email=user.email,
            subject="Your ticket status has been updated",
            body=f"Your ticket {ticket.id} status is now '{new_status}'.",
        )

    return ticket


def assign_technician(
    db: Session,
    ticket: Ticket,
    technician_id: UUID,
    assigned_by: UUID,
) -> Ticket:
    if ticket.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending tickets can be assigned",
        )

    ticket.technician_id = technician_id
    ticket.status = "assigned"

    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status="pending",
        new_status="assigned",
        changed_by=assigned_by,
    )

    db.add(ticket)
    db.add(history)
    db.commit()
    db.refresh(ticket)

    return ticket


def get_user_tickets_paginated(
    db: Session,
    user_id: UUID,
    limit: int,
    offset: int,
    filters: TicketFilters,
):
    query = db.query(Ticket).filter(Ticket.user_id == user_id)
    query = apply_ticket_filters(query, filters)

    total = query.with_entities(func.count()).scalar()
    items = (
        query.order_by(Ticket.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return total, items


def get_technician_tickets_paginated(
    db: Session,
    technician_id: UUID,
    limit: int,
    offset: int,
    filters: TicketFilters,
):
    query = db.query(Ticket).filter(Ticket.technician_id == technician_id)
    query = apply_ticket_filters(query, filters)

    total = query.with_entities(func.count()).scalar()
    items = (
        query.order_by(Ticket.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return total, items


def get_all_tickets_paginated(
    db: Session,
    limit: int,
    offset: int,
    filters: TicketFilters,
):
    query = db.query(Ticket)
    query = apply_ticket_filters(query, filters)

    total = query.with_entities(func.count()).scalar()
    items = (
        query.order_by(Ticket.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return total, items


def apply_ticket_filters(query, filters: TicketFilters):
    if filters.status:
        query = query.filter(Ticket.status == filters.status)
    if filters.urgency:
        query = query.filter(Ticket.urgency == filters.urgency)
    if filters.appliance_id:
        query = query.filter(Ticket.appliance_id == filters.appliance_id)
    if filters.from_date:
        query = query.filter(Ticket.created_at >= filters.from_date)
    if filters.to_date:
        query = query.filter(Ticket.created_at <= filters.to_date)

    return query


def ticket_to_enriched_dict(ticket: Ticket) -> dict:
    """Convert a Ticket model with relationships to an enriched dictionary."""
    return {
        "id": ticket.id,
        "appliance_id": ticket.appliance_id,
        "problem_type_id": ticket.problem_type_id,
        "brand": ticket.brand,
        "model": ticket.model,
        "description": ticket.description,
        "urgency": ticket.urgency,
        "status": ticket.status,
        "phone": ticket.phone,
        "address": ticket.address,
        "latitude": ticket.latitude,
        "longitude": ticket.longitude,
        "preferred_time_slot": ticket.preferred_time_slot,
        "scheduled_date": ticket.scheduled_date,
        "created_at": ticket.created_at,
        # User (creator) info
        "user_id": ticket.user_id,
        "user_name": ticket.user.full_name if ticket.user else None,
        "user_email": ticket.user.email if ticket.user else None,
        "user_phone": ticket.user.phone if ticket.user else None,
        # Technician info
        "technician_id": ticket.technician_id,
        "technician_name": ticket.technician.full_name if ticket.technician else None,
        "technician_email": ticket.technician.email if ticket.technician else None,
        "technician_phone": ticket.technician.phone if ticket.technician else None,
        # Appliance info
        "appliance_name": ticket.appliance.name if ticket.appliance else None,
        "appliance_icon": ticket.appliance.icon if ticket.appliance else None,
        # Problem type info
        "problem_type_label": ticket.problem_type.label if ticket.problem_type else None,
    }


def update_ticket(
    db: Session,
    ticket_id: uuid.UUID,
    user_id: uuid.UUID,
    data,
) -> Ticket:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Only allow updates for tickets that are not completed or cancelled
    if ticket.status in ["completed", "cancelled"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot update completed or cancelled tickets"
        )

    # Update fields if provided
    if data.appliance_id is not None:
        ticket.appliance_id = data.appliance_id
    if data.problem_type_id is not None:
        ticket.problem_type_id = data.problem_type_id
    if data.brand is not None:
        ticket.brand = data.brand
    if data.model is not None:
        ticket.model = data.model
    if data.description is not None:
        ticket.description = data.description
    if data.urgency is not None:
        ticket.urgency = data.urgency
    if data.address is not None:
        ticket.address = data.address
    if data.preferred_time_slot is not None:
        ticket.preferred_time_slot = data.preferred_time_slot

    db.commit()
    db.refresh(ticket)
    return ticket


def delete_ticket(
    db: Session,
    ticket_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Only allow deletion for tickets that are pending
    if ticket.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Can only delete pending tickets"
        )

    db.delete(ticket)
    db.commit()
    return True
