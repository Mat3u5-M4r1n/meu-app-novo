// ── Link IA — Floating Chat Widget ───────────────────────────────────────────

let _chatHistorico = [];
let _chatAberto = false;
let _chatMinimizado = false;

function initChatAgente() {
  const container = document.getElementById('chat-agente-container');
  if (!container) return;
  container.innerHTML = `
    <!-- Botão flutuante -->
    <button id="chat-fab" onclick="chatToggle()"
      class="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
      style="background: linear-gradient(135deg, #002726 0%, #7F76FF 100%);"
      title="Link IA — Assistente">
      <span id="chat-fab-icon" class="text-2xl leading-none select-none">🤖</span>
      <span id="chat-unread-badge" class="hidden absolute -top-1 -right-1 w-4 h-4 bg-[#93F574] rounded-full border-2 border-white"></span>
    </button>

    <!-- Janela de chat -->
    <div id="chat-window" class="hidden absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] border border-[#eee] flex flex-col overflow-hidden"
      style="height: 480px;">

      <!-- Header -->
      <div class="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0]" style="background: linear-gradient(135deg, #002726 0%, #003d3c 100%);">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0"
          style="background: linear-gradient(135deg, #93F574 0%, #7F76FF 100%);">🤖</div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-white leading-tight">Link IA</p>
          <p class="text-[10px] text-white/50">Assistente baseado na Base de Conhecimento</p>
        </div>
        <button type="button" onclick="chatMinimizar()" title="Minimizar"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"/></svg>
        </button>
        <button type="button" onclick="chatFechar()" title="Fechar e resetar"
          class="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-rose-300 hover:bg-white/10 transition-colors cursor-pointer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Mensagens -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-[#93F574] to-[#7F76FF] flex items-center justify-center text-xs shrink-0 mt-0.5">🤖</div>
          <div class="max-w-[80%] bg-white border border-[#eee] rounded-[14px] rounded-tl-sm px-3 py-2 text-xs text-[#333] shadow-sm leading-relaxed">
            Oi! Sou o <strong>Link IA</strong>, assistente dos times de Implantação e Loja Virtual. Como posso ajudar você hoje? 😊
          </div>
        </div>
      </div>

      <!-- Sugestões rápidas -->
      <div id="chat-suggestions" class="shrink-0 px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-[#f0f0f0]">
        ${[
          'Como usar o Kanban?',
          'Fluxo de reagendamento',
          'O que é o Octa?',
        ].map(s => `<button type="button" onclick="chatEnviarSugestao('${s}')"
          class="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#555] cursor-pointer whitespace-nowrap transition-colors">${s}</button>`).join('')}
      </div>

      <!-- Input -->
      <div class="shrink-0 flex items-end gap-2 p-3 bg-white border-t border-[#f0f0f0]">
        <textarea id="chat-input" rows="1" placeholder="Pergunte algo..."
          class="flex-1 resize-none rounded-xl border border-[#e0e0e0] px-3 py-2 text-xs text-[#1a1a1a] placeholder:text-[#aaa] outline-none focus:border-[#7F76FF] transition-colors bg-[#fafafa]"
          style="max-height: 80px; min-height: 36px;"
          onkeydown="chatKeyDown(event)" oninput="chatAutoResize(this)"></textarea>
        <button type="button" id="chat-send-btn" onclick="chatEnviar()"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all"
          style="background: linear-gradient(135deg, #002726 0%, #7F76FF 100%);">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  `;
}

function chatToggle() {
  if (_chatAberto && !_chatMinimizado) {
    chatMinimizar();
  } else {
    _chatAberto = true;
    _chatMinimizado = false;
    document.getElementById('chat-window').classList.remove('hidden');
    document.getElementById('chat-fab-icon').textContent = '🤖';
    setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
  }
}

function chatMinimizar() {
  _chatMinimizado = true;
  document.getElementById('chat-window').classList.add('hidden');
}

