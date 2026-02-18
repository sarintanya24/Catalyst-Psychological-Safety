export default function Footer() {
  return (
    <footer className="relative bg-navy-dark">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
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
              <span className="text-lg font-semibold tracking-tight text-white">
                Catalyst
              </span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed max-w-sm">
              AI-powered psychological safety coaching that transforms how leaders
              build trust, one invisible nudge at a time.
            </p>
            <p className="mt-6 text-xs text-white/15">
              Built on the research of Amy Edmondson and David Rock's SCARF model.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {['How It Works', 'Features', 'Pricing', 'Security'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                    className="text-sm text-white/30 transition-colors hover:text-white/60"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {['About', 'Research', 'Blog', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-white/30 transition-colors hover:text-white/60"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Catalyst. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/20 transition-colors hover:text-white/40">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-white/20 transition-colors hover:text-white/40">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
