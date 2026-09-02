import type { Metadata } from 'next';
import './globals.css';
import './animations.css';
import './admin/website/website.css';

export const metadata: Metadata = {
  title: 'Xirfad Maal Academy',
  description: 'Baro xirfado casri ah, dhis mustaqbalkaaga.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="so"><body>{children}</body></html>;
}
