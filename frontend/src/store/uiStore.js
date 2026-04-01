import { create } from 'zustand'

export const useUiStore = create((set) => ({
  activePanel: null,       // null | 'calendar' | 'notion'
  selectedCardId: null,
  isCardModalOpen: false,

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  togglePanel: (panel) =>
    set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),

  openCardModal: (cardId) => set({ selectedCardId: cardId, isCardModalOpen: true }),
  closeCardModal: () => set({ selectedCardId: null, isCardModalOpen: false }),
}))
