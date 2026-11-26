# ¡Vamos! Aventuras — maintenance guide

Toddler Mode can now be shown in two themes:

| Theme | What the child sees |
|---|---|
| **¡Vamos! Aventuras** (default) | An illustrated neighborhood with 8 places. Each place has a host character and 2–5 activities. |
| **¡Vamos! Clásico** | The original big-button Toddler Mode, unchanged. |

Parents switch themes under **More → Theme & Adventures**. Switching never touches lessons, flashcards, stickers, streaks or settings.

---

## 1. How it is built

The educational games still live in `index.html`. The theme is a presentation layer in `adventure/`, which `index.html` loads after its own script:

| File | Job |
|---|---|
| `adventure/theme.js` | Theme registry, settings (`v_adv`), progress (`v_advp`), character **roles**, places, activities, picture lookup, sound effects, private-pack loader and importer |
| `adventure/art.js` | Built-in **original** cast (inline SVG), buildings, world backdrop, emotion faces, activity icons |
| `adventure/art-items.js` | 82 original item drawings: food, toys, animals, vehicles, family, hiding spots, misc |
| `adventure/world.js` | Loading screen, map, places, top bar (home / back / repeat / stars), celebrations, sticker book |
| `adventure/games.js` | The new adventures (see §3) |
| `adventure/settings.js` | Parent page (More → Theme & Adventures) |
| `adventure/adventure.css` | All styling, scoped to `html.th-adv #tmode`, so the parent app and the Classic theme are unaffected |
| `adventure/assets/` | Character-free vector art from the ¡Vamos! artwork pack: `bg/`, `obj/`, `icons/`, `rewards/` |

`index.html` contains only these one-line hooks:

- `toggleTM()` calls `ADV.onToggle(entering)`.
- `setTCat()` calls `ADV.onCat(cat)`. The world opens existing games through the app's own `setTCat`, so their logic is untouched.
- `stAward()` calls `ADV.onSticker(id)`. In Aventuras this shows a star from the host character instead of the sticker pop. The classic sticker still counts.
- `voxUtter()` sets `u.volume` from `ADV.narrationVolume()` (the narration-volume setting).
- `confetti()` returns early when reduced motion is on.
- More menu: adds the "Theme & Adventures" card and its subpage.

Speech always goes through the existing `speak()`. Every line cancels the previous one, so two voices never overlap.

### Roles, not characters

Every place, activity and line of dialogue names a **role**. A cast fills the roles.

| Role | Teaches | Built-in original character |
|---|---|---|
| `explorer` | Exploring, sports, adventure | Nico (golden puppy) |
| `colors` | Colors, shapes, matching, counting | Lula (lavender bunny) |
| `builder` | Vehicles, puzzles, pretend play | Tío Oso (bear) |
| `chef` | Food, family, feelings | Doña Pata (duck) |
| `artist` | Painting, music, creativity | Mimí (cat) |
| `animals` | Animals and nature | Coco (scarlet macaw) |

Dialogue uses `{n}` for the speaking character's name. For example, `'¡Hola! Soy {n}.'` becomes "¡Hola! Soy Lula." with the built-in cast, or the private pack's name when one is loaded.

---

## 2. The neighborhood

| Place | Host | Activities (✦ = new) |
|---|---|---|
| La Casa | explorer | ✦ Mi Familia (family + feelings), Mi Cuerpo, La Ropa, Simón Dice, Me Llamo |
| El Parque | colors | ✦ ¡Globos Arriba!, Colores, ¡A Contar!, Formas, Burbujas |
| La Cocina | chef | ✦ ¡A Cocinar!, ✦ La Pulpería, La Comida |
| El Campo | explorer | ¡Fútbol! (all 5 Soccer Shots games), Deportes |
| El Garaje | builder | ✦ ¿Qué Suena? (vehicle sounds), Vehículos |
| La Escuela | colors | Palabras de la Semana (weekly lesson), Memoria, ¡Tocá!, Ordenar |
| El Jardín | animals | ✦ ¿Quién Dice? (animal sounds), Los Animales, Naturaleza, El Clima |
| Sala de Juegos | artist | Pinta y Crea, ✦ Xilófono Mágico, ✦ Busca el Juguete, Tambores |

