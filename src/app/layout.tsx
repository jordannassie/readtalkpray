import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DemoAuthProvider } from "@/lib/demo/auth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Read Talk Pray",
  description: "A simple way to follow Jesus together. Join or start a Bible study group.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <DemoAuthProvider>{children}</DemoAuthProvider>
      </body>
    </html>
  );
}
