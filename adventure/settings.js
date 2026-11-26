/* ¡Vamos! Aventuras — Parent settings (More → Theme & Adventures). Lives in the parent app, which a toddler can
   only reach by holding "Hold to Exit" for 3 seconds, so nothing here is reachable from Toddler Mode. */
(function () {
  var ADV = window.ADV;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function seg(key, opts) {
    return '<div class="advs-seg">' + opts.map(function (o) { return '<button class="' + (ADV.set[key] === o[0] ? 'on' : '') + '" onclick="ADV.setOpt(\'' + key + '\',\'' + o[0] + '\')">' + o[1] + '</button>'; }).join('') + '</div>';
  }
  function tog(key, label, sub) {
    return '<label class="advs-row"><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><input type="checkbox" ' + (ADV.set[key] ? 'checked' : '') + ' onchange="ADV.setOpt(\'' + key + '\',this.checked)"></label>';
  }
  var busy = '';
  ADV.settingsHTML = function () {
    var S = ADV.set, P = ADV.prog, pk = ADV.pack, h = '';
    h += '<style>.advs-seg{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.advs-seg button{flex:1;min-width:110px;padding:10px 8px;border-radius:12px;background:var(--grl);font-weight:700;font-size:13px;color:var(--ink);border:2px solid transparent}.advs-seg button.on{background:var(--ink);color:var(--gold)}'
      + '.advs-th{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}.advs-th button{border-radius:16px;border:3px solid var(--bd);background:var(--w);padding:8px;text-align:center;font-weight:800;color:var(--ink);font-size:14px}.advs-th button.on{border-color:var(--teal);box-shadow:0 0 0 3px var(--teall)}.advs-th .pv{height:96px;display:flex;align-items:flex-end;justify-content:center;gap:4px;border-radius:12px;background:linear-gradient(#BFE7FF,#E9F8FF 60%,#BDE6A0 60%);margin-bottom:6px;overflow:hidden}.advs-th .pv svg{height:88px;width:auto}.advs-th .pv img{height:96px}'
      + '.advs-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--grl)}.advs-row small{display:block;font-weight:500;color:var(--gr);font-size:12px}.advs-row input[type=checkbox]{width:26px;height:26px;flex:none}.advs-row input[type=range]{width:46%}'
      + '.advs-loc{margin-top:8px}.advs-loc h4{font-size:13px;margin:8px 0 2px;color:var(--teal)}.advs-acts{display:flex;flex-wrap:wrap;gap:6px}.advs-acts label{display:flex;align-items:center;gap:6px;background:var(--grl);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}'
      + '.advs-ch{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--grl)}.advs-ch .im{width:64px;height:64px;border-radius:12px;background:var(--grl);display:flex;align-items:center;justify-content:center;overflow:hidden}.advs-ch .im img,.advs-ch .im svg{width:100%;height:100%;object-fit:contain}.advs-ch input[type=text]{width:100%;padding:8px;border-radius:10px;border:2px solid var(--bd);font-size:14px}.advs-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.advs-btns label,.advs-btns button{padding:7px 12px;border-radius:999px;background:var(--teall);color:var(--teal);font-weight:800;font-size:12px;cursor:pointer;border:none}.advs-btns .rm{background:var(--terral);color:var(--terra)}.advs-btns input{display:none}.advs-note{font-size:12px;color:var(--gr);line-height:1.5;margin-top:6px}.advs-busy{padding:8px 12px;border-radius:10px;background:var(--goldl);font-weight:700;font-size:13px;margin-top:8px}</style>';

    // Theme
    h += '<div class="card hl-gold"><h3>🎨 Toddler Mode theme</h3><p style="font-size:13px;">Switching themes keeps all progress, stickers and settings.</p><div class="advs-th">'
      + '<button class="' + (S.theme === 'adventure' ? 'on' : '') + '" onclick="ADV.setOpt(\'theme\',\'adventure\')"><div class="pv">' + ADV_ART.building('casa') + '<div style="height:88px;width:66px">' + ADV_ART.char(ADV.BUILTIN.explorer.art, { pose: 'wave' }) + '</div></div>' + esc(ADV.THEMES.adventure.name.es) + '<small style="display:block;font-weight:500;color:var(--gr);font-size:11px">Illustrated neighborhood</small></button>'
      + '<button class="' + (S.theme === 'classic' ? 'on' : '') + '" onclick="ADV.setOpt(\'theme\',\'classic\')"><div class="pv" style="background:var(--gold)"><img src="/icons/toddler-splash.webp" alt=""></div>' + esc(ADV.THEMES.classic.name.es) + '<small style="display:block;font-weight:500;color:var(--gr);font-size:11px">Original big buttons</small></button>'
      + '</div><button onclick="toggleTM()" style="margin-top:12px;width:100%;padding:12px;border-radius:50px;background:var(--ink);color:var(--gold);font-weight:800;font-size:15px;">▶ Open Toddler Mode</button></div>';

    // Language & sound
    h += '<div class="card"><h3>🗣️ Language & sound</h3>'
      + '<div class="advs-row" style="display:block"><b>Text on screen</b><small>Narration is always one language (Spanish while learning Spanish).</small>'
      + seg('cap', [['es', 'Spanish only'], ['bili', 'Spanish + English'], ['full', '+ pronunciation']]) + '</div>'
      + '<label class="advs-row"><span><b>Voice volume</b><small>Character narration</small></span><input type="range" min="0" max="1" step="0.1" value="' + S.nar + '" onchange="ADV.setOpt(\'nar\',+this.value);speak(TL(\'¡Hola! ¿Vamos a jugar?\',\'Hi! Shall we play?\'),appLang)"></label>'
      + '<label class="advs-row"><span><b>Sound effects</b><small>Pops, chimes and the xylophone</small></span><input type="range" min="0" max="1" step="0.1" value="' + S.sfx + '" onchange="ADV.setOpt(\'sfx\',+this.value);ADV.sfx.yes()"></label>'
      + tog('reduced', 'Reduced motion', 'Turns off floating, bouncing and confetti.')
      + tog('daily', 'Daily adventure', 'One place sparkles each day (a bonus star, never a streak).')
      + '<div class="advs-row" style="display:block"><b>Difficulty</b><small>New adventures only: number of choices and how high we count.</small>' + seg('diff', [['easy', 'Easy (2–3 yrs)'], ['normal', 'Normal (3–4 yrs)']]) + '</div></div>';

    // Activities
    h += '<div class="card"><h3>🧩 Activities</h3><p style="font-size:13px;">Untick anything you do not want in the neighborhood. A place with nothing ticked disappears from the map.</p>';
    ADV.LOCS.forEach(function (L) {
      h += '<div class="advs-loc"><h4>' + esc(L.name.es) + ' · ' + esc(L.name.en) + '</h4><div class="advs-acts">' + L.acts.map(function (a) {
        return '<label><input type="checkbox" ' + (ADV.actOn(a) ? 'checked' : '') + ' onchange="ADV.setAct(\'' + a + '\',this.checked)">' + esc(ADV.ACTS[a].t.es) + '</label>';
      }).join('') + '</div></div>';
    });
    h += '</div>';

    // Private characters
    var src = !pk ? 'None — using the built-in original cast.' : pk.source === 'device' ? 'Private pack stored on this device.' : 'Private pack loaded from this build\'s private-pack folder.';
    h += '<div class="card hl-teal"><h3>🔒 Private characters</h3>'
      + '<p class="advs-note"><b>Stays on this device.</b> Images you add here are saved in this browser\'s storage on this tablet only. They are never uploaded to GitHub, Vercel or anywhere else, and they are not part of the public website. Clearing the browser/app data removes them.</p>'
      + '<p style="font-size:13px;margin-top:6px"><b>Status:</b> ' + esc(src) + '</p>'
      + (busy ? '<div class="advs-busy">' + esc(busy) + '</div>' : '')
      + '<div class="advs-btns"><label>📦 Import artwork pack (.zip)<input type="file" accept=".zip,application/zip" onchange="ADV.onPickZip(this)"></label>'
      + (pk && pk.source === 'device' ? '<button class="rm" onclick="if(confirm(\'Remove all private characters and scenes from this device?\'))ADV.clearPack().then(ADV.refreshSettings)">Remove private pack</button>' : '') + '</div>'
      + '<p class="advs-note">Or set each character by hand (PNG/WebP with a transparent background works best; it is shrunk to save space).</p>';
    ADV.ROLES.forEach(function (r) {
      var c = pk && pk.chars && pk.chars[r], has = !!(c && c.img && Object.keys(c.img).length);
      h += '<div class="advs-ch"><div class="im">' + ADV.stickerHTML(r) + '</div><div><b style="font-size:13px">' + esc(ADV.ROLE_INFO[r].en) + '</b>'
        + '<input type="text" placeholder="Name (built-in: ' + esc(ADV.BUILTIN[r].name) + ')" value="' + esc(c && c.name || '') + '" onchange="ADV.setPackName(\'' + r + '\',this.value).then(ADV.refreshSettings)">'
        + '<div class="advs-btns"><label>Choose image<input type="file" accept="image/*" onchange="ADV.onPickImg(this,{role:\'' + r + '\',pose:\'idle\'})"></label>'
        + '<label>Cheer pose<input type="file" accept="image/*" onchange="ADV.onPickImg(this,{role:\'' + r + '\',pose:\'celebrate\'})"></label>'
        + (has && pk.source === 'device' ? '<button class="rm" onclick="ADV.clearPackPart({role:\'' + r + '\'}).then(ADV.refreshSettings)">Use built-in</button>' : '') + '</div></div></div>';
    });
    h += '<p class="advs-note" style="margin-top:10px"><b>Story pictures</b> (optional): a picture shown on a place\'s screen. It is decoration only, not part of a game.</p><div class="advs-acts">';
    ADV.LOCS.forEach(function (L) {
      var has = !!ADV.sceneFor(L.id);
      h += '<label style="cursor:pointer">' + (has ? '✅ ' : '＋ ') + esc(L.name.es) + '<input type="file" accept="image/*" style="display:none" onchange="ADV.onPickImg(this,{scene:\'' + L.id + '\'})"></label>'
        + (has && pk.source === 'device' ? '<button class="rm" style="border-radius:999px;padding:6px 10px;font-size:12px;background:var(--terral);color:var(--terra);font-weight:800" onclick="ADV.clearPackPart({scene:\'' + L.id + '\'}).then(ADV.refreshSettings)">✕</button>' : '');
    });
    h += '</div>' + tog('folderPack', 'Look for a private-pack folder', 'For private builds that ship a git-ignored /private-pack/ folder. Harmless if none exists.') + '</div>';

    // Progress
    var friends = ADV.ROLES.filter(function (r) { return P.chars && P.chars[r]; }).length;
    h += '<div class="card"><h3>⭐ Adventure progress</h3><p style="font-size:13px;">Stars: <b>' + (P.stars || 0) + '</b> · Friends in the sticker book: <b>' + friends + ' of 6</b> · Rewards: <b>' + Object.keys(P.rw || {}).length + ' of 8</b></p>'
      + '<p class="advs-note">No streaks, no timers, nothing is ever lost. Resetting clears only the Adventures stars and sticker book (not your lessons, flashcards or the classic stickers).</p>'
      + '<button onclick="if(confirm(\'Reset Adventures stars and sticker book?\')){ADV.resetProg();ADV.refreshSettings();}" style="margin-top:8px;padding:10px 18px;border-radius:50px;background:var(--terral);color:var(--terra);font-weight:800;font-size:13px;">Reset Adventures progress</button></div>';
    return h;
  };
  ADV.refreshSettings = function () { var el = document.getElementById('adv-set'); if (el) el.innerHTML = ADV.settingsHTML(); };
  ADV.setOpt = function (k, v) {
    ADV.set[k] = v; ADV.saveSet();
    if (k === 'folderPack') ADV.reloadPack().then(ADV.refreshSettings);
    ADV.refreshSettings();
    if (typeof showSaved === 'function') showSaved();
  };
  ADV.setAct = function (id, on) { ADV.set.off = ADV.set.off || {}; if (on) delete ADV.set.off[id]; else ADV.set.off[id] = 1; ADV.saveSet(); if (typeof showSaved === 'function') showSaved(); };
  ADV.onPickImg = function (input, target) {
    var f = input.files && input.files[0]; if (!f) return;
    busy = 'Saving picture…'; ADV.refreshSettings();
    ADV.importImage(f, target).then(function () { busy = ''; ADV.refreshSettings(); }).catch(function () { busy = 'That picture could not be saved on this device.'; ADV.refreshSettings(); });
  };
  ADV.onPickZip = function (input) {
    var f = input.files && input.files[0]; if (!f) return;
    busy = 'Reading the pack…'; ADV.refreshSettings();
    ADV.importZip(f, function (d, n) { busy = 'Saving ' + d + ' of ' + n + '…'; var el = document.querySelector('.advs-busy'); if (el) el.textContent = busy; })
      .then(function (r) { busy = 'Done: ' + r.chars + ' characters and ' + r.scenes + ' story pictures saved on this device.'; ADV.refreshSettings(); })
      .catch(function (e) {
        var m = String(e && e.message);
        busy = m === 'nomanifest' ? 'That zip has no manifest.json (use the ¡Vamos! artwork pack format).'
          : m === 'unsupported' ? 'This browser cannot unzip here. Add the character pictures one by one below instead.'
          : 'Could not import that file.';
        ADV.refreshSettings();
      });
  };
  // Pack status is async: refresh the page once it is known.
  ADV.loadPack().then(function () { ADV.refreshSettings(); });
})();
