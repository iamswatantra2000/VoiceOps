import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken, UserPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { employee_id, password } = await req.json();

  if (!employee_id || !password) {
    return NextResponse.json({ error: 'Employee ID and password required' }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE employee_id = ?').get(employee_id) as {
    id: number; name: string; employee_id: string; password_hash: string; role: string; department: string;
  } | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const payload: UserPayload = {
    id: user.id,
    name: user.name,
    employee_id: user.employee_id,
    role: user.role as 'operator' | 'admin',
    department: user.department,
  };

  const token = signToken(payload);

  const response = NextResponse.json({ user: payload, success: true });
  response.cookies.set('voiceops_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return response;
}
