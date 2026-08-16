'use client';

import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import Icon from '@/components/Icon';

// Placeholder MESSAGES rows — mess_senderType/mess_messageType are the real
// columns; a short title + read state don't have their own columns, so they
// live in mess_metadata (JSON), matching how that column is meant to carry
// free-form extras. mess_createdAt is shown pre-formatted as relative time,
// same convention HistoryScreen uses for proj_updatedAt.
const NOTES = [
  { mess_id: 1, proj_id: 1, user_id_sender: null, mess_senderType: 'designer', mess_messageType: 'recommendation', mess_body: 'Your Living Room package was approved by Elena Ross.', mess_metadata: { title: 'Package approved', unread: true }, mess_createdAt: '2h ago' },
  { mess_id: 2, proj_id: 1, user_id_sender: null, mess_senderType: 'system', mess_messageType: 'system', mess_body: 'Confirm your brass fixture finish before Friday to stay on schedule.', mess_metadata: { title: 'Action required', unread: true }, mess_createdAt: '5h ago' },
  { mess_id: 3, proj_id: 1, user_id_sender: null, mess_senderType: 'designer', mess_messageType: 'text', mess_body: 'Elena left a note on your seating selections. Tap to review.', mess_metadata: { title: 'Designer comment', unread: false }, mess_createdAt: 'Yesterday' },
  { mess_id: 4, proj_id: 1, user_id_sender: null, mess_senderType: 'chatbot', mess_messageType: 'recommendation', mess_body: 'We found a new direction that matches 88% of your preferences.', mess_metadata: { title: 'New direction match', unread: false }, mess_createdAt: '3 days ago' },
];

// Icon/color are presentation only, derived from the real sender/message
// type columns rather than stored per-row.
function noteVisual(n) {
  if (n.mess_messageType === 'system') return { icon: 'alert-triangle', color: '#D4A45A' };
  if (n.mess_senderType === 'chatbot') return { icon: 'layers', color: 'rgba(247,242,234,0.5)' };
  if (n.mess_messageType === 'recommendation') return { icon: 'check-circle', color: '#7AB96B' };
  return { icon: 'message-circle', color: 'rgba(198,163,107,0.8)' };
}

export default function NotificationsScreen({ onBack }) {
  return (
    <LightScene>
      <AppBar onBack={onBack} title="Notifications" />
      <div style={{ position: 'absolute', top: 88, bottom: 0, left: 0, right: 0, overflowY: 'auto', padding: '16px 18px 40px' }}>
        {NOTES.map((n) => {
          const { icon, color } = noteVisual(n);
          const unread = n.mess_metadata?.unread;
          return (
            <div key={n.mess_id} style={{
              display: 'flex', gap: 14, padding: '16px', borderRadius: 20, marginBottom: 10,
              background: unread ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
              border: unread ? '1px solid rgba(198,163,107,0.25)' : '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
            }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={20} stroke={1.6} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: unread ? 700 : 600, color: 'rgba(247,242,234,0.95)' }}>{n.mess_metadata?.title}</span>
                  {unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--champagne)', flexShrink: 0, marginTop: 5 }} />}
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.45, color: 'rgba(247,242,234,0.58)', margin: '0 0 6px' }}>{n.mess_body}</p>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'rgba(247,242,234,0.35)' }}>{n.mess_createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </LightScene>
  );
}
