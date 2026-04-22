const fs = require('fs');
const path = require('path');
const SAMPLE_RATE = 22050;
const OUT = 'C:/Users/allan/Documents/dinofocus/assets/sounds';

function writeWAV(filename, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28); buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-32767, Math.min(32767, Math.round(samples[i])));
    buf.writeInt16LE(s, 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, filename), buf);
  console.log('Created:', filename);
}

function tone(freq, dur, vol = 0.5, wave = 'sine') {
  const n = Math.floor(SAMPLE_RATE * dur);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SAMPLE_RATE;
    const env = Math.min(t * 30, 1) * Math.min((dur - t) * 30, 1);
    const v = wave === 'square' ? Math.sign(Math.sin(2 * Math.PI * freq * t))
            : wave === 'tri' ? 2 * Math.abs(2 * (freq * t % 1) - 1) - 1
            : Math.sin(2 * Math.PI * freq * t);
    return v * vol * env * 32767;
  });
}

function fm(carrier, modFreq, modDepth, dur, vol = 0.5) {
  const n = Math.floor(SAMPLE_RATE * dur);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SAMPLE_RATE;
    const env = Math.min(t * 20, 1) * Math.pow(1 - t / dur, 0.5);
    const mod = modDepth * Math.sin(2 * Math.PI * modFreq * t);
    const v = Math.sin(2 * Math.PI * (carrier + mod) * t);
    return v * vol * env * 32767;
  });
}

function sil(dur) { return new Array(Math.floor(SAMPLE_RATE * dur)).fill(0); }
function cat(...p) { return [].concat(...p); }

// 🏆 Level Up — fanfare épique montante
writeWAV('levelup.wav', cat(
  tone(523, .08, .5), sil(.01),
  tone(659, .08, .5), sil(.01),
  tone(784, .08, .5), sil(.01),
  tone(1047, .08, .6), sil(.01),
  tone(1319, .35, .65),
  sil(.05),
  tone(1047, .15, .4),
  tone(1319, .4, .5),
));

// 📦 Coffre mystère — son magique d'ouverture
writeWAV('chest.wav', cat(
  fm(300, 8, 40, .15, .4),
  sil(.05),
  tone(784, .08, .5), sil(.02),
  tone(988, .08, .5), sil(.02),
  tone(1175, .08, .55), sil(.02),
  tone(1568, .3, .6),
));

// 🎯 Défi hebdomadaire — son de déverrouillage
writeWAV('challenge.wav', cat(
  tone(440, .06, .4), sil(.02),
  tone(554, .06, .4), sil(.02),
  tone(659, .06, .45), sil(.02),
  tone(880, .25, .5),
));

// 🦖 Rex heureux — grognement joyeux
writeWAV('rex_happy.wav', cat(
  fm(180, 6, 30, .12, .45),
  sil(.04),
  fm(220, 8, 35, .15, .5),
  sil(.03),
  fm(260, 6, 25, .2, .4),
));

// 😢 Rex triste — gémissement
writeWAV('rex_sad.wav', cat(
  fm(150, 3, 20, .2, .4),
  fm(120, 2, 15, .3, .35),
  fm(100, 2, 10, .25, .25),
));

// 🍖 Rex affamé — grognement d'estomac
writeWAV('rex_hungry.wav', cat(
  fm(200, 4, 50, .15, .4),
  sil(.08),
  fm(180, 3, 45, .2, .35),
  sil(.05),
  fm(160, 3, 40, .15, .3),
));

// 😴 Rex fatigué — bâillement
writeWAV('rex_tired.wav', (() => {
  const n = Math.floor(SAMPLE_RATE * 0.7);
  return Array.from({ length: n }, (_, i) => {
    const t = i / SAMPLE_RATE;
    const freq = 300 + 150 * Math.sin(Math.PI * t / 0.7); // pitch up then down
    const env = Math.sin(Math.PI * t / 0.7) * 0.5;
    return Math.sin(2 * Math.PI * freq * t) * env * 32767;
  });
})());

// 🎵 Musique de fond — mélodie douce en boucle (8 secondes)
writeWAV('bgmusic.wav', (() => {
  // Simple lullaby melody: C D E G E D C | E G A G E C
  const notes = [
    [523,.4],[587,.2],[659,.3],[784,.4],[659,.2],[587,.3],[523,.6],
    [659,.3],[784,.2],[880,.4],[784,.3],[659,.2],[523,.8],
  ];
  const melody = cat(...notes.map(([f, d]) => cat(tone(f, d, 0.28, 'sine'), sil(.04))));
  // Add soft bass
  const bass = [
    [262,.8],[262,.8],[262,.8],[294,.8],[330,.8],[262,.8],
  ];
  const bassLine = cat(...bass.map(([f, d]) => cat(tone(f, d, 0.15, 'tri'), sil(.02))));

  // Mix melody + bass (truncate to same length)
  const len = Math.min(melody.length, bassLine.length);
  return Array.from({ length: len }, (_, i) =>
    Math.max(-32767, Math.min(32767, (melody[i] || 0) + (bassLine[i] || 0)))
  );
})());

console.log('All new sounds generated!');
