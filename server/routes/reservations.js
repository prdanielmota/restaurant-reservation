const express = require("express");
const db = require("../db");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

const VALID_TIMES = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
];

router.post("/", authenticate, (req, res) => {
  const { table_id, date, time, guests, notes } = req.body;
  if (!table_id || !date || !time || !guests) {
    return res.status(400).json({ error: "Mesa, data, horário e número de pessoas são obrigatórios" });
  }

  if (!VALID_TIMES.includes(time)) {
    return res.status(400).json({ error: "Horário inválido" });
  }

  const today = new Date().toISOString().split("T")[0];
  if (date < today) {
    return res.status(400).json({ error: "Não é possível reservar para datas passadas" });
  }

  const table = db.prepare("SELECT * FROM tables WHERE id = ? AND is_active = 1").get(table_id);
  if (!table) {
    return res.status(404).json({ error: "Mesa não encontrada ou inativa" });
  }
  if (guests > table.capacity) {
    return res.status(400).json({
      error: `Esta mesa comporta no máximo ${table.capacity} pessoas`,
    });
  }

  const conflict = db.prepare(
    "SELECT id FROM reservations WHERE table_id = ? AND date = ? AND time = ? AND status != 'cancelled'"
  ).get(table_id, date, time);
  if (conflict) {
    return res.status(409).json({ error: "Esta mesa já está reservada neste horário" });
  }

  const result = db
    .prepare(
      `INSERT INTO reservations (user_id, table_id, date, time, guests, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, table_id, date, time, guests, notes || null);

  const reservation = db.prepare(`
    SELECT r.*, t.table_number, t.location, u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN tables t ON r.table_id = t.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(reservation);
});

router.get("/", authenticate, (req, res) => {
  let reservations;
  if (req.user.role === "admin") {
    reservations = db.prepare(`
      SELECT r.*, t.table_number, t.location, t.capacity as table_capacity,
             u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.date DESC, r.time ASC
    `).all();
  } else {
    reservations = db.prepare(`
      SELECT r.*, t.table_number, t.location, t.capacity as table_capacity
      FROM reservations r
      JOIN tables t ON r.table_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.date DESC, r.time ASC
    `).all(req.user.id);
  }
  res.json(reservations);
});

router.get("/timeslots", authenticate, (req, res) => {
  const { date, guests } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Data é obrigatória" });
  }

  const requestedGuests = parseInt(guests) || 1;

  const availableTables = db.prepare(`
    SELECT * FROM tables
    WHERE is_active = 1 AND capacity >= ?
  `).all(requestedGuests);

  const booked = db.prepare(`
    SELECT table_id, time FROM reservations
    WHERE date = ? AND status != 'cancelled'
  `).all(date);

  const bookedMap = {};
  for (const b of booked) {
    if (!bookedMap[b.time]) bookedMap[b.time] = new Set();
    bookedMap[b.time].add(b.table_id);
  }

  const slots = VALID_TIMES.map((time) => {
    const free = availableTables.filter((t) => !bookedMap[time]?.has(t.id));
    return {
      time,
      available: free.length > 0,
      available_tables: free.length,
      tables: free.map((t) => ({ id: t.id, number: t.table_number, capacity: t.capacity, location: t.location })),
    };
  });

  res.json(slots);
});

router.put("/:id", authenticate, (req, res) => {
  const reservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(req.params.id);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada" });

  if (req.user.role !== "admin" && reservation.user_id !== req.user.id) {
    return res.status(403).json({ error: "Você não pode editar esta reserva" });
  }

  const { status, table_id, date, time, guests, notes } = req.body;

  const updatedStatus = status || reservation.status;
  const updatedDate = date || reservation.date;
  const updatedTime = time || reservation.time;

  if (updatedStatus !== "cancelled" && updatedStatus !== "cancelled") {
    const conflict = db.prepare(
      `SELECT id FROM reservations
       WHERE table_id = ? AND date = ? AND time = ? AND status != 'cancelled' AND id != ?`
    ).get(table_id || reservation.table_id, updatedDate, updatedTime, req.params.id);
    if (conflict) {
      return res.status(409).json({ error: "Conflito de horário com outra reserva" });
    }
  }

  db.prepare(`
    UPDATE reservations
    SET status = ?, table_id = ?, date = ?, time = ?, guests = ?, notes = ?
    WHERE id = ?
  `).run(
    updatedStatus,
    table_id || reservation.table_id,
    updatedDate,
    updatedTime,
    guests || reservation.guests,
    notes !== undefined ? notes : reservation.notes,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT r.*, t.table_number, t.location, u.name as user_name, u.email as user_email
    FROM reservations r
    JOIN tables t ON r.table_id = t.id
    JOIN users u ON r.user_id = u.id
    WHERE r.id = ?
  `).get(req.params.id);
  res.json(updated);
});

router.delete("/:id", authenticate, (req, res) => {
  const reservation = db.prepare("SELECT * FROM reservations WHERE id = ?").get(req.params.id);
  if (!reservation) return res.status(404).json({ error: "Reserva não encontrada" });

  if (req.user.role !== "admin" && reservation.user_id !== req.user.id) {
    return res.status(403).json({ error: "Você não pode cancelar esta reserva" });
  }

  db.prepare("UPDATE reservations SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ message: "Reserva cancelada com sucesso" });
});

module.exports = router;
