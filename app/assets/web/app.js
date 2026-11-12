'use strict';
/* Jass web client: lobby, table, prompts, animations. Talks only to the server it was loaded from. */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const TEAM_COL = ['var(--team0)', 'var(--team1)', 'var(--team2)', 'var(--team3)', 'var(--team4)', 'var(--team5)', 'var(--team6)', 'var(--team7)'];
const VARIANTS = ['schieber', 'klassisch', 'bieter', 'differenzler', 'molotow', 'ohshit', 'tschausepp', 'arschloechle'];
const TRUMP_ST = [0, 1, 2, 7, 3, 8, 4, 5, 6];
const UNDER = 5;
const csuit = c => Math.floor((c % 36) / 9);
const crank = c => c % 9;

// ------------------------------------------------------------------ card skins
// Each skin is a folder skins/<name>/ with <suit>_<06..14>.svg, suit_<suit>.svg and back.svg.
const SUIT_FILE = ['schellen', 'rosen', 'schilten', 'eicheln'];
const RANK_FILE = ['06', '07', '08', '09', '10', '11', '12', '13', '14'];
const SKINS = {
  alternative: {french: false},
  french: {french: true},
};
let SKIN = 'alternative';
const french = () => SKINS[SKIN].french;

function cardSrc(id, skin) {
  skin = skin || SKIN;
  if (id < 0) return `skins/${skin}/back.svg`;
  return `skins/${skin}/${SUIT_FILE[csuit(id)]}_${RANK_FILE[crank(id)]}.svg`;
}
function suitName(s) { return t((french() ? 'suitF_' : 'suit_') + s); }
function rankName(r) { return t((french() ? 'rankF_' : 'rank_') + r); }
function cardName(id) { return t('cardName', {suit: suitName(csuit(id)), rank: rankName(crank(id))}); }
function suitIcon(s, cls) { return `<img class="suit ${cls || ''}" src="skins/${SKIN}/suit_${SUIT_FILE[s]}.svg" alt="${esc(suitName(s))}">`; }
function cardImg(id) { return `<img src="${cardSrc(id)}" decoding="sync" alt="${id < 0 ? '' : esc(cardName(id))}" draggable="false">`; }

function applySkin(name) {
  SKIN = SKINS[name] ? name : 'alternative';
  for (let id = -1; id < 36; id++) { const im = new Image(); im.src = cardSrc(id); }
}

/** Replace el's content with html, re-using the old <img> nodes for identical images. A fresh <img>
 *  starts out blank until the WebView has fetched and decoded it again, which made every card flash
 *  on each re-render on slower tablets. A reused node keeps its decoded picture. */
function setHTML(el, html) {
  const pool = new Map();
  el.querySelectorAll('img').forEach(im => {
    const k = im.outerHTML;
    if (!pool.has(k)) pool.set(k, []);
    pool.get(k).push(im);
  });
  el.innerHTML = html;
  if (!pool.size) return;
  el.querySelectorAll('img').forEach(im => {
    const old = pool.get(im.outerHTML);
    if (old && old.length) im.replaceWith(old.pop());
  });
}

function store(k, v) {
  try {
    if (v === undefined) return localStorage.getItem(k);
    localStorage.setItem(k, v);
  } catch (e) { /* storage unavailable */ }
  return null;
}

function newToken() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

const st = {
  token: (() => { let tk = store('jass_token'); if (!tk || tk.length < 16) { tk = newToken(); store('jass_token', tk); } return tk; })(),
  state: null, v: 0, gameId: null,
  viewSeat: 0, revealed: null, handVisible: false,
  sel: null, multi: [], busy: false, animating: false,
  lobbyPending: false, popup: null, confirmEnd: false,
  evSeq: null, weisOff: {}, call: {tschau: false, sepp: false},
  wishFor: null, stepVal: null, stepKey: '', pick: null, misere: false,
  lobbyVariant: null,
};

(function initLang() {
  const saved = store('jass_lang');
  const nav = (navigator.language || 'de').toLowerCase();
  let def = 'en';
  if (nav.startsWith('gsw') || nav === 'de-ch') def = 'zh';
  else if (nav.startsWith('de')) def = 'de';
  LANG = saved && I18N[saved] ? saved : def;
  document.documentElement.lang = LANG === 'en' ? 'en' : 'de';
})();

// ------------------------------------------------------------------ Bluetooth (Android app only)
// The app exposes window.JassApp. A guest phone shows this page from its own copy of the app;
// only the API calls travel over Bluetooth to the host.

function bt() {
  try { return window.JassApp && JassApp.btInfo ? JSON.parse(JassApp.btInfo()) : null; } catch (e) { return null; }
}
const BT_TEXTS = ['btNoAdapter', 'btTurnOn', 'btNoPerm', 'btAppSettings', 'btHostFailed', 'btPick', 'btNone',
  'btPair', 'btConnecting', 'btFailed', 'btVersion', 'cancel'];
function sendBtTexts() {
  if (!window.JassApp || !JassApp.btTexts) return;
  const o = {};
  BT_TEXTS.forEach(k => { o[k] = t(k); });
  try { JassApp.btTexts(JSON.stringify(o)); } catch (e) { /* ignore */ }
}
window.btChanged = () => {
  if (st.state && st.state.phase === 'lobby') renderLobby();
  if (st.popup) openPopup(st.popup);
};

// ------------------------------------------------------------------ networking

async function api(action, params = {}) {
  const body = new URLSearchParams(Object.assign({token: st.token}, params));
  try {
    const r = await fetch('/api/' + action, {method: 'POST', body});
    if (r.status === 503) throw new Error('offline');
    const j = await r.json();
    if (!j.ok) toast(errText(j.error));
    return !!j.ok;
  } catch (e) {
    toast(t('connLost'));
    return false;
  }
}

async function act(action, params = {}, seat) {
  if (st.busy) return false;
  st.busy = true;
  const ok = await api('act', Object.assign({seat: seat === undefined ? st.viewSeat : seat, action}, params));
  st.busy = false;
  if (!ok) rerender();
  return ok;
}

function errText(e) {
  const k = 'err_' + e;
  return I18N.en[k] ? t(k) : t('err_default', {e});
}

async function poll() {
  for (;;) {
    let s;
    try {
      const r = await fetch(`/api/state?token=${encodeURIComponent(st.token)}&since=${st.v}`, {cache: 'no-store'});
      if (!r.ok) throw new Error('HTTP ' + r.status);
      s = await r.json();
      setConn(true);
    } catch (e) {
      setConn(false);
      await sleep(2000);
      continue;
    }
    try { await apply(s); } catch (e) { console.error(e); st.animating = false; }
  }
}

function setConn(ok) {
  const c = $('#conn');
  c.textContent = t('connLost');
  c.hidden = ok;
}

// ------------------------------------------------------------------ state

async function apply(s) {
  const prev = st.state;
  st.state = s;
  st.v = s.v;
  if (s.gameId !== st.gameId) {
    st.gameId = s.gameId; st.revealed = null; st.sel = null; st.multi = []; st.evSeq = null;
  }
  if (s.phase === 'lobby') {
    st.sel = null;
    closeResult();
    renderLobby();
    return;
  }
  const comparable = prev && prev.phase !== 'lobby' && prev.gameId === s.gameId && $('#app').dataset.view === 'game';
  await renderGame(comparable ? prev : null, s);
}

function rerender() {
  const s = st.state;
  if (!s) return;
  if (s.phase === 'lobby') { renderLobby(true); return; }
  computeView(s);
  buildGame(s);
  if (s.phase !== 'playing') showResult(s); else closeResult();
  if (st.popup) openPopup(st.popup);
}

function seatName(i) {
  const se = st.state.seats[i];
  if (se && se.name) return se.name;
  return (se && se.type === 'bot' ? t('botName') : t('player')) + ' ' + (i + 1);
}
function cfg() { return st.state.config; }
function game() { return st.state.game; }
function teamOf(i) {
  const g = game();
  if (g && g.teamOf) return g.teamOf[i];
  return cfg().teamPlay ? i % 2 : (cfg().variant === 'bieter' ? -1 : i);
}
function nTeams() {
  const g = game();
  if (g) return g.teams;
  return cfg().teamPlay ? 2 : cfg().players;
}
function teamColor(tm) { return tm < 0 ? 'var(--muted)' : TEAM_COL[tm % TEAM_COL.length]; }
function teamName(tm) {
  const s = st.state, g = s.game;
  if (g && g.variant === 'bieter') {
    if (tm === 1) return t('bauern');
    let nm = t('king');
    if (g.king >= 0) nm += ' ' + seatName(g.king) + (g.partner >= 0 ? ' & ' + seatName(g.partner) : '');
    return nm;
  }
  if (s.config.teamPlay) return seatName(tm) + ' & ' + seatName(tm + 2);
  return seatName(tm);
}
function teamShort(tm) {
  const s = st.state, g = s.game;
  if (g && g.variant === 'bieter') return tm === 0 ? t('king') : t('bauern');
  if (s.config.teamPlay) return seatName(tm).slice(0, 7) + '/' + seatName(tm + 2).slice(0, 7);
  return seatName(tm);
}
const vName = v => t('v_' + v);

// ------------------------------------------------------------------ lobby

