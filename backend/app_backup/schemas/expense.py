from datetime import date, datetime
from pydantic import BaseModel, Field


class ExpenseBase(BaseModel):
    date: date
    amount: float = Field(gt=0)
    category_id: int | None = None
    description: str | None = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseRead(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
