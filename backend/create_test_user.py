"""Create a test user for login testing"""
from database.connection import SessionLocal
from services.auth_service import hash_password
from models.user import User

db = SessionLocal()

# Delete existing test user if exists
existing = db.query(User).filter(User.email == "test@test.com").first()
if existing:
    db.delete(existing)
    db.commit()
    print("Deleted existing test user")

# Create new test user
test_user = User(
    email="test@test.com",
    password_hash=hash_password("test123")
)
db.add(test_user)
db.commit()
db.refresh(test_user)

print(f"✅ Created test user:")
print(f"   Email: test@test.com")
print(f"   Password: test123")
print(f"   User ID: {test_user.id}")

db.close()
