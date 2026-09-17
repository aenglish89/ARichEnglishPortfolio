# KNIGHTRIP website

Static marketing site and charging guide for KNIGHTRIP, an Orlando EV rental brand.
Built with Vite and plain HTML, CSS, and JavaScript. No framework, no CMS, no backend.

Pages:

- `/` Home (`index.html`)
- `/charging` Charging guide (`charging/index.html`)

## Run it

```bash
npm install
npm run dev       # local dev server with live reload
npm run build     # production build into dist/
npm run preview   # serve dist/ locally
```

## Deploy

The build output is the `dist/` folder. Both hosts are preconfigured:

- **Netlify**: `netlify.toml` sets the build command to `npm run build` and publishes `dist`. Connect the repo and deploy.
- **Vercel**: `vercel.json` does the same and turns on clean URLs so `/charging` resolves.

Manual deploy from a terminal:

```bash
npm run build
npx netlify deploy --prod --dir=dist     # Netlify
npx vercel --prod                        # Vercel
```

## Where to change things

| What | Where |
| --- | --- |
| Booking link (`BOOKING_URL`) | `src/config.js`. It is stamped into every CTA at build time via `%BOOKING_URL%` in the HTML, and `src/main.js` also reads it. Change it in that one file only. |
| Canonical domain (`SITE_URL`) | `src/config.js`. Used for canonical, Open Graph, and JSON-LD URLs. Set it to the live domain before launch. |
| Copy | `index.html` and `charging/index.html`. |
| Colors, type, layout | `src/style.css`. Palette tokens are at the top of the file. |
| Intro overlay timing | `src/style.css` (keyframes under "Intro overlay") and the inline script in the `<head>` of `index.html`. |

## Images

Originals live in `assets/` (`brand/`, `photos/`, `charging-guide/`). The site never loads them directly.
Run the pipeline after adding or replacing a photo:

```bash
npm run images   # writes WebP at 2000 px and 1000 px into public/assets/
npm run brand    # regenerates og.png, favicon-32.png, apple-touch-icon.png, icon-512.png from the white logo
```

Photos are referenced from `public/assets/...` with `srcset` so phones get the 1000 px variant. Everything below the fold is lazy loaded.

## Behaviour notes

- The intro overlay runs once per browser session (`sessionStorage.knightripIntroSeen`) and never when `prefers-reduced-motion` is set. It is force-removed after 2.5 s even if the animation is interrupted. A visually hidden "Skip intro" button appears on keyboard focus.
- Fonts (Montserrat 600/700, Source Sans 3 400/600) are self hosted from the `@fontsource` packages, latin subset only, `font-display: swap`.
- Every booking CTA opens `BOOKING_URL` in a new tab with `rel="noopener"`.
