// Supabase browser client — loaded before all other scripts on index.html
let _sb = null;
let _session = null;

async function initSupabase() {
  if (_sb) return _sb;
  const config = await fetch('/api/config').then(r => r.json());
  _sb = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      storage: window.sessionStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  _sb.auth.onAuthStateChange((_event, session) => {
    _session = session;
    if (_event === 'SIGNED_OUT') window.location.href = '/login.html';
  });
  const { data: { session } } = await _sb.auth.getSession();
  _session = session;
  return _sb;
}

function getSupabaseClient() { return _sb; }
function getAccessToken() { return _session?.access_token ?? null; }

function getDevSession() {
  try { return JSON.parse(localStorage.getItem('blingDevSession') || 'null'); } catch { return null; }
}

// Wrapper for all API calls — injeta Authorization (JWT) ou X-Dev-Email (dev bypass)
async function apiFetch(url, options = {}) {
  const dev = getDevSession();
  const token = getAccessToken();
  const authHeaders = dev
    ? { 'X-Dev-Email': dev.email }
    : token ? { Authorization: `Bearer ${token}` } : {};
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...authHeaders
  };
  return fetch(url, { ...options, headers });
}
