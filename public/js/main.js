let currentView = 'pipeline';
let sidebarCollapsed = false;
let mainThemeDark = false;

// ── Auth ──────────────────────────────────────────────────────────────────────

async function checkAuth() {
  try {
    const sb = await initSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = '/login.html'; return null; }
    const res = await apiFetch('/api/auth/me');
    if (res.status === 401 || res.status === 403) {
      await sb.auth.signOut();
      window.location.href = '/login.html';
      return null;
    }
    if (!res.ok) { window.location.href = '/login.html'; return null; }
    return await res.json();
  } catch {
    window.location.href = '/login.html';
    return null;
  }
}

async function handleLogout() {
  const sb = getSupabaseClient();
  if (sb) await sb.auth.signOut();
  window.location.href = '/login.html';
}

function updateUserInfo(user) {
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');
  if (avatarEl) avatarEl.textContent = user.initials || user.name?.substring(0, 2).toUpperCase() || '?';
  if (nameEl) nameEl.textContent = user.name || user.email;
  if (emailEl) emailEl.textContent = user.email;
}

function setupTeamSelector(user) {
  const select = document.getElementById('sidebar-team-select');
  const section = document.getElementById('sidebar-team-section');
  if (!select) return;

  // Remove options not in user's teams
  Array.from(select.options).forEach(opt => {
    if (!user.teams.includes(opt.value)) opt.remove();
  });

  if (user.teams.length <= 1) {
    // Only one team: hide selector, auto-select it
    if (section) section.style.display = 'none';
    currentTeam = user.teams[0] || 'ig';
  } else {
    currentTeam = 'ig';
    select.value = 'ig';
  }
}

// ── Theme ─────────────────────────────────────────────────────────────────────

function toggleMainTheme() {
  mainThemeDark = !mainThemeDark;
  const mainEl = document.getElementById('main-content');
  const sun = document.getElementById('theme-icon-sun');
  const moon = document.getElementById('theme-icon-moon');
  if (mainThemeDark) {
    mainEl.setAttribute('data-theme', 'dark');
    sun.classList.add('hidden');
    moon.classList.remove('hidden');
  } else {
    mainEl.removeAttribute('data-theme');
    sun.classList.remove('hidden');
    moon.classList.add('hidden');
  }
  try { localStorage.setItem('ig-main-theme', mainThemeDark ? 'dark' : 'light'); } catch {}
}

// ── Team switching ────────────────────────────────────────────────────────────

async function onTeamChange(team) {
  if (team === currentTeam) return;
  currentTeam = team;

  // Update sidebar title subtitle
  const subtitle = document.querySelector('#sidebar-title-container span:last-child');
  if (subtitle) {
    subtitle.textContent = team === 'ig' ? 'Implantação Guiada' : 'Bling Loja Virtual';
  }

  // Reload data for new team
  try {
    if (team === 'blv' && CLIENTES_BLV.length === 0) {
      await carregarClientesBLV();
    } else if (team === 'ig' && CLIENTES.length === 0) {
      await carregarClientes();
    }
  } catch (e) {
    console.error('Erro ao carregar dados do time:', e);
  }

  // Load atividades when switching to BLV, then init kanban so cards show atividades
  if (team === 'blv') {
    try {
      if (ATIVIDADES.length === 0) await carregarAtividades();
      const badge = document.getElementById('badge-atividades-count');
      if (badge) { badge.textContent = ATIVIDADES.length; badge.classList.remove('hidden'); }
    } catch (e) { console.error('Atividades:', e); }
  }

  // Re-apply team visibility (ig-only / blv-only sidebar items)
  applyTeamToModal();

  // Re-init kanban for new team
  initKanban();
  populateImplantadorFilter();
  navigateToView('pipeline');
  updateFooterStats();
  updateSidebarStats();
}

// ── Sidebar collapse ──────────────────────────────────────────────────────────

