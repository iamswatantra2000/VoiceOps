import { Resend } from 'resend';
import { IncidentAnalysis } from './ai';

// Lazy — only instantiated when actually sending, not at module load / build time
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

interface AlertPayload {
  incidentId: number | bigint;
  transcript: string;
  analysis: IncidentAnalysis;
  operatorName: string;
  department: string;
  shift?: string;
  machine?: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#7c3aed',
  high: '#ef4444',
};

const SEVERITY_EMOJI: Record<string, string> = {
  critical: '🚨',
  high: '⚠️',
};

export async function sendIncidentAlert(payload: AlertPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_FROM_EMAIL || 'VoiceOps <onboarding@resend.dev>';
  const toEmails = process.env.ALERT_TO_EMAILS;

  // Silently skip if not configured — app still works without email
  if (!apiKey || !toEmails) {
    console.log(`[VoiceOps] Alert skipped — RESEND_API_KEY or ALERT_TO_EMAILS not set`);
    return;
  }

  const { incidentId, transcript, analysis, operatorName, department, shift, machine } = payload;
  const sev = analysis.severity;
  const color = SEVERITY_COLOR[sev] || '#f59e0b';
  const emoji = SEVERITY_EMOJI[sev] || '⚠️';
  const recipients = toEmails.split(',').map(e => e.trim()).filter(Boolean);

  const subject = `${emoji} [${sev.toUpperCase()}] ${analysis.summary} — ${department}`;

  const actionsHtml = analysis.immediateActions
    .map((a, i) => `
      <tr>
        <td style="padding:6px 0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:24px;height:24px;border-radius:50%;background:${color};text-align:center;vertical-align:middle;">
              <span style="color:white;font-size:11px;font-weight:bold;">${i + 1}</span>
            </td>
            <td style="padding-left:10px;font-size:14px;color:#374151;">${a}</td>
          </tr></table>
        </td>
      </tr>`)
    .join('');

  const safetyHtml = analysis.safetyWarnings.length > 0 ? `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-weight:bold;color:#dc2626;font-size:13px;">⚠️ SAFETY WARNINGS</p>
      ${analysis.safetyWarnings.map(w => `<p style="margin:4px 0;font-size:13px;color:#dc2626;">${w}</p>`).join('')}
    </div>` : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#003057;border-radius:16px 16px 0 0;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td>
                <span style="color:white;font-size:20px;font-weight:900;letter-spacing:-0.5px;">VoiceOps</span>
                <span style="color:#93c5fd;font-size:13px;margin-left:8px;">Incident Alert</span>
              </td>
              <td align="right">
                <span style="background:${color};color:white;font-size:12px;font-weight:900;padding:4px 12px;border-radius:100px;letter-spacing:1px;">
                  ${sev.toUpperCase()}
                </span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:32px;border-radius:0 0 16px 16px;">

            <!-- Summary -->
            <div style="background:${color}15;border:2px solid ${color}40;border-radius:12px;padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-weight:900;color:${color};font-size:13px;letter-spacing:0.5px;">${sev.toUpperCase()} SEVERITY</p>
              <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${analysis.summary}</p>
            </div>

            <!-- Meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="width:50%;padding:4px 0;">
                  <span style="font-size:12px;color:#9ca3af;font-weight:600;">OPERATOR</span><br>
                  <span style="font-size:14px;color:#111827;font-weight:600;">${operatorName}</span>
                </td>
                <td style="width:50%;padding:4px 0;">
                  <span style="font-size:12px;color:#9ca3af;font-weight:600;">DEPARTMENT</span><br>
                  <span style="font-size:14px;color:#111827;font-weight:600;">${department}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;">
                  <span style="font-size:12px;color:#9ca3af;font-weight:600;">SHIFT</span><br>
                  <span style="font-size:14px;color:#111827;font-weight:600;">${shift || 'Not specified'}</span>
                </td>
                <td style="padding:8px 0 4px;">
                  <span style="font-size:12px;color:#9ca3af;font-weight:600;">MACHINE / STATION</span><br>
                  <span style="font-size:14px;color:#111827;font-weight:600;">${machine || 'Not specified'}</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding:8px 0 4px;">
                  <span style="font-size:12px;color:#9ca3af;font-weight:600;">ESCALATE TO</span><br>
                  <span style="font-size:14px;color:#111827;font-weight:600;">${analysis.escalateTo}</span>
                </td>
              </tr>
            </table>

            <!-- Voice transcript -->
            <div style="background:#f9fafb;border-radius:10px;padding:14px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;font-weight:600;">VOICE TRANSCRIPT</p>
              <p style="margin:0;font-size:14px;color:#4b5563;font-style:italic;">"${transcript}"</p>
            </div>

            ${safetyHtml}

            <!-- Immediate actions -->
            <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 12px;letter-spacing:0.3px;">IMMEDIATE ACTIONS</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              ${actionsHtml}
            </table>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${process.env.NEXTAUTH_URL || 'https://voice-ops-gamma.vercel.app'}/admin/incidents"
                style="display:inline-block;background:#003057;color:white;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;">
                View Incident #${incidentId} in Admin →
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              VoiceOps · AI Incident Handler · Scania Production
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await getResend().emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
    });
    console.log(`[VoiceOps] Alert sent for incident #${incidentId} (${sev})`);
  } catch (err) {
    // Log but don't crash — the incident is already saved
    console.error(`[VoiceOps] Alert send failed:`, err);
  }
}
