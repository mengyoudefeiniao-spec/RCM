const ITERATIONS = 210000;
const encoder = new TextEncoder();
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)));
}

export async function createAdminCredential(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { algorithm: 'PBKDF2-SHA256', iterations: ITERATIONS, salt: hex(salt), hash: await derive(password, salt, ITERATIONS) };
}

// Public account records and audit snapshots must not contain credential material.
export function publicAdminAccount(account) {
  const { password, passwordConfirm, passwordCredential, ...publicFields } = account;
  return publicFields;
}
