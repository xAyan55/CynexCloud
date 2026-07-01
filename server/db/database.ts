import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "cynex.db");

// Enable verbosity for easier debugging
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

export const dbInit = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          passwordHash TEXT NOT NULL,
          emailVerified INTEGER DEFAULT 0,
          avatar TEXT,
          role TEXT DEFAULT 'user',
          permissions TEXT DEFAULT '[]',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
          lastLogin TEXT,
          lastIPAddress TEXT,
          lastUserAgent TEXT,
          failedLoginAttempts INTEGER DEFAULT 0,
          lockUntil TEXT,
          refreshTokenVersion INTEGER DEFAULT 1,
          twoFactorEnabled INTEGER DEFAULT 0,
          twoFactorSecret TEXT,
          banned INTEGER DEFAULT 0,
          deleted INTEGER DEFAULT 0
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          tokenFamily TEXT NOT NULL,
          device TEXT,
          browser TEXT,
          ipAddress TEXT,
          country TEXT,
          userAgent TEXT,
          lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
          expiresAt TEXT NOT NULL,
          revoked INTEGER DEFAULT 0,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          userId TEXT,
          action TEXT NOT NULL,
          ip TEXT,
          device TEXT,
          browser TEXT,
          country TEXT,
          userAgent TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS password_history (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          passwordHash TEXT NOT NULL,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else {
          console.log("SQLite database initialized successfully at", dbPath);
          resolve();
        }
      });
    });
  });
};

export const queryRun = (sql: string, params: any[] = []) => {
  return new Promise<{ changes: number; lastID: any }>((resolve, reject) => {
    db.run(sql, params, function (this: any, err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
};

export const queryGet = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  return new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
};

export const queryAll = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};
