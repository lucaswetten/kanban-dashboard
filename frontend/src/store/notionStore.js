import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useNotionStore = create(
  persist(
    (set) => ({
      isConnected: false,
      databaseId: '',
      pages: [],
      loading: false,
      error: null,

      connect: (databaseId) => {
        set({ databaseId, isConnected: true, error: null })
      },

      disconnect: () => {
        set({ isConnected: false, databaseId: '', pages: [], error: null })
      },

      setPages: (pages) => set({ pages }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error, loading: false }),
    }),
    {
      name: 'kanban-notion-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isConnected: state.isConnected,
        databaseId: state.databaseId,
      }),
    }
  )
)
