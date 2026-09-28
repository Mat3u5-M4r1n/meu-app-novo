// ── Base de Conhecimento (Admin Only) ────────────────────────────────────────

async function renderBaseConhecimentoView() {
  const el = document.getElementById('view-section-base-conhecimento');
  if (!el) return;

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
          <p class="text-xs text-white/50 mt-0.5">Documentos usados pelo Agente IA para responder perguntas</p>
        </div>
      </div>
      <label id="btn-upload-doc" class="flex items-center gap-2 bg-[#93F574] text-[#002726] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-[#7ee860] transition-colors shadow">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
        Enviar Documento
        <input type="file" id="input-doc-upload" accept=".pdf,.doc,.docx" class="hidden" onchange="bcUploadArquivo(event)" />
      </label>
    </div>

    <!-- Upload Progress -->
    <div id="bc-upload-status" class="hidden shrink-0 px-6 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-700 flex items-center gap-2">
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      <span id="bc-upload-msg">Processando arquivo...</span>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-3xl mx-auto">

        <!-- Info box -->
        <div class="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 flex items-start gap-3">
          <svg class="w-4 h-4 mt-0.5 shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <strong>Como funciona:</strong> Faça upload de PDFs ou documentos Word (.docx) com processos, manuais, scripts de atendimento ou qualquer material de treinamento. O Agente IA (<strong>Link IA</strong>) usará esses documentos como base para responder perguntas de toda a equipe.
            <br class="mt-1" />Formatos aceitos: <strong>.pdf</strong>, <strong>.doc</strong>, <strong>.docx</strong> (até 20 MB por arquivo)
          </div>
        </div>

        <!-- Documents list -->
        <div id="bc-docs-list" class="space-y-3">
          <div class="flex items-center gap-2 text-xs text-[#999]">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Carregando documentos...
          </div>
        </div>
      </div>
    </div>
  </div>`;

  await bcCarregarDocs();
}

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
    if (!Array.isArray(docs)) throw new Error('Resposta inesperada do servidor. Verifique se a tabela base_conhecimento foi criada no Supabase.');

    if (docs.length === 0) {
      lista.innerHTML = `
        <div class="text-center py-16 text-[#aaa]">
          <div class="text-5xl mb-4">📄</div>
          <p class="font-semibold text-[#888]">Nenhum documento ainda</p>
          <p class="text-xs mt-1">Faça upload de PDFs ou DOCX para alimentar a IA.</p>
        </div>`;
      return;
    }

    lista.innerHTML = docs.map(d => `
      <div class="bg-white rounded-2xl border border-[#eee] p-4 flex items-center gap-4 shadow-sm" id="bc-doc-${d.id}">
        <div class="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${d.tipoArquivo?.includes('pdf') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}">
          ${d.tipoArquivo?.includes('pdf')
            ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>'
            : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>'}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm text-[#002726] truncate">${d.nomeArquivo}</p>
          <p class="text-[10px] text-[#aaa] mt-0.5">Enviado em ${new Date(d.criadoEm).toLocaleDateString('pt-BR')} às ${new Date(d.criadoEm).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}</p>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${d.tipoArquivo?.includes('pdf') ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}">
          ${d.tipoArquivo?.includes('pdf') ? 'PDF' : 'DOCX'}
        </span>
        <button type="button" onclick="bcRemoverDoc(${d.id})"
          class="w-8 h-8 rounded-xl flex items-center justify-center text-[#ccc] hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>`).join('');
  } catch (e) {
    lista.innerHTML = `<div class="text-xs text-rose-600 p-3">Erro ao carregar documentos: ${e.message}</div>`;
  }
}

async function bcUploadArquivo(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = '';

  const status = document.getElementById('bc-upload-status');
  const msg = document.getElementById('bc-upload-msg');
  status.classList.remove('hidden');
  msg.textContent = `Processando "${file.name}"...`;

  const formData = new FormData();
  formData.append('arquivo', file);

  try {
    const token = getAccessToken();
    const res = await fetch('/api/base-conhecimento/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no upload');

    msg.textContent = `✅ "${file.name}" adicionado com sucesso!`;
    setTimeout(() => status.classList.add('hidden'), 3000);
    await bcCarregarDocs();
  } catch (e) {
    msg.textContent = `❌ Erro: ${e.message}`;
    status.classList.remove('bg-blue-50', 'border-blue-100', 'text-blue-700');
    status.classList.add('bg-rose-50', 'border-rose-100', 'text-rose-700');
    setTimeout(() => {
      status.classList.add('hidden');
      status.classList.remove('bg-rose-50', 'border-rose-100', 'text-rose-700');
      status.classList.add('bg-blue-50', 'border-blue-100', 'text-blue-700');
    }, 4000);
  }
}

async function bcRemoverDoc(id) {
  if (!confirm('Remover este documento da base de conhecimento?')) return;
  try {
    const res = await apiFetch(`/api/base-conhecimento/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover');
    const el = document.getElementById(`bc-doc-${id}`);
    if (el) el.remove();
    const lista = document.getElementById('bc-docs-list');
    if (lista && lista.children.length === 0) await bcCarregarDocs();
  } catch (e) {
    alert('Erro ao remover: ' + e.message);
  }
}
