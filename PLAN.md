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

### Phase 0 – Repo & Skeletons [COMPLETE]
- [x] Create directory structure.
- [x] Setup `PLAN.md`.

### Phase 1 – Backend Core (Auth + Expenses) [COMPLETE]
- [x] `pyproject.toml` dependencies.
- [x] DB Setup (SQLAlchemy + Alembic).
- [x] Models (User, Category, Expense).
- [x] Routes (Auth, Expenses).

### Phase 2 – Web App Setup + Static Dashboard [COMPLETE]
- [x] Initialize Next.js app (`npx create-next-app`).
- [x] Install `shadcn/ui` and dependencies.
- [x] Build static dashboard layout.

### Phase 3 – Web Auth + Wiring [COMPLETE]
- [x] Setup API Client (Axios + Interceptors).
- [x] Implement Auth State Management (Zustand).
- [x] Create Login/Register Pages.
- [x] Implement Route Protection (Middleware).

### Phase 4 – Mobile App [COMPLETE]
- [x] Init Expo Project & Setup Auth.
- [x] Build Screens (Login, Register, Dashboard).
- [x] Verify Real Device Data Flow.

### Phase 5 – Mobile Rescue Mission [COMPLETE]
- [x] Clean Install & Configuration Fixes.

### Phase 6 – Core Features (Categories & Enhanced Expenses) [COMPLETE]
- [x] Backend: Category Model & CRUD.
- [x] Web: Category Manager & UI Polish.
- [x] Web: Expense Management (Edit/Delete/Filter/Pagination).

### Phase 7 – Analytics & Budgets [COMPLETE]
- [x] API: Stats Endpoints (Daily/Monthly/Yearly).
- [x] Web: Charts (Pie/Bar) & Insights.
- [x] Budgets: Backend Model & API.
- [x] Web: Budget Progress Bars & Alerts.

### Phase 8 – Polish & Production Ready [COMPLETE]
- [x] Data Tools (Import/Export).
- [x] UI/UX Refinement (Toasts, Space Theme, Glassmorphism).
- [x] Auth Polish (Error Handling).

### Phase 9 – "Pastel Pro" Layout & Hero Pattern [COMPLETE]
- [x] Redesign Sidebar & Topbar (Gradient/Border).
- [x] Apply Hero Pattern to RecentTransactions & Budgets.

### Phase 10 – "LuckyJob" Dark Navigation Theme [COMPLETE]
- [x] Implement Dark Sidebar/Topbar (#111).
- [x] Verify Dark Nav + Light Content Mix.

### Phase 11 – Dark Mode Refinements [COMPLETE]
- [x] Fix Shadows & Visibility.
- [x] Set True Black (#000) Background.
- [x] Verify UI Polish.

### Phase 12 – Route Restoration & Budget Fixes [COMPLETE]
- [x] Restore `/categories`, `/transactions`, `/reports`.
- [x] Debug Data Loading Failures.

### Phase 13 – Hero Card Redesign [COMPLETE]
- [x] Add `Outfit` Font.
- [x] Implement 3D Pinned Card Component.
- [x] Apply "Designer's Toolkit" Aesthetics.

### Phase 14 – Global Design Propagation [COMPLETE]
- [x] Redesign Budgets, Categories, Settings with Pinned Cards.
- [x] Verify All Pages Design.

### Phase 15 – Final Polish & Budget Fixes [COMPLETE]
- [x] Dashboard: Customize Heading & Hook.
- [x] Clean Up Pins (Transactions/Reports).
- [x] Fix "Internal Server Error" on Budgets (Pydantic V2).

### Phase 16 – Budget Type Fix & Final Designs [COMPLETE]
- [x] Fix Decimal/Float Casting Bug.
- [x] Style Category Button.
- [x] Verify Reports Pin Removal.

### Phase 17 – Auth & Debugging [COMPLETE]
- [x] Fix 401 Unauthorized Loop (Auto Redirect).
- [x] Clean up Debug Logs & Temporary Files.

## 7. Rules
1. If it’s not in `PLAN.md`, it doesn’t exist.
2. Update this file before adding new features.
3. No stack changes without updating Section 0.
4. Finish each phase before moving on.

