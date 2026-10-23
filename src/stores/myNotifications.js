import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { ElNotification } from 'element-plus';
import { i18n } from '../locales/index.js';
import { getMyNotifications, markMyNotificationsRead, registerMyPushSubscription } from '../api/my.js';
import { hasNativeAppBridge, nativeAppRequest } from '../utils/nativeApp.js';

const supportedRole = (role) => role === 'citizen' || role === 'agent';

function vapidKeyBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export function notificationUrl(item) {
  const path = /^\/(?!\/)/.test(item.path || '') ? item.path : '/my';
  const query = new URLSearchParams();
  if (item.flow && item.type === 'material') query.set('supplement', item.id);
  if (item.tab) query.set('tab', item.tab);
  if (item.type === 'complaint' && item.complaintId) query.set('complaint', item.complaintId);
  const suffix = query.toString();
  return `${path}${suffix ? `?${suffix}` : ''}`;
}

export function notificationTitle(item, role) {
  return i18n.global.t(item.titleKey || `my.notice.${role}.${item.type}.title`, item.params || {});
}

export function notificationBody(item, role) {
  if (item.bodyKey) return i18n.global.t(item.bodyKey, item.params || {});
  return item.flow ? i18n.global.t('my.materialRequestBody', { flow: i18n.global.t(`my.materialFlow.${item.flow}`) }) : i18n.global.t(`my.notice.${role}.${item.type}.body`);
}

export const useMyNotificationsStore = defineStore('myNotifications', () => {
  const items = ref([]);
  const role = ref('');
  const unreadCount = computed(() => items.value.filter((item) => !item.read).length);
  const hasUnread = (section) => items.value.some((item) => !item.read && (!section || item.section === section));
  let timer;
  let running = false;

  function showDeviceNotice(item) {
    const title = notificationTitle(item, role.value);
    const body = notificationBody(item, role.value);
    const target = notificationUrl(item);
    const appMode = sessionStorage.getItem('rcm_layout_mode') === 'app';
    const appQuery = appMode ? `${target.includes('?') ? '&' : '?'}layout=app&role=${encodeURIComponent(role.value)}` : '';
    const url = `${location.origin}${location.pathname}#${target}${appQuery}`;
    const showInApp = () => ElNotification({ title, message: body, type: 'info', duration: 6000, onClick: () => { location.href = url; } });
    const showWindowNotification = () => {
      try {
        const notice = new Notification(title, { body, tag: item.id });
        notice.onclick = () => { window.focus(); location.href = url; };
      } catch { showInApp(); }
    };
    if (hasNativeAppBridge()) {
      nativeAppRequest('notify', { title, body, url, tag: item.id, channelName: i18n.global.t('my.notificationCenter') }).then(shown => { if (!shown) showInApp(); });
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => registration
          ? registration.showNotification(title, { body, tag: item.id, data: { url } })
          : showWindowNotification()).catch(showWindowNotification);
      } else {
        showWindowNotification();
      }
    } else {
      showInApp();
    }
  }

  async function refresh() {
    if (!supportedRole(role.value)) return;
    const requestedRole = role.value;
    const next = await getMyNotifications();
    if (requestedRole !== role.value) return;
    const key = `rcm_my_${role.value}_seen_notice_ids_v1`;
    let seenIds = [];
    try { seenIds = JSON.parse(localStorage.getItem(key) || '[]'); } catch { /* Ignore stale browser data. */ }
    const seen = new Set(seenIds);
    const fresh = next.filter((item) => !item.read && !seen.has(item.id));
    items.value = next;
    localStorage.setItem(key, JSON.stringify(next.map((item) => item.id)));
    // Group a burst into one system banner; the red dots retain every unread item.
    if (fresh.length && running) showDeviceNotice(fresh[0]);
  }

  async function markRead(ids) {
    if (!ids.length) return;
    await markMyNotificationsRead(ids);
    items.value = items.value.map((item) => ids.includes(item.id) ? { ...item, read: true } : item);
  }

  async function markSectionRead(section) {
    await markRead(items.value.filter((item) => !item.read && item.section === section).map((item) => item.id));
  }

  async function enableDeviceNotifications() {
    if (hasNativeAppBridge()) {
      const enabled = await nativeAppRequest('enableNotifications', {}, 60000);
      if (enabled) { const first = items.value.find(item => !item.read); if (first) showDeviceNotice(first); }
      return enabled;
    }
    if (typeof Notification === 'undefined') return false;
    let permission;
    try { permission = await Notification.requestPermission(); } catch { return false; }
    if (permission !== 'granted') return false;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/notification-sw.js');
        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (publicKey && registration.pushManager) {
          const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
            userVisibleOnly: true, applicationServerKey: vapidKeyBytes(publicKey)
          });
          await registerMyPushSubscription({ subscription: subscription.toJSON(), locale: i18n.global.locale.value });
        }
      } catch { /* Foreground browser notifications remain available. */ }
    }
    const first = items.value.find((item) => !item.read);
    if (first) showDeviceNotice(first);
    return true;
  }

  function onFocus() { refresh().catch(() => {}); }

  function start(nextRole) {
    stop();
    role.value = nextRole;
    items.value = [];
    if (!supportedRole(nextRole)) return;
    running = true;
    refresh().catch(() => {});
    timer = setInterval(onFocus, 30000);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onFocus);
    window.addEventListener('rcm:notifications-changed', onFocus);
  }

  function stop() {
    running = false;
    if (timer) clearInterval(timer);
    timer = undefined;
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('storage', onFocus);
    window.removeEventListener('rcm:notifications-changed', onFocus);
  }

  return { items, role, unreadCount, hasUnread, refresh, markRead, markSectionRead, enableDeviceNotifications, start, stop };
});
