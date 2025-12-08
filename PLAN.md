# ExpenseX – Master Plan

**Status**: DRAFT v1  
**Owner**: Baibhab  
**Goal**: Personal-first expense tracker that can later handle friends and small-scale users.  
**Non-goal**: VC clown show, pointless features, stack hopping.

---

## 0. Stack (LOCKED – DO NOT CHANGE)

**Backend**
- Language: Python
- Framework: FastAPI
- DB (local dev): PostgreSQL (via Docker/Supabase)
- ORM: SQLAlchemy + Alembic
- Auth: JWT (email + password)

**Web**
- Framework: Next.js (App Router) with TypeScript
- Styling: Tailwind CSS
- Component lib: shadcn/ui
- Charts: Recharts

**Mobile**
- Framework: Expo (React Native, TypeScript)
- Navigation: Expo Router
- Styling: Tailwind-ish (NativeWind) or simple StyleSheet

If we ever change any of this, the change must be written **here** first.

---

## 1. Monorepo Layout

Root folder: `expensex/`

```text
expensex/
├─ PLAN.md                 # This file
├─ backend/                # FastAPI API
│  ├─ app/
│  │  ├─ api/              # Routers
│  │  │  ├─ auth.py
│  │  │  ├─ expenses.py
│  │  │  └─ stats.py
│  │  ├─ core/             # Config, security, deps
│  │  │  ├─ config.py
│  │  │  ├─ security.py
│  │  │  └─ database.py
│  │  ├─ models/           # SQLAlchemy models
│  │  │  ├─ user.py
│  │  │  ├─ category.py
│  │  │  └─ expense.py
│  │  ├─ schemas/          # Pydantic schemas
│  │  │  ├─ auth.py
│  │  │  ├─ expense.py
│  │  │  └─ stats.py
│  │  ├─ services/         # Business logic
│  │  └─ main.py           # FastAPI app entry
│  ├─ alembic/             # Migrations
│  ├─ pyproject.toml       # Backend deps
│  └─ README.md
│
├─ web/                    # Next.js web app
│  ├─ app/
│  ├─ src/
│  ├─ package.json
│  └─ tailwind.config.ts
│
├─ mobile/                 # Expo app (later phase)
│  ├─ app/
│  ├─ src/
│  ├─ package.json
│  └─ app.json
│
└─ prototype_streamlit/    # Old Streamlit version (lab only)
```

## 2. Data Model (v1)

### 2.1 Entities

**User**
- `id` (UUID or int)
- `email` (unique)
- `password_hash`
- `created_at`
- `updated_at`

**Category**
- `id`
- `user_id` (FK → User)
- `name` (e.g. Food, Rent, Travel)
- `color` (optional HEX string for UI; default generated)
- `created_at`

**Expense**
- `id`
- `user_id` (FK → User)
- `category_id` (FK → Category, nullable allowed = “Uncategorized”)
- `date` (date only)
- `amount` (numeric, > 0)
- `description` (text, optional)
- `created_at`

No other entities until v1 is stable (no accounts, no budgets yet).

## 3. API Specification (v1)

Base: `/api`

### 3.1 Auth
- **POST** `/api/auth/register`
  - Body: `{ email, password }`
  - Creates user, returns basic profile
- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Returns `{ access_token, token_type }`
- **GET** `/api/auth/me`
  - Auth: Bearer JWT
  - Returns current user profile

### 3.2 Categories
- **GET** `/api/categories`
- **POST** `/api/categories`
  - Body: `{ name, color? }`

### 3.3 Expenses
All require auth.

- **GET** `/api/expenses`
  - Query: `from?`, `to?`, `category_id?`, `limit?`, `offset?`
- **POST** `/api/expenses`
  - Body: `{ date, amount, category_id?, description? }`
- **PUT** `/api/expenses/{id}`
- **DELETE** `/api/expenses/{id}`

### 3.4 Stats
- **GET** `/api/stats/summary?year=YYYY&month=MM?`
- **GET** `/api/stats/monthly?year=YYYY`
- **GET** `/api/stats/categories?year=YYYY&month?`

## 4. Web App – UX & Layout (v1)

Target: Clean fintech look.

### 4.1 Pages
- `/login`: Email + password form
- `/register`: Email + password
- `/dashboard`: Protected. Main cards + charts + recent expenses.

### 4.2 Dashboard Layout
1. **Header**: Greeting, Period filter.
2. **Top Cards**: Total Balance, Total Spent, Summary/Quick Stats.
3. **Middle**: Line chart (spending over time), Donut chart (category).
4. **Bottom**: Recent expenses table.
5. **Action**: "Add Expense" button (Modal with date, amount, category, description).

**UI Style**: consistent radius (e.g. 16px), soft background, 1–2 accent colors.

## 5. Mobile App – Scope (v1, later phase)
- Login / Register
- Home: Balance card, Add expense button, Recent expenses list, Mini chart.

## 6. Implementation Phases (Sequential)

### Phase 0 – Repo & Skeletons
- [x] Create directory structure.
- [x] Setup `PLAN.md`.
- [ ] Move/Archive old prototype (if exists).

### Phase 1 – Backend Core (Auth + Expenses)
- [x] `pyproject.toml` dependencies (Done).
- [x] DB Setup (SQLAlchemy + Alembic).
- [x] Models (User, Category, Expense).
- [x] Routes (Auth, Expenses).

## Phase 2 – Web App Setup + Static Dashboard

Goal:  
A **beautiful, static dashboard** at `/dashboard` using Next.js + Tailwind.  
No auth. No API calls. Just layout + fake data that looks like a real fintech app.

We do NOT touch mobile or backend wiring in this phase.

---

### 2.0 Create Next.js app

From `expensex/`:

```bash
cd expensex
npx create-next-app@latest web \
  --typescript \
  --eslint \
  --tailwind \
  --src-dir false \
  --app \
  --import-alias "@/*"


**Phase 3 – Web Auth + Wiring**
  - [ ] Login/Register.
  - [ ] API integration.

**Phase 4 – Mobile MVP**
  - [ ] Expo setup.
  - [ ] Login + Home screen.

## 7. Rules
1. If it’s not in `PLAN.md`, it doesn’t exist.
2. Update this file before adding new features.
3. No stack changes without updating Section 0.
4. Finish each phase before moving on.

**Phase 4 – Stats API + Real Charts**

Goal:
Backend exposes stats endpoints and the dashboard charts use REAL data instead of mocks.

Required:
- Backend:
  - `GET /api/stats/summary`
  - `GET /api/stats/monthly`
  - `GET /api/stats/categories`
- Frontend:
  - `CardsAndCharts` fetches from those endpoints.
  - KPI cards reflect actual user data.
  - Monthly chart and category pie chart use real aggregates.

Only after this: Mobile phase.

