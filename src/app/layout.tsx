import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { AuthInit } from "./AuthInit";


// Fonts
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  title: "SaaSify Dashboard",
  description: "Multi-role SaaS dashboard with mock APIs",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} bg-background text-foreground`}>
        <AuthInit />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
