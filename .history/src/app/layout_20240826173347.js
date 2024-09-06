import { Inter } from 'next/font/google';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Trading Bot',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/public/favicon.png" />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
