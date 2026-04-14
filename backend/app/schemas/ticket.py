from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from typing import Optional


class TicketCreate(BaseModel):
    appliance_id: int
    problem_type_id: Optional[int] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    description: str = Field(..., min_length=10)
    urgency: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    phone: Optional[str] = None
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_time_slot: Optional[str] = None
    scheduled_date: Optional[datetime] = None


class TicketResponse(BaseModel):
    id: UUID
    status: str

    class Config:
        from_attributes = True

class TicketListItem(BaseModel):
    id: UUID
    appliance_id: int
    problem_type_id: Optional[int]
    description: str
    status: str
    urgency: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    scheduled_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 compatible


class TicketDetail(BaseModel):
    id: UUID
    appliance_id: int
    problem_type_id: Optional[int]
    brand: Optional[str]
    model: Optional[str]
    description: str
    urgency: Optional[str]
    status: str
    phone: Optional[str]
    address: str
    latitude: Optional[float]
    longitude: Optional[float]
    preferred_time_slot: Optional[str]
    scheduled_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Enhanced ticket detail with all related information
class TicketDetailFull(BaseModel):
    id: UUID
    appliance_id: int
    problem_type_id: Optional[int]
    brand: Optional[str]
    model: Optional[str]
    description: str
    urgency: Optional[str]
    status: str
    phone: Optional[str]
    address: str
    latitude: Optional[float]
    longitude: Optional[float]
    preferred_time_slot: Optional[str]
    scheduled_date: Optional[datetime]
    created_at: datetime
    
    # User (creator) info
    user_id: UUID
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    
    # Technician info
    technician_id: Optional[UUID] = None
    technician_name: Optional[str] = None
    technician_email: Optional[str] = None
    technician_phone: Optional[str] = None
    
    # Appliance info
    appliance_name: Optional[str] = None
    appliance_icon: Optional[str] = None
    
    # Problem type info
    problem_type_label: Optional[str] = None

    class Config:
        from_attributes = True


# Enhanced ticket list item with essential related information
class TicketListItemFull(BaseModel):
    id: UUID
    appliance_id: int
    problem_type_id: Optional[int]
    description: str
    status: str
    urgency: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    scheduled_date: Optional[datetime]
    created_at: datetime
    
    # User (creator) info
    user_id: UUID
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    
    # Technician info
    technician_id: Optional[UUID] = None
    technician_name: Optional[str] = None
    
    # Appliance info
    appliance_name: Optional[str] = None
    appliance_icon: Optional[str] = None
    
    # Problem type info
    problem_type_label: Optional[str] = None

    class Config:
        from_attributes = True


class TicketUpdate(BaseModel):
    appliance_id: Optional[int] = None
    problem_type_id: Optional[int] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = Field(None, min_length=10)
    urgency: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    phone: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    preferred_time_slot: Optional[str] = None
    scheduled_date: Optional[datetime] = None

class TicketStatusUpdate(BaseModel):
    new_status: str = Field(
        ...,
        pattern="^(pending|assigned|in_progress|completed|cancelled)$"
    )

class TicketAssign(BaseModel):
    technician_id: UUID