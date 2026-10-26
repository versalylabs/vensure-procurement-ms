import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vensure — Wholesale & Procurement Management System",
    template: "%s | Vensure",
  },
  description:
    "End-to-end procurement lifecycle management & nationwide wholesale distribution: Vendor trust. Purchase certainty.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#171721] text-[#ededf3] antialiased">
        {children}
      </body>
    </html>
  );
}
