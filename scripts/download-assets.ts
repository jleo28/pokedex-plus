/**
 * Downloads sprite images and cry audio for all Pokémon in data/pokemon.json.
 * Skips files that already exist (idempotent).
 * Run once at setup: npx tsx scripts/download-assets.ts
 */

import fs from 'fs';
import path from 'path';

const SPRITES_DIR = path.join(process.cwd(), 'public', 'sprites');
const CRIES_DIR = path.join(process.cwd(), 'public', 'cries');
const DATA_PATH = path.join(process.cwd(), 'data', 'pokemon.json');

function padId(id: number): string {
  return String(id).padStart(3, '0');
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
  fs.mkdirSync(CRIES_DIR, { recursive: true });

  const pokemon: any[] = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

  let spriteDownloaded = 0, spriteSkipped = 0, spriteFailed = 0;
  let cryDownloaded = 0, crySkipped = 0, cryFailed = 0;

  console.log(`Downloading assets for ${pokemon.length} Pokémon...`);

  for (const p of pokemon) {
    const pad = padId(p.id);

    // Sprite
    const spritePath = path.join(SPRITES_DIR, `${pad}.png`);
    if (fs.existsSync(spritePath)) {
      spriteSkipped++;
    } else if (p.sprite_url) {
      try {
        await downloadFile(p.sprite_url, spritePath);
        spriteDownloaded++;
        await sleep(50);
      } catch (err) {
        console.error(`\n  Sprite failed id=${p.id}:`, err);
        spriteFailed++;
      }
    } else {
      spriteFailed++;
    }

    // Cry
    const cryPath = path.join(CRIES_DIR, `${pad}.ogg`);
    if (fs.existsSync(cryPath)) {
      crySkipped++;
    } else if (p.cry_url) {
      try {
        await downloadFile(p.cry_url, cryPath);
        cryDownloaded++;
        await sleep(50);
      } catch (err) {
        console.error(`\n  Cry failed id=${p.id}:`, err);
        cryFailed++;
      }
    } else {
      cryFailed++;
    }

    if (p.id % 20 === 0 || p.id === pokemon.length) {
      process.stdout.write(`\r  ${p.id}/${pokemon.length}`);
    }
  }

  console.log('\n');
  console.log(`Sprites: ${spriteDownloaded} downloaded, ${spriteSkipped} skipped, ${spriteFailed} failed`);
  console.log(`Cries:   ${cryDownloaded} downloaded, ${crySkipped} skipped, ${cryFailed} failed`);

  // Size report
  const spriteSize = fs
    .readdirSync(SPRITES_DIR)
    .reduce((sum, f) => sum + fs.statSync(path.join(SPRITES_DIR, f)).size, 0);
  const crySize = fs
    .readdirSync(CRIES_DIR)
    .reduce((sum, f) => sum + fs.statSync(path.join(CRIES_DIR, f)).size, 0);

  console.log(`\nTotal sprite size: ${(spriteSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total cry size:    ${(crySize / 1024 / 1024).toFixed(2)} MB`);

  if (crySize > 15 * 1024 * 1024) {
    console.warn('\nWARNING: Cries exceed 15MB — consider lazy-loading from CDN vs self-hosting.');
  }
}

main().catch(console.error);
