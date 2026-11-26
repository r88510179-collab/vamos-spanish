# ¡Vamos! Aventuras — asset manifest & artwork review

## 1. What ships publicly (in this repo)

| Path | Source | Count | Used for |
|---|---|---|---|
| `adventure/art.js` | Original (code-drawn SVG) | 6 characters × 3 poses × 6 moods; 8 buildings; world backdrop; 5 activity icons; emotion faces | Built-in cast, map, places, celebrations |
| `adventure/art-items.js` | Original (code-drawn SVG) | 82 items | Food, toys, animals, vehicles, family, hiding spots, misc |
| `adventure/assets/bg/*.svg` | ¡Vamos! artwork pack | 9 (1280×720) | Place backgrounds: backyard→La Casa, park, kitchen, soccer→El Campo, garage, school, garden, playroom→Sala. `neighborhood.svg` is kept but unused. |
| `adventure/assets/obj/*.svg` | ¡Vamos! artwork pack (minus `dog.svg`) | 42 (128×128) | Balloons (6 colors), colored shapes, xylophone, soccer ball. Other pack objects are kept as alternates. |
| `adventure/assets/icons/*.svg` | ¡Vamos! artwork pack | 11 | `audio`, `back` and `play` (white glyphs on colored buttons) |
| `adventure/assets/rewards/*.svg` | ¡Vamos! artwork pack (non-character) | 8 | Sticker-book rewards |
| `adventure/assets/cast/*.svg` | ¡Vamos! artwork pack | 6 dogs × 6 poses + 6 stickers | **Default cast, Los Perritos** (Luna, Sol, Tomás, Mara, Nube, Pipo) |
| `adventure/assets/brand/*.svg` | ¡Vamos! artwork pack | splash, app icon | Loading screen (splash) |

**Lookup order** (`ADV.pic(id)`): item library → pack object → built-in icon → emoji fallback. Each category comes from one library, so a game never mixes two drawing styles. If an image fails to load, play continues; the test suite checks this.

## 2. What stays on the device (never committed)

- The Bluey-themed `scenes/*.png` and any other Bluey pictures. Import them on the tablet; they become place backgrounds (see `docs/ADVENTURES.md` §5).
- `references/*.png`: flattened UI mock-ups, used as layout guidance for this build. They are not working UI, so they are not imported.
- `animation/` strips are not used (CSS motion replaces them).

### Private slot specification

Use these specs if you supply your own artwork by hand. Parent page → Private characters → *Choose image*.

| Slot | Format | Size | Notes |
|---|---|---|---|
| Character, idle (per role) | PNG/WebP with transparent background, or SVG | ≥ 512 px tall; stored shrunk to ≤ 768 px | Full body, feet at the bottom edge, facing the viewer. Used on the map, places, top-bar avatar and sticker book. |
| Character, cheer (per role) | same | same | Arms up / celebrating. Used for celebrations and star pop-ups. Falls back to idle. |
| Character, speak / wave / think / point | same | same | Read from a zip pack only, if present. |
| Story picture (per place) | PNG/JPG/WebP | any; stored ≤ 1400 px WebP | Decoration on the place screen. Never used as a game layer. |
| Splash | SVG/PNG | 1280×720 | Loading screen, from the zip pack's `branding/splash.svg`. |

Zip pack format: the ¡Vamos! artwork-pack layout. That is `manifest.json` with `characters{id:{role,poses}}` and `assets[{path,kind}]`, plus `characters/<id>-<pose>.svg`, `rewards/<id>.svg`, `scenes/*.png` and `branding/splash.svg`.

## 3. Artwork review — what needs improving for "premium" quality

| Asset | Verdict | Why / what to do |
|---|---|---|
| Pack characters (6 dogs) | **Replace or redraw** before relying on them | All six share one body template with a color swap, so the silhouettes are identical. The poses barely differ: *idle, point, think, speak* are near-duplicates, and only *celebrate* reads clearly. There are no emotions (sad/angry/surprised/sleepy), so the feelings game uses separate faces. Each character needs its own silhouette (ears, tail, accessories), a clear arm pose for wave/point, and an emotion set. |
| Pack animation strips | **Not used** | 4-frame strips that are mostly the same frame. CSS idle bob, wave and cheer motion is smoother and lighter. |
| Pack interiors (kitchen, school, garage, playroom) | **Improve** | Usable but sparse. The kitchen is a window, fridge and counter; the school is a chalkboard; the garage is a door. They need 3–5 props each (stove, bookshelf, tool wall, toy shelf) and soft lighting so they read as rooms. |
| Pack outdoor backgrounds | **Good** | Clean and consistent. `neighborhood.svg` has buildings baked in, which would compete with the tappable map, so the map uses the code-drawn backdrop instead. |
| Pack objects | **Good**, simpler than the item library | Flat and consistent. For fruit, animals and the car, the item library is more detailed, so it wins. The pack's balloons, shapes and xylophone are used as they are. |
| Pack icons `audio/back/play` | **Good** | White glyphs, correct for colored buttons. Not broken, even though they look blank on white. |
| Built-in cast (`art.js`) | **Good fallback**, could be richer | Distinct species and silhouettes, 3 poses, 6 moods, idle animation. A professional pass could add hand poses (point, hold an item) and a talking mouth cycle. |
| Item library (`art-items.js`) | **Good** | 82 items, all recognizable at 96 px. The horse and foot are the plainest; the cow has a stray shoulder spot. |
| Activity pictures inside *existing* games | **Still emoji** | The classic games (¡Tocá!, Memoria, Ordenar, Lección and others) draw their vocabulary as system emoji. They now sit inside the themed screens, but replacing them means changing the 114-word `TOYS` list in `index.html` to use `ADV.pic()`. That was left for a later pass so those working games stay as they are. |
| Fonts | **Improve for offline** | Baloo 2 loads from Google Fonts. Self-hosting a WOFF2 (OFL licence) would keep the rounded look offline. |

## 4. Prompts for further ORIGINAL artwork

These are for an image generator. All of them describe original designs that resemble no existing show.

Shared style suffix: *"flat vector children's illustration, thick rounded dark slate outlines (#304B5C), soft pastel palette, simple shapes, no text, no logos, transparent background, centered, 1024×1024"*

- **Cast turnaround (per role):** "An original cartoon [puppy with floppy ears and a red bandana | lavender bunny with a yellow bow | friendly brown bear in a blue cap and overalls | white duck in a mint apron with a pink flower | peach striped cat in a red beret | scarlet macaw with yellow and blue wings], full body, six poses in a row: standing, waving, pointing, talking, thinking, cheering with both arms up" + style suffix
- **Emotion sheet (per role):** "The same character, head and shoulders, five expressions: happy, sad with one tear, angry with furrowed brows, surprised with an O mouth, sleepy with closed eyes" + style suffix
- **Kitchen interior (1600×900, no transparency):** "A cozy empty home kitchen seen from the front, window with plants, stove with a pot, fridge with drawings, wooden counter across the lower third left empty for game pieces, warm morning light, no characters" + style suffix
- **School interior:** "An empty preschool classroom, green chalkboard with no writing, small bookshelf, alphabet-free colorful posters, rug, low tables pushed aside, no characters" + style suffix
- **Garage interior:** "An empty tidy home garage, pegboard with tools, toy shelf, open roll-up door showing a sunny street, no characters, no vehicles" + style suffix
- **Playroom interior:** "An empty playroom, toy shelf with blocks and a drum, rug, bunting, window, no characters" + style suffix
