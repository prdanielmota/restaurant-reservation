const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "restaurant.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    google_id TEXT UNIQUE,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    location TEXT DEFAULT 'Salão Principal',
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    guests INTEGER NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
  );
`);

const tableCount = db.prepare("SELECT COUNT(*) as count FROM tables").get();
if (tableCount.count === 0) {
  const insertTable = db.prepare(
    "INSERT INTO tables (table_number, capacity, location) VALUES (?, ?, ?)"
  );
  const defaultTables = [
    ["M1", 2, "Salão Principal"],
    ["M2", 2, "Salão Principal"],
    ["M3", 4, "Salão Principal"],
    ["M4", 4, "Salão Principal"],
    ["M5", 4, "Terraço"],
    ["M6", 6, "Salão Principal"],
    ["M7", 6, "Terraço"],
    ["M8", 8, "Salão Principal"],
    ["M9", 8, "Terraço"],
    ["M10", 10, "Reservado"],
  ];
  for (const t of defaultTables) {
    insertTable.run(t[0], t[1], t[2]);
  }
}

const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get();
if (settingsCount.count === 0) {
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("max_date", maxDate);
}

const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
if (adminCount.count === 0) {
  const bcrypt = require("bcryptjs");
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
  ).run("Administrador", "admin@restaurante.com", hash, "admin");
}

module.exports = db;
