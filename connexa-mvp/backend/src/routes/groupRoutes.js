// Rotas de mensagens de grupo
const messageController = require('../controllers/messageController');
router.get('/messages', messageController.listGroupMessages);
router.post('/send-message', messageController.sendGroupMessage);
// Sugerir grupos públicos
router.get('/suggestions', groupController.suggestGroups);
// Buscar grupos
router.get('/search', groupController.searchGroups);
// Criar grupo
router.post('/create', groupController.createGroup);
// Listar membros de um grupo
router.get('/members', groupController.listMembers);
// Adicionar integrante ao grupo
router.post('/add-member', groupController.addMember);

// Promover integrante a admin
router.post('/promote-admin', groupController.promoteToAdmin);

// Remover integrante do grupo
router.post('/remove-member', groupController.removeMember);
// Rotas de grupo
const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Rota para entrar em grupo
router.post('/join', groupController.joinGroup);


// Rota para admin liberar usuário bloqueado
router.post('/unblock', groupController.unblockUser);

module.exports = router;
