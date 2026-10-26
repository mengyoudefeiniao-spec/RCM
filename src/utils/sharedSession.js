/**
 * 多标签页共享持久化会话与业务数据缓存中心
 * 管理公文申请(Tickets)、选购订单(Orders)、家庭配给档案(Families)在多标签页间的持久化与实时同步
 */
import { broadcastTabMessage } from './crossTabBus.js';
import { MOCK_REVIEW_TICKETS as MOCK_REVIEW_TICKETS_ZH } from '../mock/data/reviewData.js';
import { MOCK_REVIEW_TICKETS as MOCK_REVIEW_TICKETS_EN } from '../mock/data/en/reviewData.js';
import { MOCK_FAMILIES as MOCK_FAMILIES_ZH } from '../mock/data/citizenData.js';
import { MOCK_FAMILIES as MOCK_FAMILIES_EN } from '../mock/data/en/citizenData.js';
import { createDemoFamilyNameLocalizer, familyLanguage, mergeFamilyUpdate } from './familyMemberNames.js';

const STORAGE_KEY_TICKETS = 'rcm_shared_tickets';
const LEGACY_STORAGE_KEY_TICKETS = 'rcm_shared_tickets';
const STORAGE_KEY_ORDERS = 'rcm_shared_orders';
const STORAGE_KEY_FAMILIES = 'rcm_shared_families';

function getActiveLanguage() {
  if (typeof localStorage !== 'undefined') {
    const language = localStorage.getItem('rcm_language') || 'zh';
    return language === 'ckb' ? 'ku' : language;
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
      { name: 'أحمد حسن صالح', relation: 'رب الأسرة', gender: 'ذكر', status: 'نشط' },
      { name: 'فاطمة علي محمد', relation: 'الزوجة', gender: 'أنثى', status: 'نشط' },
      { name: 'عمر أحمد حسن', relation: 'ابن', gender: 'ذكر', status: 'نشط' },
      { name: 'زينب أحمد حسن', relation: 'ابنة', gender: 'أنثى', status: 'نشط' },
      { name: 'يوسف أحمد حسن', relation: 'ابن', gender: 'ذكر', status: 'نشط' }
    ];
    fam1.members = fam1.members.map((m, idx) => ({
      ...m,
      ...(arMembers[idx] || {}),
      status: m.freezeReason || m.status === '冻结' ? 'مجمد' : (arMembers[idx]?.status || m.status),
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
      status: m.freezeReason || m.status === '冻结' ? 'بەستراوە' : (kuMembers[idx]?.status || m.status),
      residenceInfo: fam1.address
    }));
  }
  return base;
}

export function getInitialFamilies(lang) {
  lang = familyLanguage(lang);
  if (lang === 'en') return JSON.parse(JSON.stringify(MOCK_FAMILIES_EN));
  if (lang === 'ar') return getArabicFamilies();
  if (lang === 'ku') return getKurdishFamilies();
  return JSON.parse(JSON.stringify(MOCK_FAMILIES_ZH));
}

const FAMILY_LANGUAGES = ['zh', 'en', 'ar', 'ku'];
export const localizeDemoFamilyNames = createDemoFamilyNameLocalizer(
  Object.fromEntries(FAMILY_LANGUAGES.map(lang => [lang, getInitialFamilies(lang)]))
);

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

