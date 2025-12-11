from datetime import date
from pydantic import BaseModel
from typing import Optional
from app.schemas.category import Category

class BudgetBase(BaseModel):
    amount: float
    month: date
    category_id: Optional[int] = None

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Optional[float] = None

class BudgetRead(BudgetBase):
    id: int
    user_id: int
    category: Optional[Category] = None
    
    # Computed fields
    spent: float = 0.0
    percentage: float = 0.0

    class Config:
        from_attributes = True
