/* ¡Vamos! Aventuras — acceptance tests (Playwright, no test framework needed).
   Run:   node tests/adventures.test.js
   Opt:   PACK_ZIP=/path/to/vamos-adventures-artwork.zip node tests/adventures.test.js   (also tests the private pack import;
          the zip is never copied into the repo, it is only loaded into the throw-away test browser)
          SHOTS=1 to save screenshots to tests/output/ (git-ignored). */
const fs = require('fs');
const path = require('path');
const { setup } = require('./lib');

const OUT = path.join(__dirname, 'output');
const SHOTS = !!process.env.SHOTS;
const VIEWPORTS = [[375, 812], [390, 844], [430, 932], [768, 1024], [1280, 800], [1340, 800]];
let pass = 0, fail = 0; const failures = [];
function ok(cond, name, extra) { if (cond) { pass++; } else { fail++; failures.push(name + (extra ? ' — ' + extra : '')); console.log('  ✗ ' + name + (extra ? ' — ' + extra : '')); } }
async function shot(page, name) { if (!SHOTS) return; fs.mkdirSync(OUT, { recursive: true }); await page.screenshot({ path: path.join(OUT, name + '.png') }); }
const wait = (p, ms) => p.waitForTimeout(ms);
async function enterTM(page) { await page.evaluate(() => { if (!document.getElementById('tmode').classList.contains('act')) toggleTM(); }); await wait(page, 1500); }
async function view(page) { return page.evaluate(() => window.ADV && ADV.V.view); }

