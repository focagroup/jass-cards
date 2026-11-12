'use strict';
/*
 * Writes the vector card skins for Jass (36 cards + back each):
 *   skins/alternative/  - hand-drawn Swiss-German deck (Schellen, Rosen, Schilten, Eicheln;
 *                         6, 7, 8, 9, Banner, Under, Ober, König, As)
 *   skins/french/       - French-suited Swiss deck (Schaufel, Herz, Kreuz, Ecke;
 *                         6-10, Bube, Dame, König, As)
 *
 * File names are the same in every skin: <suit>_<rank>.svg plus back.svg, where
 *   suit = schellen | rosen | schilten | eicheln  (French: Schaufel ♠ | Herz ♥ | Kreuz ♣ | Ecke ♦)
 *   rank = 06 07 08 09 10 11 (Under/Bube) 12 (Ober/Dame) 13 (König) 14 (As)
 *
 * Usage: node tools/gen_cards.js [skinsDir]
 */
const fs = require('fs');
const path = require('path');

const SUIT_FILE = ['schellen', 'rosen', 'schilten', 'eicheln'];
const RANK_FILE = ['06', '07', '08', '09', '10', '11', '12', '13', '14'];
const out = process.argv[2] || 'skins';
const W = 100, H = 160;
const INK = '#2b1d0e';

function write(dir, name, svg) {
  fs.mkdirSync(path.join(out, dir), {recursive: true});
  fs.writeFileSync(path.join(out, dir, name), svg.replace(/\n\s+/g, '\n').trim() + '\n');
}
const fileName = (s, r) => `${SUIT_FILE[s]}_${RANK_FILE[r]}.svg`;
const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}">`;
const use = (id, x, y, s, rot) =>
  `<use href="#${id}" xlink:href="#${id}" transform="translate(${x},${y}) scale(${s})${rot ? ' rotate(' + rot + ')' : ''}"/>`;

// =================================================================== Swiss-German deck

const S_GOLD = '#e9b72f', S_GOLD_D = '#b9861a', S_RED = '#c6282b', S_GREEN = '#3c7d3a', S_BROWN = '#8a5523',
  S_BLACK = '#1d1d1d', S_CREAM = '#fff8e6', S_SKIN = '#f3cfa6', S_BLUE = '#2d5aa0';

