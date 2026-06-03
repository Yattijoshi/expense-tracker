/**
 * ExportButton.jsx
 * A button that serialises the currently visible expenses to CSV and
 * triggers a browser file download. Shows a brief "Exported!" confirmation.
 */

import { useState } from 'react';
import { downloadExpensesCsv } from '../utils/exportCsv.js';

function ExportButton({ expenses }) {
  const [justExported, setJustExported] = useState(false);

  const handleExport = () => {
    if (expenses.length === 0) return;

    // Use today's date in the filename so successive exports don't collide
    const datestamp = new Date().toISOString().split('T')[0];
    downloadExpensesCsv(expenses, `expenses-${datestamp}.csv`);

    // Brief visual confirmation then reset
    setJustExported(true);
    setTimeout(() => setJustExported(false), 2200);
  };

  const isEmpty = expenses.length === 0;

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      disabled={isEmpty || justExported}
      title={
        isEmpty
          ? 'No expenses to export'
          : `Download ${expenses.length} row${expenses.length !== 1 ? 's' : ''} as CSV`
      }
      className="btn-secondary text-sm gap-2 shrink-0"
    >
      {justExported ? (
        <>
          <span className="text-green-400">✓</span>
          <span className="text-green-400">Exported!</span>
        </>
      ) : (
        <>
          <span>⬇️</span>
          <span>Export CSV</span>
        </>
      )}
    </button>
  );
}

export default ExportButton;
