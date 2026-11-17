window.LP = window.LP || {};
LP.CODE = {
  json_profile: { lang: 'json', side: 'data', code: String.raw`{
  "name": "Sara",
  "level": 12,
  "isOnline": true,
  "score": 1850.5,
  "guild": null,
  "inventory": ["sword", "shield"],
  "position": { "x": 3, "y": 7 }
}` },

  json_js: { lang: 'js', side: 'both', code: String.raw`const text = '{"name":"Sara","level":12}';   // JSON is just text
const player = JSON.parse(text);              // text -> JavaScript object
player.level = player.level + 1;              // use it like a normal object
const out = JSON.stringify(player);           // object -> text again
console.log(out);                             // {"name":"Sara","level":13}` },

  ws_handshake: { lang: 'http', side: 'data', code: String.raw`GET /game HTTP/1.1
Host: localhost:8080
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=` },

  ws_client: { lang: 'js', side: 'client', code: String.raw`const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
  console.log('connected');
  socket.send(JSON.stringify({ type: 'hello', name: 'Sara' }));
});

socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  console.log('server says:', msg);
});

socket.addEventListener('error', () => console.log('something went wrong'));
socket.addEventListener('close', (event) => console.log('closed, code', event.code));` },

  node_npm: { lang: 'sh', side: 'terminal', code: String.raw`mkdir my-server
cd my-server
npm init -y
npm install ws
node server.js` },

  node_http: { lang: 'js', side: 'server', code: String.raw`const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found' }));
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});` },

  node_ws: { lang: 'js', side: 'server', code: String.raw`const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  console.log('a client connected');

  socket.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      socket.send(JSON.stringify({ type: 'error', reason: 'bad_json' }));
      return;
    }
    socket.send(JSON.stringify({ type: 'echo', received: data }));
  });

  socket.on('close', () => console.log('client left'));
});` },

  unity_json: { lang: 'cs', side: 'client', code: String.raw`using UnityEngine;

[System.Serializable]
public class PlayerData
{
    public string name;
    public int level;
    public Vector2 position;
}

public class JsonDemo : MonoBehaviour
{
    void Start()
    {
        var p = new PlayerData { name = "Sara", level = 12, position = new Vector2(3, 7) };

        string json = JsonUtility.ToJson(p);          // object -> JSON text
        Debug.Log(json);

        PlayerData copy = JsonUtility.FromJson<PlayerData>(json);   // JSON text -> object
        Debug.Log(copy.name);
    }
}` },

  unity_http: { lang: 'cs', side: 'client', code: String.raw`using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class HealthCheck : MonoBehaviour
{
    IEnumerator Start()
    {
        using (UnityWebRequest req = UnityWebRequest.Get("http://localhost:3000/health"))
        {
            yield return req.SendWebRequest();

            if (req.result == UnityWebRequest.Result.Success)
                Debug.Log("Server replied: " + req.downloadHandler.text);
            else
                Debug.LogError("Request failed: " + req.error);
        }
    }
}` },

  unity_ws: { lang: 'cs', side: 'client', code: String.raw`using UnityEngine;
using NativeWebSocket;   // third-party library (see lesson note)

[System.Serializable]
public class MoveMessage
{
    public string type = "move";
    public float x;
    public float y;
}

public class NetworkClient : MonoBehaviour
{
    WebSocket ws;
    float timer;

    async void Start()
    {
        ws = new WebSocket("ws://localhost:8080");

        ws.OnOpen += () => Debug.Log("Connected");
        ws.OnError += (e) => Debug.Log("Error: " + e);
        ws.OnClose += (code) => Debug.Log("Closed: " + code);
        ws.OnMessage += (bytes) =>
        {
            string json = System.Text.Encoding.UTF8.GetString(bytes);
            Debug.Log("Received: " + json);
        };

        await ws.Connect();
    }

    void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        ws?.DispatchMessageQueue();
#endif
        timer += Time.deltaTime;
        if (timer >= 0.1f && ws != null && ws.State == WebSocketState.Open)
        {
            timer = 0f;
            var msg = new MoveMessage { x = transform.position.x, y = transform.position.y };
            ws.SendText(JsonUtility.ToJson(msg));
        }
    }

    async void OnApplicationQuit()
    {
        if (ws != null) await ws.Close();
    }
}` },

  unity_recv: { lang: 'cs', side: 'client', code: String.raw`[System.Serializable]
public class MessageHeader { public string type; }

[System.Serializable]
public class PlayerMoved
{
    public string type;
    public string id;
    public float x;
    public float y;
}

void HandleMessage(string json)
{
    MessageHeader header = JsonUtility.FromJson<MessageHeader>(json);

    if (header.type == "playerMoved")
    {
        PlayerMoved m = JsonUtility.FromJson<PlayerMoved>(json);
        remotePlayer.transform.position = new Vector3(m.x, m.y, 0f);
    }
}` },

  arch_msgs: { lang: 'json', side: 'data', code: String.raw`{"type":"join","room":"lobby"}
{"type":"move","x":4,"y":2}
{"type":"playerMoved","id":"a1b2c3","x":4,"y":2}
{"type":"correct","x":3,"y":2}` }
};

