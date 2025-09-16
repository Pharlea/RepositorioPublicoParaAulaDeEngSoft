// Controller para mensagens de grupo
const db = require('../models/Message');

// Listar mensagens de um grupo
exports.listGroupMessages = (req, res) => {
  const { groupId } = req.query;
  if (!groupId) return res.status(400).json({ error: 'groupId obrigatório.' });
  db.all('SELECT id, fromUserId as userId, conteudo as texto, groupId FROM messages WHERE groupId = ? ORDER BY id ASC', [groupId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    res.status(200).json(rows);
  });
};

// Enviar mensagem para o grupo
exports.sendGroupMessage = (req, res) => {
  const { groupId, userId, texto } = req.body;
  if (!groupId || !userId || !texto) return res.status(400).json({ error: 'Campos obrigatórios.' });
  db.run('INSERT INTO messages (fromUserId, toUserId, groupId, conteudo) VALUES (?, 0, ?, ?)', [userId, groupId, texto], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    res.status(201).json({ message: 'Mensagem enviada!' });
  });
};
