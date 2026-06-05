/**
 * expenseApi.js
 * Centralised Axios wrapper for all HTTP calls to the Express backend.
 * All functions return the parsed response data directly (not the Axios response object).
 * Errors are re-thrown so callers can handle them in try/catch or .catch().
 */

import axios from 'axios';

const api = axios.create({
  baseURL: 'https://expense-tracker-2zfb.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch all expenses, with optional query filters.
 * @param {{ category?: string, from?: string, to?: string }} filters
 */
export const fetchExpenses = (filters = {}) =>
  api.get('/expenses', { params: filters }).then((r) => r.data);

/**
 * Fetch server-computed summary metrics.
 */
export const fetchSummary = () =>
  api.get('/expenses/summary').then((r) => r.data);

/**
 * Create a new expense.
 * @param {{ amount: number, date: string, category: string, description?: string }} data
 */
export const createExpense = (data) =>
  api.post('/expenses', data).then((r) => r.data);

/**
 * Update an existing expense by id.
 * @param {string} id
 * @param {{ amount: number, date: string, category: string, description?: string }} data
 */
export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, data).then((r) => r.data);

/**
 * Delete an expense by id.
 * @param {string} id
 */
export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`).then((r) => r.data);
