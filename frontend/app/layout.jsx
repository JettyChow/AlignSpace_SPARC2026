import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'AlignSpace',
  description: 'AI-powered renovation workflow platform',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
