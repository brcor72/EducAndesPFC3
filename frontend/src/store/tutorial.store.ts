import { create } from 'zustand';

interface TutorialState {
  open: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
}

export const useTutorialStore = create<TutorialState>()((set) => ({
  open: false,
  openTutorial: () => set({ open: true }),
  closeTutorial: () => set({ open: false }),
}));
