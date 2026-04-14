import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    technician_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    appliance_id = Column(Integer, ForeignKey("appliances.id"), nullable=False)
    problem_type_id = Column(Integer, ForeignKey("problem_types.id"))

    brand = Column(String(100))
    model = Column(String(100))
    description = Column(Text, nullable=False)

    urgency = Column(String(10))
    status = Column(String(30), default="pending")

    phone = Column(String(30))
    address = Column(Text, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    preferred_time_slot = Column(String(100))
    scheduled_date = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="joined")
    technician = relationship("User", foreign_keys=[technician_id], lazy="joined")
    appliance = relationship("Appliance", lazy="joined")
    problem_type = relationship("ProblemType", lazy="joined")
