// Generates the OG image and favicons from assets/brand/knightrip-logo-white.png.
//   public/og.png                1200x630, black ground, white wordmark centred
//   public/favicon-32.png        32x32 bolt mark, white on black
//   public/apple-touch-icon.png  180x180 bolt mark, white on black
//   public/icon-512.png          512x512 bolt mark (manifest / PWA icons)
//
// The bolt mark is cut out of the wordmark automatically: the script scans the logo's alpha
// channel for the first fully transparent column gap after the mark. To override, pass the
// crop box in logo pixels:  node scripts/brand.mjs --mark=x,y,width,height
// Run with: npm run brand
import path from 'node:path';
import sharp from 'sharp';

const BG = '#050505';
const LOGO = path.join('assets', 'brand', 'knightrip-logo-white.png');
const OUT = 'public';
const markArg = process.argv.find((a) => a.startsWith('--mark='));

async function ogImage() {
  const logo = await sharp(LOGO).trim().resize({ width: 640, height: 240, fit: 'inside' }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, 'og.png'));
  console.log('wrote    public/og.png');
}

// Finds the bounding box of the leftmost connected group of opaque columns (the bolt mark).
async function detectMark() {
  const { data, info } = await sharp(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const colHasInk = new Array(width).fill(false);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (data[(y * width + x) * channels + 3] > 40) { colHasInk[x] = true; break; }
    }
  }
  let start = colHasInk.indexOf(true);
  let end = start;
  const MIN_GAP = Math.round(width * 0.02); // a real gap between mark and wordmark
  let gap = 0;
  for (let x = start; x < width; x++) {
    if (colHasInk[x]) { gap = 0; end = x; } else if (++gap >= MIN_GAP) break;
  }
  return { left: start, top: 0, width: end - start + 1, height };
}

async function markBuffer() {
  const box = markArg
    ? (([left, top, width, height]) => ({ left, top, width, height }))(markArg.slice(7).split(',').map(Number))
    : await detectMark();
  console.log('bolt mark crop:', box);
  return sharp(LOGO).extract(box).trim().png().toBuffer();
}

async function favicons() {
  const mark = await markBuffer();
  for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [512, 'icon-512.png']]) {
    const inner = Math.round(size * 0.68);
    const glyph = await sharp(mark).resize({ width: inner, height: inner, fit: 'inside', kernel: 'lanczos3' }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
      .composite([{ input: glyph, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT, name));
    console.log('wrote    public/' + name);
  }
}

await ogImage();
await favicons();
console.log('done');
