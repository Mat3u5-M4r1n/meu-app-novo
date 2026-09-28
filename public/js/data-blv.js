// ── BLV Constants ────────────────────────────────────────────────────────────

const BLV_STATUS_LIST = [
  'Novo',
  'Contato iniciado',
  'Contato conectado',
  'Contato em configuração',
  'Em implantação',
  'Aguardando cliente',
  'Loja publicada',
  'Concluído',
  'Sem sucesso'
];

const BLV_KANBAN_COLUMNS = [
  { id: 'novo',                   title: 'Novo',                   statuses: ['Novo'],                   badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',   accentColor: '#94A3B8' },
  { id: 'contato_iniciado',       title: 'Contato iniciado',       statuses: ['Contato iniciado'],       badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200', accentColor: '#7F76FF' },
  { id: 'contato_conectado',      title: 'Contato conectado',      statuses: ['Contato conectado'],      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',           accentColor: '#0EA5E9' },
  { id: 'contato_em_configuracao',title: 'Contato em configuração',statuses: ['Contato em configuração'],badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',     accentColor: '#F59E0B' },
  { id: 'em_implantacao',         title: 'Em implantação',         statuses: ['Em implantação'],         badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',        accentColor: '#2563EB' },
  { id: 'aguardando_cliente',     title: 'Aguardando cliente',     statuses: ['Aguardando cliente'],     badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',  accentColor: '#EA580C' },
  { id: 'loja_publicada',         title: 'Loja publicada',         statuses: ['Loja publicada'],         badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',accentColor: '#10B981' },
  { id: 'concluido',              title: 'Concluído',              statuses: ['Concluído'],              badgeColor: 'bg-emerald-200 text-emerald-950 border-emerald-400 font-bold', accentColor: '#059669' },
  { id: 'sem_sucesso',            title: 'Sem sucesso',            statuses: ['Sem sucesso'],            badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',        accentColor: '#E11D48' }
];

const BLV_IMPLANTADORES_LIST = [
  'luan.cavalheiro@bling.com.br',
  'mateus.marin@bling.com.br'
];

const BLV_DEFAULT_CARD_FIELDS = {
  id: true,
  empresa: true,
  nomeDoContato: true,
  cnpj: false,
  telefone: true,
  site: false,
  responsavel: true,
  fase: true,
  diaImplantacao: true,
  conversaOctadesk: false,
  informacoesPre: false,
  informacoesPos: false,
  origem: false
};

const BLV_FIELD_DEFINITIONS = [
  { key: 'id',              label: 'ID',                  category: 'identificacao' },
  { key: 'empresa',         label: 'Empresa',             category: 'identificacao' },
  { key: 'cnpj',            label: 'CNPJ',                category: 'identificacao' },
  { key: 'nomeDoContato',   label: 'Contato',             category: 'identificacao' },
  { key: 'telefone',        label: 'Telefone',            category: 'comunicacao' },
  { key: 'site',            label: 'Site',                category: 'comunicacao' },
  { key: 'conversaOctadesk',label: 'Conversa Octadesk',   category: 'comunicacao' },
  { key: 'responsavel',     label: 'Responsável',         category: 'atendimento' },
  { key: 'fase',            label: 'Fase',                category: 'atendimento' },
  { key: 'diaImplantacao',  label: 'Dia da Implantação',  category: 'atendimento' },
  { key: 'informacoesPre',  label: 'Informações Pré',     category: 'pre_pos' },
  { key: 'informacoesPos',  label: 'Informações Pós',     category: 'pre_pos' },
  { key: 'origem',          label: 'Origem',              category: 'conexoes' }
];

const BLV_CATEGORIES = [
  { id: 'todos',        label: 'Todos' },
  { id: 'identificacao',label: 'Identificação' },
  { id: 'comunicacao',  label: 'Comunicação' },
  { id: 'atendimento',  label: 'Atendimento' },
  { id: 'pre_pos',      label: 'Pré / Pós' },
  { id: 'conexoes',     label: 'Conexões' }
];

async function carregarClientesBLV() {
  const res = await apiFetch('/api/clientes-blv');
  if (!res.ok) {
    console.error('Erro ao carregar clientes BLV:', res.status);
    CLIENTES_BLV = [];
    return CLIENTES_BLV;
  }
  CLIENTES_BLV = await res.json();
  return CLIENTES_BLV;
}