// 预设基准选购订单 (供代理配送与现场核销初始演示) —— 中文版
const INITIAL_DEMO_ORDERS_ZH = [
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

// 预设基准选购订单 —— 英文版
const INITIAL_DEMO_ORDERS_EN = [
  {
    orderId: 'RC-ORD-881920',
    id: 'RC-ORD-881920',
    ticketNo: 'RC-ORD-881920',
    cardNo: 'RC-10029381',
    headName: 'Ahmed Hassan Saleh',
    phone: '07701234567',
    memberCount: 5,
    agentId: 'FA-00128',
    agentName: 'Baghdad Karkh 1st Distribution Station (Mohammed Jabbar)',
    deliveryType: 'PICKUP',
    deliveryAddress: 'No.14 Mansour Block, Al-Karkh District, Baghdad',
    pickupCode: 'PK-991204',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: 'Strategic Reserve Premium Wheat Flour', qty: 45, unit: 'kg', unitPrice: 250, subtotal: 11250 },
      { itemCode: 'OIL-SUN-03', itemName: 'Grade-1 Refined Sunflower Edible Oil', qty: 5, unit: 'L', unitPrice: 1000, subtotal: 5000 }
    ],
    totalWeightKg: 50,
    selfPayAmount: 16250,
    subsidyAmount: 67750,
    amount: 16250,
    status: 'PAID',
    payStatus: 'PAID',
    createdAt: '2026-10-14 09:30',
    paidAt: '2026-10-14 09:32'
  },
  {
    orderId: 'RC-ORD-881014',
    id: 'RC-ORD-881014',
    ticketNo: 'RC-ORD-881014',
    cardNo: 'RC-10029382',
    headName: 'Yassin Taha Majid',
    phone: '07709988771',
    memberCount: 4,
    agentId: 'FA-00128',
    agentName: 'Baghdad Karkh 1st Distribution Station (Mohammed Jabbar)',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: 'No.88 Haifa St, Al-Karkh District, Baghdad',
    pickupCode: 'PK-881014',
    items: [
      { itemCode: 'RICE-BAS-01', itemName: 'Premium Basmati Ration Long-Grain Rice', qty: 12, unit: 'kg', unitPrice: 500, subtotal: 6000 },
      { itemCode: 'SUGAR-WHT-04', itemName: 'Pure Refined White Sugar', qty: 8, unit: 'kg', unitPrice: 500, subtotal: 4000 }
    ],
    totalWeightKg: 20,
    selfPayAmount: 10000,
    subsidyAmount: 42000,
    amount: 10000,
    status: 'DELIVERED',
    payStatus: 'PAID',
    createdAt: '2026-10-13 14:15',
    paidAt: '2026-10-13 14:18',
    deliveredAt: '2026-10-13 16:30'
  }
];

export function getInitialOrders(lang) {
  if (lang === 'en') return JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS_EN));
  return JSON.parse(JSON.stringify(INITIAL_DEMO_ORDERS_ZH));
}

// =====================================================================
// 1. 审核公文共享池 (Tickets) —— 与 Families 保持一致：按语言分 key 持久化
// =====================================================================

function getInitialTickets(lang) {
  if (lang === 'en') return JSON.parse(JSON.stringify(MOCK_REVIEW_TICKETS_EN));
  return JSON.parse(JSON.stringify(MOCK_REVIEW_TICKETS_ZH));
}

export function getSharedTickets(langOverride) {
  const lang = langOverride || getActiveLanguage();
  const storageKey = `${STORAGE_KEY_TICKETS}_${lang}`;

  // 一次性迁移清理历史不分语言的旧缓存
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem(LEGACY_STORAGE_KEY_TICKETS)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY_TICKETS);
    }
  } catch (e) {
    // ignore
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('[SharedSession] Failed to parse tickets', e);
  }

  const initial = getInitialTickets(lang);
  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return initial;
}

