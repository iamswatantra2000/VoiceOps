'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
  id: number;
  original_name: string;
  category: string;
  created_at: string;
}

const CATEGORIES = ['General', 'Safety', 'Maintenance', 'Assembly', 'Quality', 'Emergency Procedures', 'Machine Manual'];

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('General');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/login'); return; }
    });
    loadDocs();
  }, [router]);

  async function loadDocs() {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const { documents } = await res.json();
      setDocuments(documents);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError('');
    setSuccess('');

    const form = new FormData();
    form.append('file', file);
    form.append('category', category);

    const res = await fetch('/api/documents', { method: 'POST', body: form });
    setUploading(false);

    if (!res.ok) {
      setError('Upload failed. Please try again.');
      return;
    }

    const data = await res.json();
    setSuccess(`"${data.name}" uploaded. ${data.textLength > 0 ? `${data.textLength.toLocaleString()} characters extracted.` : 'Text extraction skipped.'}`);
    loadDocs();
    if (fileRef.current) fileRef.current.value = '';
  }

  async function deleteDoc(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch('/api/documents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadDocs();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--vo-bg)' }}>
      <header className="px-6 py-4 flex items-center gap-4"
        style={{ background: 'var(--vo-text)', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
        <Link href="/admin" style={{ color: 'rgba(245,244,242,0.65)', display: 'flex', alignItems: 'center' }}>
          <svg className="vo-i"><use href="#vo-arrow-left" /></svg>
        </Link>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--vo-bg)', lineHeight: 1 }}>Knowledge Base</h1>
          <p className="vo-caption" style={{ color: 'rgba(245,244,242,0.55)', marginTop: '2px' }}>
            Upload documents to train the AI
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Upload Card */}
        <div className="vo-card vo-card--pad">
          <h2 className="vo-h3" style={{ marginBottom: '16px' }}>Upload Document</h2>

          <div className="vo-field" style={{ marginBottom: '16px' }}>
            <label className="vo-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="vo-input" style={{ cursor: 'pointer' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div
            style={{
              border: `2px dashed ${dragOver ? 'var(--vo-accent)' : 'var(--vo-border-strong)'}`,
              borderRadius: 'var(--vo-r-lg)',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color .14s, background .14s',
              background: dragOver ? 'var(--vo-accent-tint)' : 'var(--vo-surface-2)',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <svg className="vo-i vo-i-lg" style={{ color: dragOver ? 'var(--vo-accent)' : 'var(--vo-text-muted)', display: 'block', margin: '0 auto 12px' }}>
              <use href="#vo-upload" />
            </svg>
            <p className="vo-body" style={{ fontWeight: 600, marginBottom: '4px' }}>Drag & drop or click to select</p>
            <p className="vo-caption">PDF, TXT files supported</p>
            <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
          </div>

          {uploading && (
            <div className="flex items-center gap-3" style={{ marginTop: '16px', color: 'var(--vo-accent)' }}>
              <div className="spin-slow" style={{
                width: '16px', height: '16px', flexShrink: 0, borderRadius: '50%',
                border: '2px solid var(--vo-accent-tint-2)', borderTopColor: 'var(--vo-accent)',
              }} />
              <span className="vo-body-sm">Uploading and extracting text...</span>
            </div>
          )}

          {success && (
            <div style={{
              marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--vo-r)',
              background: 'var(--vo-sev-low-bg)', border: '1px solid var(--vo-sev-low-line)',
            }}>
              <div className="flex items-center gap-2">
                <svg className="vo-i vo-i-sm" style={{ color: 'var(--vo-sev-low)', flexShrink: 0 }}><use href="#vo-check-circle" /></svg>
                <p className="vo-body-sm" style={{ color: 'var(--vo-sev-low)' }}>{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="vo-banner" style={{ marginTop: '16px' }}>
              <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
              <span className="vo-body-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="vo-card">
          <div className="vo-card__head">
            <p style={{ fontWeight: 700, fontSize: '15px' }}>
              Uploaded Documents{' '}
              <span className="vo-mono" style={{ fontSize: '13px', color: 'var(--vo-text-muted)' }}>({documents.length})</span>
            </p>
          </div>
          {documents.length === 0 ? (
            <div style={{ padding: '24px' }}>
              <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>
                No documents yet. Upload manuals, SOPs, or troubleshooting guides above.
              </p>
            </div>
          ) : documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-4"
              style={{ padding: '14px 18px', borderTop: '1px solid var(--vo-border)' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: 'var(--vo-r)',
                background: 'var(--vo-accent-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg className="vo-i" style={{ color: 'var(--vo-accent)' }}><use href="#vo-file-text" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="vo-body-sm" style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.original_name}
                </p>
                <p className="vo-caption" style={{ marginTop: '2px' }}>
                  {doc.category} · {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => deleteDoc(doc.id, doc.original_name)}
                className="vo-btn vo-btn--ghost"
                style={{ width: '32px', height: '32px', padding: 0, color: 'var(--vo-sev-critical)', flexShrink: 0 }}
                title="Delete document">
                <svg className="vo-i vo-i-sm"><use href="#vo-x" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
