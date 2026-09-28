let modalClienteId = null;
let modalActiveTab = 'contato';

// Campos preenchidos automaticamente pelo Jestor — bloqueados para edição no time IG
const IG_AUTO_FIELD_IDS = [
  // Aba Contato
  'inp-modal-empresa', 'inp-modal-nomeContato', 'inp-modal-cnpj', 'inp-modal-whatsapp',
  'inp-modal-emailDaEmpresa', 'inp-modal-emailDaAgenda', 'inp-modal-cidade', 'inp-modal-estado',
  'inp-modal-plano', 'inp-modal-situacaoDaConta', 'inp-modal-regimeTributario',
  'inp-modal-valorIG', 'inp-modal-cupom', 'inp-modal-dataInscricao',
  // Aba Implantação
  'inp-modal-igComprada', 'inp-modal-linkParaAgendar', 'inp-modal-agenda',
  'inp-modal-enviadoPor', 'inp-modal-linkMeet',
  // Aba Pré/Pós
  'inp-modal-informacoesPos',
  // Aba Reagenda/Estorno
  'inp-modal-linkReagenda', 'inp-modal-qtdReagendamento',
];

function aplicarBloqueiosIG(aplicar) {
  IG_AUTO_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (aplicar) {
      if (el.tagName === 'SELECT') {
        el.setAttribute('disabled', '');
      } else {
        el.setAttribute('readonly', '');
      }
      el.classList.add('field-auto');
    } else {
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
      el.classList.remove('field-auto');
    }
  });
}

function abrirModalCliente(id) {
  const cliente = getActiveClientes().find(c => c.id === id);
  if (!cliente) return;
  modalClienteId = id;
  applyTeamToModal();
  preencherFormulario(cliente);
  // Restore delete/save state for editing
  const excluir = document.getElementById('btn-modal-excluir');
  const salvar = document.getElementById('btn-modal-salvar');
  if (excluir) excluir.classList.remove('hidden');
  if (salvar) salvar.textContent = 'Salvar Alterações';
  // Unified timeline — fetches notes from both teams via CNPJ
  if (cliente.cnpj) {
    carregarTimelineUnificada(cliente.cnpj);
  } else {
    renderTimeline(cliente);
  }
  switchModalTab('contato');
  const overlay = document.getElementById('card-modal-overlay');
  if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); }
  document.body.style.overflow = 'hidden';
}

function fecharModalCliente() {
  const overlay = document.getElementById('card-modal-overlay');
  if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
  document.body.style.overflow = '';
  modalClienteId = null;
}

const HIDDEN_TABS = ['conexoes', 'cross'];

function switchModalTab(tab) {
  modalActiveTab = tab;
  const tabs = ['contato', 'implantacao', 'pre_pos', 'reagenda_estorno', 'conexoes', 'cross'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const content = document.getElementById(`modal-tab-content-${t}`);
    if (btn) {
      if (HIDDEN_TABS.includes(t)) { btn.classList.add('hidden'); return; }
      if (t === tab) { btn.classList.add('active', 'bg-white', 'text-[#002726]', 'shadow-xs'); btn.classList.remove('text-[#555]'); }
      else { btn.classList.remove('active', 'bg-white', 'text-[#002726]', 'shadow-xs'); btn.classList.add('text-[#555]'); }
    }
    if (content) content.classList.toggle('hidden', t !== tab);
  });
  // Lazy-load cross-team data on first open
  if (tab === 'cross' && modalClienteId) {
    const cliente = getActiveClientes().find(c => c.id === modalClienteId);
    if (cliente?.cnpj) carregarCrossTeamData(cliente.cnpj);
  }
}

