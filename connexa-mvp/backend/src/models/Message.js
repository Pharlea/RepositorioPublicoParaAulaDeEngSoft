// Modelo de Mensagem para comunicação com admin
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/connexa.db');

const createMessageTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fromUserId INTEGER NOT NULL,
    toUserId INTEGER NOT NULL,
    groupId INTEGER NOT NULL,
    conteudo TEXT NOT NULL,
    lida INTEGER DEFAULT 0
  )`);
};

createMessageTable();

module.exports = db;
