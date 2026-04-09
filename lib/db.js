const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Determine DB path — works both locally and on Vercel
const DB_PATH = path.join(process.cwd(), 'data', 'mcpanel.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'schema.sql');

// Detect Vercel environment
const IS_VERCEL = !!process.env.VERCEL;

let db = null;

function getDb() {
  if (db) return db;

  // Ensure data directory exists (local dev only)
  if (!IS_VERCEL) {
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // Open database — read-only on Vercel (filesystem is read-only)
  db = new Database(DB_PATH, {
    readonly: IS_VERCEL,
    fileMustExist: IS_VERCEL,
  });

  if (!IS_VERCEL) {
    // Enable WAL mode for better concurrent read performance (dev only)
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema if needed (only in dev)
    if (fs.existsSync(SCHEMA_PATH)) {
      const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schema);
    }
  } else {
    db.pragma('foreign_keys = ON');
  }

  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb, DB_PATH };
