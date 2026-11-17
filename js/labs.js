window.LP = window.LP || {};
(function () {
  const LP = window.LP, h = LP.h;
  const t = (k, v) => LP.t(k, v);
  const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const J = (o) => JSON.stringify(o);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const stamp = () => new Date().toLocaleTimeString([], { hour12: false });

  // ---------- helpers ----------
  function scope() {
    const timers = new Set();
    const s = {
      alive: true,
      sleep(ms) { return new Promise((r) => { const id = setTimeout(() => { timers.delete(id); r(); }, REDUCED ? Math.min(ms, 40) : ms); timers.add(id); }); },
      dispose() { s.alive = false; timers.forEach(clearTimeout); timers.clear(); }
    };
    LP.onCleanup(s.dispose);
    return s;
  }

  function fly(lane, from, to, label, ms) {
    ms = REDUCED ? 80 : (ms || 800);
    const horiz = lane.clientWidth >= lane.clientHeight;
    const prop = horiz ? 'left' : 'top';
    const d = h('span', { class: 'fly' + (horiz ? '' : ' v') }, label || '');
    lane.append(d);
    const a = d.animate([
      { [prop]: from + '%', opacity: 0 }, { [prop]: from + '%', opacity: 1, offset: 0.1 },
      { [prop]: to + '%', opacity: 1, offset: 0.9 }, { [prop]: to + '%', opacity: 0 }
    ], { duration: ms, easing: 'ease-in-out' });
    return new Promise((res) => { const done = () => { d.remove(); res(); }; a.onfinish = done; a.oncancel = done; });
  }

  function lanePanel(leftLabel, rightLabel, leftIcon) {
    const pipe = h('span', { class: 'pipe' });
    const lane = h('div', { class: 'lane' }, pipe);
    const el = h('div', { class: 'lp', dir: 'ltr' },
      h('div', { class: 'lp-n' }, LP.icon(leftIcon || 'user'), h('span', {}, leftLabel)),
      lane,
      h('div', { class: 'lp-n' }, LP.icon('server'), h('span', {}, rightLabel)));
    return { el, lane, pipe };
  }

  function miniGrid(cols, rows, label) {
    const cells = [];
    const el = h('div', { class: 'mg', style: '--c:' + cols, role: 'img', 'aria-label': label || '' });
    for (let i = 0; i < cols * rows; i++) { const c = h('span', { class: 'mc' }); cells.push(c); el.append(c); }
    let cur = -1;
    return {
      el,
      set(x, y, bad) {
        if (cur >= 0) cells[cur].classList.remove('on', 'bad');
        x = clamp(x, 0, cols - 1); y = clamp(y, 0, rows - 1);
        cur = y * cols + x;
        cells[cur].classList.add(bad ? 'bad' : 'on');
      }
    };
  }

  function banner(kind) {
    return h('div', { class: 'banner ' + kind, role: 'note' },
      h('strong', {}, kind === 'sim' ? t('simBadge') : kind === 'real' ? t('realBadge') : t('liveBadge')),
      h('span', {}, ' ' + t('banner_' + kind)));
  }
  LP.banner = banner;

  // ---------- JSON tree ----------
  function tree(v) {
    if (Array.isArray(v)) {
      return h('div', { class: 'jt' }, h('span', { class: 'jt-tag' }, t('t_array') + ' [' + v.length + ']'),
        v.map((x, i) => h('div', { class: 'jt-row' }, h('span', { class: 'jt-k idx' }, i), tree(x))));
    }
    if (v && typeof v === 'object') {
      const keys = Object.keys(v);
      return h('div', { class: 'jt' }, h('span', { class: 'jt-tag' }, t('t_object') + ' {' + keys.length + '}'),
        keys.map((k) => h('div', { class: 'jt-row' }, h('span', { class: 'jt-k' }, k), tree(v[k]))));
    }
    const type = v === null ? 'null' : typeof v;
    return h('span', { class: 'jt-v jt-' + type, title: t('t_' + type) }, J(v));
  }
  LP.jsonTree = tree;

  const SAMPLES = {
    profile: '{\n  "name": "Sara",\n  "level": 12,\n  "isOnline": true,\n  "score": 1850.5,\n  "guild": null,\n  "inventory": ["sword", "shield"],\n  "position": { "x": 3, "y": 7 }\n}',
    settings: '{\n  "volume": 0.8,\n  "fullscreen": false,\n  "language": "ar",\n  "controls": { "jump": "Space", "left": "A", "right": "D" },\n  "graphics": { "quality": "high", "fps": 60 }\n}',
    broken: "{\n  'name': 'Sara',\n  \"level\": 12,\n  \"tags\": [\"a\", \"b\",],\n}"
  };

  const W = {};

  W.jsonTree = function () {
    const legend = ['string', 'number', 'boolean', 'null'].map((k) => h('span', { class: 'jt-v jt-' + k }, t('t_' + k)));
    return h('div', { class: 'diagram' }, h('div', { class: 'jt-wrap', dir: 'ltr' }, tree(LP.parseJSON(SAMPLES.profile))), h('div', { class: 'legend' }, legend));
  };

  W.jsonPlay = function () {
    const ta = h('textarea', { class: 'ed', spellcheck: 'false', dir: 'ltr', rows: 11, 'aria-label': t('jp_input') });
    ta.value = SAMPLES.profile;
    const status = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    const ctxBox = h('pre', { class: 'errctx', dir: 'ltr' });
    const out = h('div', { class: 'jp-out' });
    let lastErr = null;

    function run(focusErr) {
      status.className = 'status'; ctxBox.textContent = ''; out.textContent = '';
      try {
        const v = LP.parseJSON(ta.value);
        lastErr = null;
        status.classList.add('ok');
        status.textContent = t('jp_valid');
        out.append(h('div', { class: 'jt-wrap', dir: 'ltr' }, tree(v)));
        return v;
      } catch (e) {
        if (!e || !e.code) throw e;
        lastErr = e;
        const p = LP.locate(ta.value, e.pos);
        status.classList.add('bad');
        status.textContent = t('jp_invalid') + ' — ' + t('e_' + e.code) + ' (' + t('jp_pos', { l: p.line, c: p.col }) + ')';
        const ln = ta.value.split('\n')[p.line - 1] || '';
        ctxBox.textContent = ln + '\n' + ' '.repeat(Math.max(0, p.col - 1)) + '^';
        if (focusErr) { ta.focus(); ta.setSelectionRange(e.pos, Math.min(ta.value.length, e.pos + 1)); }
        return undefined;
      }
    }
    const btn = (k, fn, cls) => h('button', { type: 'button', class: 'btn ' + (cls || 'ghost'), onclick: fn }, t(k));
    const load = (k) => btn('jp_load_' + k, () => { ta.value = SAMPLES[k]; run(false); });
    ta.addEventListener('input', () => run(false));
    const el = h('div', { class: 'jp' },
      h('div', { class: 'jp-col' },
        h('label', { class: 'lbl' }, t('jp_input')), ta,
        h('div', { class: 'row' },
          btn('jp_validate', () => run(true), 'pri'),
          btn('jp_format', () => { const v = run(true); if (v !== undefined) { ta.value = J(v) === undefined ? ta.value : JSON.stringify(v, null, 2); run(false); } }),
          btn('jp_minify', () => { const v = run(true); if (v !== undefined) { ta.value = JSON.stringify(v); run(false); } })),
        h('div', { class: 'row' }, load('profile'), load('settings'), load('broken'))),
      h('div', { class: 'jp-col' }, h('div', { class: 'lbl' }, t('jp_preview')), status, ctxBox, out));
    run(false);
    return el;
  };

  // ---------- HTTP vs WebSocket ----------
  W.httpVsWs = function () {
    const sc = scope();
    let run = 0;
    const H = lanePanel(t('hw_client'), t('hw_server'));
    const S = lanePanel(t('hw_client'), t('hw_server'));
    const hs = h('div', { class: 'lane-st', 'aria-live': 'polite' });
    const ws = h('div', { class: 'lane-st', 'aria-live': 'polite' });

    async function httpLoop(tok) {
      while (sc.alive && tok === run) {
        H.pipe.classList.remove('open'); hs.textContent = t('hw_http_new');
        await sc.sleep(500); if (tok !== run) return;
        H.pipe.classList.add('open');
        await fly(H.lane, 0, 100, 'GET /state'); if (tok !== run) return;
        await fly(H.lane, 100, 0, '200 OK'); if (tok !== run) return;
        H.pipe.classList.remove('open'); hs.textContent = t('hw_http_closed');
        await sc.sleep(900); if (tok !== run) return;
        hs.textContent = t('hw_http_stuck');
        await sc.sleep(1500);
      }
    }
    async function wsLoop(tok) {
      S.pipe.classList.remove('open'); ws.textContent = t('hw_ws_hand');
      await sc.sleep(400); if (tok !== run) return;
      await fly(S.lane, 0, 100, 'Upgrade', 600); if (tok !== run) return;
      await fly(S.lane, 100, 0, '101', 600); if (tok !== run) return;
      S.pipe.classList.add('open'); ws.textContent = t('hw_ws_open');
      while (sc.alive && tok === run) {
        await sc.sleep(500); if (tok !== run) return;
        await Promise.all([fly(S.lane, 0, 100, 'move', 900), fly(S.lane, 100, 0, 'chat', 900)]); if (tok !== run) return;
        await sc.sleep(500); if (tok !== run) return;
        ws.textContent = t('hw_ws_push');
        await fly(S.lane, 100, 0, 'update!', 800); if (tok !== run) return;
        ws.textContent = t('hw_ws_open');
        await sc.sleep(700);
      }
    }
    function start() {
      run++;
      [H.lane, S.lane].forEach((l) => l.querySelectorAll('.fly').forEach((d) => d.remove()));
      httpLoop(run); wsLoop(run);
    }
    const el = h('div', { class: 'hvw' },
      h('div', { class: 'hvw-p' }, h('h4', {}, t('hw_http')), H.el, hs),
      h('div', { class: 'hvw-p' }, h('h4', {}, t('hw_ws')), S.el, ws),
      h('button', { type: 'button', class: 'btn ghost', onclick: start }, LP.icon('reset'), t('hw_replay')));
    setTimeout(start, 0);
    return h('div', { class: 'diagram' }, el);
  };

  // ---------- WebSocket simulation ----------
  W.wsSim = function () {
    const sc = scope();
    const NAMES = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    let state = 3, seq = 0;
    const P = lanePanel(t('hw_client'), t('hw_server'));
    const badge = h('span', { class: 'sbadge' });
    const logC = h('ol', { class: 'log', 'aria-label': t('ws_clientLog') });
    const logS = h('ol', { class: 'log', 'aria-label': t('ws_serverLog') });
    const hsBox = h('pre', { class: 'code mini', dir: 'ltr', hidden: true });
    const input = h('input', { type: 'text', class: 'inp', dir: 'ltr', value: '{"type":"ping"}', 'aria-label': t('ws_msgPh') });
    const bConnect = h('button', { type: 'button', class: 'btn pri' }, t('ws_connect'));
    const bClose = h('button', { type: 'button', class: 'btn ghost' }, t('ws_disconnect'));
    const bSend = h('button', { type: 'button', class: 'btn pri' }, t('ws_send'));
    const bPush = h('button', { type: 'button', class: 'btn ghost' }, t('ws_push'));

    function setState(s) {
      state = s;
      badge.textContent = NAMES[s] + ' (' + s + ')';
      badge.dataset.state = s;
      P.pipe.classList.toggle('open', s === 1);
      bConnect.disabled = !(s === 3);
      bClose.disabled = !(s === 1);
      bSend.disabled = false;
      bPush.disabled = s !== 1;
    }
    function log(side, text, cls) {
      (side === 'c' ? logC : logS).append(h('li', { class: cls || '' }, h('time', {}, stamp()), h('span', { dir: 'ltr' }, text)));
      const l = side === 'c' ? logC : logS; l.scrollTop = l.scrollHeight;
    }
    function reply(text) {
      try {
        const o = JSON.parse(text);
        if (o && o.type === 'ping') return J({ type: 'pong' });
        if (o && o.type === 'move') return J({ type: 'ack', x: o.x, y: o.y });
        return J({ type: 'echo', received: o });
      } catch (e) { return 'echo: ' + text; }
    }
    const PUSHES = [{ type: 'news', text: 'Omar joined the room' }, { type: 'tick', n: 0 }, { type: 'event', text: 'Round starts in 3' }];

    async function connect() {
      if (state !== 3) return;
      setState(0); hsBox.hidden = false;
      hsBox.innerHTML = LP.hl('GET /game HTTP/1.1', 'http') + '\n' + LP.hl('Upgrade: websocket', 'http') + '\n' + LP.hl('Connection: Upgrade', 'http');
      log('c', 'new WebSocket("ws://localhost:8080")  readyState=0');
      await fly(P.lane, 0, 100, 'Upgrade'); if (!sc.alive) return;
      log('s', 'handshake request received'); await sc.sleep(250);
      hsBox.innerHTML += '\n\n' + LP.hl('HTTP/1.1 101 Switching Protocols', 'http');
      await fly(P.lane, 100, 0, '101'); if (!sc.alive) return;
      setState(1); log('c', 'event: open  readyState=1', 'ok'); log('s', 'connection established', 'ok');
    }
    async function send() {
      const text = input.value;
      if (state !== 1) { log('c', t('ws_notOpen', { s: NAMES[state] }), 'err'); return; }
      log('c', 'send(' + text + ')');
      await fly(P.lane, 0, 100, 'msg'); if (!sc.alive || state !== 1) return;
      log('s', 'message: ' + text);
      const r = reply(text);
      await sc.sleep(250);
      log('s', 'send(' + r + ')');
      await fly(P.lane, 100, 0, 'reply'); if (!sc.alive || state !== 1) return;
      log('c', 'event: message  data=' + r, 'ok');
    }
    async function push() {
      if (state !== 1) return;
      const m = Object.assign({}, PUSHES[seq++ % PUSHES.length]); if (m.type === 'tick') m.n = seq;
      log('s', 'push: ' + J(m));
      await fly(P.lane, 100, 0, 'push'); if (!sc.alive || state !== 1) return;
      log('c', 'event: message  data=' + J(m) + '  (' + t('ws_noRequest') + ')', 'ok');
    }
    async function close() {
      if (state !== 1) return;
      setState(2); log('c', 'close()  readyState=2');
      await fly(P.lane, 0, 100, 'close'); if (!sc.alive) return;
      log('s', 'close frame received'); await sc.sleep(250);
      setState(3); log('c', 'event: close  code=1000', 'ok'); log('s', 'connection closed');
    }
    bConnect.onclick = connect; bClose.onclick = close; bSend.onclick = send; bPush.onclick = push;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    setState(3);
    return h('div', { class: 'wsim' },
      h('div', { class: 'row' }, h('span', { class: 'lbl' }, t('ws_state')), badge),
      P.el, hsBox,
      h('div', { class: 'row' }, bConnect, bClose, bPush),
      h('div', { class: 'row grow' }, input, bSend),
      h('div', { class: 'cols2' }, h('div', {}, h('h4', {}, t('ws_clientLog')), logC), h('div', {}, h('h4', {}, t('ws_serverLog')), logS)));
  };

  // ---------- Node architecture / simulation ----------
  W.nodeArch = function () {
    const box = (icon, title, sub, extra) => h('div', { class: 'an', 'data-static': '' }, LP.icon(icon), h('strong', {}, title), h('small', {}, sub), extra);
    return h('div', { class: 'diagram' }, h('div', { class: 'na', dir: 'ltr' },
      box('user', t('na_client'), t('na_client_s')),
      h('div', { class: 'na-ar' }, h('span', {}, '1  ' + t('na_req')), h('span', { class: 'ln' }), h('span', {}, '3  ' + t('na_res'))),
      h('div', { class: 'an srv' }, LP.icon('node'), h('strong', {}, 'Node.js'), h('small', {}, t('na_srv_s')),
        h('ol', { class: 'na-steps' }, h('li', {}, t('na_step1')), h('li', {}, t('na_step2')), h('li', {}, t('na_step3'))),
        h('div', { class: 'chips' }, h('span', { class: 'chip' }, 'http'), h('span', { class: 'chip' }, 'ws (npm)'), h('span', { class: 'chip' }, 'your code')))));
  };

  W.nodeSim = function () {
    const sc = scope();
    const players = [{ id: 1, name: 'Sara' }, { id: 2, name: 'Omar' }];
    const sel = h('select', { class: 'inp', 'aria-label': t('ns_route') }, ['GET /health', 'GET /players', 'POST /join'].map((r) => h('option', { value: r }, r)));
    const body = h('textarea', { class: 'ed', dir: 'ltr', rows: 3, spellcheck: 'false', 'aria-label': t('ns_body') });
    body.value = '{"name":"Sara"}';
    const lane = lanePanel(t('hw_client'), 'Node.js (sim)');
    const steps = h('ol', { class: 'ns-steps' });
    const resp = h('pre', { class: 'code mini', dir: 'ltr' });
    const bodyRow = h('div', {}, h('label', { class: 'lbl' }, t('ns_body')), body);
    const sync = () => { bodyRow.hidden = sel.value !== 'POST /join'; };
    sel.onchange = sync; sync();
    let busy = false;

    function handle(method, path, raw) {
      const log = [t('ns_s_recv', { m: method, p: path })];
      let status = 404, out = { error: 'not_found' };
      log.push(t('ns_s_route'));
      if (method === 'GET' && path === '/health') { status = 200; out = { status: 'ok' }; }
      else if (method === 'GET' && path === '/players') { status = 200; out = players; }
      else if (method === 'POST' && path === '/join') {
        let data;
        try { data = JSON.parse(raw); log.push(t('ns_s_parse_ok')); }
        catch (e) { log.push(t('ns_s_parse_bad')); return { log, status: 400, out: { error: 'bad_json' } }; }
        const name = data && data.name;
        if (typeof name !== 'string' || !name.trim() || name.length > 20) { log.push(t('ns_s_val_bad')); return { log, status: 400, out: { error: 'invalid_name' } }; }
        log.push(t('ns_s_val_ok'));
        const p = { id: players.length + 1, name: name.trim() }; players.push(p);
        status = 201; out = { id: p.id, room: 'lobby' };
      }
      log.push(t('ns_s_resp', { s: status }));
      return { log, status, out };
    }
    async function send() {
      if (busy) return; busy = true;
      steps.textContent = ''; resp.textContent = '';
      const [m, p] = sel.value.split(' ');
      await fly(lane.lane, 0, 100, m + ' ' + p); if (!sc.alive) return;
      const r = handle(m, p, body.value);
      for (const line of r.log) { steps.append(h('li', {}, line)); await sc.sleep(300); if (!sc.alive) return; }
      await fly(lane.lane, 100, 0, String(r.status)); if (!sc.alive) return;
      resp.textContent = 'HTTP ' + r.status + '\n' + JSON.stringify(r.out, null, 2);
      resp.className = 'code mini ' + (r.status < 300 ? 'okc' : 'errc');
      busy = false;
    }
    return h('div', { class: 'nsim' },
      h('div', { class: 'row' }, h('label', { class: 'lbl' }, t('ns_route')), sel),
      bodyRow, lane.el,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn pri', onclick: send }, t('ns_send'))),
      h('div', { class: 'cols2' }, h('div', {}, h('h4', {}, t('ns_log')), steps), h('div', {}, h('h4', {}, t('ns_resp')), resp)));
  };

  // ---------- Unity ----------
  W.unityLayers = function () {
    const L = [['unity', t('ul_1'), t('ul_1s')], ['arch', t('ul_2'), t('ul_2s')], ['json', t('ul_3'), t('ul_3s')], ['ws', t('ul_4'), t('ul_4s')], ['server', t('ul_5'), t('ul_5s')]];
    const out = [];
    L.forEach((x, i) => {
      out.push(h('div', { class: 'ul' }, LP.icon(x[0]), h('div', {}, h('strong', {}, x[1]), h('small', {}, x[2]))));
      if (i < L.length - 1) out.push(h('div', { class: 'ul-ar', 'aria-hidden': 'true' }, LP.icon('arrow')));
    });
    return h('div', { class: 'diagram' }, h('div', { class: 'ulw' }, out));
  };

  W.unitySim = function () {
    const sc = scope();
    const N = 7;
    const g1 = miniGrid(N, N, t('us_p1')), g2 = miniGrid(N, N, t('us_p2'));
    let x = 3, y = 3, sent = 0;
    g1.set(x, y); g2.set(x, y);
    const lane = h('div', { class: 'lane' }, h('span', { class: 'pipe open' }));
    const lat = h('input', { type: 'range', min: 0, max: 1500, step: 100, value: 500, 'aria-label': t('us_lat') });
    const latV = h('output', {}, '500 ms');
    lat.oninput = () => { latV.textContent = lat.value + ' ms'; };
    const sentBox = h('pre', { class: 'code mini', dir: 'ltr' }, '—');
    const recvBox = h('pre', { class: 'code mini', dir: 'ltr' }, '—');
    const counter = h('span', { class: 'lbl' });
    const upd = () => { counter.textContent = t('us_sent', { n: sent }); };
    upd();

    async function move(dx, dy) {
      const nx = clamp(x + dx, 0, N - 1), ny = clamp(y + dy, 0, N - 1);
      if (nx === x && ny === y) return;
      x = nx; y = ny; g1.set(x, y);
      const msg = J({ type: 'move', x, y });
      sentBox.innerHTML = LP.hl(msg, 'json'); sent++; upd();
      const ms = Math.max(200, +lat.value);
      await Promise.all([fly(lane, 0, 100, 'JSON', ms), sc.sleep(+lat.value)]);
      if (!sc.alive) return;
      recvBox.innerHTML = LP.hl(J({ type: 'playerMoved', id: 'p1', x: nx, y: ny }), 'json');
      g2.set(nx, ny);
    }
    const dirBtn = (k, dx, dy) => h('button', { type: 'button', class: 'btn ghost sq', 'aria-label': t('us_' + k), onclick: () => move(dx, dy) }, { u: '↑', d: '↓', l: '←', r: '→' }[k]);
    const pad = h('div', { class: 'dpad', dir: 'ltr' }, h('span'), dirBtn('u', 0, -1), h('span'), dirBtn('l', -1, 0), dirBtn('d', 0, 1), dirBtn('r', 1, 0));
    const p1 = h('div', { class: 'us-p', tabindex: 0, 'aria-label': t('us_p1') + ' — ' + t('us_keys') }, h('h4', {}, t('us_p1')), g1.el, pad);
    p1.addEventListener('keydown', (e) => {
      const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m) { e.preventDefault(); move(m[0], m[1]); }
    });
    return h('div', { class: 'usim' },
      h('div', { class: 'us', dir: 'ltr' }, p1, lane, h('div', { class: 'us-p' }, h('h4', {}, t('us_p2')), g2.el)),
      h('div', { class: 'row' }, h('label', { class: 'lbl' }, t('us_lat')), lat, latV, counter),
      h('div', { class: 'cols2' }, h('div', {}, h('h4', {}, t('us_json_sent')), sentBox), h('div', {}, h('h4', {}, t('us_json_recv')), recvBox)));
  };

  // ---------- Architecture diagram ----------
  function archDiagram() {
    const node = (c, title, sub, role) => h('div', { class: 'an', 'data-c': c, 'data-role': role, tabindex: 0, role: 'button', 'aria-label': title }, LP.icon(c === 'node' ? 'node' : 'unity'), h('strong', {}, title), h('small', {}, sub));
    const link = () => {
      const pipe = h('span', { class: 'pipe open' });
      const lane = h('div', { class: 'lane' }, pipe);
      return { lane, el: h('div', { class: 'al', 'data-link': '' }, lane, h('div', { class: 'chips' }, h('span', { class: 'chip', 'data-c': 'ws' }, 'WebSocket'), h('span', { class: 'chip', 'data-c': 'json' }, 'JSON'))) };
    };
    const l1 = link(), l2 = link();
    const n1 = node('unity', 'Unity', t('hw_p1'), 'p1'), ns = node('node', 'Node.js', t('hw_server'), 'srv'), n2 = node('unity', 'Unity', t('hw_p2'), 'p2');
    const el = h('div', { class: 'arch', dir: 'ltr' }, n1, l1.el, ns, l2.el, n2);
    return { el, lanes: [l1.lane, l2.lane], p1: n1, srv: ns, p2: n2 };
  }

  W.archExplorer = function () {
    const A = archDiagram();
    const COMPS = ['unity', 'node', 'ws', 'json'];
    const panel = h('div', { class: 'ap', 'aria-live': 'polite' });
    const chips = h('div', { class: 'row chips-row', role: 'group', 'aria-label': t('ar_pick') });
    let sel = null;
    function show(c) {
      sel = sel === c ? null : c;
      if (sel) A.el.dataset.sel = sel; else delete A.el.dataset.sel;
      chips.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.c === sel)));
      panel.textContent = '';
      if (!sel) { panel.append(h('p', { class: 'muted' }, t('ar_hint'))); return; }
      panel.append(h('h4', {}, t('c_' + sel + '_n'), ' ', h('span', { class: 'kind' }, t('c_' + sel + '_k'))), h('p', {}, t('c_' + sel + '_r')),
        h('h5', {}, t('ar_talks')),
        h('ul', {}, COMPS.filter((o) => o !== sel).map((o) => h('li', {}, h('button', { type: 'button', class: 'lnk', onclick: () => show(o) }, t('c_' + o + '_n')), ': ', t('x_' + sel + '_' + o)))));
    }
    COMPS.forEach((c) => chips.append(h('button', { type: 'button', class: 'btn ghost', 'data-c': c, 'aria-pressed': 'false', onclick: () => show(c) }, t('c_' + c + '_n'))));
    A.el.addEventListener('click', (e) => { const x = e.target.closest('[data-c]'); if (x && A.el.contains(x)) show(x.dataset.c); });
    A.el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const x = e.target.closest('.an[data-c]'); if (x) { e.preventDefault(); show(x.dataset.c); } } });
    // gentle idle animation so the data flow is visible
    const sc = scope();
    (async function idle() {
      while (sc.alive) {
        await sc.sleep(900);
        await fly(A.lanes[0], 0, 100, 'JSON', 1100); await fly(A.lanes[1], 0, 100, 'JSON', 1100);
        await sc.sleep(1800);
      }
    })();
    show(null);
    return h('div', { class: 'diagram' }, chips, A.el, panel);
  };

  // ---------- Complete flow simulation ----------
  W.flowSim = function () {
    const sc = scope();
    const A = archDiagram();
    const COLS = 8, ROWS = 3;
    const g1 = miniGrid(COLS, ROWS, t('fl_p1map')), g2 = miniGrid(COLS, ROWS, t('fl_p2map'));
    A.p1.append(g1.el); A.p2.append(g2.el);
    let p1 = { x: 1, y: 1 }, srv = { x: 1, y: 1 };
    g1.set(1, 1); g2.set(1, 1);
    const cheat = h('input', { type: 'checkbox', id: 'fl-cheat' });
    const list = h('ol', { class: 'fl-list' }, [1, 2, 3, 4, 5, 6, 7, 8].map((i) => h('li', { 'data-i': i }, h('b', {}, t('f' + i + '_t')), ' ', h('span', {}, t('f' + i + '_d')))));
    const payload = h('pre', { class: 'code mini', dir: 'ltr' }, '—');
    const note = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    let cur = 0, busy = false, ctx = null;
    const bNext = h('button', { type: 'button', class: 'btn pri' }, LP.icon('arrow', 'dir-ico'), t('fl_next'));
    const bAll = h('button', { type: 'button', class: 'btn ghost' }, LP.icon('play'), t('fl_all'));
    const bReset = h('button', { type: 'button', class: 'btn ghost' }, LP.icon('reset'), t('fl_reset'));
    const li = (i) => list.querySelector('[data-i="' + i + '"]');
    const show = (o) => { payload.innerHTML = LP.hl(J(o), 'json'); };
    function setNote(txt, cls) { note.className = 'status ' + (cls || ''); note.textContent = txt; }

    function clearMarks() { list.querySelectorAll('li').forEach((x) => x.className = ''); }
    function reset() { clearMarks(); cur = 0; ctx = null; p1 = { x: 1, y: 1 }; srv = { x: 1, y: 1 }; g1.set(1, 1); g2.set(1, 1); payload.textContent = '—'; setNote(''); }

    async function doStep(i) {
      const L = A.lanes;
      if (i === 1) {
        const d = cheat.checked ? 5 : 1;
        let nx = p1.x + d; if (nx >= COLS) nx = p1.x - d;
        ctx = { x: nx, y: p1.y, cheat: cheat.checked };
        p1 = { x: nx, y: p1.y }; g1.set(nx, p1.y, ctx.cheat);
        setNote(t(ctx.cheat ? 'fl_local_cheat' : 'fl_local'));
      } else if (i === 2) { show({ type: 'move', x: ctx.x, y: ctx.y }); }
      else if (i === 3) { await fly(L[0], 0, 100, 'JSON', 900); }
      else if (i === 4) {
        ctx.ok = Math.hypot(ctx.x - srv.x, ctx.y - srv.y) <= 1;
        setNote(t(ctx.ok ? 'fl_valid' : 'fl_invalid', { d: Math.hypot(ctx.x - srv.x, ctx.y - srv.y).toFixed(0) }), ctx.ok ? 'ok' : 'bad');
      } else if (i === 5) {
        if (ctx.ok) { srv = { x: ctx.x, y: ctx.y }; setNote(t('fl_state_ok'), 'ok'); }
        else {
          show({ type: 'correct', x: srv.x, y: srv.y });
          await fly(L[0], 100, 0, 'correct', 900);
          p1 = { x: srv.x, y: srv.y }; g1.set(srv.x, srv.y);
          setNote(t('fl_rejected'), 'bad');
          [6, 7, 8].forEach((k) => li(k).classList.add('skip'));
        }
      } else if (i === 6) { show({ type: 'playerMoved', id: 'a1b2c3', x: ctx.x, y: ctx.y }); await fly(L[1], 0, 100, 'JSON', 900); }
      else if (i === 7) { setNote(t('fl_parse')); }
      else if (i === 8) { g2.set(ctx.x, ctx.y); setNote(t('fl_done'), 'ok'); }
    }
    async function next() {
      if (busy) return;
      if (cur >= 8 || (cur === 5 && ctx && !ctx.ok)) { clearMarks(); cur = 0; }
      busy = true; [bNext, bAll].forEach((b) => b.disabled = true);
      const i = cur + 1;
      list.querySelectorAll('li').forEach((x) => x.classList.remove('active'));
      li(i).classList.add('active');
      await doStep(i);
      if (!sc.alive) return;
      li(i).classList.remove('active'); li(i).classList.add('done');
      cur = (i === 5 && !ctx.ok) ? 8 : i;
      busy = false; [bNext, bAll].forEach((b) => b.disabled = false);
    }
    async function all() {
      if (busy) return;
      if (cur >= 8) { clearMarks(); cur = 0; }
      do { await next(); if (!sc.alive) return; await sc.sleep(500); } while (cur < 8);
    }
    bNext.onclick = next; bAll.onclick = all; bReset.onclick = () => { if (!busy) reset(); };
    return h('div', { class: 'flow' }, A.el,
      h('div', { class: 'row' }, bNext, bAll, bReset, h('label', { class: 'chk', for: 'fl-cheat' }, cheat, t('fl_cheat'))),
      note,
      h('div', { class: 'cols2' }, h('div', {}, h('h4', {}, t('fl_steps')), list), h('div', {}, h('h4', {}, t('fl_payload')), payload)));
  };

  LP.widgets = W;
  LP.scope = scope; LP.fly = fly; LP.miniGrid = miniGrid; LP.lanePanel = lanePanel;
})();
