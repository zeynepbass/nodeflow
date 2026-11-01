import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/app/Providers";
import { themeScript } from "@/features/theme/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "NodeFlow", template: "%s · NodeFlow" },
  description: "Kod yazmadan görsel otomasyon akışları oluşturma platformu.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
