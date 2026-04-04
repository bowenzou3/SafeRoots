import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, BookOpen, MessageCircle, Bell, Heart, Wifi,
  Users, ShieldCheck, ArrowRight,
} from 'lucide-react';

const STATS = [
  { value: '2,400+', label: 'Safe Shelters' },
  { value: '8,700+', label: 'Resources Listed' },
  { value: '140K+',  label: 'Lives Impacted' },
  { value: '320+',   label: 'Cities Covered' },
];

const FEATURES = [
  {
    icon: MapPin,
    title: 'Safe Shelter Map',
    description:
      'Find LGBTQ+-friendly, women-only, and BIPOC-focused shelters near you with real-time availability and community safety ratings.',
    to: '/shelters',
    color: 'bg-primary-100 text-primary-700',
    cta: 'Find Shelters',
  },
  {
    icon: BookOpen,
    title: 'Resource Directory',
    description:
      'Access free food, healthcare, legal aid, mental health services, and more — filtered for women and minority communities.',
    to: '/resources',
    color: 'bg-teal-100 text-teal-700',
    cta: 'Browse Resources',
  },
  {
    icon: MessageCircle,
    title: 'Anonymous Peer Support',
    description:
      'Connect safely with volunteers, social workers, and peers in topic-specific chat rooms. Your identity stays completely private.',
    to: '/support',
    color: 'bg-violet-100 text-violet-700',
    cta: 'Get Support',
  },
  {
    icon: Bell,
    title: 'Crisis Alerts',
    description:
      'Real-time alerts for mobile aid vans, free clinics, weather emergencies, and safety concerns specific to your area.',
    to: '/alerts',
    color: 'bg-red-100 text-red-700',
    cta: 'View Alerts',
  },
  {
    icon: Heart,
    title: 'Volunteer & Donate',
    description:
      'Register as a volunteer, donate to verified organizations, and see transparent impact tracking of your contributions.',
    to: '/volunteer',
    color: 'bg-pink-100 text-pink-700',
    cta: 'Get Involved',
  },
  {
    icon: Wifi,
    title: 'Offline Access',
    description:
      'Critical hotlines, nearby resources, and shelter contacts are cached locally — accessible even without internet connection.',
    to: '/resources',
    color: 'bg-amber-100 text-amber-700',
    cta: 'Learn More',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Search Your Location',
    desc: 'Enter your city or allow location access to instantly discover shelters and resources near you.',
  },
  {
    step: '2',
    title: 'Filter for Your Needs',
    desc: 'Filter by LGBTQ+-friendly, women-only, BIPOC-focused, accessible, and many more tags.',
  },
  {
    step: '3',
    title: 'Connect & Get Help',
    desc: 'Call directly, visit in person, or chat anonymously with a trained volunteer or peer.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-800 via-primary-700 to-teal-700 text-white overflow-hidden">
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            Trusted by 140,000+ people across 320 cities
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Safety, Support &amp; Community
            <br />
            <span className="text-teal-300">for Women &amp; Minorities</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            SafeRoots connects you to shelters, resources, and peer support — built
            specifically for women, LGBTQ+ individuals, and BIPOC communities navigating
            housing insecurity or crisis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shelters"
              className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-primary-700"
            >
              Find a Shelter
            </Link>
            <Link
              to="/resources"
              className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b" aria-label="Platform statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(stat => (
              <div key={stat.label}>
                <dt className="text-3xl font-bold text-primary-700 tabular-nums">{stat.value}</dt>
                <dd className="text-sm text-gray-500 mt-1">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything You Need, In One Place</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            SafeRoots is designed around the real needs of women, LGBTQ+, and minority
            communities facing housing insecurity or crisis situations.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className="card p-6 flex flex-col"
            >
              <div className={`inline-flex p-2.5 rounded-xl ${feature.color} w-fit mb-4`} aria-hidden="true">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm flex-1 leading-relaxed">{feature.description}</p>
              <Link
                to={feature.to}
                className="mt-5 inline-flex items-center gap-1 text-primary-700 hover:text-primary-600 text-sm font-medium group"
              >
                {feature.cta}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-primary-50 py-16" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="how-it-works-heading" className="text-3xl font-bold text-gray-900 text-center mb-12">
            How SafeRoots Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(item => (
              <div key={item.step} className="text-center">
                <div
                  className="inline-flex w-14 h-14 rounded-full bg-primary-700 text-white text-xl font-bold items-center justify-center mb-4 shadow-lg"
                  aria-hidden="true"
                >
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Volunteer CTA ────────────────────────────────────────────────── */}
      <section className="bg-teal-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Users className="w-10 h-10 mx-auto mb-4 text-teal-200" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-4">Want to Make a Difference?</h2>
          <p className="text-teal-100 mb-8 leading-relaxed">
            Volunteers, social workers, and allies can register to provide direct support,
            donate resources, or help verify shelter information in their community.
          </p>
          <Link
            to="/volunteer"
            className="inline-block bg-white text-teal-700 hover:bg-teal-50 font-semibold px-8 py-3.5 rounded-xl text-lg transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-700"
          >
            Become a Volunteer
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="text-gray-300 font-semibold mb-1">© 2026 SafeRoots · Open Source · MIT License</p>
          <p className="mb-3">Built with ♥ for those who need it most.</p>
          <p>
            In crisis?&nbsp;
            <a href="tel:988"           className="text-teal-400 hover:underline font-medium">Call 988</a>
            &nbsp;or&nbsp;
            <a href="tel:18007997233"   className="text-teal-400 hover:underline font-medium">1-800-799-7233 (DV)</a>
            &nbsp;or&nbsp;
            <a href="tel:18664887386"   className="text-teal-400 hover:underline font-medium">1-866-488-7386 (Trans)</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
