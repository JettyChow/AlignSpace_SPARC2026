'use client';

import DarkScene from '@/components/frame/DarkScene';
import { Mark } from '@/components/Logo';
import { GlassButton } from '@/components/Buttons';
import Icon from '@/components/Icon';

// Copy per handoff status. 'offline' is the TEMP-ID demo flow where no
// backend project exists — we say so instead of pretending it was delivered.
const STATUS_COPY = {
  sending: {
    title: 'Submitting project…',
    subtitle: 'Sending your design brief to the studio.',
  },
  sent: {
    title: 'Project submitted!',
    subtitle: 'Your design brief has been sent to your design team.',
  },
  error: {
    title: "Couldn't submit project",
    subtitle: null, // page passes the real error message
  },
  offline: {
    title: 'Project ready!',
    subtitle: 'Your brief is saved on this device. Connect the studio backend to deliver it to a designer.',
  },
};

export default function HandoffScreen({ status = 'sent', error, onRetry, onViewProject, onDownloadBrief, onHome }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.sent;
  const failed = status === 'error';
  const sending = status === 'sending';

  return (
    <DarkScene>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px' }}>
        <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'conic-gradient(from 180deg, rgba(198,163,107,0.9) 0%, rgba(212,180,130,0.5) 40%, rgba(198,163,107,0.9) 100%)', filter: 'blur(8px)', opacity: 0.5, animation: sending ? 'handoffSpin 1.6s linear infinite' : 'none' }} />
          <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(198,163,107,0.28), rgba(212,180,130,0.16))', backdropFilter: 'blur(8px)', border: '1px solid rgba(198,163,107,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={failed ? 'file-text' : sending ? 'send' : 'check'} size={44} stroke={1.8} color="var(--champagne)" />
          </div>
          <style>{`@keyframes handoffSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

        <Mark size={32} style={{ marginBottom: 20 }} />

        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 30, fontWeight: 600, textAlign: 'center', color: 'rgba(247,242,234,0.97)', letterSpacing: '-0.015em', lineHeight: 1.15, margin: '0 0 10px' }}>{copy.title}</h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, textAlign: 'center', color: 'rgba(247,242,234,0.6)', lineHeight: 1.55, marginBottom: 36, maxWidth: 300 }}>
          {failed ? (error || 'Something went wrong while sending your brief.') : copy.subtitle}
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {failed && (
            <GlassButton onClick={onRetry}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="send" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
                Try again
              </div>
            </GlassButton>
          )}
          {!sending && !failed && (
            <GlassButton onClick={onViewProject}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="file-text" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
                View project
              </div>
            </GlassButton>
          )}
          {!sending && !failed && onDownloadBrief && (
            <GlassButton onClick={onDownloadBrief}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="download" size={18} stroke={1.6} color="rgba(247,242,234,0.8)" />
                Download brief PDF
              </div>
            </GlassButton>
          )}
        </div>

        <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(247,242,234,0.5)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Return home</button>
      </div>
    </DarkScene>
  );
}
