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
  low:      { label: 'LOW',      badgeClass: 'vo-badge--low',      color: 'var(--vo-sev-low)',      bg: 'var(--vo-sev-low-bg)',      border: 'var(--vo-sev-low-line)' },
  medium:   { label: 'MEDIUM',   badgeClass: 'vo-badge--medium',   color: 'var(--vo-sev-medium)',   bg: 'var(--vo-sev-medium-bg)',   border: 'var(--vo-sev-medium-line)' },
  high:     { label: 'HIGH',     badgeClass: 'vo-badge--high',     color: 'var(--vo-sev-high)',     bg: 'var(--vo-sev-high-bg)',     border: 'var(--vo-sev-high-line)' },
  critical: { label: 'CRITICAL', badgeClass: 'vo-badge--critical', color: 'var(--vo-sev-critical)', bg: 'var(--vo-sev-critical-bg)', border: 'var(--vo-sev-critical-line)' },
};

const STATUS_BADGE: Record<string, string> = {
  open: 'vo-badge--open', in_progress: 'vo-badge--prog', resolved: 'vo-badge--done',
};
const STATUS_LABEL: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', resolved: 'Resolved',
};

type Phase = 'idle' | 'recording' | 'processing' | 'result';
type InputMode = 'voice' | 'text';
type Shift = 'Morning' | 'Afternoon' | 'Night';

function getAutoShift(): Shift {
  const h = new Date().getHours();
  if (h >= 6 && h < 14) return 'Morning';
  if (h >= 14 && h < 22) return 'Afternoon';
  return 'Night';
}

