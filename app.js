(function(){
'use strict';
var A = Astronomy;
var TZ = 'America/Boise';
var BOISE = new A.Observer(43.615, -116.2023, 825);
var BIRTH = { date: new Date(Date.UTC(1978,10,22,11,48,0)), lat: 37.6391, lon: -120.9969 };
var FE0E = '\ufe0e';
function g(s){ return s + FE0E; }
function norm(l){ return ((l % 360) + 360) % 360; }
function $(id){ return document.getElementById(id); }

/* ---------- seeded randomness ---------- */
function xmur3(str){ var h = 1779033703 ^ str.length; for (var i=0;i<str.length;i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h<<13 | h>>>19; }
  return function(){ h = Math.imul(h ^ h>>>16, 2246822507); h = Math.imul(h ^ h>>>13, 3266489909); return (h ^= h>>>16) >>> 0; }; }
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a>>>15, 1 | a); t = t + Math.imul(t ^ t>>>7, 61 | t) ^ t; return ((t ^ t>>>14) >>> 0) / 4294967296; }; }
function seedRand(s){ return mulberry32(xmur3(s)()); }

/* ---------- reference data ---------- */
var SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
var SIGN_G = ['\u2648','\u2649','\u264a','\u264b','\u264c','\u264d','\u264e','\u264f','\u2650','\u2651','\u2652','\u2653'];
var ELEM_COL = ['#e08e79','#8fb89a','#a9a3e6','#7fb0d9'];  // fire, earth, air, water
function signColor(i){ return ELEM_COL[i % 4]; }
var BODIES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
var P = {
  Sun:{g:'\u2609',t:'vitality and the spotlight'}, Moon:{g:'\u263d',t:'mood and inner needs'},
  Mercury:{g:'\u263f',t:'thinking and talking'}, Venus:{g:'\u2640',t:'love and ease'},
  Mars:{g:'\u2642',t:'drive and edge'}, Jupiter:{g:'\u2643',t:'growth and luck'},
  Saturn:{g:'\u2644',t:'structure and duty'}, Uranus:{g:'\u2645',t:'surprise and change'},
  Neptune:{g:'\u2646',t:'dreams and fog'}, Pluto:{g:'\u2647',t:'depth and transformation'},
  Asc:{g:'Asc',t:'how you show up'}, MC:{g:'MC',t:'your path and public face'}, Node:{g:'\u260a',t:'the long-term direction'}
};
var HOUSE_T = ['', 'self and fresh starts','money, comfort and self-worth','conversation and short trips','home and roots','play, romance and creativity','daily routines and health habits','partners and close one-on-ones','intimacy and deep feelings','big ideas, travel and meaning','work and reputation','friends and community','rest, solitude and dreams'];
var MOON_SIGN = [
 'Bold, quick and a little impatient. Good for starting things.',
 'Slow, sensual and steady. Comfort, good food and soft sweaters.',
 'Chatty and curious. Text a friend, read something new.',
 'Tender and homebody. Nest, nourish, check on your people.',
 'Warm, playful and generous. Let yourself be seen.',
 'Tidy and practical. Small fixes feel wonderful today.',
 'Gracious and harmony-seeking. Beauty and good conversation.',
 'Intense and private. Feelings run deep; trust the quiet ones.',
 'Adventurous and hopeful. Get outside, widen the view.',
 'Focused and disciplined. Chip away at the big thing.',
 'Detached, inventive and friendly. Ideas and community.',
 'Dreamy and empathic. Protect your energy, make something.'
];
var PHASES = [
 ['New Moon','A blank page. Set one quiet intention.'],
 ['Waxing Crescent','Small beginnings. Take the first step.'],
 ['First Quarter','A moment of decision. Push through the friction.'],
 ['Waxing Gibbous','Refine and adjust. You are nearly there.'],
 ['Full Moon','Peak light. Celebrate, then release what is done.'],
 ['Waning Gibbous','Share what you have learned. Gratitude season.'],
 ['Last Quarter','Let go of what is not working.'],
 ['Waning Crescent','Rest and restore before the next cycle.']
];
function phaseIndex(a){ return Math.floor(((a + 22.5) % 360) / 45); }

/* ---------- astronomy helpers ---------- */
function lonOf(name, t){
  if (name === 'Sun') return A.SunPosition(t).elon;
  if (name === 'Moon') return A.EclipticGeoMoon(t).lon;
  return A.Ecliptic(A.GeoVector(A.Body[name], t, true)).elon;
}
function isRetro(name, t){
  if (name === 'Sun' || name === 'Moon') return false;
  var d = lonOf(name, t.AddDays(0.5)) - lonOf(name, t.AddDays(-0.5));
  if (d > 180) d -= 360; if (d < -180) d += 360;
  return d < 0;
}
function signIdx(l){ return Math.floor(norm(l) / 30); }
function degIn(l){ var d = norm(l) % 30; var m = Math.floor((d % 1) * 60); return Math.floor(d) + '\u00b0' + (m < 10 ? '0' : '') + m + '\u2032'; }
function chartFor(date, lat, lon, angles){
  var t = A.MakeTime(date), out = { t: t, pts: [] };
  BODIES.forEach(function(b){ var l = lonOf(b, t); out.pts.push({ name:b, lon:l, retro:isRetro(b, t) }); });
  var T = t.tt / 36525;
  var eps = (23.4392911 - 0.0130042 * T) * Math.PI / 180;
  var lst = (((A.SiderealTime(t) + lon / 15) % 24) + 24) % 24;
  var ramc = lst * 15 * Math.PI / 180, la = lat * Math.PI / 180;
  out.asc = norm(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(la) * Math.sin(eps))) * 180 / Math.PI);
  out.mc  = norm(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * 180 / Math.PI);
  out.node = norm(125.04452 - 1934.136261 * T);
  return out;
}
function houseOf(lon, asc){ return ((signIdx(lon) - signIdx(asc) + 12) % 12) + 1; }

var ASP = [
 {n:'conjunction',a:0,o:3,tone:'merges with',cls:'mix',tag:'Intensifies',line:'Focused, concentrated energy.'},
 {n:'sextile',a:60,o:2,tone:'opens an easy door to',cls:'soft',tag:'Opportunity',line:'A gentle opening. Use it.'},
 {n:'square',a:90,o:3,tone:'pushes against',cls:'hard',tag:'Friction',line:'Some friction, which builds muscle.'},
 {n:'trine',a:120,o:3,tone:'flows with',cls:'soft',tag:'Easy flow',line:'Things come more easily. Enjoy it.'},
 {n:'opposition',a:180,o:3,tone:'faces off with',cls:'hard',tag:'Balance',line:'Two pulls to balance.'}
];
function findAspects(tr, nat){
  var out = [];
  tr.forEach(function(t){ nat.forEach(function(n){
    var d = Math.abs(norm(t.lon - n.lon)); if (d > 180) d = 360 - d;
    ASP.forEach(function(a){ var orb = Math.abs(d - a.a); if (orb <= a.o) out.push({t:t, n:n, a:a, orb:orb}); });
  }); });
  return out.sort(function(x,y){ return x.orb - y.orb; });
}