function chatFechar() {
  _chatAberto = false;
  _chatMinimizado = false;
  _chatHistorico = [];
  document.getElementById('chat-window').classList.add('hidden');
  // Reset messages to welcome
  const msgs = document.getElementById('chat-messages');
  if (msgs) msgs.innerHTML = `
    <div class="flex items-start gap-2">
      <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-[#93F574] to-[#7F76FF] flex items-center justify-center text-xs shrink-0 mt-0.5">🤖</div>
      <div class="max-w-[80%] bg-white border border-[#eee] rounded-[14px] rounded-tl-sm px-3 py-2 text-xs text-[#333] shadow-sm leading-relaxed">
        Oi! Sou o <strong>Link IA</strong>, assistente dos times de Implantação e Loja Virtual. Como posso ajudar você hoje? 😊
      </div>
    </div>`;
  const suggestions = document.getElementById('chat-suggestions');
  if (suggestions) suggestions.classList.remove('hidden');
}

function chatKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatEnviar();
  }
}

function chatAutoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

function chatEnviarSugestao(texto) {
  const input = document.getElementById('chat-input');
  if (input) input.value = texto;
  const suggestions = document.getElementById('chat-suggestions');
  if (suggestions) suggestions.classList.add('hidden');
  chatEnviar();
}

function _chatAdicionarMsg(role, texto, isLoading = false) {
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return null;

  const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).slice(2);
  const isUser = role === 'user';

  const div = document.createElement('div');
  div.id = id;
  div.className = `flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`;

  const textoFormatado = isLoading
    ? '<span class="inline-flex gap-1 items-center"><span class="w-1.5 h-1.5 bg-[#aaa] rounded-full animate-bounce" style="animation-delay:0ms"></span><span class="w-1.5 h-1.5 bg-[#aaa] rounded-full animate-bounce" style="animation-delay:150ms"></span><span class="w-1.5 h-1.5 bg-[#aaa] rounded-full animate-bounce" style="animation-delay:300ms"></span></span>'
    : texto.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  div.innerHTML = isUser
    ? `<div class="max-w-[80%] rounded-[14px] rounded-br-sm px-3 py-2 text-xs text-white shadow-sm leading-relaxed" style="background: linear-gradient(135deg, #002726, #7F76FF)">${textoFormatado}</div>`
    : `<div class="w-6 h-6 rounded-lg bg-gradient-to-br from-[#93F574] to-[#7F76FF] flex items-center justify-center text-xs shrink-0">🤖</div>
       <div class="max-w-[80%] bg-white border border-[#eee] rounded-[14px] rounded-tl-sm px-3 py-2 text-xs text-[#333] shadow-sm leading-relaxed">${textoFormatado}</div>`;

  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

async function chatEnviar() {
  const input = document.getElementById('chat-input');
  const btn = document.getElementById('chat-send-btn');
  const pergunta = input?.value?.trim();
  if (!pergunta) return;

  input.value = '';
  input.style.height = '36px';
  btn.disabled = true;
  btn.style.opacity = '0.5';

  // Esconder sugestões após primeira mensagem
  document.getElementById('chat-suggestions')?.classList.add('hidden');

  // Mensagem do usuário
  _chatAdicionarMsg('user', pergunta);
  _chatHistorico.push({ role: 'user', text: pergunta });

  // Loading
  const loadingId = _chatAdicionarMsg('ia', '', true);

  try {
    const res = await apiFetch('/api/chat-agente', {
      method: 'POST',
      body: JSON.stringify({ pergunta, historico: _chatHistorico.slice(-10) })
    });
    const data = await res.json();

    // Remove loading
    document.getElementById(loadingId)?.remove();

    if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

    const resposta = data.resposta;
    _chatAdicionarMsg('ia', resposta);
    _chatHistorico.push({ role: 'ia', text: resposta });

  } catch (e) {
    document.getElementById(loadingId)?.remove();
    _chatAdicionarMsg('ia', `Eita, deu um erro aqui: ${e.message}. Tenta de novo! 😬`);
  } finally {
    btn.disabled = false;
    btn.style.opacity = '1';
    input?.focus();
  }
}
