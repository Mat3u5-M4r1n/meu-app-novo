let PROJETOS = [];
let projetoModalId = null;
let currentProjetosSubView = 'landing';

const PROJETOS_STATUS = ['Novo', 'Em andamento', 'Aguardando informações', 'Concluído', 'Cancelado', 'Congelado'];
const PROJETOS_EQUIPES = ['Bling Loja Virtual', 'CS Implantação Guiada'];
const PROJETOS_SOLICITANTES = ['Manu', 'Vinicius', 'Luan'];
const PROJETOS_PRIORIDADES = ['Baixa', 'Média', 'Alta'];

const PROJETOS_STATUS_CONFIG = {
  'Novo':                    { color: '#7F76FF', bg: '#F0EFFF', dot: '#7F76FF' },
  'Em andamento':            { color: '#2563eb', bg: '#EFF6FF', dot: '#3b82f6' },
  'Aguardando informações':  { color: '#d97706', bg: '#FFFBEB', dot: '#f59e0b' },
  'Concluído':               { color: '#16a34a', bg: '#F0FDF4', dot: '#22c55e' },
  'Cancelado':               { color: '#dc2626', bg: '#FEF2F2', dot: '#ef4444' },
  'Congelado':               { color: '#6b7280', bg: '#F9FAFB', dot: '#9ca3af' },
};

const PRIORIDADE_CONFIG = {
  'Alta':  { label: '🔴 Alta',  cls: 'bg-red-100 text-red-800' },
  'Média': { label: '🟡 Média', cls: 'bg-amber-100 text-amber-800' },
  'Baixa': { label: '🟢 Baixa', cls: 'bg-emerald-100 text-emerald-800' },
};

async function carregarProjetos() {
  const res = await apiFetch('/api/projetos');
  if (!res.ok) throw new Error('Erro ao carregar projetos');
  PROJETOS = await res.json();
  return PROJETOS;
}

function renderProjetosView() {
  if (currentProjetosSubView === 'lista') renderMinhasSolicitacoes();
}

function switchProjetosSubView(mode) {
  currentProjetosSubView = mode;
  const landing = document.getElementById('solicitations-landing');
  const lista = document.getElementById('solicitations-lista');
  const backBtn = document.getElementById('btn-solicitations-back');
  const title = document.getElementById('solicitations-view-title');
  const countEl = document.getElementById('solicitations-list-count');
  const searchEl = document.getElementById('solicitations-search');
  const novaBtn = document.getElementById('btn-nova-solicitacao');

  if (mode === 'landing') {
    if (landing) landing.classList.remove('hidden');
    if (lista) lista.classList.add('hidden');
    if (backBtn) { backBtn.classList.add('hidden'); backBtn.classList.remove('flex'); }
    if (title) title.textContent = 'Solicitações Internas';
    if (countEl) countEl.classList.add('hidden');
    if (searchEl) searchEl.classList.add('hidden');
    if (novaBtn) { novaBtn.classList.add('hidden'); novaBtn.classList.remove('flex'); }
  } else if (mode === 'lista') {
    if (landing) landing.classList.add('hidden');
    if (lista) lista.classList.remove('hidden');
    if (backBtn) { backBtn.classList.remove('hidden'); backBtn.classList.add('flex'); }
    if (title) title.textContent = 'Minhas Solicitações';
    if (countEl) countEl.classList.remove('hidden');
    if (searchEl) searchEl.classList.remove('hidden');
    if (novaBtn) { novaBtn.classList.remove('hidden'); novaBtn.classList.add('flex'); }
    renderMinhasSolicitacoes();
  }
}