To change this, edit `ADV.LOCS` (places, their activities and order) and `ADV.ACTS` (title, host, picture, and which game it opens) in `theme.js`.

---

## 3. New adventures (`games.js`)

All of them use the same small kit. Prompts are spoken in Spanish with vos forms, matching the rest of the app. Every prompt has a repeat button. Wrong taps get a wiggle and a hint, never a failure screen. Nothing is timed. Taps are ignored while feedback plays.

| Game | Mechanic | Vocabulary |
|---|---|---|
| ¡Globos Arriba! | Tap the named balloon; then keep one balloon up while counting aloud. Balloons never "fall out". | Colors, numbers |
| Xilófono Mágico | Repeat a 2–4 note color sequence. The ♪ button switches to free play. | Colors, sequences |
| La Pulpería | "¿Me das dos manzanas?" Tap items into the basket while counting. | Food, numbers, un/una, plurals |
| ¡A Cocinar! | Add named ingredients (with their color), then stir three times. | Food, colors |
| Busca el Juguete | Lift the table, box, sofa or basket to find the named toy. A hint appears after two misses. | Toys; debajo de / dentro de / detrás de |
| ¿Quién Dice? | Sound → animal, and name → animal | 10 animals and their sounds |
| ¿Qué Suena? | Sound → vehicle, and name → vehicle | 8 vehicles and their sounds |
| Mi Familia | Find the family member; find who is feliz / triste / enojado / sorprendido / cansado. Feelings answers model a response ("¡Le damos un abrazo!"). | Family, feelings |

**Difficulty** (parent setting) changes only the new games:

- **Easy:** 3 choices, counting to 5.
- **Normal:** 4 choices, counting to 8, longer xylophone sequences.

To add a game:

1. Call `make('id', { start(K) {…} })` in `games.js`.
2. Add an `ADV.ACTS` entry with `kind: 'game', game: 'id'`.
3. Add that entry to a place's `acts`.
4. Set `K.answer` to the current correct choice so the automated tests can play it.

---

## 4. Rewards (optional, gentle)

- **Stars:** one per finished adventure, plus one per classic sticker milestone (e.g. 5 matches in ¡Tocá!).
- **Sticker book** (the star button): a host character joins "Mis amigos" the first time you earn a star with them. Eight reward stickers unlock at 1, 3, 5, 8, 12, 16, 20 and 25 stars.
- **Daily adventure:** one place sparkles each day, and the first star there is doubled. There are no streaks, nothing expires, and nothing is ever lost.
- **Reset:** Parent page → *Reset Adventures progress*. This clears only stars and the sticker book.

---

## 5. Private characters (keeping character art off the internet)

The repository and `vamos-spanish.vercel.app` are **public**, so **no character-based artwork is committed or deployed**. That includes the artwork pack's six dog characters, its animation strips, character stickers and splash, and the Bluey-themed scene and reference PNGs. The public build ships only the built-in original cast.

There are two ways to use your own character art privately.

### A. On the tablet (recommended)

1. Copy `vamos-adventures-artwork.zip` (or individual PNG/WebP/SVG images) to the tablet.
2. In ¡Vamos!: hold **Mantené para salir** for 3 s, then open **More → Theme & Adventures → Private characters**.
3. Tap **Import artwork pack (.zip)**, or set each role by hand with **Choose image** (plus an optional **Cheer pose**) and a name.

What import does:

- Images are shrunk and stored in this browser's IndexedDB on this device only. They are never uploaded anywhere.
- Characters are matched to roles by the `role` text in the pack's `manifest.json` (e.g. "food and family" → `chef`).
- Scene PNGs become optional **story pictures** on their matching place: keepy-uppy → El Parque, kitchen → La Cocina, xylophone → Sala de Juegos, soccer → El Campo.
- `references/` is never imported.
- **Remove private pack** deletes everything it stored.

