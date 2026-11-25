/* Shared Playwright helpers for the ¡Vamos! tests.
   - Seeds a parent profile so onboarding and the tour are skipped.
   - Replaces speechSynthesis with a recorder so tests can see every utterance and check that
     two voices never play at once (the real engine is not available in headless Chromium). */
const { chromium } = require('playwright');
const { start } = require('./serve');

const SPEECH_MOCK = `
(function(){
  window.__spoken=[];window.__overlap=0;var active=null;
  var synth={speaking:false,pending:false,paused:false,onvoiceschanged:null,
    getVoices:function(){return [];},
    cancel:function(){if(active){var a=active;active=null;synth.speaking=false;if(a.onend)setTimeout(function(){a.onend({});},0);}},
    speak:function(u){
      if(active)window.__overlap++;
      active=u;synth.speaking=true;
      window.__spoken.push({t:u.text,lang:u.lang,vol:u.volume,at:Date.now()});
      var dur=Math.min(400,60+u.text.length*8);
      setTimeout(function(){if(active===u){active=null;synth.speaking=false;if(u.onend)u.onend({});}},dur);
    },
    pause:function(){},resume:function(){}};
  try{Object.defineProperty(window,'speechSynthesis',{value:synth,configurable:true});}catch(e){window.speechSynthesis=synth;}
  if(!window.SpeechSynthesisUtterance){window.SpeechSynthesisUtterance=function(t){this.text=t;};}
})();`;

async function setup(opts) {
  opts = opts || {};
  const server = await start(0);
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  async function newPage(viewport, extra) {
    extra = extra || {};
    const ctx = await browser.newContext(Object.assign({ viewport: viewport || { width: 1280, height: 800 }, deviceScaleFactor: 1, hasTouch: true }, extra.ctx || {}));
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); // offline-friendly, deterministic
    await ctx.addInitScript(SPEECH_MOCK);
    if (extra.seed !== false) {
      await ctx.addInitScript(function (ls) {
        if (sessionStorage.getItem('__seeded')) return;
        sessionStorage.setItem('__seeded', '1');
        localStorage.setItem('v_profile', JSON.stringify({ name: 'Mami', child: 'Mateo', age: 3, level: 0, role: 'mami' }));
        localStorage.setItem('v_walkDone', 'true');
        Object.keys(ls || {}).forEach(function (k) { localStorage.setItem(k, ls[k]); });
      }, extra.ls || {});
    }
    const page = await ctx.newPage();
    page.__errors = [];
    page.on('pageerror', e => page.__errors.push(String(e && e.stack || e)));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) page.__errors.push('console: ' + m.text()); });
    return page;
  }
  async function close() { await browser.close(); server.close(); }
  return { base, browser, newPage, close };
}

module.exports = { setup };
