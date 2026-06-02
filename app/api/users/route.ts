import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = getDb();
  const users = db.prepare(
    'SELECT id, name, employee_id, role, department, created_at FROM users ORDER BY created_at DESC'
  ).all();

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { name, employee_id, password, role, department } = await req.json();

  if (!name || !employee_id || !password || !role) {
    return NextResponse.json({ error: 'Name, Employee ID, password, and role are required' }, { status: 400 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(employee_id.trim().toUpperCase());
  if (existing) {
    return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, employee_id, password_hash, role, department) VALUES (?, ?, ?, ?, ?)'
  ).run(name.trim(), employee_id.trim().toUpperCase(), hash, role, department?.trim() || '');

  return NextResponse.json({ id: result.lastInsertRowid, success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await req.json();

  if (id === user.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
