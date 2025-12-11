from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate, Category as CategoryOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CategoryOut])
def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = (
        db.query(Category)
        .filter(Category.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return categories

@router.post("/", response_model=CategoryOut)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = Category(**category_in.dict(), user_id=current_user.id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category_in.dict(exclude_unset=True).items():
        setattr(category, key, value)
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = (
        db.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted"}

@router.post("/seed", response_model=List[CategoryOut])
def seed_default_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    defaults = [
        {"name": "Food", "color": "#ef4444", "icon": "🍔"},
        {"name": "Alcohol", "color": "#eab308", "icon": "🍺"},
        {"name": "Cigarettes", "color": "#71717a", "icon": "🚬"},
        {"name": "Petrol", "color": "#f97316", "icon": "⛽"},
        {"name": "Meds", "color": "#ef4444", "icon": "💊"},
        {"name": "Travel", "color": "#14b8a6", "icon": "✈️"},
        {"name": "Bills", "color": "#6366f1", "icon": "🧾"},
        {"name": "Transport", "color": "#3b82f6", "icon": "🚗"},
        {"name": "Shopping", "color": "#f59e0b", "icon": "🛍️"},
        {"name": "Entertainment", "color": "#8b5cf6", "icon": "🎬"},
        {"name": "Health", "color": "#10b981", "icon": "🏥"},
        {"name": "Education", "color": "#ec4899", "icon": "📚"},
        {"name": "Investments", "color": "#22c55e", "icon": "📈"},
        {"name": "Rent", "color": "#a855f7", "icon": "🏠"},
    ]
    
    created = []
    for data in defaults:
        # Check if exists
        exists = db.query(Category).filter(Category.user_id == current_user.id, Category.name == data["name"]).first()
        if not exists:
            cat = Category(**data, user_id=current_user.id)
            db.add(cat)
            created.append(cat)
    
    db.commit()
    for cat in created:
        db.refresh(cat)
        
    # Return all categories including old ones
    return db.query(Category).filter(Category.user_id == current_user.id).all()
