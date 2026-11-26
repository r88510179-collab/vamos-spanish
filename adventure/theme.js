/* ¡Vamos! Aventuras — theme engine.
   Separates presentation (themes, characters, art, sounds) from the educational games that live in index.html.

   THEMES      'classic' = the original ¡Vamos! Toddler Mode (unchanged)
               'adventure' = the illustrated neighborhood (default)
               Future themes: add an entry to THEMES with its own cast/locations/art (see docs/ADVENTURES.md).
   ROLES       Six character roles. Every line of dialogue and every activity names a ROLE, never a character,
               so any cast (built-in original cast, or a private pack) can fill them.
   PRIVATE PACK
               User-owned character art is loaded ON THE DEVICE ONLY:
                 1. Parent Settings → "Personajes privados" → import the artwork .zip or single images
                    (stored in this browser's IndexedDB, never uploaded), or
                 2. a git-ignored /private-pack/ folder next to index.html (local or access-controlled builds).
               Nothing character-based is committed to the public repository. */
(function () {
  var ADV = window.ADV = window.ADV || {};
  ADV.VERSION = '1';
  var ASSET = '/adventure/assets/';

  /* ---------------- settings & progress (localStorage, same 'v_' prefix as the app) ---------------- */
  var DEF = { theme: 'adventure', cap: 'bili', nar: 1, sfx: 0.7, reduced: false, daily: true, diff: 'easy', off: {}, folderPack: true };
  function lsGet(k, d) { try { var v = localStorage.getItem('v_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem('v_' + k, JSON.stringify(v)); } catch (e) {} }
  ADV.set = Object.assign({}, DEF, lsGet('adv', {}));
  ADV.saveSet = function () { lsSet('adv', ADV.set); ADV.applyClasses(); };
  ADV.prog = Object.assign({ stars: 0, plays: {}, chars: {}, rw: {}, daily: {} }, lsGet('advp', {}));
  ADV.saveProg = function () { lsSet('advp', ADV.prog); };
  ADV.resetProg = function () { ADV.prog = { stars: 0, plays: {}, chars: {}, rw: {}, daily: {} }; ADV.saveProg(); };

  /* ---------------- themes ---------------- */
  ADV.THEMES = {
    classic: { id: 'classic', world: false, name: { es: '¡Vamos! Clásico', en: 'Classic ¡Vamos!' }, desc: { es: 'Los juegos de siempre, en botones grandes.', en: 'The original big-button games.' } },
    adventure: { id: 'adventure', world: true, name: { es: '¡Vamos! Aventuras', en: '¡Vamos! Adventures' }, desc: { es: 'Un vecindario ilustrado con amigos que enseñan español.', en: 'An illustrated neighborhood with friends who teach Spanish.' } }
  };
  ADV.theme = function () { return ADV.THEMES[ADV.set.theme] || ADV.THEMES.adventure; };
  ADV.isWorld = function () { return !!ADV.theme().world; };
  ADV.reduced = function () {
    if (ADV.set.reduced) return true;
    try { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  };
  ADV.applyClasses = function () {
    var h = document.documentElement;
    h.classList.toggle('th-adv', ADV.isWorld());
    h.classList.toggle('adv-reduced', ADV.reduced());
    ['es', 'bili', 'full'].forEach(function (c) { h.classList.toggle('cap-' + c, ADV.set.cap === c); });
  };

  /* ---------------- roles & the built-in ORIGINAL cast ---------------- */
  ADV.ROLES = ['explorer', 'colors', 'builder', 'chef', 'artist', 'animals'];
  ADV.ROLE_INFO = {
    explorer: { es: 'Exploración, deportes y aventura', en: 'Exploring, sports, adventure' },
    colors: { es: 'Colores, formas, parejas y contar', en: 'Colors, shapes, matching, counting' },
    builder: { es: 'Transporte, retos y juegos de imaginar', en: 'Vehicles, puzzles, pretend play' },
    chef: { es: 'Comida, familia y sentimientos', en: 'Food, family, feelings' },
    artist: { es: 'Pintura, música y creatividad', en: 'Painting, music, creativity' },
    animals: { es: 'Animales y naturaleza', en: 'Animals and nature' }
  };
  ADV.BUILTIN = {
    explorer: { art: 'nico', name: 'Nico', tint: '#F4B942' },
    colors: { art: 'lula', name: 'Lula', tint: '#CDB8F5' },
    builder: { art: 'oso', name: 'Tío Oso', tint: '#B47C51' },
    chef: { art: 'pata', name: 'Doña Pata', tint: '#8FD6B4' },
    artist: { art: 'mimi', name: 'Mimí', tint: '#FFB98A' },
    animals: { art: 'coco', name: 'Coco', tint: '#E8433A' }
  };
  /* Keyword match from an artwork manifest "role" string to a role slot. */
  var ROLE_KEYS = [
    ['animals', /animal|nature|naturaleza/i], ['artist', /art|music|paint|música|arte/i], ['chef', /food|family|comida|familia|emotion/i],
    ['builder', /transport|vehicle|sport|problem|build/i], ['colors', /color|count|shape|match/i], ['explorer', /explor|adventure|aventura/i]
  ];
  function roleFor(str, taken) {
    for (var i = 0; i < ROLE_KEYS.length; i++) if (ROLE_KEYS[i][1].test(str || '') && !taken[ROLE_KEYS[i][0]]) return ROLE_KEYS[i][0];
    for (var j = 0; j < ADV.ROLES.length; j++) if (!taken[ADV.ROLES[j]]) return ADV.ROLES[j];
    return null;
  }

  /* ---------------- the neighborhood: locations & activities ---------------- */
  // kind 'cat'  = an existing index.html game opened with setTCat(cat)
  // kind 'game' = a new adventure in games.js
  ADV.LOCS = [
    { id: 'casa', host: 'explorer', bg: 'backyard', name: { es: 'La Casa', en: 'The House' }, acts: ['familia', 'cuerpo', 'ropa', 'simon', 'yo'] },
    { id: 'parque', host: 'colors', bg: 'park', name: { es: 'El Parque', en: 'The Park' }, acts: ['globos', 'colores', 'contar', 'formas', 'burbujas'] },
    { id: 'cocina', host: 'chef', bg: 'kitchen', name: { es: 'La Cocina', en: 'The Kitchen' }, acts: ['cocinar', 'pulperia', 'comida'] },
    { id: 'campo', host: 'explorer', bg: 'soccer', name: { es: 'El Campo', en: 'The Field' }, acts: ['futbol', 'deportes'] },
    { id: 'garaje', host: 'builder', bg: 'garage', name: { es: 'El Garaje', en: 'The Garage' }, acts: ['ruidos', 'carros'] },
    { id: 'escuela', host: 'colors', bg: 'school', name: { es: 'La Escuela', en: 'The School' }, acts: ['leccion', 'memoria', 'tocar', 'ordenar'] },
    { id: 'jardin', host: 'animals', bg: 'garden', name: { es: 'El Jardín', en: 'The Garden' }, acts: ['animales', 'animalitos', 'naturaleza', 'clima'] },
    { id: 'sala', host: 'artist', bg: 'playroom', name: { es: 'Sala de Juegos', en: 'Playroom' }, acts: ['pintar', 'xilofono', 'juguete', 'tambores'] }
  ];
  ADV.loc = function (id) { for (var i = 0; i < ADV.LOCS.length; i++) if (ADV.LOCS[i].id === id) return ADV.LOCS[i]; return null; };
  ADV.ACTS = {
    familia: { kind: 'game', game: 'familia', host: 'chef', pic: 'mom', t: { es: 'Mi Familia', en: 'My Family' } },
    cuerpo: { kind: 'cat', cat: 'body', host: 'explorer', pic: 'nose', t: { es: 'Mi Cuerpo', en: 'My Body' } },
    ropa: { kind: 'cat', cat: 'clothes', host: 'chef', pic: 'shirt', t: { es: 'La Ropa', en: 'Clothes' } },
    simon: { kind: 'cat', cat: 'simon', host: 'explorer', pic: 'i-simon', t: { es: 'Simón Dice', en: 'Simon Says' } },
    yo: { kind: 'cat', cat: 'me', host: 'explorer', pic: 'hand', t: { es: 'Me Llamo', en: 'My Name' } },
    globos: { kind: 'game', game: 'globos', host: 'colors', pic: 'balloon-red', t: { es: '¡Globos Arriba!', en: 'Balloons Up!' } },
    colores: { kind: 'cat', cat: 'colors', host: 'colors', pic: 'rainbow', t: { es: 'Colores', en: 'Colors' } },
    contar: { kind: 'cat', cat: 'count', host: 'colors', pic: 'i-count', t: { es: '¡A Contar!', en: 'Counting' } },
    formas: { kind: 'cat', cat: 'shapes', host: 'colors', pic: 'triangle-blue', t: { es: 'Formas', en: 'Shapes' } },
    burbujas: { kind: 'cat', cat: 'bubbles', host: 'colors', pic: 'i-bubbles', t: { es: 'Burbujas', en: 'Bubbles' } },
    cocinar: { kind: 'game', game: 'cocinar', host: 'chef', pic: 'bowl', t: { es: '¡A Cocinar!', en: "Let's Cook!" } },
    pulperia: { kind: 'game', game: 'pulperia', host: 'chef', pic: 'basket', t: { es: 'La Pulpería', en: 'The Corner Store' } },
    comida: { kind: 'cat', cat: 'food', host: 'chef', pic: 'apple', t: { es: 'La Comida', en: 'Food' } },
    futbol: { kind: 'cat', cat: 'soccer', host: 'explorer', pic: 'soccer-ball', t: { es: '¡Fútbol!', en: 'Soccer!' } },
    deportes: { kind: 'cat', cat: 'sports', host: 'explorer', pic: 'shoe', t: { es: 'Deportes', en: 'Sports' } },
    ruidos: { kind: 'game', game: 'ruidos', host: 'builder', pic: 'train', t: { es: '¿Qué Suena?', en: 'What Sound?' } },
    carros: { kind: 'cat', cat: 'vehicles', host: 'builder', pic: 'car', t: { es: 'Vehículos', en: 'Vehicles' } },
    leccion: { kind: 'cat', cat: 'lesson', host: 'colors', pic: 'book', t: { es: 'Palabras de la Semana', en: "This Week's Words" } },
    memoria: { kind: 'cat', cat: 'memory', host: 'colors', pic: 'cards', t: { es: 'Memoria', en: 'Memory' } },
    tocar: { kind: 'cat', cat: 'match', host: 'animals', pic: 'i-target', t: { es: '¡Tocá!', en: 'Touch!' } },
    ordenar: { kind: 'cat', cat: 'sorting', host: 'builder', pic: 'i-sort', t: { es: 'Ordenar', en: 'Sorting' } },
    animales: { kind: 'game', game: 'animales', host: 'animals', pic: 'rooster', t: { es: '¿Quién Dice?', en: 'Who Says?' } },
    animalitos: { kind: 'cat', cat: 'animals', host: 'animals', pic: 'cat', t: { es: 'Los Animales', en: 'Animals' } },
    naturaleza: { kind: 'cat', cat: 'nature', host: 'animals', pic: 'flower', t: { es: 'Naturaleza', en: 'Nature' } },
    clima: { kind: 'cat', cat: 'weather', host: 'animals', pic: 'rain', t: { es: 'El Clima', en: 'Weather' } },
    pintar: { kind: 'cat', cat: 'paint', host: 'artist', pic: 'palette', t: { es: 'Pinta y Crea', en: 'Paint' } },
    xilofono: { kind: 'game', game: 'xilofono', host: 'artist', pic: 'xylophone', t: { es: 'Xilófono Mágico', en: 'Magic Xylophone' } },
    juguete: { kind: 'game', game: 'juguete', host: 'builder', pic: 'teddy', t: { es: 'Busca el Juguete', en: 'Find the Toy' } },
    tambores: { kind: 'cat', cat: 'drums', host: 'artist', pic: 'drum', t: { es: 'Tambores', en: 'Drums' } }
  };
  ADV.actOn = function (id) { return !(ADV.set.off && ADV.set.off[id]); };

  /* ---------------- pictures: public pack assets → original inline art → emoji ---------------- */
  var PACK_OBJ = 'apple balloon-blue balloon-green balloon-orange balloon-purple balloon-red balloon-yellow banana book car carrot cat circle-blue circle-green circle-orange circle-purple circle-red circle-yellow duck flower grapes heart orange paw rainbow soccer-ball square-blue square-green square-orange square-purple square-red square-yellow star strawberry sun triangle-blue triangle-green triangle-orange triangle-purple triangle-red triangle-yellow xylophone'.split(' ');
  var PACK_SET = {}; PACK_OBJ.forEach(function (k) { PACK_SET[k] = 1; });
  var EMOJI = { mom: '👩🏾', nose: '👃🏾', shirt: '👕', hand: '👋🏾', bowl: '🥣', basket: '🧺', shoe: '👟', train: '🚂', cards: '🃏', rooster: '🐓', rain: '🌧️', palette: '🎨', teddy: '🧸', drum: '🥁' };
  ADV.picSrc = function (id) { return PACK_SET[id] ? ASSET + 'obj/' + id + '.svg' : null; };
  ADV.pic = function (id, cls) {
    cls = 'adv-pic' + (cls ? ' ' + cls : '');
    // One library per category keeps each game consistent: the detailed item library wins for foods/animals/
    // vehicles/toys; the artwork pack supplies balloons, colored shapes, xylophone and soccer ball.
    if (window.ADV_ITEMS && ADV_ITEMS[id]) return '<svg class="' + cls + '" viewBox="0 0 100 100" aria-hidden="true">' + ADV_ITEMS[id] + '</svg>';
    if (PACK_SET[id]) return '<img class="' + cls + '" src="' + ASSET + 'obj/' + id + '.svg" alt="" draggable="false">';
    if (id.indexOf('i-') === 0 && window.ADV_ART && ADV_ART.icon) { var s = ADV_ART.icon(id.slice(2)); if (s) return '<span class="' + cls + '">' + s + '</span>'; }
    return '<span class="' + cls + ' adv-emoji" aria-hidden="true">' + (EMOJI[id] || '⭐') + '</span>';
  };
  ADV.icon = function (name) { return '<img class="adv-ico" src="' + ASSET + 'icons/' + name + '.svg" alt="" draggable="false">'; };
  ADV.bgUrl = function (loc) {
    var L = typeof loc === 'string' ? ADV.loc(loc) : loc;
    return ASSET + 'bg/' + ((L && L.bg) || 'backyard') + '.svg';
  };
  ADV.reward = function (id) { return '<img class="adv-pic" src="' + ASSET + 'rewards/' + id + '.svg" alt="" draggable="false">'; };

  /* ---------------- characters (private pack first, then built-in original cast) ---------------- */
  ADV.pack = null; // { title, chars:{role:{name, img:{pose:url}, sticker:url}}, scenes:{loc:url}, splash:url, source }
  var POSE_ALIAS = { cheer: ['celebrate', 'cheer', 'wave', 'idle'], talk: ['speak', 'talk', 'idle'], wave: ['wave', 'idle'], idle: ['idle', 'wave'], think: ['think', 'idle'], point: ['point', 'idle'] };
  function packImg(role, pose) {
    var c = ADV.pack && ADV.pack.chars && ADV.pack.chars[role];
    if (!c || !c.img) return null;
    var tries = POSE_ALIAS[pose] || [pose, 'idle'];
    for (var i = 0; i < tries.length; i++) if (c.img[tries[i]]) return c.img[tries[i]];
    for (var k in c.img) return c.img[k];
    return null;
  }
  ADV.name = function (role) {
    var c = ADV.pack && ADV.pack.chars && ADV.pack.chars[role];
    if (c && c.name && packImg(role, 'idle')) return c.name;
    return (ADV.BUILTIN[role] || ADV.BUILTIN.explorer).name;
  };
  ADV.tint = function (role) { return (ADV.BUILTIN[role] || ADV.BUILTIN.explorer).tint; };
  /* o: {pose:'idle'|'wave'|'cheer'|'talk', mood, cls} */
  ADV.charHTML = function (role, o) {
    o = o || {};
    var pose = o.pose || 'idle', cls = 'adv-char role-' + role + ' pose-' + pose + (o.cls ? ' ' + o.cls : '');
    var u = packImg(role, pose === 'talk' ? 'talk' : pose);
    if (u && !o.mood) return '<div class="' + cls + ' is-pack"><img src="' + u + '" alt="" draggable="false"></div>';
    var b = ADV.BUILTIN[role] || ADV.BUILTIN.explorer;
    return '<div class="' + cls + '">' + ADV_ART.char(b.art, { pose: pose === 'talk' ? 'idle' : pose, talk: pose === 'talk' || pose === 'cheer', mood: o.mood }) + '</div>';
  };
  ADV.stickerHTML = function (role) {
    var c = ADV.pack && ADV.pack.chars && ADV.pack.chars[role];
    if (c && c.sticker) return '<img src="' + c.sticker + '" alt="" draggable="false">';
    var u = packImg(role, 'cheer');
    if (u) return '<img src="' + u + '" alt="" draggable="false">';
    return ADV_ART.char((ADV.BUILTIN[role] || ADV.BUILTIN.explorer).art, { pose: 'cheer', talk: true });
  };
  ADV.sceneFor = function (locId) { return ADV.pack && ADV.pack.scenes && ADV.pack.scenes[locId] || null; };

  /* ---------------- talking: one voice, captions, {n} = character name ---------------- */
  ADV.lang = function () { return (typeof appLang !== 'undefined' && appLang === 'en') ? 'en' : 'es'; };
  ADV.txt = function (line, role) {
    if (!line) return '';
    var t = typeof line === 'string' ? line : (line[ADV.lang()] || line.es);
    return String(t).replace(/\{n\}/g, role ? ADV.name(role) : '');
  };
  ADV.say = function (line, role, cb) {
    var t = ADV.txt(line, role);
    if (typeof speak === 'function') speak(t, ADV.lang(), cb); else if (cb) setTimeout(cb, 300);
    return t;
  };
  // Bilingual caption under Spanish text (parent setting). Only used while learning Spanish.
  ADV.cap = function (line, role) {
    if (!line || typeof line === 'string' || ADV.lang() === 'en' || !line.en) return '';
    return '<span class="adv-en">' + String(line.en).replace(/\{n\}/g, role ? ADV.name(role) : '') + '</span>';
  };
  ADV.narrationVolume = function () { var v = +ADV.set.nar; return isNaN(v) ? 1 : Math.max(0, Math.min(1, v)); };

  /* ---------------- sound effects (Web Audio, no files) ---------------- */
  var AC = null, MASTER = null;
  ADV.ac = function () {
    try {
      if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); MASTER = AC.createGain(); MASTER.connect(AC.destination); }
      if (AC.state === 'suspended') AC.resume();
      MASTER.gain.value = Math.max(0, Math.min(1, +ADV.set.sfx || 0));
      return AC;
    } catch (e) { return null; }
  };
  function tone(f, t0, dur, type, vol, f2) {
    var a = ADV.ac(); if (!a || !(+ADV.set.sfx)) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(MASTER); o.start(t); o.stop(t + dur + 0.02);
  }
  ADV.sfx = {
    tap: function () { tone(660, 0, 0.08, 'triangle', 0.18); },
    pop: function () { tone(520, 0, 0.12, 'sine', 0.3, 1400); },
    boing: function () { tone(220, 0, 0.22, 'sine', 0.3, 520); },
    yes: function () { tone(784, 0, 0.14, 'triangle', 0.25); tone(988, 0.1, 0.14, 'triangle', 0.25); tone(1319, 0.2, 0.28, 'triangle', 0.25); },
    soft: function () { tone(330, 0, 0.18, 'sine', 0.18, 300); },
    whoosh: function () { tone(300, 0, 0.25, 'sine', 0.12, 900); },
    star: function () { [1047, 1319, 1568, 2093].forEach(function (f, i) { tone(f, i * 0.08, 0.3, 'sine', 0.2); }); },
    note: function (i) { // xylophone: C major scale, bell-like
      var f = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5][i % 8];
      tone(f, 0, 0.9, 'sine', 0.35); tone(f * 4, 0, 0.18, 'sine', 0.06); tone(f * 2, 0, 0.4, 'triangle', 0.05);
    }
  };

  /* ---------------- PRIVATE PACK: IndexedDB store (device only) ---------------- */
  var DB = 'vamos-private-pack', ST = 'kv';
  function idb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('noidb'));
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(ST); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
  }
  function idbDo(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(ST, mode), s = tx.objectStore(ST), out = fn(s);
        tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); db.close(); };
        tx.onerror = function () { rej(tx.error); db.close(); };
      });
    });
  }
  ADV.packDB = {
    getAll: function () {
      return idb().then(function (db) {
        return new Promise(function (res, rej) {
          var out = {}, tx = db.transaction(ST, 'readonly'), cur = tx.objectStore(ST).openCursor();
          cur.onsuccess = function () { var c = cur.result; if (c) { out[c.key] = c.value; c.continue(); } };
          tx.oncomplete = function () { res(out); db.close(); }; tx.onerror = function () { rej(tx.error); db.close(); };
        });
      });
    },
    put: function (k, v) { return idbDo('readwrite', function (s) { s.put(v, k); }); },
    del: function (k) { return idbDo('readwrite', function (s) { s.delete(k); }); },
    clear: function () { return idbDo('readwrite', function (s) { s.clear(); }); }
  };
  var urls = [];
  function blobUrl(b) { var u = URL.createObjectURL(b); urls.push(u); return u; }
  /* Build ADV.pack from IndexedDB. Keys: 'meta' (JSON) and 'f:<path>' (Blob). */
  function packFromDB(all) {
    var meta = all.meta; if (!meta) return null;
    var p = { title: meta.title || '', source: 'device', chars: {}, scenes: {}, splash: null };
    ADV.ROLES.forEach(function (r) {
      var m = meta.chars && meta.chars[r]; if (!m) return;
      var c = { name: m.name || '', img: {}, sticker: null };
      Object.keys(m.img || {}).forEach(function (pose) { var b = all['f:' + m.img[pose]]; if (b) c.img[pose] = blobUrl(b); });
      if (m.sticker && all['f:' + m.sticker]) c.sticker = blobUrl(all['f:' + m.sticker]);
      p.chars[r] = c;
    });
    Object.keys(meta.scenes || {}).forEach(function (l) { var b = all['f:' + meta.scenes[l]]; if (b) p.scenes[l] = blobUrl(b); });
    if (meta.splash && all['f:' + meta.splash]) p.splash = blobUrl(all['f:' + meta.splash]);
    return p;
  }
  /* A folder pack: /private-pack/manifest.json in the artwork-pack format (characters{id:{role,poses}}, assets[]). */
  function packFromManifest(man, base, resolve) {
    var p = { title: man.theme || '', source: 'folder', chars: {}, scenes: {}, splash: null }, taken = {};
    Object.keys(man.characters || {}).forEach(function (id) {
      var info = man.characters[id], role = roleFor(info.role, taken); if (!role) return; taken[role] = 1;
      var c = { name: niceName(id), img: {}, sticker: null };
      (info.poses || ['idle']).forEach(function (pose) { c.img[pose] = resolve('characters/' + id + '-' + pose + '.svg'); });
      c.sticker = resolve('rewards/' + id + '.svg');
      p.chars[role] = c;
    });
    (man.assets || []).forEach(function (a) {
      if (a.kind === 'scene') { var l = sceneLoc(a.path + ' ' + (a.description || '')); if (l && !p.scenes[l]) p.scenes[l] = resolve(a.path); }
      if (a.kind === 'branding' && /splash/i.test(a.path)) p.splash = resolve(a.path);
    });
    return p;
  }
  function niceName(id) { var n = String(id).replace(/[-_]/g, ' '); n = n.charAt(0).toUpperCase() + n.slice(1); return n.replace(/^Tomas$/, 'Tomás'); }
  function sceneLoc(s) {
    s = String(s).toLowerCase();
    if (/keepy|balloon|globo|park|parque/.test(s)) return 'parque';
    if (/kitchen|cocina|cook/.test(s)) return 'cocina';
    if (/xylophone|music|playroom|xil/.test(s)) return 'sala';
    if (/soccer|futbol|fútbol|field/.test(s)) return 'campo';
    if (/garage|garaje|car/.test(s)) return 'garaje';
    if (/school|escuela/.test(s)) return 'escuela';
    if (/garden|jard/.test(s)) return 'jardin';
    if (/house|home|casa|family/.test(s)) return 'casa';
    return null;
  }
  ADV.loadPack = function () {
    if (ADV._packP) return ADV._packP;
    urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); urls = [];
    ADV._packP = ADV.packDB.getAll().then(packFromDB).catch(function () { return null; }).then(function (p) {
      if (p) return p;
      if (!ADV.set.folderPack || location.protocol === 'file:') return null;
      return fetch('/private-pack/manifest.json', { cache: 'no-store' }).then(function (r) {
        if (!r.ok || !/json/.test(r.headers.get('content-type') || '')) return null;
        return r.json().then(function (man) { return packFromManifest(man, '/private-pack/', function (path) { return '/private-pack/' + path; }); });
      }).catch(function () { return null; });
    }).then(function (p) { ADV.pack = p; return p; });
    return ADV._packP;
  };
  ADV.reloadPack = function () { ADV._packP = null; return ADV.loadPack(); };

  /* ---------------- importing (parent settings) ---------------- */
  // Shrink raster images so the device store stays small; SVGs are stored as-is (they render inside <img>, so no script runs).
  function shrink(file, max) {
    if (/svg/.test(file.type) || /\.svg$/i.test(file.name || '')) return Promise.resolve(new Blob([file], { type: 'image/svg+xml' }));
    return new Promise(function (res) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement('canvas');
        cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(u);
        cv.toBlob(function (b) { res(b || file); }, 'image/webp', 0.86);
      };
      img.onerror = function () { URL.revokeObjectURL(u); res(file); };
      img.src = u;
    });
  }
  ADV.shrink = shrink;
  function getMeta() { return ADV.packDB.getAll().then(function (a) { return a.meta || { title: '', chars: {}, scenes: {} }; }).catch(function () { return { title: '', chars: {}, scenes: {} }; }); }
  ADV.importImage = function (file, target) { // target: {role, pose} | {scene: locId}
    var key = target.role ? 'char-' + target.role + '-' + (target.pose || 'idle') : 'scene-' + target.scene;
    return shrink(file, target.role ? 768 : 1400).then(function (blob) {
      return ADV.packDB.put('f:' + key, blob).then(getMeta).then(function (meta) {
        meta.chars = meta.chars || {}; meta.scenes = meta.scenes || {};
        if (target.role) { var c = meta.chars[target.role] = meta.chars[target.role] || { name: '', img: {} }; c.img[target.pose || 'idle'] = key; }
        else meta.scenes[target.scene] = key;
        return ADV.packDB.put('meta', meta);
      });
    }).then(ADV.reloadPack);
  };
  ADV.setPackName = function (role, name) {
    return getMeta().then(function (meta) { meta.chars = meta.chars || {}; var c = meta.chars[role] = meta.chars[role] || { name: '', img: {} }; c.name = String(name || '').slice(0, 24); return ADV.packDB.put('meta', meta); }).then(ADV.reloadPack);
  };
  ADV.clearPackPart = function (target) {
    return getMeta().then(function (meta) {
      var keys = [];
      if (target.role && meta.chars && meta.chars[target.role]) { var c = meta.chars[target.role]; Object.keys(c.img || {}).forEach(function (p) { keys.push(c.img[p]); }); if (c.sticker) keys.push(c.sticker); delete meta.chars[target.role]; }
      if (target.scene && meta.scenes && meta.scenes[target.scene]) { keys.push(meta.scenes[target.scene]); delete meta.scenes[target.scene]; }
      return Promise.all(keys.map(function (k) { return ADV.packDB.del('f:' + k); })).then(function () { return ADV.packDB.put('meta', meta); });
    }).then(ADV.reloadPack);
  };
  ADV.clearPack = function () { return ADV.packDB.clear().catch(function () {}).then(ADV.reloadPack); };

  /* Minimal .zip reader (stored + deflate via DecompressionStream). Reads the ¡Vamos! artwork-pack format. */
  function zipEntries(buf) {
    var dv = new DataView(buf), n = buf.byteLength, eocd = -1;
    for (var i = n - 22; i >= Math.max(0, n - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw new Error('notzip');
    var cnt = dv.getUint16(eocd + 10, true), off = dv.getUint32(eocd + 16, true), out = {}, td = new TextDecoder();
    for (var k = 0; k < cnt; k++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      var method = dv.getUint16(off + 10, true), csize = dv.getUint32(off + 20, true), nlen = dv.getUint16(off + 28, true),
        xlen = dv.getUint16(off + 30, true), clen = dv.getUint16(off + 32, true), lho = dv.getUint32(off + 42, true);
      var name = td.decode(new Uint8Array(buf, off + 46, nlen));
      out[name] = { method: method, csize: csize, lho: lho };
      off += 46 + nlen + xlen + clen;
    }
    return out;
  }
  function zipRead(buf, e) {
    var dv = new DataView(buf), start = e.lho + 30 + dv.getUint16(e.lho + 26, true) + dv.getUint16(e.lho + 28, true);
    var data = new Uint8Array(buf, start, e.csize);
    if (e.method === 0) return Promise.resolve(new Blob([data]));
    if (e.method === 8 && window.DecompressionStream) return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
    return Promise.reject(new Error('unsupported'));
  }
  ADV.importZip = function (file, onProgress) {
    var prog = onProgress || function () {};
    return file.arrayBuffer().then(function (buf) {
      var ents = zipEntries(buf), manKey = Object.keys(ents).filter(function (k) { return /(^|\/)manifest\.json$/.test(k); })[0];
      if (!manKey) throw new Error('nomanifest');
      var base = manKey.replace(/manifest\.json$/, '');
      return zipRead(buf, ents[manKey]).then(function (b) { return b.text(); }).then(function (txt) {
        var man = JSON.parse(txt), meta = { title: man.theme || '', chars: {}, scenes: {} }, jobs = [], taken = {};
        function want(path, key, kind) { var e = ents[base + path]; if (!e) return; jobs.push({ e: e, key: key, path: path, kind: kind }); return key; }
        Object.keys(man.characters || {}).forEach(function (id) {
          var info = man.characters[id], role = roleFor(info.role, taken); if (!role) return; taken[role] = 1;
          var c = { name: niceName(id), img: {}, sticker: null };
          (info.poses || ['idle']).forEach(function (pose) { var k = want('characters/' + id + '-' + pose + '.svg', 'char-' + role + '-' + pose, 'svg'); if (k) c.img[pose] = k; });
          c.sticker = want('rewards/' + id + '.svg', 'sticker-' + role, 'svg') || null;
          meta.chars[role] = c;
        });
        (man.assets || []).forEach(function (a) {
          if (a.kind === 'scene') { var l = sceneLoc(a.path + ' ' + (a.description || '')); if (l && !meta.scenes[l]) meta.scenes[l] = want(a.path, 'scene-' + l, 'raster'); }
          if (a.kind === 'branding' && /splash/i.test(a.path)) meta.splash = want(a.path, 'splash', 'svg');
        });
        var done = 0;
        return ADV.packDB.clear().then(function () {
          return jobs.reduce(function (pr, j) {
            return pr.then(function () {
              return zipRead(buf, j.e).then(function (b) {
                if (j.kind === 'svg') return new Blob([b], { type: 'image/svg+xml' });
                return shrink(new File([b], j.path, { type: /\.png$/i.test(j.path) ? 'image/png' : 'image/jpeg' }), 1400);
              }).then(function (blob) { done++; prog(done, jobs.length); return ADV.packDB.put('f:' + j.key, blob); });
            });
          }, Promise.resolve());
        }).then(function () { return ADV.packDB.put('meta', meta); }).then(ADV.reloadPack).then(function () { return { chars: Object.keys(meta.chars).length, scenes: Object.keys(meta.scenes).length }; });
      });
    });
  };

  ADV.applyClasses();
})();
