// JS centralizado para grupos.html

document.addEventListener('DOMContentLoaded', () => {
  // Barra de busca
  document.getElementById('form-busca-grupos').onsubmit = buscarGrupos;
  document.getElementById('abrir-modal-criar-grupo').onclick = () => abrirModal('modal-criar-grupo');
  document.getElementById('fechar-modal-criar-grupo').onclick = () => fecharModal('modal-criar-grupo');
  document.getElementById('fechar-modal-grupo').onclick = () => fecharModal('modal-grupo');
  document.getElementById('btn-suporte').onclick = () => abrirModal('modal-suporte');
  document.getElementById('close-modal-suporte').onclick = () => fecharModal('modal-suporte');
  document.getElementById('form-criar-grupo').onsubmit = criarGrupo;
  document.getElementById('btn-enviar-msg').onclick = enviarMensagemGrupo;
  document.getElementById('enviar-reclamacao').onclick = enviarReclamacao;
  carregarGrupos();
});

function abrirModal(id) {
  document.getElementById(id).style.display = 'flex';
}
function fecharModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Buscar grupos
async function buscarGrupos(e) {
  if (e) e.preventDefault();
  const nome = document.getElementById('busca-nome').value;
  const materia = document.getElementById('busca-materia').value;
  const topicos = document.getElementById('busca-topicos').value;
  const horarios = document.getElementById('busca-horarios').value;
  const params = [];
  if (nome) params.push('nome=' + encodeURIComponent(nome));
  if (materia) params.push('materia=' + encodeURIComponent(materia));
  if (topicos) params.push('topicos=' + encodeURIComponent(topicos));
  if (horarios) params.push('horarios=' + encodeURIComponent(horarios));
  const url = '/api/groups/search' + (params.length ? '?' + params.join('&') : '');
  const res = await fetch(url);
  const data = await res.json();
  renderizarGrupos(data);
}

// Carregar todos os grupos
async function carregarGrupos() {
  const res = await fetch('/api/groups/search');
  const data = await res.json();
  renderizarGrupos(data);
}

function renderizarGrupos(data) {
  const lista = document.getElementById('grupos-lista');
  const vazio = document.getElementById('grupos-vazio');
  if (Array.isArray(data) && data.length) {
    vazio.style.display = 'none';
    lista.innerHTML = data.map(g => `
      <div class="card-grupo" onclick='abrirModalGrupo(${JSON.stringify(g)})'>
        <div class="card-grupo-nome">${g.nome}</div>
        <div class="card-grupo-info">
          <b>Matéria:</b> ${g.materia || '-'}<br>
          <b>Tópicos:</b> ${g.topicos || '-'}<br>
          <b>Tipo:</b> ${g.tipo}<br>
          <b>ID:</b> ${g.id}
        </div>
      </div>
    `).join('');
  } else {
    lista.innerHTML = '';
    vazio.style.display = 'block';
  }
}

// Modal de grupo (detalhes, membros, chat)
async function abrirModalGrupo(grupo) {
  abrirModal('modal-grupo');
  document.getElementById('grupo-nome').innerText = grupo.nome;
  document.getElementById('grupo-info').innerHTML =
    `<b>Matéria:</b> ${grupo.materia || '-'}<br><b>Tópicos:</b> ${grupo.topicos || '-'}<br><b>Horários:</b> ${grupo.horarios || '-'}<br><b>Tipo:</b> ${grupo.tipo}<br><b>ID:</b> ${grupo.id}`;
  document.getElementById('grupo-msg').innerText = '';
  // Exibir membros resumido
  const resMembros = await fetch(`/api/groups/members?groupId=${grupo.id}`);
  const membros = await resMembros.json();
  document.getElementById('grupo-membros-resumo').innerHTML =
    `${Array.isArray(membros) && membros.length ? membros.map(m => m.nome || m.userId).join(', ') : 'Nenhum'}`;
  // Área de entrada
  let html = `<input type='text' id='grupo-userid' placeholder='Seu ID' class='input-pequeno'>`;
  if (grupo.tipo === 'privado' && grupo.senha) {
    html += `<input type='password' id='grupo-senha' placeholder='Senha' class='input-pequeno' style='margin-left:8px;'>`;
  }
  html += `<button onclick='entrarNoGrupo(${grupo.id}, "${grupo.tipo}", ${!!grupo.senha})' class='btn-principal' style='margin-left:8px;'>Entrar</button>`;
  document.getElementById('grupo-entrar-area').innerHTML = html;
  document.getElementById('btn-gerenciar-integrantes').style.display = 'none';
  document.getElementById('grupo-membros-lista').style.display = 'none';
  document.getElementById('btn-gerenciar-integrantes').onclick = () => mostrarGerenciarIntegrantes(grupo.id);
  carregarMensagensGrupo(grupo.id);
}

// Funções de chat, entrada, gerenciamento, reclamação etc. podem ser copiadas/adaptadas do index.html
// ...
