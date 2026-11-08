import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const output = path.join(root, 'artifacts/living-docs');
const checked = spawnSync('python3', ['scripts/living_docs.py', 'check'], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
if (checked.status !== 0) throw new Error('Validate SVG before rendering: ' + checked.stderr + checked.stdout);
await fs.mkdir(output, { recursive: true });
const files = (await fs.readdir(path.join(root, 'docs/living'))).filter(x => x.endsWith('.misvg.svg')).sort();
const browser = await chromium.launch();
const browserVersion = browser.version();
const records = [];
try {
  for (const file of files) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const svg = await fs.readFile(path.join(root, 'docs/living', file), 'utf8');
    await page.setContent('<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><style>body{margin:0;background:white}</style></head><body>' + svg + '</body></html>');
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const width = Number(svg.getAttribute('width')), height = Number(svg.getAttribute('height'));
      const texts = [...svg.querySelectorAll('g text')].map(element => {
        const b = element.getBBox(); return { id: element.id || element.parentElement.id, value: element.textContent, x: b.x, y: b.y, width: b.width, height: b.height };
      });
      const outside = texts.filter(b => b.x < -1 || b.y < -1 || b.x + b.width > width + 1 || b.y + b.height > height + 1);
      const overlaps = [];
      for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        const x = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const y = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        if (x > 2 && y > 2) overlaps.push({ a: a.id, b: b.id, first: a.value.slice(0, 55), second: b.value.slice(0, 55), x, y });
      }
      return { width, height, textCount: texts.length, outside, overlaps };
    });
    await page.screenshot({ path: path.join(output, file.replace('.misvg.svg', '.png')), fullPage: true });
    await page.close();
    records.push({ file, sha256: createHash('sha256').update(svg, 'utf8').digest('hex'), renderer: 'Chromium', browserVersion,
      dimensions: { 'visual-review': result.outside.length || result.overlaps.length ? 'fail' : 'pass' }, ...result });
  }
} finally {
  await browser.close();
}
const report = { scope: 'Actual Chromium SVG rendering, searchable text bounds and pairwise text overlaps; glyph appearance also needs visual inspection. No independent-renderer certification.', records };
await fs.writeFile(path.join(output, 'visual-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(records.map(x => ({ file: x.file, texts: x.textCount, outside: x.outside.length, overlaps: x.overlaps.length })), null, 2));
if (records.some(x => x.outside.length || x.overlaps.length)) process.exitCode = 1;
