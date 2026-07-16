import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

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
  title: "Нумерология",
  description: "Онлайн-нумерология: числа судьбы, матрица судьбы, совместимость, ангельские числа.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-parchment antialiased`}
      >
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "Нумерология",
                  "url": "https://chislavlasti.com/"
                },
                {
                  "@type": "Organization",
                  "name": "Нумерология",
                  "url": "https://chislavlasti.com/",
                  "logo": "https://chislavlasti.com/images/logo.png",
                  "sameAs": ["https://t.me/chisla_vlasti"]
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
