/**
 * Encodes the rendered frame sequences and the music into the web deliverables in public/film/.
 *
 *   node scripts/film/encode.mjs --work=<dir> [--ffmpeg=/path/to/ffmpeg] [--only=mp4,720,webm,vertical,poster,mp3]
 *
 * Expects in <dir>:  frames-landscape/f00000.jpg ..., frames-vertical/f00000.jpg ..., miljonkraft-musik.wav,
 *                    poster-landscape.png, poster-vertical.png  (see README.md for the commands that make them)
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { mkdirSync, statSync, existsSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? 'true'] : [a, 'true'];
}));
const FF = args.ffmpeg || process.env.FFMPEG || 'ffmpeg';
const work = resolve(args.work || join(here, '.work'));
const out = resolve(args.out || join(here, '..', '..', 'public', 'film'));
const only = args.only ? new Set(args.only.split(',')) : null;
const want = k => !only || only.has(k);
mkdirSync(out, { recursive: true });

const DUR = 56.0;
const wav = join(work, 'miljonkraft-musik.wav');
// JPEG frames are full-range BT.601 (JFIF); convert to limited-range BT.709 and tag it.
const COLOR = 'scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int';
const TAGS = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'];
const AUDIO_FILTER = `atrim=0:${DUR},afade=t=out:st=${DUR - 0.9}:d=0.9`;
const META = ['-metadata', 'title=Miljonkraft Botkyrka', '-metadata', 'artist=Miljonbemanning', '-metadata', 'comment=Musik: original, scripts/film/music.py',
  '-metadata:s:a:0', 'language=swe'];

function run(argv) {
  console.log('ffmpeg ' + argv.join(' '));
  const r = spawnSync(FF, ['-hide_banner', '-loglevel', 'error', '-y', ...argv], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed');
}
const frames = fmt => ['-framerate', '30', '-i', join(work, `frames-${fmt}`, 'f%05d.jpg')];
const size = f => `${(statSync(f).size / 1048576).toFixed(2)} MB`;

if (want('mp4')) {
  const f = join(out, 'miljonkraft-film-1080.mp4');
  run([...frames('landscape'), '-i', wav, '-map', '0:v', '-map', '1:a', '-vf', `${COLOR},format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1', '-preset', 'slow', '-crf', '20.5', '-tune', 'animation',
    '-x264-params', 'aq-mode=3:deblock=-1,-1', '-g', '60', '-pix_fmt', 'yuv420p', ...TAGS,
    '-af', AUDIO_FILTER, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(DUR), ...META, '-movflags', '+faststart', f]);
  console.log(f, size(f));
}
if (want('720')) {
  const f = join(out, 'miljonkraft-film-720.mp4');
  run([...frames('landscape'), '-i', wav, '-map', '0:v', '-map', '1:a', '-vf', `${COLOR}:w=1280:h=720,format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow', '-crf', '23', '-tune', 'animation',
    '-x264-params', 'aq-mode=3', '-g', '60', '-pix_fmt', 'yuv420p', ...TAGS,
    '-af', AUDIO_FILTER, '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-t', String(DUR), ...META, '-movflags', '+faststart', f]);
  console.log(f, size(f));
}
if (want('webm')) {
  const f = join(out, 'miljonkraft-film-1080.webm');
  const log = join(work, 'vp9pass');
  const common = [...frames('landscape'), '-vf', `${COLOR},format=yuv420p`, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '32',
    '-row-mt', '1', '-tile-columns', '2', '-g', '120', '-pix_fmt', 'yuv420p', ...TAGS, '-passlogfile', log];
  run([...common, '-pass', '1', '-deadline', 'good', '-cpu-used', '4', '-an', '-t', String(DUR), '-f', 'webm', '/dev/null']);
  run([...common.slice(0, 4), '-i', wav, ...common.slice(4), '-map', '0:v', '-map', '1:a', '-pass', '2', '-deadline', 'good', '-cpu-used', '1',
    '-af', AUDIO_FILTER, '-c:a', 'libopus', '-b:a', '160k', '-t', String(DUR), ...META, f]);
  console.log(f, size(f));
}
if (want('vertical')) {
  const f = join(out, 'miljonkraft-film-vertikal.mp4');
  run([...frames('vertical'), '-i', wav, '-map', '0:v', '-map', '1:a', '-vf', `${COLOR},format=yuv420p`,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1', '-preset', 'slow', '-crf', '21', '-tune', 'animation',
    '-x264-params', 'aq-mode=3:deblock=-1,-1', '-g', '60', '-pix_fmt', 'yuv420p', ...TAGS,
    '-af', AUDIO_FILTER, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', String(DUR), ...META, '-movflags', '+faststart', f]);
  console.log(f, size(f));
}
if (want('poster')) {
  const pl = join(work, 'poster-landscape.png');
  const pv = join(work, 'poster-vertical.png');
  if (existsSync(pl)) {
    run(['-i', pl, '-q:v', '2', join(out, 'miljonkraft-film-poster.jpg')]);
    run(['-i', pl, '-c:v', 'libwebp', '-quality', '86', '-compression_level', '6', join(out, 'miljonkraft-film-poster.webp')]);
  }
  if (existsSync(pv)) run(['-i', pv, '-q:v', '2', join(out, 'miljonkraft-film-poster-vertikal.jpg')]);
}
if (want('mp3')) {
  const f = join(out, 'miljonkraft-musik.mp3');
  run(['-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '48000', '-metadata', 'title=Miljonkraft (filmmusik)',
    '-metadata', 'artist=Miljonbemanning', '-metadata', 'comment=Original music generated by scripts/film/music.py', f]);
  console.log(f, size(f));
}
