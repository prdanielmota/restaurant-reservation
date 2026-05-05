const express = require("express");
const db = require("../db");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

router.get("/", authenticate, (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

router.put("/:key", authenticate, adminOnly, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (!value && value !== "0") {
    return res.status(400).json({ error: "Valor é obrigatório" });
  }
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, String(value));
  res.json({ key, value: String(value) });
});

module.exports = router;
