// Web kaynaklarını Capacitor'ın paketleyeceği www/ klasörüne kopyalar.
// Web kodu repo kökünde kalır (GitHub Pages oradan servis ediyor); bu betik
// yalnızca native (iOS/Android) paketi için gerekli dosyaları aynalar.
//
// Kullanım: npm run build:www   (npm run sync / ios / android otomatik çağırır)

import { mkdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const out = join(root, 'www');

// Native pakete girecek dosyalar. Yeni bir varlık eklersen buraya ekle.
const FILES = [
  'index.html',
  'style.css',
  'data.js',
  'engine.js',
  'net.js',
  'online.js',
  'game.js',
  'firebase-config.js',
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

let copied = 0;
for (const f of FILES) {
  const src = join(root, f);
  if (!existsSync(src)) {
    console.warn(`⚠️  atlandı (bulunamadı): ${f}`);
    continue;
  }
  await copyFile(src, join(out, f));
  copied++;
}

console.log(`✅ www/ hazır — ${copied}/${FILES.length} dosya kopyalandı.`);
