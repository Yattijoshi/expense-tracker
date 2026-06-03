/**
 * ExpenseForm.jsx
 * Add / Edit form with real-time inline validation that mirrors the backend rules.
 * Switches between "add" and "edit" mode based on the `editingExpense` prop.
 */

import { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];
const EMPTY_FORM  = { amount: '', date: '', category: '', description: '' };

// ─── Client-side validation (matches backend rules exactly) ─────────────────

function validate(fields) {
  const errors = {};

  // amount
  const amt = parseFloat(fields.amount);
  if (fields.amount === '' || fields.amount === undefined) {
    errors.amount = 'Amount is required';
  } else if (isNaN(amt) || amt <= 0) {
    errors.amount = 'Amount must be a positive number';
  }

  // date
  if (!fields.date) {
    errors.date = 'Date is required';
  } else {
    const picked = new Date(fields.date);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (isNaN(picked.getTime())) {
      errors.date = 'Enter a valid date';
    } else if (picked > endOfToday) {
      errors.date = 'Date cannot be in the future';
    }
  }

  // category
  if (!fields.category) {
    errors.category = 'Category is required';
  } else if (!CATEGORIES.includes(fields.category)) {
    errors.category = 'Select a valid category';
  }

  // description (optional)
  if (fields.description && fields.description.length > 200) {
    errors.description = 'Must be 200 characters or fewer';
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [touched,    setTouched]    = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(editingExpense);
  const today     = new Date().toISOString().split('T')[0];

  // Populate form when switching into edit mode
  useEffect(() => {
    if (editingExpense) {
      setForm({
        amount:      String(editingExpense.amount),
        date:        editingExpense.date,
        category:    editingExpense.category,
        description: editingExpense.description || '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setTouched({});
  }, [editingExpense]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    // Re-validate the changed field if it's already been touched
    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Mark everything as touched so all errors show
    setTouched({ amount: true, date: true, category: true, description: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        amount:      parseFloat(form.amount),
        date:        form.date,
        category:    form.category,
        description: form.description.trim(),
      });
      if (!isEditing) {
        setForm(EMPTY_FORM);
        setTouched({});
        setErrors({});
      }
    } catch (err) {
      // Map server-returned validation errors back onto fields
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const mapped = {};
        serverErrors.forEach((msg) => {
          if (msg.includes('amount'))      mapped.amount      = msg;
          else if (msg.includes('date'))   mapped.date        = msg;
          else if (msg.includes('category')) mapped.category  = msg;
          else if (msg.includes('description')) mapped.description = msg;
        });
        setErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const fieldClass = (name) =>
    `input-field${errors[name] && touched[name] ? ' input-error' : ''}`;

  const ErrorMsg = ({ name }) =>
    errors[name] && touched[name] ? (
      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
        <span>⚠</span> {errors[name]}
      </p>
    ) : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="glass-card p-6">
      <h2 className="section-title">
        {isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}
      </h2>

      <form id="expense-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Amount */}
          <div>
            <label htmlFor="form-amount" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <input
              id="form-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass('amount')}
            />
            <ErrorMsg name="amount" />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="form-date" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              id="form-date"
              name="date"
              type="date"
              max={today}
              value={form.date}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass('date')}
            />
            <ErrorMsg name="date" />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="form-category" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              id="form-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass('category')}
            >
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ErrorMsg name="category" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="form-description" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Description{' '}
              <span className="text-gray-600 normal-case font-normal">(optional)</span>
            </label>
            <input
              id="form-description"
              name="description"
              type="text"
              maxLength={200}
              placeholder="e.g. Lunch at café"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldClass('description')}
            />
            {/* Character counter */}
            <div className="flex justify-between items-start mt-1">
              <ErrorMsg name="description" />
              <span className="text-gray-600 text-xs ml-auto">
                {form.description.length}/200
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            id="form-submit"
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1"
          >
            {submitting && <span className="spinner" />}
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </button>

          {isEditing && (
            <button
              id="form-cancel"
              type="button"
              onClick={onCancelEdit}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExpenseForm;
