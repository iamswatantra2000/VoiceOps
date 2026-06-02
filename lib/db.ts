import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'voiceops.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      employee_id TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      voice_transcript TEXT NOT NULL,
      ai_analysis TEXT,
      severity TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      extracted_text TEXT,
      category TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS incident_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      helpful INTEGER DEFAULT 0,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (incident_id) REFERENCES incidents(id)
    );
  `);

  // Seed default admin and a demo operator if not exist
  const adminExists = db.prepare('SELECT id FROM users WHERE employee_id = ?').get('ADMIN001');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const adminHash = bcrypt.hashSync('admin123', 10);
    const operatorHash = bcrypt.hashSync('operator123', 10);

    db.prepare(`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`).run(
      'Plant Admin', 'ADMIN001', adminHash, 'admin', 'Management'
    );
    db.prepare(`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`).run(
      'Erik Johansson', 'OP001', operatorHash, 'operator', 'Assembly Line A'
    );
    db.prepare(`INSERT INTO users (name, employee_id, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`).run(
      'Anna Lindqvist', 'OP002', operatorHash, 'operator', 'Welding Station B'
    );
  }
}
