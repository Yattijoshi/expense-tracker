/**
 * CategoryChart.jsx
 * Pure SVG horizontal bar chart — zero external dependencies.
 * Each bar shows the category's share of total spending as both a filled
 * bar and a percentage label. Values are displayed to the right of each bar.
 */

const CAT_COLOR = {
  Food: '#f59e0b',
  Transport: '#14b8a6',
  Bills: '#3b82f6',
  Entertainment: '#ec4899',
  Other: '#8b5cf6',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

// ─── Layout constants ─────────────────────────────────────────────────────────
const LABEL_W = 100;   // px reserved for the category name on the left
const BAR_W = 260;   // max bar width in px
const VALUE_W = 90;    // px reserved for the value label on the right
const SVG_W = LABEL_W + BAR_W + VALUE_W + 16;
const BAR_H = 34;    // height of each bar
const ROW_GAP = 14;    // vertical gap between rows
const PAD_TOP = 8;

function CategoryChart({ totalPerCategory }) {
  if (!totalPerCategory || Object.keys(totalPerCategory).length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-gray-600 text-sm">No data to chart yet</p>
      </div>
    );
  }

  const entries = Object.entries(totalPerCategory).sort(([, a], [, b]) => b - a);
  const grandTotal = entries.reduce((s, [, v]) => s + v, 0);
  const maxValue = entries[0][1]; // entries are sorted desc so first is max

  const SVG_H = PAD_TOP + entries.length * (BAR_H + ROW_GAP) - ROW_GAP + PAD_TOP;

  return (
    <div className="glass-card p-5">
      <h3 className="section-title">📊 Category Breakdown</h3>
      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          aria-label="Horizontal bar chart showing spending per category"
          role="img"
        >
          {entries.map(([category, total], i) => {
            const y = PAD_TOP + i * (BAR_H + ROW_GAP);
            const barWidth = (total / maxValue) * BAR_W;
            const pct = Math.round((total / grandTotal) * 100);
            const color = CAT_COLOR[category] || '#8b5cf6';
            const midY = y + BAR_H / 2;

            return (
              <g key={category} role="graphics-symbol" aria-label={`${category}: ${fmt(total)}`}>
                {/* Category label */}
                <text
                  x={LABEL_W - 8}
                  y={midY + 5}
                  textAnchor="end"
                  fill="#9ca3af"
                  fontSize="12"
                  fontWeight="500"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {category}
                </text>

                {/* Background track */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={BAR_W}
                  height={BAR_H}
                  rx="8"
                  fill="rgba(255,255,255,0.05)"
                />

                {/* Filled bar — animated via CSS on mount */}
                <rect
                  x={LABEL_W}
                  y={y}
                  width={Math.max(barWidth, 8)}
                  height={BAR_H}
                  rx="8"
                  fill={color}
                  fillOpacity="0.85"
                  style={{ transition: 'width 0.6s cubic-bezier(.4,0,.2,1)' }}
                />

                {/* Percentage label inside bar (only if bar is wide enough) */}
                {barWidth > 44 && (
                  <text
                    x={LABEL_W + 10}
                    y={midY + 5}
                    fill="white"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="Inter, system-ui, sans-serif"
                    fillOpacity="0.9"
                  >
                    {pct}%
                  </text>
                )}

                {/* Value label to the right */}
                <text
                  x={LABEL_W + BAR_W + 8}
                  y={midY + 5}
                  fill={color}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {fmt(total)}
                </text>
              </g>
            );
          })}

          {/* Grand total footnote */}
          <text
            x={LABEL_W}
            y={SVG_H + 50}
            fill="#4b5563"
            fontSize="11"
            fontFamily="Inter, system-ui, sans-serif"
          >
            Total: {fmt(grandTotal)}
          </text>
        </svg>
      </div>
    </div>
  );
}

export default CategoryChart;
