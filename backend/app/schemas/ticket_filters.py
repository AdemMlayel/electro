from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketFilters(BaseModel):
    status: Optional[str] = None
    urgency: Optional[str] = None
    appliance_id: Optional[int] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
