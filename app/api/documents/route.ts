import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const docs = await sql`SELECT id, original_name, category, created_at FROM documents ORDER BY created_at DESC`;
  return NextResponse.json({ documents: docs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const category = formData.get('category') as string || 'General';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

  // On Vercel we can't write to disk — store text in DB only
  let extractedText = '';
  try {
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (file.name.toLowerCase().endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    }
  } catch (err) {
    console.error('Text extraction failed:', err);
  }

  // Also write to local disk when running locally (best-effort)
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  } catch {
    // silently skip on Vercel read-only filesystem
  }

  const rows = await sql`
    INSERT INTO documents (filename, original_name, extracted_text, category, uploaded_by)
    VALUES (${filename}, ${file.name}, ${extractedText}, ${category}, ${user.id})
    RETURNING id
  `;

  return NextResponse.json({ id: rows[0].id, name: file.name, category, textLength: extractedText.length });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await req.json();

  const docs = await sql`SELECT filename FROM documents WHERE id = ${id}`;
  if (docs[0]) {
    // Try to remove local file (best-effort)
    try {
      const filepath = path.join(process.cwd(), 'uploads', docs[0].filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    } catch { /* ignore on Vercel */ }
    await sql`DELETE FROM documents WHERE id = ${id}`;
  }

  return NextResponse.json({ success: true });
}
