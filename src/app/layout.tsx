import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "./components/nav/TopNavBar";
import AuthProviderWrapper from "../app/components/auth/AuthProviderWrapper";
import NewPlayerModal from "./components/player/NewPlayerModal";
import ErrorBoundary from "./components/error/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Scrum Poker",
  description: "Agile Scrum Estimation Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" data-theme="business">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-200`}
        >
          <AuthProviderWrapper>
            <ErrorBoundary>
              <TopNavBar />
              <NewPlayerModal />
              <main className="container mx-auto px-4 py-4">{children}</main>
            </ErrorBoundary>
          </AuthProviderWrapper>
        </body>
      </html>
  );
}
