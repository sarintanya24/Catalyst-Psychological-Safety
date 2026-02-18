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

const tiers = [
  {
    name: 'Starter',
    price: '$49',
    period: '/leader/month',
    description: 'For leaders ready to understand their impact on team safety.',
    features: [
      'SCARF assessment profile',
      '10 personalized micro-behaviors',
      'Weekly nudge delivery',
      'Email digest reports',
      'Safety score dashboard',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/leader/month',
    description: 'For teams committed to building a culture of psychological safety.',
    features: [
      'Everything in Starter',
      'Slack & Teams bot integration',
      'Mirror Moments reflections',
      'Cascade effect tracking',
      'Custom nudge frequency',
      'Team-level analytics',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations transforming safety at scale.',
    features: [
      'Everything in Growth',
      'Zoom AI Companion integration',
      'White-label deployment',
      'SSO & SCIM provisioning',
      'Dedicated success manager',
      'Custom SCARF calibration',
      'API access',
      'Org-wide cascade dashboard',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
    <path d="M3 8.5L6.5 12L13 4" stroke="#4A9E7D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Pricing() {
  const { ref, inView } = useInView();

  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cream to-cream" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className={`text-sm font-semibold tracking-widest uppercase text-coral mb-4 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            Pricing
          </p>
          <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy leading-tight ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Invest in your team's{' '}
            <span className="gradient-text">safest asset</span>
          </h2>
          <p className={`mt-6 text-lg text-navy/50 leading-relaxed ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Start with one leader. Watch it ripple through your entire organization.
            All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl transition-all duration-500 ${
                inView ? `animate-fade-in-up delay-${(i + 3) * 200}` : 'opacity-0'
              } ${
                tier.highlight
                  ? 'bg-white shadow-2xl shadow-navy/10 border-2 border-amber/30 scale-[1.02] lg:scale-105 z-10'
                  : 'bg-white border border-navy/10 shadow-sm hover:shadow-lg hover:shadow-navy/5 hover:-translate-y-1'
              }`}
            >
              {/* Popular badge */}
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full animate-shimmer px-4 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-lg shadow-amber/30">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8 lg:p-10">
                {/* Tier name */}
                <h3 className="text-lg font-bold text-navy">{tier.name}</h3>
                <p className="mt-1 text-sm text-navy/40 leading-relaxed">
                  {tier.description}
                </p>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-navy">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-navy/40 font-medium">
                      {tier.period}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <a
                  href="#waitlist"
                  className={`mt-8 flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition-all ${
                    tier.highlight
                      ? 'bg-amber text-white shadow-lg shadow-amber/25 hover:bg-amber-dark hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-navy/5 text-navy hover:bg-navy/10'
                  }`}
                >
                  {tier.cta}
                </a>

                {/* Features */}
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-sm text-navy/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className={`mt-12 text-center ${inView ? 'animate-fade-in-up delay-1000' : 'opacity-0'}`}>
          <p className="text-sm text-navy/30">
            All prices in USD. Annual billing available with 20% discount. No credit card required for trial.
          </p>
        </div>
      </div>
    </section>
  );
}