// The real multiplayer server. The Workshop generator fills in PORT and MAX_STEP.
LP.serverTemplate = function (port, maxStep) {
  return String.raw`// server.js - real multiplayer server (Node.js + ws)
// Run:  npm install   then   node server.js
const { WebSocketServer } = require('ws');
const PORT = __PORT__;
const wss = new WebSocketServer({ port: PORT });

const rooms = new Map();   // roomId -> Map(playerId -> { socket, x, y })
const MAX_STEP = __STEP__;        // the SERVER decides how far a player may move per message

function send(socket, obj) {
  if (socket.readyState === 1) socket.send(JSON.stringify(obj));
}

function broadcast(room, obj, except) {
  for (const p of room.values()) {
    if (p.socket !== except) send(p.socket, obj);
  }
}

wss.on('connection', (socket) => {
  const playerId = Math.random().toString(36).slice(2, 8);
  let room = null, roomId = null;

  socket.on('message', (raw) => {
    if (raw.length > 1024) return;   // ignore oversized messages
    let msg;
    try { msg = JSON.parse(raw.toString()); }
    catch (e) { return send(socket, { type: 'error', reason: 'bad_json' }); }

    if (msg.type === 'join') {
      roomId = String(msg.room || 'lobby').slice(0, 20);
      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      room = rooms.get(roomId);
      room.set(playerId, { socket, x: 0, y: 0 });
      const others = [];
      for (const [id, p] of room) if (id !== playerId) others.push({ id, x: p.x, y: p.y });
      send(socket, { type: 'welcome', id: playerId, x: 0, y: 0, players: others });
      broadcast(room, { type: 'playerMoved', id: playerId, x: 0, y: 0 }, socket);
      return;
    }

    if (msg.type === 'move' && room) {
      const me = room.get(playerId);
      const x = Number(msg.x), y = Number(msg.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const dist = Math.hypot(x - me.x, y - me.y);
      if (dist > MAX_STEP) {
        send(socket, { type: 'correct', x: me.x, y: me.y });
        return;
      }
      me.x = x; me.y = y;
      broadcast(room, { type: 'playerMoved', id: playerId, x, y }, socket);
    }
  });

  socket.on('close', () => {
    if (!room) return;
    room.delete(playerId);
    broadcast(room, { type: 'playerLeft', id: playerId });
    if (room.size === 0) rooms.delete(roomId);
  });
});

console.log('WebSocket server listening on ws://localhost:' + PORT);
`.replace('__PORT__', String(port)).replace('__STEP__', String(maxStep));
};