function renderMinhasSolicitacoes() {
  const container = document.getElementById('solicitations-list-container');
  if (!container) return;

  const q = (document.getElementById('solicitations-search')?.value || '').toLowerCase().trim();
  const userName = currentUser?.name || '';
  let dataset = PROJETOS.filter(p => p.solicitante === userName);
  if (q) dataset = dataset.filter(p =>
    (p.descricao || '').toLowerCase().includes(q) ||
    (p.status || '').toLowerCase().includes(q) ||
    (p.equipe || '').toLowerCase().includes(q)
  );

  const countEl = document.getElementById('solicitations-list-count');
  if (countEl) countEl.textContent = `${dataset.length} solicitação(ões)`;

  if (dataset.length === 0) {
    container.innerHTML = `<div class="py-16 text-center text-sm text-[#aaa]">
      Você ainda não possui solicitações registradas.<br/>
      <button onclick="abrirModalProjeto(null)" class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#002726] text-[#93F574] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#003835]">Nova Solicitação</button>
    </div>`;
    return;
  }

  container.innerHTML = `
    <table class="w-full text-left text-xs">
      <thead class="bg-[#fafafa] border-b border-[#eee] text-[11px] font-bold text-[#666] uppercase sticky top-0">
        <tr>
          <th class="px-4 py-3">#</th>
          <th class="px-4 py-3">Descrição</th>
          <th class="px-4 py-3">Equipe</th>
          <th class="px-4 py-3">Prioridade</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Data Limite</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#eee]">
        ${dataset.map(p => {
          const cfg = PROJETOS_STATUS_CONFIG[p.status] || { bg: '#f0f0f0', color: '#666' };
          const prio = PRIORIDADE_CONFIG[p.prioridade] || { label: p.prioridade || '—', cls: 'bg-slate-100 text-slate-600' };
          const vencido = p.dataLimite && p.dataLimite < new Date().toISOString().slice(0, 10) && p.status !== 'Concluído' && p.status !== 'Cancelado';
          return `<tr onclick="abrirModalProjeto(${p.id})" class="hover:bg-[#fafafa] cursor-pointer transition-colors">
            <td class="px-4 py-3 font-mono text-[#999]">#${p.id}</td>
            <td class="px-4 py-3 font-medium text-[#002726] max-w-[300px]"><span class="line-clamp-2">${p.descricao || '—'}</span></td>
            <td class="px-4 py-3 text-[#666]">${p.equipe || '—'}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${prio.cls}">${prio.label}</span></td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold" style="background-color:${cfg.bg};color:${cfg.color}">${p.status || '—'}</span></td>
            <td class="px-4 py-3 font-mono ${vencido ? 'text-red-600 font-bold' : 'text-[#888]'}">${p.dataLimite || '—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderProjetoCard(p) {
  const prio = PRIORIDADE_CONFIG[p.prioridade] || { label: p.prioridade || '—', cls: 'bg-slate-100 text-slate-600' };
  const vencido = p.dataLimite && p.dataLimite < new Date().toISOString().slice(0, 10) && p.status !== 'Concluído' && p.status !== 'Cancelado';
  return `
    <div onclick="abrirModalProjeto(${p.id})" class="bg-white rounded-xl border border-[#e8e8e8] p-3 hover:shadow-md hover:border-[#7F76FF]/40 transition-all cursor-pointer flex flex-col gap-2">
      <div class="flex items-start justify-between gap-2">
        <span class="font-mono text-[10px] text-[#999] shrink-0">#${p.id}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${prio.cls}">${prio.label}</span>
      </div>
      <p class="text-xs font-semibold text-[#002726] leading-snug line-clamp-2">${p.descricao || '—'}</p>
      ${p.impactoEsperado ? `<p class="text-[11px] text-[#777] leading-snug line-clamp-2">${p.impactoEsperado}</p>` : ''}
      <div class="flex flex-wrap gap-1 pt-1 border-t border-[#f0f0f0]">
        ${p.equipe ? `<span class="text-[10px] px-1.5 py-0.5 rounded-md bg-[#f0efff] text-[#4a41cc] font-medium truncate max-w-full">${p.equipe}</span>` : ''}
        ${p.solicitante ? `<span class="text-[10px] px-1.5 py-0.5 rounded-md bg-[#f0fdf4] text-[#16a34a] font-medium">${p.solicitante}</span>` : ''}
        ${p.dataLimite ? `<span class="text-[10px] px-1.5 py-0.5 rounded-md font-mono ${vencido ? 'bg-red-100 text-red-700 font-bold' : 'bg-[#f8fafc] text-[#888]'}">📅 ${p.dataLimite}</span>` : ''}
      </div>
    </div>`;
}

// ── Modal ────────────────────────────────────────────────────────────────────

function abrirModalProjeto(id) {
  const projeto = id ? PROJETOS.find(p => p.id === id) : null;
  projetoModalId = id || null;

  const modal = document.getElementById('projeto-modal-overlay');
  const title = document.getElementById('projeto-modal-title');
  if (title) title.textContent = projeto ? `Solicitação #${projeto.id}` : 'Nova Solicitação';

  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val ?? ''; };

  // Auto-detect equipe from current team for new solicitations
  const autoEquipe = !id ? (currentTeam === 'blv' ? 'Bling Loja Virtual' : 'CS Implantação Guiada') : projeto?.equipe;
  const autoSolicitante = !id ? (currentUser?.name || '') : projeto?.solicitante;

  // Include current user name in solicitantes options
  const allSolicitantes = [...new Set([...PROJETOS_SOLICITANTES, currentUser?.name].filter(Boolean))];

  // Preencher selects
  _buildSelect('pm-status', PROJETOS_STATUS, projeto?.status || 'Novo');
  _buildSelect('pm-equipe', ['', ...PROJETOS_EQUIPES], autoEquipe);
  _buildSelect('pm-solicitante', ['', ...allSolicitantes], autoSolicitante);
  _buildSelect('pm-prioridade', ['', ...PROJETOS_PRIORIDADES], projeto?.prioridade);
  _buildSelect('pm-atendida', ['', 'Sim', 'Não'], projeto?.solicitacaoAtendida);

  // For new solicitations: lock equipe and solicitante
  const isAdmin = currentUser?.role === 'admin';
  const equipeEl = document.getElementById('pm-equipe');
  const solicitanteEl = document.getElementById('pm-solicitante');
  if (equipeEl) equipeEl.disabled = !id && !isAdmin;
  if (solicitanteEl) solicitanteEl.disabled = !id;

  set('pm-descricao', projeto?.descricao);
  set('pm-impacto', projeto?.impactoEsperado);
  set('pm-data-limite', projeto?.dataLimite);
  set('pm-sla', projeto?.sla);
  set('pm-duvida', projeto?.duvidaAnalista);
  set('pm-anexo', projeto?.anexo);

  const deleteBtn = document.getElementById('pm-btn-delete');
  if (deleteBtn) deleteBtn.classList.toggle('hidden', !projeto);

  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  document.body.style.overflow = 'hidden';
}

