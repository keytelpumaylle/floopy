import { create } from 'zustand';

interface AnalysisStore {
  prompt: string;
  images: string[];
  isAnalyzing: boolean;
  setPrompt: (prompt: string) => void;
  setImages: (images: string[]) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  prompt: '',
  images: [],
  isAnalyzing: false,
  setPrompt: (prompt) => set({ prompt }),
  setImages: (images) => set({ images }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  reset: () => set({ prompt: '', images: [], isAnalyzing: false }),
}));
