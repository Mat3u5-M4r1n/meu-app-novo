// ── Solicitação Flutuante ─────────────────────────────────────────────────────

function abrirModalFeedback() {
  // Limpar campos
  ['fb-descricao', 'fb-impacto', 'fb-anexo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const prioridade = document.getElementById('fb-prioridade');
  if (prioridade) prioridade.value = '';
  const dataLimite = document.getElementById('fb-data-limite');
  if (dataLimite) dataLimite.value = '';

  // Auto-preencher solicitante e equipe
  const solicitante = document.getElementById('fb-solicitante');
  const equipe = document.getElementById('fb-equipe');
  if (solicitante) solicitante.value = currentUser?.name || currentUser?.email || '';
  if (equipe) {
    equipe.value = currentTeam === 'blv' ? 'Bling Loja Virtual' : 'CS Implantação Guiada';
  }

  const overlay = document.getElementById('feedback-modal-overlay');
  overlay?.classList.remove('hidden');
  overlay?.classList.add('flex');
  setTimeout(() => document.getElementById('fb-descricao')?.focus(), 100);
}

function fecharModalFeedback() {
  const overlay = document.getElementById('feedback-modal-overlay');
  overlay?.classList.add('hidden');
  overlay?.classList.remove('flex');
}

async function enviarFeedback() {
  const descricao = document.getElementById('fb-descricao')?.value?.trim();
  if (!descricao) {
    showToast('Descrição é obrigatória.', 'warn');
    document.getElementById('fb-descricao')?.focus();
    return;
  }

  const btn = document.getElementById('fb-btn-enviar');
  if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

  try {
    const dados = {
      descricao,
      impactoEsperado: document.getElementById('fb-impacto')?.value?.trim() || null,
      prioridade: document.getElementById('fb-prioridade')?.value || null,
      dataLimite: document.getElementById('fb-data-limite')?.value || null,
      anexo: document.getElementById('fb-anexo')?.value?.trim() || null,
      solicitante: document.getElementById('fb-solicitante')?.value || null,
      equipe: document.getElementById('fb-equipe')?.value || null,
      status: 'Novo',
    };

    const res = await apiFetch('/api/projetos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);

    fecharModalFeedback();
    showToast('✅ Solicitação enviada! Aparece em Solicitações Internas.', 'success');
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  } finally {
    if (btn) { btn.textContent = 'Enviar Solicitação'; btn.disabled = false; }
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const colors = {
    success: 'bg-[#002726] text-[#93F574] border-[#93F574]/30',
    error:   'bg-rose-600 text-white border-rose-400',
    warn:    'bg-amber-500 text-white border-amber-300'
  };

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg transition-all duration-300 opacity-0 translate-y-2 ${colors[type] || colors.success}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