export function addSharedTicket(ticketPayload) {
  const lang = getActiveLanguage();
  const isEn = lang === 'en';
  const currentList = getSharedTickets(lang);
  const storageKey = `${STORAGE_KEY_TICKETS}_${lang}`;
  const idSuffix = String(Date.now()).slice(-4);
  const newTicket = {
    id: ticketPayload.id || `REV-${(ticketPayload.sourceCode || 'SUB').toUpperCase()}-${idSuffix}`,
    sourceCode: ticketPayload.sourceCode || '',
    source: ticketPayload.source || (isEn ? 'Online Application' : '业务申办'),
    categoryType: ticketPayload.categoryType || (isEn ? 'Online Citizen Self-Service Application' : '在线公民自主申办'),
    appType: ticketPayload.appType || ticketPayload.source || (isEn ? 'Ration Service Application' : '配给申办业务公文'),
    cardNo: ticketPayload.cardNo || 'RC-10029381',
    applicantName: ticketPayload.applicantName || (isEn ? 'Ahmed Hassan Saleh (Head)' : '艾哈迈德·哈桑·萨利赫 (户主)'),
    targetMemberName: ticketPayload.targetMemberName || (isEn ? 'Ahmed Hassan Saleh' : '艾哈迈德·哈桑·萨利赫'),
    province: ticketPayload.province || (isEn ? 'Baghdad Governorate' : '巴格达省'),
    center: ticketPayload.center || (isEn ? 'Karkh 1st Food Supply Branch' : '卡尔赫第一粮食供应分部'),
    reason: ticketPayload.reason || (isEn ? 'Citizen submitted a statutory application via mobile APP with identity documents attached.' : '公民通过移动 APP 提交法定业务申请，已附带身份证明材料。'),
    status: ticketPayload.applicationStatus === 'approved'
      ? (isEn ? 'Approved' : '已审批通过')
      : ticketPayload.status || (isEn ? 'Pending Staff Review' : '待分部初审'),
    reviewMode: ticketPayload.reviewMode || (ticketPayload.applicationStatus === 'approved' ? 'automatic' : 'manual'),
    submittedAt: getCurrentFormattedTime(),
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: ticketPayload.applicationStatus === 'approved' ? (isEn ? 'Approved' : '已通过') : (isEn ? 'Pending' : '待决'),
    managerNotes: ticketPayload.applicationResult || '',
    attachments: ticketPayload.attachments || [
      { name: isEn ? 'Unified_National_Card_Legal_Registry_Certificate_DOC-2026.pdf' : '统一国家卡与法定户口登记证明_DOC-2026.pdf', type: 'required', verified: true }
    ],
    payload: ticketPayload.payload || {}
  };

  const existingIndex = currentList.findIndex((ticket) => ticket.id === newTicket.id);
  if (existingIndex >= 0) {
    currentList.splice(existingIndex, 1, { ...currentList[existingIndex], ...newTicket });
    currentList.unshift(currentList.splice(existingIndex, 1)[0]);
  } else {
    currentList.unshift(newTicket);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(currentList));
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
  // 与 Families 一致：同步更新所有语言副本，保证跨语言状态一致
  const langs = ['zh', 'en', 'ar', 'ku'];
  let currentResult = null;
  const currentLang = getActiveLanguage();

  langs.forEach((lang) => {
    const storageKey = `${STORAGE_KEY_TICKETS}_${lang}`;
    const currentList = getSharedTickets(lang);
    const index = currentList.findIndex((t) => t.id === ticketId);

    if (index !== -1) {
      currentList[index] = { ...currentList[index], ...updates };
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentList));
      } catch (e) {
        console.error('[SharedSession] Failed to update ticket', e);
      }
      if (lang === currentLang) {
        currentResult = currentList[index];
      }
    }
  });

  // 跨标签页广播：工单状态已变更！
  safeBroadcast('TICKET_UPDATED', currentResult || { id: ticketId, ...updates });
  return currentResult;
}

// =====================================================================
// 2. 配给订单共享池 (Orders) —— 与 Tickets/Families 保持一致：按语言分 key 持久化
// =====================================================================

