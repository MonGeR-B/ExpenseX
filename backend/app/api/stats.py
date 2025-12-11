# app/api/stats.py
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.expense import Expense
from app.models.category import Category
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.stats import (
    SummaryStats,
    MonthlyStats,
    MonthlyPoint,
    DailyStats,
    DailyPoint,
    CategoryStats,
    CategoryPoint,
)

router = APIRouter(prefix="/stats", tags=["stats"])


def _get_year_month_or_default(year: Optional[int], month: Optional[int]) -> tuple[int, Optional[int]]:
    today = date.today()
    y = year or today.year
    m = month or today.month
    return y, m


@router.get("/summary", response_model=SummaryStats)
def summary_stats(
    year: int | None = Query(None),
    month: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary for a given month (default: current month).
    """
    y, m = _get_year_month_or_default(year, month)

    q = db.query(Expense).filter(Expense.user_id == current_user.id)
    q = q.filter(func.extract("year", Expense.date) == y)
    if m:
        q = q.filter(func.extract("month", Expense.date) == m)

    total_spent = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
        Expense.user_id == current_user.id,
        func.extract("year", Expense.date) == y,
        func.extract("month", Expense.date) == m,
    ).scalar() or 0

    tx_count = q.count()

    # avg per day in that month
    if m:
        from calendar import monthrange

        days_in_month = monthrange(y, m)[1]
    else:
        days_in_month = 365

    avg_per_day = float(total_spent) / days_in_month if days_in_month else 0.0

    # top category
    cat_row = (
        db.query(
            Category.name,
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .join(Expense, Expense.category_id == Category.id, isouter=True)
        .filter(Expense.user_id == current_user.id)
        .filter(func.extract("year", Expense.date) == y)
        .filter(func.extract("month", Expense.date) == m)
        .group_by(Category.id)
        .order_by(func.sum(Expense.amount).desc())
        .first()
    )

    top_category_name = cat_row[0] if cat_row else None
    top_category_amount = float(cat_row[1]) if cat_row else None

    return SummaryStats(
        period="month",
        year=y,
        month=m,
        total_spent=float(total_spent),
        avg_per_day=float(avg_per_day),
        transactions_count=tx_count,
        top_category=top_category_name,
        top_category_amount=top_category_amount,
    )


@router.get("/monthly", response_model=MonthlyStats)
def monthly_stats(
    year: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Total spent per month of a given year (default: current year).
    """
    today = date.today()
    y = year or today.year

    rows = (
        db.query(
            func.extract("month", Expense.date).label("month"),
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .filter(Expense.user_id == current_user.id)
        .filter(func.extract("year", Expense.date) == y)
        .group_by(func.extract("month", Expense.date))
        .order_by("month")
        .all()
    )

    points = [
        MonthlyPoint(
            month=int(row.month),
            total_amount=float(row.total),
        )
        for row in rows
    ]

    return MonthlyStats(year=y, points=points)


@router.get("/categories", response_model=CategoryStats)
def categories_stats(
    year: int | None = Query(None),
    month: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Total spent per category for given year/month.
    """
    y, m = _get_year_month_or_default(year, month)

    q = (
        db.query(
            Expense.category_id,
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .filter(Expense.user_id == current_user.id)
        .filter(func.extract("year", Expense.date) == y)
    )

    if m:
        q = q.filter(func.extract("month", Expense.date) == m)

    q = q.group_by(Expense.category_id)

    rows = q.all()

    # Map category ids → names
    cat_ids = [r.category_id for r in rows if r.category_id is not None]
    categories = (
        db.query(Category.id, Category.name)
        .filter(Category.user_id == current_user.id)
        .filter(Category.id.in_(cat_ids) if cat_ids else False)
        .all()
    )
    cat_map = {c.id: c.name for c in categories}

    points: list[CategoryPoint] = []
    for r in rows:
        cid = r.category_id
        points.append(
            CategoryPoint(
                category_id=cid,
                category_name=cat_map.get(cid) if cid is not None else "Uncategorized",
                total_amount=float(r.total),
            )
        )

    return CategoryStats(year=y, month=m, categories=points)


@router.get("/daily", response_model=DailyStats)
def daily_stats(
    year: int | None = Query(None),
    month: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Daily spending breakdown for a specific month.
    """
    y, m = _get_year_month_or_default(year, month)
    
    # Ensure month is set for daily stats, defaults to current if not provided
    if not m:
        today = date.today()
        m = today.month

    rows = (
        db.query(
            func.extract("day", Expense.date).label("day"),
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .filter(Expense.user_id == current_user.id)
        .filter(func.extract("year", Expense.date) == y)
        .filter(func.extract("month", Expense.date) == m)
        .group_by(func.extract("day", Expense.date))
        .order_by("day")
        .all()
    )

    # Convert to dictionary for easy lookup
    data_map = {int(r.day): float(r.total) for r in rows}

    points = []
    from calendar import monthrange
    days_in_month = monthrange(y, m)[1]

    for d in range(1, days_in_month + 1):
        points.append(
            DailyPoint(
                day=d,
                date=date(y, m, d),
                total_amount=data_map.get(d, 0.0)
            )
        )

    return DailyStats(year=y, month=m, points=points)
