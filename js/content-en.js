window.LP = window.LP || {};
LP.CONTENT = LP.CONTENT || {};
LP.CONTENT.en = {
  json: {
    title: 'JSON — Understanding Data',
    short: 'The format apps and games use to exchange data.',
    intro: 'When two programs talk — a game and a server, for example — they need a shared way to describe data. JSON is the most popular one: plain text that describes things like a player\'s name, level and position, readable by people and easy for computers to understand.',
    analogy: { t: 'An ID card', p: 'Think of an ID card: fixed fields (name, age, city) and a value next to each. Any clerk in any country can read it because the layout is agreed. JSON is the ID card of data: every piece of information has a name and a value, and everybody agrees on how to write it.' },
    tech: {
      what: 'JSON stands for JavaScript Object Notation. It is a text-based data format that represents data as "key: value" pairs. It is not a programming language: it has no commands, conditions or loops, only data.',
      why: 'Every language stores data its own way (C# in Unity, JavaScript in Node.js). To exchange information they need a middle format both understand. JSON is simple, readable and light, so it became the standard of the internet.',
      how: 'Data is written inside curly braces { } as "key": value pairs separated by commas. The sender converts its data to JSON text (called serializing) and the receiver converts the text back to data in its own language (called parsing).',
      when: 'When sending data between a client and a server (APIs), saving game settings, describing a player profile, or sending real-time messages in multiplayer games.',
      rel: 'JSON is the shape of the message. WebSocket is the road the message travels on. Unity creates and reads the message; Node.js receives and processes it.'
    },
    extras: [
      { h: 'The six value types', p: 'JSON supports only six types:', list: ['string: between double quotes, like "Sara"', 'number: like 12 or 1850.5, no quotes', 'boolean: true or false', 'array: an ordered list between [ ]', 'object: a group of key/value pairs between { }', 'null: means "nothing"'] },
      { h: 'Nested structures', p: 'A value can itself be an object or an array, like position inside the player profile. You reach the value with the path player.position.x. Nesting lets you describe complex data in an organized way.' },
      { h: 'Syntax rules', list: ['Keys always use double quotes — single quotes are not allowed', 'No comma after the last item (trailing comma)', 'No comments inside JSON', 'Every string must end with the same kind of quote', 'Only the six types are allowed (no undefined, NaN or functions)'] },
      { h: 'JSON vs programming languages', p: 'JavaScript code can perform operations like level + 1; JSON is only text and does nothing. Its name contains JavaScript because its look comes from it, but it is used in Unity, Python, Java and almost every language.' },
      { h: 'JSON in APIs and applications', p: 'When an app asks a server for the list of players, the server usually answers with JSON text. The app turns it into data and displays it. The same idea is used to save settings and to carry chat and game messages.' },
      { h: 'How Unity and Node.js exchange JSON', p: 'Unity (C#) converts an object such as PlayerData to JSON text with JsonUtility.ToJson and sends it. Node.js receives the text, turns it into a JavaScript object with JSON.parse, processes it, then replies with JSON.stringify so Unity can read it again.' }
    ],
    diagramNote: 'A visual picture of the profile in the example: every object is a card, every array is a numbered list, and colors show the value type.',
    codes: [
      { id: 'json_profile', title: 'A player profile in JSON', expl: [
        { f: '{', t: 'The curly brace opens an object: a group of data about one thing, here a player.' },
        { f: '"name"', t: 'A string: both the key name and the value "Sara" use double quotes.' },
        { f: '"level"', t: 'A number, written without quotes.' },
        { f: '"isOnline"', t: 'A boolean: true or false, no quotes.' },
        { f: '"score"', t: 'Decimal numbers use a dot.' },
        { f: '"guild"', t: 'null means no value: the player is in no guild.' },
        { f: '"inventory"', t: 'An array: an ordered list between [ ] with items separated by commas.' },
        { f: '"position"', t: 'An object inside an object (nesting). We reach 3 with position.x. Notice the last line has no trailing comma.' }
      ] },
      { id: 'json_js', title: 'Converting JSON in JavaScript', expl: [
        { f: 'const text', t: 'Ordinary text that contains JSON. You cannot read level from it directly: it is just characters.' },
        { f: 'JSON.parse', t: 'Turns the text into a real JavaScript object called player (this is parsing).' },
        { f: 'player.level', t: 'We use the object normally: raise the level by one.' },
        { f: 'JSON.stringify', t: 'Turns the object into JSON text so it can travel over the network (serializing).' },
        { f: 'console.log', t: 'Prints {"name":"Sara","level":13}.' }
      ] }
    ],
    lab: { kind: 'real', text: 'This editor really works: it checks your text with a JSON parser built into the page and draws its structure. Try these:', tasks: ['Press Validate on the ready-made example.', 'Delete a quote or add a trailing comma and read the error and its position.', 'Load "Example with errors" and fix it until it is valid.', 'Press Format to tidy the text and Minify to shrink it.'] },
    mistakes: [
      { t: 'Using single quotes', bad: `{ 'name': 'Sara' }`, good: `{ "name": "Sara" }`, d: 'JSON accepts double quotes only.' },
      { t: 'Trailing comma after the last item', bad: `{ "a": 1, }`, good: `{ "a": 1 }`, d: 'The last item has no comma after it. This is one of the most common mistakes.' },
      { t: 'Unquoted key', bad: `{ name: "Sara" }`, good: `{ "name": "Sara" }`, d: 'Fine in JavaScript, invalid in JSON.' },
      { t: 'Treating text as an object', bad: `const lvl = data.level; // data is text!`, good: `const lvl = JSON.parse(data).level;`, d: 'What arrives over the network is text; parse it with JSON.parse before using it.' }
    ],
    quiz: [
      { q: 'What is JSON?', opts: ['A programming language for making games', 'A text format for representing data', 'A protocol for sending data over the network'], a: 1, ex: ['No. JSON has no commands and runs nothing; it is only data.', 'Correct. JSON is structured text that describes data and many languages use it.', 'No. Transport is the job of protocols like HTTP and WebSocket; JSON is the shape of the data being sent.'] },
      { q: 'Which of these is valid JSON?', opts: ['{ name: "Sara" }', '{ "name": "Sara", }', '{ "name": "Sara" }'], a: 2, ex: ['Invalid: the key name has no quotes.', 'Invalid: trailing comma after the last item.', 'Valid: a double-quoted key, a string value and no trailing comma.'] },
      { q: 'Which function turns JSON text into a JavaScript object?', opts: ['JSON.stringify', 'JSON.parse', 'JSON.convert'], a: 1, ex: ['stringify does the opposite: object to text.', 'Correct: parse reads the text and produces an object.', 'That function does not exist.'] }
    ],
    summary: ['JSON is a text format for describing data, not a programming language.', 'It is made of key/value pairs and six types: string, number, boolean, array, object, null.', 'Keys and strings use double quotes and there is no comma after the last item.', 'We turn an object into text with stringify (ToJson in Unity) and back with parse (FromJson).']
  },

  websocket: {
    title: 'WebSocket — Real-Time Communication',
    short: 'An open channel where both sides exchange messages instantly.',
    intro: 'On ordinary websites the browser asks, the server answers, and that is the end. In a multiplayer game or a live chat we need news to arrive instantly without asking every time. That is where WebSocket comes in.',
    analogy: { t: 'A letter versus a phone call', p: 'HTTP is like mailing letters: you send one, wait for the reply, and it is over; to continue you write a new letter. WebSocket is like a phone call: once the other side picks up, the line stays open and either of you can speak at any moment without a new "request".' },
    tech: {
      what: 'WebSocket is a communication protocol that creates an open, persistent channel between client and server and lets messages flow in both directions. Its addresses start with ws:// or wss:// (encrypted).',
      why: 'HTTP was designed as request and response: the server cannot start the conversation. To fake real time, browsers asked the server every second "anything new?" (polling), which is costly and slow. WebSocket was created to remove that problem.',
      how: 'A connection starts with an ordinary HTTP request carrying an Upgrade: websocket header (the handshake). If the server agrees it answers 101 Switching Protocols and the same connection becomes a WebSocket and stays open. Then either side sends small messages whenever it wants, which is called full-duplex (both directions at once). The connection ends when one side closes it or the network drops.',
      when: 'Live chat, multiplayer games, live stock boards, instant notifications, collaborative editing.',
      rel: 'WebSocket is the road messages travel on, and the message content is usually JSON text. Unity connects as a client and Node.js acts as the server that accepts connections and distributes messages.'
    },
    extras: [
      { h: 'The four WebSocket events', list: ['open: connected, you can send now', 'message: a message arrived from the other side', 'error: something went wrong with the connection', 'close: the connection closed (with a code explaining why)'] },
      { h: 'HTTP vs WebSocket', list: ['HTTP: the client always starts, every request is independent, the connection usually ends after the reply', 'WebSocket: one persistent connection, both sides may speak first, small fast messages'] },
      { h: 'Advantages and limits', list: ['Advantage: low latency, no repeated requests', 'Advantage: the server can push instantly', 'Limit: every connected user uses some server resources', 'Limit: you must handle disconnects and reconnecting yourself', 'Limit: messages sent during a disconnect are lost unless you design a resend mechanism'] },
      { h: 'Encryption', p: 'ws:// is unencrypted like http://. For real sites use wss:// (like https://) so nobody can read messages on the way; it is also required when your page itself is on https.' }
    ],
    diagramNote: 'See how HTTP opens a new connection for every request and then closes it, while WebSocket stays open and both sides exchange messages freely.',
    codes: [
      { id: 'ws_handshake', title: 'The handshake: how HTTP becomes WebSocket', expl: [
        { f: 'GET /game', t: 'The client asks to open a connection to the path /game over plain HTTP.' },
        { f: 'Upgrade: websocket', n: 2, t: 'Two headers saying: I want to upgrade this connection to WebSocket.' },
        { f: 'Sec-WebSocket-Key', n: 2, t: 'A random key sent by the client, and the version number 13.' },
        { f: 'HTTP/1.1 101', t: 'The server agrees: 101 Switching Protocols. From here HTTP stops and WebSocket begins.' },
        { f: 'Sec-WebSocket-Accept', t: 'A value computed from the key above, proving the server really speaks WebSocket.' }
      ] },
      { id: 'ws_client', title: 'A WebSocket client in the browser', expl: [
        { f: 'new WebSocket', t: 'Creates the connection to the server address. It starts at once but needs time to open.' },
        { f: "addEventListener('open'", n: 4, t: 'When the connection opens we send the first message. We convert the object to JSON text because send transmits text.' },
        { f: "addEventListener('message'", n: 4, t: 'When a message arrives we read event.data (text) and parse it with JSON.parse.' },
        { f: "addEventListener('error'", t: 'Runs when the connection has an error.' },
        { f: "addEventListener('close'", t: 'Runs when the connection closes; event.code gives the reason (1000 means a normal close).' }
      ] }
    ],
    lab: { kind: 'sim', text: 'This is a simulation running only inside your browser: there is no server and no real network connection. Its purpose is to let you see the lifecycle: connect, send, receive, close. You will try a real WebSocket connection in the Workshop.', tasks: ['Press Connect and watch the state change from CONNECTING to OPEN.', 'Send a plain text message, then a JSON message like {"type":"ping"}.', 'Press "Server pushes a message" to see the server start talking without a request.', 'Press Disconnect and then try to send.'] },
    mistakes: [
      { t: 'Sending before the connection is open', bad: `const s = new WebSocket(url); s.send('hi');`, good: `s.addEventListener('open', () => s.send('hi'));`, d: 'Connecting takes time; wait for the open event.' },
      { t: 'Sending an object directly', bad: `socket.send({ x: 1 })`, good: `socket.send(JSON.stringify({ x: 1 }))`, d: 'WebSocket sends text or binary data, not objects; convert to JSON first.' },
      { t: 'ws:// from an https page', bad: `new WebSocket('ws://example.com')`, good: `new WebSocket('wss://example.com')`, d: 'Browsers block unencrypted connections from encrypted pages.' },
      { t: 'Ignoring the close event', bad: `// no close handler`, good: `socket.addEventListener('close', reconnect);`, d: 'Networks drop; write logic to reconnect or inform the user.' }
    ],
    quiz: [
      { q: 'What is WebSocket\'s main advantage over HTTP?', opts: ['It stores data in a database', 'It keeps a connection open that both sides can send through at any time', 'It converts data to JSON'], a: 1, ex: ['It has nothing to do with storage.', 'Correct: a persistent two-way connection.', 'Formatting data is not WebSocket\'s job; that is JSON\'s.'] },
      { q: 'What does response code 101 mean in the handshake?', opts: ['Page not found', 'The server agreed to switch from HTTP to WebSocket', 'A server error occurred'], a: 1, ex: ['That is 404.', 'Correct: Switching Protocols.', 'Server errors start with 5.'] },
      { q: 'Which event runs when a message arrives from the server?', opts: ['open', 'message', 'close'], a: 1, ex: ['open runs only when the connection opens.', 'Correct: message.', 'close runs when it closes.'] }
    ],
    summary: ['WebSocket is a protocol that opens a persistent two-way connection.', 'It starts with an HTTP handshake and the server answers 101.', 'The four events: open, message, error, close.', 'WebSocket carries messages; the message format (often JSON) is a separate matter.']
  },

  nodejs: {
    title: 'Node.js — Understanding the Backend',
    short: 'A runtime that runs JavaScript outside the browser to build servers.',
    intro: 'When you press a button in an online game, someone has to receive the request and decide what happens. That someone is a program on a remote computer called a server, and Node.js is one of the most popular tools for writing it.',
    analogy: { t: 'A restaurant', p: 'The customer (client) sits in the dining room and orders. The kitchen (server) receives the order, prepares it and sends back the dish. The customer never sees the kitchen. Node.js is the cook working in that kitchen: it receives orders, runs the logic, sends the reply, and serves many customers at the same time.' },
    tech: {
      what: 'Node.js is a runtime that lets you run JavaScript outside the browser, on your computer or a server. It is not a new language; it is the engine that executes JavaScript code.',
      why: 'JavaScript used to run only inside browsers. Node.js took V8 (Chrome\'s JavaScript engine) and added abilities like reading files and using the network, so you can use one language for both front end and server.',
      how: 'Node.js is event-driven and non-blocking: instead of waiting for one request to finish, it registers what to do when an event arrives (a request came, a message came) and carries on serving others. That is why one main thread can handle many open connections.',
      when: 'APIs, real-time chat and game servers, command-line tools. Less suitable for very heavy computation because it blocks the main thread.',
      rel: 'Node.js is the "server" in our project: it accepts WebSocket connections from Unity players, reads JSON messages, validates them and distributes them to the other players.'
    },
    extras: [
      { h: 'Frontend and backend', p: 'The frontend runs at the user: a web page or a Unity game. The backend runs at the provider: it stores data, applies rules and talks to everyone. Never trust the frontend; the user can modify it.' },
      { h: 'How a server works', p: 'A server is a program that runs continuously and listens on a "port" such as 3000. When a request arrives it reads it, runs your code and sends a reply. The address localhost means "this computer", handy for testing.' },
      { h: 'npm, packages and dependencies', p: 'npm (Node Package Manager) installs packages: ready-made libraries written by others. The packages your project needs are listed in package.json under dependencies and stored in the node_modules folder. Example: the ws package adds WebSocket support.' },
      { h: 'How Node.js handles JSON', p: 'Messages arrive as text. You use JSON.parse to turn them into objects, wrapped in try/catch because bad text may arrive. When replying you use JSON.stringify. Never assume the data has the right shape; validate it.' },
      { h: 'Node.js in multiplayer games', p: 'It keeps the important world state, validates player moves and distributes events to rooms. It is the shared referee everyone trusts.' }
    ],
    diagramNote: 'The client sends a request; Node.js receives it, runs your code and sends back the reply.',
    codes: [
      { id: 'node_npm', title: 'Setting up a project (in the terminal)', expl: [
        { f: 'mkdir', t: 'Creates a new folder for the project.' },
        { f: 'cd my-server', t: 'Moves into the folder.' },
        { f: 'npm init -y', t: 'Creates a package.json with default settings.' },
        { f: 'npm install ws', t: 'Installs the ws package and records it as a dependency.' },
        { f: 'node server.js', t: 'Runs the server file (once you have written it).' }
      ] },
      { id: 'node_http', title: 'A basic HTTP server', expl: [
        { f: "require('http')", t: 'Imports the built-in http module. No installation needed.' },
        { f: 'http.createServer', t: 'Creates the server. The function inside runs for every request: req is the request, res is the response.' },
        { f: 'if (req.url', t: 'Checks which path was requested.' },
        { f: 'res.writeHead(200', n: 2, t: 'Sends status 200 (success) with a JSON content type, then ends the response with JSON text.' },
        { f: '} else', n: 3, t: 'Any other path gets 404 (not found).' },
        { f: 'server.listen', n: 3, t: 'Starts listening on port 3000 and prints a message when ready.' }
      ] },
      { id: 'node_ws', title: 'A WebSocket server with the ws package', expl: [
        { f: "require('ws')", t: 'Imports the WebSocketServer class from the package we installed.' },
        { f: 'new WebSocketServer', t: 'Creates a server listening on port 8080.' },
        { f: "wss.on('connection'", t: 'Runs whenever a new player connects; socket represents that player\'s connection.' },
        { f: "socket.on('message'", t: 'Runs when this player sends a message. raw may be a Buffer.' },
        { f: 'try {', n: 6, t: 'Converts the message to an object. If it is not valid JSON we reply with an error and the server does not crash.' },
        { f: "type: 'echo'", t: 'Replies to the player with what we received (an echo).' },
        { f: "socket.on('close'", t: 'Runs when the player leaves.' }
      ] }
    ],
    lab: { kind: 'sim', text: 'This is a server simulation written in JavaScript inside the page, not real Node.js; its purpose is to show the steps of handling a request. To try the real thing use the Workshop.', tasks: ['Choose GET /health and send.', 'Choose POST /join and send a valid body.', 'Break the JSON (delete a brace) and watch the 400 error.', 'Send an empty name and watch the validation.'] },
    mistakes: [
      { t: 'Forgetting to install the package', bad: `Error: Cannot find module 'ws'`, good: `npm install ws`, d: 'External packages must be installed before use.' },
      { t: 'Unprotected JSON.parse', bad: `const d = JSON.parse(raw);`, good: `try { d = JSON.parse(raw); } catch (e) { /* reply with an error */ }`, d: 'One bad message can bring the server down.' },
      { t: 'Port already in use', bad: `Error: listen EADDRINUSE :::8080`, good: `// close the other program or change the port`, d: 'Two programs cannot listen on the same port.' },
      { t: 'Forgetting toString()', bad: `JSON.parse(raw)`, good: `JSON.parse(raw.toString())`, d: 'In ws the incoming message may be a Buffer, not text.' }
    ],
    quiz: [
      { q: 'What is Node.js?', opts: ['A new programming language', 'A runtime for JavaScript outside the browser', 'A game engine'], a: 1, ex: ['No, the language is JavaScript.', 'Correct: it runs JavaScript on your computer or a server.', 'A game engine is something like Unity.'] },
      { q: 'What does npm do?', opts: ['Runs the server', 'Installs and manages packages and libraries', 'Converts C# to JavaScript'], a: 1, ex: ['Running is done with the node command.', 'Correct.', 'It does not do that.'] },
      { q: 'Why put JSON.parse inside try/catch on the server?', opts: ['Because the message may be invalid text and we must not crash', 'Because JSON.parse is very slow', 'Because the language requires it'], a: 0, ex: ['Correct: any client can send anything.', 'It is not slow.', 'The language does not require it; it is a safety practice.'] }
    ],
    summary: ['Node.js runs JavaScript outside the browser and suits building servers.', 'A server listens on a port and runs your code for every request or message.', 'npm installs packages such as ws to add WebSocket.', 'Always validate JSON coming from clients.']
  },

  unity: {
    title: 'Unity — Connecting Games to Servers',
    short: 'The game engine that draws the world and talks to servers through C#.',
    intro: 'Unity is a program for making games: it draws the world, moves characters and reads the player\'s input. But it knows nothing about other players unless it talks to a server.',
    analogy: { t: 'A stage and a director', p: 'Unity is the stage: the set, the lights, the actors and the show the audience sees. But if actors in two different theaters must perform the same scene, we need a director who is connected to everyone and says: "actor A moves now". That director is the server.' },
    tech: {
      what: 'Unity is a game engine: an environment with graphics, physics, audio and input systems and a visual editor. You write game logic in C# scripts attached to objects in the scene.',
      why: 'Building an engine from scratch takes years. Unity provides the basics so you can focus on your game.',
      how: 'Every frame, Unity calls the Update() method in your scripts. There you read player input and move objects. When you need to talk to the outside you use network libraries: UnityWebRequest for HTTP and a WebSocket library for a persistent connection.',
      when: 'Any game that needs several players, shared data, cloud saves or a leaderboard needs Unity to talk to a server.',
      rel: 'Unity is the client in our project. It converts game state (like position) to JSON, sends it over WebSocket to Node.js, and receives other players\' updates to apply to its world.'
    },
    extras: [
      { h: 'Game engine vs backend server', list: ['Game engine (Unity): draws, runs physics and reads input on the player\'s device', 'Backend server (Node.js): connects players, keeps shared state and validates rules', 'Each has a different role and neither replaces the other'] },
      { h: 'C# scripts', p: 'A script is a C# file that inherits from MonoBehaviour and is attached to an object in the scene. It contains special methods Unity calls, such as Start() (once at the beginning) and Update() (every frame).' },
      { h: 'JSON in Unity', p: 'JsonUtility is a built-in tool that converts C# objects to JSON and back. It needs classes marked [System.Serializable] with public fields. It does not support Dictionary or a top-level array; for complex cases use a library such as Newtonsoft.Json.' },
      { h: 'Connecting to WebSocket from Unity', p: 'On desktop and mobile you can use .NET\'s ClientWebSocket, but it does not work in WebGL builds because the browser owns its own API. So a third-party library such as NativeWebSocket, which supports all platforms, is commonly used. Our example uses it; see its documentation for installation. (This code was not tested inside Unity.)' },
      { h: 'Game state synchronization', p: 'We do not send everything every frame. We send only important changes at a limited rate (for example 10 times per second). On receiving, we move the remote object smoothly toward the new position (interpolation) so it does not look jerky.' }
    ],
    diagramNote: 'The journey of data inside Unity: from the object in the scene, to JSON text, to the connection library.',
    codes: [
      { id: 'unity_json', title: 'Converting a C# object to JSON and back', expl: [
        { f: '[System.Serializable]', t: 'An attribute telling Unity this class can be converted to text. Without it JsonUtility ignores it.' },
        { f: 'public string name', n: 3, t: 'Public fields become JSON keys. Vector2 becomes {"x":..,"y":..}.' },
        { f: 'JsonUtility.ToJson', t: 'Turns the object into JSON text (serializing).' },
        { f: 'JsonUtility.FromJson', t: 'Turns text into an object of the type given between <>.' }
      ] },
      { id: 'unity_http', title: 'An HTTP request with UnityWebRequest', expl: [
        { f: 'IEnumerator Start', t: 'We make Start a coroutine so we can wait for the network without freezing the game.' },
        { f: 'UnityWebRequest.Get', t: 'Creates a GET request to the Node.js server.' },
        { f: 'yield return', t: 'Waits for the request to finish while frames keep rendering.' },
        { f: 'if (req.result', n: 4, t: 'On Success we read the text the server sent; otherwise we log the error.' }
      ] },
      { id: 'unity_ws', title: 'Connecting to a WebSocket server and sending movement', expl: [
        { f: 'class MoveMessage', n: 6, t: 'A class representing the move message. The type field tells the server what kind of message it is.' },
        { f: 'new WebSocket', t: 'Creates the connection to the server address.' },
        { f: 'ws.OnOpen', n: 3, t: 'Registers what happens on open, error and close.' },
        { f: 'ws.OnMessage', n: 5, t: 'When a message arrives we convert the bytes to JSON text.' },
        { f: 'await ws.Connect', t: 'Starts the connection.' },
        { f: '#if', n: 3, t: 'Delivers incoming messages on the main thread (required outside WebGL).' },
        { f: 'timer += ', t: 'A timer that counts time since the last send.' },
        { f: 'ws.State ==', t: 'Send every 0.1 seconds and only if the connection is open.' },
        { f: 'ws.SendText', t: 'Converts the position to JSON and sends it.' },
        { f: 'OnApplicationQuit', n: 4, t: 'Closes the connection politely when the game quits.' }
      ] },
      { id: 'unity_recv', title: 'Receiving another player\'s movement', expl: [
        { f: 'MessageHeader', t: 'A tiny class we use to read only type, so we know what kind of message it is.' },
        { f: 'class PlayerMoved', n: 6, t: 'The specific message class: the player id and position. Extra JSON fields are ignored by JsonUtility.' },
        { f: 'FromJson<MessageHeader>', t: 'Step one: read the type.' },
        { f: 'header.type ==', t: 'Depending on the type, choose the right class.' },
        { f: 'remotePlayer', t: 'Moves the remote player object (remotePlayer is a reference you set in the editor) to the new position.' }
      ] }
    ],
    lab: { kind: 'sim', text: 'A simple simulation: two players and a network between them, with adjustable latency. There is no Unity game and no real network; the goal is to understand turning movement into a JSON message and applying it on the other player\'s side.', tasks: ['Move Player 1 with the buttons or arrow keys.', 'Watch the JSON that gets sent.', 'Raise the latency and watch Player 2 lag.', 'Notice Player 2 only moves after the message arrives.'] },
    mistakes: [
      { t: 'Sending the position every frame', bad: `void Update() { ws.SendText(json); }`, good: `// send 10 times per second or only on change`, d: 'Dozens of messages per second per player overload the network and the server.' },
      { t: 'A class without Serializable', bad: `public class PlayerData { ... }`, good: `[System.Serializable]\npublic class PlayerData { ... }`, d: 'JsonUtility does not recognize unmarked classes.' },
      { t: 'Private fields', bad: `private int level;`, good: `public int level;`, d: 'JsonUtility reads public fields (or ones marked SerializeField).' },
      { t: 'Forgetting DispatchMessageQueue', bad: `// OnMessage never runs`, good: `ws.DispatchMessageQueue();  // inside Update`, d: 'In NativeWebSocket outside WebGL you must call it in Update.' }
    ],
    quiz: [
      { q: 'What is the difference between Unity and Node.js in our game?', opts: ['Unity draws the game at the player, Node.js connects players and validates', 'Unity is the server and Node.js is the client', 'There is no difference'], a: 0, ex: ['Correct.', 'It is the other way around.', 'They have completely different roles.'] },
      { q: 'What does JsonUtility require of a class?', opts: ['[System.Serializable] and public fields', 'Dictionaries inside it', 'To be static'], a: 0, ex: ['Correct.', 'Dictionaries are not supported.', 'static is irrelevant.'] },
      { q: 'Why do we not send the position every frame?', opts: ['Unity forbids it', 'It floods the network and server with useless messages', 'JSON cannot hold decimals'], a: 1, ex: ['Unity does not forbid it.', 'Correct.', 'JSON can hold decimals.'] }
    ],
    summary: ['Unity is a game engine running at the player; it is the client in the connection.', 'C# scripts read input, move objects and talk to the network.', 'JsonUtility converts objects to JSON and back, with its conditions.', 'We send at a limited rate and apply incoming updates smoothly.']
  },

  architecture: {
    title: 'The Complete Architecture: Unity + Node.js + WebSocket + JSON',
    short: 'How the four technologies work together in a multiplayer game.',
    intro: 'Now we put everything together. We will follow the journey of one movement: a player moves a character in Unity and another player sees it on their device within a fraction of a second.',
    analogy: { t: 'Chess over the phone with a referee', p: 'Two players play chess, each in a different country, with a referee in between. A player tells the referee: "I moved the knight here". The referee checks the move is legal and then tells the other player. The phone is WebSocket, the agreed language is JSON, the players are Unity, and the referee is Node.js.' },
    tech: {
      what: 'The architecture is a client–server model: several Unity clients connect to one Node.js server. Each technology has a different role: Unity is the game engine, Node.js is the server runtime, WebSocket is the transport protocol and JSON is the data format.',
      why: 'Players do not connect directly to each other because that is hard and makes cheating easy. A central server provides one shared truth and protects the game.',
      how: 'Each player opens a WebSocket connection to the server. When something happens they send a small JSON message. The server validates it, updates the state and then broadcasts a message to the other players in the same room.',
      when: 'Competitive and cooperative games, shared worlds, any app needing shared state between several users.',
      rel: 'This lesson combines the previous ones: JSON (the shape) + WebSocket (the road) + Node.js (the server) + Unity (the client).'
    },
    extras: [
      { h: 'Separating the four layers', list: ['Client: Unity — draws and captures input', 'Server: Node.js — receives, validates and distributes', 'Transport protocol: WebSocket — carries the messages', 'Data format: JSON — the shape of the message content'] },
      { h: 'The movement, step by step', list: ['Player 1 moves the character', 'Unity converts the position to JSON', 'WebSocket carries the text to Node.js', 'Node.js receives the message and validates it', 'The server updates state and picks recipients', 'WebSocket carries the event to Player 2', 'Unity on Player 2 reads the JSON', 'Unity moves the character in Player 2\'s world'] },
      { h: 'Rooms and connections', p: 'Each player has one connection (socket) to the server. We group the players of a match into a "room": a data structure on the server linking a room id to its list of players. When broadcasting we send only to those in the same room, and when a connection closes we remove the player and tell the others.' },
      { h: 'Basic security considerations', list: ['Always validate incoming JSON (type, numbers, lengths)', 'Limit message size and rate to protect the server from flooding', 'Use wss:// in production', 'Never put secrets inside a Unity game; they can be extracted', 'Authentication is done on the server'] },
      { h: 'Why not trust the client?', p: 'Everything running on the player\'s device can be modified: a cheater can change the code or intercept messages and send an impossible position or a forged result. So the client sends its "intent" (I want to move) and the server decides the important result (is the move allowed? who won?). This is called an authoritative server.' }
    ],
    diagramNote: 'Click any technology to see its role and how it connects to the others.',
    codes: [
      { id: 'arch_msgs', title: 'The messages exchanged (one per line)', expl: [
        { f: '"join"', t: 'The player asks to join a room.' },
        { f: '"move"', t: 'The player sends a new position. This is an intent, not a final result.' },
        { f: '"playerMoved"', t: 'The server tells the other players a player\'s position (with its id).' },
        { f: '"correct"', t: 'The server rejects an illegal move and puts the player back at the right position.' }
      ] },
      { id: 'unity_recv', title: 'Unity side: reading server messages', expl: [
        { f: 'MessageHeader', t: 'We read the type first.' },
        { f: 'class PlayerMoved', n: 6, t: 'The class for another player\'s movement message.' },
        { f: 'header.type ==', t: 'Choose the handling by type.' },
        { f: 'remotePlayer', t: 'Move the remote player in our world.' }
      ] },
      { id: 'arch_server', title: 'Node.js side: rooms, validation and broadcast (almost the whole server)', real: true, expl: [
        { f: 'const rooms', n: 2, t: 'rooms holds the rooms and their players. MAX_STEP is a limit the server sets, not the client.' },
        { f: 'function send', n: 3, t: 'A safe send: checks the connection is open (1 = OPEN) and converts the object to JSON.' },
        { f: 'function broadcast', n: 5, t: 'Sends to every player in the room except the sender (except).' },
        { f: "wss.on('connection'", n: 3, t: 'For every new connection we create a player id and room variables.' },
        { f: 'try { msg', n: 2, t: 'Parses JSON safely.' },
        { f: "msg.type === 'join'", n: 8, t: 'Join: create the room if missing, add the player and send a welcome. We cut the room name length to protect ourselves.' },
        { f: "msg.type === 'move'", n: 3, t: 'Move: accepted only from a player who joined a room.' },
        { f: 'Number.isFinite', t: 'Checks x and y are real numbers, not text or NaN.' },
        { f: 'Math.hypot', n: 6, t: 'Computes the distance between the position the server stores and the requested one. If it exceeds the limit we reject and send correct; otherwise we update the state.' },
        { f: "broadcast(room, { type: 'playerMoved'", t: 'Broadcasts the approved position to the others only.' },
        { f: "socket.on('close'", n: 6, t: 'On leave we remove the player, tell the others and clean the room if it is empty.' }
      ] }
    ],
    lab: { kind: 'sim', text: 'The simulation runs the eight steps inside the page; there is no Unity, Node.js or network here, but the validation logic (accept/reject) is the same used by the real server above. To run the real server go to the Workshop.', tasks: ['Press "Run all steps".', 'Try "Next step" to follow each stage.', 'Enable "Player 1 cheats" and watch the server reject.', 'Notice Player 2 is not affected by the rejected move.'] },
    mistakes: [
      { t: 'Trusting a result sent by the client', bad: `{"type":"win","score":99999}`, good: `{"type":"action","id":"attack"}  // the server computes the result`, d: 'The client says what it did; the server decides what happened.' },
      { t: 'Not validating numbers', bad: `me.x = msg.x;`, good: `const x = Number(msg.x); if (!Number.isFinite(x)) return;`, d: 'Strings, NaN or huge values may arrive.' },
      { t: 'Broadcasting to everyone including the sender', bad: `broadcast(room, msg)`, good: `broadcast(room, msg, socket)`, d: 'The sender already knows its own move; echoing can cause rubber-banding.' },
      { t: 'Not cleaning up on close', bad: `// no close handler`, good: `room.delete(playerId); broadcast(room, { type: 'playerLeft', id: playerId });`, d: 'Otherwise ghost players stay in the world.' }
    ],
    quiz: [
      { q: 'Which statement is correct?', opts: ['WebSocket is a data format and JSON is a protocol', 'WebSocket is a transport protocol and JSON is a data format', 'Node.js is the game engine'], a: 1, ex: ['It is the other way around.', 'Correct.', 'The game engine is Unity.'] },
      { q: 'Why does the server validate a move instead of accepting it as is?', opts: ['Because the client may be modified or cheating', 'Because JSON cannot hold numbers', 'Because WebSocket forbids fast moves'], a: 0, ex: ['Correct: we never trust what runs on the player\'s device.', 'JSON holds numbers.', 'WebSocket has nothing to do with move speed.'] },
      { q: 'What are rooms for?', opts: ['Encrypting messages', 'Limiting broadcasts to players in the same match', 'Making Unity faster'], a: 1, ex: ['Encryption is done with wss://.', 'Correct.', 'They do not affect Unity performance.'] }
    ],
    summary: ['Unity is the client, Node.js the server, WebSocket the transport protocol, JSON the data format.', 'The journey: move, JSON, WebSocket, server validation, broadcast, update on the other player.', 'Rooms decide who receives events.', 'Never trust the client: the server decides important results.']
  }
};
