/**
 * Skapar favicon-set från public/favicon.svg med sharp.
 * Kör: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile('public/favicon.svg');
const png = async (size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();

const [p16, p32, p48, p180, p192, p512] = await Promise.all([16, 32, 48, 180, 192, 512].map(png));
await writeFile('public/apple-touch-icon.png', p180);
await writeFile('public/icon-192.png', p192);
await writeFile('public/icon-512.png', p512);
await writeFile('public/favicon-32.png', p32);

// ICO med inbäddade PNG-bilder (stöds av alla moderna webbläsare).
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}
await writeFile('public/favicon.ico', ico([{ size: 16, data: p16 }, { size: 32, data: p32 }, { size: 48, data: p48 }]));
console.log('favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png skapade');
