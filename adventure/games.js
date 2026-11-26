/* ¡Vamos! Aventuras — new adventures.
   Each game: { start(el, ctx), stop(), repeat(), pause?(), resume?() }. ctx = { act, host, loc, done() }.
   Rules for every game: spoken Spanish prompt (voseo, like the rest of the app), no timers or failure screens,
   wrong taps get a gentle wiggle + hint, taps are ignored while feedback plays, and everything stops on stop(). */
(function () {
  var ADV = window.ADV;
  var GAMES = ADV.GAMES = {};
  function rnd(n) { return Math.floor(Math.random() * n); }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function easy() { return ADV.set.diff !== 'normal'; }
  function num(n, fem) { var es = (typeof NUMS !== 'undefined' && NUMS[n]) || String(n), en = (typeof NUMS_EN !== 'undefined' && NUMS_EN[n]) || String(n); if (n === 1 && fem) es = 'Una'; return { es: es, en: en }; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ---------------- the shared game kit ---------------- */
  function kit(id, el, ctx) {
    var K = { id: id, el: el, ctx: ctx, tok: 0, busy: false, last: null, timers: [] };
    K.t = function (fn, ms) { var tk = K.tok, h = setTimeout(function () { if (tk === K.tok) fn(); }, ms); K.timers.push(h); return h; };
    K.kill = function () { K.tok++; K.timers.forEach(clearTimeout); K.timers = []; K.busy = false; };
    K.say = function (line, cb) { var tk = K.tok; ADV.say(line, ctx.host, cb ? function () { if (tk === K.tok) cb(); } : null); };
    K.prompt = function (line, cb) { // the instruction: shown, spoken, and remembered for the repeat button
      K.last = line;
      var p = el.querySelector('.ag-pt'); if (p) p.innerHTML = esc(ADV.txt(line, ctx.host)) + ADV.cap(line, ctx.host);
      K.say(line, cb);
    };
    K.repeat = function () { if (K.last) K.say(K.last); };
    K.frame = function (stage, rounds) {
      el.innerHTML = '<div class="ag ag-' + id + '"><div class="ag-prompt"><button class="ag-say" data-g="say" aria-label="Repetir">' + ADV.icon('audio') + '</button><span class="ag-pt"></span></div>'
        + '<div class="ag-stage">' + stage + '</div>' + (rounds ? '<div class="ag-dots">' + new Array(rounds + 1).join('<i></i>') + '</div>' : '') + '</div>';
      el.querySelector('.ag-say').addEventListener('click', function () { K.repeat(); });
      return el.querySelector('.ag-stage');
    };
    K.dot = function (i) { var d = el.querySelectorAll('.ag-dots i'); if (d[i]) d[i].classList.add('on'); };
    K.good = function () { return [{ es: '¡Muy bien!', en: 'Great job!' }, { es: '¡Sí!', en: 'Yes!' }, { es: '¡Excelente!', en: 'Excellent!' }][rnd(3)]; };
    K.finish = function () { K.busy = true; K.t(function () { ctx.done(); }, 700); };
    return K;
  }
  function make(id, impl) {
    var K = null;
    GAMES[id] = {
      start: function (el, ctx) { if (K) K.kill(); K = kit(id, el, ctx); impl.start(K); },
      stop: function () { if (K) { K.kill(); if (impl.stop) impl.stop(K); } K = null; },
      repeat: function () { if (K) K.repeat(); },
      pause: function () { if (K && impl.pause) impl.pause(K); },
      resume: function () { if (K && impl.resume) impl.resume(K); }
    };
  }

  /* ---------------- vocabulary ---------------- */
  var COLORS = [
    { id: 'red', hex: '#EB736C', es: 'rojo', en: 'red' }, { id: 'blue', hex: '#6FA8DC', es: 'azul', en: 'blue' },
    { id: 'yellow', hex: '#F7CF4D', es: 'amarillo', en: 'yellow' }, { id: 'green', hex: '#7CC46E', es: 'verde', en: 'green' },
    { id: 'orange', hex: '#F4A259', es: 'naranja', en: 'orange' }, { id: 'purple', hex: '#A992D8', es: 'morado', en: 'purple' }
  ];
  // g: gender, pl: plural. Food words follow the app (guineo = banana in Honduras, elote = corn).
  var FOOD = {
    apple: { es: 'manzana', pl: 'manzanas', g: 'f', en: 'apple', enpl: 'apples', adj: { es: 'roja', en: 'red' } },
    banana: { es: 'guineo', pl: 'guineos', g: 'm', en: 'banana', enpl: 'bananas', adj: { es: 'amarillo', en: 'yellow' } },
    orange: { es: 'naranja', pl: 'naranjas', g: 'f', en: 'orange', enpl: 'oranges', adj: { es: 'anaranjada', en: 'orange' } },
    strawberry: { es: 'fresa', pl: 'fresas', g: 'f', en: 'strawberry', enpl: 'strawberries', adj: { es: 'roja', en: 'red' } },
    pear: { es: 'pera', pl: 'peras', g: 'f', en: 'pear', enpl: 'pears', adj: { es: 'verde', en: 'green' } },
    carrot: { es: 'zanahoria', pl: 'zanahorias', g: 'f', en: 'carrot', enpl: 'carrots', adj: { es: 'anaranjada', en: 'orange' } },
    tomato: { es: 'tomate', pl: 'tomates', g: 'm', en: 'tomato', enpl: 'tomatoes', adj: { es: 'rojo', en: 'red' } },
    egg: { es: 'huevo', pl: 'huevos', g: 'm', en: 'egg', enpl: 'eggs', adj: { es: 'blanco', en: 'white' } },
    bread: { es: 'pan', pl: 'panes', g: 'm', en: 'bread', enpl: 'breads', adj: { es: 'café', en: 'brown' } },
    avocado: { es: 'aguacate', pl: 'aguacates', g: 'm', en: 'avocado', enpl: 'avocados', adj: { es: 'verde', en: 'green' } },
    corn: { es: 'elote', pl: 'elotes', g: 'm', en: 'corn', enpl: 'corn', adj: { es: 'amarillo', en: 'yellow' } },
    grapes: { es: 'uvas', pl: 'uvas', g: 'fp', en: 'grapes', enpl: 'grapes', adj: { es: 'moradas', en: 'purple' } },
    broccoli: { es: 'brócoli', pl: 'brócolis', g: 'm', en: 'broccoli', enpl: 'broccoli', adj: { es: 'verde', en: 'green' } },
    milk: { es: 'leche', pl: 'leche', g: 'f', en: 'milk', enpl: 'milk', adj: { es: 'blanca', en: 'white' } },
    cheese: { es: 'queso', pl: 'quesos', g: 'm', en: 'cheese', enpl: 'cheese', adj: { es: 'amarillo', en: 'yellow' } },
    watermelon: { es: 'sandía', pl: 'sandías', g: 'f', en: 'watermelon', enpl: 'watermelons', adj: { es: 'roja', en: 'red' } }
  };
  function art(f) { return f.g === 'fp' ? 'las' : f.g === 'f' ? 'la' : 'el'; }
  function artPl(f) { return f.g === 'f' || f.g === 'fp' ? 'las' : 'los'; }
  function card(id, extra) { return '<button class="ag-card" data-id="' + id + '"' + (extra || '') + '>' + ADV.pic(id) + '</button>'; }

  /* ================= ¡Globos Arriba! — balloons: colors + counting ================= */
  make('globos', (function () {
    var S = null;
    function stop() { if (S && S.raf) cancelAnimationFrame(S.raf); if (S && S.ro) { try { S.ro.disconnect(); } catch (e) {} } S = null; }
    function bounds(K) { var a = K.el.querySelector('.ag-sky'); return { w: a.clientWidth, h: a.clientHeight }; }
    function spawn(K, colors) {
      var a = K.el.querySelector('.ag-sky'), b = bounds(K); a.innerHTML = '';
      S.balls = colors.map(function (c, i) {
        var d = document.createElement('button'); d.className = 'ag-balloon'; d.setAttribute('data-c', c.id);
        d.setAttribute('aria-label', c.es); d.innerHTML = '<img src="/adventure/assets/obj/balloon-' + c.id + '.svg" alt="" draggable="false">';
        a.appendChild(d);
        var size = Math.max(70, Math.min(140, b.w / (colors.length + 1.4)));
        d.style.width = size + 'px'; d.style.height = size * 1.25 + 'px';
        return { el: d, c: c, s: size, x: (b.w / colors.length) * (i + 0.5) - size / 2, y: b.h * 0.25 + rnd(b.h * 0.25), vx: (Math.random() - 0.5) * 40, vy: 0 };
      });
    }
    function loop(K) {
      var last = performance.now(), slow = ADV.reduced() ? 0.55 : 1;
      function step(now) {
        if (!S) return;
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        var b = bounds(K), g = (easy() ? 150 : 210) * slow;
        S.balls.forEach(function (o) {
          o.vy += g * dt; o.x += o.vx * dt; o.y += o.vy * dt * 1;
          o.vx *= 0.995;
          var floor = b.h - o.s * 1.25;
          if (o.y > floor) { o.y = floor; o.vy = -Math.max(140, Math.abs(o.vy) * 0.45) * slow; } // never lost: soft auto-bounce
          if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy) * 0.3; }
          if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx); }
          if (o.x > b.w - o.s) { o.x = b.w - o.s; o.vx = -Math.abs(o.vx); }
          o.el.style.transform = 'translate3d(' + o.x + 'px,' + o.y + 'px,0) rotate(' + (o.vx * 0.08) + 'deg)';
        });
        S.raf = requestAnimationFrame(step);
      }
      S.raf = requestAnimationFrame(step);
    }
    function bump(o) { o.vy = -(easy() ? 330 : 390) * (ADV.reduced() ? 0.7 : 1); o.vx += (Math.random() - 0.5) * 120; o.el.classList.remove('hit'); void o.el.offsetWidth; o.el.classList.add('hit'); }
    function turn(K) {
      if (S.turn >= S.turns) return K.finish();
      var kind = S.turn % 2 === 0 ? 'color' : 'count';
      S.kind = kind; S.n = 0;
      if (kind === 'color') {
        var cs = shuf(COLORS).slice(0, easy() ? 3 : 4); S.target = cs[rnd(cs.length)];
        spawn(K, cs);
        K.prompt({ es: '¡Tocá el globo ' + S.target.es + '!', en: 'Touch the ' + S.target.en + ' balloon!' });
      } else {
        S.target = COLORS[rnd(COLORS.length)]; S.goal = easy() ? 3 + rnd(3) : 5 + rnd(4);
        spawn(K, [S.target]);
        K.prompt({ es: '¡Mantené el globo arriba! ¡Contá conmigo hasta ' + num(S.goal).es.toLowerCase() + '!', en: 'Keep the balloon up! Count with me to ' + num(S.goal).en.toLowerCase() + '!' });
      }
    }
    function tap(K, o) {
      if (!S || K.busy) return;
      bump(o); ADV.sfx.boing();
      if (S.kind === 'color') {
        if (o.c.id === S.target.id) {
          K.busy = true; ADV.sfx.pop(); o.el.classList.add('yay');
          K.say({ es: '¡' + cap(o.c.es) + '! ¡Muy bien!', en: cap(o.c.en) + '! Great job!' });
          K.dot(S.turn); S.turn++; K.t(function () { K.busy = false; turn(K); }, 1900);
        } else {
          ADV.wiggle(o.el);
          K.say({ es: 'Ese es ' + o.c.es + '. ¡Buscá el ' + S.target.es + '!', en: "That's " + o.c.en + '. Find ' + S.target.en + '!' });
        }
      } else {
        S.n++;
        var w = num(S.n);
        K.say({ es: '¡' + w.es + '!', en: w.en + '!' });
        var cnt = K.el.querySelector('.ag-count'); if (cnt) { cnt.textContent = S.n; cnt.classList.remove('pop'); void cnt.offsetWidth; cnt.classList.add('pop'); }
        if (S.n >= S.goal) {
          K.busy = true; ADV.sfx.yes();
          K.t(function () { K.say({ es: '¡' + num(S.goal).es + ' veces! ¡Excelente!', en: num(S.goal).en + ' times! Excellent!' }); }, 650);
          K.dot(S.turn); S.turn++;
          K.t(function () { if (cnt) cnt.textContent = ''; K.busy = false; turn(K); }, 2600);
        }
      }
    }
    return {
      start: function (K) {
        stop(); S = { turn: 0, turns: 4, balls: [] };
        K.frame('<div class="ag-sky"></div><div class="ag-count" aria-live="polite"></div>', 4);
        var sky = K.el.querySelector('.ag-sky');
        sky.addEventListener('pointerdown', function (e) {
          var b = e.target.closest('.ag-balloon'); if (!b || !S) return; e.preventDefault();
          var o = S.balls.filter(function (x) { return x.el === b; })[0]; if (o) tap(K, o);
        });
        loop(K); turn(K);
      },
      stop: stop,
      pause: function () { if (S && S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; } },
      resume: function (K) { if (S && !S.raf) loop(K); }
    };
  })());

  /* ================= Xilófono Mágico — music, colors, sequences ================= */
  make('xilofono', (function () {
    var BARS = COLORS.slice(0, 6); // red, blue, yellow, green, orange, purple → reorder rainbow-like
    BARS = [COLORS[0], COLORS[4], COLORS[2], COLORS[3], COLORS[1], COLORS[5]];
    var S = null;
    function light(K, i, ms) {
      var b = K.el.querySelectorAll('.ag-bar')[i]; if (!b) return;
      b.classList.add('lit'); ADV.sfx.note(i);
      K.t(function () { b.classList.remove('lit'); }, ms || 380);
    }
    function play(K) {
      K.busy = true; S.pos = 0;
      var names = S.seq.map(function (i) { return BARS[i]; });
      K.prompt({ es: '¡Escuchá!', en: 'Listen!' }, function () {
        S.seq.forEach(function (i, k) { K.t(function () { light(K, i, 420); }, 300 + k * 700); });
        K.t(function () {
          K.prompt({ es: names.map(function (c) { return cap(c.es); }).join(', ') + '. ¡Ahora vos!', en: names.map(function (c) { return cap(c.en); }).join(', ') + '. Your turn!' }, function () { K.busy = false; });
          K.t(function () { K.busy = false; }, 2600);
        }, 300 + S.seq.length * 700 + 200);
      });
    }
    function next(K) {
      if (S.wins >= 4) return K.finish();
      var len = (easy() ? 2 : 3) + (S.wins >= 2 ? 1 : 0);
      S.seq = []; for (var i = 0; i < len; i++) { var r; do { r = rnd(BARS.length); } while (S.seq.length && r === S.seq[S.seq.length - 1]); S.seq.push(r); }
      play(K);
    }
    function tap(K, i) {
      if (S.free) { light(K, i); var now = Date.now(); if (now - S.lastSay > 700) { S.lastSay = now; K.say({ es: cap(BARS[i].es), en: cap(BARS[i].en) }); } return; }
      if (K.busy) return;
      light(K, i);
      if (i === S.seq[S.pos]) {
        S.pos++;
        if (S.pos >= S.seq.length) { K.busy = true; K.dot(S.wins); S.wins++; ADV.sfx.yes(); K.say(K.good()); K.t(function () { next(K); }, 1800); }
      } else {
        K.busy = true; ADV.sfx.soft(); ADV.wiggle(K.el.querySelectorAll('.ag-bar')[i]);
        K.say({ es: '¡Casi! Escuchá otra vez.', en: 'Almost! Listen again.' }, function () { play(K); });
        K.t(function () { if (K.busy && S.pos !== -1) { /* safety */ } }, 4000);
      }
    }
    return {
      start: function (K) {
        S = { wins: 0, seq: [], pos: 0, free: false, lastSay: 0 };
        var stage = K.frame('<button class="ag-mode" data-mode="free" aria-label="Libre">' + ADV.pic('music') + '</button><div class="ag-xylo">'
          + BARS.map(function (c, i) { return '<button class="ag-bar" data-i="' + i + '" style="--c:' + c.hex + ';--h:' + (100 - i * 9) + '%" aria-label="' + c.es + '"><i></i><i></i></button>'; }).join('') + '</div>', 4);
        stage.addEventListener('pointerdown', function (e) {
          var b = e.target.closest('.ag-bar'); if (b) { e.preventDefault(); tap(K, +b.getAttribute('data-i')); return; }
          var m = e.target.closest('.ag-mode'); if (m) {
            e.preventDefault(); S.free = !S.free; m.classList.toggle('on', S.free); K.kill(); S.pos = 0;
            if (S.free) K.prompt({ es: '¡Tocá libre! ¡Hacé música!', en: 'Free play! Make music!' }); else next(K);
          }
        });
        K.prompt({ es: '¡Hola! Soy {n}. ¡Vamos a hacer música!', en: "Hi! I'm {n}. Let's make music!" }, function () { next(K); });
      }
    };
  })());

  /* ================= La Pulpería — shopping & counting ================= */
  make('pulperia', (function () {
    var STOCK = ['apple', 'banana', 'orange', 'strawberry', 'pear', 'carrot', 'tomato', 'egg', 'avocado', 'corn'];
    var S = null;
    function ask(f, n) {
      var w = num(n, f.g === 'f').es.toLowerCase();
      return n === 1
        ? { es: '¿Me das ' + (f.g === 'f' ? 'una ' : 'un ') + f.es + '?', en: 'Can you give me one ' + f.en + '?' }
        : { es: '¿Me das ' + w + ' ' + f.pl + '?', en: 'Can you give me ' + num(n).en.toLowerCase() + ' ' + f.enpl + '?' };
    }
    function order(K) {
      if (S.done >= 4) return K.finish();
      var shelf = shuf(STOCK).slice(0, 6); S.want = shelf[rnd(6)]; S.n = 0; S.goal = 1 + rnd(easy() ? 3 : 5);
      K.el.querySelector('.ag-shelf').innerHTML = shelf.map(function (id) { return card(id); }).join('');
      K.el.querySelector('.ag-basket .in').innerHTML = '';
      K.prompt(ask(FOOD[S.want], S.goal));
    }
    function tap(K, b) {
      if (K.busy) return;
      var id = b.getAttribute('data-id'), f = FOOD[id], want = FOOD[S.want];
      if (id === S.want) {
        S.n++; ADV.sfx.pop();
        var fly = document.createElement('span'); fly.className = 'ag-got'; fly.innerHTML = ADV.pic(id);
        K.el.querySelector('.ag-basket .in').appendChild(fly);
        b.classList.remove('adv-bounce'); void b.offsetWidth; b.classList.add('adv-bounce');
        var w = num(S.n, want.g === 'f');
        if (S.n >= S.goal) {
          K.busy = true; K.dot(S.done); S.done++;
          K.say({ es: '¡' + w.es + '! ¡Gracias!', en: w.en + '! Thank you!' });
          K.t(function () { K.busy = false; order(K); }, 2300);
        } else K.say({ es: '¡' + w.es + '!', en: w.en + '!' });
      } else {
        ADV.wiggle(b); ADV.sfx.soft();
        K.say({ es: 'Es ' + (f.g === 'f' ? 'una ' : f.g === 'fp' ? '' : 'un ') + f.es + '. ¡Buscá ' + (S.goal > 1 ? artPl(want) + ' ' + want.pl : art(want) + ' ' + want.es) + '!', en: "That's a " + f.en + '. Find the ' + (S.goal > 1 ? want.enpl : want.en) + '!' });
      }
    }
    return {
      start: function (K) {
        S = { done: 0 };
        var st = K.frame('<div class="ag-store"><div class="ag-shelf"></div><div class="ag-basket">' + ADV.pic('basket', 'bk') + '<div class="in"></div></div></div>', 4);
        st.addEventListener('click', function (e) { var b = e.target.closest('.ag-shelf .ag-card'); if (b) tap(K, b); });
        K.prompt({ es: '¡Bienvenidos a la pulpería!', en: 'Welcome to the corner store!' }, function () { order(K); });
      }
    };
  })());

  /* ================= ¡A Cocinar! — recipes: food + colors ================= */
  make('cocinar', (function () {
    var RECIPES = [
      { es: 'una ensalada de frutas', en: 'a fruit salad', need: ['strawberry', 'banana', 'grapes'], extra: ['tomato', 'carrot', 'egg', 'broccoli'] },
      { es: 'una sopa de verduras', en: 'a vegetable soup', need: ['carrot', 'tomato', 'corn'], extra: ['apple', 'banana', 'grapes', 'cheese'] },
      { es: 'un licuado', en: 'a smoothie', need: ['banana', 'strawberry', 'milk'], extra: ['broccoli', 'egg', 'corn', 'tomato'] },
      { es: 'un desayuno', en: 'a breakfast', need: ['egg', 'bread', 'cheese'], extra: ['carrot', 'grapes', 'watermelon', 'broccoli'] }
    ];
    var S = null;
    function needLine(f) { return { es: 'Necesitamos ' + art(f) + ' ' + f.es + ' ' + f.adj.es + '.', en: 'We need the ' + f.adj.en + ' ' + f.en + '.' }; }
    function ask(K) {
      if (S.i >= S.r.need.length) {
        S.stir = 0; K.el.querySelector('.ag-bowl').classList.add('ready');
        return K.prompt({ es: '¡A mezclar! Tocá el tazón tres veces.', en: "Let's mix! Tap the bowl three times." });
      }
      K.prompt(needLine(FOOD[S.r.need[S.i]]));
    }
    function tap(K, b) {
      if (K.busy || S.i >= S.r.need.length) return;
      var id = b.getAttribute('data-id'), want = S.r.need[S.i];
      if (id === want) {
        K.busy = true; ADV.sfx.pop(); b.classList.add('used');
        var f = FOOD[id], g = document.createElement('span'); g.className = 'ag-ing'; g.innerHTML = ADV.pic(id);
        g.style.setProperty('--r', (rnd(40) - 20) + 'deg'); g.style.setProperty('--x', (S.i - 1) * 26 + '%');
        K.el.querySelector('.ag-bowl .in').appendChild(g);
        K.dot(S.i);
        K.say({ es: '¡' + cap(f.es) + '!', en: cap(f.en) + '!' });
        S.i++; K.t(function () { K.busy = false; ask(K); }, 1300);
      } else {
        ADV.wiggle(b); ADV.sfx.soft();
        var f2 = FOOD[id], w = FOOD[want];
        K.say({ es: 'Es ' + art(f2) + ' ' + f2.es + '. ¡Buscá ' + art(w) + ' ' + w.es + '!', en: "That's the " + f2.en + '. Find the ' + w.en + '!' });
      }
    }
    function stir(K) {
      if (K.busy || S.i < S.r.need.length) return;
      S.stir++; ADV.sfx.whoosh();
      var bowl = K.el.querySelector('.ag-bowl'); bowl.classList.remove('spin'); void bowl.offsetWidth; bowl.classList.add('spin');
      K.say({ es: '¡' + num(S.stir).es + '!', en: num(S.stir).en + '!' });
      if (S.stir >= 3) {
        K.busy = true; K.dot(3);
        K.t(function () { K.say({ es: '¡Mmm! ¡Qué rico! ¡Hicimos ' + S.r.es + '!', en: 'Yum! We made ' + S.r.en + '!' }); }, 700);
        K.t(function () { K.finish(); }, 3200);
      }
    }
    return {
      start: function (K) {
        S = { r: RECIPES[rnd(RECIPES.length)], i: 0, stir: 0 };
        var opts = shuf(S.r.need.concat(shuf(S.r.extra).slice(0, easy() ? 2 : 3)));
        var st = K.frame('<div class="ag-kitchen"><div class="ag-pantry">' + opts.map(function (id) { return card(id); }).join('') + '</div>'
          + '<button class="ag-bowl" aria-label="tazón">' + ADV.pic('bowl', 'bw') + '<span class="in"></span>' + ADV.pic('spoon', 'sp') + '</button></div>', 4);
        st.addEventListener('click', function (e) {
          var b = e.target.closest('.ag-pantry .ag-card'); if (b) return tap(K, b);
          if (e.target.closest('.ag-bowl')) stir(K);
        });
        K.prompt({ es: '¡Vamos a hacer ' + S.r.es + '!', en: "Let's make " + S.r.en + '!' }, function () { K.t(function () { ask(K); }, 300); });
      }
    };
  })());

  /* ================= Busca el Juguete — find the toy (prepositions) ================= */
  make('juguete', (function () {
    var SPOTS = [
      { id: 'table', es: 'debajo de la mesa', en: 'under the table' }, { id: 'box', es: 'dentro de la caja', en: 'inside the box' },
      { id: 'sofa', es: 'detrás del sofá', en: 'behind the sofa' }, { id: 'basket', es: 'dentro de la canasta', en: 'inside the basket' }
    ];
    var TOYS = { ball: { es: 'la pelota', en: 'the ball' }, teddy: { es: 'el osito', en: 'the teddy bear' }, toycar: { es: 'el carrito', en: 'the little car' }, rubberduck: { es: 'el patito', en: 'the duck' }, blocks: { es: 'los bloques', en: 'the blocks' }, drum: { es: 'el tambor', en: 'the drum' } };
    var S = null;
    function round(K) {
      if (S.r >= 4) return K.finish();
      var toys = shuf(Object.keys(TOYS)).slice(0, 4), spots = easy() ? 3 : 4;
      S.hide = {}; S.tries = 0;
      SPOTS.slice(0, spots).forEach(function (sp, i) { S.hide[sp.id] = toys[i]; });
      S.want = toys[rnd(spots)];
      K.el.querySelector('.ag-room').innerHTML = SPOTS.slice(0, spots).map(function (sp) {
        return '<button class="ag-spot" data-s="' + sp.id + '" aria-label="' + sp.es + '"><span class="toy">' + ADV.pic(S.hide[sp.id]) + '</span><span class="cover">' + ADV.pic(sp.id) + '</span></button>';
      }).join('');
      K.el.querySelector('.ag-room').className = 'ag-room n' + spots;
      K.prompt({ es: '¿Dónde está ' + TOYS[S.want].es + '?', en: 'Where is ' + TOYS[S.want].en + '?' });
    }
    function tap(K, b) {
      if (K.busy) return;
      var sid = b.getAttribute('data-s'), toy = S.hide[sid], sp = SPOTS.filter(function (x) { return x.id === sid; })[0];
      b.classList.add('open'); ADV.sfx.whoosh();
      if (toy === S.want) {
        K.busy = true; b.classList.add('found'); ADV.sfx.yes(); K.dot(S.r); S.r++;
        var t = TOYS[toy];
        K.say({ es: '¡Aquí está! ' + cap(t.es) + ' está ' + sp.es + '.', en: 'Here it is! ' + cap(t.en) + ' is ' + sp.en + '.' });
        K.t(function () { K.busy = false; round(K); }, 3200);
      } else {
        K.busy = true; S.tries++;
        K.say({ es: '¡Es ' + TOYS[toy].es + '! ¡Buscá ' + TOYS[S.want].es + '!', en: "It's " + TOYS[toy].en + '! Find ' + TOYS[S.want].en + '!' });
        K.t(function () {
          b.classList.remove('open'); K.busy = false;
          if (S.tries >= 2) { var hint = K.el.querySelector('.ag-spot[data-s="' + Object.keys(S.hide).filter(function (k) { return S.hide[k] === S.want; })[0] + '"]'); if (hint) hint.classList.add('peek'); }
        }, 1500);
      }
    }
    return {
      start: function (K) {
        S = { r: 0 };
        var st = K.frame('<div class="ag-room"></div>', 4);
        st.addEventListener('click', function (e) { var b = e.target.closest('.ag-spot'); if (b && !b.classList.contains('open')) tap(K, b); });
        K.prompt({ es: '¡Escondimos los juguetes! ¡Vamos a buscar!', en: 'We hid the toys! Let\'s look!' }, function () { round(K); });
      }
    };
  })());

  /* ================= choice games: ¿Quién dice? (animals), ¿Qué suena? (vehicles), Mi Familia ================= */
  function choiceGame(id, cfg) {
    make(id, (function () {
      var S = null;
      function round(K) {
        if (S.r >= S.rounds) return K.finish();
        var q = cfg.question(S.r), n = easy() ? 3 : 4;
        var opts = shuf(q.pool).slice(0, n); if (opts.indexOf(q.target) < 0) opts[rnd(n)] = q.target;
        S.q = q;
        K.el.querySelector('.ag-choices').className = 'ag-choices n' + n;
        K.el.querySelector('.ag-choices').innerHTML = opts.map(function (o) { return '<button class="ag-card big" data-id="' + o + '" aria-label="' + esc(cfg.label(o)) + '">' + cfg.pic(o) + '</button>'; }).join('');
        K.prompt(q.ask);
      }
      return {
        start: function (K) {
          S = { r: 0, rounds: cfg.rounds || 5 };
          var st = K.frame('<div class="ag-choices"></div>', S.rounds);
          st.addEventListener('click', function (e) {
            var b = e.target.closest('.ag-card'); if (!b || K.busy) return;
            var pick = b.getAttribute('data-id');
            if (pick === S.q.target) {
              K.busy = true; ADV.sfx.yes(); b.classList.add('adv-bounce', 'ok'); K.dot(S.r); S.r++;
              K.say(cfg.yes(S.q), function () { K.t(function () { K.busy = false; round(K); }, 500); });
              K.t(function () { if (K.busy) { K.busy = false; round(K); } }, 4500);
            } else {
              ADV.wiggle(b); ADV.sfx.soft(); K.busy = true;
              K.say(cfg.no(pick, S.q), function () { K.busy = false; });
              K.t(function () { K.busy = false; }, 3000);
            }
          });
          K.prompt(cfg.intro, function () { round(K); });
        }
      };
    })());
  }

  var ANIMALS = {
    cow: { es: 'la vaca', en: 'the cow', s: 'muu', sEn: 'moo' }, dog: { es: 'el perro', en: 'the dog', s: 'guau guau', sEn: 'woof woof' },
    cat: { es: 'el gato', en: 'the cat', s: 'miau', sEn: 'meow' }, duck: { es: 'el pato', en: 'the duck', s: 'cuac cuac', sEn: 'quack quack' },
    pig: { es: 'el cerdo', en: 'the pig', s: 'oinc oinc', sEn: 'oink oink' }, sheep: { es: 'la oveja', en: 'the sheep', s: 'bee', sEn: 'baa' },
    rooster: { es: 'el gallo', en: 'the rooster', s: 'quiquiriquí', sEn: 'cock-a-doodle-doo' }, frog: { es: 'la rana', en: 'the frog', s: 'croac', sEn: 'ribbit' },
    horse: { es: 'el caballo', en: 'the horse', s: 'iiii', sEn: 'neigh' }, chick: { es: 'el pollito', en: 'the chick', s: 'pío pío', sEn: 'peep peep' }
  };
  function soundGame(id, DATA, intro, word) {
    var keys = Object.keys(DATA);
    choiceGame(id, {
      intro: intro, rounds: 5,
      pic: function (k) { return ADV.pic(k); }, label: function (k) { return DATA[k].es; },
      question: function (r) {
        var t = keys[rnd(keys.length)], a = DATA[t];
        var ask = r % 2 === 0
          ? { es: '¿Quién dice ' + a.s + '?', en: 'Who says ' + a.sEn + '?' }
          : { es: '¿Dónde está ' + a.es + '?', en: 'Where is ' + a.en + '?' };
        return { target: t, pool: keys, ask: ask };
      },
      yes: function (q) { var a = DATA[q.target]; return { es: '¡Sí! ' + cap(a.es) + ' ' + word.es + ' ' + a.s + '.', en: 'Yes! ' + cap(a.en) + ' ' + word.en + ' ' + a.sEn + '.' }; },
      no: function (p) { var a = DATA[p]; return { es: '¡Es ' + a.es + '! ¡' + cap(a.s) + '!', en: "It's " + a.en + '! ' + cap(a.sEn) + '!' }; }
    });
  }
  soundGame('animales', ANIMALS, { es: '¡Hola! Soy {n}. ¡Escuchá a los animales!', en: "Hi! I'm {n}. Listen to the animals!" }, { es: 'dice', en: 'says' });
  var VEHICLES = {
    car: { es: 'el carro', en: 'the car', s: 'run run', sEn: 'vroom vroom' }, motorcycle: { es: 'la moto', en: 'the motorcycle', s: 'brum brum', sEn: 'brrm brrm' },
    train: { es: 'el tren', en: 'the train', s: 'chu chu', sEn: 'choo choo' }, airplane: { es: 'el avión', en: 'the airplane', s: 'zuuum', sEn: 'zoom' },
    boat: { es: 'el barco', en: 'the boat', s: 'tuu tuu', sEn: 'toot toot' }, firetruck: { es: 'el camión de bomberos', en: 'the fire truck', s: 'uiu uiu', sEn: 'wee-oo wee-oo' },
    bicycle: { es: 'la bicicleta', en: 'the bicycle', s: 'rin rin', sEn: 'ring ring' }, bus: { es: 'el autobús', en: 'the bus', s: 'bip bip', sEn: 'beep beep' }
  };
  soundGame('ruidos', VEHICLES, { es: '¡Hola! Soy {n}. ¿Qué suena en el garaje?', en: "Hi! I'm {n}. What sounds are in the garage?" }, { es: 'hace', en: 'goes' });

  var FAMILY = {
    mom: { es: 'mamá', en: 'mom' }, dad: { es: 'papá', en: 'dad' }, baby: { es: 'el bebé', en: 'the baby' }, grandma: { es: 'la abuela', en: 'grandma' },
    grandpa: { es: 'el abuelo', en: 'grandpa' }, brother: { es: 'el hermano', en: 'brother' }, sister: { es: 'la hermana', en: 'sister' }
  };
  var MOODS = {
    happy: { es: 'feliz', en: 'happy', yes: { es: '¡Está feliz! ¡Qué bueno!', en: 'Happy! How nice!' } },
    sad: { es: 'triste', en: 'sad', yes: { es: 'Está triste. ¡Le damos un abrazo!', en: "Sad. Let's give a hug!" } },
    angry: { es: 'enojado', en: 'angry', yes: { es: 'Está enojado. Respiramos juntos.', en: "Angry. Let's breathe together." } },
    surprised: { es: 'sorprendido', en: 'surprised', yes: { es: '¡Está sorprendido! ¡Oh!', en: 'Surprised! Oh!' } },
    sleepy: { es: 'cansado', en: 'sleepy', yes: { es: 'Está cansado. ¡A dormir!', en: 'Sleepy. Time for bed!' } }
  };
  var FACE_TINTS = ['#FFD9A0', '#C9E7FF', '#FFD0DF', '#D8F2C8', '#E6DAFF'];
  choiceGame('familia', {
    intro: { es: '¡Hola! Soy {n}. ¡Conozcamos a la familia!', en: "Hi! I'm {n}. Let's meet the family!" }, rounds: 6,
    pic: function (k) { return k.indexOf('mood-') === 0 ? ADV_ART.face(k.slice(5), FACE_TINTS[Object.keys(MOODS).indexOf(k.slice(5)) % FACE_TINTS.length]) : ADV.pic(k); },
    label: function (k) { return k.indexOf('mood-') === 0 ? MOODS[k.slice(5)].es : FAMILY[k].es; },
    question: function (r) {
      if (r % 2 === 0) { var fk = Object.keys(FAMILY), t = fk[rnd(fk.length)]; return { target: t, pool: fk, ask: { es: '¿Dónde está ' + FAMILY[t].es + '?', en: 'Where is ' + FAMILY[t].en + '?' } }; }
      var mk = Object.keys(MOODS), m = mk[rnd(mk.length)];
      return { target: 'mood-' + m, pool: mk.map(function (x) { return 'mood-' + x; }), mood: m, ask: { es: '¿Quién está ' + MOODS[m].es + '?', en: 'Who is ' + MOODS[m].en + '?' } };
    },
    yes: function (q) { if (q.mood) return MOODS[q.mood].yes; var f = FAMILY[q.target]; return { es: '¡Sí! ¡' + cap(f.es) + '!', en: 'Yes! ' + cap(f.en) + '!' }; },
    no: function (p) { if (p.indexOf('mood-') === 0) { var m = MOODS[p.slice(5)]; return { es: 'Ese está ' + m.es + '.', en: 'That one is ' + m.en + '.' }; } var f = FAMILY[p]; return { es: '¡Es ' + f.es + '!', en: "It's " + f.en + '!' }; }
  });
})();
