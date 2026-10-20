import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kamesh M R — Artificial Intelligence Developer & Full-Stack Engineer",
  description:
    "Portfolio of Kamesh M R — Artificial Intelligence Developer experienced in building AI-agent-powered features, ML workflows, and production full-stack platforms (GoJobSync).",
  keywords: [
    "Kamesh M R",
    "Artificial Intelligence Developer",
    "Application Developer",
    "AI Agent & LLM",
    "Next.js",
    "React.js",
    "Python",
    "Prisma ORM",
    "Supabase",
    "AWS",
    "GoJobSync",
    "Chennai Developer",
  ],
  authors: [{ name: "Kamesh M R" }],
  openGraph: {
    title: "Kamesh M R — Artificial Intelligence Developer",
    description:
      "Artificial Intelligence Developer experienced in AI agents, ML workflows, and full-stack production platforms.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}