function preencherFormulario(c) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
  const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = Boolean(val); };

  // Header
  const title = document.getElementById('modal-company-title');
  const statusBadge = document.getElementById('lbl-modal-status-badge');
  const igBadge = document.getElementById('lbl-modal-ig-badge');
  const initials = document.getElementById('modal-company-initials');
  const topBadge = document.getElementById('badge-modal-top-especialista');
  if (title) title.textContent = c.empresa || 'Cliente';
  if (initials) initials.textContent = (c.empresa || 'BL').substring(0, 2).toUpperCase();

  if (currentTeam === 'blv') {
    if (statusBadge) statusBadge.textContent = `Fase: ${c.fase || '-'}`;
    if (igBadge) igBadge.classList.add('hidden');
    if (topBadge) topBadge.classList.add('hidden');
  } else {
    if (statusBadge) statusBadge.textContent = `Status: ${c.status || '-'}`;
    if (igBadge) { igBadge.classList.remove('hidden'); igBadge.textContent = c.igAgendada || '-'; }
    if (topBadge) topBadge.classList.toggle('hidden', !c.topEspecialista);
  }

  // Badge IDs
  const badgeId = document.getElementById('badge-txt-id');
  const badgeCnpj = document.getElementById('badge-txt-cnpj');
  const badgeIdEmpresa = document.getElementById('badge-txt-idEmpresa');
  const badgeIdMoskit = document.getElementById('badge-txt-idMoskit');
  if (badgeId) badgeId.textContent = c.id || '-';
  if (badgeCnpj) badgeCnpj.textContent = formatCNPJ(c.cnpj) || '-';
  if (badgeIdEmpresa) badgeIdEmpresa.textContent = c.idEmpresa || '-';
  if (badgeIdMoskit) badgeIdMoskit.textContent = c.idMoskit || '-';

  // Action buttons
  const waBtn = document.getElementById('btn-modal-wa-action');
  const meetBtn = document.getElementById('btn-modal-meet-action');
  const octaBtn = document.getElementById('btn-modal-octa-action');
  if (currentTeam === 'blv') {
    if (waBtn) waBtn.href = 'https://app.octadesk.com/chat';
    if (meetBtn) meetBtn.classList.add('hidden');
    if (octaBtn) {
      if (c.conversaOctadesk) {
        octaBtn.href = c.conversaOctadesk;
        octaBtn.classList.remove('hidden');
      } else {
        octaBtn.classList.add('hidden');
      }
    }
  } else {
    if (waBtn) waBtn.href = c.whatsapp ? `https://wa.me/55${c.whatsapp.replace(/\D/g, '')}` : '#';
    if (meetBtn) { meetBtn.classList.remove('hidden'); meetBtn.href = c.linkMeet || '#'; }
    if (octaBtn) {
      if (c.conversaOcta) {
        octaBtn.href = c.conversaOcta;
        octaBtn.classList.remove('hidden');
      } else {
        octaBtn.classList.add('hidden');
      }
    }
  }

  if (currentTeam === 'blv') {
    // BLV Aba Contato
    set('inp-modal-empresa', c.empresa);
    set('inp-modal-nomeDoContato-blv', c.nomeDoContato);
    set('inp-modal-cnpj', c.cnpj);
    set('inp-modal-telefone-blv', c.telefone);
    set('inp-modal-site-blv', c.site);
    set('inp-modal-cargoDoContato-blv', c.cargoDoContato);
    set('inp-modal-emailDaEmpresa', c.emailDaEmpresa);
    set('inp-modal-emailDaAgenda', c.emailDaAgenda);
    set('inp-modal-cidade', c.cidade);
    set('inp-modal-estado', c.estado);
    set('inp-modal-plano', c.plano);

    // BLV Aba Implantação — repurpose shared selects
    const faseSel = document.getElementById('inp-modal-status');
    if (faseSel) faseSel.innerHTML = BLV_STATUS_LIST.map(s => `<option value="${s}" ${c.fase === s ? 'selected' : ''}>${s}</option>`).join('');
    const respSel = document.getElementById('inp-modal-implantador');
    if (respSel) respSel.innerHTML = `<option value="">Sem responsável</option>` + BLV_IMPLANTADORES_LIST.map(i => `<option value="${i}" ${c.responsavel === i ? 'selected' : ''}>${i.split('@')[0]}</option>`).join('');
    set('inp-modal-agenda', c.diaImplantacao);
    set('inp-modal-conversaOctadesk-blv', c.conversaOctadesk);
    set('inp-modal-origem-blv', c.origem);

    // BLV Aba Pré/Pós
    set('inp-modal-informacoesPre', c.informacoesPre);
    set('inp-modal-informacoesPos', c.informacoesPos);

  } else {
    // IG Aba Contato
    set('inp-modal-empresa', c.empresa);
    set('inp-modal-nomeContato', c.nomeContato);
    set('inp-modal-cnpj', c.cnpj);
    set('inp-modal-whatsapp', c.whatsapp);
    set('inp-modal-emailDaEmpresa', c.emailDaEmpresa);
    set('inp-modal-emailDaAgenda', c.emailDaAgenda);
    set('inp-modal-cidade', c.cidade);
    set('inp-modal-estado', c.estado);
    set('inp-modal-plano', c.plano);
    set('inp-modal-situacaoDaConta', c.situacaoDaConta);
    set('inp-modal-regimeTributario', c.regimeTributario);
    set('inp-modal-valorIG', c.valorIG);
    set('inp-modal-cupom', c.cupom);

    // IG Aba Implantação
    const statusSel = document.getElementById('inp-modal-status');
    if (statusSel) statusSel.innerHTML = STATUS_LIST.map(s => `<option value="${s}" ${c.status === s ? 'selected' : ''}>${s}</option>`).join('');
    const implSel = document.getElementById('inp-modal-implantador');
    if (implSel) implSel.innerHTML = `<option value="">Sem implantador</option>` + IMPLANTADORES_LIST.map(i => `<option value="${i}" ${c.implantador === i ? 'selected' : ''}>${i.split('@')[0]}</option>`).join('');
    const igCompSel = document.getElementById('inp-modal-igComprada');
    if (igCompSel) igCompSel.innerHTML = `<option value="">—</option>` + TIPOS_IG_LIST.map(t => `<option value="${t}" ${c.igComprada === t ? 'selected' : ''}>${t}</option>`).join('');
    const igAgSel = document.getElementById('inp-modal-igAgendada');
    if (igAgSel) igAgSel.innerHTML = `<option value="">—</option>` + TIPOS_IG_LIST.map(t => `<option value="${t}" ${c.igAgendada === t ? 'selected' : ''}>${t}</option>`).join('');
    set('inp-modal-agenda', c.agenda);
    set('inp-modal-enviadoPor', c.enviadoPor);
    set('inp-modal-conversaOcta', c.conversaOcta);
    set('inp-modal-linkParaAgendar', c.linkParaAgendar);
    set('inp-modal-linkMeet', c.linkMeet);

    // IG Aba Pré/Pós
    set('inp-modal-informacoesPre', c.informacoesPre);
    const igRealSel = document.getElementById('inp-modal-igRealizada');
    if (igRealSel) igRealSel.innerHTML = `<option value="">—</option>` + TIPOS_IG_LIST.map(t => `<option value="${t}" ${c.igRealizada === t ? 'selected' : ''}>${t}</option>`).join('');
    set('inp-modal-informacoesPos', c.informacoesPos);
    setChk('inp-modal-topEspecialista', c.topEspecialista);
    set('inp-modal-integracao', c.integracao);
    set('inp-modal-logistica', c.logistica);
    set('inp-modal-linkGravacao1', c.linkGravacao1);
    set('inp-modal-linkGravacao2', c.linkGravacao2);
    set('inp-modal-linkAnotacoes1', c.linkAnotacoes1);
    set('inp-modal-linkAnotacoes2', c.linkAnotacoes2);

    // IG Aba Reagenda/Estorno
    const tipoReagSel = document.getElementById('inp-modal-tipoReagenda');
    if (tipoReagSel) tipoReagSel.innerHTML = `<option value="">—</option>` + TIPOS_REAGENDA_LIST.map(t => `<option value="${t}" ${c.tipoReagenda === t ? 'selected' : ''}>${t}</option>`).join('');
    set('inp-modal-tempoReagenda', c.tempoReagenda);
    set('inp-modal-qtdReagendamento', c.qtdReagendamento);
    const motivoEstSel = document.getElementById('inp-modal-motivoEstorno');
    if (motivoEstSel) motivoEstSel.innerHTML = `<option value="">—</option>` + MOTIVOS_ESTORNO_LIST.map(t => `<option value="${t}" ${c.motivoEstorno === t ? 'selected' : ''}>${t}</option>`).join('');
    set('inp-modal-ticketEstorno', c.ticketEstorno);
    set('inp-modal-descricaoDoEstorno', c.descricaoDoEstorno);

    // IG Aba Conexões
    set('inp-modal-origem', c.origem);
    set('inp-modal-time', c.time);
    set('inp-modal-responsavel', c.responsavel);
    set('inp-modal-linkConexao', c.linkConexao);
    set('inp-modal-descricaoConexao', c.descricaoConexao);
  }

  // Aplicar/remover bloqueio de campos automáticos (apenas IG)
  aplicarBloqueiosIG(currentTeam === 'ig');

  // Metadados (collapsible)
  const metaCriacao = document.getElementById('meta-txt-criacaoDaAgenda');
  const metaDiasAt = document.getElementById('meta-txt-diasAtualizado');
  if (metaCriacao) metaCriacao.textContent = c.criacaoDaAgenda || '-';
  if (metaDiasAt) metaDiasAt.textContent = c.diasAtualizado || '-';

  // Datas visíveis no tab Contato
  const contatoCriadoEm = document.getElementById('contato-txt-criadoEm');
  const contatoAtualizado = document.getElementById('contato-txt-diasAtualizado');
  if (contatoCriadoEm) {
    contatoCriadoEm.textContent = c.criadoEm
      ? new Date(c.criadoEm).toLocaleDateString('pt-BR')
      : '—';
  }
  if (contatoAtualizado) {
    contatoAtualizado.textContent = c.diasAtualizado || '—';
  }
}

