const fs = require('fs');
const path = require('path');

function scan(dir, results) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      scan(p, results);
      continue;
    }
    if (!item.endsWith('.md')) continue;
    const raw = fs.readFileSync(p, 'utf8');
    const lines = raw.split(/\r?\n/);
    if (!lines[0] || lines[0].trim() !== '---') {
      results.push({ path: p, reason: 'no-frontmatter' });
      continue;
    }
    // find frontmatter end
    let end = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') { end = i; break; }
    }
    if (end === -1) {
      results.push({ path: p, reason: 'no-frontmatter-end' });
      continue;
    }
    const fm = lines.slice(1, end).join('\n');
    const hasCategory = /(^|\n)\s*category\s*:/i.test('\n'+fm);
    if (!hasCategory) results.push({ path: p, reason: 'no-category' });
  }
}

const root = path.join(__dirname, '..', 'example');
const results = [];
scan(root, results);
if (results.length === 0) {
  console.log('ALL_HAVE_CATEGORY');
} else {
  for (const r of results) {
    console.log(`${r.reason}: ${r.path}`);
  }
  console.log(`TOTAL: ${results.length}`);
}
