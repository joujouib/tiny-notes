const express = require("express");
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const app = express();
app.use(express.json());

// Ensure data folder exists
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

// SQLite DB file
const dbPath = path.join(dataDir, "app.db");
const db = new Database(dbPath);

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const insertNote = db.prepare(
  "INSERT INTO notes (text, created_at) VALUES (?, datetime('now'))"
);
const listNotes = db.prepare(
  "SELECT id, text, created_at FROM notes ORDER BY id DESC LIMIT 50"
);
const deleteNote = db.prepare("DELETE FROM notes WHERE id = ?");

// API routes
app.get("/api/notes", (req, res) => {
  res.json(listNotes.all());
});

app.post("/api/notes", (req, res) => {
  const text = (req.body?.text || "").trim();
  if (!text) return res.status(400).json({ error: "text is required" });

  const info = insertNote.run(text);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const info = deleteNote.run(id);
  res.json({ deleted: info.changes > 0 });
});

// Frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
