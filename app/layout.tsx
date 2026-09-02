import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Xirfad Maal Academy',
  description: 'Baro xirfado casri ah, dhis mustaqbalkaaga.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="so"><body>{children}</body></html>;
}
