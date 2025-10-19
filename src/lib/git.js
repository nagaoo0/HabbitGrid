// Git integrations library: manages sources, token encryption, fetching events, and caching
import { formatDate } from './utils-habit';

const GIT_INT_KEY = 'habitgrid_git_integrations';
const GIT_CACHE_KEY = 'habitgrid_git_cache';
const GIT_ENABLED_KEY = 'habitgrid_git_enabled';
const GIT_KEY_MATERIAL = 'habitgrid_git_k';

// --- Minimal AES-GCM encryption helpers using Web Crypto ---
async function getCryptoKey() {
  try {
    let raw = localStorage.getItem(GIT_KEY_MATERIAL);
    if (!raw) {
      const bytes = crypto.getRandomValues(new Uint8Array(32));
      raw = btoa(String.fromCharCode(...bytes));
      localStorage.setItem(GIT_KEY_MATERIAL, raw);
    }
    const buf = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
    return await crypto.subtle.importKey('raw', buf, 'AES-GCM', false, ['encrypt', 'decrypt']);
  } catch {
    return null;
  }
}

export async function encryptToken(token) {
  const key = await getCryptoKey();
  if (!key) return token; // fallback
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(token);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc));
  return `${btoa(String.fromCharCode(...iv))}:${btoa(String.fromCharCode(...ct))}`;
}

export async function decryptToken(tokenEnc) {
  const key = await getCryptoKey();
  if (!key || !tokenEnc.includes(':')) return tokenEnc || '';
  const [ivB64, ctB64] = tokenEnc.split(':');
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    return new TextDecoder().decode(pt);
  } catch {
    return '';
  }
}