LP.packageJson = function () {
  return JSON.stringify({
    name: 'my-multiplayer-server',
    version: '1.0.0',
    description: 'Simple Node.js + ws multiplayer server',
    main: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies: { ws: '^8.0.0' }
  }, null, 2) + '\n';
};

// Unity scripts for the Workshop. __URL__ is replaced by the generator.
LP.unityNetworkClient = function (url) {
  return String.raw`using System.Collections.Generic;
using UnityEngine;
using NativeWebSocket;   // https://github.com/endel/NativeWebSocket (install via Package Manager)

[System.Serializable] public class JoinMessage { public string type = "join"; public string room = "lobby"; }
[System.Serializable] public class MoveMessage { public string type = "move"; public float x; public float y; }
[System.Serializable] public class MessageHeader { public string type; }
[System.Serializable] public class PlayerMoved { public string type; public string id; public float x; public float y; }
[System.Serializable] public class PlayerLeft { public string type; public string id; }
[System.Serializable] public class Correct { public string type; public float x; public float y; }

// Attach to the LOCAL player. Assign a prefab for remote players in the Inspector.
public class NetworkClient : MonoBehaviour
{
    public string serverUrl = "__URL__";
    public GameObject remotePlayerPrefab;
    public float speed = 3f;

    WebSocket ws;
    float timer;
    readonly Dictionary<string, GameObject> remotes = new Dictionary<string, GameObject>();

    async void Start()
    {
        ws = new WebSocket(serverUrl);
        ws.OnOpen += () => ws.SendText(JsonUtility.ToJson(new JoinMessage()));
        ws.OnError += (e) => Debug.LogWarning("WS error: " + e);
        ws.OnClose += (c) => Debug.Log("WS closed: " + c);
        ws.OnMessage += (bytes) => Handle(System.Text.Encoding.UTF8.GetString(bytes));
        await ws.Connect();
    }

    void Handle(string json)
    {
        var header = JsonUtility.FromJson<MessageHeader>(json);
        switch (header.type)
        {
            case "playerMoved":
                var m = JsonUtility.FromJson<PlayerMoved>(json);
                if (!remotes.ContainsKey(m.id))
                    remotes[m.id] = Instantiate(remotePlayerPrefab);
                remotes[m.id].transform.position = new Vector3(m.x, m.y, 0f);
                break;
            case "playerLeft":
                var l = JsonUtility.FromJson<PlayerLeft>(json);
                if (remotes.TryGetValue(l.id, out var go)) { Destroy(go); remotes.Remove(l.id); }
                break;
            case "welcome":   // the server tells us where we start
                var w = JsonUtility.FromJson<Correct>(json);
                transform.position = new Vector3(w.x, w.y, 0f);
                break;
            case "correct":   // the server rejected our position: snap back
                var c = JsonUtility.FromJson<Correct>(json);
                transform.position = new Vector3(c.x, c.y, 0f);
                break;
        }
    }

    void Update()
    {
#if !UNITY_WEBGL || UNITY_EDITOR
        ws?.DispatchMessageQueue();
#endif
        var dir = new Vector3(Input.GetAxisRaw("Horizontal"), Input.GetAxisRaw("Vertical"), 0f);
        transform.position += dir.normalized * speed * Time.deltaTime;

        timer += Time.deltaTime;
        if (timer >= 0.1f && ws != null && ws.State == WebSocketState.Open && dir != Vector3.zero)
        {
            timer = 0f;
            ws.SendText(JsonUtility.ToJson(new MoveMessage { x = transform.position.x, y = transform.position.y }));
        }
    }

    async void OnApplicationQuit() { if (ws != null) await ws.Close(); }
}
`.replace('__URL__', url);
};

// The architecture lesson shows the same server the Workshop generates (port 8080, max step 1).
LP.CODE.arch_server = { lang: 'js', side: 'server', code: LP.serverTemplate(8080, 1).trimEnd() };
