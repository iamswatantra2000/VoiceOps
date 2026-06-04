'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003057, #005a9e)' }}>
              <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.95" />
                <path d="M20 14L26 18V26L20 30L14 26V18L20 14Z" fill="#60a5fa" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: '#003057' }}>VoiceOps</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {['How it works', 'Features', 'For teams'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition px-3 py-2">
              Sign in
            </Link>
            <Link href="/login"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition hover:opacity-90 shadow-sm"
              style={{ backgroundColor: '#E07B39' }}>
              Try it free →
            </Link>
          </div>

          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 py-4 border-t border-gray-100 bg-white space-y-3">
            {['How it works', 'Features', 'For teams'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="block text-sm text-gray-600 font-medium py-1" onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <Link href="/login" className="block w-full text-center py-3 rounded-xl font-bold text-white mt-2"
              style={{ backgroundColor: '#E07B39' }}>
              Get Started →
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: '#E07B39', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: '#003057', transform: 'translate(-30%, 30%)' }} />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 border"
            style={{ backgroundColor: '#fff7f0', borderColor: '#fcd9bc', color: '#c2601a' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
            Designed for Scania Production Lines
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            <span style={{ color: '#003057' }}>Incidents reported</span>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #E07B39, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>in one tap.</span>
          </h1>

          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
            Operators speak. Claude AI cross-checks your plant manuals, determines severity,
            and delivers step-by-step actions — in under 10 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/login"
              className="px-8 py-4 rounded-2xl font-bold text-white text-base shadow-xl transition-all hover:scale-105 active:scale-95 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #003057 0%, #005a9e 100%)' }}>
              Operator Login →
            </Link>
            <Link href="/login"
              className="px-8 py-4 rounded-2xl font-bold text-base border-2 transition-all hover:scale-105 active:scale-95 bg-white"
              style={{ borderColor: '#003057', color: '#003057' }}>
              Admin Portal
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            Demo — Operator: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">OP001</span> / <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">operator123</span>
            &nbsp;·&nbsp; Admin: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">ADMIN001</span> / <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">admin123</span>
          </p>
        </div>

        {/* ── UI PREVIEW ── */}
        <div className="mt-20 max-w-5xl mx-auto relative">
          <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #003057, #E07B39)', transform: 'scale(0.95) translateY(20px)' }} />

          <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white">
            {/* Browser chrome */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-4 py-1.5 text-xs text-gray-400 border border-gray-200 max-w-xs mx-auto text-center">
                voice-ops-gamma.vercel.app/operator
              </div>
            </div>

            {/* App UI preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

              {/* Left — idle state */}
              <div className="p-8 flex flex-col items-center bg-gray-50">
                <div className="w-full max-w-xs">
                  {/* Header bar */}
                  <div className="flex items-center justify-between mb-8 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
                        <svg width="12" height="12" viewBox="0 0 40 40" fill="none"><path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" /></svg>
                      </div>
                      <span className="text-xs font-bold" style={{ color: '#003057' }}>VoiceOps</span>
                    </div>
                    <span className="text-xs text-gray-400">Erik J. · Morning 🌅</span>
                  </div>

                  {/* Shift + machine */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Shift</p>
                    <div className="flex gap-2 mb-3">
                      {[['🌅', 'Morning', true], ['☀️', 'Afternoon', false], ['🌙', 'Night', false]].map(([icon, label, active]) => (
                        <div key={label as string} className="flex-1 py-2 rounded-xl text-center text-xs font-semibold border-2 transition-all"
                          style={{
                            backgroundColor: active ? '#fffbeb' : 'white',
                            borderColor: active ? '#fde68a' : '#e5e7eb',
                            color: active ? '#b45309' : '#9ca3af',
                          }}>
                          {icon as string} {label as string}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Machine</p>
                    <div className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-xs text-gray-400">M-14, Assembly Line A</div>
                  </div>

                  {/* Big tap button */}
                  <div className="flex flex-col items-center">
                    <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-xl cursor-pointer hover:scale-105 transition-transform"
                      style={{ background: 'linear-gradient(135deg, #003057 0%, #005a9e 100%)' }}>
                      <svg className="w-10 h-10 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                      </svg>
                      <span className="text-white text-xs font-black tracking-wide">TAP TO SPEAK</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="h-px w-16 bg-gray-200" />
                      <span className="text-xs text-gray-400">or</span>
                      <div className="h-px w-16 bg-gray-200" />
                    </div>
                    <button className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 transition">
                      ✏️ Type instead
                    </button>
                  </div>
                </div>
              </div>

              {/* Right — AI result */}
              <div className="p-8 bg-white">
                <div className="w-full max-w-xs mx-auto space-y-4">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">AI Analysis — #047</p>

                  {/* Severity */}
                  <div className="rounded-2xl p-4 border-2 flex items-center gap-3" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ef4444' }}>
                      <span className="text-white font-black text-xs">HIGH</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-snug">Motor overheating on M-14</p>
                      <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>Escalate → Maintenance Team</p>
                    </div>
                  </div>

                  {/* Safety warning */}
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200 flex gap-2">
                    <span className="text-red-500 text-sm flex-shrink-0">⚠️</span>
                    <p className="text-xs text-red-700 font-medium">Do not attempt to restart — risk of electrical fire</p>
                  </div>

                  {/* Actions */}
                  <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Immediate Actions</p>
                    <div className="space-y-2.5">
                      {['Stop the production line', 'Isolate power to M-14', 'Call Maintenance on ext. 204'].map((action, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="w-5 h-5 rounded-full text-white flex items-center justify-center flex-shrink-0 text-xs font-bold"
                            style={{ backgroundColor: '#003057', fontSize: '10px' }}>{i + 1}</span>
                          <span className="text-xs text-gray-700 leading-snug pt-0.5">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">🌅 Morning Shift</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">🔧 Machine M-14</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section className="py-14 px-6 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '< 10s', label: 'From tap to AI response' },
            { value: '4', label: 'Severity levels tracked' },
            { value: '3-step', label: 'Resolution workflow' },
            { value: '100%', label: 'Voice or text input' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-black mb-1" style={{ color: '#003057' }}>{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#E07B39' }}>How it works</p>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: '#003057' }}>Three steps.<br />Under 30 seconds.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01', icon: '🎙️', title: 'Tap & Speak',
                desc: 'One big button. Operator taps and describes what they see — machine number, noise, smell, anything. Voice or type.',
                color: '#E07B39', bg: '#fff7f0',
              },
              {
                step: '02', icon: '🤖', title: 'AI Analyses',
                desc: 'Claude AI reads your uploaded plant manuals and SOPs, determines severity, finds root causes, and builds a response.',
                color: '#003057', bg: '#f0f4ff',
              },
              {
                step: '03', icon: '✅', title: 'Act & Resolve',
                desc: 'Numbered actions appear instantly. Supervisor picks it up, moves it In Progress, adds a resolution note, closes it out.',
                color: '#22c55e', bg: '#f0fdf4',
              },
            ].map((s, i) => (
              <div key={i} className="rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1" style={{ backgroundColor: s.bg }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: s.color }}>Step {s.step}</span>
                </div>
                <h3 className="text-xl font-black mb-3" style={{ color: '#003057' }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ backgroundColor: '#003057' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#E07B39' }}>Features</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Built for the factory floor.</h2>
            <p className="text-blue-300 mt-4 text-lg max-w-xl mx-auto">Loud environments. PPE. Non-technical workers. Time pressure. VoiceOps is built for all of it.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎙️', title: 'Voice-First', desc: 'Speak naturally. No forms, no training. The mic does the work.' },
              { icon: '✍️', title: 'Text Fallback', desc: 'Mic blocked by PPE? Switch to typing with one tap — same AI, same result.' },
              { icon: '🤖', title: 'Claude AI', desc: 'Anthropic Claude cross-references your uploaded manuals instantly.' },
              { icon: '📋', title: 'Knowledge Base', desc: 'Upload PDFs, SOPs, manuals. The AI learns your plant-specific context.' },
              { icon: '🔄', title: 'Status Workflow', desc: 'Open → In Progress → Resolved. Full lifecycle tracking per incident.' },
              { icon: '🌅', title: 'Shift & Machine Tags', desc: 'Auto-detects shift time. Tag the machine. Spot patterns fast.' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-6 bg-white bg-opacity-5 border border-white border-opacity-10 hover:bg-opacity-10 transition-all group">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-white font-bold mb-2">{f.title}</h3>
                <p className="text-blue-300 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR TEAMS ───────────────────────────────────────── */}
      <section id="for-teams" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: '#E07B39' }}>For teams</p>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: '#003057' }}>Two apps.<br />One system.</h2>
            <p className="text-gray-500 mt-4 text-lg">Everyone sees exactly what they need — nothing more, nothing less.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator */}
            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8" style={{ background: 'linear-gradient(135deg, #003057 0%, #005a9e 100%)' }}>
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-15 flex items-center justify-center text-2xl mb-5">🏭</div>
                <h3 className="text-2xl font-black text-white mb-1">For Operators</h3>
                <p className="text-blue-300 text-sm">Production line workers</p>
              </div>
              <div className="p-8 bg-white space-y-3">
                {[
                  'One-tap incident reporting',
                  'Voice or text input',
                  'Instant AI-guided action steps',
                  'Severity & safety warnings',
                  'View status of past reports',
                  'Auto shift detection',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#003057' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
                <Link href="/login"
                  className="block text-center mt-4 py-3.5 rounded-2xl font-bold text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #003057, #005a9e)' }}>
                  Operator Login →
                </Link>
              </div>
            </div>

            {/* Admin */}
            <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <div className="p-8" style={{ background: 'linear-gradient(135deg, #c2601a 0%, #E07B39 100%)' }}>
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-15 flex items-center justify-center text-2xl mb-5">🎛️</div>
                <h3 className="text-2xl font-black text-white mb-1">For Supervisors</h3>
                <p className="text-orange-200 text-sm">Plant management & admins</p>
              </div>
              <div className="p-8 bg-white space-y-3">
                {[
                  'Real-time incident dashboard',
                  'Filter by severity, shift, status',
                  'Mark In Progress → Resolved',
                  'Add resolution notes',
                  'Upload AI knowledge base',
                  'Create & manage operator accounts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#E07B39' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
                <Link href="/login"
                  className="block text-center mt-4 py-3.5 rounded-2xl font-bold text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #c2601a, #E07B39)' }}>
                  Admin Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ backgroundColor: '#003057' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(224,123,57,0.15) 0%, transparent 70%)'
        }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#E07B39' }}>Get started now</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
            Ready to see it<br />in action?
          </h2>
          <p className="text-blue-300 text-lg mb-10 leading-relaxed">
            Log in as a demo operator and report your first incident in under 30 seconds. No setup needed.
          </p>
          <Link href="/login"
            className="inline-block px-12 py-5 rounded-2xl font-black text-lg text-white transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #E07B39, #f59e0b)' }}>
            Try VoiceOps Free →
          </Link>
          <p className="text-blue-400 text-xs mt-5">
            Demo: <span className="font-mono">OP001 / operator123</span> · <span className="font-mono">ADMIN001 / admin123</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-8 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003057, #005a9e)' }}>
              <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.95" />
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: '#003057' }}>VoiceOps</span>
            <span className="text-gray-300 text-sm">·</span>
            <span className="text-gray-400 text-sm">AI Incident Handler for Scania</span>
          </div>
          <p className="text-gray-400 text-xs">Built with Next.js · Anthropic Claude · Prisma Postgres</p>
        </div>
      </footer>

    </div>
  );
}
