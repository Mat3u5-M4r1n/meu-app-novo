// Estado global do Kanban
let kanbanVisibleColumnIds = [];
let kanbanCardVisibleFields = {};
let kanbanCustomViews = [];
let kanbanActiveViewId = null;
let draggedCardId = null;
let currentSearchTerm = '';
let selectedImplantador = 'todos';
let currentCardFieldsCategory = 'todos';

function initKanban() {
  kanbanVisibleColumnIds = getActiveKanbanColumns().map(c => c.id);
  kanbanCardVisibleFields = { ...getActiveDefaultCardFields() };
}

function renderKanbanBoard() {
  const container = document.getElementById('kanban-board-container');
  if (!container) return;

  const statusKey = getActiveStatusKey();
  const implKey = currentTeam === 'ig' ? 'implantador' : 'responsavel';

  let dataset = [...getActiveClientes()];

  if (currentSearchTerm) {
    const nameKey = currentTeam === 'ig' ? 'nomeContato' : 'nomeDoContato';
    dataset = dataset.filter(c =>
      (c.empresa || '').toLowerCase().includes(currentSearchTerm) ||
      (c[nameKey] || '').toLowerCase().includes(currentSearchTerm) ||
      (c.cnpj || '').includes(currentSearchTerm) ||
      String(c.id).includes(currentSearchTerm)
    );
  }
  if (selectedImplantador !== 'todos') {
    dataset = dataset.filter(c => c[implKey] === selectedImplantador);
  }

  const columnsToDisplay = getActiveKanbanColumns().filter(col => kanbanVisibleColumnIds.includes(col.id));
  document.getElementById('lbl-kanban-total-cards').textContent = dataset.length;

  container.innerHTML = columnsToDisplay.map((col, colIdx) => {
    const colCards = dataset.filter(c => col.statuses.includes(c[statusKey]));
    const isFirstCol = colIdx === 0;
    return `
      <div
        id="kanban-col-${col.id}"
        ondragover="handleKanbanDragOver(event, '${col.id}')"
        ondragleave="handleKanbanDragLeave(event, '${col.id}')"
        ondrop="handleKanbanDrop(event, '${col.statuses[0]}')"
        class="w-[285px] min-w-[285px] xl:w-[305px] xl:min-w-[305px] flex flex-col bg-white/70 rounded-2xl p-3 border border-[#e8e8e8] transition-all duration-200 h-full max-h-[calc(100vh-120px)] shadow-[0_4px_16px_rgba(0,0,0,0.02)]"
      >
        <div class="flex items-center justify-between mb-3 px-1 shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${col.accentColor}"></span>
            <h2 class="text-xs font-bold text-[#002726] truncate">${col.title}</h2>
          </div>
          <span class="text-xs font-bold text-[#666] bg-[#eee] px-2 py-0.5 rounded-full">${colCards.length}</span>
        </div>
        <div class="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-0.5">
          ${colCards.length === 0 ? `<div class="h-24 border-2 border-dashed border-[#e0e0e0] rounded-xl flex items-center justify-center text-xs text-[#888] font-medium">Nenhum cliente</div>` : colCards.map(card => renderKanbanCard(card)).join('')}
        </div>
        ${isFirstCol ? `
        <div class="pt-2 shrink-0 border-t border-[#eee]/80 mt-2">
          <button type="button" onclick="abrirModalNovoCliente()" class="w-full py-2 bg-white hover:bg-[#002726] text-[#002726] hover:text-[#93F574] border-2 border-dashed border-[#d5d5d5] hover:border-[#002726] rounded-xl flex items-center justify-center font-bold text-base transition-all shadow-xs cursor-pointer" title="Adicionar novo cliente">+</button>
        </div>` : ''}
      </div>
    `;
  }).join('');
}

