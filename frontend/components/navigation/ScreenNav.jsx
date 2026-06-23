'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@/components/Icon';

// Flat ordered list of all screens — mirrors the old FLAT array
const SCREENS = [
  { id: 'role',          path: '/role',          group: 'Onboarding',  label: 'Role select' },
  { id: 'login',         path: '/login',         group: 'Onboarding',  label: 'Login' },
  { id: 'projects',      path: '/projects',      group: 'Designer',    label: 'Projects' },
  { id: 'materials',     path: '/projects/0',    group: 'Designer',    label: 'Material list' },
  { id: 'entry',         path: '/entry',         group: 'Guided flow', label: 'AI entry' },
  { id: 'intake',        path: '/intake',        group: 'Guided flow', label: 'Conversation' },
  { id: 'processing',    path: '/processing',    group: 'Guided flow', label: 'Processing' },
  { id: 'discovery',     path: '/discovery',     group: 'Exploration', label: 'Directions' },
  { id: 'focus',         path: '/focus',         group: 'Exploration', label: 'Direction focus' },
  { id: 'package',       path: '/package',       group: 'Exploration', label: 'Material package' },
  { id: 'ffe',           path: '/ffe',           group: 'Decisions',   label: 'Decision tracker' },
  { id: 'budget',        path: '/budget',        group: 'Decisions',   label: 'Budget review' },
  { id: 'summary',       path: '/summary',       group: 'Decisions',   label: 'Project summary' },
  { id: 'handoff',       path: '/handoff',       group: 'Decisions',   label: 'Designer handoff' },
  { id: 'profile',       path: '/profile',       group: 'Supporting',  label: 'Profile' },
  { id: 'notifications', path: '/notifications', group: 'Supporting',  label: 'Notifications' },
  { id: 'saved',         path: '/saved',         group: 'Supporting',  label: 'Saved' },
  { id: 'history',       path: '/history',       group: 'Supporting',  label: 'History' },
];

const GROUP_ORDER = ['Onboarding', 'Designer', 'Guided flow', 'Exploration', 'Decisions', 'Supporting'];

const navArrow = (disabled) => ({
  width: 40, height: 40, borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
  flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
  opacity: disabled ? 0.3 : 1,
});

export default function ScreenNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Derive active index: /projects/0 (or any /projects/...) → 'materials'
  const idx = SCREENS.findIndex((s) => {
    if (s.id === 'materials') {
      return pathname.startsWith('/projects/');
    }
    return pathname === s.path;
  });

  const jump = (path) => {
    router.push(path);
    setOpen(false);
  };

  if (!mounted) return null;

  return createPortal(
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: 'none', fontFamily: 'var(--font-sans)' }}>
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', pointerEvents: 'auto' }}
        />
      )}
      <div style={{ position: 'fixed', left: '50%', bottom: 22, transform: 'translateX(-50%)', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 'min(440px, 94vw)' }}>
        {open && (
          <div style={{ width: '100%', background: 'rgba(28,23,18,0.86)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 26, padding: '18px 18px 20px', boxShadow: '0 30px 70px rgba(0,0,0,0.5)', maxHeight: '72vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
              Jump to screen · {SCREENS.length} total
            </div>
            {GROUP_ORDER.map((group) => (
              <div key={group} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--champagne)', letterSpacing: '0.06em', marginBottom: 8 }}>{group}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SCREENS.filter((s) => s.group === group).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => jump(s.path)}
                      style={{
                        height: 36, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                        fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500,
                        background: idx === SCREENS.indexOf(s) ? 'linear-gradient(135deg, #F4E9CF, #C6A36B)' : 'rgba(255,255,255,0.07)',
                        color: idx === SCREENS.indexOf(s) ? 'var(--near-black)' : 'rgba(255,255,255,0.86)',
                        border: idx === SCREENS.indexOf(s) ? 'none' : '1px solid rgba(255,255,255,0.16)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(28,23,18,0.86)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 999, padding: 7, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
          <button
            onClick={() => idx > 0 && jump(SCREENS[idx - 1].path)}
            disabled={idx <= 0}
            style={navArrow(idx <= 0)}
          >
            <Icon name="arrowLeft" size={18} color="#fff" stroke={2} />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ height: 40, padding: '0 18px', borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600 }}
          >
            <Icon name="grid" size={17} color="var(--champagne)" stroke={1.9} />
            {idx >= 0 ? `${idx + 1} / ${SCREENS.length}` : 'Screens'}
            <Icon name="chevronDown" size={15} color="rgba(255,255,255,0.6)" stroke={2} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-base)' }} />
          </button>
          <button
            onClick={() => idx < SCREENS.length - 1 && jump(SCREENS[idx + 1].path)}
            disabled={idx >= SCREENS.length - 1}
            style={navArrow(idx >= SCREENS.length - 1)}
          >
            <Icon name="arrowRight" size={18} color="#fff" stroke={2} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