(async () => {
  const t = await setup();
  try {
    /* 1. Classic theme is unchanged */
    console.log('Classic theme');
    {
      const p = await t.newPage({ width: 1280, height: 800 }, { ls: { v_adv: JSON.stringify({ theme: 'classic' }) } });
      await p.goto(t.base + '/'); await enterTM(p);
      ok(await p.evaluate(() => !document.documentElement.classList.contains('th-adv')), 'classic: no adventure class');
      ok(await p.evaluate(() => getComputedStyle(document.getElementById('tm-favs')).display !== 'none'), 'classic: favorite tiles visible');
      for (const c of ['bubbles', 'match', 'drums', 'paint', 'stickers', 'lesson', 'me', 'simon', 'animals', 'soccer', 'colors', 'count', 'memory', 'sorting']) {
        await p.evaluate(c => setTCat(c, document.querySelector('.tt-tab[data-tcat="' + c + '"]')), c); await wait(p, 120);
      }
      await shot(p, 'classic-home');
      ok(p.__errors.length === 0, 'classic: no JS errors', p.__errors.join(' | '));
      await p.context().close();
    }

    /* 2. Adventures: world, every place, every activity */
    console.log('Adventures world');
    const p = await t.newPage({ width: 1280, height: 800 });
    await p.goto(t.base + '/'); await enterTM(p);
    ok(await view(p) === 'world', 'enters the world map', await view(p));
    ok(await p.locator('.adv-place').count() === 8, '8 places on the map');
    await shot(p, 'world-1280x800');
    const LOCS = await p.evaluate(() => ADV.LOCS.map(L => ({ id: L.id, acts: L.acts })));
    for (const L of LOCS) {
      await p.locator('.adv-place[data-id="' + L.id + '"]').click({ force: true }); await wait(p, 700);
      ok(await view(p) === 'loc', 'opens place ' + L.id);
      ok(await p.locator('.adv-act').count() === L.acts.length, L.id + ': all activities shown');
      for (const a of L.acts) {
        await p.evaluate(a => ADV.openAct(a), a); await wait(p, 450);
        const info = await p.evaluate(a => {
          const A = ADV.ACTS[a], tm = document.getElementById('tmode');
          let shown = false;
          if (A.kind === 'game') shown = !!document.querySelector('#adv-game .ag') && getComputedStyle(document.getElementById('adv-game')).display !== 'none';
          else { const map = { body: 'match-game', clothes: 'match-game', shapes: 'match-game', food: 'match-game', sports: 'match-game', vehicles: 'match-game', animals: 'match-game', nature: 'match-game', weather: 'match-game', match: 'match-game', simon: 'simon-game', me: 'me-game', colors: 'color-game', count: 'count-game', bubbles: 'bubble-game', soccer: 'soccer-game', lesson: 'lesson-game', memory: 'memory-game', sorting: 'sort-game', paint: 'paint-game', drums: 'punta-pad' }; const el = document.getElementById(map[A.cat]); shown = !!el && getComputedStyle(el).display !== 'none'; }
          return { shown, view: ADV.V.view, bar: !!document.querySelector('#adv-bar [data-adv="repeat"]') };
        }, a);
        ok(info.shown && info.view === 'game' && info.bar, 'activity ' + L.id + '/' + a + ' opens', JSON.stringify(info));
        const before = await p.evaluate(() => window.__spoken.length);
        await p.locator('#adv-bar [data-adv="repeat"]').click({ force: true }); await wait(p, 200);
        const after = await p.evaluate(() => window.__spoken.length);
        ok(after > before, 'repeat button speaks in ' + a);
        await p.locator('#adv-bar [data-adv="back"]').click({ force: true }); await wait(p, 500);
      }
      await p.locator('#adv-bar [data-adv="world"]').click({ force: true }); await wait(p, 500);
    }
    ok(p.__errors.length === 0, 'world/places/activities: no JS errors', p.__errors.join(' | '));

    /* 3. Play every new adventure to the end */
    console.log('New adventures, played to the end');
    const GAMES = [['casa', 'familia'], ['parque', 'globos'], ['cocina', 'cocinar'], ['cocina', 'pulperia'], ['garaje', 'ruidos'], ['jardin', 'animales'], ['sala', 'xilofono'], ['sala', 'juguete']];
    for (const [loc, act] of GAMES) {
      const stars0 = await p.evaluate(() => ADV.prog.stars);
      await p.evaluate(([l, a]) => { ADV.showLoc(l); ADV.openAct(a); }, [loc, act]);
      let celebrated = false;
      for (let i = 0; i < 160 && !celebrated; i++) {
        await wait(p, 250);
        celebrated = await p.evaluate(() => document.getElementById('adv-cele').classList.contains('sh'));
        if (celebrated) break;
        await p.evaluate(a => {
          const G = ADV.GAMES[ADV.ACTS[a].game], ans = G.answer(); if (ans == null) return;
          const root = document.getElementById('adv-game');
          if (a === 'globos') { const b = root.querySelector('.ag-balloon[data-c="' + ans + '"]'); if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return; }
          if (a === 'xilofono') { const b = root.querySelectorAll('.ag-bar')[ans]; if (b) b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return; }
          if (a === 'juguete') { const b = root.querySelector('.ag-spot[data-s="' + ans + '"]'); if (b) b.click(); return; }
          if (ans === 'bowl') { const b = root.querySelector('.ag-bowl'); if (b) b.click(); return; }
          const c = root.querySelector('.ag-card[data-id="' + ans + '"]:not(.used)'); if (c) c.click();
        }, act);
      }
      ok(celebrated, act + ': reaches the celebration');
      ok(await p.evaluate(() => ADV.prog.stars) > stars0, act + ': awards a star');
      if (act === 'globos') { await wait(p, 900); await shot(p, 'celebration'); }
      await p.evaluate(() => ADV.showWorld(false)); await wait(p, 300);
    }
    ok(await p.evaluate(() => Object.keys(ADV.prog.chars).length) >= 5, 'friends unlock in the sticker book');

    /* 4. Wrong answers are gentle */
    console.log('Gentle feedback');
    await p.evaluate(() => { ADV.showLoc('jardin'); ADV.openAct('animales'); }); await wait(p, 2500);
    const wrong = await p.evaluate(() => { const ans = ADV.GAMES.animales.answer(); const w = [...document.querySelectorAll('#adv-game .ag-card')].find(c => c.dataset.id !== ans); if (!w) return null; w.click(); return w.dataset.id; });
    await wait(p, 300);
    const lastSaid = await p.evaluate(() => window.__spoken[window.__spoken.length - 1].t);
    const celeOpen = await p.evaluate(() => document.getElementById('adv-cele').classList.contains('sh'));
    ok(wrong && !/^(no|incorrect|wrong)\b/i.test(lastSaid) && !celeOpen, 'wrong tap: no failure message', lastSaid);

    /* 5. Rapid tapping */
    console.log('Rapid tapping');
    await p.evaluate(() => ADV.showWorld(false)); await wait(p, 300);
    await p.evaluate(() => { for (let i = 0; i < 40; i++) document.querySelectorAll('.adv-place')[i % 8].click(); });
    await wait(p, 600);
    ok(await view(p) === 'loc', 'rapid taps on the map land on one place');
    await p.evaluate(() => { const b = document.querySelector('.adv-act'); for (let i = 0; i < 30; i++) b.click(); }); await wait(p, 600);
    ok(await view(p) === 'game', 'rapid taps on an activity open it once');
    ok(p.__errors.length === 0, 'rapid tapping: no JS errors', p.__errors.join(' | '));
    ok(await p.evaluate(() => window.__overlap) === 0, 'speech never overlaps (every line cancels the previous one)');

    /* 6. Reload: Toddler Mode and progress come back */
    console.log('Reload & persistence');
    const starsBefore = await p.evaluate(() => ADV.prog.stars);
    await p.reload(); await wait(p, 1800);
    ok(await p.evaluate(() => document.getElementById('tmode').classList.contains('act')), 'reload: Toddler Mode restored');
    ok(await view(p) === 'world', 'reload: back on the world map');
    ok(await p.evaluate(() => ADV.prog.stars) === starsBefore, 'reload: stars kept', String(starsBefore));

    /* 7. Theme switching keeps progress */
    console.log('Theme switching');
    await p.evaluate(() => { toggleTM(); goMore('adv'); }); await wait(p, 600);
    ok(await p.locator('#adv-set .advs-th button').count() === 2, 'settings: theme picker shown');
    await shot(p, 'settings');
    await p.evaluate(() => ADV.setOpt('theme', 'classic')); await enterTM(p);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('tm-favs')).display !== 'none' && !document.documentElement.classList.contains('th-adv')), 'switch to classic works');
    await p.evaluate(() => { toggleTM(); ADV.setOpt('theme', 'adventure'); }); await enterTM(p);
    ok(await view(p) === 'world' && await p.evaluate(() => ADV.prog.stars) === starsBefore, 'switch back: world + progress intact');
    await p.evaluate(() => ADV.setOpt('cap', 'es'));
    ok(await p.evaluate(() => document.documentElement.classList.contains('cap-es')), 'Spanish-only captions setting applies');
    await p.evaluate(() => { ADV.setOpt('reduced', true); ADV.showWorld(false); });
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.adv-place')).animationName === 'none'), 'reduced motion stops animations');
    await p.evaluate(() => { ADV.setOpt('reduced', false); ADV.setOpt('cap', 'bili'); ADV.setAct('globos', false); ADV.showLoc('parque'); });
    ok(await p.locator('.adv-act[data-id="globos"]').count() === 0, 'activity toggle hides an activity');
    await p.evaluate(() => ADV.setAct('globos', true));
    ok(p.__errors.length === 0, 'settings: no JS errors', p.__errors.join(' | '));
    await p.context().close();

    /* 7b. Shortcuts from the parent app and English learning mode */
    console.log('Shortcuts & English mode');
    {
      const e = await t.newPage({ width: 1280, height: 800 }, { ls: { v_appLang: JSON.stringify('en') } });
      await e.goto(t.base + '/'); await wait(e, 500);
      await e.evaluate(() => openLessonTM()); await wait(e, 2200);
      const st = await e.evaluate(() => ({ view: ADV.V.view, act: ADV.V.act, loc: ADV.V.loc, lesson: getComputedStyle(document.getElementById('lesson-game')).display }));
      ok(st.view === 'game' && st.act === 'leccion' && st.loc === 'escuela' && st.lesson !== 'none', '"Start lesson" opens the lesson inside La Escuela', JSON.stringify(st));
      await e.evaluate(() => ADV.showWorld(true)); await wait(e, 400);
      const said = await e.evaluate(() => window.__spoken.slice(-1)[0]);
      ok(said && /^Hi/.test(said.t) && /^en/.test(said.lang), 'English learning mode: characters speak English', said && said.t);
      ok(e.__errors.length === 0, 'shortcuts/English: no JS errors', e.__errors.join(' | '));
      await e.context().close();
    }

    /* 8. Missing artwork never breaks play */
    console.log('Missing artwork fallback');
    {
      const q = await t.newPage({ width: 1280, height: 800 });
      await q.route('**/adventure/assets/**', r => r.abort());
      await q.route('**/adventure/art-items.js*', r => r.abort());
      await q.goto(t.base + '/'); await enterTM(q);
      await q.evaluate(() => { ADV.showLoc('cocina'); ADV.openAct('pulperia'); }); await wait(q, 1500);
      ok(await q.locator('#adv-game .ag-card').count() > 0, 'game still renders without item art (emoji fallback)');
      ok(q.__errors.length === 0, 'missing art: no JS errors', q.__errors.join(' | '));
      await q.context().close();
    }

    /* 9. Layout at every required viewport */
    console.log('Viewports');
    for (const [w, h] of VIEWPORTS) {
      const v = await t.newPage({ width: w, height: h });
      await v.goto(t.base + '/'); await enterTM(v);
      const check = async (label) => {
        const r = await v.evaluate(() => {
          const tm = document.getElementById('tmode');
          const small = [...tm.querySelectorAll('#adv-root button')].filter(b => b.offsetParent && getComputedStyle(b).visibility !== 'hidden').map(b => b.getBoundingClientRect()).filter(r => r.width > 0 && (r.width < 44 || r.height < 44)).length;
          return { hs: tm.scrollWidth > tm.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1, small };
        });
        ok(!r.hs, `${w}x${h} ${label}: no horizontal scroll`);
        ok(r.small === 0, `${w}x${h} ${label}: touch targets ≥ 44px`, r.small + ' small');
      };
      await check('world'); await shot(v, `world-${w}x${h}`);
      await v.evaluate(() => ADV.showLoc('casa')); await wait(v, 600); await check('place'); await shot(v, `place-${w}x${h}`);
      await v.evaluate(() => ADV.openAct('familia')); await wait(v, 1200); await check('game'); await shot(v, `game-${w}x${h}`);
      ok(v.__errors.length === 0, `${w}x${h}: no JS errors`, v.__errors.join(' | '));
      await v.context().close();
    }

    /* 10. Private pack import (only when a zip is provided locally) */
    if (process.env.PACK_ZIP && fs.existsSync(process.env.PACK_ZIP)) {
      console.log('Private pack import');
      const k = await t.newPage({ width: 1280, height: 800 });
      await k.goto(t.base + '/'); await wait(k, 500);
      await k.evaluate(() => goMore('adv')); await wait(k, 500);
      await k.setInputFiles('#adv-set input[type=file][accept^=".zip"]', process.env.PACK_ZIP);
      await k.waitForFunction(() => /Done:/.test((document.querySelector('.advs-busy') || {}).textContent || ''), null, { timeout: 30000 }).catch(() => {});
      const msg = await k.evaluate(() => (document.querySelector('.advs-busy') || {}).textContent || '');
      ok(/Done: 6 characters/.test(msg), 'zip import: 6 characters saved on device', msg);
      await enterTM(k);
      ok(await k.evaluate(() => !!document.querySelector('.adv-guide .adv-char.is-pack img[src^="blob:"]')), 'world uses the private character');
      await k.evaluate(() => ADV.showLoc('garaje')); await wait(k, 600);
      await shot(k, 'private-pack-place');
      await k.reload(); await wait(k, 1800);
      ok(await k.evaluate(() => !!(ADV.pack && ADV.pack.source === 'device')), 'private pack persists across reloads');
      await k.evaluate(() => ADV.clearPack()); await wait(k, 300);
      ok(await k.evaluate(() => ADV.pack === null), 'private pack can be removed');
      ok(k.__errors.length === 0, 'pack import: no JS errors', k.__errors.join(' | '));
      await k.context().close();
    } else console.log('(skipping private pack import: set PACK_ZIP to test it)');
  } catch (e) { fail++; failures.push('crash: ' + (e && e.stack || e)); console.error(e); }
  await t.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log(failures.map(f => ' - ' + f).join('\n')); process.exit(1); }
})();
