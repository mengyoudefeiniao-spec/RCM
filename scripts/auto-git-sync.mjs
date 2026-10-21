import { appendFileSync, watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gitDir = path.join(repoRoot, '.git');
const logPath = path.join(gitDir, 'auto-git-sync.log');
const quietPeriodMs = 30_000;
const protectedAtStartup = new Set();
let debounceTimer;
let retryTimer;
let syncing = false;
let pendingPush = false;

function log(message) {
  appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
}

function runGit(args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', windowsHide: true });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function statusEntries() {
  const { status, stdout, stderr } = runGit(['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  if (status !== 0) throw new Error(stderr || 'git status failed');
  const tokens = stdout.split('\0');
  const entries = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.length < 4) continue;
    const state = token.slice(0, 2);
    entries.push({ state, file: token.slice(3) });
    if (state.includes('R') || state.includes('C')) {
      const originalPath = tokens[index + 1];
      if (originalPath) entries.push({ state, file: originalPath });
      index += 1;
    }
  }
  return entries;
}

function stagedChangesExist() {
  const { status, stdout, stderr } = runGit(['diff', '--cached', '--name-only', '-z']);
  if (status !== 0) throw new Error(stderr || 'git diff --cached failed');
  return stdout.length > 0;
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => void syncChanges(), 60_000);
}

async function syncChanges() {
  if (syncing) return;
  syncing = true;
  try {
    const entries = statusEntries();
    const currentFiles = new Set(entries.map(({ file }) => file));
    for (const file of protectedAtStartup) {
      if (!currentFiles.has(file)) protectedAtStartup.delete(file);
    }

    const eligible = [...new Set(entries
      .filter(({ file, state }) => !protectedAtStartup.has(file) && !state.includes('U'))
      .map(({ file }) => file))];

    if (eligible.length && stagedChangesExist()) {
      log('Auto-commit skipped because the index already contains manually staged changes.');
    } else if (eligible.length) {
      const addResult = runGit(['add', '-A', '--', ...eligible]);
      if (addResult.status !== 0) throw new Error(addResult.stderr || 'git add failed');
      const commitResult = runGit(['commit', '-m', 'auto: sync workspace changes']);
      if (commitResult.status !== 0) throw new Error(commitResult.stderr || commitResult.stdout || 'git commit failed');
      log(`Committed ${eligible.length} changed path(s): ${eligible.join(', ')}`);
      pendingPush = true;
    }

    if (pendingPush) {
      const pushResult = runGit(['push']);
      if (pushResult.status !== 0) {
        log(`Push failed; will retry: ${(pushResult.stderr || pushResult.stdout).trim()}`);
        scheduleRetry();
      } else {
        pendingPush = false;
        log('Pushed the automatic commit to the configured upstream.');
      }
    }
  } catch (error) {
    log(`Automatic sync failed; will retry: ${error?.message || error}`);
    if (pendingPush) scheduleRetry();
  } finally {
    syncing = false;
  }
}

try {
  for (const { file } of statusEntries()) protectedAtStartup.add(file);
  const watcher = watch(repoRoot, { recursive: true }, (_event, filename) => {
    if (filename) {
      const relative = String(filename).replaceAll('/', '\\').toLowerCase();
      if (relative === '.git' || relative.startsWith(`.git\\`)
        || relative.startsWith('node_modules\\') || relative.startsWith('dist\\')
        || relative.startsWith('app-package\\www\\') || relative.startsWith('app-package\\output\\')
        || relative.startsWith('app-package\\android-sdk\\') || relative.startsWith('app-package\\android-tools\\')
        || relative.startsWith('app-package\\gradle-user-home\\') || relative.startsWith('app-package\\android\\app\\build\\')) return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => void syncChanges(), quietPeriodMs);
  });
  watcher.on('error', (error) => log(`File watcher error: ${error.message}`));
  log(`Watching ${repoRoot}; ${protectedAtStartup.size} pre-existing changed path(s) are protected from automatic commits.`);
} catch (error) {
  log(`Could not start automatic GitHub sync: ${error?.message || error}`);
  process.exitCode = 1;
}
