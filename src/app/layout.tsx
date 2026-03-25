import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Oráculo",
  description: "Experiência interativa de voz guiada por IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
