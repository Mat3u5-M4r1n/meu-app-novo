let whatsappClienteId = null;
let currentWaTemplate = 'agenda_enviada';

const WA_TEMPLATES = {
  'agenda_enviada': {
    label: '📅 Agenda Enviada',
    gerarTexto: (c) => `Olá ${c.nomeContato || c.empresa}! 😊\n\nEstou enviando os dados da sua Implantação Guiada *${c.igAgendada || ''}* no Bling.\n\n📅 *Data e Hora:* ${c.agenda || '(a confirmar)'}\n🎯 *Tipo:* ${c.igAgendada || ''}\n\n${c.linkMeet ? `🔗 *Link da reunião:* ${c.linkMeet}\n\n` : ''}Qualquer dúvida, estou à disposição!\n\nAtenciosamente,\n${c.implantador ? c.implantador.split('@')[0] : 'Equipe Bling'} 🚀`
  },
  'confirmacao': {
    label: '✅ Confirmação',
    gerarTexto: (c) => `Olá ${c.nomeContato || c.empresa}! 👋\n\nPassando para confirmar nossa Implantação Guiada marcada para *${c.agenda || 'hoje'}*!\n\n${c.linkMeet ? `🔗 Acesse pelo link: ${c.linkMeet}\n\n` : ''}Você confirma presença? 😊`
  },
  'reagendamento': {
    label: '🔄 Reagendamento',
    gerarTexto: (c) => `Olá ${c.nomeContato || c.empresa}! 😊\n\nPrecisamos reagendar sua Implantação Guiada *${c.igAgendada || ''}*.\n\nPode escolher um novo horário pelo link abaixo?\n\n🔗 ${gerarLinkAgenda(c.implantador, c.igAgendada, c.id)}\n\nQualquer dúvida é só me chamar! 🙏`
  },
  'gravacao': {
    label: '🎬 Gravação',
    gerarTexto: (c) => `Olá ${c.nomeContato || c.empresa}! 😊\n\nSegue a gravação da sua Implantação Guiada *${c.igRealizada || c.igAgendada || ''}*:\n\n${c.linkGravacao1 ? `📹 *Gravação 1:* ${c.linkGravacao1}\n` : ''}${c.linkGravacao2 ? `📹 *Gravação 2:* ${c.linkGravacao2}\n` : ''}${c.linkAnotacoes1 ? `\n📝 *Anotações:* ${c.linkAnotacoes1}\n` : ''}\nQualquer dúvida, estou à disposição!\n\nAtenciosamente,\n${c.implantador ? c.implantador.split('@')[0] : 'Equipe Bling'} 🚀`
  },
  'sem_contato': {
    label: '📞 Sem Contato',
    gerarTexto: (c) => `Olá ${c.nomeContato || c.empresa}! 👋\n\nEstou tentando entrar em contato para tratar sobre sua Implantação Guiada *${c.igAgendada || ''}* do Bling.\n\nPoderia me retornar quando possível?\n\nAbraços,\n${c.implantador ? c.implantador.split('@')[0] : 'Equipe Bling'} 😊`
  }
};

function abrirDisparoWhatsModal(clienteId) {
  whatsappClienteId = clienteId || modalClienteId;
  const cliente = CLIENTES.find(c => c.id === whatsappClienteId);
  if (!cliente) return;

  const subtitle = document.getElementById('lbl-whats-cliente-subtitle');
  if (subtitle) subtitle.textContent = `${cliente.empresa} • ${cliente.whatsapp ? formatPhone(cliente.whatsapp) : 'Sem telefone'}`;

  renderWaTemplateGrid(cliente);
  updateWhatsMessagePreview();

  const modal = document.getElementById('modal-disparo-whats');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
}

function fecharDisparoWhatsModal() {
  const modal = document.getElementById('modal-disparo-whats');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  whatsappClienteId = null;
}

function renderWaTemplateGrid(cliente) {
  const container = document.getElementById('grid-whats-templates');
  if (!container) return;
  container.innerHTML = Object.entries(WA_TEMPLATES).map(([key, tpl]) => `
    <button type="button" onclick="selectWaTemplate('${key}')" class="text-xs px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer border ${currentWaTemplate === key ? 'bg-[#002726] text-[#93F574] border-[#002726]' : 'bg-white text-[#555] border-[#e8e8e8] hover:border-[#002726]'}">
      ${tpl.label}
    </button>`).join('');
}

function selectWaTemplate(key) {
  currentWaTemplate = key;
  const cliente = CLIENTES.find(c => c.id === whatsappClienteId);
  if (cliente) { renderWaTemplateGrid(cliente); updateWhatsMessagePreview(); }
}

function updateWhatsMessagePreview() {
  const cliente = CLIENTES.find(c => c.id === whatsappClienteId);
  if (!cliente) return;
  const tpl = WA_TEMPLATES[currentWaTemplate];
  const agendaLinkInput = document.getElementById('input-whats-agenda-link');
  const agendaLink = agendaLinkInput?.value || gerarLinkAgenda(cliente.implantador, cliente.igAgendada, cliente.id);
  const texto = tpl ? tpl.gerarTexto({ ...cliente, _agendaLink: agendaLink }) : '';
  const preview = document.getElementById('txt-whats-message-preview');
  if (preview) preview.textContent = texto;

  // Atualizar link do botão WhatsApp externo
  const waBtn = document.getElementById('btn-open-wa-external');
  if (waBtn && cliente.whatsapp) {
    const numero = '55' + cliente.whatsapp.replace(/\D/g, '');
    waBtn.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  }
}

function copiarTextoWhats() {
  const texto = document.getElementById('txt-whats-message-preview')?.textContent;
  if (!texto) return;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.querySelector('[onclick="copiarTextoWhats()"]');
    const lbl = document.getElementById('lbl-btn-copiar-whats');
    if (lbl) { lbl.textContent = 'Copiado!'; setTimeout(() => { lbl.textContent = 'Copiar Texto'; }, 2000); }
  });
}

// Fechar ao clicar no backdrop
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal-disparo-whats');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) fecharDisparoWhatsModal(); });
});
