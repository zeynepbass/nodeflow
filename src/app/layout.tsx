import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NodeFlow",
  description: "Kod yazmadan görsel otomasyon akışları oluşturma platformu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
