'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  name: string;
  employee_id: string;
  role: string;
  department: string;
  created_at: string;
}

const DEPARTMENTS = [
  'Assembly Line A', 'Assembly Line B', 'Welding Station A', 'Welding Station B',
  'Paint Shop', 'Quality Control', 'Maintenance', 'Logistics', 'Management', 'Other',
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '', employee_id: '', password: '', role: 'operator', department: 'Assembly Line A',
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/login'); return; }
      setCurrentUserId(d.user.id);
    });
    loadUsers();
  }, [router]);

  async function loadUsers() {
    const res = await fetch('/api/users');
    if (res.ok) {
      const { users } = await res.json();
      setUsers(users);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Failed to create user');
      return;
    }

    setSuccess(`User "${form.name}" (${form.employee_id.toUpperCase()}) created successfully.`);
    setForm({ name: '', employee_id: '', password: '', role: 'operator', department: 'Assembly Line A' });
    setShowForm(false);
    loadUsers();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadUsers();
  }

  const operators = users.filter(u => u.role === 'operator');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="min-h-screen" style={{ background: 'var(--vo-bg)' }}>
      <header className="px-6 py-4 flex items-center gap-4"
        style={{ background: 'var(--vo-text)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <Link href="/admin" style={{ color: 'rgba(245,244,242,0.65)', display: 'flex', alignItems: 'center' }}>
          <svg className="vo-i"><use href="#vo-arrow-left" /></svg>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--vo-bg)', lineHeight: 1 }}>User Management</h1>
          <p className="vo-caption" style={{ color: 'rgba(245,244,242,0.55)', marginTop: '2px' }}>
            {users.length} accounts total
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="vo-btn vo-btn--primary"
          style={{ height: '36px', padding: '0 16px' }}
        >
          {showForm
            ? <><svg className="vo-i vo-i-sm"><use href="#vo-x" /></svg> Cancel</>
            : <><svg className="vo-i vo-i-sm"><use href="#vo-plus" /></svg> New User</>
          }
        </button>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Create User Form */}
        {showForm && (
          <div className="vo-card vo-card--pad fade-in-up">
            <h2 className="vo-h3" style={{ marginBottom: '20px' }}>Create New User</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="vo-field">
                  <label className="vo-label">Full Name</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Erik Johansson" className="vo-input" required />
                </div>
                <div className="vo-field">
                  <label className="vo-label">Employee ID</label>
                  <input type="text" value={form.employee_id}
                    onChange={e => setForm(f => ({ ...f, employee_id: e.target.value.toUpperCase() }))}
                    placeholder="e.g. OP003" className="vo-input vo-input--mono" required />
                </div>
                <div className="vo-field">
                  <label className="vo-label">Password</label>
                  <input type="text" value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Set a temporary password" className="vo-input" required minLength={6} />
                </div>
                <div className="vo-field">
                  <label className="vo-label">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="vo-input" style={{ cursor: 'pointer' }}>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="vo-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="vo-label">Department</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="vo-input" style={{ cursor: 'pointer' }}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="vo-banner">
                  <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
                  <span className="vo-body-sm">{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="vo-btn vo-btn--primary vo-btn--block vo-btn--lg">
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="fade-in-up" style={{
            padding: '12px 16px', borderRadius: 'var(--vo-r)',
            background: 'var(--vo-sev-low-bg)', border: '1px solid var(--vo-sev-low-line)',
          }}>
            <div className="flex items-center gap-2">
              <svg className="vo-i vo-i-sm" style={{ color: 'var(--vo-sev-low)', flexShrink: 0 }}><use href="#vo-check-circle" /></svg>
              <p className="vo-body-sm" style={{ color: 'var(--vo-sev-low)' }}>{success}</p>
            </div>
          </div>
        )}

        {/* Operators */}
        <div className="vo-card">
          <div className="vo-card__head">
            <p style={{ fontWeight: 700, fontSize: '15px' }}>
              Operators{' '}
              <span className="vo-mono" style={{ fontSize: '13px', color: 'var(--vo-text-muted)' }}>({operators.length})</span>
            </p>
          </div>
          {operators.length === 0 ? (
            <div style={{ padding: '24px' }}>
              <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>No operators yet.</p>
            </div>
          ) : operators.map(u => (
            <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} onDelete={handleDelete} />
          ))}
        </div>

        {/* Admins */}
        <div className="vo-card">
          <div className="vo-card__head">
            <p style={{ fontWeight: 700, fontSize: '15px' }}>
              Admins{' '}
              <span className="vo-mono" style={{ fontSize: '13px', color: 'var(--vo-text-muted)' }}>({admins.length})</span>
            </p>
          </div>
          {admins.map(u => (
            <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, isSelf, onDelete }: {
  user: User;
  isSelf: boolean;
  onDelete: (id: number, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-4"
      style={{ padding: '14px 18px', borderTop: '1px solid var(--vo-border)' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: user.role === 'admin' ? 'var(--vo-accent)' : 'var(--vo-text)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--vo-font-mono)', fontWeight: 700, fontSize: '12px',
        color: user.role === 'admin' ? 'var(--vo-accent-fg)' : 'var(--vo-bg)',
        flexShrink: 0,
      }}>
        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2">
          <p className="vo-body-sm" style={{ fontWeight: 600 }}>{user.name}</p>
          {isSelf && (
            <span className="vo-badge vo-badge--bare vo-badge--prog" style={{ fontSize: '10px', padding: '2px 6px' }}>
              You
            </span>
          )}
        </div>
        <p className="vo-caption" style={{ marginTop: '2px' }}>
          <span className="vo-mono" style={{ color: 'var(--vo-text-2)' }}>{user.employee_id}</span>
          {user.department && <> · {user.department}</>}
          <> · Joined {new Date(user.created_at).toLocaleDateString()}</>
        </p>
      </div>
      <span className="vo-badge vo-badge--bare" style={{
        flexShrink: 0,
        color: user.role === 'admin' ? 'var(--vo-accent)' : 'var(--vo-status-prog)',
        background: user.role === 'admin' ? 'var(--vo-accent-tint)' : 'var(--vo-status-prog-bg)',
      }}>
        {user.role}
      </span>
      {!isSelf && (
        <button onClick={() => onDelete(user.id, user.name)}
          className="vo-btn vo-btn--ghost"
          style={{ width: '32px', height: '32px', padding: 0, color: 'var(--vo-text-muted)', flexShrink: 0 }}
          title="Delete user">
          <svg className="vo-i vo-i-sm"><use href="#vo-x" /></svg>
        </button>
      )}
    </div>
  );
}
