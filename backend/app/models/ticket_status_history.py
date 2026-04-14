from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"))
    old_status = Column(String(30))
    new_status = Column(String(30), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    changed_at = Column(DateTime(timezone=True), server_default=func.now())
