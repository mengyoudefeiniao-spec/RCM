import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { getInitialFamilies } from '../../src/utils/sharedSession.js';
const directory = new URL('../../.playwright-cli/', import.meta.url);
await mkdir(directory, { recursive: true });
const family = getInitialFamilies('en')[0];
const legacy = { type: 'rcm-citizen-card', version: 1, cardNo: family.rationCardNo, headName: 'STALE QR NAME', paperCardNo: family.oldPaperCardNo, memberCount: 99, province: family.province, district: family.district, agentName: family.agentName, agentId: family.agentId, status: 'Active', verificationCode: 'VERIFY-LEGACY', issuedAt: '2000-01-01T00:00:00Z' };
for (const [name, payload] of [['legacy', legacy], ['unknown', { ...legacy, cardNo: 'RC-NOT-REGISTERED' }]]) {
  await QRCode.toFile(fileURLToPath(new URL('citizen-card-' + name + '.png', directory)), JSON.stringify(payload), { width: 480, margin: 3 });
}
