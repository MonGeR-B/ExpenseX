from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.budget import Budget
from app.models.expense import Expense
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/budgets", tags=["budgets"])

@router.get("/", response_model=List[BudgetRead])
def list_budgets(
    year: int | None = Query(None),
    month: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    y = year or today.year
    m = month or today.month

    try:
        # 1. Get Budgets for the month
        budgets = (
            db.query(Budget)
            .filter(Budget.user_id == current_user.id)
            .filter(func.extract("year", Budget.month) == y)
            .filter(func.extract("month", Budget.month) == m)
            .all()
        )
        
        results = []
        for budget in budgets:
            query = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
                Expense.user_id == current_user.id,
                func.extract("year", Expense.date) == y,
                func.extract("month", Expense.date) == m,
            )
            
            if budget.category_id:
                query = query.filter(Expense.category_id == budget.category_id)
                # Note: Global expenses (category_id IS NULL) are not counted in category budgets
            
            spent = query.scalar() or 0.0

            # Safe validation
            b_read = BudgetRead.model_validate(budget)
            b_read.spent = float(spent)
            b_amount = float(budget.amount)
            b_read.percentage = (b_read.spent / b_amount) * 100 if b_amount > 0 else 0
            results.append(b_read)
            
        return results
    except Exception as e:
        print(f"Error listing budgets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=BudgetRead)
def create_budget(
    budget_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Normalize to 1st of month
    normalized_month = date(budget_in.month.year, budget_in.month.month, 1)

    try:
        # Check if budget already exists
        exists = (
            db.query(Budget)
            .filter(Budget.user_id == current_user.id)
            .filter(Budget.month == normalized_month)
            .filter(Budget.category_id == budget_in.category_id)
            .first()
        )
        
        if exists:
            # UPSERT Logic
            exists.amount = budget_in.amount
            db.commit()
            db.refresh(exists)
            
            spent_query = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
                Expense.user_id == current_user.id,
                func.extract("year", Expense.date) == exists.month.year,
                func.extract("month", Expense.date) == exists.month.month,
            )
            if exists.category_id:
                spent_query = spent_query.filter(Expense.category_id == exists.category_id)
                
            spent = spent_query.scalar() or 0.0
            
            b_read = BudgetRead.model_validate(exists)
            b_read.spent = float(spent)
            b_amount = float(exists.amount)
            b_read.percentage = (b_read.spent / b_amount) * 100 if b_amount > 0 else 0
            return b_read

        # Create new
        budget = Budget(
            user_id=current_user.id,
            category_id=budget_in.category_id,
            amount=budget_in.amount,
            month=normalized_month
        )
        db.add(budget)
        db.commit()
        db.refresh(budget)
        
        b_read = BudgetRead.model_validate(budget)
        b_read.spent = 0.0
        b_read.percentage = 0.0
        return b_read
    except Exception as e:
         print(f"Error creating budget: {e}")
         raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
        
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}
