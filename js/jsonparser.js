window.LP = window.LP || {};
(function () {
  // Strict JSON parser that reports an error code and position (used by the playground).
  function parse(src) {
    let i = 0;
    const n = src.length;
    const err = (code, pos) => { throw { code, pos: pos === undefined ? i : pos }; };
    const ws = () => { while (i < n && ' \t\n\r'.indexOf(src[i]) >= 0) i++; };

    function value() {
      ws();
      if (i >= n) err('eof');
      const c = src[i];
      if (c === '{') return obj();
      if (c === '[') return arr();
      if (c === '"') return str();
      if (c === "'") err('singleQuote');
      if (c === '-' || (c >= '0' && c <= '9')) return num();
      if (src.startsWith('true', i)) { i += 4; return true; }
      if (src.startsWith('false', i)) { i += 5; return false; }
      if (src.startsWith('null', i)) { i += 4; return null; }
      if (c === '/') err('comment');
      if (src.startsWith('undefined', i) || src.startsWith('NaN', i) || src.startsWith('Infinity', i)) err('badLiteral');
      err('unexpected');
    }
    function obj() {
      i++; ws();
      const o = {};
      if (src[i] === '}') { i++; return o; }
      for (;;) {
        ws();
        if (i >= n) err('eof');
        if (src[i] === '}') err('trailingComma');
        if (src[i] !== '"') {
          if (src[i] === "'") err('singleQuote');
          if (/[A-Za-z_$]/.test(src[i])) err('unquotedKey');
          err('expectedKey');
        }
        const k = str();
        ws();
        if (src[i] !== ':') { if (i >= n) err('eof'); err('expectedColon'); }
        i++;
        o[k] = value();
        ws();
        if (src[i] === ',') { i++; continue; }
        if (src[i] === '}') { i++; return o; }
        if (i >= n) err('eof');
        err('expectedCommaOrBrace');
      }
    }
    function arr() {
      i++; ws();
      const a = [];
      if (src[i] === ']') { i++; return a; }
      for (;;) {
        ws();
        if (i >= n) err('eof');
        if (src[i] === ']') err('trailingComma');
        a.push(value());
        ws();
        if (src[i] === ',') { i++; continue; }
        if (src[i] === ']') { i++; return a; }
        if (i >= n) err('eof');
        err('expectedCommaOrBracket');
      }
    }
    function str() {
      const start = i;
      i++;
      let s = '';
      for (;;) {
        if (i >= n) err('unterminatedString', start);
        const c = src[i];
        if (c === '"') { i++; return s; }
        if (c === '\\') {
          const d = src[i + 1];
          if (d !== undefined && '"\\/bfnrt'.indexOf(d) >= 0) {
            s += { b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }[d] || d; i += 2; continue;
          }
          if (d === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(i + 2, i + 6))) {
            s += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16)); i += 6; continue;
          }
          err('badEscape');
        }
        if (c < ' ') err('controlChar');
        s += c; i++;
      }
    }
    function num() {
      const re = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
      re.lastIndex = i;
      const m = re.exec(src);
      if (!m) err('badNumber');
      i += m[0].length;
      if (i < n && /[\d.]/.test(src[i])) err('badNumber');
      return Number(m[0]);
    }

    const v = value();
    ws();
    if (i < n) err('extraData');
    return v;
  }

  function locate(src, pos) {
    const before = src.slice(0, pos);
    const lines = before.split('\n');
    return { line: lines.length, col: lines[lines.length - 1].length + 1 };
  }

  LP.parseJSON = parse;
  LP.locate = locate;
  if (typeof module !== 'undefined') module.exports = { parse, locate };
})();