function toggleSidebarCollapse() {
  sidebarCollapsed = !sidebarCollapsed;
  const sidebar = document.getElementById('main-sidebar');
  const navTexts = document.querySelectorAll('.nav-text');
  const titleContainer = document.getElementById('sidebar-title-container');
  const modulesLabel = document.getElementById('sidebar-modules-label');
  const userInfo = document.getElementById('sidebar-user-info');
  const opBox = document.getElementById('sidebar-operational-box');
  const teamSection = document.getElementById('sidebar-team-section');

  if (sidebarCollapsed) {
    sidebar.style.width = '68px';
    navTexts.forEach(el => el.classList.add('hidden'));
    if (titleContainer) titleContainer.classList.add('hidden');
    if (modulesLabel) modulesLabel.classList.add('hidden');
    if (userInfo) userInfo.classList.add('hidden');
    if (opBox) opBox.classList.add('hidden');
    if (teamSection) teamSection.classList.add('hidden');
  } else {
    sidebar.style.width = '260px';
    navTexts.forEach(el => el.classList.remove('hidden'));
    if (titleContainer) titleContainer.classList.remove('hidden');
    if (modulesLabel) modulesLabel.classList.remove('hidden');
    if (userInfo) userInfo.classList.remove('hidden');
    if (opBox) opBox.classList.remove('hidden');
    if (teamSection) teamSection.classList.remove('hidden');
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function populateImplantadorFilter() {
  const select = document.getElementById('topbar-implantador-filter');
  if (!select) return;
  // Reset to just "Todos"
  select.innerHTML = '<option value="todos">Todos os implantadores</option>';
  const list = getActiveImplantadoresList();
  list.forEach(imp => {
    const opt = document.createElement('option');
    opt.value = imp;
    opt.textContent = imp.split('@')[0];
    select.appendChild(opt);
  });
  selectedImplantador = 'todos';
}

function onSearchInput() {
  const input = document.getElementById('topbar-search');
  currentSearchTerm = (input?.value || '').toLowerCase().trim();
  renderCurrentActiveView();
}

function onImplantadorFilterChange() {
  const select = document.getElementById('topbar-implantador-filter');
  selectedImplantador = select?.value || 'todos';
  renderCurrentActiveView();
}

function navigateToView(view) {
  // Guard: non-admins cannot access ajustes
  if (view === 'ajustes' && currentUser?.role !== 'admin') return;

  // Reset Solicitações to landing when switching to it
  if (view === 'projetos' && typeof switchProjetosSubView === 'function') {
    switchProjetosSubView('landing');
  }

  currentView = view;

  // Guard: non-admins cannot access docs or base-conhecimento
  if ((view === 'docs' || view === 'base-conhecimento') && currentUser?.role !== 'admin') return;

  const navIds = ['pipeline', 'lista', 'agenda', 'relatorios', 'atividades', 'projetos', 'ajustes', 'base-conhecimento', 'ajuda', 'docs'];
  navIds.forEach(id => {
    const btn = document.getElementById(`nav-item-${id}`);
    if (!btn) return;
    if (id === view) {
      btn.classList.add('bg-[#93F574]', 'text-[#002726]', 'shadow-[0_2px_8px_rgba(147,245,116,0.3)]', 'font-semibold');
      btn.classList.remove('text-white/70', 'hover:bg-white/5', 'hover:text-white', 'font-medium');
      btn.querySelector('svg')?.classList.add('text-[#002726]');
      btn.querySelector('svg')?.classList.remove('text-white/70');
    } else {
      btn.classList.remove('bg-[#93F574]', 'text-[#002726]', 'shadow-[0_2px_8px_rgba(147,245,116,0.3)]', 'font-semibold');
      btn.classList.add('text-white/70', 'hover:bg-white/5', 'hover:text-white', 'font-medium');
      btn.querySelector('svg')?.classList.remove('text-[#002726]');
      btn.querySelector('svg')?.classList.add('text-white/70');
    }
  });

  switchViewDisplay(view);
  renderCurrentActiveView();
}

function switchViewDisplay(view) {
  const sections = ['pipeline', 'lista', 'agenda', 'relatorios', 'atividades', 'projetos', 'ajustes', 'base-conhecimento', 'ajuda', 'docs'];
  sections.forEach(key => {
    const el = document.getElementById(`view-section-${key}`);
    if (el) el.classList.toggle('hidden', key !== view);
  });
}

function renderCurrentActiveView() {
  switch (currentView) {
    case 'pipeline':  renderKanbanBoard(); break;
    case 'lista':     renderTableView(); break;
    case 'agenda':    renderAgendaView(); break;
    case 'relatorios':renderMetricsView(); break;
    case 'atividades': renderAtividadesView(); break;
    case 'projetos':  renderProjetosView(); break;
    case 'ajustes':   renderSettingsView(); break;
    case 'base-conhecimento': renderBaseConhecimentoView(); break;
    case 'ajuda':     renderHelpView(); break;
    case 'docs':      renderDocsView(); break;
  }
}

// ── Show/hide modal IG vs BLV fields ─────────────────────────────────────────

function applyTeamToModal() {
  document.querySelectorAll('.ig-only').forEach(el => {
    el.classList.toggle('hidden', currentTeam !== 'ig');
  });
  document.querySelectorAll('.blv-only').forEach(el => {
    el.classList.toggle('hidden', currentTeam !== 'blv');
  });
  // Adjust status/implantador labels for BLV
  const statusLabel = document.querySelector('label[for="inp-modal-status"], #inp-modal-status')?.previousElementSibling;
  const implLabel = document.querySelector('label[for="inp-modal-implantador"], #inp-modal-implantador')?.previousElementSibling;
  const agendaLabel = document.querySelector('#inp-modal-agenda')?.previousElementSibling;
  if (statusLabel) statusLabel.textContent = currentTeam === 'blv' ? 'Fase' : 'Status';
  if (implLabel) implLabel.textContent = currentTeam === 'blv' ? 'Responsável' : 'Implantador *';
  if (agendaLabel) agendaLabel.textContent = currentTeam === 'blv' ? 'Dia da Implantação' : 'Agenda';
  // Hide IG-specific tabs for BLV
  const tabReagenda = document.getElementById('tab-btn-reagenda_estorno');
  const tabConexoes = document.getElementById('tab-btn-conexoes');
  if (tabReagenda) tabReagenda.classList.toggle('hidden', currentTeam === 'blv');
  if (tabConexoes) tabConexoes.classList.toggle('hidden', currentTeam === 'blv');
  // Update cross-team tab label
  const crossLabel = document.getElementById('tab-cross-label');
  if (crossLabel) crossLabel.textContent = currentTeam === 'blv' ? 'Implantação Guiada' : 'Loja Virtual';
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  const user = await checkAuth();
  if (!user) return;
  currentUser = user;

  // Reveal page
  document.documentElement.style.visibility = '';

  // Restore theme
  try {
    if (localStorage.getItem('ig-main-theme') === 'dark') toggleMainTheme();
  } catch {}

  // Setup UI for user
  updateUserInfo(user);
  setupTeamSelector(user);

  // Restrict admin-only items
  if (user.role !== 'admin') {
    ['nav-item-ajustes', 'nav-item-docs', 'nav-item-base-conhecimento'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.add('hidden');
    });
  }

  // Init floating chat widget (available to all users)
  initChatAgente();

  // Apply team to modal fields
  applyTeamToModal();

  // Load data for active team
  try {
    if (currentTeam === 'ig') {
      await carregarClientes();
    } else {
      await carregarClientesBLV();
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }

  // Load atividades BLV — await so cards render with activities on first paint
  if (currentTeam === 'blv') {
    try {
      await carregarAtividades();
      const badge = document.getElementById('badge-atividades-count');
      if (badge) { badge.textContent = ATIVIDADES.length; badge.classList.remove('hidden'); }
    } catch (e) { console.error('Erro ao carregar atividades:', e); }
  }

  // Load projetos in background (always, independent of team)
  carregarProjetos().then(() => {
    const badge = document.getElementById('badge-projetos-count');
    if (badge) { badge.textContent = PROJETOS.length; badge.classList.remove('hidden'); }
  }).catch(e => console.error('Erro ao carregar projetos:', e));

  initKanban();
  populateImplantadorFilter();
  navigateToView('pipeline');
  updateFooterStats();
  updateSidebarStats();
});
