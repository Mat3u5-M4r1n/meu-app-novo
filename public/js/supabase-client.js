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

// Wrapper for all API calls — injects Authorization: Bearer <JWT>
async function apiFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
}
