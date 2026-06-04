import { NextResponse } from 'next/server';
import { initSchema, seedUsers } from '@/lib/db';

// One-time setup — visit /api/init once after first deploy to create tables and seed users
export async function GET() {
  try {
    await initSchema();
    await seedUsers();
    return NextResponse.json({ success: true, message: 'Database initialised and seeded.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
