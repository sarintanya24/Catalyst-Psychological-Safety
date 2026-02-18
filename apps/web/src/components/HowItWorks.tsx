import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    title: 'Assess',
    subtitle: 'Your SCARF Profile',
    description:
      'A 5-minute neuroscience-based assessment maps your unique leadership profile across Status, Certainty, Autonomy, Relatedness, and Fairness. Your team completes a brief anonymous pulse survey so you can see where you stand.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 8V16L22 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
    color: 'sage' as const,
  },
  {
    number: '02',
    title: 'Practice',
    subtitle: 'AI-Powered Micro-Behaviors',
    description:
      'Pick one small behavior to practice — like "Ask a genuine question before stating your view." Catalyst delivers personalized nudges through Slack, email, or before your meetings. Each takes under 30 seconds.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 16C6 10.477 10.477 6 16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 16C10 12.686 12.686 10 16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 16C14 14.895 14.895 14 16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <path d="M16 18C17.105 18 18 18.895 18 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 22C19.314 22 22 19.314 22 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 26C21.523 26 26 21.523 26 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    color: 'amber' as const,
  },
  {
    number: '03',
    title: 'Grow',
    subtitle: 'Measure & Cascade',
    description:
      'Track your progress through Mirror Moments — side-by-side views of how you see yourself vs. how your team experiences you. As you grow, invite your direct reports to begin their own journey.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 10.5L10 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 10.5L22 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M11 22H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
      </svg>
    ),
    color: 'coral' as const,
  },
];

const colorMap = {
  sage: {
    bg: 'bg-sage/10',
    border: 'border-sage/20',
    text: 'text-sage',
    dot: 'bg-sage',
    line: 'bg-sage/20',
  },
  amber: {
    bg: 'bg-amber/10',
    border: 'border-amber/20',
    text: 'text-amber',
    dot: 'bg-amber',
    line: 'bg-amber/20',
  },
  coral: {
    bg: 'bg-coral/10',
    border: 'border-coral/20',
    text: 'text-coral',
    dot: 'bg-coral',
    line: 'bg-coral/20',
  },
};

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

export default function HowItWorks() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-navy/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className={`text-sm font-semibold tracking-widest uppercase text-amber mb-4 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            How It Works
          </p>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy leading-tight ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Your path to a{' '}
            <span className="gradient-text">safer team culture</span>
          </h2>
          <p className={`mt-6 text-lg text-navy/50 leading-relaxed ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Built on David Rock's SCARF model and Amy Edmondson's research.
            Private, personalized, and designed to fit into the way you already work.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, i) => {
            const colors = colorMap[step.color];
            return (
              <div
                key={step.number}
                className={`group relative ${inView ? `animate-fade-in-up delay-${(i + 3) * 200}` : 'opacity-0'}`}
              >
                <div className="rounded-2xl bg-cream/50 border border-navy/5 p-8 lg:p-10 transition-all duration-500 hover:bg-white hover:shadow-xl hover:shadow-navy/5 hover:border-navy/10 hover:-translate-y-1">
                  {/* Step number */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} border ${colors.border} ${colors.text} transition-transform group-hover:scale-110`}>
                      {step.icon}
                    </div>
                    <span className={`text-xs font-bold tracking-widest uppercase ${colors.text}`}>
                      Step {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-navy mb-1">
                    {step.title}
                  </h3>
                  <p className={`text-sm font-semibold ${colors.text} mb-4`}>
                    {step.subtitle}
                  </p>
                  <p className="text-navy/50 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connector line (desktop) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-6 w-8 lg:w-12">
                      <div className={`h-px ${colors.line} w-full`} />
                      <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full ${colors.dot}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
