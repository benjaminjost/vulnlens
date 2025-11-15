import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vulnx – CVE Search",
  description: "Search and explore CVE vulnerabilities with Vulnx Web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script id="theme-pref" strategy="beforeInteractive">
          {`(function(){try{var s='vulnxTheme';var stored=localStorage.getItem(s);var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=stored|| (prefersDark?'dark':'light');if(theme==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
