// ── Base de Conhecimento ──────────────────────────────────────────────────────

const BC_CATEGORIAS = {
  ig:    { label: 'Implantação',  cor: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  blv:   { label: 'Loja Virtual', cor: 'bg-purple-50 text-purple-700 border border-purple-100' },
  geral: { label: 'Geral',        cor: 'bg-slate-100 text-slate-600 border border-slate-200' },
};

let _pendingUploadFile = null;
let _bcTabAtiva = 'todos';

async function renderBaseConhecimentoView() {
  const el = document.getElementById('view-section-base-conhecimento');
  if (!el) return;

  const isAdmin = currentUser?.role === 'admin';

  el.innerHTML = `
  <div class="flex-1 flex flex-col overflow-hidden bg-[#F4F4F4]">
    <!-- Header -->
    <div class="shrink-0 bg-[#002726] px-6 py-5 flex items-center justify-between gap-4 shadow-lg">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7F76FF] to-[#93F574] flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-[#002726]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        </div>
        <div>
          <h1 class="text-base font-bold text-white">Base de Conhecimento</h1>
          <p class="text-xs text-white/50 mt-0.5">Documentos usados pelo Link IA para responder perguntas</p>
        </div>
      </div>
      ${isAdmin ? `
      <label id="btn-upload-doc" class="flex items-center gap-2 bg-[#93F574] text-[#002726] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#7ee860] transition-colors shadow">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
        Enviar Documento
        <input type="file" id="input-doc-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="bcUploadArquivo(event)" />
      </label>` : ''}
    </div>

    <!-- Seletor de categoria (aparece após selecionar arquivo - admin) -->
    <div id="bc-categoria-picker" class="hidden shrink-0 px-6 py-4 bg-white border-b border-[#e0e0e0] flex flex-wrap items-center gap-3">
      <span class="text-xs font-semibold text-[#555]">Arquivo: <span id="bc-picker-filename" class="font-mono text-[#002726]"></span></span>
      <span class="text-xs text-[#888]">→ Este documento é do time:</span>
      <div class="flex gap-2">
        ${Object.entries(BC_CATEGORIAS).map(([k, v]) => `
        <label class="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name="bc-cat-radio" value="${k}" ${k === 'geral' ? 'checked' : ''} class="accent-[#7F76FF]" />
          <span class="text-xs font-medium text-[#333]">${v.label}</span>
        </label>`).join('')}
      </div>
      <button type="button" onclick="bcConfirmarUpload()"
        class="ml-auto text-xs font-bold bg-[#002726] text-white px-4 py-2 rounded-xl hover:bg-[#003d3c] transition-colors cursor-pointer">
        Enviar ↑
      </button>
      <button type="button" onclick="bcCancelarUpload()"
        class="text-xs text-[#aaa] hover:text-rose-500 cursor-pointer">Cancelar</button>
    </div>

    <!-- Status do upload -->
    <div id="bc-upload-status" class="hidden shrink-0 px-6 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center gap-2">
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      <span id="bc-upload-msg">Processando arquivo...</span>
    </div>

    <!-- Abas (admin vê todas; agentes não precisam de abas) -->
    ${isAdmin ? `
    <div class="shrink-0 bg-white border-b border-[#e8e8e8] px-6 flex gap-1 pt-3">
      ${[
        { k: 'todos',  label: 'Todos' },
        { k: 'ig',     label: 'Implantação' },
        { k: 'blv',    label: 'Loja Virtual' },
        { k: 'geral',  label: 'Geral' },
      ].map(t => `
      <button type="button" id="bc-tab-${t.k}" onclick="bcTrocarAba('${t.k}')"
        class="text-xs font-semibold px-4 py-2 rounded-t-lg border-b-2 transition-colors cursor-pointer bc-tab-btn
          ${t.k === 'todos' ? 'border-[#7F76FF] text-[#7F76FF]' : 'border-transparent text-[#888] hover:text-[#555]'}">
        ${t.label}
      </button>`).join('')}
    </div>` : ''}

    <!-- Conteúdo -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-3xl mx-auto">
        ${!isAdmin ? `
        <div class="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 flex items-start gap-3">
          <svg class="w-4 h-4 mt-0.5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Estes são os documentos do seu time disponíveis para consulta no <strong>Link IA</strong>.</span>
        </div>` : ''}
        <div id="bc-docs-list" class="space-y-3">
          <div class="flex items-center gap-2 text-xs text-[#999]">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Carregando documentos...
          </div>
        </div>
      </div>
    </div>
  </div>`;

  _bcTabAtiva = 'todos';
  await bcCarregarDocs();
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function bcTrocarAba(aba) {
  _bcTabAtiva = aba;
  document.querySelectorAll('.bc-tab-btn').forEach(btn => {
    const isAtivo = btn.id === `bc-tab-${aba}`;
    btn.classList.toggle('border-[#7F76FF]', isAtivo);
    btn.classList.toggle('text-[#7F76FF]', isAtivo);
    btn.classList.toggle('border-transparent', !isAtivo);
    btn.classList.toggle('text-[#888]', !isAtivo);
  });
  bcRenderizarDocs(window._bcDocsCache || []);
}

// ── Carregar e renderizar ─────────────────────────────────────────────────────

async function bcCarregarDocs() {
  const lista = document.getElementById('bc-docs-list');
  if (!lista) return;

  try {
    const res = await apiFetch('/api/base-conhecimento');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    const docs = await res.json();
    if (!Array.isArray(docs)) throw new Error('Resposta inesperada. Verifique se a coluna categoria_time foi adicionada.');
    window._bcDocsCache = docs;
    bcRenderizarDocs(docs);
  } catch (e) {
    if (lista) lista.innerHTML = `<div class="text-xs text-rose-600 p-3">Erro ao carregar documentos: ${e.message}</div>`;
  }
}

function bcRenderizarDocs(docs) {
  const lista = document.getElementById('bc-docs-list');
  if (!lista) return;

  const filtrados = _bcTabAtiva === 'todos' ? docs : docs.filter(d => d.categoriaTime === _bcTabAtiva);

  if (filtrados.length === 0) {
    lista.innerHTML = `
      <div class="text-center py-16 text-[#aaa]">
        <div class="text-5xl mb-4">📄</div>
        <p class="font-semibold text-[#888]">Nenhum documento nesta categoria</p>
        <p class="text-xs mt-1">Faça upload de PDFs ou DOCX para alimentar a IA.</p>
      </div>`;
    return;
  }

  const isAdmin = currentUser?.role === 'admin';
  lista.innerHTML = filtrados.map(d => {
    const cat = BC_CATEGORIAS[d.categoriaTime] || BC_CATEGORIAS.geral;
    const isPdf = d.tipoArquivo?.includes('pdf');
    return `
    <div class="bg-white rounded-2xl border border-[#eee] p-4 flex items-center gap-4 shadow-sm" id="bc-doc-${d.id}">
      <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${isPdf ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}">
        ${isPdf
          ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
          : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm text-[#002726] truncate">${d.nomeArquivo}</p>
        <p class="text-[10px] text-[#aaa] mt-0.5">Enviado em ${new Date(d.criadoEm).toLocaleDateString('pt-BR')} às ${new Date(d.criadoEm).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</p>
      </div>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.cor}">${cat.label}</span>
      <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${isPdf ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}">
        ${isPdf ? 'PDF' : 'DOCX'}
      </span>
      ${isAdmin ? `
      <button type="button" onclick="bcRemoverDoc(${d.id})"
        class="w-8 h-8 rounded-xl flex items-center justify-center text-[#ccc] hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>` : ''}
    </div>`;
  }).join('');
}

// ── Upload com seletor de categoria ──────────────────────────────────────────

async function bcUploadArquivo(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = '';

  const isAdmin = currentUser?.role === 'admin';

  if (isAdmin) {
    // Mostra o seletor de categoria antes de enviar
    _pendingUploadFile = file;
    const picker = document.getElementById('bc-categoria-picker');
    const fname = document.getElementById('bc-picker-filename');
    if (picker) picker.classList.remove('hidden');
    if (fname) fname.textContent = file.name;
  } else {
    // Agente: usa o time dele automaticamente
    const team = currentUser?.teams?.[0] || 'geral';
    await _bcExecutarUpload(file, team);
  }
}

function bcCancelarUpload() {
  _pendingUploadFile = null;
  const picker = document.getElementById('bc-categoria-picker');
  if (picker) picker.classList.add('hidden');
}

async function bcConfirmarUpload() {
  if (!_pendingUploadFile) return;
  const checked = document.querySelector('input[name="bc-cat-radio"]:checked');
  const categoriaTime = checked?.value || 'geral';
  const picker = document.getElementById('bc-categoria-picker');
  if (picker) picker.classList.add('hidden');
  await _bcExecutarUpload(_pendingUploadFile, categoriaTime);
  _pendingUploadFile = null;
}

async function _bcExecutarUpload(file, categoriaTime) {
  const status = document.getElementById('bc-upload-status');
  const msg = document.getElementById('bc-upload-msg');
  if (status) {
    status.classList.remove('hidden', 'bg-rose-50', 'border-rose-100', 'text-rose-700');
    status.classList.add('bg-blue-50', 'border-blue-100', 'text-blue-700');
  }
  if (msg) msg.textContent = `Processando "${file.name}"...`;

  const formData = new FormData();
  formData.append('arquivo', file);
  formData.append('categoriaTime', categoriaTime);

  try {
    const token = getAccessToken();
    const res = await fetch('/api/base-conhecimento/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no upload');

    if (msg) msg.textContent = `✅ "${file.name}" adicionado com sucesso!`;
    setTimeout(() => status?.classList.add('hidden'), 3000);
    await bcCarregarDocs();
  } catch (e) {
    if (status) {
      status.classList.remove('bg-blue-50', 'border-blue-100', 'text-blue-700');
      status.classList.add('bg-rose-50', 'border-rose-100', 'text-rose-700');
    }
    if (msg) msg.textContent = `❌ Erro: ${e.message}`;
    setTimeout(() => {
      status?.classList.add('hidden');
      status?.classList.remove('bg-rose-50', 'border-rose-100', 'text-rose-700');
      status?.classList.add('bg-blue-50', 'border-blue-100', 'text-blue-700');
    }, 4000);
  }
}

// ── Remover documento ─────────────────────────────────────────────────────────

async function bcRemoverDoc(id) {
  if (!confirm('Remover este documento da base de conhecimento?')) return;
  try {
    const res = await apiFetch(`/api/base-conhecimento/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover');
    const el = document.getElementById(`bc-doc-${id}`);
    if (el) {
      if (window._bcDocsCache) window._bcDocsCache = window._bcDocsCache.filter(d => d.id !== id);
      el.remove();
      const lista = document.getElementById('bc-docs-list');
      if (lista && lista.children.length === 0) bcRenderizarDocs([]);
    }
  } catch (e) {
    alert('Erro ao remover: ' + e.message);
  }
}
