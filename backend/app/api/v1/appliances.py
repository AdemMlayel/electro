from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.deps import get_db
from app.models.appliance import Appliance

router = APIRouter(prefix="/appliances", tags=["Appliances"])

class ApplianceCreate(BaseModel):
    name: str
    icon: str = None

@router.post("")
def create_appliance(appliance: ApplianceCreate, db: Session = Depends(get_db)):
    # Check if appliance already exists
    existing = db.query(Appliance).filter(Appliance.name == appliance.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Appliance already exists")
    
    db_appliance = Appliance(name=appliance.name, icon=appliance.icon)
    db.add(db_appliance)
    db.commit()
    db.refresh(db_appliance)
    return db_appliance

@router.get("")
def list_appliances(db: Session = Depends(get_db)):
    return db.query(Appliance).all()