from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.deps import get_db
from app.models.problem_type import ProblemType
from app.models.appliance import Appliance

router = APIRouter(prefix="/problem-types", tags=["Problem Types"])

class ProblemTypeCreate(BaseModel):
    appliance_id: int
    label: str

@router.post("")
def create_problem_type(problem_type: ProblemTypeCreate, db: Session = Depends(get_db)):
    # Check if appliance exists
    appliance = db.query(Appliance).filter(Appliance.id == problem_type.appliance_id).first()
    if not appliance:
        raise HTTPException(status_code=404, detail="Appliance not found")
    
    # Check if problem type already exists for this appliance
    existing = db.query(ProblemType).filter(
        ProblemType.appliance_id == problem_type.appliance_id,
        ProblemType.label == problem_type.label
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Problem type already exists for this appliance")
    
    db_problem_type = ProblemType(
        appliance_id=problem_type.appliance_id,
        label=problem_type.label
    )
    db.add(db_problem_type)
    db.commit()
    db.refresh(db_problem_type)
    return db_problem_type

@router.get("")
def list_problem_types(appliance_id: int = Query(None), db: Session = Depends(get_db)):
    if appliance_id:
        return db.query(ProblemType).filter(ProblemType.appliance_id == appliance_id).all()
    else:
        return db.query(ProblemType).all()