/**
 * Re-downloads demo thumbnails from Unsplash (https://unsplash.com/license).
 * Run: npm run fetch-demo-thumbs --prefix backend
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'demo-thumbs');

const shots = [
  ['thumb-dance-ballet.jpg', '1547153760-18fc86324498'],
  ['thumb-dance-energy.jpg', '1508700929628-666bc8bd84ea'],
  ['thumb-stage-lights.jpg', '1470229722913-7c0e2dbbafd3'],
  ['thumb-concert-crowd.jpg', '1459749411175-04bf5292ceea'],
  ['thumb-concert-lasers.jpg', '1504609773096-104ff2c73ba4'],
  ['thumb-microphone.jpg', '1516280440614-37939bbacd81'],
  ['thumb-fashion-runway.jpg', '1469334031218-e382a71b716b'],
  ['thumb-theatre-seats.jpg', '1503095396549-807759245b35'],
  ['thumb-trophy-gold.jpg', '1431324155629-1a6deb1dec8d'],
  ['thumb-talent-portrait.jpg', '1529626455594-4ff0802cfb7e'],
  ['thumb-festival-lights.jpg', '1492684223066-81342ee5ff30'],
  ['thumb-audience-live.jpg', '1516450360452-9312f5e86fc7'],
  ['thumb-neon-club.jpg', '1558618666-fcd25c85cd64'],
];

fs.mkdirSync(OUT, { recursive: true });

const base =
  'https://images.unsplash.com/photo-%s?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=85';

for (const [name, id] of shots) {
  const dest = path.join(OUT, name);
  const url = base.replace('%s', id);
  process.stdout.write(`${name} … `);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.promises.writeFile(dest, buf);
    console.log('ok');
  } catch (e) {
    console.log('fail', e.message);
    process.exitCode = 1;
  }
}
