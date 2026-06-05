'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--vo-bg)' }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50"
        style={{ background: 'rgba(245,244,242,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--vo-border)' }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div style={{
              width: '30px', height: '30px', borderRadius: 'var(--vo-r)',
              background: 'var(--vo-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg className="vo-i" style={{ width: '16px', height: '16px', color: 'var(--vo-accent-fg)' }}>
                <use href="#vo-hexagon" />
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-.01em', color: 'var(--vo-text)' }}>VoiceOps</span>
          </div>

          <div className="hidden md:flex items-center gap-7">
            {['How it works', 'Features', 'For teams'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="vo-body-sm" style={{ color: 'var(--vo-text-muted)', fontWeight: 500, textDecoration: 'none' }}>
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="vo-btn vo-btn--ghost" style={{ height: '36px', padding: '0 14px' }}>
              Sign in
            </Link>
            <Link href="/login" className="vo-btn vo-btn--primary" style={{ height: '36px', padding: '0 18px' }}>
              Try it free
              <svg className="vo-i vo-i-sm"><use href="#vo-arrow-right" /></svg>
            </Link>
          </div>

          <button className="md:hidden vo-btn vo-btn--ghost" style={{ width: '36px', height: '36px', padding: 0 }}
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="vo-i"><use href={menuOpen ? '#vo-x' : '#vo-list'} /></svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden" style={{ padding: '16px 24px 20px', borderTop: '1px solid var(--vo-border)', background: 'var(--vo-surface)' }}>
            {['How it works', 'Features', 'For teams'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="vo-body-sm" style={{ display: 'block', padding: '8px 0', color: 'var(--vo-text-2)', textDecoration: 'none' }}
                onClick={() => setMenuOpen(false)}>
                {item}
              </a>
            ))}
            <Link href="/login" className="vo-btn vo-btn--primary vo-btn--block" style={{ marginTop: '12px' }}>
              Get Started
              <svg className="vo-i vo-i-sm"><use href="#vo-arrow-right" /></svg>
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: '144px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
        {/* Background tint blobs */}
        <div className="absolute top-0 right-0 pointer-events-none" style={{
          width: '480px', height: '480px', borderRadius: '50%', opacity: 0.12,
          background: 'var(--vo-accent)', filter: 'blur(96px)', transform: 'translate(30%, -30%)',
        }} />
        <div className="absolute bottom-0 left-0 pointer-events-none" style={{
          width: '360px', height: '360px', borderRadius: '50%', opacity: 0.07,
          background: 'var(--vo-text)', filter: 'blur(80px)', transform: 'translate(-30%, 30%)',
        }} />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2" style={{
            padding: '6px 14px', borderRadius: 'var(--vo-r-sm)',
            background: 'var(--vo-accent-tint)', border: '1px solid var(--vo-accent-tint-2)',
            marginBottom: '32px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '1px', background: 'var(--vo-accent)', display: 'inline-block' }} />
            <span className="vo-eyebrow" style={{ color: 'var(--vo-accent)', letterSpacing: '.1em' }}>
              Designed for Scania Production Lines
            </span>
          </div>

          <h1 className="vo-display" style={{ marginBottom: '24px' }}>
            <span style={{ color: 'var(--vo-text)' }}>Incidents reported</span>
            <br />
            <span style={{ color: 'var(--vo-accent)' }}>in one tap.</span>
          </h1>

          <p className="vo-body-lg" style={{ color: 'var(--vo-text-2)', maxWidth: '580px', margin: '0 auto 40px' }}>
            Operators speak. Claude AI cross-checks your plant manuals, determines severity,
            and delivers step-by-step actions — in under 10 seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center" style={{ marginBottom: '24px' }}>
            <Link href="/login" className="vo-btn vo-btn--primary vo-btn--lg">
              Operator Login
              <svg className="vo-i"><use href="#vo-arrow-right" /></svg>
            </Link>
            <Link href="/login" className="vo-btn vo-btn--secondary vo-btn--lg">
              Admin Portal
            </Link>
          </div>

          <p className="vo-caption">
            Demo — Operator:{' '}
            <span className="vo-kbd">OP001</span> / <span className="vo-kbd">operator123</span>
            {' · '}
            Admin:{' '}
            <span className="vo-kbd">ADMIN001</span> / <span className="vo-kbd">admin123</span>
          </p>
        </div>

        {/* ── UI PREVIEW ── */}
        <div className="mt-20 max-w-5xl mx-auto relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            borderRadius: 'var(--vo-r-lg)',
            boxShadow: 'var(--vo-e3)',
            transform: 'scale(0.96) translateY(20px)',
          }} />

          <div style={{ borderRadius: 'var(--vo-r-lg)', overflow: 'hidden', border: '1px solid var(--vo-border)', boxShadow: 'var(--vo-e3)', background: 'var(--vo-surface)' }}>
            {/* Browser chrome */}
            <div style={{ background: 'var(--vo-surface-3)', borderBottom: '1px solid var(--vo-border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="flex gap-1.5">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--vo-sev-critical)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--vo-sev-medium)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--vo-sev-low)' }} />
              </div>
              <div style={{
                flex: 1, background: 'var(--vo-surface)', borderRadius: 'var(--vo-r)',
                padding: '6px 16px', fontSize: '12px', color: 'var(--vo-text-muted)',
                border: '1px solid var(--vo-border)', maxWidth: '280px', margin: '0 auto', textAlign: 'center',
                fontFamily: 'var(--vo-font-mono)',
              }}>
                voice-ops-gamma.vercel.app/operator
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: '1px solid var(--vo-border)' }}>

              {/* Left — idle state */}
              <div style={{ padding: '32px', background: 'var(--vo-surface-2)', borderRight: '1px solid var(--vo-border)' }}>
                <div className="w-full" style={{ maxWidth: '280px', margin: '0 auto' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '22px', height: '22px', borderRadius: 'var(--vo-r-sm)', background: 'var(--vo-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg className="vo-i" style={{ width: '12px', height: '12px', color: 'var(--vo-accent-fg)' }}><use href="#vo-hexagon" /></svg>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--vo-text)' }}>VoiceOps</span>
                    </div>
                    <span className="vo-caption">Erik J. ·{' '}
                      <svg className="vo-i vo-i-sm" style={{ verticalAlign: 'middle' }}><use href="#vo-sunrise" /></svg>{' '}
                      Morning
                    </span>
                  </div>

                  <div className="vo-card vo-card--pad" style={{ marginBottom: '20px' }}>
                    <p className="vo-eyebrow" style={{ marginBottom: '8px' }}>Shift</p>
                    <div className="flex gap-2" style={{ marginBottom: '12px' }}>
                      {[['sunrise', 'Morning', true], ['sun', 'Afternoon', false], ['moon', 'Night', false]].map(([icon, label, active]) => (
                        <div key={label as string} className="flex-1" style={{
                          padding: '8px 6px', textAlign: 'center', fontSize: '11px', fontWeight: 600,
                          borderRadius: 'var(--vo-r-sm)', border: '1px solid',
                          background: active ? 'var(--vo-shift-morning-bg)' : 'var(--vo-surface)',
                          borderColor: active ? 'var(--vo-shift-morning)' : 'var(--vo-border-strong)',
                          color: active ? 'var(--vo-shift-morning)' : 'var(--vo-text-muted)',
                        }}>
                          <svg className="vo-i vo-i-sm" style={{ display: 'block', margin: '0 auto 2px' }}><use href={`#vo-${icon as string}`} /></svg>
                          {label as string}
                        </div>
                      ))}
                    </div>
                    <p className="vo-eyebrow" style={{ marginBottom: '6px' }}>Machine</p>
                    <div style={{ padding: '8px 10px', borderRadius: 'var(--vo-r)', border: '1px solid var(--vo-border-strong)', fontSize: '12px', color: 'var(--vo-text-muted)', background: 'var(--vo-surface)' }}>
                      M-14, Assembly Line A
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto',
                      background: 'var(--vo-accent)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      boxShadow: 'var(--vo-e3)',
                    }}>
                      <svg className="vo-i" style={{ width: '32px', height: '32px', color: 'var(--vo-accent-fg)' }}><use href="#vo-mic" /></svg>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--vo-accent-fg)', letterSpacing: '.08em' }}>TAP TO SPEAK</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — AI result */}
              <div style={{ padding: '32px', background: 'var(--vo-surface)' }}>
                <div style={{ maxWidth: '280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p className="vo-eyebrow">AI Analysis — #047</p>

                  <div className="vo-card vo-card--pad" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--vo-sev-high)' }}>
                    <div className="flex items-center gap-3">
                      <span className="vo-badge vo-badge--high">HIGH</span>
                      <div>
                        <p className="vo-body-sm" style={{ fontWeight: 600 }}>Motor overheating on M-14</p>
                        <p className="vo-caption" style={{ color: 'var(--vo-sev-high)', marginTop: '2px' }}>Escalate → Maintenance</p>
                      </div>
                    </div>
                  </div>

                  <div className="vo-banner" style={{ padding: '10px 12px' }}>
                    <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
                    <p className="vo-body-sm">Do not attempt to restart — risk of electrical fire</p>
                  </div>

                  <div className="vo-card">
                    <div className="vo-card__head" style={{ padding: '10px 14px' }}>
                      <p className="vo-eyebrow">Immediate Actions</p>
                    </div>
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {['Stop the production line', 'Isolate power to M-14', 'Call Maintenance ext. 204'].map((action, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="vo-num" style={{ width: '18px', height: '18px', fontSize: '9px', flexShrink: 0 }}>{i + 1}</span>
                          <span className="vo-caption" style={{ color: 'var(--vo-text)', paddingTop: '2px' }}>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────── */}
      <section style={{ padding: '56px 24px', borderTop: '1px solid var(--vo-border)', borderBottom: '1px solid var(--vo-border)', background: 'var(--vo-surface)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '< 10s', label: 'From tap to AI response' },
            { value: '4',     label: 'Severity levels tracked' },
            { value: '3-step', label: 'Resolution workflow' },
            { value: '100%',  label: 'Voice or text input' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="vo-stat__value" style={{ fontSize: '32px', marginBottom: '4px' }}>{stat.value}</div>
              <div className="vo-caption">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: 'var(--vo-bg)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <p className="vo-eyebrow" style={{ color: 'var(--vo-accent)', marginBottom: '12px' }}>How it works</p>
            <h2 className="vo-h1">Three steps.<br />Under 30 seconds.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01', iconId: 'mic', title: 'Tap & Speak',
                desc: 'One big button. Operator taps and describes what they see — machine number, noise, smell, anything. Voice or type.',
                accentColor: 'var(--vo-accent)', accentBg: 'var(--vo-accent-tint)',
              },
              {
                step: '02', iconId: 'zap', title: 'AI Analyses',
                desc: 'Claude AI reads your uploaded plant manuals and SOPs, determines severity, finds root causes, and builds a response.',
                accentColor: 'var(--vo-status-prog)', accentBg: 'var(--vo-status-prog-bg)',
              },
              {
                step: '03', iconId: 'check-circle', title: 'Act & Resolve',
                desc: 'Numbered actions appear instantly. Supervisor picks it up, moves it In Progress, adds a resolution note, closes it out.',
                accentColor: 'var(--vo-status-done)', accentBg: 'var(--vo-status-done-bg)',
              },
            ].map((s, i) => (
              <div key={i} className="vo-card vo-card--pad" style={{ borderTopWidth: '3px', borderTopColor: s.accentColor }}>
                <div className="flex items-center gap-3" style={{ marginBottom: '20px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--vo-r)',
                    background: s.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg className="vo-i" style={{ color: s.accentColor }}><use href={`#vo-${s.iconId}`} /></svg>
                  </div>
                  <span className="vo-eyebrow" style={{ color: s.accentColor }}>Step {s.step}</span>
                </div>
                <h3 className="vo-h3" style={{ marginBottom: '10px' }}>{s.title}</h3>
                <p className="vo-body-sm" style={{ color: 'var(--vo-text-2)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 24px', background: 'var(--vo-text)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <p className="vo-eyebrow" style={{ color: 'var(--vo-accent)', marginBottom: '12px' }}>Features</p>
            <h2 className="vo-h1" style={{ color: 'var(--vo-bg)' }}>Built for the factory floor.</h2>
            <p className="vo-body-lg" style={{ color: 'var(--vo-text-muted)', maxWidth: '480px', margin: '16px auto 0' }}>
              Loud environments. PPE. Non-technical workers. Time pressure. VoiceOps is built for all of it.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { iconId: 'mic',        title: 'Voice-First',       desc: 'Speak naturally. No forms, no training. The mic does the work.' },
              { iconId: 'pencil',     title: 'Text Fallback',     desc: 'Mic blocked by PPE? Switch to typing with one tap — same AI, same result.' },
              { iconId: 'zap',        title: 'Claude AI',         desc: 'Anthropic Claude cross-references your uploaded manuals instantly.' },
              { iconId: 'file-text',  title: 'Knowledge Base',    desc: 'Upload PDFs, SOPs, manuals. The AI learns your plant-specific context.' },
              { iconId: 'activity',   title: 'Status Workflow',   desc: 'Open → In Progress → Resolved. Full lifecycle tracking per incident.' },
              { iconId: 'sunrise',    title: 'Shift & Machine Tags', desc: 'Auto-detects shift time. Tag the machine. Spot patterns fast.' },
            ].map((f, i) => (
              <div key={i} style={{
                padding: '24px', borderRadius: 'var(--vo-r-lg)',
                border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.06)',
              }}>
                <svg className="vo-i vo-i-lg" style={{ color: 'var(--vo-accent)', marginBottom: '16px' }}><use href={`#vo-${f.iconId}`} /></svg>
                <h3 className="vo-h3" style={{ color: 'var(--vo-bg)', marginBottom: '8px' }}>{f.title}</h3>
                <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR TEAMS ───────────────────────────────────────── */}
      <section id="for-teams" style={{ padding: '96px 24px', background: 'var(--vo-surface)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center" style={{ marginBottom: '64px' }}>
            <p className="vo-eyebrow" style={{ color: 'var(--vo-accent)', marginBottom: '12px' }}>For teams</p>
            <h2 className="vo-h1">Two apps.<br />One system.</h2>
            <p className="vo-body-lg" style={{ color: 'var(--vo-text-2)', marginTop: '16px' }}>
              Everyone sees exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Operator */}
            <div className="vo-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '32px', background: 'var(--vo-text)' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--vo-r)',
                  background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <svg className="vo-i vo-i-lg" style={{ color: 'var(--vo-accent)' }}><use href="#vo-mic" /></svg>
                </div>
                <h3 className="vo-h2" style={{ color: 'var(--vo-bg)', marginBottom: '4px' }}>For Operators</h3>
                <p className="vo-caption">Production line workers</p>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'One-tap incident reporting',
                  'Voice or text input',
                  'Instant AI-guided action steps',
                  'Severity & safety warnings',
                  'View status of past reports',
                  'Auto shift detection',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="vo-i vo-i-sm" style={{ color: 'var(--vo-status-done)', flexShrink: 0 }}><use href="#vo-check" /></svg>
                    <span className="vo-body-sm">{item}</span>
                  </div>
                ))}
                <Link href="/login" className="vo-btn vo-btn--primary vo-btn--block vo-btn--lg" style={{ marginTop: '8px', textDecoration: 'none' }}>
                  Operator Login
                  <svg className="vo-i"><use href="#vo-arrow-right" /></svg>
                </Link>
              </div>
            </div>

            {/* Admin */}
            <div className="vo-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '32px', background: 'var(--vo-accent)' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--vo-r)',
                  background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px',
                }}>
                  <svg className="vo-i vo-i-lg" style={{ color: 'var(--vo-accent-fg)' }}><use href="#vo-gauge" /></svg>
                </div>
                <h3 className="vo-h2" style={{ color: 'var(--vo-accent-fg)', marginBottom: '4px' }}>For Supervisors</h3>
                <p className="vo-caption" style={{ color: 'rgba(255,255,255,.7)' }}>Plant management & admins</p>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Real-time incident dashboard',
                  'Filter by severity, shift, status',
                  'Mark In Progress → Resolved',
                  'Add resolution notes',
                  'Upload AI knowledge base',
                  'Create & manage operator accounts',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <svg className="vo-i vo-i-sm" style={{ color: 'var(--vo-accent)', flexShrink: 0 }}><use href="#vo-check" /></svg>
                    <span className="vo-body-sm">{item}</span>
                  </div>
                ))}
                <Link href="/login" className="vo-btn vo-btn--secondary vo-btn--block vo-btn--lg" style={{ marginTop: '8px', textDecoration: 'none' }}>
                  Admin Portal
                  <svg className="vo-i"><use href="#vo-arrow-right" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section style={{ padding: '112px 24px', background: 'var(--vo-text)', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(234,88,12,.18) 0%, transparent 70%)',
        }} />
        <div className="max-w-2xl mx-auto text-center relative">
          <p className="vo-eyebrow" style={{ color: 'var(--vo-accent)', marginBottom: '16px' }}>Get started now</p>
          <h2 className="vo-h1" style={{ color: 'var(--vo-bg)', marginBottom: '20px' }}>
            Ready to see it<br />in action?
          </h2>
          <p className="vo-body-lg" style={{ color: 'var(--vo-text-muted)', marginBottom: '40px' }}>
            Log in as a demo operator and report your first incident in under 30 seconds. No setup needed.
          </p>
          <Link href="/login" className="vo-btn vo-btn--primary vo-btn--lg" style={{ textDecoration: 'none' }}>
            Try VoiceOps Free
            <svg className="vo-i"><use href="#vo-arrow-right" /></svg>
          </Link>
          <p className="vo-caption" style={{ marginTop: '20px' }}>
            Demo:{' '}
            <span className="vo-mono">OP001 / operator123</span>{' · '}
            <span className="vo-mono">ADMIN001 / admin123</span>
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', background: 'var(--vo-surface)', borderTop: '1px solid var(--vo-border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div style={{
              width: '26px', height: '26px', borderRadius: 'var(--vo-r-sm)',
              background: 'var(--vo-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg className="vo-i" style={{ width: '14px', height: '14px', color: 'var(--vo-accent-fg)' }}><use href="#vo-hexagon" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--vo-text)' }}>VoiceOps</span>
            <span style={{ color: 'var(--vo-border-strong)' }}>·</span>
            <span className="vo-caption">AI Incident Handler for Scania</span>
          </div>
          <p className="vo-caption">Built with Next.js · Anthropic Claude · Prisma Postgres</p>
        </div>
      </footer>

    </div>
  );
}
