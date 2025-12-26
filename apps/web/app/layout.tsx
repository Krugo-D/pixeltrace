import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PixelTrace - AI IP Risk Scanner',
  description: 'Assess IP and commercial risk in AI-generated images',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}


