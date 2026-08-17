'use client';

import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import DiscoveryScreen from '@/screens/explore/DiscoveryScreen';
import { INSPIRATIONS, buildDemoDeliverable } from '@/data/warmMinimalKitchen';

// DEMO MODE: as-ai-server's AI pipeline is bathroom-only today (see
// CLAUDE.md) — it has no kitchen catalog to match against. For this kitchen
// demo we were asked to always show the 6 real Warm Minimal Kitchen
// inspiration images instead of calling /intake (see data/
// warmMinimalKitchen.js, transcribed from the team's AlignSpace Kitchen MVP
// Dataset). Selecting any of them assembles the same real 8-category
// package client-side — no backend call. Swap this back to the store's real
// `directions`/runAssemble (see git history) once the backend adds a
// kitchen catalog.
const DIRECTIONS = INSPIRATIONS.map((insp) => ({
  key: insp.key,
  name: insp.name,
  blurb: insp.blurb,
  match_score: 1,
  imageUrl: insp.imageUrl,
}));

export default function DiscoveryPage() {
  const selected = useAppStore((s) => s.selected);
  const setSelected = useAppStore((s) => s.setSelected);
  const setDeliverable = useAppStore((s) => s.setDeliverable);
  const { go, back } = useNavigation();

  function handleSelect(directionKey) {
    setDeliverable(buildDemoDeliverable(directionKey));
    go('/focus');
  }

  return (
    <DiscoveryScreen
      directions={DIRECTIONS}
      selected={selected?.[0]}
      setSelected={(key) => setSelected(key ? [key] : [])}
      onBack={back}
      onSelect={handleSelect}
      onMenu={() => go('/history')}
    />
  );
}
