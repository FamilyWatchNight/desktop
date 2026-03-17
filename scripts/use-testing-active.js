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
  }
  else if (file !== 'README.md') {
    fs.rmSync(path.join(destDir, file));
  }
}

// Replace with no-op versions
const files = fs.readdirSync(srcDir);
for (const file of files) {
  if (fs.lstatSync(path.join(srcDir, file)).isDirectory()) {
    fs.cpSync(path.join(srcDir, file), path.join(destDir, file), { recursive: true });
  }
  else if (file !== 'README.md') {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
}

console.info('Copied testing-active files to src/main/testing');