/* Suit symbols, drawn in a box of roughly -10..10. */
const SWISS_SYM = `
  <radialGradient id="bellG" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff3b8"/><stop offset=".45" stop-color="${S_GOLD}"/><stop offset="1" stop-color="${S_GOLD_D}"/></radialGradient>
  <radialGradient id="nutG" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#f1c66a"/><stop offset=".6" stop-color="#cf8f30"/><stop offset="1" stop-color="#94591a"/></radialGradient>
  <clipPath id="bellClip"><circle cx="0" cy="1" r="8.4"/></clipPath>
  <clipPath id="shieldClip"><path d="M-8,-9 H8 V-1.5 C8,4.5 4.4,8.3 0,10.2 C-4.4,8.3 -8,4.5 -8,-1.5Z"/></clipPath>
  <g id="sym0">
    <circle cx="0" cy="-8.6" r="1.9" fill="none" stroke="${INK}" stroke-width="1.1"/>
    <circle cx="0" cy="1" r="8.4" fill="url(#bellG)"/>
    <g clip-path="url(#bellClip)">
      <rect x="-9" y="-2.4" width="18" height="3.2" fill="${S_RED}"/>
      <path d="M-9,-2.4 H9 M-9,0.8 H9" stroke="${INK}" stroke-width=".5"/>
      <circle cx="-4.5" cy="-.8" r=".6" fill="${S_GOLD}"/><circle cx="0" cy="-.8" r=".6" fill="${S_GOLD}"/><circle cx="4.5" cy="-.8" r=".6" fill="${S_GOLD}"/>
    </g>
    <circle cx="0" cy="1" r="8.4" fill="none" stroke="${INK}" stroke-width="1"/>
    <path d="M-4.6,5 H4.6 M0,5 V9.3" stroke="${INK}" stroke-width="1.1" stroke-linecap="round"/>
    <circle cx="-4.6" cy="5" r="1" fill="${INK}"/><circle cx="4.6" cy="5" r="1" fill="${INK}"/>
    <ellipse cx="-3.2" cy="-3.6" rx="2.2" ry="1.3" fill="#fff" opacity=".55" transform="rotate(-30 -3.2 -3.6)"/>
  </g>
  <g id="sym1">
    ${[0, 1, 2, 3, 4].map(k => {
      const a = (-54 + k * 72) * Math.PI / 180;
      const x = (8.2 * Math.cos(a)).toFixed(2), y = (8.2 * Math.sin(a)).toFixed(2);
      return `<path d="M0,0 L${(x * 0.5 - y * 0.32).toFixed(2)},${(y * 0.5 + x * 0.32).toFixed(2)} L${x},${y} L${(x * 0.5 + y * 0.32).toFixed(2)},${(y * 0.5 - x * 0.32).toFixed(2)}Z" fill="${S_GREEN}" stroke="${INK}" stroke-width=".5"/>`;
    }).join('')}
    ${[0, 1, 2, 3, 4].map(k => {
      const a = (-90 + k * 72) * Math.PI / 180;
      return `<circle cx="${(5 * Math.cos(a)).toFixed(2)}" cy="${(5 * Math.sin(a)).toFixed(2)}" r="4.4" fill="${S_RED}" stroke="${INK}" stroke-width=".8"/>`;
    }).join('')}
    <circle r="4.6" fill="${S_CREAM}" stroke="${INK}" stroke-width=".7"/>
    ${[0, 1, 2, 3, 4].map(k => {
      const a = (-90 + 36 + k * 72) * Math.PI / 180;
      return `<path d="M0,0 L${(4.4 * Math.cos(a - .28)).toFixed(2)},${(4.4 * Math.sin(a - .28)).toFixed(2)} L${(4.4 * Math.cos(a + .28)).toFixed(2)},${(4.4 * Math.sin(a + .28)).toFixed(2)}Z" fill="${S_RED}" opacity=".35"/>`;
    }).join('')}
    <circle r="2.5" fill="${S_GOLD}" stroke="${INK}" stroke-width=".6"/>
    <circle cx="-.8" cy="-.6" r=".45" fill="${S_BROWN}"/><circle cx=".9" cy="-.4" r=".45" fill="${S_BROWN}"/><circle cx="0" cy=".9" r=".45" fill="${S_BROWN}"/>
  </g>
  <g id="sym2">
    <path d="M-8,-9 H8 V-1.5 C8,4.5 4.4,8.3 0,10.2 C-4.4,8.3 -8,4.5 -8,-1.5Z" fill="${S_GOLD}"/>
    <g clip-path="url(#shieldClip)">
      <rect x="-9" y="-3" width="18" height="5" fill="${S_BLACK}"/>
      <rect x="-9" y="2" width="18" height="10" fill="${S_RED}"/>
      <path d="M-9,-3 H9 M-9,2 H9" stroke="${S_GOLD}" stroke-width=".6"/>
    </g>
    <path d="M-8,-9 H8 V-1.5 C8,4.5 4.4,8.3 0,10.2 C-4.4,8.3 -8,4.5 -8,-1.5Z" fill="none" stroke="${INK}" stroke-width="1.1"/>
    <path d="M-6.3,-7.3 H6.3 V-1.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".6"/>
  </g>
  <g id="sym3">
    <path d="M0,-6.2 C0,-8 -0.6,-9.4 -1.6,-10.4" fill="none" stroke="${S_BROWN}" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M.2,-7.8 C2.5,-11 6.5,-11 8.6,-9.6 C6.8,-6.6 3,-6 .2,-7.8Z" fill="${S_GREEN}" stroke="${INK}" stroke-width=".6"/>
    <path d="M1.2,-8.1 C3.6,-8.9 5.8,-9.2 7.6,-9.5" fill="none" stroke="#a8d29c" stroke-width=".5"/>
    <path d="M-5.4,-.4 C-5.6,4.8 -2.6,9.2 0,10.4 C2.6,9.2 5.6,4.8 5.4,-.4Z" fill="url(#nutG)" stroke="${INK}" stroke-width=".9"/>
    <ellipse cx="-2" cy="3" rx="1.1" ry="2.6" fill="#fff" opacity=".4"/>
    <path d="M-6.4,.2 C-7,-4.4 -3.8,-6.9 0,-6.9 C3.8,-6.9 7,-4.4 6.4,.2 C2.4,1.4 -2.4,1.4 -6.4,.2Z" fill="${S_BROWN}" stroke="${INK}" stroke-width=".9"/>
    <path d="M-5.2,-3.6 L-1.4,.8 M-2.6,-5.8 L2.6,.9 M.6,-6.6 L5.6,-.4 M5.2,-3.6 L1.4,.8 M2.6,-5.8 L-2.6,.9 M-.6,-6.6 L-5.6,-.4" stroke="#4d2c0c" stroke-width=".55"/>
  </g>`;

