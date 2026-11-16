// The two Android APKs share one web bundle. Their build flavor is exposed by
// native code; web previews use dedicated routes instead of an in-page switch.
export const APP_ROLE_CITIZEN = 'citizen';
export const APP_ROLE_AGENT = 'agent';

function isKnownRole(role) {
  return role === APP_ROLE_CITIZEN || role === APP_ROLE_AGENT;
}

/**
 * Reads the role injected by `RcmAppRole` (Android WebView).
 * Returns an empty string in a plain browser.
 */
export function getNativeAppRole() {
  if (typeof window === 'undefined') return '';
  try {
    const role = window.RcmAppRole?.getAppRole?.();
    return isKnownRole(role) ? role : '';
  } catch {
    return '';
  }
}

export function isDedicatedApp() {
  return Boolean(getNativeAppRole());
}

/**
 * Resolves the only login/registration flow allowed for the current entry.
 * Native flavor wins; web previews use `/login/citizen` or `/login/agent`,
 * with `/login` remaining the citizen default for backwards compatibility.
 */
export function resolveAppRole(route) {
  const nativeRole = getNativeAppRole();
  if (nativeRole) return nativeRole;
  const metaRole = route?.meta?.appRole;
  if (isKnownRole(metaRole)) return metaRole;
  const queryRole = route?.query?.role;
  if (isKnownRole(queryRole)) return queryRole;
  if (route?.path === '/login/agent') return APP_ROLE_AGENT;
  if (route?.path === '/login/citizen') return APP_ROLE_CITIZEN;
  return '';
}
