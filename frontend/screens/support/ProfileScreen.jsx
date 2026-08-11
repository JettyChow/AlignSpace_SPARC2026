'use client';

import { useState } from 'react';
import LightScene from '@/components/frame/LightScene';
import AppBar from '@/components/frame/AppBar';
import GlassPanel from '@/components/GlassPanel';
import Icon from '@/components/Icon';

function Toggle({ on, set }) {
  return (
    <button onClick={() => set(!on)} style={{
      width: 48, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
      flex: 'none', padding: 3,
      background: on ? 'var(--champagne)' : 'rgba(95,85,76,0.2)',
      transition: 'background var(--dur-base) var(--ease-soft)',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transform: on ? 'translateX(20px)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-soft)',
      }} />
    </button>
  );
}

function Row({ icon, label, trailing, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '15px 4px', cursor: 'pointer', background: 'none', border: 'none',
      borderBottom: '1px solid var(--line)', textAlign: 'left',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, flex: 'none',
        background: 'var(--soft-beige)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={19} color="var(--dark-taupe)" stroke={1.7} />
      </div>
      <span style={{
        flex: 1, fontFamily: 'var(--font-sans)', fontSize: 15.5,
        fontWeight: 500, color: 'var(--fg-1)',
      }}>{label}</span>
      {trailing || <Icon name="chevronRight" size={18} color="var(--fg-3)" stroke={2} />}
    </button>
  );
}

export default function ProfileScreen({ onBack }) {
  const [notif, setNotif] = useState(true);
  const [updates, setUpdates] = useState(false);

  return (
    <LightScene>
      <AppBar onBack={onBack} title="Profile" />
      <div style={{ position: 'absolute', inset: 0, padding: '104px 22px 40px', overflowY: 'auto', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{
            width: 86, height: 86, borderRadius: '50%',
            background: 'var(--champagne-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-warm)', marginBottom: 14,
          }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 32, fontWeight: 600, color: '#fff' }}>M</span>
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600, color: 'var(--fg-1)' }}>Maya Chen</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--fg-3)', marginTop: 2 }}>Client · 2 active projects</div>
        </div>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '0 0 4px 4px' }}>Account</div>
        <GlassPanel style={{ padding: '0 18px', marginBottom: 22 }}>
          <Row icon="user" label="Personal details" />
          <Row icon="ruler" label="My designer · Elena Ross" />
          <Row icon="dollar" label="Budget preferences" />
        </GlassPanel>

        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', margin: '0 0 4px 4px' }}>Settings</div>
        <GlassPanel style={{ padding: '0 18px', marginBottom: 22 }}>
          <Row icon="bell" label="Push notifications" trailing={<Toggle on={notif} set={setNotif} />} />
          <Row icon="mail" label="Email updates" trailing={<Toggle on={updates} set={setUpdates} />} />
          <Row icon="settings" label="App preferences" />
        </GlassPanel>

        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 9, height: 52, borderRadius: 999, cursor: 'pointer',
          background: 'transparent', border: '1px solid var(--line-strong)',
          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600, color: 'var(--fg-2)',
        }}>
          <Icon name="logout" size={18} stroke={1.8} color="var(--fg-2)" /> Sign out
        </button>
      </div>
    </LightScene>
  );
}
