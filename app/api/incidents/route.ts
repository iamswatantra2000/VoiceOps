import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { analyzeIncident } from '@/lib/ai';
import { sendIncidentAlert } from '@/lib/alerts';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transcript, shift, machine } = await req.json();
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  const analysis = await analyzeIncident(transcript, user.department, shift, machine);
  const sql = getSql();

  const rows = await sql`
    INSERT INTO incidents (user_id, voice_transcript, ai_analysis, severity, status, department, shift, machine)
    VALUES (${user.id}, ${transcript}, ${JSON.stringify(analysis)}, ${analysis.severity}, 'open', ${user.department}, ${shift ?? null}, ${machine ?? null})
    RETURNING id
  `;

  const incidentId = rows[0].id;

  // Fire alert for high/critical — non-blocking, won't delay the response
  if (analysis.severity === 'critical' || analysis.severity === 'high') {
    sendIncidentAlert({
      incidentId,
      transcript,
      analysis,
      operatorName: user.name,
      department: user.department,
      shift,
      machine,
    }).catch(console.error);
  }

  return NextResponse.json({ id: incidentId, transcript, analysis });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const sql = getSql();

  let incidents;
  if (user.role === 'admin') {
    incidents = await sql`
      SELECT i.*, u.name as operator_name, u.employee_id as operator_employee_id, u.department as operator_department,
             r.name as resolver_name
      FROM incidents i
      JOIN users u ON i.user_id = u.id
      LEFT JOIN users r ON i.resolved_by = r.id
      ORDER BY i.created_at DESC
      LIMIT ${limit}
    `;
  } else {
    incidents = await sql`
      SELECT * FROM incidents WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT ${limit}
    `;
  }

  return NextResponse.json({ incidents });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id, status, resolution_note } = await req.json();
  const validStatuses = ['open', 'in_progress', 'resolved'];
  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Valid incident id and status required' }, { status: 400 });
  }

  const sql = getSql();
  const existing = await sql`SELECT id, status FROM incidents WHERE id = ${id}`;
  if (!existing[0]) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

  const order = ['open', 'in_progress', 'resolved'];
  if (order.indexOf(status) <= order.indexOf(existing[0].status as string)) {
    return NextResponse.json({ error: 'Cannot move status backwards' }, { status: 400 });
  }

  if (status === 'resolved') {
    await sql`
      UPDATE incidents
      SET status = ${status}, resolution_note = ${resolution_note ?? null},
          resolved_by = ${user.id}, resolved_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`UPDATE incidents SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  }

  const updated = await sql`
    SELECT i.*, u.name as operator_name, r.name as resolver_name
    FROM incidents i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN users r ON i.resolved_by = r.id
    WHERE i.id = ${id}
  `;

  return NextResponse.json({ incident: updated[0] });
}
