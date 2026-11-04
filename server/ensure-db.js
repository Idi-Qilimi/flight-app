// Creates server/db.json from the committed seed on first run, so local
// data (favorites, recent searches) is never committed. `npm run server:reset`
// restores the seed.
const fs = require('fs');
const path = require('path');

const seed = path.join(__dirname, 'db.seed.json');
const db = path.join(__dirname, 'db.json');
const reset = process.argv.includes('--reset');

if (reset || !fs.existsSync(db)) {
  fs.copyFileSync(seed, db);
  console.log(`${reset ? 'Reset' : 'Created'} ${path.relative(process.cwd(), db)} from seed`);
}