function coletarFormulario() {
  const get = id => document.getElementById(id)?.value?.trim() ?? '';
  const getChk = id => document.getElementById(id)?.checked ?? false;

  if (currentTeam === 'blv') {
    return {
      empresa: get('inp-modal-empresa'),
      nomeDoContato: get('inp-modal-nomeDoContato-blv'),
      cnpj: get('inp-modal-cnpj'),
      telefone: get('inp-modal-telefone-blv'),
      site: get('inp-modal-site-blv'),
      cargoDoContato: get('inp-modal-cargoDoContato-blv'),
      fase: get('inp-modal-status'),
      responsavel: get('inp-modal-implantador'),
      diaImplantacao: get('inp-modal-agenda'),
      conversaOctadesk: get('inp-modal-conversaOctadesk-blv'),
      origem: get('inp-modal-origem-blv'),
      informacoesPre: get('inp-modal-informacoesPre'),
      informacoesPos: get('inp-modal-informacoesPos'),
    };
  }

  return {
    empresa: get('inp-modal-empresa'),
    nomeContato: get('inp-modal-nomeContato'),
    cnpj: get('inp-modal-cnpj'),
    whatsapp: get('inp-modal-whatsapp'),
    emailDaEmpresa: get('inp-modal-emailDaEmpresa'),
    emailDaAgenda: get('inp-modal-emailDaAgenda'),
    cidade: get('inp-modal-cidade'),
    estado: get('inp-modal-estado'),
    plano: get('inp-modal-plano'),
    valorIG: parseFloat(get('inp-modal-valorIG')) || 0,
    cupom: get('inp-modal-cupom'),
    situacaoDaConta: get('inp-modal-situacaoDaConta'),
    regimeTributario: get('inp-modal-regimeTributario'),
    status: get('inp-modal-status'),
    igAgendada: get('inp-modal-igAgendada'),
    igComprada: get('inp-modal-igComprada'),
    igRealizada: get('inp-modal-igRealizada'),
    implantador: get('inp-modal-implantador'),
    linkParaAgendar: get('inp-modal-linkParaAgendar'),
    agenda: get('inp-modal-agenda'),
    enviadoPor: get('inp-modal-enviadoPor'),
    conversaOcta: get('inp-modal-conversaOcta'),
    linkMeet: get('inp-modal-linkMeet'),
    informacoesPre: get('inp-modal-informacoesPre'),
    informacoesPos: get('inp-modal-informacoesPos'),
    topEspecialista: getChk('inp-modal-topEspecialista'),
    integracao: get('inp-modal-integracao'),
    logistica: get('inp-modal-logistica'),
    linkGravacao1: get('inp-modal-linkGravacao1'),
    linkAnotacoes1: get('inp-modal-linkAnotacoes1'),
    tipoReagenda: get('inp-modal-tipoReagenda'),
    tempoReagenda: get('inp-modal-tempoReagenda'),
    qtdReagendamento: parseInt(get('inp-modal-qtdReagendamento')) || 0,
    motivoEstorno: get('inp-modal-motivoEstorno'),
    ticketEstorno: get('inp-modal-ticketEstorno'),
    descricaoDoEstorno: get('inp-modal-descricaoDoEstorno'),
    origem: get('inp-modal-origem'),
    time: get('inp-modal-time'),
    responsavel: get('inp-modal-responsavel'),
    linkConexao: get('inp-modal-linkConexao'),
    descricaoConexao: get('inp-modal-descricaoConexao'),
    diasAtualizado: new Date().toISOString().slice(0, 10),
  };
}

