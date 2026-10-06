import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fake Artist",
  description: "A multiplayer party game of drawing, bluffing, and mystery. Can you spot the fake artist?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#2D2D2D]">
        {children}
      </body>
    </html>
  );
}
