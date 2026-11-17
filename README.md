# Connect Academy / أكاديمية الاتصال

An interactive course: JSON, WebSocket, Node.js, Unity, and how they work together in a multiplayer game.

## Run it
Double-click `index.html`. No build step, no installation, no server needed.
(Fonts load from Google Fonts when online; otherwise system fonts are used.)

## The Workshop (real project)
Needs Node.js (LTS) on your computer and internet for `npm install`.
1. Open the Workshop lesson, download `server.js` and `package.json`.
2. In their folder: `npm install` then `node server.js`.
3. In the Workshop page press Connect (a real WebSocket). Open the page in two tabs to see two players.

## Structure
- `index.html`, `css/styles.css`
- `js/` : util (DOM helpers, highlighter), jsonparser (real validator), i18n (ar/en/fr UI),
  content-ar / content-en (lessons), code (samples + server/Unity generators),
  labs (diagrams & simulations), exercises + practice (auto-checked challenges), workshop, app (router, state, search)

## Honest limitations
- Simulations are labelled "Simulation" and use no network. Real: JSON playground, exercise checkers, Workshop client.
- French: interface fully translated; lesson text falls back to English (a notice is shown).
- The Unity C# scripts were NOT run inside Unity. NativeWebSocket is a third-party library you install yourself.
- Progress and preferences are stored in localStorage (per browser).
