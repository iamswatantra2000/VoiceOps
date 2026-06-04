import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Convenience proxy — use `sql` just like before
export const sql: NeonQueryFunction<false, false> = new Proxy({} as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args) {
    return getSql()(...(args as Parameters<NeonQueryFunction<false, false>>));
  },
  get(_target, prop) {
    const s = getSql();
    return (s as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export async function initSchema() {
  const q = getSql();
  await q`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      department TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await q`
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      voice_transcript TEXT NOT NULL,
      ai_analysis TEXT,
      severity TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      department TEXT,
      shift TEXT,
      machine TEXT,
      resolution_note TEXT,
      resolved_by INTEGER REFERENCES users(id),
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await q`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      extracted_text TEXT,
      category TEXT,
      uploaded_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await q`
    CREATE TABLE IF NOT EXISTS incident_feedback (
      id SERIAL PRIMARY KEY,
      incident_id INTEGER NOT NULL REFERENCES incidents(id),
      helpful INTEGER DEFAULT 0,
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function seedUsers() {
  const bcrypt = require('bcryptjs');
  const q = getSql();

  const existing = await q`SELECT id FROM users WHERE employee_id = 'ADMIN001'`;
  if (existing.length > 0) return;

  const adminHash = bcrypt.hashSync('admin123', 10);
  const operatorHash = bcrypt.hashSync('operator123', 10);

  await q`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES ('Plant Admin', 'ADMIN001', ${adminHash}, 'admin', 'Management')`;
  await q`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES ('Erik Johansson', 'OP001', ${operatorHash}, 'operator', 'Assembly Line A')`;
  await q`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES ('Anna Lindqvist', 'OP002', ${operatorHash}, 'operator', 'Welding Station B')`;
}
