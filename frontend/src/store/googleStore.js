import { create } from 'zustand'

export const useGoogleStore = create((set, get) => ({
  isConnected: false,
  accessToken: null,
  tokenExpiry: null,
  events: [],
  loading: false,
  error: null,

  setToken: (accessToken, expiresIn) => {
    set({
      accessToken,
      isConnected: true,
      tokenExpiry: Date.now() + expiresIn * 1000,
      error: null,
    })
  },

  clearToken: () => {
    set({
      isConnected: false,
      accessToken: null,
      tokenExpiry: null,
      events: [],
    })
  },

  setEvents: (events) => set({ events }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  isTokenValid: () => {
    const { accessToken, tokenExpiry } = get()
    return accessToken && tokenExpiry && Date.now() < tokenExpiry - 60_000
  },
}))
