// Entrada rápida em grupo público
async function entradaRapidaGrupo(userId, groupId) {
  const res = await fetch('/api/groups/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, groupId })
  });
  return res.json();
}

window.grupoAPI.entradaRapidaGrupo = entradaRapidaGrupo;
// Funções para gerenciamento de integrantes do grupo
// Exemplo de uso: chamar estas funções ao clicar nos botões correspondentes na interface

async function adicionarIntegrante(adminId, groupId, userId) {
  const res = await fetch('/api/groups/add-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, groupId, userId })
  });
  return res.json();
}

async function promoverIntegrante(adminId, groupId, userId) {
  const res = await fetch('/api/groups/promote-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, groupId, userId })
  });
  return res.json();
}

async function removerIntegrante(adminId, groupId, userId) {
  const res = await fetch('/api/groups/remove-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, groupId, userId })
  });
  return res.json();
}

// Exporte as funções para uso em outros scripts ou no HTML
window.grupoAPI = { adicionarIntegrante, promoverIntegrante, removerIntegrante };
