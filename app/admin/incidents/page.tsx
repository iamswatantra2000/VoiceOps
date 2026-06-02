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

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/'); return; }
    });
    fetch('/api/incidents?limit=100').then(r => r.json()).then(d => {
      if (d.incidents) setIncidents(d.incidents);
    });
  }, [router]);

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.severity === filter);

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
          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'critical', 'high', 'medium', 'low'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition"
                style={{
                  backgroundColor: filter === f ? '#003057' : 'white',
                  color: filter === f ? 'white' : '#555',
                  border: '1px solid #e5e7eb',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No incidents found.</div>
            )}
            {filtered.map(inc => {
              let summary = 'Incident recorded';
              try { summary = JSON.parse(inc.ai_analysis).summary; } catch {}
              const sc = SEVERITY_COLORS[inc.severity] || { color: '#888', bg: '#f9f9f9' };
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelected(inc)}
                  className="w-full bg-white rounded-2xl p-4 border-2 text-left transition hover:shadow-md"
                  style={{ borderColor: selected?.id === inc.id ? sc.color : 'transparent' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color }}>
                      {inc.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{summary}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {inc.operator_name} ({inc.employee_id}) · {inc.department}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(inc.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">{inc.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detail */}
        {selected && (() => {
          let analysis: ParsedAnalysis | null = null;
          try { analysis = JSON.parse(selected.ai_analysis); } catch {}
          const sc = SEVERITY_COLORS[selected.severity] || { color: '#888', bg: '#f9f9f9' };
          return (
            <div className="w-96 flex-shrink-0 space-y-4 fade-in-up">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-700">Incident #{selected.id}</span>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="rounded-xl p-3 mb-4 border" style={{ backgroundColor: sc.bg, borderColor: sc.color + '40' }}>
                  <span className="text-xs font-bold" style={{ color: sc.color }}>{selected.severity.toUpperCase()} SEVERITY</span>
                  {analysis && <p className="text-sm text-gray-700 mt-1">{analysis.summary}</p>}
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <p><strong>Operator:</strong> {selected.operator_name} ({selected.employee_id})</p>
                  <p><strong>Department:</strong> {selected.department}</p>
                  <p><strong>Time:</strong> {new Date(selected.created_at).toLocaleString()}</p>
                  {analysis && <p><strong>Escalate to:</strong> {analysis.escalateTo}</p>}
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">VOICE TRANSCRIPT</p>
                  <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">&quot;{selected.voice_transcript}&quot;</p>
                </div>

                {analysis?.immediateActions && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">IMMEDIATE ACTIONS</p>
                    <ol className="space-y-1.5">
                      {analysis.immediateActions.map((a, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#003057', fontSize: '10px' }}>{i + 1}</span>
                          {a}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {analysis?.safetyWarnings && analysis.safetyWarnings.length > 0 && (
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-xs font-bold text-red-700 mb-1">SAFETY WARNINGS</p>
                    {analysis.safetyWarnings.map((w, i) => (
                      <p key={i} className="text-xs text-red-600">{w}</p>
                    ))}
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
