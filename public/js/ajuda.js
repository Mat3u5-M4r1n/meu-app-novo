// ── Central de Ajuda + Documentação Técnica ────────────────────────────────
// Gera todo o conteúdo dinamicamente via innerHTML para manter index.html enxuto.

let _ajudaActiveCategory = 'primeiros-passos';
let _docsActiveSection   = 'visao-geral';

// ─────────────────────────────────────────────────────────────────────────────
// CENTRAL DE AJUDA
// ─────────────────────────────────────────────────────────────────────────────
function renderHelpView() {
  const el = document.getElementById('view-section-ajuda');
  if (!el) return;
  el.innerHTML = `
  <div class="flex-1 flex flex-col overflow-hidden bg-[#F4F4F4]">

    <!-- Header -->
    <div class="shrink-0 bg-[#002726] px-6 py-5 flex items-center gap-4 shadow-lg">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#93F574] to-[#7F76FF] flex items-center justify-center shrink-0">
        <svg class="w-5 h-5 text-[#002726]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <div>
        <h1 class="text-base font-bold text-white">Central de Ajuda</h1>
        <p class="text-xs text-white/50 mt-0.5">Guia completo de uso do Bling LINK Operacional</p>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="shrink-0 bg-white border-b border-[#eee] px-4 flex gap-1 overflow-x-auto">
      ${[
        { id: 'primeiros-passos', label: '🚀 Primeiros Passos' },
        { id: 'kanban',           label: '📋 Kanban & Cards' },
        { id: 'recursos',         label: '🔗 Links & Integrações' },
        { id: 'permissoes',       label: '🔐 Permissões & Times' },
        { id: 'solicitacoes',     label: '📬 Solicitações Internas' },
        { id: 'faq',              label: '❓ FAQ' },
      ].map(c => `
        <button type="button" onclick="ajudaSwitchCategory('${c.id}')"
          id="ajuda-tab-${c.id}"
          class="ajuda-tab shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${_ajudaActiveCategory === c.id ? 'border-[#93F574] text-[#002726]' : 'border-transparent text-[#888] hover:text-[#002726]'}">
          ${c.label}
        </button>`).join('')}
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-4xl mx-auto space-y-5" id="ajuda-content-area">
        ${_ajudaRenderCategory(_ajudaActiveCategory)}
      </div>
    </div>
  </div>`;
}

function ajudaSwitchCategory(id) {
  _ajudaActiveCategory = id;
  // Update tabs
  document.querySelectorAll('.ajuda-tab').forEach(btn => {
    const active = btn.id === `ajuda-tab-${id}`;
    btn.classList.toggle('border-[#93F574]', active);
    btn.classList.toggle('text-[#002726]', active);
    btn.classList.toggle('border-transparent', !active);
    btn.classList.toggle('text-[#888]', !active);
  });
  document.getElementById('ajuda-content-area').innerHTML = _ajudaRenderCategory(id);
}

function _card(icon, title, content) {
  return `<div class="bg-white rounded-2xl border border-[#eee] overflow-hidden shadow-sm">
    <div class="px-5 py-4 border-b border-[#eee] bg-[#fafafa] flex items-center gap-2.5">
      <span class="text-base">${icon}</span>
      <h2 class="font-bold text-sm text-[#002726]">${title}</h2>
    </div>
    <div class="p-5 text-sm text-[#444] space-y-3">${content}</div>
  </div>`;
}

