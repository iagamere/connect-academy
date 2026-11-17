window.LP = window.LP || {};
(function () {
  const LP = window.LP, h = LP.h;
  const t = (k, v) => LP.t(k, v);
  const L = (o) => (typeof o === 'string' || Array.isArray(o)) ? o : (o[LP.lang()] || o.en);

  function done(card, id) { LP.markEx(id); card.classList.add('solved'); }

  function resultList(items) {
    return h('ul', { class: 'chk-list' }, items.map((i) => h('li', { class: i.ok ? 'pass' : 'fail' }, LP.icon(i.ok ? 'check' : 'close'), h('span', {}, i.label))));
  }

  // ---- edit: write / fix code, auto-checked ----
  function editEx(ex) {
    const ta = h('textarea', { class: 'ed', dir: 'ltr', rows: Math.max(6, ex.starter.split('\n').length + 1), spellcheck: 'false', 'aria-label': L(ex.title) });
    ta.value = ex.starter;
    const res = h('div', { class: 'ex-res', 'aria-live': 'polite' });
    const hint = h('p', { class: 'hint', hidden: true }, L(ex.hint || ''));
    const card = h('div', { class: 'ex' + (LP.isEx(ex.id) ? ' solved' : '') });

    function buildFn(src) {
      if (!ex.fn) return { fn: null };
      try { return { fn: new Function(src + '\n;return typeof ' + ex.fn + ' === "function" ? ' + ex.fn + ' : null;')() }; }
      catch (e) { return { err: e }; }
    }
    function check() {
      const src = ta.value;
      res.textContent = '';
      const b = buildFn(src);
      if (b.err) { res.append(h('div', { class: 'status bad' }, t('ex_syntax') + ' ' + b.err.message)); return; }
      if (ex.fn && !b.fn) { res.append(h('div', { class: 'status bad' }, t('ex_nofn', { f: ex.fn }))); return; }
      const rows = ex.checks.map((c) => {
        let ok = false;
        try { ok = !!c.test(src, b.fn); } catch (e) { ok = false; }
        return { ok, label: L(c.l) };
      });
      res.append(resultList(rows));
      const all = rows.every((r) => r.ok);
      res.append(h('div', { class: 'status ' + (all ? 'ok' : 'bad') }, all ? t('ex_pass') : t('ex_fail', { n: rows.filter((r) => !r.ok).length })));
      if (all) done(card, ex.id);
    }
    card.append(h('h4', {}, L(ex.title)), h('p', {}, L(ex.task)), ta,
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn pri', onclick: check }, t('ex_check')),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { hint.hidden = !hint.hidden; } }, t('ex_hint')),
        h('button', { type: 'button', class: 'btn ghost', onclick: () => { ta.value = ex.starter; res.textContent = ''; } }, t('ex_reset'))),
      hint, res);
    return card;
  }

  // ---- blanks: fill in ----
  function blanksEx(ex) {
    const code = L(ex.code);
    const selects = [];
    const pre = h('pre', { class: 'code fill', dir: ex.lang === 'text' ? 'auto' : 'ltr' });
    code.split('\n').forEach((line, li) => {
      const parts = line.split(/\{\{(\d+)\}\}/);
      const row = h('span', { class: 'cl' });
      parts.forEach((p, i) => {
        if (i % 2 === 0) { const sp = h('span'); sp.innerHTML = ex.lang === 'text' ? LP.esc(p) : LP.hl(p, ex.lang); row.append(sp); }
        else {
          const b = ex.blanks[+p];
          const s = h('select', { class: 'blank', 'aria-label': t('ex_blank', { n: +p + 1 }) }, h('option', { value: '' }, '…'), L(b.opts).map((o, k) => h('option', { value: k }, o)));
          s.dataset.i = p; selects.push(s); row.append(s);
        }
      });
      pre.append(row);
    });
    const res = h('div', { class: 'ex-res', 'aria-live': 'polite' });
    const card = h('div', { class: 'ex' + (LP.isEx(ex.id) ? ' solved' : '') });
    function check() {
      let ok = 0;
      selects.forEach((s) => {
        const good = s.value !== '' && +s.value === ex.blanks[+s.dataset.i].a;
        s.classList.toggle('good', good); s.classList.toggle('badv', !good);
        if (good) ok++;
      });
      const all = ok === selects.length;
      res.textContent = '';
      res.append(h('div', { class: 'status ' + (all ? 'ok' : 'bad') }, all ? t('ex_pass') : t('ex_fail', { n: selects.length - ok })), h('p', { class: 'why' }, L(ex.why)));
      if (all) done(card, ex.id);
    }
    card.append(h('h4', {}, L(ex.title)), h('p', {}, L(ex.task)), pre,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn pri', onclick: check }, t('ex_check'))), res);
    return card;
  }

  // ---- order: arrange steps ----
  function orderEx(ex) {
    const n = ex.items.length;
    let order = ex.items.map((_, i) => i);
    // deterministic shuffle that is never already sorted
    order = order.map((_, i) => order[(i * 3 + 1) % n]);
    if (new Set(order).size !== n) order = order.slice().reverse();
    if (order.every((v, i) => v === i)) order.reverse();
    const ol = h('ol', { class: 'ord' });
    const res = h('div', { class: 'ex-res', 'aria-live': 'polite' });
    const card = h('div', { class: 'ex' + (LP.isEx(ex.id) ? ' solved' : '') });
    function render() {
      ol.textContent = '';
      order.forEach((idx, pos) => {
        ol.append(h('li', { 'data-i': idx },
          h('span', { class: 'ord-t' }, L(ex.items[idx])),
          h('span', { class: 'ord-b' },
            h('button', { type: 'button', class: 'btn ghost sq', 'aria-label': t('ex_up'), disabled: pos === 0, onclick: () => { [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]]; render(); } }, '↑'),
            h('button', { type: 'button', class: 'btn ghost sq', 'aria-label': t('ex_down'), disabled: pos === n - 1, onclick: () => { [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]]; render(); } }, '↓'))));
      });
    }
    function check() {
      let ok = 0;
      [...ol.children].forEach((li, pos) => { const good = +li.dataset.i === pos; li.classList.toggle('good', good); li.classList.toggle('badv', !good); if (good) ok++; });
      const all = ok === n;
      res.textContent = '';
      res.append(h('div', { class: 'status ' + (all ? 'ok' : 'bad') }, all ? t('ex_pass') : t('ex_fail_order', { n: ok, t: n })), all ? h('p', { class: 'why' }, L(ex.why)) : null);
      if (all) done(card, ex.id);
    }
    render();
    card.append(h('h4', {}, L(ex.title)), h('p', {}, L(ex.task)), ol,
      h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn pri', onclick: check }, t('ex_check'))), res);
    return card;
  }

  LP.practice = function (lessonId) {
    const list = (LP.EX && LP.EX[lessonId]) || [];
    const wrap = h('div', { class: 'practice' });
    list.forEach((ex) => wrap.append(ex.type === 'edit' ? editEx(ex) : ex.type === 'blanks' ? blanksEx(ex) : orderEx(ex)));
    return wrap;
  };
})();
