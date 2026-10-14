/**
 * 跨标签页高可靠事件总线 (Cross-Tab Event Bus)
 * 基于 HTML5 BroadcastChannel 与 localStorage storage 事件双通道机制
 * 确保同源下不同标签页 (如: 公民APP标签页 -> 政府管理Web标签页) 能够毫秒级无感同步数据与业务通知
 */

const CHANNEL_NAME = 'rcm_cross_tab_bus';

let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('[CrossTabBus] BroadcastChannel not available, fallback to storage event', e);
  }
}

// 订阅事件监听器集合
const listeners = new Map();

/**
 * 内部统一分发事件
 */
function dispatch(type, payload) {
  const handlerList = listeners.get(type) || [];
  handlerList.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error(`[CrossTabBus] Handler error for event ${type}:`, err);
    }
  });

  // 通配监听
  const allHandlers = listeners.get('*') || [];
  allHandlers.forEach((handler) => {
    try {
      handler({ type, payload });
    } catch (err) {
      console.error('[CrossTabBus] Wildcard handler error:', err);
    }
  });
}

// 1. 监听 BroadcastChannel 消息
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data && event.data.type) {
      dispatch(event.data.type, event.data.payload);
    }
  };
}

// 2. 监听 localStorage storage 事件 (作为跨标签页保底通道)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === '__rcm_cross_tab_msg__' && event.newValue) {
      try {
        const msg = JSON.parse(event.newValue);
        if (msg && msg.type) {
          dispatch(msg.type, msg.payload);
        }
      } catch (e) {
        // ignore parse error
      }
    }
  });
}

/**
 * 广播跨标签页消息给其他所有打开的窗口/标签页
 * @param {string} type 消息类型，例如 'TICKET_SUBMITTED' | 'ORDER_PURCHASED' | 'TICKET_UPDATED'
 * @param {any} payload 数据载荷
 */
export function broadcastTabMessage(type, payload) {
  const messageObj = {
    type,
    payload,
    timestamp: Date.now(),
    senderTabId: sessionStorage.getItem('rcm_tab_id') || 'tab-' + Math.random().toString(36).substring(2, 7)
  };

  // 通过 BroadcastChannel 广播
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(messageObj);
    } catch (e) {
      console.warn('[CrossTabBus] postMessage error:', e);
    }
  }

  // 通过 localStorage storage 广播 (写入带时间戳的值触发其他窗口的 storage 事件)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('__rcm_cross_tab_msg__', JSON.stringify(messageObj));
    } catch (e) {
      // ignore
    }
  }
}

/**
 * 监听指定类型的跨标签页消息
 * @param {string} type 消息类型，或 '*' 监听全部
 * @param {Function} handler 处理回调
 * @returns {Function} 取消监听函数
 */
export function onTabMessage(type, handler) {
  if (!listeners.has(type)) {
    listeners.set(type, []);
  }
  listeners.get(type).push(handler);

  return () => {
    const list = listeners.get(type) || [];
    const index = list.indexOf(handler);
    if (index > -1) {
      list.splice(index, 1);
    }
  };
}
