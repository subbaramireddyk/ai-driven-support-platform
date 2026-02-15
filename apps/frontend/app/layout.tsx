import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Support Platform",
  description: "AI-driven support platform for DevOps teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
