/**
 * expenseRoutes.js
 * Wires URL paths to controller functions and inserts the validation middleware
 * on all mutating routes (POST, PUT).
 *
 * NOTE: /summary must be registered BEFORE /:id so Express doesn't misinterpret
 * the literal string "summary" as a dynamic id parameter.
 */

import { Router } from 'express';
import {
  getAllExpenses,
  getSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { validateExpense } from '../middleware/validateExpense.js';

const router = Router();

router.get('/summary', getSummary);          // GET  /api/expenses/summary
router.get('/', getAllExpenses);              // GET  /api/expenses[?category=&from=&to=]
router.post('/', validateExpense, createExpense);           // POST /api/expenses
router.put('/:id', validateExpense, updateExpense);         // PUT  /api/expenses/:id
router.delete('/:id', deleteExpense);                       // DELETE /api/expenses/:id

export default router;
