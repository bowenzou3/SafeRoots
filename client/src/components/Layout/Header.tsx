import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Phone, ShieldCheck, LogOut, Navigation, MessageSquare } from 'lucide-react';

const NAV_LINKS = [
  { to: '/shelters',  label: 'Shelters' },
  { to: '/resources', label: 'Resources' },
  { to: '/support',   label: 'Peer Support' },
  { to: '/alerts',    label: 'Crisis Alerts' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/dashboard', label: 'Dashboard' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleQuickExit = () => {
    window.location.replace('https://weather.com');
  };

  return (
    <header className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      {/* Crisis hotline banner */}
      <div className="bg-red-600 text-white text-center text-xs sm:text-sm py-1.5 px-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5">
        <span className="font-medium">Crisis? Free 24/7 help:</span>
        <a href="tel:18007997233" className="font-bold hover:underline">DV Hotline: 1-800-799-7233</a>
        <span aria-hidden="true" className="hidden sm:inline">|</span>
        <a href="tel:988" className="font-bold hover:underline">Suicide &amp; Crisis: 988</a>
        <span aria-hidden="true" className="hidden sm:inline">|</span>
        <a href="tel:18664887386" className="font-bold hover:underline">Trans Lifeline: 1-866-488-7386</a>
        <span aria-hidden="true" className="hidden sm:inline">|</span>
        <a href="sms:741741&body=HOME" className="font-bold hover:underline">Text HOME to 741741</a>
      </div>

      <div className="bg-primary-900/95 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        <a href="tel:988" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-500 font-semibold">
          <Phone className="w-3 h-3" /> Call 988
        </a>
        <a href="sms:741741&body=HOME" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 text-gray-900 hover:bg-amber-400 font-semibold">
          <MessageSquare className="w-3 h-3" /> Text Crisis
        </a>
        <Link to="/shelters" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-500 hover:bg-teal-400 text-gray-900 font-semibold">
          <Navigation className="w-3 h-3" /> Nearest Safe Place
        </Link>
        <button
          type="button"
          onClick={handleQuickExit}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-white font-semibold"
          aria-label="Quick exit to external safe page"
        >
          <LogOut className="w-3 h-3" /> Quick Exit
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-teal-400" aria-hidden="true" />
            <span>Safe<span className="text-teal-400">Roots</span></span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-teal-300'
                      : 'text-white/80 hover:bg-primary-600 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Emergency CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:988"
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors"
              aria-label="Call crisis line 988"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              Crisis Line
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-primary-600 transition-colors"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-800 border-t border-primary-600" id="mobile-menu">
          <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-primary-700 text-teal-300'
                      : 'text-white/80 hover:bg-primary-700 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="tel:988"
              className="flex items-center gap-2 mt-2 bg-red-600 text-white text-sm font-semibold px-3 py-2.5 rounded-lg"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              Crisis Line – Call 988
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
