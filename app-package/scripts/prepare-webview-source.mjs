import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(packageRoot, '..');
const sourcePath = path.join(sourceRoot, 'src', 'components', 'layout', 'AppLayout.vue');
const adapterSourcePath = path.join(sourceRoot, 'src', 'mock', 'adapter.js');
const overrideDir = path.join(packageRoot, 'source-overrides');
const overridePath = path.join(overrideDir, 'AppLayout.vue');
const adapterOverridePath = path.join(overrideDir, 'adapter.js');
let source = await readFile(sourcePath, 'utf8');

function replaceOnce(input, before, after, description) {
  const first = input.indexOf(before);
  if (first < 0 || input.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Could not safely prepare the APK-specific AppLayout override (${description}).`);
  }
  return input.slice(0, first) + after + input.slice(first + before.length);
}

source = replaceOnce(
  source,
  'h-screen max-h-screen overflow-hidden bg-[#1B3123]/10 py-1 sm:py-2.5 justify-center items-center',
  'h-screen max-h-screen overflow-hidden bg-[#1B3123]/10 py-1 sm:py-2.5 justify-center items-center android-native-app-layout',
  'app viewport root marker',
);
source = replaceOnce(
  source,
  'sm:border sm:border-[#E5CEA1]\'\n          : \'flex-1 w-full\'',
  'sm:border sm:border-[#E5CEA1] android-native-app-container\'\n          : \'flex-1 w-full\'',
  'app viewport container marker',
);
source = replaceOnce(
  source,
  '</style>',
  `\n/* APK-only: fill the native safe viewport instead of the desktop phone-frame preview. */\n.android-native-app-layout { height: 100dvh !important; max-height: 100dvh !important; padding-top: 0 !important; padding-bottom: 0 !important; justify-content: flex-start !important; }\n.android-native-app-container { height: 100% !important; max-height: 100% !important; }\n</style>`,
  'app viewport sizing rules',
);

await mkdir(overrideDir, { recursive: true });
await writeFile(overridePath, source, 'utf8');
console.log(`Prepared APK-specific responsive layout at ${overridePath}`);
