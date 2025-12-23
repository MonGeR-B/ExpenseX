# Backend Production Deployment Guide

## Prerequisites
- PostgreSQL database (production)
- Platform account (Render, Railway, or Heroku)

## Environment Variables (Set in platform dashboard)

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
DIRECT_URL=postgresql://user:password@host:5432/dbname  # Optional for Alembic
```

## Deployment Steps

### Option 1: Render.com (Recommended)

1. **Create New Web Service**
   - Connect GitHub repository
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SECRET_KEY`: Generate with: `openssl rand -hex 32`

3. **Deploy**
   - Render auto-deploys on git push
   - Health check endpoint: `GET /`

### Option 2: Railway.app

1. **New Project → Deploy from GitHub**
2. **Set Environment Variables** (same as above)
3. **Configure**:
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Railway provides public URL automatically

### Option 3: Heroku

```bash
heroku create expensex-backend
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
git subtree push --prefix backend heroku main
```

## Database Migrations

If using Alembic (recommended for production):

```bash
# Generate migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## Health Checks

Your backend should respond at:
- `https://your-backend.onrender.com/` → {"message": "ExpenseX API"}
- `https://your-backend.onrender.com/docs` → Swagger UI

## CORS Configuration

Ensure `app/main.py` has production origins:

```python
origins = [
    "https://your-web-app.vercel.app",
    "exp://",  # Expo Go
    # Add your production domains
]
```

## Post-Deployment Checklist

- [ ] Backend deployed and accessible via HTTPS
- [ ] Database connected and migrations applied
- [ ] Health check endpoint responding
- [ ] CORS configured for web and mobile
- [ ] Update mobile `.env`:
  ```bash
  EXPO_PUBLIC_API_URL=https://expensex-backend.onrender.com/api
  ```
- [ ] Update web environment variables with backend URL
