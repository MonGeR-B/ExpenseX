# app/schemas/stats.py
from datetime import date
from pydantic import BaseModel


class SummaryStats(BaseModel):
    period: str  # "month" or "year"
    year: int
    month: int | None = None
    total_spent: float
    avg_per_day: float
    transactions_count: int
    top_category: str | None = None
    top_category_amount: float | None = None


class MonthlyPoint(BaseModel):
    month: int  # 1-12
    total_amount: float


class MonthlyStats(BaseModel):
    year: int
    points: list[MonthlyPoint]


class DailyPoint(BaseModel):
    day: int # 1-31
    date: date
    total_amount: float


class DailyStats(BaseModel):
    year: int
    month: int
    points: list[DailyPoint]


class CategoryPoint(BaseModel):
    category_id: int | None
    category_name: str | None
    total_amount: float


class CategoryStats(BaseModel):
    year: int
    month: int | None = None
    categories: list[CategoryPoint]