> ⚠️ **Not verified:** whether FreeKiosk's WebView opens the system file picker. If tapping *Import* does nothing inside FreeKiosk, the file chooser isn't supported there. In that case, use option B or ask for help adding file-chooser support to the wrapper.

### B. A private build folder

Unzip the pack's `vamos-artwork/` contents into `private-pack/` next to `index.html`. The app reads `private-pack/manifest.json` automatically. `private-pack/` is in `.gitignore`, and the service worker never caches it.

Only use this with a build that is **not public**: local files packaged into the Android wrapper, or an access-controlled deployment. On such a deployment, confirm that a direct request to `https://<host>/private-pack/manifest.json` from a logged-out browser is refused. **Changing hosting, authentication or kiosk settings needs the owner's approval** (none of that was changed here).

---

## 6. Deploying and caching

The app is still a static site (no build step). After changing any `adventure/` file:

1. Bump `?v=1` → `?v=2` on all seven `adventure/` tags in `index.html`.
2. Set the same number in `AV` in `sw.js`.
3. If you replaced an image under the same file name, also bump `V` in `sw.js` (`vamos-v3` → `vamos-v4`).

`index.html` is network-first, so new version numbers reach tablets on the next online launch. The service worker precaches the adventure modules and all 70 public assets, so the neighborhood works offline after one online visit.

---

## 7. Testing

```bash
node tests/adventures.test.js                       # 164 checks, ~3 min
SHOTS=1 node tests/adventures.test.js               # + screenshots in tests/output/ (git-ignored)
PACK_ZIP=~/Downloads/vamos-adventures-artwork.zip node tests/adventures.test.js   # + private pack import
node tests/serve.js 8080                            # serve locally: http://127.0.0.1:8080
```

The suite covers:

- Classic-theme regression.
- Every place and every activity, including the repeat button.
- Every new game played to its celebration.
- Gentle wrong answers.
- Rapid tapping and speech overlap.
- Reload persistence and theme switching.
- Captions, reduced motion and activity toggles.
- Missing-art fallback.
- English learning mode and parent shortcuts.
- 375×812, 390×844, 430×932, 768×1024, 1280×800 and 1340×800 layouts (no horizontal scroll, every button ≥ 44 px).

Limits of the automated tests:

- Speech is replaced by a recorder, because headless Chromium has no voices.
- The service worker only registers on `https:`, so check offline play on a real device.
- 1340×800 is a stand-in for the onn. 11″ tablet. Its real CSS viewport has not been measured.

---

## 8. Rollback

| How fast | What to do |
|---|---|
| Instant, no deploy | Parent page → choose **¡Vamos! Clásico**. Toddler Mode is exactly as before. |
| Code | `main` is untouched at `4f2095c`. Don't merge this branch, or revert its merge commit (`git revert -m 1 <merge>`). |
| Phones/tablets after a rollback deploy | The old `sw.js` used cache `vamos-v2`. Any deploy with a new `V` clears old caches on the next launch. |

The Adventures settings and progress live in separate keys (`v_adv`, `v_advp`, IndexedDB `vamos-private-pack`). A rollback leaves them in place harmlessly, and nothing else reads them.

---

## 9. Troubleshooting

| Symptom | Fix |
|---|---|
| Still seeing the old version | Open once while online, then fully close and reopen. If needed, bump `V` in `sw.js`. |
| No voice / wrong voice | Same as before: More → Settings → Voice Check. Narration volume is on the parent page. |
| Text looks like a plain font offline | The Baloo 2 font comes from Google Fonts. Offline, it falls back to a system sans-serif. |
| A place is missing from the map | All its activities are unticked on the parent page. |
| Private characters disappeared | Clearing app/browser data or reinstalling the wrapper wipes IndexedDB. Import the pack again. |
| *Import* does nothing in the kiosk | The kiosk WebView probably blocks the file picker (see §5 A). |
| Want the old big buttons | Parent page → ¡Vamos! Clásico. |