export function getSharedOrders(langOverride) {
  const lang = langOverride || getActiveLanguage();
  const storageKey = `${STORAGE_KEY_ORDERS}_${lang}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const orders = JSON.parse(raw);
      return Array.isArray(orders) ? orders : [];
    }
  } catch (e) {
    console.warn('[SharedSession] Failed to parse orders', e);
  }

  const initial = getInitialOrders(lang);
  try {
    localStorage.setItem(storageKey, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return initial;
}

const ORDER_LANGUAGES = ['zh', 'en', 'ar', 'ku', 'ckb'];
const orderReferences = order => [...new Set([order?.orderId, order?.id, order?.ticketNo, order?.pickupCode]
  .filter(value => value !== undefined && value !== null && String(value).trim())
  .map(value => String(value).trim()))];

function storedOrderPools(preferred) {
  const languages = [...new Set([preferred, ...ORDER_LANGUAGES])];
  const keys = [...languages.map(lang => `${STORAGE_KEY_ORDERS}_${lang}`), STORAGE_KEY_ORDERS];
  const pools = [];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (raw === null) continue;
    try {
      const records = JSON.parse(raw);
      pools.push({ key, records: Array.isArray(records) ? records : [] });
    } catch {
      // A broken/empty business cache must not resurrect demo orders.
      pools.push({ key, records: [] });
    }
  }
  return pools;
}

function orderRevision(order) {
  return Math.max(0, ...[order.updatedAt, order.deliveredAt, order.cancelledAt, order.dispatchInfo?.dispatchedAt, order.paidAt, order.createdAt]
    .map(value => Date.parse(String(value || '').replace(' ', 'T'))).filter(Number.isFinite));
}

const ORDER_STATUS_RANK = { PAID: 1, PENDING_DELIVERY: 1, PENDING_PICKUP: 1, DISPATCHED: 2, READY_FOR_PICKUP: 2, CANCELLED: 3, DELIVERED: 4 };
function mergeOrderCopies(current, incoming) {
  if (!current) return incoming;
  const difference = orderRevision(incoming) - orderRevision(current);
  const incomingIsNewer = difference > 0 || (difference === 0
    && (ORDER_STATUS_RANK[incoming.status] || 0) > (ORDER_STATUS_RANK[current.status] || 0));
  return incomingIsNewer ? { ...current, ...incoming } : { ...incoming, ...current };
}

// Languages are presentation preferences, not separate sets of business orders.
// Merge only persisted pools, retaining explicit empty arrays and avoiding seed
// initialization of missing language copies. Prefer the latest business state.
export function getSharedOrderPool(langOverride) {
  const language = langOverride || getActiveLanguage();
  const preferred = language === 'ckb' ? 'ku' : language;
  let pools = storedOrderPools(preferred);
  if (!pools.length) pools = [{ records: getSharedOrders(preferred) }];
  const groups = new Set();
  const byReference = new Map();
  for (const { records } of pools) {
    for (const order of records) {
      const references = orderReferences(order);
      if (!references.length || !order || typeof order !== 'object') continue;
      const matches = [...new Set(references.map(reference => byReference.get(reference)).filter(Boolean))];
      const group = matches[0] || { record: null, references: new Set() };
      for (const match of matches.slice(1)) {
        group.record = mergeOrderCopies(group.record, match.record);
        match.references.forEach(reference => group.references.add(reference));
        groups.delete(match);
      }
      group.record = mergeOrderCopies(group.record, { ...order, orderId: String(order.orderId || group.record?.orderId || references[0]).trim() });
      references.forEach(reference => group.references.add(reference));
      group.references.forEach(reference => byReference.set(reference, group));
      groups.add(group);
    }
  }
  return [...groups].map(group => group.record);
}

export function findSharedOrder(reference, langOverride) {
  const id = String(reference ?? '').trim();
  return id ? getSharedOrderPool(langOverride).find(order => orderReferences(order).includes(id)) || null : null;
}

export function addSharedOrder(orderData, langOverride) {
  const lang = langOverride || getActiveLanguage();
  const isEn = lang === 'en';
  const orders = getSharedOrders(lang);
  const storageKey = `${STORAGE_KEY_ORDERS}_${lang}`;
  const idSuffix = String(Date.now()).slice(-6);
  const newOrder = {
    orderId: orderData.orderId || `RC-ORD-${idSuffix}`,
    id: orderData.id || `RC-ORD-${idSuffix}`,
    ticketNo: orderData.ticketNo || `RC-ORD-${idSuffix}`,
    createdAt: getCurrentFormattedTime(),
    cardNo: orderData.cardNo || 'RC-10029381',
    headName: orderData.headName || (isEn ? 'Ahmed Hassan Saleh' : '艾哈迈德·哈桑·萨利赫'),
    phone: orderData.phone || '07701234567',
    memberCount: orderData.memberCount || 5,
    agentId: orderData.agentId || 'FA-00128',
    agentName: orderData.agentName || (isEn ? 'Baghdad Karkh 1st Distribution Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)'),
    deliveryType: orderData.deliveryType || 'PICKUP',
    deliveryAddress: orderData.deliveryAddress || (isEn ? 'No.14 Mansour Block, Al-Karkh District, Baghdad' : '巴格达市卡尔赫区曼苏尔街区14号'),
    pickupCode: orderData.pickupCode || `PK-${idSuffix}`,
    items: orderData.items || [],
    amount: orderData.amount || orderData.selfPayAmount || 0,
    selfPayAmount: orderData.selfPayAmount || orderData.amount || 0,
    subsidyAmount: orderData.subsidyAmount || 0,
    status: 'PAID', // 已支付待提货
    payStatus: 'PAID',
    ...orderData
  };

  // 幂等去重：同一订单 (orderId/ticketNo/pickupCode 任一命中) 只保留一份，
  // 已存在则原位覆盖更新，避免调用方与 mock adapter 双写产生幽灵订单
  const dupIdx = orders.findIndex((o) => !o ? false :
    (newOrder.orderId && (o.orderId === newOrder.orderId || o.id === newOrder.orderId)) ||
    (newOrder.ticketNo && o.ticketNo === newOrder.ticketNo) ||
    (newOrder.pickupCode && o.pickupCode === newOrder.pickupCode));
  if (dupIdx >= 0) {
    orders.splice(dupIdx, 1, newOrder);
  } else {
    orders.unshift(newOrder);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(orders));
  } catch (e) {
    // ignore
  }

  // 立即跨标签页广播：订单已生成！
  safeBroadcast('ORDER_PURCHASED', newOrder);
  return newOrder;
}

export function updateSharedOrder(orderId, updates) {
  // Update every existing copy, including Arabic/Sorani and legacy records.
  // Do not create another language's seed pool while updating an order.
  let currentResult = null;
  const currentLang = getActiveLanguage();
  const reference = String(orderId ?? '').trim();
  if (!reference) return null;
  const timestamp = new Date().toISOString();
  for (const { key, records } of storedOrderPools(currentLang)) {
    let changed = false;
    for (let index = 0; index < records.length; index += 1) {
      if (!orderReferences(records[index]).includes(reference)) continue;
      records[index] = { ...records[index], ...updates, updatedAt: timestamp };
      changed = true;
      if (!currentResult || key === `${STORAGE_KEY_ORDERS}_${currentLang}`) currentResult = records[index];
    }
    if (!changed) continue;
    try {
      localStorage.setItem(key, JSON.stringify(records));
    } catch (error) {
      console.error('[SharedSession] Failed to update order', error);
    }
  }
  if (!currentResult) return null;

  // 跨标签页广播：订单核销/状态更新！
  safeBroadcast('ORDER_UPDATED', currentResult);
  if (updates.status === 'DELIVERED') {
    safeBroadcast('ORDER_VERIFIED', currentResult);
  }
  return currentResult;
}

// =====================================================================
// 3. 家庭配给卡档案共享池 (Families)
// =====================================================================

export function getSharedFamilies(langOverride) {
  const lang = familyLanguage(langOverride || getActiveLanguage());
  const storageKey = `${STORAGE_KEY_FAMILIES}_${lang}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      let parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // 自动净化历史脏缓存：剔除已被废弃的冗余家庭 RC-10034592
        const cleaned = parsed.filter((f) => f && f.rationCardNo !== 'RC-10034592');
        let localizedFreezeStatusChanged = false;
        if (lang === 'ar' || lang === 'ku') {
          const localizedStatuses = lang === 'ar'
            ? { active: 'نشط', frozen: 'مجمد', legacyActive: 'ساري المفعول' }
            : { active: 'چالاکە', frozen: 'بەستراوە' };
          cleaned.forEach((family) => {
            (family.members || []).forEach((member) => {
              if (lang === 'ar' && member.status === localizedStatuses.legacyActive) {
                member.status = localizedStatuses.active;
                localizedFreezeStatusChanged = true;
              }
              if (member.freezeReason && member.status === localizedStatuses.active) {
                member.status = localizedStatuses.frozen;
                localizedFreezeStatusChanged = true;
              }
            });
          });
        }
        const localized = cleaned.map(family => localizeDemoFamilyNames(family, lang));
        if (cleaned.length !== parsed.length || localizedFreezeStatusChanged || localized.some((family, index) => family !== cleaned[index])) {
          localStorage.setItem(storageKey, JSON.stringify(localized));
        }
        if (localized.length > 0) return localized;
      }
    }
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
  const currentLang = familyLanguage(langOverride || getActiveLanguage());
  const source = getSharedFamily(cardNo, currentLang);
  let currentResult = null;

  FAMILY_LANGUAGES.forEach((lang) => {
    const storageKey = `${STORAGE_KEY_FAMILIES}_${lang}`;
    const list = getSharedFamilies(lang);
    const index = list.findIndex((f) => f.rationCardNo === cardNo);

    if (index !== -1) {
      if (typeof updater === 'function') {
        list[index] = updater(list[index], lang);
      } else {
        list[index] = mergeFamilyUpdate(list[index], updater, source);
      }
      list[index] = JSON.parse(JSON.stringify(localizeDemoFamilyNames(list[index], lang)));

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
  const lang = familyLanguage(langOverride || getActiveLanguage());
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
