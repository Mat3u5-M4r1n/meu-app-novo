function renderMetricsView() {
  if (currentTeam === 'blv') { renderMetricsViewBLV(); return; }

  const dataset = CLIENTES;
  const el = id => document.getElementById(id);

  const total = dataset.length;
  const concluidos = dataset.filter(c => c.status === 'Concluído').length;
  const emAndamento = dataset.filter(c => c.status === 'Em andamento' || c.status === 'Hoje').length;
  const reagendamentos = dataset.filter(c => c.status === 'Solicitou reagendamento' || c.status === 'Aguardando Reagendamento').length;
  const estorno = dataset.filter(c => c.status === 'Estorno' || c.status === 'Solicitação de estorno').length;
  const taxaConclusao = total > 0 ? ((concluidos / total) * 100).toFixed(1) : '0.0';
  const volumeFinanceiro = dataset.reduce((sum, c) => sum + (c.valorIG || 0), 0);
  const taxaEstorno = total > 0 ? ((estorno / total) * 100).toFixed(1) : '0.0';
  const pendencias = dataset.filter(c => ['Sem contato', 'Solicitou reagendamento', 'Aguardando Reagendamento', 'Enviar gravação', 'Contato Encerrado (NFS)'].includes(c.status));

  if (el('kpi-total-processos')) el('kpi-total-processos').textContent = total;
  if (el('kpi-em-andamento-sub')) el('kpi-em-andamento-sub').textContent = `${emAndamento} em andamento`;
  if (el('kpi-taxa-conclusao')) el('kpi-taxa-conclusao').textContent = `${taxaConclusao}%`;
  if (el('kpi-concluidos-sub')) el('kpi-concluidos-sub').textContent = `${concluidos} finalizados`;
  if (el('kpi-total-reagendas')) el('kpi-total-reagendas').textContent = reagendamentos;
  if (el('kpi-volume-financeiro')) el('kpi-volume-financeiro').textContent = `R$ ${volumeFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  if (el('kpi-taxa-estorno-sub')) el('kpi-taxa-estorno-sub').textContent = `Taxa de estorno: ${taxaEstorno}%`;
  if (el('badge-pendencias-count')) el('badge-pendencias-count').textContent = pendencias.length;

  const pendContainer = el('container-pendencias-table');
  if (pendContainer) {
    pendContainer.innerHTML = pendencias.length
      ? `<div class="overflow-x-auto rounded-xl border border-[#eee]"><table class="w-full text-left text-xs"><thead class="bg-[#fafafa] border-b border-[#eee] text-[11px] font-bold text-[#666] uppercase"><tr><th class="px-3 py-2">Empresa</th><th class="px-3 py-2">Implantador</th><th class="px-3 py-2">Status</th><th class="px-3 py-2">Agenda</th></tr></thead><tbody class="divide-y divide-[#f0f0f0]">${pendencias.map(c => `<tr class="hover:bg-[#f8fafc] cursor-pointer" onclick="abrirModalCliente(${c.id})"><td class="px-3 py-2 font-bold text-[#002726] truncate max-w-[160px]">${c.empresa}</td><td class="px-3 py-2 text-[#666]">${c.implantador ? c.implantador.split('@')[0] : '—'}</td><td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">${c.status}</span></td><td class="px-3 py-2 text-[#888] font-mono">${c.agenda || '—'}</td></tr>`).join('')}</tbody></table></div>`
      : '<div class="text-center text-xs text-[#aaa] py-6">Sem pendências no momento ✓</div>';
  }

  const statusCounts = {};
  dataset.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });
  const statusContainer = el('container-status-distribution');
  if (statusContainer) {
    const sorted = Object.entries(statusCounts).sort((a, b) => b[1] - a[1]);
    statusContainer.innerHTML = sorted.map(([status, count]) => {
      const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
      const col = KANBAN_COLUMNS.find(c => c.statuses.includes(status));
      const color = col ? col.accentColor : '#94a3b8';
      return `<div class="flex items-center gap-2 py-1.5">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color:${color}"></span>
        <span class="text-xs text-[#555] flex-1 truncate">${status}</span>
        <span class="text-xs font-bold text-[#002726] min-w-[24px] text-right">${count}</span>
        <div class="w-24 bg-[#eee] rounded-full h-1.5"><div class="h-1.5 rounded-full" style="width:${pct}%;background-color:${color}"></div></div>
        <span class="text-[10px] text-[#999] min-w-[32px] text-right">${pct}%</span>
      </div>`;
    }).join('');
  }

  const implantadorMap = {};
  dataset.forEach(c => {
    const key = c.implantador || 'Sem implantador';
    if (!implantadorMap[key]) implantadorMap[key] = { total: 0, concluidos: 0 };
    implantadorMap[key].total++;
    if (c.status === 'Concluído') implantadorMap[key].concluidos++;
  });
  const implTable = el('tbl-implantadores-body');
  if (implTable) {
    const sorted = Object.entries(implantadorMap).sort((a, b) => b[1].total - a[1].total);
    implTable.innerHTML = sorted.map(([imp, data]) => {
      const taxa = data.total > 0 ? ((data.concluidos / data.total) * 100).toFixed(0) : 0;
      const nome = imp.includes('@') ? imp.split('@')[0] : imp;
      return `<tr class="border-t border-[#f0f0f0] hover:bg-[#f8fafc]">
        <td class="px-4 py-2 text-xs font-semibold text-[#002726]">${nome}</td>
        <td class="px-4 py-2 text-xs text-center text-[#555]">${data.total}</td>
        <td class="px-4 py-2 text-xs text-center text-emerald-700 font-bold">${data.concluidos}</td>
        <td class="px-4 py-2 text-xs text-center"><div class="flex items-center gap-1.5 justify-center"><div class="w-12 bg-[#eee] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-emerald-500" style="width:${taxa}%"></div></div><span class="text-[10px] font-bold text-[#555]">${taxa}%</span></div></td>
      </tr>`;
    }).join('');
  }
}

function renderMetricsViewBLV() {
  const dataset = CLIENTES_BLV;
  const el = id => document.getElementById(id);

  const total = dataset.length;
  const concluidos = dataset.filter(c => c.fase === 'Concluído').length;
  const emImplantacao = dataset.filter(c => c.fase === 'Em implantação').length;
  const semSucesso = dataset.filter(c => c.fase === 'Sem sucesso').length;
  const taxaConclusao = total > 0 ? ((concluidos / total) * 100).toFixed(1) : '0.0';
  const taxaSemSucesso = total > 0 ? ((semSucesso / total) * 100).toFixed(1) : '0.0';
  const pendencias = dataset.filter(c => c.fase === 'Aguardando cliente' || c.fase === 'Contato iniciado');

  if (el('kpi-total-processos')) el('kpi-total-processos').textContent = total;
  if (el('kpi-em-andamento-sub')) el('kpi-em-andamento-sub').textContent = `${emImplantacao} em implantação`;
  if (el('kpi-taxa-conclusao')) el('kpi-taxa-conclusao').textContent = `${taxaConclusao}%`;
  if (el('kpi-concluidos-sub')) el('kpi-concluidos-sub').textContent = `${concluidos} finalizados`;
  if (el('kpi-total-reagendas')) el('kpi-total-reagendas').textContent = semSucesso;
  if (el('kpi-volume-financeiro')) el('kpi-volume-financeiro').textContent = `— lojas`;
  if (el('kpi-taxa-estorno-sub')) el('kpi-taxa-estorno-sub').textContent = `Sem sucesso: ${taxaSemSucesso}%`;
  if (el('badge-pendencias-count')) el('badge-pendencias-count').textContent = pendencias.length;

  const pendContainer = el('container-pendencias-table');
  if (pendContainer) {
    pendContainer.innerHTML = pendencias.length
      ? `<div class="overflow-x-auto rounded-xl border border-[#eee]"><table class="w-full text-left text-xs"><thead class="bg-[#fafafa] border-b border-[#eee] text-[11px] font-bold text-[#666] uppercase"><tr><th class="px-3 py-2">Empresa</th><th class="px-3 py-2">Responsável</th><th class="px-3 py-2">Fase</th><th class="px-3 py-2">Dia Impl.</th></tr></thead><tbody class="divide-y divide-[#f0f0f0]">${pendencias.map(c => `<tr class="hover:bg-[#f8fafc] cursor-pointer" onclick="abrirModalCliente(${c.id})"><td class="px-3 py-2 font-bold text-[#002726] truncate max-w-[160px]">${c.empresa}</td><td class="px-3 py-2 text-[#666]">${c.responsavel ? c.responsavel.split('@')[0] : '—'}</td><td class="px-3 py-2"><span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">${c.fase || '—'}</span></td><td class="px-3 py-2 text-[#888] font-mono">${c.diaImplantacao || '—'}</td></tr>`).join('')}</tbody></table></div>`
      : '<div class="text-center text-xs text-[#aaa] py-6">Sem pendências no momento ✓</div>';
  }

  const faseCounts = {};
  dataset.forEach(c => { faseCounts[c.fase] = (faseCounts[c.fase] || 0) + 1; });
  const statusContainer = el('container-status-distribution');
  if (statusContainer) {
    const sorted = Object.entries(faseCounts).sort((a, b) => b[1] - a[1]);
    statusContainer.innerHTML = sorted.map(([fase, count]) => {
      const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
      const col = BLV_KANBAN_COLUMNS.find(c => c.statuses.includes(fase));
      const color = col ? col.accentColor : '#94a3b8';
      return `<div class="flex items-center gap-2 py-1.5">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color:${color}"></span>
        <span class="text-xs text-[#555] flex-1 truncate">${fase}</span>
        <span class="text-xs font-bold text-[#002726] min-w-[24px] text-right">${count}</span>
        <div class="w-24 bg-[#eee] rounded-full h-1.5"><div class="h-1.5 rounded-full" style="width:${pct}%;background-color:${color}"></div></div>
        <span class="text-[10px] text-[#999] min-w-[32px] text-right">${pct}%</span>
      </div>`;
    }).join('');
  }

  const respMap = {};
  dataset.forEach(c => {
    const key = c.responsavel || 'Sem responsável';
    if (!respMap[key]) respMap[key] = { total: 0, concluidos: 0 };
    respMap[key].total++;
    if (c.fase === 'Concluído') respMap[key].concluidos++;
  });
  const implTable = el('tbl-implantadores-body');
  if (implTable) {
    const sorted = Object.entries(respMap).sort((a, b) => b[1].total - a[1].total);
    implTable.innerHTML = sorted.map(([resp, data]) => {
      const taxa = data.total > 0 ? ((data.concluidos / data.total) * 100).toFixed(0) : 0;
      const nome = resp.includes('@') ? resp.split('@')[0] : resp;
      return `<tr class="border-t border-[#f0f0f0] hover:bg-[#f8fafc]">
        <td class="px-4 py-2 text-xs font-semibold text-[#002726]">${nome}</td>
        <td class="px-4 py-2 text-xs text-center text-[#555]">${data.total}</td>
        <td class="px-4 py-2 text-xs text-center text-emerald-700 font-bold">${data.concluidos}</td>
        <td class="px-4 py-2 text-xs text-center"><div class="flex items-center gap-1.5 justify-center"><div class="w-12 bg-[#eee] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-emerald-500" style="width:${taxa}%"></div></div><span class="text-[10px] font-bold text-[#555]">${taxa}%</span></div></td>
      </tr>`;
    }).join('');
  }
}