function seg(name, opts, cur, disabled) {
  return `<div class="seg" data-cfg="${name}" aria-disabled="${!!disabled}">` +
    opts.map(([v, l]) => `<button data-v="${v}" class="${String(v) === String(cur) ? 'on' : ''}" ${disabled ? 'disabled' : ''}>${esc(l)}</button>`).join('') +
    '</div>';
}
function toggle(name, label, on, ro) {
  return `<label class="toggle"><input type="checkbox" data-tg="${name}" ${on ? 'checked' : ''} ${ro ? 'disabled' : ''}> ${esc(label)}</label>`;
}

const LANGS = {de: 'Deutsch', zh: 'Zürischnurre', be: 'Bärndütsch', bar: 'Bairisch', en: 'English'};
function langSelect() {
  return `<select class="lang" aria-label="${t('language')}">` +
    Object.keys(LANGS).map(k => `<option value="${k}" ${k === LANG ? 'selected' : ''}>${LANGS[k]}</option>`).join('') + '</select>';
}

function skinPicker() {
  return '<div class="skinpick">' + Object.keys(SKINS).map(k =>
    `<button data-skin="${k}" class="${k === SKIN ? 'on' : ''}">` +
    `<span class="fan"><span class="card mini"><img src="${cardSrc(26, k)}" alt=""></span><span class="card mini"><img src="${cardSrc(17, k)}" alt=""></span></span>` +
    `<span>${t('skin_' + k)}</span></button>`).join('') + '</div>';
}
function bindSkinPicker(root) { $$('[data-skin]', root).forEach(b => b.onclick = () => setSkin(b.dataset.skin)); }
function setSkin(k) {
  store('jass_skin', k);
  applySkin(k);
  const m = $('#resultModal');
  if (m) m.dataset.key = '';
  rerender();
  if (st.popup) openPopup(st.popup);
}

function lobbyHeader() {
  return `<header>
    <div class="logo"><div class="card"><img src="${cardSrc(14)}" alt=""></div><div class="card"><img src="${cardSrc(12)}" alt=""></div></div>
    <div class="grow"><h1>Jass</h1><div class="sub">${t('subtitle')}</div></div>
    ${langSelect()}
  </header>`;
}

function renderLobby(force) {
  const app = $('#app');
  const ae = document.activeElement;
  if (!force && ae && ae.tagName === 'INPUT' && ae.type === 'text' && app.contains(ae)) { st.lobbyPending = true; return; }
  st.lobbyPending = false;
  app.dataset.view = 'lobby';
  setHTML(app, `<div class="lobby">${lobbyHeader()}${st.state.isHost ? hostLobby(st.state) : guestLobby(st.state)}</div>`);
  bindLobby();
}

function multLabel(k) {
  return t('mult_' + k, {s0: suitName(0), s1: suitName(1), s2: suitName(2), s3: suitName(3)});
}

function optionsHTML(c, ro) {
  const v = c.variant;
  const rows = [];
  const pl = [];
  for (let p = c.minPlayers; p <= c.maxPlayers; p++) pl.push([p, v === 'schieber' ? '4 (2×2)' : String(p)]);
  rows.push(`<div class="row"><label>${t('players')}</label>${seg('players', pl, c.players, ro)}</div>`);
  if (v === 'klassisch' && c.players === 4) rows.push(`<div class="row">${toggle('teams', t('o_teams'), c.teams, ro)}</div>`);
  if (v === 'klassisch' || v === 'schieber') {
    const tg = v === 'schieber' ? [1000, 1500, 2500, 5000] : [1000, 1500, 2500];
    rows.push(`<div class="row"><label>${t('o_target')}</label>${seg('target', tg.map(x => [x, x]), c.target, ro)}</div>`);
    rows.push(`<div class="row col"><label>${t('o_mult')}</label>${seg('mult', ['simple', 'double', 'double4', 'appenzell'].map(k => [k, multLabel(k)]), c.mult, ro)}</div>`);
    rows.push(`<div class="row"><label>${t('o_thanks')}</label>${seg('manualThanks', [[1, t('thanks_manual')], [0, t('thanks_auto')]], c.manualThanks ? 1 : 0, ro)}</div>`);
  }
  if (v === 'schieber') {
    rows.push(`<div class="row col"><label>${t('o_extras')}</label><div class="tgs">${toggle('slalom', t('x_slalom'), c.slalom, ro)}${toggle('tutti', t('x_tutti'), c.tutti, ro)}${toggle('misere', t('x_misere'), c.misere, ro)}</div></div>`);
  }
  if (v === 'bieter') rows.push(`<div class="hint">${t('bieterInfo', {min: c.players === 3 ? 600 : c.players === 4 ? 350 : 500})}</div>`);
  if (v === 'differenzler') {
    rows.push(`<div class="row"><label>${t('o_rounds')}</label>${seg('rounds', [4, 8, 12, 16].map(x => [x, x]), c.rounds, ro)}</div>`);
    rows.push(`<div class="row">${toggle('hidden', t('o_hidden'), c.hidden, ro)}</div>`);
  }
  if (v === 'molotow') rows.push(`<div class="row"><label>${t('o_rounds')}</label>${seg('rounds', [4, 8, 12].map(x => [x, x]), c.rounds, ro)}</div>`);
  if (v === 'tschausepp') {
    rows.push(`<div class="row"><label>${t('o_limit')}</label>${seg('limit', [100, 200, 500].map(x => [x, x]), c.limit, ro)}</div>`);
    rows.push(`<div class="row">${toggle('reverse10', t('o_reverse10'), c.reverse10, ro)}</div>`);
  }
  if (v === 'arschloechle') {
    rows.push(`<div class="row"><label>${t('o_rounds')}</label>${seg('rounds', [5, 10, 15].map(x => [x, x]), c.rounds, ro)}</div>`);
    rows.push(`<div class="row col"><div class="tgs">${toggle('freePass', t('o_freePass'), c.freePass, ro)}${toggle('joker', t('o_joker', {card: cardName(9)}), c.joker, ro)}</div></div>`);
  }
  if (v === 'ohshit') rows.push(`<div class="row">${toggle('bonus', t('o_bonus'), c.bonus, ro)}</div>`);
  return rows.join('');
}

function variantPicker(cur, ro) {
  return `<div class="vpick">` + VARIANTS.map(v =>
    `<button data-variant="${v}" class="${v === cur ? 'on' : ''}" ${ro ? 'disabled' : ''}><b>${esc(vName(v))}</b><span>${esc(t('vd_' + v))}</span></button>`).join('') + '</div>';
}

function hostLobby(s) {
  const c = s.config;
  let seats = '';
  let open = false;
  for (let i = 0; i < c.players; i++) {
    const se = s.seats[i];
    const typeSel = `<select data-seat-type="${i}">` +
      ['local', 'remote', 'bot'].map(k => `<option value="${k}" ${se.type === k ? 'selected' : ''}>${t(k)}</option>`).join('') + '</select>';
    let extra = '';
    if (se.type === 'remote') {
      if (se.taken) extra = `<span class="status ${se.online ? 'ok' : ''}">${esc(seatName(i))} · ${se.online ? t('online') : t('offline')}</span>`;
      else { extra = `<span class="status">${t('waitingRemote')}</span>`; open = true; }
    } else {
      const def = (se.type === 'bot' ? t('botName') : t('player')) + ' ' + (i + 1);
      extra = `<input type="text" maxlength="16" data-seat-name="${i}" value="${esc(se.name)}" placeholder="${esc(def)}">`;
      if (se.type === 'bot') {
        extra += `<select data-seat-bot="${i}">` + ['easy', 'normal', 'hard'].map((k, l) =>
          `<option value="${l}" ${se.bot === l ? 'selected' : ''}>${t(k)}</option>`).join('') + '</select>';
      }
    }
    seats += `<div class="seat"><span class="num" style="background:${teamColor(teamOf(i))}">${i + 1}</span>${typeSel}${extra}</div>`;
  }
  const anyRemote = s.seats.slice(0, c.players).some(x => x.type === 'remote');
  const b = bt();
  const btBox = !b || !b.avail ? '' : b.hosting
    ? `<div class="bt"><div class="hint">${t('btOnHint', {name: esc(b.name || '?')})}</div><button class="btn small ghost" id="btOff">${t('btOff')}</button></div>`
    : `<div class="bt"><div class="hint">${t('btOffHint')}</div><button class="btn small" id="btOn">${t('btAllow')}</button></div>`;
  const addrs = (s.addresses || []).map(a => {
    const url = `http://${esc(a)}:${s.port}`;
    return `<div class="addr"><span class="url">${url}</span><button class="copy" data-copy="${url}" aria-label="${t('copy')}">` +
      `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>` +
      `<path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg>` +
      `<span>${t('copy')}</span></button></div>`;
  }).join('');
  return `
  <div class="box"><h2>${t('variant')}</h2>${variantPicker(c.variant)}</div>
  <div class="box">${optionsHTML(c)}
    <button class="btn ghost small rulesBtn" data-rules="${c.variant}">${t('rulesOf', {v: vName(c.variant)})}</button></div>
  <div class="box"><h2>${t('seats')}</h2>${seats}</div>
  ${anyRemote ? `<div class="box">
    <div class="hint">${addrs ? t('joinHint') : t('noNetwork')}</div>
    ${addrs}
    ${btBox}
  </div>` : ''}
  <button class="btn big" id="startBtn" ${open ? 'disabled' : ''}>${open ? t('startNeedsSeats') : t('start')}</button>
  <div class="box"><h2>${t('skin')}</h2>${skinPicker()}</div>
  ${b && b.avail ? `<button class="btn ghost big" id="btJoinBtn">${t('btJoin')}</button>` : ''}`;
}

