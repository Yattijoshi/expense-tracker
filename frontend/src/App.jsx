/**
 * App.jsx
 * Root component that wires together all child components.
 * All data-fetching state lives in the useExpenses hook;
 * local UI state (which expense is being edited) lives here.
 */

import { useState } from 'react';
import { useExpenses } from './hooks/useExpenses.js';
import SummaryPanel   from './components/SummaryPanel.jsx';
import ExpenseForm    from './components/ExpenseForm.jsx';
import ExpenseTable   from './components/ExpenseTable.jsx';
import FilterBar      from './components/FilterBar.jsx';
import CategoryChart  from './components/CategoryChart.jsx';
import BudgetPanel    from './components/BudgetPanel.jsx';
import ExportButton   from './components/ExportButton.jsx';
import ErrorBoundary  from './components/ErrorBoundary.jsx';

function App() {
  const {
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
  } = useExpenses();

  const [editingExpense, setEditingExpense] = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Enter edit mode: populate the form and scroll to it. */
  const handleEditRequest = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => setEditingExpense(null);

  /** Called by ExpenseForm on valid submit — dispatches add or edit. */
  const handleFormSubmit = async (data) => {
    if (editingExpense) {
      await editExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      await addExpense(data);
    }
  };

  /** Confirm + delete. */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    await removeExpense(id);
    // If we were editing the deleted item, exit edit mode
    if (editingExpense?.id === id) setEditingExpense(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">

        {/* ── Sticky Header ── */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
                  Mini Expense Tracker
                </h1>
                <p className="text-[11px] text-gray-500 tracking-wide">
                  Track · Visualise · Control
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loading && (
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="spinner !w-3 !h-3" />
                  Loading…
                </span>
              )}
              <span className="text-xs text-gray-600 tabular-nums">
                {expenses.length} record{expenses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

          {/* API / network error banner */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 animate-fade-in">
              <span className="text-red-400 text-xl shrink-0">⚠️</span>
              <div>
                <p className="text-red-300 font-semibold text-sm">Backend unreachable</p>
                <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Summary Panel */}
          <SummaryPanel summary={summary} loading={summaryLoading} />

          {/* Two-column layout: Form+Chart | Filter+Table */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

            {/* Left column */}
            <div className="space-y-4">
              <ExpenseForm
                onSubmit={handleFormSubmit}
                editingExpense={editingExpense}
                onCancelEdit={handleCancelEdit}
              />
              {summary?.totalPerCategory && (
                <CategoryChart totalPerCategory={summary.totalPerCategory} />
              )}
              {/* Budget panel always visible — shows all 5 categories */}
              <BudgetPanel totalPerCategory={summary?.totalPerCategory ?? {}} />
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Filter bar + export button sit in the same row */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FilterBar filters={filters} onChange={applyFilters} />
                </div>
                <div className="pb-[1px]">
                  <ExportButton expenses={expenses} />
                </div>
              </div>
              <ExpenseTable
                expenses={expenses}
                loading={loading}
                onEdit={handleEditRequest}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-700">
          Mini Expense Tracker · {new Date().getFullYear()} · All data stored locally
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
