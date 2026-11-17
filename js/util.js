window.LP = window.LP || {};
(function () {
  const LP = window.LP;

  LP.h = function h(tag, a, ...kids) {
    const e = document.createElement(tag);
    if (a) for (const k in a) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'dataset') Object.assign(e.dataset, v);
      else if (k.slice(0, 2) === 'on' && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat(Infinity)) {
      if (c == null || c === false) continue;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return e;
  };

  LP.cleanups = [];
  LP.onCleanup = (f) => LP.cleanups.push(f);
  LP.runCleanups = () => { LP.cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); };

  const ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    json: '<path d="M8 4c-2 0-3 1-3 3v2c0 1-1 3-2 3 1 0 2 2 2 3v2c0 2 1 3 3 3"/><path d="M16 4c2 0 3 1 3 3v2c0 1 1 3 2 3-1 0-2 2-2 3v2c0 2-1 3-3 3"/>',
    ws: '<path d="M4 8h16M16 4l4 4-4 4"/><path d="M20 16H4M8 12l-4 4 4 4"/>',
    node: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><circle cx="12" cy="12" r="2.5"/>',
    unity: '<path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/>',
    arch: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7 7l4 9M17 7l-4 9M7.5 6h9"/>',
    tools: '<path d="M14 6l4 4-9 9H5v-4z"/><path d="M13 7l4 4M16 3l5 5"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    moon: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    reset: '<path d="M4 12a8 8 0 108-8M4 4v5h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>'
  };
  LP.icon = (n, cls) => {
    const s = document.createElement('span');
    s.className = 'ic' + (cls ? ' ' + cls : '');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>';
    return s;
  };

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  LP.esc = esc;

  const KW_JS = 'const|let|var|function|return|if|else|try|catch|new|for|of|await|async|true|false|null|undefined|this|typeof';
  const KW_CS = 'using|namespace|public|private|protected|class|void|int|float|string|bool|var|new|if|else|return|this|async|await|static|yield|true|false|null|override|foreach|in|using';
  const RULES = {
    js: { c: '\\/\\/.*$', s: "'(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\"", n: '\\b\\d+(?:\\.\\d+)?\\b', k: '\\b(?:' + KW_JS + ')\\b', f: '\\b[A-Za-z_$][\\w$]*(?=\\()' },
    cs: { c: '\\/\\/.*$|^\\s*#.*$', s: '"(?:\\\\.|[^"\\\\])*"', n: '\\b\\d+(?:\\.\\d+)?f?\\b', k: '\\b(?:' + KW_CS + ')\\b', f: '\\b[A-Za-z_]\\w*(?=[(<])', t: '\\b[A-Z][A-Za-z0-9_]*\\b' },
    json: { c: '\\/\\/.*$', s: '"(?:\\\\.|[^"\\\\])*"', n: '-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b', k: '\\b(?:true|false|null)\\b' },
    sh: { c: '#.*$', k: '^(?:mkdir|cd|npm|node)\\b' },
    http: { k: '^(?:GET|POST|HTTP\\/1\\.1)\\b', f: '^[A-Za-z-]+(?=:)' }
  };
  const ORDER = ['c', 's', 'n', 'k', 'f', 't'];
  const CLS = { c: 'tc', s: 'ts', n: 'tn', k: 'tk', f: 'tf', t: 'tt' };
  const cache = {};
  LP.hl = function (line, lang) {
    const r = RULES[lang];
    if (!r) return esc(line);
    if (!cache[lang]) {
      const keys = ORDER.filter((k) => r[k]);
      cache[lang] = { keys, re: new RegExp(keys.map((k) => '(' + r[k] + ')').join('|'), 'g') };
    }
    const { keys, re } = cache[lang];
    re.lastIndex = 0;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out += esc(line.slice(last, m.index));
      let idx = 0;
      for (let i = 1; i < m.length; i++) if (m[i] !== undefined) { idx = i - 1; break; }
      let cls = CLS[keys[idx]];
      if (lang === 'json' && cls === 'ts' && /^\s*:/.test(line.slice(re.lastIndex))) cls = 'tp';
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  };
})();