/* Pip positions (upright, Swiss cards are single-ended). */
const SWISS_PIPS = {
  0: [[31, 42], [69, 42], [31, 80], [69, 80], [31, 118], [69, 118]],
  1: [[31, 40], [69, 40], [50, 61], [31, 82], [69, 82], [31, 122], [69, 122]],
  2: [[31, 36], [69, 36], [31, 66], [69, 66], [31, 96], [69, 96], [31, 126], [69, 126]],
  3: [[29, 36], [71, 36], [29, 66], [71, 66], [50, 81], [29, 96], [71, 96], [29, 126], [71, 126]],
};
const SWISS_IDX = ['6', '7', '8', '9', '10', 'U', 'O', 'K', 'A'];

const SUIT_ROBE = [
  {a: S_RED, b: S_GOLD, hose: S_BLUE, trim: S_GOLD},     // Schellen
  {a: S_GREEN, b: S_RED, hose: S_GOLD, trim: S_GOLD},    // Rosen
  {a: S_BLUE, b: S_GOLD, hose: S_RED, trim: S_GOLD},     // Schilten
  {a: S_BROWN, b: S_GREEN, hose: S_RED, trim: S_GOLD},   // Eicheln
];

function swissFrame(inner) {
  return `${svgOpen}<defs>${SWISS_SYM}</defs>
    <rect x=".8" y=".8" width="98.4" height="158.4" rx="6.5" fill="${S_CREAM}" stroke="#3a2a14" stroke-width="1.6"/>
    <rect x="5" y="5" width="90" height="150" rx="3.5" fill="none" stroke="#c9a85a" stroke-width=".8"/>
    ${inner}</svg>`;
}

function swissIndex(s, r) {
  const txt = SWISS_IDX[r];
  const one = `<text x="11.5" y="18" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="bold" font-size="${txt.length > 1 ? 11 : 13}" fill="${INK}">${txt}</text>${use('sym' + s, 11.5, 26, 0.42)}`;
  return one + `<g transform="rotate(180 50 80)">${one}</g>`;
}

