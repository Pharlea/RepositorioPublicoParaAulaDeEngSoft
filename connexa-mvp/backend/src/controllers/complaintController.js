// Autenticação simples de admin (usuário: admin, senha: 1234)
const ADMIN_USER = 'admin';
const ADMIN_PASS = '1234';
const ADMIN_TOKEN = 'admintoken123';

exports.adminLogin = (req, res) => {
  const { user, pass } = req.body;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return res.json({ token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: 'Usuário ou senha inválidos.' });
};

function checkAdminAuth(req, res) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.split(' ')[1];
  return token === ADMIN_TOKEN;
}
// Listar todas as reclamações (protegido)
exports.listComplaints = (req, res) => {
  if (!checkAdminAuth(req, res)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  db.all('SELECT * FROM complaints ORDER BY data DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar reclamações.' });
    }
    res.status(200).json(rows);
  });
};
// Controlador de reclamações
const db = require('../models/Complaint');

exports.createComplaint = (req, res) => {
  const { texto } = req.body;
  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: 'Texto da reclamação é obrigatório.' });
  }
  db.run('INSERT INTO complaints (texto) VALUES (?)', [texto], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao registrar reclamação.' });
    }
    res.status(201).json({ message: 'Reclamação registrada com sucesso!' });
  });
};
