import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Emoclew — Built for Builders',
  description: 'An open platform where your idea grows into a real company.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