function guestLobby(s) {
  const c = s.config;
  const myName = store('jass_name') || '';
  let seats = '';
  let anyOpen = false;
  let seated = false;
  for (let i = 0; i < c.players; i++) {
    const se = s.seats[i];
    let right;
    if (se.type === 'remote') {
      if (se.you) { right = `<b>${t('you')}</b> <button class="btn small ghost" id="leaveBtn">${t('leave')}</button>`; seated = true; }
      else if (se.taken) right = `<span class="status ok">${esc(seatName(i))}</span>`;
      else { right = `<button class="btn small" data-sit="${i}">${t('sitHere')}</button>`; anyOpen = true; }
    } else {
      right = `<span class="status">${esc(seatName(i))} · ${se.type === 'bot' ? t('bot') : t('hostDevice')}</span>`;
    }
    seats += `<div class="seat"><span class="num" style="background:${teamColor(teamOf(i))}">${i + 1}</span>${right}</div>`;
  }
  const b = bt();
  const btGuest = b && b.mode === 'guest'
    ? `<div class="box bt"><div class="hint">${t('btGuest', {name: esc(b.peer || '?')})}</div><button class="btn small ghost" id="btLeave">${t('btLeave')}</button></div>`
    : '';
  return `${btGuest}
  <div class="box">
    <div class="row"><label>${t('yourName')}</label><input type="text" id="myName" maxlength="16" value="${esc(myName)}" placeholder="${t('player')}"></div>
  </div>
  <div class="box"><h2>${esc(vName(c.variant))}</h2>${optionsHTML(c, true)}
    <button class="btn ghost small rulesBtn" data-rules="${c.variant}">${t('rulesOf', {v: vName(c.variant)})}</button></div>
  <div class="box"><h2>${t('seats')}</h2>${seats}
    <div class="hint" style="margin-top:8px">${seated ? t('waitingHost') : (anyOpen ? '' : t('noSeats'))}</div>
  </div>
  <div class="box"><h2>${t('skin')}</h2>${skinPicker()}</div>`;
}

function bindLobby() {
  const app = $('#app');
  $$('.lang', app).forEach(el => el.onchange = () => setLang(el.value));
  $$('[data-variant]', app).forEach(b => b.onclick = () => api('config', {variant: b.dataset.variant}));
  $$('.seg[data-cfg] button', app).forEach(b => b.onclick = () => api('config', {[b.parentElement.dataset.cfg]: b.dataset.v}));
  $$('[data-tg]', app).forEach(el => el.onchange = () => api('config', {[el.dataset.tg]: el.checked ? '1' : '0'}));
  $$('[data-seat-type]', app).forEach(el => el.onchange = () => api('config', {[`seat${el.dataset.seatType}_type`]: el.value}));
  $$('[data-seat-bot]', app).forEach(el => el.onchange = () => api('config', {[`seat${el.dataset.seatBot}_bot`]: el.value}));
  $$('[data-seat-name]', app).forEach(el => {
    el.onchange = () => api('config', {[`seat${el.dataset.seatName}_name`]: el.value});
    el.onkeydown = e => { if (e.key === 'Enter') el.blur(); };
  });
  const my = $('#myName');
  if (my) {
    my.onchange = () => store('jass_name', my.value.trim());
    my.onkeydown = e => { if (e.key === 'Enter') my.blur(); };
  }
  $$('[data-sit]', app).forEach(b => b.onclick = () => {
    const i = +b.dataset.sit;
    const nm = ($('#myName') && $('#myName').value.trim()) || '';
    store('jass_name', nm);
    api('join', {seat: i, name: nm || t('player') + ' ' + (i + 1)});
  });
  const lv = $('#leaveBtn');
  if (lv) lv.onclick = () => api('leave');
  const sb = $('#startBtn');
  if (sb) sb.onclick = () => api('start');
  $$('[data-rules]', app).forEach(b => b.onclick = () => openPopup('rules:' + b.dataset.rules));
  bindSkinPicker(app);
  $$('[data-copy]', app).forEach(b => b.onclick = () => copyText(b.dataset.copy));
  const bOn = $('#btOn', app), bOff = $('#btOff', app), bJoin = $('#btJoinBtn', app), bLeave = $('#btLeave', app);
  if (bOn) bOn.onclick = () => { sendBtTexts(); JassApp.btHost(true); };
  if (bOff) bOff.onclick = () => JassApp.btHost(false);
  if (bJoin) bJoin.onclick = () => { sendBtTexts(); JassApp.btJoin(); };
  if (bLeave) bLeave.onclick = () => JassApp.btLeave();
}

document.addEventListener('focusout', () => setTimeout(() => {
  if (st.lobbyPending && st.state && st.state.phase === 'lobby') renderLobby();
}, 60));

/** Copy text: Android app bridge first, then the Clipboard API, then the legacy fallback. */
async function copyText(text) {
  let ok = false;
  try {
    if (window.JassApp && window.JassApp.copy) ok = window.JassApp.copy(text);
    else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; }
  } catch (e) { ok = false; }
  if (!ok) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:0;top:0';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
  }
  toast(ok ? t('copied') : text);
}

// ------------------------------------------------------------------ game helpers

function computeView(s) {
  const g = s.game, mine = s.mySeats;
  const hot = mine.length > 1;
  const playing = s.phase === 'playing';
  if (playing && mine.includes(g.actor)) st.viewSeat = g.actor;
  else if (!mine.includes(st.viewSeat)) st.viewSeat = mine.length ? mine[0] : 0;
  st.handVisible = mine.includes(st.viewSeat) &&
    (!hot || (playing && st.revealed === st.viewSeat && g.actor === st.viewSeat));
}

function myTurn(s) {
  return s.phase === 'playing' && s.game.actor === st.viewSeat && st.handVisible;
}

function modeLabel(m, short) {
  if (!m) return '';
  let txt;
  switch (m.type) {
    case 0: txt = suitIcon(m.suit) + (short ? '' : ' ' + esc(suitName(m.suit))); break;
    case 7: txt = m.suit >= 0 ? suitIcon(m.suit) + (short ? '' : ' ' + esc(suitName(m.suit))) : esc(t('m_molotow')); break;
    default: txt = esc(t('m_' + ['', 'obe', 'une', 'slalomObe', 'slalomUne', 'tutti', 'hindersi'][m.type]));
  }
  if (m.misere) txt += ' · ' + esc(t('misere'));
  return txt;
}
function modeKeyLabel(key) {
  if (!key) return '';
  const mis = key.endsWith('-m');
  const k = mis ? key.slice(0, -2) : key;
  let m;
  if (k.startsWith('trump')) m = {type: 0, suit: +k[5]};
  else m = {type: ['', 'obe', 'une', 'slalomObe', 'slalomUne', 'tutti', 'hindersi', 'molotow'].indexOf(k), suit: -1};
  m.misere = mis;
  return modeLabel(m);
}

function sortAsch(cards, joker) {
  const k = c => (c === joker ? 100 : crank(c)) * 10 + csuit(c);
  return cards.slice().sort((a, b) => k(a) - k(b));
}
function sortHand(cards, mode) {
  const ts = mode && (mode.type === 0 || mode.type === 7) ? mode.suit : -1;
  const une = mode && mode.type === 2;
  const sp = s => (s === ts ? -1 : s);
  const str = c => {
    const r = crank(c);
    if (csuit(c) === ts) return TRUMP_ST[r];
    return une ? 8 - r : r;
  };
  return cards.slice().sort((a, b) => sp(csuit(a)) - sp(csuit(b)) || str(a) - str(b) || a - b);
}

function cardEl(id, cls) {
  return `<div class="card ${cls || ''}" data-id="${id}">${cardImg(id)}</div>`;
}
function backEl() { return `<div class="card back">${cardImg(-1)}</div>`; }
function mini(id) { return `<span class="card mini">${cardImg(id)}</span>`; }

const DEALER_ICON = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9.5" fill="#e3b23c"/>` +
  `<rect x="4.2" y="4.6" width="7" height="10" rx="1.2" fill="#fff" stroke="#5a3a06" stroke-width="1" transform="rotate(-14 7.7 9.6)"/>` +
  `<rect x="8.6" y="5.2" width="7" height="10" rx="1.2" fill="#fff" stroke="#5a3a06" stroke-width="1" transform="rotate(12 12.1 10.2)"/>` +
  `<circle cx="12.1" cy="10.2" r="1.6" fill="#b8282e"/></svg>`;
const CROWN = `<svg viewBox="0 0 20 16" aria-hidden="true"><path d="M2 14 L1 4 L6 8 L10 1 L14 8 L19 4 L18 14Z" fill="#e3b23c" stroke="#5a3a06" stroke-width="1"/></svg>`;

function badges(g, i) {
  let b = '';
  if (g.dealer === i) b += `<span class="dealer" title="${esc(t('dealer'))}">${DEALER_ICON}</span>`;
  if (g.variant === 'bieter' && g.king === i) b += `<span class="crown" title="${esc(t('king'))}">${CROWN}</span>`;
  return b;
}