function renderKanbanCard(card) {
  if (currentTeam === 'blv') return renderKanbanCardBLV(card);
  const isToday = card.agenda && card.agenda.includes(new Date().toISOString().slice(0, 10));
  const fields = kanbanCardVisibleFields;
  return `
    <div
      id="card-${card.id}"
      draggable="true"
      ondragstart="handleKanbanDragStart(event, ${card.id})"
      onclick="abrirModalCliente(${card.id})"
      class="p-3 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,39,38,0.08)] hover:border-[#7F76FF]/50 transition-all cursor-pointer flex flex-col gap-2 relative group"
    >
      <div class="flex justify-between items-center text-[10px] gap-1 flex-wrap">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${fields.id ? `<span class="font-mono font-bold text-[#888] bg-[#f5f5f5] px-1.5 py-0.5 rounded">#${card.id}</span>` : ''}
          ${fields.topEspecialista && card.topEspecialista ? `<span class="px-1.5 py-0.5 rounded bg-[#93F574]/20 text-[#002726] font-bold border border-[#93F574]/40 text-[9px]">✨ Top</span>` : ''}
          ${isToday ? `<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold uppercase text-[9px]">Hoje</span>` : ''}
        </div>
        <div class="flex items-center gap-1 flex-wrap">
          ${fields.plano && card.plano ? `<span class="text-[10px] font-semibold text-[#555] bg-[#f5f5f5] px-1.5 py-0.5 rounded">${card.plano}</span>` : ''}
          ${fields.valorIG && card.valorIG > 0 ? `<span class="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">R$ ${card.valorIG.toFixed(2)}</span>` : ''}
        </div>
      </div>
      <div>
        ${fields.empresa ? `<p class="text-xs font-bold leading-snug text-[#002726] truncate" title="${card.empresa}">${card.empresa}</p>` : ''}
        ${fields.nomeContato && card.nomeContato ? `<p class="text-[11px] text-[#666] truncate mt-0.5">${card.nomeContato}</p>` : ''}
      </div>
      ${(fields.igAgendada || fields.implantador) ? `
      <div class="flex flex-col gap-1 text-[11px] bg-[#fcfcfc] p-2 rounded-lg border border-[#f0f0f0]">
        ${fields.igAgendada && card.igAgendada ? `<div class="text-[#4a41cc] font-medium truncate">🎯 ${card.igAgendada}</div>` : ''}
        ${fields.implantador ? `<div class="text-[#666] truncate">👤 ${card.implantador ? card.implantador.split('@')[0] : 'Sem implantador'}</div>` : ''}
      </div>` : ''}
      ${fields.agenda && card.agenda ? `
      <div class="flex items-center gap-1.5 text-[11px] text-[#555] font-mono">
        <svg class="w-3 h-3 text-[#7F76FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="truncate">${card.agenda}</span>
      </div>` : ''}
      <div class="pt-2 border-t border-[#f0f0f0] flex items-center justify-between text-[11px] gap-2 mt-auto" onclick="event.stopPropagation()">
        ${fields.status ? `
        <select onchange="moveCardToStatus(${card.id}, this.value)" class="w-full text-[10px] font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer bg-slate-50 text-slate-800 border-slate-200">
          ${getActiveStatusList().map(st => `<option value="${st}" ${card.status === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>` : ''}
      </div>
    </div>
  `;
}

function renderKanbanCardBLV(card) {
  const fields = kanbanCardVisibleFields;
  const isToday = card.diaImplantacao && card.diaImplantacao.includes(new Date().toISOString().slice(0, 10));

  // Atividades deste card (by empresa, most recent first)
  const ativs = (typeof ATIVIDADES !== 'undefined' ? ATIVIDADES : [])
    .filter(a => a.empresa === card.empresa)
    .slice(0, 3); // show up to 3 most recent

  const ativsHtml = ativs.length > 0 ? `
    <div class="mt-1 flex flex-col gap-1" onclick="event.stopPropagation()">
      ${ativs.map(a => `
        <div onclick="abrirModalAtividade(${a.id}, null)" class="flex items-start gap-1.5 px-2 py-1.5 bg-[#f5f4ff] rounded-lg border border-[#e0deff] hover:bg-[#ebe9ff] transition-colors cursor-pointer group/atv">
          <span class="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#7F76FF] shrink-0"></span>
          <div class="min-w-0 flex-1">
            <p class="text-[10px] font-semibold text-[#4a41cc] truncate leading-tight">${a.titulo}</p>
            ${a.followup ? `<p class="text-[9px] text-[#777] truncate leading-tight mt-0.5">${a.followup}</p>` : ''}
          </div>
        </div>`).join('')}
    </div>` : '';

  return `
    <div
      id="card-${card.id}"
      draggable="true"
      ondragstart="handleKanbanDragStart(event, ${card.id})"
      onclick="abrirModalCliente(${card.id})"
      class="p-3 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_14px_rgba(0,39,38,0.08)] hover:border-[#7F76FF]/50 transition-all cursor-pointer flex flex-col gap-2 relative group"
    >
      <div class="flex justify-between items-center text-[10px] gap-1">
        <div class="flex items-center gap-1.5 flex-wrap">
          ${fields.id ? `<span class="font-mono font-bold text-[#888] bg-[#f5f5f5] px-1.5 py-0.5 rounded">#${card.id}</span>` : ''}
          ${isToday ? `<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold uppercase text-[9px]">Hoje</span>` : ''}
        </div>
        ${ativs.length > 0 ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f0efff] text-[#7F76FF]">${ativs.length} atv</span>` : ''}
      </div>
      <div>
        ${fields.empresa ? `<p class="text-xs font-bold leading-snug text-[#002726] truncate">${card.empresa || '—'}</p>` : ''}
        ${fields.nomeDoContato && card.nomeDoContato ? `<p class="text-[11px] text-[#666] truncate mt-0.5">${card.nomeDoContato}</p>` : ''}
      </div>
      ${fields.responsavel || fields.diaImplantacao ? `
      <div class="flex flex-col gap-1 text-[11px] bg-[#fcfcfc] p-2 rounded-lg border border-[#f0f0f0]">
        ${fields.responsavel && card.responsavel ? `<div class="text-[#666] truncate">👤 ${card.responsavel.split('@')[0]}</div>` : ''}
        ${fields.diaImplantacao && card.diaImplantacao ? `<div class="text-[#555] font-mono truncate">📅 ${card.diaImplantacao}</div>` : ''}
      </div>` : ''}
      ${fields.telefone && card.telefone ? `<div class="text-[11px] text-[#555]">📞 ${card.telefone}</div>` : ''}
      ${ativsHtml}
      <div class="pt-2 border-t border-[#f0f0f0] mt-auto flex flex-col gap-1.5" onclick="event.stopPropagation()">
        ${fields.fase !== false ? `
        <select onchange="moveCardToStatus(${card.id}, this.value)" class="w-full text-[10px] font-bold py-1 px-2 rounded-lg border outline-none cursor-pointer bg-slate-50 text-slate-800 border-slate-200">
          ${BLV_STATUS_LIST.map(st => `<option value="${st}" ${card.fase === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>` : ''}
        <button
          data-empresa="${(card.empresa || '').replace(/"/g, '&quot;')}"
          onclick="abrirModalAtividade(null, this.getAttribute('data-empresa'))"
          class="w-full text-[10px] font-bold py-1 px-2 rounded-lg border border-[#7F76FF]/40 bg-[#f0efff] text-[#4a41cc] hover:bg-[#7F76FF] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
        >
          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Criar Atividade
        </button>
      </div>
    </div>
  `;
}

// Drag and Drop
function handleKanbanDragStart(e, cardId) {
  draggedCardId = cardId;
  e.dataTransfer.setData('text/plain', cardId);
}
function handleKanbanDragOver(e, colId) {
  e.preventDefault();
  document.getElementById(`kanban-col-${colId}`)?.classList.add('kanban-drag-over');
}
function handleKanbanDragLeave(e, colId) {
  document.getElementById(`kanban-col-${colId}`)?.classList.remove('kanban-drag-over');
}
function handleKanbanDrop(e, newStatus) {
  e.preventDefault();
  const cardId = parseInt(e.dataTransfer.getData('text/plain') || draggedCardId);
  if (cardId) moveCardToStatus(cardId, newStatus);
  draggedCardId = null;
  document.querySelectorAll('.kanban-drag-over').forEach(el => el.classList.remove('kanban-drag-over'));
}

async function moveCardToStatus(cardId, newStatus) {
  const dataset = getActiveClientes();
  const statusKey = getActiveStatusKey();
  const cliente = dataset.find(c => c.id === cardId);
  if (cliente) {
    cliente[statusKey] = newStatus;
    if (currentTeam === 'ig') cliente.diasAtualizado = new Date().toISOString().slice(0, 10);
    renderKanbanBoard();
    updateSidebarStats();
    updateFooterStats();
    await apiSalvarCliente(cliente);
  }
}

// Gerenciamento de Colunas
function toggleKanbanColumnsDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById('popover-kanban-columns');
  menu.classList.toggle('hidden');
  if (!menu.classList.contains('hidden')) renderKanbanColumnsDropdownLists();
}
function renderKanbanColumnsDropdownLists() {
  const q = (document.getElementById('input-search-kanban-cols')?.value || '').toLowerCase();
  const visibleList = document.getElementById('list-visible-kanban-cols');
  const hiddenList = document.getElementById('list-hidden-kanban-cols');
  const cols = getActiveKanbanColumns();
  const visibleCols = cols.filter(c => kanbanVisibleColumnIds.includes(c.id) && c.title.toLowerCase().includes(q));
  const hiddenCols = cols.filter(c => !kanbanVisibleColumnIds.includes(c.id) && c.title.toLowerCase().includes(q));
  visibleList.innerHTML = visibleCols.map(c => `
    <div class="flex items-center justify-between p-1 rounded hover:bg-[#f8fafc]">
      <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background-color: ${c.accentColor}"></span><span class="font-medium text-[#1e293b] text-xs">${c.title}</span></div>
      ${kanbanVisibleColumnIds.length > 1 ? `<button type="button" onclick="hideKanbanCol('${c.id}')" class="text-rose-500 hover:underline cursor-pointer text-xs">Ocultar</button>` : `<span class="text-[10px] text-[#888]">Mínimo 1</span>`}
    </div>`).join('');
  hiddenList.innerHTML = hiddenCols.map(c => `
    <div class="flex items-center justify-between p-1 rounded hover:bg-[#f8fafc]">
      <div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full opacity-60" style="background-color: ${c.accentColor}"></span><span class="font-medium text-[#64748b] text-xs">${c.title}</span></div>
      <button type="button" onclick="showKanbanCol('${c.id}')" class="text-emerald-600 hover:underline cursor-pointer text-xs">Exibir</button>
    </div>`).join('');
  document.getElementById('lbl-kanban-cols-count').textContent = `Colunas (${kanbanVisibleColumnIds.length})`;
}
function hideKanbanCol(id) {
  if (kanbanVisibleColumnIds.length <= 1) return;
  kanbanVisibleColumnIds = kanbanVisibleColumnIds.filter(cId => cId !== id);
  renderKanbanColumnsDropdownLists();
  renderKanbanBoard();
}
function showKanbanCol(id) {
  kanbanVisibleColumnIds.push(id);
  renderKanbanColumnsDropdownLists();
  renderKanbanBoard();
}
function showAllKanbanColumns() { kanbanVisibleColumnIds = getActiveKanbanColumns().map(c => c.id); renderKanbanColumnsDropdownLists(); renderKanbanBoard(); }
function hideAllKanbanColumns() { kanbanVisibleColumnIds = [getActiveKanbanColumns()[0].id]; renderKanbanColumnsDropdownLists(); renderKanbanBoard(); }
function resetDefaultKanbanColumns() { kanbanVisibleColumnIds = getActiveKanbanColumns().map(c => c.id); renderKanbanColumnsDropdownLists(); renderKanbanBoard(); }

// Gerenciamento de Campos do Card
function toggleCardFieldsDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById('popover-card-fields');
  menu.classList.toggle('hidden');
  menu.classList.toggle('flex');
  if (!menu.classList.contains('hidden')) { renderCategoryChips(); renderCardFieldsList(); }
}
function renderCategoryChips() {
  const container = document.getElementById('container-category-chips');
  container.innerHTML = getActiveCategories().map(cat => `
    <button type="button" onclick="selectCardFieldsCategory('${cat.id}')" class="text-[10px] font-semibold px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${currentCardFieldsCategory === cat.id ? 'bg-[#002726] text-[#93F574]' : 'bg-[#f0f0f0] hover:bg-[#e4e4e4] text-[#555]'}">${cat.label}</button>`).join('');
}
function selectCardFieldsCategory(catId) { currentCardFieldsCategory = catId; renderCategoryChips(); renderCardFieldsList(); }
function renderCardFieldsList() {
  const q = (document.getElementById('input-search-card-fields')?.value || '').toLowerCase().trim();
  const container = document.getElementById('list-card-fields-container');
  if (!container) return;
  const fieldDefs = getActiveFieldDefinitions();
  const filtered = fieldDefs.filter(item => {
    const matchCat = currentCardFieldsCategory === 'todos' || item.category === currentCardFieldsCategory;
    const matchSearch = !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.key.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
  const totalCount = fieldDefs.length;
  let activeCount = 0;
  fieldDefs.forEach(f => { if (kanbanCardVisibleFields[f.key]) activeCount++; });
  document.getElementById('lbl-active-fields-count').textContent = `${activeCount}/${totalCount}`;
  document.getElementById('txt-footer-fields-count').textContent = `${activeCount} de ${totalCount} visíveis`;
  if (filtered.length === 0) { container.innerHTML = `<div class="py-8 text-center text-xs text-[#888]">Nenhum campo encontrado</div>`; return; }
  container.innerHTML = filtered.map(item => {
    const isVisible = Boolean(kanbanCardVisibleFields[item.key]);
    return `<button type="button" onclick="toggleSingleCardField('${item.key}')" class="w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${isVisible ? 'bg-[#f9fcfa] hover:bg-[#f2f8f4] text-[#002726] border border-emerald-100/60' : 'bg-white hover:bg-slate-50 text-[#888] border border-transparent opacity-75'}">
      <div class="flex items-center gap-2.5 min-w-0 pr-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${isVisible ? 'bg-[#93F574]/30 text-[#002726]' : 'bg-[#eee] text-[#999]'}">
          <svg class="w-4 h-4 ${isVisible ? 'text-emerald-800' : 'text-slate-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        </div>
        <div class="min-w-0"><div class="text-xs font-semibold truncate leading-tight">${item.label}</div><div class="text-[10px] text-[#888] truncate mt-0.5">${item.description}</div></div>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isVisible ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">${isVisible ? 'Visível' : 'Oculto'}</span>
    </button>`;
  }).join('');
}
function toggleSingleCardField(key) { kanbanCardVisibleFields[key] = !kanbanCardVisibleFields[key]; renderCardFieldsList(); renderKanbanBoard(); }
function selectAllCardFields() { getActiveFieldDefinitions().forEach(f => { kanbanCardVisibleFields[f.key] = true; }); renderCardFieldsList(); renderKanbanBoard(); }
function deselectAllCardFields() { getActiveFieldDefinitions().forEach(f => { kanbanCardVisibleFields[f.key] = false; }); kanbanCardVisibleFields.empresa = true; renderCardFieldsList(); renderKanbanBoard(); }
function resetDefaultCardFields() { kanbanCardVisibleFields = { ...getActiveDefaultCardFields() }; renderCardFieldsList(); renderKanbanBoard(); }

// Gerenciamento de Visualizações Salvas
function toggleKanbanViewsDropdown(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('popover-kanban-views');
  menu.classList.toggle('hidden');
  if (!menu.classList.contains('hidden')) renderKanbanCustomViewsList();
}
function renderKanbanCustomViewsList() {
  const container = document.getElementById('list-kanban-custom-views');
  if (!container) return;
  container.innerHTML = `
    <div onclick="selectDefaultKanbanView(event)" class="p-2 rounded-xl text-xs cursor-pointer border ${kanbanActiveViewId === null ? 'bg-[#7F76FF]/10 border-[#7F76FF]/30 font-bold text-[#002726]' : 'bg-[#fafafa] hover:bg-[#f1f5f9] border-[#e2e8f0]'} flex items-center justify-between">
      <span>Todas as Colunas (Padrão)</span>
    </div>
    ${kanbanCustomViews.map(v => `
    <div onclick="applyKanbanCustomView('${v.id}', event)" class="p-2 rounded-xl text-xs cursor-pointer border ${kanbanActiveViewId === v.id ? 'bg-[#7F76FF]/10 border-[#7F76FF]/30 font-bold text-[#002726]' : 'bg-white hover:bg-[#f8fafc] border-[#e2e8f0]'} flex items-center justify-between">
      <div class="flex flex-col min-w-0"><span class="truncate font-semibold">${v.name}</span><span class="text-[10px] text-[#64748b] font-normal">${v.visibleColumnIds.length} colunas</span></div>
      <button type="button" onclick="deleteKanbanCustomView('${v.id}', event)" class="text-rose-500 font-bold ml-2 hover:bg-rose-50 p-1 rounded">✕</button>
    </div>`).join('')}`;
}
function saveKanbanCustomViewHandler(e) {
  if (e) e.stopPropagation();
  const input = document.getElementById('input-kanban-view-name');
  const name = input?.value.trim();
  if (!name) { alert('Por favor, digite um nome para a visualização!'); return; }
  const newView = { id: 'kview-' + Date.now(), name, visibleColumnIds: [...kanbanVisibleColumnIds], cardVisibleFields: { ...kanbanCardVisibleFields } };
  kanbanCustomViews.push(newView);
  kanbanActiveViewId = newView.id;
  input.value = '';
  document.getElementById('lbl-kanban-active-view').textContent = `Visualizações: ${name}`;
  document.getElementById('popover-kanban-views').classList.add('hidden');
  renderKanbanCustomViewsList();
  renderKanbanBoard();
}
function applyKanbanCustomView(viewId, e) {
  if (e) e.stopPropagation();
  const view = kanbanCustomViews.find(v => v.id === viewId);
  if (view) { kanbanActiveViewId = view.id; kanbanVisibleColumnIds = [...view.visibleColumnIds]; if (view.cardVisibleFields) kanbanCardVisibleFields = { ...view.cardVisibleFields }; document.getElementById('lbl-kanban-active-view').textContent = `Visualizações: ${view.name}`; document.getElementById('popover-kanban-views').classList.add('hidden'); renderKanbanBoard(); }
}
function selectDefaultKanbanView(e) {
  if (e) e.stopPropagation();
  kanbanActiveViewId = null;
  kanbanVisibleColumnIds = getActiveKanbanColumns().map(c => c.id);
  kanbanCardVisibleFields = { ...getActiveDefaultCardFields() };
  document.getElementById('lbl-kanban-active-view').textContent = 'Visualizações: Todas';
  document.getElementById('popover-kanban-views').classList.add('hidden');
  renderKanbanBoard();
}
function deleteKanbanCustomView(viewId, event) {
  if (event) event.stopPropagation();
  kanbanCustomViews = kanbanCustomViews.filter(v => v.id !== viewId);
  if (kanbanActiveViewId === viewId) selectDefaultKanbanView();
  else renderKanbanCustomViewsList();
}

// Fechar popovers ao clicar fora
document.addEventListener('click', () => {
  document.getElementById('popover-kanban-views')?.classList.add('hidden');
  document.getElementById('popover-kanban-columns')?.classList.add('hidden');
  const pf = document.getElementById('popover-card-fields');
  if (pf) { pf.classList.add('hidden'); pf.classList.remove('flex'); }
});

// Impedir que cliques DENTRO dos popovers borbulhem até o document (o que fecharia o menu)
document.getElementById('popover-card-fields')?.addEventListener('click', e => e.stopPropagation());
document.getElementById('popover-kanban-views')?.addEventListener('click', e => e.stopPropagation());
document.getElementById('popover-kanban-columns')?.addEventListener('click', e => e.stopPropagation());

// ─── Table view — colunas por time ──────────────────────────────────────────
const _TABLE_COLS_IG = [
  { key: 'empresa',          label: 'Empresa',       type: 'text',   width: 180 },
  { key: 'nomeContato',      label: 'Contato',       type: 'text',   width: 150 },
  { key: 'status',           label: 'Status',        type: 'select', options: () => STATUS_LIST,        width: 180 },
  { key: 'implantador',      label: 'Implantador',   type: 'select', options: () => IMPLANTADORES_LIST, width: 210 },
  { key: 'igAgendada',       label: 'IG Agendada',   type: 'select', options: () => TIPOS_IG_LIST,      width: 190 },
  { key: 'agenda',           label: 'Data/Hora',     type: 'text',   width: 160 },
  { key: 'plano',            label: 'Plano',         type: 'text',   width: 120 },
  { key: 'cnpj',             label: 'CNPJ',          type: 'text',   width: 140 },
  { key: 'whatsapp',         label: 'WhatsApp',      type: 'text',   width: 130 },
  { key: 'qtdReagendamento', label: 'Reagend.',      type: 'text',   width: 80  },
  { key: 'responsavel',      label: 'Responsável',   type: 'text',   width: 150 },
  { key: 'origem',           label: 'Origem',        type: 'text',   width: 120 },
];

const _TABLE_COLS_BLV = [
  { key: 'empresa',        label: 'Empresa',       type: 'text',   width: 180 },
  { key: 'nomeDoContato',  label: 'Contato',       type: 'text',   width: 150 },
  { key: 'fase',           label: 'Fase',          type: 'select', options: () => BLV_STATUS_LIST,        width: 180 },
  { key: 'responsavel',    label: 'Responsável',   type: 'select', options: () => BLV_IMPLANTADORES_LIST, width: 200 },
  { key: 'diaImplantacao', label: 'Dia Implant.',  type: 'text',   width: 140 },
  { key: 'telefone',       label: 'Telefone',      type: 'text',   width: 130 },
  { key: 'cnpj',           label: 'CNPJ',          type: 'text',   width: 140 },
  { key: 'site',           label: 'Site',          type: 'text',   width: 160 },
  { key: 'origem',         label: 'Origem',        type: 'text',   width: 120 },
];

function _tableStatusBadge(status) {
  const col = getActiveKanbanColumns().find(c => c.statuses.includes(status));
  const cls = col ? col.badgeColor : 'bg-gray-100 text-gray-700 border-gray-200';
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cls}">${status}</span>`;
}

function _tableCellDisplay(col, val) {
  if (col.key === 'status' || col.key === 'fase') {
    return val ? _tableStatusBadge(val) : `<span class="text-[#ccc] italic text-xs">—</span>`;
  }
  return val
    ? `<span class="block truncate text-[#333] text-xs">${val}</span>`
    : `<span class="text-[#ccc] italic text-xs">—</span>`;
}

async function _tableStartEdit(td, clienteId, key) {
  if (td.dataset.editing === '1') return;

  const cols = currentTeam === 'blv' ? _TABLE_COLS_BLV : _TABLE_COLS_IG;
  const colSpec = cols.find(c => c.key === key);
  if (!colSpec) return;

  const cliente = getActiveClientes().find(c => c.id === clienteId);
  if (!cliente) return;

  const currentVal = cliente[key] !== undefined && cliente[key] !== null ? String(cliente[key]) : '';
  const originalHTML = td.innerHTML;
  td.dataset.editing = '1';

  let editorEl;
  if (colSpec.type === 'select') {
    editorEl = document.createElement('select');
    editorEl.innerHTML = `<option value="">—</option>` +
      colSpec.options().map(o =>
        `<option value="${o}"${o === currentVal ? ' selected' : ''}>${o}</option>`
      ).join('');
  } else {
    editorEl = document.createElement('input');
    editorEl.type = 'text';
    editorEl.value = currentVal;
  }
  editorEl.className = 'w-full min-w-[110px] text-xs px-2 py-1 rounded-lg border-2 border-[#7F76FF] outline-none bg-white shadow-sm';

  td.innerHTML = '';
  td.appendChild(editorEl);
  editorEl.focus();
  if (editorEl.tagName === 'INPUT') editorEl.select();

  let done = false;

  async function commit() {
    if (done) return;
    done = true;
    delete td.dataset.editing;
    const newVal = editorEl.value;

    if (newVal === currentVal) { td.innerHTML = originalHTML; return; }

    td.innerHTML = _tableCellDisplay(colSpec, newVal);
    try {
      await apiSalvarCliente({ ...cliente, [key]: newVal });
    } catch (e) {
      td.innerHTML = originalHTML;
      showToast(`Erro ao salvar: ${e.message}`, 'error');
    }
  }

  function cancel() {
    if (done) return;
    done = true;
    delete td.dataset.editing;
    td.innerHTML = originalHTML;
  }

  editorEl.addEventListener('blur', commit);
  editorEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); editorEl.blur(); }
    if (e.key === 'Escape') { e.preventDefault(); cancel(); }
  });
}

