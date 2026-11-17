window.LP = window.LP || {};
// Hands-on challenges. Types: edit (write/fix code, auto-checked), blanks (fill in), order (arrange steps).
(function () {
  const P = (s) => { try { return LP.parseJSON(s); } catch (e) { return undefined; } };
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  LP.EX = {
    json: [
      {
        id: 'j1', type: 'edit', lang: 'json',
        title: { ar: 'تحدي 1: أصلح الـ JSON', en: 'Challenge 1: Fix the JSON' },
        task: { ar: 'هذا النص يحتوي عدة أخطاء. عدّله ليصبح JSON صالحاً مع الإبقاء على القيم (الاسم Sara والمستوى 12 وعنصرين في inventory).', en: 'This text has several mistakes. Edit it into valid JSON while keeping the values (name Sara, level 12, two inventory items).' },
        starter: "{\n  'name': 'Sara',\n  level: 12,\n  \"inventory\": [\"sword\", \"shield\",],\n}",
        hint: { ar: 'ثلاثة أنواع من الأخطاء: الاقتباس الفردي، مفتاح بدون اقتباس، فاصلة زائدة (مرتان).', en: 'Three kinds of mistakes: single quotes, an unquoted key, trailing commas (twice).' },
        checks: [
          { l: { ar: 'النص JSON صالح', en: 'The text is valid JSON' }, test: (s) => P(s) !== undefined },
          { l: { ar: 'name يساوي "Sara"', en: 'name equals "Sara"' }, test: (s) => (P(s) || {}).name === 'Sara' },
          { l: { ar: 'level رقم يساوي 12', en: 'level is the number 12' }, test: (s) => (P(s) || {}).level === 12 },
          { l: { ar: 'inventory مصفوفة فيها عنصران', en: 'inventory is an array with two items' }, test: (s) => { const v = P(s) || {}; return Array.isArray(v.inventory) && v.inventory.length === 2; } }
        ]
      },
      {
        id: 'j2', type: 'edit', lang: 'json',
        title: { ar: 'تحدي 2: اكتب ملف لاعب من الصفر', en: 'Challenge 2: Write a player profile from scratch' },
        task: { ar: 'اكتب JSON صالحاً يصف لاعباً: name نص، level رقم، isOnline منطقي، guild تساوي null، inventory مصفوفة، position كائن فيه x وy رقمان.', en: 'Write valid JSON describing a player: name (string), level (number), isOnline (boolean), guild set to null, inventory (array), position (object with numeric x and y).' },
        starter: '{\n  \n}',
        hint: { ar: 'انظر إلى مثال ملف اللاعب في الخطوة 5 واكتب قيمك الخاصة.', en: 'Look at the player profile example in step 5 and write your own values.' },
        checks: [
          { l: { ar: 'النص JSON صالح', en: 'The text is valid JSON' }, test: (s) => isObj(P(s)) },
          { l: { ar: 'name نص غير فارغ', en: 'name is a non-empty string' }, test: (s) => { const v = P(s) || {}; return typeof v.name === 'string' && v.name.length > 0; } },
          { l: { ar: 'level رقم', en: 'level is a number' }, test: (s) => typeof (P(s) || {}).level === 'number' },
          { l: { ar: 'isOnline قيمة منطقية', en: 'isOnline is a boolean' }, test: (s) => typeof (P(s) || {}).isOnline === 'boolean' },
          { l: { ar: 'guild تساوي null', en: 'guild is null' }, test: (s) => { const v = P(s); return isObj(v) && 'guild' in v && v.guild === null; } },
          { l: { ar: 'inventory مصفوفة', en: 'inventory is an array' }, test: (s) => Array.isArray((P(s) || {}).inventory) },
          { l: { ar: 'position كائن فيه x وy رقمان', en: 'position is an object with numeric x and y' }, test: (s) => { const p = (P(s) || {}).position; return isObj(p) && typeof p.x === 'number' && typeof p.y === 'number'; } }
        ]
      }
    ],

    websocket: [
      {
        id: 'w1', type: 'order',
        title: { ar: 'تحدي 1: رتّب دورة حياة الاتصال', en: 'Challenge 1: Order the connection lifecycle' },
        task: { ar: 'رتّب الخطوات من الأولى إلى الأخيرة باستخدام الأسهم، ثم اضغط «تحقق».', en: 'Arrange the steps from first to last with the arrows, then press Check.' },
        items: [
          { ar: 'العميل يرسل طلب HTTP يحمل Upgrade: websocket', en: 'The client sends an HTTP request carrying Upgrade: websocket' },
          { ar: 'الخادم يردّ بـ 101 Switching Protocols', en: 'The server answers 101 Switching Protocols' },
          { ar: 'يُطلَق حدث open ويصبح الاتصال مفتوحاً', en: 'The open event fires and the connection is open' },
          { ar: 'يتبادل الطرفان الرسائل بحرية في الاتجاهين', en: 'Both sides exchange messages freely in both directions' },
          { ar: 'أحد الطرفين يغلق الاتصال فيُطلَق حدث close', en: 'One side closes the connection and the close event fires' }
        ],
        why: { ar: 'المصافحة تأتي أولاً (HTTP ثم 101)، وبعدها يفتح الاتصال ويمكن تبادل الرسائل حتى الإغلاق.', en: 'The handshake comes first (HTTP then 101); then the connection opens and messages flow until it closes.' }
      },
      {
        id: 'w2', type: 'blanks', lang: 'js',
        title: { ar: 'تحدي 2: أكمل عميل WebSocket', en: 'Challenge 2: Complete a WebSocket client' },
        task: { ar: 'اختر القيمة الصحيحة لكل فراغ.', en: 'Choose the right value for each blank.' },
        code: "const socket = new WebSocket({{0}});\nsocket.addEventListener({{1}}, () => {\n  socket.send({{2}});\n});",
        blanks: [
          { opts: ["'ws://localhost:8080'", "'http://localhost:8080'", "'localhost'"], a: 0 },
          { opts: ["'start'", "'open'", "'connect'"], a: 1 },
          { opts: ["{ type: 'hello' }", "JSON.parse({ type: 'hello' })", "JSON.stringify({ type: 'hello' })"], a: 2 }
        ],
        why: { ar: 'العنوان يبدأ بـ ws://، والحدث اسمه open، وsend ترسل نصاً فنستخدم JSON.stringify.', en: 'The address starts with ws://, the event is called open, and send takes text so we use JSON.stringify.' }
      }
    ],

    nodejs: [
      {
        id: 'n1', type: 'blanks', lang: 'js',
        title: { ar: 'تحدي 1: أكمل خادم HTTP', en: 'Challenge 1: Complete an HTTP server' },
        task: { ar: 'اختر القيمة الصحيحة لكل فراغ.', en: 'Choose the right value for each blank.' },
        code: "const http = require({{0}});\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' });\n  res.end({{1}}({ status: 'ok' }));\n});\nserver.{{2}}(3000);",
        blanks: [
          { opts: ["'ws'", "'json'", "'http'"], a: 2 },
          { opts: ["JSON.parse", "JSON.stringify", "JSON.send"], a: 1 },
          { opts: ["start", "open", "listen"], a: 2 }
        ],
        why: { ar: 'الوحدة المدمجة اسمها http، وres.end تحتاج نصاً (stringify)، وlisten تبدأ الاستماع على المنفذ.', en: 'The built-in module is http, res.end needs text (stringify), and listen starts listening on the port.' }
      },
      {
        id: 'n2', type: 'edit', lang: 'js', fn: 'validateJoin',
        title: { ar: 'تحدي 2: اكتب دالة تحقق على الخادم', en: 'Challenge 2: Write a server-side validation function' },
        task: { ar: 'اكتب validateJoin بحيث تُرجع true فقط إذا كانت msg كائناً فيه name نصي غير فارغ (بعد حذف المسافات) وطوله 20 حرفاً أو أقل. وإلا تُرجع false. هذا كود JavaScript حقيقي يعمل في متصفحك.', en: 'Write validateJoin so it returns true only if msg is an object with a non-empty string name (after trimming spaces) of at most 20 characters. Otherwise it returns false. This is real JavaScript running in your browser.' },
        starter: '// return true only for a valid join message\nfunction validateJoin(msg) {\n  // write your code here\n  return false;\n}',
        hint: { ar: 'تحقق من msg && typeof msg.name === "string" ثم trim().length.', en: 'Check msg && typeof msg.name === "string", then trim().length.' },
        checks: [
          { l: { ar: 'تقبل {name:"Sara"}', en: 'Accepts {name:"Sara"}' }, test: (s, f) => f({ name: 'Sara' }) === true },
          { l: { ar: 'ترفض اسماً فارغاً', en: 'Rejects an empty name' }, test: (s, f) => f({ name: '' }) === false },
          { l: { ar: 'ترفض اسماً من مسافات فقط', en: 'Rejects a spaces-only name' }, test: (s, f) => f({ name: '   ' }) === false },
          { l: { ar: 'ترفض null', en: 'Rejects null' }, test: (s, f) => f(null) === false },
          { l: { ar: 'ترفض اسماً غير نصي (رقم)', en: 'Rejects a non-string name (number)' }, test: (s, f) => f({ name: 123 }) === false },
          { l: { ar: 'ترفض اسماً أطول من 20', en: 'Rejects a name longer than 20' }, test: (s, f) => f({ name: 'x'.repeat(21) }) === false },
          { l: { ar: 'تقبل اسماً من 20 حرفاً بالضبط', en: 'Accepts a name of exactly 20 characters' }, test: (s, f) => f({ name: 'x'.repeat(20) }) === true }
        ]
      }
    ],

    unity: [
      {
        id: 'u1', type: 'blanks', lang: 'cs',
        title: { ar: 'تحدي 1: أكمل سكربت الإرسال في Unity', en: 'Challenge 1: Complete the Unity send script' },
        task: { ar: 'اختر القيمة الصحيحة لكل فراغ.', en: 'Choose the right value for each blank.' },
        code: "void Update()\n{\n#if !UNITY_WEBGL || UNITY_EDITOR\n    ws.{{0}}();\n#endif\n    if (ws.State == {{1}})\n    {\n        var msg = new MoveMessage { x = transform.position.x };\n        ws.SendText(JsonUtility.{{2}}(msg));\n    }\n}",
        blanks: [
          { opts: ['Connect', 'Close', 'DispatchMessageQueue'], a: 2 },
          { opts: ['WebSocketState.Open', 'WebSocketState.Closed', 'null'], a: 0 },
          { opts: ['FromJson', 'ToJson', 'Parse'], a: 1 }
        ],
        why: { ar: 'DispatchMessageQueue توزع الرسائل الواردة، ونرسل فقط والاتصال Open، وToJson تحوّل الكائن إلى نص.', en: 'DispatchMessageQueue delivers incoming messages, we only send while the state is Open, and ToJson turns the object into text.' }
      },
      {
        id: 'u2', type: 'order',
        title: { ar: 'تحدي 2: رتّب خطوات الإرسال في Unity', en: 'Challenge 2: Order the Unity sending steps' },
        task: { ar: 'رتّب ما يحدث عند تحريك اللاعب.', en: 'Arrange what happens when the player moves.' },
        items: [
          { ar: 'اللاعب يضغط زر الحركة وUpdate يحرك الكائن', en: 'The player presses a move key and Update moves the object' },
          { ar: 'ننشئ كائن MoveMessage ونضع فيه الموضع', en: 'We create a MoveMessage object and put the position in it' },
          { ar: 'JsonUtility.ToJson يحوّله إلى نص JSON', en: 'JsonUtility.ToJson turns it into JSON text' },
          { ar: 'ws.SendText يرسل النص عبر WebSocket', en: 'ws.SendText sends the text over WebSocket' }
        ],
        why: { ar: 'نبدأ بالحدث ثم نبني الرسالة ثم نحوّلها لنص ثم نرسلها.', en: 'First the event, then build the message, convert it to text, and finally send it.' }
      }
    ],

    architecture: [
      {
        id: 'a1', type: 'order',
        title: { ar: 'تحدي 1: رتّب رحلة الحركة', en: 'Challenge 1: Order the journey of a move' },
        task: { ar: 'رتّب الخطوات الثماني من حركة اللاعب 1 حتى رؤية اللاعب 2 لها.', en: 'Arrange the eight steps from Player 1 moving to Player 2 seeing it.' },
        items: [
          { ar: 'اللاعب 1 يحرك الشخصية في Unity', en: 'Player 1 moves the character in Unity' },
          { ar: 'Unity يحوّل الموضع إلى JSON', en: 'Unity converts the position to JSON' },
          { ar: 'WebSocket ينقل النص إلى Node.js', en: 'WebSocket carries the text to Node.js' },
          { ar: 'Node.js يستقبل الرسالة ويتحقق منها', en: 'Node.js receives the message and validates it' },
          { ar: 'الخادم يحدّث الحالة ويحدد المستقبلين', en: 'The server updates state and picks the recipients' },
          { ar: 'WebSocket ينقل الحدث إلى اللاعب 2', en: 'WebSocket carries the event to Player 2' },
          { ar: 'Unity عند اللاعب 2 يقرأ JSON', en: 'Unity on Player 2 reads the JSON' },
          { ar: 'Unity يحرك الشخصية في عالم اللاعب 2', en: 'Unity moves the character in Player 2\'s world' }
        ],
        why: { ar: 'التحقق يأتي قبل البث دائماً: لا نوزع شيئاً لم نتحقق منه.', en: 'Validation always comes before broadcasting: never distribute what you have not checked.' }
      },
      {
        id: 'a2', type: 'blanks', lang: 'text',
        title: { ar: 'تحدي 2: من يفعل ماذا؟', en: 'Challenge 2: Who does what?' },
        task: { ar: 'طابق كل تقنية بدورها.', en: 'Match each technology with its role.' },
        code: { ar: 'Unity هو {{0}}.\nNode.js هو {{1}}.\nWebSocket هو {{2}}.\nJSON هو {{3}}.', en: 'Unity is the {{0}}.\nNode.js is the {{1}}.\nWebSocket is the {{2}}.\nJSON is the {{3}}.' },
        blanks: [
          { opts: { ar: ['بروتوكول اتصال', 'محرك ألعاب', 'صيغة بيانات'], en: ['communication protocol', 'game engine', 'data format'] }, a: 1 },
          { opts: { ar: ['بيئة تشغيل للخادم', 'محرك ألعاب', 'صيغة بيانات'], en: ['server-side runtime', 'game engine', 'data format'] }, a: 0 },
          { opts: { ar: ['صيغة بيانات', 'بروتوكول اتصال', 'بيئة تشغيل للخادم'], en: ['data format', 'server-side runtime', 'communication protocol'] }, a: 2 },
          { opts: { ar: ['صيغة بيانات', 'محرك ألعاب', 'بروتوكول اتصال'], en: ['data format', 'game engine', 'communication protocol'] }, a: 0 }
        ],
        why: { ar: 'Unity محرك ألعاب، وNode.js بيئة تشغيل للخادم، وWebSocket بروتوكول نقل، وJSON صيغة بيانات.', en: 'Unity is the game engine, Node.js the server-side runtime, WebSocket the transport protocol, and JSON the data format.' }
      },
      {
        id: 'a3', type: 'edit', lang: 'js', fn: 'isMoveAllowed',
        title: { ar: 'تحدي 3: اكتب قاعدة منع الغش', en: 'Challenge 3: Write the anti-cheat rule' },
        task: { ar: 'اكتب isMoveAllowed(current, target, maxStep) بحيث تُرجع true فقط إذا كان target.x وtarget.y رقمين منتهيين والمسافة بين current وtarget لا تتجاوز maxStep. هذه هي القاعدة التي تحمي الخادم من اللاعب الغشّاش.', en: 'Write isMoveAllowed(current, target, maxStep) so it returns true only if target.x and target.y are finite numbers and the distance between current and target does not exceed maxStep. This is the rule that protects the server from a cheating player.' },
        starter: '// current and target look like { x: 0, y: 0 }\nfunction isMoveAllowed(current, target, maxStep) {\n  // write your code here\n  return false;\n}',
        hint: { ar: 'استخدم Number.isFinite لكل إحداثي ثم Math.hypot(dx, dy) <= maxStep.', en: 'Use Number.isFinite for each coordinate, then Math.hypot(dx, dy) <= maxStep.' },
        checks: [
          { l: { ar: 'تقبل خطوة واحدة (0,0 إلى 1,0)', en: 'Accepts one step (0,0 to 1,0)' }, test: (s, f) => f({ x: 0, y: 0 }, { x: 1, y: 0 }, 1) === true },
          { l: { ar: 'تقبل حركة رأسية (2,2 إلى 2,3)', en: 'Accepts a vertical move (2,2 to 2,3)' }, test: (s, f) => f({ x: 2, y: 2 }, { x: 2, y: 3 }, 1) === true },
          { l: { ar: 'ترفض القفز 5 خانات', en: 'Rejects a 5-tile jump' }, test: (s, f) => f({ x: 0, y: 0 }, { x: 5, y: 0 }, 1) === false },
          { l: { ar: 'ترفض موضعاً نصياً', en: 'Rejects a string position' }, test: (s, f) => f({ x: 0, y: 0 }, { x: 'a', y: 0 }, 1) === false },
          { l: { ar: 'ترفض NaN', en: 'Rejects NaN' }, test: (s, f) => f({ x: 0, y: 0 }, { x: NaN, y: 0 }, 1) === false },
          { l: { ar: 'ترفض Infinity', en: 'Rejects Infinity' }, test: (s, f) => f({ x: 0, y: 0 }, { x: Infinity, y: 0 }, 1) === false }
        ]
      }
    ]
  };
})();
