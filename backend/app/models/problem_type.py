from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class ProblemType(Base):
    __tablename__ = "problem_types"

    id = Column(Integer, primary_key=True)
    appliance_id = Column(Integer, ForeignKey("appliances.id", ondelete="CASCADE"))
    label = Column(String(100), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
