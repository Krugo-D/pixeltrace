import Button from '@/components/Button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { RiskCategory, RiskResult } from '@pixeltrace/shared-types';

const BrandLogo = ({ slug, name }: { slug: string; name: string }) => (
  <div className="flex items-center justify-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 w-24 h-12">
    <img
      src={`https://cdn.simpleicons.org/${slug}/0f172a`}
      alt={name}
      className="max-h-full max-w-full object-contain"
    />
  </div>
);

const demoResults: RiskResult[] = [
  {
    category: RiskCategory.VISUAL_SIMILARITY,
    score: 92,
    confidence: 0.84,
    explanation: 'The composition, strokes, and shading closely mirror the reference art.',
  },
  {
    category: RiskCategory.TRADEMARK,
    score: 0,
    confidence: 0.55,
    explanation: 'No logos or brand elements were detected.',
  },
  {
    category: RiskCategory.COPYRIGHT,
    score: 69,
    confidence: 0.72,
    explanation: 'Stylistic cues match a protected art style.',
  },
  {
    category: RiskCategory.CHARACTER,
    score: 70,
    confidence: 0.68,
    explanation: 'Facial proportions hint at a recognized character.',
  },
  {
    category: RiskCategory.TRAINING_DATA,
    score: 20,
    confidence: 0.43,
    explanation: 'Training data signals are scattered with no strong bias.',
  },
  {
    category: RiskCategory.COMMERCIAL_USAGE,
    score: 72,
    confidence: 0.71,
    explanation: 'May need clearance for monetization due to overlapping usage patterns.',
  },
];

const howItWorks = [
  {
    title: 'Unified risk scan',
    detail: 'Pixels, trademarks, characters, and training data are measured together so nothing slips through.',
  },
  {
    title: 'Confidence-forward signal',
    detail: 'Every score comes with a digestible explanation so you know how much to trust it.',
  },
  {
    title: 'Release with clarity',
    detail: 'Decide if a design is ready, needs tweaks, or should be flagged for legal review.',
  },
];

const faqs = [
  {
    question: 'What does PixelTrace actually look for?',
    answer:
      'We evaluate visual similarity, brand confusion, copyright mimicking, character likeness, training data overlap, and commercial usage patterns in one pass.',
  },
  {
    question: 'Is this legal advice?',
    answer:
      'No, PixelTrace surfaces red flags and confidence bands, but human review is required before making legal decisions.',
  },
  {
    question: 'How do I test it?',
    answer:
      'Head to the Try page, drop an image, and review the radar to see how each category scores.',
  },
];

export default function Home() {
  return (
    <div className="space-y-16">
      <Header />

      <section className="glass-panel p-8 lg:p-12 space-y-10 bg-white/80">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">AI IP risk intelligence</p>
            <h1 className="section-heading text-slate-900 leading-tight">
              Understand every angle of IP risk before publishing generative assets.
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              PixelTrace turns every trademark, copyright, and likeness signal into a single, confidence-weighted snapshot so you can release work with clarity.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/try">
                Upload an image
              </Button>
              <Button href="#map" variant="outline">
                See the radar
              </Button>
            </div>
          </div>
          <div className="card-panel p-6 sm:p-8">
            <p className="text-sm font-semibold text-slate-500">Live scan preview</p>
            <div className="mt-5 space-y-3">
              {demoResults.slice(0, 3).map(result => (
                <div key={result.category} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{result.score} • {result.category.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-semibold text-sky-600">{Math.round(result.confidence * 100)}% confident</span>
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-slate-500">
              Navigate from upload to radar in seconds. Pull samples to compare risk trends across projects.
            </div>
          </div>
        </div>

        {/* Brand Carousel */}
        <div className="pt-8 border-t border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold mb-8 text-center">
            Trusted by internal IP teams at global leaders
          </p>
          <div className="relative flex overflow-hidden group">
            <div className="flex space-x-16 animate-scroll group-hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center space-x-16 shrink-0">
                  <BrandLogo slug="nike" name="Nike" />
                  <BrandLogo slug="apple" name="Apple" />
                  <BrandLogo slug="sony" name="Sony" />
                  <BrandLogo slug="bmw" name="BMW" />
                  <BrandLogo slug="bose" name="Bose" />
                  <BrandLogo slug="samsung" name="Samsung" />
                  <BrandLogo slug="adidas" name="Adidas" />
                  <BrandLogo slug="toyota" name="Toyota" />
                  <BrandLogo slug="netflix" name="Netflix" />
                  <BrandLogo slug="intel" name="Intel" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-slate-400">What we do</p>
            <h2 className="text-3xl font-semibold text-slate-900">Autonomous IP intelligence for generative assets</h2>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.map(block => (
            <div key={block.title} className="card-panel p-6 space-y-3">
              <h3 className="text-xl font-semibold text-slate-900">{block.title}</h3>
              <p className="text-sm text-slate-600">{block.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="upload" className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Instant Access</p>
          <h2 className="text-3xl font-semibold text-slate-900">Ready to scan your own generative assets?</h2>
        </div>
        <div className="flex flex-col items-center justify-center space-y-6 py-12 glass-panel bg-gradient-to-br from-white/80 to-slate-50/80">
          <p className="text-slate-600 text-center max-w-md px-4">
            Get a comprehensive risk breakdown in seconds. No credit card or account required.
          </p>
          <Button href="/try" size="lg">
            Try PixelTrace Now
          </Button>
        </div>
      </section>

      <section id="faq" className="space-y-8">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">FAQ</p>
          <h2 className="text-3xl font-semibold text-slate-900">FAQ</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {faqs.map(faq => (
            <div key={faq.question} className="card-panel p-6 space-y-3">
              <p className="text-sm font-semibold text-slate-800">{faq.question}</p>
              <p className="text-sm text-slate-500">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}


