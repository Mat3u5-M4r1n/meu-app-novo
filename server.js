// Disable strict TLS only in local dev (corporate SSL proxy)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Auth-validation client (anon key, used only for getUser() JWT validation)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ── RBAC ──────────────────────────────────────────────────────────────────────
const USERS = {
  'mateus.marin@bling.com.br':    { name: 'Mateus Marin',    initials: 'MM', role: 'admin', teams: ['ig', 'blv'] },
  'manuela.curti@bling.com.br':   { name: 'Manuela Curti',   initials: 'MC', role: 'admin', teams: ['ig', 'blv'] },
  'luan.cavalheiro@bling.com.br': { name: 'Luan Cavalheiro', initials: 'LC', role: 'agent', teams: ['blv'] }
};

// ── snake_case ↔ camelCase ────────────────────────────────────────────────────
const SNAKE_TO_CAMEL = {
  valor_ig: 'valorIG',
  dia_da_implantacao: 'diaImplantacao',
};
const CAMEL_TO_SNAKE = {
  diaImplantacao: 'dia_da_implantacao',
};
const toSnake = s =>
  CAMEL_TO_SNAKE[s] ||
  s.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
   .replace(/([a-z\d])([A-Z])/g, '$1_$2')
   .toLowerCase();
const toCamel = s =>
  SNAKE_TO_CAMEL[s] || s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const rowToCamel = row =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));
const bodyToSnake = obj =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), v]));

// ── AUDIT LOG HELPER ──────────────────────────────────────────────────────────
const AUDIT_FIELD_LABELS = {
  // IG
  status: 'Status', implantador: 'Implantador', ig_agendada: 'IG Agendada',
  ig_realizada: 'IG Realizada', agenda: 'Agenda', enviado_por: 'Enviado por',
  informacoes_pre: 'Informações Pré', informacoes_pos: 'Informações Pós',
  top_especialista: 'Top Especialista', integracao: 'Integração',
  logistica: 'Logística', link_gravacao1: 'Link Gravação',
  link_anotacoes1: 'Link Anotações', tipo_reagenda: 'Tipo de Reagenda',
  tempo_reagenda: 'Tempo de Reagenda', qtd_reagendamento: 'Qtd. Reagendamento',
  motivo_estorno: 'Motivo do Estorno', ticket_estorno: 'Ticket Estorno',
  empresa: 'Empresa', cnpj: 'CNPJ', plano: 'Plano',
  situacao_da_conta: 'Situação da Conta', conversa_octa: 'Conversa Octa',
  // BLV
  fase: 'Fase', responsavel: 'Responsável', dia_implantacao: 'Dia de Implantação',
  conversa_octadesk: 'Conversa Octadesk', origem: 'Origem',
  nome_do_contato: 'Nome do Contato', cargo_do_contato: 'Cargo do Contato',
  telefone: 'Telefone', site: 'Site',
};

const _normalize = v => {
  if (v === null || v === undefined || v === '' || v === '[]' || (Array.isArray(v) && v.length === 0)) return null;
  return v;
};

function _gerarAuditLog(oldRecord, newRow, cnpj, autor, timeOrigem) {
  const entries = [];
  const now = new Date().toISOString();
  for (const [field, label] of Object.entries(AUDIT_FIELD_LABELS)) {
    const oldVal = _normalize(oldRecord[field]);
    const newVal = _normalize(newRow[field]);
    if (String(oldVal ?? '') === String(newVal ?? '')) continue;
    let mensagem;
    if (!oldVal && newVal) mensagem = `${label} definido como "${newVal}"`;
    else if (oldVal && !newVal) mensagem = `${label} removido (era "${oldVal}")`;
    else mensagem = `${label}: "${oldVal}" → "${newVal}"`;
    entries.push({ cnpj, mensagem, criado_por: autor, time_origem: timeOrigem, criado_em: now });
  }
  return entries;
}

