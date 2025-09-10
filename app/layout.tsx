// import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { GoogleAnalytics } from '@next/third-parties/google';
// import Navigation from '@/components/Navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

        {/* <Script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
        `,
          }}
        /> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased px-4 text-gray-950 dark:bg-gray-950 dark:text-white`}
      >
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
        {/* <!-- Google tag (gtag.js) --> */}
        <GoogleAnalytics gaId="G-CZS9K7V64W" />
        <DebugMobile />
      </body>
    </html>
  );
}
