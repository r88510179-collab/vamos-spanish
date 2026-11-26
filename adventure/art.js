/* ¡Vamos! Aventuras — built-in ORIGINAL artwork (inline SVG, no image files, works offline).
   - ADV_ART.char(id, {pose, mood, talk})  → the original cast (see CAST in theme.js)
       pose: 'idle' | 'wave' | 'cheer'      mood: 'happy' | 'sad' | 'angry' | 'surprised' | 'sleepy'
   - ADV_ART.building(id)                  → the 8 neighborhood locations
   - ADV_ART.world()                       → decorative backdrop for the neighborhood map
   - ADV_ART.balloon(color)                → balloon for Globos Arriba
   Every drawing avoids ids/gradients so many copies can share one page.
   Private (user-owned) character art never lives here: it is loaded on the device by theme.js. */
(function () {
  var O = '#304B5C'; // matches the outline color of the ¡Vamos! artwork pack
  function st(w) { return 'stroke="' + O + '" stroke-width="' + (w || 5) + '" stroke-linejoin="round" stroke-linecap="round"'; }

  /* ---------- shared body parts ---------- */
  function eyes(m, y) {
    y = y || 86;
    var s = '<g class="eyes">';
    [80, 120].forEach(function (x, i) {
      if (m === 'sleepy') { s += '<path d="M' + (x - 10) + ' ' + y + ' Q' + x + ' ' + (y + 9) + ' ' + (x + 10) + ' ' + y + '" fill="none" ' + st(4.5) + '/>'; return; }
      var rx = m === 'surprised' ? 13 : 12, ry = m === 'surprised' ? 16 : 14, pr = m === 'surprised' ? 5 : 6.5;
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" ' + st(4) + '/>';
      s += '<circle cx="' + (x + (i ? -1 : 2)) + '" cy="' + (y + 3) + '" r="' + pr + '" fill="' + O + '"/>';
      s += '<circle cx="' + (x + (i ? 1 : 4)) + '" cy="' + (y) + '" r="2.4" fill="#fff"/>';
    });
    s += '</g>';
    if (m === 'sad') s += '<path d="M68 ' + (y - 18) + ' L88 ' + (y - 24) + 'M112 ' + (y - 24) + ' L132 ' + (y - 18) + '" ' + st(4.5) + '/><path d="M128 ' + (y + 14) + ' q-4 8 0 11 q4 -3 0 -11z" fill="#7CC4F2" ' + st(2) + '/>';
    if (m === 'angry') s += '<path d="M68 ' + (y - 25) + ' L90 ' + (y - 16) + 'M110 ' + (y - 16) + ' L132 ' + (y - 25) + '" ' + st(5) + '/>';
    if (m === 'surprised') s += '<path d="M68 ' + (y - 24) + ' Q80 ' + (y - 32) + ' 92 ' + (y - 24) + 'M108 ' + (y - 24) + ' Q120 ' + (y - 32) + ' 132 ' + (y - 24) + '" fill="none" ' + st(4) + '/>';
    return s;
  }
  function cheeks(y, m) {
    y = (y || 86) + 20;
    var op = m === 'angry' ? .8 : .45, col = m === 'angry' ? '#FF6B6B' : '#FF8FA3';
    return '<ellipse cx="68" cy="' + y + '" rx="9" ry="6" fill="' + col + '" opacity="' + op + '"/><ellipse cx="132" cy="' + y + '" rx="9" ry="6" fill="' + col + '" opacity="' + op + '"/>';
  }
  function mouth(m, talk, y) {
    y = y || 114;
    if (talk || m === 'excited') return '<path d="M86 ' + y + ' Q100 ' + (y + 24) + ' 114 ' + y + ' Z" fill="#8A2F45" ' + st(4) + '/><ellipse cx="100" cy="' + (y + 11) + '" rx="7" ry="4" fill="#FF8FA3"/>';
    if (m === 'sad') return '<path d="M89 ' + (y + 8) + ' Q100 ' + (y - 2) + ' 111 ' + (y + 8) + '" fill="none" ' + st(4.5) + '/>';
    if (m === 'angry') return '<path d="M89 ' + (y + 6) + ' Q100 ' + (y) + ' 111 ' + (y + 6) + '" fill="none" ' + st(4.5) + '/>';
    if (m === 'surprised') return '<ellipse cx="100" cy="' + (y + 6) + '" rx="6.5" ry="8.5" fill="#8A2F45" ' + st(3.5) + '/>';
    if (m === 'sleepy') return '<path d="M94 ' + (y + 3) + ' Q100 ' + (y + 7) + ' 106 ' + (y + 3) + '" fill="none" ' + st(4) + '/>';
    return '<path d="M87 ' + y + ' Q100 ' + (y + 12) + ' 113 ' + y + '" fill="none" ' + st(4.5) + '/>';
  }
  function arm(side, ang, fill, paw, wing) {
    var sx = side === 'l' ? 62 : 138, sy = 148;
    var inner = wing
      ? '<ellipse cx="' + sx + '" cy="' + (sy + 24) + '" rx="13" ry="28" fill="' + fill + '" ' + st(4.5) + '/>' + (paw ? '<ellipse cx="' + sx + '" cy="' + (sy + 42) + '" rx="9" ry="11" fill="' + paw + '" ' + st(3) + '/>' : '')
      : '<rect x="' + (sx - 9.5) + '" y="' + sy + '" width="19" height="46" rx="9.5" fill="' + fill + '" ' + st(4.5) + '/><circle cx="' + sx + '" cy="' + (sy + 40) + '" r="10" fill="' + paw + '" ' + st(4) + '/>';
    return '<g class="arm arm-' + side + '" style="transform-origin:' + sx + 'px ' + sy + 'px"><g transform="rotate(' + ang + ' ' + sx + ' ' + sy + ')">' + inner + '</g></g>';
  }
  function arms(c, pose) {
    var l = pose === 'cheer' ? 150 : 24, r = (pose === 'cheer' || pose === 'wave') ? -150 : -24;
    return arm('l', l, c.arm, c.paw, c.wing) + arm('r', r, c.arm, c.paw, c.wing);
  }
  function body(c) {
    return '<ellipse cx="100" cy="226" rx="54" ry="8" fill="#000" opacity=".1"/>'
      + '<ellipse cx="80" cy="214" rx="17" ry="10" fill="' + c.foot + '" ' + st(4.5) + '/><ellipse cx="120" cy="214" rx="17" ry="10" fill="' + c.foot + '" ' + st(4.5) + '/>'
      + '<ellipse cx="100" cy="172" rx="' + (c.wide || 42) + '" ry="44" fill="' + c.body + '" ' + st() + '/>'
      + '<ellipse cx="100" cy="182" rx="' + ((c.wide || 42) - 16) + '" ry="27" fill="' + c.belly + '"/>';
  }
  function head(c, extra) { return '<circle cx="100" cy="92" r="52" fill="' + c.head + '" ' + st() + '/>' + (extra || ''); }

  /* ---------- the original cast ---------- */
  var C = {};
  // Nico — golden puppy with floppy ears and a red bandana (explorer, sports)
  C.nico = {
    head: '#F4B942', body: '#F4B942', belly: '#FFF1D6', arm: '#F4B942', paw: '#FFF1D6', foot: '#FFF1D6',
    back: function () { return '<g class="tail" style="transform-origin:136px 190px"><path d="M136 190 C160 186 170 164 162 146" fill="none" stroke="' + O + '" stroke-width="17" stroke-linecap="round"/><path d="M136 190 C160 186 170 164 162 146" fill="none" stroke="#F4B942" stroke-width="8" stroke-linecap="round"/></g>'
      + '<path d="M90 44 Q92 26 100 36 Q106 24 112 44 Z" fill="#F4B942" ' + st(4) + '/>'; },
    front: function () {
      return '<path d="M64 134 Q100 148 136 134 L120 152 Q100 170 80 152 Z" fill="#E5484D" ' + st(4.5) + '/><circle cx="92" cy="148" r="2.6" fill="#fff"/><circle cx="104" cy="152" r="2.6" fill="#fff"/><circle cx="112" cy="144" r="2.6" fill="#fff"/>';
    },
    face: function (m, talk) {
      return '<ellipse cx="100" cy="110" rx="27" ry="20" fill="#FFF1D6"/>'
        + '<path d="M56 58 C34 62 28 102 40 124 C47 134 61 127 63 112 C65 94 67 72 56 58 Z" fill="#A8662E" ' + st(4.5) + '/>'
        + '<path d="M144 58 C166 62 172 102 160 124 C153 134 139 127 137 112 C135 94 133 72 144 58 Z" fill="#A8662E" ' + st(4.5) + '/>'
        + eyes(m, 84) + cheeks(84, m) + mouth(m, talk, 114)
        + '<path d="M100 106 L100 113" ' + st(3.5) + '/><ellipse cx="100" cy="101" rx="9" ry="6.5" fill="' + O + '"/><ellipse cx="97" cy="99" rx="3" ry="1.8" fill="#fff" opacity=".7"/>';
    }
  };
  // Lula — lavender bunny with a yellow bow (colors, shapes, counting, matching)
  C.lula = {
    head: '#CDB8F5', body: '#CDB8F5', belly: '#FFF8FF', arm: '#CDB8F5', paw: '#FFF8FF', foot: '#FFF8FF',
    back: function () {
      return '<circle cx="142" cy="198" r="13" fill="#FFF8FF" ' + st(4) + '/>'
        + '<g class="ear-l" style="transform-origin:80px 50px"><g transform="rotate(-12 80 50)"><ellipse cx="80" cy="6" rx="15" ry="42" fill="#CDB8F5" ' + st() + '/><ellipse cx="80" cy="10" rx="7" ry="29" fill="#F9B8D0"/></g></g>'
        + '<g class="ear-r" style="transform-origin:120px 50px"><g transform="rotate(12 120 50)"><ellipse cx="120" cy="6" rx="15" ry="42" fill="#CDB8F5" ' + st() + '/><ellipse cx="120" cy="10" rx="7" ry="29" fill="#F9B8D0"/></g></g>';
    },
    front: function () { return ''; },
    face: function (m, talk) {
      return '<circle cx="91" cy="107" r="12" fill="#FFF8FF"/><circle cx="109" cy="107" r="12" fill="#FFF8FF"/>'
        + eyes(m, 82) + cheeks(84, m) + mouth(m, talk, 118)
        + (talk || m === 'excited' || m === 'surprised' ? '' : '<rect x="95" y="111" width="10" height="8" rx="2" fill="#fff" ' + st(2.5) + '/>')
        + '<path d="M93 99 Q100 95 107 99 Q104 106 100 107 Q96 106 93 99 Z" fill="#FF7EA8" ' + st(3) + '/>'
        + '<g transform="translate(122 44) rotate(14)"><path d="M0 0 L-16 -9 L-16 9 Z M0 0 L16 -9 L16 9 Z" fill="#FFD23F" ' + st(3.5) + '/><circle r="5" fill="#FFB800" ' + st(3) + '/></g>';
    }
  };
  // Tío Oso — friendly bear in a blue cap and overalls (vehicles, building, problem-solving)
  C.oso = {
    head: '#B47C51', body: '#B47C51', belly: '#EBCFA8', arm: '#B47C51', paw: '#EBCFA8', foot: '#8C5A36', wide: 46,
    back: function () { return '<circle cx="58" cy="52" r="18" fill="#B47C51" ' + st() + '/><circle cx="58" cy="52" r="9" fill="#EBCFA8"/><circle cx="142" cy="52" r="18" fill="#B47C51" ' + st() + '/><circle cx="142" cy="52" r="9" fill="#EBCFA8"/>'; },
    front: function () {
      return '<path d="M56 176 L144 176 L144 186 C144 218 56 218 56 186 Z" fill="#3B7DD8" ' + st(4.5) + '/>'
        + '<path d="M80 136 L80 176 M120 136 L120 176" stroke="#3B7DD8" stroke-width="9" stroke-linecap="round"/><circle cx="80" cy="172" r="4.5" fill="#FFD23F" ' + st(2.5) + '/><circle cx="120" cy="172" r="4.5" fill="#FFD23F" ' + st(2.5) + '/>'
        + '<rect x="90" y="186" width="20" height="14" rx="3" fill="#2F66B8" ' + st(3) + '/>';
    },
    face: function (m, talk) {
      return '<ellipse cx="100" cy="111" rx="28" ry="20" fill="#EBCFA8"/>'
        + eyes(m, 84) + cheeks(84, m) + mouth(m, talk, 115)
        + '<path d="M100 107 L100 114" ' + st(3.5) + '/><ellipse cx="100" cy="101" rx="10" ry="7" fill="' + O + '"/><ellipse cx="96" cy="99" rx="3.4" ry="2" fill="#fff" opacity=".7"/>'
        + '<path d="M50 68 C54 26 146 26 150 68 Q100 56 50 68 Z" fill="#3B7DD8" ' + st(4.5) + '/><path d="M140 66 Q168 62 180 74 Q160 80 136 74 Z" fill="#2F66B8" ' + st(4) + '/><circle cx="100" cy="33" r="5" fill="#2F66B8" ' + st(3) + '/>';
    }
  };
  // Doña Pata — cheerful duck in a mint apron with a flower (kitchen, family, feelings)
  C.pata = {
    head: '#FFFDF6', body: '#FFFDF6', belly: '#FFF3DA', arm: '#FFFDF6', paw: null, foot: '#FF9F43', wing: true,
    back: function () { return '<path d="M94 44 Q86 22 98 30 Q102 16 108 32 Q118 24 112 44 Z" fill="#FFFDF6" ' + st(4) + '/>'; },
    front: function () {
      return '<path d="M86 132 Q100 140 114 132" fill="none" stroke="#5DBB95" stroke-width="5"/>'
        + '<path d="M72 150 L128 150 L134 206 Q100 216 66 206 Z" fill="#8FD6B4" ' + st(4.5) + '/>'
        + '<path d="M72 150 L128 150" stroke="#fff" stroke-width="4"/><rect x="88" y="176" width="24" height="16" rx="4" fill="#B9EBD3" ' + st(3) + '/>';
    },
    face: function (m, talk) {
      var beak = (talk || m === 'excited')
        ? '<path d="M78 104 Q100 92 122 104 Q118 113 100 113 Q82 113 78 104 Z" fill="#FF9F43" ' + st(4) + '/><path d="M84 116 Q100 136 116 116 Q100 120 84 116 Z" fill="#FF9F43" ' + st(4) + '/><path d="M86 114 Q100 118 114 114 Q100 124 86 114 Z" fill="#8A2F45"/>'
        : '<path d="M78 106 Q100 94 122 106 Q122 120 100 122 Q78 120 78 106 Z" fill="#FF9F43" ' + st(4) + '/><path d="M82 110 Q100 116 118 110" fill="none" ' + st(3) + '/>';
      if (m === 'sad') beak += '<path d="M68 64 L88 58 M112 58 L132 64" ' + st(4.5) + '/>';
      return eyes(m === 'sad' ? 'happy' : m, 82) + cheeks(84, m) + beak
        + '<g transform="translate(138 54)"><circle cx="0" cy="-8" r="6" fill="#FF8FC8" ' + st(2.5) + '/><circle cx="8" cy="-2" r="6" fill="#FF8FC8" ' + st(2.5) + '/><circle cx="5" cy="7" r="6" fill="#FF8FC8" ' + st(2.5) + '/><circle cx="-5" cy="7" r="6" fill="#FF8FC8" ' + st(2.5) + '/><circle cx="-8" cy="-2" r="6" fill="#FF8FC8" ' + st(2.5) + '/><circle r="4.5" fill="#FFD23F" ' + st(2.5) + '/></g>';
    }
  };
  // Mimí — peach striped cat with a red beret (painting, music, creativity)
  C.mimi = {
    head: '#FFB98A', body: '#FFB98A', belly: '#FFE8D6', arm: '#FFB98A', paw: '#FFE8D6', foot: '#FFE8D6',
    back: function () {
      return '<g class="tail" style="transform-origin:134px 196px"><path d="M134 196 C168 196 172 160 160 142" fill="none" stroke="' + O + '" stroke-width="17" stroke-linecap="round"/><path d="M134 196 C168 196 172 160 160 142" fill="none" stroke="#FFB98A" stroke-width="8" stroke-linecap="round"/></g>'
        + '<path d="M56 74 L60 26 L96 50 Z" fill="#FFB98A" ' + st() + '/><path d="M64 62 L66 38 L84 50 Z" fill="#FF9FB6"/>'
        + '<path d="M144 74 L140 26 L104 50 Z" fill="#FFB98A" ' + st() + '/><path d="M136 62 L134 38 L116 50 Z" fill="#FF9FB6"/>';
    },
    front: function () { return '<path d="M86 210 Q100 202 114 210" fill="none" stroke="#F08A4B" stroke-width="5" stroke-linecap="round"/>'; },
    face: function (m, talk) {
      var mm = (talk || m === 'excited' || m !== 'happy') ? mouth(m, talk, 113) : '<path d="M89 112 Q94 118 100 112 Q106 118 111 112" fill="none" ' + st(4) + '/>';
      return '<path d="M100 44 L100 58 M88 48 L91 58 M112 48 L109 58" stroke="#F08A4B" stroke-width="5" stroke-linecap="round"/>'
        + '<ellipse cx="100" cy="108" rx="19" ry="13" fill="#FFE8D6"/>'
        + eyes(m, 84) + cheeks(84, m) + mm
        + '<path d="M95 101 L105 101 L100 107 Z" fill="#FF7E9D" ' + st(3) + '/>'
        + '<path d="M80 106 L56 102 M80 112 L56 116 M120 106 L144 102 M120 112 L144 116" stroke="' + O + '" stroke-width="2.5" stroke-linecap="round"/>'
        + '<g transform="rotate(-14 86 46)"><ellipse cx="86" cy="46" rx="36" ry="13" fill="#E5484D" ' + st(4.5) + '/><rect x="82" y="26" width="7" height="9" rx="3" fill="#E5484D" ' + st(3) + '/></g>';
    }
  };
  // Coco — scarlet macaw (guacamaya, Honduras' national bird) (animals, nature)
  C.coco = {
    head: '#E8433A', body: '#E8433A', belly: '#F26B5E', arm: '#FFD23F', paw: '#3D8BE8', foot: '#9A8F9E', wing: true,
    back: function () {
      return '<path d="M118 188 Q150 196 162 226 Q146 228 132 214 Q122 204 112 198 Z" fill="#3D8BE8" ' + st(4) + '/><path d="M110 194 Q134 210 140 232 Q124 230 116 218 Q108 208 102 200 Z" fill="#E8433A" ' + st(4) + '/>'
        + '<path d="M88 46 Q78 16 96 26 Q100 8 108 28 Q124 16 114 46 Z" fill="#E8433A" ' + st(4) + '/>';
    },
    front: function () { return '<path d="M74 160 Q100 150 126 160" fill="none" stroke="#FFD23F" stroke-width="6" stroke-linecap="round" opacity=".9"/>'; },
    face: function (m, talk) {
      var beak = (talk || m === 'excited')
        ? '<path d="M84 98 Q100 90 116 98 Q114 110 100 114 Q86 110 84 98 Z" fill="#F5EBDD" ' + st(4) + '/><path d="M88 114 Q100 108 112 114 Q108 132 100 132 Q92 132 88 114 Z" fill="' + O + '"/>'
        : '<path d="M84 100 Q100 90 116 100 Q114 122 100 130 Q86 122 84 100 Z" fill="#F5EBDD" ' + st(4) + '/><path d="M91 114 Q100 120 109 114 Q106 125 100 127 Q94 125 91 114 Z" fill="' + O + '"/>';
      return '<ellipse cx="78" cy="88" rx="19" ry="21" fill="#FFF4EC"/><ellipse cx="122" cy="88" rx="19" ry="21" fill="#FFF4EC"/>'
        + '<path d="M66 96 L72 96 M64 102 L70 102 M134 96 L128 96 M136 102 L130 102" stroke="#E8433A" stroke-width="2.5" stroke-linecap="round"/>'
        + eyes(m, 86) + beak;
    }
  };

  function char(id, o) {
    o = o || {};
    var c = C[id] || C.nico, pose = o.pose || 'idle', m = o.mood || 'happy';
    return '<svg class="adv-csvg pose-' + pose + '" viewBox="0 -38 200 274" aria-hidden="true" focusable="false"><g class="bob">'
      + (c.back ? c.back() : '') + body(c) + (c.front ? c.front() : '') + arms(c, pose)
      + '<g class="hd">' + head(c) + c.face(m, !!o.talk) + '</g></g></svg>';
  }

  /* ---------- the neighborhood buildings (viewBox 0 0 160 130) ---------- */
  var B = {};
  var gnd = '<ellipse cx="80" cy="123" rx="68" ry="7" fill="#000" opacity=".09"/>';
  B.casa = gnd
    + '<rect x="106" y="16" width="15" height="30" rx="2" fill="#C9624B" ' + st(4) + '/>'
    + '<path d="M12 62 L80 14 L148 62 Z" fill="#E5605A" ' + st(4.5) + '/><path d="M30 52 L80 22 L130 52" fill="none" stroke="#fff" stroke-width="3" opacity=".45"/>'
    + '<rect x="26" y="58" width="108" height="62" rx="5" fill="#FFE9C7" ' + st(4.5) + '/>'
    + '<rect x="67" y="80" width="26" height="40" rx="12" fill="#5BA4E6" ' + st(4) + '/><circle cx="87" cy="101" r="2.6" fill="#FFD23F"/>'
    + '<rect x="35" y="72" width="24" height="22" rx="4" fill="#BDE6FF" ' + st(4) + '/><path d="M47 72 V94 M35 83 H59" stroke="' + O + '" stroke-width="2.5"/>'
    + '<rect x="101" y="72" width="24" height="22" rx="4" fill="#BDE6FF" ' + st(4) + '/><path d="M113 72 V94 M101 83 H125" stroke="' + O + '" stroke-width="2.5"/>'
    + '<rect x="33" y="96" width="30" height="8" rx="3" fill="#8BC76A" ' + st(3) + '/><circle cx="40" cy="95" r="3" fill="#FF7EA8"/><circle cx="49" cy="94" r="3" fill="#FFD23F"/><circle cx="57" cy="95" r="3" fill="#FF7EA8"/>'
    + '<rect x="97" y="96" width="30" height="8" rx="3" fill="#8BC76A" ' + st(3) + '/><circle cx="104" cy="95" r="3" fill="#FFD23F"/><circle cx="113" cy="94" r="3" fill="#FF7EA8"/><circle cx="121" cy="95" r="3" fill="#FFD23F"/>';
  B.parque = gnd
    + '<path d="M22 120 L34 30 L46 120 M98 120 L110 30 L122 120" fill="none" stroke="#3D8BE8" stroke-width="7" stroke-linecap="round"/><path d="M22 120 L34 30 L46 120 M98 120 L110 30 L122 120" fill="none" stroke="' + O + '" stroke-width="2" opacity=".35"/>'
    + '<path d="M30 30 H114" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/>'
    + '<path d="M54 32 V90 M68 32 V90 M80 32 V82 M94 32 V82" stroke="' + O + '" stroke-width="2.5"/>'
    + '<rect x="50" y="88" width="22" height="7" rx="3" fill="#FFD23F" ' + st(3) + '/><rect x="76" y="80" width="22" height="7" rx="3" fill="#8FD6B4" ' + st(3) + '/>'
    + '<path d="M126 56 L156 118" stroke="#FF8A3D" stroke-width="10" stroke-linecap="round"/><path d="M126 56 L156 118" stroke="' + O + '" stroke-width="2" opacity=".3"/>'
    + '<path d="M120 56 H132" stroke="' + O + '" stroke-width="5" stroke-linecap="round"/>'
    + '<path d="M8 120 Q14 110 18 120 M136 120 Q142 112 146 120" stroke="#5DB04A" stroke-width="3" fill="none"/>';
  B.cocina = gnd
    + '<rect x="22" y="48" width="116" height="72" rx="6" fill="#FFE27A" ' + st(4.5) + '/>'
    + '<path d="M16 48 H144 V58 Q136 68 128 58 Q120 68 112 58 Q104 68 96 58 Q88 68 80 58 Q72 68 64 58 Q56 68 48 58 Q40 68 32 58 Q24 68 16 58 Z" fill="#E5484D" ' + st(4) + '/>'
    + '<path d="M40 48 V60 M64 48 V60 M88 48 V60 M112 48 V60 M136 48 V60" stroke="#fff" stroke-width="7"/>'
    + '<rect x="32" y="72" width="62" height="38" rx="6" fill="#BDE6FF" ' + st(4) + '/>'
    + '<path d="M48 96 H78 V104 Q63 110 48 104 Z" fill="#7A869A" ' + st(3) + '/><path d="M54 88 q3 -5 0 -10 M63 88 q3 -5 0 -10 M72 88 q3 -5 0 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<rect x="104" y="78" width="24" height="42" rx="6" fill="#8FD6B4" ' + st(4) + '/><circle cx="123" cy="100" r="2.5" fill="' + O + '"/>'
    + '<g transform="translate(80 22)"><path d="M-14 8 Q-22 -4 -12 -10 Q-8 -20 2 -14 Q12 -20 16 -8 Q24 -2 14 8 Z" fill="#fff" ' + st(3.5) + '/><rect x="-12" y="6" width="24" height="10" rx="3" fill="#fff" ' + st(3.5) + '/></g>';
  B.campo = gnd
    + '<path d="M4 112 Q80 92 156 112 L156 124 L4 124 Z" fill="#8ED36B" ' + st(3.5) + '/><path d="M30 116 Q80 104 130 116" stroke="#fff" stroke-width="3" fill="none"/>'
    + '<rect x="30" y="32" width="100" height="62" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/><rect x="30" y="32" width="100" height="62" fill="none" stroke="' + O + '" stroke-width="2" opacity=".35"/>'
    + '<path d="M44 36 V92 M58 36 V92 M72 36 V92 M86 36 V92 M100 36 V92 M114 36 V92 M34 46 H126 M34 60 H126 M34 74 H126 M34 88 H126" stroke="#9AA6B8" stroke-width="1.6"/>'
    + '<path d="M30 94 V110 M130 94 V110" stroke="#fff" stroke-width="9" stroke-linecap="round"/>'
    + '<g transform="translate(112 104)"><circle r="12" fill="#fff" ' + st(3.5) + '/><path d="M0 -5 L5 -1 L3 5 L-3 5 L-5 -1 Z" fill="' + O + '"/></g>'
    + '<path d="M12 112 V70" stroke="' + O + '" stroke-width="3"/><path d="M12 70 L30 77 L12 84 Z" fill="#FF8A3D" ' + st(2.5) + '/>';
  B.garaje = gnd
    + '<path d="M14 54 L80 18 L146 54 Z" fill="#3D8BE8" ' + st(4.5) + '/>'
    + '<rect x="22" y="50" width="116" height="70" rx="5" fill="#EEF0F6" ' + st(4.5) + '/>'
    + '<rect x="36" y="62" width="88" height="58" rx="4" fill="#4A4560" ' + st(4) + '/>'
    + '<path d="M36 62 H124 M36 70 H124 M36 78 H124" stroke="#C9CEDB" stroke-width="5"/>'
    + '<g transform="translate(80 104)"><path d="M-32 6 V-6 Q-30 -12 -22 -12 L-14 -24 Q-10 -28 -4 -28 H12 Q18 -28 22 -22 L28 -12 Q34 -12 34 -4 V6 Z" fill="#E5484D" ' + st(3.5) + '/><path d="M-10 -22 H4 V-12 H-16 Z M8 -22 H14 L20 -12 H8 Z" fill="#BDE6FF"/><circle cx="-18" cy="8" r="8" fill="' + O + '"/><circle cx="-18" cy="8" r="3" fill="#C9CEDB"/><circle cx="20" cy="8" r="8" fill="' + O + '"/><circle cx="20" cy="8" r="3" fill="#C9CEDB"/></g>';
  B.escuela = gnd
    + '<rect x="62" y="12" width="36" height="34" rx="3" fill="#FFD9A0" ' + st(4) + '/><path d="M58 14 L80 0 L102 14 Z" fill="#E5605A" ' + st(4) + '/>'
    + '<path d="M74 22 Q80 14 86 22 V32 H74 Z" fill="#FFD23F" ' + st(3) + '/>'
    + '<path d="M98 8 V-10" stroke="' + O + '" stroke-width="2.5"/><path d="M98 -10 L114 -5 L98 0 Z" fill="#3D8BE8" ' + st(2) + '/>'
    + '<path d="M10 54 L80 34 L150 54 Z" fill="#E5605A" ' + st(4.5) + '/>'
    + '<rect x="18" y="52" width="124" height="68" rx="5" fill="#FFD9A0" ' + st(4.5) + '/>'
    + '<circle cx="80" cy="66" r="10" fill="#fff" ' + st(3.5) + '/><path d="M80 60 V66 L85 69" stroke="' + O + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    + '<rect x="66" y="84" width="28" height="36" rx="4" fill="#3D8BE8" ' + st(4) + '/><path d="M80 84 V120" stroke="' + O + '" stroke-width="2.5"/>'
    + '<rect x="28" y="70" width="26" height="20" rx="3" fill="#BDE6FF" ' + st(3.5) + '/><rect x="106" y="70" width="26" height="20" rx="3" fill="#BDE6FF" ' + st(3.5) + '/>'
    + '<rect x="28" y="96" width="26" height="16" rx="3" fill="#BDE6FF" ' + st(3.5) + '/><rect x="106" y="96" width="26" height="16" rx="3" fill="#BDE6FF" ' + st(3.5) + '/>';
  B.jardin = gnd
    + '<path d="M40 92 V30" stroke="#4FA34A" stroke-width="5"/><path d="M118 92 V40" stroke="#4FA34A" stroke-width="5"/>'
    + '<path d="M40 70 q-12 -4 -16 4 q10 6 16 -4 M118 74 q12 -4 16 4 q-10 6 -16 -4" fill="#6CC46B" ' + st(2.5) + '/>'
    + '<g transform="translate(40 28)"><g fill="#FFD23F" ' + st(2.5) + '><ellipse cx="0" cy="-13" rx="5" ry="9"/><ellipse cx="0" cy="13" rx="5" ry="9"/><ellipse cx="-13" cy="0" rx="9" ry="5"/><ellipse cx="13" cy="0" rx="9" ry="5"/><ellipse cx="-9" cy="-9" rx="5" ry="8" transform="rotate(-45 -9 -9)"/><ellipse cx="9" cy="9" rx="5" ry="8" transform="rotate(-45 9 9)"/><ellipse cx="9" cy="-9" rx="5" ry="8" transform="rotate(45 9 -9)"/><ellipse cx="-9" cy="9" rx="5" ry="8" transform="rotate(45 -9 9)"/></g><circle r="8" fill="#8C5A36" ' + st(3) + '/></g>'
    + '<g transform="translate(118 38) scale(.8)"><g fill="#FFD23F" ' + st(2.5) + '><ellipse cx="0" cy="-13" rx="5" ry="9"/><ellipse cx="0" cy="13" rx="5" ry="9"/><ellipse cx="-13" cy="0" rx="9" ry="5"/><ellipse cx="13" cy="0" rx="9" ry="5"/></g><circle r="8" fill="#8C5A36" ' + st(3) + '/></g>'
    + '<path d="M70 92 Q66 70 76 60 Q86 70 82 92" fill="#6CC46B" ' + st(3) + '/><circle cx="70" cy="74" r="6" fill="#E5484D" ' + st(2.5) + '/><circle cx="84" cy="70" r="6" fill="#E5484D" ' + st(2.5) + '/><circle cx="78" cy="82" r="5.5" fill="#E5484D" ' + st(2.5) + '/>'
    + '<path d="M96 92 l-4 -14 M100 92 l0 -16 M104 92 l4 -14" stroke="#4FA34A" stroke-width="4" stroke-linecap="round"/>'
    + '<rect x="14" y="88" width="132" height="32" rx="5" fill="#B9824F" ' + st(4.5) + '/><path d="M14 100 H146 M14 110 H146" stroke="' + O + '" stroke-width="2" opacity=".25"/>'
    + '<g transform="translate(144 78)"><path d="M-10 0 H8 V16 H-10 Z" fill="#3D8BE8" ' + st(3) + '/><path d="M8 4 L18 -4" stroke="#3D8BE8" stroke-width="5" stroke-linecap="round"/></g>';
  B.sala = gnd
    + '<path d="M10 40 Q45 52 80 40 Q115 52 150 40" fill="none" stroke="' + O + '" stroke-width="2"/>'
    + '<path d="M18 42 l7 12 l7 -10 Z" fill="#FF8FC8" ' + st(2) + '/><path d="M44 46 l6 12 l8 -11 Z" fill="#FFD23F" ' + st(2) + '/><path d="M104 46 l6 12 l8 -11 Z" fill="#8FD6B4" ' + st(2) + '/><path d="M130 42 l6 12 l8 -10 Z" fill="#3D8BE8" ' + st(2) + '/>'
    + '<path d="M28 120 L80 30 L132 120 Z" fill="#C9B6F2" ' + st(4.5) + '/>'
    + '<path d="M54 120 L80 30 L106 120" fill="none" stroke="#FF8FC8" stroke-width="9"/>'
    + '<path d="M28 120 L80 30 L132 120 Z" fill="none" ' + st(4.5) + '/>'
    + '<path d="M66 120 Q80 82 94 120 Z" fill="#5A4E7A" ' + st(3.5) + '/>'
    + '<circle cx="80" cy="28" r="6" fill="#FFD23F" ' + st(3) + '/>'
    + '<rect x="108" y="100" width="18" height="18" rx="3" fill="#E5484D" ' + st(3) + '/><rect x="126" y="100" width="18" height="18" rx="3" fill="#3D8BE8" ' + st(3) + '/><rect x="117" y="82" width="18" height="18" rx="3" fill="#FFD23F" ' + st(3) + '/>'
    + '<circle cx="34" cy="110" r="10" fill="#8FD6B4" ' + st(3) + '/><path d="M26 106 Q34 112 42 106" stroke="#fff" stroke-width="2.5" fill="none"/>';
  function building(id) { return '<svg class="adv-bsvg" viewBox="0 -14 160 144" aria-hidden="true" focusable="false">' + (B[id] || B.casa) + '</svg>'; }

  /* ---------- the neighborhood backdrop (decorative) ---------- */
  function tree(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-9" y="-10" width="18" height="60" rx="6" fill="#A8723F" ' + st(4) + '/><circle cx="-30" cy="-30" r="38" fill="#6CC46B" ' + st(4) + '/><circle cx="30" cy="-34" r="40" fill="#6CC46B" ' + st(4) + '/><circle cx="0" cy="-66" r="44" fill="#7ED07A" ' + st(4) + '/><circle cx="-14" cy="-80" r="10" fill="#fff" opacity=".25"/><circle cx="22" cy="-40" r="7" fill="#FF8FA3"/><circle cx="-26" cy="-22" r="7" fill="#FF8FA3"/><circle cx="6" cy="-56" r="7" fill="#FF8FA3"/></g>';
  }
  function bush(x, y, s, col) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-50 0 Q-54 -34 -22 -36 Q-14 -60 14 -48 Q44 -56 50 -24 Q64 -8 52 0 Z" fill="#5DB04A" ' + st(4) + '/><circle cx="-24" cy="-18" r="6" fill="' + col + '"/><circle cx="6" cy="-30" r="6" fill="' + col + '"/><circle cx="30" cy="-14" r="6" fill="' + col + '"/></g>';
  }
  function cloud(cls, x, y, s) {
    return '<g class="adv-cloud ' + cls + '"><g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M-60 20 Q-70 -6 -40 -10 Q-34 -40 0 -36 Q30 -50 44 -18 Q74 -18 66 14 Q64 22 50 22 H-50 Q-60 22 -60 20 Z" fill="#fff" opacity=".95"/></g></g>';
  }
  function world() {
    return '<svg class="adv-wsvg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
      + '<g class="adv-sun"><circle cx="1440" cy="130" r="62" fill="#FFE066"/><g class="rays" style="transform-origin:1440px 130px">'
      + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<rect x="1434" y="30" width="12" height="34" rx="6" fill="#FFE066" transform="rotate(' + a + ' 1440 130)"/>'; }).join('')
      + '</g></g>'
      + cloud('c1', 260, 120, 1.3) + cloud('c2', 820, 80, 1) + cloud('c3', 1180, 210, .8)
      + '<path d="M0 420 Q200 330 420 400 Q640 300 860 390 Q1080 310 1300 380 Q1460 330 1600 370 V1000 H0 Z" fill="#C4EBA8"/>'
      + '<path d="M0 420 H1600" stroke="#fff" stroke-width="0"/>'
      + '<g opacity=".9">' + [60, 150, 240, 330, 1270, 1360, 1450, 1540].map(function (x) { return '<rect x="' + x + '" y="388" width="14" height="52" rx="5" fill="#fff" stroke="#E4DCCB" stroke-width="3"/>'; }).join('')
      + '<rect x="40" y="400" width="320" height="10" rx="5" fill="#fff"/><rect x="1250" y="400" width="320" height="10" rx="5" fill="#fff"/></g>'
      + '<path d="M0 520 Q260 450 520 510 Q800 440 1080 505 Q1340 450 1600 500 V1000 H0 Z" fill="#A6DC86"/>'
      + '<path d="M760 1000 C760 880 620 820 700 740 C780 660 980 690 940 600 C910 540 820 540 840 500 L900 500 C900 540 1010 560 1000 620 C990 700 820 700 800 760 C780 830 900 900 900 1000 Z" fill="#F6E3B8" opacity=".9"/>'
      + tree(110, 560, 1.1) + tree(1500, 540, 1.2) + tree(300, 470, .7) + tree(1300, 465, .7)
      + bush(80, 990, 1.3, '#FF8FC8') + bush(1530, 990, 1.4, '#FFD23F') + bush(540, 520, .7, '#FF8FA3') + bush(1080, 515, .7, '#C9B6F2')
      + '<g class="adv-fly f1"><g transform="translate(520 300)"><ellipse cx="-8" cy="0" rx="10" ry="7" fill="#FF8FC8" stroke="' + O + '" stroke-width="2.5"/><ellipse cx="8" cy="0" rx="10" ry="7" fill="#FF8FC8" stroke="' + O + '" stroke-width="2.5"/><rect x="-2" y="-8" width="4" height="16" rx="2" fill="' + O + '"/></g></g>'
      + '<g class="adv-fly f2"><g transform="translate(1100 330)"><ellipse cx="-8" cy="0" rx="10" ry="7" fill="#FFD23F" stroke="' + O + '" stroke-width="2.5"/><ellipse cx="8" cy="0" rx="10" ry="7" fill="#FFD23F" stroke="' + O + '" stroke-width="2.5"/><rect x="-2" y="-8" width="4" height="16" rx="2" fill="' + O + '"/></g></g>'
      + '</svg>';
  }

  /* ---------- small reusable pieces ---------- */
  function balloon(hex) {
    return '<svg class="adv-balloon-svg" viewBox="0 0 100 140" aria-hidden="true"><path d="M50 104 Q46 118 54 126 Q60 134 52 140" fill="none" stroke="' + O + '" stroke-width="2.5" stroke-linecap="round"/>'
      + '<path d="M50 6 C76 6 92 28 90 54 C88 82 66 100 50 102 C34 100 12 82 10 54 C8 28 24 6 50 6 Z" fill="' + hex + '" ' + st(4) + '/>'
      + '<path d="M44 100 L56 100 L52 108 L48 108 Z" fill="' + hex + '" ' + st(3) + '/>'
      + '<ellipse cx="32" cy="36" rx="9" ry="15" fill="#fff" opacity=".45" transform="rotate(24 32 36)"/></svg>';
  }
  function star(fill) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z" fill="' + (fill || '#FFD23F') + '" ' + st(5) + '/><path d="M40 34 L48 18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>';
  }

  /* Activity icons the item libraries do not cover (viewBox 0 0 100 100). */
  var ICON = {
    simon: '<circle cx="50" cy="22" r="12" fill="#FFD9A0" ' + st(4) + '/><path d="M50 36 V64 M50 44 L26 26 M50 44 L74 26 M50 64 L34 88 M50 64 L66 88" stroke="#3D8BE8" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M50 36 V64 M50 44 L26 26 M50 44 L74 26 M50 64 L34 88 M50 64 L66 88" stroke="' + O + '" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".35"/>',
    count: '<rect x="12" y="12" width="76" height="76" rx="16" fill="#fff" ' + st(4) + '/><circle cx="30" cy="30" r="8" fill="#E5484D"/><circle cx="50" cy="50" r="8" fill="#3D8BE8"/><circle cx="70" cy="70" r="8" fill="#5DB04A"/>',
    bubbles: '<circle cx="40" cy="58" r="28" fill="#CFF1FB" ' + st(4) + '/><path d="M24 50a16 16 0 0 1 12-12" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="74" cy="30" r="15" fill="#E4F7FD" ' + st(4) + '/><circle cx="76" cy="72" r="10" fill="#E4F7FD" ' + st(4) + '/>',
    target: '<circle cx="46" cy="54" r="36" fill="#E5484D" ' + st(4) + '/><circle cx="46" cy="54" r="25" fill="#fff"/><circle cx="46" cy="54" r="14" fill="#E5484D"/><circle cx="46" cy="54" r="5" fill="#fff"/><path d="M46 54 L84 16" ' + st(5) + '/><path d="M78 10 L90 10 L88 20 L78 22 Z" fill="#3D8BE8" ' + st(3) + '/>',
    sort: '<path d="M8 50 H46 L42 88 H12 Z" fill="#8FD6B4" ' + st(4) + '/><path d="M54 50 H92 L88 88 H58 Z" fill="#FFD23F" ' + st(4) + '/><circle cx="27" cy="34" r="10" fill="#E5484D" ' + st(3.5) + '/><rect x="64" y="22" width="18" height="18" rx="3" fill="#3D8BE8" ' + st(3.5) + '/>'
  };
  function icon(name) { return ICON[name] ? '<svg viewBox="0 0 100 100" aria-hidden="true">' + ICON[name] + '</svg>' : ''; }

  /* A round emotion face (used by the feelings game; works with any character pack). */
  function face(m, fill) {
    return '<svg class="adv-face" viewBox="10 10 180 180" aria-hidden="true"><circle cx="100" cy="100" r="78" fill="' + (fill || '#FFD9A0') + '" ' + st(5) + '/>'
      + eyes(m, 88) + cheeks(88, m) + mouth(m, false, 122) + '</svg>';
  }

  window.ADV_ART = { char: char, face: face, icon: icon, building: building, world: world, balloon: balloon, star: star, CAST_IDS: Object.keys(C), BUILDING_IDS: Object.keys(B), OUTLINE: O };
})();
