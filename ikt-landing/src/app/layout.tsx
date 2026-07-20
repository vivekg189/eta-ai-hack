import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Industrial Knowledge Twin (IKT) | AI-Powered Operational Intelligence",
  description:
    "Transform industrial documents into a Living Knowledge Twin. An AI-powered operational brain connecting maintenance records, engineering drawings, SOPs, and expert knowledge into one intelligent system.",
  keywords: "industrial AI, knowledge twin, digital twin, predictive maintenance, knowledge management, industrial intelligence",
  openGraph: {
    title: "Industrial Knowledge Twin – AI Operational Intelligence",
    description: "Turn industrial documents into a living AI brain. Connect assets, experts, and knowledge.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
