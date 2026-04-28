import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lionheart — Marketing Allocation Brief",
  description: "Marketing allocation dashboard for Lionheart Children's Academy",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
