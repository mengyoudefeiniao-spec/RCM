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

export async function verifyPasswordCredential(password, credential) {
  if (typeof password !== 'string' || credential?.algorithm !== 'PBKDF2-SHA256'
    || !Number.isInteger(credential.iterations) || credential.iterations < 100000 || credential.iterations > 1000000
    || !/^[a-f0-9]{32}$/i.test(credential.salt || '') || !/^[a-f0-9]{64}$/i.test(credential.hash || '')) return false;
  const salt = Uint8Array.from(credential.salt.match(/../g), pair => parseInt(pair, 16));
  const actual = await derive(password, salt, credential.iterations);
  let difference = 0;
  for (let index = 0; index < actual.length; index++) difference |= actual.charCodeAt(index) ^ credential.hash.toLowerCase().charCodeAt(index);
  return difference === 0;
}

// Public account records and audit snapshots must not contain credential material.
export function publicAdminAccount(account) {
  const { password, passwordConfirm, passwordCredential, ...publicFields } = account;
  return publicFields;
}
