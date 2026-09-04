import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const globalModules = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
const puppeteerEntry = join(globalModules, 'puppeteer', 'lib', 'puppeteer', 'puppeteer.js');
const { default: puppeteer } = await import(pathToFileURL(puppeteerEntry).href);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] ? `-${process.argv[3].replace(/[^a-z0-9_-]/gi, '')}` : '';
const directory = 'temporary_screenshots';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

async function loadLazyContent(page) {
  await page.evaluate(async () => {
    // Convert lazy images to eager to trigger download immediately
    const images = Array.from(document.querySelectorAll('img'));
    for (const img of images) {
      if (img.loading === 'lazy') {
        img.loading = 'eager';
      }
    }

    const step = Math.max(window.innerHeight * 0.5, 400);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Ensure all images are fully loaded and decoded
    await Promise.all(
      Array.from(document.images).map((img) => {
        if (img.complete) {
          return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        }
        return new Promise((resolve) => {
          img.addEventListener('load', () => {
            if (img.decode) {
              img.decode().then(resolve).catch(resolve);
            } else {
              resolve();
            }
          }, { once: true });
          img.addEventListener('error', resolve, { once: true });
        });
      })
    );

    window.scrollTo(0, 0);
  });
  await new Promise((resolve) => setTimeout(resolve, 1500));
}

await mkdir(directory, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-crash-reporter',
    '--no-first-run',
    '--no-default-browser-check'
  ],
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((resolve) => setTimeout(resolve, 2000));
await loadLazyContent(page);
const desktopMetrics = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
await page.screenshot({ path: `${directory}/${timestamp}${label}-desktop.png`, fullPage: true });

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise((resolve) => setTimeout(resolve, 2000));
await loadLazyContent(page);
const mobileMetrics = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}));
await page.screenshot({ path: `${directory}/${timestamp}${label}-mobile.png`, fullPage: true });

await browser.close();
console.log(`${directory}/${timestamp}${label}-desktop.png`);
console.log(`${directory}/${timestamp}${label}-mobile.png`);
console.log(JSON.stringify({ desktopMetrics, mobileMetrics }));

if (
  desktopMetrics.scrollWidth > desktopMetrics.viewport ||
  mobileMetrics.scrollWidth > mobileMetrics.viewport
) {
  process.exitCode = 1;
}
