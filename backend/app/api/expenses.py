from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate
from app.api.deps import get_current_user
from app.utils.redis_client import redis_client

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.get("/", response_model=List[ExpenseRead])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    min_amount: float | None = Query(None),
    max_amount: float | None = Query(None),
    category_id: int | None = Query(None),
):
    q = db.query(Expense).filter(Expense.user_id == current_user.id)

    if from_date:
        q = q.filter(Expense.date >= from_date)
    if to_date:
        q = q.filter(Expense.date <= to_date)
    if min_amount:
        q = q.filter(Expense.amount >= min_amount)
    if max_amount:
        q = q.filter(Expense.amount <= max_amount)
    if category_id:
        q = q.filter(Expense.category_id == category_id)

    # Order by date desc, then created_at desc
    q = q.order_by(desc(Expense.date), desc(Expense.created_at))
    return q.offset(skip).limit(limit).all()

async def invalidate_user_cache(user_id: int):
    """
    Invalidate ALL stats cache for a user.
    """
    # Pattern: user:{user_id}:* covers:
    # user:{id}:dashboard_stats
    # user:{id}:monthly:*
    # user:{id}:category:*
    # user:{id}:daily:*
    await redis_client.delete_pattern(f"user:{user_id}:*")

@router.post("/", response_model=ExpenseRead, status_code=201)
async def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = Expense(
        user_id=current_user.id,
        category_id=expense_in.category_id,
        date=expense_in.date,
        amount=expense_in.amount,
        description=expense_in.description,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    # Batch Invalidate
    await invalidate_user_cache(current_user.id)
    
    return expense

@router.put("/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    update_data = expense_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(expense, key, value)
    
    db.add(expense)
    db.commit()
    db.refresh(expense)
    
    # Batch Invalidate
    await invalidate_user_cache(current_user.id)
    
    return expense

@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.user_id == current_user.id)
        .first()
    )
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    db.delete(expense)
    db.commit()
    
    # Batch Invalidate
    await invalidate_user_cache(current_user.id)
    
    return {"message": "Expense deleted successfully"}
