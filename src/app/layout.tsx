import type { Metadata } from 'next';
import { Paytone_One, Space_Grotesk } from 'next/font/google';
import './globals.css';

const paytoneOne = Paytone_One({
  variable: '--font-paytone',
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Celebrate! 🎉',
  description: 'Click the button. Feel the joy. Celebrate anything.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${paytoneOne.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
