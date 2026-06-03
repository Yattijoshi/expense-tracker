/**
 * expenseController.js
 * Route handler functions for all /api/expenses endpoints.
 * Each function reads from / writes to the JSON file store.
 */

import { v4 as uuidv4 } from 'uuid';
import { readExpenses, writeExpenses } from '../utils/fileStore.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Sort expenses newest-first by date. */
const sortNewestFirst = (arr) =>
  [...arr].sort((a, b) => new Date(b.date) - new Date(a.date));

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * GET /api/expenses
 * Returns all expenses sorted by date (newest first).
 * Supports optional query filters: category, from (YYYY-MM-DD), to (YYYY-MM-DD).
 */
export function getAllExpenses(req, res) {
  try {
    let expenses = readExpenses();
    const { category, from, to } = req.query;

    if (category) {
      expenses = expenses.filter((e) => e.category === category);
    }

    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      expenses = expenses.filter((e) => new Date(e.date) >= fromDate);
    }

    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      expenses = expenses.filter((e) => new Date(e.date) <= toDate);
    }

    res.json(sortNewestFirst(expenses));
  } catch (err) {
    console.error('[GET /expenses]', err);
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
}

/**
 * GET /api/expenses/summary
 * Computes and returns:
 *  - totalThisMonth   : sum of all expenses in the current calendar month
 *  - totalPerCategory : { Food: n, Transport: n, ... } accumulated over all time
 *  - highestExpense   : the single expense object with the largest amount
 */
export function getSummary(req, res) {
  try {
    const expenses = readExpenses();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total spent this month
    const monthlyExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Per-category totals (across all time)
    const totalPerCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Highest single expense
    const highestExpense =
      expenses.length > 0
        ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
        : null;

    res.json({ totalThisMonth, totalPerCategory, highestExpense });
  } catch (err) {
    console.error('[GET /expenses/summary]', err);
    res.status(500).json({ error: 'Failed to compute summary' });
  }
}

/**
 * POST /api/expenses
 * Creates a new expense. Body has already been validated by middleware.
 */
export function createExpense(req, res) {
  try {
    const { amount, date, category, description } = req.body;
    const expenses = readExpenses();

    const newExpense = {
      id: uuidv4(),
      amount: Number(amount),
      date,
      category,
      description: description ? String(description).trim() : '',
      createdAt: new Date().toISOString(),
    };

    expenses.push(newExpense);
    writeExpenses(expenses);
    res.status(201).json(newExpense);
  } catch (err) {
    console.error('[POST /expenses]', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
}

/**
 * PUT /api/expenses/:id
 * Updates an existing expense. Body has already been validated by middleware.
 */
export function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const expenses = readExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Expense with id '${id}' not found` });
    }

    const { amount, date, category, description } = req.body;
    expenses[index] = {
      ...expenses[index],
      amount: Number(amount),
      date,
      category,
      description: description ? String(description).trim() : '',
      updatedAt: new Date().toISOString(),
    };

    writeExpenses(expenses);
    res.json(expenses[index]);
  } catch (err) {
    console.error('[PUT /expenses/:id]', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
}

/**
 * DELETE /api/expenses/:id
 * Removes an expense by its UUID.
 */
export function deleteExpense(req, res) {
  try {
    const { id } = req.params;
    const expenses = readExpenses();
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: `Expense with id '${id}' not found` });
    }

    const [deleted] = expenses.splice(index, 1);
    writeExpenses(expenses);
    res.json({ message: 'Expense deleted successfully', expense: deleted });
  } catch (err) {
    console.error('[DELETE /expenses/:id]', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
}
