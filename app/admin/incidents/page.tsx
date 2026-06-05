'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Incident {
  id: number;
  voice_transcript: string;
  ai_analysis: string;
  severity: string;
  status: string;
  operator_name: string;
  employee_id: string;
  department: string;
  created_at: string;
  resolution_note?: string;
  resolver_name?: string;
  resolved_at?: string;
  shift?: string;
  machine?: string;
}

interface ParsedAnalysis {
  summary: string;
  immediateActions: string[];
  possibleCauses: string[];
  escalateTo: string;
  safetyWarnings: string[];
}

const SEV_BADGE: Record<string, string> = {
  low: 'vo-badge--low', medium: 'vo-badge--medium', high: 'vo-badge--high', critical: 'vo-badge--critical',
};
const SEV_COLOR: Record<string, string> = {
  low: 'var(--vo-sev-low)', medium: 'var(--vo-sev-medium)', high: 'var(--vo-sev-high)', critical: 'var(--vo-sev-critical)',
};
const SEV_BG: Record<string, string> = {
  low: 'var(--vo-sev-low-bg)', medium: 'var(--vo-sev-medium-bg)', high: 'var(--vo-sev-high-bg)', critical: 'var(--vo-sev-critical-bg)',
};
const SEV_LINE: Record<string, string> = {
  low: 'var(--vo-sev-low-line)', medium: 'var(--vo-sev-medium-line)', high: 'var(--vo-sev-high-line)', critical: 'var(--vo-sev-critical-line)',
};
const STATUS_BADGE: Record<string, string> = {
  open: 'vo-badge--open', in_progress: 'vo-badge--prog', resolved: 'vo-badge--done',
};
const STATUS_CONFIG: Record<string, { label: string }> = {
  open: { label: 'Open' }, in_progress: { label: 'In Progress' }, resolved: { label: 'Resolved' },
};
const SHIFT_ICON: Record<string, string> = {
  Morning: 'sunrise', Afternoon: 'sun', Night: 'moon',
};
const STATUS_STEPS = ['open', 'in_progress', 'resolved'];

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/login'); return; }
    });
    loadIncidents();
  }, [router]);

  async function loadIncidents() {
    const res = await fetch('/api/incidents?limit=100');
    if (res.ok) {
      const { incidents } = await res.json();
      setIncidents(incidents);
    }
  }

  async function updateStatus(id: number, status: string) {
    setUpdating(true);
    const res = await fetch('/api/incidents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, resolution_note: resolutionNote }),
    });
    if (res.ok) {
      const { incident } = await res.json();
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...incident } : i));
      setSelected(prev => prev?.id === id ? { ...prev, ...incident } : prev);
      setResolutionNote('');
    }
    setUpdating(false);
  }

  const severityFilters = ['critical', 'high', 'medium', 'low'];
  const shiftFilters = ['all', 'Morning', 'Afternoon', 'Night'];
  const statusFilters = ['all', 'open', 'in_progress', 'resolved'];

  const filtered = incidents.filter(i => {
    const matchSeverity = filter === 'all' || i.severity === filter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchShift = shiftFilter === 'all' || i.shift === shiftFilter;
    return matchSeverity && matchStatus && matchShift;
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--vo-bg)' }}>
      <header className="px-6 py-4 flex items-center gap-4"
        style={{ background: 'var(--vo-text)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <Link href="/admin" style={{ color: 'rgba(245,244,242,0.65)', display: 'flex', alignItems: 'center' }}>
          <svg className="vo-i"><use href="#vo-arrow-left" /></svg>
        </Link>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--vo-bg)', lineHeight: 1 }}>All Incidents</h1>
          <p className="vo-caption" style={{ color: 'rgba(245,244,242,0.55)', marginTop: '2px' }}>
            {incidents.length} total reports
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '24px' }}>

        {/* Left: List */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Severity chips */}
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: '8px' }}>
            {['all', ...severityFilters].map(f => (
              <button key={f} className="vo-chip" aria-pressed={filter === f ? 'true' : 'false'} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All Severity' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Shift chips */}
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: '8px' }}>
            {shiftFilters.map(f => (
              <button key={f} className="vo-chip" aria-pressed={shiftFilter === f ? 'true' : 'false'} onClick={() => setShiftFilter(f)}>
                {f !== 'all' && <svg className="vo-i vo-i-sm"><use href={`#vo-${SHIFT_ICON[f]}`} /></svg>}
                {f === 'all' ? 'All Shifts' : f}
              </button>
            ))}
          </div>

          {/* Status chips */}
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: '20px' }}>
            {statusFilters.map(f => (
              <button key={f} className="vo-chip" aria-pressed={statusFilter === f ? 'true' : 'false'} onClick={() => setStatusFilter(f)}>
                {f === 'all' ? 'All Status' : STATUS_CONFIG[f].label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 && (
              <div className="vo-card vo-card--pad" style={{ textAlign: 'center' }}>
                <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>No incidents found.</p>
              </div>
            )}
            {filtered.map(inc => {
              let summary = 'Incident recorded';
              try { summary = JSON.parse(inc.ai_analysis).summary; } catch {}
              const isSelected = selected?.id === inc.id;
              return (
                <button key={inc.id}
                  onClick={() => { setSelected(inc); setResolutionNote(''); }}
                  className={`vo-row${isSelected ? ' vo-row--selected' : ''}`}
                  style={isSelected ? { borderColor: SEV_COLOR[inc.severity] } : {}}>
                  <span className={`vo-badge ${SEV_BADGE[inc.severity] || ''}`} style={{ flexShrink: 0 }}>
                    {inc.severity.toUpperCase()}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="vo-body-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {summary}
                    </p>
                    <p className="vo-caption" style={{ marginTop: '4px' }}>
                      {inc.operator_name} ({inc.employee_id}) · {inc.department}
                    </p>
                    <p className="vo-caption">
                      {new Date(inc.created_at).toLocaleString()}
                      {inc.shift && (
                        <> · <svg className="vo-i vo-i-sm" style={{ verticalAlign: 'middle' }}>
                          <use href={`#vo-${SHIFT_ICON[inc.shift] || 'clock'}`} />
                        </svg> {inc.shift}</>
                      )}
                      {inc.machine && (
                        <> · <svg className="vo-i vo-i-sm" style={{ verticalAlign: 'middle' }}><use href="#vo-wrench" /></svg> {inc.machine}</>
                      )}
                    </p>
                  </div>
                  <span className={`vo-badge vo-badge--bare ${STATUS_BADGE[inc.status] || ''}`} style={{ flexShrink: 0 }}>
                    {STATUS_CONFIG[inc.status]?.label || inc.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selected && (() => {
          let analysis: ParsedAnalysis | null = null;
          try { analysis = JSON.parse(selected.ai_analysis); } catch {}
          const currentStep = STATUS_STEPS.indexOf(selected.status);

          return (
            <div style={{ width: '380px', flexShrink: 0 }} className="fade-in-up">
              <div className="vo-card">
                {/* Card header */}
                <div className="vo-card__head">
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>Incident #{selected.id}</span>
                  <button onClick={() => setSelected(null)} className="vo-btn vo-btn--ghost"
                    style={{ width: '28px', height: '28px', padding: 0, color: 'var(--vo-text-muted)' }}>
                    <svg className="vo-i vo-i-sm"><use href="#vo-x" /></svg>
                  </button>
                </div>

                <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Status Stepper */}
                  <div>
                    <p className="vo-eyebrow" style={{ marginBottom: '12px' }}>Status</p>
                    <div className="vo-stepper">
                      {STATUS_STEPS.map((step, i) => {
                        const isDone = i < currentStep;
                        const isActive = i === currentStep;
                        const isLast = i === STATUS_STEPS.length - 1;
                        return (
                          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 'none' : 1 }}>
                            <div className="vo-stepper__node">
                              <div className={`vo-stepper__dot${isDone ? ' vo-stepper__dot--done' : ''}${isActive ? ' vo-stepper__dot--active' : ''}`}>
                                {isDone
                                  ? <svg className="vo-i" style={{ width: '12px', height: '12px' }}><use href="#vo-check" /></svg>
                                  : <span style={{ fontSize: '10px', fontFamily: 'var(--vo-font-mono)', fontWeight: 700 }}>{i + 1}</span>
                                }
                              </div>
                              <span className="vo-stepper__label">{STATUS_CONFIG[step].label}</span>
                            </div>
                            {!isLast && <div className={`vo-stepper__bar${isDone ? ' vo-stepper__bar--done' : ''}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Severity + Summary */}
                  <div style={{
                    padding: '12px', borderRadius: 'var(--vo-r)',
                    background: SEV_BG[selected.severity] || 'var(--vo-surface-2)',
                    border: `1px solid ${SEV_LINE[selected.severity] || 'var(--vo-border)'}`,
                  }}>
                    <span className={`vo-badge ${SEV_BADGE[selected.severity] || ''}`}>
                      {selected.severity.toUpperCase()} SEVERITY
                    </span>
                    {analysis && <p className="vo-body-sm" style={{ marginTop: '8px' }}>{analysis.summary}</p>}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {([
                      ['Operator', `${selected.operator_name} (${selected.employee_id})`],
                      ['Department', selected.department],
                      ['Reported', new Date(selected.created_at).toLocaleString()],
                      ...(selected.shift ? [['Shift', selected.shift]] : []),
                      ...(selected.machine ? [['Machine', selected.machine]] : []),
                      ...(analysis ? [['Escalate to', analysis.escalateTo]] : []),
                    ] as [string, string][]).map(([key, val]) => (
                      <p key={key} className="vo-caption">
                        <strong style={{ color: 'var(--vo-text-2)', fontWeight: 600 }}>{key}:</strong> {val}
                      </p>
                    ))}
                  </div>

                  {/* Transcript */}
                  <div>
                    <p className="vo-eyebrow" style={{ marginBottom: '8px' }}>Transcript</p>
                    <p className="vo-body-sm" style={{
                      fontStyle: 'italic', color: 'var(--vo-text-2)',
                      background: 'var(--vo-surface-2)', padding: '10px 12px', borderRadius: 'var(--vo-r)',
                    }}>
                      &quot;{selected.voice_transcript}&quot;
                    </p>
                  </div>

                  {/* Immediate Actions */}
                  {analysis?.immediateActions && (
                    <div>
                      <p className="vo-eyebrow" style={{ marginBottom: '10px' }}>Immediate Actions</p>
                      <ol style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {analysis.immediateActions.map((a, i) => (
                          <li key={i} className="flex gap-2 items-start">
                            <span className="vo-num" style={{ flexShrink: 0, width: '20px', height: '20px', fontSize: '10px' }}>{i + 1}</span>
                            <span className="vo-body-sm">{a}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Safety Warnings */}
                  {analysis?.safetyWarnings && analysis.safetyWarnings.length > 0 && (
                    <div className="vo-banner">
                      <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
                      <div>
                        <p className="vo-banner__title">Safety Warnings</p>
                        {analysis.safetyWarnings.map((w, i) => (
                          <p key={i} className="vo-body-sm" style={{ marginTop: '4px' }}>{w}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Note */}
                  {selected.status === 'resolved' && selected.resolution_note && (
                    <div style={{
                      padding: '12px', borderRadius: 'var(--vo-r)',
                      background: 'var(--vo-sev-low-bg)', border: '1px solid var(--vo-sev-low-line)',
                    }}>
                      <p className="vo-eyebrow" style={{ color: 'var(--vo-sev-low)', marginBottom: '6px' }}>Resolution Note</p>
                      <p className="vo-body-sm" style={{ color: 'var(--vo-sev-low)' }}>{selected.resolution_note}</p>
                      {selected.resolver_name && (
                        <p className="vo-caption" style={{ color: 'var(--vo-sev-low)', marginTop: '6px' }}>
                          Resolved by {selected.resolver_name}
                          {selected.resolved_at && <> · {new Date(selected.resolved_at).toLocaleString()}</>}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {selected.status === 'open' && (
                    <button onClick={() => updateStatus(selected.id, 'in_progress')} disabled={updating}
                      className="vo-btn vo-btn--primary vo-btn--block">
                      <svg className="vo-i"><use href="#vo-play" /></svg>
                      {updating ? 'Updating...' : 'Mark In Progress'}
                    </button>
                  )}

                  {selected.status === 'in_progress' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="vo-field">
                        <label className="vo-label">Resolution Note (optional)</label>
                        <textarea
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          placeholder="What was done to fix it?"
                          className="vo-textarea"
                          style={{ minHeight: '80px' }}
                        />
                      </div>
                      <button onClick={() => updateStatus(selected.id, 'resolved')} disabled={updating}
                        className="vo-btn vo-btn--block"
                        style={{ background: 'var(--vo-sev-low)', color: '#fff', borderColor: 'var(--vo-sev-low)', height: '42px' }}>
                        <svg className="vo-i"><use href="#vo-check" /></svg>
                        {updating ? 'Saving...' : 'Mark Resolved'}
                      </button>
                    </div>
                  )}

                  {selected.status === 'resolved' && (
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                      <span className="vo-body-sm flex items-center justify-center gap-2"
                        style={{ color: 'var(--vo-sev-low)', fontWeight: 600 }}>
                        <svg className="vo-i vo-i-sm"><use href="#vo-check-circle" /></svg>
                        This incident is resolved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
