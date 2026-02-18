import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.15) {
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

const steps = [
  {
    number: '1',
    title: 'Complete your SCARF assessment',
    time: '5 minutes',
    description: 'Five sliders that map your leadership profile across Status, Certainty, Autonomy, Relatedness, and Fairness.',
  },
  {
    number: '2',
    title: 'Send the team pulse survey',
    time: '2 minutes for your team',
    description: 'An anonymous 7-question survey (Edmondson\'s validated scale) goes to your direct reports. Results arrive in 48-72 hours.',
  },
  {
    number: '3',
    title: 'Pick your first micro-behavior',
    time: '1 minute',
    description: 'Choose one small behavior to practice — like "Ask a genuine question before stating your view" — and connect your preferred channels.',
  },
];

export default function GetStarted() {
  const { ref, inView } = useInView();

  return (
    <section id="get-started" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 lg:px-8" ref={ref}>
        <div className="text-center mb-16">
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Ready to start?
          </h2>
          <p className={`text-lg text-white/50 leading-relaxed max-w-xl mx-auto ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            The whole onboarding takes about 8 minutes. Your first nudge arrives
            2-3 days later, timed to your next relevant meeting.
          </p>
        </div>

        {/* Steps */}
        <div className={`space-y-6 max-w-2xl mx-auto mb-16 ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-5 rounded-xl bg-white/[0.04] border border-white/[0.08] p-6 transition-all hover:bg-white/[0.08]"
            >
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-amber/20 text-amber font-bold text-lg">
                {step.number}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-semibold">{step.title}</h3>
                  <span className="text-xs text-white/30 font-medium">{step.time}</span>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center ${inView ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
          <a
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-amber px-10 py-4 text-base font-semibold text-white shadow-lg shadow-amber/25 transition-all hover:bg-amber-dark hover:shadow-xl hover:shadow-amber/30 hover:-translate-y-0.5"
          >
            Begin Your Assessment
            <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <p className="mt-6 text-xs text-white/20">
            Your data is private. Only you see your coaching insights.
            Team surveys are always anonymous.
          </p>
        </div>
      </div>
    </section>
  );
}
