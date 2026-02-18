import { useState, type FormEvent, useEffect, useRef } from 'react';

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

export default function Waitlist() {
  const { ref, inView } = useInView();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Simulate API call
    setSubmitted(true);
  };

  return (
    <section id="waitlist" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-dark to-navy" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center" ref={ref}>
        {submitted ? (
          /* Success state */
          <div className={`${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-sage/20">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M8 16L14 22L24 10"
                  stroke="#4A9E7D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              You're on the list.
            </h2>
            <p className="text-lg text-white/50 leading-relaxed max-w-lg mx-auto">
              We'll reach out soon with early access details. In the meantime,
              the perception gap isn't going anywhere -- but you're about to change that.
            </p>
          </div>
        ) : (
          /* Form state */
          <>
            <div className={`mb-6 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">
                  Limited Early Access
                </span>
              </div>
            </div>

            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 ${inView ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
              Ready to close the gap?
            </h2>

            <p className={`text-lg text-white/50 leading-relaxed max-w-xl mx-auto mb-10 ${inView ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
              Join forward-thinking leaders who are building psychologically safe
              teams. Be among the first to experience Catalyst.
            </p>

            <form
              onSubmit={handleSubmit}
              className={`flex flex-col sm:flex-row gap-3 max-w-md mx-auto ${inView ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}
            >
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your work email"
                  className="w-full rounded-full bg-white/10 border border-white/10 px-6 py-3.5 text-sm text-white placeholder-white/30 outline-none transition-all focus:bg-white/15 focus:border-white/25 focus:ring-2 focus:ring-amber/30"
                />
                {error && (
                  <p className="absolute -bottom-6 left-6 text-xs text-coral-light">
                    {error}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="rounded-full bg-amber px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber/25 transition-all hover:bg-amber-dark hover:shadow-xl hover:shadow-amber/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Join the Waitlist
              </button>
            </form>

            <p className={`mt-10 text-xs text-white/20 ${inView ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
              No spam. No credit card. Just early access to better leadership.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
