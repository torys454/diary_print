import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diary Print',
  description: '日記画像を分割して印刷用PNGを作成'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
