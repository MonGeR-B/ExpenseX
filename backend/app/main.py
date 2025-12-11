from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import Base, engine
from app.api import auth as auth_router
from app.api import expenses as expenses_router
from app.api.deps import get_current_user
from app.api import stats as stats_router
from app.api import categories as categories_router
from app.api import budgets as budgets_router
from app.api import data as data_router

settings = get_settings()

# Create tables for now (later: Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS: allow local web dev for now
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(expenses_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(stats_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(categories_router.router, prefix=f"{settings.API_V1_PREFIX}/categories", tags=["categories"])
app.include_router(budgets_router.router, prefix=settings.API_V1_PREFIX)
app.include_router(data_router.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {"status": "ok", "project": settings.PROJECT_NAME}
