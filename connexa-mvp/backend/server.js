const complaintRoutes = require('./src/routes/complaintRoutes');
app.use('/api/complaints', complaintRoutes);
// Inicialização do servidor
const express = require('express');
const bodyParser = require('body-parser');

const userRoutes = require('./src/routes/userRoutes');
const groupRoutes = require('./src/routes/groupRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
