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

      // Stable id for the CURRENT in-progress project's deliverable, minted
      // once (see setDeliverable below) and reused as the dedupe key when
      // addToHistory() snapshots it — deliberately NOT the TEMP-ID projectId,
      // since that placeholder is reused across every project in a browser
      // session until a real backend project-creation call succeeds (see
      // makeTempId note above). Cleared by resetFlow().
      currentLocalProjectId: null,

      // Local-only "Project history" list (no main backend yet — see
      // services/project.service.js). Each entry is shaped to match the
      // proj_* fields screens/support/HistoryScreen.jsx and
      // screens/flow/EntryScreen.jsx already read from a real backend
      // response, plus `_snapshot` (the full deliverable/brief/confirmed at
      // handoff time) for read-only historical viewing. Populated by
      // addToHistory() in app/(protected)/handoff/page.jsx.
      projectHistory: [],

      // Which history entry (if any) is currently being viewed read-only on
      // /summary — set by history/page.jsx when a card is tapped, cleared
      // when leaving that screen. Null = /summary shows the live in-progress
      // deliverable/brief/confirmed as usual.
      viewingHistoryEntry: null,

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

      // Confirm every given id at once (PackageScreen's "Confirm all").
      // Unlike toggleConfirmed, this only ever adds — it unions `ids` into
      // the existing confirmed list rather than flipping each one, so an
      // already-confirmed id is left alone and repeat calls are a no-op.
      confirmAll: (ids) =>
        set((s) => ({ confirmed: Array.from(new Set([...s.confirmed, ...ids])) })),

      setIntakeAnswers: (answers) => set({ intakeAnswers: answers }),
      setBrief: (brief) => set({ brief }),
      setProfile: (profile) => set({ profile }),
      setDirections: (directions) => set({ directions }),

      // Mints currentLocalProjectId the first time a deliverable lands for
      // this flow (left as-is on later calls within the same flow, e.g. a
      // re-assemble after tweaking selections) so addToHistory() has a
      // stable id to dedupe on instead of relying on object identity.
      setDeliverable: (deliverable) =>
        set((s) => ({
          deliverable,
          currentLocalProjectId: deliverable
            ? s.currentLocalProjectId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
            : null,
        })),

      setViewingHistoryEntry: (entry) => set({ viewingHistoryEntry: entry }),

      // Snapshots the current deliverable/brief/confirmed into projectHistory.
      // Called from app/(protected)/handoff/page.jsx once the client reaches
      // the handoff screen. Upserts by currentLocalProjectId (not object
      // reference) so the effect re-firing / a retry doesn't create
      // duplicate entries, while a genuinely new project (new
      // currentLocalProjectId after resetFlow + setDeliverable) gets its own.
      addToHistory: () =>
        set((s) => {
          if (!s.deliverable) return {};
          const id = s.currentLocalProjectId || `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const direction = s.deliverable.chosen_direction;
          const rawRoomType = s.deliverable.room_type || s.brief?.room_type;
          const roomLabel = rawRoomType
            ? rawRoomType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
            : 'Renovation';
          const ceiling = s.deliverable.budget?.band_ceiling ?? s.deliverable.budget?.estimated_total;
          const entry = {
            proj_id: id,
            proj_title: direction?.name ? `${roomLabel} · ${direction.name}` : `${roomLabel} Renovation`,
            proj_status: 'Handed off',
            proj_completionPercent: 100,
            // HistoryScreen interpolates this raw (no $/toLocaleString of its
            // own), so pre-format it here.
            proj_budgetMaxOverride: ceiling != null ? `$${Math.round(ceiling).toLocaleString()}` : '—',
            proj_updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            // The actual inspiration/direction photo the client chose, when
            // available (demo/kitchen flow today; real pipeline directions
            // don't carry one yet — HistoryScreen falls back to a tone
            // gradient when this is null/undefined).
            proj_imageUrl: direction?.imageUrl ?? null,
            _local: true,
            _snapshot: { deliverable: s.deliverable, brief: s.brief, confirmed: s.confirmed },
          };
          const rest = s.projectHistory.filter((p) => p.proj_id !== id);
          return { projectHistory: [entry, ...rest], currentLocalProjectId: id };
        }),

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
          currentLocalProjectId: null,
          viewingHistoryEntry: null,
          // projectHistory intentionally NOT cleared — it's the saved record
          // of past projects, unrelated to the in-progress flow being reset.
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
        currentLocalProjectId: s.currentLocalProjectId,
        projectHistory: s.projectHistory,
        viewingHistoryEntry: s.viewingHistoryEntry,
      }),
    }
  )
);
