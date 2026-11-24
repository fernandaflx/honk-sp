import type { Metadata, Viewport } from "next";
import "./globals.css";
const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004",
);
const basePath = process.env.PAGES_BASE_PATH ?? "";
const socialImageUrl = new URL(`${basePath}/og-image.png`, siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  icons: { icon: `${basePath}/icon.svg` },
  title: "HONK! SP 2026 — Guia independente da programação",
  description:
    "De 26 a 29 de novembro: consulte dias, palcos, fanfarras e festas do HONK! SP 2026. Guia independente do Festival de Fanfarras Ativistas em São Paulo.",
  openGraph: {
    title: "HONK! SP 2026 — A programação tá aqui",
    description:
      "26—29 de novembro. Fanfarras, palcos e encontros em São Paulo. Guia independente.",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: socialImageUrl,
        width: 1200,
        height: 630,
        alt: "HONK! SP 2026 · 26 a 29 de novembro · Guia independente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HONK! SP 2026",
    images: [socialImageUrl],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F58AB8",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
