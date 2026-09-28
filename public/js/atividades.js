let ATIVIDADES = [];
let atividadeModalId = null; // null = nova, number = editar

// ── Carregamento ─────────────────────────────────────────────────────────────

async function carregarAtividades() {
  const res = await apiFetch('/api/atividades-blv');
  if (!res.ok) throw new Error('Erro ao carregar atividades');
  ATIVIDADES = await res.json();
  return ATIVIDADES;
}

// ── Render da view ────────────────────────────────────────────────────────────

function renderAtividadesView() {
  const container = document.getElementById('atividades-list-container');
  if (!container) return;

  const q = (document.getElementById('atividades-search')?.value || '').toLowerCase().trim();
  const filterEmpresa = document.getElementById('atividades-filter-empresa')?.value || 'todos';

  let dataset = [...ATIVIDADES];
  if (q) {
    dataset = dataset.filter(a =>
      (a.empresa || '').toLowerCase().includes(q) ||
      (a.titulo || '').toLowerCase().includes(q) ||
      (a.followup || '').toLowerCase().includes(q) ||
      (a.criadoPor || '').toLowerCase().includes(q)
    );
  }
  if (filterEmpresa !== 'todos') dataset = dataset.filter(a => a.empresa === filterEmpresa);

  // Atualizar badge total
  const totalEl = document.getElementById('atividades-total-badge');
  if (totalEl) totalEl.textContent = dataset.length;

  // Atualizar filtro de empresas
  _buildAtividadesEmpresaFilter();

  if (dataset.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-[#aaa] gap-3">
        <svg class="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        <p class="text-sm font-medium">Nenhuma atividade registrada</p>
        <button onclick="abrirModalAtividade(null, null)" class="mt-1 px-4 py-2 bg-[#7F76FF] hover:bg-[#6b62e8] text-white rounded-xl text-xs font-bold cursor-pointer">Criar primeira atividade</button>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#fafafa] border-b border-[#eee] text-[10px] font-bold text-[#666] uppercase tracking-wider sticky top-0">
          <tr>
            <th class="px-4 py-2.5 w-8">#</th>
            <th class="px-4 py-2.5">Empresa</th>
            <th class="px-4 py-2.5">Título</th>
            <th class="px-4 py-2.5">Followup</th>
            <th class="px-4 py-2.5">Criado por</th>
            <th class="px-4 py-2.5">Data</th>
            <th class="px-4 py-2.5 w-16"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#f0f0f0]">
          ${dataset.map(a => `
            <tr class="hover:bg-[#f8fafc] transition-colors group cursor-pointer" onclick="abrirModalAtividade(${a.id}, null)">
              <td class="px-4 py-3 font-mono text-[#aaa] text-[10px]">${a.id}</td>
              <td class="px-4 py-3">
                <span class="font-semibold text-[#002726]">${escapeHtml(a.empresa)}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-[#333]">${escapeHtml(a.titulo)}</span>
              </td>
              <td class="px-4 py-3 max-w-[280px]">
                <span class="text-[#666] line-clamp-2">${escapeHtml(a.followup || '—')}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-[#666]">${escapeHtml(a.criadoPor || '—')}</span>
              </td>
              <td class="px-4 py-3 font-mono text-[#999] text-[10px] whitespace-nowrap">
                ${a.criadoEm ? new Date(a.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
              </td>
              <td class="px-4 py-3" onclick="event.stopPropagation()">
                <button onclick="excluirAtividade(${a.id})" class="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function _buildAtividadesEmpresaFilter() {
  const sel = document.getElementById('atividades-filter-empresa');
  if (!sel) return;
  const current = sel.value;
  const empresas = [...new Set(ATIVIDADES.map(a => a.empresa).filter(Boolean))].sort();
  sel.innerHTML = `<option value="todos">Todas as empresas</option>` +
    empresas.map(e => `<option value="${e}" ${e === current ? 'selected' : ''}>${e}</option>`).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function abrirModalAtividade(id, empresaPreenchida) {
  atividadeModalId = id || null;
  const atividade = id ? ATIVIDADES.find(a => a.id === id) : null;

  const title = document.getElementById('atividade-modal-title');
  if (title) title.textContent = atividade ? `Editar Atividade #${atividade.id}` : 'Nova Atividade';

  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val ?? ''; };

  // Empresa: prioridade → atividade existente → empresa do card → vazio
  set('am-empresa', atividade?.empresa ?? empresaPreenchida ?? '');
  set('am-titulo', atividade?.titulo ?? '');
  set('am-followup', atividade?.followup ?? '');
  set('am-criado-por', atividade?.criadoPor ?? currentUser?.name ?? '');

  const deleteBtn = document.getElementById('am-btn-delete');
  if (deleteBtn) deleteBtn.classList.toggle('hidden', !atividade);

  const overlay = document.getElementById('atividade-modal-overlay');
  if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); }
  document.body.style.overflow = 'hidden';

  // Focus no título se empresa já preenchida
  setTimeout(() => {
    const foco = empresaPreenchida && !atividade ? document.getElementById('am-titulo') : document.getElementById('am-empresa');
    foco?.focus();
  }, 50);
}

function fecharModalAtividade() {
  const overlay = document.getElementById('atividade-modal-overlay');
  if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
  document.body.style.overflow = '';
  atividadeModalId = null;
}

async function salvarAtividadeModal(event) {
  if (event) event.preventDefault();
  const get = id => document.getElementById(id)?.value?.trim() ?? '';

  const dados = {
    empresa:   get('am-empresa'),
    titulo:    get('am-titulo'),
    followup:  get('am-followup'),
    criadoPor: get('am-criado-por'),
  };

  if (!dados.empresa) { alert('Empresa é obrigatória.'); return; }
  if (!dados.titulo)  { alert('Título é obrigatório.'); return; }

  const btn = event?.submitter || document.getElementById('am-btn-save');
  if (btn) { btn.textContent = 'Salvando...'; btn.disabled = true; }

  try {
    let salva;
    if (atividadeModalId) {
      const res = await apiFetch(`/api/atividades-blv/${atividadeModalId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      salva = await res.json();
      const idx = ATIVIDADES.findIndex(a => a.id === atividadeModalId);
      if (idx !== -1) ATIVIDADES[idx] = salva;
    } else {
      const res = await apiFetch('/api/atividades-blv', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      salva = await res.json();
      ATIVIDADES.unshift(salva);
    }
    fecharModalAtividade();
    // Atualizar badge no sidebar
    const badge = document.getElementById('badge-atividades-count');
    if (badge) { badge.textContent = ATIVIDADES.length; badge.classList.remove('hidden'); }
    // Re-renderizar a view ativa
    if (currentView === 'atividades') renderAtividadesView();
    else if (currentView === 'pipeline') renderKanbanBoard();
  } catch (e) {
    alert('Erro ao salvar: ' + e.message);
  } finally {
    if (btn) { btn.textContent = 'Salvar'; btn.disabled = false; }
  }
}

async function excluirAtividade(id) {
  if (!confirm('Excluir esta atividade?')) return;
  await apiFetch(`/api/atividades-blv/${id}`, { method: 'DELETE' });
  ATIVIDADES = ATIVIDADES.filter(a => a.id !== id);
  if (currentView === 'atividades') renderAtividadesView();
}

// ── Filtros ───────────────────────────────────────────────────────────────────

function onAtividadesSearch() { renderAtividadesView(); }
function onAtividadesFilterChange() { renderAtividadesView(); }
