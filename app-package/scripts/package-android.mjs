import { cp, mkdir, readdir, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(packageRoot, 'www');
const destination = path.join(packageRoot, 'android', 'app', 'src', 'main', 'assets');

// Empty the destination file by file: on Windows the whole-tree delete can be
// refused by the shell or by editors holding the folder, which aborts the copy.
async function emptyDirectory(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await emptyDirectory(target);
    await rm(target, { recursive: entry.isDirectory(), force: true }).catch(async () => {
      if (!entry.isDirectory()) await unlink(target).catch(() => {});
    });
  }
}

await emptyDirectory(destination);
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true, force: true });
console.log(`Bundled the web app into the APK assets at ${destination}`);
