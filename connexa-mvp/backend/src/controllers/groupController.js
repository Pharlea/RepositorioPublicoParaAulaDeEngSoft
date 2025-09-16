// Sugerir grupos públicos baseado no perfil/interesses
exports.suggestGroups = (req, res) => {
  const { materia, curso, topicos } = req.query;
  let query = "SELECT * FROM groups WHERE tipo = 'publico'";
  const params = [];
  if (materia) {
    query += ' AND (materia LIKE ? OR topicos LIKE ?)';
    params.push(`%${materia}%`, `%${materia}%`);
  }
  if (curso) {
    query += ' AND (topicos LIKE ?)';
    params.push(`%${curso}%`);
  }
  if (topicos) {
    query += ' AND (topicos LIKE ?)';
    params.push(`%${topicos}%`);
  }
  query += ' ORDER BY nome ASC LIMIT 10';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar sugestões.' });
    res.status(200).json(rows);
  });
};
// Buscar grupos com filtros
exports.searchGroups = (req, res) => {
  const { nome, materia, topicos, horarios } = req.query;
  let query = 'SELECT * FROM groups WHERE 1=1';
  const params = [];
  if (nome) {
    query += ' AND nome LIKE ?';
    params.push(`%${nome}%`);
  }
  if (materia) {
    query += ' AND materia LIKE ?';
    params.push(`%${materia}%`);
  }
  if (topicos) {
    query += ' AND topicos LIKE ?';
    params.push(`%${topicos}%`);
  }
  if (horarios) {
    query += ' AND horarios LIKE ?';
    params.push(`%${horarios}%`);
  }
  query += ' ORDER BY nome ASC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar grupos.' });
    res.status(200).json(rows);
  });
};
// Criar grupo (público ou privado, com senha opcional)
exports.createGroup = async (req, res) => {
  const { nome, tipo, senha, adminId, materia, topicos, horarios } = req.body;
  if (!nome || !tipo || !adminId) return res.status(400).json({ error: 'Preencha nome, tipo e adminId.' });
  try {
    let senhaHash = null;
    if (tipo === 'privado' && senha) {
      senhaHash = await cryptoService.hashData(senha);
    }
    db.run(
      'INSERT INTO groups (nome, tipo, senha, adminId, materia, topicos, horarios) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, tipo, senhaHash, adminId, materia || null, topicos || null, horarios || null],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar grupo.' });
        // Adiciona o admin como membro do grupo
        addUserToGroup(adminId, this.lastID).then(() => {
          res.status(201).json({ message: 'Grupo criado com sucesso!', groupId: this.lastID });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar grupo.' });
  }
};
// Listar membros de um grupo
exports.listMembers = async (req, res) => {
  const { groupId } = req.query;
  if (!groupId) return res.status(400).json({ error: 'groupId é obrigatório.' });
  try {
    db.all(
      `SELECT ug.userId, u.nome, u.email FROM user_groups ug
       JOIN users u ON ug.userId = u.id
       WHERE ug.groupId = ?`,
      [groupId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar membros.' });
        res.status(200).json(rows);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar membros.' });
  }
};
// Remover integrante do grupo (apenas admin)
exports.removeMember = async (req, res) => {
  const { adminId, groupId, userId } = req.body;
  try {
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    if (group.adminId !== adminId) return res.status(403).json({ error: 'Apenas o administrador pode remover integrantes.' });
    // Não pode remover o próprio admin
    if (userId === adminId) return res.status(400).json({ error: 'O administrador não pode remover a si mesmo.' });
    // Verifica se o usuário é membro
    const userGroup = await getUserGroup(userId, groupId);
    if (!userGroup) return res.status(400).json({ error: 'Usuário não é integrante do grupo.' });
    db.run('DELETE FROM user_groups WHERE userId = ? AND groupId = ?', [userId, groupId], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao remover integrante.' });
      res.status(200).json({ message: 'Integrante removido do grupo.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao remover integrante.' });
  }
};
// Promover integrante a admin do grupo (apenas admin atual)
exports.promoteToAdmin = async (req, res) => {
  const { adminId, groupId, userId } = req.body;
  try {
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    if (group.adminId !== adminId) return res.status(403).json({ error: 'Apenas o administrador atual pode promover outro integrante.' });
    // Verifica se o usuário é membro
    const userGroup = await getUserGroup(userId, groupId);
    if (!userGroup) return res.status(400).json({ error: 'Usuário não é integrante do grupo.' });
    // Promove a admin
    db.run('UPDATE groups SET adminId = ? WHERE id = ?', [userId, groupId], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao promover integrante.' });
      res.status(200).json({ message: 'Integrante promovido a administrador.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao promover integrante.' });
  }
};
// Adicionar integrante ao grupo (apenas admin)
exports.addMember = async (req, res) => {
  const { adminId, groupId, userId } = req.body;
  try {
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    if (group.adminId !== adminId) return res.status(403).json({ error: 'Apenas o administrador pode adicionar integrantes.' });
    // Verifica se já é membro
    const userGroup = await getUserGroup(userId, groupId);
    if (userGroup) return res.status(400).json({ error: 'Usuário já é integrante do grupo.' });
    await addUserToGroup(userId, groupId);
    res.status(200).json({ message: 'Integrante adicionado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar integrante.' });
  }
};
// Liberação de acesso de usuário bloqueado pelo admin
exports.unblockUser = async (req, res) => {
  const { userId, groupId, adminId } = req.body;
  try {
    // Verifica se adminId é realmente o admin do grupo
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });
    if (group.adminId !== adminId) return res.status(403).json({ error: 'Apenas o administrador pode liberar acesso.' });

    // Libera o usuário: zera tentativas e bloqueio
    await updateUserGroupAttempts(userId, groupId, 0, 0);
    res.status(200).json({ message: 'Usuário liberado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
// Controlador de entrada em grupo
const db = require('../models/Group');
const userDb = require('../models/User');
const cryptoService = require('../services/cryptoService');

// Função auxiliar para buscar grupo
async function getGroupById(groupId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM groups WHERE id = ?', [groupId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Função auxiliar para buscar relação usuário-grupo
async function getUserGroup(userId, groupId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user_groups WHERE userId = ? AND groupId = ?', [userId, groupId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Função auxiliar para inserir usuário no grupo
async function addUserToGroup(userId, groupId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO user_groups (userId, groupId) VALUES (?, ?)', [userId, groupId], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Função auxiliar para atualizar tentativas e bloqueio
async function updateUserGroupAttempts(userId, groupId, tentativas, bloqueado) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE user_groups SET tentativas = ?, bloqueado = ? WHERE userId = ? AND groupId = ?', [tentativas, bloqueado, userId, groupId], function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Entrada em grupo
exports.joinGroup = async (req, res) => {
  const { userId, groupId, senha } = req.body;
  try {
    const group = await getGroupById(groupId);
    if (!group) return res.status(404).json({ error: 'Grupo não encontrado.' });

    let userGroup = await getUserGroup(userId, groupId);
    if (userGroup && userGroup.bloqueado) {
      return res.status(403).json({ error: 'Acesso bloqueado a este grupo.' });
    }

    // Grupo público: entra direto
    if (group.tipo === 'publico') {
      if (!userGroup) await addUserToGroup(userId, groupId);
      return res.status(200).json({ message: 'Entrou no grupo público com sucesso!' });
    }

    // Grupo privado sem senha: envia mensagem ao admin
    if (group.tipo === 'privado' && !group.senha) {
      // Envia mensagem ao admin
      const messageDb = require('../models/Message');
      const conteudo = `Usuário ${userId} solicitou entrada no grupo ${groupId}`;
      messageDb.run(
        'INSERT INTO messages (fromUserId, toUserId, groupId, conteudo) VALUES (?, ?, ?, ?)',
        [userId, group.adminId, groupId, conteudo],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Erro ao enviar mensagem ao administrador.' });
          }
          return res.status(202).json({ message: 'Solicitação enviada ao administrador.' });
        }
      );
      return;
    }

    // Grupo privado com senha
    if (group.tipo === 'privado' && group.senha) {
      if (!userGroup) {
        await addUserToGroup(userId, groupId);
        userGroup = await getUserGroup(userId, groupId);
      }
      if (userGroup.bloqueado) {
        return res.status(403).json({ error: 'Acesso bloqueado a este grupo.' });
      }
      // Verifica senha
      const senhaCorreta = await cryptoService.compareData(senha, group.senha);
      if (senhaCorreta) {
        await updateUserGroupAttempts(userId, groupId, 0, 0);
        return res.status(200).json({ message: 'Entrou no grupo privado com sucesso!' });
      } else {
        let tentativas = (userGroup.tentativas || 0) + 1;
        let bloqueado = tentativas >= 3 ? 1 : 0;
        await updateUserGroupAttempts(userId, groupId, tentativas, bloqueado);
        if (bloqueado) {
          return res.status(403).json({ error: 'Acesso bloqueado após 3 tentativas.' });
        }
        return res.status(401).json({ error: `Senha incorreta. Tentativas restantes: ${3 - tentativas}` });
      }
    }
    res.status(400).json({ error: 'Tipo de grupo inválido.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
