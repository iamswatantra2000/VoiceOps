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
      if (!d.user || d.user.role !== 'admin') { router.push('/login'); return; }
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
    router.push('/login');
  }

  const STATUS_BADGE: Record<string, string> = {
    open: 'vo-badge--open', in_progress: 'vo-badge--prog', resolved: 'vo-badge--done',
  };
  const STATUS_LABEL: Record<string, string> = {
    open: 'Open', in_progress: 'In Progress', resolved: 'Resolved',
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--vo-bg)' }}>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between"
        style={{ background: 'var(--vo-text)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '30px', height: '30px', borderRadius: 'var(--vo-r)',
            background: 'var(--vo-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg className="vo-i" style={{ width: '16px', height: '16px', color: 'var(--vo-accent-fg)' }}>
              <use href="#vo-hexagon" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--vo-bg)', lineHeight: 1 }}>VoiceOps Admin</div>
            {user && (
              <div className="vo-caption" style={{ color: 'rgba(245,244,242,0.55)', marginTop: '2px' }}>
                {user.name} · Plant Management
              </div>
            )}
          </div>
        </div>
        <button onClick={logout} className="vo-btn vo-btn--ghost"
          style={{ height: '32px', padding: '0 14px' }}>
          <svg className="vo-i vo-i-sm"><use href="#vo-log-out" /></svg>
          Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: '32px' }}>
          <div className="vo-stat vo-stat--accent">
            <div className="vo-stat__value">{stats.total}</div>
            <div className="vo-stat__label">Total Incidents</div>
          </div>
          <div className="vo-stat vo-stat--open">
            <div className="vo-stat__value">{stats.open}</div>
            <div className="vo-stat__label">Open</div>
          </div>
          <div className="vo-stat vo-stat--critical">
            <div className="vo-stat__value">{stats.critical}</div>
            <div className="vo-stat__label">Critical</div>
          </div>
          <div className="vo-stat vo-stat--done">
            <div className="vo-stat__value">{stats.documents}</div>
            <div className="vo-stat__label">Documents</div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '32px' }}>
          <Link href="/admin/documents" className="vo-card vo-card--pad flex items-center gap-4"
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--vo-r)',
              background: 'var(--vo-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg className="vo-i" style={{ color: 'var(--vo-accent)' }}><use href="#vo-file-text" /></svg>
            </div>
            <div>
              <p className="vo-body" style={{ fontWeight: 700 }}>Knowledge Base</p>
              <p className="vo-caption">Upload PDFs, manuals, SOPs</p>
            </div>
          </Link>

          <Link href="/admin/incidents" className="vo-card vo-card--pad flex items-center gap-4"
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--vo-r)',
              background: 'var(--vo-sev-high-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg className="vo-i" style={{ color: 'var(--vo-sev-high)' }}><use href="#vo-alert-triangle" /></svg>
            </div>
            <div>
              <p className="vo-body" style={{ fontWeight: 700 }}>All Incidents</p>
              <p className="vo-caption">View, filter, and manage reports</p>
            </div>
          </Link>

          <Link href="/admin/users" className="vo-card vo-card--pad flex items-center gap-4"
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--vo-r)',
              background: 'var(--vo-sev-low-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg className="vo-i" style={{ color: 'var(--vo-sev-low)' }}><use href="#vo-users" /></svg>
            </div>
            <div>
              <p className="vo-body" style={{ fontWeight: 700 }}>Users</p>
              <p className="vo-caption">Create and manage accounts</p>
            </div>
          </Link>
        </div>

        {/* Recent Incidents */}
        <div className="vo-card">
          <div className="vo-card__head">
            <p className="vo-h3" style={{ fontSize: '16px' }}>Recent Incidents</p>
            <Link href="/admin/incidents" className="vo-body-sm"
              style={{ color: 'var(--vo-accent)', textDecoration: 'none', fontWeight: 600 }}>
              View all
            </Link>
          </div>
          {recentIncidents.length === 0 && (
            <div style={{ padding: '24px' }}>
              <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>No incidents reported yet.</p>
            </div>
          )}
          {recentIncidents.map((inc, idx) => {
            let summary = 'Incident recorded';
            try { summary = JSON.parse(inc.ai_analysis).summary; } catch {}
            return (
              <div key={inc.id} className="flex items-start gap-4"
                style={{ padding: '14px 18px', borderTop: idx === 0 ? '1px solid var(--vo-border)' : '1px solid var(--vo-border)' }}>
                <span className={`vo-badge vo-badge--${inc.severity}`} style={{ flexShrink: 0, marginTop: '2px' }}>
                  {inc.severity.toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="vo-body-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {summary}
                  </p>
                  <p className="vo-caption" style={{ marginTop: '2px' }}>
                    {inc.operator_name} · {inc.department} · {new Date(inc.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`vo-badge vo-badge--bare ${STATUS_BADGE[inc.status] || ''}`} style={{ flexShrink: 0 }}>
                  {STATUS_LABEL[inc.status] || inc.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
