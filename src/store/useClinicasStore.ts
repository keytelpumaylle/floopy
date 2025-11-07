import { create } from 'zustand';

export interface Clinica {
  id: string;
  name: string;
  address: string;
}

interface ClinicasStore {
  clinicas: Clinica[];
  isLoaded: boolean;
  setClinicas: (clinicas: Clinica[]) => void;
}

export const useClinicasStore = create<ClinicasStore>((set) => ({
  clinicas: [],
  isLoaded: false,
  setClinicas: (clinicas) => set({ clinicas, isLoaded: true }),
}));
