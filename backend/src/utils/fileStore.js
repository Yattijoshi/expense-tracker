/**
 * fileStore.js
 * Thin abstraction over the local JSON file that acts as our data store.
 * All reads/writes go through this module so the rest of the app stays decoupled
 * from the underlying storage mechanism.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const DATA_PATH = path.join(DATA_DIR, 'expenses.json');

/**
 * Read all expenses from disk.
 * Returns an empty array if the file does not exist yet or is malformed.
 * @returns {Array<object>}
 */
export function readExpenses() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      // First-time setup: create the directory and seed an empty file
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_PATH, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[fileStore] Failed to read expenses:', err.message);
    return [];
  }
}

/**
 * Persist the given expenses array to disk.
 * @param {Array<object>} expenses
 */
export function writeExpenses(expenses) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(expenses, null, 2), 'utf-8');
  } catch (err) {
    console.error('[fileStore] Failed to write expenses:', err.message);
    throw new Error('Could not persist expenses to disk');
  }
}
