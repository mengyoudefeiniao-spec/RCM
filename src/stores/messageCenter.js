import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getMessages, markMessageRead } from '../api/adminCenter.js';

export const useMessageCenterStore = defineStore('messageCenter', () => {
  const inbox = ref([]);
  const reviewQueue = ref([]);
  const unreadInboxCount = computed(() => inbox.value.filter((item) => !item.read && item.sourceFolder !== 'sent').length);
  const unreadReviewCount = computed(() => reviewQueue.value.filter((item) => item.reviewStatus === 'pending' && !item.read).length);
  const unreadCount = computed(() => unreadInboxCount.value + unreadReviewCount.value);

  async function refresh({ includeInbox = true, includeReview = false } = {}) {
    const requests = [];
    if (includeInbox) requests.push(getMessages('inbox').then((messages) => { inbox.value = messages || []; }));
    if (includeReview) requests.push(getMessages('review').then((messages) => { reviewQueue.value = messages || []; }));
    await Promise.all(requests);
  }

  function setReviewQueue(messages) {
    reviewQueue.value = messages || [];
    return reviewQueue.value;
  }

  async function markRead(id) {
    const matching = [
      inbox.value.find((entry) => entry.id === id),
      reviewQueue.value.find((entry) => entry.id === id)
    ].filter(Boolean);
    if (matching.length && matching.every((item) => item.read)) return;
    await markMessageRead(id);
    matching.forEach((item) => { item.read = true; });
  }

  return { inbox, reviewQueue, unreadInboxCount, unreadReviewCount, unreadCount, refresh, setReviewQueue, markRead };
});
