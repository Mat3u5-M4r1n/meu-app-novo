let csvParsedData = null;

function renderSettingsView() {
  const dataset = getActiveClientes();
  const exportBtn = document.getElementById('btn-export-label');
  if (exportBtn) exportBtn.textContent = `Exportar Todos (${dataset.length} registros)`;
  if (currentUser?.role === 'admin') carregarUsuariosBloqueados();
}

// ── Painel de usuários bloqueados (admin only) ────────────────────────────────
async function carregarUsuariosBloqueados() {
  const container = document.getElementById('blocked-users-panel');
  if (!container) return;
  try {
    const res = await apiFetch('/api/auth/blocked-users');
    if (!res.ok) { container.classList.add('hidden'); return; }
    const lista = await res.json();
    if (!lista.length) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    document.getElementById('blocked-users-list').innerHTML = lista.map(u => `
      <div class="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-100">
        <div class="min-w-0">
          <p class="text-xs font-bold text-rose-800 truncate">${u.email}</p>
          <p class="text-[11px] text-rose-500 mt-0.5">Bloqueado em ${u.bloqueado_em ? new Date(u.bloqueado_em).toLocaleString('pt-BR') : '—'}</p>
        </div>
        <button onclick="desbloquearUsuario('${u.email}', this)"
          class="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer">
          Liberar Acesso
        </button>
      </div>`).join('');
  } catch {
    container.classList.add('hidden');
  }
}

async function desbloquearUsuario(email, btn) {
  btn.disabled = true; btn.textContent = 'Aguarde…';
  try {
    const res = await apiFetch('/api/auth/unblock', {
      method: 'POST', body: JSON.stringify({ email })
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    showToast(`✅ Acesso liberado para ${email}`, 'success');
    await carregarUsuariosBloqueados();
  } catch (e) {
    showToast(`Erro: ${e.message}`, 'error');
    btn.disabled = false; btn.textContent = 'Liberar Acesso';
  }
}

// --- CSV Export ---
function exportClientesToCSVHandler() {
  const dataset = getActiveClientes();
  if (!dataset.length) { alert('Nenhum dado para exportar.'); return; }
  const allKeys = new Set();
  dataset.forEach(c => Object.keys(c).forEach(k => { if (k !== 'notas') allKeys.add(k); }));
  const cols = [...allKeys];
  const escape = val => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const header = cols.map(escape).join(',');
  const rows = dataset.map(c => cols.map(k => escape(c[k])).join(','));
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clientes_${currentTeam}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// --- CSV Import ---
function handleCSVFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      if (!results.data.length) { alert('Arquivo CSV vazio ou inválido.'); return; }
      csvParsedData = results.data;
      const preview = document.getElementById('csv-preview-container');
      const countEl = document.getElementById('lbl-preview-rows-count');
      if (countEl) countEl.textContent = `${results.data.length} linhas identificadas`;
      if (preview) preview.classList.remove('hidden');
      const cols = Object.keys(results.data[0]).slice(0, 6);
      const thead = document.getElementById('tbl-csv-preview-head');
      const tbody = document.getElementById('tbl-csv-preview-body');
      if (thead) thead.innerHTML = `<tr>${cols.map(c => `<th class="px-2 py-1 text-left">${c}</th>`).join('')}</tr>`;
      if (tbody) tbody.innerHTML = results.data.slice(0, 3).map(r => `<tr>${cols.map(c => `<td class="px-2 py-1 text-[#555] truncate max-w-[120px]">${r[c] || ''}</td>`).join('')}</tr>`).join('');
    },
    error: () => alert('Erro ao ler o arquivo CSV.')
  });
  e.target.value = '';
}

