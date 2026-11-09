/** Device snapshot helpers shared by the verification panels and the report. */

export async function browserProbe() {
  let storage = {};
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate) storage = { internalTotalBytes: estimate.quota, internalFreeBytes: estimate.quota - (estimate.usage || 0) };
  } catch {
    // Storage estimates are optional.
  }
  return {
    generatedAt: Date.now(),
    app: { packageName: 'browser-preview', versionName: 'preview', role: 'preview', debuggable: true },
    device: {
      manufacturer: navigator.vendor || '',
      model: navigator.platform || 'Browser',
      androidRelease: '-',
      sdkInt: null,
      cpuCores: navigator.hardwareConcurrency || null,
      abis: '',
      is64Bit: null,
      emulatorSuspected: false,
      biometricFingerprint: false,
      biometricFace: false,
      biometricIris: false,
      localTime: new Date().toISOString(),
    },
    memory: {
      totalBytes: navigator.deviceMemory ? navigator.deviceMemory * 1024 ** 3 : null,
      lowRamDevice: false,
    },
    storage,
    display: {
      widthPx: window.screen?.width,
      heightPx: window.screen?.height,
      densityDpi: Math.round((window.devicePixelRatio || 1) * 160),
      density: window.devicePixelRatio,
    },
    nfc: { supported: false, enabled: false },
    camera: { count: -1 },
    security: { playStoreInstalled: false, playServicesInstalled: false, rootSuspected: false },
    webview: { version: navigator.userAgent },
  };
}

export function flattenProbe(probe) {
  if (!probe) return null;
  const device = probe.device || {};
  const memory = probe.memory || {};
  const storage = probe.storage || {};
  const display = probe.display || {};
  const nfc = probe.nfc || {};
  const camera = probe.camera || {};
  const security = probe.security || {};
  const app = probe.app || {};
  const webview = probe.webview || {};
  return {
    model: device.model || '',
    manufacturer: device.manufacturer || '',
    androidRelease: device.androidRelease || '',
    sdkInt: device.sdkInt ?? null,
    cpuCores: device.cpuCores ?? null,
    is64Bit: device.is64Bit ?? null,
    emulator: device.emulatorSuspected ?? null,
    totalMemBytes: memory.totalBytes ?? null,
    availMemBytes: memory.availBytes ?? null,
    lowRamDevice: memory.lowRamDevice ?? null,
    storageTotalBytes: storage.internalTotalBytes ?? null,
    storageFreeBytes: storage.internalFreeBytes ?? null,
    screen: display.widthPx ? `${display.widthPx}x${display.heightPx}` : '',
    densityDpi: display.densityDpi ?? null,
    cameras: camera.count ?? null,
    nfc: nfc.supported === undefined ? '' : nfc.supported ? 'yes' : 'no',
    nfcEnabled: nfc.enabled ?? null,
    playStore: security.playStoreInstalled ?? null,
    playServices: security.playServicesInstalled ?? null,
    signature: security.signatureSha256 || '',
    root: security.rootSuspected ?? null,
    webview: webview.version || '',
    appVersion: app.versionName || '',
    packageName: app.packageName || '',
    role: app.role || '',
  };
}
