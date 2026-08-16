'use client';

import { useState, useEffect, useCallback } from 'react';
import DarkScene from '@/components/frame/DarkScene';
import { Mark } from '@/components/Logo';
import Icon from '@/components/Icon';
import { runIntake } from '@/services/pipeline.service';
import { generateProject } from '@/services/project.service';
import { ApiError } from '@/services/apiClient';

// Only 2 stages — /intake extracts intent and ranks directions. Materials
// aren't built until the client picks a direction on DiscoveryScreen, which
// triggers /assemble. (An earlier version of this screen showed a 3rd fake
// "Building material palette" stage here that never actually ran.)
const PROCESS_STAGES = [
  { icon: 'layers', label: 'Analysing your preferences' },
  { icon: 'hexagon', label: 'Generating design directions' },
];

// TEMP-ID placeholders (see useAppStore.js's makeTempId) are non-numeric
// strings like "proj_ab12cd34"; real main-backend project ids are integers.
function looksLikeRealProjectId(id) {
  return Number.isFinite(Number(id));
}

// Normalize the main backend's /generate directions shape (direction_id,
// pipeline_direction_key, title, match_percent, ...) into the shape
// DiscoveryScreen.jsx already reads (key, name, match_score), carrying
// direction_id through so discovery/page.jsx can select by id afterwards.
function normalizeGenerateResult(result) {
  return {
    profile: result.profile,
    directions: (result.directions || []).map((d) => ({
      direction_id: d.direction_id,
      key: d.pipeline_direction_key,
      name: d.title,
      blurb: d.blurb,
      tags: d.tags,
      match_score: (d.match_percent ?? 0) / 100,
    })),
  };
}

// Prefer the main backend's project-scoped /generate — it keeps the browser
// off the raw AI pipeline entirely. Fall back to calling as-ai-server's
// /intake directly (unchanged) when there's no real backend project yet, or
// when the main backend call itself fails, so the documented as-ai-server
// standalone/offline demo keeps working.
async function fetchDirections(brief, projectId, getToken) {
  if (projectId && looksLikeRealProjectId(projectId)) {
    try {
      const result = await generateProject(projectId, getToken);
      return normalizeGenerateResult(result);
    } catch {
      // Main backend unreachable/rejected — fall through to the pipeline.
    }
  }
  return runIntake(brief);
}

export default function ProcessingScreen({ brief, projectId, getToken, onDone }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setActiveIdx(0);

    const t1 = setTimeout(() => !cancelled && setActiveIdx(1), 1200);

    // Minimum display time keeps the animation from flashing on a fast
    // response; the real /intake call runs in parallel with it.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 2200));

    Promise.all([fetchDirections(brief, projectId, getToken), minDelay])
      .then(([result]) => {
        if (cancelled) return;
        onDone(result);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? err.message
            : 'Could not reach the AI pipeline service. Is as-ai-server running?';
        setError(message);
      });

    return () => {
      cancelled = true;
      clearTimeout(t1);
    };
  }, [brief, projectId, getToken, attempt, onDone]);

  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <div style={{ position: 'relative', width: 180, height: 180, marginBottom: 48 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: i * 22,
              borderRadius: '50%', border: '1px solid rgba(255,255,255,0.13)',
              background: `rgba(255,255,255,0.0${4 - i})`,
              backdropFilter: 'blur(6px)',
              animation: 'breathe 3.2s ease-in-out infinite',
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mark size={46} />
          </div>
          <style>{`@keyframes breathe { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }`}</style>
        </div>

        {error ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'rgba(247,242,234,0.96)', textAlign: 'center', letterSpacing: '-0.01em', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.55)', textAlign: 'center', marginBottom: 28, maxWidth: 300 }}>{error}</p>
            <button onClick={retry} style={{
              padding: '12px 28px', borderRadius: 999, cursor: 'pointer',
              border: '1px solid rgba(198,163,107,0.55)', background: 'rgba(198,163,107,0.14)',
              fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 600, color: 'var(--champagne)',
            }}>Try again</button>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 600, color: 'rgba(247,242,234,0.96)', textAlign: 'center', letterSpacing: '-0.01em', marginBottom: 8 }}>Creating your design brief</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.5)', textAlign: 'center', marginBottom: 40 }}>Our AI is analysing your preferences…</p>

            <div style={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {PROCESS_STAGES.map((s, i) => {
                const done = i < activeIdx;
                const active = i === activeIdx;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: active || done ? 1 : 0.35, transition: 'opacity 500ms ease' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: done ? 'none' : active ? '1px solid rgba(198,163,107,0.6)' : '1px solid rgba(255,255,255,0.16)',
                      background: done ? 'rgba(122,185,107,0.22)' : active ? 'rgba(198,163,107,0.15)' : 'rgba(255,255,255,0.04)',
                    }}>
                      {done ? <Icon name="check" size={18} stroke={2.2} color="#7AB96B" /> : <Icon name={s.icon} size={18} stroke={1.5} color={active ? 'var(--champagne)' : 'rgba(255,255,255,0.55)'} />}
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, color: done ? 'rgba(247,242,234,0.6)' : active ? 'rgba(247,242,234,0.95)' : 'rgba(247,242,234,0.4)' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </DarkScene>
  );
}
