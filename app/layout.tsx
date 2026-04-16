import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ghosted.vercel.app"),
  applicationName: "Ghosted",
  title: {
    default: "Ghosted | Evaluate the Job Post",
    template: "%s | Ghosted",
  },
  description:
    "Ghosted evaluates the quality of a job posting itself with explainable signals for seriousness, transparency, clarity, requirement inflation, and applicant ROI.",
  keywords: [
    "job post analysis",
    "job posting quality",
    "job transparency",
    "applicant ROI",
    "Ghosted",
  ],
  openGraph: {
    title: "Ghosted",
    description:
      "Ghosted evaluates jobs, not applicants. Paste a posting and get an explainable quality analysis.",
    url: "https://ghosted.vercel.app",
    siteName: "Ghosted",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Ghosted job-post intelligence preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghosted",
    description:
      "Paste a job post and get an explainable breakdown of posting quality.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteShell>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </SiteShell>
        <Analytics />
      </body>
    </html>
  );
}
