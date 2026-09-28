// ── Estado global ─────────────────────────────────────────────────────────────
let CLIENTES = [];      // IG data
let CLIENTES_BLV = [];  // BLV data (populated by data-blv.js)
let currentTeam = 'ig'; // 'ig' | 'blv'
let currentUser = null;  // filled after auth check

// ── Team helpers ──────────────────────────────────────────────────────────────
function getActiveClientes() {
  return currentTeam === 'ig' ? CLIENTES : CLIENTES_BLV;
}
function getActiveApiBase() {
  return currentTeam === 'ig' ? '/api/clientes' : '/api/clientes-blv';
}
function getActiveKanbanColumns() {
  return currentTeam === 'ig' ? KANBAN_COLUMNS : BLV_KANBAN_COLUMNS;
}
function getActiveStatusList() {
  return currentTeam === 'ig' ? STATUS_LIST : BLV_STATUS_LIST;
}
function getActiveImplantadoresList() {
  return currentTeam === 'ig' ? IMPLANTADORES_LIST : BLV_IMPLANTADORES_LIST;
}
function getActiveFieldDefinitions() {
  return currentTeam === 'ig' ? FIELD_DEFINITIONS : BLV_FIELD_DEFINITIONS;
}
function getActiveCategories() {
  return currentTeam === 'ig' ? CATEGORIES : BLV_CATEGORIES;
}
function getActiveDefaultCardFields() {
  return currentTeam === 'ig' ? DEFAULT_KANBAN_CARD_FIELDS : BLV_DEFAULT_CARD_FIELDS;
}
// Returns the field key used for kanban column matching
function getActiveStatusKey() {
  return currentTeam === 'ig' ? 'status' : 'fase';
}

// ── IG Constants ──────────────────────────────────────────────────────────────
const IMPLANTADORES_LIST = [
  'augusto.la-rocca@bling.com.br',
  'filipe.azevedo@bling.com.br',
  'elaine.costa@bling.com.br',
  'gabriel.fonseca@bling.com.br',
  'leonardo.lopes@bling.com.br',
  'gabriela.machado@bling.com.br',
  'edenilson.borba@bling.com.br',
  'luiza.job@bling.com.br',
  'leonardo.leffa@bling.com.br'
];

const TIPOS_IG_LIST = [
  'E-commerce Essencial', 'E-commerce Avançado', 'Loja Física Essencial',
  'Loja Física Avançado', 'Fabricação Própria', 'Serviços', 'Gestão Fiscal',
  'Migração de sistema', 'Dominando Finanças', 'Meu Negócio e Relatórios',
  'Nota de Importação', 'Loja Virtual Bling', 'Multiempresa', 'Dúvidas', 'API'
];

const STATUS_LIST = [
  'Agendada', 'Em contato', 'Agenda enviada', 'Sem contato', 'Tempo Restante',
  'Amanhã', 'Hoje', 'Em andamento', 'Enviar gravação', 'Solicitou reagendamento',
  'Aguardando Reagendamento', 'Solicitação de estorno', 'Concluído',
  'Contato Encerrado (NFS)', 'Estorno', 'Aguardando'
];

const MOTIVOS_ESTORNO_LIST = [
  'Agenda', 'Sem contato', 'Outros', 'Churn', 'Consultoria',
  'Arrependimento', 'Suporte', 'Funcionalidade não existe'
];

const TIPOS_REAGENDA_LIST = [
  'Reagendar', 'Não compareceu', 'Tempo restante', 'Encaixe'
];