/* ---------- time in Boise ---------- */
var now = new Date();
function parts(d, opts){ var o = {}; new Intl.DateTimeFormat('en-US', Object.assign({timeZone:TZ}, opts)).formatToParts(d).forEach(function(p){ o[p.type] = p.value; }); return o; }
function fmtDay(d){ return d.toLocaleDateString('en-US', {timeZone:TZ, weekday:'short', month:'short', day:'numeric'}); }
function fmtTime(d){ return d ? d.toLocaleTimeString('en-US', {timeZone:TZ, hour:'numeric', minute:'2-digit'}) : '\u2014'; }
function dateKey(d){ return new Intl.DateTimeFormat('en-CA', {timeZone:TZ}).format(d); }
function boiseHour(d){ return (+parts(d, {hour:'2-digit', hour12:false}).hour) % 24; }
function startOfDay(d){ var p = parts(d, {hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false}); return new Date(d - ((((+p.hour) % 24) * 60 + (+p.minute)) * 60 + (+p.second)) * 1000); }
function inDays(date){ var n = Math.round((date - now) / 864e5); return n <= 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days'; }

/* ---------- moon drawing ---------- */
function moonShape(r, a, id){
  var c = Math.cos(a * Math.PI / 180), rx = Math.abs(c) * r, waxing = a < 180;
  var limb = waxing ? 1 : 0, term = waxing ? (c > 0 ? 0 : 1) : (c > 0 ? 1 : 0);
  var d = 'M0 ' + (-r) + ' A' + r + ' ' + r + ' 0 0 ' + limb + ' 0 ' + r + ' A' + rx.toFixed(2) + ' ' + r + ' 0 0 ' + term + ' 0 ' + (-r) + ' Z';
  var s = '<circle r="' + r + '" fill="#171a42" stroke="rgba(243,234,211,.28)" stroke-width="1"/>';
  s += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>';
  s += '<path d="' + d + '" fill="url(#moonGrad)"/>';
  s += '<g clip-path="url(#' + id + ')" fill="#cdbf98" opacity=".5"><circle cx="' + (-r*.3) + '" cy="' + (-r*.25) + '" r="' + (r*.2) + '"/><circle cx="' + (r*.28) + '" cy="' + (r*.1) + '" r="' + (r*.14) + '"/><circle cx="' + (-r*.1) + '" cy="' + (r*.45) + '" r="' + (r*.12) + '"/><circle cx="' + (r*.38) + '" cy="' + (-r*.42) + '" r="' + (r*.09) + '"/></g>';
  return s;
}

/* ---------- hero scene ---------- */
function drawScene(angle, hr){
  var W = 390, H = 372, rnd = seedRand('boise-front-range');
  var dawn = hr >= 5 && hr < 9;
  var top = '#070a1d', mid = dawn ? '#2a2257' : '#141840', low = dawn ? '#b0646a' : '#2c2b5e';
  var s = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + top + '"/><stop offset=".55" stop-color="' + mid + '"/><stop offset="1" stop-color="' + low + '"/></linearGradient></defs>';
  s += '<rect width="' + W + '" height="' + H + '" fill="url(#sky)"/>';
  for (var i = 0; i < 80; i++){
    var x = rnd() * W, y = rnd() * 230, r = .4 + rnd() * 1.1, o = (dawn ? .45 : .9) * (.3 + rnd() * .7);
    s += '<circle class="star' + (rnd() > .7 ? ' tw' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '" fill="#fff6dd" opacity="' + o.toFixed(2) + '" style="animation-delay:' + (rnd() * 3).toFixed(1) + 's"/>';
  }
  var mx = 306, my = 96;
  s += '<circle cx="' + mx + '" cy="' + my + '" r="86" fill="url(#moonGlow)"/>';
  s += '<g transform="translate(' + mx + ' ' + my + ')">' + moonShape(30, angle, 'heroMoon') + '</g>';
  function ridge(base, amp, step, f1, f2, col, stroke, seed){
    var rr = seedRand(seed), p1 = rr() * 6, p2 = rr() * 6, d = 'M0 ' + H;
    for (var x = -step; x <= W + step; x += step){
      var y = base - amp * (0.55 * Math.abs(Math.sin(x * f1 + p1)) + 0.3 * Math.sin(x * f2 + p2) + 0.18 * rr());
      d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    d += ' L' + W + ' ' + H + ' Z';
    return '<path d="' + d + '" fill="' + col + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="1.2"' : '') + '/>';
  }
  s += ridge(262, 120, 13, .018, .045, dawn ? '#3d2f66' : '#26295a', 'rgba(243,234,211,.30)', 'ridge-a');
  s += ridge(300, 90, 11, .026, .06, dawn ? '#271f4c' : '#181b46', 'rgba(243,234,211,.16)', 'ridge-b');
  s += ridge(338, 60, 9, .035, .08, '#0d1030', '', 'ridge-c');
  var pr = seedRand('pines');
  function pine(x, base, h, col){
    var w = h * .42, d = '';
    for (var k = 0; k < 3; k++){ var ty = base - h + k * h * .27, bw = w * (.5 + k * .27), by = ty + h * .4; d += 'M' + x + ' ' + ty + ' L' + (x + bw) + ' ' + by + ' L' + (x - bw) + ' ' + by + ' Z '; }
    return '<path d="' + d + '" fill="' + col + '"/><rect x="' + (x - 1.4) + '" y="' + (base - h * .12) + '" width="2.8" height="' + (h * .14) + '" fill="' + col + '"/>';
  }
  var treeXs = [8,26,44,60,80,300,322,341,360,378,12,34,350,370];
  treeXs.forEach(function(x, idx){ var h = 38 + pr() * 40; s += pine(x + pr() * 6, H - 6 - (idx > 9 ? 22 : 0) , h, idx > 9 ? '#0a0d28' : '#070a1c'); });
  s += '<rect x="0" y="' + (H - 8) + '" width="' + W + '" height="8" fill="#070a1c"/>';
  $('scene').innerHTML = s;
}

/* ---------- tarot ---------- */
var MOTIF = {
  pines:function(){ return '<path d="M50 12 L66 40 H57 L73 64 H27 L43 40 H34 Z"/><path d="M50 64 V84 M36 86 H64"/>'; },
  cups:function(){ return '<path d="M60 18 A26 26 0 1 0 60 72 A20 20 0 1 1 60 18 Z"/><path d="M14 84 q9 -9 18 0 t18 0 t18 0 t18 0"/>'; },
  peak:function(){ return '<path d="M10 82 L38 30 L54 58 L66 42 L90 82 Z"/><path d="M29 44 L38 30 L47 44 L38 40 Z"/><circle cx="76" cy="20" r="3"/>'; },
  pentacle:function(){ return '<circle cx="50" cy="50" r="34"/><path d="M50 22 L63 70 L24 41 L76 41 L37 70 Z"/>'; },
  sun:function(){ var s = '<circle cx="50" cy="50" r="15"/>'; for (var i = 0; i < 12; i++){ var a = i * Math.PI / 6; s += '<path d="M' + (50 + 22 * Math.cos(a)).toFixed(1) + ' ' + (50 + 22 * Math.sin(a)).toFixed(1) + ' L' + (50 + 34 * Math.cos(a)).toFixed(1) + ' ' + (50 + 34 * Math.sin(a)).toFixed(1) + '"/>'; } return s; },
  moon:function(){ return '<path d="M64 14 A36 36 0 1 0 64 86 A28 28 0 1 1 64 14 Z"/><circle cx="74" cy="30" r="2.2"/><circle cx="82" cy="52" r="1.6"/>'; },
  star:function(){ return '<path d="M50 10 V90 M10 50 H90 M22 22 L78 78 M78 22 L22 78"/><circle cx="50" cy="50" r="8"/>'; },
  lantern:function(){ return '<path d="M50 8 V20"/><path d="M38 20 H62 L67 32 H33 Z"/><rect x="35" y="32" width="30" height="28"/><path d="M45 60 H55 L58 66 H42 Z"/><path d="M14 90 L36 70 L50 82 L66 66 L88 90"/>'; },
  wheel:function(){ var s = '<circle cx="50" cy="50" r="34"/><circle cx="50" cy="50" r="9"/>'; for (var i = 0; i < 8; i++){ var a = i * Math.PI / 4; s += '<path d="M' + (50 + 9 * Math.cos(a)).toFixed(1) + ' ' + (50 + 9 * Math.sin(a)).toFixed(1) + ' L' + (50 + 34 * Math.cos(a)).toFixed(1) + ' ' + (50 + 34 * Math.sin(a)).toFixed(1) + '"/>'; } return s; },
  tower:function(){ return '<path d="M36 88 V34 H64 V88 Z"/><path d="M32 34 L50 12 L68 34 Z"/><path d="M66 44 L50 60 L58 60 L44 78"/>'; },
  flame:function(){ return '<path d="M50 10 C62 28 74 40 70 58 C68 74 58 84 50 84 C40 84 30 74 31 58 C32 48 42 42 44 30 C48 34 50 38 50 44 C58 36 54 24 50 10 Z"/>'; },
  eye:function(){ return '<path d="M8 50 Q50 12 92 50 Q50 88 8 50 Z"/><circle cx="50" cy="50" r="12"/><circle cx="50" cy="50" r="3"/>'; }
};
var MAJORS = [
 ['0','The Fool','beginnings \u00b7 trust \u00b7 a light step','Begin before you feel ready. Take one light step down the trail and let the path show itself.','peak'],
 ['I','The Magician','focus \u00b7 skill \u00b7 making','You already have the tools on the table. Gather them, aim them, and make something.','flame'],
 ['II','The High Priestess','intuition \u00b7 stillness \u00b7 mystery','Listen to what is quiet. Your intuition speaks in the pauses between words.','moon'],
 ['III','The Empress','abundance \u00b7 comfort \u00b7 nurture','Let yourself be nourished today, and let something of yours grow without hurry.','pines'],
 ['IV','The Emperor','structure \u00b7 steadiness \u00b7 authority','Make the plan, set the boundary, keep the promise. Calm authority is your friend.','peak'],
 ['V','The Hierophant','tradition \u00b7 teachers \u00b7 ritual','Lean on what has been handed down to you: a ritual, a mentor, a tried-and-true way.','lantern'],
 ['VI','The Lovers','connection \u00b7 values \u00b7 choice','A heartfelt choice is on the table. Pick what is in line with who you really are.','sun'],
 ['VII','The Chariot','determination \u00b7 drive \u00b7 direction','Pull your competing pulls into one direction and hold the reins. Momentum is yours.','wheel'],
 ['VIII','Strength','gentle courage \u00b7 patience \u00b7 heart','You tame the lion by being kind to it. Quiet courage beats force today.','sun'],
 ['IX','The Hermit','solitude \u00b7 insight \u00b7 the lantern','Climb a little higher, alone if you need to. The view clears when you carry your own light.','lantern'],
 ['X','Wheel of Fortune','cycles \u00b7 turning points \u00b7 luck','The wheel is turning. Move with the change rather than bracing against it.','wheel'],
 ['XI','Justice','truth \u00b7 fairness \u00b7 cause and effect','Tell the plain truth, weigh it fairly, and accept what follows from it.','star'],
 ['XII','The Hanged Man','pause \u00b7 surrender \u00b7 new angle','Stop pushing. Hanging still shows you a view you could not get any other way.','moon'],
 ['XIII','Death','endings \u00b7 release \u00b7 renewal','Something has finished. Let it go gracefully and make room for what is next.','moon'],
 ['XIV','Temperance','balance \u00b7 blending \u00b7 patience','Mix a little of this with a little of that. Slow, even pacing wins the day.','cups'],
 ['XV','The Devil','attachment \u00b7 habit \u00b7 shadow','Notice what you feel chained to. The chain is looser than it looks.','flame'],
 ['XVI','The Tower','upheaval \u00b7 revelation \u00b7 clearing','A shake-up shows what was never solid. What you rebuild will be truer.','tower'],
 ['XVII','The Star','hope \u00b7 healing \u00b7 guidance','Look up. You are being guided, and a little healing is already underway.','star'],
 ['XVIII','The Moon','dreams \u00b7 tides \u00b7 the unseen','Move slowly in the half-light. Trust your instincts, and do not mistake shadows for walls.','moon'],
 ['XIX','The Sun','joy \u00b7 clarity \u00b7 warmth','Say yes to the light. Simple, honest happiness is available today.','sun'],
 ['XX','Judgement','calling \u00b7 forgiveness \u00b7 renewal','Something is calling you to rise. Forgive, take stock, and begin again.','eye'],
 ['XXI','The World','completion \u00b7 wholeness \u00b7 arrival','A cycle completes. Take a bow, then look out at the next range.','wheel']
];
var SUITS = [
 {n:'Wands', m:'pines', kw:['fire','action','inspiration'], c:[
  'A spark of new energy is offered. Say yes to the idea that makes you restless.',
  'You are at the trailhead with the map open. Choose a direction, then walk.',
  'Your ships are on the horizon. Patience and a wide view will pay off.',
  'A small celebration is allowed. Mark the milestone with people you like.',
  'Friendly friction. Many voices, no real harm. Sort it out like a game.',
  'A quiet win. Let yourself be seen and thanked.',
  'Hold your ground; you are higher up than you think.',
  'Things move fast now. Answer the messages and keep momentum.',
  'Nearly there, and a little bruised. One more push, then rest.',
  'You are carrying a lot. Set down one bundle.',
  'A curious message arrives. Try something new without needing to be good at it.',
  'Charge ahead with enthusiasm, but check the trail before you leap.',
  'Warmth is your power today. Be generous and unapologetically yourself.',
  'Lead by vision. Others follow a steady flame.']},
 {n:'Cups', m:'cups', kw:['water','feeling','connection'], c:[
  'An open heart overflows. Let kindness in, and pass some along.',
  'A meeting of equals. Give and receive in the same breath.',
  'Friends and a toast. Reach out to your people.',
  'Something is being offered while you stare at what is missing. Look up.',
  'Grief is real, and two cups still stand. Honor the loss, then turn around.',
  'Sweet nostalgia. An old friend or memory comes back around.',
  'Many dreamy options. Choose one and give it solid ground.',
  'Walking away from what no longer feeds you is allowed. Head for higher ground.',
  'A wish nearly granted. Enjoy what you have and say thank you.',
  'Contentment at home and in the heart.',
  'A tender, creative message arrives. Pay attention to your dreams.',
  'Romantic and graceful. Follow the invitation of your heart with your eyes open.',
  'Deep intuition. Trust the feeling that arrives first.',
  'Calm waters and a steady heart. Be the one who listens.']},
 {n:'Swords', m:'peak', kw:['air','mind','truth'], c:[
  'Clarity cuts through the fog. Say the true thing plainly.',
  'A stalemate with the blindfold on. Admit that you already know.',
  'A heartache surfaces. Name it and let the rain fall.',
  'Rest is productive. Retreat somewhere quiet.',
  'A hollow win or a tense exchange. Choose peace over being right.',
  'A gentle passage to calmer water. Leave the weight behind.',
  'Be strategic, and honest with yourself about shortcuts.',
  'Feeling boxed in. The ties are looser than they look.',
  'Midnight worries inflate. Morning light will shrink them.',
  'An ending, and the worst has passed. Dawn is coming.',
  'Curiosity and sharp questions. Learn before you speak.',
  'Fast thoughts and bold words. Slow down enough to aim.',
  'Clear-eyed honesty with a kind heart. Boundaries are a form of love.',
  'Reason and fairness. Decide with your head today.']},
 {n:'Pentacles', m:'pentacle', kw:['earth','work','body'], c:[
  'A seed of opportunity. Plant it somewhere solid.',
  'You are juggling it all. Stay flexible and keep your rhythm.',
  'Craft and collaboration. Your skill is being noticed.',
  'Holding tight to security. Loosen your grip a little.',
  'A cold stretch, with a warm window nearby. Ask for help.',
  'Giving and receiving in balance. Be generous, and accept generosity.',
  'Patience in the garden. Do not dig up the seeds to check.',
  'Steady, mindful work. Mastery is built from small repeated acts.',
  'Quiet abundance. Enjoy your own company and your own good work.',
  'Legacy, family and lasting roots.',
  'A practical new interest. Start small and keep it real.',
  'Slow, reliable progress. Be the one who finishes.',
  'Nurture home, body, garden and budget. Tend what is yours.',
  'Grounded prosperity. Build something that lasts.']}
];
var RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];
var RANK_NUM = ['A','II','III','IV','V','VI','VII','VIII','IX','X','Page','Knight','Queen','King'];
function buildDeck(){
  var deck = MAJORS.map(function(m){ return {num:m[0], name:m[1], kw:m[2], msg:m[3], motif:m[4], suit:'Major Arcana'}; });
  SUITS.forEach(function(s){ s.c.forEach(function(msg, i){
    deck.push({num:RANK_NUM[i], name:RANKS[i] + ' of ' + s.n, kw:s.kw.join(' \u00b7 '), msg:msg, motif:s.m, suit:s.n + ' \u00b7 ' + ['Fire','Water','Air','Earth'][SUITS.indexOf(s)]});
  }); });
  return deck;
}

/* ---------- Grateful Dead song of the day (titles only, no lyrics) ---------- */
var SONGS = [
 ['Ripple','American Beauty',1970,'Quiet, open-handed wisdom.'],
 ['Box of Rain','American Beauty',1970,'A gentle goodbye and a thank-you in one.'],
 ['Friend of the Devil','American Beauty',1970,'A bright melody with a run-from-trouble heart.'],
 ['Sugar Magnolia','American Beauty',1970,'Pure sunshine and good company.'],
 ['Brokedown Palace','American Beauty',1970,'A lullaby for the end of a long day.'],
 ["Truckin'",'American Beauty',1970,'A road-weary shrug that turns joyful.'],
 ["Uncle John's Band",'Workingman\u2019s Dead',1970,'A campfire invitation to come and listen.'],
 ['Casey Jones','Workingman\u2019s Dead',1970,'A runaway train with a wink.'],
 ['Dire Wolf','Workingman\u2019s Dead',1970,'A spooky porch-tale singalong.'],
 ['Cumberland Blues','Workingman\u2019s Dead',1970,'Hard-working bluegrass bounce.'],
 ['Black Peter','Workingman\u2019s Dead',1970,'Tender, slow and honest about endings.'],
 ['Dark Star','Live/Dead',1969,'Space-drift for long, curious thoughts.'],
 ['St. Stephen','Aoxomoxoa',1969,'Whirling, mythic and a little mischievous.'],
 ['Mountains of the Moon','Aoxomoxoa',1969,'Moonlit strangeness. Made for a page like this.'],
 ['China Cat Sunflower','Aoxomoxoa',1969,'A kaleidoscope with a bounce.'],
 ['Morning Dew','The Grateful Dead',1967,'A hushed, haunting dawn.'],
 ['Cold Rain and Snow','The Grateful Dead',1967,'Mountain-ballad moodiness with a driving beat.'],
 ['Eyes of the World','Wake of the Flood',1973,'Wide-open sky and bright, loose jamming.'],
 ['Here Comes Sunshine','Wake of the Flood',1973,'Rain breaking into light.'],
 ['Stella Blue','Wake of the Flood',1973,'Late-night tenderness.'],
 ['Row Jimmy','Wake of the Flood',1973,'A slow drift down a warm river.'],
 ['Weather Report Suite','Wake of the Flood',1973,'Changing weather, changing seasons.',['weatherreport','letitgrow']],
 ['Scarlet Begonias','From the Mars Hotel',1974,'A good-spirited strut down the street.'],
 ['U.S. Blues','From the Mars Hotel',1974,'Goofy, flag-waving fun.'],
 ['China Doll','From the Mars Hotel',1974,'A slow, sad waltz.'],
 ["Franklin's Tower",'Blues for Allah',1975,'Rolling-on-the-river optimism.'],
 ['Help on the Way','Blues for Allah',1975,'Tricky and turning, then wide open.'],
 ['The Music Never Stopped','Blues for Allah',1975,'Dancing-in-the-crowd joy.'],
 ['Crazy Fingers','Blues for Allah',1975,'Dreamy, reggae-tinged drift.'],
 ['Terrapin Station','Terrapin Station',1977,'A grand storybook suite.'],
 ['Estimated Prophet','Terrapin Station',1977,'Hypnotic, mystical groove.'],
 ['Fire on the Mountain','Shakedown Street',1978,'Slow-burn mountain heat. It came out the year you were born.'],
 ['Shakedown Street','Shakedown Street',1978,'Funky parking-lot swagger.'],
 ['I Need a Miracle','Shakedown Street',1978,'Rowdy and hopeful.'],
 ['Althea','Go to Heaven',1980,'A wry, thoughtful heart-to-heart.'],
 ['Alabama Getaway','Go to Heaven',1980,'Fast, fun road-trip energy.'],
 ['Touch of Grey','In the Dark',1987,'Resilient, laughing through it.'],
 ['Black Muddy River','In the Dark',1987,'Calm, weathered and honest.'],
 ['Standing on the Moon','Built to Last',1989,'Gentle moon-gazing. Right at home on a night like tonight.'],
 ["He's Gone",'Europe \u201972',1972,'A bittersweet singalong goodbye.'],
 ['Jack Straw','Europe \u201972',1972,'Outlaw bravado with great harmonies.'],
 ['Brown-Eyed Women','Europe \u201972',1972,'Old-timey storytelling.'],
 ['Tennessee Jed','Europe \u201972',1972,'Rambling and good-natured.'],
 ['Ramble On Rose','Europe \u201972',1972,'Easy-rolling and playful.']
];

/* ---------- build the page ---------- */
var t = A.MakeTime(now);
var hr = boiseHour(now);
var key = dateKey(now);

// moon numbers
var angle = A.MoonPhase(t);
var illum = A.Illumination(A.Body.Moon, t).phase_fraction;
var pIdx = phaseIndex(angle);
var moonLon = lonOf('Moon', t);
var lastNew = A.SearchMoonPhase(0, t.AddDays(-31), 32);
var age = lastNew ? (now - lastNew.date) / 864e5 : null;
var nextNew = A.SearchMoonPhase(0, t, 40), nextFull = A.SearchMoonPhase(180, t, 40), nextQ = A.SearchMoonQuarter(t);
var QN = ['New Moon','First Quarter','Full Moon','Last Quarter'];

$('greet').textContent = (hr < 12 ? 'Good morning,' : hr < 17 ? 'Good afternoon,' : 'Good evening,');
$('today').textContent = now.toLocaleDateString('en-US', {timeZone:TZ, weekday:'long', month:'long', day:'numeric'}) + ' \u00b7 Boise';
$('phaseName').textContent = PHASES[pIdx][0];
$('phaseMeta').innerHTML = '<b>' + Math.round(illum * 100) + '%</b> lit \u00b7 Moon in <b>' + SIGNS[signIdx(moonLon)] + '</b>' + (age != null ? ' \u00b7 day ' + Math.floor(age + 1) : '');
drawScene(angle, hr);

// birthday banner (Nov 22)
(function(){
  var p = parts(now, {month:'numeric', day:'numeric'}), m = +p.month, d = +p.day;
  var diff = (m === 11) ? d - 22 : 99;
  if (diff >= -3 && diff <= 7){
    var msg = diff === 0 ? 'Happy birthday, Julie!' : diff < 0 ? 'Your birthday is almost here.' : 'Happy birthday week, Julie.';
    $('bday').innerHTML = '<div class="banner"><b>' + msg + '</b><br>The Sun is back where it stood the day you were born, near 29\u00b0 Scorpio. This is your personal new year.</div>';
  }
})();

// tarot
(function(){
  var deck = buildDeck();
  var idx = Math.floor(seedRand('tarot|julie|' + key)() * deck.length);
  var c = deck[idx];
  $('tfront').innerHTML = '<div class="tnum">' + c.num + '</div><svg class="motif" viewBox="0 0 100 100" aria-hidden="true">' + MOTIF[c.motif]() + '</svg><div class="tname">' + c.name + '</div><div class="tsuit">' + c.suit + '</div>';
  $('reveal').innerHTML = '<div class="kw">' + c.kw + '</div><p>' + c.msg + '</p>';
  // card back art
  var back = '<g stroke="#d9b26f" fill="none" stroke-width="1.4" opacity=".9"><rect x="16" y="16" width="158" height="278" rx="8"/></g>';
  var br = seedRand('back');
  for (var i = 0; i < 30; i++) back += '<circle cx="' + (24 + br() * 142).toFixed(0) + '" cy="' + (24 + br() * 150).toFixed(0) + '" r="' + (.5 + br()).toFixed(1) + '" fill="#f3ead3" opacity="' + (.4 + br() * .5).toFixed(2) + '"/>';
  back += '<g transform="translate(95 108)">' + moonShape(34, 150, 'backMoon') + '</g>';
  back += '<path d="M22 288 L62 200 L84 238 L112 190 L168 288 Z" fill="#0a0d28" stroke="#d9b26f" stroke-width="1.2"/>';
  back += '<path d="M52 220 L62 200 L72 220 L62 214 Z M104 206 L112 190 L122 208 L112 202 Z" fill="#f3ead3" opacity=".8"/>';
  $('backArt').innerHTML = back;
  var card = $('tcard');
  function flip(){ var on = card.classList.toggle('flipped'); $('reveal').classList.toggle('on', on); $('tap').style.opacity = on ? 0 : 1; $('tap').style.display = on ? 'none' : 'block'; }
  card.addEventListener('click', flip);
  card.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(); } });
})();

