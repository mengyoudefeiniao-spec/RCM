self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { /* Ignore invalid payloads. */ }
  const title = String(payload.title || 'RCM');
  const body = String(payload.body || '');
  const url = typeof payload.url === 'string' && payload.url.startsWith('/') && !payload.url.startsWith('//')
    ? new URL(payload.url, self.location.origin).href
    : `${self.location.origin}/#/my`;
  event.waitUntil(self.registration.showNotification(title, { body, data: { url }, tag: payload.id || undefined }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url;
  if (!target) return;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(new URL(target).origin));
    if (existing) {
      await existing.navigate(target);
      return existing.focus();
    }
    return clients.openWindow(target);
  })());
});
