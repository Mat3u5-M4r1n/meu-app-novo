function formatCNPJ(cnpj) {
  if (!cnpj) return '';
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  return cnpj;
}

function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return phone;
}

function gerarLinkAgenda(implantador, igAgendada, id) {
  const idStr = String(id || '');
  if (implantador === 'luiza.job@bling.com.br') return `https://calendly.com/luiza-job-bling/implantacao-guiada-com-luiza-oliveira/?a1=${idStr}`;
  if (implantador === 'filipe.azevedo@bling.com.br') return `https://calendly.com/d/cs8p-c63-4qw/?a1=${idStr}`;
  if (implantador === 'elaine.costa@bling.com.br') return `https://calendly.com/d/csh7-m8r-p9w/?a1=${idStr}`;
  if (implantador === 'edenilson.borba@bling.com.br') return `https://calendly.com/d/ct39-bg3-wbm/?a1=${idStr}`;
  if (implantador === 'augusto.la-rocca@bling.com.br') return `https://calendly.com/d/cqy3-g4s-2xh/?a1=${idStr}`;
  if (implantador === 'gabriela.machado@bling.com.br') return `https://calendly.com/d/ct5g-r24-crf/?a1=${idStr}`;
  if (implantador === 'gabriel.fonseca@bling.com.br') return `https://calendly.com/d/csk7-f4z-mzc/?a1=${idStr}`;
  if (implantador === 'leonardo.lopes@bling.com.br') return `https://calendly.com/d/ctx5-b93-k99/?&a1=${idStr}`;
  if (igAgendada === 'E-commerce Essencial') return `https://calendly.com/d/cp7g-3zx-622/?a1=${idStr}`;
  if (igAgendada === 'Loja Física Essencial') return `https://calendly.com/d/d3tw-qgn-6tz/?a1=${idStr}`;
  if (igAgendada === 'Loja Física Avançado') return `https://calendly.com/d/crvt-rk7-24x/?a1=${idStr}`;
  if (igAgendada === 'E-commerce Avançado') return `https://calendly.com/d/crss-6v2-864/?a1=${idStr}`;
  if (igAgendada === 'Serviços' || igAgendada === 'Gestão Fiscal') return `https://calendly.com/d/cq8f-jzg-ccz/?a1=${idStr}`;
  if (igAgendada === 'Migração de sistema') return `https://calendly.com/d/cndm-qh3-4ww/?a1=${idStr}`;
  if (igAgendada === 'Dominando Finanças') return `https://calendly.com/d/cq4m-r5m-k7w/?a1=${idStr}`;
  if (igAgendada === 'Meu Negócio e Relatórios') return `https://calendly.com/d/cw26-2jk-2rp/?a1=${idStr}`;
  if (igAgendada === 'Nota de Importação') return `https://calendly.com/d/cnv8-fnd-vcr/?a1=${idStr}`;
  if (igAgendada === 'Loja Virtual Bling') return `https://calendly.com/d/cvds-xx3-n7t/implantacao-guiada-loja-virtual-bling/?a1=${idStr}`;
  if (igAgendada === 'Multiempresa') return `https://calendly.com/d/cvpt-nmr-r8w/?a1=${idStr}`;
  return `https://calendly.com/d/cp7g-3zx-622/?a1=${idStr}`;
}

// Salvar cliente via API (team-aware)
async function apiSalvarCliente(clienteAtualizado) {
  const base = getActiveApiBase();
  const res = await apiFetch(`${base}/${clienteAtualizado.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clienteAtualizado)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status} ao salvar`);
  }
  const salvo = await res.json();
  const dataset = getActiveClientes();
  const idx = dataset.findIndex(c => c.id === salvo.id);
  if (idx !== -1) dataset[idx] = salvo;
  return salvo;
}

// Adicionar nota via API (team-aware)
async function apiAdicionarNota(clienteId, nota) {
  const base = getActiveApiBase();
  const res = await apiFetch(`${base}/${clienteId}/notas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nota)
  });
  return await res.json();
}

// Excluir cliente via API (team-aware)
async function apiExcluirCliente(clienteId) {
  const base = getActiveApiBase();
  await apiFetch(`${base}/${clienteId}`, { method: 'DELETE' });
  const dataset = getActiveClientes();
  const idx = dataset.findIndex(c => c.id === clienteId);
  if (idx !== -1) dataset.splice(idx, 1);
}

// Criar cliente via API (team-aware)
async function apiCriarCliente(dados) {
  const base = getActiveApiBase();
  const res = await apiFetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${res.status} ao criar`);
  }
  const novo = await res.json();
  getActiveClientes().push(novo);
  return novo;
}

function updateFooterStats() {
  if (currentTeam === 'blv') {
    const dataset = CLIENTES_BLV;
    const el = id => document.getElementById(id);
    if (el('ft-stat-pendentes')) el('ft-stat-pendentes').textContent = dataset.filter(c => c.fase === 'Em implantação' || c.fase === 'Contato conectado').length;
    if (el('ft-stat-hoje')) el('ft-stat-hoje').textContent = dataset.filter(c => c.diaImplantacao === new Date().toISOString().slice(0, 10)).length;
    if (el('ft-stat-pos')) el('ft-stat-pos').textContent = dataset.filter(c => c.fase === 'Aguardando cliente').length;
    if (el('ft-stat-concluidos')) el('ft-stat-concluidos').textContent = dataset.filter(c => c.fase === 'Concluído').length;
    return;
  }
  const dataset = CLIENTES;
  const el = id => document.getElementById(id);
  if (el('ft-stat-pendentes')) el('ft-stat-pendentes').textContent = dataset.filter(c => c.status === 'Em contato' || c.status === 'Aguardando').length;
  if (el('ft-stat-hoje')) el('ft-stat-hoje').textContent = dataset.filter(c => c.status === 'Hoje').length;
  if (el('ft-stat-pos')) el('ft-stat-pos').textContent = dataset.filter(c => c.status === 'Enviar gravação').length;
  if (el('ft-stat-concluidos')) el('ft-stat-concluidos').textContent = dataset.filter(c => c.status === 'Concluído').length;
}

function updateSidebarStats() {
  const list = getActiveClientes();
  const el = id => document.getElementById(id);
  if (el('badge-total-count')) el('badge-total-count').textContent = list.length;
  if (currentTeam === 'blv') {
    if (el('sb-stat-hoje')) el('sb-stat-hoje').textContent = list.filter(c => c.diaImplantacao === new Date().toISOString().slice(0, 10)).length;
    if (el('sb-stat-andamento')) el('sb-stat-andamento').textContent = list.filter(c => c.fase === 'Em implantação').length;
    if (el('sb-stat-gravacao')) el('sb-stat-gravacao').textContent = list.filter(c => c.fase === 'Aguardando cliente').length;
  } else {
    if (el('sb-stat-hoje')) el('sb-stat-hoje').textContent = list.filter(c => c.status === 'Hoje').length;
    if (el('sb-stat-andamento')) el('sb-stat-andamento').textContent = list.filter(c => c.status === 'Em andamento').length;
    if (el('sb-stat-gravacao')) el('sb-stat-gravacao').textContent = list.filter(c => c.status === 'Enviar gravação').length;
  }
}
