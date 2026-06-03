/**
 * SummaryPanel.jsx
 * Displays the three server-computed metrics at the top of the dashboard:
 *  1. Total spent in the current calendar month
 *  2. Per-category totals (pill grid)
 *  3. Highest single expense callout
 */

/** Map each category to its accent colour. */
const CAT_COLOR = {
  Food:          { hex: '#f59e0b', tw: 'text-amber-400',  bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)'  },
  Transport:     { hex: '#14b8a6', tw: 'text-teal-400',   bg: 'rgba(20,184,166,0.15)',  border: 'rgba(20,184,166,0.3)'  },
  Bills:         { hex: '#3b82f6', tw: 'text-blue-400',   bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)'  },
  Entertainment: { hex: '#ec4899', tw: 'text-pink-400',   bg: 'rgba(236,72,153,0.15)',  border: 'rgba(236,72,153,0.3)'  },
  Other:         { hex: '#8b5cf6', tw: 'text-purple-400', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
};

/** Format a number as Indian Rupees. */
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

/** Format a date string into readable form. */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, icon, gradientFrom, gradientTo }) {
  return (
    <div className="glass-card p-5 relative overflow-hidden">
      {/* Decorative gradient wash */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      />
      <div className="relative z-10">
        <span className="text-2xl">{icon}</span>
        <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest mt-3">
          {label}
        </p>
        <p className="text-2xl font-bold text-white mt-1 truncate">{value}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="h-6 w-6 bg-white/10 rounded mb-3" />
      <div className="h-3 w-24 bg-white/10 rounded mb-2" />
      <div className="h-7 w-32 bg-white/10 rounded" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

function SummaryPanel({ summary, loading }) {
  if (loading) {
    return (
      <div className="space-y-4 mb-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const { totalThisMonth, totalPerCategory, highestExpense } = summary;
  const categoryCount = Object.keys(totalPerCategory).length;

  return (
    <div className="space-y-4 mb-6 animate-slide-up">
      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Spent This Month"
          value={fmt(totalThisMonth)}
          icon="📅"
          gradientFrom="#7c3aed"
          gradientTo="#9333ea"
        />
        <StatCard
          label="Highest Expense"
          value={highestExpense ? fmt(highestExpense.amount) : '—'}
          icon="🔝"
          gradientFrom="#ec4899"
          gradientTo="#f43f5e"
        />
        <StatCard
          label="Categories Active"
          value={categoryCount > 0 ? `${categoryCount} / 5` : '—'}
          icon="🗂️"
          gradientFrom="#14b8a6"
          gradientTo="#06b6d4"
        />
      </div>

      {/* ── Per-category breakdown ── */}
      {categoryCount > 0 && (
        <div className="glass-card p-5">
          <h3 className="section-title">💳 Spending by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(totalPerCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, total]) => {
                const c = CAT_COLOR[cat] || CAT_COLOR.Other;
                return (
                  <div
                    key={cat}
                    className="flex flex-col items-center p-3 rounded-xl border text-center transition-transform hover:scale-105"
                    style={{ background: c.bg, borderColor: c.border }}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-2 ring-2"
                      style={{
                        background: c.hex + '22',
                        color: c.hex,
                        ringColor: c.hex + '44',
                      }}
                    >
                      {cat[0]}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">{cat}</span>
                    <span className="text-sm font-bold text-white mt-0.5">{fmt(total)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Highest expense callout ── */}
      {highestExpense && (
        <div
          className="glass-card p-4 border-l-[3px] flex items-center justify-between gap-4 flex-wrap"
          style={{ borderLeftColor: '#ec4899' }}
        >
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold mb-1">
              🏆 Highest Single Expense
            </p>
            <p className="font-semibold text-white">
              {highestExpense.description || (
                <span className="italic text-gray-500">No description</span>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {highestExpense.category} · {fmtDate(highestExpense.date)}
            </p>
          </div>
          <span className="text-2xl font-bold text-pink-400 shrink-0">
            {fmt(highestExpense.amount)}
          </span>
        </div>
      )}
    </div>
  );
}

export default SummaryPanel;
