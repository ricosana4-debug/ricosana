import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Starlish Bimbel - Light Up Your Future | Bimbingan Belajar Terbaik di Gading Serpong",
  description: "Starlish Bimbel adalah lembaga bimbingan belajar terpercaya di Gading Serpong. Menyediakan program Calistung TK, Bimbel SD, SMP, dan SMA dengan kelas kecil, guru berpengalaman, dan sistem belajar terstruktur.",
  keywords: ["bimbel", "bimbingan belajar", "les privat", "calistung", "Gading Serpong", "Tangerang", "Starlish", "bimbel SD", "bimbel SMP", "bimbel SMA"],
  authors: [{ name: "Starlish Bimbel" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Starlish Bimbel - Light Up Your Future",
    description: "Tempat anak belajar dan tumbuh bersama. Bimbingan belajar terbaik di Gading Serpong.",
    url: "https://starlishbimbel.com",
    siteName: "Starlish Bimbel",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Starlish Bimbel - Light Up Your Future",
    description: "Tempat anak belajar dan tumbuh bersama. Bimbingan belajar terbaik di Gading Serpong.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
