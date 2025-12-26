export default function Footer() {
  return (
    <footer className="border-t border-slate-200 pt-10 pb-8 text-center text-xs text-slate-500 mt-16">
      <p className="mb-2">© {new Date().getFullYear()} PixelTrace Labs. Designed for responsible AI teams.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href="/#how" className="hover:text-slate-900 transition">
          About
        </a>
        <a href="/#faq" className="hover:text-slate-900 transition">
          FAQ
        </a>
        <a href="mailto:hello@pixeltrace.ai" className="hover:text-slate-900 transition">
          hello@pixeltrace.ai
        </a>
      </div>
    </footer>
  );
}