// song of the day
(function(){
  var s = SONGS[Math.floor(seedRand('dead|' + key)() * SONGS.length)];
  var url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent('Grateful Dead ' + s[0]);
  var vinyl = '<svg class="vinyl" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#0a0d28" stroke="rgba(243,234,211,.3)"/><circle cx="32" cy="32" r="24" fill="none" stroke="rgba(243,234,211,.12)"/><circle cx="32" cy="32" r="18" fill="none" stroke="rgba(243,234,211,.12)"/><circle cx="32" cy="32" r="10" fill="#d9b26f"/><circle cx="32" cy="32" r="2" fill="#0a0d28"/></svg>';
  $('songBox').innerHTML = '<div class="song">' + vinyl + '<div><div class="t">' + s[0] + '</div><div class="m">' + s[1] + ' \u00b7 ' + s[2] + '</div></div></div><div class="v">' + s[3] + '</div>';
  setupPlayer(s, url, key);
})();

/* ---------- live recording player (Internet Archive Live Music Archive) ---------- */
function setupPlayer(song, listenUrl, dayKey){
  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  var pp = $('pp'), pt = $('pt'), bar = $('bar'), pcur = $('pcur'), pdur = $('pdur'), nx = $('nx'), player = $('player');
  var fallback = '<a class="btn" href="' + listenUrl + '" target="_blank" rel="noopener">Find it on YouTube \u2192</a>';
  function showFallback(){ player.hidden = true; $('songBox').insertAdjacentHTML('beforeend', fallback); }
  if (!window.fetch || !window.Audio){ showFallback(); return; }
  player.hidden = false; pp.innerHTML = ICON_PLAY;

  function clean(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  var aliases = (song[4] || [song[0]]).map(clean);
  function getJSON(u){ return fetch(u).then(function(r){ if (!r.ok) throw new Error('http ' + r.status); return r.json(); }); }
  function search(withDates){
    var q = 'collection:GratefulDead AND mediatype:etree AND format:"VBR MP3" AND description:"' + song[0].replace(/"/g, '') + '"';
    if (withDates) q += ' AND date:[' + (song[2] - 1) + '-01-01 TO ' + (song[2] + 4) + '-12-31]';
    return getJSON('https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) + '&fl%5B%5D=identifier&fl%5B%5D=title&sort%5B%5D=downloads+desc&rows=12&output=json')
      .then(function(j){ return (j.response && j.response.docs) || []; });
  }
  function seededOrder(list){
    var rnd = seedRand('dead-rec|' + dayKey), a = list.slice();
    for (var i = a.length - 1; i > 0; i--){ var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pickTrack(files){
    var best = null, bestScore = 0;
    files.forEach(function(f){
      if (!/\.mp3$/i.test(f.name) || !f.title) return;
      var t = clean(f.title);
      aliases.forEach(function(a){
        var score = t === a ? 3 : t.indexOf(a) === 0 ? 2 : t.indexOf(a) > -1 ? 1 : 0;
        if (score > bestScore){ best = f; bestScore = score; }
      });
    });
    return best;
  }
  function resolveDoc(doc){
    return getJSON('https://archive.org/metadata/' + encodeURIComponent(doc.identifier)).then(function(m){
      var f = pickTrack(m.files || []);
      if (!f) return null;
      var enc = f.name.split('/').map(encodeURIComponent).join('/');
      var title = m.metadata && m.metadata.title; if (title && title.join) title = title[0];
      return {
        src: (m.d1 && m.dir) ? 'https://' + m.d1 + m.dir + '/' + enc : 'https://archive.org/download/' + encodeURIComponent(doc.identifier) + '/' + enc,
        alt: 'https://archive.org/download/' + encodeURIComponent(doc.identifier) + '/' + enc,
        show: title || doc.title || doc.identifier,
        date: (/\d{4}-\d{2}-\d{2}/.exec(doc.identifier) || [''])[0]
      };
    });
  }
  var queue = [], qi = 0, current = null, au = new Audio(), triedAlt = false, shown = 0;
  au.preload = 'metadata';
  function nextRecording(){
    if (qi >= queue.length) return Promise.resolve(null);
    var doc = queue[qi++];
    return resolveDoc(doc).catch(function(){ return null; }).then(function(r){ return r || nextRecording(); });
  }
  function fmt(sec){ if (!isFinite(sec)) return ''; var m = Math.floor(sec / 60), s = Math.floor(sec % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  function label(rec){ return 'Live \u00b7 ' + (rec.date || '') + (rec.show ? ' \u00b7 ' + rec.show.replace(/^Grateful Dead\s*(Live)?\s*(at|on)?\s*/i, '') : ''); }
  function load(rec, autoplay){
    current = rec; triedAlt = false;
    au.src = rec.src; pt.textContent = label(rec); bar.style.width = '0'; pcur.textContent = '0:00'; pdur.textContent = '';
    pp.disabled = false;
    if ('mediaSession' in navigator && window.MediaMetadata){
      navigator.mediaSession.metadata = new MediaMetadata({title: song[0], artist: 'Grateful Dead', album: label(rec)});
      navigator.mediaSession.setActionHandler('play', function(){ au.play(); });
      navigator.mediaSession.setActionHandler('pause', function(){ au.pause(); });
    }
    if (autoplay) au.play().catch(function(){});
  }
  function advance(autoplay){
    pt.textContent = 'Finding another recording\u2026'; pp.disabled = true;
    return nextRecording().then(function(rec){
      if (rec){ load(rec, autoplay); shown++; }
      else { pt.textContent = shown ? 'That\u2019s all the recordings I could find for this song.' : 'No recording found today.'; if (!shown){ showFallback(); } else { pp.disabled = false; } }
    });
  }
  pp.addEventListener('click', function(){ if (!current) return; if (au.paused) au.play().catch(function(){ pt.textContent = 'Tap play again to start.'; }); else au.pause(); });
  nx.addEventListener('click', function(){ au.pause(); advance(true); });
  au.addEventListener('play', function(){ pp.innerHTML = ICON_PAUSE; pp.setAttribute('aria-label', 'Pause'); });
  au.addEventListener('pause', function(){ pp.innerHTML = ICON_PLAY; pp.setAttribute('aria-label', 'Play'); });
  au.addEventListener('ended', function(){ pp.innerHTML = ICON_PLAY; bar.style.width = '0'; });
  au.addEventListener('loadedmetadata', function(){ pdur.textContent = fmt(au.duration); });
  au.addEventListener('timeupdate', function(){ pcur.textContent = fmt(au.currentTime); if (au.duration) bar.style.width = (au.currentTime / au.duration * 100).toFixed(1) + '%'; });
  au.addEventListener('error', function(){
    if (current && !triedAlt && current.alt && au.src.indexOf('/download/') === -1){ triedAlt = true; au.src = current.alt; au.play().catch(function(){}); return; }
    advance(true);
  });

  search(true).then(function(d){ return d.length ? d : search(false); }).then(function(docs){
    queue = seededOrder(docs);
    if (!queue.length) throw new Error('none');
    return nextRecording();
  }).then(function(rec){
    if (!rec) throw new Error('nomatch');
    shown = 1; nx.hidden = false; load(rec, false);
  }).catch(function(){ showFallback(); });
}

// moon card
(function(){
  $('moonH').textContent = PHASES[pIdx][0] + ' in ' + SIGNS[signIdx(moonLon)];
  $('moonSub').innerHTML = PHASES[pIdx][1] + '<br>' + MOON_SIGN[signIdx(moonLon)];
  var strip = '';
  for (var i = 0; i < 7; i++){
    var d = new Date(now.getTime() + i * 864e5), a = A.MoonPhase(A.MakeTime(d));
    strip += '<div' + (i === 0 ? ' class="today"' : '') + '><svg viewBox="-18 -18 36 36"><g>' + moonShape(15, a, 'sm' + i) + '</g></svg>' + (i === 0 ? 'Today' : d.toLocaleDateString('en-US', {timeZone:TZ, weekday:'short'})) + '</div>';
  }
  $('strip').innerHTML = strip;
  var sod = startOfDay(now);
  var mr = A.SearchRiseSet(A.Body.Moon, BOISE, +1, sod, 1), ms = A.SearchRiseSet(A.Body.Moon, BOISE, -1, sod, 1);
  var sr = A.SearchRiseSet(A.Body.Sun, BOISE, +1, sod, 1), ss = A.SearchRiseSet(A.Body.Sun, BOISE, -1, sod, 1);
  $('moonDates').innerHTML =
    '<div class="d"><span>Next full moon</span><b>' + fmtDay(nextFull.date) + '</b><span>' + inDays(nextFull.date) + '</span></div>' +
    '<div class="d"><span>Next new moon</span><b>' + fmtDay(nextNew.date) + '</b><span>' + inDays(nextNew.date) + '</span></div>' +
    '<div class="d"><span>' + QN[nextQ.quarter] + '</span><b>' + fmtDay(nextQ.time.date) + '</b><span>' + inDays(nextQ.time.date) + '</span></div>' +
    '<div class="d"><span>Moonrise \u00b7 Moonset</span><b>' + fmtTime(mr && mr.date) + ' \u00b7 ' + fmtTime(ms && ms.date) + '</b><span>Sun ' + fmtTime(sr && sr.date) + ' \u2013 ' + fmtTime(ss && ss.date) + '</span></div>';
})();

// charts
var natal = chartFor(BIRTH.date, BIRTH.lat, BIRTH.lon, true);
var sky = chartFor(now, BOISE.latitude, BOISE.longitude, false);

// sky list
(function(){
  var h = '', retro = [];
  sky.pts.forEach(function(p){
    if (p.retro) retro.push(p.name);
    h += '<div class="pl"><div class="g">' + g(P[p.name].g) + '</div><div><b>' + p.name + (p.retro ? ' <span class="r">\u211e</span>' : '') + '</b><span>' + degIn(p.lon) + ' <span class="sym" style="color:' + signColor(signIdx(p.lon)) + '">' + g(SIGN_G[signIdx(p.lon)]) + '</span> ' + SIGNS[signIdx(p.lon)] + '</span></div></div>';
  });
  $('planets').innerHTML = h;
  $('retro').innerHTML = retro.length ? 'Retrograde now: <b style="color:var(--rose)">' + retro.join(', ') + '</b>' + (retro.indexOf('Mercury') > -1 ? '. Double-check messages and travel plans.' : '.') : 'No planets are retrograde right now.';
})();

// collective mood: the shared "weather" of today's sky
(function(){
  var W = {Sun:1, Moon:.6, Mercury:1, Venus:1, Mars:1, Jupiter:.8, Saturn:.6, Uranus:.4, Neptune:.4, Pluto:.4};
  var pts = sky.pts, soft = 0, hard = 0, list = [];
  for (var i = 0; i < pts.length; i++) for (var j = i + 1; j < pts.length; j++){
    var d = Math.abs(norm(pts[i].lon - pts[j].lon)); if (d > 180) d = 360 - d;
    ASP.forEach(function(a){
      var orb = Math.abs(d - a.a); if (orb > a.o) return;
      var w = W[pts[i].name] * W[pts[j].name] * (1 - orb / (a.o + 0.01));
      if (a.a === 60 || a.a === 120) soft += w; else if (a.a === 90 || a.a === 180) hard += w;
      list.push({x:pts[i], y:pts[j], a:a, orb:orb, w:w});
    });
  }
  var balance = (soft - hard) / (soft + hard + 0.6);               // -1 friction .. +1 flow
  var retro = pts.filter(function(p){ return p.retro; });
  var waning = angle > 180;
  var inward = Math.max(0, Math.min(1, 0.15 + (retro.length / 8) * 0.55 + (waning ? 0.3 : 0)));
  var el = signIdx(moonLon) % 4;                                    // 0 fire, 1 earth, 2 air, 3 water
  var elWord = ['Bright','Grounded','Chatty','Tender'][el];
  var elPhrase = ['bold, quick and a little restless','steady, practical and body-first','talkative, curious and a bit scattered','tender, intuitive and easily moved'][el];
  var flowKey = balance > .25 ? 'easy' : balance < -.25 ? 'charged' : 'mixed';
  var flowWord = {easy:'easygoing', charged:'charged', mixed:'shifting'}[flowKey];
  $('moodH').textContent = elWord + ' and ' + flowWord;
  var s2 = {easy:'The planets are mostly getting along, so conversations and plans tend to flow.',
            charged:'There is friction in the sky, so nerves and tempers run a little hotter than usual.',
            mixed:'The sky is a mix of easy and tense angles, so moods can swing quickly.'}[flowKey];
  var s3 = retro.some(function(p){ return p.name === 'Mercury'; }) ? 'Mercury is retrograde, so re-read before you send.'
         : retro.length >= 3 ? retro.length + ' planets are retrograde, which nudges everyone to look inward.'
         : PHASES[pIdx][1];
  $('moodSub').textContent = 'With the Moon in ' + SIGNS[signIdx(moonLon)] + ', the shared mood runs ' + elPhrase + '. ' + s2 + ' ' + s3;
  var lit = Math.round(illum * 100);
  function pos(v){ return Math.round((v + 1) / 2 * 100); }
  $('gauges').innerHTML =
    '<div><div class="gt"><span>Lunar light</span><b>' + lit + '% ' + (waning ? 'waning' : 'waxing') + '</b></div><div class="gf"><i style="width:' + lit + '%"></i></div></div>' +
    '<div><div class="gt"><span>Friction</span><b>' + flowWord + '</b><span>Flow</span></div><div class="gm"><i style="left:' + pos(balance) + '%"></i></div></div>' +
    '<div><div class="gt"><span>Outward</span><b>' + (inward > .6 ? 'reflective' : inward < .35 ? 'social' : 'balanced') + '</b><span>Inward</span></div><div class="gm"><i style="left:' + Math.round(inward * 100) + '%"></i></div></div>';
  $('moodTip').textContent = {easy:'A good day to reach out, make plans, or ask for something.', charged:'Pause before replying to anything heated.', mixed:'Keep plans loose and be kind to the people around you.'}[flowKey];
  var top = list.filter(function(x){ return x.x.name !== 'Moon' && x.y.name !== 'Moon'; }).sort(function(a, b){ return b.w - a.w; }).slice(0, 3);
  $('moodAsp').innerHTML = top.length ? top.map(function(x){
    return '<div class="asp"><div class="h"><span class="sym">' + g(P[x.x.name].g) + '</span> ' + x.x.name + ' ' + x.a.n + ' <span class="sym">' + g(P[x.y.name].g) + '</span> ' + x.y.name + '<span class="tag ' + x.a.cls + '">' + x.a.tag + '</span></div><p>' + P[x.x.name].t.charAt(0).toUpperCase() + P[x.x.name].t.slice(1) + ' ' + x.a.tone + ' ' + P[x.y.name].t + '.</p></div>';
  }).join('') : '<p class="sub">No tight angles between the planets today. A quiet sky.</p>';
})();

// transits to natal chart
(function(){
  var mh = houseOf(sky.pts[1].lon, natal.asc);
  $('moonHouse').innerHTML = 'The Moon is moving through your <b style="color:var(--moon)">' + mh + (mh === 1 ? 'st' : mh === 2 ? 'nd' : mh === 3 ? 'rd' : 'th') + ' house</b> today, which lights up ' + HOUSE_T[mh] + '.';
  var natPts = natal.pts.concat([{name:'Asc', lon:natal.asc}, {name:'MC', lon:natal.mc}]);
  var asps = findAspects(sky.pts, natPts).slice(0, 5), h = '';
  if (!asps.length) h = '<p class="sub">A quiet day. No tight contacts to your birth chart.</p>';
  asps.forEach(function(x){
    var tn = x.t.name, nn = x.n.name, ng = P[nn].g;
    h += '<div class="asp"><div class="h"><span class="sym">' + g(P[tn].g) + '</span> ' + tn + ' ' + x.a.n + ' your ' + (nn === 'Asc' || nn === 'MC' ? '' : '<span class="sym">' + g(ng) + '</span> ') + (nn === 'Asc' ? 'Ascendant' : nn === 'MC' ? 'Midheaven' : nn) + '<span class="tag ' + x.a.cls + '">' + x.a.tag + '</span></div><p>Transiting ' + tn + ' ' + x.a.tone + ' your natal ' + nn + ': ' + P[tn].t + ' meets ' + P[nn].t + '. ' + x.a.line + ' <span style="opacity:.7">(' + x.orb.toFixed(1) + '\u00b0 orb)</span></p></div>';
  });
  $('aspList').innerHTML = h;
})();

// wheel
function wheelSVG(mode){
  var asc = natal.asc, R = 182, both = mode === 'both';
  var zIn = both ? 156 : 156, hOut = both ? 128 : 156, hIn = both ? 108 : 132, nR = both ? 90 : 108, aR = both ? 64 : 84, tR = 142;
  function pt(lon, r){ var p = (180 + (lon - asc)) * Math.PI / 180; return [r * Math.cos(p), -r * Math.sin(p)]; }
  function xy(a){ return a[0].toFixed(1) + ' ' + a[1].toFixed(1); }
  var s = '<svg viewBox="-196 -196 392 392" role="img" aria-label="Birth chart wheel">';
  s += '<circle r="' + R + '" fill="rgba(255,255,255,.03)" stroke="rgba(243,234,211,.35)"/><circle r="' + zIn + '" fill="none" stroke="rgba(243,234,211,.25)"/>';
  s += '<circle r="' + hIn + '" fill="none" stroke="rgba(243,234,211,.2)"/>';
  if (both) s += '<circle r="' + hOut + '" fill="none" stroke="rgba(243,234,211,.2)"/>';
  for (var i = 0; i < 12; i++){
    var a = pt(i * 30, R), b = pt(i * 30, hIn);
    s += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="rgba(243,234,211,.2)"/>';
    var m = pt(i * 30 + 15, (R + zIn) / 2);
    s += '<text x="' + m[0].toFixed(1) + '" y="' + m[1].toFixed(1) + '" font-family="Apple Symbols,Segoe UI Symbol,Noto Sans Symbols,sans-serif" font-size="17" fill="' + signColor(i) + '" text-anchor="middle" dominant-baseline="central">' + g(SIGN_G[i]) + '</text>';
  }
  // houses (whole sign)
  var as = signIdx(asc);
  for (var h = 1; h <= 12; h++){
    var lon = (as + h - 1) * 30 + 15, m2 = pt(lon, (hIn + hOut) / 2);
    s += '<text x="' + m2[0].toFixed(1) + '" y="' + m2[1].toFixed(1) + '" font-size="10.5" fill="rgba(243,234,211,.55)" text-anchor="middle" dominant-baseline="central" font-family="Nunito Sans,sans-serif">' + h + '</text>';
  }
  // aspect web (natal)
  var colors = {60:'#8fb89a',120:'#8fb89a',90:'#e08e79',180:'#e08e79'};
  var nat = natal.pts;
  for (var x = 0; x < nat.length; x++) for (var y = x + 1; y < nat.length; y++){
    var d = Math.abs(norm(nat[x].lon - nat[y].lon)); if (d > 180) d = 360 - d;
    [60,90,120,180].forEach(function(a){ var lim = (x < 2 || y < 2) ? 5 : 4; if (Math.abs(d - a) <= lim){ var p1 = pt(nat[x].lon, aR), p2 = pt(nat[y].lon, aR); s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) + '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) + '" stroke="' + colors[a] + '" stroke-width="1" opacity=".55"/>'; } });
  }
  s += '<circle r="' + aR + '" fill="none" stroke="rgba(243,234,211,.15)"/>';
  // angles
  var pa = pt(asc, R + 2), pa2 = pt(asc, aR);
  s += '<line x1="' + pa[0] + '" y1="' + pa[1] + '" x2="' + pa2[0].toFixed(1) + '" y2="' + pa2[1].toFixed(1) + '" stroke="#d9b26f" stroke-width="1.6"/>';
  s += '<text x="-191" y="-8" font-size="10" fill="#d9b26f" font-weight="700" font-family="Nunito Sans,sans-serif">ASC</text>';
  var pm = pt(natal.mc, R + 2), pm2 = pt(natal.mc, aR), pl = pt(natal.mc, R + 11);
  s += '<line x1="' + pm[0].toFixed(1) + '" y1="' + pm[1].toFixed(1) + '" x2="' + pm2[0].toFixed(1) + '" y2="' + pm2[1].toFixed(1) + '" stroke="#d9b26f" stroke-width="1.6"/>';
  s += '<text x="' + pl[0].toFixed(1) + '" y="' + pl[1].toFixed(1) + '" font-size="10" fill="#d9b26f" font-weight="700" text-anchor="middle" dominant-baseline="central" font-family="Nunito Sans,sans-serif">MC</text>';
  // planets with spread
  function place(list, r, col){
    var L = list.map(function(p){ return {p:p, a:norm(p.lon), d:norm(p.lon)}; }).sort(function(u,v){ return u.a - v.a; });
    for (var it = 0; it < 40; it++) for (var k = 0; k < L.length; k++){
      var nx = L[(k + 1) % L.length], diff = norm(nx.d - L[k].d);
      if (diff < 9 && L.length > 1){ var push = (9 - diff) / 2; L[k].d -= push; nx.d += push; }
    }
    L.forEach(function(o){
      var tick1 = pt(o.p.lon, r + 11), tick2 = pt(o.p.lon, r + 16), gp = pt(o.d, r);
      s += '<line x1="' + tick1[0].toFixed(1) + '" y1="' + tick1[1].toFixed(1) + '" x2="' + tick2[0].toFixed(1) + '" y2="' + tick2[1].toFixed(1) + '" stroke="' + col + '" opacity=".6"/>';
      s += '<text x="' + gp[0].toFixed(1) + '" y="' + gp[1].toFixed(1) + '" font-family="Apple Symbols,Segoe UI Symbol,Noto Sans Symbols,sans-serif" font-size="17" fill="' + col + '" text-anchor="middle" dominant-baseline="central">' + g(P[o.p.name].g) + (o.p.retro ? '<tspan font-size="9" dy="-6" dx="1">R</tspan>' : '') + '</text>';
    });
  }
  place(natal.pts, nR, '#d9b26f');
  if (both) place(sky.pts, tR - 14, '#a9a3e6');
  return s + '</svg>';
}
function setWheel(mode){ $('wheel').innerHTML = wheelSVG(mode); Array.prototype.forEach.call($('seg').children, function(b){ b.classList.toggle('on', b.getAttribute('data-m') === mode); }); }
$('seg').addEventListener('click', function(e){ var m = e.target.getAttribute && e.target.getAttribute('data-m'); if (m) setWheel(m); });
setWheel('both');

// big three + table
(function(){
  var sun = natal.pts[0], mn = natal.pts[1];
  var big = [
    ['\u2609','Scorpio Sun \u00b7 ' + degIn(sun.lon), 'Depth, intensity and a gift for seeing what is underneath. Your Sun sits at the very last degree of Scorpio, right at the edge where it leans toward Sagittarius\u2019s open road.'],
    ['\u263d','Leo Moon \u00b7 ' + degIn(mn.lon), 'A warm, expressive heart. You settle when you feel appreciated and get to make something, and you love generously.'],
    ['Asc','Libra Rising \u00b7 ' + degIn(natal.asc), 'People meet you as gracious, balanced and attuned to beauty. Fairness and good company matter to you.']
  ];
  $('big3').innerHTML = big.map(function(b){ return '<div class="b3"><div class="h"><span class="sym">' + g(b[0]) + '</span>' + b[1] + '</div><p>' + b[2] + '</p></div>'; }).join('') +
    '<div class="b3"><div class="h"><svg viewBox="-18 -18 36 36" width="26" height="26" style="vertical-align:-6px;margin-right:6px"><g>' + moonShape(15, A.MoonPhase(natal.t), 'birthMoon') + '</g></svg>Born near a ' + PHASES[phaseIndex(A.MoonPhase(natal.t))][0] + '</div><p>The Moon was about ' + Math.round(A.Illumination(A.Body.Moon, natal.t).phase_fraction * 100) + '% lit the night you were born.</p></div>';
  var rows = natal.pts.map(function(p){ var i = signIdx(p.lon); return '<tr><td>' + g(P[p.name].g) + '</td><td>' + p.name + (p.retro ? ' <span style="color:var(--rose)">\u211e</span>' : '') + '</td><td class="r"><span class="sym" style="color:' + signColor(i) + '">' + g(SIGN_G[i]) + '</span> ' + degIn(p.lon) + ' ' + SIGNS[i] + '</td><td class="r">H' + houseOf(p.lon, natal.asc) + '</td></tr>'; });
  [['Asc','Ascendant',natal.asc],['MC','Midheaven',natal.mc],['Node','North Node',natal.node]].forEach(function(r){ var i = signIdx(r[2]); rows.push('<tr><td>' + g(P[r[0]].g) + '</td><td>' + r[1] + '</td><td class="r"><span class="sym" style="color:' + signColor(i) + '">' + g(SIGN_G[i]) + '</span> ' + degIn(r[2]) + ' ' + SIGNS[i] + '</td><td class="r">H' + houseOf(r[2], natal.asc) + '</td></tr>'); });
  $('natalTable').innerHTML = rows.join('');
})();

// refresh when she comes back to the tab on a new day
document.addEventListener('visibilitychange', function(){ if (!document.hidden && dateKey(new Date()) !== key) location.reload(); });
})();
