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

const features = [
  {
    tag: 'Your Controls',
    title: 'The 3-Dial System',
    description:
      'You control everything with three simple dials: how often you get nudges, how deep the insights go, and which channels deliver them. If you get busy, the system automatically dials itself down. No guilt. No missed-days alerts.',
    detail:
      'Frequency (gentle to daily), Depth (one sentence to full data), Channels (Slack, email, Teams, mobile).',
    visual: (
      <div className="flex items-center justify-center gap-6 py-8">
        {[
          { label: 'Frequency', value: 72, color: '#4A9E7D' },
          { label: 'Depth', value: 85, color: '#E8913A' },
          { label: 'Channels', value: 61, color: '#E07A6B' },
        ].map((dial) => (
          <div key={dial.label} className="flex flex-col items-center gap-3">
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="#1B2A4A"
                  strokeOpacity="0.06"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke={dial.color}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(dial.value / 100) * 213.6} 213.6`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-navy">{dial.value}</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-navy/50 uppercase tracking-wide">
              {dial.label}
            </span>
          </div>
        ))}
      </div>
    ),
    accent: 'sage',
  },
  {
    tag: 'Self-Awareness',
    title: 'Mirror Moments',
    description:
      'Monthly side-by-side views showing how you rate yourself versus how your team actually experiences you — across all five SCARF domains. This is where most leaders go from curious to committed.',
    detail:
      'Private to you. Based on anonymous team pulse data and your own self-assessment.',
    visual: (
      <div className="rounded-xl bg-navy/[0.02] border border-navy/5 p-6 my-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-amber/10 flex items-center justify-center mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.314 14 14 11.314 14 8" stroke="#E8913A" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 2L8 8" stroke="#E8913A" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 2H14V6" stroke="#E8913A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-amber mb-1">Mirror Moment</p>
            <p className="text-sm text-navy/70 leading-relaxed italic">
              "In yesterday's standup, you answered 3 questions directed at team members.
              How might stepping back create space for their voices?"
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-semibold text-navy/30 uppercase tracking-wide">
                SCARF Domain: Autonomy
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    accent: 'amber',
  },
  {
    tag: 'Meeting Intelligence',
    title: 'Zoom AI Companion',
    description:
      'After meetings, Catalyst analyzes the AI Companion summary for psychological safety signals — participation balance, question-to-statement ratio, unacknowledged concerns, and airtime distribution. You get one actionable prompt within two hours.',
    detail:
      'An optional real-time sidebar provides glanceable nudges during live meetings, visible only to you.',
    visual: (
      <div className="rounded-xl bg-navy/[0.02] border border-navy/5 p-5 my-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded bg-[#2D8CFF] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
              <rect x="1" y="3" width="7" height="6" rx="1" />
              <path d="M8 5L11 3.5V8.5L8 7V5Z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-navy/50">Meeting Analysis</span>
        </div>
        <div className="space-y-2.5">
          {[
            { name: 'You', pct: 62, color: 'bg-coral' },
            { name: 'Sarah', pct: 18, color: 'bg-sage' },
            { name: 'James', pct: 12, color: 'bg-sage' },
            { name: 'Others', pct: 8, color: 'bg-navy/20' },
          ].map((person) => (
            <div key={person.name} className="flex items-center gap-3">
              <span className="text-xs font-medium text-navy/50 w-12">{person.name}</span>
              <div className="flex-1 h-2 rounded-full bg-navy/5 overflow-hidden">
                <div
                  className={`h-full ${person.color} rounded-full`}
                  style={{ width: `${person.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-navy/40 w-8 text-right">
                {person.pct}%
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-navy/30 mt-3 leading-relaxed">
          Speaking time imbalance detected. Coaching nudge scheduled for tomorrow.
        </p>
      </div>
    ),
    accent: 'coral',
  },
  {
    tag: 'Fits Your Workflow',
    title: 'Invisible by Design',
    description:
      'Catalyst embeds into the tools you already use — Slack, Teams, email, your calendar. Most interactions happen there, not in a separate app. The best coaching doesn\'t add to your day. It makes existing moments better.',
    detail:
      'Zero new apps to learn. Zero extra meetings. Under 30 seconds per nudge.',
    visual: (
      <div className="flex flex-col gap-3 my-4">
        {[
          { channel: 'Slack', icon: '#', msg: 'Try opening with "What am I missing?" in today\'s sync' },
          { channel: 'Email', icon: '@', msg: 'Weekly digest: Team certainty up 12% this sprint' },
          { channel: 'Calendar', icon: '~', msg: '1:1 prep: Ask about the concern Sarah raised on Friday' },
        ].map((item) => (
          <div
            key={item.channel}
            className="flex items-center gap-3 rounded-lg bg-navy/[0.02] border border-navy/5 p-3.5 transition-all hover:bg-white hover:shadow-sm"
          >
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy/30 font-mono text-sm font-bold">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-navy/30 uppercase tracking-wide">
                {item.channel}
              </p>
              <p className="text-sm text-navy/60 truncate">{item.msg}</p>
            </div>
          </div>
        ))}
      </div>
    ),
    accent: 'navy',
  },
];

const accentColors: Record<string, { tag: string; border: string }> = {
  sage: { tag: 'text-sage', border: 'border-sage/20' },
  amber: { tag: 'text-amber', border: 'border-amber/20' },
  coral: { tag: 'text-coral', border: 'border-coral/20' },
  navy: { tag: 'text-navy/60', border: 'border-navy/10' },
};

export default function Features() {
  const { ref, inView } = useInView();

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream/50 via-cream to-white" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className={`text-sm font-semibold tracking-widest uppercase text-sage mb-4 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Features
          </p>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy leading-tight ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Tools that make growth{' '}
            <span className="gradient-text">feel effortless</span>
          </h2>
          <p className={`mt-6 text-lg text-navy/50 leading-relaxed ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            No extra meetings. No workshops. Science-backed nudges woven into
            the way you already lead.
          </p>
        </div>

        {/* Feature cards -- alternating layout */}
        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, i) => {
            const colors = accentColors[feature.accent];
            const isReversed = i % 2 === 1;
            return (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  inView ? `animate-fade-in-up delay-${Math.min((i + 1) * 200, 800)}` : 'opacity-0'
                }`}
              >
                {/* Text */}
                <div className={isReversed ? 'lg:order-2' : ''}>
                  <span className={`text-xs font-bold tracking-widest uppercase ${colors.tag}`}>
                    {feature.tag}
                  </span>
                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-navy leading-snug">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-navy/50 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                  <p className="mt-3 text-sm text-navy/35 leading-relaxed">
                    {feature.detail}
                  </p>
                </div>

                {/* Visual */}
                <div className={`rounded-2xl bg-white border ${colors.border} p-6 lg:p-8 shadow-sm ${isReversed ? 'lg:order-1' : ''}`}>
                  {feature.visual}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
