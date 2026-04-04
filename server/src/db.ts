import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, '..', 'saferoots.db');

let _db: DatabaseSync;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec("PRAGMA journal_mode = WAL");
    _db.exec("PRAGMA foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS shelters (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      address          TEXT NOT NULL,
      city             TEXT NOT NULL,
      state            TEXT NOT NULL,
      lat              REAL NOT NULL,
      lng              REAL NOT NULL,
      phone            TEXT NOT NULL,
      website          TEXT,
      tags             TEXT NOT NULL DEFAULT '[]',
      capacity         INTEGER NOT NULL DEFAULT 0,
      current_occupancy INTEGER NOT NULL DEFAULT 0,
      rating           REAL NOT NULL DEFAULT 0,
      review_count     INTEGER NOT NULL DEFAULT 0,
      services         TEXT NOT NULL DEFAULT '[]',
      hours            TEXT NOT NULL,
      description      TEXT NOT NULL,
      created_at       TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resources (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      description TEXT NOT NULL,
      address     TEXT NOT NULL,
      city        TEXT NOT NULL,
      state       TEXT NOT NULL,
      phone       TEXT NOT NULL,
      website     TEXT,
      hours       TEXT NOT NULL,
      tags        TEXT NOT NULL DEFAULT '[]',
      lat         REAL NOT NULL,
      lng         REAL NOT NULL,
      is_free     INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS crisis_alerts (
      id          TEXT PRIMARY KEY,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      city        TEXT,
      expires_at  TEXT NOT NULL,
      severity    TEXT NOT NULL DEFAULT 'medium',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS volunteers (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      email        TEXT NOT NULL UNIQUE,
      city         TEXT NOT NULL,
      phone        TEXT,
      organization TEXT,
      skills       TEXT NOT NULL DEFAULT '[]',
      availability TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id         TEXT PRIMARY KEY,
      room       TEXT NOT NULL,
      username   TEXT NOT NULL,
      message    TEXT NOT NULL,
      timestamp  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_shelters_city  ON shelters(city);
    CREATE INDEX IF NOT EXISTS idx_resources_cat  ON resources(category);
    CREATE INDEX IF NOT EXISTS idx_chat_room      ON chat_messages(room, timestamp);
    CREATE INDEX IF NOT EXISTS idx_alerts_expires ON crisis_alerts(expires_at);
  `);
}
