import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Why it matters', href: '#why-it-matters' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
                  stroke="#E8913A"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle cx="9" cy="9" r="3" fill="#4A9E7D" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-navy">
              Catalyst
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-navy/70 transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#get-started"
              className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-light hover:shadow-lg"
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-navy"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6L18 18M6 18L18 6" />
              ) : (
                <path d="M4 6H20M4 12H20M4 18H20" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-navy/10">
            <div className="flex flex-col gap-3 pt-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-navy/70 transition-colors hover:text-navy px-2 py-1"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#get-started"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white text-center transition-all hover:bg-navy-light mt-2"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
