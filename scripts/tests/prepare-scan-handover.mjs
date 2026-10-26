import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
const directory = new URL('../../.playwright-cli/', import.meta.url);
await mkdir(directory, { recursive: true });
await QRCode.toFile(fileURLToPath(new URL('scan-handover-qr.png', directory)), JSON.stringify({ type: 'rcm-pickup-order', version: 1, pickupCode: 'PK-SCAN-HANDOVER-E2E' }), { width: 480, margin: 3 });
