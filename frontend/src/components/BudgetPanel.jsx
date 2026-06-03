/**
 * BudgetPanel.jsx
 * Lets the user set a monthly spending limit per category.
 * Budgets are persisted to localStorage so they survive page refreshes.
 *
 * Visual states:
 *  ─ Normal  : category-accent coloured bar
 *  ─ Near    : amber bar + "NEAR LIMIT" badge  (≥ 80 % of budget)
 *  ─ Over    : red bar + glowing shadow + "OVER" badge + over-amount text
 */

import { useState } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

const CAT_COLOR = {
  Food:          '#f59e0b',
  Transport:     '#14b8a6',
  Bills:         '#3b82f6',
  Entertainment: '#ec4899',
  Other:         '#8b5cf6',
};

const STORAGE_KEY = 'expense-tracker-budgets';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

function loadBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistBudgets(budgets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch {
    /* localStorage may be blocked in some contexts — fail silently */
  }
}

// ─── Sub-component: single category row ──────────────────────────────────────

function BudgetRow({ category, spent, budget, onEdit, onClear, isEditing, inputValue, onInputChange, onInputKeyDown, onInputBlur }) {
  const hasBudget = budget !== undefined && budget > 0;
  const pct       = hasBudget ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver    = hasBudget && spent > budget;
  const isNear    = hasBudget && !isOver && pct >= 80;

  // Pick bar colour based on state
  const barColor  = isOver ? '#ef4444' : isNear ? '#f59e0b' : CAT_COLOR[category];

  return (
    <div>
      {/* ── Category label row ── */}
      <div className="flex items-center justify-between mb-1.5 gap-2">

        {/* Left: dot + name + status badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: CAT_COLOR[category] }}
          />
          <span className="text-sm font-medium text-gray-200 truncate">{category}</span>
          {isOver && (
            <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/25 px-1.5 py-0.5 rounded-full shrink-0">
              OVER
            </span>
          )}
          {isNear && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-full shrink-0">
              NEAR LIMIT
            </span>
          )}
        </div>

        {/* Right: spent / budget figure + edit controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditing ? (
            /* Inline budget input */
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-xs">₹</span>
              <input
                id={`budget-input-${category}`}
                type="number"
                min="1"
                step="100"
                placeholder="e.g. 5000"
                value={inputValue}
                autoFocus
                onChange={onInputChange}
                onKeyDown={onInputKeyDown}
                onBlur={onInputBlur}
                className="input-field py-0.5 px-2 w-24 text-sm text-right"
              />
            </div>
          ) : (
            <>
              <span className="text-xs text-gray-400 tabular-nums">
                {fmt(spent)}
                {hasBudget && (
                  <span className={isOver ? ' text-red-400' : ' text-gray-600'}>
                    {' '}/ {fmt(budget)}
                  </span>
                )}
              </span>
              {/* Edit / set-budget button */}
              <button
                id={`budget-edit-${category}`}
                onClick={onEdit}
                className="text-gray-600 hover:text-violet-400 transition-colors text-sm leading-none"
                title={hasBudget ? 'Edit budget' : 'Set budget'}
                aria-label={`Set budget for ${category}`}
              >
                {hasBudget ? '✏️' : '＋'}
              </button>
              {/* Remove budget button */}
              {hasBudget && (
                <button
                  id={`budget-clear-${category}`}
                  onClick={onClear}
                  className="text-gray-700 hover:text-red-400 transition-colors text-xs leading-none"
                  title={`Remove ${category} budget`}
                  aria-label={`Remove budget for ${category}`}
                >
                  ✕
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div
        className="h-2 w-full rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category} budget usage`}
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        {hasBudget ? (
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: barColor,
              boxShadow: isOver ? `0 0 10px ${barColor}99` : undefined,
            }}
          />
        ) : (
          /* No budget set — just show a dim full bar to indicate there IS spending */
          spent > 0 && (
            <div
              className="h-full rounded-full opacity-20"
              style={{ width: '100%', background: CAT_COLOR[category] }}
            />
          )
        )}
      </div>

      {/* ── Remaining / over text ── */}
      {hasBudget && (
        <p className={`text-[11px] mt-1 ${isOver ? 'text-red-400 font-medium' : 'text-gray-600'}`}>
          {isOver
            ? `⚠ ${fmt(spent - budget)} over budget`
            : `${fmt(budget - spent)} remaining`}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BudgetPanel({ totalPerCategory }) {
  const [budgets,     setBudgets]     = useState(loadBudgets);
  const [editingCat,  setEditingCat]  = useState(null);   // category being edited
  const [inputValue,  setInputValue]  = useState('');

  // ── Edit lifecycle ────────────────────────────────────────────────────────

  const startEdit = (category) => {
    setEditingCat(category);
    setInputValue(budgets[category] !== undefined ? String(budgets[category]) : '');
  };

  const commitEdit = (category) => {
    const val = parseFloat(inputValue);
    const updated = { ...budgets };
    if (!isNaN(val) && val > 0) {
      updated[category] = val;
    } else {
      delete updated[category]; // treat empty / zero / negative as "remove budget"
    }
    setBudgets(updated);
    persistBudgets(updated);
    setEditingCat(null);
    setInputValue('');
  };

  const clearBudget = (category) => {
    const updated = { ...budgets };
    delete updated[category];
    setBudgets(updated);
    persistBudgets(updated);
  };

  const handleKeyDown = (e, category) => {
    if (e.key === 'Enter')  commitEdit(category);
    if (e.key === 'Escape') { setEditingCat(null); setInputValue(''); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="glass-card p-5">
      <h3 className="section-title">🎯 Category Budgets</h3>
      <p className="text-xs text-gray-500 -mt-2 mb-4">
        Set a monthly limit per category. Click <strong className="text-gray-400">＋</strong> to add or <strong className="text-gray-400">✏️</strong> to edit.
        Saved in your browser automatically.
      </p>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <BudgetRow
            key={cat}
            category={cat}
            spent={totalPerCategory?.[cat] ?? 0}
            budget={budgets[cat]}
            isEditing={editingCat === cat}
            inputValue={inputValue}
            onEdit={() => startEdit(cat)}
            onClear={() => clearBudget(cat)}
            onInputChange={(e) => setInputValue(e.target.value)}
            onInputKeyDown={(e) => handleKeyDown(e, cat)}
            onInputBlur={() => commitEdit(cat)}
          />
        ))}
      </div>
    </div>
  );
}

export default BudgetPanel;
