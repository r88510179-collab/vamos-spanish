/* ¡Vamos! Aventuras — the interactive neighborhood (Toddler Mode presentation for world themes).
   Views inside #tmode:  loading → world (map) → loc (a place + its host) → game (existing or new) ; book (stickers)
   Existing games are opened with the app's own setTCat(cat); new adventures come from games.js (ADV.GAMES).
   index.html calls: ADV.onToggle(entering) from toggleTM, ADV.onCat(cat) from setTCat, ADV.onSticker(id) from stAward. */
(function () {
  var ADV = window.ADV;
  var V = ADV.V = { view: 'off', loc: null, act: null, game: null, greeted: {}, token: 0 };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function T(line, role) { return esc(ADV.txt(line, role)); }
  function tmOn() { var t = $('tmode'); return !!(t && t.classList.contains('act')); }
  function child() { try { return (profile && profile.child) || ''; } catch (e) { return ''; } }
  function day() { try { return localDay(); } catch (e) { return new Date().toISOString().slice(0, 10); } }
  var timers = [];
  function later(fn, ms) { var tok = V.token, id = setTimeout(function () { if (tok === V.token) fn(); }, ms); timers.push(id); return id; }
  function clearLater() { timers.forEach(clearTimeout); timers = []; V.token++; }

  /* ---------------- dialogue (all short; {n} = the speaking character's name) ---------------- */
  var LINES = {
    hello: { es: '¡Hola{c}! ¿Vamos a jugar?', en: "Hi{c}! Let's play!" },
    where: { es: '¿A dónde vamos?', en: 'Where shall we go?' },
    meet: { es: '¡Hola! Soy {n}.', en: "Hi! I'm {n}." },
    pick: { es: '¿Qué jugamos?', en: 'What shall we play?' },
    welcome: {
      casa: { es: '¡Bienvenidos a la casa!', en: 'Welcome to the house!' }, parque: { es: '¡Vamos al parque!', en: "Let's go to the park!" },
      cocina: { es: '¡Vamos a la cocina!', en: "Let's go to the kitchen!" }, campo: { es: '¡Vamos al campo!', en: "Let's go to the field!" },
      garaje: { es: '¡Vamos al garaje!', en: "Let's go to the garage!" }, escuela: { es: '¡Vamos a la escuela!', en: "Let's go to school!" },
      jardin: { es: '¡Vamos al jardín!', en: "Let's go to the garden!" }, sala: { es: '¡Vamos a la sala de juegos!', en: "Let's go to the playroom!" }
    },
    did: [{ es: '¡Lo lograste!', en: 'You did it!' }, { es: '¡Excelente trabajo!', en: 'Excellent work!' }, { es: '¡Muy bien!', en: 'Great job!' }],
    star: { es: '¡Una estrella!', en: 'A star!' },
    daily: { es: '¡La aventura del día! ¡Otra estrella!', en: "Today's adventure! Another star!" },
    friend: { es: '¡Un amigo nuevo para tu libro!', en: 'A new friend for your book!' },
    book: { es: '¡Mis calcomanías!', en: 'My stickers!' },
    locked: { es: '¡Juega para encontrarme!', en: 'Play to find me!' },
    look: { es: '¡Mirá! ¿Qué ves?', en: 'Look! What do you see?' },
    again: { es: '¡Otra vez!', en: 'Again!' }
  };
  ADV.LINES = LINES;
  function hello() { var c = child(); return { es: LINES.hello.es.replace('{c}', c ? ' ' + c : ''), en: LINES.hello.en.replace('{c}', c ? ' ' + c : '') }; }
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------------- mounting ---------------- */
  ADV.mount = function () {
    var tm = $('tmode'); if (!tm || $('adv-root')) return;
    var r = document.createElement('div'); r.id = 'adv-root';
    r.innerHTML = '<div id="adv-scene" class="adv-scene" aria-hidden="true"></div>'
      + '<div id="adv-loading" class="adv-screen adv-loading"></div>'
      + '<div id="adv-world" class="adv-screen adv-world"></div>'
      + '<div id="adv-loc" class="adv-screen adv-locv"></div>'
      + '<div id="adv-book" class="adv-screen adv-bookv"></div>'
      + '<div id="adv-bar" class="adv-bar"></div>'
      + '<div id="adv-game" class="adv-gamebox"></div>'
      + '<div id="adv-pop" class="adv-pop" aria-live="polite"></div>'
      + '<div id="adv-cele" class="adv-cele" role="dialog" aria-modal="true" aria-label="¡Lo lograste!"></div>';
    tm.insertBefore(r, tm.firstChild);
    r.addEventListener('click', onClick);
    // Immediate touch feedback without waiting for click (also blocks iOS double-tap zoom).
    r.addEventListener('pointerdown', function (e) { var b = e.target.closest('[data-adv]'); if (b) { b.classList.add('adv-press'); setTimeout(function () { b.classList.remove('adv-press'); }, 220); } });
  };
  function setView(v) {
    V.view = v;
    var tm = $('tmode'); if (!tm) return;
    ['loading', 'world', 'loc', 'game', 'book'].forEach(function (x) { tm.classList.toggle('adv-v-' + x, x === v); });
    tm.classList.toggle('adv-v-new', v === 'game' && !!V.game);
    tm.scrollTop = 0;
  }
  // Hide any running index.html game (stops its loops through the app's own setTCat).
  function parkExisting() { if (typeof tCat !== 'undefined' && tCat !== 'adv' && typeof setTCat === 'function') setTCat('adv', null); }
  function stopGame() {
    if (V.game) { try { V.game.stop(); } catch (e) {} V.game = null; }
    var g = $('adv-game'); if (g) g.innerHTML = '';
    closeCele();
  }

  /* ---------------- toddler mode on/off & app hooks ---------------- */
  ADV.onToggle = function (entering) {
    ADV.applyClasses();
    if (!ADV.isWorld()) { if (V.view !== 'off') { stopGame(); setView('off'); } return; }
    if (!entering) { clearLater(); stopGame(); setView('off'); try { speechSynthesis.cancel(); } catch (e) {} return; }
    ADV.mount();
    showLoading();
  };
  ADV.onCat = function (c) {
    if (!ADV.isWorld() || !tmOn() || V.view === 'off' || V.view === 'loading') return;
    if (c === 'adv') return;
    if (c === 'home') { if (V.view === 'game') showWorld(false); return; }
    if (V.view === 'game' && V.act && ADV.ACTS[V.act] && ADV.ACTS[V.act].cat === c) return;
    // Opened from outside the world (TV mode, "Start lesson" in the parent app, soccer shortcut): find its place.
    var id = null, loc = null;
    Object.keys(ADV.ACTS).some(function (k) { if (ADV.ACTS[k].kind === 'cat' && ADV.ACTS[k].cat === c) { id = k; return true; } });
    if (id) ADV.LOCS.some(function (L) { if (L.acts.indexOf(id) > -1) { loc = L.id; return true; } });
    stopGame(); V.loc = loc || 'escuela'; V.act = id; setView('game'); renderScene(); renderBar();
  };
  ADV.onSticker = function (id) {
    if (!ADV.isWorld() || !tmOn()) return false;
    var res = award(V.act || null);
    miniPop(res);
    return true;
  };
  ADV.sync = function () { // called once after load: Toddler Mode may already be on (reload restore)
    ADV.applyClasses();
    if (tmOn() && ADV.isWorld() && V.view === 'off') { ADV.mount(); showLoading(); }
  };

  /* ---------------- loading screen ---------------- */
  function showLoading() {
    clearLater(); stopGame(); parkExisting();
    setView('loading');
    var el = $('adv-loading'), t0 = Date.now(), min = ADV.reduced() ? 250 : 1100;
    function paint() {
      var splash = ADV.pack && ADV.pack.splash;
      el.innerHTML = (splash ? '<img class="adv-load-splash" src="' + splash + '" alt="">' : '<div class="adv-load-cast">' + ['explorer', 'colors', 'chef'].map(function (r, i) { return ADV.charHTML(r, { pose: 'wave', cls: 'd' + i }); }).join('') + '</div>')
        + '<div class="adv-logo"><span class="l1">¡Vamos!</span><span class="l2">' + T({ es: 'Aventuras', en: 'Adventures' }) + '</span></div>'
        + '<div class="adv-loadbar"><i></i></div><div class="adv-load-t">' + T({ es: 'Cargando tu aventura…', en: 'Loading your adventure…' }) + '</div>';
    }
    paint();
    ADV.loadPack().then(function () {
      paint();
      later(function () { showWorld(true); }, Math.max(0, min - (Date.now() - t0)));
    });
  }

  /* ---------------- the neighborhood map ---------------- */
  function dailyLoc() {
    if (!ADV.set.daily) return null;
    var d = day(), h = 0; for (var i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
    var open = ADV.LOCS.filter(function (L) { return L.acts.some(ADV.actOn); });
    return open.length ? open[h % open.length].id : null;
  }
  function starChip() { return '<button class="adv-stars" data-adv="book" aria-label="' + T(LINES.book) + '"><span class="s">' + ADV.reward('star') + '</span><b class="adv-starn">' + (ADV.prog.stars || 0) + '</b></button>'; }
  function showWorld(greet) {
    clearLater(); stopGame(); parkExisting();
    V.loc = null; V.act = null;
    $('adv-scene').style.backgroundImage = '';
    setView('world');
    var dl = dailyLoc(), doneToday = ADV.prog.daily && ADV.prog.daily.d === day();
    var locs = ADV.LOCS.filter(function (L) { return L.acts.some(ADV.actOn); });
    var h = '<div class="adv-wbg">' + ADV_ART.world() + '</div>'
      + '<header class="adv-whead"><div class="adv-logo sm"><span class="l1">¡Vamos!</span><span class="l2">' + T({ es: 'Aventuras', en: 'Adventures' }) + '</span></div>' + starChip() + '</header>'
      + '<nav class="adv-map n' + locs.length + '" aria-label="' + T({ es: 'Nuestro vecindario', en: 'Our neighborhood' }) + '">'
      + locs.map(function (L, i) {
        var isD = L.id === dl;
        return '<button class="adv-place" data-adv="loc" data-id="' + L.id + '" style="--i:' + i + '" aria-label="' + T(L.name) + '">'
          + (isD ? '<span class="adv-daily' + (doneToday ? ' done' : '') + '">' + ADV.reward('star') + '</span>' : '')
          + '<span class="adv-bld">' + ADV_ART.building(L.id) + '</span>'
          + '<span class="adv-plabel">' + T(L.name) + ADV.cap(L.name) + '</span></button>';
      }).join('') + '</nav>'
      + '<button class="adv-guide" data-adv="hello" aria-label="' + T(LINES.where) + '">' + ADV.charHTML('explorer', { pose: 'wave' })
      + '<span class="adv-bubble">' + T(greet ? hello() : LINES.where) + ADV.cap(greet ? hello() : LINES.where) + '</span></button>';
    $('adv-world').innerHTML = h;
    renderBar();
    if (greet) later(function () { ADV.say(hello(), 'explorer', function () { later(function () { ADV.say(LINES.where, 'explorer'); }, 250); }); }, 150);
    else later(function () { ADV.say(LINES.where, 'explorer'); }, 120);
  }
  ADV.showWorld = showWorld;

  /* ---------------- a place ---------------- */
  function renderScene() {
    var L = ADV.loc(V.loc); $('adv-scene').style.backgroundImage = L ? 'url("' + ADV.bgUrl(L) + '")' : '';
    $('adv-scene').setAttribute('data-loc', L ? L.id : '');
  }
  function showLoc(id) {
    clearLater(); stopGame(); parkExisting();
    var L = ADV.loc(id); if (!L) return showWorld(false);
    V.loc = id; V.act = null; setView('loc'); renderScene(); renderBar();
    var acts = L.acts.filter(ADV.actOn), scene = ADV.sceneFor(id), host = L.host;
    var line = LINES.welcome[id] || LINES.pick, first = !V.greeted[id];
    var h = '<div class="adv-host"><button class="adv-hostbtn" data-adv="hostsay" aria-label="' + esc(ADV.name(host)) + '">' + ADV.charHTML(host, { pose: 'wave' }) + '</button>'
      + '<div class="adv-bubble big">' + T(line) + ADV.cap(line) + '</div></div>'
      + (scene ? '<button class="adv-story" data-adv="story" aria-label="' + T(LINES.look) + '"><img src="' + scene + '" alt=""></button>' : '')
      + '<div class="adv-acts n' + acts.length + '">'
      + acts.map(function (a, i) {
        var A = ADV.ACTS[a];
        return '<button class="adv-act" data-adv="act" data-id="' + a + '" style="--i:' + i + '" aria-label="' + T(A.t) + '"><span class="adv-actpic">' + ADV.pic(A.pic) + '</span><span class="adv-actl">' + T(A.t) + ADV.cap(A.t) + '</span></button>';
      }).join('') + '</div>';
    $('adv-loc').innerHTML = h;
    V.greeted[id] = 1;
    later(function () {
      ADV.say(line, host, function () { later(function () { ADV.say(first ? { es: LINES.meet.es + ' ' + LINES.pick.es, en: LINES.meet.en + ' ' + LINES.pick.en } : LINES.pick, host); }, 200); });
    }, 120);
  }
  ADV.showLoc = showLoc;

  /* ---------------- top bar (place + game views) ---------------- */
  function renderBar() {
    var b = $('adv-bar'); if (!b) return;
    if (V.view === 'world' || V.view === 'loading' || V.view === 'off') { b.innerHTML = ''; return; }
    var L = ADV.loc(V.loc), A = V.act && ADV.ACTS[V.act];
    var title = V.view === 'book' ? LINES.book : A ? A.t : L ? L.name : { es: '', en: '' };
    var host = A ? A.host : L ? L.host : 'explorer';
    b.innerHTML = '<button class="adv-nb home" data-adv="world" aria-label="' + T({ es: 'Inicio', en: 'Home' }) + '">' + ADV.pic('house') + '</button>'
      + (V.view === 'game' ? '<button class="adv-nb back" data-adv="back" aria-label="' + T({ es: 'Volver', en: 'Back' }) + '">' + ADV.icon('back') + '</button>' : '')
      + '<div class="adv-title"><span class="av">' + ADV.charHTML(host, { pose: 'idle' }) + '</span><span class="tt">' + T(title) + ADV.cap(title) + '</span></div>'
      + (V.view === 'game' ? '<button class="adv-nb say" data-adv="repeat" aria-label="' + T({ es: 'Repetir', en: 'Repeat' }) + '">' + ADV.icon('audio') + '</button>' : '')
      + starChip();
  }
  ADV.renderBar = renderBar;

  /* ---------------- opening activities ---------------- */
  function openAct(id) {
    var A = ADV.ACTS[id]; if (!A) return;
    clearLater(); stopGame();
    V.act = id;
    if (A.kind === 'cat') {
      setView('game'); renderScene(); renderBar();
      var btn = document.querySelector('.tt-tab[data-tcat="' + A.cat + '"]');
      setTCat(A.cat, btn);
      if (A.cat === 'soccer' && typeof renderSoccerMenu === 'function') renderSoccerMenu();
    } else {
      parkExisting();
      var G = ADV.GAMES && ADV.GAMES[A.game];
      if (!G) return showLoc(V.loc);
      V.game = G; setView('game'); renderScene(); renderBar();
      G.start($('adv-game'), { act: id, host: A.host, loc: V.loc, done: function () { ADV.celebrate(); } });
    }
    $('tmode').scrollTop = 0;
  }
  ADV.openAct = openAct;

  /* Repeat the current instruction. New games know their prompt; for the existing games, re-say theirs. */
  var LBL = function () { return (typeof appLang !== 'undefined' && appLang === 'en') ? 'en' : 'es'; };
  var REPEAT = {
    match: function () { if (matchTarget) tmSay('touch', matchTarget[LBL()]); },
    colors: function () { if (colorTarget) tmSay('touch', colorTarget[LBL()]); },
    count: function () { speak(TL('¿Cuántos hay? ¡Tocá y contá!', 'How many? Tap and count!'), appLang); },
    simon: function () { simonRepeat(); },
    bubbles: function () { speak(appLang === 'en' ? 'Bubbles! Pop them!' : '¡Burbujas! ¡Tocalas!', appLang); },
    memory: function () { speak(TL('¡Encontrá los pares!', 'Find the pairs!'), appLang); },
    paint: function () { speak(TL('¡Vamos a pintar!', "Let's paint!"), appLang); },
    drums: function () { speak(TL('¡Tocá los tambores!', 'Play the drums!'), appLang); },
    sorting: function () { if (sortItem) speak(sortItem[LBL()], appLang); },
    lesson: function () { var w = lessonWords && lessonWords[lessonIdx]; if (w) speak(w[LBL()], appLang); },
    soccer: function () { speak(TL('¡Vamos a jugar fútbol!', "Let's play soccer!"), appLang); },
    me: function () { speak(TL('¿Cómo te llamás?', "What's your name?"), appLang); }
  };
  ADV.repeat = function () {
    if (V.game && V.game.repeat) return V.game.repeat();
    var A = V.act && ADV.ACTS[V.act]; if (!A) return;
    var c = A.cat, fn = REPEAT[c] || (['animals', 'food', 'body', 'nature', 'sports', 'vehicles', 'shapes', 'clothes', 'weather'].indexOf(c) > -1 ? REPEAT.match : null);
    try { if (fn) fn(); } catch (e) {}
  };

  /* ---------------- stars, friends & rewards ---------------- */
  var RW = [['star', 1], ['heart', 3], ['sun', 5], ['flower', 8], ['rainbow', 12], ['paw', 16], ['soccer-ball', 20], ['apple', 25]];
  var RW_NAME = { star: { es: 'Estrella', en: 'Star' }, heart: { es: 'Corazón', en: 'Heart' }, sun: { es: 'Sol', en: 'Sun' }, flower: { es: 'Flor', en: 'Flower' }, rainbow: { es: 'Arcoíris', en: 'Rainbow' }, paw: { es: 'Huellita', en: 'Paw print' }, 'soccer-ball': { es: 'Pelota', en: 'Ball' }, apple: { es: 'Manzana', en: 'Apple' } };
  function award(actId) {
    var p = ADV.prog, A = actId && ADV.ACTS[actId], role = A ? A.host : (ADV.loc(V.loc) || {}).host, out = { role: role || 'explorer' };
    p.stars = (p.stars || 0) + 1;
    if (actId) p.plays[actId] = (p.plays[actId] || 0) + 1;
    if (role && !p.chars[role]) { p.chars[role] = 1; out.friend = true; }
    var d = day(), dl = dailyLoc();
    if (dl && V.loc === dl && !(p.daily && p.daily.d === d)) { p.daily = { d: d, loc: dl }; p.stars++; out.daily = true; }
    RW.forEach(function (r) { if (p.stars >= r[1] && !p.rw[r[0]]) { p.rw[r[0]] = 1; out.reward = r[0]; } });
    ADV.saveProg();
    document.querySelectorAll('.adv-starn').forEach(function (n) { n.textContent = p.stars; });
    return out;
  }
  ADV.award = award;
  var popT = 0;
  function miniPop(res) {
    var el = $('adv-pop'); if (!el) return;
    el.innerHTML = '<span class="pc">' + ADV.charHTML(res.role, { pose: 'cheer' }) + '</span><span class="ps">' + ADV.reward('star') + '<b>+' + (res.daily ? 2 : 1) + '</b></span>';
    el.classList.remove('sh'); void el.offsetWidth; el.classList.add('sh');
    if (ADV.sfx) ADV.sfx.star();
    clearTimeout(popT); popT = setTimeout(function () { el.classList.remove('sh'); }, 2300);
    setTimeout(function () { if (V.view === 'game') ADV.say(res.daily ? LINES.daily : res.friend ? LINES.friend : LINES.star, res.role); }, 900);
  }
  ADV.celebrate = function () {
    var res = award(V.act), el = $('adv-cele'); if (!el) return;
    var line = pickOne(LINES.did), host = res.role;
    el.innerHTML = '<div class="adv-cbox"><div class="adv-burst">' + ADV_ART.star() + ADV_ART.star() + ADV_ART.star() + '</div>'
      + ADV.charHTML(host, { pose: 'cheer' })
      + '<div class="adv-ctext">' + T(line) + ADV.cap(line) + '</div>'
      + (res.friend ? '<div class="adv-cnew">' + T(LINES.friend) + '</div>' : res.daily ? '<div class="adv-cnew">' + T(LINES.daily) + '</div>' : '')
      + '<div class="adv-cbtns"><button class="adv-cb again" data-adv="again" aria-label="' + T(LINES.again) + '">' + ADV.icon('play') + '</button>'
      + '<button class="adv-cb home" data-adv="back" aria-label="' + T({ es: 'Volver', en: 'Back' }) + '">' + ADV.icon('back') + '</button></div></div>';
    el.classList.add('sh');
    if (ADV.sfx) ADV.sfx.star();
    if (typeof confetti === 'function') confetti();
    ADV.say(line, host, function () { if (res.friend || res.daily) ADV.say(res.daily ? LINES.daily : LINES.friend, host); });
  };
  function closeCele() { var el = $('adv-cele'); if (el) { el.classList.remove('sh'); el.innerHTML = ''; } }

  /* ---------------- sticker book ---------------- */
  function showBook() {
    clearLater(); stopGame(); parkExisting();
    setView('book'); $('adv-scene').style.backgroundImage = ''; renderBar();
    var p = ADV.prog;
    var friends = ADV.ROLES.map(function (r) {
      var on = !!p.chars[r];
      return '<button class="adv-stk friend' + (on ? ' on' : '') + '" data-adv="friend" data-id="' + r + '" aria-label="' + esc(on ? ADV.name(r) : '?') + '"><span class="art">' + ADV.stickerHTML(r) + '</span><span class="nm">' + (on ? esc(ADV.name(r)) : '?') + '</span></button>';
    }).join('');
    var rewards = RW.map(function (r) {
      var on = !!p.rw[r[0]];
      return '<button class="adv-stk rw' + (on ? ' on' : '') + '" data-adv="rw" data-id="' + r[0] + '" aria-label="' + T(RW_NAME[r[0]]) + '"><span class="art">' + ADV.reward(r[0]) + '</span>' + (on ? '' : '<span class="need">' + r[1] + '</span>') + '</button>';
    }).join('');
    $('adv-book').innerHTML = '<div class="adv-bookpg"><div class="adv-bk-h">' + T({ es: 'Mis amigos', en: 'My friends' }) + '</div><div class="adv-stks">' + friends + '</div>'
      + '<div class="adv-bk-h">' + T({ es: 'Mis calcomanías', en: 'My stickers' }) + ' · <span class="adv-starbig">' + ADV.reward('star') + '<b class="adv-starn">' + (p.stars || 0) + '</b></span></div><div class="adv-stks">' + rewards + '</div></div>';
    later(function () { ADV.say(LINES.book, 'explorer'); }, 120);
  }

  /* ---------------- input ---------------- */
  var lastTap = 0;
  function onClick(e) {
    var b = e.target.closest('[data-adv]'); if (!b) return;
    var now = Date.now(), k = b.getAttribute('data-adv');
    // Rapid-tap guard for navigation (game taps are handled inside each game).
    if (/^(loc|act|world|back|book|again)$/.test(k)) { if (now - lastTap < 450) return; lastTap = now; }
    if (ADV.sfx) ADV.sfx.tap();
    var id = b.getAttribute('data-id');
    if (k === 'loc') return showLoc(id);
    if (k === 'act') return openAct(id);
    if (k === 'world') return showWorld(false);
    if (k === 'back') { if (V.view === 'game' && V.loc) return showLoc(V.loc); return showWorld(false); }
    if (k === 'book') return showBook();
    if (k === 'repeat') return ADV.repeat();
    if (k === 'again') { closeCele(); return openAct(V.act); }
    if (k === 'hello') return ADV.say(LINES.where, 'explorer');
    if (k === 'hostsay') { var L = ADV.loc(V.loc); if (L) { wiggle(b); ADV.say({ es: LINES.meet.es + ' ' + LINES.pick.es, en: LINES.meet.en + ' ' + LINES.pick.en }, L.host); } return; }
    if (k === 'story') { var L2 = ADV.loc(V.loc); return ADV.say(LINES.look, L2 ? L2.host : 'explorer'); }
    if (k === 'friend') { wiggle(b); return ADV.prog.chars[id] ? ADV.say(LINES.meet, id) : ADV.say(LINES.locked, 'explorer'); }
    if (k === 'rw') { wiggle(b); return ADV.say(ADV.prog.rw[id] ? RW_NAME[id] : { es: '¡Ganá más estrellas!', en: 'Win more stars!' }, 'explorer'); }
  }
  function wiggle(el) { if (!el) return; el.classList.remove('adv-wig'); void el.offsetWidth; el.classList.add('adv-wig'); }
  ADV.wiggle = wiggle;

  /* Pause everything when the app goes to the background; resume quietly. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { try { speechSynthesis.cancel(); } catch (e) {} if (V.game && V.game.pause) V.game.pause(); }
    else if (V.game && V.game.resume) V.game.resume();
  });

  /* ---------------- boot ---------------- */
  function boot() { try { ADV.sync(); } catch (e) { if (window.console) console.error(e); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
