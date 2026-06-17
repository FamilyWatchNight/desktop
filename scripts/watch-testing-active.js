#!/usr/bin/env node
/*
  Watch `src/renderer/testing-active` and run `node scripts/use-testing-active.js`
  on changes (ignoring README.md). Debounced to avoid duplicate triggers
  from editor format-on-save behavior.
*/
const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const WATCH_DIR = path.join(__dirname, '..', 'src', 'renderer', 'testing-active');
const COPY_CMD = 'node scripts/use-testing-active.js';
const DEBOUNCE_MS = 300;

let timer = null;
let running = false;

function runCopy() {
  if (running) return; // avoid concurrent copies
  running = true;
  console.log('[watch-testing-active] Running copy:', COPY_CMD);
  const p = exec(COPY_CMD, { cwd: path.join(__dirname, '..') }, (err, _stdout, stderr) => {
    if (err) console.error('[watch-testing-active] copy error:', err);
    if (stderr) console.error('[watch-testing-active]', stderr);
    running = false;
  });
  if (p.stdout) {
    p.stdout.pipe(process.stdout);
  }
}

function scheduleCopy() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    runCopy();
  }, DEBOUNCE_MS);
}

const watcher = chokidar.watch(WATCH_DIR, {
  ignored: /(^|[\/\\])README\.md$/,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 },
});

watcher.on('add', (p) => {
  console.log('[watch-testing-active] add', p);
  scheduleCopy();
});
watcher.on('change', (p) => {
  console.log('[watch-testing-active] change', p);
  scheduleCopy();
});
watcher.on('unlink', (p) => {
  console.log('[watch-testing-active] unlink', p);
  scheduleCopy();
});

process.on('SIGINT', () => {
  console.log('\n[watch-testing-active] shutting down');
  watcher.close().then(() => process.exit(0));
});

console.log('[watch-testing-active] watching', WATCH_DIR);
