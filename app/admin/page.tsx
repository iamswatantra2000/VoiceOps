'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  name: string;
  department: string;
  role: string;
}

interface Stats {
  total: number;
  open: number;
  critical: number;
  documents: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, critical: 0, documents: 0 });
  const [recentIncidents, setRecentIncidents] = useState<{
    id: number; voice_transcript: string; severity: string; status: string;
    operator_name: string; department: string; created_at: string; ai_analysis: string;
  }[]>([]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/'); return; }
      setUser(d.user);
    });
    loadData();
  }, [router]);

  async function loadData() {
    const [incRes, docRes] = await Promise.all([
      fetch('/api/incidents?limit=10'),
      fetch('/api/documents'),
    ]);

    if (incRes.ok) {
      const { incidents } = await incRes.json();
      setRecentIncidents(incidents);
      setStats(prev => ({
        ...prev,
        total: incidents.length,
        open: incidents.filter((i: { status: string }) => i.status === 'open').length,
        critical: incidents.filter((i: { severity: string }) => i.severity === 'critical').length,
      }));
    }
    if (docRes.ok) {
      const { documents } = await docRes.json();
      setStats(prev => ({ ...prev, documents: documents.length }));
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const SEVERITY_COLORS: Record<string, string> = {
    low: '#22c55e', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed',
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between shadow-sm" style={{ backgroundColor: '#003057' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold">VoiceOps Admin</div>
            {user && <div className="text-blue-300 text-xs">{user.name} · Plant Management</div>}
          </div>
        </div>
        <button onClick={logout} className="text-blue-200 text-sm px-4 py-1.5 rounded-lg border border-blue-700 hover:bg-blue-900 transition">
          Sign Out
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Incidents', value: stats.total, color: '#003057' },
            { label: 'Open', value: stats.open, color: '#f59e0b' },
            { label: 'Critical', value: stats.critical, color: '#ef4444' },
            { label: 'Documents', value: stats.documents, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="text-3xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/documents" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#003057' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">Knowledge Base</div>
              <div className="text-sm text-gray-500">Upload PDFs, manuals, SOPs</div>
            </div>
          </Link>

          <Link href="/admin/incidents" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">All Incidents</div>
              <div className="text-sm text-gray-500">View, filter, and manage reports</div>
            </div>
          </Link>

          <Link href="/admin/users" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-800">Users</div>
              <div className="text-sm text-gray-500">Create and manage accounts</div>
            </div>
          </Link>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-700">Recent Incidents</h2>
            <Link href="/admin/incidents" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentIncidents.length === 0 && (
              <p className="text-gray-400 text-sm p-6">No incidents reported yet.</p>
            )}
            {recentIncidents.map(inc => {
              let summary = 'Incident recorded';
              try { summary = JSON.parse(inc.ai_analysis).summary; } catch {}
              return (
                <div key={inc.id} className="px-6 py-4 flex items-start gap-4">
                  <span className="text-xs font-bold px-2 py-1 rounded-full mt-0.5 flex-shrink-0" style={{
                    backgroundColor: SEVERITY_COLORS[inc.severity] + '20',
                    color: SEVERITY_COLORS[inc.severity],
                  }}>
                    {inc.severity.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{summary}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {inc.operator_name} · {inc.department} · {new Date(inc.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
                    {inc.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