/** Small info chips under a player's name (bid, announcement, tricks …). */
function seatChips(g, i) {
  const ch = [];
  if (g.kind === 'trick') {
    if (g.variant === 'differenzler' && g.announced && g.announced[i] !== null && g.announced[i] !== undefined)
      ch.push(`<span class="chip">⟶${g.announced[i] < 0 ? '?' : g.announced[i]}</span>`);
    if (g.variant === 'ohshit' && g.bids && g.bids[i] >= 0) ch.push(`<span class="chip ${g.tricks[i] === g.bids[i] ? 'ok' : g.tricks[i] > g.bids[i] ? 'bad' : ''}">${g.tricks[i]}/${g.bids[i]}</span>`);
    else if (g.step === 'play' || g.step === 'roundEnd' || g.step === 'gameOver') {
      if (g.tricks && g.tricks[i]) ch.push(`<span class="chip">✋${g.tricks[i]}</span>`);
    }
    if (g.points && g.points[i]) ch.push(`<span class="chip pts">${g.points[i]}</span>`);
    if (g.variant === 'bieter' && g.step === 'bid') {
      if (g.highBidder === i) ch.push(`<span class="chip ok">${g.highBid}</span>`);
      else if (g.out && g.out[i]) ch.push(`<span class="chip bad">${esc(t('fort'))}</span>`);
    }
    if (g.stoeck === i) ch.push(`<span class="chip ok">${esc(t('stoeckShort'))}</span>`);
  } else if (g.kind === 'asch') {
    if (g.lastTitles && g.lastTitles[i]) ch.push(`<span class="chip title-${g.lastTitles[i]}">${esc(t('t_' + g.lastTitles[i]))}</span>`);
    if (g.places && g.places[i]) ch.push(`<span class="chip ok">${g.places[i]}. ${esc(t('t_' + g.titles[i]))}</span>`);
    else if (g.passed && g.passed[i]) ch.push(`<span class="chip">${esc(t('passShort'))}</span>`);
  } else {
    if (g.handCounts[i] === 1) ch.push(`<span class="chip bad">1!</span>`);
  }
  return ch.join('');
}

function seatBox(s, i) {
  const g = s.game, se = s.seats[i];
  const turn = s.phase === 'playing' && g.actor === i;
  const cnt = g.handCounts[i] || 0;
  const shown = Math.min(cnt, 12);
  const backs = Array.from({length: shown}, backEl).join('');
  let badge = '';
  if (se.type === 'bot') badge = `<span class="badge botb">${t('bot')}</span>`;
  else if (se.type === 'remote' && !se.online) badge = `<span class="badge off">${t('offline')}</span>`;
  return `<div class="opp ${turn ? 'turn' : ''}" data-seat="${i}">
    <div class="name"><span class="dot" style="background:${teamColor(teamOf(i))}"></span><span class="nm">${esc(seatName(i))}</span>${badges(g, i)} ${badge}</div>
    <div class="line"><div class="backs" style="--nb:${shown}">${backs}</div>${cnt > 12 || g.kind === 'tschau' ? `<span class="cnt">${cnt}</span>` : ''}</div>
    <div class="chips">${seatChips(g, i)}</div>
  </div>`;
}

/** Position of a seat's card in the trick, relative to the viewer: me at the bottom, then counterclockwise. */
function slotPos(seat, n, me) {
  const rel = ((seat - me) % n + n) % n;
  const a = (90 - rel * 360 / n) * Math.PI / 180;
  return {x: Math.cos(a) * 30, y: Math.sin(a) * 27, r: (rel * 37 % 15) - 7};
}

function trickHTML(pairs, n, me, winner) {
  return pairs.map(([seat, card]) => {
    const p = slotPos(seat, n, me);
    return `<div class="card tcard ${winner === seat ? 'win' : ''}" data-id="${card}" data-seat="${seat}" style="left:calc(50% + ${p.x.toFixed(1)}%);top:calc(50% + ${p.y.toFixed(1)}%);--r:${p.r}deg">${cardImg(card)}</div>`;
  }).join('');
}

function trickCenter(s, opt) {
  const g = s.game, n = s.config.players, me = st.viewSeat;
  const pairs = opt.trick || g.trick || [];
  const winner = opt.trick && g.lastTrick ? g.lastTrick.winner : -1;
  let side = '';
  if (g.shown >= 0) side += `<div class="side"><div class="card">${cardImg(g.shown)}</div><div>${esc(t('bodentrumpf'))}</div></div>`;
  if (g.variant === 'bieter' && (g.step === 'bid') && (g.tableUp.length || g.tableDown)) {
    side += `<div class="side table"><div class="tbl">${g.tableUp.map(c => `<div class="card">${cardImg(c)}</div>`).join('')}${Array.from({length: g.tableDown}, backEl).join('')}</div><div>${esc(t('tableCards'))}</div></div>`;
  }
  const mode = g.mode && (g.step === 'play' || g.step === 'roundEnd' || g.step === 'gameOver' || g.variant === 'ohshit' || g.variant === 'differenzler')
    ? `<div class="modebadge">${modeLabel(g.mode)}${g.mult > 1 ? ` <b>×${g.mult}</b>` : ''}</div>` : '';
  const last = g.lastTrick && !opt.trick ? `<button class="lastbtn" id="lastBtn" title="${esc(t('lastTrick'))}">⟲</button>` : '';
  const called = g.variant === 'bieter' && g.calledCard >= 0 && g.partner < 0 ? `<div class="called">${esc(t('calledCard'))} ${mini(g.calledCard)}</div>` : '';
  return `<div class="center">${side}${mode}${last}${called}<div id="trick">${trickHTML(pairs, n, me, winner)}</div></div>`;
}

function tsCenter(s) {
  const g = s.game;
  const wish = g.wish >= 0 ? `<div class="wish">${esc(t('wishLabel'))} ${suitIcon(g.wish, 'big')}</div>` : '';
  const pend = g.pending > 0 ? `<div class="pending">+${g.pending}</div>` : '';
  const dir = s.config.reverse10 ? `<div class="dir">${g.dir > 0 ? '↺' : '↻'}</div>` : '';
  return `<div class="center ts">
    <div class="stock ${g.stock ? '' : 'empty'}" id="stock">${backEl()}<div>${g.stock}</div></div>
    <div class="pile" id="pile">${g.top >= 0 ? `<div class="card" data-id="${g.top}">${cardImg(g.top)}</div>` : ''}${pend}</div>
    <div class="tsinfo">${wish}${dir}${g.mustCover ? `<div class="hint">${esc(t('mustCover'))}</div>` : ''}</div>
  </div>`;
}

function aschCenter(s) {
  const g = s.game;
  const cards = g.table || [];
  const owner = g.tableOwner >= 0 && cards.length ? `<div class="owner">${esc(seatName(g.tableOwner))}</div>` : '';
  return `<div class="center asch"><div id="atable">${cards.map((c, i) =>
    `<div class="card ${c === g.joker ? 'joker' : ''}" data-id="${c}" style="--i:${i - (cards.length - 1) / 2}">${cardImg(c)}</div>`).join('')}</div>${owner}</div>`;
}

/** Cards currently selected in Arschloechle and whether they make a valid play. */
function aschValid(g) {
  const sel = st.multi;
  if (!sel.length) return false;
  const joker = sel.includes(g.joker);
  if (joker && sel.length !== 1) return false;
  const r = crank(sel[0]);
  if (!joker && sel.some(c => crank(c) !== r || c === g.joker)) return false;
  if (!g.tableCount) return true;
  if (joker) return g.tableStrength < 100;
  return sel.length === g.tableCount && r > g.tableStrength;
}

function statusText(s) {
  const g = s.game, mine = s.mySeats, hot = mine.length > 1;
  if (s.phase !== 'playing') return '';
  const a = g.actor;
  if (a < 0) return '';
  if (myTurn(s)) {
    switch (g.step) {
      case 'play':
        if (g.kind === 'tschau') {
          if (g.pending > 0) return t('tsPending', {n: g.pending});
          if (g.drawn >= 0) return t('tsDrawn');
          return st.sel !== null ? t('tapAgain') : t('yourTurnTS');
        }
        if (g.kind === 'asch') return g.tableCount ? t('aschBeat', {n: g.tableCount}) : t('aschLead');
        return st.sel !== null ? t('tapAgain') : t('yourTurn');
      case 'trump': return t('chooseTrump');
      case 'bid': return g.variant === 'bieter' ? t('auctionTitle') : t('ohBidTitle', {n: g.cardsPer});
      case 'announce': return t('announceTitle');
      case 'discard': return t('discardN', {n: g.prompt ? g.prompt.count : 0});
      case 'callCard': return t('callCardTitle');
      case 'decline': return t('declineTitle', {card: cardName(g.shown)});
      case 'exchange': return t('giveTitle', {n: g.prompt.count, name: seatName(g.prompt.to)});
      default: return '';
    }
  }
  if (hot && mine.includes(a)) return '';
  const name = seatName(a);
  const k = {play: 'turnOf', trump: 'choosing', bid: 'bidding', announce: 'announcing', discard: 'discarding', callCard: 'calling', decline: 'deciding', exchange: 'exchanging'}[g.step] || 'turnOf';
  return t(k, {name});
}

// ------------------------------------------------------------------ prompts