// ── RATE LIMITERS ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos.' }
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de requisições atingido. Aguarde 1 minuto.' }
});
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de webhook atingido.' }
});

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [`http://localhost:${PORT}`];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

// ── STATIC FILES ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── PUBLIC CONFIG (serves anon key to browser — anon key is safe to expose) ──
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

// ── REQUEST-SCOPED DB CLIENT (uses user's JWT so RLS evaluates correctly) ─────
function dbFor(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

// ── AUTH MIDDLEWARE ───────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Token inválido ou expirado' });
    const rbac = USERS[user.email];
    if (!rbac) return res.status(403).json({ error: 'Acesso não autorizado para este e-mail' });
    req.user = { email: user.email, ...rbac };
    req.db = dbFor(token);
    next();
  } catch (err) {
    console.error('[requireAuth]', err);
    res.status(500).json({ error: 'Erro interno de autenticação: ' + err.message });
  }
}

// ── AUTH ROUTES ───────────────────────────────────────────────────────────────
app.get('/api/auth/me', requireAuth, (req, res) => res.json(req.user));
app.post('/api/auth/logout', (req, res) => res.json({ ok: true }));

// ── CLIENTES (IG) ─────────────────────────────────────────────────────────────
app.use('/api/clientes', requireAuth);

app.get('/api/clientes', async (req, res) => {
  const { data, error } = await req.db.from('clientes').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.get('/api/clientes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data, error } = await req.db.from('clientes').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json(rowToCamel(data));
});

app.post('/api/clientes/bulk', async (req, res) => {
  const novos = req.body;
  if (!Array.isArray(novos)) return res.status(400).json({ error: 'Esperado array' });
  await req.db.from('clientes').delete().neq('id', 0);
  const rows = novos.map((c, i) =>
    bodyToSnake({ ...c, id: c.id || 100000 + i, notas: c.notas || [] })
  );
  const { data, error } = await req.db.from('clientes').insert(rows).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.post('/api/clientes/reset', async (req, res) => {
  const defaultData = require('./data/clientes.json');
  await req.db.from('clientes').delete().neq('id', 0);
  const rows = defaultData.map(c => bodyToSnake({ ...c, notas: c.notas || [] }));
  const { data, error } = await req.db.from('clientes').insert(rows).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.post('/api/clientes', async (req, res) => {
  const { data: maxRow } = await req.db
    .from('clientes').select('id').order('id', { ascending: false }).limit(1).single();
  const newId = (maxRow?.id || 1000) + 1;
  const row = bodyToSnake({
    ...req.body,
    id: newId,
    criadoEm: new Date().toISOString(),
    diasAtualizado: new Date().toISOString().slice(0, 10),
    notas: []
  });
  const { data, error } = await req.db.from('clientes').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

app.put('/api/clientes/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  // Busca registro atual para automações e audit log
  const { data: oldRecord, error: fetchErr } = await req.db
    .from('clientes').select('*').eq('id', id).single();
  if (fetchErr) return res.status(404).json({ error: 'Cliente não encontrado' });

  const body = { ...req.body };

  // Automação: criacao_da_agenda — preenche quando ig_agendada é definido pela 1ª vez
  if (body.igAgendada && !oldRecord.ig_agendada) {
    body.criacaoDaAgenda = new Date().toISOString();
  }

  // Automação: enviado_por + qtd_reagendamento ao mudar para 'Solicitou reagendamento'
  if (body.status === 'Solicitou reagendamento' && oldRecord.status !== 'Solicitou reagendamento') {
    body.enviadoPor = req.user.email;
    body.qtdReagendamento = (oldRecord.qtd_reagendamento || 0) + 1;
  }

  // dias_atualizado: data de hoje (também enviado pelo cliente, mas garantido aqui)
  body.diasAtualizado = new Date().toISOString().slice(0, 10);

  const row = bodyToSnake(body);
  delete row.id;

  const { data, error } = await req.db
    .from('clientes').update(row).eq('id', id).select().single();
  if (error) {
    console.error('[PUT /api/clientes/:id]', JSON.stringify(error));
    const status = error.code === 'PGRST116' ? 404 : 500;
    return res.status(status).json({ error: `[${error.code}] ${error.message}` });
  }

  // Audit log: registra campos alterados na historico_timeline
  const cnpj = oldRecord.cnpj;
  if (cnpj) {
    const autor = req.user.name || req.user.email;
    const entries = _gerarAuditLog(oldRecord, row, cnpj, autor, 'ig');
    if (entries.length > 0) {
      try {
        await req.db.from('historico_timeline').insert(entries);
      } catch (e) {
        console.error('[AUDIT INSERT]', e.message);
      }
    }
  }

  res.json(rowToCamel(data));
});

app.delete('/api/clientes/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await req.db.from('clientes').delete().eq('id', id);
  if (error) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json({ ok: true });
});

app.post('/api/clientes/:id/notas', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data: current, error: fetchErr } = await req.db
    .from('clientes').select('notas').eq('id', id).single();
  if (fetchErr) return res.status(404).json({ error: 'Cliente não encontrado' });
  const nota = {
    id: 'n-' + Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    autor: req.body.autor || 'Usuário',
    texto: req.body.texto,
    tipo: req.body.tipo || 'contato'
  };
  const notas = [...(current.notas || []), nota];
  const { data, error } = await req.db
    .from('clientes').update({ notas }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

// ── CLIENTES BLV ──────────────────────────────────────────────────────────────
app.use('/api/clientes-blv', requireAuth);

app.get('/api/clientes-blv', async (req, res) => {
  const { data, error } = await req.db.from('clientes_blv').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.get('/api/clientes-blv/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data, error } = await req.db.from('clientes_blv').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Cliente BLV não encontrado' });
  res.json(rowToCamel(data));
});

app.post('/api/clientes-blv/bulk', async (req, res) => {
  const novos = req.body;
  if (!Array.isArray(novos)) return res.status(400).json({ error: 'Esperado array' });
  await req.db.from('clientes_blv').delete().neq('id', 0);
  const rows = novos.map(c => {
    const row = bodyToSnake({ ...c, notas: c.notas || [] });
    delete row.id;
    return row;
  });
  const { data, error } = await req.db.from('clientes_blv').insert(rows).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.post('/api/clientes-blv', async (req, res) => {
  const row = bodyToSnake({
    ...req.body,
    criadoEm: new Date().toISOString(),
    notas: []
  });
  delete row.id;
  const { data, error } = await req.db.from('clientes_blv').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

app.put('/api/clientes-blv/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const { data: oldRecord, error: fetchErr } = await req.db
    .from('clientes_blv').select('*').eq('id', id).single();
  if (fetchErr) return res.status(404).json({ error: 'Cliente BLV não encontrado' });

  const row = bodyToSnake(req.body);
  delete row.id;

  const { data, error } = await req.db
    .from('clientes_blv').update(row).eq('id', id).select().single();
  if (error) {
    console.error('[PUT /api/clientes-blv/:id]', JSON.stringify(error));
    const status = error.code === 'PGRST116' ? 404 : 500;
    return res.status(status).json({ error: `[${error.code}] ${error.message}` });
  }

  if (oldRecord.cnpj) {
    const autor = req.user.name || req.user.email;
    const entries = _gerarAuditLog(oldRecord, row, oldRecord.cnpj, autor, 'blv');
    if (entries.length > 0) {
      try {
        await req.db.from('historico_timeline').insert(entries);
      } catch (e) {
        console.error('[AUDIT BLV INSERT]', e.message);
      }
    }
  }

  res.json(rowToCamel(data));
});

app.delete('/api/clientes-blv/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await req.db.from('clientes_blv').delete().eq('id', id);
  if (error) return res.status(404).json({ error: 'Cliente BLV não encontrado' });
  res.json({ ok: true });
});

app.post('/api/clientes-blv/:id/notas', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data: current, error: fetchErr } = await req.db
    .from('clientes_blv').select('notas').eq('id', id).single();
  if (fetchErr) return res.status(404).json({ error: 'Cliente BLV não encontrado' });
  const nota = {
    id: 'n-' + Date.now(),
    data: new Date().toLocaleString('pt-BR'),
    autor: req.body.autor || 'Usuário',
    texto: req.body.texto,
    tipo: req.body.tipo || 'contato'
  };
  const notas = [...(current.notas || []), nota];
  const { data, error } = await req.db
    .from('clientes_blv').update({ notas }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

// ── ATIVIDADES LOJA VIRTUAL ───────────────────────────────────────────────────
app.use('/api/atividades-blv', requireAuth);

app.get('/api/atividades-blv', async (req, res) => {
  let query = req.db.from('atividades_loja_virtual').select('*').order('criado_em', { ascending: false });
  if (req.query.empresa) query = query.eq('empresa', req.query.empresa);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.post('/api/atividades-blv', async (req, res) => {
  const row = bodyToSnake({ ...req.body, criadoEm: new Date().toISOString() });
  delete row.id;
  const { data, error } = await req.db.from('atividades_loja_virtual').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

app.put('/api/atividades-blv/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const row = bodyToSnake(req.body);
  delete row.id;
  const { data, error } = await req.db.from('atividades_loja_virtual').update(row).eq('id', id).select().single();
  if (error) return res.status(404).json({ error: 'Atividade não encontrada' });
  res.json(rowToCamel(data));
});

app.delete('/api/atividades-blv/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await req.db.from('atividades_loja_virtual').delete().eq('id', id);
  if (error) return res.status(404).json({ error: 'Atividade não encontrada' });
  res.json({ ok: true });
});

// ── GESTÃO DE PROJETOS ────────────────────────────────────────────────────────
app.use('/api/projetos', requireAuth);

app.get('/api/projetos', async (req, res) => {
  const { data, error } = await req.db.from('gestao_projetos').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.get('/api/projetos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { data, error } = await req.db.from('gestao_projetos').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json(rowToCamel(data));
});

app.post('/api/projetos', async (req, res) => {
  const row = bodyToSnake({ ...req.body, dataSolicitacao: new Date().toISOString() });
  delete row.id;
  const { data, error } = await req.db.from('gestao_projetos').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

app.put('/api/projetos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const row = bodyToSnake(req.body);
  delete row.id;
  const { data, error } = await req.db.from('gestao_projetos').update(row).eq('id', id).select().single();
  if (error) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json(rowToCamel(data));
});

app.delete('/api/projetos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { error } = await req.db.from('gestao_projetos').delete().eq('id', id);
  if (error) return res.status(404).json({ error: 'Projeto não encontrado' });
  res.json({ ok: true });
});

// ── HISTÓRICO TIMELINE UNIFICADO ──────────────────────────────────────────────
app.use('/api/historico-timeline', requireAuth);

app.get('/api/historico-timeline/:cnpj', async (req, res) => {
  const cnpj = decodeURIComponent(req.params.cnpj);

  // Busca historico_timeline e atividades_loja_virtual em paralelo
  const [timelineResult, blvClienteResult] = await Promise.all([
    req.db.from('historico_timeline').select('*').eq('cnpj', cnpj).order('criado_em', { ascending: false }),
    req.db.from('clientes_blv').select('empresa').eq('cnpj', cnpj).maybeSingle(),
  ]);

  if (timelineResult.error) return res.status(500).json({ error: timelineResult.error.message });

  const timelineEntries = (timelineResult.data || []).map(rowToCamel);

  // Se há registro BLV para este CNPJ, buscar atividades pelo nome da empresa
  let atividadesEntries = [];
  if (blvClienteResult.data?.empresa) {
    const { data: atividades } = await req.db
      .from('atividades_loja_virtual')
      .select('*')
      .eq('empresa', blvClienteResult.data.empresa)
      .order('criado_em', { ascending: false });

    if (atividades) {
      atividadesEntries = atividades.map(a => {
        const r = rowToCamel(a);
        const partes = [r.titulo, r.followup].filter(Boolean);
        const mensagem = partes.join('\n') || 'Atividade registrada';
        return {
          id: `atv-${r.id}`,
          cnpj,
          mensagem,
          criadoPor: r.criadoPor || 'Sistema',
          criadoEm: r.criadoEm,
          timeOrigem: 'blv',
          linkAnexo: null,
          nomeAnexo: null,
          _isAtividade: true,
        };
      });
    }
  }

  // Mesclar e ordenar por data decrescente
  const combined = [...timelineEntries, ...atividadesEntries].sort((a, b) => {
    return new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0);
  });

  res.json(combined);
});

app.post('/api/historico-timeline', async (req, res) => {
  const { cnpj, mensagem, linkAnexo, timeOrigem } = req.body;
  if (!cnpj || !mensagem) return res.status(400).json({ error: 'cnpj e mensagem são obrigatórios.' });
  const row = {
    cnpj,
    mensagem,
    link_anexo: linkAnexo || null,
    time_origem: timeOrigem || req.user.teams?.[0] || 'ig',
    criado_por: req.user.name,
    criado_em: new Date().toISOString()
  };
  const { data, error } = await req.db.from('historico_timeline').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

// ── FEEDBACKS ─────────────────────────────────────────────────────────────────
app.post('/api/feedbacks', requireAuth, async (req, res) => {
  const { tipo, mensagem, telaAtual } = req.body;
  if (!tipo || !mensagem) return res.status(400).json({ error: 'tipo e mensagem são obrigatórios.' });
  const row = {
    tipo,
    mensagem,
    usuario_email: req.user.email,
    tela_atual: telaAtual || '',
    criado_em: new Date().toISOString()
  };
  const { data, error } = await req.db.from('feedbacks').insert(row).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(rowToCamel(data));
});

// ── CROSS-TEAM LOOKUP BY CNPJ ─────────────────────────────────────────────────
app.get('/api/cross-lookup/:cnpj', requireAuth, async (req, res) => {
  const cnpj = req.params.cnpj;
  const [igResult, blvResult] = await Promise.all([
    req.db.from('clientes').select('*').eq('cnpj', cnpj).maybeSingle(),
    req.db.from('clientes_blv').select('*').eq('cnpj', cnpj).maybeSingle()
  ]);
  res.json({
    ig: igResult.data ? rowToCamel(igResult.data) : null,
    blv: blvResult.data ? rowToCamel(blvResult.data) : null
  });
});

// ── TIMELINE UNIFICADA BY CNPJ ────────────────────────────────────────────────
app.get('/api/timeline-cnpj/:cnpj', requireAuth, async (req, res) => {
  const cnpj = req.params.cnpj;
  const [igResult, blvResult] = await Promise.all([
    req.db.from('clientes').select('notas').eq('cnpj', cnpj).maybeSingle(),
    req.db.from('clientes_blv').select('notas').eq('cnpj', cnpj).maybeSingle()
  ]);
  const igNotas = (igResult.data?.notas || []).map(n => ({ ...n, _source: 'ig' }));
  const blvNotas = (blvResult.data?.notas || []).map(n => ({ ...n, _source: 'blv' }));
  const combined = [...igNotas, ...blvNotas].sort((a, b) => {
    const ta = parseInt((a.id || '').replace('n-', '')) || 0;
    const tb = parseInt((b.id || '').replace('n-', '')) || 0;
    return tb - ta;
  });
  res.json(combined);
});

// ── BASE DE CONHECIMENTO ──────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

async function extrairTexto(buffer, mimetype, originalname) {
  const nome = (originalname || '').toLowerCase();

  if (mimetype === 'application/pdf' || nome.endsWith('.pdf')) {
    // Use lib/ path to avoid pdf-parse v1 test-file auto-run bug
    const pdfParse = require('pdf-parse/lib/pdf-parse.js');
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword' ||
    nome.endsWith('.docx') ||
    nome.endsWith('.doc')
  ) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback: plain text
  return buffer.toString('utf-8');
}

app.use('/api/base-conhecimento', requireAuth);

app.get('/api/base-conhecimento', async (req, res) => {
  const { data, error } = await req.db
    .from('base_conhecimento')
    .select('id, nome_arquivo, tipo_arquivo, criado_em')
    .order('criado_em', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(rowToCamel));
});

app.post('/api/base-conhecimento/upload', upload.single('arquivo'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins podem fazer upload.' });
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  try {
    const conteudo = await extrairTexto(req.file.buffer, req.file.mimetype, req.file.originalname);
    const row = {
      nome_arquivo: req.file.originalname,
      tipo_arquivo: req.file.mimetype,
      conteudo: conteudo.trim(),
      criado_em: new Date().toISOString()
    };
    const { data, error } = await req.db.from('base_conhecimento').insert(row).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(rowToCamel(data));
  } catch (err) {
    console.error('[upload base-conhecimento]', err);
    res.status(500).json({ error: 'Falha ao extrair texto do arquivo.' });
  }
});

app.delete('/api/base-conhecimento/:id', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins podem remover documentos.' });
  const id = parseInt(req.params.id);
  const { error } = await req.db.from('base_conhecimento').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── CHAT AGENTE IA (RAG com Gemini) ──────────────────────────────────────────
// Lazy init — avoids crash on startup when GEMINI_API_KEY is absent
let _genAI = null;
function getGenAI() {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY não configurada.');
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
}

app.post('/api/chat-agente', requireAuth, async (req, res) => {
  const { pergunta, historico = [] } = req.body;
  if (!pergunta?.trim()) return res.status(400).json({ error: 'Pergunta vazia.' });

  // 1. Buscar toda a base de conhecimento
  const { data: docs, error: dbErr } = await req.db
    .from('base_conhecimento')
    .select('nome_arquivo, conteudo')
    .order('criado_em', { ascending: false });

  if (dbErr) return res.status(500).json({ error: dbErr.message });

  // 2. Montar contexto RAG
  let contexto = '';
  if (docs && docs.length > 0) {
    contexto = docs.map(d => `=== Documento: ${d.nome_arquivo} ===\n${d.conteudo}`).join('\n\n');
  }

  const systemPrompt = `Você é o Link IA, assistente interno da equipe de Implantação da Bling.
Seu jeito é descontraído, amigável e direto — pode usar linguagem informal e até gírias quando o usuário usar.
Responda sempre em português do Brasil.

REGRA MAIS IMPORTANTE: Você deve basear suas respostas EXCLUSIVAMENTE nos documentos fornecidos abaixo como contexto.
Se a pergunta não puder ser respondida com as informações dos documentos, diga isso de forma simpática, como:
"Eita, essa eu não achei nos documentos que tenho aqui. Tente perguntar de outro jeito ou fala com o Mateus."

${contexto.length > 0
  ? `DOCUMENTOS DA BASE DE CONHECIMENTO:\n\n${contexto}`
  : 'ATENÇÃO: Não há documentos na base de conhecimento ainda. Informe o usuário que a base está vazia e que um admin precisa fazer o upload de documentos.'}`;

  try {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });

    // Converter histórico para formato Gemini
    const chat = model.startChat({
      history: historico.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    });

    const result = await chat.sendMessage(pergunta);
    const resposta = result.response.text();

    res.json({ resposta });
  } catch (err) {
    console.error('[chat-agente Gemini]', err);
    res.status(500).json({ error: 'Erro ao chamar a API do Gemini. Verifique a chave.' });
  }
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Must be last middleware — catches errors forwarded via next(err)
app.use((err, req, res, _next) => {
  console.error('[UNHANDLED]', err);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

// ── START ─────────────────────────────────────────────────────────────────────
// Listen only when run directly (not when imported by Vercel serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Bling LINK Operacional rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
