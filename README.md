# Money Mate — Personal Finance Manager for Students

Money Mate is a full-stack personal finance app focused on student-friendly money habits: tracking income/expenses, planning monthly budgets, analyzing trends, splitting shared bills, and managing savings goals. The project ships with a React + Vite frontend and two backend shapes:

- **Serverless API (`/api`)** for Vercel deployment.
- **Express API (`/server`)** for traditional local/server runtime.

## What this repository includes

### Product capabilities

- **Transaction management (CRUD)** with filter + pagination support.
- **Smart category suggestion** (rule-based keyword matching).
- **Monthly stats and insights** (income, expense, category mix, trends).
- **Budget planning** by month and category.
- **Bill splitting** with participant-level settlement status.
- **Savings goals** with progress tracking and add-funds flow.
- **PWA support** via service worker, manifest, and install prompt.

### Frontend stack

- React 18 + Vite
- React Router (single-page routing)
- Axios for API calls
- Recharts for analytics visualizations
- Framer Motion for UI motion
- React Hot Toast for notifications

### Backend stack

- Node.js + Express (in `/server`) for local API server
- Vercel serverless functions (in `/api`) for deployment
- MongoDB + Mongoose models

## Repository architecture

```text
.
├── api/                  # Vercel serverless API routes
├── client/               # React frontend (Vite)
├── lib/                  # Shared serverless helpers/models/utils
├── server/               # Express app with controllers/routes/models
├── vercel.json           # Vercel build + routing config
└── package.json          # Root metadata
```

### Important architectural note

There is intentional overlap between `server/*` and `api/*` + `lib/*`:

- `server/*` is the **Express implementation**.
- `api/*` + `lib/*` is the **serverless implementation**.

Both implement similar business logic, but endpoint coverage is not perfectly identical yet (for example, budget utilization exists in Express routes and is used by the frontend).

## How the app flows

1. The React app calls `/api/*` via a single Axios client (`client/src/utils/api.js`).
2. In local development:
   - Vite runs on `5173`.
   - `/api` calls are proxied to the Express server at `http://localhost:5000`.
3. In Vercel deployment:
   - Frontend and `/api` are served on the same origin.
   - `vercel.json` routes API paths to serverless functions.
4. MongoDB is accessed with Mongoose:
   - Serverless uses connection caching (`lib/db.js`).
   - Express uses its own DB bootstrap under `server/config/db.js`.

## Feature breakdown

### 1) Transactions

- Create, list, update, delete transactions.
- Filters by `type`, `category`, and date range.
- Pagination (`limit`, `page`).
- Auto-category assignment when category is empty or `Others`.

### 2) Analytics

- Monthly income/expense totals.
- Savings rate + balance.
- Category distribution.
- Daily trend and recent monthly trend.
- Generated spending insights from historical behavior.

### 3) Budgeting

- Monthly budget document by `YYYY-MM`.
- Category allocations + total budget.
- Utilization calculations (in Express routes/controller).
- Alerts for nearing/exceeding limits.

### 4) Split Bills

- Create bills with participants.
- Equal split calculation option.
- Mark participant as settled.
- Bill status transitions: `unsettled` → `partially` → `settled`.

### 5) Savings Goals

- Create and list goals.
- Add funds to a goal.
- Auto-mark completion at target amount.
- Delete goals.

### 6) PWA

- Web App Manifest (`client/public/manifest.json`).
- Service worker with:
  - cache-first strategy for static assets
  - network-first strategy for API requests
- Custom install banner (`InstallPrompt` component).

## API overview

> Base path: `/api`

### Transactions

- `GET /transactions`
- `POST /transactions`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /transactions/stats`
- `GET /transactions/suggest-category?description=...`

### Budget

- `GET /budget/:month`
- `PUT /budget/:month`
- `GET /budget/:month/utilization` *(implemented in Express routes; verify serverless parity before production use)*

### Bills

- `GET /bills`
- `POST /bills`
- `POST /bills/:id/settle`
- `DELETE /bills/:id`

### Goals

- `GET /goals`
- `POST /goals`
- `POST /goals/:id/add-funds`
- `DELETE /goals/:id`

### Health

- `GET /health`

## Data model summary

### Transaction

- `type`: `income | expense`
- `amount`: number
- `category`: `Food | Entertainment | Academics | Transportation | Utilities | Shopping | Income | Others`
- `description`: string
- `date`: date

### Budget

- `month`: `YYYY-MM`
- `totalBudget`: number
- `categories`: Food/Entertainment/Academics/Transportation/Utilities/Shopping/Others

### BillSplit

- `description`, `totalAmount`, `createdBy`, `date`, `status`
- `participants[]`: `{ name, amountOwed, isPaid, paidAt }`

### SavingsGoal

- `goalName`, `targetAmount`, `currentAmount`, `deadline`, `category`, `color`, `isCompleted`

## Getting started (local development)

### Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

### 1) Install dependencies

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2) Configure environment variables

Create `server/.env` (and set Vercel env vars for deployment):

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

### 3) Start backend (Express)

```bash
cd server
npm run dev
```

### 4) Start frontend

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

## Deployment notes (Vercel)

- Build command is defined in `vercel.json` as: `cd client && npm install && npm run build`.
- Output directory is `client/dist`.
- API routes are sourced from `/api/*` files.
- Ensure `MONGODB_URI` is configured in Vercel project settings.

## Known gaps and maintenance recommendations

1. **Endpoint parity between Express and serverless APIs**
   - Confirm every frontend-used route exists in both implementations.
2. **Manifest icon references**
   - `manifest.json` references `/icon-192.png` and `/icon-512.png`; ensure these files are added if PWA install quality matters.
3. **Localization/currency consistency**
   - UI currently uses INR formatting in many places; align with intended audience/region strategy.
4. **Testing setup**
   - Add automated unit/integration tests for controllers and critical frontend flows.
5. **Authentication and multi-user support**
   - Current data model defaults (e.g., `createdBy: "Me"`) indicate single-user assumptions.

## Suggested next improvements

- Add auth (JWT/session + user-scoped data).
- Add recurring transactions and recurring bills.
- Add export (CSV/PDF) and data backup features.
- Add tighter offline strategy (queued writes + conflict resolution).
- Add CI with linting/tests and pull-request checks.

---

If you want, I can also generate:

- a **system architecture diagram**,
- a **full API contract table** (request/response samples), and
- a **production hardening checklist** for this repository.
