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
