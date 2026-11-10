import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(packageRoot, 'www');
const destination = path.join(packageRoot, 'android', 'app', 'src', 'main', 'assets');

await rm(destination, { recursive: true, force: true });
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, { recursive: true });
console.log(`Bundled the web app into the APK assets at ${destination}`);
