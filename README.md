# 💰 Mini Expense Tracker

## Project Title & Brief Description

**Exercise chosen: Mini Expense Tracker — Full-Stack CRUD Web Application**

This project is a personal finance tracker built as a monorepo with a Node.js/Express REST backend and a React (Vite) + Tailwind CSS frontend. Users can add, edit, delete, and filter expenses by category and date range. The backend validates all inputs, persists data to a local JSON file (no database required), and computes server-side summary metrics — monthly total, per-category totals, and the single highest expense. The frontend renders a live dashboard with a summary panel, an SVG-based category breakdown chart, a category budget tracker with colour-coded progress bars, and a CSV export for the currently filtered view.

---

## Live Demo Links

| Service | URL |
|---|---|
| Frontend | [https://expense-tracker-eight-beige-55.vercel.app](https://expense-tracker-eight-beige-55.vercel.app) |
| Backend API | [https://expense-tracker-2zfb.onrender.com/api](https://expense-tracker-2zfb.onrender.com/api) |

---

## Tech Stack

| Technology | Role | Why chosen |
|---|---|---|
| **Node.js 18+** | Backend runtime | Native ES module support (`"type": "module"`) with no transpilation step needed |
| **Express 4** | HTTP framework | Minimal surface area, straightforward middleware chain, widely understood |
| **`uuid` v9** | ID generation | Collision-resistant UUIDs for expense records without a database sequence |
| **`fs` (built-in)** | Data persistence | Zero-dependency JSON file store — sufficient for a local single-user app |
| **React 18** | UI library | Concurrent rendering, hooks API, huge ecosystem; no class components needed |
| **Vite 5** | Frontend build tool | Sub-second HMR, native ES modules in dev, built-in dev proxy for `/api/*` → Express |
| **Tailwind CSS v3** | Styling | Utility-first with a PostCSS pipeline for full tree-shaking; custom design tokens via `tailwind.config.js` |
| **Axios** | HTTP client | Interceptors, automatic JSON parsing, clean error objects with `error.response.data` |
| **SVG (hand-written)** | Data visualisation | Zero-dependency horizontal bar chart; avoids shipping a charting library for a single chart |
| **`localStorage`** | Budget persistence | Stores per-category budget limits client-side; no backend changes required |

---

## How to Run Locally

> **Assumption:** Node.js v18+ and npm v9+ are installed. No other global tools are required.

### Step 1 — Clone or extract the project

```bash
# If using git
git clone <repo-url>
cd project-1

# Or just cd into the extracted folder
cd project-1
```

### Step 2 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 3 — Install frontend dependencies

Open a **second terminal**, then:

```bash
cd frontend
npm install
```

### Step 4 — Start the backend

In the **first terminal** (inside `backend/`):

```bash
npm run dev
```

Expected output:
```
✅  Expense Tracker API running → http://localhost:3001
    Endpoints: /api/expenses  |  /api/expenses/summary
```

> `backend/data/expenses.json` is created automatically on first run.  
> All data persists across backend restarts.

### Step 5 — Start the frontend

In the **second terminal** (inside `frontend/`):

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

> If port 5173 is taken, Vite auto-increments (5174, 5175 …). Use whatever URL is printed.

### Step 6 — Open the app

Visit **http://localhost:5173** in your browser.

---

## API Documentation

**Base URL:** `https://expense-tracker-2zfb.onrender.com/api`

All request bodies and responses are JSON. All mutating routes (`POST`, `PUT`) run through the validation middleware before the controller executes.

---

### `GET /expenses`

Returns all expenses sorted by date (newest first). Supports optional query-string filters.

**Query parameters**

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter to one category: `Food` `Transport` `Bills` `Entertainment` `Other` |
| `from` | `YYYY-MM-DD` | Include only expenses on or after this date |
| `to` | `YYYY-MM-DD` | Include only expenses on or before this date |

**Response `200 OK`**
```json
[
  {
    "id": "02c33fdb-a985-4bf2-bfaf-c4f20bc3899f",
    "amount": 1000,
    "date": "2026-06-02",
    "category": "Transport",
    "description": "Monthly bus pass",
    "createdAt": "2026-06-02T08:00:00.000Z"
  }
]
```

---

### `POST /expenses`

Creates a new expense. Validated before saving.

**Request body**
```json
{
  "amount": 499.00,
  "date": "2026-06-03",
  "category": "Food",
  "description": "Lunch at café"
}
```

| Field | Type | Required | Rules |
|---|---|---|---|
| `amount` | number | ✅ | Must be a finite positive number |
| `date` | `YYYY-MM-DD` string | ✅ | Must be a valid date; must not be in the future |
| `category` | string | ✅ | One of: `Food`, `Transport`, `Bills`, `Entertainment`, `Other` |
| `description` | string | ❌ | Max 200 characters |

**Response `201 Created`**
```json
{
  "id": "a1b2c3d4-...",
  "amount": 499,
  "date": "2026-06-03",
  "category": "Food",
  "description": "Lunch at café",
  "createdAt": "2026-06-03T14:22:00.000Z"
}
```

**Response `400 Bad Request`** (validation failure)
```json
{
  "errors": [
    "amount must be a positive number",
    "date must not be in the future"
  ]
}
```

---

### `PUT /expenses/:id`

Updates an existing expense. Same validation rules as `POST`.

**URL parameter:** `id` — UUID of the expense to update.

**Request body** — same shape as `POST /expenses`

**Response `200 OK`** — the updated expense object (same shape as `POST` response)

**Response `404 Not Found`**
```json
{ "error": "Expense with id 'xyz' not found" }
```

---

### `DELETE /expenses/:id`

Deletes an expense permanently.

**URL parameter:** `id` — UUID of the expense to delete.

**Response `200 OK`**
```json
{
  "message": "Expense deleted successfully",
  "expense": { "id": "...", "amount": 499, "date": "2026-06-03", "category": "Food", "description": "Lunch at café", "createdAt": "..." }
}
```

**Response `404 Not Found`**
```json
{ "error": "Expense with id 'xyz' not found" }
```

---

### `GET /expenses/summary`

Returns server-computed metrics across all stored expenses.

**Response `200 OK`**
```json
{
  "totalThisMonth": 3400,
  "totalPerCategory": {
    "Transport": 2200,
    "Entertainment": 1200
  },
  "highestExpense": {
    "id": "999ce94e-...",
    "amount": 1200,
    "date": "2026-06-03",
    "category": "Transport",
    "description": "",
    "createdAt": "2026-06-03T14:02:03.127Z"
  }
}
```

| Field | Description |
|---|---|
| `totalThisMonth` | Sum of all expense amounts in the current calendar month |
| `totalPerCategory` | Object mapping each category present in data to its all-time total |
| `highestExpense` | The full expense object with the largest `amount` value |

---

### `GET /health`

Smoke-test endpoint.

**Response `200 OK`**
```json
{ "status": "ok" }
```

---

## Project Structure

```
project-1/
│
├── README.md
│
├── backend/                        # Express REST API
│   ├── data/
│   │   └── expenses.json           # JSON flat-file data store (auto-created)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── expenseController.js  # Route handler logic (get, create, update, delete, summary)
│   │   ├── middleware/
│   │   │   └── validateExpense.js    # Amount / date / category validation middleware
│   │   ├── routes/
│   │   │   └── expenseRoutes.js      # Express Router — wires URLs to controllers
│   │   └── utils/
│   │       └── fileStore.js          # readExpenses() / writeExpenses() helpers
│   ├── server.js                   # App entry point — middleware, routes, error handler
│   └── package.json
│
└── frontend/                       # React + Vite + Tailwind
    ├── index.html                  # HTML shell with SEO meta and Inter font
    ├── vite.config.js              # Vite config + /api proxy → port 3001
    ├── tailwind.config.js          # Custom colour palette, keyframes, font
    ├── postcss.config.js           # Tailwind + Autoprefixer
    └── src/
        ├── main.jsx                # React 18 root mount
        ├── App.jsx                 # Root component — layout, edit state, delete confirm
        ├── index.css               # Tailwind layers + reusable glass-card / btn-* classes
        ├── api/
        │   └── expenseApi.js       # Axios wrapper — one export per endpoint
        ├── hooks/
        │   └── useExpenses.js      # Central state hook — expenses, summary, filters, mutations
        ├── utils/
        │   └── exportCsv.js        # RFC-4180 CSV serialiser + browser download trigger
        └── components/
            ├── SummaryPanel.jsx    # Monthly total, per-category pills, highest expense callout
            ├── ExpenseForm.jsx     # Add / edit form with real-time inline validation
            ├── ExpenseTable.jsx    # Sortable table with hover-reveal edit / delete actions
            ├── FilterBar.jsx       # Category dropdown + date-range pickers with active tags
            ├── CategoryChart.jsx   # Pure SVG horizontal bar chart — zero chart libraries
            ├── BudgetPanel.jsx     # Per-category budget input + colour-coded progress bars
            ├── ExportButton.jsx    # CSV download button with "Exported!" flash confirmation
            └── ErrorBoundary.jsx   # Class-based render-error fallback with reset button
```

---

## Next Steps

### What was intentionally omitted

- **Database** — data is stored in a flat JSON file. This is intentional for local-only use (no setup required) but would not scale or survive a server restart in a cloud environment.
- **Authentication** — there is no login. The API is open to anyone on the same network.
- **Pagination** — all expenses are returned in a single response. This is fine for hundreds of records but would break for tens of thousands.
- **Automated tests** — no unit or integration tests exist. This was the largest deliberate trade-off given the time available.
- **Recurring expenses** — there is no concept of a repeating expense (e.g. a monthly subscription).

### What I would build next

1. **Migrate to SQLite** (`better-sqlite3`) — atomic writes, proper concurrent access, and efficient `BETWEEN` queries for date ranges without loading all records into memory.
2. **Add a test suite** — Jest + Supertest for backend endpoint and validation tests; Vitest + React Testing Library for component and hook tests; Playwright for a smoke-test E2E flow (add → filter → export).
3. **React Query (TanStack Query)** — replace the hand-rolled `useExpenses` hook with proper caching, background refetch, and optimistic mutation support.
4. **Root workspace script** — a top-level `package.json` using `concurrently` so `npm run dev` from the project root starts both servers in one command.
5. **Sync budgets to the backend** — currently stored only in `localStorage`; a `budgets` table would make them available across devices and browsers.
6. **JWT authentication** — scope expenses to individual user accounts.
7. **Monthly trend chart** — a second SVG chart showing total spending over the last 6 months to complement the per-category breakdown.
8. **Recurring expense support** — flag an expense as recurring and have the backend auto-insert it on the first of each month.