function stepperHTML(min, max, stepSmall, stepBig, val, okLabel, extra) {
  const btn = (d, l) => `<button class="sbtn" data-d="${d}">${l}</button>`;
  return `<div class="prompt"><div class="stepper">${btn(-stepBig, '−' + stepBig)}${btn(-stepSmall, '−' + stepSmall)}<b id="stepVal">${val}</b>${btn(stepSmall, '+' + stepSmall)}${btn(stepBig, '+' + stepBig)}</div>
    <div class="pbtns"><button class="btn" id="stepOk">${esc(okLabel)}</button>${extra || ''}</div></div>`;
}

function promptHTML(s) {
  const g = s.game, pr = g.prompt;
  if (!myTurn(s)) return '';
  if (g.kind === 'tschau') {
    const draw = g.canDraw ? `<button class="btn small" id="tsDraw">${esc(g.pending > 0 ? t('drawN', {n: g.pending}) : t('draw'))}</button>` : '';
    const pass = g.canPass ? `<button class="btn small ghost" id="tsPass">${esc(t('passTurn'))}</button>` : '';
    const calls = `<button class="btn small call ${st.call.tschau ? 'on' : ''}" id="callT">${esc(t('tschau'))}</button>` +
      `<button class="btn small call ${st.call.sepp ? 'on' : ''}" id="callS">${esc(t('sepp'))}</button>`;
    let wish = '';
    if (st.wishFor !== null) {
      wish = `<div class="wishpick"><span>${esc(t('wishTitle'))}</span>${[0, 1, 2, 3].map(x => `<button data-wish="${x}">${suitIcon(x, 'big')}</button>`).join('')}<button class="btn small ghost" id="wishCancel">✕</button></div>`;
    }
    return `<div class="prompt"><div class="pbtns">${draw}${pass}${calls}</div>${wish}</div>`;
  }
  if (g.kind === 'asch') {
    if (g.step === 'exchange') {
      return `<div class="prompt"><div class="pbtns"><button class="btn" id="giveBtn" ${st.multi.length === pr.count ? '' : 'disabled'}>${esc(t('giveBtn', {k: st.multi.length, n: pr.count}))}</button></div></div>`;
    }
    return `<div class="prompt"><div class="pbtns"><button class="btn" id="aschPlay" ${aschValid(g) ? '' : 'disabled'}>${esc(t('playN', {n: st.multi.length}))}</button>` +
      (g.canPass ? `<button class="btn ghost" id="aschPass">${esc(t('passTurn'))}</button>` : '') + `</div></div>`;
  }
  if (g.step === 'play') {
    if (!g.weisOffer) return '';
    const chips = g.weisOffer.map((w, i) => `<button class="wchip ${st.weisOff[i] ? '' : 'on'}" data-weis="${i}">${weisLabel(w)}</button>`).join('');
    return `<div class="prompt weis"><span>${esc(t('weisAsk'))}</span>${chips}</div>`;
  }
  if (!pr) return '';
  switch (pr.type) {
    case 'trump': {
      const btns = pr.options.map((k, i) => {
        const mult = pr.mults && pr.mults[i] > 1 ? `<i>×${pr.mults[i]}</i>` : '';
        return `<button class="mbtn" data-mode="${k}">${modeKeyLabel(k)}${mult}</button>`;
      }).join('');
      const mis = pr.misere ? `<label class="toggle"><input type="checkbox" id="misereTg" ${st.misere ? 'checked' : ''}> ${esc(t('misere'))}</label>` : '';
      const push = pr.canPush ? `<button class="btn small ghost" id="pushBtn">${esc(t('push'))}</button>` : '';
      return `<div class="prompt"><div class="mgrid">${btns}</div><div class="pbtns">${mis}${push}</div></div>`;
    }
    case 'announce': {
      const key = 'ann' + g.round;
      if (st.stepKey !== key) { st.stepKey = key; st.stepVal = 40; }
      return stepperHTML(0, 157, 1, 10, st.stepVal, t('announceBtn', {v: st.stepVal}));
    }
    case 'auction': {
      const key = 'auc' + pr.min;
      if (st.stepKey !== key) { st.stepKey = key; st.stepVal = pr.min; }
      return stepperHTML(pr.min, 5000, 10, 50, st.stepVal, t('bidNow', {v: st.stepVal}),
        `<button class="btn ghost" id="passBtn">${esc(t('fort'))}</button>`);
    }
    case 'bid': {
      const b = [];
      for (let v = 0; v <= pr.max; v++) b.push(`<button class="nbtn" data-bid="${v}" ${v === pr.forbidden ? 'disabled' : ''}>${v}</button>`);
      return `<div class="prompt"><div class="nrow">${b.join('')}</div>${pr.forbidden >= 0 ? `<div class="hint">${esc(t('forbidden', {v: pr.forbidden}))}</div>` : ''}</div>`;
    }
    case 'discard':
      return `<div class="prompt"><div class="pbtns"><button class="btn" id="discardBtn" ${st.multi.length === pr.count ? '' : 'disabled'}>${esc(t('discardBtn', {k: st.multi.length, n: pr.count}))}</button></div></div>`;
    case 'callCard': {
      const hand = (g.hands[st.viewSeat] || []);
      const cards = [];
      for (let c = 0; c < 36; c++) if (!hand.includes(c) && !(s.config.players === 5 && c === 1)) cards.push(c);
      return `<div class="prompt"><div class="cgrid">${cards.map(c => `<button class="cpick ${st.pick === c ? 'on' : ''}" data-pick="${c}">${mini(c)}</button>`).join('')}</div>
        <div class="pbtns"><button class="btn" id="callBtn" ${st.pick === null ? 'disabled' : ''}>${esc(t('callBtn'))}</button></div></div>`;
    }
    case 'decline':
      return `<div class="prompt"><div class="pbtns"><button class="btn" id="playIt">${esc(t('playIt'))}</button><button class="btn ghost" id="passIt">${esc(t('passIt'))}</button></div></div>`;
  }
  return '';
}

function weisLabel(w) {
  const name = w.four ? t('four', {rank: rankName(w.top)}) : t('run' + Math.min(w.len, 9));
  return `${w.suit >= 0 ? suitIcon(w.suit) : ''}${esc(name)} <b>${w.pts}</b>`;
}

// ------------------------------------------------------------------ game view

function topbar(s) {
  const g = s.game, c = s.config;
  const vals = g.live || g.totals;
  let scores = '';
  for (let tm = 0; tm < nTeams(); tm++) {
    const goal = g.variant === 'bieter' && g.targets ? (g.targets[tm] ? '/' + g.targets[tm] : '') : '';
    scores += `<div class="score"><span class="dot" style="background:${teamColor(tm)}"></span><span class="tn">${esc(teamShort(tm))}</span><b>${vals[tm]}${goal}</b></div>`;
  }
  let meta = vName(c.variant);
  if (g.variant === 'differenzler' || g.variant === 'molotow' || g.variant === 'ohshit' || g.variant === 'arschloechle') meta += ` · ${g.round}/${g.rounds}`;
  else meta += ` · ${t('round')} ${g.round}`;
  if (c.variant === 'klassisch' || c.variant === 'schieber') meta += ` · ⚑${c.target}`;
  if (c.variant === 'tschausepp') meta += ` · ⚑${c.limit}`;
  let thanks = '';
  if (g.canThank) {
    const teams = [...new Set(s.mySeats.map(teamOf))];
    thanks = teams.map(tm => `<button class="thanks" data-thanks="${tm}">${teams.length > 1 ? `<span class="dot" style="background:${teamColor(tm)}"></span>` : ''}${esc(t('thanks'))}</button>`).join('');
  }
  return `<div class="topbar ${nTeams() > 4 ? 'many' : ''}"><div class="scores">${scores}</div>
    <span class="meta">${esc(meta)}</span>${thanks}
    <button class="iconbtn" id="menuBtn" aria-label="${t('menu')}">☰</button></div>`;
}

function handHTML(s) {
  const g = s.game, me = st.viewSeat;
  const mine = s.mySeats, hot = mine.length > 1;
  if (!st.handVisible) {
    const backs = Array.from({length: Math.min(g.handCounts[me] || 0, 14)}, backEl).join('');
    let cover = '';
    if (hot && s.phase === 'playing') {
      if (mine.includes(g.actor)) cover = `<div class="cover" id="reveal">${backEl()}<b>${esc(t('tapToShow', {name: seatName(g.actor)}))}</b></div>`;
      else cover = `<div class="cover"><span>${t('hidden')}</span><span class="hint">${esc(statusText(s) || '')}</span></div>`;
    }
    return {hand: backs, cover};
  }
  const mt = myTurn(s);
  const legal = new Set(g.legal || []);
  const cards = g.kind === 'asch' ? sortAsch(g.hands[me] || [], g.joker) : sortHand(g.hands[me] || [], g.mode);
  const discard = mt && (g.step === 'discard' || g.kind === 'asch');
  const html = cards.map(c => {
    let cls = '';
    if (discard) cls = st.multi.includes(c) ? 'sel' : '';
    else if (mt && g.step === 'play') cls = (st.sel === c ? 'sel ' : '') + (legal.has(c) ? 'legal' : 'nolegal');
    if (g.kind === 'tschau' && g.drawn === c) cls += ' drawn';
    if (g.kind === 'asch' && c === g.joker) cls += ' joker';
    return cardEl(c, cls);
  }).join('');
  return {hand: html, cover: ''};
}

