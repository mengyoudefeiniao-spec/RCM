import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getMessages, markMessageRead } from '../api/adminCenter.js';

export const useMessageCenterStore = defineStore('messageCenter', () => {
  const inbox = ref([]);
  const unreadCount = computed(() => inbox.value.filter((item) => !item.read).length);
  async function refresh() { inbox.value = await getMessages('inbox'); }
  async function markRead(id) { await markMessageRead(id); const item = inbox.value.find((entry) => entry.id === id); if (item) item.read = true; }
  return { inbox, unreadCount, refresh, markRead };
});
