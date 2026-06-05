/**
 * server.js
 * Application entry point. Bootstraps Express, registers global middleware,
 * mounts the expenses router, and starts the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import expenseRoutes from './src/routes/expenseRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://expense-tracker-eight-beige-55.vercel.app'
  ]
})); // allow Vite dev server
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/expenses', expenseRoutes);

// Health check — useful for quick smoke tests
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 catch-all for unknown API paths
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Expense Tracker API running → http://localhost:${PORT}`);
  console.log(`    Endpoints: /api/expenses  |  /api/expenses/summary`);
});
