/**
 * useExpenses.js
 * Central state-management hook for the entire application.
 * Owns all remote data (expenses list + summary) and exposes clean
 * mutation methods. Components stay stateless and purely presentational.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import * as api from '../api/expenseApi.js';

export const DEFAULT_FILTERS = { category: '', from: '', to: '' };

export function useExpenses() {
  const [expenses, setExpenses]           = useState([]);
  const [summary, setSummary]             = useState(null);
  const [filters, setFilters]             = useState(DEFAULT_FILTERS);
  const [loading, setLoading]             = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError]                 = useState(null);

  // Ref so async callbacks always read the latest filters without stale closure issues
  const filtersRef = useRef(DEFAULT_FILTERS);

  // ── Loaders ─────────────────────────────────────────────────────────────

  /** Fetch the expense list, applying whatever filters are active. */
  const loadExpenses = useCallback(async (activeFilters) => {
    const f = activeFilters !== undefined ? activeFilters : filtersRef.current;
    try {
      setLoading(true);
      setError(null);
      // Strip empty strings so they don't get sent as blank query params
      const params = Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== '')
      );
      const data = await api.fetchExpenses(params);
      setExpenses(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch the summary panel metrics (non-critical — errors are swallowed). */
  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await api.fetchSummary();
      setSummary(data);
    } catch {
      // Summary failure is non-fatal; just leave previous data intact
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // ── Initial load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadExpenses(DEFAULT_FILTERS);
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Refresh helper ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    await Promise.all([loadExpenses(), loadSummary()]);
  }, [loadExpenses, loadSummary]);

  // ── Public actions ──────────────────────────────────────────────────────

  /**
   * Apply a new set of query filters and re-fetch.
   * @param {{ category: string, from: string, to: string }} newFilters
   */
  const applyFilters = useCallback(
    (newFilters) => {
      filtersRef.current = newFilters;
      setFilters(newFilters);
      loadExpenses(newFilters);
    },
    [loadExpenses]
  );

  /**
   * Add a new expense then refresh both list and summary.
   * Throws on validation/server errors so the form can surface them.
   */
  const addExpense = useCallback(
    async (data) => {
      await api.createExpense(data);
      await refresh();
    },
    [refresh]
  );

  /**
   * Edit an existing expense then refresh.
   * Throws on validation/server errors so the form can surface them.
   */
  const editExpense = useCallback(
    async (id, data) => {
      await api.updateExpense(id, data);
      await refresh();
    },
    [refresh]
  );

  /**
   * Delete an expense by id then refresh.
   */
  const removeExpense = useCallback(
    async (id) => {
      await api.deleteExpense(id);
      await refresh();
    },
    [refresh]
  );

  return {
    expenses,
    summary,
    filters,
    loading,
    summaryLoading,
    error,
    applyFilters,
    addExpense,
    editExpense,
    removeExpense,
    reload: refresh,
  };
}
