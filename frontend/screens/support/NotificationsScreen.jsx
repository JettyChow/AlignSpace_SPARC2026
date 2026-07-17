'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import Icon from '@/components/Icon';

const NOTES = [
  { id: 1, icon: 'check-circle', iconColor: '#7AB96B', title: 'Package approved', body: 'Your Living Room package was approved by Elena Ross.', time: '2h ago', unread: true },
  { id: 2, icon: 'alert-triangle', iconColor: '#D4A45A', title: 'Action required', body: 'Confirm your brass fixture finish before Friday to stay on schedule.', time: '5h ago', unread: true },
  { id: 3, icon: 'message-circle', iconColor: 'rgba(198,163,107,0.8)', title: 'Designer comment', body: 'Elena left a note on your seating selections. Tap to review.', time: 'Yesterday', unread: false },
  { id: 4, icon: 'layers', iconColor: 'rgba(247,242,234,0.5)', title: 'New direction match', body: 'We found a new direction that matches 88% of your preferences.', time: '3 days ago', unread: false },
];

export default function NotificationsScreen({ onBack }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} title="Notifications" />
      <div style={{ position: 'absolute', top: 88, bottom: 0, left: 0, right: 0, overflowY: 'auto', padding: '16px 18px 40px' }}>
        {NOTES.map((n, i) => (
          <div key={n.id} style={{
            display: 'flex', gap: 14, padding: '16px', borderRadius: 20, marginBottom: 10,
            background: n.unread ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
            border: n.unread ? '1px solid rgba(198,163,107,0.25)' : '1px solid rgba(255,255,255,0.07)',
            cursor: 'pointer',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={n.icon} size={20} stroke={1.6} color={n.iconColor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: n.unread ? 700 : 600, color: 'rgba(247,242,234,0.95)' }}>{n.title}</span>
                {n.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--champagne)', flexShrink: 0, marginTop: 5 }} />}
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, color: 'rgba(247,242,234,0.58)', margin: '0 0 6px' }}>{n.body}</p>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'rgba(247,242,234,0.35)' }}>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </LightScene>
  );
}