/** Standing (or seated) figure for Under / Ober / König. */
function figure(s, kind) {
  const c = SUIT_ROBE[s];
  const king = kind === 'K', ober = kind === 'O', under = kind === 'U';
  let g = '';
  // ground
  g += `<ellipse cx="50" cy="144" rx="30" ry="3.2" fill="#000" opacity=".12"/>`;
  if (king) {
    // throne back + cloak
    g += `<path d="M24,58 Q24,30 50,28 Q76,30 76,58 V128 H24Z" fill="#7a2d1c" stroke="${INK}" stroke-width="1"/>`;
    g += `<path d="M28,60 Q28,35 50,33 Q72,35 72,60 V126 H28Z" fill="none" stroke="${S_GOLD}" stroke-width="1.2" stroke-dasharray="2 2"/>`;
    g += `<path d="M33,62 L67,62 L78,138 L22,138Z" fill="${c.b}" stroke="${INK}" stroke-width="1"/>`;
    g += `<path d="M22,138 L78,138 L77,131 L23,131Z" fill="#fff" stroke="${INK}" stroke-width=".7"/>`;
    for (let x = 27; x <= 74; x += 6) g += `<path d="M${x},133 l.8,2.4 l-.8,-.8 l-.8,.8z" fill="${S_BLACK}"/>`;
    g += `<ellipse cx="44" cy="141" rx="6" ry="2.6" fill="${S_BLACK}"/><ellipse cx="56" cy="141" rx="6" ry="2.6" fill="${S_BLACK}"/>`;
  } else {
    // legs + shoes
    g += `<rect x="40" y="104" width="7" height="34" rx="2" fill="${c.hose}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<rect x="53" y="104" width="7" height="34" rx="2" fill="${c.hose}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<path d="M40,115 h7 M53,115 h7" stroke="${c.trim}" stroke-width="1.6"/>`;
    g += `<ellipse cx="42" cy="140" rx="6.5" ry="2.8" fill="${S_BLACK}"/><ellipse cx="58" cy="140" rx="6.5" ry="2.8" fill="${S_BLACK}"/>`;
  }
  // tunic
  const hem = king ? 112 : 108;
  g += `<path d="M35,62 L65,62 L${king ? 70 : 72},${hem} L${king ? 30 : 28},${hem}Z" fill="${c.a}" stroke="${INK}" stroke-width="1"/>`;
  g += `<path d="M46.5,62 H53.5 L55,${hem} H45Z" fill="${c.b}" stroke="${INK}" stroke-width=".6"/>`;
  let zz = `M${king ? 30 : 28},${hem}`;
  for (let x = (king ? 30 : 28); x < (king ? 70 : 72); x += 4) zz += ` l2,-3 l2,3`;
  g += `<path d="${zz}" fill="none" stroke="${c.trim}" stroke-width="1.2"/>`;
  g += `<rect x="33.5" y="84" width="33" height="4" fill="${S_GOLD}" stroke="${INK}" stroke-width=".7"/>`;
  g += `<rect x="48" y="83.3" width="4" height="5.4" fill="none" stroke="${INK}" stroke-width=".8"/>`;
  for (let y = 67; y < 82; y += 5) g += `<circle cx="50" cy="${y}" r=".9" fill="${S_GOLD_D}"/>`;
  // arms
  const sleeve = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="8.6" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${c.a}" stroke-width="6.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="3.3" fill="${S_SKIN}" stroke="${INK}" stroke-width=".8"/>`;
  let symbol = '';
  if (under) {
    g += sleeve('M36,66 Q30,80 31,94') + hand(31, 97);
    g += sleeve('M64,66 Q72,84 71,104') + hand(71, 107);
    symbol = use('sym' + s, 72, 121, 1.25);
  } else if (ober) {
    g += sleeve('M36,66 Q30,80 31,94') + hand(31, 97);
    g += sleeve('M64,66 Q74,54 73,40') + hand(73, 37);
    symbol = use('sym' + s, 73, 23, 1.1);
  } else {
    // scepter in the left hand, symbol held at the chest on the right
    g += `<path d="M28,108 L24,40" stroke="${S_GOLD_D}" stroke-width="2.4" stroke-linecap="round"/>`;
    g += `<circle cx="24" cy="38" r="3" fill="${S_GOLD}" stroke="${INK}" stroke-width=".8"/>`;
    g += `<path d="M24,33 v-4 M22,31 h4" stroke="${S_GOLD_D}" stroke-width="1.2"/>`;
    g += sleeve('M36,66 Q28,80 27,88') + hand(27, 90);
    g += sleeve('M64,66 Q72,74 69,80') + hand(68, 81);
    symbol = use('sym' + s, 70, 72, 1.05);
  }
  // collar, neck, head
  g += `<rect x="46.5" y="53" width="7" height="10" fill="${S_SKIN}" stroke="${INK}" stroke-width=".7"/>`;
  g += `<path d="M38,62 Q50,70 62,62 Q50,58 38,62Z" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
  const hair = king ? '#cfcfcf' : ober ? '#5a3712' : '#c99a3a';
  g += `<path d="M41.5,46 Q40,34 50,34 Q60,34 58.5,46 L59,52 Q55,49 54,46 L46,46 Q45,49 41,52Z" fill="${hair}" stroke="${INK}" stroke-width=".7"/>`;
  g += `<ellipse cx="50" cy="46" rx="7.6" ry="8.6" fill="${S_SKIN}" stroke="${INK}" stroke-width=".9"/>`;
  g += `<circle cx="47.2" cy="45" r=".95" fill="${INK}"/><circle cx="52.8" cy="45" r=".95" fill="${INK}"/>`;
  g += `<path d="M45.8,42.6 q1.4,-1 2.8,0 M51.4,42.6 q1.4,-1 2.8,0" fill="none" stroke="${INK}" stroke-width=".6"/>`;
  g += `<path d="M50,45.5 l-.9,3.2 h1.6" fill="none" stroke="#b07a52" stroke-width=".7"/>`;
  g += `<circle cx="46" cy="49.4" r="1.4" fill="#e89a8a" opacity=".55"/><circle cx="54" cy="49.4" r="1.4" fill="#e89a8a" opacity=".55"/>`;
  if (king) {
    g += `<path d="M43,49 Q44,58 50,60 Q56,58 57,49 Q53,52.5 50,52 Q47,52.5 43,49Z" fill="${hair}" stroke="${INK}" stroke-width=".6"/>`;
    g += `<path d="M46.5,50.6 Q50,48.6 53.5,50.6" fill="none" stroke="#9a9a9a" stroke-width="1.2"/>`;
  } else if (ober) {
    g += `<path d="M46,51 Q50,49 54,51" fill="none" stroke="#5a3712" stroke-width="1.3" stroke-linecap="round"/>`;
  } else {
    g += `<path d="M47.8,51.3 Q50,52.6 52.2,51.3" fill="none" stroke="#9a4a3a" stroke-width=".8"/>`;
  }
  // headgear
  if (king) {
    g += `<path d="M41.5,39 L41,29 L45,33.5 L50,27 L55,33.5 L59,29 L58.5,39Z" fill="${S_GOLD}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<rect x="41.3" y="37" width="17.4" height="3" fill="${S_GOLD_D}" stroke="${INK}" stroke-width=".6"/>`;
    g += `<circle cx="50" cy="34" r="1.3" fill="${S_RED}"/><circle cx="45" cy="36" r=".9" fill="${S_BLUE}"/><circle cx="55" cy="36" r=".9" fill="${S_BLUE}"/>`;
    g += `<circle cx="41" cy="29" r="1" fill="${S_GOLD}" stroke="${INK}" stroke-width=".4"/><circle cx="50" cy="27" r="1" fill="${S_GOLD}" stroke="${INK}" stroke-width=".4"/><circle cx="59" cy="29" r="1" fill="${S_GOLD}" stroke="${INK}" stroke-width=".4"/>`;
  } else if (ober) {
    g += `<path d="M33,39.5 Q50,33 67,39.5 Q50,43 33,39.5Z" fill="${c.b}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<path d="M42,38 Q42,30 50,30 Q58,30 58,38Z" fill="${c.a}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<path d="M44,33 Q34,22 38,12 Q40,22 46,30Z" fill="#fff" stroke="${INK}" stroke-width=".7"/>`;
    g += `<path d="M43,31 Q37,22 38.5,14" fill="none" stroke="#999" stroke-width=".5"/>`;
  } else {
    g += `<path d="M40,40 Q38,32 50,31.5 Q62,32 60,40 Q50,37.5 40,40Z" fill="${c.b}" stroke="${INK}" stroke-width=".9"/>`;
    g += `<path d="M40,40 Q50,37.5 60,40" fill="none" stroke="${c.a}" stroke-width="1.6"/>`;
    g += `<path d="M43,33 Q34,24 37,15 Q40,24 46,31Z" fill="${S_RED}" stroke="${INK}" stroke-width=".7"/>`;
  }
  return g + symbol;
}

