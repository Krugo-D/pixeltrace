import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UploadZone from '@/components/UploadZone';

export default function TryPage() {
  return (
    <main className="space-y-12">
      <Header />

      <section className="glass-panel p-8 md:p-12 space-y-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400 font-bold">Autonomous Scan</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
            UPLOAD <span className="text-blue-600">ASSET</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Drop your image below to start an autonomous IP scan. Our engine cross-references global databases and matches visual vectors to surface high-risk signals in seconds.
          </p>
        </div>

        <UploadZone />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Engine Online</span>
          </div>
          <p className="text-xs text-slate-400 font-medium italic">
            Results are indicative. Use PixelTrace alongside internal review or legal counsel.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

