/**
 * validateExpense.js
 * Express middleware that enforces all business rules for expense payloads.
 * Returns HTTP 400 with a structured errors array when validation fails.
 */

const VALID_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

/**
 * Validate the incoming request body for POST /api/expenses
 * and PUT /api/expenses/:id.
 *
 * Rules:
 *  - amount   : required, must be a finite positive number
 *  - date     : required, must be a valid calendar date, must not be in the future
 *  - category : required, must be one of the VALID_CATEGORIES
 *  - description (optional): max 200 characters
 */
export function validateExpense(req, res, next) {
  const { amount, date, category, description } = req.body;
  const errors = [];

  // ── amount ────────────────────────────────────────────────────────────────
  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else {
    const numericAmount = Number(amount);
    if (!isFinite(numericAmount) || numericAmount <= 0) {
      errors.push('amount must be a positive number');
    }
  }

  // ── date ──────────────────────────────────────────────────────────────────
  if (!date) {
    errors.push('date is required');
  } else {
    const inputDate = new Date(date);
    if (isNaN(inputDate.getTime())) {
      errors.push('date must be a valid ISO date string (YYYY-MM-DD)');
    } else {
      // Allow any time on today — compare against end-of-day
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      if (inputDate > endOfToday) {
        errors.push('date must not be in the future');
      }
    }
  }

  // ── category ──────────────────────────────────────────────────────────────
  if (!category) {
    errors.push('category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(
      `category must be one of: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  // ── description (optional) ────────────────────────────────────────────────
  if (description !== undefined && description !== null && String(description).length > 200) {
    errors.push('description must not exceed 200 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}
