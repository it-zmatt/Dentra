import { useMemo } from 'react';
import { useLabworkStore } from '../store/labworkStore';

export function useLabwork() {
  return useLabworkStore();
}

export function useLabNameSuggestions(): string[] {
  const { labworks } = useLabworkStore();
  return useMemo(() => {
    const names = labworks.map((l) => l.lab).filter(Boolean);
    return [...new Set(names)];
  }, [labworks]);
}
