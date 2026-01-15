import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Pipeline App",
  description: "Professional Video Recording and Asset Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {/* Main Content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}