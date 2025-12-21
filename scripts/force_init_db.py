import sys
import os

# Add backend to path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.core.database import Base, engine
from app.models.user import User
from app.models.expense import Expense
from app.models.category import Category
from app.models.budget import Budget

print("⚡ Creating Database Tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables Created Successfully.")
    
    # Check where it was created
    if os.path.exists("backend/expense.db"):
        print("✅ Found: backend/expense.db")
    elif os.path.exists("backend/app/expense.db"):
        print("✅ Found: backend/app/expense.db")
    else:
        print("⚠️ Tables created but DB file not found in expected paths. Check config.")
        
except Exception as e:
    print(f"❌ Error creating tables: {e}")
