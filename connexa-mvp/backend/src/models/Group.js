// Modelo de Grupo
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../db/connexa.db');

// Criação da tabela de grupos
const createGroupTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL, -- publico ou privado
    senha TEXT, -- pode ser nulo
    adminId INTEGER NOT NULL,
    materia TEXT,
    topicos TEXT,
    horarios TEXT
  )`);
};

// Relação usuário-grupo
const createUserGroupTable = () => {
  db.run(`CREATE TABLE IF NOT EXISTS user_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    groupId INTEGER NOT NULL,
    tentativas INTEGER DEFAULT 0,
    bloqueado INTEGER DEFAULT 0
  )`);
};

createGroupTable();
createUserGroupTable();

module.exports = db;