function _accordion(items) {
  return `<div class="space-y-2">${items.map((item, i) => `
    <div class="border border-[#eee] rounded-xl overflow-hidden">
      <button type="button" onclick="ajudaToggleAccordion(this)"
        class="w-full flex items-center justify-between px-4 py-3 bg-[#fafafa] hover:bg-[#f0f0f0] transition-colors cursor-pointer text-left">
        <span class="text-sm font-semibold text-[#002726]">${item.q}</span>
        <svg class="w-4 h-4 text-[#888] shrink-0 transition-transform duration-200 accordion-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div class="accordion-body hidden px-4 py-3 text-sm text-[#555] border-t border-[#eee] bg-white space-y-1.5">${item.a}</div>
    </div>`).join('')}
  </div>`;
}

function ajudaToggleAccordion(btn) {
  const body = btn.nextElementSibling;
  const chevron = btn.querySelector('.accordion-chevron');
  body.classList.toggle('hidden');
  chevron.classList.toggle('rotate-180');
}

function _step(n, text) {
  return `<div class="flex items-start gap-3">
    <span class="w-6 h-6 rounded-full bg-[#002726] text-[#93F574] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">${n}</span>
    <span>${text}</span>
  </div>`;
}

function _tip(text) {
  return `<div class="p-3 bg-[#93F574]/10 border border-[#93F574]/30 rounded-xl text-xs text-[#003d3c]">💡 <strong>Dica:</strong> ${text}</div>`;
}

function _warn(text) {
  return `<div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">⚠️ ${text}</div>`;
}

function _ajudaRenderCategory(id) {
  switch(id) {
    case 'primeiros-passos': return _helpPrimeirosPassos();
    case 'kanban':           return _helpKanban();
    case 'recursos':         return _helpRecursos();
    case 'permissoes':       return _helpPermissoes();
    case 'solicitacoes':     return _helpSolicitacoes();
    case 'faq':              return _helpFaq();
    default: return '';
  }
}

function _helpPrimeirosPassos() {
  return _card('🔑', 'Como acessar o sistema (Login com Magic Link)', `
    <p>O Bling LINK usa autenticação por <strong>Magic Link</strong> — não há senha para memorizar. Siga os passos:</p>
    <div class="space-y-2 mt-2">
      ${_step(1, 'Acesse <code class="bg-[#f0f0f0] px-1 rounded font-mono">http://localhost:3000</code> no seu navegador.')}
      ${_step(2, 'Informe o seu <strong>e-mail corporativo @bling.com.br</strong> e clique em <strong>Enviar Link de Acesso</strong>.')}
      ${_step(3, 'Verifique sua caixa de entrada. Um e-mail com o link de acesso chegará em até 1 minuto (verifique spam).')}
      ${_step(4, 'Clique no link do e-mail. Você será redirecionado automaticamente ao sistema já logado.')}
      ${_step(5, 'O sistema valida seu e-mail e direciona para o painel correto conforme seu perfil (Admin ou Agente).')}
    </div>
    ${_tip('O link expira em 1 hora e só pode ser usado uma vez. Se expirar, basta solicitar um novo na tela de login.')}
    ${_warn('Apenas e-mails autorizados podem acessar o sistema. Contas fora da lista RBAC recebem erro 403 mesmo com link válido.')}
  `) + _card('🗂️', 'Entendendo a Interface', `
    <p>A interface é dividida em três áreas principais:</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 text-xs">
      <div class="p-3 bg-[#002726] text-white rounded-xl">
        <div class="font-bold text-[#93F574] mb-1">① Menu Lateral</div>
        <p class="text-white/70">Navegação entre módulos. Recolhível. Mostra o time ativo (IG ou BLV) e o perfil do usuário.</p>
      </div>
      <div class="p-3 bg-[#f8fafc] border border-[#eee] rounded-xl">
        <div class="font-bold text-[#002726] mb-1">② Topbar</div>
        <p class="text-[#666]">Barra superior com busca, filtro por implantador e alternar tema claro/escuro.</p>
      </div>
      <div class="p-3 bg-[#f8fafc] border border-[#eee] rounded-xl">
        <div class="font-bold text-[#002726] mb-1">③ Área de Conteúdo</div>
        <p class="text-[#666]">O módulo ativo: Kanban, Planilha, Agenda, Métricas, etc.</p>
      </div>
    </div>
    <p class="mt-3">Para alternar entre os times <strong>IG</strong> e <strong>BLV</strong> (se o seu perfil tiver acesso aos dois), use o seletor de time no menu lateral.</p>
  `);
}

function _helpKanban() {
  return _card('📋', 'O Kanban — Visão Geral das Colunas', `
    <p>O Kanban é a tela principal. Cada coluna representa uma fase do processo de implantação. Os cards são os clientes.</p>
    <div class="space-y-1.5 text-xs mt-3">
      ${[
        ['bg-indigo-100 text-indigo-800','Em contato','Primeiro contato foi realizado. Aguardando resposta do cliente.'],
        ['bg-amber-100 text-amber-800','Agenda enviada','Link de agendamento enviado. Cliente ainda não escolheu horário.'],
        ['bg-sky-100 text-sky-800','Agendada','Sessão marcada com data e hora confirmadas.'],
        ['bg-blue-100 text-blue-800','Hoje','Sessão acontece hoje.'],
        ['bg-emerald-100 text-emerald-800','Em andamento','Sessão em curso ou recém-encerrada.'],
        ['bg-purple-100 text-purple-800','Enviar gravação','Sessão concluída; falta enviar o link da gravação.'],
        ['bg-orange-100 text-orange-800','Solicitou reagendamento','Cliente pediu nova data.'],
        ['bg-emerald-200 text-emerald-950','Concluído','Implantação finalizada com sucesso.'],
        ['bg-rose-100 text-rose-800','Solicitação de estorno','Cliente solicitou cancelamento/reembolso.'],
        ['bg-rose-200 text-rose-900','Estorno','Processo de estorno em andamento ou concluído.'],
      ].map(([badge, label, desc]) => `
        <div class="flex items-center gap-2 p-2 rounded-xl bg-[#fafafa] border border-[#f0f0f0]">
          <span class="px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${badge}">${label}</span>
          <span class="text-[#555]">${desc}</span>
        </div>`).join('')}
    </div>
  `) + _card('✏️', 'Criar um Novo Card', `
    <div class="space-y-2">
      ${_step(1, 'Clique no botão <strong class="bg-[#93F574] text-[#002726] px-2 py-0.5 rounded-lg font-bold">+ Novo Registro</strong> na barra superior direita do Kanban.')}
      ${_step(2, 'Preencha os campos obrigatórios: <strong>Nome da empresa</strong>. Os demais campos podem ser completados depois.')}
      ${_step(3, 'Selecione o <strong>Status</strong> desejado para determinar em qual coluna o card vai aparecer.')}
      ${_step(4, 'Clique em <strong>Salvar</strong>. O card aparecerá imediatamente na coluna correta.')}
    </div>
    ${_tip('Campos marcados com a badge <span class="bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-1.5 rounded-full">Auto</span> são preenchidos automaticamente pela integração Jestor e não podem ser editados manualmente.')}
  `) + _card('🖊️', 'Editar um Card Existente', `
    <p>Clique sobre qualquer card para abrir o painel de detalhes. Ele contém 6 abas:</p>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mt-2">
      ${[
        ['Contato','Nome, CNPJ, telefone, e-mails, cidade, plano.'],
        ['Implantação','Status, implantador, agenda, links Octa e Meet.'],
        ['Pré/Pós','Informações de alinhamento prévio e resumo pós-sessão.'],
        ['Reagenda/Estorno','Controle de reagendamentos e cancelamentos.'],
        ['Conexões','Vínculo com outros times ou sistemas.'],
        ['Outro Time','Dados do mesmo CNPJ no time oposto (IG ↔ BLV).'],
      ].map(([tab, desc]) => `<div class="p-2.5 bg-[#fafafa] border border-[#eee] rounded-xl"><strong class="block text-[#002726] mb-0.5">${tab}</strong>${desc}</div>`).join('')}
    </div>
    <p class="mt-3">O painel lateral exibe a <strong>Timeline de Notas</strong> — registros cronológicos de interações. Veja mais em <em>Links &amp; Integrações → Cruzamento de CNPJ</em>.</p>
    ${_tip('Ao abrir um card com CNPJ preenchido, a aba <strong>Outro Time</strong> e a timeline mostrarão automaticamente dados do time oposto para o mesmo CNPJ.')}
  `) + _card('🔁', 'Mover um Card de Fase', `
    <p>Há duas formas de mudar a fase de um card:</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
      <div class="p-3 bg-[#f8fafc] border border-[#eee] rounded-xl">
        <strong class="text-[#002726] block mb-1">Opção A — Via Modal</strong>
        <ol class="list-decimal list-inside space-y-1 text-[#555]">
          <li>Clique no card para abrir o modal.</li>
          <li>Vá à aba <strong>Implantação</strong>.</li>
          <li>Altere o campo <strong>Status</strong>.</li>
          <li>Clique em <strong>Salvar Alterações</strong>.</li>
        </ol>
      </div>
      <div class="p-3 bg-[#f8fafc] border border-[#eee] rounded-xl">
        <strong class="text-[#002726] block mb-1">Opção B — Seletor Rápido no Card</strong>
        <p class="text-[#555]">Alguns cards exibem um mini-seletor de status diretamente no card (badge colorido clicável), permitindo alteração sem abrir o modal.</p>
      </div>
    </div>
  `) + _card('📝', 'Registrar uma Nota / Interação', `
    <div class="space-y-2">
      ${_step(1, 'Abra o card do cliente clicando sobre ele.')}
      ${_step(2, 'No painel direito (Timeline), localize o campo de texto <em>"Nova nota…"</em>.')}
      ${_step(3, 'Digite a observação, ligação realizada, ou qualquer evento relevante.')}
      ${_step(4, 'Clique em <strong>Registrar Nota</strong>. A nota é gravada com data, hora e seu nome de usuário.')}
    </div>
    <p class="mt-2 text-xs text-[#666]">As notas ficam visíveis para toda a equipe e são exibidas em ordem cronológica decrescente. Se o cliente estiver em ambos os times (IG e BLV), as notas dos dois aparecem juntas na mesma timeline.</p>
  `);
}

function _helpRecursos() {
  return _card('🔗', 'Cruzamento de CNPJ entre IG e BLV', `
    <p>Este é um dos recursos mais poderosos do sistema. Um mesmo cliente pode ter registros em ambos os times (Implantação Guiada e Bling Loja Virtual). O sistema une esses dados automaticamente pelo CNPJ.</p>
    <p class="mt-2"><strong>Como funciona na prática:</strong></p>
    <div class="space-y-2 mt-2">
      ${_step('A', '<strong>Aba "Outro Time"</strong> — ao abrir um card com CNPJ preenchido, o sistema faz uma consulta simultânea (<code class="bg-[#f0f0f0] px-1 rounded font-mono">GET /api/cross-lookup/:cnpj</code>) nas duas tabelas e exibe os dados do time oposto diretamente no modal.')}
      ${_step('B', '<strong>Timeline Unificada</strong> — as notas de IG e BLV do mesmo CNPJ são combinadas (<code class="bg-[#f0f0f0] px-1 rounded font-mono">GET /api/timeline-cnpj/:cnpj</code>) e exibidas em uma única timeline cronológica, identificadas por badges coloridas que indicam a origem.')}
    </div>
    ${_tip('Se um cliente da IG também comprou a Loja Virtual, todas as interações de ambos os times ficam visíveis em um único lugar, sem precisar trocar de aba ou de time.')}
    ${_warn('O cruzamento depende do CNPJ estar preenchido corretamente nos dois registros. Se os CNPJs tiverem formatação diferente (com/sem pontuação), o match pode não funcionar.')}
  `) + _card('📱', 'Botão WhatsApp — Como Funciona', `
    <p>O botão <strong>📱 WhatsApp</strong> presente nos cards do Kanban abre uma conversa direta com o cliente.</p>
    <div class="space-y-1.5 text-xs mt-2">
      <div class="p-2.5 bg-[#f8fafc] border border-[#eee] rounded-xl"><strong class="text-[#002726]">Para o time IG:</strong> O link é montado dinamicamente como <code class="font-mono bg-[#f0f0f0] px-1 rounded">https://wa.me/55{numero}</code> usando o campo <em>Whatsapp</em> do cliente. Remover caracteres não-numéricos automaticamente.</div>
      <div class="p-2.5 bg-[#f8fafc] border border-[#eee] rounded-xl"><strong class="text-[#002726]">Para o time BLV:</strong> Abre o <em>app.octadesk.com/chat</em> (redirecionamento para o Octadesk).</div>
    </div>
    ${_tip('O número deve estar no campo "Whatsapp" no formato correto (ex: 51999990000). O sistema adiciona o código do país automaticamente.')}
  `) + _card('💬', 'Botão Octadesk — Como Funciona', `
    <p>O botão <strong>💬 Octa</strong> aparece nos cards quando o campo <em>Conversa Octa</em> está preenchido.</p>
    <div class="space-y-1.5 text-xs mt-2">
      <div class="p-2.5 bg-[#f8fafc] border border-[#eee] rounded-xl">O link armazenado no campo <em>Conversa Octa</em> (aba Implantação) aponta diretamente para o ticket/conversa desse cliente no Octadesk.</div>
      <div class="p-2.5 bg-[#f8fafc] border border-[#eee] rounded-xl"><strong>Se o campo estiver vazio:</strong> o botão fica oculto no card e no modal. Preencha o campo para o botão aparecer.</div>
    </div>
    ${_tip('A integração Jestor pode preencher o campo Conversa Octa automaticamente via webhook, eliminando a necessidade de colar o link manualmente.')}
  `) + _card('📹', 'Botão Meet — Como Funciona', `
    <p>O botão <strong>📹 Meet</strong> (no modal e como atalho) abre a sala do Google Meet configurada para o cliente.</p>
    <p class="text-xs text-[#666] mt-1">O link é armazenado no campo <strong>Link do Meet</strong> (aba Implantação). Esse campo é marcado como <em>Auto</em> — é preenchido automaticamente pela integração com o Jestor/Calendar quando a agenda é criada.</p>
  `);
}

function _helpPermissoes() {
  return _card('🔐', 'Perfis de Acesso — Admin vs Agente', `
    <div class="overflow-x-auto">
      <table class="w-full text-xs border-collapse">
        <thead><tr class="text-left bg-[#002726] text-white"><th class="px-3 py-2 rounded-tl-lg">Funcionalidade</th><th class="px-3 py-2 text-center">Agente</th><th class="px-3 py-2 text-center rounded-tr-lg">Admin</th></tr></thead>
        <tbody class="divide-y divide-[#eee]">
          ${[
            ['Ver e editar cards do seu time','✅','✅'],
            ['Ver métricas e agenda','✅','✅'],
            ['Registrar notas','✅','✅'],
            ['Abrir solicitações internas','✅','✅'],
            ['Ver cards de ambos os times','❌','✅'],
            ['Ajustes & Importação de CSV','❌','✅'],
            ['Documentação Técnica','❌','✅'],
            ['Redefinir dados para padrão','❌','✅'],
          ].map(([feat, agente, admin]) => `<tr class="text-[#444]"><td class="px-3 py-2">${feat}</td><td class="px-3 py-2 text-center">${agente}</td><td class="px-3 py-2 text-center">${admin}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `) + _card('👥', 'Times — IG vs BLV', `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div class="p-4 bg-[#002726] text-white rounded-xl">
        <div class="font-bold text-[#93F574] mb-2">IG — Implantação Guiada</div>
        <ul class="text-white/70 text-xs space-y-1 list-disc list-inside">
          <li>Gerencia clientes com sessões de implantação ao vivo.</li>
          <li>Colunas específicas: Em contato, Agendada, Em andamento, Enviar gravação…</li>
          <li>Integração com Jestor, Calendly e Google Calendar.</li>
          <li>Contador de reagendamentos e fluxo de estorno.</li>
        </ul>
      </div>
      <div class="p-4 bg-[#7F76FF]/10 border border-[#7F76FF]/20 rounded-xl">
        <div class="font-bold text-[#4a41cc] mb-2">BLV — Bling Loja Virtual</div>
        <ul class="text-[#555] text-xs space-y-1 list-disc list-inside">
          <li>Gerencia clientes de loja virtual.</li>
          <li>Colunas baseadas em fases de setup da loja.</li>
          <li>Módulo de Atividades dedicado para registrar ações de suporte.</li>
          <li>Cross-lookup com IG via CNPJ.</li>
        </ul>
      </div>
    </div>
    ${_tip('Usuários com acesso a ambos os times veem o seletor de time no menu lateral. A troca de time recarrega os dados automaticamente.')}
  `);
}

function _helpSolicitacoes() {
  return _card('📬', 'O que são Solicitações Internas?', `
    <p>O módulo <strong>Solicitações Internas</strong> (ícone de balão no menu) é um canal de comunicação entre a equipe de implantação e o time de Operações/TI.</p>
    <p class="mt-2">Use para:</p>
    <ul class="list-disc list-inside text-[#555] space-y-1 text-xs mt-1">
      <li>Solicitar novas funcionalidades no sistema.</li>
      <li>Reportar bugs ou comportamentos incorretos.</li>
      <li>Pedir integrações com novas ferramentas.</li>
      <li>Solicitar ajustes nos fluxos ou campos.</li>
    </ul>
  `) + _card('➕', 'Como Abrir uma Solicitação', `
    <div class="space-y-2">
      ${_step(1, 'Clique em <strong>Solicitações Internas</strong> no menu lateral (ícone de balão).')}
      ${_step(2, 'Na tela inicial, clique em <strong>+ Nova Solicitação</strong>.')}
      ${_step(3, 'Preencha: <strong>Título</strong> (breve), <strong>Categoria</strong> (Bug, Melhoria, Integração, etc.) e <strong>Descrição detalhada</strong>.')}
      ${_step(4, 'Clique em <strong>Enviar</strong>. A solicitação aparece na lista com status <em>Aberto</em>.')}
    </div>
    ${_tip('Quanto mais detalhada a descrição, mais rápido a equipe técnica consegue agir. Inclua prints ou exemplos quando possível.')}
  `) + _card('📊', 'Acompanhando o Status', `
    <p>As solicitações passam pelos seguintes status:</p>
    <div class="flex flex-wrap gap-2 mt-2 text-xs">
      ${[['bg-blue-100 text-blue-800','Aberto'],['bg-amber-100 text-amber-800','Em análise'],['bg-purple-100 text-purple-800','Em desenvolvimento'],['bg-emerald-100 text-emerald-800','Concluído'],['bg-slate-100 text-slate-800','Cancelado']].map(([cls, s]) => `<span class="px-2.5 py-1 rounded-full font-semibold ${cls}">${s}</span>`).join('')}
    </div>
    <p class="mt-3 text-xs text-[#666]">O admin pode editar o status de qualquer solicitação diretamente na lista. Todos os membros da equipe veem as atualizações em tempo real.</p>
  `);
}

function _helpFaq() {
  return `<div class="bg-white rounded-2xl border border-[#eee] overflow-hidden shadow-sm">
    <div class="px-5 py-4 border-b border-[#eee] bg-[#fafafa] flex items-center gap-2.5">
      <span class="text-base">❓</span>
      <h2 class="font-bold text-sm text-[#002726]">Perguntas Frequentes</h2>
    </div>
    <div class="p-4">
    ${_accordion([
      { q: 'O Magic Link expirou. O que faço?', a: 'Acesse a tela de login e solicite um novo link. O processo é instantâneo. O link anterior é invalidado automaticamente.' },
      { q: 'O botão de Octa não aparece no card. Por quê?', a: 'O botão só aparece quando o campo <strong>Conversa Octa</strong> (aba Implantação do modal) tem uma URL preenchida. Cole o link da conversa Octadesk nesse campo e salve.' },
      { q: 'Alterei o status de um card mas ele não se moveu de coluna.', a: 'Verifique se o status digitado corresponde exatamente ao nome de uma coluna existente. O Kanban faz match exato entre o valor do campo e os <em>statuses</em> configurados na coluna.' },
      { q: 'A timeline do card está mostrando notas de outro time. É um bug?', a: 'Não. Esse é o comportamento esperado. A timeline unificada combina notas do IG e do BLV para o mesmo CNPJ, identificando cada uma com a badge do time de origem.' },
      { q: 'Posso excluir um card?', a: 'Sim, apenas usuários com perfil <strong>Admin</strong> veem o botão de exclusão no modal (canto inferior esquerdo). Agentes não têm permissão para excluir registros.' },
      { q: 'A importação de CSV apagou meus dados. Como recuperar?', a: 'Usuários Admin podem usar o botão <strong>Restaurar dados padrão</strong> em Ajustes & Importação, que recarrega o snapshot de dados original. Certifique-se de ter um backup do CSV antes de importar.' },
      { q: 'Como funciona o campo "Enviado por"?', a: 'Esse campo é preenchido automaticamente pelo Jestor quando uma agenda é enviada. Ele indica qual usuário disparou o convite. Não é editável manualmente.' },
      { q: 'A busca no Kanban não encontra o cliente. Por quê?', a: 'A busca filtra por empresa, contato e outros campos visíveis no card. Se o campo que você quer buscar estiver oculto, ative-o em <strong>Campos no Card</strong> na topbar. A busca não lê campos que não estão sendo exibidos.' },
      { q: 'Posso acessar o sistema de casa?', a: 'O servidor roda em <code class="bg-[#f0f0f0] px-1 rounded font-mono">localhost:3000</code> — ou seja, precisa estar rodando na máquina local. Para acesso remoto, seria necessário publicar o servidor em um domínio externo (não configurado por padrão).' },
      { q: 'Como adiciono um novo usuário autorizado?', a: 'O acesso é controlado pelo objeto <code class="bg-[#f0f0f0] px-1 rounded font-mono">USERS</code> no arquivo <code class="bg-[#f0f0f0] px-1 rounded font-mono">server.js</code>. Um Admin deve adicionar o novo e-mail, nome, perfil (role) e times manualmente no código e reiniciar o servidor.' },
    ])}
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTAÇÃO TÉCNICA
// ─────────────────────────────────────────────────────────────────────────────
function renderDocsView() {
  const el = document.getElementById('view-section-docs');
  if (!el) return;
  el.innerHTML = `
  <div class="flex flex-1 min-w-0 overflow-hidden">

    <!-- Sidebar de Navegação -->
    <nav class="w-56 shrink-0 bg-white border-r border-[#eee] flex flex-col overflow-y-auto select-none">
      <div class="p-4 border-b border-[#eee]">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#002726] flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-[#93F574]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <div>
            <div class="text-xs font-bold text-[#002726]">Documentação</div>
            <div class="text-[10px] text-[#888]">Wiki Técnica</div>
          </div>
        </div>
      </div>
      <div class="flex-1 p-3 space-y-0.5">
        ${[
          { id: 'visao-geral',  label: 'Visão Geral', icon: '🏗️' },
          { id: 'arquitetura',  label: 'Arquitetura',  icon: '⚙️' },
          { id: 'autenticacao', label: 'Autenticação', icon: '🔐' },
          { id: 'banco-dados',  label: 'Banco de Dados',icon: '🗄️' },
          { id: 'rotas-api',    label: 'Rotas da API', icon: '🛣️' },
          { id: 'frontend',     label: 'Frontend',     icon: '🖥️' },
          { id: 'codigo-server',label: 'server.js',    icon: '📄' },
          { id: 'codigo-data',  label: 'data.js',      icon: '📄' },
          { id: 'codigo-main',  label: 'main.js',      icon: '📄' },
          { id: 'codigo-modal', label: 'modal.js',     icon: '📄' },
          { id: 'integracao',   label: 'Integrações',  icon: '🔌' },
        ].map(s => `
          <button type="button" onclick="docsSwitchSection('${s.id}')" id="docs-nav-${s.id}"
            class="docs-nav-btn w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${_docsActiveSection === s.id ? 'bg-[#002726] text-[#93F574]' : 'text-[#555] hover:bg-[#f5f5f5] hover:text-[#002726]'}">
            <span class="shrink-0">${s.icon}</span>
            <span class="truncate">${s.label}</span>
          </button>`).join('')}
      </div>
      <div class="p-3 border-t border-[#eee]">
        <span class="text-[10px] text-[#aaa] font-mono">v1.0 — Bling LINK</span>
      </div>
    </nav>

    <!-- Conteúdo -->
    <div class="flex-1 overflow-y-auto bg-[#F4F4F4]">
      <div id="docs-content-area" class="p-6 max-w-4xl mx-auto space-y-5">
        ${_docsRenderSection(_docsActiveSection)}
      </div>
    </div>
  </div>`;
}

function docsSwitchSection(id) {
  _docsActiveSection = id;
  document.querySelectorAll('.docs-nav-btn').forEach(btn => {
    const active = btn.id === `docs-nav-${id}`;
    btn.classList.toggle('bg-[#002726]', active);
    btn.classList.toggle('text-[#93F574]', active);
    btn.classList.toggle('text-[#555]', !active);
    btn.classList.toggle('hover:bg-[#f5f5f5]', !active);
    btn.classList.toggle('hover:text-[#002726]', !active);
    btn.classList.toggle('font-medium', !active);
  });
  const area = document.getElementById('docs-content-area');
  if (area) {
    area.innerHTML = _docsRenderSection(id);
    area.scrollTop = 0;
  }
}

function _docsRenderSection(id) {
  switch(id) {
    case 'visao-geral':   return _docsVisaoGeral();
    case 'arquitetura':   return _docsArquitetura();
    case 'autenticacao':  return _docsAutenticacao();
    case 'banco-dados':   return _docsBancoDados();
    case 'rotas-api':     return _docsRotasApi();
    case 'frontend':      return _docsFrontend();
    case 'codigo-server': return _docsCodigoServer();
    case 'codigo-data':   return _docsCodigoData();
    case 'codigo-main':   return _docsCodigoMain();
    case 'codigo-modal':  return _docsCodigoModal();
    case 'integracao':    return _docsIntegracao();
    default: return '';
  }
}

// ── Helpers de documentação ────────────────────────────────────────────────

function _docsCard(title, badge, content) {
  return `<div class="bg-white rounded-2xl border border-[#eee] overflow-hidden shadow-sm">
    <div class="px-5 py-4 border-b border-[#eee] bg-[#fafafa] flex items-center justify-between">
      <h2 class="font-bold text-sm text-[#002726]">${title}</h2>
      ${badge ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#002726] text-[#93F574]">${badge}</span>` : ''}
    </div>
    <div class="p-5 text-sm text-[#444] space-y-3">${content}</div>
  </div>`;
}

function _codeBlock(lang, code) {
  const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<div class="rounded-xl overflow-hidden border border-[#2a2a2a] shadow-sm mt-2">
    <div class="bg-[#1e2030] px-4 py-2 flex items-center justify-between">
      <span class="text-[10px] font-mono text-[#7F76FF] font-semibold">${lang}</span>
    </div>
    <pre class="bg-[#282c3e] text-[#cdd6f4] text-xs p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre">${escaped}</pre>
  </div>`;
}

function _explain(text) {
  return `<div class="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-[#334155] leading-relaxed">${text}</div>`;
}

function _docsVisaoGeral() {
  return _docsCard('O que é o Bling LINK Operacional', 'Sistema Interno', `
    <p>O <strong>Bling LINK Operacional</strong> é uma aplicação web interna desenvolvida para o time de Implantação da Bling. Seu objetivo é substituir planilhas manuais por um sistema colaborativo e integrado para gerenciar o ciclo de vida dos clientes em processo de implantação do ERP/e-commerce Bling.</p>
    <p>O sistema suporta dois times com bases de dados e fluxos distintos:</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
      <div class="p-3 bg-[#002726] text-white rounded-xl"><strong class="text-[#93F574]">IG — Implantação Guiada</strong><p class="text-white/70 mt-1">Clientes com sessões de implantação ao vivo (1:1). Fluxo completo de agendamento, execução e acompanhamento pós-sessão.</p></div>
      <div class="p-3 bg-[#7F76FF]/10 border border-[#7F76FF]/20 rounded-xl"><strong class="text-[#4a41cc]">BLV — Bling Loja Virtual</strong><p class="text-[#555] mt-1">Clientes focados na implantação da loja virtual Bling. Módulo de atividades de suporte e follow-up.</p></div>
    </div>
  `) + _docsCard('Stack de Tecnologias', '', `
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
      ${[
        ['Frontend','HTML5 + Tailwind CSS (CDN) + JavaScript puro. Sem framework. SPA manual com navegação por módulos.'],
        ['Backend','Node.js + Express 4. API REST com middleware de autenticação JWT e rate limiting.'],
        ['Banco de Dados','Supabase (PostgreSQL gerenciado na nuvem) com Row Level Security (RLS) habilitado.'],
        ['Autenticação','Supabase Auth — Magic Link OTP. JWT no sessionStorage. RBAC no server.js.'],
        ['Segurança','helmet, cors, express-rate-limit. CSP desabilitado (scripts inline/CDN).'],
        ['Integrações','Jestor (automação de campo), Octadesk (CRM), Google Meet, Calendly.'],
      ].map(([t,d]) => `<div class="p-3 bg-[#fafafa] border border-[#eee] rounded-xl"><strong class="text-[#002726] block mb-1">${t}</strong><span class="text-[#666]">${d}</span></div>`).join('')}
    </div>
  `);
}

function _docsArquitetura() {
  return _docsCard('Fluxo de uma Requisição (do clique ao banco)', '', `
    <p>Toda ação do usuário segue o mesmo pipeline:</p>
    <div class="space-y-2 mt-3 text-xs">
      ${[
        ['1','Usuário', 'Clica em salvar, editar, criar ou excluir.'],
        ['2','Frontend (JS)', '<code class="bg-[#f0f0f0] px-1 rounded font-mono">apiFetch(url, opts)</code> monta a requisição e injeta o JWT no header <code class="font-mono bg-[#f0f0f0] px-1 rounded">Authorization: Bearer &lt;token&gt;</code>.'],
        ['3','Express (server.js)', 'Middleware <code class="bg-[#f0f0f0] px-1 rounded font-mono">requireAuth</code> valida o JWT via <code class="bg-[#f0f0f0] px-1 rounded font-mono">supabase.auth.getUser(token)</code> e confere o RBAC.'],
        ['4','dbFor(token)', 'Cria um cliente Supabase temporário com o JWT do usuário como cabeçalho, garantindo que o RLS seja avaliado como aquele usuário específico.'],
        ['5','Supabase/PostgreSQL', 'Executa a query. O RLS valida se o usuário autenticado tem permissão para aquela linha/tabela.'],
        ['6','Response', 'O servidor converte snake_case → camelCase e retorna o JSON. O frontend atualiza o estado em memória e re-renderiza a view.'],
      ].map(([n,src,desc]) => `
        <div class="flex items-start gap-3 p-2.5 bg-[#fafafa] rounded-xl border border-[#eee]">
          <span class="w-6 h-6 rounded-full bg-[#002726] text-[#93F574] text-xs font-bold flex items-center justify-center shrink-0">${n}</span>
          <div><span class="font-bold text-[#002726]">${src}: </span><span class="text-[#555]">${desc}</span></div>
        </div>`).join('')}
    </div>
  `) + _docsCard('Conversão snake_case ↔ camelCase', 'Padrão de Dados', `
    <p class="text-sm">O banco Supabase usa <strong>snake_case</strong> (padrão PostgreSQL), mas o JavaScript usa <strong>camelCase</strong>. O <code class="bg-[#f0f0f0] px-1 rounded font-mono">server.js</code> faz a conversão automaticamente em ambas as direções:</p>
    ${_codeBlock('javascript — server.js', `// Banco → Frontend (todas as respostas passam por rowToCamel)
const rowToCamel = row =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));

// Frontend → Banco (todos os corpos de POST/PUT passam por bodyToSnake)
const bodyToSnake = obj =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), v]));

