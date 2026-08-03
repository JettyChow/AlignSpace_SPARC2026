import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Auth
      role: 'client',

      // Designer flow
      project: null,

      // Client flow — direction selection (DiscoveryScreen passes full array)
      selected: ['warm-min'],

      // Client flow — confirmed material categories (PackageScreen / FFEScreen)
      confirmed: [],

      // Client flow — intake answers
      intakeAnswers: null,

      // Actions
      setRole: (role) => set({ role }),

      setProject: (project) => set({ project }),

      // Replace the full selection array (DiscoveryScreen builds toggle internally)
      setSelected: (selected) => set({ selected }),

      // Toggle a single confirmed category id
      toggleConfirmed: (id) =>
        set((s) => ({
          confirmed: s.confirmed.includes(id)
            ? s.confirmed.filter((x) => x !== id)
            : [...s.confirmed, id],
        })),

      setIntakeAnswers: (answers) => set({ intakeAnswers: answers }),

      resetFlow: () =>
        set({ selected: [], confirmed: [], intakeAnswers: null, project: null }),
    }),
    {
      name: 'alignspace-store',
      partialize: (s) => ({
        role: s.role,
        project: s.project,
        selected: s.selected,
        confirmed: s.confirmed,
        intakeAnswers: s.intakeAnswers,
      }),
    }
  )
);
