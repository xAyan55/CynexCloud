import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "cynex.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export const dbInit = () => {
  db.exec(`
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

  db.exec(`
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

  db.exec(`
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

  db.exec(`
    CREATE TABLE IF NOT EXISTS password_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      passwordHash TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      userId TEXT NOT NULL,
      message TEXT NOT NULL,
      isStaff INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ticketId) REFERENCES tickets(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      keyHash TEXT NOT NULL UNIQUE,
      permissions TEXT DEFAULT '[]',
      lastUsed TEXT,
      expiresAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Pending Payment',
      pterodactylId INTEGER,
      pterodactylUuid TEXT,
      price REAL NOT NULL,
      billingCycle TEXT DEFAULT 'Monthly',
      nextRenewalDate TEXT,
      gracePeriodUntil TEXT,
      terminationDate TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT NOT NULL,
      status TEXT DEFAULT 'Pending Payment',
      price REAL NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'Unpaid',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS provisioning_jobs (
      id TEXT PRIMARY KEY,
      serviceId TEXT NOT NULL,
      status TEXT DEFAULT 'Queued',
      errorLog TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(serviceId) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'Platform',
      poster TEXT DEFAULT 'CynexCloud System',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Seed default startup system announcement if empty
  const checkAnn = db.prepare("SELECT count(*) as count FROM announcements").get() as any;
  if (checkAnn.count === 0) {
    db.prepare(`
      INSERT INTO announcements (id, title, content, category, poster) 
      VALUES ('ann-start', 'CynexCloud Portal Launch', 'CynexCloud business storefront portal has launched successfully. Active services are decoupled and linked directly to Pterodactyl panels.', 'Launch', 'Cynex System')
    `).run();
  }

  // Cleanup Settings HTML entities (un-escape slashes saved by previous sanitizeInput)
  try {
    db.prepare(`
      UPDATE settings 
      SET value = replace(replace(value, '&#x2F;', '/'), '&#x27;', '''') 
      WHERE value LIKE '%&#x2F;%' OR value LIKE '%&#x27;%'
    `).run();
  } catch (err) {
    console.error("Failed to run settings database migration:", err);
  }

  console.log("SQLite database initialized successfully at", dbPath);
};

// Wrap better-sqlite3's synchronous API in async-compatible helpers
// so all existing controller code continues to work without changes.

export const queryRun = async (sql: string, params: any[] = []): Promise<{ changes: number; lastID: any }> => {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return { changes: result.changes, lastID: result.lastInsertRowid };
};

export const queryGet = async <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row as T | undefined;
};

export const queryAll = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows as T[];
};
