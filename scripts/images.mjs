// Converts the originals in /assets into WebP variants in /public/assets.
//   assets/photos/foo.jpg          -> public/assets/photos/foo-2000.webp + foo-1000.webp
//   assets/charging-guide/bar.jpg  -> public/assets/charging-guide/bar-2000.webp + bar-1000.webp
//   assets/brand/knightrip-logo-*.png -> public/assets/brand/ (resized to 800 px wide, PNG kept for transparency)
//   assets/charging-guide/*.pdf    -> copied as-is
// Run with: npm run images
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets';
const OUT = path.join('public', 'assets');
const WIDTHS = [2000, 1000];
const QUALITY = 78;
const PHOTO_DIRS = ['photos', 'charging-guide'];
const IMG_RE = /\.(jpe?g|png|webp|tiff?)$/i;

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function convertDir(dir) {
  const src = path.join(SRC, dir);
  const out = path.join(OUT, dir);
  if (!(await exists(src))) return;
  await fs.mkdir(out, { recursive: true });
  for (const file of await fs.readdir(src)) {
    const from = path.join(src, file);
    if (file.toLowerCase().endsWith('.pdf')) {
      await fs.copyFile(from, path.join(out, file));
      console.log('copied  ', path.join(out, file));
      continue;
    }
    if (!IMG_RE.test(file)) continue;
    const base = file.replace(IMG_RE, '');
    const meta = await sharp(from).metadata();
    for (const w of WIDTHS) {
      const to = path.join(out, `${base}-${w}.webp`);
      await sharp(from)
        .rotate() // honour EXIF orientation
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(to);
      console.log('wrote   ', to, `(from ${meta.width}x${meta.height})`);
    }
  }
}

async function convertBrand() {
  const src = path.join(SRC, 'brand');
  const out = path.join(OUT, 'brand');
  if (!(await exists(src))) return;
  await fs.mkdir(out, { recursive: true });
  for (const name of ['knightrip-logo-white.png', 'knightrip-logo-black.png']) {
    const from = path.join(src, name);
    if (!(await exists(from))) continue;
    const to = path.join(out, name);
    await sharp(from).trim().resize({ width: 800, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(to);
    console.log('wrote   ', to);
  }
}

for (const dir of PHOTO_DIRS) await convertDir(dir);
await convertBrand();
console.log('done');