// --- Integrations CRUD ---
export function getGitEnabled() {
  return localStorage.getItem(GIT_ENABLED_KEY) === 'true';
}
export function setGitEnabled(enabled) {
  localStorage.setItem(GIT_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function getIntegrations() {
  try {
    const raw = localStorage.getItem(GIT_INT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addIntegration({ provider, baseUrl, username, token }) {
  const integrations = getIntegrations();
  const tokenEnc = await encryptToken(token);
  const id = Date.now().toString();
  integrations.push({ id, provider, baseUrl, username, tokenEnc, createdAt: new Date().toISOString() });
  localStorage.setItem(GIT_INT_KEY, JSON.stringify(integrations));
  return id;
}

export function removeIntegration(id) {
  const integrations = getIntegrations().filter(x => x.id !== id);
  localStorage.setItem(GIT_INT_KEY, JSON.stringify(integrations));
}

// --- Caching ---
function getCache() {
  try {
    const raw = localStorage.getItem(GIT_CACHE_KEY);
    return raw ? JSON.parse(raw) : { lastSync: null, dailyCounts: {} };
  } catch {
    return { lastSync: null, dailyCounts: {} };
  }
}
function setCache(cache) {
  localStorage.setItem(GIT_CACHE_KEY, JSON.stringify(cache));
}

export function getCachedGitActivity() {
  return getCache();
}

// --- Fetch events per provider ---
function isOlderThan(dateStr, days) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d < cutoff;
}

function deriveGitHubGraphQLEndpoint(baseUrl) {
  try {
    const u = new URL(baseUrl || 'https://api.github.com');
    // If /api/v3 -> likely /api/graphql
    if (u.pathname.includes('/api/v3')) {
      return `${u.origin}/api/graphql`;
    }
    // If ends with /api -> /graphql under same base
    if (u.pathname.endsWith('/api')) {
      return `${u.origin}/graphql`;
    }
    // Default: append /graphql
    return `${baseUrl.replace(/\/$/, '')}/graphql`;
  } catch {
    return 'https://api.github.com/graphql';
  }
}

async function fetchGitHubGraphQL({ baseUrl = 'https://api.github.com', username, token }, days = 365) {
  if (!token) return null; // require token for GraphQL
  const endpoint = deriveGitHubGraphQLEndpoint(baseUrl);
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days + 1);
  const query = `query($login:String!, $from:DateTime!, $to:DateTime!) {
    user(login:$login) {
      contributionsCollection(from:$from, to:$to) {
        contributionCalendar { weeks { contributionDays { date contributionCount } } }
      }
    }
  }`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { login: username, from: from.toISOString(), to: to.toISOString() } }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const daysArr = json?.data?.user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(w => w.contributionDays) || [];
  const counts = {};
  for (const d of daysArr) {
    if (d?.date) counts[d.date] = (counts[d.date] || 0) + (d.contributionCount || 0);
  }
  return counts;
}

async function fetchGitHubEvents({ baseUrl = 'https://api.github.com', username, token }, days = 365) {
  // Prefer GraphQL for full-year coverage if token present
  try {
    if (token) {
      const graphCounts = await fetchGitHubGraphQL({ baseUrl, username, token }, days);
      if (graphCounts) return graphCounts;
    }
  } catch {}
  const headers = { 'Accept': 'application/vnd.github+json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const counts = {};
  for (let page = 1; page <= 3; page++) {
    const url = `${baseUrl.replace(/\/$/, '')}/users/${encodeURIComponent(username)}/events?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) break;
    for (const ev of events) {
      if (!ev || !ev.created_at) continue;
      if (isOlderThan(ev.created_at, days)) { page = 999; break; }
      if (ev.type === 'PushEvent') {
        const c = ev.payload?.size || 1;
        const day = formatDate(new Date(ev.created_at));
        counts[day] = (counts[day] || 0) + c;
      }
    }
  }
  return counts;
}

//This bullshit is still not working, but at least it is not crashing everything
async function fetchGiteaLike({ baseUrl, username, token }, days = 365) {
  let authMode = token ? 'token' : null; // 'token' | 'bearer' | null
  const counts = {};
  for (let page = 1; page <= 8; page++) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/users/${encodeURIComponent(username)}/events?limit=50&page=${page}`;
    let res;
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = authMode === 'bearer' ? `Bearer ${token}` : `token ${token}`;
      res = await fetch(url, { headers });
    } catch (e) {
      break; // likely CORS/network
    }
    if (!res.ok) {
      // Retry once with alternate auth scheme if unauthorized/forbidden
      if ((res.status === 401 || res.status === 403) && token && authMode === 'token') {
        authMode = 'bearer';
        page--; // retry same page with Bearer
        continue;
      }
      break;
    }
    let events;
    try {
      events = await res.json();
    } catch {
      break;
    }
    if (!Array.isArray(events) || events.length === 0) break;
    for (const ev of events) {
      const created = ev?.created || ev?.created_at || ev?.timestamp;
      if (!created) continue;
      if (isOlderThan(created, days)) { page = 999; break; }
      const actionRaw = (ev?.op_type || ev?.action || ev?.type || '').toString().toLowerCase();
      const isPushLike = actionRaw.includes('push') || actionRaw.includes('commit');
      if (!isPushLike) continue;
      const day = formatDate(new Date(created));
      // Try to take number of commits if provided
      let inc = 1;
      if (typeof ev?.commits_count === 'number') inc = ev.commits_count;
      else if (typeof ev?.payload?.num_commits === 'number') inc = ev.payload.num_commits;
      else if (Array.isArray(ev?.payload?.commits)) inc = ev.payload.commits.length || 1;
      counts[day] = (counts[day] || 0) + (inc || 1);
    }
  }
  return counts;
}

//gitlab fetch should work now
async function fetchGitLabEvents({ baseUrl = 'https://gitlab.com', token }, days = 365) {
  const headers = { 'Accept': 'application/json', 'PRIVATE-TOKEN': token };
  const counts = {};
  for (let page = 1; page <= 5; page++) {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v4/events?per_page=100&page=${page}&action=push`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const events = await res.json();
    if (!Array.isArray(events) || events.length === 0) break;
    for (const ev of events) {
      const created = ev?.created_at;
      if (!created) continue;
      if (isOlderThan(created, days)) { page = 999; break; }
      const day = formatDate(new Date(created));
      counts[day] = (counts[day] || 0) + 1;
    }
  }
  return counts;
}

export async function fetchAllGitActivity({ force = false, days = 365 } = {}) {
  const { lastSync, dailyCounts } = getCache();
  const last = lastSync ? new Date(lastSync) : null;
  const now = new Date();
  const withinDay = last && (now - last) < 24 * 60 * 60 * 1000;
  if (!force && withinDay && dailyCounts) {
    return { dailyCounts, lastSync };
  }

  const integrations = getIntegrations();
  const perSource = [];
  for (const src of integrations) {
    const token = await decryptToken(src.tokenEnc);
    const baseUrl = src.baseUrl || (src.provider === 'gitea' || src.provider === 'forgejo' ? 'https://gitea.com' : undefined);
    const info = { baseUrl, username: src.username, token };
    try {
      if (src.provider === 'github') {
        perSource.push(await fetchGitHubEvents(info, days));
      } else if (src.provider === 'gitlab') {
        perSource.push(await fetchGitLabEvents(info, days));
      } else if (src.provider === 'gitea' || src.provider === 'forgejo' || src.provider === 'custom') {
        perSource.push(await fetchGiteaLike(info, days));
      }
    } catch (e) {
      // Continue other sources
      console.warn('Git fetch failed for', src.provider, e);
    }
  }
  // Merge
  const merged = {};
  for (const m of perSource) {
    for (const [day, cnt] of Object.entries(m)) {
      merged[day] = (merged[day] || 0) + cnt;
    }
  }
  const updated = { lastSync: new Date().toISOString(), dailyCounts: merged };
  setCache(updated);
  return updated;
}