// Exceções mapeadas manualmente (conversão não-determinística)
const SNAKE_TO_CAMEL = { valor_ig: 'valorIG', dia_da_implantacao: 'diaImplantacao' };
const CAMEL_TO_SNAKE = { diaImplantacao: 'dia_da_implantacao' };`)}
    ${_explain('O mapeamento automático (regex) cobre 95% dos campos. As exceções como <code>valorIG</code> e <code>diaImplantacao</code> precisam de mapeamento manual porque a conversão automática geraria <code>valor_i_g</code> e <code>dia_implantacao</code>, que não correspondem ao nome real da coluna no banco.')}
  `);
}

function _docsAutenticacao() {
  return _docsCard('Magic Link — Fluxo Completo', 'Supabase Auth', `
    <div class="space-y-2 text-xs mt-2">
      ${[
        ['Login.html carrega','Inicializa o cliente Supabase via <code class="font-mono bg-[#f0f0f0] px-1 rounded">initSb()</code> que busca as chaves públicas em <code class="font-mono bg-[#f0f0f0] px-1 rounded">GET /api/config</code>.'],
        ['Usuário envia e-mail','<code class="font-mono bg-[#f0f0f0] px-1 rounded">sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })</code> dispara o e-mail via Supabase.'],
        ['Usuário clica no link','O Supabase redireciona para <code class="font-mono bg-[#f0f0f0] px-1 rounded">http://localhost:3000#access_token=...&refresh_token=...</code>.'],
        ['detectSessionInUrl: true','O cliente Supabase detecta os tokens no hash da URL, valida com o servidor Supabase e estabelece a sessão automaticamente.'],
        ['onAuthStateChange (SIGNED_IN)','Disparado no login.html. O frontend valida o e-mail em <code class="font-mono bg-[#f0f0f0] px-1 rounded">GET /api/auth/me</code>. Se autorizado, redireciona para <code class="font-mono bg-[#f0f0f0] px-1 rounded">/</code>.'],
        ['sessionStorage','O JWT é armazenado no <code class="font-mono bg-[#f0f0f0] px-1 rounded">sessionStorage</code> (não localStorage) — apagado ao fechar a aba.'],
        ['apiFetch()','Toda chamada de API injeta o token: <code class="font-mono bg-[#f0f0f0] px-1 rounded">Authorization: Bearer {token}</code>.'],
      ].map(([step, desc], i) => `<div class="flex items-start gap-3 p-2 border-l-2 border-[#93F574] pl-3"><span class="font-bold text-[#002726] text-[10px] uppercase tracking-wide shrink-0">${step}</span><span class="text-[#555]">${desc}</span></div>`).join('')}
    </div>
  `) + _docsCard('RBAC — Controle de Acesso por Perfil', 'server.js', `
    ${_codeBlock('javascript — server.js', `const USERS = {
  'mateus.marin@bling.com.br':    { name: 'Mateus Marin',    initials: 'MM', role: 'admin', teams: ['ig', 'blv'] },
  'manuela.curti@bling.com.br':   { name: 'Manuela Curti',   initials: 'MC', role: 'agent', teams: ['ig'] },
  'luan.cavalheiro@bling.com.br': { name: 'Luan Cavalheiro', initials: 'LC', role: 'agent', teams: ['blv'] }
};`)}
    ${_explain('<strong>Como funciona:</strong> O objeto <code>USERS</code> é a lista de acesso autorizado. Após o JWT ser validado pelo Supabase (<code>auth.getUser(token)</code>), o middleware <code>requireAuth</code> confere se o <code>user.email</code> está nesse objeto. Se não estiver, retorna <strong>403 Forbidden</strong> — mesmo que o Supabase Auth tenha autenticado o usuário com sucesso. Isso garante que só e-mails pré-autorizados acessem o sistema, mesmo que um e-mail @bling.com.br não mapeado consiga um Magic Link.')}
  `) + _docsCard('RLS — Row Level Security no Supabase', 'PostgreSQL', `
    <p>Todas as 4 tabelas têm RLS habilitado com a seguinte política:</p>
    ${_codeBlock('sql — Supabase (todas as tabelas)', `-- Política padrão: apenas usuários autenticados podem ler/escrever
CREATE POLICY "Authenticated users only"
ON public.clientes
FOR ALL
USING (auth.role() = 'authenticated');

-- O mesmo padrão se aplica a:
-- clientes_blv, atividades_loja_virtual, gestao_projetos`)}
    ${_explain('O RLS age como uma segunda camada de segurança. Mesmo que um atacante consiga a URL do Supabase e a <em>anon key</em>, não consegue ler ou escrever dados sem um JWT válido de um usuário autenticado. O servidor usa <code>dbFor(token)</code> para criar um cliente Supabase que passa o JWT do usuário no header, fazendo o RLS avaliar as permissões com a identidade real do usuário.')}
  `);
}

