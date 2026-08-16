'use client';

import PhoneFrame from '@/components/frame/PhoneFrame';
import ScreenNav from '@/components/navigation/ScreenNav';

export default function AppShell({ children }) {
  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 0 100px',
      }}>
        <PhoneFrame>{children}</PhoneFrame>
      </div>
      <ScreenNav />
    </>
  );
}
