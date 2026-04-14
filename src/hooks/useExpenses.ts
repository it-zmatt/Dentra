import { useMemo } from 'react';
import { useExpensesStore } from '../store/expensesStore';

export function useExpenses() {
  return useExpensesStore();
}

export function useIssuerSuggestions(): string[] {
  const { expenses } = useExpensesStore();
  return useMemo(() => {
    const issuers = expenses.map((e) => e.issuer).filter(Boolean);
    return [...new Set(issuers)];
  }, [expenses]);
}