const KANBAN_COLUMNS = [
  { id: 'em_contato',              title: 'Em contato',              statuses: ['Em contato'],              badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',       accentColor: '#7F76FF' },
  { id: 'aguardando',              title: 'Aguardando',              statuses: ['Aguardando'],              badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',       accentColor: '#A855F7' },
  { id: 'agenda_enviada',          title: 'Agenda enviada',          statuses: ['Agenda enviada'],          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',          accentColor: '#F59E0B' },
  { id: 'sem_contato',             title: 'Sem contato',             statuses: ['Sem contato'],             badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',          accentColor: '#94A3B8' },
  { id: 'agendada',                title: 'Agendada',                statuses: ['Agendada'],                badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',                accentColor: '#0284C7' },
  { id: 'amanha',                  title: 'Amanhã',                  statuses: ['Amanhã'],                  badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',                accentColor: '#0EA5E9' },
  { id: 'hoje',                    title: 'Hoje',                    statuses: ['Hoje'],                    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',             accentColor: '#2563EB' },
  { id: 'em_andamento',            title: 'Em andamento',            statuses: ['Em andamento'],            badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', accentColor: '#10B981' },
  { id: 'tempo_restante',          title: 'Tempo Restante',          statuses: ['Tempo Restante'],          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',          accentColor: '#D97706' },
  { id: 'enviar_gravacao',         title: 'Enviar gravação',         statuses: ['Enviar gravação'],         badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',       accentColor: '#8B5CF6' },
  { id: 'solicitou_reagendamento', title: 'Solicitou reagendamento', statuses: ['Solicitou reagendamento'], badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',       accentColor: '#EA580C' },
  { id: 'aguardando_reagendamento',title: 'Aguardando Reagendamento',statuses: ['Aguardando Reagendamento'],badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',       accentColor: '#C2410C' },
  { id: 'concluido',               title: 'Concluído',               statuses: ['Concluído'],               badgeColor: 'bg-emerald-200 text-emerald-950 border-emerald-400 font-bold', accentColor: '#059669' },
  { id: 'contato_encerrado_nfs',   title: 'Contato Encerrado (NFS)', statuses: ['Contato Encerrado (NFS)'], badgeColor: 'bg-slate-200 text-slate-900 border-slate-300',          accentColor: '#64748B' },
  { id: 'solicitacao_estorno',     title: 'Solicitação de estorno',  statuses: ['Solicitação de estorno'],  badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',             accentColor: '#F43F5E' },
  { id: 'estorno',                 title: 'Estorno',                 statuses: ['Estorno'],                 badgeColor: 'bg-rose-200 text-rose-900 border-rose-300',             accentColor: '#E11D48' }
];

const DEFAULT_KANBAN_CARD_FIELDS = {
  id: true, empresa: true, nomeContato: true, cnpj: false, idEmpresa: false, idMoskit: false,
  plano: true, cupom: false, valorIG: false, cidadeEstado: false, topEspecialista: true,
  situacaoDaConta: false, regimeTributario: false, emailDaEmpresa: false, emailDaAgenda: false,
  whatsapp: false, conversaOcta: false, status: true, igAgendada: true, igComprada: false,
  igRealizada: false, implantador: true, agenda: true, criacaoDaAgenda: false, linkMeet: false,
  linkParaAgendar: false, integracao: false, logistica: false, enviadoPor: false,
  informacoesPre: false, informacoesPos: false, linkGravacao1: false, linkGravacao2: false,
  linkAnotacoes1: false, linkAnotacoes2: false, qtdReagendamento: true, tipoReagenda: false,
  motivoReagendamento: false, tempoReagenda: false, reagendamentoPor: false, motivoEstorno: false,
  ticketEstorno: false, descricaoDoEstorno: false, origem: false, time: false, responsavel: false,
  linkConexao: false, descricaoConexao: false, btnWhatsapp: true, btnMeet: true, btnOcta: false
};

const FIELD_DEFINITIONS = [
  { key: 'id', label: 'ID do Card (#ID)', category: 'identificacao', description: 'Número identificador do cliente' },
  { key: 'empresa', label: 'Nome da Empresa', category: 'identificacao', description: 'Razão social ou nome fantasia' },
  { key: 'nomeContato', label: 'Nome do Contato', category: 'identificacao', description: 'Pessoa responsável na empresa' },
  { key: 'plano', label: 'Plano Bling', category: 'identificacao', description: 'Cobalto, Platina, Titânio, etc.' },
  { key: 'cupom', label: 'Possui Cupom', category: 'identificacao', description: 'Sinaliza se o cliente possui cupom aplicado' },
  { key: 'valorIG', label: 'Valor IG (R$)', category: 'identificacao', description: 'Valor monetário da implantação' },
  { key: 'topEspecialista', label: 'Selo Top Especialista', category: 'identificacao', description: 'Destaque visual de cliente prioritário' },
  { key: 'cnpj', label: 'CPF / CNPJ', category: 'identificacao', description: 'Documento fiscal cadastrado' },
  { key: 'cidadeEstado', label: 'Cidade & Estado (UF)', category: 'identificacao', description: 'Localização geográfica do cliente' },
  { key: 'situacaoDaConta', label: 'Situação da Conta', category: 'identificacao', description: 'Status no Bling (Ativo, Em teste, etc)' },
  { key: 'regimeTributario', label: 'Regime Tributário', category: 'identificacao', description: 'Simples Nacional, Lucro Presumido, etc' },
  { key: 'idEmpresa', label: 'ID Empresa Bling', category: 'identificacao', description: 'Identificador interno da conta' },
  { key: 'idMoskit', label: 'ID Moskit', category: 'identificacao', description: 'Código da oportunidade no CRM' },
  { key: 'status', label: 'Status do Card', category: 'atendimento', description: 'Etapa atual com seletor direto no card' },
  { key: 'igAgendada', label: 'IG Agendada', category: 'atendimento', description: 'Tipo da implantação agendada' },
  { key: 'igComprada', label: 'IG Comprada', category: 'atendimento', description: 'Tipo da implantação adquirida' },
  { key: 'igRealizada', label: 'IG Realizada', category: 'atendimento', description: 'Tipo da implantação executada' },
  { key: 'implantador', label: 'Implantador Responsável', category: 'atendimento', description: 'Especialista responsável pela agenda' },
  { key: 'agenda', label: 'Data & Hora da Reunião', category: 'atendimento', description: 'Horário e data marcados' },
  { key: 'criacaoDaAgenda', label: 'Criação da Agenda', category: 'atendimento', description: 'Data/hora em que a agenda foi criada' },
  { key: 'integracao', label: 'Integrações', category: 'atendimento', description: 'Hubs, marketplaces e lojas virtuais' },
  { key: 'logistica', label: 'Logística', category: 'atendimento', description: 'Gateways de frete e correios' },
  { key: 'enviadoPor', label: 'Enviado por', category: 'atendimento', description: 'Responsável pelo envio da agenda' },
  { key: 'linkParaAgendar', label: 'Link para Agendar', category: 'atendimento', description: 'URL Calendly de agendamento' },
  { key: 'whatsapp', label: 'Número de WhatsApp', category: 'comunicacao', description: 'Telefone de contato direto' },
  { key: 'emailDaEmpresa', label: 'E-mail da Empresa', category: 'comunicacao', description: 'E-mail corporativo cadastrado' },
  { key: 'emailDaAgenda', label: 'E-mail da Agenda', category: 'comunicacao', description: 'E-mail do convite do Google Calendar' },
  { key: 'conversaOcta', label: 'Conversa Octa (Link)', category: 'comunicacao', description: 'Link direto para o atendimento no Octa' },
  { key: 'informacoesPre', label: 'Informações Pré (Anotações)', category: 'pre_pos', description: 'Alinhamento prévio e migrações' },
  { key: 'informacoesPos', label: 'Informações Pós (Resumo)', category: 'pre_pos', description: 'Resumo e tópicos ensinados' },
  { key: 'linkMeet', label: 'Link do Google Meet', category: 'pre_pos', description: 'URL da sala de conferência' },
  { key: 'linkGravacao1', label: 'Link da Gravação 1', category: 'pre_pos', description: 'Gravação da sessão principal' },
  { key: 'linkGravacao2', label: 'Link da Gravação 2', category: 'pre_pos', description: 'Gravação complementar' },
  { key: 'linkAnotacoes1', label: 'Link Anotações 1', category: 'pre_pos', description: 'Doc de anotações do cliente' },
  { key: 'linkAnotacoes2', label: 'Link Anotações 2', category: 'pre_pos', description: 'Doc de apoio complementar' },
  { key: 'qtdReagendamento', label: 'Contador de Reagendamento', category: 'reagenda_estorno', description: 'Qtd de reagendamentos (ex: 2x Reag.)' },
  { key: 'tipoReagenda', label: 'Tipo de Reagendamento', category: 'reagenda_estorno', description: 'Motivo macro do reagendamento' },
  { key: 'tempoReagenda', label: 'Tempo de Reagenda', category: 'reagenda_estorno', description: 'Prazo decorrido' },
  { key: 'motivoEstorno', label: 'Motivo do Estorno', category: 'reagenda_estorno', description: 'Classificação de cancelamento' },
  { key: 'ticketEstorno', label: 'Ticket de Estorno', category: 'reagenda_estorno', description: 'Número do ticket no suporte' },
  { key: 'descricaoDoEstorno', label: 'Descrição do Estorno', category: 'reagenda_estorno', description: 'Detalhamento do estorno' },
  { key: 'origem', label: 'Origem da Conexão', category: 'conexoes', description: 'Origem do cliente' },
  { key: 'time', label: 'Time Envolvido', category: 'conexoes', description: 'Time interno' },
  { key: 'responsavel', label: 'Responsável Conexão', category: 'conexoes', description: 'Pessoa responsável pela conexão' },
  { key: 'linkConexao', label: 'Link Conexões', category: 'conexoes', description: 'URL de referência da conexão' },
  { key: 'descricaoConexao', label: 'Descrição da Conexão', category: 'conexoes', description: 'Detalhes ou notas da conexão' },
  { key: 'btnWhatsapp', label: 'Atalho: Botão WhatsApp', category: 'acoes', description: 'Disparo rápido de mensagem no card' },
  { key: 'btnMeet', label: 'Atalho: Botão Meet', category: 'acoes', description: 'Entrada rápida na sala Meet no card' },
  { key: 'btnOcta', label: 'Atalho: Botão Octa', category: 'acoes', description: 'Abertura rápida da conversa Octa' }
];

const CATEGORIES = [
  { id: 'todos', label: 'Todos os Campos' },
  { id: 'identificacao', label: 'Identificação' },
  { id: 'atendimento', label: 'Atendimento' },
  { id: 'comunicacao', label: 'Comunicação' },
  { id: 'pre_pos', label: 'Pré / Pós' },
  { id: 'reagenda_estorno', label: 'Reagenda / Estorno' },
  { id: 'conexoes', label: 'Conexões' },
  { id: 'acoes', label: 'Atalhos' }
];

// Carregar dados da API ao iniciar
async function carregarClientes() {
  const res = await apiFetch('/api/clientes');
  if (!res.ok) { CLIENTES = []; return CLIENTES; }
  CLIENTES = await res.json();
  return CLIENTES;
}
