import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF to CSV",
  description: "Convertit vos releves bancaires PDF en fichier CSV pour import comptable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
