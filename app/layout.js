import './globals.css';
import AppShell from './components/AppShell';

export const metadata = {
  title: 'Race Expert · MCPanel',
  description: 'Mission Control Dashboard для управління компанією Race Expert',
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
