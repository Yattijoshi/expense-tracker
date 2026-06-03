/**
 * FilterBar.jsx
 * Compact filter controls: category dropdown + date-range pickers.
 * Calls onChange on every input change so the parent can trigger an
 * immediate re-fetch (no separate "Apply" button needed).
 */

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

function FilterBar({ filters, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    onChange({ category: '', from: '', to: '' });
  };

  const hasActiveFilters = filters.category || filters.from || filters.to;

  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Category */}
        <div className="flex-1 min-w-[130px]">
          <label
            htmlFor="filter-category"
            className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
          >
            Category
          </label>
          <select
            id="filter-category"
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="input-field py-2 text-sm"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* From date */}
        <div className="flex-1 min-w-[130px]">
          <label
            htmlFor="filter-from"
            className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
          >
            From
          </label>
          <input
            id="filter-from"
            type="date"
            name="from"
            value={filters.from}
            max={filters.to || undefined}
            onChange={handleChange}
            className="input-field py-2 text-sm"
          />
        </div>

        {/* To date */}
        <div className="flex-1 min-w-[130px]">
          <label
            htmlFor="filter-to"
            className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5"
          >
            To
          </label>
          <input
            id="filter-to"
            type="date"
            name="to"
            value={filters.to}
            min={filters.from || undefined}
            onChange={handleChange}
            className="input-field py-2 text-sm"
          />
        </div>

        {/* Clear filters button — only visible when filters are active */}
        {hasActiveFilters && (
          <button
            id="filter-clear"
            onClick={clearFilters}
            className="btn-secondary py-2 text-sm shrink-0"
            title="Clear all filters"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.category && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Category: {filters.category}
            </span>
          )}
          {filters.from && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              From: {filters.from}
            </span>
          )}
          {filters.to && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              To: {filters.to}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
