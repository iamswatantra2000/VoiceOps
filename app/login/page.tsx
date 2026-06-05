'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId.trim().toUpperCase(), password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    if (data.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/operator');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--vo-text)' }}>
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="text-center" style={{ marginBottom: '40px' }}>
          <div className="inline-flex items-center justify-center" style={{
            width: '72px', height: '72px', marginBottom: '16px',
            borderRadius: 'var(--vo-r-lg)', background: 'var(--vo-accent)',
          }}>
            <svg className="vo-i vo-i-lg" style={{ color: 'var(--vo-accent-fg)' }}>
              <use href="#vo-hexagon" />
            </svg>
          </div>
          <h1 className="vo-h1" style={{ color: 'var(--vo-bg)' }}>VoiceOps</h1>
          <p className="vo-caption" style={{ marginTop: '4px' }}>
            Incident Handler — Scania Production
          </p>
        </div>

        {/* Login Card */}
        <div className="vo-card" style={{ padding: '28px' }}>
          <h2 className="vo-h3" style={{ marginBottom: '24px' }}>Sign In</h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="vo-field">
              <label className="vo-label">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                placeholder="e.g. OP001"
                className="vo-input vo-input--mono"
                autoCapitalize="characters"
                required
              />
            </div>

            <div className="vo-field">
              <label className="vo-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="vo-input"
                required
              />
            </div>

            {error && (
              <div className="vo-banner">
                <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}>
                  <use href="#vo-alert-triangle" />
                </svg>
                <div>
                  <p className="vo-banner__title">Login Failed</p>
                  <p className="vo-body-sm" style={{ marginTop: '3px' }}>{error}</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="vo-btn vo-btn--primary vo-btn--block vo-btn--lg">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--vo-border)' }}>
            <p className="vo-caption" style={{ textAlign: 'center' }}>
              Demo: <span className="vo-mono">OP001</span> / <span className="vo-mono">operator123</span>
            </p>
            <p className="vo-caption" style={{ textAlign: 'center', marginTop: '4px' }}>
              Admin: <span className="vo-mono">ADMIN001</span> / <span className="vo-mono">admin123</span>
            </p>
          </div>
        </div>

        <p className="vo-caption" style={{ textAlign: 'center', marginTop: '24px' }}>
          Contact your supervisor if you cannot log in.
        </p>
      </div>
    </div>
  );
}
