import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diary Sticker Maker",
  description: "Create printable diary sticker layouts from your notes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
