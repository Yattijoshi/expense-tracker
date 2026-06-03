/**
 * exportCsv.js
 * Utility that converts an expense array into a valid RFC-4180 CSV string
 * and triggers a native browser file download — no dependencies required.
 */

/**
 * Escape a single CSV cell value.
 * Wraps in double-quotes if the value contains a comma, double-quote, or newline.
 * Internal double-quotes are doubled per the RFC.
 * @param {*} value
 * @returns {string}
 */
function escapeCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const CSV_HEADERS = ['Date', 'Category', 'Description', 'Amount (INR)'];

/**
 * Format the expenses array as CSV and immediately download it.
 *
 * @param {Array<{date:string, category:string, description:string, amount:number}>} expenses
 *   The currently visible / filtered expense rows to export.
 * @param {string} [filename='expenses.csv'] - Suggested download file name.
 */
export function downloadExpensesCsv(expenses, filename = 'expenses.csv') {
  const rows = [
    // Header row
    CSV_HEADERS.map(escapeCell).join(','),

    // Data rows — newest-first order is already guaranteed by the backend
    ...expenses.map((e) =>
      [e.date, e.category, e.description || '', e.amount]
        .map(escapeCell)
        .join(',')
    ),
  ];

  // Use CRLF line endings (RFC 4180 §2)
  const csvContent = rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);

  // Programmatic click on a hidden anchor to trigger the download
  const link = document.createElement('a');
  link.href        = url;
  link.download    = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Clean up — revoke the object URL after a short delay so the browser
  // has time to initiate the download before the URL is invalidated.
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}
