import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = getDb();
  const docs = db.prepare('SELECT id, original_name, category, created_at FROM documents ORDER BY created_at DESC').all();
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

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filepath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

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
    extractedText = '';
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO documents (filename, original_name, extracted_text, category, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(filename, file.name, extractedText, category, user.id);

  return NextResponse.json({
    id: result.lastInsertRowid,
    name: file.name,
    category,
    textLength: extractedText.length,
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await req.json();
  const db = getDb();
  const doc = db.prepare('SELECT filename FROM documents WHERE id = ?').get(id) as { filename: string } | undefined;

  if (doc) {
    const filepath = path.join(process.cwd(), 'uploads', doc.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    db.prepare('DELETE FROM documents WHERE id = ?').run(id);
  }

  return NextResponse.json({ success: true });
}
