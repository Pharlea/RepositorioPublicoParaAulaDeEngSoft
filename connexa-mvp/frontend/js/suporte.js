// Função para abrir e fechar o modal de reclamação
document.addEventListener('DOMContentLoaded', function() {
  const btnSuporte = document.getElementById('btn-suporte');
  const modal = document.getElementById('modal-suporte');
  const closeBtn = document.getElementById('close-modal-suporte');
  btnSuporte.onclick = () => modal.style.display = 'block';
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = function(event) {
    if (event.target == modal) modal.style.display = 'none';
  };

  document.getElementById('enviar-reclamacao').onclick = function() {
    const texto = document.getElementById('input-reclamacao').value;
    if (texto.trim()) {
      fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          alert('Reclamação enviada! Obrigado pelo feedback.');
          document.getElementById('input-reclamacao').value = '';
          modal.style.display = 'none';
        } else {
          alert(data.error || 'Erro ao enviar reclamação.');
        }
      })
      .catch(() => alert('Erro ao enviar reclamação.'));
    } else {
      alert('Por favor, escreva sua reclamação.');
    }
  };
});