async function confirmImportHandler() {
  if (!csvParsedData?.length) return;
  const toInt = v => { const n = parseInt(String(v || '').replace(/\D/g,'')); return isNaN(n) ? 0 : n; };
  const toFloat = v => parseFloat(String(v || '0').replace(',', '.')) || 0;

  const novos = csvParsedData.map((row, i) => ({
    id: toInt(row.id) || (Date.now() + i),
    empresa: row.empresa || '',
    cnpj: row.cnpj || '',
    nomeContato: row.nomeContato || '',
    cidade: row.cidade || '',
    estado: row.estado || '',
    cidadeEstado: row.cidadeEstado || [row.cidade, row.estado].filter(Boolean).join(' - '),
    status: row.status || 'Agendada',
    agenda: row.agenda || '',
    implantador: row.implantador || '',
    igAgendada: row.igAgendada || '',
    igComprada: row.igComprada || '',
    igRealizada: row.igRealizada || '',
    whatsapp: row.whatsapp || '',
    emailDaEmpresa: row.emailDaEmpresa || '',
    emailDaAgenda: row.emailDaAgenda || '',
    plano: row.plano || '',
    valorIG: toFloat(row.valorIG),
    topEspecialista: String(row.topEspecialista).toLowerCase() === 'true' || row.topEspecialista === '1',
    cupom: row.cupom || '',
    linkMeet: row.linkMeet || '',
    linkGravacao1: row.linkGravacao1 || '',
    linkGravacao2: row.linkGravacao2 || '',
    linkAnotacoes1: row.linkAnotacoes1 || '',
    linkAnotacoes2: row.linkAnotacoes2 || '',
    informacoesPre: row.informacoesPre || '',
    informacoesPos: row.informacoesPos || '',
    integracao: row.integracao || '',
    logistica: row.logistica || '',
    qtdReagendamento: toInt(row.qtdReagendamento),
    tipoReagenda: row.tipoReagenda || '',
    motivoReagendamento: row.motivoReagendamento || '',
    motivoEstorno: row.motivoEstorno || '',
    ticketEstorno: row.ticketEstorno || '',
    descricaoDoEstorno: row.descricaoDoEstorno || '',
    origem: row.origem || '',
    time: row.time || '',
    responsavel: row.responsavel || '',
    linkConexao: row.linkConexao || '',
    descricaoConexao: row.descricaoConexao || '',
    conversaOcta: row.conversaOcta || '',
    idEmpresa: row.idEmpresa || '',
    idMoskit: row.idMoskit || '',
    situacaoDaConta: row.situacaoDaConta || '',
    regimeTributario: row.regimeTributario || '',
    criacaoDaAgenda: row.criacaoDaAgenda || '',
    enviadoPor: row.enviadoPor || '',
    reagendamentoPor: row.reagendamentoPor || '',
    tempoReagenda: row.tempoReagenda || '',
    diasAtualizado: row.diasAtualizado || new Date().toISOString().slice(0,10),
    notas: []
  }));

  try {
    const base = getActiveApiBase();
    const res = await apiFetch(`${base}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novos)
    });
    const result = await res.json();
    if (currentTeam === 'blv') { CLIENTES_BLV = result; } else { CLIENTES = result; }
    document.getElementById('csv-preview-container')?.classList.add('hidden');
    csvParsedData = null;
    renderSettingsView();
    updateFooterStats();
    updateSidebarStats();
    alert(`Importação concluída! ${novos.length} registros importados com sucesso.`);
  } catch {
    alert('Erro ao importar dados. Verifique a conexão com o servidor.');
  }
}

async function resetDataHandler() {
  if (!confirm('Restaurar a base de dados padrão? Todos os dados atuais serão perdidos.')) return;
  try {
    const res = await apiFetch('/api/clientes/reset', { method: 'POST' });
    CLIENTES = await res.json();
    renderSettingsView();
    renderCurrentActiveView();
    updateFooterStats();
    updateSidebarStats();
    alert('Base restaurada com sucesso!');
  } catch {
    alert('Erro ao restaurar a base. Reinicie o servidor.');
  }
}

async function carregarClientesBLVHandler() {
  try {
    await carregarClientesBLV();
    renderSettingsView();
    renderCurrentActiveView();
    updateFooterStats();
    updateSidebarStats();
  } catch {
    alert('Erro ao carregar dados BLV.');
  }
}
