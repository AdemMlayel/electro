from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class TicketMedia(Base):
    __tablename__ = "ticket_media"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(ForeignKey("tickets.id", ondelete="CASCADE"))
    media_url = Column(String, nullable=False)
    media_type = Column(String(10))

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