const SHIFT_CONFIG: Record<Shift, { iconId: string; color: string; bg: string }> = {
  Morning:   { iconId: 'sunrise', color: 'var(--vo-shift-morning)',   bg: 'var(--vo-shift-morning-bg)' },
  Afternoon: { iconId: 'sun',     color: 'var(--vo-shift-afternoon)', bg: 'var(--vo-shift-afternoon-bg)' },
  Night:     { iconId: 'moon',    color: 'var(--vo-shift-night)',     bg: 'var(--vo-shift-night-bg)' },
};

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
  const [shift, setShift] = useState<Shift>(getAutoShift());
  const [machine, setMachine] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
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
    if (recognitionRef.current) recognitionRef.current.stop();
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
      body: JSON.stringify({ transcript: text, shift, machine: machine.trim() || undefined }),
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
    setMachine('');
    setShift(getAutoShift());
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
    router.push('/login');
  }

  const severityConfig = result ? SEVERITY_CONFIG[result.analysis.severity] : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--vo-bg)' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3"
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
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--vo-bg)', lineHeight: 1 }}>VoiceOps</div>
            {user && (
              <div className="vo-caption" style={{ color: 'rgba(245,244,242,0.55)', marginTop: '2px' }}>
                {user.name} · {user.department}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="vo-btn vo-btn--ghost"
            style={{ height: '32px', padding: '0 12px' }}>
            <svg className="vo-i vo-i-sm"><use href="#vo-history" /></svg>
            History
          </button>
          <button onClick={logout} className="vo-btn vo-btn--ghost"
            style={{ height: '32px', padding: '0 12px' }}>
            <svg className="vo-i vo-i-sm"><use href="#vo-log-out" /></svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* History Drawer */}
      {showHistory && (
        <div className="fade-in-up" style={{
          background: 'var(--vo-surface)', borderBottom: '1px solid var(--vo-border)', padding: '16px',
        }}>
          <p className="vo-eyebrow" style={{ marginBottom: '12px' }}>Recent Incidents</p>
          {history.length === 0 ? (
            <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)' }}>No incidents reported yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map(h => (
                <div key={h.id} className="vo-row" style={{ cursor: 'default' }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                      <span className={`vo-badge vo-badge--${h.severity}`}>{h.severity.toUpperCase()}</span>
                      <span className={`vo-badge vo-badge--bare ${STATUS_BADGE[h.status] || ''}`}>
                        {STATUS_LABEL[h.status] || h.status}
                      </span>
                    </div>
                    <p className="vo-body-sm">{h.summary}</p>
                    {h.resolution_note && (
                      <p className="vo-caption" style={{ color: 'var(--vo-status-done)', marginTop: '4px' }}>
                        Resolution: {h.resolution_note}
                      </p>
                    )}
                    <p className="vo-caption" style={{ marginTop: '4px' }}>
                      {new Date(h.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6"
        style={{ maxWidth: '520px', margin: '0 auto', width: '100%' }}>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div className="w-full fade-in-up">
            <h1 className="vo-h2" style={{ textAlign: 'center', marginBottom: '6px' }}>Report an Incident</h1>
            <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)', textAlign: 'center', marginBottom: '24px' }}>
              Describe what happened, the machine or area, and any safety concerns.
            </p>

            {/* Shift & Machine */}
            <div className="vo-card vo-card--pad" style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <p className="vo-eyebrow" style={{ marginBottom: '10px' }}>Shift</p>
                <div className="flex gap-2">
                  {(['Morning', 'Afternoon', 'Night'] as Shift[]).map(s => {
                    const cfg = SHIFT_CONFIG[s];
                    const active = shift === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setShift(s)}
                        className="vo-btn flex-1"
                        style={{
                          height: '44px',
                          background: active ? cfg.bg : 'var(--vo-surface)',
                          color: active ? cfg.color : 'var(--vo-text-muted)',
                          borderColor: active ? cfg.color : 'var(--vo-border-strong)',
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        <svg className="vo-i vo-i-sm">
                          <use href={`#vo-${cfg.iconId}`} />
                        </svg>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="vo-field">
                <label className="vo-label">
                  Machine / Station{' '}
                  <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--vo-text-muted)' }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={machine}
                  onChange={e => setMachine(e.target.value)}
                  placeholder="e.g. M-14, Conveyor Belt 3, Welding Bay A"
                  className="vo-input"
                />
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center" style={{ marginBottom: '32px' }}>
              <div className="vo-seg">
                <button
                  className="vo-seg__item"
                  aria-selected={inputMode === 'voice' ? 'true' : 'false'}
                  onClick={() => switchMode('voice')}
                >
                  <svg className="vo-i vo-i-sm"><use href="#vo-mic" /></svg>
                  Voice
                </button>
                <button
                  className="vo-seg__item"
                  aria-selected={inputMode === 'text' ? 'true' : 'false'}
                  onClick={() => switchMode('text')}
                >
                  <svg className="vo-i vo-i-sm"><use href="#vo-pencil" /></svg>
                  Type
                </button>
              </div>
            </div>

            {/* Voice mode */}
            {inputMode === 'voice' && (
              <div style={{ textAlign: 'center' }}>
                <button onClick={startRecording} className="vo-mic" style={{ margin: '0 auto' }}>
                  <svg className="vo-i vo-i-lg"><use href="#vo-mic" /></svg>
                  <span>TAP TO SPEAK</span>
                </button>
                <p className="vo-caption" style={{ marginTop: '24px' }}>
                  Works best in Chrome or Edge. Microphone access required.
                </p>
              </div>
            )}

            {/* Text mode */}
            {inputMode === 'text' && (
              <form onSubmit={handleTextSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="vo-field">
                  <label className="vo-label">Incident Description</label>
                  <textarea
                    value={typedText}
                    onChange={e => setTypedText(e.target.value)}
                    placeholder="Describe the incident... e.g. 'Machine 4 on assembly line A is making a loud grinding noise and has stopped moving. There is a burning smell coming from the motor area.'"
                    className="vo-textarea"
                    style={{ minHeight: '140px', fontSize: '16px' }}
                    autoFocus
                  />
                </div>
                <p className="vo-caption" style={{
                  color: typedText.trim().length < 10 ? 'var(--vo-text-muted)' : 'var(--vo-sev-low)',
                  padding: '0 2px',
                }}>
                  {typedText.trim().length < 10
                    ? `${10 - typedText.trim().length} more characters needed`
                    : `${typedText.trim().length} characters — ready to submit`}
                </p>
                <button
                  type="submit"
                  disabled={typedText.trim().length < 10}
                  className="vo-btn vo-btn--primary vo-btn--block vo-btn--lg"
                >
                  <svg className="vo-i"><use href="#vo-zap" /></svg>
                  Submit Incident
                </button>
              </form>
            )}

            {error && (
              <div className="vo-banner" style={{ marginTop: '20px' }}>
                <svg className="vo-i vo-i-sm" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
                <span className="vo-body-sm">{error}</span>
              </div>
            )}
          </div>
        )}

        {/* ── RECORDING ── */}
        {phase === 'recording' && (
          <div className="w-full fade-in-up" style={{ textAlign: 'center' }}>
            <p className="vo-body-lg" style={{ color: 'var(--vo-text-2)', marginBottom: '24px' }}>
              Listening... speak clearly.
            </p>

            <button onClick={stopRecording} className="vo-mic vo-mic--rec" style={{ margin: '0 auto' }}>
              <svg className="vo-i vo-i-lg"><use href="#vo-stop" /></svg>
              <span>TAP TO STOP</span>
            </button>

            <div className="vo-mono" style={{ marginTop: '24px', color: 'var(--vo-text-muted)', fontSize: '20px' }}>
              {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>

            {transcript && (
              <div className="vo-card vo-card--pad" style={{ marginTop: '24px', textAlign: 'left' }}>
                <p className="vo-eyebrow" style={{ marginBottom: '8px' }}>Live Transcript</p>
                <p className="vo-body-sm">{transcript}</p>
              </div>
            )}
          </div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <div className="fade-in-up" style={{ textAlign: 'center' }}>
            <div className="spin-slow" style={{
              width: '52px', height: '52px', margin: '0 auto 24px',
              borderRadius: '50%',
              border: '3px solid var(--vo-border)',
              borderTopColor: 'var(--vo-accent)',
            }} />
            <h2 className="vo-h3">Analyzing Incident...</h2>
            <p className="vo-body-sm" style={{ color: 'var(--vo-text-muted)', marginTop: '8px' }}>
              AI is checking knowledge base and generating response.
            </p>
            {transcript && (
              <div className="vo-card vo-card--pad" style={{ marginTop: '24px', textAlign: 'left', maxWidth: '380px', margin: '24px auto 0' }}>
                <div className="flex gap-3 items-center" style={{ marginBottom: '10px' }}>
                  <span className="vo-body-sm" style={{ color: 'var(--vo-text-muted)', fontWeight: 600 }}>Shift:</span>
                  <span className="vo-body-sm flex items-center gap-1">
                    <svg className="vo-i vo-i-sm"><use href={`#vo-${SHIFT_CONFIG[shift].iconId}`} /></svg>
                    {shift}
                  </span>
                  {machine && (
                    <>
                      <span className="vo-body-sm" style={{ color: 'var(--vo-text-muted)', fontWeight: 600 }}>Machine:</span>
                      <span className="vo-body-sm">{machine}</span>
                    </>
                  )}
                </div>
                <p className="vo-eyebrow" style={{ marginBottom: '6px' }}>Your Report</p>
                <p className="vo-body-sm" style={{ fontStyle: 'italic', color: 'var(--vo-text-2)' }}>&quot;{transcript}&quot;</p>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === 'result' && result && severityConfig && (
          <div className="w-full fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Severity Banner */}
            <div className="vo-card vo-card--pad" style={{ borderLeftWidth: '4px', borderLeftColor: severityConfig.color }}>
              <div className="flex items-center gap-4">
                <span className={`vo-badge vo-badge--bare ${severityConfig.badgeClass}`}
                  style={{ fontSize: '13px', padding: '6px 12px' }}>
                  {severityConfig.label}
                </span>
                <div style={{ flex: 1 }}>
                  <p className="vo-body" style={{ fontWeight: 600 }}>{result.analysis.summary}</p>
                  <p className="vo-caption" style={{ color: severityConfig.color, marginTop: '4px' }}>
                    Escalate to: <strong>{result.analysis.escalateTo}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Warnings */}
            {result.analysis.safetyWarnings.length > 0 && (
              <div className="vo-banner">
                <svg className="vo-i" style={{ flexShrink: 0 }}><use href="#vo-alert-triangle" /></svg>
                <div>
                  <p className="vo-banner__title">Safety Warning</p>
                  {result.analysis.safetyWarnings.map((w, i) => (
                    <p key={i} className="vo-body-sm" style={{ marginTop: '4px' }}>{w}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Immediate Actions */}
            <div className="vo-card">
              <div className="vo-card__head">
                <p className="vo-eyebrow">Immediate Actions</p>
              </div>
              <div style={{ padding: '16px 18px' }}>
                <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.analysis.immediateActions.map((action, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="vo-num" style={{ flexShrink: 0 }}>{i + 1}</span>
                      <span className="vo-body-sm" style={{ paddingTop: '4px' }}>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Possible Causes */}
            <div className="vo-card vo-card--pad">
              <p className="vo-eyebrow" style={{ marginBottom: '12px' }}>Possible Causes</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.analysis.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <svg className="vo-i vo-i-sm" style={{ color: 'var(--vo-accent)', flexShrink: 0, marginTop: '1px' }}>
                      <use href="#vo-chevron-right" />
                    </svg>
                    <span className="vo-body-sm">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Transcript */}
            <div className="vo-card vo-card--pad" style={{ background: 'var(--vo-surface-2)' }}>
              <div className="flex flex-wrap gap-2" style={{ marginBottom: '10px' }}>
                <span className="vo-badge vo-badge--bare" style={{
                  color: SHIFT_CONFIG[shift].color,
                  background: SHIFT_CONFIG[shift].bg,
                }}>
                  <svg className="vo-i vo-i-sm"><use href={`#vo-${SHIFT_CONFIG[shift].iconId}`} /></svg>
                  {shift} Shift
                </span>
                {machine && (
                  <span className="vo-badge vo-badge--bare" style={{ color: 'var(--vo-text-2)', background: 'var(--vo-surface-3)' }}>
                    <svg className="vo-i vo-i-sm"><use href="#vo-wrench" /></svg>
                    {machine}
                  </span>
                )}
              </div>
              <p className="vo-eyebrow" style={{ marginBottom: '6px' }}>Your Report (ID: #{result.id})</p>
              <p className="vo-body-sm" style={{ fontStyle: 'italic', color: 'var(--vo-text-2)' }}>
                &quot;{result.transcript}&quot;
              </p>
            </div>

            <button onClick={reset} className="vo-btn vo-btn--primary vo-btn--block vo-btn--lg">
              <svg className="vo-i"><use href="#vo-plus" /></svg>
              Report Another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
