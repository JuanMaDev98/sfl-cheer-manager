// Global app layout with Telegram init
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SFL Cheer Manager',
  description: 'Connect with Sunflower Land players for Help x Help and Cheer x Cheer exchanges',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body>{children}</body>
    </html>
  );
}
