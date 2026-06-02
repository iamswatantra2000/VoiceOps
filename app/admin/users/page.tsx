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
    name: '',
    employee_id: '',
    password: '',
    role: 'operator',
    department: 'Assembly Line A',
  });

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/'); return; }
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
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <header className="px-6 py-4 flex items-center gap-4 shadow-sm" style={{ backgroundColor: '#003057' }}>
        <Link href="/admin" className="text-blue-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-white font-bold">User Management</h1>
          <p className="text-blue-300 text-xs">{users.length} accounts total</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="text-sm font-medium px-4 py-2 rounded-xl transition"
          style={{ backgroundColor: '#E07B39', color: 'white' }}
        >
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Create User Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 fade-in-up">
            <h2 className="font-bold text-gray-700 mb-5">Create New User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Erik Johansson"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={form.employee_id}
                    onChange={e => setForm(f => ({ ...f, employee_id: e.target.value.toUpperCase() }))}
                    placeholder="e.g. OP003"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-mono tracking-widest uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Set a temporary password"
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold transition disabled:opacity-60"
                style={{ backgroundColor: '#003057' }}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm fade-in-up">
            {success}
          </div>
        )}

        {/* Operators */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Operators ({operators.length})</h2>
          </div>
          {operators.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">No operators yet.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {operators.map(u => (
                <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Admins */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Admins ({admins.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {admins.map(u => (
              <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} onDelete={handleDelete} />
            ))}
          </div>
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
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm"
        style={{ backgroundColor: user.role === 'admin' ? '#E07B39' : '#003057' }}>
        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800">{user.name}</p>
          {isSelf && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-mono font-medium text-gray-600">{user.employee_id}</span>
          {user.department && <> · {user.department}</>}
          <> · Joined {new Date(user.created_at).toLocaleDateString()}</>
        </p>
      </div>
      <span className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
        style={{
          backgroundColor: user.role === 'admin' ? '#fff3eb' : '#f0f4ff',
          color: user.role === 'admin' ? '#E07B39' : '#003057',
        }}>
        {user.role}
      </span>
      {!isSelf && (
        <button
          onClick={() => onDelete(user.id, user.name)}
          className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1"
          title="Delete user"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  );
}
