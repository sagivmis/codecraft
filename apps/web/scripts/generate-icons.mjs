#!/usr/bin/env node
/**
 * Rasterizes `public/favicon.svg` into the PWA + Apple icon set:
 *   - public/icons/icon-192.png         (any purpose)
 *   - public/icons/icon-512.png         (any purpose)
 *   - public/icons/icon-512-maskable.png (maskable, 10% safe-zone padding)
 *   - public/apple-touch-icon.png        (180x180, iOS home screen)
 *
 * Maskable icons must keep the brand mark inside the inner 80% circle, so we
 * shrink the source onto a padded canvas with a solid brand color background.
 *
 * Run via `pnpm icons` from apps/web or as part of the build.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');
const iconsDir = join(publicDir, 'icons');
mkdirSync(iconsDir, { recursive: true });

const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

const BRAND = '#4f46e5';

async function plain(size, outPath) {
  await sharp(svgBuffer, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

async function maskable(size, outPath) {
  /* Render the icon at 80% size then composite over a solid brand square so
   * the entire safe zone is covered when an OS applies its mask shape. */
  const inner = Math.round(size * 0.8);
  const innerPng = await sharp(svgBuffer, { density: 512 }).resize(inner, inner).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BRAND,
    },
  })
    .composite([{ input: innerPng, gravity: 'center' }])
    .png()
    .toFile(outPath);
}

await plain(192, join(iconsDir, 'icon-192.png'));
await plain(512, join(iconsDir, 'icon-512.png'));
await maskable(512, join(iconsDir, 'icon-512-maskable.png'));
await plain(180, join(publicDir, 'apple-touch-icon.png'));

/* Also emit a tiny .ico-style 32x32 PNG that browsers fall back to. */
await plain(32, join(publicDir, 'favicon-32.png'));

writeFileSync(
  join(iconsDir, 'README.md'),
  '# Generated icons\n\nThese files are produced by `apps/web/scripts/generate-icons.mjs` from `public/favicon.svg`. Do not edit by hand.\n',
);

console.log('✓ Generated PWA icons in public/icons/ and public/apple-touch-icon.png');
