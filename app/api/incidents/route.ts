import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { analyzeIncident } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { transcript } = await req.json();
  if (!transcript?.trim()) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  const analysis = await analyzeIncident(transcript, user.department);

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO incidents (user_id, voice_transcript, ai_analysis, severity, status, department)
    VALUES (?, ?, ?, ?, 'open', ?)
  `).run(user.id, transcript, JSON.stringify(analysis), analysis.severity, user.department);

  return NextResponse.json({
    id: result.lastInsertRowid,
    transcript,
    analysis,
  });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let incidents;
  if (user.role === 'admin') {
    incidents = db.prepare(`
      SELECT i.*, u.name as operator_name, u.employee_id, u.department
      FROM incidents i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `).all(limit);
  } else {
    incidents = db.prepare(`
      SELECT * FROM incidents WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
    `).all(user.id, limit);
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

  const db = getDb();
  const incident = db.prepare('SELECT id, status FROM incidents WHERE id = ?').get(id) as
    { id: number; status: string } | undefined;

  if (!incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  // Enforce forward-only progression: open → in_progress → resolved
  const order = ['open', 'in_progress', 'resolved'];
  if (order.indexOf(status) <= order.indexOf(incident.status)) {
    return NextResponse.json({ error: 'Cannot move status backwards' }, { status: 400 });
  }

  if (status === 'resolved') {
    db.prepare(`
      UPDATE incidents
      SET status = ?, resolution_note = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, resolution_note || null, user.id, id);
  } else {
    db.prepare(`
      UPDATE incidents SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(status, id);
  }

  const updated = db.prepare(`
    SELECT i.*, u.name as operator_name, u.employee_id,
           r.name as resolver_name
    FROM incidents i
    JOIN users u ON i.user_id = u.id
    LEFT JOIN users r ON i.resolved_by = r.id
    WHERE i.id = ?
  `).get(id);

  return NextResponse.json({ incident: updated });
}
