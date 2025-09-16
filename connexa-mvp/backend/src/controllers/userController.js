// Controlador de cadastro e login de usuário
const db = require('../models/User');
const cryptoService = require('../services/cryptoService');

// Cadastro de usuário
exports.register = async (req, res) => {
  const { nome, email, senha, instituicao, curso } = req.body;
  try {
    // Criptografar dados sensíveis
    const hashedNome = await cryptoService.hashData(nome);
    const hashedEmail = await cryptoService.hashData(email);
    const hashedSenha = await cryptoService.hashData(senha);
    const hashedInstituicao = await cryptoService.hashData(instituicao);
    const hashedCurso = await cryptoService.hashData(curso);

    db.run(
      'INSERT INTO users (nome, email, senha, instituicao, curso) VALUES (?, ?, ?, ?, ?)',
      [hashedNome, hashedEmail, hashedSenha, hashedInstituicao, hashedCurso],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Erro ao cadastrar usuário.' });
        }
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    db.all('SELECT * FROM users', [], async (err, rows) => {
      if (err || !rows || !rows.length) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }
      // Procurar usuário cujo email criptografado bate com o informado
      let foundUser = null;
      for (const row of rows) {
        const emailMatch = await cryptoService.compareData(email, row.email);
        if (emailMatch) {
          foundUser = row;
          break;
        }
      }
      if (!foundUser) {
        return res.status(400).json({ error: 'Usuário não encontrado.' });
      }
      const senhaMatch = await cryptoService.compareData(senha, foundUser.senha);
      if (senhaMatch) {
        res.status(200).json({ message: 'Login realizado com sucesso!' });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas.' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
