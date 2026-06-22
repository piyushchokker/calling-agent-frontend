import { create } from 'zustand';
import { Company } from './types';

interface AppState {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCompanyId: null,
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
  companies: [],
  setCompanies: (companies) => set({ companies }),
}));
