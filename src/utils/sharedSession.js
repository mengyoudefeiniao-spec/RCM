/**
 * 多标签页共享持久化会话与业务数据缓存中心
 * 管理公文申请(Tickets)、选购订单(Orders)、家庭配给档案(Families)在多标签页间的持久化与实时同步
 */
import { broadcastTabMessage } from './crossTabBus.js';
import { MOCK_REVIEW_TICKETS } from '../mock/data/reviewData.js';
import { MOCK_FAMILIES as MOCK_FAMILIES_ZH } from '../mock/data/citizenData.js';
import { MOCK_FAMILIES as MOCK_FAMILIES_EN } from '../mock/data/en/citizenData.js';

const STORAGE_KEY_TICKETS = 'rcm_shared_tickets';
const STORAGE_KEY_ORDERS = 'rcm_shared_orders';
const STORAGE_KEY_FAMILIES = 'rcm_shared_families';

function getActiveLanguage() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('rcm_language') || 'zh';
  }
  return 'zh';
}

function getArabicFamilies() {
  const base = JSON.parse(JSON.stringify(MOCK_FAMILIES_ZH));
  const fam1 = base[0];
  if (fam1) {
    fam1.province = 'محافظة بغداد';
    fam1.district = 'مركز تموين الكرخ الأول (#04)';
    fam1.headName = 'أحمد حسن صالح';
    fam1.agentName = 'محطة توزيع الكرخ الأولى (محمد جبار)';
    fam1.address = 'رقم 14، شارع المنصور، حي الكرخ، بغداد';
    fam1.status = 'ساري المفعول';
    const arMembers = [
      { name: 'أحمد حسن صالح', relation: 'رب الأسرة', gender: 'ذكر', status: 'ساري المفعول' },
      { name: 'فاطمة علي محمد', relation: 'الزوجة', gender: 'أنثى', status: 'ساري المفعول' },
      { name: 'عمر أحمد حسن', relation: 'ابن', gender: 'ذكر', status: 'ساري المفعول' },
      { name: 'زينب أحمد حسن', relation: 'ابنة', gender: 'أنثى', status: 'ساري المفعول' },
      { name: 'يوسف أحمد حسن', relation: 'ابن', gender: 'ذكر', status: 'ساري المفعول' }
    ];
    fam1.members = fam1.members.map((m, idx) => ({
      ...m,
      ...(arMembers[idx] || {}),
      residenceInfo: fam1.address
    }));
  }
  return base;
}

function getKurdishFamilies() {
  const base = JSON.parse(JSON.stringify(MOCK_FAMILIES_ZH));
  const fam1 = base[0];
  if (fam1) {
    fam1.province = 'پارێزگای بەغدا';
    fam1.district = 'مەڵبەندی یەکەمی کەرخ (#04)';
    fam1.headName = 'ئەحمەد حەسەن ساڵح';
    fam1.agentName = 'بنکەی دابەشکردنی کەرخی یەکەم (محەمەد جەبار)';
    fam1.address = 'ژمارە 14، شەقامی مه‌نسوور، کەرخ، بەغدا';
    fam1.status = 'چالاکە';
    const kuMembers = [
      { name: 'ئەحمەد حەسەن ساڵح', relation: 'سەرۆکی خێزان', gender: 'نێر', status: 'چالاکە' },
      { name: 'فاتیمە عەلی محەمەد', relation: 'هاوسەر', gender: 'مێ', status: 'چالاکە' },
      { name: 'عومەر ئەحمەد حەسەن', relation: 'منداڵ', gender: 'نێر', status: 'چالاکە' },
      { name: 'زەینەب ئەحمەد حەسەن', relation: 'منداڵ', gender: 'مێ', status: 'چالاکە' },
      { name: 'یووسف ئەحمەد حەسەن', relation: 'منداڵ', gender: 'نێر', status: 'چالاکە' }
    ];
    fam1.members = fam1.members.map((m, idx) => ({
      ...m,
      ...(kuMembers[idx] || {}),
      residenceInfo: fam1.address
    }));
  }
  return base;
}

function getInitialFamilies(lang) {
  if (lang === 'en') return JSON.parse(JSON.stringify(MOCK_FAMILIES_EN));
  if (lang === 'ar') return getArabicFamilies();
  if (lang === 'ku') return getKurdishFamilies();
  return JSON.parse(JSON.stringify(MOCK_FAMILIES_ZH));
}

/**
 * 格式化当前时间为 YYYY-MM-DD HH:mm
 */
function getCurrentFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 预设基准选购订单 (供代理配送与现场核销初始演示)
const INITIAL_DEMO_ORDERS = [
  {
    orderId: 'RC-ORD-881920',
    id: 'RC-ORD-881920',
    ticketNo: 'RC-ORD-881920',
    cardNo: 'RC-10029381',
    headName: '艾哈迈德·哈桑·萨利赫',
    phone: '07701234567',
    memberCount: 5,
    agentId: 'FA-00128',
    agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    deliveryType: 'PICKUP',
    deliveryAddress: '巴格达市卡尔赫区曼苏尔街区14号',
    pickupCode: 'PK-991204',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '战略储备优质小麦面粉', qty: 45, unit: 'kg', unitPrice: 250, subtotal: 11250 },
      { itemCode: 'OIL-SUN-03', itemName: '一级精炼葵花籽食用油', qty: 5, unit: 'L', unitPrice: 1000, subtotal: 5000 }
    ],
    totalWeightKg: 50,
    selfPayAmount: 16250,
    subsidyAmount: 67750,
    amount: 16250,
    status: 'PAID', // 已支付待提货
    payStatus: 'PAID',
    createdAt: '2026-10-14 09:30',
    paidAt: '2026-10-14 09:32'
  },
  {
    orderId: 'RC-ORD-881014',
    id: 'RC-ORD-881014',
    ticketNo: 'RC-ORD-881014',
    cardNo: 'RC-10029382',
    headName: '亚辛·塔哈·马吉德',
    phone: '07709988771',
    memberCount: 4,
    agentId: 'FA-00128',
    agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: '巴格达市卡尔赫区海法街88号',
    pickupCode: 'PK-881014',
    items: [
      { itemCode: 'RICE-BAS-01', itemName: '优质巴斯马蒂配给长粒大米', qty: 12, unit: 'kg', unitPrice: 500, subtotal: 6000 },
      { itemCode: 'SUGAR-WHT-04', itemName: '纯正精制精炼白砂糖', qty: 8, unit: 'kg', unitPrice: 500, subtotal: 4000 }
    ],
    totalWeightKg: 20,
    selfPayAmount: 10000,
    subsidyAmount: 42000,
    amount: 10000,
    status: 'DELIVERED', // 已核销送达
    payStatus: 'PAID',
    createdAt: '2026-10-13 14:15',
    paidAt: '2026-10-13 14:18',
    deliveredAt: '2026-10-13 16:30'
  }
];

// =====================================================================
// 1. 审核公文共享池 (Tickets)
// =====================================================================

export function getSharedTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[SharedSession] Failed to parse tickets', e);
  }

  const initial = JSON.parse(JSON.stringify(MOCK_REVIEW_TICKETS));
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return initial;
}

export function addSharedTicket(ticketPayload) {
  const currentList = getSharedTickets();
  const idSuffix = String(Date.now()).slice(-4);
  const newTicket = {
    id: ticketPayload.id || `REV-${(ticketPayload.sourceCode || 'SUB').toUpperCase()}-${idSuffix}`,
    source: ticketPayload.source || '业务申办',
    categoryType: ticketPayload.categoryType || '在线公民自主申办',
    appType: ticketPayload.appType || ticketPayload.source || '配给申办业务公文',
    cardNo: ticketPayload.cardNo || 'RC-10029381',
    applicantName: ticketPayload.applicantName || '艾哈迈德·哈桑·萨利赫 (户主)',
    targetMemberName: ticketPayload.targetMemberName || '艾哈迈德·哈桑·萨利赫',
    province: ticketPayload.province || '巴格达省',
    center: ticketPayload.center || '卡尔赫第一粮食供应分部',
    reason: ticketPayload.reason || '公民通过移动 APP 提交法定业务申请，已附带身份证明材料。',
    status: '待分部初审',
    submittedAt: getCurrentFormattedTime(),
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: '待决',
    managerNotes: '',
    attachments: ticketPayload.attachments || [
      { name: '统一国家卡与法定户口登记证明_DOC-2026.pdf', type: 'required', verified: true }
    ],
    payload: ticketPayload.payload || {}
  };

  currentList.unshift(newTicket);

  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(currentList));
  } catch (e) {
    console.error('[SharedSession] Failed to save ticket', e);
  }

  // 跨标签页广播：新工单已提交！
  safeBroadcast('TICKET_SUBMITTED', newTicket);
  return newTicket;
}

function safeBroadcast(type, payload) {
  try {
    if (typeof broadcastTabMessage === 'function') {
      broadcastTabMessage(type, payload);
    } else if (typeof window !== 'undefined' && typeof window.broadcastTabMessage === 'function') {
      window.broadcastTabMessage(type, payload);
    }
  } catch (err) {
    console.warn('[SharedSession] safeBroadcast error:', err);
  }
}

