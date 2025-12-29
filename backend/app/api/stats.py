from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import func, extract
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
import time
from app.utils.redis_client import redis_client

router = APIRouter(prefix="/stats", tags=["stats"])

# In-Memory Cache (Simple implementation for demonstration) - DEPRECATED via Redis
CACHE = {}

def get_cached(key: str, ttl: int = 60):
    if key in CACHE:
        val, ts = CACHE[key]
        if time.time() - ts < ttl:
            return val
    return None

def set_cached(key: str, val: any):
    CACHE[key] = (val, time.time())


def _get_year_month_or_default(year: Optional[int], month: Optional[int]) -> tuple[int, Optional[int]]:
    today = date.today()
    y = year or today.year
    m = month or today.month
    return y, m


@router.get("/summary", response_model=SummaryStats)
async def summary_stats(
    response: Response,
    year: int | None = Query(None),
    month: int | None = Query(None),
    _t: int | None = Query(None),  # Accept timestamp for cache busting
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Summary for a given month (default: current month).
    """
    # Cache Logic: Only cache the default view (current month/year) to match the strict key requirement
    use_cache = (year is None and month is None)
    cache_key = f"user:{current_user.id}:dashboard_stats"

    if use_cache:
        cached = await redis_client.get_cache(cache_key)
        if cached:
            response.headers["X-Cache"] = "HIT"
            return cached

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

    top_cat = cat_row[0] if cat_row else None
    top_cat_amt = float(cat_row[1]) if cat_row else 0.0

    result = SummaryStats(
        period="month",
        year=y,
        month=m,
        total_spent=float(total_spent),
        avg_per_day=avg_per_day,
        transactions_count=tx_count,
        top_category=top_cat,
        top_category_amount=top_cat_amt,
    )

    if use_cache:
        await redis_client.set_cache(cache_key, result.dict(), ttl=604800)
        response.headers["X-Cache"] = "MISS"

    return result


@router.get("/monthly", response_model=MonthlyStats)
async def monthly_stats(
    response: Response,
    year: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Total spent per month of a given year (default: current year).
    """
    # Cache Logic
    y = year or date.today().year
    cache_key = f"user:{current_user.id}:monthly:{y}"
    
    cached = await redis_client.get_cache(cache_key)
    if cached:
        response.headers["X-Cache"] = "HIT"
        return cached

    today = date.today()
    # y already set above

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
    
    result = MonthlyStats(year=y, points=points)
    
    await redis_client.set_cache(cache_key, result.dict(), ttl=604800)
    response.headers["X-Cache"] = "MISS"

    return result


@router.get("/categories", response_model=CategoryStats)
async def categories_stats(
    response: Response,
    year: int | None = Query(None),
    month: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Total spent per category for given year/month.
    """
    # Cache Logic
    y, m = _get_year_month_or_default(year, month)
    # Key: user:{uid}:category:{year}:{month} (month can be None)
    month_key = m if m else "all"
    cache_key = f"user:{current_user.id}:category:{y}:{month_key}"
    
    cached = await redis_client.get_cache(cache_key)
    if cached:
        response.headers["X-Cache"] = "HIT"
        return cached

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

    result = CategoryStats(year=y, month=m, categories=points)
    
    await redis_client.set_cache(cache_key, result.dict(), ttl=604800)
    response.headers["X-Cache"] = "MISS"
    
    return result


@router.get("/daily", response_model=DailyStats)
async def daily_stats(
    response: Response,
    year: int | None = Query(None),
    month: int | None = Query(None),
    _t: int | None = Query(None),  # Accept timestamp for cache busting
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Daily spending breakdown for a specific month.
    """
    # Cache Logic
    y, m = _get_year_month_or_default(year, month)
    
    # Ensure month is set for daily stats, defaults to current if not provided
    if not m:
        today = date.today()
        m = today.month

    cache_key = f"user:{current_user.id}:daily:{y}:{m}"
    
    cached = await redis_client.get_cache(cache_key)
    if cached:
        response.headers["X-Cache"] = "HIT"
        return cached

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

    result = DailyStats(year=y, month=m, points=points)
    
    await redis_client.set_cache(cache_key, result.dict(), ttl=604800)
    response.headers["X-Cache"] = "MISS"

    return result

@router.get("/streak")
def get_streak_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current streak and expense dates for the last 90 days.
    """
    from datetime import datetime, timedelta
    
    # 1. Fetch distinct dates for user (last 90 days)
    ninety_days_ago = datetime.utcnow().date() - timedelta(days=90)
    
    # SQLAlchemy: Distinct dates
    rows = (
        db.query(Expense.date)
        .filter(Expense.user_id == current_user.id)
        .filter(Expense.date >= ninety_days_ago)
        .distinct()
        .order_by(Expense.date.desc())
        .all()
    )
    
    # Convert to list of dates
    dates = [row.date for row in rows] # row.date is already datetime.date object from model
    
    # 2. Calculate Streak
    current_streak = 0
    if not dates:
        return {"dates": [], "current_streak": 0}
        
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Check if the most recent entry is today or yesterday to satisfy "current" streak
    last_entry = dates[0]
    
    # Streak Logic:
    # If last entry is before yesterday, streak is broken (0).
    # If last entry is today or yesterday, we count backwards.
    
    if last_entry < yesterday:
        current_streak = 0
    else:
        # Determine start point for checking consecutiveness
        # We start counting from the most recent entry found
        streak_count = 1
        current_check = last_entry
        
        for i in range(1, len(dates)):
            expected_prev = current_check - timedelta(days=1)
            if dates[i] == expected_prev:
                streak_count += 1
                current_check = dates[i]
            else:
                break
        current_streak = streak_count

    return {
        "dates": [d.strftime("%Y-%m-%d") for d in dates],
        "current_streak": current_streak
    }