// Renderizar tabela (view lista) — edição inline estilo Notion
function renderTableView() {
  const isBlv = currentTeam === 'blv';
  const implKey = isBlv ? 'responsavel' : 'implantador';
  const nameKey = isBlv ? 'nomeDoContato' : 'nomeContato';
  const cols    = isBlv ? _TABLE_COLS_BLV : _TABLE_COLS_IG;

  const dataset = getActiveClientes().filter(c => {
    if (currentSearchTerm && !(
      (c.empresa || '').toLowerCase().includes(currentSearchTerm) ||
      (c[nameKey] || '').toLowerCase().includes(currentSearchTerm) ||
      String(c.id).includes(currentSearchTerm)
    )) return false;
    if (selectedImplantador !== 'todos' && c[implKey] !== selectedImplantador) return false;
    return true;
  });

  const countEl = document.getElementById('lbl-table-count');
  if (countEl) countEl.textContent = `${dataset.length} registros`;

  const head  = document.getElementById('table-head');
  const body  = document.getElementById('table-body');
  const table = document.getElementById('table-clientes');
  if (!head || !body || !table) return;

  table.style.minWidth = 'max-content';

  // Cabeçalho
  head.innerHTML = `<tr>
    <th class="px-3 py-2 w-10 sticky left-0 z-30 bg-[#fafafa] border-r border-[#eee]"></th>
    ${cols.map(col =>
      `<th class="px-3 py-2 text-left whitespace-nowrap font-bold text-[11px] uppercase text-[#666]" style="min-width:${col.width}px">${col.label}</th>`
    ).join('')}
  </tr>`;

  // Linhas
  body.innerHTML = dataset.map(c => {
    const cells = cols.map(col => {
      const raw = c[col.key];
      const val = raw !== undefined && raw !== null ? String(raw) : '';
      return `<td
        class="px-3 py-2 cursor-pointer hover:bg-[#eef4ff] transition-colors"
        onclick="_tableStartEdit(this, ${c.id}, '${col.key}')"
        title="Clique para editar"
      >${_tableCellDisplay(col, val)}</td>`;
    }).join('');

    return `<tr class="hover:bg-[#f8fafc] transition-colors group" data-id="${c.id}">
      <td class="px-2 py-2 sticky left-0 z-10 bg-white border-r border-[#eee] group-hover:bg-[#f8fafc] transition-colors text-center">
        <button
          onclick="event.stopPropagation(); abrirModalCliente(${c.id})"
          title="Abrir card completo"
          class="w-7 h-7 rounded-lg flex items-center justify-center mx-auto text-[#aaa] hover:text-[#002726] hover:bg-[#d6f5c7] transition-all cursor-pointer"
        ><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg></button>
      </td>
      ${cells}
    </tr>`;
  }).join('');
}

