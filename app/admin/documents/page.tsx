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
      if (!d.user || d.user.role !== 'admin') { router.push('/'); return; }
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
    <div className="min-h-screen" style={{ background: '#F4F6F9' }}>
      <header className="px-6 py-4 flex items-center gap-4 shadow-sm" style={{ backgroundColor: '#003057' }}>
        <Link href="/admin" className="text-blue-300 hover:text-white transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-white font-bold">Knowledge Base</h1>
          <p className="text-blue-300 text-xs">Upload documents to train the AI</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-700 mb-4">Upload Document</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p className="text-gray-600 font-medium">Drag & drop or click to select</p>
            <p className="text-gray-400 text-sm mt-1">PDF, TXT files supported</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
            />
          </div>

          {uploading && (
            <div className="mt-4 flex items-center gap-3 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading and extracting text...</span>
            </div>
          )}
          {success && <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">{success}</div>}
          {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700">Uploaded Documents ({documents.length})</h2>
          </div>
          {documents.length === 0 ? (
            <p className="text-gray-400 text-sm p-6">No documents yet. Upload manuals, SOPs, or troubleshooting guides above.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {documents.map(doc => (
                <div key={doc.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#003057' + '15' }}>
                    <svg className="w-5 h-5" style={{ color: '#003057' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.original_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.category} · {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => deleteDoc(doc.id, doc.original_name)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
