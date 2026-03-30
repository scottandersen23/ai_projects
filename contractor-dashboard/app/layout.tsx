import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContractorAI Dashboard",
  description:
    "High-level contractor service metrics and dashboard customization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
