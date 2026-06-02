'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  employee_id: string;
  role: string;
  department: string;
}

interface IncidentAnalysis {
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  immediateActions: string[];
  possibleCauses: string[];
  escalateTo: string;
  relatedDocuments: string[];
  safetyWarnings: string[];
}

interface IncidentResult {
  id: number;
  transcript: string;
  analysis: IncidentAnalysis;
}

const SEVERITY_CONFIG = {
  low: { label: 'LOW', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  medium: { label: 'MEDIUM', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  high: { label: 'HIGH', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  critical: { label: 'CRITICAL', color: '#7c3aed', bg: '#fdf4ff', border: '#e9d5ff' },
};

type Phase = 'idle' | 'recording' | 'processing' | 'result';
type InputMode = 'voice' | 'text';

export default function OperatorPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<IncidentResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ id: number; summary: string; severity: string; status: string; resolution_note?: string; created_at: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [typedText, setTypedText] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/'); return; }
      setUser(d.user);
    });
    loadHistory();
  }, [router]);

  async function loadHistory() {
    const res = await fetch('/api/incidents?limit=5');
    if (res.ok) {
      const data = await res.json();
      setHistory(data.incidents.map((i: { id: number; ai_analysis: string; severity: string; status: string; resolution_note?: string; created_at: string }) => ({
        id: i.id,
        summary: (() => { try { return JSON.parse(i.ai_analysis).summary; } catch { return 'Incident recorded'; } })(),
        severity: i.severity,
        status: i.status,
        resolution_note: i.resolution_note,
        created_at: i.created_at,
      })));
    }
  }

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  function startRecording() {
    setError('');
    setTranscript('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('Voice recording not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; [k: number]: { transcript: string } }[] }) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t + ' ';
        else interim = t;
      }
      setTranscript((finalTranscript + interim).trim());
    };

    recognition.onerror = (e: { error: string }) => {
      if (e.error !== 'aborted') setError('Microphone error: ' + e.error);
      setPhase('idle');
      if (timerRef.current) clearInterval(timerRef.current);
    };

    recognition.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (finalTranscript.trim()) {
        submitIncident(finalTranscript.trim());
      } else {
        setPhase('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setPhase('recording');
    setRecordingTime(0);

    timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
  }

  async function submitIncident(text: string) {
    setPhase('processing');
    setTranscript(text);

    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: text }),
    });

    if (!res.ok) {
      setError('Failed to process incident. Please try again or contact your supervisor.');
      setPhase('idle');
      return;
    }

    const data = await res.json();
    setResult(data);
    setPhase('result');
    loadHistory();
  }

  function reset() {
    setPhase('idle');
    setTranscript('');
    setResult(null);
    setError('');
    setTypedText('');
  }

  function switchMode(mode: InputMode) {
    setInputMode(mode);
    setError('');
    setTypedText('');
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = typedText.trim();
    if (text.length < 10) return;
    submitIncident(text);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const severityConfig = result ? SEVERITY_CONFIG[result.analysis.severity] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4F6F9' }}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: '#003057' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E07B39' }}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" fillOpacity="0.9" />
              <path d="M20 14L26 18V26L20 30L14 26V18L20 14Z" fill="#E07B39" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">VoiceOps</div>
            {user && <div className="text-blue-300 text-xs mt-0.5">{user.name} · {user.department}</div>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="text-blue-200 text-xs px-3 py-1.5 rounded-lg border border-blue-700 hover:bg-blue-900 transition">
            History
          </button>
          <button onClick={logout} className="text-blue-200 text-xs px-3 py-1.5 rounded-lg border border-blue-700 hover:bg-blue-900 transition">
            Sign Out
          </button>
        </div>
      </header>

      {/* History Drawer */}
      {showHistory && (
        <div className="bg-white border-b px-4 py-3 fade-in-up">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Recent Incidents</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No incidents reported yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map(h => {
                const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
                  open:        { label: 'Open',        color: '#f59e0b', bg: '#fffbeb' },
                  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#eff6ff' },
                  resolved:    { label: 'Resolved',    color: '#22c55e', bg: '#f0fdf4' },
                };
                const stc = STATUS_STYLE[h.status] || { label: h.status, color: '#888', bg: '#f3f4f6' };
                return (
                  <div key={h.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                        backgroundColor: SEVERITY_CONFIG[h.severity as keyof typeof SEVERITY_CONFIG]?.bg || '#f3f4f6',
                        color: SEVERITY_CONFIG[h.severity as keyof typeof SEVERITY_CONFIG]?.color || '#555',
                      }}>
                        {h.severity.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: stc.bg, color: stc.color }}>
                        {stc.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{h.summary}</p>
                    {h.resolution_note && (
                      <p className="text-xs text-green-700 mt-1 bg-green-50 rounded-lg px-2 py-1">
                        ✓ {h.resolution_note}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{new Date(h.created_at).toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">

        {/* IDLE STATE */}
        {phase === 'idle' && (
          <div className="w-full fade-in-up">
            <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">Report an Incident</h1>
            <p className="text-gray-500 mb-6 text-center text-sm">Describe what happened, the machine or area, and any safety concerns.</p>

            {/* Mode toggle pills */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-200 rounded-full p-1 gap-1">
                <button
                  onClick={() => switchMode('voice')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={inputMode === 'voice'
                    ? { backgroundColor: '#003057', color: 'white' }
                    : { backgroundColor: 'transparent', color: '#555' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                  Voice
                </button>
                <button
                  onClick={() => switchMode('text')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={inputMode === 'text'
                    ? { backgroundColor: '#003057', color: 'white' }
                    : { backgroundColor: 'transparent', color: '#555' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                  </svg>
                  Type
                </button>
              </div>
            </div>

            {/* VOICE MODE */}
            {inputMode === 'voice' && (
              <div className="text-center">
                <button
                  onClick={startRecording}
                  className="w-52 h-52 rounded-full text-white font-bold text-xl shadow-2xl transition-all active:scale-95 hover:scale-105 flex flex-col items-center justify-center gap-3 mx-auto"
                  style={{ backgroundColor: '#003057' }}
                >
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                  <span>TAP TO SPEAK</span>
                </button>
                <p className="mt-6 text-xs text-gray-400">Works best in Chrome or Edge. Microphone access required.</p>
              </div>
            )}

            {/* TEXT MODE */}
            {inputMode === 'text' && (
              <form onSubmit={handleTextSubmit} className="space-y-4">
                <textarea
                  value={typedText}
                  onChange={e => setTypedText(e.target.value)}
                  placeholder="Describe the incident here... e.g. 'Machine 4 on assembly line A is making a loud grinding noise and has stopped moving. There is a burning smell coming from the motor area.'"
                  rows={6}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base leading-relaxed resize-none shadow-sm"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                <div className="flex items-center justify-between px-1">
                  <span className={`text-xs font-medium ${typedText.trim().length < 10 ? 'text-gray-400' : 'text-green-600'}`}>
                    {typedText.trim().length < 10
                      ? `${10 - typedText.trim().length} more characters needed`
                      : `${typedText.trim().length} characters — ready to submit`}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={typedText.trim().length < 10}
                  className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  style={{ backgroundColor: '#003057' }}
                >
                  Submit Incident
                </button>
              </form>
            )}

            {error && (
              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* RECORDING STATE */}
        {phase === 'recording' && (
          <div className="text-center fade-in-up w-full">
            <p className="text-gray-500 mb-6 text-lg">Listening... speak clearly.</p>

            <button
              onClick={stopRecording}
              className="recording-btn w-52 h-52 rounded-full text-white font-bold text-xl shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-3 mx-auto"
              style={{ backgroundColor: '#dc2626' }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              <span>TAP TO STOP</span>
            </button>

            <div className="mt-6 text-gray-400 text-sm font-mono">
              {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>

            {transcript && (
              <div className="mt-6 bg-white rounded-2xl p-4 border-2 border-blue-100 text-left shadow-sm">
                <p className="text-xs text-gray-400 mb-1 font-medium">LIVE TRANSCRIPT</p>
                <p className="text-gray-700 text-sm leading-relaxed">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* PROCESSING STATE */}
        {phase === 'processing' && (
          <div className="text-center fade-in-up">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 spin-slow" style={{ borderTop: '4px solid #003057', borderRight: '4px solid transparent', borderBottom: '4px solid #003057', borderLeft: '4px solid transparent', borderRadius: '50%' }}>
            </div>
            <h2 className="text-xl font-bold text-gray-700">Analyzing Incident...</h2>
            <p className="text-gray-400 mt-2 text-sm">AI is checking knowledge base and generating response.</p>
            {transcript && (
              <div className="mt-6 bg-white rounded-2xl p-4 border border-gray-200 text-left max-w-sm mx-auto">
                <p className="text-xs text-gray-400 mb-1 font-medium">YOUR REPORT</p>
                <p className="text-gray-600 text-sm italic">&quot;{transcript}&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* RESULT STATE */}
        {phase === 'result' && result && severityConfig && (
          <div className="w-full fade-in-up space-y-4">
            {/* Severity Banner */}
            <div className="rounded-2xl p-4 border-2 flex items-center gap-4" style={{ backgroundColor: severityConfig.bg, borderColor: severityConfig.border }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: severityConfig.color }}>
                <span className="text-white font-black text-xs">{severityConfig.label}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm leading-snug">{result.analysis.summary}</p>
                <p className="text-xs mt-1" style={{ color: severityConfig.color }}>
                  Escalate to: <strong>{result.analysis.escalateTo}</strong>
                </p>
              </div>
            </div>

            {/* Safety Warnings */}
            {result.analysis.safetyWarnings.length > 0 && (
              <div className="rounded-2xl p-4 bg-red-50 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-red-700 text-sm">SAFETY WARNING</span>
                </div>
                {result.analysis.safetyWarnings.map((w, i) => (
                  <p key={i} className="text-sm text-red-700 mt-1">{w}</p>
                ))}
              </div>
            )}

            {/* Immediate Actions */}
            <div className="rounded-2xl p-4 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">!</span>
                IMMEDIATE ACTIONS
              </h3>
              <ol className="space-y-2">
                {result.analysis.immediateActions.map((action, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" style={{ backgroundColor: '#003057' }}>{i + 1}</span>
                    <span className="leading-snug pt-0.5">{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Possible Causes */}
            <div className="rounded-2xl p-4 bg-white border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-700 text-sm mb-3">POSSIBLE CAUSES</h3>
              <ul className="space-y-1.5">
                {result.analysis.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-orange-400 flex-shrink-0 mt-0.5">▸</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            {/* Transcript */}
            <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-400 font-medium mb-1">YOUR REPORT (ID: #{result.id})</p>
              <p className="text-sm text-gray-500 italic">&quot;{result.transcript}&quot;</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={reset}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
                style={{ backgroundColor: '#003057' }}
              >
                Report Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
