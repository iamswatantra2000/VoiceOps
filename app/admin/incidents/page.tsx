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

const SEVERITY_COLORS: Record<string, { color: string; bg: string }> = {
  low: { color: '#22c55e', bg: '#f0fdf4' },
  medium: { color: '#f59e0b', bg: '#fffbeb' },
  high: { color: '#ef4444', bg: '#fef2f2' },
  critical: { color: '#7c3aed', bg: '#fdf4ff' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#f59e0b', bg: '#fffbeb' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
  resolved:    { label: 'Resolved',    color: '#22c55e', bg: '#f0fdf4' },
};

const STATUS_STEPS = ['open', 'in_progress', 'resolved'];

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<string>('all');
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
      // Update both the list and the selected panel
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, ...incident } : i));
      setSelected(prev => prev?.id === id ? { ...prev, ...incident } : prev);
      setResolutionNote('');
    }
    setUpdating(false);
  }

  const statusFilters = ['all', 'open', 'in_progress', 'resolved'];
  const severityFilters = ['critical', 'high', 'medium', 'low'];
  const shiftFilters = ['all', 'Morning', 'Afternoon', 'Night'];

  const [statusFilter, setStatusFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');

  const filtered = incidents.filter(i => {
    const matchSeverity = filter === 'all' || i.severity === filter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchShift = shiftFilter === 'all' || i.shift === shiftFilter;
    return matchSeverity && matchStatus && matchShift;
  });

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <header className="px-6 py-4 flex items-center gap-4 shadow-sm" style={{ backgroundColor: '#003057' }}>
        <Link href="/admin" className="text-blue-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-white font-bold">All Incidents</h1>
          <p className="text-blue-300 text-xs">{incidents.length} total reports</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">
        {/* Left: List */}
        <div className="flex-1 min-w-0">

          {/* Severity filters */}
          <div className="flex gap-2 mb-2 flex-wrap">
            {['all', ...severityFilters].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  backgroundColor: filter === f ? '#003057' : 'white',
                  color: filter === f ? 'white' : '#555',
                  border: '1px solid #e5e7eb',
                }}>
                {f === 'all' ? 'All Severity' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Shift filters */}
          <div className="flex gap-2 mb-2 flex-wrap">
            {shiftFilters.map(f => (
              <button key={f} onClick={() => setShiftFilter(f)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  backgroundColor: shiftFilter === f ? '#4f46e5' : 'white',
                  color: shiftFilter === f ? 'white' : '#555',
                  border: '1px solid #e5e7eb',
                }}>
                {f === 'Morning' ? '🌅' : f === 'Afternoon' ? '☀️' : f === 'Night' ? '🌙' : ''} {f === 'all' ? 'All Shifts' : f}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {statusFilters.map(f => {
              const cfg = f === 'all' ? null : STATUS_CONFIG[f];
              return (
                <button key={f} onClick={() => setStatusFilter(f)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition"
                  style={{
                    backgroundColor: statusFilter === f ? (cfg?.color || '#003057') : 'white',
                    color: statusFilter === f ? 'white' : '#555',
                    border: '1px solid #e5e7eb',
                  }}>
                  {f === 'all' ? 'All Status' : STATUS_CONFIG[f].label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No incidents found.</div>
            )}
            {filtered.map(inc => {
              let summary = 'Incident recorded';
              try { summary = JSON.parse(inc.ai_analysis).summary; } catch {}
              const sc = SEVERITY_COLORS[inc.severity] || { color: '#888', bg: '#f9f9f9' };
              const stc = STATUS_CONFIG[inc.status] || { label: inc.status, color: '#888', bg: '#f9f9f9' };
              return (
                <button key={inc.id} onClick={() => { setSelected(inc); setResolutionNote(''); }}
                  className="w-full bg-white rounded-2xl p-4 border-2 text-left transition hover:shadow-md"
                  style={{ borderColor: selected?.id === inc.id ? sc.color : 'transparent' }}>
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {inc.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{summary}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {inc.operator_name} ({inc.employee_id}) · {inc.department}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(inc.created_at).toLocaleString()}
                        {inc.shift && <> · {inc.shift === 'Morning' ? '🌅' : inc.shift === 'Afternoon' ? '☀️' : '🌙'} {inc.shift}</>}
                        {inc.machine && <> · 🔧 {inc.machine}</>}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                      style={{ backgroundColor: stc.bg, color: stc.color }}>
                      {stc.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {selected && (() => {
          let analysis: ParsedAnalysis | null = null;
          try { analysis = JSON.parse(selected.ai_analysis); } catch {}
          const sc = SEVERITY_COLORS[selected.severity] || { color: '#888', bg: '#f9f9f9' };
          const currentStep = STATUS_STEPS.indexOf(selected.status);

          return (
            <div className="w-96 flex-shrink-0 space-y-4 fade-in-up">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-700">Incident #{selected.id}</span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                </div>

                {/* Status Stepper */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-gray-500 mb-3">STATUS</p>
                  <div className="flex items-center gap-0">
                    {STATUS_STEPS.map((step, i) => {
                      const cfg = STATUS_CONFIG[step];
                      const done = i <= currentStep;
                      const isLast = i === STATUS_STEPS.length - 1;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
                              style={{
                                backgroundColor: done ? cfg.color : 'white',
                                borderColor: done ? cfg.color : '#d1d5db',
                              }}>
                              {done ? (
                                i === currentStep && step !== 'resolved' ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                                ) : (
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                  </svg>
                                )
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-gray-300" />
                              )}
                            </div>
                            <span className="text-xs mt-1 font-medium text-center leading-tight"
                              style={{ color: done ? cfg.color : '#9ca3af', fontSize: '10px' }}>
                              {cfg.label}
                            </span>
                          </div>
                          {!isLast && (
                            <div className="flex-1 h-0.5 mb-4 mx-1 transition-all"
                              style={{ backgroundColor: i < currentStep ? STATUS_CONFIG[STATUS_STEPS[i + 1]].color : '#e5e7eb' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Severity + Summary */}
                <div className="rounded-xl p-3 mb-4 border" style={{ backgroundColor: sc.bg, borderColor: sc.color + '40' }}>
                  <span className="text-xs font-bold" style={{ color: sc.color }}>{selected.severity.toUpperCase()} SEVERITY</span>
                  {analysis && <p className="text-sm text-gray-700 mt-1">{analysis.summary}</p>}
                </div>

                {/* Meta */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p><strong>Operator:</strong> {selected.operator_name} ({selected.employee_id})</p>
                  <p><strong>Department:</strong> {selected.department}</p>
                  <p><strong>Reported:</strong> {new Date(selected.created_at).toLocaleString()}</p>
                  {selected.shift && <p><strong>Shift:</strong> {selected.shift === 'Morning' ? '🌅' : selected.shift === 'Afternoon' ? '☀️' : '🌙'} {selected.shift}</p>}
                  {selected.machine && <p><strong>Machine / Station:</strong> 🔧 {selected.machine}</p>}
                  {analysis && <p><strong>Escalate to:</strong> {analysis.escalateTo}</p>}
                </div>

                {/* Transcript */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">TRANSCRIPT</p>
                  <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">&quot;{selected.voice_transcript}&quot;</p>
                </div>

                {/* Immediate Actions */}
                {analysis?.immediateActions && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">IMMEDIATE ACTIONS</p>
                    <ol className="space-y-1.5">
                      {analysis.immediateActions.map((a, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full text-white flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#003057', fontSize: '10px' }}>{i + 1}</span>
                          {a}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Safety Warnings */}
                {analysis?.safetyWarnings && analysis.safetyWarnings.length > 0 && (
                  <div className="rounded-xl p-3 mb-4 bg-red-50 border border-red-200">
                    <p className="text-xs font-bold text-red-700 mb-1">SAFETY WARNINGS</p>
                    {analysis.safetyWarnings.map((w, i) => (
                      <p key={i} className="text-xs text-red-600">{w}</p>
                    ))}
                  </div>
                )}

                {/* Resolution Note (if resolved) */}
                {selected.status === 'resolved' && selected.resolution_note && (
                  <div className="rounded-xl p-3 mb-4 bg-green-50 border border-green-200">
                    <p className="text-xs font-bold text-green-700 mb-1">RESOLUTION NOTE</p>
                    <p className="text-sm text-green-800">{selected.resolution_note}</p>
                    {selected.resolver_name && (
                      <p className="text-xs text-green-600 mt-1">
                        Resolved by {selected.resolver_name}
                        {selected.resolved_at && <> · {new Date(selected.resolved_at).toLocaleString()}</>}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {selected.status === 'open' && (
                  <button
                    onClick={() => updateStatus(selected.id, 'in_progress')}
                    disabled={updating}
                    className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-60"
                    style={{ backgroundColor: '#3b82f6' }}
                  >
                    {updating ? 'Updating...' : '▶ Mark In Progress'}
                  </button>
                )}

                {selected.status === 'in_progress' && (
                  <div className="space-y-3">
                    <textarea
                      value={resolutionNote}
                      onChange={e => setResolutionNote(e.target.value)}
                      placeholder="Add a resolution note (optional) — what was done to fix it?"
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none"
                    />
                    <button
                      onClick={() => updateStatus(selected.id, 'resolved')}
                      disabled={updating}
                      className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-60"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      {updating ? 'Saving...' : '✓ Mark Resolved'}
                    </button>
                  </div>
                )}

                {selected.status === 'resolved' && (
                  <div className="text-center py-2">
                    <span className="text-green-600 text-sm font-semibold">✓ This incident is resolved</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