function abrirModalNovoCliente() {
  modalClienteId = null;
  applyTeamToModal();
  preencherFormulario({});

  // Reset header for new record
  const title = document.getElementById('modal-company-title');
  const initials = document.getElementById('modal-company-initials');
  const statusBadge = document.getElementById('lbl-modal-status-badge');
  const igBadge = document.getElementById('lbl-modal-ig-badge');
  const topBadge = document.getElementById('badge-modal-top-especialista');
  if (title) title.textContent = 'Novo Registro';
  if (initials) initials.textContent = '+';
  if (statusBadge) statusBadge.textContent = currentTeam === 'blv' ? 'Fase: —' : 'Status: —';
  if (igBadge) igBadge.classList.add('hidden');
  if (topBadge) topBadge.classList.add('hidden');

  // Badge IDs
  ['id','cnpj','idEmpresa','idMoskit'].forEach(f => {
    const el = document.getElementById(`badge-txt-${f}`);
    if (el) el.textContent = '—';
  });

  // Hide delete, update save label
  const excluir = document.getElementById('btn-modal-excluir');
  const salvar = document.getElementById('btn-modal-salvar');
  if (excluir) excluir.classList.add('hidden');
  if (salvar) salvar.textContent = 'Criar Registro';

  // Clear timeline
  const countEl = document.getElementById('lbl-timeline-notes-count');
  const container = document.getElementById('list-timeline-notes');
  if (countEl) countEl.textContent = '0 registros';
  if (container) container.innerHTML = '<div class="text-center text-xs text-[#aaa] py-6">Nenhuma nota registrada</div>';

  switchModalTab('contato');
  const overlay = document.getElementById('card-modal-overlay');
  if (overlay) { overlay.classList.remove('hidden'); overlay.classList.add('flex'); }
  document.body.style.overflow = 'hidden';

  // Focus first field
  setTimeout(() => document.getElementById('inp-modal-empresa')?.focus(), 60);
}
