from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.v1.auth import router as auth_router
from app.api.v1.tickets import router as tickets_router
from app.api.v1.appliances import router as appliances_router
from app.api.v1.problem_types import router as problem_types_router
from app.api.v1.admin import router as admin_router
from app.api.v1.technician import router as technician_router
from app.core.database import engine, SessionLocal
from app.models.user import User
from app.core.security import hash_password

app = FastAPI(title="Electro Repair API")

# ✅ CORS MUST BE ADDED IMMEDIATELY AFTER APP CREATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTERS AFTER CORS
app.include_router(auth_router, prefix="/api/v1")
app.include_router(tickets_router, prefix="/api/v1")
app.include_router(appliances_router, prefix="/api/v1")
app.include_router(problem_types_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(technician_router, prefix="/api/v1")


@app.on_event("startup")
def seed_test_users():
    """Seed test users for admin and technician roles"""
    db: Session = SessionLocal()
    try:
        # Test Admin User
        admin_email = "adminadmin@test.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if admin_user:
            # Update existing user to admin role
            admin_user.role = "admin"
            print(f"✅ Updated test admin user role: {admin_email}")
        else:
            admin_user = User(
                full_name="Admin Admin",
                email=admin_email,
                password_hash=hash_password("adminadmin"),
                role="admin",
            )
            db.add(admin_user)
            print(f"✅ Created test admin user: {admin_email}")

        # Test Technician User
        tech_email = "testtechnician@test.com"
        tech_user = db.query(User).filter(User.email == tech_email).first()
        if tech_user:
            # Update existing user to technician role
            tech_user.role = "technician"
            print(f"✅ Updated test technician user role: {tech_email}")
        else:
            tech_user = User(
                full_name="Test Technician",
                email=tech_email,
                password_hash=hash_password("testtechnician"),
                role="technician",
            )
            db.add(tech_user)
            print(f"✅ Created test technician user: {tech_email}")

        db.commit()
    except Exception as e:
        print(f"❌ Error seeding test users: {e}")
        db.rollback()
    finally:
        db.close()


@app.get("/")
def health():
    return {"status": "ok"}
