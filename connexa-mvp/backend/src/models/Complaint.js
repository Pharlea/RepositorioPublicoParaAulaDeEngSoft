// Modelo de Reclamação
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/connexa.db');

const createComplaintTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
};

createComplaintTable();

module.exports = db;
