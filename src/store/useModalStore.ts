import { create } from 'zustand';

interface ModalStore {
    isOpen: boolean
    open: () => void;
    closed: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
    isOpen: false,
    open:() => set({isOpen: true}),
    closed:() => set({isOpen: false})
}));