async function salvarClienteFormModal(event) {
  if (event) event.preventDefault();
  const dados = coletarFormulario();
  const btn = event?.submitter || document.getElementById('btn-modal-salvar');
  const originalText = btn?.textContent || 'Salvar';
  if (btn) { btn.textContent = 'Salvando...'; btn.disabled = true; }
  try {
    if (modalClienteId) {
      // UPDATE existing client
      const cliente = getActiveClientes().find(c => c.id === modalClienteId);
      if (!cliente) return;
      const salvo = await apiSalvarCliente({ ...cliente, ...dados });
      // Refresh modal in place with updated data (shows auto-filled fields + new timeline entries)
      preencherFormulario(salvo);
      if (salvo.cnpj) carregarTimelineUnificada(salvo.cnpj);
      showToast('Salvo com sucesso!', 'success');
      renderCurrentActiveView();
      updateFooterStats();
      updateSidebarStats();
    } else {
      // CREATE new client
      await apiCriarCliente(dados);
      fecharModalCliente();
      renderCurrentActiveView();
      updateFooterStats();
      updateSidebarStats();
    }
  } catch (e) {
    showToast('Erro ao salvar: ' + (e.message || 'Verifique os campos e tente novamente.'), 'error');
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

async function confirmarExclusaoClienteModal() {
  if (!modalClienteId) return;
  const cliente = getActiveClientes().find(c => c.id === modalClienteId);
  if (!cliente) return;
  if (!confirm(`Excluir "${cliente.empresa}"? Esta ação não pode ser desfeita.`)) return;
  await apiExcluirCliente(modalClienteId);
  fecharModalCliente();
  renderCurrentActiveView();
  updateFooterStats();
  updateSidebarStats();
}

let currentTimelineFilter = 'all';
let _allTimelineRegistros = [];

function renderTimeline(cliente) {
  if (cliente.cnpj) {
    carregarTimelineUnificada(cliente.cnpj);
  } else {
    const countEl = document.getElementById('lbl-timeline-notes-count');
    if (countEl) countEl.textContent = '0 registros';
    _allTimelineRegistros = [];
    _renderNotasUI([]);
  }
}

async function carregarTimelineUnificada(cnpj) {
  const countEl = document.getElementById('lbl-timeline-notes-count');
  if (countEl) countEl.textContent = 'Carregando...';
  try {
    const res = await apiFetch(`/api/historico-timeline/${encodeURIComponent(cnpj)}`);
    if (!res.ok) throw new Error();
    _allTimelineRegistros = await res.json();
    _applyTimelineFilter();
  } catch {
    if (countEl) countEl.textContent = '0 registros';
    _allTimelineRegistros = [];
    _renderNotasUI([]);
  }
}

function setTimelineFilter(filter) {
  currentTimelineFilter = filter;
  // Update button styles
  ['all','ig','blv'].forEach(f => {
    const btn = document.getElementById(`tl-filter-${f}`);
    if (!btn) return;
    if (f === filter) {
      btn.className = btn.className.replace('bg-white text-[#555]', 'bg-[#002726] text-[#93F574]');
      btn.classList.remove('bg-white','text-[#555]');
      btn.classList.add('bg-[#002726]','text-[#93F574]');
    } else {
      btn.classList.remove('bg-[#002726]','text-[#93F574]');
      btn.classList.add('bg-white','text-[#555]');
    }
  });
  _applyTimelineFilter();
}

function _applyTimelineFilter() {
  const countEl = document.getElementById('lbl-timeline-notes-count');
  const dateFilter = document.getElementById('tl-filter-date')?.value || '';

  let lista = _allTimelineRegistros;

  if (currentTimelineFilter !== 'all') {
    lista = lista.filter(r => (r.timeOrigem || r._source) === currentTimelineFilter);
  }

  if (dateFilter) {
    lista = lista.filter(r => {
      const d = r.criadoEm || r.data || '';
      return d.startsWith(dateFilter);
    });
  }

  if (countEl) countEl.textContent = `${lista.length} registro${lista.length !== 1 ? 's' : ''}`;
  _renderNotasUI(lista);
}

function _renderNotasUI(registros) {
  const container = document.getElementById('list-timeline-notes');
  if (!container) return;
  if (!registros.length) {
    container.innerHTML = `<div class="text-center text-xs text-[#aaa] py-6">Nenhuma nota registrada</div>`;
    return;
  }
  const TEAM_BADGE = {
    ig:  { label: 'IG',  bg: '#e6f9ee', text: '#005c39' },
    blv: { label: 'BLV', bg: '#ede9ff', text: '#4a41cc' }
  };

  // Group by date
  const groups = {};
  registros.forEach(r => {
    const raw = r.criadoEm || r.data || '';
    const day = raw ? raw.slice(0, 10) : 'sem-data';
    if (!groups[day]) groups[day] = [];
    groups[day].push(r);
  });

  const formatDay = iso => {
    if (iso === 'sem-data') return 'Sem data';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };

  container.innerHTML = Object.entries(groups).map(([day, items]) => {
    const entriesHtml = items.map(r => {
      const timeOrigem = r.timeOrigem || r._source || null;
      const badge = timeOrigem ? TEAM_BADGE[timeOrigem] : null;
      const autor = r.criadoPor || r.autor || 'Sistema';
      const texto = r.mensagem || r.texto || '';
      const hora = r.criadoEm ? new Date(r.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
      const linkAnexo = r.linkAnexo || null;
      const nomeAnexo = r.nomeAnexo || 'Anexo';

      return `
      <div class="flex gap-2.5 py-2.5 border-b border-[#f4f4f4] last:border-0">
        <div class="w-6 h-6 rounded-full bg-[#002726]/10 flex items-center justify-center text-[10px] font-bold text-[#002726] shrink-0 mt-0.5">
          ${autor.charAt(0).toUpperCase()}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1 flex-wrap">
            <span class="text-[10px] font-bold text-[#002726]">${autor}</span>
            ${hora ? `<span class="text-[9px] text-[#bbb] font-mono">${hora}</span>` : ''}
            ${badge ? `<span class="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style="background:${badge.bg};color:${badge.text}">${badge.label}</span>` : ''}
          </div>
          <p class="text-xs text-[#555] leading-relaxed whitespace-pre-wrap break-words">${texto}</p>
          ${linkAnexo ? `<a href="${linkAnexo}" target="_blank" rel="noopener noreferrer"
              class="mt-1.5 inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg font-semibold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors max-w-full">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
              <span class="truncate">${nomeAnexo}</span>
            </a>` : ''}
        </div>
      </div>`;
    }).join('');

    return `
    <div class="mb-3">
      <div class="flex items-center gap-2 mb-2 sticky top-0 bg-[#fcfcfc] py-1 z-10">
        <span class="text-[10px] font-bold text-[#888] uppercase tracking-wide">${formatDay(day)}</span>
        <div class="flex-1 h-px bg-[#eee]"></div>
        <span class="text-[9px] text-[#bbb]">${items.length} entrada${items.length !== 1 ? 's' : ''}</span>
      </div>
      ${entriesHtml}
    </div>`;
  }).join('');
}

function toggleAnexoTimeline() {
  const row = document.getElementById('timeline-anexo-row');
  const btn = document.getElementById('btn-anexo-timeline');
  if (!row) return;
  const aberto = !row.classList.contains('hidden');
  row.classList.toggle('hidden', aberto);
  btn?.classList.toggle('text-[#7F76FF]', !aberto);
  btn?.classList.toggle('border-[#7F76FF]', !aberto);
  if (aberto) {
    const linkEl = document.getElementById('inp-nota-link-anexo');
    const nomeEl = document.getElementById('inp-nota-nome-anexo');
    if (linkEl) linkEl.value = '';
    if (nomeEl) nomeEl.value = '';
  } else {
    // Focar no nome ao abrir
    setTimeout(() => document.getElementById('inp-nota-nome-anexo')?.focus(), 50);
  }
}

async function carregarCrossTeamData(cnpj) {
  const container = document.getElementById('cross-team-data-container');
  if (!container) return;
  container.innerHTML = `<div class="py-8 text-center text-sm text-[#aaa]">Carregando...</div>`;
  try {
    const res = await apiFetch(`/api/cross-lookup/${encodeURIComponent(cnpj)}`);
    if (!res.ok) throw new Error();
    const { ig, blv } = await res.json();
    const other = currentTeam === 'ig' ? blv : ig;
    const otherLabel = currentTeam === 'ig' ? 'Bling Loja Virtual' : 'Implantação Guiada';
    const badgeStyle = currentTeam === 'ig'
      ? 'background:#7F76FF;color:#fff'
      : 'background:#93F574;color:#002726';
    const badgeIcon = currentTeam === 'ig' ? '🛒' : '🚀';

    if (!other) {
      container.innerHTML = `
        <div class="py-10 text-center">
          <p class="text-sm font-semibold text-[#aaa]">Nenhum registro encontrado</p>
          <p class="text-xs text-[#bbb] mt-1">CNPJ não localizado no time <strong>${otherLabel}</strong></p>
        </div>`;
      return;
    }

    const rows = currentTeam === 'ig'
      ? [
          ['Fase', other.fase], ['Responsável', other.responsavel?.split('@')[0]],
          ['Dia da Implantação', other.diaImplantacao], ['Contato', other.nomeDoContato],
          ['Telefone', other.telefone], ['Plano', other.plano], ['Origem', other.origem]
        ]
      : [
          ['Status', other.status], ['Implantador', other.implantador?.split('@')[0]],
          ['IG Agendada', other.igAgendada], ['IG Realizada', other.igRealizada],
          ['Agenda', other.agenda], ['Plano', other.plano], ['Contato', other.nomeContato]
        ];

    const fieldsHtml = rows
      .filter(([, v]) => v)
      .map(([label, value]) => `
        <div class="p-2.5 bg-[#f9f9f9] rounded-xl border border-[#eee]">
          <p class="text-[10px] font-bold text-[#888] mb-0.5">${label}</p>
          <p class="text-xs font-semibold text-[#333]">${value}</p>
        </div>`).join('');

    container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold" style="${badgeStyle}">${badgeIcon} ${otherLabel}</span>
          <span class="text-xs text-[#888] font-mono">ID #${other.id}</span>
        </div>
        <div class="grid grid-cols-2 gap-2.5">${fieldsHtml || '<p class="col-span-2 text-xs text-[#aaa]">Sem dados adicionais</p>'}</div>
        ${other.informacoesPre ? `<div class="p-3 bg-[#f9f9f9] rounded-xl border border-[#eee]"><p class="text-[10px] font-bold text-[#888] mb-1">Informações Pré</p><p class="text-xs text-[#555] whitespace-pre-wrap">${other.informacoesPre}</p></div>` : ''}
        ${other.informacoesPos ? `<div class="p-3 bg-[#f9f9f9] rounded-xl border border-[#eee]"><p class="text-[10px] font-bold text-[#888] mb-1">Informações Pós</p><p class="text-xs text-[#555] whitespace-pre-wrap">${other.informacoesPos}</p></div>` : ''}
      </div>`;
  } catch {
    container.innerHTML = `<div class="py-8 text-center text-sm text-rose-400">Erro ao carregar dados do outro time.</div>`;
  }
}

async function adicionarNotaTimelineHandler() {
  if (!modalClienteId) return;
  const cliente = getActiveClientes().find(c => c.id === modalClienteId);
  if (!cliente?.cnpj) return;

  const input = document.getElementById('inp-nova-nota-timeline');
  const mensagem = input?.value?.trim();
  if (!mensagem) return;

  const linkAnexo = document.getElementById('inp-nota-link-anexo')?.value?.trim() || null;
  const nomeAnexo = document.getElementById('inp-nota-nome-anexo')?.value?.trim() || null;

  try {
    const res = await apiFetch('/api/historico-timeline', {
      method: 'POST',
      body: JSON.stringify({
        cnpj: cliente.cnpj,
        mensagem,
        linkAnexo,
        nomeAnexo: linkAnexo ? (nomeAnexo || 'Anexo') : null,
        timeOrigem: currentTeam
      })
    });
    if (!res.ok) throw new Error('Erro ao salvar');
    if (input) input.value = '';
    // Fechar e limpar campos de anexo
    const nomeEl = document.getElementById('inp-nota-nome-anexo');
    if (nomeEl) nomeEl.value = '';
    const anexoRow = document.getElementById('timeline-anexo-row');
    if (anexoRow && !anexoRow.classList.contains('hidden')) toggleAnexoTimeline();
    carregarTimelineUnificada(cliente.cnpj);
  } catch (e) {
    console.error('Erro ao adicionar nota:', e);
  }
}

function gerarAgendaModalHandler() {
  if (!modalClienteId) return;
  const cliente = getActiveClientes().find(c => c.id === modalClienteId);
  if (!cliente) return;
  const implantador = document.getElementById('inp-modal-implantador')?.value || cliente.implantador;
  const igAgendada = document.getElementById('inp-modal-igAgendada')?.value || cliente.igAgendada;
  const link = gerarLinkAgenda(implantador, igAgendada, cliente.id);
  const input = document.getElementById('inp-modal-linkParaAgendar');
  if (input) { input.value = link; }
}

function copyModalField(field) {
  const el = document.getElementById(`badge-txt-${field}`);
  const text = el?.textContent?.trim();
  if (!text || text === '-') return;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') showToast(`Copiado: ${text}`, 'success');
  }).catch(() => {});
}

function enviarReagendaModalHandler() {
  if (!modalClienteId) return;
  const cliente = getActiveClientes().find(c => c.id === modalClienteId);
  if (!cliente) return;
  const link = gerarLinkAgenda(cliente.implantador, cliente.igAgendada, cliente.id);
  const linkInput = document.getElementById('inp-modal-linkReagenda');
  const qtdInput = document.getElementById('inp-modal-qtdReagendamento');
  if (linkInput) linkInput.value = link;
  if (qtdInput) qtdInput.value = (parseInt(qtdInput.value) || 0) + 1;
  if (cliente.whatsapp) {
    const waMsg = `Olá! Segue o link para reagendar sua IG: ${link}`;
    window.open(`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
  } else {
    navigator.clipboard.writeText(link).catch(() => {});
    alert(`Link copiado!\n${link}`);
  }
}

// Fechar modal ao clicar no backdrop ou Escape
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('card-modal-overlay');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) fecharModalCliente(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { fecharModalCliente(); fecharModalAtividade(); fecharModalProjeto(); fecharDisparoWhatsModal(); } });
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') {
      const input = document.getElementById('inp-nova-nota-timeline');
      if (document.activeElement === input) adicionarNotaTimelineHandler();
    }
  });
});
