import Link from 'next/link';
import LogoMark from './LogoMark';
import Button from './Button';

export default function Header() {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
      <Link href="/">
        <LogoMark />
      </Link>
      <nav className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
        <Link href="/#how" className="hover:text-slate-900 transition">
          How it Works
        </Link>
        <Link href="/#map" className="hover:text-slate-900 transition">
          Risk Map
        </Link>
        <Link href="/#faq" className="hover:text-slate-900 transition">
          FAQ
        </Link>
      </nav>
      <Button href="/try" size="sm">
        Try PixelTrace
      </Button>
    </header>
  );
}

