import { create } from 'zustand';

type FocusedSection = 'input' | 'settings' | 'none';

interface PetData {
  animalName: string;
  genero: 'Macho' | 'Hembra' | '';
  peso: string;
  edad: string;
  dni: string;
}

interface SettingsStore {
  focusedSection: FocusedSection;
  petData: PetData;
  setFocusedSection: (section: FocusedSection) => void;
  setPetData: (data: Partial<PetData>) => void;
}

const initialPetData: PetData = {
  animalName: '',
  genero: '',
  peso: '',
  edad: '',
  dni: '',
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  focusedSection: 'none',
  petData: initialPetData,
  setFocusedSection: (section) => set({ focusedSection: section }),
  setPetData: (data) => set((state) => ({
    petData: { ...state.petData, ...data }
  })),
}));
