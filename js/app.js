(function () {
  const LP = window.LP, h = LP.h;
  const UI = LP.UI, CT = LP.CONTENT, CODE = LP.CODE, W = LP.widgets;
  const LESSONS = ['json', 'websocket', 'nodejs', 'unity', 'architecture', 'workshop'];
  const META = {
    json: { mins: 20, icon: 'json', diagram: 'jsonTree', lab: 'jsonPlay' },
    websocket: { mins: 20, icon: 'ws', diagram: 'httpVsWs', lab: 'wsSim' },
    nodejs: { mins: 25, icon: 'node', diagram: 'nodeArch', lab: 'nodeSim' },
    unity: { mins: 25, icon: 'unity', diagram: 'unityLayers', lab: 'unitySim' },
    architecture: { mins: 30, icon: 'arch', diagram: 'archExplorer', lab: 'flowSim' },
    workshop: { mins: 40, icon: 'tools' }
  };
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- state ----------
  const KEY = 'connect-academy.v1';
  let S = { lang: 'ar', theme: 'auto', done: {}, quiz: {}, ex: {}, wk: {}, last: null };
  try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { /* ignore */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  if (!UI[S.lang]) S.lang = 'ar';

  function t(k, v) {
    let s = (UI[S.lang] && UI[S.lang][k]);
    if (s === undefined) s = UI.en[k];
    if (s === undefined) s = UI.ar[k];
    if (s === undefined) return k;
    return v ? s.replace(/\{(\w+)\}/g, (m, x) => (v[x] !== undefined ? v[x] : m)) : s;
  }
  LP.t = t;
  LP.lang = () => S.lang;
  LP.markEx = (id) => { if (!S.ex[id]) { S.ex[id] = true; save(); updateNav(); } };
  LP.isEx = (id) => !!S.ex[id];
  LP.getWk = (k) => S.wk[k];
  LP.setWk = (k, v) => { S.wk[k] = v; save(); };

  const C = (id) => (CT[S.lang] && CT[S.lang][id]) || CT.en[id];
  const title = (id) => (id === 'workshop' ? t('wk_title') : C(id).title);
  const short = (id) => (id === 'workshop' ? t('wk_short') : C(id).short);
  const paras = (s) => String(s).split('\n').map((p) => h('p', {}, p));
  const $ = (s) => document.querySelector(s);

  // ---------- code block ----------
  LP.codeBlock = function (d) {
    const lines = d.code.split('\n');
    const sideKey = { client: 'clientSide', server: 'serverSide', data: 'dataFormat', terminal: 'terminalSide', both: 'bothSides' }[d.side] || 'dataFormat';
    const copy = h('button', { type: 'button', class: 'copy', 'aria-label': t('copy') }, LP.icon('copy'), h('span', {}, t('copy')));
    copy.onclick = async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(d.code); ok = true; } catch (e) {
        const ta = h('textarea', { style: 'position:fixed;opacity:0' }); ta.value = d.code; document.body.append(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (x) { ok = false; } ta.remove();
      }
      copy.querySelector('span:last-child').textContent = ok ? t('copied') : t('copyFail');
      setTimeout(() => { copy.querySelector('span:last-child').textContent = t('copy'); }, 1600);
    };
    const code = h('code', {}, lines.map((ln) => h('span', { class: 'cl', html: LP.hl(ln, d.lang) || '&#8203;' })));
    const el = h('figure', { class: 'codeblock side-' + d.side },
      h('figcaption', {}, h('span', { class: 'cb-tag' }, t(sideKey)), d.title ? h('span', { class: 'ct' }, d.title) : null, h('span', { class: 'lang', dir: 'ltr' }, d.lang), copy),
      h('pre', { class: 'code', dir: 'ltr', tabindex: 0 }, code));
    el.highlight = (a, b) => {
      el.querySelectorAll('.cl').forEach((c, i) => c.classList.toggle('hl', i + 1 >= a && i + 1 <= b));
    };
    el.lines = lines;
    return el;
  };

  function resolve(lines, e) {
    let i = lines.findIndex((l) => l.indexOf(e.f) >= 0);
    if (i < 0) i = 0;
    return [i + 1, i + (e.n || 1)];
  }

  // ---------- quiz ----------
  function quizView(id, qs) {
    const holder = h('div', { class: 'quiz' });
    function build() {
      let score = 0, answered = 0;
      const prev = S.quiz[id];
      const sum = h('div', { class: 'status', role: 'status', 'aria-live': 'polite' }, prev ? t('lastScore', { s: prev.score, t: prev.total }) : '');
      const items = qs.map((q, qi) => {
        const fb = h('div', { class: 'fb', role: 'status', 'aria-live': 'polite' });
        const btns = q.opts.map((o, oi) => {
          const b = h('button', { type: 'button', class: 'opt' }, h('span', { class: 'opt-k' }, String.fromCharCode(65 + oi)), h('span', {}, o));
          b.onclick = () => {
            btns.forEach((x, k) => { x.disabled = true; if (k === q.a) x.classList.add('ok'); });
            const good = oi === q.a;
            if (!good) b.classList.add('bad'); else score++;
            fb.className = 'fb ' + (good ? 'ok' : 'bad');
            fb.textContent = '';
            fb.append(h('strong', {}, good ? t('correct') : t('wrong')), ' ', q.ex[oi]);
            if (!good) fb.append(h('div', {}, h('strong', {}, t('rightAns')), ' ', q.opts[q.a], ' — ', q.ex[q.a]));
            answered++;
            if (answered === qs.length) {
              S.quiz[id] = { score, total: qs.length }; save(); updateNav();
              sum.className = 'status ' + (score === qs.length ? 'ok' : 'bad');
              sum.textContent = t('score', { s: score, t: qs.length });
              sum.append(' ', h('button', { type: 'button', class: 'btn ghost', onclick: () => { const n = build(); holder.textContent = ''; holder.append(...n.childNodes); } }, LP.icon('reset'), t('retry')));
            }
          };
          return b;
        });
        return h('div', { class: 'q' }, h('p', { class: 'q-t' }, h('span', { class: 'q-n' }, t('qOf', { n: qi + 1, t: qs.length })), q.q), h('div', { class: 'opts' }, btns), fb);
      });
      return h('div', {}, items, sum);
    }
    holder.append(build());
    return holder;
  }

  // ---------- views ----------
  function step(lid, n, body) {
    return h('section', { class: 'step', id: lid + '-s' + n }, h('h2', { class: 'step-h' }, h('span', { class: 'step-n' }, n), t('s' + n)), body);
  }
  const dirArrow = () => LP.icon('arrow', 'dir-ico');

  function crumbs(id) {
    return h('nav', { class: 'crumbs', 'aria-label': t('breadcrumb') }, h('ol', {},
      h('li', {}, h('a', { href: '#/home' }, t('home'))), h('li', { 'aria-current': 'page' }, title(id))));
  }

  function pager(id) {
    const i = LESSONS.indexOf(id);
    const prev = i > 0 ? LESSONS[i - 1] : null, next = i < LESSONS.length - 1 ? LESSONS[i + 1] : null;
    return h('nav', { class: 'pager', 'aria-label': t('lessons') },
      h('a', { class: 'pg prev', href: '#/' + (prev || 'home') }, h('small', {}, t('prev')), h('span', {}, prev ? title(prev) : t('home'))),
      h('a', { class: 'pg next', href: '#/' + (next || 'home') }, h('small', {}, next ? t('next') : t('finish')), h('span', {}, next ? title(next) : t('home'))));
  }

  function doneButton(id) {
    const b = h('button', { type: 'button', class: 'btn pri lg' });
    const paint = () => { b.textContent = ''; b.append(LP.icon('check'), S.done[id] ? t('markUndone') : t('markDone')); b.classList.toggle('is-done', !!S.done[id]); };
    b.onclick = () => { S.done[id] = !S.done[id]; save(); paint(); updateNav(); };
    paint();
    return b;
  }

  function lessonHeader(id) {
    const m = META[id];
    const exs = (LP.EX && LP.EX[id]) || [];
    const solved = exs.filter((e) => S.ex[e.id]).length;
    return h('header', { class: 'lesson-h card' },
      h('span', { class: 'big-ic' }, LP.icon(m.icon)),
      h('div', {},
        h('h1', {}, title(id)), h('p', { class: 'muted' }, short(id)),
        h('div', { class: 'meta' },
          h('span', { class: 'pill' }, LP.icon('clock'), t('minutes', { n: m.mins })),
          h('span', { class: 'pill ' + (S.done[id] ? 'ok' : '') }, S.done[id] ? t('done') : t('notStarted')),
          exs.length ? h('span', { class: 'pill' }, t('exProgress', { s: solved, t: exs.length })) : null)));
  }

  function lessonView(id) {
    const c = C(id), m = META[id];
    S.last = id; save();
    const blocks = {};
    const root = h('article', { class: 'lesson' }, crumbs(id), lessonHeader(id));
    if (S.lang === 'fr' && !CT.fr) root.append(h('div', { class: 'banner info', role: 'note' }, t('fallbackNote')));

    root.append(step(id, 1, h('p', { class: 'lead' }, c.intro)));
    root.append(step(id, 2, h('div', { class: 'analogy' }, h('h3', {}, c.analogy.t), h('p', {}, c.analogy.p))));

    const tech = h('div', {}, ['what', 'why', 'how', 'when', 'rel'].map((k) => h('div', { class: 'qa' }, h('h3', {}, t('q_' + k)), paras(c.tech[k]))));
    tech.append(h('h3', { class: 'more-h' }, t('moreDetails')));
    c.extras.forEach((e, i) => {
      const d = h('details', { class: 'xp', id: id + '-e' + i }, h('summary', {}, e.h));
      if (e.p) d.append(...paras(e.p));
      if (e.list) d.append(h('ul', {}, e.list.map((x) => h('li', {}, x))));
      tech.append(d);
    });
    root.append(step(id, 3, tech));

    root.append(step(id, 4, h('div', {}, W[m.diagram](), h('p', { class: 'muted note' }, c.diagramNote))));

    const codeWrap = h('div', {});
    c.codes.forEach((cd) => {
      const def = CODE[cd.id];
      const el = LP.codeBlock({ lang: def.lang, side: def.side, code: def.code, title: cd.title });
      blocks[cd.id] = el; codeWrap.append(el);
    });
    root.append(step(id, 5, codeWrap));

    const expl = h('div', {}, h('p', { class: 'muted' }, t('explHint')));
    c.codes.forEach((cd, ci) => {
      const el = blocks[cd.id];
      const ol = h('ol', { class: 'expl' }, cd.expl.map((e) => {
        const [a, b] = resolve(el.lines, e);
        return h('li', {}, h('button', { type: 'button', class: 'ex-i', onclick: () => {
          el.highlight(a, b);
          el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
        } }, h('span', { class: 'ln-r', dir: 'ltr' }, a === b ? t('line', { a }) : t('lines', { a, b })), h('span', {}, e.t)));
      }));
      expl.append(h('details', { class: 'xp', open: ci === 0 }, h('summary', {}, cd.title), ol));
    });
    root.append(step(id, 6, expl));

    root.append(step(id, 7, h('div', {},
      LP.banner(c.lab.kind), h('p', {}, c.lab.text), h('ol', { class: 'tasks' }, c.lab.tasks.map((x) => h('li', {}, x))),
      W[m.lab](),
      (LP.EX[id] || []).length ? h('div', {}, h('h3', { class: 'more-h' }, t('exTitle')), h('p', { class: 'muted' }, t('exIntro')), LP.practice(id)) : null)));

    root.append(step(id, 8, h('div', { class: 'mist' }, c.mistakes.map((x) => h('div', { class: 'mi' },
      h('h3', {}, x.t),
      h('div', { class: 'cmp' },
        h('div', { class: 'bad' }, h('small', {}, t('wrongL')), h('code', { dir: 'ltr' }, x.bad)),
        h('div', { class: 'good' }, h('small', {}, t('fixL')), h('code', { dir: 'ltr' }, x.good))),
      h('p', {}, x.d))))));
    root.append(step(id, 9, h('div', {}, h('p', { class: 'muted' }, t('quizIntro')), quizView(id, c.quiz))));
    root.append(step(id, 10, h('div', {}, h('ul', { class: 'sum' }, c.summary.map((x) => h('li', {}, LP.icon('check'), h('span', {}, x)))), doneButton(id))));
    root.append(pager(id));
    return root;
  }

  function workshopView() {
    const id = 'workshop';
    S.last = id; save();
    return h('article', { class: 'lesson' }, crumbs(id), lessonHeader(id), LP.workshop(), h('div', { class: 'row center' }, doneButton(id)), pager(id));
  }

  function overview() {
    const go = (id) => () => { location.hash = '#/' + id; };
    const node = (ic, name, sub, id) => h('button', { type: 'button', class: 'ov-n', onclick: go(id) }, LP.icon(ic), h('strong', {}, name), h('small', {}, sub));
    const chip = (name, id) => h('button', { type: 'button', class: 'chip', onclick: go(id) }, name);
    return h('div', { class: 'ov', dir: 'ltr' },
      node('unity', 'Unity', t('c_unity_k'), 'unity'),
      h('div', { class: 'ov-l' }, h('span', { class: 'pipe open' }), h('span', { class: 'dot' }), h('div', { class: 'chips' }, chip('JSON', 'json'), chip('WebSocket', 'websocket'))),
      node('node', 'Node.js', t('c_node_k'), 'nodejs'));
  }

  function nextTarget() {
    if (S.last && !S.done[S.last]) return S.last;
    return LESSONS.find((x) => !S.done[x]) || LESSONS[0];
  }

  function homeView() {
    const total = LESSONS.length, n = LESSONS.filter((x) => S.done[x]).length, pct = Math.round(n / total * 100);
    const tgt = nextTarget();
    const hero = h('section', { class: 'hero card' },
      h('span', { class: 'eyebrow' }, t('heroEyebrow')), h('h1', {}, t('heroTitle')), h('p', { class: 'lead' }, t('heroText')),
      h('div', { class: 'row' },
        h('a', { class: 'btn pri lg', href: '#/' + tgt }, S.last || n ? t('resume') : t('start'), dirArrow()),
        h('span', { class: 'muted' }, t('completedOf', { n, t: total }))),
      h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct, 'aria-label': t('progress') }, h('span', { style: 'width:' + pct + '%' })));

    const learn = h('section', { class: 'card' }, h('h2', {}, t('learnTitle')), h('ul', { class: 'sum' }, [1, 2, 3, 4, 5].map((i) => h('li', {}, LP.icon('check'), h('span', {}, t('learn' + i))))));
    const ov = h('section', { class: 'card' }, h('h2', {}, t('overviewTitle')), h('p', { class: 'muted' }, t('overviewText')), overview());

    const cards = h('div', { class: 'grid' }, LESSONS.map((id, i) => {
      const q = S.quiz[id];
      const exs = (LP.EX && LP.EX[id]) || [];
      return h('a', { class: 'topic card' + (S.done[id] ? ' is-done' : ''), href: '#/' + id },
        h('span', { class: 'big-ic' }, LP.icon(META[id].icon)),
        h('span', { class: 'topic-n' }, t('lessonN', { n: i + 1 })),
        h('h3', {}, title(id)), h('p', { class: 'muted' }, short(id)),
        h('div', { class: 'meta' },
          h('span', { class: 'pill' }, LP.icon('clock'), t('minutes', { n: META[id].mins })),
          h('span', { class: 'pill ' + (S.done[id] ? 'ok' : '') }, S.done[id] ? t('done') : t('notStarted')),
          q ? h('span', { class: 'pill' }, t('quizPill', { s: q.score, t: q.total })) : null,
          exs.length ? h('span', { class: 'pill' }, t('exProgress', { s: exs.filter((e) => S.ex[e.id]).length, t: exs.length })) : null));
    }));
    return h('div', { class: 'home' }, hero, h('h2', { class: 'sec-h' }, t('lessons')), cards, ov, learn);
  }

  // ---------- navigation chrome ----------
  function route() { const m = location.hash.match(/^#\/([\w-]+)/); const id = m ? m[1] : 'home'; return id === 'home' || LESSONS.indexOf(id) >= 0 ? id : 'home'; }

  function updateNav() {
    const cur = route();
    const nav = $('#nav'); nav.textContent = '';
    const item = (id, ic, label, sub, done) => h('a', { class: 'nav-i', href: '#/' + id, 'aria-current': cur === id ? 'page' : null },
      LP.icon(ic), h('span', { class: 'nav-t' }, label, sub ? h('small', {}, sub) : null), done ? h('span', { class: 'nav-ok' }, LP.icon('check')) : null);
    nav.append(item('home', 'home', t('home')));
    nav.append(h('div', { class: 'nav-sec' }, t('lessons')));
    LESSONS.forEach((id) => nav.append(item(id, META[id].icon, title(id), t('minutes', { n: META[id].mins }), S.done[id])));
    const n = LESSONS.filter((x) => S.done[x]).length, pct = Math.round(n / LESSONS.length * 100);
    const p = $('#side-progress'); p.textContent = '';
    p.append(h('div', { class: 'nav-sec' }, t('progress')), h('div', { class: 'bar sm' }, h('span', { style: 'width:' + pct + '%' })), h('small', { class: 'muted' }, t('completedOf', { n, t: LESSONS.length })));
    document.body.classList.remove('nav-open');
  }

  function render(anchor) {
    LP.runCleanups();
    const id = route();
    const view = $('#view'); view.textContent = '';
    view.append(id === 'home' ? homeView() : id === 'workshop' ? workshopView() : lessonView(id));
    document.title = (id === 'home' ? '' : title(id) + ' — ') + t('appName');
    updateNav();
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) { if (el.tagName === 'DETAILS') el.open = true; el.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }

  function applyStatic() {
    document.documentElement.lang = S.lang;
    document.documentElement.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-aria]').forEach((e) => e.setAttribute('aria-label', t(e.dataset.i18nAria)));
    document.querySelectorAll('[data-i18n-ph]').forEach((e) => e.setAttribute('placeholder', t(e.dataset.i18nPh)));
    $('#lang').value = S.lang;
  }

  function applyTheme() {
    if (S.theme === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = S.theme;
    const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const b = $('#theme'); b.textContent = ''; b.append(LP.icon(dark ? 'sun' : 'moon'));
    b.setAttribute('aria-label', t('theme'));
  }

  // ---------- search ----------
  const norm = (s) => String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  const idxCache = {};
  function buildIndex() {
    if (idxCache[S.lang]) return idxCache[S.lang];
    const out = [];
    LESSONS.filter((x) => x !== 'workshop').forEach((id) => {
      const c = C(id), T = c.title;
      const add = (a, head, text) => out.push({ id, a, head, text, T, n: norm(head + ' ' + text) });
      add(id + '-s1', t('s1'), c.title + ' ' + c.short + ' ' + c.intro);
      add(id + '-s2', t('s2'), c.analogy.t + ' ' + c.analogy.p);
      ['what', 'why', 'how', 'when', 'rel'].forEach((k) => add(id + '-s3', t('q_' + k), c.tech[k]));
      c.extras.forEach((e, i) => add(id + '-e' + i, e.h, (e.p || '') + ' ' + (e.list || []).join(' ')));
      c.codes.forEach((cd) => add(id + '-s6', cd.title, cd.expl.map((e) => e.t).join(' ')));
      c.mistakes.forEach((m) => add(id + '-s8', m.t, m.d));
      add(id + '-s10', t('s10'), c.summary.join(' '));
    });
    idxCache[S.lang] = out;
    return out;
  }
  function doSearch(q) {
    const box = $('#sr'); box.textContent = '';
    q = norm(q.trim());
    if (q.length < 2) { box.hidden = true; return; }
    const words = q.split(/\s+/);
    const res = buildIndex().filter((e) => words.every((w) => e.n.indexOf(w) >= 0)).slice(0, 8);
    box.hidden = false;
    if (!res.length) { box.append(h('div', { class: 'sr-none' }, t('noResults'))); return; }
    res.forEach((e) => {
      const i = norm(e.text).indexOf(words[0]);
      const snip = e.text.slice(Math.max(0, i - 30), Math.max(0, i - 30) + 90);
      box.append(h('button', { type: 'button', class: 'sr-i', onclick: () => { $('#q').value = ''; box.hidden = true; go(e.id, e.a); } }, h('strong', {}, e.T + ' › ' + e.head), h('small', {}, '…' + snip + '…')));
    });
  }
  function go(id, anchor) {
    if (route() === id && location.hash === '#/' + id) render(anchor); else { LP._anchor = anchor; location.hash = '#/' + id; }
  }

  // ---------- init ----------
  function init() {
    applyStatic(); applyTheme();
    $('#lang').addEventListener('change', (e) => { S.lang = e.target.value; save(); applyStatic(); applyTheme(); render(); });
    $('#theme').addEventListener('click', () => {
      const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      S.theme = dark ? 'light' : 'dark'; save(); applyTheme();
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
    // Skip link: move focus without touching the hash (the hash is the router).
    document.querySelector('.skip').addEventListener('click', (e) => { e.preventDefault(); $('#view').focus(); $('#view').scrollIntoView(); });
    $('#menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    $('#backdrop').addEventListener('click', () => document.body.classList.remove('nav-open'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { document.body.classList.remove('nav-open'); $('#sr').hidden = true; } });
    $('#q').addEventListener('input', (e) => doSearch(e.target.value));
    document.addEventListener('click', (e) => { if (!e.target.closest('.search')) $('#sr').hidden = true; });
    const top = $('#top');
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' }));
    const rp = $('#rp span');
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      rp.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
      top.classList.toggle('show', scrollY > 600);
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('hashchange', () => { const a = LP._anchor; LP._anchor = null; render(a); onScroll(); });
    render();
    onScroll();
  }
  LP.app = { render, state: () => S };
  document.addEventListener('DOMContentLoaded', init);
})();
