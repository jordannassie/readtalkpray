import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RegisterServiceWorker } from "@/components/app/RegisterServiceWorker";
import { SHARE_IMAGE } from "@/components/brand/logos";
import { SITE } from "@/lib/groups/seo";
import { DemoAuthProvider } from "@/lib/demo/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#1976F3",
  viewportFit: "cover",
};

const description = "Find a Bible group near you. Read the Bible, talk about it, and pray together. A simple church gathering for anyone who wants to follow Jesus.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Bible Groups Near You | Read Talk Pray" },
  description,
  applicationName: "Read Talk Pray",
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "Read Talk Pray", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Bible Groups Near You | Read Talk Pray",
    description,
    url: SITE,
    siteName: "Read Talk Pray",
    type: "website",
    images: [{ url: SHARE_IMAGE, width: 1080, height: 1080, alt: "Read Talk Pray" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bible Groups Near You | Read Talk Pray",
    description,
    images: [SHARE_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <RegisterServiceWorker />
        <DemoAuthProvider>{children}</DemoAuthProvider>
      </body>
    </html>
  );
}
