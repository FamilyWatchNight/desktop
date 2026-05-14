/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'main', 'testing-active');
const destDir = path.join(__dirname, '..', 'src', 'main', 'testing');

if (!fs.existsSync(srcDir)) {
  console.warn('No src/main/testing-active directory found');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

// Remove existing files and folders in destDir (except README.md)
const existingFiles = fs.readdirSync(destDir);
for (const file of existingFiles) {
  if (fs.lstatSync(path.join(destDir, file)).isDirectory()) {
    fs.rmSync(path.join(destDir, file), { recursive: true, force: true });
  } else if (file !== 'README.md') {
    fs.rmSync(path.join(destDir, file));
  }
}

// Replace with active versions
const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (fs.lstatSync(path.join(srcDir, file)).isDirectory()) {
    fs.cpSync(path.join(srcDir, file), path.join(destDir, file), { recursive: true });
  } else if (file !== 'README.md') {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
}

console.info('Copied testing-active files to src/main/testing');

const rendererSrcDir = path.join(__dirname, '..', 'src', 'renderer', 'testing-active');
const rendererDestDir = path.join(__dirname, '..', 'src', 'renderer', 'testing');

if (fs.existsSync(rendererSrcDir)) {
  fs.mkdirSync(rendererDestDir, { recursive: true });

  const existingRendererFiles = fs.readdirSync(rendererDestDir);
  for (const file of existingRendererFiles) {
    if (fs.lstatSync(path.join(rendererDestDir, file)).isDirectory()) {
      fs.rmSync(path.join(rendererDestDir, file), { recursive: true, force: true });
    } else if (file !== 'README.md') {
      fs.rmSync(path.join(rendererDestDir, file));
    }
  }

  const rendererFiles = fs.readdirSync(rendererSrcDir);
  for (const file of rendererFiles) {
    if (fs.lstatSync(path.join(rendererSrcDir, file)).isDirectory()) {
      fs.cpSync(path.join(rendererSrcDir, file), path.join(rendererDestDir, file), {
        recursive: true,
      });
    } else if (file !== 'README.md') {
      fs.copyFileSync(path.join(rendererSrcDir, file), path.join(rendererDestDir, file));
    }
  }

  console.info('Copied testing-active files to src/renderer/testing');
} else {
  console.warn('No src/renderer/testing-active directory found');
}
