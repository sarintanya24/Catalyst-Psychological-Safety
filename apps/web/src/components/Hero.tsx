import { useEffect, useState } from 'react';

function PerceptionBar({
  label,
  percentage,
  color,
  delay,
}: {
  label: string;
  percentage: number;
  color: 'sage' | 'coral';
  delay: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const bgColor = color === 'sage' ? 'bg-sage' : 'bg-coral';
  const textColor = color === 'sage' ? 'text-sage-dark' : 'text-coral-dark';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy/70">{label}</span>
        <span className={`text-sm font-bold ${textColor}`}>
          {visible ? `${percentage}%` : '0%'}
        </span>
      </div>
      <div className="h-10 w-full rounded-full bg-navy/5 overflow-hidden">
        {visible && (
          <div
            className={`h-full ${bgColor} rounded-full animate-grow-bar flex items-center justify-end pr-4`}
            style={{ '--target-width': `${percentage}%` } as React.CSSProperties}
          >
            <span className="text-sm font-bold text-white drop-shadow-sm">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream-dark" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-sage/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-4 py-1.5 mb-8">
                <div className="h-1.5 w-1.5 rounded-full bg-sage animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-navy/60 uppercase">
                  Internal Leadership Tool
                </span>
              </div>
            </div>

            <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-navy">
              Build teams where people{' '}
              <span className="gradient-text">actually speak up.</span>
            </h1>

            <p className="animate-fade-in-up delay-300 mt-6 text-lg text-navy/60 leading-relaxed max-w-lg">
              Catalyst helps leaders across our organization close the gap between
              how safe we think our teams feel and how they actually feel &mdash;
              through private, AI-powered coaching built into the tools you already use.
            </p>

            <div className="animate-fade-in-up delay-500 mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#get-started"
                className="inline-flex items-center justify-center rounded-full bg-amber px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-amber/25 transition-all hover:bg-amber-dark hover:shadow-xl hover:shadow-amber/30 hover:-translate-y-0.5"
              >
                Begin Your Assessment
                <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border-2 border-navy/10 px-8 py-3.5 text-base font-semibold text-navy transition-all hover:border-navy/30 hover:bg-white/50"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right: Perception Gap Visual */}
          <div className="animate-fade-in-up delay-400">
            <div className="rounded-2xl bg-white p-8 lg:p-10 shadow-xl shadow-navy/5 border border-navy/5">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-navy/5 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V14M2 8H14" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    The Perception Gap
                  </h3>
                </div>
                <p className="text-sm text-navy/50 leading-relaxed">
                  Research shows leaders consistently overestimate how safe their
                  teams feel. This invisible gap silently erodes trust, innovation,
                  and retention.
                </p>
              </div>

              <div className="space-y-6">
                <PerceptionBar
                  label="Leaders who believe their team feels safe"
                  percentage={87}
                  color="sage"
                  delay={800}
                />
                <PerceptionBar
                  label="Individual contributors who actually feel safe"
                  percentage={53}
                  color="coral"
                  delay={1400}
                />
              </div>

              <div className="mt-8 flex items-center gap-3 rounded-xl bg-coral/5 p-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-coral">34</span>
                </div>
                <p className="text-sm text-navy/70 font-medium">
                  <span className="text-coral font-bold">34-point gap</span> between
                  how leaders perceive safety and how their teams experience it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
