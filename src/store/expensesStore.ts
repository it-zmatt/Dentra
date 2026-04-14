import { create } from 'zustand';
import { getExpenses, saveExpense, deleteExpense } from '../services/db';
import type { Expense } from '../types';

interface ExpensesStore {
  expenses: Expense[];
  loading: boolean;
  load: () => Promise<void>;
  save: (expense: Expense) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useExpensesStore = create<ExpensesStore>((set) => ({
  expenses: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    const expenses = await getExpenses();
    set({ expenses, loading: false });
  },

  save: async (expense) => {
    await saveExpense(expense);
    const expenses = await getExpenses();
    set({ expenses });
  },

  remove: async (id) => {
    await deleteExpense(id);
    const expenses = await getExpenses();
    set({ expenses });
  },
}));