function swissBanner(s) {
  const c = SUIT_ROBE[s];
  let g = '';
  g += `<path d="M27,146 L33,20" stroke="${S_BROWN}" stroke-width="3" stroke-linecap="round"/>`;
  g += `<path d="M27,146 L33,20" stroke="#c48a4c" stroke-width="1" stroke-linecap="round"/>`;
  g += `<circle cx="33.2" cy="17.5" r="3.2" fill="${S_GOLD}" stroke="${INK}" stroke-width=".8"/>`;
  g += `<path d="M32.6,25 C50,19 62,31 84,24 L82,100 C62,108 50,95 29,102Z" fill="${c.a}" stroke="${INK}" stroke-width="1.2"/>`;
  g += `<path d="M32.6,25 C50,19 62,31 84,24 L83.5,36 C62,43 50,31 31.9,37Z" fill="${c.b}" opacity=".9"/>`;
  g += `<path d="M30.5,90 C50,83 62,96 82.4,88 L82,100 C62,108 50,95 29,102Z" fill="${c.b}" opacity=".9"/>`;
  g += `<path d="M48,24 C49,50 47,80 46,98 M66,27 C67,50 66,78 65,100" fill="none" stroke="#000" stroke-width=".6" opacity=".25"/>`;
  g += `<ellipse cx="57" cy="63" rx="15" ry="15" fill="${S_CREAM}" stroke="${INK}" stroke-width=".9"/>`;
  g += use('sym' + s, 57, 63, 1.2);
  g += `<path d="M30,110 Q50,116 72,108" fill="none" stroke="${S_GOLD_D}" stroke-width="1.4"/>`;
  g += `<path d="M31.5,105 l-3,14 l3,-3 l3,3z" fill="${S_RED}" stroke="${INK}" stroke-width=".6"/>`;
  return g;
}

