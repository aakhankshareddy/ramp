import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAMP",
  description: "Inventory and Billing Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white shadow-sm">
          <div className="flex h-16 items-center px-4 max-w-7xl mx-auto container">
            <Link href="/" className="text-xl font-bold mr-8">RAMP</Link>
            <div className="flex items-center space-x-6">
              <Link href="/bill-book" className="text-sm font-medium transition-colors hover:text-primary">
                Bill Book
              </Link>
              <Link href="/stock-book" className="text-sm font-medium transition-colors hover:text-primary">
                Stock Book
              </Link>
            </div>
          </div>
        </nav>
        <div className="container mx-auto py-6 max-w-7xl">
            {children}
        </div>
      </body>
    </html>
  );
}
