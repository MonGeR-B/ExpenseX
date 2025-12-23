import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.category import Category

class ExpenseBase(BaseModel):
    amount: float = Field(gt=0, le=999999999, description="Amount must be greater than 0 and less than 1 billion")
    description: Optional[str] = None
    date: datetime.date
    category_id: Optional[int] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0, le=999999999, description="Amount must be greater than 0 and less than 1 billion")
    description: Optional[str] = None
    date: Optional[datetime.date] = None
    category_id: Optional[int] = None

class ExpenseRead(ExpenseBase):
    id: int
    user_id: int
    category: Optional[Category] = None

    class Config:
        from_attributes = True
