import { create } from 'zustand';

interface BreadcrumbStore {
  entityLabels: Record<string, string>;
  setEntityLabel: (id: string, label: string) => void;
  clearEntityLabel: (id: string) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
  entityLabels: {},
  setEntityLabel: (id, label) =>
    set((state) => ({
      entityLabels: { ...state.entityLabels, [id]: label },
    })),
  clearEntityLabel: (id) =>
    set((state) => {
      const next = { ...state.entityLabels };
      delete next[id];
      return { entityLabels: next };
    }),
}));
