import { create } from 'zustand';

export type Language = 'español' | 'english' | 'quechua';

interface AnalysisStore {
  prompt: string;
  images: string[];
  isAnalyzing: boolean;
  language: Language;
  setPrompt: (prompt: string) => void;
  setImages: (images: string[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setLanguage: (language: Language) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  prompt: '',
  images: [],
  isAnalyzing: false,
  language: 'español',
  setPrompt: (prompt) => set({ prompt }),
  setImages: (images) => set({ images }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setLanguage: (language) => set({ language }),
}));
