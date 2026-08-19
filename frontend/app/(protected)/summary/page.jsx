'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import SummaryScreen from '@/screens/decide/SummaryScreen';

export default function SummaryPage() {
  const deliverable = useAppStore((s) => s.deliverable);
  const role = useAppStore((s) => s.role);
  const confirmed = useAppStore((s) => s.confirmed);
  const brief = useAppStore((s) => s.brief);
  const viewingHistoryEntry = useAppStore((s) => s.viewingHistoryEntry);
  const setViewingHistoryEntry = useAppStore((s) => s.setViewingHistoryEntry);
  const { go, back } = useNavigation();

  // Viewing a past project from History: render its saved snapshot instead
  // of whatever's live in the store, so a different in-progress project
  // (if any) can't bleed into this read-only view. See useAppStore's
  // viewingHistoryEntry / addToHistory for how the snapshot is built.
  const snapshot = viewingHistoryEntry?._snapshot;
  const activeDeliverable = snapshot ? snapshot.deliverable : deliverable;
  const activeBrief = snapshot ? snapshot.brief : brief;
  const activeConfirmed = snapshot ? snapshot.confirmed : confirmed;

  useEffect(() => {
    if (!viewingHistoryEntry && !deliverable) go('/discovery');
  }, [viewingHistoryEntry, deliverable, go]);

  if (!activeDeliverable) return null;

  const leaveHistoryView = () => {
    if (viewingHistoryEntry) setViewingHistoryEntry(null);
  };

  return (
    <SummaryScreen
      deliverable={activeDeliverable}
      roomType={activeDeliverable?.room_type || activeBrief?.room_type}
      role={role}
      confirmed={activeConfirmed}
      readOnly={!!viewingHistoryEntry}
      onBack={() => {
        leaveHistoryView();
        back();
      }}
      onHandoff={() => go('/handoff')}
      onMenu={() => {
        leaveHistoryView();
        go('/history');
      }}
    />
  );
}