function swissAce(s) {
  let g = '';
  // laurel branches
  const leaf = (x, y, a, col) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="5" fill="${col}" stroke="${INK}" stroke-width=".4" transform="rotate(${a} ${x} ${y})"/>`;
  for (let k = 0; k < 7; k++) {
    const t = k / 6;
    const x = 22 + t * 22, y = 128 - Math.sin(t * Math.PI * 0.9) * 22 - t * 6;
    g += leaf(x - 2, y - 3, -40 + t * 50, S_GREEN) + leaf(100 - x + 2, y - 3, 40 - t * 50, S_GREEN);
  }
  g += `<path d="M22,130 Q34,100 48,116 M78,130 Q66,100 52,116" fill="none" stroke="${S_BROWN}" stroke-width="1.2"/>`;
  g += `<path d="M30,126 Q50,138 70,126 L74,134 Q50,146 26,134Z" fill="${S_RED}" stroke="${INK}" stroke-width=".8"/>`;
  g += `<circle cx="50" cy="68" r="31" fill="none" stroke="${S_GOLD}" stroke-width="1.6" stroke-dasharray="1 3" stroke-linecap="round"/>`;
  g += use('sym' + s, 50, 68, 2.75);
  return g;
}

function swissCard(s, r) {
  let body = '';
  if (r <= 3) body = SWISS_PIPS[r].map(([x, y]) => use('sym' + s, x, y, r === 3 ? 1.12 : 1.22)).join('');
  else if (r === 4) body = swissBanner(s);
  else if (r <= 7) body = figure(s, 'UOK'[r - 5]);
  else body = swissAce(s);
  return swissFrame(body + swissIndex(s, r));
}

function swissBack() {
  return `${svgOpen}<defs>
    <pattern id="bp" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#9e1b22"/>
      <path d="M5,0 L10,5 L5,10 L0,5Z" fill="#b52a2f"/>
      <path d="M4.2,3 h1.6 v1.2 h1.2 v1.6 h-1.2 v1.2 h-1.6 v-1.2 h-1.2 v-1.6 h1.2z" fill="#f3e3c0"/>
    </pattern></defs>
    <rect x=".8" y=".8" width="98.4" height="158.4" rx="6.5" fill="${S_CREAM}" stroke="#3a2a14" stroke-width="1.6"/>
    <rect x="6" y="6" width="88" height="148" rx="3" fill="url(#bp)"/>
    <rect x="6" y="6" width="88" height="148" rx="3" fill="none" stroke="${S_GOLD}" stroke-width="1.6"/>
    <ellipse cx="50" cy="80" rx="22" ry="30" fill="${S_CREAM}" stroke="${S_GOLD}" stroke-width="2"/>
    <ellipse cx="50" cy="80" rx="18.5" ry="26.5" fill="none" stroke="#9e1b22" stroke-width=".8"/>
    ${[[50, 64], [39.5, 80], [60.5, 80], [50, 96]].map(([x, y], k) => use('sym' + k, x, y, 0.62)).join('')}
  </svg>`.replace('<defs>', `<defs>${SWISS_SYM}`);
}

// =================================================================== French deck

const F_RED = '#cc1f2f', F_BLACK = '#151515', F_BLUE = '#1f4fa3', F_YEL = '#f2c230', F_SKIN = '#f6d7b5';
/* canonical suit order: 0 Schaufel ♠, 1 Herz ♥, 2 Kreuz ♣, 3 Ecke ♦ */
const F_COL = [F_BLACK, F_RED, F_BLACK, F_RED];
const FRENCH_SYM = `
  <path id="fsym0" d="M0,-10.5 C-6,-5.5 -10.5,-1.5 -10.5,2.8 C-10.5,6.3 -8,8 -5.3,8 C-3.3,8 -1.6,7 -0.7,5.6 C-0.9,8 -2,9.8 -3.6,11 L3.6,11 C2,9.8 0.9,8 0.7,5.6 C1.6,7 3.3,8 5.3,8 C8,8 10.5,6.3 10.5,2.8 C10.5,-1.5 6,-5.5 0,-10.5Z" fill="${F_BLACK}"/>
  <path id="fsym1" d="M0,9.5 C-6,4.5 -10.5,0.5 -10.5,-4.5 C-10.5,-8.2 -7.8,-10.5 -5,-10.5 C-2.6,-10.5 -0.9,-9 0,-6.8 C0.9,-9 2.6,-10.5 5,-10.5 C7.8,-10.5 10.5,-8.2 10.5,-4.5 C10.5,0.5 6,4.5 0,9.5Z" fill="${F_RED}"/>
  <g id="fsym2" fill="${F_BLACK}"><circle cx="0" cy="-5.6" r="4.7"/><circle cx="-5.3" cy="1.6" r="4.7"/><circle cx="5.3" cy="1.6" r="4.7"/>
    <path d="M-1.6,-1 L1.6,-1 L1.6,1 C1.2,6 2.2,9 3.8,11 L-3.8,11 C-2.2,9 -1.2,6 -1.6,1Z"/><circle cx="0" cy="0" r="2.6"/></g>
  <path id="fsym3" d="M0,-11 Q3.2,-4.5 8,0 Q3.2,4.5 0,11 Q-3.2,4.5 -8,0 Q-3.2,-4.5 0,-11Z" fill="${F_RED}"/>`;

const fy = y => +(80 + (y - 75) * 1.08).toFixed(1);
const F_PIPS = {
  0: [[31, 34, 0], [69, 34, 0], [31, 75, 0], [69, 75, 0], [31, 116, 1], [69, 116, 1]],
  1: [[31, 34, 0], [69, 34, 0], [50, 54.5, 0], [31, 75, 0], [69, 75, 0], [31, 116, 1], [69, 116, 1]],
  2: [[31, 34, 0], [69, 34, 0], [50, 54.5, 0], [31, 75, 0], [69, 75, 0], [50, 95.5, 1], [31, 116, 1], [69, 116, 1]],
  3: [[31, 34, 0], [69, 34, 0], [31, 61.3, 0], [69, 61.3, 0], [50, 75, 0], [31, 88.7, 1], [69, 88.7, 1], [31, 116, 1], [69, 116, 1]],
  4: [[31, 34, 0], [69, 34, 0], [50, 47.7, 0], [31, 61.3, 0], [69, 61.3, 0], [31, 88.7, 1], [69, 88.7, 1], [50, 102.3, 1], [31, 116, 1], [69, 116, 1]],
};
const F_IDX = ['6', '7', '8', '9', '10', 'B', 'D', 'K', 'A'];

function frenchIndex(s, r) {
  const txt = F_IDX[r];
  const one = `<text x="10" y="17" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-weight="bold" font-size="${txt.length > 1 ? 11.5 : 13.5}" fill="${F_COL[s]}">${txt}</text>${use('fsym' + s, 10, 25.5, 0.44)}`;
  return one + `<g transform="rotate(180 50 80)">${one}</g>`;
}

/** Upper half of a double-ended court card (bust), drawn in the box 18..82 x 26..80. */
function frenchBust(s, kind) {
  const red = F_COL[s] === F_RED;
  const robeA = red ? F_RED : F_BLUE, robeB = red ? F_BLUE : F_RED;
  let g = '';
  // shoulders / robe
  g += `<path d="M22,80 L24,66 Q28,58 40,56 L60,56 Q72,58 76,66 L78,80Z" fill="${robeA}" stroke="${F_BLACK}" stroke-width=".9"/>`;
  g += `<path d="M40,56 L50,80 L60,56Z" fill="${F_YEL}" stroke="${F_BLACK}" stroke-width=".8"/>`;
  g += `<path d="M44,56 L50,72 L56,56" fill="none" stroke="${robeB}" stroke-width="1.6"/>`;
  g += `<path d="M24,66 Q30,70 36,66 M64,66 Q70,70 76,66" fill="none" stroke="${F_YEL}" stroke-width="1.4"/>`;
  for (let x = 27; x < 76; x += 7) if (x < 40 || x > 60) g += `<circle cx="${x}" cy="74" r="1.1" fill="${F_YEL}"/>`;
  // neck + head
  g += `<rect x="46.5" y="49" width="7" height="8" fill="${F_SKIN}" stroke="${F_BLACK}" stroke-width=".7"/>`;
  const hair = kind === 'D' ? F_YEL : kind === 'K' ? '#8a5a2b' : '#6b3e17';
  if (kind === 'D') g += `<path d="M39,44 Q37,30 50,29 Q63,30 61,44 L63,56 Q57,52 56,46 L44,46 Q43,52 37,56Z" fill="${hair}" stroke="${F_BLACK}" stroke-width=".7"/>`;
  g += `<ellipse cx="50" cy="42" rx="7.4" ry="8.6" fill="${F_SKIN}" stroke="${F_BLACK}" stroke-width=".9"/>`;
  g += `<circle cx="47.3" cy="41" r=".9" fill="${F_BLACK}"/><circle cx="52.7" cy="41" r=".9" fill="${F_BLACK}"/>`;
  g += `<path d="M46,38.6 q1.3,-.9 2.6,0 M51.4,38.6 q1.3,-.9 2.6,0" fill="none" stroke="${F_BLACK}" stroke-width=".6"/>`;
  g += `<path d="M50,41.5 l-.8,3 h1.5" fill="none" stroke="#b07a52" stroke-width=".7"/>`;
  g += `<path d="M48,47.2 Q50,48.4 52,47.2" fill="none" stroke="${F_RED}" stroke-width=".9"/>`;
  if (kind === 'K') {
    g += `<path d="M43,45 Q44,55 50,57 Q56,55 57,45 Q53,48.5 50,48 Q47,48.5 43,45Z" fill="${hair}" stroke="${F_BLACK}" stroke-width=".6"/>`;
    g += `<path d="M41.5,35 L41,24 L45,29 L50,22 L55,29 L59,24 L58.5,35Z" fill="${F_YEL}" stroke="${F_BLACK}" stroke-width=".9"/>`;
    g += `<rect x="41.3" y="33" width="17.4" height="3" fill="${robeB}" stroke="${F_BLACK}" stroke-width=".6"/>`;
    g += `<circle cx="50" cy="29.5" r="1.3" fill="${robeA}"/>`;
  } else if (kind === 'D') {
    g += `<path d="M42,34 Q50,27 58,34 L56.5,30 L53,32 L50,27 L47,32 L43.5,30Z" fill="${F_YEL}" stroke="${F_BLACK}" stroke-width=".8"/>`;
    g += `<circle cx="50" cy="29" r="1" fill="${robeB}"/>`;
    // flower held by the queen
    g += `<path d="M64,72 L68,52" stroke="#2f7a3b" stroke-width="1.2"/><circle cx="68" cy="50" r="3" fill="${F_RED}" stroke="${F_BLACK}" stroke-width=".6"/><circle cx="68" cy="50" r="1" fill="${F_YEL}"/>`;
  } else {
    g += `<path d="M42,38 Q40,28 50,28 Q60,28 58,38 L56,35 L44,35Z" fill="${hair}" stroke="${F_BLACK}" stroke-width=".6"/>`;
    g += `<path d="M38,35 Q50,24 62,35 Q50,32 38,35Z" fill="${robeB}" stroke="${F_BLACK}" stroke-width=".9"/>`;
    g += `<path d="M58,31 Q68,22 66,14 Q63,22 56,29Z" fill="${F_YEL}" stroke="${F_BLACK}" stroke-width=".7"/>`;
    // halberd for the jack
    g += `<path d="M30,80 L30,40" stroke="#8a5a2b" stroke-width="1.6"/><path d="M30,40 l-4,6 h8z" fill="#c9ccd1" stroke="${F_BLACK}" stroke-width=".6"/>`;
  }
  g += use('fsym' + s, 26.5, 34, 0.62);
  return g;
}

function frenchCard(s, r) {
  let body = '';
  if (r <= 4) {
    const sc = r >= 3 ? 0.98 : 1.08;
    body = F_PIPS[r].map(([x, y, rot]) => use('fsym' + s, x, fy(y), sc, rot ? 180 : 0)).join('');
  } else if (r <= 7) {
    const k = 'BDK'[r - 5];
    body = `<rect x="18" y="26" width="64" height="108" rx="2" fill="#fffdf6" stroke="${F_COL[s]}" stroke-width="1"/>
      <clipPath id="half"><rect x="18" y="26" width="64" height="54"/></clipPath>
      <g clip-path="url(#half)"><g transform="translate(50,80) scale(.84) translate(-50,-80)">${frenchBust(s, k)}</g></g>
      <g transform="rotate(180 50 80)"><g clip-path="url(#half)"><g transform="translate(50,80) scale(.84) translate(-50,-80)">${frenchBust(s, k)}</g></g></g>
      <path d="M18,80 H82" stroke="${F_COL[s]}" stroke-width=".8"/>`;
  } else {
    body = use('fsym' + s, 50, 80, 3.0);
    if (s === 3) body += `<path d="M50,52 L50,108 M28,80 L72,80" stroke="#fff" stroke-width=".8" opacity=".5"/>`;
  }
  return `${svgOpen}<defs>${FRENCH_SYM}</defs>
    <rect x=".8" y=".8" width="98.4" height="158.4" rx="6.5" fill="#fffef9" stroke="#2a2a2a" stroke-width="1.6"/>
    ${body}${frenchIndex(s, r)}</svg>`;
}

function frenchBack() {
  return `${svgOpen}<defs><pattern id="fb" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="${F_BLUE}"/><path d="M4,0 L8,4 L4,8 L0,4Z" fill="none" stroke="#9db7e6" stroke-width=".7"/>
      <circle cx="4" cy="4" r=".8" fill="#ffffff"/></pattern></defs>
    <rect x=".8" y=".8" width="98.4" height="158.4" rx="6.5" fill="#ffffff" stroke="#2a2a2a" stroke-width="1.6"/>
    <rect x="6" y="6" width="88" height="148" rx="3" fill="url(#fb)"/>
    <rect x="6" y="6" width="88" height="148" rx="3" fill="none" stroke="#0f2a66" stroke-width="1.2"/>
  </svg>`;
}

// =================================================================== write

for (let s = 0; s < 4; s++) for (let r = 0; r < 9; r++) {
  write('alternative', fileName(s, r), swissCard(s, r));
  write('french', fileName(s, r), frenchCard(s, r));
}
write('alternative', 'back.svg', swissBack());
// suit icons for the UI (trump display, wish, mode buttons)
for (let s = 0; s < 4; s++) {
  write('alternative', `suit_${SUIT_FILE[s]}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-11.5 -11.5 23 23"><defs>${SWISS_SYM}</defs>${use('sym' + s, 0, 0, 1)}</svg>`);
  write('french', `suit_${SUIT_FILE[s]}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-11.5 -11.5 23 23"><defs>${FRENCH_SYM}</defs>${use('fsym' + s, 0, 0, 1)}</svg>`);
}
write('french', 'back.svg', frenchBack());
console.log('wrote', out + '/alternative', out + '/french');
