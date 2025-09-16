// Login de admin
router.post('/login', complaintController.adminLogin);
// Rotas de reclamação
const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');


// Enviar reclamação
router.post('/', complaintController.createComplaint);

// Listar reclamações
router.get('/', complaintController.listComplaints);

module.exports = router;
