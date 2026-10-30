import { createDiditProvider } from './didit.mjs';

// All providers expose createSession and getLiveness; the application owns identity decisions.
export function createVerificationProvider({ provider, ...options }) {
  if (provider === 'didit') return createDiditProvider(options);
  throw new Error('Unsupported verification provider');
}