function fecharModalProjeto() {
  const modal = document.getElementById('projeto-modal-overlay');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  document.body.style.overflow = '';
  projetoModalId = null;
}

function _buildSelect(id, options, selected) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = options.map(o => `<option value="${o}" ${o === selected ? 'selected' : ''}>${o || '—'}</option>`).join('');
}

async function salvarProjetoModal(event) {
  if (event) event.preventDefault();
  const get = id => document.getElementById(id)?.value?.trim() ?? '';

  const dados = {
    descricao: get('pm-descricao'),
    impactoEsperado: get('pm-impacto'),
    equipe: get('pm-equipe') || null,
    solicitante: get('pm-solicitante') || null,
    prioridade: get('pm-prioridade') || null,
    dataLimite: get('pm-data-limite') || null,
    status: get('pm-status'),
    solicitacaoAtendida: get('pm-atendida') || null,
    sla: get('pm-sla'),
    duvidaAnalista: get('pm-duvida'),
    anexo: get('pm-anexo'),
  };

  if (!dados.descricao) { alert('Descrição é obrigatória.'); return; }

  const btn = event?.submitter || document.getElementById('pm-btn-save');
  if (btn) { btn.textContent = 'Salvando...'; btn.disabled = true; }

  try {
    let salvo;
    if (projetoModalId) {
      const res = await apiFetch(`/api/projetos/${projetoModalId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      salvo = payload;
      const idx = PROJETOS.findIndex(p => p.id === projetoModalId);
      if (idx !== -1) PROJETOS[idx] = salvo;
    } else {
      const res = await apiFetch('/api/projetos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || `HTTP ${res.status}`);
      salvo = payload;
      PROJETOS.unshift(salvo);
    }
    fecharModalProjeto();
    renderProjetosView();
    if (typeof showToast === 'function') showToast('Solicitação salva com sucesso!', 'success');
  } catch (e) {
    if (typeof showToast === 'function') showToast('Erro ao salvar: ' + e.message, 'error');
    else alert('Erro ao salvar projeto: ' + e.message);
  } finally {
    if (btn) { btn.textContent = 'Salvar'; btn.disabled = false; }
  }
}

async function excluirProjetoModal() {
  if (!projetoModalId) return;
  const projeto = PROJETOS.find(p => p.id === projetoModalId);
  if (!confirm(`Excluir projeto #${projetoModalId}? Esta ação não pode ser desfeita.`)) return;
  await apiFetch(`/api/projetos/${projetoModalId}`, { method: 'DELETE' });
  PROJETOS = PROJETOS.filter(p => p.id !== projetoModalId);
  fecharModalProjeto();
  renderProjetosView();
}

// ── Filters ──────────────────────────────────────────────────────────────────

function onProjetosSearch() { renderProjetosView(); }
function onProjetosFilterChange() { renderProjetosView(); }