function buildGame(s, opt = {}) {
  const g = s.game, n = s.config.players, me = st.viewSeat, mine = s.mySeats;
  const app = $('#app');
  app.dataset.view = 'game';
  if (st.sel !== null && !(myTurn(s) && g.step === 'play' && (g.legal || []).includes(st.sel))) st.sel = null;
  if (!(myTurn(s) && (g.step === 'discard' || g.kind === 'asch'))) st.multi = [];

  const opps = [];
  for (let rel = n - 1; rel >= 1; rel--) opps.push((me + rel) % n);
  const center = g.kind === 'tschau' ? tsCenter(s) : g.kind === 'asch' ? aschCenter(s) : trickCenter(s, opt);
  const {hand, cover} = handHTML(s);
  const meTurn = s.phase === 'playing' && g.actor === me;
  const spectator = mine.length === 0 ? ` <span class="badge">${t('spectator')}</span>` : '';
  const meBox = `<div class="me ${meTurn && st.handVisible ? 'turn' : ''}" data-seat="${me}">
      <div class="line"><div class="name"><span class="dot" style="background:${teamColor(teamOf(me))}"></span>${esc(seatName(me))}${badges(g, me)}${spectator}</div><div class="chips">${seatChips(g, me)}</div></div>
      <div id="hand" class="${myTurn(s) ? 'active' : ''}">${hand}</div>
      ${cover}
    </div>`;

  setHTML(app, `${topbar(s)}
    <div class="opps n${n}">${opps.map(i => seatBox(s, i)).join('')}</div>
    ${center}
    <div class="status">${esc(statusText(s))}</div>
    ${promptHTML(s)}
    ${meBox}`);
  layoutHand();
  bindGame(s);
}

/** Overlap the hand cards so that all fit; use two rows when there are very many. */
function layoutHand() {
  const h = $('#hand');
  if (!h) return;
  const cards = $$('.card', h);
  h.classList.remove('rows');
  cards.forEach(c => { c.style.marginLeft = ''; });
  if (cards.length < 2) return;
  const avail = h.clientWidth - 8;
  const w = cards[0].getBoundingClientRect().width;
  let perRow = cards.length;
  if (cards.length > 15) { perRow = Math.ceil(cards.length / 2); h.classList.add('rows'); }
  const need = perRow * w + (perRow - 1) * 6;
  const ov = need > avail ? Math.min(w * 0.8, (perRow * w - avail) / (perRow - 1)) : -6;
  cards.forEach((c, i) => { if (i % perRow !== 0) c.style.marginLeft = (-ov).toFixed(1) + 'px'; });
}
window.addEventListener('resize', () => { if (st.state && st.state.phase !== 'lobby') layoutHand(); });

function bindGame(s) {
  const g = s.game;
  $('#menuBtn').onclick = () => openPopup('menu');
  $$('[data-thanks]').forEach(b => b.onclick = () => openPopup('thanks:' + b.dataset.thanks));
  const lb = $('#lastBtn');
  if (lb) lb.onclick = () => openPopup('lastTrick');
  const rv = $('#reveal');
  if (rv) rv.onclick = () => {
    st.revealed = g.actor;
    rerender();
    $$('#hand .card').forEach((el, i) => el.animate(
      [{transform: 'rotateY(90deg)', opacity: .3}, {transform: 'none', opacity: 1}],
      {duration: 240, delay: i * 40, easing: 'ease-out', fill: 'backwards'}));
  };
  if (!myTurn(s)) return;
  const pr = g.prompt || {};
  if (g.kind === 'asch') {
    $$('#hand .card').forEach(el => el.onclick = () => onAschTap(+el.dataset.id));
    const ap = $('#aschPlay');
    if (ap) ap.onclick = () => { const cs = st.multi.slice(); st.multi = []; act('play', {cards: cs.join(',')}); };
    const as = $('#aschPass');
    if (as) as.onclick = () => { st.multi = []; act('pass'); };
    const gb = $('#giveBtn');
    if (gb) gb.onclick = () => { const cs = st.multi.slice(); st.multi = []; act('give', {cards: cs.join(',')}); };
    return;
  }
  if (g.step === 'play') $$('#hand .card').forEach(el => el.onclick = () => onCardTap(+el.dataset.id));
  if (g.step === 'discard') $$('#hand .card').forEach(el => el.onclick = () => {
    const c = +el.dataset.id;
    const i = st.multi.indexOf(c);
    if (i >= 0) st.multi.splice(i, 1); else if (st.multi.length < pr.count) st.multi.push(c);
    rerender();
  });
  $$('[data-weis]').forEach(b => b.onclick = () => { const i = +b.dataset.weis; st.weisOff[i] = !st.weisOff[i]; rerender(); });
  $$('[data-mode]').forEach(b => b.onclick = () => {
    const mis = $('#misereTg') && $('#misereTg').checked;
    act('trump', {mode: b.dataset.mode + (mis ? '-m' : '')});
  });
  const mt = $('#misereTg');
  if (mt) mt.onchange = () => { st.misere = mt.checked; };
  const pb = $('#pushBtn');
  if (pb) pb.onclick = () => act('push');
  $$('.sbtn').forEach(b => b.onclick = () => {
    const lo = pr.type === 'auction' ? pr.min : 0, hi = pr.type === 'auction' ? 5000 : 157;
    st.stepVal = Math.max(lo, Math.min(hi, st.stepVal + +b.dataset.d));
    rerender();
  });
  const ok = $('#stepOk');
  if (ok) ok.onclick = () => {
    if (pr.type === 'announce') act('announce', {value: st.stepVal});
    else act('auction', {value: st.stepVal});
  };
  const pass = $('#passBtn');
  if (pass) pass.onclick = () => act('auction', {value: 0});
  $$('[data-bid]').forEach(b => b.onclick = () => act('bid', {value: b.dataset.bid}));
  const db = $('#discardBtn');
  if (db) db.onclick = () => act('discard', {cards: st.multi.join(',')});
  $$('[data-pick]').forEach(b => b.onclick = () => { st.pick = +b.dataset.pick; rerender(); });
  const cb = $('#callBtn');
  if (cb) cb.onclick = () => { const c = st.pick; st.pick = null; act('callCard', {card: c}); };
  const pi = $('#playIt');
  if (pi) pi.onclick = () => act('decline', {pass: '0'});
  const ps = $('#passIt');
  if (ps) ps.onclick = () => act('decline', {pass: '1'});
  // Tschau Sepp
  const dr = $('#tsDraw');
  if (dr) dr.onclick = () => act('draw');
  const tp = $('#tsPass');
  if (tp) tp.onclick = () => act('pass');
  const ct = $('#callT');
  if (ct) ct.onclick = () => { st.call.tschau = !st.call.tschau; rerender(); };
  const cs = $('#callS');
  if (cs) cs.onclick = () => { st.call.sepp = !st.call.sepp; rerender(); };
  $$('[data-wish]').forEach(b => b.onclick = () => { const c = st.wishFor; st.wishFor = null; playCard(c, +b.dataset.wish); });
  const wc = $('#wishCancel');
  if (wc) wc.onclick = () => { st.wishFor = null; st.sel = null; rerender(); };
}

/** Arschloechle: a tap selects the cards of that rank (as many as needed), another tap deselects one. */
function onAschTap(c) {
  if (st.busy || st.animating) return;
  const g = st.state.game, hand = g.hands[st.viewSeat] || [];
  if (g.step === 'exchange') {
    const i = st.multi.indexOf(c);
    if (i >= 0) st.multi.splice(i, 1); else if (st.multi.length < g.prompt.count) st.multi.push(c);
    rerender();
    return;
  }
  const i = st.multi.indexOf(c);
  if (i >= 0) { st.multi.splice(i, 1); rerender(); return; }
  if (c === g.joker) { st.multi = [c]; rerender(); return; }
  const same = st.multi.length && st.multi[0] !== g.joker && crank(st.multi[0]) === crank(c);
  if (same) st.multi.push(c);
  else {
    const group = hand.filter(x => x !== g.joker && crank(x) === crank(c));
    const want = g.tableCount || group.length;
    st.multi = [c].concat(group.filter(x => x !== c)).slice(0, Math.max(1, want));
  }
  rerender();
}

function onCardTap(c) {
  if (st.busy || st.animating) return;
  const g = st.state.game;
  if (!(g.legal || []).includes(c)) { toast(t('notAllowed')); return; }
  if (st.sel === c) {
    if (g.kind === 'tschau' && crank(c) === UNDER) { st.wishFor = c; rerender(); return; }
    playCard(c);
    return;
  }
  st.sel = c;
  rerender();
}

async function playCard(c, wish) {
  const g = st.state.game;
  const p = {card: c};
  if (g.kind === 'tschau') {
    p.tschau = st.call.tschau ? '1' : '0';
    p.sepp = st.call.sepp ? '1' : '0';
    if (wish !== undefined) p.wish = wish;
  } else if (g.weisOffer) {
    p.weis = g.weisOffer.map((w, i) => i).filter(i => !st.weisOff[i]).join(',');
  }
  st.sel = null;
  const ok = await act('play', p);
  if (ok) {
    st.revealed = null;
    st.weisOff = {};
    st.call = {tschau: false, sepp: false};
  }
}

