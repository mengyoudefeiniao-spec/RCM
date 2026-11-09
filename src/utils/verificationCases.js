/**
 * Field verification cases derived from 《5-技术验证清单》(V2.2).
 * Only items a tester can exercise on the phone itself are listed; server-side,
 * owner-supplied and iOS items stay in the written checklist.
 */

export const VERIFICATION_GROUPS = [
  { id: 'device', icon: 'Monitor' },
  { id: 'credential', icon: 'Postcard' },
  { id: 'biometric', icon: 'Camera' },
  { id: 'flow', icon: 'QrCode' },
];

export const CASE_FIELDS = {
  card: [
    { key: 'householdNo', type: 'text', required: true, mono: true },
    { key: 'cardYear', type: 'select', options: ['2021', '2022', '2023', '2024', '2025', '2026', 'unknown'] },
    { key: 'province', type: 'text' },
    { key: 'lighting', type: 'select', options: ['normal', 'weak', 'glare'] },
    { key: 'condition', type: 'select', options: ['flat', 'folded', 'worn'] },
  ],
  face: [
    { key: 'subjectId', type: 'text', required: true },
    { key: 'pose', type: 'select', options: ['straight', 'left', 'right'] },
    { key: 'attributes', type: 'multi', options: ['none', 'hijab', 'glasses', 'beard'] },
    { key: 'lighting', type: 'select', options: ['normal', 'weak', 'backlit'] },
    { key: 'distance', type: 'select', options: ['near', 'normal', 'far'] },
  ],
  attack: [
    { key: 'attackType', type: 'select', required: true, options: ['print', 'screen', 'video', 'mask', 'genuine'] },
    { key: 'subjectId', type: 'text' },
    { key: 'distance', type: 'select', options: ['near', 'normal', 'far'] },
    { key: 'lighting', type: 'select', options: ['normal', 'weak', 'backlit'] },
  ],
  qr: [
    { key: 'scene', type: 'select', options: ['indoor', 'outdoor', 'weak', 'offline'] },
  ],
};

export const VERIFICATION_CASES = [
  {
    id: 'ENV-01',
    group: 'device',
    priority: 'P0',
    kind: 'env',
    tv: 'TV-21 / TV-30',
  },
  {
    id: 'TRUST-01',
    group: 'device',
    priority: 'P0',
    kind: 'env',
    tv: 'TV-04 / TV-11',
  },
  {
    id: 'NFC-01',
    group: 'credential',
    priority: 'P0',
    kind: 'nfc',
    tv: 'TV-02 / TV-29',
  },
  {
    id: 'OCR-01',
    group: 'credential',
    priority: 'P0',
    kind: 'capture',
    captureType: 'card',
    tv: 'TV-01',
  },
  {
    id: 'FACE-01',
    group: 'biometric',
    priority: 'P0',
    kind: 'capture',
    captureType: 'face',
    tv: 'TV-03',
  },
  {
    id: 'SPOOF-01',
    group: 'biometric',
    priority: 'P0',
    kind: 'capture',
    captureType: 'attack',
    tv: 'TV-28',
  },
  {
    id: 'QR-01',
    group: 'flow',
    priority: 'P0',
    kind: 'qr',
    tv: 'TV-08',
  },
  {
    id: 'BIO-01',
    group: 'device',
    priority: 'P0',
    kind: 'manual',
    tv: 'TV-05',
  },
  {
    id: 'BIND-01',
    group: 'device',
    priority: 'P1',
    kind: 'manual',
    tv: 'TV-06',
  },
  {
    id: 'RTL-01',
    group: 'flow',
    priority: 'P1',
    kind: 'manual',
    tv: 'TV-22',
  },
  {
    id: 'GUIDE-01',
    group: 'flow',
    priority: 'P2',
    kind: 'manual',
    tv: 'TV-25',
  },
];

export function fieldsForCase(caseDef) {
  return CASE_FIELDS[caseDef?.captureType] || [];
}

export const CAPTURE_IMAGE_HINTS = {
  card: { maxSide: 2400, quality: 0.9, facing: 'environment' },
  face: { maxSide: 1280, quality: 0.85, facing: 'user' },
  attack: { maxSide: 1280, quality: 0.85, facing: 'environment' },
};
