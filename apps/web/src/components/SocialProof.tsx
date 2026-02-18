import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function AnimatedNumber({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      setValue(current);
      if (step >= steps) clearInterval(interval);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [inView, target]);

  return (
    <span>
      {inView ? value : 0}
      {suffix}
    </span>
  );
}

const stats = [
  {
    value: 230,
    suffix: '%',
    label: 'ROI on psychological safety investment',
    source: 'Gallup',
    color: 'text-sage',
    bgColor: 'bg-sage/10',
    borderColor: 'border-sage/20',
  },
  {
    value: 27,
    suffix: '%',
    label: 'Reduction in employee turnover',
    source: 'Google Project Aristotle',
    color: 'text-amber',
    bgColor: 'bg-amber/10',
    borderColor: 'border-amber/20',
  },
  {
    value: 76,
    suffix: '%',
    label: 'More engagement when teams feel safe',
    source: 'Edmondson',
    color: 'text-coral',
    bgColor: 'bg-coral/10',
    borderColor: 'border-coral/20',
  },
  {
    value: 50,
    suffix: '%',
    label: 'Higher productivity in safe teams',
    source: 'McKinsey',
    color: 'text-navy',
    bgColor: 'bg-navy/5',
    borderColor: 'border-navy/10',
  },
];

export default function SocialProof() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="results" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy opacity-90" />

      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className={`text-sm font-semibold tracking-widest uppercase text-amber mb-4 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            The Evidence
          </p>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            The research is clear
          </h2>
          <p className={`mt-6 text-lg text-white/50 leading-relaxed ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Psychological safety isn't soft. It's the highest-leverage investment
            in organizational performance.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`group rounded-2xl bg-white/[0.04] border border-white/[0.08] p-8 text-center transition-all duration-500 hover:bg-white/[0.08] hover:border-white/[0.15] hover:-translate-y-1 ${
                inView ? `animate-count-up delay-${(i + 3) * 200}` : 'opacity-0'
              }`}
            >
              <div className={`text-5xl lg:text-6xl font-extrabold ${stat.color} mb-3 tracking-tight`}>
                <AnimatedNumber target={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <p className="text-white/70 font-medium leading-snug mb-3">
                {stat.label}
              </p>
              <p className="text-xs text-white/30 font-medium uppercase tracking-wider">
                {stat.source}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className={`mt-16 text-center ${inView ? 'animate-fade-in-up delay-1200' : 'opacity-0'}`}>
          <blockquote className="max-w-3xl mx-auto">
            <p className="text-xl lg:text-2xl text-white/60 font-light italic leading-relaxed">
              "There's no team-level factor more important than psychological safety."
            </p>
            <footer className="mt-4 text-sm text-white/30 font-medium">
              -- Amy Edmondson, Harvard Business School
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
