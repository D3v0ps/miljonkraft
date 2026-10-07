/**
 * Bilder ur Miljonbemannings bildbank (SharePoint › Marknad & Kommunikation › Bilder › BILDBANK)
 * och MB:s logotyp (Grafisk profil › Logotyp › LOGO_MB-MILJONBEMANNING_2024 › MB LOGO_TERTIARY).
 * Originalen ligger i assets-src/. Kör: node scripts/build-images.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('public/img', { recursive: true });

const photos = [
  // [källfil, utnamn, beskärning i procent från toppen (fokus), bredder]
  ['assets-src/bildbank/MB_bildbank_9-lager.jpg', 'lager', 'attention', [640, 1200]],
  ['assets-src/bildbank/MB_bildbank_10-transport.jpg', 'transport', 'attention', [640, 1200]],
  ['assets-src/bildbank/MB_bildbank_33-mb-vast.jpg', 'mb-vast', 'centre', [720, 1400, 1920]],
  ['assets-src/bildbank/MB_bildbank_6-kontor.jpg', 'kontor', 'attention', [720, 1400]],
];
for (const [src, name, position, widths] of photos) {
  for (const w of widths) {
    await sharp(src).resize({ width: w }).webp({ quality: 74 }).toFile(`public/img/${name}-${w}.webp`);
  }
  await sharp(src).resize({ width: 1200 }).jpeg({ quality: 78, mozjpeg: true }).toFile(`public/img/${name}-1200.jpg`);
}

// Stående beskärningar för höga paneler. [källfil, utnamn, utsnitt i originalet (1920 × 1080), bredder]
const portraits = [
  ['assets-src/bildbank/MB_bildbank_33-mb-vast.jpg', 'mb-vast-portrait', { left: 548, top: 0, width: 864, height: 1080 }, [600, 720, 864]],
  ['assets-src/bildbank/MB_bildbank_10-transport.jpg', 'transport-portrait', { left: 470, top: 0, width: 648, height: 1080 }, [420, 648]],
  ['assets-src/bildbank/MB_bildbank_9-lager.jpg', 'lager-portrait', { left: 560, top: 0, width: 648, height: 1080 }, [420, 648]],
];
for (const [src, name, area, widths] of portraits) {
  for (const w of widths) {
    await sharp(src).extract(area).resize({ width: w }).webp({ quality: 76 }).toFile(`public/img/${name}-${w}.webp`);
  }
  await sharp(src).extract(area).resize({ width: widths[widths.length - 1] }).jpeg({ quality: 78, mozjpeg: true }).toFile(`public/img/${name}.jpg`);
}

// MB-logotypen beskärs till sitt innehåll. Frizonen läggs med CSS runt bilden.
const logo = sharp('assets-src/logo/Logo_DARK-TERTIARY_MB-Miljonbemanning_2024.png').trim();
const trimmed = await logo.png().toBuffer();
await sharp(trimmed).resize({ height: 120 }).png({ compressionLevel: 9 }).toFile('public/img/mb-logo.png');
await sharp(trimmed).resize({ height: 120 }).webp({ quality: 90 }).toFile('public/img/mb-logo.webp');
const meta = await sharp('public/img/mb-logo.png').metadata();
console.log('mb-logo', meta.width, meta.height);

// Favicon: MB-märket på vit yta.
const icon = async (size) => {
  // Logotypens bredd plus två punktdiametrar ska rymmas i rutan (frizon = punktens diameter).
  const inner = Math.floor(size * 0.76);
  const mark = await sharp(trimmed).resize({ width: inner }).png().toBuffer();
  const m = await sharp(mark).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: '#FFFFFF' } })
    .composite([{ input: mark, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png().toBuffer();
};
const { writeFile } = await import('node:fs/promises');
const sizes = { 16: null, 32: null, 48: null, 180: null, 192: null, 512: null };
for (const s of Object.keys(sizes)) sizes[s] = await icon(Number(s));
await writeFile('public/apple-touch-icon.png', sizes[180]);
await writeFile('public/icon-192.png', sizes[192]);
await writeFile('public/icon-512.png', sizes[512]);
function ico(images) {
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  const entries = []; let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16); e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8); e.writeUInt32LE(offset, 12); offset += data.length; entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}
await writeFile('public/favicon.ico', ico([{ size: 16, data: sizes[16] }, { size: 32, data: sizes[32] }, { size: 48, data: sizes[48] }]));
// SVG-ikonen bäddar in logotypen i sitt eget proportionsförhållande, 48 enheter bred i en ruta på 64.
const svgBuf = await sharp(trimmed).resize({ width: 192 }).png().toBuffer();
const svgMeta = await sharp(svgBuf).metadata();
const svgH = Math.round((48 * svgMeta.height / svgMeta.width) * 100) / 100;
await writeFile('public/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#FFFFFF"/><image href="data:image/png;base64,${svgBuf.toString('base64')}" x="8" y="${((64 - svgH) / 2).toFixed(2)}" width="48" height="${svgH}"/></svg>`);
console.log('bilder och ikoner klara');