function _docsBancoDados() {
  const tableRow = (col, type, desc, auto) =>
    `<tr class="text-[#444] border-b border-[#f0f0f0]">
      <td class="px-3 py-2 font-mono text-[10px] text-[#002726]">${col}</td>
      <td class="px-3 py-2 text-[10px] text-[#7F76FF] font-mono">${type}</td>
      <td class="px-3 py-2 text-[10px] text-[#555]">${desc}</td>
      <td class="px-3 py-2 text-center">${auto ? '<span class="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded-full font-semibold">Auto</span>' : ''}</td>
    </tr>`;
  const table = (name, rows) =>
    `<div class="overflow-x-auto rounded-xl border border-[#eee] mt-3">
      <div class="px-4 py-2 bg-[#002726] text-[#93F574] font-mono text-xs font-bold">${name}</div>
      <table class="w-full text-xs border-collapse">
        <thead><tr class="bg-[#fafafa] text-left text-[10px] text-[#888] uppercase tracking-wide">
          <th class="px-3 py-2">Coluna</th><th class="px-3 py-2">Tipo</th><th class="px-3 py-2">Descrição</th><th class="px-3 py-2">Jestor</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  return _docsCard('Estrutura das Tabelas', '', `
    ${table('clientes (IG)',
      tableRow('id','integer','Identificador único (auto-incremento)',true) +
      tableRow('empresa','text','Nome da empresa / cliente',true) +
      tableRow('cnpj','text','CPF ou CNPJ (texto livre)',true) +
      tableRow('nome_contato','text','Nome do contato principal',true) +
      tableRow('whatsapp','text','Número de WhatsApp',true) +
      tableRow('email_da_empresa','text','E-mail corporativo',true) +
      tableRow('email_da_agenda','text','E-mail do convite de agenda',true) +
      tableRow('cidade','text','Cidade do cliente',true) +
      tableRow('estado','text','UF',true) +
      tableRow('plano','text','Plano Bling contratado',true) +
      tableRow('valor_ig','numeric','Valor da Implantação Guiada',true) +
      tableRow('cupom','text','Cupom aplicado',true) +
      tableRow('status','text','Status / fase atual do Kanban',false) +
      tableRow('implantador','text','E-mail do implantador responsável',true) +
      tableRow('agenda','text','Data e hora da sessão agendada',true) +
      tableRow('link_meet','text','URL da sala Google Meet',true) +
      tableRow('link_para_agendar','text','URL de agendamento (Calendly)',true) +
      tableRow('conversa_octa','text','URL da conversa no Octadesk',false) +
      tableRow('ig_agendada','text','Tipo de IG agendada',false) +
      tableRow('ig_comprada','text','Tipo de IG comprada',true) +
      tableRow('ig_realizada','text','Tipo de IG realizada',false) +
      tableRow('informacoes_pre','text','Anotações de alinhamento pré-sessão',false) +
      tableRow('informacoes_pos','text','Resumo pós-sessão',true) +
      tableRow('notas','jsonb','Array de notas/interações [{id, data, autor, texto, tipo}]',false) +
      tableRow('qtd_reagendamento','integer','Contador de reagendamentos',true) +
      tableRow('criado_em','timestamptz','Timestamp de criação',true) +
      tableRow('dias_atualizado','date','Data da última edição',false)
    )}
    ${table('clientes_blv (BLV)',
      tableRow('id','integer','Identificador único',true) +
      tableRow('empresa','text','Nome da empresa',true) +
      tableRow('cnpj','text','CPF/CNPJ — UNIQUE CONSTRAINT (upsert ignore-duplicates)',true) +
      tableRow('fase','text','Fase atual no Kanban BLV',false) +
      tableRow('responsavel','text','Responsável pelo cliente',false) +
      tableRow('dia_da_implantacao','text','Data da implantação BLV',true) +
      tableRow('conversa_octadesk','text','URL da conversa Octadesk',false) +
      tableRow('informacoes_pre','text','Informações pré-sessão',false) +
      tableRow('informacoes_pos','text','Informações pós-sessão',true) +
      tableRow('notas','jsonb','Array de notas',false) +
      tableRow('criado_em','timestamptz','Timestamp de criação',true)
    )}
    ${table('atividades_loja_virtual (BLV)',
      tableRow('id','integer','Identificador único',true) +
      tableRow('empresa','text','Nome da empresa vinculada',false) +
      tableRow('titulo','text','Título da atividade',false) +
      tableRow('followup','text','Descrição da ação realizada',false) +
      tableRow('criado_por','text','Usuário que criou',false) +
      tableRow('criado_em','timestamptz','Timestamp de criação',true)
    )}
    ${table('gestao_projetos (Solicitações Internas)',
      tableRow('id','integer','Identificador único',true) +
      tableRow('titulo','text','Título da solicitação',false) +
      tableRow('descricao','text','Descrição detalhada',false) +
      tableRow('categoria','text','Bug, Melhoria, Integração, etc.',false) +
      tableRow('status','text','Aberto, Em análise, Concluído, etc.',false) +
      tableRow('data_solicitacao','timestamptz','Data de abertura',true)
    )}
  `);
}

function _docsRotasApi() {
  const route = (method, path, auth, desc) => {
    const colors = { GET:'bg-emerald-100 text-emerald-800', POST:'bg-blue-100 text-blue-800', PUT:'bg-amber-100 text-amber-800', DELETE:'bg-rose-100 text-rose-800' };
    return `<tr class="border-b border-[#f0f0f0] text-[#444]">
      <td class="px-3 py-2"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[method]}">${method}</span></td>
      <td class="px-3 py-2 font-mono text-[10px] text-[#002726]">${path}</td>
      <td class="px-3 py-2 text-center text-xs">${auth ? '🔒' : '🌐'}</td>
      <td class="px-3 py-2 text-[11px] text-[#555]">${desc}</td>
    </tr>`;
  };
  return _docsCard('Referência de Rotas', 'server.js', `
    <p class="text-xs text-[#666] mb-3">🔒 = requer JWT válido no header <code class="font-mono bg-[#f0f0f0] px-1 rounded">Authorization: Bearer &lt;token&gt;</code> &nbsp;&nbsp; 🌐 = pública</p>
    <div class="overflow-x-auto rounded-xl border border-[#eee]">
      <table class="w-full text-xs border-collapse">
        <thead><tr class="bg-[#fafafa] text-left text-[10px] text-[#888] uppercase tracking-wide">
          <th class="px-3 py-2">Método</th><th class="px-3 py-2">Rota</th><th class="px-3 py-2">Auth</th><th class="px-3 py-2">Descrição</th>
        </tr></thead>
        <tbody>
          ${route('GET','/api/config',false,'Retorna supabaseUrl e supabaseAnonKey para o browser')}
          ${route('GET','/api/auth/me',true,'Valida JWT e retorna dados do usuário logado (nome, role, teams)')}
          ${route('POST','/api/auth/logout',false,'Endpoint simbólico — sign-out real é feito no browser via Supabase')}
          ${route('GET','/api/clientes',true,'Lista todos os clientes IG ordenados por ID')}
          ${route('GET','/api/clientes/:id',true,'Retorna um cliente IG pelo ID')}
          ${route('POST','/api/clientes',true,'Cria um novo cliente IG (auto-incrementa ID)')}
          ${route('PUT','/api/clientes/:id',true,'Atualiza um cliente IG existente (snake_case automático)')}
          ${route('DELETE','/api/clientes/:id',true,'Remove permanentemente um cliente IG')}
          ${route('POST','/api/clientes/:id/notas',true,'Adiciona uma nota ao array JSONB do cliente IG')}
          ${route('POST','/api/clientes/bulk',true,'Importação em massa — apaga tudo e reinsere o array enviado')}
          ${route('POST','/api/clientes/reset',true,'Restaura dados do arquivo data/clientes.json (snapshot padrão)')}
          ${route('GET','/api/clientes-blv',true,'Lista todos os clientes BLV')}
          ${route('POST','/api/clientes-blv',true,'Cria um novo cliente BLV')}
          ${route('PUT','/api/clientes-blv/:id',true,'Atualiza cliente BLV')}
          ${route('DELETE','/api/clientes-blv/:id',true,'Remove cliente BLV')}
          ${route('POST','/api/clientes-blv/:id/notas',true,'Adiciona nota a cliente BLV')}
          ${route('GET','/api/atividades-blv',true,'Lista atividades BLV (suporta ?empresa= para filtrar)')}
          ${route('POST','/api/atividades-blv',true,'Cria uma nova atividade BLV')}
          ${route('PUT','/api/atividades-blv/:id',true,'Atualiza atividade BLV')}
          ${route('DELETE','/api/atividades-blv/:id',true,'Remove atividade BLV')}
          ${route('GET','/api/projetos',true,'Lista solicitações internas (ordem decrescente)')}
          ${route('POST','/api/projetos',true,'Cria nova solicitação interna')}
          ${route('PUT','/api/projetos/:id',true,'Atualiza solicitação interna')}
          ${route('DELETE','/api/projetos/:id',true,'Remove solicitação interna')}
          ${route('GET','/api/cross-lookup/:cnpj',true,'Busca dados de IG e BLV simultaneamente pelo CNPJ')}
          ${route('GET','/api/timeline-cnpj/:cnpj',true,'Retorna notas combinadas de IG+BLV para o CNPJ, ordenadas por timestamp')}
        </tbody>
      </table>
    </div>
  `);
}

function _docsFrontend() {
  return _docsCard('Estrutura de Arquivos do Frontend', '', `
    ${_codeBlock('estrutura de diretórios', `public/
├── index.html          — SPA principal (HTML + Tailwind CDN)
├── login.html          — Tela de login (Magic Link)
├── logo-bling.svg      — Logo do sistema
├── css/
│   └── styles.css      — CSS customizado (dark theme, field-auto, etc.)
└── js/
    ├── supabase-client.js  — Inicialização do Supabase no browser + apiFetch()
    ├── data.js             — Estado global (CLIENTES, currentTeam) + constantes
    ├── data-blv.js         — Dados e constantes específicas do time BLV
    ├── main.js             — Auth, navegação, boot da aplicação
    ├── kanban.js           — Renderização do Kanban e gerenciamento de campos
    ├── modal.js            — Modal de edição de cliente (abas, formulário, save)
    ├── agenda.js           — Módulo de agenda
    ├── metrics.js          — Módulo de métricas e KPIs
    ├── atividades.js       — Módulo de atividades BLV
    ├── projetos.js         — Módulo de solicitações internas
    ├── settings.js         — Módulo de ajustes e importação CSV
    ├── utils.js            — Funções utilitárias (apiSalvarCliente, notas, etc.)
    ├── modal.js            — Modal de detalhes do cliente
    ├── whatsapp.js         — Modal de disparo de mensagem WhatsApp
    └── ajuda.js            — Central de Ajuda + Documentação Técnica (este arquivo)`)}
  `) + _docsCard('Ciclo de Vida da Aplicação', '', `
    <p class="text-sm">O <code class="bg-[#f0f0f0] px-1 rounded font-mono">DOMContentLoaded</code> em <strong>main.js</strong> orquestra o boot:</p>
    <div class="space-y-1.5 text-xs mt-2">
      ${[
        ['checkAuth()','Inicializa o cliente Supabase, verifica sessão existente. Se não houver sessão, redireciona para login.html.'],
        ['updateUserInfo()','Preenche avatar, nome e e-mail na sidebar com os dados retornados pelo /api/auth/me.'],
        ['setupTeamSelector()','Configura o seletor de time baseado nos times que o usuário tem acesso (RBAC.teams).'],
        ['applyTeamToModal()','Ajusta labels e visibilidade de campos no modal conforme o time ativo.'],
        ['carregarClientes() / carregarClientesBLV()','Busca os dados do time ativo na API e popula CLIENTES ou CLIENTES_BLV.'],
        ['initKanban()','Inicializa as colunas visíveis e os campos do card com os defaults.'],
        ['navigateToView("pipeline")','Renderiza o Kanban inicial.'],
      ].map(([fn, desc]) => `<div class="flex items-start gap-2 p-2 bg-[#fafafa] rounded-lg border border-[#eee]">
        <code class="text-[#7F76FF] font-mono text-[10px] shrink-0 pt-0.5">${fn}</code>
        <span class="text-[#555]">${desc}</span>
      </div>`).join('')}
    </div>
  `);
}

function _docsCodigoServer() {
  return _docsCard('server.js — Código Completo e Anotado', 'Backend', `
    <p class="text-xs text-[#666]">Arquivo principal do servidor. Roda em Node.js na porta 3000.</p>
  `) + _docsCard('Bloco 1 — Imports e configurações iniciais', '', `
    ${_codeBlock('javascript', `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path    = require('path');
const helmet  = require('helmet');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app  = express();
const PORT = 3000;

// Cliente de validação JWT — NÃO faz queries, só valida tokens
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);`)}
    ${_explain('<strong>NODE_TLS_REJECT_UNAUTHORIZED = \'0\'</strong>: desativa verificação de certificado SSL. Necessário em redes corporativas com proxy SSL (man-in-the-middle). Em produção, remova esta linha.<br><br><strong>supabase (cliente global)</strong>: usado APENAS para chamar <code>auth.getUser(token)</code> e validar JWTs. Não faz queries no banco — isso é feito por clientes por-requisição (dbFor).')}
  `) + _docsCard('Bloco 2 — RBAC e Rate Limiters', '', `
    ${_codeBlock('javascript', `const USERS = {
  'mateus.marin@bling.com.br':    { name: 'Mateus Marin',    initials: 'MM', role: 'admin', teams: ['ig', 'blv'] },
  'manuela.curti@bling.com.br':   { name: 'Manuela Curti',   initials: 'MC', role: 'agent', teams: ['ig'] },
  'luan.cavalheiro@bling.com.br': { name: 'Luan Cavalheiro', initials: 'LC', role: 'agent', teams: ['blv'] }
};

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20 }); // 20 tentativas/15min
const apiLimiter  = rateLimit({ windowMs: 60*1000,    max: 500 }); // 500 req/min
const webhookLimiter = rateLimit({ windowMs: 60*1000, max: 60 });  // 60 webhooks/min`)}
    ${_explain('<strong>USERS</strong>: dicionário que mapeia e-mail → perfil. Qualquer e-mail fora desse objeto é rejeitado com 403, independente de ter JWT válido.<br><br><strong>authLimiter</strong>: protege rotas <code>/api/auth/*</code> de força bruta — 20 tentativas em 15 minutos por IP.<br><strong>apiLimiter</strong>: protege todas as rotas <code>/api/*</code> de abuso — 500 requisições por minuto por IP.')}
  `) + _docsCard('Bloco 3 — requireAuth (middleware central)', '', `
    ${_codeBlock('javascript', `async function requireAuth(req, res, next) {
  // 1. Extrai o token do header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Não autenticado' });

  const token = authHeader.slice(7); // remove "Bearer "

  // 2. Valida o JWT junto ao Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user)
    return res.status(401).json({ error: 'Token inválido ou expirado' });

  // 3. Confere RBAC — e-mail precisa estar na lista USERS
  const rbac = USERS[user.email];
  if (!rbac)
    return res.status(403).json({ error: 'Acesso não autorizado para este e-mail' });

  // 4. Injeta usuário e cliente DB na requisição
  req.user = { email: user.email, ...rbac };
  req.db   = dbFor(token); // cliente Supabase com JWT do usuário → RLS ativo
  next();
}`)}
    ${_explain('<strong>Dupla validação:</strong> primeiro o Supabase confirma que o token é válido e não expirou (401 se não), depois o RBAC confirma que o e-mail está na lista permitida (403 se não). Isso cria duas barreiras independentes.<br><br><strong>req.db = dbFor(token)</strong>: cada requisição recebe um cliente Supabase efêmero que passa o JWT do usuário como header. O banco PostgreSQL usa esse JWT para avaliar as policies de RLS — o banco sabe exatamente qual usuário está fazendo a query.')}
  `) + _docsCard('Bloco 4 — dbFor() e cross-lookup', '', `
    ${_codeBlock('javascript', `// Cliente por-requisição: usa o JWT do usuário para satisfazer o RLS
function dbFor(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: \`Bearer \${accessToken}\` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// Cross-lookup: consulta IG e BLV ao mesmo tempo pelo CNPJ
app.get('/api/cross-lookup/:cnpj', requireAuth, async (req, res) => {
  const [igResult, blvResult] = await Promise.all([
    req.db.from('clientes').select('*').eq('cnpj', req.params.cnpj).maybeSingle(),
    req.db.from('clientes_blv').select('*').eq('cnpj', req.params.cnpj).maybeSingle()
  ]);
  res.json({
    ig:  igResult.data  ? rowToCamel(igResult.data)  : null,
    blv: blvResult.data ? rowToCamel(blvResult.data) : null
  });
});

// Timeline unificada: combina notas de IG + BLV pelo CNPJ
app.get('/api/timeline-cnpj/:cnpj', requireAuth, async (req, res) => {
  const [igResult, blvResult] = await Promise.all([
    req.db.from('clientes').select('notas').eq('cnpj', req.params.cnpj).maybeSingle(),
    req.db.from('clientes_blv').select('notas').eq('cnpj', req.params.cnpj).maybeSingle()
  ]);
  const igNotas  = (igResult.data?.notas  || []).map(n => ({ ...n, _source: 'ig' }));
  const blvNotas = (blvResult.data?.notas || []).map(n => ({ ...n, _source: 'blv' }));
  // Ordena por timestamp do ID (n-1234567890 = "n-" + Date.now())
  const combined = [...igNotas, ...blvNotas].sort((a, b) => {
    const ta = parseInt((a.id || '').replace('n-', '')) || 0;
    const tb = parseInt((b.id || '').replace('n-', '')) || 0;
    return tb - ta; // mais recente primeiro
  });
  res.json(combined);
});`)}
    ${_explain('<strong>dbFor(token)</strong>: não reutiliza conexões — cria um cliente novo por requisição. Isso é intencional: garante que o RLS sempre avalie com o token correto do usuário que fez aquela requisição específica. <code>persistSession: false</code> e <code>autoRefreshToken: false</code> evitam side-effects de sessão em contexto de servidor.<br><br><strong>Promise.all</strong>: as duas queries acontecem em paralelo, reduzindo a latência do cross-lookup pela metade comparado com duas queries sequenciais.<br><br><strong>_source tag</strong>: cada nota recebe um campo <code>_source: \'ig\'</code> ou <code>\'blv\'</code> antes de entrar no array combinado. O frontend usa essa tag para exibir um badge colorido indicando de qual time veio a nota.')}
  `);
}

function _docsCodigoData() {
  return _docsCard('data.js — Estado Global e Constantes', 'Frontend', `
    ${_codeBlock('javascript', `// ── Estado global ─────────────────────────────────────────────────────
let CLIENTES     = [];      // Array de clientes IG carregados da API
let CLIENTES_BLV = [];      // Array de clientes BLV
let currentTeam  = 'ig';   // 'ig' | 'blv' — time ativo no momento
let currentUser  = null;   // Objeto retornado por /api/auth/me após login

// ── Funções de acesso ao estado ativo ─────────────────────────────────
function getActiveClientes()      { return currentTeam === 'ig' ? CLIENTES : CLIENTES_BLV; }
function getActiveApiBase()        { return currentTeam === 'ig' ? '/api/clientes' : '/api/clientes-blv'; }
function getActiveStatusList()     { return currentTeam === 'ig' ? STATUS_LIST : BLV_STATUS_LIST; }
function getActiveDefaultCardFields() { return currentTeam === 'ig' ? DEFAULT_KANBAN_CARD_FIELDS : BLV_DEFAULT_CARD_FIELDS; }
function getActiveStatusKey()      { return currentTeam === 'ig' ? 'status' : 'fase'; }`)}
    ${_explain('<strong>Estado global em memória</strong>: toda a aplicação opera sobre CLIENTES e CLIENTES_BLV que ficam em RAM. Não há re-fetch a cada render — os dados são carregados uma vez no boot e atualizados localmente após cada operação de save/create/delete.<br><br><strong>Funções getActive*()</strong>: abstraem a diferença entre IG e BLV. Ao chamar <code>getActiveClientes()</code>, o chamador não precisa saber qual time está ativo — ele sempre recebe o array correto. Isso permite que toda a lógica de Kanban, Planilha e Modal funcione sem condicionais de time.')}
  `) + _docsCard('Estrutura de um Registro (cliente IG)', '', `
    ${_codeBlock('javascript — exemplo de objeto em memória', `{
  id: 1042,
  empresa: "Empresa Exemplo LTDA",
  cnpj: "12.345.678/0001-90",
  nomeContato: "João Silva",
  whatsapp: "51999990000",
  emailDaEmpresa: "joao@empresa.com.br",
  emailDaAgenda: "joao@empresa.com.br",
  cidade: "Porto Alegre",
  estado: "RS",
  plano: "Platina",
  valorIG: 299.00,
  status: "Agendada",
  implantador: "augusto.la-rocca@bling.com.br",
  agenda: "2026-09-20 14:00 - 15:30",
  linkMeet: "https://meet.google.com/abc-defg-hij",
  linkParaAgendar: "https://calendly.com/...",
  conversaOcta: "https://app.octadesk.com/...",
  igAgendada: "E-commerce Essencial",
  igComprada: "E-commerce Essencial",
  informacoesPre: "Cliente já usou outro ERP. Quer migrar estoque.",
  informacoesPos: "",
  topEspecialista: false,
  qtdReagendamento: 0,
  notas: [
    { id: "n-1726300000000", data: "14/09/2026, 10:32:00", autor: "Mateus Marin",
      texto: "Primeiro contato realizado. Cliente confirmou agenda.", tipo: "contato" }
  ],
  criadoEm: "2026-09-10T09:00:00.000Z",
  diasAtualizado: "2026-09-14"
}`)}
    ${_explain('Esse é o formato exato do objeto em memória após o <code>rowToCamel</code> no servidor. O campo <code>notas</code> é um array JSON armazenado como <strong>JSONB</strong> no PostgreSQL — permite queries diretas no banco mas é tratado como array JavaScript no frontend.')}
  `);
}

function _docsCodigoMain() {
  return _docsCard('main.js — Autenticação e Navegação', 'Frontend', `
    ${_codeBlock('javascript', `// ── Verificação de autenticação no boot ──────────────────────────────
async function checkAuth() {
  try {
    const sb = await initSupabase(); // inicializa cliente Supabase no browser
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = '/login.html'; return null; }

    const res = await apiFetch('/api/auth/me'); // valida RBAC no servidor
    if (res.status === 401 || res.status === 403) {
      await sb.auth.signOut();
      window.location.href = '/login.html';
      return null;
    }
    return await res.json(); // { name, email, role, teams, initials }
  } catch {
    window.location.href = '/login.html';
    return null;
  }
}

// ── Navegação entre módulos ───────────────────────────────────────────
function navigateToView(view) {
  if (view === 'ajustes' && currentUser?.role !== 'admin') return; // guard
  if (view === 'docs'    && currentUser?.role !== 'admin') return; // guard

  currentView = view;
  const navIds = ['pipeline','lista','agenda','relatorios','atividades','projetos','ajustes','ajuda','docs'];

  navIds.forEach(id => {
    const btn = document.getElementById(\`nav-item-\${id}\`);
    if (!btn) return;
    const active = id === view;
    btn.classList.toggle('bg-[#93F574]',   active);
    btn.classList.toggle('text-[#002726]', active);
    btn.classList.toggle('text-white/70',  !active);
  });

  switchViewDisplay(view);   // mostra/oculta as divs de view
  renderCurrentActiveView(); // chama o renderizador da view
}`)}
    ${_explain('<strong>checkAuth()</strong>: dupla verificação — primeiro checa a sessão local no Supabase (sem requisição de rede), depois valida o RBAC no servidor. Se qualquer uma falhar, vai para login.<br><br><strong>navigateToView()</strong>: gerencia toda a navegação da SPA. Ao trocar de módulo, atualiza o highlight do botão no menu lateral, mostra/oculta as divs correspondentes e chama a função de renderização daquele módulo. Guards impedem agentes de acessar /ajustes e /docs.')}
  `);
}

function _docsCodigoModal() {
  return _docsCard('modal.js — Gerenciamento do Modal de Detalhes', 'Frontend', `
    ${_codeBlock('javascript', `// ── Campos bloqueados (preenchidos pelo Jestor/automação) ────────────
const IG_AUTO_FIELD_IDS = [
  'inp-modal-empresa', 'inp-modal-nomeContato', 'inp-modal-cnpj',
  'inp-modal-whatsapp', 'inp-modal-emailDaEmpresa', 'inp-modal-emailDaAgenda',
  'inp-modal-cidade', 'inp-modal-estado', 'inp-modal-plano',
  'inp-modal-situacaoDaConta', 'inp-modal-regimeTributario',
  'inp-modal-valorIG', 'inp-modal-cupom', 'inp-modal-dataInscricao',
  'inp-modal-igComprada', 'inp-modal-linkParaAgendar', 'inp-modal-agenda',
  'inp-modal-enviadoPor', 'inp-modal-linkMeet',
  'inp-modal-informacoesPos', 'inp-modal-linkReagenda', 'inp-modal-qtdReagendamento'
];

function aplicarBloqueiosIG(aplicar) {
  IG_AUTO_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (aplicar) {
      el.tagName === 'SELECT'
        ? el.setAttribute('disabled', '')
        : el.setAttribute('readonly', '');
      el.classList.add('field-auto'); // estilo cinza via CSS
    } else {
      el.removeAttribute('disabled');
      el.removeAttribute('readonly');
      el.classList.remove('field-auto');
    }
  });
}`)}
    ${_explain('<strong>Campo Auto vs Manual:</strong> mapeados do CSV "Jestor - link.csv". Campos com "Automático" são somente leitura para o agente — o Jestor os preenche via webhook. Campos "Manual" ficam editáveis.<br><br><strong>readonly vs disabled:</strong> inputs usam <code>readonly</code> (o valor ainda é lido pelo JS), selects usam <code>disabled</code> (selects não suportam readonly). Em ambos os casos, <code>element.value</code> retorna o valor atual — o save funciona normalmente.')}
  `) + _docsCard('coletarFormulario() — Como o Save Funciona', '', `
    ${_codeBlock('javascript', `function coletarFormulario() {
  const get    = id => document.getElementById(id)?.value?.trim() ?? '';
  const getChk = id => document.getElementById(id)?.checked ?? false;

  if (currentTeam === 'blv') {
    return { /* campos BLV */ };
  }

  // Retorna objeto camelCase — o servidor converte para snake_case
  return {
    empresa: get('inp-modal-empresa'),
    status:  get('inp-modal-status'),      // Manual — editável
    implantador: get('inp-modal-implantador'), // Manual
    conversaOcta: get('inp-modal-conversaOcta'), // Manual
    linkMeet: get('inp-modal-linkMeet'),   // Auto mas preservado
    agenda:   get('inp-modal-agenda'),     // Auto mas preservado
    // ... todos os campos (auto e manual) são coletados
    diasAtualizado: new Date().toISOString().slice(0, 10)
  };
}

async function salvarClienteFormModal(event) {
  const dados   = coletarFormulario();
  const cliente = getActiveClientes().find(c => c.id === modalClienteId);
  await apiSalvarCliente({ ...cliente, ...dados }); // merge: dados sobrescreve cliente
}`)}
    ${_explain('<strong>Merge strategy:</strong> <code>{ ...cliente, ...dados }</code> — o objeto "cliente" tem os valores originais carregados da API. "dados" tem os valores atuais do formulário. Ao fazer merge, campos que não estão em "dados" mantêm o valor original. Isso garante que campos auto (como linkMeet) preservem seu valor mesmo sem o usuário ter editado.')}
  `);
}

function _docsIntegracao() {
  return _docsCard('Integração via API REST — Sistemas Externos', '', `
    <p>Sistemas externos (Jestor, Octadesk, n8n, Zapier, Make) podem criar e atualizar registros via API REST. É necessário um JWT válido de usuário Admin.</p>
    ${_codeBlock('http — Criar cliente BLV (com ignore-duplicates)', `POST https://ixlmzswxliwakdjrkxrh.supabase.co/rest/v1/clientes_blv
Content-Type: application/json
Authorization: Bearer <SERVICE_ROLE_KEY>
Prefer: resolution=ignore-duplicates

{
  "empresa":   "Empresa via Jestor",
  "cnpj":      "12.345.678/0001-90",
  "fase":      "Aguardando Contato",
  "responsavel": "luan.cavalheiro@bling.com.br"
}`)}
    ${_explain('<strong>Prefer: resolution=ignore-duplicates</strong>: instrui o PostgREST (API do Supabase) a usar <code>ON CONFLICT DO NOTHING</code> internamente. Funciona apenas se houver uma <code>UNIQUE CONSTRAINT</code> na coluna (ex: cnpj em clientes_blv). Se o CNPJ já existir, a operação é ignorada silenciosamente — sem erro, sem duplicata.<br><br>Para atualizar em vez de ignorar, use <code>Prefer: resolution=merge-duplicates</code>.')}
  `) + _docsCard('Criar/Atualizar via API do LINK (com autenticação RBAC)', '', `
    ${_codeBlock('http — Criar cliente IG via server.js', `POST http://localhost:3000/api/clientes
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN_ADMIN>

{
  "empresa":     "Empresa Exemplo",
  "cnpj":        "12.345.678/0001-90",
  "nomeContato": "Maria Silva",
  "whatsapp":    "51999990000",
  "status":      "Agendada",
  "implantador": "augusto.la-rocca@bling.com.br",
  "agenda":      "2026-09-25 14:00 - 15:30"
}`)}
    ${_codeBlock('http — Atualizar status de um cliente', `PUT http://localhost:3000/api/clientes/1042
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN_ADMIN>

{
  "status":         "Concluído",
  "igRealizada":    "E-commerce Essencial",
  "informacoesPos": "Cliente finalizou implantação com sucesso."
}`)}
    ${_explain('O servidor faz o merge automático: apenas os campos enviados no body são atualizados. O resto é mantido pelo Supabase (query UPDATE com os campos enviados, não um replace completo). O snake_case é aplicado automaticamente antes da query.')}
  `);
}