// ------------------------------------------------------------------ rendering with animation

async function renderGame(prev, s) {
  const g = s.game, pg = prev && prev.game;
  const before = snapshot();
  const mv = g.lastMove;
  const newMove = !!(pg && mv && (!pg.lastMove || pg.lastMove.seq !== mv.seq));
  const newRound = !!(pg && pg.round !== g.round);
  computeView(s);
  st.animating = true;
  try {
    if (g.kind === 'trick' && newMove && mv.trickDone && g.lastTrick) {
      buildGame(s, {trick: g.lastTrick.cards});
      if (st.popup) openPopup(st.popup);
      await flyIntoTrick(mv, before);
      events(s);
      await sleep(650);
      await sweepTrick(g.lastTrick.winner);
      buildGame(s);
    } else {
      buildGame(s);
      if (st.popup) openPopup(st.popup);
      if (newMove) {
        if (g.kind === 'trick') await flyIntoTrick(mv, before);
        else if (g.kind === 'asch') await aschMove(mv, before);
        else await tsMove(mv, before);
      }
      events(s);
      if (newRound || (!pg && g.round === 1 && !mv)) await animateDeal();
    }
  } finally {
    st.animating = false;
  }
  if (s.phase !== 'playing') showResult(s); else closeResult();
}

function snapshot() {
  const o = {};
  $$('#hand .card[data-id]').forEach(el => { o[el.dataset.id] = el.getBoundingClientRect(); });
  return {hand: o};
}

function rectOf(sel) {
  const el = $(sel);
  return el ? el.getBoundingClientRect() : null;
}

function cardSize() {
  const el = $('#trick .card') || $('#pile .card') || $('#hand .card');
  if (el) { const r = el.getBoundingClientRect(); return {w: r.width, h: r.height}; }
  return {w: 60, h: 96};
}

function rectAround(r, size) {
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  size = size || cardSize();
  return {left: cx - size.w / 2, top: cy - size.h / 2, width: size.w, height: size.h};
}

function seatRect(seat) {
  const r = rectOf(`.opp[data-seat="${seat}"] .backs`) || rectOf(`[data-seat="${seat}"] #hand`) || rectOf(`[data-seat="${seat}"]`);
  return r ? rectAround(r) : {left: innerWidth / 2 - 30, top: innerHeight / 2 - 48, width: 60, height: 96};
}

function ghost(id, r) {
  const d = document.createElement('div');
  d.className = 'card flycard';
  d.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;transform-origin:0 0;`;
  d.innerHTML = cardImg(id);
  d._rect = r;
  d._tf = 'none';
  $('#fx').appendChild(d);
  return d;
}

function flyTo(el, to, dur, delay, fade) {
  const from = el._rect;
  const dx = to.left - from.left, dy = to.top - from.top, sc = to.width / from.width;
  const end = `translate(${dx}px,${dy}px) scale(${sc})`;
  const a = el.animate(
    [{transform: el._tf, opacity: 1}, {transform: end, opacity: fade ? 0.1 : 1}],
    {duration: dur, delay: delay || 0, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'forwards'});
  el._tf = end;
  return new Promise(res => {
    let done = false;
    const fin = () => { if (!done) { done = true; res(); } };
    a.onfinish = fin;
    a.oncancel = fin;
    setTimeout(fin, dur + (delay || 0) + 150);
  });
}

async function flyIntoTrick(mv, before) {
  const el = $(`#trick .card[data-id="${mv.card}"]`);
  if (!el) return;
  const to = el.getBoundingClientRect();
  const src = before.hand[mv.card] || seatRect(mv.seat);
  const gh = ghost(mv.card, {left: src.left, top: src.top, width: to.width, height: to.height});
  el.style.visibility = 'hidden';
  await flyTo(gh, {left: to.left, top: to.top, width: to.width, height: to.height}, 360);
  el.style.visibility = '';
  gh.remove();
}

async function sweepTrick(winner) {
  const els = $$('#trick .card');
  if (!els.length) return;
  const target = seatRect(winner);
  const ghosts = els.map(el => {
    const r = el.getBoundingClientRect();
    el.style.visibility = 'hidden';
    return ghost(+el.dataset.id, r);
  });
  await Promise.all(ghosts.map((x, i) => flyTo(x, {left: target.left, top: target.top, width: target.width * 0.6, height: target.height * 0.6}, 420, i * 40, true)));
  ghosts.forEach(x => x.remove());
}

async function aschMove(mv, before) {
  const els = $$('#atable .card');
  await Promise.all((mv.cards || []).map((c, i) => {
    const el = els.find(e => +e.dataset.id === c);
    if (!el) return null;
    const to = el.getBoundingClientRect();
    const src = before.hand[c] || seatRect(mv.seat);
    const gh = ghost(c, {left: src.left, top: src.top, width: to.width, height: to.height});
    el.style.visibility = 'hidden';
    return flyTo(gh, to, 340, i * 50).then(() => { el.style.visibility = ''; gh.remove(); });
  }));
}

async function tsMove(mv, before) {
  if (mv.type === 'play') {
    const el = $('#pile .card');
    if (!el) return;
    const to = el.getBoundingClientRect();
    const src = before.hand[mv.card] || seatRect(mv.seat);
    const gh = ghost(mv.card, {left: src.left, top: src.top, width: to.width, height: to.height});
    el.style.visibility = 'hidden';
    await flyTo(gh, to, 340);
    el.style.visibility = '';
    gh.remove();
  } else if (mv.count > 0) {
    const from = rectOf('#stock .card');
    if (!from) return;
    const target = seatRect(mv.seat);
    const k = Math.min(mv.count, 6);
    const gs = Array.from({length: k}, () => ghost(-1, from));
    await Promise.all(gs.map((x, i) => flyTo(x, target, 380, i * 70)));
    gs.forEach(x => x.remove());
  }
}

async function animateDeal() {
  const els = $$('#hand .card').concat($$('.opp .backs .card'));
  const c = rectOf('.center') || {left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0};
  const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  const anims = els.map((el, i) => {
    const r = el.getBoundingClientRect();
    const dx = cx - r.left - r.width / 2, dy = cy - r.top - r.height / 2;
    const a = el.animate(
      [{transform: `translate(${dx}px,${dy}px) scale(.6)`, opacity: 0}, {transform: 'none', opacity: 1}],
      {duration: 300, delay: i * 18, easing: 'cubic-bezier(.25,.8,.35,1)', fill: 'backwards'});
    return new Promise(res => { a.onfinish = res; a.oncancel = res; });
  });
  await Promise.race([Promise.all(anims), sleep(els.length * 18 + 600)]);
}

// ------------------------------------------------------------------ events → banners and toasts

function events(s) {
  const g = s.game;
  const evs = g.events || [];
  const maxSeq = evs.length ? evs[evs.length - 1].seq : 0;
  if (st.evSeq === null) { st.evSeq = maxSeq; return; }
  const fresh = evs.filter(e => e.seq > st.evSeq);
  st.evSeq = Math.max(st.evSeq, maxSeq);
  const msgs = [];
  let big = null;
  for (const e of fresh) {
    const name = e.seat !== undefined ? seatName(e.seat) : '';
    switch (e.type) {
      case 'mode': if (e.seat !== undefined) big = modeKeyText(e.mode); else msgs.push(t('roundMode', {mode: modeKeyText(e.mode)})); break;
      case 'push': msgs.push(t('pushed', {name})); break;
      case 'weis': msgs.push(t('weisCall', {name, pts: e.pts})); break;
      case 'stoeck': big = t('stoeck'); break;
      case 'matsch': big = t('matsch'); break;
      case 'thanks': msgs.push(e.ok ? t('thanksOk', {name}) : t('thanksEarly', {name})); break;
      case 'molotowTrump': big = t('molotowTrump', {suit: suitName(e.suit)}); msgs.push(t('molotowBy', {name})); break;
      case 'tischweis': msgs.push(t('tischweis', {name, pts: e.pts})); break;
      case 'partner': msgs.push(t('partnerIs', {name})); break;
      case 'king': msgs.push(t('kingIs', {name, v: e.value})); break;
      case 'auction': if (!e.value) msgs.push(t('passed', {name})); break;
      case 'redeal': msgs.push(t('redeal')); break;
      case 'refuse': msgs.push(t('refused')); break;
      case 'hindersiLost': big = t('hindersiLost'); break;
      case 'callCard': msgs.push(t('calledBy', {name, card: cardName(e.card)})); break;
      case 'tschau': big = t('tschau'); break;
      case 'sepp': big = t('sepp'); break;
      case 'forgot': msgs.push(t(e.call === 'tschau' ? 'forgotT' : 'forgotS', {name})); break;
      case 'wish': msgs.push(t('wished', {name, suit: suitName(e.suit)})); break;
      case 'skip': msgs.push(t('skip', {name})); break;
      case 'reverse': msgs.push(t('reverse')); break;
      case 'drawPenalty': msgs.push(t('drawPen', {name, n: e.count})); break;
      case 'out':
        if (e.title) {
          const txt = t('outTitle', {name, title: t('t_' + e.title)});
          if (e.title === 'koenig' || e.title === 'arschloch') big = txt; else msgs.push(txt);
        } else big = t('outRound', {name});
        break;
      case 'pass': if (!e.auto) msgs.push(t('passedN', {name})); break;
      case 'give': msgs.push(t('gave', {name, to: seatName(e.to), n: e.count})); break;
      default: break;
    }
  }
  if (big) banner(big);
  if (msgs.length) toast(msgs.slice(-2).join(' · '));
}

