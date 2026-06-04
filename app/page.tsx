'use client';

import Link from 'next/link';
import { useState } from 'react';

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
    title: 'Voice-First Reporting',
    desc: 'Operators speak naturally about what happened. No forms, no typing, no training needed. One tap and go.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
    title: 'AI-Powered Analysis',
    desc: 'Claude AI cross-references your plant manuals and SOPs in seconds — severity, root causes, and exact next steps.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: 'Live Status Tracking',
    desc: 'Every incident moves through Open → In Progress → Resolved. Operators see updates in real time.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: 'Knowledge Base',
    desc: 'Upload plant manuals, SOPs, and troubleshooting guides. The AI learns from your own documentation.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: 'Shift & Machine Tags',
    desc: 'Auto-detects current shift. Operators tag the machine or station. Patterns become visible instantly.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    title: 'Role-Based Access',
    desc: 'Operators report. Supervisors resolve. Admins manage the knowledge base and users. Everyone sees what they need.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Tap to Speak',
    desc: 'Operator opens VoiceOps and taps the big button. Speaks naturally — "Machine M14 stopped, burning smell from motor."',
    color: '#E07B39',
  },
  {
    number: '02',
    title: 'AI Analyses',
    desc: 'Claude AI cross-references your plant\'s uploaded manuals and instantly determines severity, causes, and actions.',
    color: '#003057',
  },
  {
    number: '03',
    title: 'Act & Resolve',
    desc: 'Numbered steps appear on screen. Supervisor gets notified, picks it up, resolves it with a note. Done.',
    color: '#22c55e',
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.95" />
                <path d="M20 14L26 18V26L20 30L14 26V18L20 14Z" fill="#E07B39" />
              </svg>
            </div>
            <span className="font-bold text-xl" style={{ color: '#003057' }}>VoiceOps</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-800 transition">How it works</a>
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-800 transition">Features</a>
            <a href="#for-teams" className="text-sm text-gray-500 hover:text-gray-800 transition">For teams</a>
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition hover:opacity-90" style={{ backgroundColor: '#003057' }}>
              Sign In →
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 space-y-3 border-t border-gray-100 pt-4">
            <a href="#how-it-works" className="block text-sm text-gray-600">How it works</a>
            <a href="#features" className="block text-sm text-gray-600">Features</a>
            <a href="#for-teams" className="block text-sm text-gray-600">For teams</a>
            <Link href="/login" className="block text-sm font-semibold px-4 py-2 rounded-xl text-white text-center" style={{ backgroundColor: '#003057' }}>
              Sign In →
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-20 pb-24 px-6 text-center" style={{ background: 'linear-gradient(160deg, #f8faff 0%, #fff7f0 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border" style={{ backgroundColor: '#fff3eb', borderColor: '#fde8d0', color: '#E07B39' }}>
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Built for Scania Production Lines
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-6" style={{ color: '#003057' }}>
            Report incidents<br />
            <span style={{ color: '#E07B39' }}>in one tap.</span>
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
            Factory operators speak. AI listens, analyses, and guides. From fault to fix — faster than filling a form.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#003057' }}
            >
              Operator Login →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl font-bold text-lg border-2 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: '#003057', color: '#003057', backgroundColor: 'white' }}
            >
              Admin Portal
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-5">Demo: OP001 / operator123 &nbsp;·&nbsp; ADMIN001 / admin123</p>
        </div>

        {/* Phone mockup */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-64 rounded-[2.5rem] shadow-2xl border-8 border-gray-800 overflow-hidden bg-gray-800">
            {/* Status bar */}
            <div className="bg-gray-800 h-7 flex items-center justify-center">
              <div className="w-20 h-4 bg-gray-900 rounded-full" />
            </div>
            {/* Screen */}
            <div className="bg-gray-100 px-4 py-6 flex flex-col items-center min-h-80">
              {/* Mini header */}
              <div className="w-full flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md" style={{ backgroundColor: '#E07B39' }} />
                  <span className="text-xs font-bold" style={{ color: '#003057' }}>VoiceOps</span>
                </div>
                <div className="text-xs text-gray-400">OP001</div>
              </div>
              <p className="text-xs font-semibold text-gray-500 mb-4">Report an Incident</p>
              {/* Big button */}
              <div className="w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg mb-5"
                style={{ backgroundColor: '#003057' }}>
                <svg className="w-10 h-10 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                <span className="text-white text-xs font-bold">TAP TO SPEAK</span>
              </div>
              {/* Severity card */}
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-500 text-white">HIGH</span>
                  <span className="text-xs text-red-700 font-medium">Motor fault detected</span>
                </div>
                <div className="space-y-1">
                  {['Stop the line', 'Alert maintenance', 'Do not restart'].map((a, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <span className="w-4 h-4 rounded-full text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#003057', fontSize: '9px' }}>{i + 1}</span>
                      <span className="text-xs text-gray-600">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: '#003057' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">How it works</h2>
            <p className="text-blue-300 text-lg">Three steps. Under 30 seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-blue-800 z-0" style={{ width: 'calc(100% - 4rem)', left: '4rem' }} />
                )}
                <div className="bg-blue-900 bg-opacity-40 rounded-2xl p-6 border border-blue-800 relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 font-black text-xl text-white"
                    style={{ backgroundColor: step.color }}>
                    {step.number}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-blue-300 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#003057' }}>Everything your team needs</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Built specifically for factory floor realities — loud environments, PPE, non-technical workers, and time pressure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white transition-all"
                  style={{ backgroundColor: '#003057' }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR TEAMS */}
      <section id="for-teams" className="py-24 px-6" style={{ backgroundColor: '#f8faff' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#003057' }}>Two apps. One system.</h2>
            <p className="text-gray-500 text-lg">Each role gets exactly what they need — nothing more, nothing less.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Operator card */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
              <div className="px-8 py-6 text-white" style={{ backgroundColor: '#003057' }}>
                <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">For Operators</h3>
                <p className="text-blue-300 text-sm">Production line workers</p>
              </div>
              <div className="bg-white px-8 py-6 space-y-3">
                {[
                  'One-tap incident reporting',
                  'Voice or text input',
                  'Instant AI-guided action steps',
                  'See status of your past reports',
                  'Shift & machine tagging',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#003057' }} fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/login" className="block text-center py-3 rounded-xl font-bold text-white transition hover:opacity-90" style={{ backgroundColor: '#003057' }}>
                    Operator Login →
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin card */}
            <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100">
              <div className="px-8 py-6 text-white" style={{ backgroundColor: '#E07B39' }}>
                <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">For Supervisors & Admins</h3>
                <p className="text-orange-200 text-sm">Plant management</p>
              </div>
              <div className="bg-white px-8 py-6 space-y-3">
                {[
                  'Real-time incident dashboard',
                  'Filter by severity, shift, status',
                  'Mark In Progress → Resolved',
                  'Upload manuals to train the AI',
                  'Manage operator accounts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#E07B39' }} fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Link href="/login" className="block text-center py-3 rounded-xl font-bold text-white transition hover:opacity-90" style={{ backgroundColor: '#E07B39' }}>
                    Admin Portal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6 text-center text-white" style={{ backgroundColor: '#003057' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to try it?</h2>
          <p className="text-blue-300 text-lg mb-8">
            Log in as a demo operator and report your first incident in under 30 seconds.
          </p>
          <Link
            href="/login"
            className="inline-block px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#E07B39', color: 'white' }}
          >
            Get Started →
          </Link>
          <p className="text-blue-400 text-xs mt-4">No setup needed · Demo credentials on the login page</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
              <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.95" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: '#003057' }}>VoiceOps</span>
            <span className="text-gray-400 text-sm">· AI Incident Handler for Scania</span>
          </div>
          <p className="text-gray-400 text-xs">Built with Next.js · Anthropic Claude · Prisma Postgres</p>
        </div>
      </footer>

    </div>
  );
}
