/**
 * Bridge to the native verification services (device probe, NFC reader, export).
 * The native side pipes answers back through window events, so every call is
 * request-id correlated and always settles.
 */

export const hasVerificationBridge = () =>
  typeof window !== 'undefined' && typeof window.RcmVerify?.postMessage === 'function';

export function verificationInvoke(action, payload = {}, timeout = 25000) {
  if (!hasVerificationBridge()) return Promise.reject(new Error('no-bridge'));
  const requestId = crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('rcm-verify-response', onResponse);
    };
    const onResponse = event => {
      if (event.detail?.requestId !== requestId) return;
      cleanup();
      resolve(event.detail || {});
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, timeout);
    window.addEventListener('rcm-verify-response', onResponse);
    try {
      window.RcmVerify.postMessage(JSON.stringify({ ...payload, action, requestId }));
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

export async function probeDevice() {
  const response = await verificationInvoke('probe', {}, 20000);
  if (!response.success) throw new Error(response.error || 'probe-failed');
  return response.data || {};
}

export async function nfcStart() {
  const response = await verificationInvoke('nfcStart', {}, 8000);
  if (!response.success) throw new Error(response.error || 'nfc-start-failed');
  return response.data || {};
}

export async function nfcStop() {
  try {
    await verificationInvoke('nfcStop', {}, 6000);
  } catch {
    // The reader is already gone when the activity pauses.
  }
}

export async function nfcOpenSettings() {
  try {
    await verificationInvoke('nfcSettings', {}, 5000);
  } catch {
    // Ignore: some ROMs hide the NFC settings activity.
  }
}

export function onNfcEvent(handler) {
  const listener = event => handler(event.detail || {});
  window.addEventListener('rcm-verify-nfc', listener);
  return () => window.removeEventListener('rcm-verify-nfc', listener);
}

export async function writeExportFile(folder, path, base64) {
  const response = await verificationInvoke('writeExport', { folder, path, base64 }, 60000);
  if (!response.success) throw new Error(response.error || 'write-failed');
  return response.data || {};
}

export async function finishExport(folder) {
  const response = await verificationInvoke('finishExport', { folder }, 120000);
  if (!response.success) throw new Error(response.error || 'zip-failed');
  return response.data || {};
}

export async function clearExport(folder) {
  try {
    await verificationInvoke('clearExport', { folder }, 20000);
  } catch {
    // Staging leftovers are harmless.
  }
}