function modeKeyText(key) {
  const tmp = document.createElement('div');
  tmp.innerHTML = modeKeyLabel(key);
  const img = tmp.querySelector('img');
  return (img ? img.alt + ' ' : '') + tmp.textContent.trim().replace(/^\s+/, '');
}

function banner(text) {
  const b = $('#banner');
  b.textContent = text;
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
}

let toastTimer = 0;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ------------------------------------------------------------------ result / popups

function showResult(s) {
  const g = s.game, r = g.result;
  if (!r) return;
  let m = $('#resultModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'resultModal';
    m.className = 'modal';
    document.body.appendChild(m);
  }
  const key = JSON.stringify([s.v, LANG, SKIN]);
  if (m.dataset.key === key) return;
  m.dataset.key = key;
  const nT = nTeams();
  const cols = Array.from({length: nT}, (_, i) => i);
  const head = `<tr><th></th>${cols.map(i => `<th><span class="dot" style="background:${teamColor(i)}"></span> ${esc(teamShort(i))}</th>`).join('')}</tr>`;
  const body = r.rows.map(row => `<tr class="${row.cls || ''}"><td>${esc(t(row.label))}</td>${cols.map(i => `<td>${row.values[i] === null || row.values[i] === undefined ? '–' : (typeof row.values[i] === 'string' && row.values[i].startsWith('t_') ? esc(t(row.values[i])) : row.values[i])}</td>`).join('')}</tr>`).join('');
  const over = s.phase === 'gameOver';
  const notes = [];
  if (r.mode) notes.push(modeKeyLabel(r.mode) + (r.mult > 1 ? ` ×${r.mult}` : ''));
  if (r.double) notes.push(esc(t('doubleRound')));
  if (r.lowWins) notes.push(esc(t('lowWins')));
  if (r.midGame) notes.push(esc(t('midGame')));
  if (r.declined) notes.push(esc(t('refused')));
  if (r.hindersiLost) notes.push(esc(t('hindersiLost')));
  if (r.why === 'early') notes.push(esc(t('whyEarly')));
  if (r.why === 'order') notes.push(esc(t('whyOrder')));
  if (r.roundWinner !== undefined && r.roundWinner >= 0) notes.push(esc(t('outRound', {name: seatName(r.roundWinner)})));
  let actions;
  if (over) actions = s.isHost ? `<button class="btn big" id="endBtn">${t('backToLobby')}</button>` : `<div class="hint">${t('waitingNext')}</div>`;
  else actions = s.isHost ? `<button class="btn big" id="nextBtn">${t('nextRound')}</button>` : `<div class="hint" style="text-align:center">${t('waitingNext')}</div>`;
  const winners = (g.winners || []).map(teamName).join(', ');
  m.innerHTML = `<div class="sheet">
    <h2>${over ? t('gameOver') : t('roundOver', {n: g.round})}</h2>
    ${over && winners ? `<div class="winner">🏆 ${esc(t('wins', {name: winners}))}</div>` : ''}
    ${over && r.schneider ? `<div class="hint center">${esc(t('schneider'))}</div>` : ''}
    <div class="notes">${notes.join(' · ')}</div>
    <div class="tablewrap"><table class="res">${head}${body}</table></div>
    ${actions}
  </div>`;
  const nb = $('#nextBtn', m);
  if (nb) nb.onclick = () => { nb.disabled = true; api('next'); };
  const eb = $('#endBtn', m);
  if (eb) eb.onclick = () => { eb.disabled = true; api('end'); };
}

function closeResult() {
  const m = $('#resultModal');
  if (m) m.remove();
}

function rulesHTML(v) {
  const trick = v !== 'tschausepp' && v !== 'arschloechle';
  return `<h2>${esc(vName(v))}</h2>${tr('rules_' + v)}${trick ? `<h3>${esc(t('basicsTitle'))}</h3>${tr('rules_basics')}` : ''}`;
}

function openPopup(kind) {
  st.popup = kind;
  let p = $('#popup');
  if (!p) {
    p = document.createElement('div');
    p.id = 'popup';
    p.className = 'modal';
    p.style.zIndex = 55;
    p.onclick = e => { if (e.target === p) closePopup(); };
    document.body.appendChild(p);
  }
  const s = st.state;
  let html = '';
  if (kind.startsWith('rules')) {
    const v = kind.split(':')[1] || (s && s.config.variant) || 'schieber';
    html = `<div class="rules">${rulesHTML(v)}</div>`;
  } else if (kind === 'lastTrick') {
    const g = s.game;
    const lt = g && g.lastTrick;
    html = `<h2>${t('lastTrick')}</h2>` + (lt ? `<div class="lt">${lt.cards.map(([seat, c]) =>
      `<div class="ltc ${seat === lt.winner ? 'win' : ''}"><div class="card">${cardImg(c)}</div><span>${esc(seatName(seat))}</span></div>`).join('')}</div>
      <div class="hint">${esc(t('lastTrickWin', {name: seatName(lt.winner), pts: lt.pts}))}</div>` : '');
  } else if (kind.startsWith('thanks')) {
    const tm = +kind.split(':')[1];
    html = `<h2>${t('thanks')}</h2><p>${esc(t('thanksConfirm', {target: s.config.target}))}</p>
      <button class="btn big" id="thanksYes">${t('thanksYes')}</button>`;
    setTimeout(() => {
      const y = $('#thanksYes');
      if (y) y.onclick = () => {
        closePopup();
        const seat = s.mySeats.find(x => teamOf(x) === tm);
        act('thanks', {}, seat);
      };
    });
  } else {
    html = `<h2>${t('menu')}</h2>
      <div class="row"><label>${t('language')}</label>${langSelect()}</div>
      <h3>${t('skin')}</h3>${skinPicker()}
      <button class="btn ghost menu-item" id="mRules">${t('rulesOf', {v: vName(s.config.variant)})}</button>`;
    if (s && s.game && s.game.lastTrick) html += `<button class="btn ghost menu-item" id="mLast">${t('lastTrick')}</button>`;
    const b = bt();
    if (b && b.mode === 'guest') html += `<button class="btn ghost menu-item" id="mBtLeave">${t('btLeave')}</button>`;
    if (s && s.isHost && s.phase !== 'lobby') {
      html += `<h3>${t('seats')}</h3>`;
      for (let i = 0; i < s.config.players; i++) {
        const se = s.seats[i];
        const btn = se.type === 'bot'
          ? `<button class="btn small ghost" data-seatset="${i}" data-type="local">${t('playHere')}</button>`
          : `<button class="btn small ghost" data-seatset="${i}" data-type="bot">${t('takeOver')}</button>`;
        const stx = se.type === 'remote' ? (se.online ? t('online') : t('offline')) : t(se.type);
        html += `<div class="seat"><span class="num" style="background:${teamColor(teamOf(i))}">${i + 1}</span><span style="flex:1">${esc(seatName(i))} <span class="status">· ${stx}</span></span>${btn}</div>`;
      }
      html += `<button class="btn ghost menu-item" id="mEnd" style="${st.confirmEnd ? 'background:var(--red)' : ''}">${st.confirmEnd ? t('confirmEnd') : t('endGame')}</button>`;
    }
  }
  html += `<button class="btn big" id="mClose">${t('close')}</button>`;
  p.innerHTML = `<div class="sheet">${html}</div>`;
  $('#mClose', p).onclick = closePopup;
  const lg = $('.lang', p);
  if (lg) lg.onchange = () => setLang(lg.value);
  bindSkinPicker(p);
  const mr = $('#mRules', p);
  if (mr) mr.onclick = () => openPopup('rules');
  const ml = $('#mLast', p);
  if (ml) ml.onclick = () => openPopup('lastTrick');
  const mbl = $('#mBtLeave', p);
  if (mbl) mbl.onclick = () => { closePopup(); JassApp.btLeave(); };
  $$('[data-seatset]', p).forEach(b => b.onclick = () => api('seat', {seat: b.dataset.seatset, type: b.dataset.type}));
  const me = $('#mEnd', p);
  if (me) me.onclick = () => {
    if (!st.confirmEnd) { st.confirmEnd = true; openPopup('menu'); return; }
    st.confirmEnd = false;
    closePopup();
    api('end');
  };
}

function closePopup() {
  st.popup = null;
  st.confirmEnd = false;
  const p = $('#popup');
  if (p) p.remove();
}

function setLang(l) {
  LANG = I18N[l] ? l : 'en';
  $('#rotate').textContent = t('rotate');
  store('jass_lang', LANG);
  sendBtTexts();
  document.documentElement.lang = LANG === 'en' ? 'en' : 'de';
  const m = $('#resultModal');
  if (m) m.dataset.key = '';
  rerender();
  if (st.popup) openPopup(st.popup);
}

// ------------------------------------------------------------------ boot

sendBtTexts();
applySkin(store('jass_skin'));
$('#rotate').textContent = t('rotate');
$('#app').innerHTML = `<div class="lobby"><header><h1 style="font-family:Georgia,serif;color:var(--gold)">Jass</h1></header></div>`;
poll();
