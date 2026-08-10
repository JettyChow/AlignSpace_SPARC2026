import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TEMPORARY fallback: firm_id / project_id should come from the main
// backend's POST /projects (see services/project.service.js, called from
// app/(protected)/intake/page.jsx via setFirmId/setProjectId below). Until
// that backend is reachable at NEXT_PUBLIC_BACKEND_URL, we mint client-side
// ids so the AI pipeline's BriefRequest (firm_id, project_id are required)
// still has something to send. Search for TEMP-ID to find the spot.
function makeTempId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useAppStore = create(
  persist(
    (set) => ({
      // Auth
      role: 'client',

      // Designer flow
      project: null,

      // TEMP-ID: placeholder multi-tenancy/project keys (see note above)
      firmId: makeTempId('firm'),
      projectId: makeTempId('proj'),

      // Client flow — direction selection (DiscoveryScreen passes full array).
      // Holds a real DesignDirection.key once /intake has run.
      selected: [],

      // Client flow — confirmed material categories (PackageScreen / FFEScreen)
      confirmed: [],

      // Client flow — intake answers, and the ClientBrief built from them
      // (see services/pipeline.service.js for the wire shape)
      intakeAnswers: null,
      brief: null,

      // AI pipeline results (as-ai-server /intake and /assemble responses)
      profile: null,
      directions: [],
      deliverable: null,

      // Actions
      setRole: (role) => set({ role }),

      setProject: (project) => set({ project }),

      // Overwrite the local TEMP-ID placeholders once project.service.js's
      // createProject() returns a real id from the main backend.
      setFirmId: (firmId) => set({ firmId }),
      setProjectId: (projectId) => set({ projectId }),

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
      setBrief: (brief) => set({ brief }),
      setProfile: (profile) => set({ profile }),
      setDirections: (directions) => set({ directions }),
      setDeliverable: (deliverable) => set({ deliverable }),

      resetFlow: () =>
        set({
          selected: [],
          confirmed: [],
          intakeAnswers: null,
          brief: null,
          profile: null,
          directions: [],
          deliverable: null,
          project: null,
        }),
    }),
    {
      name: 'alignspace-store',
      partialize: (s) => ({
        role: s.role,
        project: s.project,
        firmId: s.firmId,
        projectId: s.projectId,
        selected: s.selected,
        confirmed: s.confirmed,
        intakeAnswers: s.intakeAnswers,
        brief: s.brief,
        profile: s.profile,
        directions: s.directions,
        deliverable: s.deliverable,
      }),
    }
  )
);
