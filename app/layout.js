import './globals.css';
import AppShell from './components/AppShell';

export const metadata = {
  title: 'Race Expert · MCPanel',
  description: 'Mission Control Dashboard для управління компанією Race Expert',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0A0A0C',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
