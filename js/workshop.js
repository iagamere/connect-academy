window.LP = window.LP || {};
(function () {
  const LP = window.LP, h = LP.h;
  const t = (k, v) => LP.t(k, v);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const J = (o) => JSON.stringify(o);

  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = h('a', { href: url, download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function section(n, title, ...kids) {
    return h('section', { class: 'step' }, h('h2', { class: 'step-h' }, h('span', { class: 'step-n' }, n), title), ...kids);
  }

  function checklist(key, items) {
    const saved = LP.getWk(key) || {};
    return h('ul', { class: 'todo' }, items.map((txt, i) => {
      const cb = h('input', { type: 'checkbox', id: 'wk-' + key + i });
      cb.checked = !!saved[i];
      cb.onchange = () => { const s = LP.getWk(key) || {}; s[i] = cb.checked; LP.setWk(key, s); };
      return h('li', {}, h('label', { for: 'wk-' + key + i }, cb, h('span', {}, txt)));
    }));
  }

  // ---- generator: server.js + package.json + Unity script ----
  function generator() {
    const port = h('input', { type: 'number', class: 'inp', min: 1024, max: 65535, value: 8080, 'aria-label': t('wk_port') });
    const step = h('input', { type: 'number', class: 'inp', min: 0.1, max: 10, step: 0.1, value: 1, 'aria-label': t('wk_step') });
    const out = h('div', {});
    function render() {
      const p = clamp(parseInt(port.value, 10) || 8080, 1024, 65535);
      const s = clamp(parseFloat(step.value) || 1, 0.1, 10);
      LP.wkConfig = { port: p, step: s };
      const server = LP.serverTemplate(p, s);
      out.textContent = '';
      out.append(
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn pri', onclick: () => download('server.js', server) }, LP.icon('download'), 'server.js'),
          h('button', { type: 'button', class: 'btn ghost', onclick: () => download('package.json', LP.packageJson()) }, LP.icon('download'), 'package.json')),
        LP.codeBlock({ lang: 'js', side: 'server', code: server, title: 'server.js' }),
        LP.codeBlock({ lang: 'json', side: 'data', code: LP.packageJson().trim(), title: 'package.json' }));
    }
    port.oninput = render; step.oninput = render;
    render();
    return h('div', {},
      h('div', { class: 'row' }, h('label', { class: 'lbl' }, t('wk_port')), port, h('label', { class: 'lbl' }, t('wk_step')), step),
      out);
  }

  function unityGen() {
    const url = h('input', { type: 'text', class: 'inp', dir: 'ltr', value: 'ws://localhost:' + ((LP.wkConfig && LP.wkConfig.port) || 8080), 'aria-label': t('wk_url') });
    const out = h('div', {});
    function render() {
      const code = LP.unityNetworkClient(url.value.trim() || 'ws://localhost:8080');
      out.textContent = '';
      out.append(h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn pri', onclick: () => download('NetworkClient.cs', code) }, LP.icon('download'), 'NetworkClient.cs')),
        LP.codeBlock({ lang: 'cs', side: 'client', code, title: 'NetworkClient.cs' }));
    }
    url.oninput = render; render();
    return h('div', {}, h('div', { class: 'row' }, h('label', { class: 'lbl' }, t('wk_url')), url), out);
  }

  // ---- REAL WebSocket client (connects to the learner's own server) ----
  function liveClient() {
    const COLS = 12, ROWS = 8;
    let ws = null, me = null; const others = new Map();
    const url = h('input', { type: 'text', class: 'inp', dir: 'ltr', value: 'ws://localhost:' + ((LP.wkConfig && LP.wkConfig.port) || 8080), 'aria-label': t('wk_url') });
    const room = h('input', { type: 'text', class: 'inp', dir: 'ltr', value: 'lobby', maxlength: 20, 'aria-label': t('wk_room') });
    const badge = h('span', { class: 'sbadge' });
    const log = h('ol', { class: 'log tall', 'aria-label': t('wk_log') });
    const cells = [];
    const grid = h('div', { class: 'mg big', style: '--c:' + COLS, tabindex: 0, 'aria-label': t('wk_grid') });
    for (let i = 0; i < COLS * ROWS; i++) { const c = h('span', { class: 'mc' }); cells.push(c); grid.append(c); }
    const idx = (p) => clamp(Math.round(p.y), 0, ROWS - 1) * COLS + clamp(Math.round(p.x), 0, COLS - 1);
    function draw() {
      cells.forEach((c) => { c.className = 'mc'; });
      others.forEach((o) => cells[idx(o)].classList.add('other'));
      if (me) cells[idx(me)].classList.add('on');
    }
    function status(s) { badge.textContent = s; badge.dataset.state = s === 'OPEN' ? 1 : s === 'CONNECTING' ? 0 : 3; }
    function add(kind, text) {
      log.append(h('li', { class: kind }, h('span', { class: 'dirm' }, kind === 'out' ? '→' : kind === 'in' ? '←' : '•'), h('span', { dir: 'ltr' }, text)));
      while (log.children.length > 80) log.firstChild.remove();
      log.scrollTop = log.scrollHeight;
    }
    function send(o) { if (ws && ws.readyState === 1) { const s = J(o); ws.send(s); add('out', s); } }
    function connect() {
      if (ws && ws.readyState <= 1) return;
      try { ws = new WebSocket(url.value.trim()); } catch (e) { add('err', t('wk_badurl') + ' ' + e.message); return; }
      status('CONNECTING'); add('sys', 'new WebSocket("' + url.value.trim() + '")');
      const mine = ws;
      mine.onopen = () => { status('OPEN'); add('sys', 'open'); send({ type: 'join', room: room.value.trim() || 'lobby' }); };
      mine.onerror = () => add('err', t('wk_connfail'));
      mine.onclose = (e) => { status('CLOSED'); add('sys', 'close code=' + e.code); me = null; others.clear(); draw(); };
      mine.onmessage = (e) => {
        add('in', e.data);
        let m; try { m = JSON.parse(e.data); } catch (x) { return; }
        if (m.type === 'welcome') { me = { id: m.id, x: m.x, y: m.y }; (m.players || []).forEach((p) => others.set(p.id, p)); }
        else if (m.type === 'playerMoved') others.set(m.id, { id: m.id, x: m.x, y: m.y });
        else if (m.type === 'playerLeft') others.delete(m.id);
        else if (m.type === 'correct' && me) { me.x = m.x; me.y = m.y; add('sys', t('wk_corrected')); }
        draw();
      };
    }
    function move(dx, dy) {
      if (!me || !ws || ws.readyState !== 1) return;
      const nx = clamp(me.x + dx, 0, COLS - 1), ny = clamp(me.y + dy, 0, ROWS - 1);
      if (nx === me.x && ny === me.y) return;
      me.x = nx; me.y = ny; draw(); send({ type: 'move', x: nx, y: ny });
    }
    function cheatMove() { if (me) send({ type: 'move', x: me.x + 5, y: me.y }); }
    grid.addEventListener('keydown', (e) => {
      const m = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m) { e.preventDefault(); move(m[0], m[1]); }
    });
    const db = (k, dx, dy) => h('button', { type: 'button', class: 'btn ghost sq', 'aria-label': t('us_' + k), onclick: () => move(dx, dy) }, { u: '↑', d: '↓', l: '←', r: '→' }[k]);
    LP.onCleanup(() => { if (ws) { ws.onclose = null; ws.close(); } });
    status('CLOSED'); draw();
    return h('div', { class: 'live' }, LP.banner('live'),
      h('div', { class: 'row grow' }, h('label', { class: 'lbl' }, t('wk_url')), url, h('label', { class: 'lbl' }, t('wk_room')), room),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn pri', onclick: connect }, t('ws_connect')),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { if (ws) ws.close(1000); } }, t('ws_disconnect')),
        badge),
      h('div', { class: 'live-main' },
        h('div', { class: 'live-grid' }, grid, h('div', { class: 'dpad', dir: 'ltr' }, h('span'), db('u', 0, -1), h('span'), db('l', -1, 0), db('d', 0, 1), db('r', 1, 0)),
          h('p', { class: 'muted small' }, t('wk_legend')),
          h('button', { type: 'button', class: 'btn ghost', onclick: cheatMove }, LP.icon('warn'), t('wk_cheat'))),
        h('div', {}, h('h4', {}, t('wk_log')), log)));
  }

  LP.workshop = function () {
    return h('div', { class: 'workshop' },
      section(1, t('wk_s1'), h('p', {}, t('wk_s1p')), checklist('pre', [t('wk_pre1'), t('wk_pre2'), t('wk_pre3')])),
      section(2, t('wk_s2'), h('p', {}, t('wk_s2p')), generator(),
        h('ol', { class: 'cmds' }, h('li', {}, t('wk_cmd1')), h('li', {}, t('wk_cmd2')), h('li', {}, t('wk_cmd3'))),
        LP.codeBlock({ lang: 'sh', side: 'terminal', code: 'cd my-server\nnpm install\nnode server.js', title: 'Terminal' })),
      section(3, t('wk_s3'), h('p', {}, t('wk_s3p')), liveClient(), checklist('test', [t('wk_t1'), t('wk_t2'), t('wk_t3'), t('wk_t4')])),
      section(4, t('wk_s4'), h('p', {}, t('wk_s4p')), unityGen(), checklist('unity', [t('wk_u1'), t('wk_u2'), t('wk_u3'), t('wk_u4')])),
      section(5, t('wk_s5'), h('p', {}, t('wk_s5p')), h('ul', {}, [t('wk_i1'), t('wk_i2'), t('wk_i3'), t('wk_i4')].map((x) => h('li', {}, x)))));
  };
})();
