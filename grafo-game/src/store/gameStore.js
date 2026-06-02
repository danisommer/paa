import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useGameStore = create(
  persist(
    (set, get) => ({
      // navigation
      mode: 'menu', // 'menu' | 'missions' | 'arena' | 'lab'
      setMode: (mode) => set({ mode }),

      // progress
      completedMissions: {}, // { [missionId]: { score, timeMs, errors } }
      completeMission: (id, result) =>
        set((s) => {
          const prev = s.completedMissions[id]
          // keep the best score
          if (prev && prev.score >= result.score) return {}
          return { completedMissions: { ...s.completedMissions, [id]: result } }
        }),
      isMissionDone: (id) => !!get().completedMissions[id],

      // arena best scores per algorithm
      arenaScores: {}, // { [algoKey]: bestScore }
      setArenaScore: (algoKey, score) =>
        set((s) => {
          const prev = s.arenaScores[algoKey] ?? -1
          if (score <= prev) return {}
          return { arenaScores: { ...s.arenaScores, [algoKey]: score } }
        }),

      // concepts drawer
      conceptsOpen: false,
      activeConceptAlgo: null, // algoKey to auto-highlight
      toggleConcepts: () => set((s) => ({ conceptsOpen: !s.conceptsOpen })),
      openConcepts: (algoKey = null) => set({ conceptsOpen: true, activeConceptAlgo: algoKey }),
      closeConcepts: () => set({ conceptsOpen: false }),
      setActiveConceptAlgo: (algoKey) => set({ activeConceptAlgo: algoKey }),

      // settings
      settings: { speed: 4 }, // 1..10
      setSpeed: (speed) => set((s) => ({ settings: { ...s.settings, speed } })),

      // reset
      resetProgress: () =>
        set({ completedMissions: {}, arenaScores: {} }),
    }),
    {
      name: 'grafoquest-save',
      partialize: (s) => ({
        completedMissions: s.completedMissions,
        arenaScores: s.arenaScores,
        settings: s.settings,
      }),
    },
  ),
)
