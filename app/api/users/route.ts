import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import { getSql } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const sql = getSql();
  const users = await sql`SELECT id, name, employee_id, role, department, created_at FROM users ORDER BY created_at DESC`;
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

  const sql = getSql();
  const existing = await sql`SELECT id FROM users WHERE employee_id = ${employee_id.trim().toUpperCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 });
  }

  const hash = bcrypt.hashSync(password, 10);
  const rows = await sql`
    INSERT INTO users (name, employee_id, password_hash, role, department)
    VALUES (${name.trim()}, ${employee_id.trim().toUpperCase()}, ${hash}, ${role}, ${department?.trim() || ''})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id, success: true });
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

  const sql = getSql();
  await sql`DELETE FROM users WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