export function updateSharedTicket(ticketId, updates) {
  const currentList = getSharedTickets();
  const index = currentList.findIndex((t) => t.id === ticketId);

  if (index !== -1) {
    currentList[index] = { ...currentList[index], ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(currentList));
    } catch (e) {
      console.error('[SharedSession] Failed to update ticket', e);
    }

    // 跨标签页广播：工单状态已变更！
    safeBroadcast('TICKET_UPDATED', currentList[index]);
    return currentList[index];
  }
  return null;
}

// =====================================================================
// 2. 配给订单共享池 (Orders)
// =====================================================================

export function getSharedOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const initial = JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS));
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return initial;
}

export function addSharedOrder(orderData) {
  const orders = getSharedOrders();
  const idSuffix = String(Date.now()).slice(-6);
  const newOrder = {
    orderId: orderData.orderId || `RC-ORD-${idSuffix}`,
    id: orderData.id || `RC-ORD-${idSuffix}`,
    ticketNo: orderData.ticketNo || `RC-ORD-${idSuffix}`,
    createdAt: getCurrentFormattedTime(),
    cardNo: orderData.cardNo || 'RC-10029381',
    headName: orderData.headName || '艾哈迈德·哈桑·萨利赫',
    phone: orderData.phone || '07701234567',
    memberCount: orderData.memberCount || 5,
    agentId: orderData.agentId || 'FA-00128',
    agentName: orderData.agentName || '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    deliveryType: orderData.deliveryType || 'PICKUP',
    deliveryAddress: orderData.deliveryAddress || '巴格达市卡尔赫区曼苏尔街区14号',
    pickupCode: orderData.pickupCode || `PK-${idSuffix}`,
    items: orderData.items || [],
    amount: orderData.amount || orderData.selfPayAmount || 0,
    selfPayAmount: orderData.selfPayAmount || orderData.amount || 0,
    subsidyAmount: orderData.subsidyAmount || 0,
    status: 'PAID', // 已支付待提货
    payStatus: 'PAID',
    ...orderData
  };

  orders.unshift(newOrder);

  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    // ignore
  }

  // 立即跨标签页广播：订单已生成！
  safeBroadcast('ORDER_PURCHASED', newOrder);
  return newOrder;
}

export function updateSharedOrder(orderId, updates) {
  const orders = getSharedOrders();
  const index = orders.findIndex((o) => o.orderId === orderId || o.id === orderId || o.pickupCode === orderId);

  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      // ignore
    }

    // 跨标签页广播：订单核销/状态更新！
    safeBroadcast('ORDER_UPDATED', orders[index]);
    if (updates.status === 'DELIVERED') {
      safeBroadcast('ORDER_VERIFIED', orders[index]);
    }
    return orders[index];
  }
  return null;
}

// =====================================================================
// 3. 家庭配给卡档案共享池 (Families)
// =====================================================================

export function getSharedFamilies(langOverride) {
  const lang = langOverride || getActiveLanguage();
  const storageKey = `${STORAGE_KEY_FAMILIES}_${lang}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  const initial = getInitialFamilies(lang);
  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return initial;
}

export function getSharedFamily(cardNo, langOverride) {
  const list = getSharedFamilies(langOverride);
  return list.find((f) => f.rationCardNo === cardNo) || list[0];
}

export function updateSharedFamily(cardNo, updater, langOverride) {
  const currentLang = langOverride || getActiveLanguage();
  const langs = ['zh', 'en', 'ar', 'ku'];
  let currentResult = null;

  langs.forEach((lang) => {
    const storageKey = `${STORAGE_KEY_FAMILIES}_${lang}`;
    const list = getSharedFamilies(lang);
    const index = list.findIndex((f) => f.rationCardNo === cardNo);

    if (index !== -1) {
      if (typeof updater === 'function') {
        list[index] = updater(list[index]);
      } else {
        list[index] = { ...list[index], ...updater };
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch (e) {
        // ignore
      }

      if (lang === currentLang) {
        currentResult = list[index];
      }
    }
  });

  safeBroadcast('FAMILY_UPDATED', currentResult || { cardNo });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rcm-family-updated', { detail: { cardNo } }));
  }

  return currentResult;
}

export function addSharedFamily(newFamily, langOverride) {
  const lang = langOverride || getActiveLanguage();
  const storageKey = `${STORAGE_KEY_FAMILIES}_${lang}`;
  const list = getSharedFamilies(lang);
  list.unshift(newFamily);

  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch (e) {
    // ignore
  }

  safeBroadcast('FAMILY_ADDED', newFamily);
  return newFamily;
}
