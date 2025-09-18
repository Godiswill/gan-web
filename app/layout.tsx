// import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SessionProvider } from 'next-auth/react';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import DebugMobile from '@/components/DebugMobile';
import '@/styles/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-display text-[16px]"
      suppressHydrationWarning
    >
      <head>
        <meta
          name="keywords"
          content="background remover, remove background, background removal, free background remover, transparent PNG, AI image editing"
        />
        <meta name="robots" content="index, follow" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
        {/* <!-- Google tag (gtag.js) --> */}
        <GoogleAnalytics gaId="G-CZS9K7V64W" />
        <DebugMobile />
      </body>
    </html>
  );
}
