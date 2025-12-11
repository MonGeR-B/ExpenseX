import csv
import io
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.expense import Expense
from app.models.category import Category
from datetime import datetime

router = APIRouter(prefix="/data", tags=["data"])

@router.get("/export")
def export_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch all expenses
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Date", "Amount", "Description", "Category"])
    
    for e in expenses:
        cat_name = e.category.name if e.category else "Uncategorized"
        writer.writerow([e.date, e.amount, e.description, cat_name])
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )

@router.post("/import")
async def import_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
        
    content = await file.read()
    decoded = content.decode("utf-8")
    io_string = io.StringIO(decoded)
    reader = csv.DictReader(io_string)
    
    # Cache categories to avoid DB hits
    categories = {c.name.lower(): c for c in db.query(Category).filter((Category.user_id == current_user.id) | (Category.user_id == None)).all()}
    
    count = 0
    try:
        for row in reader:
            # Expected cols: Date, Amount, Description, Category
            date_str = row.get("Date")
            amount_str = row.get("Amount")
            desc = row.get("Description", "")
            cat_name = row.get("Category", "Uncategorized")
            
            if not date_str or not amount_str:
                continue
                
            try:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                continue # Skip bad dates
                
            # Find or Create Category
            cat_obj = categories.get(cat_name.lower())
            if not cat_obj and cat_name:
                # Create new category if not exists
                cat_obj = Category(name=cat_name, user_id=current_user.id, color="#94a3b8", icon="📁")
                db.add(cat_obj)
                db.flush() # Get ID
                categories[cat_name.lower()] = cat_obj
                
            expense = Expense(
                user_id=current_user.id,
                date=date_obj,
                amount=float(amount_str),
                description=desc,
                category_id=cat_obj.id if cat_obj else None
            )
            db.add(expense)
            count += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
        
    return {"message": f"Successfully imported {count} expenses"}
