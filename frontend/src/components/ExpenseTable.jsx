/**
 * ExpenseTable.jsx
 * Responsive list of expenses with category badges, edit/delete quick-actions
 * that fade in on row hover, and skeleton loading rows.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_STYLE = {
  Food:          { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.35)' },
  Transport:     { bg: 'rgba(20,184,166,0.15)', text: '#14b8a6', border: 'rgba(20,184,166,0.35)' },
  Bills:         { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.35)' },
  Entertainment: { bg: 'rgba(236,72,153,0.15)', text: '#ec4899', border: 'rgba(236,72,153,0.35)' },
  Other:         { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', border: 'rgba(139,92,246,0.35)' },
};

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[100px_110px_1fr_110px_90px] gap-4 px-5 py-4 border-b border-white/5 animate-pulse">
      {[70, 80, '60%', 60, 60].map((w, i) => (
        <div
          key={i}
          className="h-4 rounded bg-white/10"
          style={{ width: typeof w === 'number' ? w : w }}
        />
      ))}
    </div>
  );
}

function CategoryBadge({ category }) {
  const s = CAT_STYLE[category] || CAT_STYLE.Other;
  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}
    >
      {category}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function ExpenseTable({ expenses, loading, onEdit, onDelete }) {

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <TableHeader />
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="glass-card p-16 flex flex-col items-center justify-center text-center animate-fade-in">
        <span className="text-5xl mb-4 opacity-40">💸</span>
        <p className="text-gray-400 font-medium">No expenses found</p>
        <p className="text-gray-600 text-sm mt-1">
          Add one using the form, or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <TableHeader />
      <div className="divide-y divide-white/[0.06]">
        {expenses.map((exp) => (
          <ExpenseRow
            key={exp.id}
            expense={exp}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="px-5 py-3 border-t border-white/[0.06] flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {expenses.length} record{expenses.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-500">Sorted: newest first</span>
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="hidden sm:grid grid-cols-[100px_110px_1fr_110px_90px] gap-4 px-5 py-3 border-b border-white/10">
      {['Date', 'Category', 'Description', 'Amount', 'Actions'].map((h, i) => (
        <span
          key={h}
          className={`text-[11px] font-semibold text-gray-500 uppercase tracking-widest ${i >= 3 ? 'text-right' : ''}`}
        >
          {h}
        </span>
      ))}
    </div>
  );
}

function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <div className="group grid grid-cols-1 sm:grid-cols-[100px_110px_1fr_110px_90px] gap-2 sm:gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors duration-150">

      {/* Date */}
      <span className="text-gray-400 text-sm font-mono">
        {fmtDate(expense.date)}
      </span>

      {/* Category badge */}
      <span>
        <CategoryBadge category={expense.category} />
      </span>

      {/* Description */}
      <span className="text-gray-200 text-sm truncate max-w-xs">
        {expense.description || (
          <span className="text-gray-600 italic text-xs">No description</span>
        )}
      </span>

      {/* Amount */}
      <span className="text-right font-semibold text-white">
        {fmt(expense.amount)}
      </span>

      {/* Quick actions — fade in on hover */}
      <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        <button
          id={`edit-${expense.id}`}
          onClick={() => onEdit(expense)}
          className="btn-secondary px-2.5 py-1 text-xs"
          title="Edit expense"
          aria-label={`Edit expense: ${expense.description || expense.category}`}
        >
          ✏️
        </button>
        <button
          id={`delete-${expense.id}`}
          onClick={() => onDelete(expense.id)}
          className="btn-danger px-2.5 py-1 text-xs"
          title="Delete expense"
          aria-label={`Delete expense: ${expense.description || expense.category}`}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default ExpenseTable;
