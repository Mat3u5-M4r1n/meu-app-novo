function renderAgendaView() {
  if (currentTeam === 'blv') { renderAgendaViewBLV(); return; }

  const today = new Date().toISOString().slice(0, 10);
  let dataset = [...CLIENTES];

  if (currentSearchTerm) {
    dataset = dataset.filter(c =>
      (c.empresa || '').toLowerCase().includes(currentSearchTerm) ||
      (c.nomeContato || '').toLowerCase().includes(currentSearchTerm)
    );
  }
  if (selectedImplantador !== 'todos') {
    dataset = dataset.filter(c => c.implantador === selectedImplantador);
  }

  const todayClients = dataset.filter(c => c.agenda && c.agenda.startsWith(today));
  const futureClients = dataset.filter(c => c.agenda && c.agenda > today && !c.agenda.startsWith(today));
  const pendingPost = CLIENTES.filter(c => c.status === 'Enviar gravação' || c.status === 'Agenda enviada');

  const el = id => document.getElementById(id);
  if (el('agenda-count-hoje')) el('agenda-count-hoje').textContent = todayClients.length;
  if (el('agenda-count-futuros')) el('agenda-count-futuros').textContent = futureClients.length;

  const titleHoje = el('title-hoje-count');
  if (titleHoje) titleHoje.textContent = `Atendimentos Agendados para Hoje (${todayClients.length})`;
  const titleFuturos = el('title-futuros-count');
  if (titleFuturos) titleFuturos.textContent = `Próximos Dias Agendados (${futureClients.length})`;
  const titlePendentes = el('title-pendentes-count');
  if (titlePendentes) titlePendentes.textContent = `Aguardando Escolha de Data / Link Enviado (${pendingPost.length})`;

  const renderCard = (c) => {
    const agendaStr = c.agenda || '';
    const dateMatch = agendaStr.match(/(\d{4}-\d{2}-\d{2})/);
    const timeMatch = agendaStr.match(/(\d{2}:\d{2})/);
    const dateStr = dateMatch ? new Date(dateMatch[1] + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : '';
    const timeStr = timeMatch ? timeMatch[1] : '';
    return `
      <div onclick="abrirModalCliente(${c.id})" class="bg-white rounded-xl border border-[#e8e8e8] p-3 hover:shadow-md hover:border-[#7F76FF]/40 transition-all cursor-pointer flex items-center gap-3">
        <div class="text-center min-w-[56px] bg-[#f8fafc] rounded-lg p-1.5 border border-[#e8e8e8]">
          <div class="text-[9px] text-[#666] capitalize leading-tight">${dateStr}</div>
          <div class="text-sm font-black text-[#002726] leading-tight font-mono">${timeStr || '—'}</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-[#002726] truncate">${c.empresa}</div>
          <div class="text-[11px] text-[#666] truncate">${c.igAgendada || '—'} · ${c.implantador ? c.implantador.split('@')[0] : 'Sem implantador'}</div>
        </div>
        <div class="shrink-0 flex gap-1">
          ${c.linkMeet ? `<a href="${c.linkMeet}" target="_blank" onclick="event.stopPropagation()" class="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-[10px] font-bold border border-blue-100">Meet</a>` : ''}
          ${c.whatsapp ? `<a href="https://wa.me/55${c.whatsapp.replace(/\D/g,'')}" target="_blank" onclick="event.stopPropagation()" class="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-bold border border-emerald-100">WA</a>` : ''}
        </div>
      </div>`;
  };

  const sortByAgenda = (a, b) => (a.agenda || '').localeCompare(b.agenda || '');

  if (el('grid-hoje-container')) el('grid-hoje-container').innerHTML = todayClients.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${todayClients.sort(sortByAgenda).map(renderCard).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhuma IG agendada para hoje</div>';

  if (el('grid-futuros-container')) el('grid-futuros-container').innerHTML = futureClients.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${futureClients.sort(sortByAgenda).map(renderCard).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhuma IG futura agendada</div>';

  if (el('grid-pendentes-container')) el('grid-pendentes-container').innerHTML = pendingPost.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${pendingPost.map(c => `
      <div onclick="abrirModalCliente(${c.id})" class="bg-white rounded-xl border border-amber-200/60 p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1"></div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-[#002726] truncate">${c.empresa}</div>
          <div class="text-[11px] text-[#666] truncate">${c.status} · ${c.implantador ? c.implantador.split('@')[0] : '—'}</div>
        </div>
        ${c.linkGravacao1 ? `<a href="${c.linkGravacao1}" target="_blank" onclick="event.stopPropagation()" class="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold border border-purple-100">Gravação</a>` : ''}
      </div>`).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhum pendente de link/gravação</div>';
}

function renderAgendaViewBLV() {
  const today = new Date().toISOString().slice(0, 10);
  let dataset = [...CLIENTES_BLV];

  if (currentSearchTerm) {
    dataset = dataset.filter(c =>
      (c.empresa || '').toLowerCase().includes(currentSearchTerm) ||
      (c.nomeDoContato || '').toLowerCase().includes(currentSearchTerm)
    );
  }
  if (selectedImplantador !== 'todos') {
    dataset = dataset.filter(c => c.responsavel === selectedImplantador);
  }

  const todayClients = dataset.filter(c => c.diaImplantacao === today);
  const futureClients = dataset.filter(c => c.diaImplantacao && c.diaImplantacao > today);
  const pendingPost = CLIENTES_BLV.filter(c => c.fase === 'Aguardando cliente');

  const el = id => document.getElementById(id);
  if (el('agenda-count-hoje')) el('agenda-count-hoje').textContent = todayClients.length;
  if (el('agenda-count-futuros')) el('agenda-count-futuros').textContent = futureClients.length;

  const titleHoje = el('title-hoje-count');
  if (titleHoje) titleHoje.textContent = `Implantações para Hoje (${todayClients.length})`;
  const titleFuturos = el('title-futuros-count');
  if (titleFuturos) titleFuturos.textContent = `Próximas Implantações (${futureClients.length})`;
  const titlePendentes = el('title-pendentes-count');
  if (titlePendentes) titlePendentes.textContent = `Aguardando Cliente (${pendingPost.length})`;

  const renderCardBLV = (c) => {
    const dateStr = c.diaImplantacao ? new Date(c.diaImplantacao + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : '';
    return `
      <div onclick="abrirModalCliente(${c.id})" class="bg-white rounded-xl border border-[#e8e8e8] p-3 hover:shadow-md hover:border-[#7F76FF]/40 transition-all cursor-pointer flex items-center gap-3">
        <div class="text-center min-w-[56px] bg-[#f8fafc] rounded-lg p-1.5 border border-[#e8e8e8]">
          <div class="text-[9px] text-[#666] capitalize leading-tight">${dateStr || '—'}</div>
          <div class="text-sm font-black text-[#002726] leading-tight font-mono">BLV</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-[#002726] truncate">${c.empresa}</div>
          <div class="text-[11px] text-[#666] truncate">${c.fase || '—'} · ${c.responsavel ? c.responsavel.split('@')[0] : 'Sem responsável'}</div>
        </div>
        <div class="shrink-0 flex gap-1">
          ${c.telefone ? `<a href="https://wa.me/55${c.telefone.replace(/\D/g,'')}" target="_blank" onclick="event.stopPropagation()" class="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-[10px] font-bold border border-emerald-100">WA</a>` : ''}
        </div>
      </div>`;
  };

  const sortByDia = (a, b) => (a.diaImplantacao || '').localeCompare(b.diaImplantacao || '');

  if (el('grid-hoje-container')) el('grid-hoje-container').innerHTML = todayClients.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${todayClients.sort(sortByDia).map(renderCardBLV).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhuma implantação BLV para hoje</div>';

  if (el('grid-futuros-container')) el('grid-futuros-container').innerHTML = futureClients.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${futureClients.sort(sortByDia).map(renderCardBLV).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhuma implantação futura agendada</div>';

  if (el('grid-pendentes-container')) el('grid-pendentes-container').innerHTML = pendingPost.length
    ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${pendingPost.map(c => `
      <div onclick="abrirModalCliente(${c.id})" class="bg-white rounded-xl border border-amber-200/60 p-3 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1"></div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-[#002726] truncate">${c.empresa}</div>
          <div class="text-[11px] text-[#666] truncate">${c.fase} · ${c.responsavel ? c.responsavel.split('@')[0] : '—'}</div>
        </div>
      </div>`).join('')}</div>`
    : '<div class="text-center text-[#aaa] text-xs py-6">Nenhum aguardando cliente</div>';
}
