'use client';

import DarkScene from '@/components/frame/DarkScene';
import { Mark } from '@/components/Logo';
import { GlassButton } from '@/components/Buttons';
import Icon from '@/components/Icon';
import { fullName } from '@/lib/schema';

// Placeholder USERS row for the assigned designer (user_id_assignedDesigner
// on PROJECTS is a FK — this stands in for the real join).
const ASSIGNED_DESIGNER = { user_id: 1, user_firstName: 'Elena', user_lastName: 'Ross' };

export default function HandoffScreen({ onHome }) {
  const designerName = fullName(ASSIGNED_DESIGNER);
  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 180deg, rgba(198,163,107,0.9) 0%, rgba(212,180,130,0.5) 40%, rgba(198,163,107,0.9) 100%)', filter: 'blur(8px)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(198,163,107,0.28), rgba(212,180,130,0.16))', backdropFilter: 'blur(8px)', border: '1px solid rgba(198,163,107,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={44} stroke={1.8} color="var(--champagne)" />
          </div>
        </div>

        <Mark size={32} style={{ marginBottom: 20 }} />

        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, textAlign: 'center', color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em', lineHeight: 1.15, margin: '0 0 10px' }}>Project submitted!</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, textAlign: 'center', color: 'rgba(247,242,234,0.6)', lineHeight: 1.55, marginBottom: 8 }}>Your design brief has been sent to</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '8px 20px', borderRadius: 999, background: 'rgba(198,163,107,0.12)', border: '1px solid rgba(198,163,107,0.35)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(198,163,107,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: 'var(--champagne)' }}>{designerName[0]}</div>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--champagne)' }}>{designerName} · Lead Designer</span>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          <GlassButton onClick={() => {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="file-text" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
              View project
            </div>
          </GlassButton>
          <GlassButton onClick={() => {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="download" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
              Download brief PDF
            </div>
          </GlassButton>
          <GlassButton onClick={() => {}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="send" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
              Share with team
            </div>
          </GlassButton>
        </div>

        <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.5)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Return home</button>
      </div>
    </DarkScene>
  );
}
