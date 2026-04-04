import React, { useState } from 'react';
import { api } from '../api/client';
import type { Volunteer } from '../types';
import { Heart, CheckCircle, Users, Loader2 } from 'lucide-react';

const SKILLS = [
  'Mental Health Support', 'Legal Guidance', 'Healthcare',
  'Childcare', 'Food Distribution', 'Transportation',
  'Translation / Interpretation', 'Housing Navigation',
  'Job Coaching', 'Tech Support', 'Fundraising',
];

const IMPACT_STATS = [
  { value: '1,200+', label: 'Active Volunteers' },
  { value: '$480K',  label: 'Donated This Year' },
  { value: '32,000+',label: 'People Helped in 2025' },
  { value: '50+',    label: 'Partner Organizations' },
];

const ORGS = [
  {
    name: 'National Network to End Domestic Violence',
    description: 'Policy advocacy and shelter funding for DV survivors.',
    url: 'https://nnedv.org', color: 'border-pink-200',
  },
  {
    name: 'The Trevor Project',
    description: 'Crisis intervention for LGBTQ+ youth.',
    url: 'https://www.thetrevorproject.org', color: 'border-violet-200',
  },
  {
    name: 'NAACP Legal Defense Fund',
    description: 'Legal aid and civil rights for BIPOC communities.',
    url: 'https://www.naacpldf.org', color: 'border-amber-200',
  },
  {
    name: 'National Alliance to End Homelessness',
    description: 'Research, policy, and direct shelter support.',
    url: 'https://endhomelessness.org', color: 'border-teal-200',
  },
];

const INITIAL_FORM: Volunteer = {
  name: '', skills: [], availability: '', city: '', email: '', phone: '', organization: '',
};

export default function Volunteer() {
  const [form,      setForm]      = useState<Volunteer>(INITIAL_FORM);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter(s => s !== skill)
        : [...f.skills, skill],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.city || !form.availability) {
      setError('Please fill in all required fields.');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.registerVolunteer(form);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex w-14 h-14 rounded-full bg-pink-100 items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-pink-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteers &amp; Donations</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          Your time and resources directly support women, LGBTQ+ individuals, and minority
          communities in crisis. Every contribution — big or small — creates real change.
        </p>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {IMPACT_STATS.map(stat => (
          <div key={stat.label} className="card p-5 text-center">
            <div className="text-2xl font-bold text-primary-700 tabular-nums">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Registration form */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Register as a Volunteer</h2>
            <p className="text-sm text-gray-500 mb-5">
              All volunteers undergo a brief orientation on trauma-informed care before being matched.
            </p>

            {success ? (
              <div className="text-center py-10">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="font-bold text-gray-900 text-lg">Thank you for signing up!</h3>
                <p className="text-gray-500 text-sm mt-2">
                  We'll reach out within 48 hours with onboarding details.
                </p>
                <button
                  className="mt-4 btn-secondary text-sm"
                  onClick={() => setSuccess(false)}
                >
                  Register another volunteer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="vol-name"
                      type="text"
                      className="input"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="vol-email"
                      type="email"
                      className="input"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="vol-city" className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="vol-city"
                      type="text"
                      className="input"
                      placeholder="New York"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="vol-phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-gray-400 font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      id="vol-phone"
                      type="tel"
                      className="input"
                      placeholder="(555) 000-0000"
                      value={form.phone ?? ''}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="vol-org" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization / Affiliation <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <input
                    id="vol-org"
                    type="text"
                    className="input"
                    placeholder="e.g. Local shelter, law firm, hospital…"
                    value={form.organization ?? ''}
                    onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="vol-availability" className="block text-sm font-medium text-gray-700 mb-1">
                    Availability <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="vol-availability"
                    className="input"
                    value={form.availability}
                    onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                    required
                  >
                    <option value="">Select availability…</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="evenings">Evenings</option>
                    <option value="flexible">Flexible / Remote</option>
                    <option value="on-call">On-call only</option>
                  </select>
                </div>

                {/* Skills */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Skills &amp; Areas of Support
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        aria-pressed={form.skills.includes(skill)}
                        onClick={() => toggleSkill(skill)}
                        className={`tag cursor-pointer transition-colors ${
                          form.skills.includes(skill)
                            ? 'bg-primary-700 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </fieldset>

                {error && (
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {loading ? 'Submitting…' : 'Register as Volunteer'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Partner orgs sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-700" aria-hidden="true" />
            Donate to Partners
          </h2>
          <p className="text-sm text-gray-500">
            100% of donations go to verified organizations. We do not take a cut.
          </p>
          {ORGS.map(org => (
            <a
              key={org.name}
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`card p-4 block border-l-4 ${org.color} hover:shadow-md`}
            >
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{org.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{org.description}</p>
              <span className="mt-2 inline-block text-xs font-medium text-primary-700">Donate →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
