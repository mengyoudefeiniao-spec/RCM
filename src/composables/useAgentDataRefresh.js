import { onMounted, onBeforeUnmount } from 'vue';
import { onTabMessage } from '../utils/crossTabBus.js';
import { G2B_ORDER_PREFIX, AGENT_STOCK_PREFIX } from '../utils/agentProcurement.js';

export function useAgentDataRefresh(refresh) {
  let timer;
  const unsubscribers = [];
  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => refresh(), 80); };
  const storage = event => { if (!event.key || event.key.startsWith(G2B_ORDER_PREFIX) || event.key.startsWith(AGENT_STOCK_PREFIX) || event.key.startsWith('rcm_shared_orders')) schedule(); };
  onMounted(() => {
    window.addEventListener('storage', storage);
    window.addEventListener('focus', schedule);
    window.addEventListener('rcm:agent-procurement-changed', schedule);
    for (const type of ['AGENT_PROCUREMENT_CHANGED', 'ORDER_UPDATED', 'ORDER_PURCHASED']) unsubscribers.push(onTabMessage(type, schedule));
  });
  onBeforeUnmount(() => {
    clearTimeout(timer);
    unsubscribers.forEach(unsubscribe => unsubscribe());
    window.removeEventListener('storage', storage);
    window.removeEventListener('focus', schedule);
    window.removeEventListener('rcm:agent-procurement-changed', schedule);
  });
}
