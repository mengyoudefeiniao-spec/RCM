import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.resolve(packageRoot, '..');
const sourcePath = path.join(sourceRoot, 'src', 'mock', 'adapter.js');
const overridePath = path.join(packageRoot, 'source-overrides', 'adapter.js');
let source = (await readFile(sourcePath, 'utf8')).replace(/\r\n/g, '\n');

function replaceOnce(before, after, label) {
  const index = source.indexOf(before);
  if (index < 0 || source.indexOf(before, index + before.length) >= 0) {
    throw new Error(`Could not safely prepare Arabic APK adapter override (${label}).`);
  }
  source = source.slice(0, index) + after + source.slice(index + before.length);
}

replaceOnce(
  "import * as enTransfer from './data/en/transferData.js';",
  "import * as enTransfer from './data/en/transferData.js';\nimport * as arTransfer from '../../app-package/source-overrides/arTransferData.js';",
  'transfer data import',
);
replaceOnce("  const isEn = reqLang === 'en';", "  const isEn = reqLang === 'en';\n  const isAr = reqLang === 'ar';", 'language selector');
replaceOnce(
  '  const TRANSFER_BRANCH_OPTIONS = isEn ? enTransfer.TRANSFER_BRANCH_OPTIONS : zhTransfer.TRANSFER_BRANCH_OPTIONS;',
  '  const TRANSFER_BRANCH_OPTIONS = isEn ? enTransfer.TRANSFER_BRANCH_OPTIONS : isAr ? arTransfer.TRANSFER_BRANCH_OPTIONS : zhTransfer.TRANSFER_BRANCH_OPTIONS;',
  'transfer option selector',
);
replaceOnce(
  `  if (url.includes('/citizen/families') && method === 'GET') {
    const sharedFams = getSharedFamilies();
    return createResponse(sharedFams && sharedFams.length > 0 ? sharedFams : familiesStore);
  }`,
  `  if (url.includes('/citizen/families') && method === 'GET') {
    const sharedFams = getSharedFamilies();
    const familyList = sharedFams && sharedFams.length > 0 ? sharedFams : familiesStore;
    if (!isAr) return createResponse(familyList);
    const arabicAgentNames = new Map();
    TRANSFER_BRANCH_OPTIONS.forEach((province) => province.branches.forEach((branch) => branch.centers.forEach((center) => {
      [...center.flourAgents, ...center.foodAgents].forEach((agent) => arabicAgentNames.set(agent.id, agent.name));
    })));
    const localizedFamilies = familyList.map((family) => {
      const ids = String(family.agentId || '').match(/(?:FA|FD)-[A-Z]+-\\d+/g) || [];
      const names = ids.map((id) => arabicAgentNames.get(id)).filter(Boolean);
      return names.length ? { ...family, agentName: names.join(' ＆ ') } : family;
    });
    localizedFamilies.forEach((family, index) => {
      if (familyList[index]?.agentName !== family.agentName && sharedFams?.length) {
        updateSharedFamily(family.rationCardNo, { agentName: family.agentName });
      }
    });
    return createResponse(localizedFamilies);
  }`,
  'family site localization',
);

await writeFile(overridePath, source, 'utf8');
console.log(`Prepared APK-specific Arabic mock adapter at ${overridePath}`);
