import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/services/auth/auth-context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PrepStreak AI — AI-Powered Competitive Exam Preparation",
  description:
    "Prepare smarter and practice daily for Banking, SSC, Railways, UPSC, and state competitive exams. Master topics with Axmok AI tutoring, dynamic questions, timed tests, and streak analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAFAF9] text-[#0F172A]`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
