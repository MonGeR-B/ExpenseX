from datetime import date
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseRead
from app.api.deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get("/", response_model=List[ExpenseRead])
def list_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
):
    q = db.query(Expense).filter(Expense.user_id == current_user.id)

    if from_date:
        q = q.filter(Expense.date >= from_date)
    if to_date:
        q = q.filter(Expense.date <= to_date)

    q = q.order_by(Expense.date.desc(), Expense.id.desc())
    return q.all()


@router.post("/", response_model=ExpenseRead, status_code=201)
def create_expense(
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
    return expense
