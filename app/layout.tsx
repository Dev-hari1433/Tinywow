import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'TinyClone — 253 file tools, built end to end',
  description:
    'A working reconstruction of a file-tool site: PDF, image, data and utility tools processed server-side with signed downloads.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="logo">
              <span className="logo-mark">T</span>
              TinyClone
            </Link>
            <nav className="nav">
              <Link href="/tools">All tools</Link>
              <Link href="/tools?category=pdf">PDF</Link>
              <Link href="/tools?category=image">Image</Link>
              <Link href="/tools?category=converter">Data</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <span>
              TinyClone — an independent reimplementation. Uploaded files are deleted one hour after processing.
            </span>
            <span className="note">
              Not affiliated with the site it was reconstructed from.
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
