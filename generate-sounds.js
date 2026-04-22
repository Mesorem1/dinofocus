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
  const s = [];
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.min(t * 30, 1) * Math.min((dur - t) * 30, 1);
    const v = wave === 'square' ? Math.sign(Math.sin(2 * Math.PI * freq * t)) : Math.sin(2 * Math.PI * freq * t);
    s.push(v * vol * env * 32767);
  }
  return s;
}

function sil(dur) { return new Array(Math.floor(SAMPLE_RATE * dur)).fill(0); }
function cat(...p) { return [].concat(...p); }

writeWAV('feed.wav',      cat(tone(523, .12, .55), sil(.03), tone(659, .18, .55)));
writeWAV('pet.wav',       cat(tone(392, .12, .45), sil(.02), tone(523, .12, .45), sil(.02), tone(659, .22, .5)));
writeWAV('rest.wav',      cat(tone(330, .2, .4), tone(262, .35, .35)));
writeWAV('win.wav',       cat(tone(523, .1, .5), sil(.02), tone(659, .1, .5), sil(.02), tone(784, .1, .5), sil(.02), tone(1047, .3, .55)));
writeWAV('tap.wav',       tone(880, .06, .35, 'square'));
writeWAV('error.wav',     cat(tone(392, .15, .5), tone(294, .22, .45)));
writeWAV('game_start.wav', cat(tone(392, .08, .4), sil(.03), tone(523, .08, .4), sil(.03), tone(659, .08, .4), sil(.03), tone(784, .2, .5)));
writeWAV('mission.wav',   cat(tone(659, .12, .5), sil(.02), tone(784, .12, .5), sil(.02), tone(1047, .28, .55)));

console.log('All sounds generated!');
