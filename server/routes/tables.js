const express = require("express");
const db = require("../db");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const tables = db.prepare("SELECT * FROM tables WHERE is_active = 1 ORDER BY table_number").all();
  res.json(tables);
});

router.get("/available", authenticate, (req, res) => {
  const { date, time, guests } = req.query;
  if (!date || !time) {
    return res.status(400).json({ error: "Data e horário são obrigatórios" });
  }

  const requestedGuests = parseInt(guests) || 1;

  const tables = db.prepare(`
    SELECT * FROM tables
    WHERE is_active = 1
    AND capacity >= ?
    AND id NOT IN (
      SELECT table_id FROM reservations
      WHERE date = ? AND time = ? AND status != 'cancelled'
    )
    ORDER BY capacity ASC
  `).all(requestedGuests, date, time);

  const hasExactFit =
    tables.length > 0 && tables.some((t) => t.capacity >= requestedGuests);

  res.json(tables);
});

router.post("/", authenticate, adminOnly, (req, res) => {
  const { table_number, capacity, location } = req.body;
  if (!table_number || !capacity) {
    return res.status(400).json({ error: "Número da mesa e capacidade são obrigatórios" });
  }

  const existing = db.prepare("SELECT id FROM tables WHERE table_number = ?").get(table_number);
  if (existing) {
    return res.status(409).json({ error: "Número de mesa já existe" });
  }

  const result = db
    .prepare(
      "INSERT INTO tables (table_number, capacity, location) VALUES (?, ?, ?)"
    )
    .run(table_number, capacity, location || "Salão Principal");

  const table = db.prepare("SELECT * FROM tables WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(table);
});

router.put("/:id", authenticate, adminOnly, (req, res) => {
  const { capacity, location, is_active } = req.body;
  const table = db.prepare("SELECT * FROM tables WHERE id = ?").get(req.params.id);
  if (!table) return res.status(404).json({ error: "Mesa não encontrada" });

  db.prepare(
    `UPDATE tables SET capacity = ?, location = ?, is_active = ? WHERE id = ?`
  ).run(
    capacity ?? table.capacity,
    location ?? table.location,
    is_active ?? table.is_active,
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM tables WHERE id = ?").get(req.params.id);
  res.json(updated);
});

router.delete("/:id", authenticate, adminOnly, (req, res) => {
  db.prepare("UPDATE tables SET is_active = 0 WHERE id = ?").run(req.params.id);
  res.json({ message: "Mesa desativada" });
});

module.exports = router;
