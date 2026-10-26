// 中文测试数据源
import { i18n } from '../locales/index.js';
import { transferProvinceKey } from '../utils/transferLocationLabels.js';
import {
  readBusinessRulesDocument,
  writeBusinessRulesDocument,
  buildNextBusinessRulesVersion,
  validateBusinessRules,
  getHouseholdThresholds,
  getArticle140Centers,
  getBusinessRulesVersion,
  quotaPerPerson,
  autoAcceptRuleFor,
  getApprovalLevels,
  ageFromBirthDate
} from '../utils/businessRules.js';
import { saveMockMaterial } from '../utils/mockMaterialFiles.js';
import { saveMockMessageAttachment, getMockMessageAttachment } from '../utils/mockMessageAttachments.js';
import { PERMISSION_CATALOG, REVIEW_SCOPE_REGIONS, REVIEW_TYPE_CODES, WAREHOUSE_PERMISSION_CODES } from '../utils/reviewPermission.js';
import { isMessageInReviewScope, isMessageInSendScope, resolveMessageAccess } from '../utils/messagePermissions.js';
import { createAdminCredential, publicAdminAccount } from '../utils/adminCredentials.js';
import { readSharedComplaints, writeSharedComplaint, presentComplaint, complaintStatusCode, complaintOwnerId, ownsComplaint } from '../utils/complaints.js';
import { readProcurementOrders, writeProcurementOrder, presentProcurementOrder, normalizeProcurementItems, readAgentStockBase, writeAgentStockBase, projectProcurementStocks } from '../utils/agentProcurement.js';
import { DEMO_CENTER_WAREHOUSE_LOCATIONS } from './data/centerWarehouseLocations.js';
import { analyzeCustomerMessage } from '../utils/customerMessageAnalysis.js';
import chatComplaintMessages from '../locales/chatComplaint.js';
import { ownsCustomerOrder, customerOrderSnapshot, customerOrderAnswer, validComplaintPhoto } from '../utils/customerOrders.js';
import * as zhAuth from './data/authData.js';
import * as zhCitizen from './data/citizenData.js';
import * as zhReview from './data/reviewData.js';
import * as zhWarehouse from './data/warehouseData.js';
import * as zhAgent from './data/agentData.js';
import * as zhDashboard from './data/dashboardData.js';
import * as zhAdmin from './data/adminData.js';
import * as zhTransfer from './data/transferData.js';
import * as zhMemberTransfer from './data/memberTransferData.js';
import * as zhKB from './data/knowledgeBaseData.js';
import * as zhComplaint from './data/complaintData.js';

// 英文测试数据源
import * as enAuth from './data/en/authData.js';
import * as enCitizen from './data/en/citizenData.js';
import * as enReview from './data/en/reviewData.js';
import * as enWarehouse from './data/en/warehouseData.js';
import * as enAgent from './data/en/agentData.js';
import * as enDashboard from './data/en/dashboardData.js';
import * as enAdmin from './data/en/adminData.js';
import * as enTransfer from './data/en/transferData.js';
import * as enMemberTransfer from './data/en/memberTransferData.js';
import * as enKB from './data/en/knowledgeBaseData.js';
import * as enComplaint from './data/en/complaintData.js';
import { MOCK_AGENT_HIERARCHY_TREE, MOCK_AGENT_FAMILIES_MAP, MESSAGE_RECIPIENT_TREE_STORAGE_KEY } from './data/agentHierarchyData.js';

// 智能客服多语言数据源与匹配工具
import {
  MULTI_LANG_SOURCES,
  MULTI_LANG_TOPICS,
  MULTI_LANG_AGENTS,
  MULTI_LANG_HUMAN_REPLIES,
  matchTopic,
  getTranslatedSource
} from './data/chatMultiLangData.js';

// 多标签页跨端共享数据中心
import {
  getSharedTickets,
  addSharedTicket,
  updateSharedTicket,
  getSharedOrderPool,
  findSharedOrder,
  addSharedOrder,
  updateSharedOrder,
  getSharedFamilies,
  getSharedFamily,
  updateSharedFamily
} from '../utils/sharedSession.js';

// 跨标签页高可靠事件总线
import { broadcastTabMessage } from '../utils/crossTabBus.js';

function mergeRecipientNodes(defaultNodes = [], savedNodes = []) {
  const savedById = new Map(savedNodes.filter((node) => node?.id).map((node) => [String(node.id), node]));
  const merged = defaultNodes.map((node) => {
    const saved = savedById.get(String(node.id));
    if (!saved) return node;
    savedById.delete(String(node.id));
    return { ...node, ...saved, children: mergeRecipientNodes(node.children || [], saved.children || []) };
  });
  return [...merged, ...savedById.values()];
}

function getMessageRecipientTreeData() {
  if (typeof window === 'undefined') return MOCK_AGENT_HIERARCHY_TREE;
  try {
    const saved = JSON.parse(window.localStorage.getItem(MESSAGE_RECIPIENT_TREE_STORAGE_KEY) || 'null');
    return Array.isArray(saved) ? mergeRecipientNodes(MOCK_AGENT_HIERARCHY_TREE, saved) : MOCK_AGENT_HIERARCHY_TREE;
  } catch {
    return MOCK_AGENT_HIERARCHY_TREE;
  }
}

// 预置公民配给购买演示订单
const INITIAL_CITIZEN_PURCHASE_ORDERS_ZH = [
  {
    orderId: 'PO-20261013-1001',
    ticketNo: 'PO-20261013-1001',
    cardNo: 'RC-10029381',
    headName: '艾哈迈德·哈桑·萨利赫',
    phone: '+964 780 123 4567',
    memberCount: 5,
    agentId: 'FA-00128',
    agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    centerId: '101',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: '巴格达省卡尔赫区海法街88号 3号楼201',
    notes: '家中老人行动不便，送达前请电话联系',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '战略储备优质小麦面粉', qty: 45, unit: 'kg', unitPrice: 250, subtotal: 11250 },
      { itemCode: 'OIL-SUN-03', itemName: '一级精炼葵花籽食用油', qty: 5, unit: 'L', unitPrice: 1000, subtotal: 5000 }
    ],
    totalWeightKg: 50,
    selfPayAmount: 16250,
    subsidyAmount: 67750,
    payStatus: 'PAID',
    status: 'PENDING_DELIVERY',
    pickupCode: 'AGT101-20261013-1012-7882',
    createdAt: '2026-10-13 14:20:00'
  },
  {
    orderId: 'PO-20261013-1002',
    ticketNo: 'PO-20261013-1002',
    cardNo: 'RC-10029382',
    headName: '法蒂玛·扎赫拉·侯赛因',
    phone: '+964 780 882 1109',
    memberCount: 4,
    agentId: 'FA-00128',
    agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    centerId: '101',
    deliveryType: 'PICKUP',
    deliveryAddress: '巴格达卡尔赫第一代销站（自提）',
    notes: '预计下午下班后来取',
    items: [
      { itemCode: 'RICE-BAS-01', itemName: '一级进口长粒大米', qty: 12, unit: 'kg', unitPrice: 500, subtotal: 6000 },
      { itemCode: 'SUGAR-WHT-04', itemName: '纯正精制战略白砂糖', qty: 8, unit: 'kg', unitPrice: 500, subtotal: 4000 }
    ],
    totalWeightKg: 20,
    selfPayAmount: 10000,
    subsidyAmount: 42000,
    payStatus: 'PAID',
    status: 'PENDING_PICKUP',
    pickupCode: 'AGT101-20261013-1012-9021',
    createdAt: '2026-10-13 15:05:00'
  },
  {
    orderId: 'PO-20261013-1003',
    ticketNo: 'PO-20261013-1003',
    cardNo: 'RC-10029383',
    headName: '穆斯塔法·卡迪米',
    phone: '+964 771 556 9901',
    memberCount: 6,
    agentId: 'FA-00128',
    agentName: '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)',
    centerId: '101',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: '巴格达省卡尔赫区曼苏尔商业街12号 402',
    notes: '请放置于门口保供安全柜',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '战略储备优质小麦面粉', qty: 54, unit: 'kg', unitPrice: 250, subtotal: 13500 },
      { itemCode: 'RICE-BAS-01', itemName: '一级进口长粒大米', qty: 18, unit: 'kg', unitPrice: 500, subtotal: 9000 }
    ],
    totalWeightKg: 72,
    selfPayAmount: 22500,
    subsidyAmount: 93500,
    payStatus: 'PAID',
    status: 'DISPATCHED',
    pickupCode: 'AGT101-20261013-1012-3114',
    dispatchInfo: {
      deliveryPerson: '哈希姆·阿里 (保供急送专员)',
      phone: '+964 780 999 8811',
      vehicleNo: 'BG-78219 (厢式冷链货车)',
      estimatedTime: '30分钟内送达',
      dispatchedAt: '2026-10-13 15:45:00'
    },
    createdAt: '2026-10-13 13:10:00'
  }
];

const INITIAL_CITIZEN_PURCHASE_ORDERS_EN = [
  {
    orderId: 'PO-20261013-1001',
    ticketNo: 'PO-20261013-1001',
    cardNo: 'RC-10029381',
    headName: 'Ahmed Hassan Saleh',
    phone: '+964 780 123 4567',
    memberCount: 5,
    agentId: 'FA-00128',
    agentName: 'Baghdad Karkh 1st Station (Mohammed Jabbar)',
    centerId: '101',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: 'Building 3, Apt 201, Haifa St 88, Karkh, Baghdad',
    notes: 'Please call before arrival',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: 'Strategic Reserve Wheat Flour', qty: 45, unit: 'kg', unitPrice: 250, subtotal: 11250 },
      { itemCode: 'OIL-SUN-03', itemName: 'Refined Sunflower Cooking Oil', qty: 5, unit: 'L', unitPrice: 1000, subtotal: 5000 }
    ],
    totalWeightKg: 50,
    selfPayAmount: 16250,
    subsidyAmount: 67750,
    payStatus: 'PAID',
    status: 'PENDING_DELIVERY',
    pickupCode: 'AGT101-20261013-1012-7882',
    createdAt: '2026-10-13 14:20:00'
  },
  {
    orderId: 'PO-20261013-1002',
    ticketNo: 'PO-20261013-1002',
    cardNo: 'RC-10029382',
    headName: 'Fatima Al-Zahra',
    phone: '+964 780 882 1109',
    memberCount: 4,
    agentId: 'FA-00128',
    agentName: 'Baghdad Karkh 1st Station (Mohammed Jabbar)',
    centerId: '101',
    deliveryType: 'PICKUP',
    deliveryAddress: 'Baghdad Karkh 1st Station (Self-Pickup)',
    notes: 'Will pick up in the afternoon',
    items: [
      { itemCode: 'RICE-BAS-01', itemName: 'Grade-1 Long Grain Rice', qty: 12, unit: 'kg', unitPrice: 500, subtotal: 6000 },
      { itemCode: 'SUGAR-WHT-04', itemName: 'Refined White Sugar', qty: 8, unit: 'kg', unitPrice: 500, subtotal: 4000 }
    ],
    totalWeightKg: 20,
    selfPayAmount: 10000,
    subsidyAmount: 42000,
    payStatus: 'PAID',
    status: 'PENDING_PICKUP',
    pickupCode: 'AGT101-20261013-1012-9021',
    createdAt: '2026-10-13 15:05:00'
  },
  {
    orderId: 'PO-20261013-1003',
    ticketNo: 'PO-20261013-1003',
    cardNo: 'RC-10029383',
    headName: 'Mustafa Al-Kadhimi',
    phone: '+964 771 556 9901',
    memberCount: 6,
    agentId: 'FA-00128',
    agentName: 'Baghdad Karkh 1st Station (Mohammed Jabbar)',
    centerId: '101',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: 'Mansour St 12, Apt 402, Karkh, Baghdad',
    notes: 'Leave at front door if unavailable',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: 'Strategic Reserve Wheat Flour', qty: 54, unit: 'kg', unitPrice: 250, subtotal: 13500 },
      { itemCode: 'RICE-BAS-01', itemName: 'Grade-1 Long Grain Rice', qty: 18, unit: 'kg', unitPrice: 500, subtotal: 9000 }
    ],
    totalWeightKg: 72,
    selfPayAmount: 22500,
    subsidyAmount: 93500,
    payStatus: 'PAID',
    status: 'DISPATCHED',
    pickupCode: 'AGT101-20261013-1012-3114',
    dispatchInfo: {
      deliveryPerson: 'Hashim Ali (Delivery Courier)',
      phone: '+964 780 999 8811',
      vehicleNo: 'BG-78219 (Van)',
      estimatedTime: 'Within 30 mins',
      dispatchedAt: '2026-10-13 15:45:00'
    },
    createdAt: '2026-10-13 13:10:00'
  }
];

// 多语言内存持久化存储池
const myStorageKey = (role, part) => `rcm_my_${role}_${part}_v1`;

function readMyData(role, part, fallback) {
  try {
    const stored = localStorage.getItem(myStorageKey(role, part));
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function writeMyData(role, part, value) {
  localStorage.setItem(myStorageKey(role, part), JSON.stringify(value));
  return value;
}

async function passwordDigest(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

const MY_NOTIFICATION_SEEDS = {
  citizen: [
    { id: 'cit-review', type: 'review', section: 'notifications', path: '/citizen' },
    { id: 'cit-material-agent', type: 'material', section: 'notifications', flow: 'transfer-agent', path: '/citizen/transfer-agent' },
    { id: 'cit-material-member', type: 'material', section: 'notifications', flow: 'member-transfer', path: '/citizen/member-transfer' },
    { id: 'cit-material-split', type: 'material', section: 'notifications', flow: 'split-household', path: '/citizen/split-household' },
    { id: 'cit-material-head', type: 'material', section: 'notifications', flow: 'change-head', path: '/citizen/change-head' },
    { id: 'cit-material-unfreeze', type: 'material', section: 'notifications', flow: 'unfreeze', path: '/citizen/unfreeze' },
    { id: 'cit-ration', type: 'ration', section: 'notifications', path: '/warehouse' },
    { id: 'cit-system', type: 'system', section: 'notifications', path: '/my' }
  ],
  agent: [
    { id: 'agt-review', type: 'review', section: 'notifications', path: '/agent' },
    { id: 'agt-stock', type: 'stock', section: 'notifications', path: '/agent-analytics' },
    { id: 'agt-delivery', type: 'delivery', section: 'notifications', path: '/warehouse' },
    { id: 'agt-system', type: 'system', section: 'notifications', path: '/my' },
    { id: 'agt-outlet-update', type: 'outlet', section: 'outlets', path: '/my', tab: 'outlets' },
    { id: 'agt-courier-update', type: 'courier', section: 'couriers', path: '/my', tab: 'couriers' }
  ]
};

function getMockNotifications(role) {
  const saved = readMyData(role, 'notifications', null);
  const readIds = readMyData(role, 'read_notifications', []);
  const seeds = MY_NOTIFICATION_SEEDS[role].map((item, index) => ({
    ...item, read: readIds.includes(item.id), createdAt: new Date(Date.now() - index * 86400000).toISOString()
  }));
  const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
  const complaintReads = readMyData(role, `complaint_reads_${complaintOwnerId(profile)}`, []);
  const complaintNotices = readSharedComplaints().filter(ticket => ownsComplaint(ticket, profile) && ticket.statusCode === 'RESOLVED').map(ticket => {
    const revision = ticket.history?.at(-1)?.id || ticket.handledAt;
    const id = `complaint-${ticket.id}-${revision}`;
    return { id, type: 'complaint', section: 'notifications', path: '/my', tab: 'notifications', complaintId: ticket.id,
      titleKey: 'chatComplaint.noticeTitle', bodyKey: 'chatOrders.completion', params: { id: ticket.id },
      read: complaintReads.includes(id), createdAt: ticket.handledAt || ticket.submittedAt };
  });
  const normal = (saved || []).filter(item => item.type !== 'complaint');
  return [...complaintNotices, ...normal, ...seeds.filter(item => !normal.some(old => old.id === item.id))];
}

function addMockNotification(role, type, section) {
  const items = getMockNotifications(role);
  items.unshift({ id: `${type}-${crypto.randomUUID()}`, type, section, path: '/my', tab: section, read: false, createdAt: new Date().toISOString() });
  writeMyData(role, 'notifications', items);
  window.dispatchEvent(new CustomEvent('rcm:notifications-changed', { detail: { role } }));
}

const MY_COURIER_SEEDS = [
  { id: 'courier-1', name: 'Hashim Ali', phone: '07701234001', vehicleNo: 'BAG-TRK-7841', active: true },
  { id: 'courier-2', name: 'Omar Sabah', phone: '07701234002', vehicleNo: 'BAG-VAN-2198', active: true }
];

// 受信设备演示种子数据（跨语言共享业务数据，名称与地区使用语言中立写法，经 PocketBase 同步）
const MY_DEVICE_SEEDS = {
  citizen: [
    { id: 'device-seed-cit-01', name: 'iPhone 15 Pro', platform: 'ios', location: 'Baghdad', ip: '156.204.31.77', createdAt: '2026-09-02 09:12:00', lastActiveAt: '2026-10-21 19:42:00' },
    { id: 'device-seed-cit-02', name: 'Redmi Note 12', platform: 'android', location: 'Basra', ip: '156.204.88.132', createdAt: '2026-08-18 21:05:00', lastActiveAt: '2026-10-19 08:27:00' },
    { id: 'device-seed-cit-03', name: 'Chrome · Windows', platform: 'windows', location: 'Erbil', ip: '156.204.45.90', createdAt: '2026-07-30 14:48:00', lastActiveAt: '2026-10-20 12:03:00' }
  ],
  agent: [
    { id: 'device-seed-agt-01', name: 'Galaxy S23', platform: 'android', location: 'Baghdad', ip: '156.204.66.19', createdAt: '2026-09-10 07:30:00', lastActiveAt: '2026-10-22 06:15:00' },
    { id: 'device-seed-agt-02', name: 'Chrome · Windows', platform: 'windows', location: 'Baghdad', ip: '156.204.66.204', createdAt: '2026-06-21 11:26:00', lastActiveAt: '2026-10-21 20:58:00' }
  ]
};

// 当前设备指纹：每台设备本地生成并仅存本机，不参与 PocketBase 同步
function currentDeviceFingerprint() {
  const KEY = 'rcm_device_fingerprint';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function detectDevicePlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Windows/.test(ua)) return 'windows';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macos';
  return 'web';
}

function detectDeviceBrowser() {
  const ua = navigator.userAgent || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua)) return 'Safari';
  return 'Browser';
}

function currentDeviceName() {
  const platform = detectDevicePlatform();
  const browser = detectDeviceBrowser();
  if (platform === 'ios') return `${browser} · iPhone`;
  if (platform === 'android') return `${browser} · Android`;
  if (platform === 'windows') return `${browser} · Windows`;
  if (platform === 'macos') return `${browser} · macOS`;
  return `${browser} · Web`;
}

// 由指纹派生稳定演示 IP，保证同一设备每次打开列表一致
function deviceIpFromFingerprint(fingerprint) {
  let hash = 0;
  for (const ch of fingerprint) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `156.204.${(hash >> 8) & 255}.${hash & 255}`;
}

function deviceNowText() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function readDevices(role) {
  return readMyData(role, 'devices', MY_DEVICE_SEEDS[role]?.map(item => ({ ...item })) || []);
}

// 打开列表时登记/刷新当前设备，保证“当前设备”始终出现在受信列表中
function registerCurrentDevice(role) {
  const fingerprint = currentDeviceFingerprint();
  const devices = readDevices(role);
  const now = deviceNowText();
  const index = devices.findIndex(item => item.id === fingerprint);
  if (index >= 0) {
    devices[index] = { ...devices[index], lastActiveAt: now };
  } else {
    devices.push({
      id: fingerprint,
      name: currentDeviceName(),
      platform: detectDevicePlatform(),
      location: 'Baghdad',
      ip: deviceIpFromFingerprint(fingerprint),
      createdAt: now,
      lastActiveAt: now
    });
  }
  const sorted = devices.sort((a, b) => String(b.lastActiveAt).localeCompare(String(a.lastActiveAt)));
  writeMyData(role, 'devices', sorted);
  return sorted;
}

// current 标记按请求实时计算，避免把某台设备的视角持久化进共享数据
function listMyDevices(role) {
  const fingerprint = currentDeviceFingerprint();
  return registerCurrentDevice(role).map(item => ({ ...item, current: item.id === fingerprint }));
}

// 演示坐标：按订单号稳定派生巴格达市区内的收货点与配送网点坐标，保证多次打开地图位置一致
function demoOrderGeo(orderId) {
  let hash = 0;
  for (const ch of String(orderId)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const dest = {
    lat: Number((33.276 + ((hash % 97) / 1000)).toFixed(5)),
    lng: Number((44.296 + (((hash >> 8) % 97) / 1000)).toFixed(5)),
    accuracy: 'approximate'
  };
  const origin = {
    lat: Number((dest.lat - 0.018 - (((hash >> 16) % 12) / 1000)).toFixed(5)),
    lng: Number((dest.lng - 0.014 - (((hash >> 20) % 12) / 1000)).toFixed(5)),
    accuracy: 'approximate'
  };
  return { dest, origin };
}

const multiLangStores = {
  zh: {
    complaintsStore: JSON.parse(JSON.stringify(zhComplaint.MOCK_COMPLAINTS)),
    adminWarehousesStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_WAREHOUSES_ADMIN)),
    familiesStore: JSON.parse(JSON.stringify(zhCitizen.MOCK_FAMILIES)),
    transferableMembersStore: JSON.parse(JSON.stringify(zhMemberTransfer.MOCK_TRANSFERABLE_MEMBERS)),
    ticketsStore: JSON.parse(JSON.stringify(zhReview.MOCK_REVIEW_TICKETS)),
    stocksStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_STOCKS)),
    rationPlansStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_RATION_PLANS)),
    agentAllocationTasksStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AGENT_ALLOCATION_TASKS)),
    inboundOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_INBOUND_ORDERS)),
    outboundOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_OUTBOUND_ORDERS)),
    transferOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_TRANSFER_ORDERS)),
    stocktakeRecordsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_STOCKTAKE_RECORDS)),
    lossRecordsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_LOSS_RECORDS)),
    inventoryLedgersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_INVENTORY_LEDGERS)),
    deliveryTrackingsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_DELIVERY_TRACKINGS)),
    agentReceiptsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AGENT_RECEIPTS)),
    discrepancyTicketsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_DISCREPANCY_TICKETS)),
    citizenClaimsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_CITIZEN_CLAIMS)),
    auditLogsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AUDIT_LOGS)),
    validationRulesStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_P1_P5_VALIDATION_RULES)),
    agentsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENTS)),
    myAgentCentersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_MY_AGENT_CENTERS)),
    article140CentersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_ARTICLE_140_CENTERS)),
    agentApplicationsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_APPLICATIONS)),
    adminCardsStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_CITIZEN_CARDS)),
    adminFamiliesStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_FAMILIES_ADMIN)),
    adminAgentsStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_AGENTS_ADMIN)),
    g2bOrdersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_G2B_PURCHASE_ORDERS || [])),
    b2cReservationsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_B2C_RESERVATIONS || [])),
    citizenPurchaseOrdersStore: JSON.parse(JSON.stringify(INITIAL_CITIZEN_PURCHASE_ORDERS_ZH)),
    agentTimeSlotsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_TIME_SLOTS || [])),
    agentLocalStocksStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_LOCAL_STOCKS || [])),
    fullTraceChainStore: JSON.parse(JSON.stringify(zhAgent.MOCK_FULL_TRACE_CHAIN || []))
  },
  en: {
    complaintsStore: JSON.parse(JSON.stringify(enComplaint.MOCK_COMPLAINTS)),
    adminWarehousesStore: JSON.parse(JSON.stringify(enAdmin.MOCK_WAREHOUSES_ADMIN)),
    familiesStore: JSON.parse(JSON.stringify(enCitizen.MOCK_FAMILIES)),
    transferableMembersStore: JSON.parse(JSON.stringify(enMemberTransfer.MOCK_TRANSFERABLE_MEMBERS)),
    ticketsStore: JSON.parse(JSON.stringify(enReview.MOCK_REVIEW_TICKETS)),
    stocksStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_STOCKS)),
    rationPlansStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_RATION_PLANS)),
    agentAllocationTasksStore: zhWarehouse.MOCK_AGENT_ALLOCATION_TASKS.map((t) => ({
      ...t,
      agentLevelName: t.agentLevel === 'PROVINCE' ? 'Provincial Agent' : t.agentLevel === 'DISTRICT' ? 'District Agent' : 'Local Station',
      taskStatus: t.taskStatus === '正常履约中' ? 'Normal Progress' : t.taskStatus === '已完结' ? 'Completed' : t.taskStatus
    })),
    inboundOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_INBOUND_ORDERS)),
    outboundOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_OUTBOUND_ORDERS)),
    transferOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_TRANSFER_ORDERS)),
    stocktakeRecordsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_STOCKTAKE_RECORDS)),
    lossRecordsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_LOSS_RECORDS)),
    inventoryLedgersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_INVENTORY_LEDGERS)),
    deliveryTrackingsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_DELIVERY_TRACKINGS)),
    agentReceiptsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_AGENT_RECEIPTS)),
    discrepancyTicketsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_DISCREPANCY_TICKETS)),
    citizenClaimsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_CITIZEN_CLAIMS)),
    auditLogsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_AUDIT_LOGS)),
    validationRulesStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_P1_P5_VALIDATION_RULES)),
    agentsStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENTS)),
    myAgentCentersStore: JSON.parse(JSON.stringify(enAgent.MOCK_MY_AGENT_CENTERS)),
    article140CentersStore: JSON.parse(JSON.stringify(enAgent.MOCK_ARTICLE_140_CENTERS || zhAgent.MOCK_ARTICLE_140_CENTERS)),
    agentApplicationsStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENT_APPLICATIONS || zhAgent.MOCK_AGENT_APPLICATIONS)),
    adminCardsStore: JSON.parse(JSON.stringify(enAdmin.MOCK_CITIZEN_CARDS)),
    adminFamiliesStore: JSON.parse(JSON.stringify(enAdmin.MOCK_FAMILIES_ADMIN)),
    adminAgentsStore: JSON.parse(JSON.stringify(enAdmin.MOCK_AGENTS_ADMIN)),
    g2bOrdersStore: JSON.parse(JSON.stringify(enAgent.MOCK_G2B_PURCHASE_ORDERS || zhAgent.MOCK_G2B_PURCHASE_ORDERS || [])),
    b2cReservationsStore: JSON.parse(JSON.stringify(enAgent.MOCK_B2C_RESERVATIONS || zhAgent.MOCK_B2C_RESERVATIONS || [])),
    citizenPurchaseOrdersStore: JSON.parse(JSON.stringify(INITIAL_CITIZEN_PURCHASE_ORDERS_EN)),
    agentTimeSlotsStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENT_TIME_SLOTS || zhAgent.MOCK_AGENT_TIME_SLOTS || [])),
    agentLocalStocksStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENT_LOCAL_STOCKS || zhAgent.MOCK_AGENT_LOCAL_STOCKS || [])),
    fullTraceChainStore: JSON.parse(JSON.stringify(enAgent.MOCK_FULL_TRACE_CHAIN || zhAgent.MOCK_FULL_TRACE_CHAIN || []))
  }
};

// ar/ku 独立深拷贝：避免与 en 共享同一引用造成跨语言演示数据互相污染
// （ar/ku 演示数据暂回退英文文案；状态标识如 status:'正常' 属业务逻辑标识，由视图层 t() 转译）
multiLangStores.ar = JSON.parse(JSON.stringify(multiLangStores.en));
multiLangStores.ku = JSON.parse(JSON.stringify(multiLangStores.en));

function syncCitizenContact(profile) {
  if (!profile) return;
  Object.values(multiLangStores).forEach((stores) => {
    const family = stores.familiesStore?.find(item => item.rationCardNo === 'RC-10029381');
    if (family) {
      family.phone = profile.phone;
      family.address = profile.address;
    }
  });
}

syncCitizenContact(readMyData('citizen', 'profile', null));

// 家庭成员/人数变更后同步所有语言内存池：
// 家庭档案 GET 接口优先读跨标签页共享存储，而 quota-balance 等按当前语言内存池
// 读取——若只更新其中一处，会造成「家庭代理 5 人 / 配给购买 4 人」的额度分裂
function syncFamilyAcrossPools(family) {
  if (!family || !family.rationCardNo) return;
  Object.values(multiLangStores).forEach((stores) => {
    const target = (stores.familiesStore || []).find((f) => f.rationCardNo === family.rationCardNo);
    if (target && target !== family) {
      target.members = family.members;
      target.memberCount = family.memberCount;
    }
  });
}

const ACTIVE_MEMBER_STATUS_BY_LANG = {
  zh: '正常',
  en: 'Active',
  ar: 'نشط',
  ku: 'چالاکە'
};

function matchesUnfreezeMember(member, payload) {
  const memberId = String(payload?.targetMemberId || '');
  const nationalId = String(payload?.targetNationalId || '');
  return Boolean(member && (
    (memberId && (String(member.id || '') === memberId || String(member.nationalId || '') === memberId))
    || (nationalId && String(member.nationalId || '') === nationalId)
  ));
}

function applyApprovedUnfreeze(ticket) {
  const payload = ticket?.payload || {};
  const cardNo = payload.cardNo || ticket?.cardNo;
  if (!cardNo || (!payload.targetMemberId && !payload.targetNationalId)) return false;

  let updated = false;
  updateSharedFamily(cardNo, (family, lang) => {
    let changed = false;
    const members = (family.members || []).map((member) => {
      if (!matchesUnfreezeMember(member, payload)) return member;
      changed = true;
      updated = true;
      return {
        ...member,
        status: ACTIVE_MEMBER_STATUS_BY_LANG[lang] || 'Active',
        freezeReason: '',
        freezeDate: '',
        isUpdatedInSystem: true
      };
    });
    return changed ? { ...family, members } : family;
  });

  Object.entries(multiLangStores).forEach(([lang, stores]) => {
    const family = (stores.familiesStore || []).find((item) => item.rationCardNo === cardNo);
    if (family) {
      family.members = (family.members || []).map((member) => {
        if (!matchesUnfreezeMember(member, payload)) return member;
        updated = true;
        return {
          ...member,
          status: ACTIVE_MEMBER_STATUS_BY_LANG[lang] || 'Active',
          freezeReason: '',
          freezeDate: '',
          isUpdatedInSystem: true
        };
      });
    }
  });

  return updated;
}

// 有效纳保成员数：冻结 (zh 已冻结/冻结 / en Frozen) 成员不计入家庭配给额度
function getActiveMemberCount(family) {
  if (!family || !Array.isArray(family.members)) return 0;
  return family.members.filter((m) => !m || !/冻结|Frozen/i.test(m.status || '')).length;
}

export function getActiveLang(config) {
  if (config && config.headers && config.headers['Accept-Language']) {
    const l = config.headers['Accept-Language'];
    if (l === 'ckb') return 'ku';
    if (['zh', 'en', 'ar', 'ku'].includes(l)) return l;
  }
  if (typeof localStorage !== 'undefined') {
    const l = localStorage.getItem('rcm_language');
    if (l === 'ckb') return 'ku';
    if (['zh', 'en', 'ar', 'ku'].includes(l)) return l;
  }
  return 'zh';
}

/**
 * 获取智能客服当前请求的精确语言代码 (支持 zh, en, ar, ku)
 */
export function getAiServiceLang(config, data) {
  if (data?.lang === 'ckb') return 'ku';
  if (data && data.lang && ['zh', 'en', 'ar', 'ku'].includes(data.lang)) {
    return data.lang;
  }
  const headerLang = config?.headers?.['Accept-Language'];
  if (headerLang === 'ckb') return 'ku';
  if (headerLang && ['zh', 'en', 'ar', 'ku'].includes(headerLang)) {
    return headerLang;
  }
  if (typeof localStorage !== 'undefined') {
    const storedLang = localStorage.getItem('rcm_language');
    if (storedLang === 'ckb') return 'ku';
    if (storedLang && ['zh', 'en', 'ar', 'ku'].includes(storedLang)) {
      return storedLang;
    }
  }
  return 'zh';
}


/**
 * 包装为企业级统一规范响应体
 * @param {number} code 业务状态码
 * @param {string} message 业务提示
 * @param {any} data 载荷数据
 */
export function createResponse(data = {}, code = 200, message = 'success') {
  return {
    code,
    message,
    data
  };
}

/**
 * Mock 路由分发器
 */
export async function mockDispatch(config) {
  const method = (config.method || 'get').toUpperCase();
  const url = (config.url || '').replace(/^https?:\/\/[^/]+/, ''); // 剥离域名前缀
  let data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
  const complaintPhotos = url.includes('/complaint/create') && data instanceof FormData ? data.getAll('photos') : [];
  if (url.includes('/complaint/create') && data instanceof FormData) data = Object.fromEntries([...data.entries()].filter(([key]) => key !== 'photos'));
  const params = config.params || {};

  const reqLang = getActiveLang(config);
  const isEn = reqLang === 'en';
  const localeCode = reqLang === 'ku' ? 'ckb' : reqLang;
  const activeStores = multiLangStores[reqLang] || multiLangStores.en || multiLangStores.zh;

  // 解构当前语言环境下对应的测试数据
  let complaintsStore = activeStores.complaintsStore;
  let adminWarehousesStore = activeStores.adminWarehousesStore;
  let familiesStore = activeStores.familiesStore;
  let transferableMembersStore = activeStores.transferableMembersStore;
  let ticketsStore = activeStores.ticketsStore;
  let stocksStore = activeStores.stocksStore;
  let rationPlansStore = activeStores.rationPlansStore;
  let agentAllocationTasksStore = activeStores.agentAllocationTasksStore;
  let inboundOrdersStore = activeStores.inboundOrdersStore;
  let outboundOrdersStore = activeStores.outboundOrdersStore;
  let transferOrdersStore = activeStores.transferOrdersStore;
  let stocktakeRecordsStore = activeStores.stocktakeRecordsStore;
  let lossRecordsStore = activeStores.lossRecordsStore;
  let inventoryLedgersStore = activeStores.inventoryLedgersStore;
  let deliveryTrackingsStore = activeStores.deliveryTrackingsStore;
  let agentReceiptsStore = activeStores.agentReceiptsStore;
  let discrepancyTicketsStore = activeStores.discrepancyTicketsStore;
  let citizenClaimsStore = activeStores.citizenClaimsStore;
  let auditLogsStore = activeStores.auditLogsStore;
  let validationRulesStore = activeStores.validationRulesStore;
  let agentsStore = activeStores.agentsStore;
  let myAgentCentersStore = activeStores.myAgentCentersStore;
  let article140CentersStore = activeStores.article140CentersStore;
  let agentApplicationsStore = activeStores.agentApplicationsStore;
  let adminCardsStore = activeStores.adminCardsStore;
  let adminFamiliesStore = activeStores.adminFamiliesStore;
  let adminAgentsStore = activeStores.adminAgentsStore;
  let g2bOrdersStore = readProcurementOrders();
  let b2cReservationsStore = activeStores.b2cReservationsStore;
  let citizenPurchaseOrdersStore = activeStores.citizenPurchaseOrdersStore;
  let agentTimeSlotsStore = activeStores.agentTimeSlotsStore;
  let agentLocalStocksStore = activeStores.agentLocalStocksStore;
  let fullTraceChainStore = activeStores.fullTraceChainStore;

  // 绑定当前语言的常量集合
  const MOCK_USERS = isEn ? enAuth.MOCK_USERS : zhAuth.MOCK_USERS;
  const MOCK_CURRENT_AGENT_PROFILE = isEn ? enAgent.MOCK_CURRENT_AGENT_PROFILE : zhAgent.MOCK_CURRENT_AGENT_PROFILE;
  const baseTransferOptions = isEn ? enTransfer.TRANSFER_BRANCH_OPTIONS : zhTransfer.TRANSFER_BRANCH_OPTIONS;
  const transferLabels = i18n.global.getLocaleMessage(localeCode)?.transferLocations || {};
  const TRANSFER_BRANCH_OPTIONS = baseTransferOptions.map((province, provinceIndex) => ({
    ...province,
    province: transferLabels[`province${provinceIndex}`] || province.province,
    branches: province.branches.map((branch, branchIndex) => ({
      ...branch,
      branchName: transferLabels[`branch${provinceIndex}_${branchIndex}`] || branch.branchName,
      centers: branch.centers.map((center) => ({
        ...center,
        centerName: transferLabels[`center${center.centerId}`] || center.centerName,
        flourAgents: center.flourAgents.map((agent) => {
          const id = agent.id.replaceAll('-', '_');
          return { ...agent, name: transferLabels[`agent${id}`] || agent.name, manager: transferLabels[`manager${id}`] || agent.manager };
        }),
        foodAgents: center.foodAgents.map((agent) => {
          const id = agent.id.replaceAll('-', '_');
          return { ...agent, name: transferLabels[`agent${id}`] || agent.name, manager: transferLabels[`manager${id}`] || agent.manager };
        })
      }))
    }))
  }));
  const localizeFamilyAgentNames = (familyList) => {
    if (!Array.isArray(familyList)) return familyList;
    const agentNames = new Map();
    TRANSFER_BRANCH_OPTIONS.forEach((province) => province.branches.forEach((branch) => branch.centers.forEach((center) => {
      [...center.flourAgents, ...center.foodAgents].forEach((agent) => agentNames.set(agent.id, agent.name));
    })));
    return familyList.map((family) => {
      const ids = String(family.agentId || '').match(/(?:FA|FD)-[A-Z]+-\d+/g) || [];
      const names = ids.map((id) => agentNames.get(id)).filter(Boolean);
      return names.length ? { ...family, agentName: names.join(' ＆ ') } : family;
    });
  };
  const MOCK_DASHBOARD_STATS = isEn ? enDashboard.MOCK_DASHBOARD_STATS : zhDashboard.MOCK_DASHBOARD_STATS;
  const MOCK_ADMIN_DASHBOARD_DATA = isEn ? enDashboard.MOCK_ADMIN_DASHBOARD_DATA : zhDashboard.MOCK_ADMIN_DASHBOARD_DATA;
  const MOCK_AGENT_DASHBOARD_DATA = isEn ? enDashboard.MOCK_AGENT_DASHBOARD_DATA : zhDashboard.MOCK_AGENT_DASHBOARD_DATA;
  const MOCK_TRACE_CHAINS = isEn ? enWarehouse.MOCK_TRACE_CHAINS : zhWarehouse.MOCK_TRACE_CHAINS;
  const MOCK_LOSS_AUDIT_STATS = isEn ? enWarehouse.MOCK_LOSS_AUDIT_STATS : zhWarehouse.MOCK_LOSS_AUDIT_STATS;
  const MOCK_KNOWLEDGE_BASES = isEn ? enKB.MOCK_KNOWLEDGE_BASES : zhKB.MOCK_KNOWLEDGE_BASES;
  const MOCK_KNOWLEDGE_CHUNKS = isEn ? enKB.MOCK_KNOWLEDGE_CHUNKS : zhKB.MOCK_KNOWLEDGE_CHUNKS;
  const MOCK_RECOMMENDED_PROMPTS = isEn ? enKB.MOCK_RECOMMENDED_PROMPTS : zhKB.MOCK_RECOMMENDED_PROMPTS;
  const MOCK_HUMAN_AGENTS = isEn ? enKB.MOCK_HUMAN_AGENTS : zhKB.MOCK_HUMAN_AGENTS;


  // 模拟真实网络 100~200ms 异步延迟
  await new Promise((resolve) => setTimeout(resolve, 120));

  // System administration and broadcast notifications share local demo state across roles/tabs.
  const currentRole = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}').role || 'citizen';
  const readCenter = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(`rcm_center_${key}_v1`) || 'null') ?? fallback; } catch { return fallback; }
  };
  const writeCenter = (key, value) => localStorage.setItem(`rcm_center_${key}_v1`, JSON.stringify(value));
  const initializeMessageSeeds = () => {
    const messages = readCenter('messages', []);
    if (readCenter('messages_demo_seed', false)) return messages;

    const adminFavoriteKeys = ['usr-admin-01', 'usr-admin-02', 'usr-admin-03', 'web-001', 'minister_center', 'deputy_minister', 'director_planning', 'admin'];
    const now = Date.now();
    const makeMessage = ({ ageMinutes = 0, ...message }) => ({
      category: 'system',
      sender: 'RCM',
      createdAt: new Date(now - ageMinutes * 60_000).toISOString(),
      readBy: [],
      favoriteBy: [],
      ...message
    });
    const demoMessages = [
      makeMessage({
        id: 'demo-notification-inbox-welcome', subjectKey: 'mail.demoInboxSubject', bodyKey: 'mail.demoInboxBody',
        recipientType: 'web', audience: ['admin', 'minister_center', 'deputy_minister', 'director_planning'],
        reviewStatus: 'approved', favoriteBy: adminFavoriteKeys, ageMinutes: 60
      }),
      makeMessage({
        id: 'demo-notification-inbox-update', subjectKey: 'mail.demoUpdateSubject', bodyKey: 'mail.demoUpdateBody',
        recipientType: 'web', audience: ['admin', 'minister_center', 'deputy_minister', 'director_planning'],
        category: 'admin', reviewStatus: 'approved', readBy: ['admin', 'minister_center', 'deputy_minister', 'director_planning'],
        ageMinutes: 180
      }),
      ...[
        { role: 'minister_center', id: 'usr-admin-01' },
        { role: 'deputy_minister', id: 'usr-admin-02' },
        { role: 'director_planning', id: 'usr-admin-03' },
        { role: 'admin', id: 'web-001' }
      ].map(({ role }, index) => makeMessage({
        id: `demo-notification-sent-${role}`, subjectKey: 'mail.demoSentSubject', bodyKey: 'mail.demoSentBody',
        recipientType: 'web', audience: ['admin', 'minister_center', 'deputy_minister', 'director_planning'],
        senderRole: role, category: 'admin', reviewStatus: 'pending', favoriteBy: adminFavoriteKeys,
        ageMinutes: 300 + index
      })),
      makeMessage({
        id: 'demo-notification-review-agent', subjectKey: 'mail.demoReviewSubject', bodyKey: 'mail.demoReviewBody',
        recipientType: 'citizens', regionCode: 'BAG', recipientLabelKey: 'systemExtras.regionBaghdad',
        audience: ['citizen'], senderRole: 'agent', category: 'admin', reviewStatus: 'pending', ageMinutes: 120
      })
    ];
    const existingIds = new Set(messages.map((message) => message.id));
    const seededMessages = demoMessages.filter((message) => !existingIds.has(message.id));
    const combinedMessages = [...seededMessages, ...messages];
    if (seededMessages.length) writeCenter('messages', combinedMessages);
    writeCenter('messages_demo_seed', true);
    return combinedMessages;
  };
  const systemSeed = {
    users: [{ id: 'web-001', username: 'admin', name: 'System Administrator', email: 'admin@example.com', roleId: 'role-admin', role: 'admin', organization: 'Baghdad Karkh Ration Center', status: 'active' }, { id: 'web-002', username: 'operator', name: 'Operations User', email: 'operator@example.com', roleId: 'role-operator', role: 'operator', organization: 'Baghdad Karkh Ration Center', status: 'active' }],
    roles: [
      { id: 'role-admin', name: 'System Administrator', code: 'admin', description: 'Manage system settings and access', permissionCodes: ['dashboard.view','agents.view','agents.create','agents.edit','agents.delete','ration.view','ration.dispatch',...WAREHOUSE_PERMISSION_CODES,'review.view','review.process','complaints.view','complaints.process','system.users','system.roles','system.permissions','system.organizations','system.audit','messages.view','messages.send','messages.review'], reviewScope: { types: [...REVIEW_TYPE_CODES], regionsByType: Object.fromEntries([...REVIEW_TYPE_CODES, ...WAREHOUSE_PERMISSION_CODES].map((code) => [code, REVIEW_SCOPE_REGIONS.map((region) => region.value)])) } },
      { id: 'role-operator', name: 'Business Operator', code: 'operator', description: 'Manage daily operations', permissionCodes: ['dashboard.view','agents.view','ration.view','review.view','review.process','messages.view'], reviewScope: { types: ['review.process.unfreeze','review.process.split'], regionsByType: { 'review.process.unfreeze': ['巴格达省'], 'review.process.split': ['巴格达省'] } } },
      { id: 'role-auditor', name: 'Auditor', code: 'auditor', description: 'Read audit records', permissionCodes: ['dashboard.view','review.view','system.audit'], reviewScope: { types: [], regionsByType: {} } }
    ],
    permissions: PERMISSION_CATALOG.map((item) => ({ id: 'perm-' + item.code, moduleKey: item.moduleKey, code: item.code, featureKey: item.featureKey, parentCode: item.parentCode || '' })),
    organizations: [{ id: 'org-001', name: 'Baghdad Karkh Ration Center', code: 'BG-KRK-01', province: 'baghdad', address: 'Karkh, Baghdad, Iraq', latitude: '33.315200', longitude: '44.366100', contact: 'Baghdad Center Office', phone: '+964 1 000 0001' }, { id: 'org-002', name: 'Basra Central Ration Center', code: 'BS-CTR-01', province: 'basra', address: 'Basra, Iraq', latitude: '30.508500', longitude: '47.780400', contact: 'Basra Center Office', phone: '+964 1 000 0002' }],
    'audit-logs': [{ id: 'log-001', actor: 'System Administrator', details: 'System Administrator signed in to Web console', type: 'login', businessNo: 'admin', terminal: 'Web console', ip: '127.0.0.1', before: null, after: { result: 'success' }, time: new Date().toISOString() }]
  };
  const appendSystemAudit = ({ actor = 'System', type, details, businessNo = '', object = businessNo, before = null, after = null }) => {
    const logs = readCenter('system_audit-logs', systemSeed['audit-logs']);
    logs.unshift({ id: `log-${crypto.randomUUID()}`, actor, time: new Date().toISOString(), terminal: navigator.userAgent, ip: '127.0.0.1', type, details, businessNo, object, before, after });
    writeCenter('system_audit-logs', logs);
  };
  // 业务规则配置（版本化）：每次发布生成新版本号，历史版本保留全量快照
  if (url.includes('/admin/business-rules')) {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
    const hasRuleGrant = Array.isArray(profile.permissionCodes)
      ? profile.permissionCodes.includes('system.users')
      : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(currentRole);
    if (!hasRuleGrant) return createResponse({}, 403, i18n.global.t('api.forbidden'));

    if (method === 'GET') {
      return createResponse(readBusinessRulesDocument());
    }
    if (method === 'POST') {
      const errors = validateBusinessRules(data?.rules);
      if (errors.length) {
        return createResponse({}, 400, i18n.global.t('businessRules.validationFailed'));
      }
      const actor = profile.name || profile.username || 'System Administrator';
      const next = buildNextBusinessRulesVersion(readBusinessRulesDocument(), data?.rules, actor);
      writeBusinessRulesDocument(next);
      const logs = readCenter('system_audit-logs', systemSeed['audit-logs']);
      const groups = (next.history[next.history.length - 1]?.changedGroups || []).join(', ') || 'metadata';
      logs.unshift({
        id: `log-${crypto.randomUUID()}`,
        actor,
        details: `Published business rules v${next.version} (${groups})`,
        ip: '127.0.0.1',
        time: new Date().toISOString()
      });
      writeCenter('system_audit-logs', logs);
      return createResponse(next);
    }
  }

  if (url.includes('/admin/system/')) {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
    const hasSystemGrant = Array.isArray(profile.permissionCodes) ? profile.permissionCodes.includes('system.users') : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(currentRole);
    if (!hasSystemGrant) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    const [section, recordId] = (url.split('/admin/system/')[1]?.split('?')[0] || '').split('/');
    if (!Object.hasOwn(systemSeed, section)) return createResponse({}, 404, i18n.global.t('api.notFound'));
    if (section === 'audit-logs' && recordId === 'export' && method === 'POST') {
      appendSystemAudit({ actor: profile.name || profile.username || 'Administrator', type: 'data_export', details: 'Exported audit log records', businessNo: 'audit-logs', after: data.filters || {} });
      return createResponse({ success: true });
    }
    let records = readCenter(`system_${section}`, systemSeed[section]);
    if (section === 'permissions') {
      const extras = records.filter((row) => row.code && !systemSeed.permissions.some((seed) => seed.code === row.code));
      records = [...systemSeed.permissions, ...extras]; writeCenter(`system_${section}`, records);
    } else if (section === 'roles') {
      records = records.map((row) => {
        const seed = systemSeed.roles.find((item) => item.id === row.id || item.code === row.code);
        return {
          ...row,
          permissionCodes: row.permissionCodes || seed?.permissionCodes || [],
          reviewScope: row.reviewScope || seed?.reviewScope || { types: [], mode: 'role', roles: [], regions: [] }
        };
      });
      writeCenter(`system_${section}`, records);
    } else if (section === 'users') {
      records = records.map((row) => ({ ...row, roleId: row.roleId || systemSeed.roles.find((role) => role.code === row.role)?.id }));
      writeCenter(`system_${section}`, records);
    } else if (section === 'organizations') {
      records = records.map((row) => ({ ...row, province: row.province || (/baghdad|بغداد/i.test(row.address || '') ? 'baghdad' : /basra|بصرة/i.test(row.address || '') ? 'basra' : ''), address: row.address || '', latitude: row.latitude || '', longitude: row.longitude || '', contact: row.contact || '', phone: row.phone || '' }));
      writeCenter(`system_${section}`, records);
    }
    if (method === 'GET' && section !== 'audit-logs') return createResponse(section === 'users' ? records.map(publicAdminAccount) : records);
    if (section === 'audit-logs' && (method === 'POST' || method === 'DELETE')) return createResponse({}, 405, i18n.global.t('api.businessError'));
    if (method === 'GET' && section === 'audit-logs') {
      const businessAuditLogs = (auditLogsStore || []).map((log) => {
        const action = String(log.action || '');
        const type = /PAY|SETTLE/i.test(action) ? 'payment' : /REVIEW|APPROV|AUDIT/i.test(action) ? 'review' : /STATUS|ENABLE|DISABLE|BLOCK/i.test(action) ? 'status_change' : /EXPORT/i.test(action) ? 'data_export' : 'application';
        const businessNo = String(log.actionDesc || '').match(/[A-Z]{2,}[-\w]{3,}/)?.[0] || '';
        return { ...log, actor: log.actor || log.operatorName || 'System', time: log.time || log.timestamp, terminal: log.terminal || 'Warehouse terminal', ip: log.ip || log.terminalIp || '', type: log.type || type, businessNo: log.businessNo || businessNo, object: log.object || log.module || businessNo, details: log.details || log.actionDesc, before: log.before ?? log.beforeSnapshot, after: log.after ?? log.afterSnapshot };
      });
      const allRecords = [...records, ...businessAuditLogs.filter((log) => !records.some((row) => row.id === log.id))];
      const cutoffDate = new Date(); cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
      const cutoff = cutoffDate.getTime();
      const filteredLogs = allRecords.filter((log) => {
        const time = new Date(log.time || log.timestamp).getTime();
        return Number.isNaN(time) || time >= cutoff;
      }).filter((log) => {
        const time = new Date(log.time || log.timestamp).getTime();
        return (!params.actor || String(log.actor || log.operatorName || '').toLowerCase().includes(String(params.actor).toLowerCase()))
          && (!params.type || log.type === params.type)
          && (!params.businessNo || String(log.businessNo || '').toLowerCase().includes(String(params.businessNo).toLowerCase()))
          && (!params.from || time >= new Date(params.from).getTime())
          && (!params.to || time <= new Date(params.to).getTime() + 999);
      });
      return createResponse(filteredLogs);
    }
    if (method === 'DELETE' && recordId) {
      const index = records.findIndex((row) => row.id === decodeURIComponent(recordId));
      if (index < 0) return createResponse({}, 404, i18n.global.t('api.notFound'));
      const [removed] = records.splice(index, 1); writeCenter(`system_${section}`, records);
      appendSystemAudit({ actor: profile.name || profile.username || 'System Administrator', type: 'configuration', details: data.auditDetails || `Deleted ${section} ${removed.name || removed.username || removed.code || removed.id}`, businessNo: removed.businessNo || removed.code || removed.id, object: removed.name || removed.username || removed.code || section, before: section === 'users' ? publicAdminAccount(removed) : removed, after: null });
      return createResponse({ success: true });
    }
    if (method === 'POST') {
      const next = { ...data, id: data.id || `rec-${crypto.randomUUID()}`, time: data.time || new Date().toISOString() };
      if (section === 'users') {
        const existing = records.find((row) => row.id === next.id);
        next.username = String(data.username || '').trim();
        if (!next.username) return createResponse({}, 400, i18n.global.t('systemUi.usernameRequired'));
        if (records.some((row) => row.id !== next.id && String(row.username).toLowerCase() === next.username.toLowerCase())) {
          return createResponse({}, 400, i18n.global.t('systemUi.usernameTaken'));
        }
        if (!existing || data.password) {
          const password = String(data.password || '');
          if (!password) return createResponse({}, 400, i18n.global.t('systemUi.passwordRequired'));
          if (password.length > 128) return createResponse({}, 400, i18n.global.t('systemUi.passwordLength'));
          if (password !== data.passwordConfirm) return createResponse({}, 400, i18n.global.t('systemUi.passwordMismatch'));
          next.passwordCredential = await createAdminCredential(password);
        } else if (existing.passwordCredential) next.passwordCredential = existing.passwordCredential;
        else delete next.passwordCredential;
        delete next.password;
        delete next.passwordConfirm;
      }
      const auditDetails = next.auditDetails;
      const auditType = next.auditType || 'configuration';
      delete next.auditDetails;
      delete next.auditType;
      const index = records.findIndex((row) => row.id === next.id);
      const before = index >= 0 ? { ...records[index] } : null;
      if (index >= 0) records.splice(index, 1, next); else records.unshift(next);
      writeCenter(`system_${section}`, records);
      if (section !== 'audit-logs') {
        appendSystemAudit({ actor: profile.name || profile.username || 'Administrator', details: auditDetails || `${index >= 0 ? 'Updated' : 'Created'} ${section} ${next.name || next.username || next.code || next.id}`, type: auditType, businessNo: next.businessNo || next.code || next.id, object: next.name || next.username || next.code || section, before: section === 'users' && before ? publicAdminAccount(before) : before, after: section === 'users' ? publicAdminAccount(next) : next });
      }
      return createResponse(section === 'users' ? publicAdminAccount(next) : next);
    }
  }
  if (url.includes('/messages') && !url.includes('/me/')) {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
    const access = resolveMessageAccess(profile);
    const messages = initializeMessageSeeds();
    const userKey = String(profile.id || profile.username || currentRole);
    const identity = [profile.id, profile.username, profile.cardNo, profile.rationCardNo, profile.agentCode].filter(Boolean).map(String);
    const profileRegion = String(profile.regionCode || profile.provinceCode || profile.province || profile.region || profile.governorate || '');
    const userRegionCode = profileRegion ? REVIEW_SCOPE_REGIONS.find((region) => region.code === profileRegion
      || profileRegion === region.value
      || profileRegion.includes(region.value)
      || region.value.includes(profileRegion))?.code || '' : '';
    const isReceived = (item) => {
      const selectedRecipients = !item.recipientIds?.length || item.recipientIds.some((id) => identity.includes(String(id)) || (currentRole === 'agent' && id === 'FA-00128'));
      const needsRegionMatch = ['citizens', 'agents'].includes(item.recipientType) && item.regionCode && !item.recipientIds?.length;
      return (!item.reviewStatus || item.reviewStatus === 'approved')
        && item.audience?.includes(currentRole)
        && selectedRecipients
        && (!needsRegionMatch || (userRegionCode && userRegionCode === item.regionCode));
    };
    const isSent = (item) => item.senderId ? item.senderId === userKey : item.senderRole === currentRole;
    const presentMessage = (item, sourceFolder = isReceived(item) ? 'inbox' : 'sent') => ({ ...item, sourceFolder, read: (item.readBy || []).includes(currentRole), favorite: (item.favoriteBy || []).includes(userKey) });
    const newestFirst = (rows) => rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const reviewPath = /\/messages\/([^/?]+)\/review$/.test(url);
    const reviewQueuePath = url.endsWith('/messages/review') && method === 'GET';
    const sendPath = method === 'POST' && url.endsWith('/messages');
    const inboxPath = url.endsWith('/messages/inbox') && method === 'GET';
    const sentPath = url.endsWith('/messages/sent') && method === 'GET';
    const favoritesPath = url.endsWith('/messages/favorites') && method === 'GET';
    if (reviewPath || reviewQueuePath) {
      if (!access.canReview) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    } else if (sendPath) {
      if (!access.canSend) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    } else if (inboxPath) {
      if (Array.isArray(profile.permissionCodes) && !access.canView) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    } else if (sentPath) {
      if (Array.isArray(profile.permissionCodes) && !access.canSend && !access.canView) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    } else if (favoritesPath) {
      if (Array.isArray(profile.permissionCodes) && !access.canView && !access.canSend) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    } else if (!url.includes('/attachments/') && !url.includes('/recipients/tree') && !url.includes('/favorite') && !url.includes('/read')) {
      if (Array.isArray(profile.permissionCodes) && !access.canView && !access.canSend && !access.canReview) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    }
    if (url.endsWith('/messages/recipients/tree') && method === 'GET') return createResponse(getMessageRecipientTreeData());
    const attachmentMatch = url.match(/\/messages\/attachments\/([^/?]+)/);
    if (attachmentMatch && method === 'GET') {
      const attachmentId = decodeURIComponent(attachmentMatch[1]);
      const message = messages.find((item) => item.attachments?.some((attachment) => attachment.id === attachmentId));
      if (!message || (!isReceived(message) && !isSent(message) && !isMessageInReviewScope(message, access))) return createResponse({}, 404, i18n.global.t('api.notFound'));
      return createResponse(await getMockMessageAttachment(attachmentId));
    }
    if (reviewQueuePath) {
      return createResponse(newestFirst(messages
        .filter((item) => ['pending', 'approved', 'rejected'].includes(item.reviewStatus) && isMessageInReviewScope(item, access))
        .map((item) => presentMessage(item, 'review'))));
    }
    if (reviewPath && method === 'POST') {
      const reviewMatch = url.match(/\/messages\/([^/?]+)\/review$/);
      const item = messages.find((entry) => entry.id === decodeURIComponent(reviewMatch?.[1] || ''));
      if (!item || !isMessageInReviewScope(item, access)) return createResponse({}, 404, i18n.global.t('api.notFound'));
      if (item.reviewStatus !== 'pending') return createResponse({}, 409, i18n.global.t('api.businessError'));
      if (!['approved', 'rejected'].includes(data.decision) || (data.decision === 'rejected' && !String(data.notes || '').trim())) return createResponse({}, 400, i18n.global.t('api.businessError'));
      item.reviewStatus = data.decision;
      item.reviewNotes = String(data.notes || '').trim();
      item.reviewedBy = profile.name || profile.username || currentRole;
      item.reviewedAt = new Date().toISOString();
      writeCenter('messages', messages);
      return createResponse(presentMessage(item, 'review'));
    }
    if (url.endsWith('/messages/inbox') && method === 'GET') {
      return createResponse(newestFirst(messages.filter(isReceived).map((item) => presentMessage(item, 'inbox'))));
    }
    if (url.endsWith('/messages/sent') && method === 'GET') return createResponse(newestFirst(messages.filter(isSent).map((item) => presentMessage(item, 'sent'))));
    if (url.endsWith('/messages/favorites') && method === 'GET') return createResponse(newestFirst(messages.filter((item) => (isReceived(item) || isSent(item)) && (item.favoriteBy || []).includes(userKey)).map((item) => presentMessage(item))));
    const favoriteMatch = url.match(/\/messages\/([^/?]+)\/favorite$/);
    if (favoriteMatch && method === 'PUT') {
      const item = messages.find((entry) => entry.id === decodeURIComponent(favoriteMatch[1]));
      if (!item || (!isReceived(item) && !isSent(item))) return createResponse({}, 404, i18n.global.t('api.notFound'));
      if (typeof data.favorite !== 'boolean') return createResponse({}, 400, i18n.global.t('api.businessError'));
      item.favoriteBy = data.favorite ? [...new Set([...(item.favoriteBy || []), userKey])] : (item.favoriteBy || []).filter((key) => key !== userKey);
      writeCenter('messages', messages);
      return createResponse(presentMessage(item));
    }
    if (url.endsWith('/messages') && method === 'POST') {
      if (!Array.isArray(profile.permissionCodes) && !['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(currentRole)) return createResponse({}, 403, i18n.global.t('api.forbidden'));
      const isMultipart = typeof FormData !== 'undefined' && data instanceof FormData;
      const messageData = isMultipart ? Object.fromEntries([...data.entries()].filter(([key]) => key !== 'attachments')) : { ...data };
      if (typeof messageData.recipientIds === 'string') { try { messageData.recipientIds = JSON.parse(messageData.recipientIds); } catch { messageData.recipientIds = []; } }
      const recipientType = messageData.recipientType || messageData.recipient || '';
      const audienceMap = { citizens: ['citizen'], agents: ['agent'], web: ['admin', 'minister_center', 'deputy_minister', 'director_planning'] };
      if (!Object.hasOwn(audienceMap, recipientType)) return createResponse({}, 400, i18n.global.t('api.businessError'));
      const regionCode = messageData.regionCode || messageData.regionId || '';
      const next = { ...messageData, recipientType, regionCode, id: `msg-${crypto.randomUUID()}`, senderId: userKey, senderRole: currentRole, sender: profile.name || 'Administrator', ...(profile.displayNameKey ? { senderNameKey: profile.displayNameKey } : {}), audience: audienceMap[recipientType], reviewStatus: 'pending', reviewNotes: '', createdAt: new Date().toISOString(), readBy: [] };
      if (!isMessageInSendScope(next, access)) return createResponse({}, 403, i18n.global.t('api.forbidden'));
      const files = isMultipart ? data.getAll('attachments') : [];
      next.attachments = await Promise.all(files.filter((file) => file instanceof File).map(async (file) => ({ id: await saveMockMessageAttachment(file), name: file.name, size: file.size, type: file.type })));
      messages.unshift(next); writeCenter('messages', messages); return createResponse(presentMessage(next, 'sent'));
    }
    const readMatch = url.match(/\/messages\/([^/?]+)\/read$/);
    if (readMatch && method === 'POST') {
      const item = messages.find((entry) => entry.id === decodeURIComponent(readMatch[1]));
      const canRead = item && (isReceived(item) || (item.reviewStatus === 'pending' && isMessageInReviewScope(item, access)));
      if (!canRead) return createResponse({}, 404, i18n.global.t('api.notFound'));
      item.readBy = [...new Set([...(item.readBy || []), currentRole])]; writeCenter('messages', messages);
      return createResponse({ success: true });
    }
  }

  // ==========================================
  // 1. 认证模块 (Auth)
  // ==========================================
  if (url.includes('/auth/login') && method === 'POST') {
    const { username } = data;
    const managedUsers = readCenter('system_users', systemSeed.users);
    const managedUser = managedUsers.find((entry) => entry.username === username);
    if (managedUser) {
      if (managedUser.status === 'disabled') {
        appendSystemAudit({ actor: managedUser.name || username, type: 'login', details: 'Disabled account login rejected', businessNo: username, after: { result: 'rejected' } });
        return createResponse({}, 403, i18n.global.t('api.forbidden'));
      }
      const roleRows = readCenter('system_roles', systemSeed.roles);
      const assignedRole = roleRows.find((entry) => entry.id === managedUser.roleId || entry.code === managedUser.role);
      const profile = { id: managedUser.id, username: managedUser.username, name: managedUser.name, role: assignedRole?.code || managedUser.role || 'operator', department: managedUser.organization, permissionCodes: assignedRole?.permissionCodes || [], reviewScope: assignedRole?.reviewScope || null };
      appendSystemAudit({ actor: profile.name, type: 'login', details: 'Web console login', businessNo: managedUser.username, after: { result: 'success', role: profile.role } });
      return createResponse({ token: `mock-token-${managedUser.id}`, user: profile });
    }
    const user = MOCK_USERS.find(
      (u) => u.username === username || u.role === username || (u.cardNo && u.cardNo === username)
    ) || MOCK_USERS[0];

    if (user.role === 'citizen' || user.role === 'agent') {
      const changedDigest = localStorage.getItem(myStorageKey(user.role, 'password'));
      const matches = changedDigest
        ? await passwordDigest(data.password || '') === changedDigest
        : data.password === 'iq-pass-2026';
      if (!matches) {
        appendSystemAudit({ actor: user.name || username, type: 'login', details: 'Login rejected: invalid credentials', businessNo: username, after: { result: 'rejected' } });
        return createResponse({}, 400, i18n.global.t('my.invalidCredentials'));
      }
    }

    appendSystemAudit({ actor: user.name || user.username || username, type: 'login', details: 'Web console login', businessNo: user.username || username, after: { result: 'success', role: user.role } });
    return createResponse({
      token: user.token,
      user
    });
  }

  if (url.includes('/auth/profile') && method === 'GET') {
    const user = MOCK_USERS[0];
    return createResponse(user);
  }

  if (url.includes('/auth/logout') && method === 'POST') {
    return createResponse({ success: true }, 200, (isEn ? 'Signed out successfully' : '登出成功'));
  }

  // “我的”模块：演示环境按账号角色保存编辑内容，通知正文始终由前端词包渲染。
  if (url.includes('/me/')) {
    const role = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}').role;
    if (!['citizen', 'agent'].includes(role)) return createResponse({}, 403, i18n.global.t('api.forbidden'));

    if (url.endsWith('/me/profile')) {
      const base = {
        email: role === 'citizen' ? 'ahmed@example.com' : 'agent@example.com',
        phone: role === 'citizen' ? '07701234567' : '07701122339',
        address: i18n.global.t(role === 'citizen' ? 'my.demoCitizenAddress' : 'my.demoAgentAddress')
      };
      if (method === 'GET') return createResponse(readMyData(role, 'profile', base));
      if (method === 'PUT') {
        const next = {
          email: String(data.email || '').trim(),
          phone: String(data.phone || '').trim(),
          address: String(data.address || '').trim()
        };
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email) || !/^\+?[\d\s-]{7,20}$/.test(next.phone) || !next.address) {
          return createResponse({}, 400, i18n.global.t('my.invalidProfile'));
        }
        if (role === 'citizen' && next.phone !== readMyData(role, 'profile', base).phone) {
          const proof = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'face_proof')) || 'null');
          if (!proof || proof.token !== data.faceToken || proof.expiresAt < Date.now()) {
            return createResponse({}, 400, i18n.global.t('my.faceRequired'));
          }
          sessionStorage.removeItem(myStorageKey(role, 'face_proof'));
        }
        writeMyData(role, 'profile', next);
        if (role === 'citizen') syncCitizenContact(next);
        return createResponse(next);
      }
    }

    if (url.endsWith('/me/phone/face') && method === 'POST') {
      if (role !== 'citizen' || !data.verifiedAt) return createResponse({}, 400, i18n.global.t('my.faceRequired'));
      const token = crypto.randomUUID();
      sessionStorage.setItem(myStorageKey(role, 'face_proof'), JSON.stringify({ token, expiresAt: Date.now() + 5 * 60000 }));
      return createResponse({ token });
    }

    if (url.endsWith('/me/password/sms') && method === 'POST') {
      if (role !== 'citizen') return createResponse({}, 403, i18n.global.t('api.forbidden'));
      const previous = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'password_sms')) || 'null');
      if (previous && previous.sentAt + 60000 > Date.now()) return createResponse({}, 429, i18n.global.t('my.smsWait'));
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
      sessionStorage.setItem(myStorageKey(role, 'password_sms'), JSON.stringify({ code, sentAt: Date.now(), expiresAt: Date.now() + 5 * 60000, attempts: 0 }));
      return createResponse({ demoCode: code, expiresIn: 300 });
    }

    if (url.endsWith('/me/password') && method === 'POST') {
      if (role === 'citizen') {
        const challenge = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'password_sms')) || 'null');
        if (!challenge || challenge.expiresAt < Date.now() || challenge.attempts >= 5 || challenge.code !== String(data.smsCode || '')) {
          if (challenge) {
            challenge.attempts += 1;
            sessionStorage.setItem(myStorageKey(role, 'password_sms'), JSON.stringify(challenge));
          }
          return createResponse({}, 400, i18n.global.t('my.invalidSmsCode'));
        }
      }
      const previous = localStorage.getItem(myStorageKey(role, 'password'));
      const currentValid = previous
        ? await passwordDigest(data.currentPassword || '') === previous
        : data.currentPassword === 'iq-pass-2026';
      if (!currentValid) return createResponse({}, 400, i18n.global.t('my.currentPasswordWrong'));
      if (String(data.newPassword || '').length < 8) return createResponse({}, 400, i18n.global.t('my.passwordTooShort'));
      localStorage.setItem(myStorageKey(role, 'password'), await passwordDigest(data.newPassword));
      sessionStorage.removeItem(myStorageKey(role, 'password_sms'));
      return createResponse({ success: true });
    }

    if (url.endsWith('/me/notifications') && method === 'GET') {
      return createResponse(getMockNotifications(role));
    }
    if (url.endsWith('/me/notifications/read') && method === 'POST') {
      const items = getMockNotifications(role);
      const ids = Array.isArray(data.ids) ? data.ids : [];
      items.forEach((item) => { if (ids.includes(item.id)) item.read = true; });
      const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
      const part = `complaint_reads_${complaintOwnerId(profile)}`;
      writeMyData(role, part, [...new Set([...readMyData(role, part, []), ...items.filter(item => item.type === 'complaint' && item.read).map(item => item.id)])]);
      writeMyData(role, 'notifications', items);
      return createResponse({ readIds: ids });
    }
    const materialMatch = url.match(/\/me\/notifications\/([^/?]+)\/materials$/);
    if (materialMatch && method === 'POST') {
      if (role !== 'citizen') return createResponse({}, 403, i18n.global.t('api.forbidden'));
      const items = getMockNotifications(role);
      const item = items.find((entry) => entry.id === decodeURIComponent(materialMatch[1]) && entry.type === 'material');
      if (!item) return createResponse({}, 404, i18n.global.t('api.notFound'));
      const file = data.get?.('file');
      if (!file || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
        return createResponse({}, 400, i18n.global.t('my.invalidMaterialFile'));
      }
      const fileId = await saveMockMaterial(role, item.id, file);
      item.materialStatus = 'submitted';
      item.read = true;
      item.attachments = [...(item.attachments || []), { id: fileId, name: file.name, size: file.size, uploadedAt: new Date().toISOString() }];
      writeMyData(role, 'notifications', items);
      return createResponse({ attachments: item.attachments, materialStatus: item.materialStatus });
    }

    if (url.endsWith('/me/push-subscription') && method === 'POST') {
      writeMyData(role, 'push_subscription', { endpoint: data.subscription?.endpoint, locale: data.locale });
      return createResponse({ success: true });
    }

    if (url.includes('/me/couriers')) {
      if (role !== 'agent') return createResponse({}, 403, i18n.global.t('api.forbidden'));
      const couriers = readMyData(role, 'couriers', MY_COURIER_SEEDS.map(item => ({ ...item })));
      const match = url.match(/\/me\/couriers\/([^/?]+)/);
      if (!match && method === 'GET') return createResponse(couriers);
      if (!match && method === 'POST') {
        const courier = {
          id: crypto.randomUUID(), name: String(data.name || '').trim(),
          phone: String(data.phone || '').trim(), vehicleNo: String(data.vehicleNo || '').trim(), active: Boolean(data.active)
        };
        if (!courier.name || !/^\+?[\d\s-]{7,20}$/.test(courier.phone)) return createResponse({}, 400, i18n.global.t('my.invalidCourier'));
        writeMyData(role, 'couriers', [...couriers, courier]);
        addMockNotification(role, 'courier', 'couriers');
        return createResponse(courier);
      }
      const id = match ? decodeURIComponent(match[1]) : '';
      const position = couriers.findIndex(item => item.id === id);
      if (position < 0) return createResponse({}, 404, i18n.global.t('api.notFound'));
      if (method === 'PUT') {
        const courier = {
          ...couriers[position], name: String(data.name || '').trim(),
          phone: String(data.phone || '').trim(), vehicleNo: String(data.vehicleNo || '').trim(), active: Boolean(data.active)
        };
        if (!courier.name || !/^\+?[\d\s-]{7,20}$/.test(courier.phone)) return createResponse({}, 400, i18n.global.t('my.invalidCourier'));
        couriers[position] = courier;
        writeMyData(role, 'couriers', couriers);
        addMockNotification(role, 'courier', 'couriers');
        return createResponse(courier);
      }
      if (method === 'DELETE') {
        writeMyData(role, 'couriers', couriers.filter(item => item.id !== id));
        addMockNotification(role, 'courier', 'couriers');
        return createResponse({ success: true });
      }
    }

    // 受信设备列表：公民与代理均支持手机号验证或人脸验证后删除指定设备登录记录
    if (url.includes('/me/devices')) {
      if (url.endsWith('/me/devices/sms') && method === 'POST') {
        const previous = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'device_sms')) || 'null');
        if (previous && previous.sentAt + 60000 > Date.now()) return createResponse({}, 429, i18n.global.t('my.smsWait'));
        const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
        sessionStorage.setItem(myStorageKey(role, 'device_sms'), JSON.stringify({ code, sentAt: Date.now(), expiresAt: Date.now() + 5 * 60000, attempts: 0 }));
        return createResponse({ demoCode: code, expiresIn: 300 });
      }
      if (url.endsWith('/me/devices/face') && method === 'POST') {
        if (!data.verifiedAt) return createResponse({}, 400, i18n.global.t('my.faceRequired'));
        const token = crypto.randomUUID();
        sessionStorage.setItem(myStorageKey(role, 'device_face'), JSON.stringify({ token, expiresAt: Date.now() + 5 * 60000 }));
        return createResponse({ token });
      }
      const match = url.match(/\/me\/devices\/([^/?]+)/);
      if (!match && method === 'GET') {
        return createResponse(listMyDevices(role));
      }
      if (match && method === 'DELETE') {
        const fingerprint = currentDeviceFingerprint();
        const id = decodeURIComponent(match[1]);
        if (id === fingerprint) return createResponse({}, 400, i18n.global.t('my.deviceCurrentCannotDelete'));
        // 删除前必须通过手机号验证码或人脸验证凭据（二选一）
        const smsChallenge = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'device_sms')) || 'null');
        const faceProof = JSON.parse(sessionStorage.getItem(myStorageKey(role, 'device_face')) || 'null');
        const smsOk = Boolean(data.smsCode) && smsChallenge && smsChallenge.expiresAt >= Date.now()
          && smsChallenge.attempts < 5 && smsChallenge.code === String(data.smsCode);
        const faceOk = Boolean(data.faceToken) && faceProof && faceProof.expiresAt >= Date.now() && faceProof.token === data.faceToken;
        if (!smsOk && !faceOk) {
          if (data.smsCode && smsChallenge && smsChallenge.attempts < 5) {
            smsChallenge.attempts += 1;
            sessionStorage.setItem(myStorageKey(role, 'device_sms'), JSON.stringify(smsChallenge));
          }
          return createResponse({}, 400, i18n.global.t('my.deviceVerifyRequired'));
        }
        const devices = readDevices(role);
        const position = devices.findIndex(item => item.id === id);
        if (position < 0) return createResponse({}, 404, i18n.global.t('api.notFound'));
        devices.splice(position, 1);
        writeMyData(role, 'devices', devices);
        sessionStorage.removeItem(myStorageKey(role, 'device_sms'));
        sessionStorage.removeItem(myStorageKey(role, 'device_face'));
        return createResponse({ success: true });
      }
    }
  }

  // 1.1 纸质配给卡 OCR 扫描识别与有效性比对校验 (返回信息按当前语言国际化)
  if (url.includes('/auth/ocr-paper-card') && method === 'POST') {
    const rt = (key, params) => i18n.global.t(`register.api.${key}`, params);
    if (data.mockInvalid) {
      return createResponse({
        paperCardNo: 'IQ-P-1988-001928',
        headName: rt('ocrInvalidHeadName'),
        province: rt('ocrProvince'),
        district: rt('ocrInvalidDistrict'),
        memberCount: 0,
        isValid: false,
        validationStatus: rt('ocrInvalidStatus'),
        validationNotice: rt('ocrInvalidNotice')
      }, 400, rt('ocrInvalidMsg'));
    }

    return createResponse({
      paperCardNo: 'IQ-P-1994-082194',
      headName: data.headName || i18n.global.t('register.defaultUserName'),
      province: rt('ocrProvince'),
      district: rt('ocrDistrict'),
      memberCount: 5,
      issueYear: '1994',
      branchCode: 'BAG-KARKH-01',
      confidenceScore: 0.985,
      isValid: true,
      validationStatus: rt('ocrValidStatus'),
      validationNotice: rt('ocrValidNotice')
    }, 200, rt('ocrValidMsg'));
  }

  // 1.2 发送手机短信验证码
  if (url.includes('/auth/send-sms') && method === 'POST') {
    const code = '839201'; // 固化演示验证码便于一键填入
    return createResponse({
      smsCode: code,
      phone: data.phone,
      expireSeconds: 300
    }, 200, i18n.global.t('register.api.smsSentMsg', { phone: data.phone || '', code }));
  }

  // 1.3 纸质卡升级换发与公民账号注册
  if (url.includes('/auth/register-citizen') && method === 'POST') {
    const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: newCardNo,
      name: `${data.headName || '新注册持卡人'} (户主)`,
      role: 'citizen',
      department: `${data.province || '巴格达省'}${data.district || '卡尔赫区'}`,
      cardNo: newCardNo,
      token: `jwt-token-citizen-new-${Date.now()}`
    };
    MOCK_USERS.push(newUser);
    return createResponse({
      user: newUser,
      token: newUser.token,
      cardNo: newCardNo
    }, 200, i18n.global.t('register.api.registerSuccessMsg', { cardNo: newCardNo }));
  }

  // 1.4 活体人脸识别与统一国民卡双因子核验
  if (url.includes('/auth/verify-biometric') && method === 'POST') {
    return createResponse({
      passed: true,
      similarityScore: '99.4%',
      chipStatus: 'AUTHENTIC',
      matchNotice: i18n.global.t('register.api.biometricMatchNotice'),
      timestamp: new Date().toISOString()
    }, 200, i18n.global.t('register.api.biometricSuccessMsg'));
  }

  // 1.5 异地家庭成员 GPS 与邀请码远程核查
  if (url.includes('/auth/verify-remote') && method === 'POST') {
    const { memberName, location, locationLabel } = data;
    if (location === 'same' || location === '同一住址') {
      return createResponse({
        passed: false,
        message: i18n.global.t('register.api.remoteSameMsg')
      }, 400, i18n.global.t('register.api.remoteSameTitle'));
    }
    if (!memberName || memberName.trim().length < 2) {
      return createResponse({
        passed: false,
        message: i18n.global.t('register.api.remoteNameMsg')
      }, 400, i18n.global.t('register.api.remoteNameTitle'));
    }
    return createResponse({
      passed: true,
      message: i18n.global.t('register.api.remoteSuccessMsg', {
        name: memberName,
        location: locationLabel || location || ''
      })
    }, 200, i18n.global.t('register.api.remoteSuccessTitle'));
  }

  // ==========================================
  // 2. 公民与家庭管理模块 (Citizen & Family)
  // ==========================================
  if (url.includes('/citizen/families') && method === 'GET') {
    const sharedFams = getSharedFamilies();
    const familyList = sharedFams && sharedFams.length > 0 ? sharedFams : familiesStore;
    return createResponse(localizeFamilyAgentNames(familyList));
  }

  if (url.match(/\/citizen\/family\/([^/]+)/) && method === 'GET') {
    const cardNo = url.split('/').pop();
    const sharedFam = getSharedFamily(cardNo);
    const family = sharedFam || familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    return createResponse(localizeFamilyAgentNames([family])[0]);
  }

  // 申报添加新家庭成员 (POST)
  if (url.match(/\/citizen\/family\/([^/]+)\/members/) && method === 'POST') {
    const cardNo = url.split('/')[3];
    const family = getSharedFamily(cardNo) || familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const newMember = {
      id: `M-${Date.now().toString().slice(-4)}`,
      name: data.name,
      nationalId: data.nationalId,
      familyCode: family.familyCode,
      relation: data.relation || '子女',
      birthDate: data.birthDate || '2020-01-01',
      gender: data.gender || '男',
      status: '正常',
      phone: data.phone || '',
      residenceInfo: data.residenceInfo || family.address,
      isUpdatedInSystem: true,
      faceVerified: true
    };
    family.members.push(newMember);
    family.memberCount = family.members.length;
    updateSharedFamily(family.rationCardNo, { members: family.members, memberCount: family.memberCount });
    syncFamilyAcrossPools(family);

    // 同步更新管理员配给卡管理中的对应配给卡记录 (覆盖所有语言内存池)
    Object.values(multiLangStores).forEach((stores) => {
      const targetCard = (stores.adminCardsStore || []).find((c) => c.cardNo === cardNo || c.cardNo === family.rationCardNo);
      if (targetCard) {
        targetCard.memberCount = family.memberCount;
        targetCard.members = family.members;
        targetCard.quotas = {
          flour: family.memberCount * 9,
          rice: family.memberCount * 3,
          oil: family.memberCount * 1,
          sugar: family.memberCount * 2
        };
      }
    });

    return createResponse(newMember, 200, (isEn ? `New member [${newMember.name}] has been successfully registered and added to the electronic ration card!` : `新成员【${newMember.name}】已成功申报登记并纳入电子配给卡！`));
  }

  // 更新成员信息与状态（支持冻结/解冻/资料修改）(PUT)
  if (url.match(/\/citizen\/members\/([^/]+)/) && method === 'PUT') {
    const memberId = url.split('/').pop();
    const sharedFams = getSharedFamilies();
    sharedFams.forEach((f) => {
      const target = f.members.find((m) => m.id === memberId || m.nationalId === memberId);
      if (target) {
        Object.assign(target, data, { isUpdatedInSystem: true });
        updateSharedFamily(f.rationCardNo, { members: f.members });
      }
    });

    familiesStore.forEach((f) => {
      const target = f.members.find((m) => m.id === memberId || m.nationalId === memberId);
      if (target) {
        Object.assign(target, data, { isUpdatedInSystem: true });
      }
    });

    Object.values(multiLangStores).forEach((stores) => {
      (stores.adminCardsStore || []).forEach((c) => {
        const target = (c.members || []).find((m) => m.id === memberId || m.nationalId === memberId);
        if (target) Object.assign(target, data);
      });
      (stores.adminFamiliesStore || []).forEach((fam) => {
        const target = (fam.members || []).find((m) => m.id === memberId || m.nationalId === memberId);
        if (target) Object.assign(target, data);
      });
    });

    const isFreezeAction = data.status === '已冻结' || data.status === 'Frozen' || data.status === '冻结';
    const isUnfreezeAction = data.status === '正常' || data.status === 'Active';
    let msg = (isEn ? 'Family member information updated successfully' : '家庭成员信息已成功更新');
    if (isFreezeAction) {
      msg = (isEn ? `Coverage qualification of the member frozen successfully (Reason: ${data.freezeReason || 'regulatory compliance freeze'})` : `已成功冻结该成员纳保资格 (原因: ${data.freezeReason || (isEn ? 'regulatory compliance freeze' : '监管合规冻结')})`);
    } else if (isUnfreezeAction) {
      msg = (isEn ? 'The member freeze has been lifted successfully; ration supply coverage restored' : '已成功解除该成员冻结状态，恢复口粮配给保障');
    }

    return createResponse({ success: true, memberId }, 200, msg);
  }

  // 变更户主 (POST)
  if (url.includes('/citizen/change-head') && method === 'POST') {
    const { cardNo, newHeadId, deathProofNo } = data;
    const ticketId = `REV-DTH-${Date.now().toString().slice(-4)}`;
    
    // 生成电子审核工单流转
    const newTicket = {
      id: ticketId,
      source: isEn ? 'Change Head' : '变更户主',
      categoryType: isEn ? 'Deceased Head Deregistration & Succession Appointment' : '户主死亡注销与继承任命',
      appType: isEn ? 'Change Head (Forensic Deceased Verification)' : '变更户主 (死亡医学鉴定核验)',
      cardNo: cardNo || 'RC-10029381',
      applicantName: isEn ? 'Successor Head Candidate' : '继承户主候选人',
      targetMemberName: isEn ? 'Former Head → New Legal Head' : '原户主 → 新任法定户主',
      reason: isEn ? `Former head deregistered as deceased; successor head appointment requested per forensic letter [${deathProofNo}].` : `原户主身故注销，依据法医公函【${deathProofNo}】申请指定继任户主。`,
      status: isEn ? 'Pending Staff Review' : '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: isEn ? 'Pending' : '待决',
      attachments: [{ name: isEn ? `Ministry_of_Health_Forensic_Death_Certificate_${deathProofNo}.pdf` : `卫生部法医总局_死亡证明_${deathProofNo}.pdf`, type: 'required', verified: true }],
      payload: { newHeadId, deathProofNo, cardNo }
    };
    ticketsStore.unshift(newTicket);
    addSharedTicket(newTicket);

    return createResponse({ ticketId }, 200, isEn ? `Change-head application submitted! Routed to [Audit Workbench] (Ticket No. ${ticketId})` : `户主变更申请已提交！已自动转入【审核工作台】(工单号 ${ticketId})`);
  }

  // 申请解冻 (POST)
  if (url.includes('/citizen/apply-unfreeze') && method === 'POST') {
    const { cardNo, unfreezeType, targetMemberId, targetMemberName, targetNationalId, docName } = data;
    const targetFamily = getSharedFamilies().find((family) => family.rationCardNo === cardNo)
      || familiesStore.find((family) => family.rationCardNo === cardNo);
    const targetMember = targetFamily?.members?.find((member) => matchesUnfreezeMember(member, { targetMemberId, targetNationalId }));
    if (!targetMember || (!targetMember.freezeReason && !/冻结|Frozen|مجمد|بەستراو/i.test(targetMember.status || ''))) {
      return createResponse({}, 400, i18n.global.t('unfreeze.errorSelectMember'));
    }
    const ticketId = `REV-UNF-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id: ticketId,
      sourceCode: 'UNF',
      source: isEn ? 'Unfreeze Card' : '申请解冻',
      categoryType: isEn ? `Unfreeze Appeal (${unfreezeType} Scenario)` : `解冻申诉 (${unfreezeType}情形)`,
      appType: isEn ? `Unfreeze Application (${unfreezeType} Scenario)` : `解冻申请 (${unfreezeType}情形)`,
      cardNo: cardNo || 'RC-10029381',
      applicantName: isEn ? 'Ration Card Holder' : '配给卡持有人',
      targetMemberName: targetMember.name || targetMemberName || (isEn ? 'Unfreeze Subject Member' : '解冻当事人'),
      reason: isEn ? `Supporting material [${docName}] submitted under the [${unfreezeType}] scenario; ration entitlements restoration requested.` : `依据【${unfreezeType}】情形提交证明材料【${docName}】，申请恢复配给。`,
      status: isEn ? 'Pending Staff Review' : '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: isEn ? 'Pending' : '待决',
      attachments: [{ name: docName, type: 'required', verified: true }],
      payload: { cardNo, targetMemberId, targetMemberName: targetMember.name || targetMemberName, targetNationalId: targetMember.nationalId || targetNationalId, unfreezeType, docName }
    };
    ticketsStore.unshift(newTicket);
    addSharedTicket(newTicket);

    return createResponse({ ticketId }, 200, isEn ? `Unfreeze application accepted! Routed to [Audit Workbench] (Ticket No. ${ticketId})` : `解冻申请已受理！已转入【审核工作台】(工单号 ${ticketId})`);
  }

  // 申请分户：优先系统智能自动判别 (POST)
  if (url.includes('/citizen/split-household/auto-judge') && method === 'POST') {
    const { memberIds, currentCardNo } = data;
    const family = familiesStore.find((f) => f.rationCardNo === currentCardNo) || familiesStore[0];
    const selectedMembers = (family?.members || []).filter((m) => memberIds.includes(m.id));

    // 双路径条件来自「业务规则配置」：自动受理开关、家庭编号一致性、最低年龄
    const splitRule = autoAcceptRuleFor('SPL');
    const splitRulesVersion = getBusinessRulesVersion();
    const hasMale = selectedMembers.some((m) => m.gender === '男');
    const hasFemale = selectedMembers.some((m) => m.gender === '女');
    const isCouple = selectedMembers.length >= 2 && hasMale && hasFemale;
    const familyCodePassed = !splitRule.requireSameFamilyCode
      || selectedMembers.every((m) => !m.familyCode || !family?.familyCode || m.familyCode === family.familyCode);
    const ageThreshold = Number(splitRule.minAge) || 0;
    const agePassed = ageThreshold <= 0
      || selectedMembers.every((m) => {
        const age = ageFromBirthDate(m.birthDate);
        return age === null || age >= ageThreshold;
      });
    const judgePassed = Boolean(splitRule.autoAccept) && isCouple && familyCodePassed && agePassed;

    if (judgePassed) {
      // 判别通过：自动执行分户并签发新卡
      const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
      const newFamilyCode = `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`;
      const headCandidate = selectedMembers.find((m) => m.gender === '男') || selectedMembers[0];

      const splitFamily = {
        rationCardNo: newCardNo,
        oldPaperCardNo: 'NEW-SPLIT-AUTO',
        familyCode: newFamilyCode,
        province: family.province,
        district: family.district,
        headName: headCandidate.name,
        phone: headCandidate.phone || family.phone,
        memberCount: selectedMembers.length,
        status: '正常',
        agentId: family.agentId,
        agentName: family.agentName,
        address: headCandidate.residenceInfo || family.address,
        createdDate: new Date().toISOString().split('T')[0],
        lastSelfCheckDate: new Date().toISOString().split('T')[0],
        members: selectedMembers.map((m) => ({
          ...m,
          familyCode: newFamilyCode,
          relation: m.id === headCandidate.id ? '户主' : m.gender === '女' ? '配偶' : '子女',
          isUpdatedInSystem: true
        }))
      };

      // 从原家庭剔除分立成员
      family.members = family.members.filter((m) => !memberIds.includes(m.id));
      family.memberCount = family.members.length;
      updateSharedFamily(family.rationCardNo, { members: family.members, memberCount: family.memberCount });
      syncFamilyAcrossPools(family);
      familiesStore.unshift(splitFamily);

      return createResponse({
        passed: true,
        newCardNo,
        rulesVersion: splitRulesVersion,
        message: i18n.global.t('businessRules.autoJudgePassed', { version: splitRulesVersion, cardNo: newCardNo })
      });
    }

    // 判别未通过：按未命中的条件给出原因
    const reasonCode = selectedMembers.length === 1
      ? 'SINGLE_MEMBER'
      : !isCouple
        ? 'NON_SPOUSAL_GROUP'
        : !familyCodePassed
          ? 'FAMILY_CODE_MISMATCH'
          : 'AGE_BELOW_THRESHOLD';
    const reasonKey = {
      SINGLE_MEMBER: 'businessRules.autoJudgeFailedSingle',
      NON_SPOUSAL_GROUP: 'businessRules.autoJudgeFailedGroup',
      FAMILY_CODE_MISMATCH: 'businessRules.autoJudgeFailedFamily',
      AGE_BELOW_THRESHOLD: 'businessRules.autoJudgeFailedAge'
    }[reasonCode];
    const reason = i18n.global.t(reasonKey, { age: ageThreshold });
    return createResponse({
      passed: false,
      reasonCode,
      rulesVersion: splitRulesVersion,
      reason,
      message: reason
    });
  }

  // 申请分户：提交分部电子审核 (POST)
  if (url.includes('/citizen/split-household/submit-review') && method === 'POST') {
    const { currentCardNo, memberIds, reason } = data;
    const ticketId = `REV-SPL-${Date.now().toString().slice(-4)}`;
    const splitApprovalLevel = getApprovalLevels('SPL');

    const newTicket = {
      id: ticketId,
      source: isEn ? 'Split Household' : '申请分户',
      categoryType: memberIds.length === 1 ? (isEn ? 'Single Person Household Split Manual Audit' : '单人分户人工审核') : (isEn ? 'Non-Spousal Combination Split Audit' : '非夫妻组合分户审核'),
      appType: isEn ? `Ration Card Split (${memberIds.length === 1 ? 'Single Person Split' : 'Non-Spousal Combination'})` : `配给卡分户 (${memberIds.length === 1 ? '单人分立' : '非夫妻组合'})`,
      cardNo: currentCardNo || 'RC-10029381',
      applicantName: isEn ? 'Original Head of Household / Applicant' : '原家庭户主/申请人',
      targetMemberName: isEn ? `Split Members (${memberIds.length})` : `分立人员(${memberIds.length}人)`,
      reason: reason || (isEn ? 'Automatic judge failed; routed to branch staff for manual review' : '系统自动判别未通过，转交分部门人员手动审核'),
      status: splitApprovalLevel === 'manager'
        ? (isEn ? 'Pending Manager Review' : '待经理终审')
        : (isEn ? 'Pending Staff Review' : '待分部初审'),
      approvalLevel: splitApprovalLevel,
      rulesVersion: getBusinessRulesVersion(),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: isEn ? 'Pending' : '待决',
      attachments: [
        { name: isEn ? 'Civil_Marriage_Certificate_or_Equivalent_Split_Judicial_Document.pdf' : '民事结婚证书或等效分户司法文件.pdf', type: 'required', verified: true }
      ],
      payload: { splitMemberIds: memberIds }
    };
    ticketsStore.unshift(newTicket);
    addSharedTicket(newTicket);

    return createResponse({ ticketId }, 200, isEn ? `Electronic review submitted successfully! Ticket No. [${ticketId}], pending manual review by branch staff` : `已成功提交电子审核！工单号【${ticketId}】，等待分部门人员手动审核`);
  }

  // 代理转移候选分部、中心及代理元数据 (GET)
  if (url.includes('/citizen/transfer-agent/options') && method === 'GET') {
    return createResponse(TRANSFER_BRANCH_OPTIONS);
  }

  // 提交配给卡代理转移申请 (POST)
  if (url.includes('/citizen/transfer-agent/submit') && method === 'POST') {
    const {
      cardNo,
      fromProvince,
      toProvince,
      toBranch,
      toCenter,
      toFlourAgent,
      toFoodAgent,
      district,
      subDistrict,
      nearestLandmark,
      residenceProofDoc,
      article140Doc
    } = data;

    // 1. 容量红线检查（阈值来自「业务规则配置 · 户数阈值」）
    const capacityRedline = getHouseholdThresholds().capacityRedline;
    if (toFlourAgent?.currentHouseholds >= capacityRedline) {
      return createResponse({}, 400, (isEn ? `The selected flour agent [${toFlourAgent.name}] has reached the ${capacityRedline.toLocaleString()}-household service ceiling; transfer-in prohibited, please choose another station!` : `所选面粉代理【${toFlourAgent.name}】已达 ${capacityRedline.toLocaleString()} 户服务上限，禁止转入，请选择其他网点！`));
    }
    if (toFoodAgent?.currentHouseholds >= capacityRedline) {
      return createResponse({}, 400, (isEn ? `The selected food agent [${toFoodAgent.name}] has reached the ${capacityRedline.toLocaleString()}-household service ceiling; transfer-in prohibited, please choose another station!` : `所选食品代理【${toFoodAgent.name}】已达 ${capacityRedline.toLocaleString()} 户服务上限，禁止转入，请选择其他网点！`));
    }

    const family = getSharedFamily(cardNo) || familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const fromProvinceKey = transferProvinceKey(fromProvince);
    const toProvinceKey = transferProvinceKey(toProvince);
    const isIntraProvince = fromProvince && toProvince && (
      fromProvinceKey !== fromProvince && toProvinceKey !== toProvince
        ? fromProvinceKey === toProvinceKey
        : fromProvince.split(' ')[0] === toProvince.split(' ')[0]
    );

    // 双路径判定：规则配置决定自动受理条件（地区范围）与转人工后的审批层级
    const transferRule = autoAcceptRuleFor('TRF');
    const regionAllowed = transferRule.regionScope === 'any'
      || (transferRule.regionScope === 'intra-province' ? isIntraProvince : !isIntraProvince);
    const autoApproved = Boolean(transferRule.autoAccept && regionAllowed);
    const transferRulesVersion = getBusinessRulesVersion();
    const transferApprovalLevel = getApprovalLevels('TRF');

    if (autoApproved) {
      // 路径 A: 命中自动受理条件（默认省内转移，全自动批准）
      family.province = toProvince;
      family.district = `${toBranch} · ${toCenter?.centerName || ''}`;
      family.agentId = `${toFlourAgent?.id || 'FA'} / ${toFoodAgent?.id || 'FD'}`;
      family.agentName = `${toFlourAgent?.name || ''} ＆ ${toFoodAgent?.name || ''}`;
      family.address = `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`;

      updateSharedFamily(family.rationCardNo, {
        province: family.province,
        district: family.district,
        agentId: family.agentId,
        agentName: family.agentName,
        address: family.address
      });

      return createResponse({
        autoApproved: true,
        passed: true,
        rulesVersion: transferRulesVersion,
        message: (isEn ? `[Auto-Approved by Rule v${transferRulesVersion}] The ration card has been automatically transferred to [${toFlourAgent?.name}] and [${toFoodAgent?.name}]; card agents and supply points updated instantly!` : `【命中自动受理规则 v${transferRulesVersion}】已自动将配给卡转移至【${toFlourAgent?.name}】与【${toFoodAgent?.name}】，配给卡代理及供货点已即时更新生效！`)
      }, 200, isEn ? 'Transfer auto-approved by rule configuration.' : '已按业务规则自动批准生效！');
    } else {
      // 路径 B: 未命中自动受理条件 (流转至审核工作台，层级由审批矩阵决定)
      const ticketId = `REV-TRF-${Date.now().toString().slice(-4)}`;
      const crossProvince = !isIntraProvince;
      const managerLevel = transferApprovalLevel === 'manager';
      const newTicket = {
        id: ticketId,
        source: isEn ? 'Transfer Agent' : '代理转移',
        categoryType: isEn
          ? (crossProvince ? 'Cross-Governorate Agent Transfer Two-Tier Approval' : 'Intra-Governorate Agent Transfer Manual Review')
          : (crossProvince ? '跨省代理转移两级审批' : '省内代理转移人工审核'),
        appType: isEn
          ? `${crossProvince ? 'Cross-Governorate' : 'Intra-Governorate'} Agent Transfer (${fromProvince} → ${toProvince})`
          : `${crossProvince ? '跨省' : '省内'}代理转移 (${fromProvince} → ${toProvince})`,
        cardNo: cardNo || family.rationCardNo,
        applicantName: family.headName,
        targetMemberName: isEn ? `${family.headName} (Whole Household, ${family.memberCount} Members)` : `${family.headName} (全户 ${family.memberCount} 人)`,
        reason: isEn ? `Relocated from [${fromProvince}] to [${toProvince} · ${toBranch} · ${toCenter?.centerName}] for work/family reasons; requesting nearby flour agent [${toFlourAgent?.name}] and food agent [${toFoodAgent?.name}] transfer.` : `因工作/家庭迁居由【${fromProvince}】迁往【${toProvince} · ${toBranch} · ${toCenter?.centerName}】，申请就近转移面粉代理【${toFlourAgent?.name}】与食品代理【${toFoodAgent?.name}】。`,
        status: managerLevel
          ? (isEn ? 'Pending Manager Review' : '待经理终审')
          : (isEn ? 'Pending Staff Review' : '待分部初审'),
        approvalLevel: transferApprovalLevel,
        rulesVersion: transferRulesVersion,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: isEn ? 'Pending' : '待决',
        attachments: [
          { name: residenceProofDoc || (isEn ? 'Residence_Certificate_of_New_Destination_Confirmation_Letter.pdf' : '新迁入地居住证及确认证明公函.pdf'), type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'transferAgent',
          cardNo: cardNo || family.rationCardNo,
          toProvince,
          toBranch,
          toCenterName: toCenter?.centerName,
          toFlourAgent,
          toFoodAgent,
          newAddress: isEn ? `${toProvince} ${district || ''} ${subDistrict || ''} (Landmark: ${nearestLandmark || 'Nearby Block'})` : `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`
        }
      };
      ticketsStore.unshift(newTicket);
      addSharedTicket(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        rulesVersion: transferRulesVersion,
        approvalLevel: transferApprovalLevel,
        message: isEn ? `Agent transfer application submitted! Routed to the audit workbench of [${toProvince}] (rule v${transferRulesVersion}), Ticket No.: ${ticketId}.` : `代理转移申请已提交！已流转至【${toProvince}】审核工作台（规则 v${transferRulesVersion}），工单编号：${ticketId}。`
      }, 200, isEn ? `Transfer routed to the audit workbench (Ticket No. ${ticketId})` : `转移申报已转入审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 2.2 成员转移业务 (Member Transfer)
  // ==========================================
  // 成员转移候选池 (GET)
  if (url.includes('/citizen/member-transfer/candidates') && method === 'GET') {
    return createResponse(transferableMembersStore);
  }

  // 根据国民编号查询待转移成员档案与状态 (GET)
  if (url.includes('/citizen/member-transfer/query') && method === 'GET') {
    const cleanUrl = url.split('?')[0];
    const nationalId = cleanUrl.replace(/\/+$/, '').split('/').pop().trim();

    const found = transferableMembersStore.find((m) => m.nationalId === nationalId);
    if (!found) {
      return createResponse({}, 404, (isEn ? `The national population registry database found no registered citizen file for national number [${nationalId}]; please verify and retry.` : `国家人口在册档案数据库未查找到国民编号为【${nationalId}】的在册公民档案，请核对后重试。`));
    }
    return createResponse(found);
  }

  // 提交成员转移申请 (POST)
  if (url.includes('/citizen/member-transfer/submit') && method === 'POST') {
    const {
      targetCardNo,
      nationalId,
      member: reqMember,
      transferType: reqTransferType,
      transferReasonType,
      article140Doc,
      article140DocName,
      reasonDoc,
      proofDocName,
      paymentInfo
    } = data;

    const transferType = reqTransferType || transferReasonType || 'wife';
    const effectiveNationalId = nationalId || reqMember?.nationalId;
    let member = reqMember || transferableMembersStore.find((m) => m.nationalId === effectiveNationalId);

    // 若通过 ID 未找到，动态构建有效在册人员以确保全流程演示通畅
    if (!member) {
      member = {
        nationalId: effectiveNationalId || '198302194821',
        name: '萨米拉·卡西姆·哈米德',
        relationType: transferType,
        gender: transferType === 'wife' ? '女' : '男',
        birthDate: '1983-02-19',
        fatherName: '卡西姆·哈米德',
        familyCode: 'FAM-BAG-08832',
        currentCardNo: 'RC-99081293',
        currentProvince: '巴格达省 (Baghdad)',
        currentCenterName: '鲁萨法第二配给中心 (#08)',
        isArticle140Area: false,
        isUpdatedInSystem: true,
        faceVerified: true
      };
    }

    // 核心前置拦截：未在系统中更新的成员禁止转移
    if (member.isUpdatedInSystem === false) {
      return createResponse({}, 400, (isEn ? '[Precondition Not Met]: The member has not completed registration update in the ration card system; national law strictly prohibits transfer processing!' : '【前置条件未满足】：该成员未在配给卡系统中完成登记更新，国家法令严禁办理转移业务！'));
    }

    const currentFamily = familiesStore.find((f) => f.rationCardNo === targetCardNo) || familiesStore[0];
    const isArticle140 = !!(member.isArticle140Area || currentFamily.province.includes('基尔库克') || currentFamily.province.includes('迪亚拉') || currentFamily.province.includes('尼尼微'));

    // 业务规则配置：自动受理开关与年龄门槛
    const memberRule = autoAcceptRuleFor('TRM');
    const memberRulesVersion = getBusinessRulesVersion();
    const memberAge = ageFromBirthDate(member.birthDate);
    const memberAgePassed = memberRule.minAge <= 0 || memberAge === null || memberAge >= memberRule.minAge;

    let autoApproved = false;
    let reasonText = '';

    // 5. 按成员类型划分的自动批准条件
    if (transferType === 'wife') {
      // 5.1 妻子转移：同家庭编号 且 双方父亲姓名不同
      // 夫家父亲名 (艾哈迈德的父亲为哈桑·萨利赫)
      const isIdentified = (member.familyCode === currentFamily.familyCode) && (member.fatherName !== '哈桑·萨利赫');
      if (isIdentified) {
        autoApproved = true;
        reasonText = (isEn ? '[Wife Auto-Identification Passed]: The wife and the new card head belong to registered family files with different father names (excluding close kin); automatically approved.' : '【妻子自动识别通过】：妻子与新卡户主同属已登记家庭档案，且双方父亲姓名不同（排除近亲），系统自动核准通过。');
      } else {
        autoApproved = false;
        reasonText = (isEn ? 'The system could not auto-match wife association information (family files out of sync or kinship identification anomaly); the application is routed to the ration branch two-tier electronic review.' : '系统未能自动匹配妻子关联信息（家庭档案未同步或近亲识别异常），申请转交配给分部两级电子审核。');
      }
    } else if (transferType === 'child') {
      // 5.2 子女转移
      if (isArticle140) {
        // 在第140号决议地区以内：子女转移始终须经配给分部员工电子审核，并上传第140号决议无异议文件
        autoApproved = false;
        reasonText = (isEn ? 'The area falls under Article 140 disputed coverage; per national regulations, child transfer must be routed to the receiving branch two-tier manual electronic review with a no-objection letter filed.' : '涉及第140号决议争议覆盖区域，依据国家法规，子女转移必须转交转入分部两级人工电子审核并备案无异议公函。');
      } else {
        // 在第140号决议地区以外：同时满足 1.家庭编号一致 2.父亲名字与新卡户主一致
        const famCodeMatch = member.familyCode === currentFamily.familyCode;
        const fatherNameMatch = member.fatherName === currentFamily.headName;
        if (famCodeMatch && fatherNameMatch) {
          autoApproved = true;
          reasonText = (isEn ? '[Child Auto-Identification Passed]: The child matches the new card family code and the biological father name matches the new card head; transfer auto-approved.' : '【子女自动识别通过】：子女与新卡家庭编号一致且生父姓名与新卡户主一致，系统自动批准转移。');
        } else {
          autoApproved = false;
          reasonText = (isEn ? 'Kinship comparison information does not fully match; the application is routed to ration branch staff for electronic review.' : '子女亲属比对信息未完全吻合，申请转交配给分部员工进行电子审核。');
        }
      }
    } else {
      // 5.3 其他情况（监护、抚养或其他原因）：始终须经配给分部员工电子审核
      autoApproved = false;
      reasonText = (isEn ? `The transfer reason falls under [${transferType === 'guardianship' ? 'Legal Guardianship' : transferType === 'support' ? 'Kinship Support' : 'Special Statutory Reasons'}]; two-tier manual review of statutory certification documents by the ration branch is required by law.` : `转移事由属于【${transferType === 'guardianship' ? (isEn ? 'Legal Guardianship' : '法定监护') : transferType === 'support' ? (isEn ? 'Kinship Support' : '亲属抚养') : (isEn ? 'Special Statutory Reasons' : '特殊法定原因')}】，依法须经配给分部两级人工审查法定证明公文。`);
    }

    // 规则配置优先于默认判定：关闭自动受理或未达年龄门槛时转人工
    if (autoApproved && (!memberRule.autoAccept || !memberAgePassed)) {
      autoApproved = false;
      reasonText = !memberAgePassed
        ? i18n.global.t('businessRules.autoJudgeFailedAge', { age: memberRule.minAge })
        : i18n.global.t('businessRules.autoAcceptDisabled');
    }

    if (autoApproved) {
      // 路径 1: 自动批准：将成员正式移入当前家庭
      const newMember = {
        id: `M-TRF-${Date.now().toString().slice(-4)}`,
        name: member.name,
        nationalId: member.nationalId,
        familyCode: currentFamily.familyCode,
        relation: transferType === 'wife' ? '配偶' : '子女',
        birthDate: member.birthDate || '1995-01-01',
        gender: member.gender || '女',
        status: '正常',
        phone: member.phone || currentFamily.phone,
        residenceInfo: currentFamily.address,
        isUpdatedInSystem: true,
        faceVerified: true
      };

      currentFamily.members.push(newMember);
      currentFamily.memberCount = currentFamily.members.length;
      updateSharedFamily(currentFamily.rationCardNo, { members: currentFamily.members, memberCount: currentFamily.memberCount });
      syncFamilyAcrossPools(currentFamily);

      // 从候选池移除
      transferableMembersStore = transferableMembersStore.filter((m) => m.nationalId !== member.nationalId); activeStores.transferableMembersStore = transferableMembersStore;

      return createResponse({
        autoApproved: true,
        passed: true,
        rulesVersion: memberRulesVersion,
        member: newMember,
        message: (isEn ? `[Member Transfer Fully Auto-Approved] ${reasonText}; new member [${member.name}] has been successfully moved into your electronic ration card!` : `【成员转移全自动批准生效】${reasonText}，新成员【${member.name}】已成功移入您的电子配给卡！`)
      }, 200, '成员转移已自动批准并即刻生效！');
    } else {
      // 路径 2: 电子审核：转入配给分部工作台 (层级由审批矩阵决定)
      const ticketId = `REV-MEM-${Date.now().toString().slice(-4)}`;
      const memberApprovalLevel = getApprovalLevels('TRM');
      const newTicket = {
        id: ticketId,
        source: isEn ? 'Member Entry' : '成员转移',
        categoryType: transferType === 'wife' ? (isEn ? 'Wife Transfer Manual Verification' : '妻子转移人工核验') : transferType === 'child' ? (isEn ? 'Child Cross-Card Transfer Audit' : '子女跨卡转移审核') : (isEn ? 'Legal Guardianship/Support Cross-Card Transfer' : '法定监护/抚养跨卡转移'),
        appType: isEn ? `Cross-Card Member Transfer (${member.name})` : `跨卡成员转移 (${member.name})`,
        cardNo: targetCardNo || currentFamily.rationCardNo,
        applicantName: currentFamily.headName,
        targetMemberName: isEn ? `${member.name} (National ID: ${member.nationalId})` : `${member.name} (国民号: ${member.nationalId})`,
        reason: isEn ? `${reasonText} Original card registered at [${member.currentProvince} · ${member.currentCenterName}]` : `${reasonText} 原持卡所属【${member.currentProvince} · ${member.currentCenterName}】`,
        status: memberApprovalLevel === 'manager'
          ? (isEn ? 'Pending Manager Review' : '待经理终审')
          : (isEn ? 'Pending Staff Review' : '待分部初审'),
        approvalLevel: memberApprovalLevel,
        rulesVersion: memberRulesVersion,
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: isEn ? 'Pending' : '待决',
        attachments: [
          { name: reasonDoc || (isEn ? 'Kinship_Legal_Relationship_Certificate_Letter.pdf' : '亲属法律关系证明公函.pdf'), type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'memberTransfer',
          targetCardNo,
          member,
          transferType
        }
      };
      ticketsStore.unshift(newTicket);
      addSharedTicket(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        message: isEn ? `Member transfer application accepted! Ticket No. [${ticketId}], routed to the receiving branch audit workbench; pending two-tier endorsement by branch officer and manager.` : `成员转移申请已受理！工单号【${ticketId}】，已转入接收分部审核工作台，请等待分部专员与经理两级终审签批。`
      }, 200, isEn ? `Successfully routed to branch electronic audit workbench (Ticket No. ${ticketId})` : `已成功转入分部电子审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 公民配给品购买与申领模块 (Citizen Purchase & Quota)
  // ==========================================

  // 1. 查询家庭当月核定配额与剩余额度 (GET)
  if (url.includes('/citizen/ration/quota-balance') && method === 'GET') {
    const cardNo = url.split('/').pop() || 'RC-10029381';
    // 与家庭档案 GET 接口同源：优先读跨标签页共享存储 (含页面刷新后持久化的成员数)，再回退语言内存池
    const family = getSharedFamily(cardNo) || familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    // 家庭额度按有效纳保成员数计算 (冻结成员不计入额度)
    const memberCount = getActiveMemberCount(family) || family?.memberCount || family?.members?.length || 4;

    // 计算当月已购数量 (从订单历史汇总)
    const cardOrders = getSharedOrderPool(localeCode).filter((o) => o.cardNo === cardNo && o.status !== 'CANCELLED');
    const consumedMap = {
      'FLOUR-WHT-02': 0,
      'RICE-BAS-01': 0,
      'OIL-SUN-03': 0,
      'SUGAR-WHT-04': 0
    };
    cardOrders.forEach((ord) => {
      (ord.items || []).forEach((it) => {
        if (consumedMap[it.itemCode] !== undefined) {
          consumedMap[it.itemCode] += Number(it.qty) || 0;
        }
      });
    });

    // 人均月度定额来自「业务规则配置 · 配额标准」（调整后顺延至下一周期生效）
    const perPersonQuota = {
      'FLOUR-WHT-02': quotaPerPerson('FLOUR-WHT-02'),
      'RICE-BAS-01': quotaPerPerson('RICE-BAS-01'),
      'OIL-SUN-03': quotaPerPerson('OIL-SUN-03'),
      'SUGAR-WHT-04': quotaPerPerson('SUGAR-WHT-04')
    };
    const quotaList = [
      {
        itemCode: 'FLOUR-WHT-02',
        itemName: isEn ? 'Premium Flour' : '特级面粉',
        category: '面粉',
        unit: 'kg',
        standardPerPerson: perPersonQuota['FLOUR-WHT-02'],
        totalHouseholdQuota: memberCount * perPersonQuota['FLOUR-WHT-02'],
        consumedQuota: consumedMap['FLOUR-WHT-02'],
        remainingQuota: Math.max(0, memberCount * perPersonQuota['FLOUR-WHT-02'] - consumedMap['FLOUR-WHT-02']),
        guidePriceIQD: 250,
        marketPriceIQD: 1200,
        subsidyIQD: 950,
        packSize: isEn ? '50kg/bag' : '50kg/袋',
        origin: isEn ? 'Iraq Central Strategic Flour Mill' : '伊拉克中央保供面粉厂',
        stockStatus: isEn ? 'In Stock' : '有现货'
      },
      {
        itemCode: 'RICE-BAS-01',
        itemName: isEn ? 'Premium Rice' : '精制大米',
        category: '大米',
        unit: 'kg',
        standardPerPerson: perPersonQuota['RICE-BAS-01'],
        totalHouseholdQuota: memberCount * perPersonQuota['RICE-BAS-01'],
        consumedQuota: consumedMap['RICE-BAS-01'],
        remainingQuota: Math.max(0, memberCount * perPersonQuota['RICE-BAS-01'] - consumedMap['RICE-BAS-01']),
        guidePriceIQD: 500,
        marketPriceIQD: 2500,
        subsidyIQD: 2000,
        packSize: isEn ? '25kg/bag' : '25kg/袋',
        origin: isEn ? 'National Grain Import & Export Directorate' : '国家粮食进出口总局',
        stockStatus: isEn ? 'In Stock' : '有现货'
      },
      {
        itemCode: 'OIL-SUN-03',
        itemName: isEn ? 'Edible Vegetable Oil' : '食用植物油',
        category: '食用油',
        unit: 'L',
        standardPerPerson: perPersonQuota['OIL-SUN-03'],
        totalHouseholdQuota: memberCount * perPersonQuota['OIL-SUN-03'],
        consumedQuota: consumedMap['OIL-SUN-03'],
        remainingQuota: Math.max(0, memberCount * perPersonQuota['OIL-SUN-03'] - consumedMap['OIL-SUN-03']),
        guidePriceIQD: 1000,
        marketPriceIQD: 4500,
        subsidyIQD: 3500,
        packSize: isEn ? '1L/bottle' : '1L/瓶',
        origin: isEn ? 'Tigris Edible Oil Refinery' : '底格里斯精炼食用油厂',
        stockStatus: isEn ? 'In Stock' : '有现货'
      },
      {
        itemCode: 'SUGAR-WHT-04',
        itemName: isEn ? 'Refined White Sugar' : '纯精白糖',
        category: '白糖',
        unit: 'kg',
        standardPerPerson: perPersonQuota['SUGAR-WHT-04'],
        totalHouseholdQuota: memberCount * perPersonQuota['SUGAR-WHT-04'],
        consumedQuota: consumedMap['SUGAR-WHT-04'],
        remainingQuota: Math.max(0, memberCount * perPersonQuota['SUGAR-WHT-04'] - consumedMap['SUGAR-WHT-04']),
        guidePriceIQD: 500,
        marketPriceIQD: 2000,
        subsidyIQD: 1500,
        packSize: isEn ? '10kg/bag' : '10kg/袋',
        origin: isEn ? 'Maysan Grain & Sugar State Reserve' : '米桑糖业联合储备库',
        stockStatus: isEn ? 'In Stock' : '有现货'
      }
    ];

    return createResponse({
      cardNo,
      headName: family?.headName || (isEn ? 'Ahmed Hassan Saleh' : '艾哈迈德·哈桑·萨利赫'),
      memberCount,
      agentId: family?.agentId || 'FA-00128',
      agentName: family?.agentName || (isEn ? 'Baghdad Karkh 1st Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)'),
      province: family?.province || (isEn ? 'Baghdad' : '巴格达省'),
      district: family?.district || (isEn ? 'Karkh' : '卡尔赫区'),
      defaultAddress: family?.address || (isEn ? 'Bldg 3, Apt 201, Haifa St 88, Karkh, Baghdad' : '巴格达省卡尔赫区海法街88号 3号楼201'),
      phone: family?.phone || '+964 780 123 4567',
      quotaPeriod: isEn ? '2026-10' : '2026年10月',
      quotas: quotaList
    });
  }

  // 2. 查询公民购买历史与提货订单列表 (GET)
  // 单条详情必须放在列表路由之前，否则会被 includes('/citizen/ration/orders') 提前命中
  const citizenOrderByIdMatch = url.match(/\/citizen\/ration\/orders\/([^/?]+)$/);
  if (citizenOrderByIdMatch && method === 'GET') {
    const orderId = decodeURIComponent(citizenOrderByIdMatch[1]);
    const found = findSharedOrder(orderId, localeCode);
    if (!found) return createResponse({}, 404, i18n.global.t('citizenOrder.orderNotFound'));
    // 为 GIS 地图补齐收货点与配送网点坐标（已有坐标优先）
    const geo = demoOrderGeo(orderId);
    return createResponse({
      ...found,
      deliveryLocation: found.deliveryLocation || geo.dest,
      originLocation: found.dispatchInfo?.originLocation || geo.origin
    });
  }

  if (url.includes('/citizen/ration/orders') && method === 'GET') {
    const cardNo = params.cardNo;
    const sharedOrders = getSharedOrderPool(localeCode);
    let list = [...sharedOrders];
    if (cardNo) {
      list = list.filter((o) => o.cardNo === cardNo);
    }
    return createResponse(list);
  }

  // 3. 公民提交购买配给品订单并生成二维码 (POST)
  if (url.includes('/citizen/ration/purchase') && method === 'POST') {
    const {
      cardNo = 'RC-10029381',
      headName = '艾哈迈德·哈桑·萨利赫',
      phone = '+964 780 123 4567',
      deliveryType = 'PICKUP', // 'PICKUP' (自提) | 'HOME_DELIVERY' (送货上门)
      deliveryAddress = '',
      notes = '',
      selectedItems = [],
      paymentInfo = {}
    } = data;

    if (!selectedItems || selectedItems.length === 0) {
      return createResponse({}, 400, (isEn ? 'Please select at least one supply ration item!' : '请至少选择一种保供配给口粮物资！'));
    }

    // 校验限额逻辑（全流程演示模式：rcm_demo_active 激活时暂时跳过超限校验，保证 02 阶段演示链路可完整重复走通）
    const isDemoSession = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_demo_active') === 'true';
    const family = getSharedFamily(cardNo) || familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    // 下单限额校验同样按有效纳保成员数计算 (冻结成员不计入额度)
    const memberCount = getActiveMemberCount(family) || family?.memberCount || 5;

    // 限额上限字典
    const maxLimitMap = {
      'FLOUR-WHT-02': memberCount * 9,
      'RICE-BAS-01': memberCount * 3,
      'OIL-SUN-03': memberCount * 1,
      'SUGAR-WHT-04': memberCount * 2
    };

    // 累计已购
    const currentOrdersPool = getSharedOrderPool(localeCode) || citizenPurchaseOrdersStore;
    const cardOrders = currentOrdersPool.filter((o) => o.cardNo === cardNo && o.status !== 'CANCELLED');
    const alreadyConsumedMap = { 'FLOUR-WHT-02': 0, 'RICE-BAS-01': 0, 'OIL-SUN-03': 0, 'SUGAR-WHT-04': 0 };
    cardOrders.forEach((ord) => {
      (ord.items || []).forEach((it) => {
        if (alreadyConsumedMap[it.itemCode] !== undefined) {
          alreadyConsumedMap[it.itemCode] += Number(it.qty) || 0;
        }
      });
    });

    if (!isDemoSession) {
      for (const item of selectedItems) {
        const allowed = (maxLimitMap[item.itemCode] || 999) - (alreadyConsumedMap[item.itemCode] || 0);
        if (item.qty > allowed) {
          return createResponse({}, 400, (isEn ? `[Quota Overrun Interception]: The requested purchase quantity of ${item.itemName} (${item.qty}${item.unit}) exceeds the legal remaining monthly quota (${allowed}${item.unit})!` : `【配额超限拦截】：${item.itemName} 申请购买量 (${item.qty}${item.unit}) 已超出本月法定剩余可用额度 (${allowed}${item.unit})！`));
        }
      }
    }

    // 结算金额
    let totalWeight = 0;
    let goodsAmount = 0;
    let subsidyAmount = 0;

    const validatedItems = selectedItems.map((it) => {
      const qty = Number(it.qty);
      totalWeight += qty;
      const unitPrice = it.unitPrice || (it.itemCode === 'FLOUR-WHT-02' ? 250 : it.itemCode === 'RICE-BAS-01' ? 500 : it.itemCode === 'OIL-SUN-03' ? 1000 : 500);
      const marketPrice = it.marketPrice || (it.itemCode === 'FLOUR-WHT-02' ? 1200 : it.itemCode === 'RICE-BAS-01' ? 2500 : it.itemCode === 'OIL-SUN-03' ? 4500 : 2000);
      const subPrice = marketPrice - unitPrice;
      goodsAmount += qty * unitPrice;
      subsidyAmount += qty * subPrice;

      return {
        itemCode: it.itemCode,
        itemName: it.itemName,
        qty,
        unit: it.unit,
        unitPrice,
        marketPrice,
        subsidyPrice: subPrice,
        subtotal: qty * unitPrice
      };
    });

    const deliveryFee = deliveryType === 'HOME_DELIVERY' ? 1000 : 0;
    const finalSelfPay = goodsAmount + deliveryFee;

    const timestampNum = Date.now().toString().slice(-4);
    const orderId = `ORD-202610-${timestampNum}`;
    const ticketNo = `B2C-RES-20261013-${timestampNum}`;
    const pickupCode = `AGT101-20261013-1012-${timestampNum}`;

    const newOrder = {
      orderId,
      id: orderId,
      ticketNo,
      pickupCode,
      cardNo,
      headName,
      phone,
      memberCount,
      agentId: family?.agentId || 'FA-00128',
      agentName: family?.agentName || (isEn ? 'Baghdad Karkh 1st Distribution Station (Mohammed Jabbar)' : '巴格达卡尔赫第一代销站 (穆罕默德·贾巴尔)'),
      centerId: '101',
      deliveryType, // 'PICKUP' | 'HOME_DELIVERY'
      deliveryAddress: deliveryAddress || family?.address || (isEn ? 'Bldg 3, Apt 201, No.88 Haifa St, Al-Karkh District, Baghdad' : '巴格达省卡尔赫区海法街88号 3号楼201'),
      deliveryFee,
      // 系统默认备注按当前请求语言生成，并打标便于展示层按界面语言重新渲染
      notes: notes || i18n.global.t(deliveryType === 'PICKUP' ? 'citizenOrder.defaultPickupNote' : 'citizenOrder.defaultDeliveryNote'),
      notesIsDefault: !notes,
      items: validatedItems,
      totalWeight,
      goodsAmount,
      amount: finalSelfPay,
      selfPayAmount: finalSelfPay,
      subsidyAmount,
      payStatus: 'PAID',
      payChannel: paymentInfo.channel || (isEn ? 'Qi Card E-Wallet' : 'Qi Card 电子钱包'),
      txnNo: paymentInfo.txnNo || `TXN-${Math.floor(100000 + Math.random() * 900000)}-CBI`,
      paidAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'PAID' // 'PAID' | 'DISPATCHED' | 'DELIVERED'
    };

    citizenPurchaseOrdersStore.unshift(newOrder);
    addSharedOrder(newOrder, isEn ? 'en' : 'zh');

    // 同步到代理端 B2C 预约/核销流中，让代理商端后续阶段直接看到并能扫码核销
    const b2cItem = {
      ticketNo: newOrder.ticketNo,
      cardNo: newOrder.cardNo,
      headName: newOrder.headName,
      nationalId: family?.nationalId || '198004198271',
      phone: newOrder.phone,
      familyMemberCount: newOrder.memberCount,
      agentId: newOrder.agentId,
      agentName: newOrder.agentName,
      centerId: newOrder.centerId,
      reserveDate: '2026-10-13',
      timeSlot: '10:00-12:00',
      deliveryType: newOrder.deliveryType,
      deliveryAddress: newOrder.deliveryAddress,
      items: newOrder.items.map((i) => ({
        itemCode: i.itemCode,
        itemName: i.itemName,
        qty: i.qty,
        unit: i.unit,
        quotaConsumed: i.qty
      })),
      selfPayAmount: newOrder.selfPayAmount,
      payStatus: 'PAID',
      payChannel: 'QI_CARD',
      pickupCode: newOrder.pickupCode,
      smsStatus: 'SENT',
      smsSentTime: newOrder.paidAt,
      status: 'PENDING_VERIFY'
    };
    b2cReservationsStore.unshift(b2cItem);

    // 跨标签页广播新订单产生事件，通知代理APP与管理端订单大盘
    try {
      if (typeof broadcastTabMessage === 'function') {
        broadcastTabMessage('ORDER_PURCHASED', newOrder);
      }
    } catch (e) {
      console.warn('[MockAdapter] broadcastTabMessage ORDER_PURCHASED failed:', e);
    }

    return createResponse({
      success: true,
      order: newOrder,
      pickupCode: newOrder.pickupCode,
      message: (isEn ? `Ration purchase succeeded with electronic payment! Your exclusive anti-forgery pickup QR code has been generated (Verification code: ${newOrder.pickupCode}).` : `配给品选购成功并已完成电子支付！已为您生成专属防伪取货二维码 (核验码: ${newOrder.pickupCode})。`)
    });
  }

  // 4. 审核工单池 (GET)
  if (url.includes('/review/tickets') && method === 'GET') {
    const sharedTickets = getSharedTickets();
    const sourcePool = sharedTickets && sharedTickets.length > 0 ? sharedTickets : ticketsStore;
    const source = params.source;
    if (!source || source === '全部' || source === 'All') {
      return createResponse(sourcePool);
    }
    const filtered = sourcePool.filter((t) => t.source === source);
    return createResponse(filtered);
  }

  // 提交第一级员工审核意见 (POST)
  if (url.includes('/review/staff-opinion') && method === 'POST') {
    const { ticketId, staffOpinion, staffName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId) || getSharedTickets().find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = isEn ? 'Pending Manager Review' : '待经理终审';
      ticket.staffOpinion = staffOpinion;
      ticket.staffName = staffName || (isEn ? 'Samira Qasim (Review Officer)' : '萨米拉·卡西姆 (资格审核专员)');
      ticket.staffReviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const otherLang = isEn ? 'zh' : 'en';
      const otherTicket = multiLangStores[otherLang]?.ticketsStore?.find(t => t.id === ticketId);
      if (otherTicket) {
        otherTicket.status = otherLang === 'en' ? 'Pending Manager Review' : '待经理终审';
        otherTicket.staffOpinion = staffOpinion;
        otherTicket.staffReviewedAt = ticket.staffReviewedAt;
      }
    }
    updateSharedTicket(ticketId, {
      status: isEn ? 'Pending Manager Review' : '待经理终审',
      staffOpinion,
      staffName: ticket?.staffName || staffName,
      staffReviewedAt: ticket?.staffReviewedAt || new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    return createResponse(ticket, 200, (isEn ? 'Staff opinion submitted; the ticket has moved to the manager final-review stage' : '初审意见已提交，工单已流转至经理终审阶段'));
  }

  // 提交第二级经理终审裁决 (POST)
  if (url.includes('/review/manager-decision') && method === 'POST') {
    const { ticketId, decision, notes, managerName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId) || getSharedTickets().find((t) => t.id === ticketId);
    if (ticket) {
      const isAccept = decision === '接受' || decision === 'Approved';
      ticket.status = isAccept ? (isEn ? 'Approved' : '已批准') : (isEn ? 'Rejected' : '已驳回');
      ticket.managerDecision = isAccept ? (isEn ? 'Approved' : '接受') : (isEn ? 'Rejected' : '已驳回');
      ticket.managerNotes = notes;
      ticket.managerName = managerName || (isEn ? 'Haider Abdullah (Branch Manager)' : '海德尔·阿卜杜拉 (分部经理)');
      ticket.managerDecidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const otherLang = isEn ? 'zh' : 'en';
      const otherTicket = multiLangStores[otherLang]?.ticketsStore?.find(t => t.id === ticketId);
      if (otherTicket) {
        otherTicket.status = isAccept ? (otherLang === 'en' ? 'Approved' : '已批准') : (otherLang === 'en' ? 'Rejected' : '已驳回');
        otherTicket.managerDecision = isAccept ? (otherLang === 'en' ? 'Approved' : '接受') : (otherLang === 'en' ? 'Rejected' : '拒绝');
        otherTicket.managerNotes = notes;
        otherTicket.managerDecidedAt = ticket.managerDecidedAt;
      }

      // 若终审接受，自动落地对应业务实体变更
      if (isAccept && ticket.payload) {
        if (ticket.payload.type === 'transferAgent') {
          // 跨省代理转移终审落地
          const targetFam = getSharedFamily(ticket.payload.cardNo) || familiesStore.find((f) => f.rationCardNo === ticket.payload.cardNo);
          if (targetFam) {
            targetFam.province = ticket.payload.toProvince;
            targetFam.district = `${ticket.payload.toBranch} · ${ticket.payload.toCenterName}`;
            targetFam.agentId = `${ticket.payload.toFlourAgent?.id || 'FA'} / ${ticket.payload.toFoodAgent?.id || 'FD'}`;
            targetFam.agentName = `${ticket.payload.toFlourAgent?.name || ''} ＆ ${ticket.payload.toFoodAgent?.name || ''}`;
            targetFam.address = ticket.payload.newAddress;
            updateSharedFamily(targetFam.rationCardNo, {
              province: targetFam.province,
              district: targetFam.district,
              agentId: targetFam.agentId,
              agentName: targetFam.agentName,
              address: targetFam.address
            });
          }
        } else if (ticket.payload.newHeadId) {
          const family = getSharedFamily(ticket.cardNo) || familiesStore.find((f) => f.rationCardNo === ticket.cardNo);
          if (family) {
            const newHead = family.members.find((m) => m.id === ticket.payload.newHeadId);
            if (newHead) {
              family.members.forEach((m) => {
                if (m.relation === '户主') m.status = '已故';
                if (m.id === ticket.payload.newHeadId) m.relation = '户主';
              });
              family.headName = newHead.name;
              updateSharedFamily(family.rationCardNo, {
                members: family.members,
                headName: family.headName
              });
            }
          }
        } else if (ticket.payload.unfreezeType && (ticket.payload.targetMemberId || ticket.payload.targetNationalId)) {
          applyApprovedUnfreeze(ticket);
        } else if (ticket.payload.type === 'memberTransfer' && ticket.payload.member) {
          // 成员转移终审落地
          const targetFam = getSharedFamily(ticket.payload.targetCardNo) || familiesStore.find((f) => f.rationCardNo === ticket.payload.targetCardNo) || familiesStore[0];
          if (targetFam) {
            const mem = ticket.payload.member;
            targetFam.members.push({
              id: `M-TRF-${Date.now().toString().slice(-4)}`,
              name: mem.name,
              nationalId: mem.nationalId,
              familyCode: targetFam.familyCode,
              relation: ticket.payload.transferType === 'wife' ? '配偶' : ticket.payload.transferType === 'child' ? '子女' : '被监护亲属',
              birthDate: mem.birthDate || '2000-01-01',
              gender: mem.gender || '女',
              status: '正常',
              phone: mem.phone || targetFam.phone,
              residenceInfo: targetFam.address,
              isUpdatedInSystem: true,
              faceVerified: true
            });
            targetFam.memberCount = targetFam.members.length;
            updateSharedFamily(targetFam.rationCardNo, {
              members: targetFam.members,
              memberCount: targetFam.memberCount
            });
          }
        }
      }
    }

    const isAccept = decision === '接受' || decision === 'Approved';
    updateSharedTicket(ticketId, {
      status: isAccept ? (isEn ? 'Approved' : '已批准') : (isEn ? 'Rejected' : '已驳回'),
      managerDecision: isAccept ? (isEn ? 'Approved' : '接受') : (isEn ? 'Rejected' : '已驳回'),
      managerNotes: notes,
      managerName: ticket?.managerName || managerName,
      managerDecidedAt: ticket?.managerDecidedAt || new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    return createResponse(ticket, 200, (isEn ? `Final review adjudicated as [${decision}]!` : `终审已裁决为【${decision}】！`));
  }

  // ==========================================
  // 4. 仓储供应链模块 (Warehouse - SCM / BPM / UNICODE)
  // ==========================================

  // 4.1 配给总计划列表 (SCM / BPM)
  if (url.includes('/warehouse/ration-plans') && method === 'GET') {
    return createResponse(rationPlansStore);
  }

  // 4.1.1 制定并下发新的宏观物资配给总计划
  if (url.includes('/warehouse/ration-plans') && method === 'POST') {
    const newPlan = {
      id: `PLAN-${Date.now().toString().slice(-4)}`,
      planNo: data.planNo || `PLAN-2026-N${rationPlansStore.length + 1}`,
      title: data.title || (isEn ? 'New Strategic Material Ration Supply Plan' : '新增战略物资口粮保供计划'),
      periodName: data.periodName || (isEn ? '2026 Supply Cycle' : '2026年保供周期'),
      startDate: data.startDate || '2026-10-01',
      endDate: data.endDate || '2026-12-31',
      scope: data.scope || (isEn ? 'Nationwide Coverage' : '全国全域覆盖'),
      targetHouseholds: data.targetHouseholds || 1200000,
      targetBeneficiaries: data.targetBeneficiaries || 5400000,
      issuer: data.issuer || (isEn ? 'Ministry of Trade Food Rationing Authority' : '贸易部食品配给署'),
      issueDate: new Date().toISOString().split('T')[0],
      status: isEn ? 'In Execution' : '执行中',
      allocationStatus: isEn ? 'Pending Breakdown Scheduling' : '待分解排程',
      quotaStandards: data.quotaStandards || [
        { itemName: isEn ? 'Premium Rice' : '精制大米', itemCode: 'RICE-BAS-01', quotaPerPerson: 3.0, unit: isEn ? 'KG/Person/Month' : 'KG/人/月', totalQty: 48000000 },
        { itemName: isEn ? 'Premium Flour' : '特级面粉', itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9.0, unit: isEn ? 'KG/Person/Month' : 'KG/人/月', totalQty: 144000000 },
        { itemName: isEn ? 'Edible Vegetable Oil' : '食用植物油', itemCode: 'OIL-SUN-03', quotaPerPerson: 1.0, unit: isEn ? 'L/Person/Month' : 'L/人/月', totalQty: 16000000 },
        { itemName: isEn ? 'Refined White Sugar' : '纯精白糖', itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1.0, unit: isEn ? 'KG/Person/Month' : 'KG/人/月', totalQty: 16000000 }
      ],
      overallProgress: {
        totalPlanWeightTon: 224000,
        outboundWeightTon: 40000,
        agentReceivedWeightTon: 20000,
        citizenClaimedWeightTon: 5000,
        outboundRate: 17.8,
        receivedRate: 8.9,
        claimedRate: 2.2
      }
    };
    rationPlansStore.unshift(newPlan);
    return createResponse(newPlan, 200, isEn ? 'Ration master plan formulated and issued successfully!' : '配给总计划制定并下发成功！');
  }

  // 4.2 查询代理网点配额分解与排程任务单 (联动“我的代理中心列表”)
  if (url.includes('/warehouse/agent-tasks') && method === 'GET') {
    let result = [...agentAllocationTasksStore];
    if (params.agentCenterId) {
      result = result.filter((t) => t.agentCenterId === params.agentCenterId);
    }
    if (params.planNo) {
      result = result.filter((t) => t.planNo === params.planNo);
    }
    return createResponse(result);
  }

  // 4.2.1 触发依据贸易部月度计划自动生成自己和下级代理的三层月度配给计划 (省级 -> 区域 -> 街道)
  if (url.includes('/warehouse/agent-tasks/decompose') && method === 'POST') {
    const selectedPlan = rationPlansStore.find((p) => p.planNo === data.planNo || p.id === data.planId) || rationPlansStore[0];
    const month = data.targetMonth || selectedPlan.periodMonth || '2026-10';

    // 扁平化三级代理节点树
    const nodes = [];
    function traverseNode(node, parentTitle = '') {
      nodes.push({ ...node, parentTitle });
      if (node.children && node.children.length > 0) {
        node.children.forEach((c) => traverseNode(c, node.title || node.levelName || node.name));
      }
    }
    (MOCK_AGENT_HIERARCHY_TREE || []).forEach((r) => traverseNode(r));

    // 严格根据对应代理的户数自动分配额度 (禁止手动分配)
    const newTasks = nodes.map((agent, index) => {
      const households =
        agent.level === 'PROVINCE'
          ? (agent.totalHouseholdsServed || 7650)
          : agent.level === 'DISTRICT'
          ? (agent.totalHouseholdsServed || 4100)
          : (agent.householdsCount || 1000);
      const citizens = households * 4;
      const totalAmount = households * 53800;

      const items = (selectedPlan.quotaStandards || []).map((std) => {
        const plannedQty = Math.round(std.quotaPerPerson * citizens);
        const subtotalIQD = plannedQty * (std.guidePriceIQD || 1000);
        return {
          itemName: std.itemName,
          itemCode: std.itemCode,
          quotaPerPerson: std.quotaPerPerson,
          guidePriceIQD: std.guidePriceIQD || 1000,
          plannedQty,
          allocatedQtyTon: Number((plannedQty / 1000).toFixed(2)),
          outboundQty: Math.round(plannedQty * 0.8),
          receivedQty: Math.round(plannedQty * 0.7),
          claimedQty: Math.round(plannedQty * 0.5),
          unit: std.unit.split('/')[0] || 'KG',
          subtotalIQD,
          completionRate: 50.0
        };
      });

      return {
        id: `TASK-AUTO-${month.replace('-', '')}-${agent.id}`,
        taskNo: `TASK-${month.replace('-', '')}-${agent.level.slice(0, 3)}-${agent.id}`,
        planNo: selectedPlan.planNo,
        periodMonth: month,
        agentLevel: agent.level,
        agentLevelName:
          reqLang === 'en'
            ? (agent.level === 'PROVINCE' ? 'Provincial Agent' : agent.level === 'DISTRICT' ? 'District Agent' : 'Local Station')
            : reqLang === 'ar'
            ? (agent.level === 'PROVINCE' ? 'وكيل المحافظة' : agent.level === 'DISTRICT' ? 'وكيل القضاء' : 'وكيل محلي')
            : reqLang === 'ku'
            ? (agent.level === 'PROVINCE' ? 'بریکاری پارێزگا' : agent.level === 'DISTRICT' ? 'بریکاری قەزا' : 'بریکاری ناوخۆیی')
            : (agent.level === 'PROVINCE' ? '省级代理' : agent.level === 'DISTRICT' ? '区域代理' : '街道代理'),
        agentCenterId: agent.id,
        centerName: agent.storeName || agent.title || agent.name,
        province: agent.province || '巴格达省 (Baghdad)',
        district: agent.district || agent.jurisdictionScope || '巴格达全境',
        responsiblePerson: agent.name,
        isSelf: !!agent.isSelf,
        isArticle140: !!agent.isArticle140,
        registeredHouseholds: households,
        coveredCitizens: citizens,
        deliveryCycle: reqLang === 'en' ? `${month} Full Quota Batch` : `${month} 月度全量配额`,
        scheduleStartDate: `${month}-01`,
        scheduleEndDate: `${month}-28`,
        scheduledDeliveryDate: `${month}-15`,
        totalGuideAmountIQD: totalAmount,
        autoAllocatedFormula: reqLang === 'en' ? `Registered: ${households.toLocaleString()} families × 4 members × National monthly ration standard` : `签约户数 ${households.toLocaleString()}户 × 4人/户 × 国家月度保供配额指标 (依据名下实名签约家庭户数算法锁定，严禁手动篡改)`,
        items,
        taskStatus: reqLang === 'en' ? 'Normal Progress' : '正常履约中',
        status: reqLang === 'en' ? 'In Progress' : '执行中',
        riskLevel: 'LOW',
        lastDispatchedDeliveryNo: `DELIV-${month.replace('-', '')}-${agent.id}`
      };
    });

    agentAllocationTasksStore = [
      ...newTasks,
      ...agentAllocationTasksStore.filter((t) => t.periodMonth !== month)
    ];
    activeStores.agentAllocationTasksStore = agentAllocationTasksStore;
    selectedPlan.allocationStatus = '已完成三级代理排程';
    return createResponse(
      newTasks,
      200,
      `系统已成功依据贸易部【${selectedPlan.title}】及三级代理架构 (${nodes.length} 个层级节点) 的签约户数，自动完成 ${month} 月度配额分解与国家指导价格测算！`
    );
  }

  // 4.3 采购收货与质检入库单列表 (SCM)
  if (url.includes('/warehouse/inbound-orders') && method === 'GET') {
    return createResponse(inboundOrdersStore);
  }

  // 4.3.1 提交采购收货与质检入库申请 (强制 P1 校验: 贸易部计划编号 + 生产日期与效期批次 + 一物一码建档)
  if (url.includes('/warehouse/inbound-orders') && method === 'POST') {
    // [P1 校验 1] 必须校验贸易部计划编号
    if (!data.tradePlanNo || String(data.tradePlanNo).trim() === '') {
      return createResponse(null, 400, isEn ? '[P1 Rule Validation Interception] The purchase inbound order must be validated against and linked to the Ministry of Trade material ration master plan number (tradePlanNo)!' : '【P1 规则校验拦截】采购入库单必须校验并关联贸易部物资配给总计划编号 (tradePlanNo)！');
    }
    const planExists = rationPlansStore.some((p) => p.planNo === data.tradePlanNo);
    if (!planExists) {
      return createResponse(null, 400, isEn ? `[P1 Rule Validation Interception] Ministry of Trade plan number [${data.tradePlanNo}] does not exist in the master-plan system or has expired!` : `【P1 规则校验拦截】贸易部计划编号【${data.tradePlanNo}】在总规系统不存在或已失效！`);
    }

    // [P1 校验 2] 批次号生成时必须包含生产日期及效期字段
    if (!data.batchNo || !data.productionDate || !data.expiryDate) {
      return createResponse(null, 400, isEn ? '[P1 Rule Validation Interception] Material production batch number, production date and expiry date registration is mandatory!' : '【P1 规则校验拦截】强制登记物资生产批次号、生产日期及有效截止日期！');
    }
    const prodClean = data.productionDate.replace(/-/g, '');
    const expClean = data.expiryDate.replace(/-/g, '').slice(0, 6);
    if (!data.batchNo.includes(prodClean) || (!data.batchNo.includes('EXP') && !data.batchNo.includes(expClean))) {
      return createResponse(
        null,
        400,
        isEn ? `[P1 Rule Validation Interception] Batch number generation rule violated! The batch number must contain the production date (${prodClean}) and the expiry field (e.g. EXP${expClean})! Current batch number: ${data.batchNo}` : `【P1 规则校验拦截】批次号生成规则不合规！批次号必须包含生产日期（${prodClean}）及效期字段（如 EXP${expClean}）！当前批次号：${data.batchNo}`
      );
    }

    // 生成全局唯一一物一码/箱码标签 (UNICODE 服务)
    const traceCode = `UNI-BOX-${prodClean}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newInbound = {
      id: `IN-${Date.now().toString().slice(-4)}`,
      inboundNo: `IN-${prodClean}-${Math.floor(100 + Math.random() * 900)}`,
      purchaseOrderNo: data.purchaseOrderNo || `PO-MOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      tradePlanNo: data.tradePlanNo,
      itemName: data.itemName || '精制大米',
      itemCode: data.itemCode || 'RICE-BAS-01',
      category: data.category || '谷物粮食',
      expectedQty: Number(data.qty || 10000),
      actualQty: Number(data.qty || 10000),
      unit: data.unit || '公斤 (KG)',
      supplier: data.supplier || '国家粮食贸易总公司',
      warehouseId: data.warehouseId || 'WH-BAG-01',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      batchNo: data.batchNo,
      productionDate: data.productionDate,
      expiryDate: data.expiryDate,
      uniqueTraceCode: traceCode,
      inspectStatus: data.inspectStatus || '质检合格',
      inspectReport: data.inspectReport || '化验指标合格，符合国家战略保供标准',
      inspector: data.inspector || '阿里·扎基 (品控质检员)',
      inboundOperator: '当前登录操作人',
      inboundTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '已上架入库'
    };
    inboundOrdersStore.unshift(newInbound);

    // 联动 1: 更新或追加六维库存
    const existingStock = stocksStore.find(
      (s) => s.warehouseName === newInbound.warehouseName && s.locationCode === newInbound.locationCode && s.batchNo === newInbound.batchNo
    );
    if (existingStock) {
      existingStock.availableQty += newInbound.actualQty;
      existingStock.currentQty += newInbound.actualQty;
    } else {
      stocksStore.unshift({
        id: `STK-${Date.now().toString().slice(-4)}`,
        itemName: newInbound.itemName,
        itemCode: newInbound.itemCode,
        category: newInbound.category,
        warehouseId: newInbound.warehouseId,
        warehouseName: newInbound.warehouseName,
        locationCode: newInbound.locationCode,
        locationName: `${newInbound.locationCode} 绑定货位`,
        batchNo: newInbound.batchNo,
        productionDate: newInbound.productionDate,
        expiryDate: newInbound.expiryDate,
        expiryStatus: '正常',
        bizStatus: '可用',
        availableQty: newInbound.actualQty,
        lockedQty: 0,
        inTransitQty: 0,
        frozenQty: 0,
        currentQty: newInbound.actualQty,
        unit: newInbound.unit,
        minSafeQty: 10000,
        status: '库存充沛',
        uniqueTraceCode: traceCode,
        inspectReportNo: `QC-${prodClean}-01`
      });
    }

    // 联动 2: 写入流水台账中心
    inventoryLedgersStore.unshift({
      id: `LED-${Date.now().toString().slice(-4)}`,
      ledgerNo: `FLW-${Date.now()}`,
      docType: '采购入库单 (Inbound)',
      docNo: newInbound.inboundNo,
      warehouseName: newInbound.warehouseName,
      locationCode: newInbound.locationCode,
      itemName: newInbound.itemName,
      batchNo: newInbound.batchNo,
      changeType: '+增加',
      changeQty: newInbound.actualQty,
      beforeBalanceQty: existingStock ? existingStock.availableQty - newInbound.actualQty : 0,
      afterBalanceQty: existingStock ? existingStock.availableQty : newInbound.actualQty,
      unit: newInbound.unit,
      operator: '采购入库操作员',
      timestamp: newInbound.inboundTime,
      reconciliationStatus: '三级钩稽核验通过'
    });

    // 联动 3: 写入操作审计日志
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newInbound.inboundTime,
      operatorId: 'AGT-WH-OPERATOR',
      operatorName: '仓管入库员',
      role: '仓管员 (Warehouse Operator)',
      terminalIp: '192.168.10.82',
      microservice: 'SCM / UNICODE',
      module: '入库质检管理',
      action: 'INBOUND_QC_PASS',
      actionDesc: `完成采购入库质检，生成一物一码【${traceCode}】，上架至货位【${newInbound.locationCode}】`,
      riskLevel: 'LOW',
      beforeSnapshot: '{"status":"PO_WAIT_INBOUND"}',
      afterSnapshot: JSON.stringify(newInbound)
    });

    return createResponse(newInbound, 200, (isEn ? `Inbound QC passed! Unique box-code label [${traceCode}] generated and slot binding completed.` : `入库质检合格！已生成唯一箱码标签【${traceCode}】并完成货位绑定。`));
  }

  // 4.4 配给配送出库单列表 (SCM)
  if (url.includes('/warehouse/outbound-orders') && method === 'GET') {
    return createResponse(outboundOrdersStore);
  }

  // 4.4.1 创建出库波次并复核发运 (强制 P2 校验: 生成唯一交付流水号，库位可用库存转在途锁定)
  if (url.includes('/warehouse/outbound-orders/wave') && method === 'POST') {
    const outQty = Number(data.outQty || 5000);
    const targetStock = stocksStore.find((s) => s.id === data.stockId || s.batchNo === data.batchNo) || stocksStore[0];

    if (targetStock.availableQty < outQty) {
      return createResponse(null, 400, isEn ? `Insufficient available stock at the storage location! Currently available: ${targetStock.availableQty} ${targetStock.unit}, requested outbound: ${outQty} ${targetStock.unit}` : `库位可用库存不足！当前可用：${targetStock.availableQty} ${targetStock.unit}，申请出库：${outQty} ${targetStock.unit}`);
    }

    // [P2 规则] 必须生成唯一的全局交付流水号
    const flowSeq = Math.floor(1000 + Math.random() * 9000);
    const deliveryFlowNo = `DELIV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${flowSeq}-BAG`;
    const secHash = `SEC-HASH-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

    // [P2 规则] 库位可用库存同步转为在途锁定库存
    targetStock.availableQty -= outQty;
    targetStock.lockedQty += outQty;
    targetStock.currentQty = targetStock.availableQty; // 保持在库余量口径一致

    const newOutbound = {
      id: `OUT-${Date.now().toString().slice(-4)}`,
      outboundNo: `OUT-${Date.now().toString().slice(-8)}`,
      taskNo: data.taskNo || 'TASK-2026-Q4-BAG-001',
      targetAgentId: data.targetAgentId || 'FA-00128',
      targetAgentName: data.targetAgentName || '卡尔赫第一配给中心综合代销站',
      waveNo: `WAVE-${Date.now().toString().slice(-6)}`,
      pickingRule: '先进先出 (FIFO) & 效期优先 (Strict FIFO)',
      warehouseName: targetStock.warehouseName,
      locationCode: targetStock.locationCode,
      itemName: targetStock.itemName,
      itemCode: targetStock.itemCode,
      batchNo: targetStock.batchNo,
      plannedQty: outQty,
      actualOutQty: outQty,
      unit: targetStock.unit,
      deliveryFlowNo, // P2 交付流水号
      securityCheckCode: secHash,
      status: '已复核出库(在途锁定)',
      lockedInTransitQty: outQty,
      carrierName: data.carrierName || '伊拉克国家粮食运输总队',
      vehicleNo: data.vehicleNo || 'BAG-T99201',
      driverName: data.driverName || '穆斯塔法·纳吉',
      driverPhone: data.driverPhone || '07708899112',
      outboundTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      dispatchTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    outboundOrdersStore.unshift(newOutbound);

    // 联动 1: 新增在途配送监控记录
    deliveryTrackingsStore.unshift({
      id: `TRK-${Date.now().toString().slice(-4)}`,
      deliveryFlowNo,
      taskNo: newOutbound.taskNo,
      fromWarehouse: targetStock.warehouseName,
      toAgentCenter: `${newOutbound.targetAgentName} (${newOutbound.targetAgentId})`,
      agentOwner: '穆罕默德·贾巴尔·拉希德',
      carrierName: newOutbound.carrierName,
      vehicleNo: newOutbound.vehicleNo,
      driverName: newOutbound.driverName,
      driverPhone: newOutbound.driverPhone,
      deliveryItems: [{ itemName: targetStock.itemName, qty: outQty, unit: targetStock.unit, batchNo: targetStock.batchNo }],
      dispatchTime: newOutbound.dispatchTime,
      estimatedArrivalTime: '2026-10-12 18:00:00',
      status: '在途中',
      inTransitHours: 0.5,
      maxAllowedHours: 4.0,
      currentLocation: '已离开粮库发运总台，行驶在干线公路',
      gpsNodes: [
        { time: newOutbound.dispatchTime.slice(11, 16), desc: '完成波次复核封签，启运出库', status: 'done' }
      ]
    });

    // 联动 2: 写入流水台账
    inventoryLedgersStore.unshift({
      id: `LED-${Date.now().toString().slice(-4)}`,
      ledgerNo: `FLW-${Date.now()}`,
      docType: '配送出库交付单 (Outbound)',
      docNo: deliveryFlowNo,
      warehouseName: targetStock.warehouseName,
      locationCode: targetStock.locationCode,
      itemName: targetStock.itemName,
      batchNo: targetStock.batchNo,
      changeType: '-出库(转在途锁定)',
      changeQty: -outQty,
      beforeBalanceQty: targetStock.availableQty + outQty,
      afterBalanceQty: targetStock.availableQty,
      unit: targetStock.unit,
      operator: '波次拣选复核员',
      timestamp: newOutbound.outboundTime,
      reconciliationStatus: '三级钩稽核验通过 (在途数量锁定)'
    });

    // 联动 3: 写入操作审计
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newOutbound.outboundTime,
      operatorId: 'WH-DISPATCHER',
      operatorName: '出库调度官',
      role: '调度员',
      terminalIp: '192.168.10.83',
      microservice: 'SCM / UNICODE',
      module: '出库作业',
      action: 'OUTBOUND_DISPATCH_LOCK',
      actionDesc: `遵循 FIFO 原则出库审核，生成交付流水【${deliveryFlowNo}】，锁定在途库存 ${outQty} ${targetStock.unit}`,
      riskLevel: 'MEDIUM',
      beforeSnapshot: `{"available":${targetStock.availableQty + outQty},"locked":0}`,
      afterSnapshot: `{"available":${targetStock.availableQty},"locked":${targetStock.lockedQty}}`
    });

    return createResponse(newOutbound, 200, (isEn ? `Wave outbound review completed! Unique delivery flow order [${deliveryFlowNo}] generated; ${outQty} ${targetStock.unit} in-transit stock locked successfully!` : `波次出库复核完成！已生成唯一交付流水单【${deliveryFlowNo}】，${outQty} ${targetStock.unit} 在途库存已成功锁定！`));
  }

  // 4.5 跨库调拨单列表 (SCM)
  if (url.includes('/warehouse/transfer-orders') && method === 'GET') {
    return createResponse(transferOrdersStore);
  }

  // 4.5.1 创建跨库调拨
  if (url.includes('/warehouse/transfer-orders') && method === 'POST') {
    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNo: `TRF-${Date.now().toString().slice(-8)}`,
      itemName: data.itemName || '精制大米',
      itemCode: data.itemCode || 'RICE-BAS-01',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      transferQty: Number(data.transferQty || 10000),
      unit: data.unit || '公斤 (KG)',
      fromWarehouseId: data.fromWarehouseId || 'WH-BAG-01',
      fromWarehouseName: data.fromWarehouseName || '巴格达第一国家储备粮库 (中心仓)',
      toWarehouseId: data.toWarehouseId || 'WH-DIY-01',
      toWarehouseName: data.toWarehouseName || '迪亚拉哈奈根前置战略保供仓 (前置仓)',
      reason: data.reason || (isEn ? 'Cross-Region Strategic Supply Transfer' : '跨区域战略保供调拨'),
      currentStage: '阶段1: 调出出库完成',
      stage1Outbound: {
        outboundFlowNo: `TRF-OUT-${Math.floor(10000 + Math.random() * 90000)}`,
        operator: '阿里·扎基',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: '调出完成'
      },
      stage2InTransit: {
        carrier: '跨省干线车队',
        vehicleNo: 'BAG-T66102',
        gpsLocation: '中心仓出场核验区',
        estimatedArrival: '2026-10-13 12:00:00',
        status: '待启运'
      },
      stage3Inbound: {
        inboundFlowNo: null,
        receiver: '前置仓管员',
        inspectStatus: '待验收',
        status: '未完成'
      }
    };
    transferOrdersStore.unshift(newTrf);
    return createResponse(newTrf, 200, (isEn ? 'Cross-warehouse transfer application created; Stage 1 [Outbound] completed!' : '跨库调拨申请已创建，第一阶段【调出出库】已完成！'));
  }

  // 4.5.2 推进调拨单流转阶段 (三段式流水)
  const transferAdvanceMatch = url.match(/\/warehouse\/transfer-orders\/([^/]+)\/advance/);
  if (transferAdvanceMatch && method === 'POST') {
    const trfId = transferAdvanceMatch[1];
    const trf = transferOrdersStore.find((t) => t.id === trfId || t.transferNo === trfId);
    if (!trf) {
      return createResponse(null, 404, isEn ? 'Transfer order not found!' : '调拨单据未找到！');
    }
    if (trf.currentStage.includes('阶段1')) {
      trf.currentStage = '阶段2: 在途管理';
      trf.stage2InTransit.status = '干线在途中';
      trf.stage2InTransit.gpsLocation = '已驶出巴格达省界，正向迪亚拉哈奈根行驶';
    } else if (trf.currentStage.includes('阶段2')) {
      trf.currentStage = '阶段3: 调入验收完成';
      trf.stage3Inbound.inboundFlowNo = `TRF-IN-${Math.floor(10000 + Math.random() * 90000)}-AC`;
      trf.stage3Inbound.status = '已验收入库';
      trf.stage3Inbound.inspectStatus = '验收合格';
      trf.stage3Inbound.time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    return createResponse(trf, 200, (isEn ? `Transfer flow succeeded! Advanced to [${trf.currentStage}]!` : `调拨流转成功！当前推进至【${trf.currentStage}】！`));
  }

  // 4.6 盘点记录列表 (SCM)
  if (url.includes('/warehouse/stocktakes') && method === 'GET') {
    return createResponse(stocktakeRecordsStore);
  }

  // 4.6.1 提交盘点记录 (差异禁止直接冲抵，必须双人签批)
  if (url.includes('/warehouse/stocktakes') && method === 'POST') {
    const diffQty = Number(data.countedQty || 0) - Number(data.bookQty || 0);
    const newStocktake = {
      id: `STK-CHK-${Date.now().toString().slice(-4)}`,
      stocktakeNo: `STK-CHK-${Date.now().toString().slice(-8)}`,
      type: data.type || '周期盘点 (Cycle Count)',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      itemName: data.itemName || '精制大米',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      bookQty: Number(data.bookQty || 1000),
      countedQty: Number(data.countedQty || 1000),
      diffQty,
      diffAmountIQD: Math.abs(diffQty) * 900,
      unit: data.unit || '公斤 (KG)',
      counterName: data.counterName || '盘点员：阿里·扎基',
      countDate: new Date().toISOString().split('T')[0],
      diffReason: diffQty === 0 ? '账实相符' : (data.diffReason || '抽样称重微量损耗'),
      diffResolution: diffQty === 0 ? '直接归档' : '【系统红线规则】禁止直接冲抵！生成盈亏差异报告，已流转双人审批！',
      status: diffQty === 0 ? '盘点无差异' : '差异待双人审批',
      approver1: diffQty === 0 ? '系统自核' : '待主操作人提交',
      approver2: diffQty === 0 ? '系统自核' : '待复核主管签批'
    };
    stocktakeRecordsStore.unshift(newStocktake);
    return createResponse(
      newStocktake,
      200,
      diffQty === 0 ? '盘点完成，账实一致！' : '盘点记录已录入。存在盈亏差异，已生成差异报告并严格禁止直接冲抵，请发起双人签批！'
    );
  }

  // 4.7 报损报溢明细列表 (SCM)
  if (url.includes('/warehouse/loss-records') && method === 'GET') {
    return createResponse(lossRecordsStore);
  }

  // 4.7.1 登记报损报溢记录 (强制损耗原因与存证影像，双人审批)
  if (url.includes('/warehouse/loss-records') && method === 'POST') {
    if (!data.damageReason || String(data.damageReason).trim() === '') {
      return createResponse(null, 400, isEn ? 'Loss/surplus operations require mandatory entry of loss reason and on-site factual statement!' : '报损与报溢操作必须强制录入损耗原因与现场事实说明！');
    }
    const newLoss = {
      id: `LOSS-${Date.now().toString().slice(-4)}`,
      lossNo: `LOSS-${Date.now().toString().slice(-8)}`,
      lossType: data.lossType || '物理破损 (Damage)',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      itemName: data.itemName || '精制大米',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      qty: Number(data.qty || 10),
      unit: data.unit || '公斤 (KG)',
      estimatedCostIQD: Number(data.qty || 10) * 900,
      damageReason: data.damageReason,
      evidenceImageUrl: data.evidenceImageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      reporter: data.reporter || '当前仓管员',
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      approvalStatus: '待双人审批',
      approvers: []
    };
    lossRecordsStore.unshift(newLoss);
    return createResponse(newLoss, 200, (isEn ? 'Loss report accepted with evidence imagery bound! Per the security compliance mechanism, dual sign-off is required before write-off booking.' : '报损申请已受理并绑定存证影像！依据安全合规机制，需经双人签批后方可核销入账。'));
  }

  // 4.8 六维多维库存实时视图 (SCM)
  if (url.includes('/warehouse/stocks/snapshot') && method === 'GET') {
    // 历史时间点快照回溯
    const timeParam = params.time || '2026-10-01 00:00:00';
    const snapshot = stocksStore.map((s) => ({
      ...s,
      snapshotTime: timeParam,
      availableQty: Math.round(s.availableQty * 0.95),
      currentQty: Math.round(s.currentQty * 0.95),
      snapshotNotice: `基于历史账本【单据-流水-余额】钩稽回溯至 ${timeParam}`
    }));
    return createResponse(snapshot);
  }

  if (url.includes('/warehouse/stocks') && method === 'GET') {
    let result = [...stocksStore];
    if (params.category) result = result.filter((s) => s.category.includes(params.category));
    if (params.warehouseName) result = result.filter((s) => s.warehouseName.includes(params.warehouseName));
    if (params.bizStatus) result = result.filter((s) => s.bizStatus === params.bizStatus);
    if (params.batchNo) result = result.filter((s) => s.batchNo.includes(params.batchNo));
    return createResponse(result);
  }

  // 4.9 流水台账中心 (SCM)
  if (url.includes('/warehouse/ledgers') && method === 'GET') {
    return createResponse(inventoryLedgersStore);
  }

  // 4.10 配送在途追踪监控 (SCM)
  if (url.includes('/warehouse/delivery-trackings') && method === 'GET') {
    return createResponse(deliveryTrackingsStore);
  }

  // 4.10.1 公民/代理扫描二维码签收配送单并更新在途状态为已签收
  const confirmReceiptMatch = url.match(/\/warehouse\/delivery-trackings\/([^/]+)\/confirm-receipt/);
  if (confirmReceiptMatch && method === 'POST') {
    const flowNo = decodeURIComponent(confirmReceiptMatch[1]);
    const trk = deliveryTrackingsStore.find(t => t.deliveryFlowNo === flowNo || t.id === flowNo);
    const signTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (trk) {
      trk.status = '已签收';
      trk.signedTime = signTime;
      trk.currentLocation = '已完成扫码核验并签收交付';
      trk.gpsNodes = trk.gpsNodes || [];
      trk.gpsNodes.push({
        time: signTime.slice(11, 16),
        desc: `【扫码签收成功】由收货人核验二维码防伪凭证，实收无误完成签收。`,
        status: 'done'
      });
    }

    const item = trk?.deliveryItems?.[0] || { itemName: '配给物资', qty: 13440 };
    agentReceiptsStore.unshift({
      id: `RCP-${Date.now().toString().slice(-4)}`,
      receiptNo: `RCP-${Date.now().toString().slice(-8)}`,
      deliveryFlowNo: flowNo,
      agentCenterId: data?.agentCenterId || 'FA-00128',
      agentName: trk?.toAgentCenter || '卡尔赫第一配给中心综合代销站',
      signedBy: data?.signedBy || '配给卡公民 (扫码核验确认)',
      signTime,
      shippedQty: item.qty,
      receivedQty: item.qty,
      discrepancyQty: 0,
      intactRate: 100.0,
      packageIntegrity: '二维码防伪封签核验通过，外包装完好',
      reconciliationResult: '账单相符 (MATCHED)',
      status: '已签收交付'
    });

    return createResponse({
      flowNo,
      status: '已签收',
      signedTime: signTime
    }, 200, `配送交付流水【${flowNo}】扫码核验成功，状态已变更为已签收！`);
  }

  // 4.11 代理网点签收记录 (SCM)
  if (url.includes('/warehouse/agent-receipts') && method === 'GET') {
    return createResponse(agentReceiptsStore);
  }

  // 4.11.1 代理网点移动终端扫码核收 (强制 P3 校验: 数量与交付流水核对，异常差额锁定、阻断流转并派发工单)
  if (url.includes('/warehouse/agent-receipts') && method === 'POST') {
    const shippedQty = Number(data.shippedQty || 0);
    const receivedQty = Number(data.receivedQty || 0);
    const diffQty = receivedQty - shippedQty;
    const isDiscrepant = diffQty !== 0;

    const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
    const newReceipt = {
      id: `RCP-${Date.now().toString().slice(-4)}`,
      receiptNo,
      deliveryFlowNo: data.deliveryFlowNo || 'DELIV-20261012-9901-BAG',
      agentCenterId: data.agentCenterId || 'FA-00128',
      agentName: data.agentName || '卡尔赫第一配给中心综合代销站',
      signedBy: data.signedBy || '穆罕默德·贾巴尔·拉希德 (移动终端指纹核签)',
      signTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      shippedQty,
      receivedQty,
      discrepancyQty: diffQty,
      intactRate: Number(data.intactRate || (isDiscrepant ? 99.5 : 100.0)),
      packageIntegrity: data.packageIntegrity || '包装完好核验正常',
      reconciliationResult: isDiscrepant ? '存在差异 (DISCREPANCY_ALERT)' : '账单相符 (MATCHED)',
      status: isDiscrepant ? '已阻断流转并派发核查工单' : '核销入店成功'
    };
    agentReceiptsStore.unshift(newReceipt);

    // [P3 规则] 当实收数量、批次与交付流水存在差异时，系统即刻触发在途损耗/短缺预警，并阻断该批次异常货物的后续发放流转
    if (isDiscrepant) {
      const ticketNo = `DISC-${Date.now().toString().slice(-8)}`;
      const newDiscTicket = {
        id: `DISC-${Date.now().toString().slice(-4)}`,
        ticketNo,
        deliveryFlowNo: newReceipt.deliveryFlowNo,
        agentCenterId: newReceipt.agentCenterId,
        centerName: newReceipt.agentName,
        batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
        itemName: data.itemName || '精制大米',
        shippedQty,
        receivedQty,
        discrepancyQty: diffQty,
        unit: data.unit || '公斤 (KG)',
        createdTime: newReceipt.signTime,
        quarantineStatus: '已锁定并阻断流转 (LOCKED)', // P3 自动阻断后续流转
        assignedAuditor: '迪亚拉与巴格达分部联合审计组',
        investigationReport: `终端扫码核收短少 ${Math.abs(diffQty)} ${data.unit || 'KG'}，已锁定差额，派发工单调查承运物流！`,
        resolutionStatus: '核查中 (调查工单派发至承运车队与审计处)'
      };
      discrepancyTicketsStore.unshift(newDiscTicket);

      // 将该批次货物状态冻结阻断
      const errStock = stocksStore.find((s) => s.batchNo === newDiscTicket.batchNo);
      if (errStock) {
        errStock.frozenQty += Math.abs(diffQty);
        errStock.lockedQty = Math.max(0, errStock.lockedQty - Math.abs(diffQty));
      }

      // 记录审计日志
      auditLogsStore.unshift({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: newReceipt.signTime,
        operatorId: 'AGT-RECEIPT-AUTO',
        operatorName: '代理终端对账联动引擎',
        role: 'SYSTEM',
        terminalIp: '192.168.10.45',
        microservice: 'SCM / BPM',
        module: '代理交接核对',
        action: 'DISCREPANCY_ALERT_BLOCKED',
        actionDesc: `【P3规则触发】实收与流水存在差异（短缺 ${Math.abs(diffQty)} ${data.unit || 'KG'}），自动锁定差额并派发核查工单【${ticketNo}】，阻断流转！`,
        riskLevel: 'HIGH',
        beforeSnapshot: `{"shipped":${shippedQty},"received":${receivedQty}}`,
        afterSnapshot: JSON.stringify(newDiscTicket)
      });

      return createResponse(
        { receipt: newReceipt, ticket: newDiscTicket },
        200,
        `【P3差异预警触发】实收数量与交付流水存在差额（${diffQty} ${data.unit || 'KG'}）！系统已自动锁定异常差额并派发核查工单【${ticketNo}】，阻断异常批次后续流转！`
      );
    }

    return createResponse(newReceipt, 200, (isEn ? 'Agent station terminal scan receipt succeeded! Bill point-to-point reconciliation fully matched.' : '代理网点终端扫码核收成功！账单点对点对账完全相符。'));
  }

  // 4.12 差异核查工单列表 (SCM)
  if (url.includes('/warehouse/discrepancy-tickets') && method === 'GET') {
    return createResponse(discrepancyTicketsStore);
  }

  // 4.12.1 协同处理差异工单
  const discResolveMatch = url.match(/\/warehouse\/discrepancy-tickets\/([^/]+)\/resolve/);
  if (discResolveMatch && method === 'POST') {
    const tId = discResolveMatch[1];
    const ticket = discrepancyTicketsStore.find((t) => t.id === tId || t.ticketNo === tId);
    if (!ticket) {
      return createResponse(null, 404, isEn ? 'Verification ticket not found!' : '核查工单不存在！');
    }
    ticket.resolutionStatus = '核查完结 (责任已定)';
    ticket.quarantineStatus = '已解除阻断并执行折损认定';
    ticket.investigationReport += `\n[处理批示]: ${data.resolutionNote || '责任认定完毕，已由承运保险全额理赔。'}`;
    return createResponse(ticket, 200, (isEn ? 'Discrepancy verification ticket closed-loop resolved!' : '差异核查工单已闭环处置！'));
  }

  // 4.13 末端配给智能读卡核验 (SCM / UNICODE)
  if (url.includes('/warehouse/citizen-claim/verify') && method === 'GET') {
    const cardInput = (params.cardNo || 'RC-10029381').trim();
    const family =
      familiesStore.find((f) => f.rationCardNo === cardInput || f.oldPaperCardNo === cardInput || f.headName.includes(cardInput)) ||
      familiesStore[0];

    const eligibleMembers = (family.members || []).filter((m) => m.status === '正常').length;
    // 检查本月是否已核销
    const alreadyClaimed = citizenClaimsStore.some(
      (c) => c.rationCardNo === family.rationCardNo && c.claimPeriod.includes('2026年10月')
    );

    const quotaInfo = {
      family,
      cardNo: family.rationCardNo,
      headName: family.headName,
      eligibleMembers,
      alreadyClaimed,
      claimPeriod: '2026年10月份配额',
      quotaList: [
        { itemName: '精制大米', quotaPerHead: 3.0, totalQuota: eligibleMembers * 3.0, unit: 'KG' },
        { itemName: '特级面粉', quotaPerHead: 9.0, totalQuota: eligibleMembers * 9.0, unit: 'KG' },
        { itemName: '食用植物油', quotaPerHead: 1.0, totalQuota: eligibleMembers * 1.0, unit: 'L' },
        { itemName: '纯精白糖', quotaPerHead: 1.0, totalQuota: eligibleMembers * 1.0, unit: 'KG' }
      ]
    };
    return createResponse(quotaInfo);
  }

  // 4.13.1 提交末端配额核销与即时交付 (强制 P4 校验: 事务原子性、防跨期重领冒领、秒级双向同步云端主账本)
  if (url.includes('/warehouse/citizen-claim/claim') && method === 'POST') {
    const cardNo = data.rationCardNo || 'RC-10029381';
    const period = data.claimPeriod || '2026年10月份配额';

    // [P4 规则 1: 防跨期重领冒领超额申领校验]
    const exists = citizenClaimsStore.find((c) => c.rationCardNo === cardNo && c.claimPeriod === period);
    if (exists) {
      return createResponse(
        null,
        400,
        isEn ? `[P4 Anti-Duplicate-Claim Safety Interception] Electronic ration card [${cardNo}] for [${period}] was already claimed and verified at ${exists.claimTime}! Anti-forgery voucher: ${exists.claimVoucherNo}. Cross-period duplicate claiming, impersonated claiming and over-quota claiming are strictly prohibited!` : `【P4 防重领安全拦截】电子配给卡【${cardNo}】在【${period}】已于 ${exists.claimTime} 完成核销领取！防伪凭证：${exists.claimVoucherNo}。严禁跨期重领、冒领与超额申领！`
      );
    }

    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const eligibleMembers = (family.members || []).filter((m) => m.status === '正常').length || 4;

    // [P4 规则 2: 事务原子性操作与数字防伪凭证哈希]
    const hash = `VOUCHER-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString().slice(-4)}`;
    const voucherNo = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClaim = {
      id: `CLM-${Date.now().toString().slice(-4)}`,
      claimVoucherNo: voucherNo,
      rationCardNo: cardNo,
      familyCode: family.familyCode,
      headName: family.headName,
      nationalId: (family.members && family.members[0]?.nationalId) || '197582910481',
      agentCenterId: data.agentCenterId || 'FA-00128',
      agentName: data.agentName || '卡尔赫第一配给中心综合代销站',
      claimPeriod: period,
      claimTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eligibleMembers,
      claimedItems: data.claimedItems || [
        { itemName: '精制大米', qty: eligibleMembers * 3.0, unit: 'KG', quotaPerHead: 3.0 },
        { itemName: '特级面粉', qty: eligibleMembers * 9.0, unit: 'KG', quotaPerHead: 9.0 },
        { itemName: '食用植物油', qty: eligibleMembers * 1.0, unit: 'L', quotaPerHead: 1.0 },
        { itemName: '纯精白糖', qty: eligibleMembers * 1.0, unit: 'KG', quotaPerHead: 1.0 }
      ],
      digitalVoucherHash: hash,
      cardReadMethod: '移动智能终端 NFC 读卡',
      syncToCloudLedger: true,
      cloudSyncLatencyMs: 38, // 秒级以内延迟 (P4 规则)
      syncTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)}.038`,
      status: '已即刻交付核销'
    };
    citizenClaimsStore.unshift(newClaim);

    // 扣减代理任务单中的已核销数量
    const agentTask = agentAllocationTasksStore.find((t) => t.agentCenterId === newClaim.agentCenterId);
    if (agentTask) {
      agentTask.items.forEach((item) => {
        const claimed = newClaim.claimedItems.find((ci) => ci.itemName === item.itemName);
        if (claimed) {
          item.claimedQty += claimed.qty;
          item.completionRate = Math.min(100, Number(((item.claimedQty / item.plannedQty) * 100).toFixed(1)));
        }
      });
    }

    // 写入安全操作审计
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newClaim.claimTime,
      operatorId: 'AGT-00128',
      operatorName: '穆罕默德·贾巴尔·拉希德',
      role: '配给代理 (Agent)',
      terminalIp: '192.168.10.45',
      microservice: 'SCM / UNICODE',
      module: '末端配给核销',
      action: 'CITIZEN_CLAIM_VERIFY',
      actionDesc: `智能读卡完成【${family.headName}】(${cardNo}) 配额原子扣减，生成数字凭证【${voucherNo}】，秒级同步云端主账本 (耗时 38ms)`,
      riskLevel: 'LOW',
      beforeSnapshot: `{"cardNo":"${cardNo}","status":"UNCLAIMED"}`,
      afterSnapshot: JSON.stringify(newClaim)
    });

    return createResponse(
      newClaim,
      200,
      `【P4 核销成功】物资已即刻交付！数字凭证【${voucherNo}】生成完毕，家庭主账本已完成双向原子同步 (同步耗时 38ms)！`
    );
  }

  // 4.13.2 查询核销记录列表
  if (url.includes('/warehouse/citizen-claim/records') && method === 'GET') {
    return createResponse(citizenClaimsStore);
  }

  // 4.14 全链路端到端溯源引擎 (UNICODE / SCM)
  if (url.includes('/warehouse/traceability/chain') && method === 'GET') {
    return createResponse(MOCK_TRACE_CHAINS[0]);
  }

  // 4.15 多维切片流转报表 (SCM)
  if (url.includes('/warehouse/analytics/reports') && method === 'GET') {
    const reportData = [
      { province: '巴格达省', totalAllocatedTon: 84000, outboundTon: 72000, receivedTon: 68000, claimedTon: 52000, fulfillmentRate: 76.5 },
      { province: '迪亚拉省 (第140号决议区)', totalAllocatedTon: 42000, outboundTon: 34000, receivedTon: 29000, claimedTon: 21000, fulfillmentRate: 72.4 },
      { province: '基尔库克省 (第140号决议区)', totalAllocatedTon: 38000, outboundTon: 31000, receivedTon: 28000, claimedTon: 22000, fulfillmentRate: 78.5 },
      { province: '尼尼微省 (第140号决议区)', totalAllocatedTon: 52000, outboundTon: 41000, receivedTon: 36000, claimedTon: 26000, fulfillmentRate: 72.2 },
      { province: '巴士拉省', totalAllocatedTon: 68000, outboundTon: 60000, receivedTon: 58000, claimedTon: 48000, fulfillmentRate: 82.7 }
    ];
    return createResponse(reportData);
  }

  // 4.16 损耗与差异审计分析 (SCM)
  if (url.includes('/warehouse/analytics/loss-stats') && method === 'GET') {
    return createResponse(MOCK_LOSS_AUDIT_STATS);
  }

  // 4.17 操作审计不可篡改日志 (BPM / GATEWAY)
  if (url.includes('/warehouse/security/audit-logs') && method === 'GET') {
    return createResponse(auditLogsStore);
  }

  // 4.17.1 高风险操作双人复核审批 (强制 P5 校验: 双人签批记录)
  if (url.includes('/warehouse/security/double-approval') && method === 'POST') {
    if (!data.approver1 || !data.approver2) {
      return createResponse(null, 400, isEn ? '[P5 Rule Interception] High-risk operations (large write-offs / stocktake variance adjustments) require dual sign-off records from both the primary operator and the reviewing supervisor!' : '【P5 规则拦截】高风险操作（大额报损/盘点差异调整）必须具备主操作人与复核主管双人签批记录！');
    }

    if (data.lossId) {
      const loss = lossRecordsStore.find((l) => l.id === data.lossId || l.lossNo === data.lossId);
      if (loss) {
        loss.approvalStatus = '双人签批通过';
        loss.approvers = [
          { name: data.approver1, time: new Date().toISOString().replace('T', ' ').slice(0, 19) },
          { name: data.approver2, time: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        ];
      }
    }

    if (data.stocktakeId) {
      const stk = stocktakeRecordsStore.find((s) => s.id === data.stocktakeId || s.stocktakeNo === data.stocktakeId);
      if (stk) {
        stk.status = '已审批入账';
        stk.approver1 = data.approver1;
        stk.approver2 = data.approver2;
      }
    }

    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorId: 'BPM-DOUBLE-SIGN',
      operatorName: `${data.approver1} / ${data.approver2}`,
      role: '双人签批授权',
      terminalIp: '192.168.10.12',
      microservice: 'BPM / SCM',
      module: '安全审计与复核',
      action: 'DOUBLE_APPROVAL_CONFIRMED',
      actionDesc: `完成高风险业务双人签批：${data.targetTitle || '报损与盘亏调整审核'}`,
      riskLevel: 'HIGH',
      beforeSnapshot: '{"status":"PENDING_APPROVAL"}',
      afterSnapshot: JSON.stringify(data)
    });

    return createResponse({ success: true }, 200, (isEn ? `[P5 Dual Sign-off Completed] Primary operator [${data.approver1}] and review supervisor [${data.approver2}] passed dual verification!` : `【P5 双人签批完成】主操作人【${data.approver1}】与复核主管【${data.approver2}】双重验证通过！`));
  }

  // 4.18 P1 ~ P5 阶段验证规则列表与在线测试 (验证中心)
  if (url.includes('/warehouse/verification/rules') && method === 'GET') {
    return createResponse(validationRulesStore);
  }

  const pTestMatch = url.match(/\/warehouse\/verification\/rules\/([^/]+)\/test/);
  if (pTestMatch && method === 'POST') {
    const rCode = pTestMatch[1].toUpperCase();
    const rule = validationRulesStore.find((r) => r.code === rCode);
    if (!rule) {
      return createResponse(null, 404, isEn ? 'Rule not found!' : '规则不存在！');
    }
    // 仿真验证成功
    return createResponse(
      {
        code: rCode,
        verified: true,
        testTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        complianceRate: '100%',
        message: (isEn ? `[${rCode} Stage Rule Simulation Verified] ${rule.ruleDescription}` : `【${rCode}阶段规则仿真验证通过】${rule.ruleDescription}`)
      },
      200,
      `阶段规则【${rCode}】仿真验证通过！符合国家战略保供与审计规范。`
    );
  }

  // ==========================================
  // 5. 代理商模块 (Agent)
  // ==========================================
  // 5.1 查询当前登录代理人名下的中心列表 (SCM)
  if (url.includes('/agent/my-centers') && method === 'GET') {
    let result = myAgentCentersStore.map(center => ({ ...center, warehouseLocation: center.warehouseLocation || center.warehouseCoords || DEMO_CENTER_WAREHOUSE_LOCATIONS[center.centerId] || null }));
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.isArticle140 !== undefined && params.isArticle140 !== '') {
      const is140 = String(params.isArticle140) === 'true';
      result = result.filter((c) => c.isArticle140 === is140);
    }
    return createResponse(result);
  }

  // 5.2 查询全国及第140号决议覆盖省份与中心列表 (UNICODE / SCM)
  if (url.includes('/agent/article140-centers') && method === 'GET') {
    // 140 号决议清单以「业务规则配置」为准，增减后立即生效
    const configuredCenters = getArticle140Centers();
    const configuredIds = new Set(configuredCenters.map((center) => String(center.id)));
    const baseCenters = article140CentersStore.map((center) => ({
      ...center,
      isArticle140: configuredIds.has(String(center.centerId))
    }));
    configuredCenters.forEach((center) => {
      if (!baseCenters.some((item) => String(item.centerId) === String(center.id))) {
        baseCenters.push({
          centerId: String(center.id),
          centerName: center.name,
          province: center.province || '',
          city: '',
          isArticle140: true,
          status: '正常营业'
        });
      }
    });
    let result = baseCenters;
    if (params.province && params.province !== '全部') {
      result = result.filter((c) => c.province.includes(params.province));
    }
    if (params.city && params.city !== '全部') {
      result = result.filter((c) => c.city && c.city.includes(params.city));
    }
    if (params.isArticle140 !== undefined && params.isArticle140 !== '') {
      const is140 = String(params.isArticle140) === 'true';
      result = result.filter((c) => c.isArticle140 === is140);
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status.includes(params.status));
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.centerId.includes(kw) ||
          c.centerName.toLowerCase().includes(kw) ||
          (c.city && c.city.toLowerCase().includes(kw)) ||
          (c.warehouseCode && c.warehouseCode.toLowerCase().includes(kw)) ||
          (c.address && c.address.toLowerCase().includes(kw))
      );
    }
    return createResponse(result);
  }

  // 5.3 查询当前代理人档案及法定资格状态 (AUTH / SCM)
  if (url.includes('/agent/profile') && method === 'GET') {
    return createResponse(MOCK_CURRENT_AGENT_PROFILE);
  }

  // 5.4 查询业务申请工单流水 (BPM)
  if (url.includes('/agent/applications') && method === 'GET' && !url.includes('/pay')) {
    let result = [...agentApplicationsStore];
    if (params.type && params.type !== '全部') {
      result = result.filter((t) => t.type === params.type);
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((t) => t.status === params.status);
    }
    return createResponse(result);
  }

  // 5.5 提交新代理权授予申请 (BPM / SCM)
  // 严格法定校验：申请代理的中心当前不能已被代理，已被代理的中心需要先注销代理，才能申请
  if (url.includes('/agent/apply-grant') && method === 'POST') {
    const { centerId, category, applicantName, applicantNationalId, applicantAge, isNonPublicEmployee, ministerApprovalNo } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, isEn ? 'The ration center to apply for does not exist, please select again!' : '拟申请的配给中心不存在，请重新选择！');
    }

    // 核心前置拦截：已被代理的中心不能申请，必须先注销
    if (targetCenter.status === '已被代理' || targetCenter.status === 'Delegated') {
      return createResponse(
        {},
        400,
        isEn
          ? `[Compliance Redline Interception]: Ration center [${targetCenter.centerName}] is currently delegated! Per Article 140 resolution and Ministry of Trade regulations, a delegated center must deregister its agency before a grant application can be filed.`
          : `【合规红线拦截】：配给中心【${targetCenter.centerName}】当前已被代理！依照第140号决议与贸易部规定，已被代理的中心须先注销代理，方可提出授予申请。`
      );
    }

    // 年龄红线拦截：18 至 48 周岁之间
    const age = Number(applicantAge) || 30;
    if (age < 18 || age > 48) {
      return createResponse({}, 400, isEn ? `[Eligibility Failure]: Candidate age must be between 18 and 48 (currently entered: ${age}).` : `【资格不符】：候选人年龄须在 18 至 48 周岁之间（当前填写为 ${age} 周岁）。`);
    }

    // 公职人员/军人/学生排他拦截
    if (!isNonPublicEmployee) {
      return createResponse({}, 400, isEn ? '[Eligibility Failure]: The applicant must not be a student, employee, serviceman, company owner/shareholder or contractor, and must not draw any state salary in any capacity!' : '【资格不符】：申请人不得为学生、雇员、军人、公司所有者或股东或承包商，且不得以任何名义领取国家工资！');
    }

    // 部长批准文号校验
    if (!ministerApprovalNo) {
      return createResponse({}, 400, isEn ? '[Missing Prerequisite Approval]: An agency application requires prior approval by the Minister of Trade (Food or Flour); fill in the approval number and upload the original!' : '【缺少前置批件】：申请代理权须已获得贸易部长批准（食品或面粉）并填写批件号及上传原件！');
    }

    const ticketNo = `AGT-APP-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'GRANT',
      typeName: isEn ? 'New Agency Grant Application' : '新代理权授予申请',
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: category || targetCenter.category || (isEn ? 'Flour' : '面粉'),
      applicantName: applicantName || MOCK_CURRENT_AGENT_PROFILE.name,
      applicantNationalId: applicantNationalId || MOCK_CURRENT_AGENT_PROFILE.idCardNo,
      applicantPhone: data.applicantPhone || MOCK_CURRENT_AGENT_PROFILE.phone,
      status: isEn ? 'Pending E-Payment' : '待电子支付', // 预先生成待缴规费环节
      currentStep: 3,
      feeAmount: 250000, // 二十五万伊拉克第纳尔
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: isEn ? 'Automatic review passed (age and non-public-official identity checks qualified); on-site joint sampling by the committee passed; approved to proceed to the electronic payment stage of the 250,000 IQD fee.' : '自动审核通过（年龄与非公职身份校验合格），委员会现场联合抽查合格，准予进入电子缴纳250,000 IQD规费阶段。',
      committeeMembers: [
        { dept: isEn ? (targetCenter.province.includes('Baghdad') || targetCenter.province.includes('巴格达') ? 'Baghdad Ration Branch' : `${targetCenter.province} Ration Branch`) : (targetCenter.province.includes('巴格达') ? '巴格达配给分部' : `${targetCenter.province}配给分部`), status: isEn ? 'On-Site Verification Passed' : '实地核查通过', officer: isEn ? 'Rahim Zahid' : '拉希姆·扎希德' },
        { dept: isEn ? 'Planning & Follow-up Directorate' : '规划与跟进司', status: isEn ? 'Quota Compliance Review Passed' : '配额合规审核通过', officer: isEn ? 'Adnan Bashir' : '阿德南·巴希尔' },
        { dept: isEn ? 'Commercial Supervision Directorate (Observer)' : '商业监督司 (观察员)', status: isEn ? 'Observer On-Site Sign-off Approved' : '观察员现场签字核准', officer: isEn ? 'Haider Fatih' : '海德尔·法蒂赫' }
      ],
      documents: [
        { name: isEn ? 'Minister_of_Trade_Approval_Letter.pdf' : '贸易部长批准公函.pdf', size: '1.5MB', verified: true },
        { name: isEn ? '30%_Served_Families_Thumbprint_Consent.pdf' : '30%服务家庭拇指印同意书.pdf', size: '4.2MB', verified: true },
        { name: isEn ? 'Applicant_National_ID_and_Primary_Education_Certificate.pdf' : '申请人国民身份证与小学及以上毕业证.pdf', size: '2.0MB', verified: true },
        { name: isEn ? 'Business_Premises_Property_Deed_or_Notarized_Lease.pdf' : '营业用房产权证或公证租赁合同.pdf', size: '3.1MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, isEn ? 'Agency grant application submitted successfully; automatic eligibility verification completed, proceeding to fee payment and certificate issuance!' : '代理权授予申请提交成功，已完成资格自动核验，进入规费缴纳与证书颁发环节！');
  }

  // 5.6 提交代理权轮替 (转移) 申请 (BPM / SCM)
  if (url.includes('/agent/apply-rotation') && method === 'POST') {
    const { centerId, rotationScenario, successorName, successorKinship, deceasedDate, isWifeSuccession } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, isEn ? 'The ration center to rotate does not exist!' : '拟办理轮替的配给中心不存在！');
    }

    // 已故轮替时限校验：12个月内完成轮替
    if (rotationScenario === 'DECEASED' && deceasedDate) {
      const deathDateObj = new Date(deceasedDate);
      const now = new Date();
      const diffMonths = (now.getFullYear() - deathDateObj.getFullYear()) * 12 + (now.getMonth() - deathDateObj.getMonth());
      if (diffMonths > 12) {
        return createResponse({}, 400, isEn ? '[Deadline Exceeded Interception]: Deceased agent rotation must be completed within 12 months from the agent\'s date of death; overdue agency will be deregistered immediately by law!' : '【时限超期拦截】：已故代理轮替必须在代理死亡之日起 12 个月内完成，超期代理权将被依法立即注销！');
      }
    }

    const ticketNo = `AGT-ROT-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'ROTATION',
      typeName: rotationScenario === 'DECEASED' ? (isEn ? 'Agency Rotation (Deceased Agent Kin Succession)' : '代理权轮替 (已故代理亲属轮替)') : (isEn ? 'Agency Rotation (Agent-Requested Transfer)' : '代理权轮替 (应代理申请转让)'),
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: targetCenter.category || (isEn ? 'Flour' : '面粉'),
      applicantName: successorName || (isEn ? 'Transferee' : '受让人'),
      originalAgentName: targetCenter.currentAgentName || MOCK_CURRENT_AGENT_PROFILE.name,
      kinship: successorKinship || (isEn ? 'Direct Relative Within Three Generations' : '三代以内直系亲属'),
      status: isEn ? 'Pending E-Payment' : '待电子支付',
      currentStep: 3,
      feeAmount: 50000, // 五万伊拉克第纳尔
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: isEn ? 'Reviewed and approved by the company legal department and the Planning & Follow-up Directorate: kinship inheritance documents complete, deceased quota written off; please pay the 50,000 IQD statutory document fee to complete certificate renewal.' : '公司法务部及规划跟进司审查通过：亲属继承材料完备，逝者配给份额已核销，请支付50,000 IQD法定公文规费以完成证书更新。',
      committeeMembers: [
        { dept: isEn ? 'Legal Department, Grain & Cereal Processing Company' : '粮食及谷物加工公司法务部', status: isWifeSuccession ? (isEn ? 'Spouse rotation exempt from heir waiver declaration; directly approved as compliant' : '配偶轮替免予继承人放弃声明，直接合规核准') : (isEn ? 'Inheritance certificate and legal waiver declaration verified' : '继承证书与法务放弃声明核验通过'), officer: isEn ? 'Salim Nouri' : '萨利姆·努里' },
        { dept: isEn ? 'Planning & Follow-up Directorate' : '规划与跟进司', status: isEn ? 'Deceased quota deregistration report verified' : '逝者配额注销报告核查无误', officer: isEn ? 'Ali Khalid' : '阿里·哈立德' }
      ],
      documents: [
        { name: isEn ? 'Legal_Inheritance_Certificate_(qassam_shar-i).pdf' : '合法继承证书(教法分割证书 qassam shar-i).pdf', size: '2.1MB', verified: true },
        { name: isEn ? 'Death_Certificate_and_4-Month_Quota_Deregistration_Receipt.pdf' : '死亡证明及4个月内逝者配额注销回执.pdf', size: '1.8MB', verified: true },
        { name: isEn ? 'Transferee_Full-Time_Dedication_and_Non-Public_Official_Notarized_Undertaking.pdf' : '受让亲属专职投入与非公职公证承诺书.pdf', size: '1.2MB', verified: true },
        { name: isEn ? 'Valid_ID_Documents_and_Same-Area_Residence_Certificate.pdf' : '双方有效身份证明及同地区居民证明.pdf', size: '2.3MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, isEn ? 'Agency rotation application accepted and cleared by legal review; please pay the 50,000 IQD fee to complete the transfer!' : '代理权轮替申请已受理并经法务审核，请缴纳50,000 IQD规费完成转移！');
  }

  // 5.7 提交恢复已注销代理权申请 (BPM / SCM)
  if (url.includes('/agent/apply-restoration') && method === 'POST') {
    const { centerId, restorationType, hasCriminalRecord, hasTamperingRecord, supportFamilyPercent } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, isEn ? 'Target center does not exist!' : '目标中心不存在！');
    }

    // 核心前置拦截：该代理权未被合并
    if (targetCenter.isMerged) {
      return createResponse({}, 400, isEn ? '[Compliance Interception]: This agency has been merged into another ration center station; restoration is prohibited per Ministry of Trade regulations!' : '【合规拦截】：该代理权已被并入其他配给中心网点，依照贸易部规定禁止恢复！');
    }

    // 负面清单一票否决：已被法院判决、道德败坏/恐怖主义罪行、篡改或替换物资
    if (hasCriminalRecord || hasTamperingRecord) {
      return createResponse(
        {},
        400,
        isEn ? '[Statutory Veto]: Agents convicted by court, involved in immoral or terrorism offenses, or found to have tampered with or substituted Ministry of Trade materials are explicitly prohibited by law from agency restoration!' : '【法定义务一票否决】：已被法院判决、涉及道德败坏或恐怖主义罪行、或查实篡改替换贸易部物资的代理，法律明令禁止恢复代理权！'
      );
    }

    // 处罚恢复：不少于 25% 家庭支持
    const supportPct = Number(supportFamilyPercent) || 0;
    if (restorationType === 'PUNISHMENT' && supportPct < 25) {
      return createResponse(
        {},
        400,
        isEn ? `[Insufficient Public Support]: Restoration of a agency deregistered by punishment requires joint endorsement by no less than 25% of households in the district (currently reported: ${supportPct}%).` : `【民意支持率不足】：因处罚注销的代理权恢复，须有不低于 25% 的辖区家庭联署支持（当前上报为 ${supportPct}%）。`
      );
    }

    const ticketNo = `AGT-RES-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'RESTORATION',
      typeName: restorationType === 'PUNISHMENT' ? (isEn ? 'Restore Deregistered Agency (Violation Punishment Rectification)' : '恢复已注销代理权 (违规处罚整改恢复)') : (isEn ? 'Restore Deregistered Agency (Agent-Requested Restoration)' : '恢复已注销代理权 (应代理申请恢复)'),
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: targetCenter.category || (isEn ? 'Flour' : '面粉'),
      applicantName: data.applicantName || MOCK_CURRENT_AGENT_PROFILE.name,
      status: isEn ? 'Pending E-Payment' : '待电子支付',
      currentStep: 3,
      feeAmount: 50000,
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: isEn ? 'Joint investigation by the Planning & Follow-up Directorate and the Commercial & Financial Supervision Directorate completed: not merged, no judicial veto record, and household support rate meets the threshold. Approved to pay the fee for restoration!' : '规划与跟进司联合商业财务监督司联合调查完毕：未被合并、无一票否决司法污点且家庭支持率达标。准予支付规费恢复！',
      committeeMembers: [
        { dept: isEn ? 'Planning & Follow-up Directorate' : '规划与跟进司', status: isEn ? `Joint investigation verified household support rate passed (${supportPct || 28}%)` : `联合调查核实家庭支持率通过 (${supportPct || 28}%)`, officer: isEn ? 'Nur al-Din al-Murtada' : '努尔丁·穆尔塔达' },
        { dept: isEn ? 'Commercial & Financial Supervision Directorate' : '商业和财务监督司', status: isEn ? 'Rectification on-site acceptance passed' : '整改现场验收合格', officer: isEn ? 'Haider Fatih' : '海德尔·法蒂赫' }
      ],
      documents: [
        { name: isEn ? 'Agency_Restoration_Formal_Application_Letter.pdf' : '恢复代理权正式申请公函.pdf', size: '1.2MB', verified: true },
        { name: isEn ? 'Full-Time_Operation_and_Rectification_Written_Undertaking.pdf' : '专职经营及整改违规书面承诺书.pdf', size: '1.4MB', verified: true },
        { name: isEn ? '25%+_Household_Thumbprint_Support_Roster.pdf' : '辖区25%以上家庭联署支持拇指印证明底册.pdf', size: '3.8MB', verified: true },
        { name: isEn ? 'Judicial_No-Criminal-Record_and_No-Material-Tampering_Letter.pdf' : '司法无刑事罪行与无物资篡改公函.pdf', size: '1.1MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, isEn ? 'Restoration application passed the joint investigation of both directorates; please pay the fee to complete agency restoration!' : '恢复申请已通过双司联合调查，请缴纳规费完成代理权恢复！');
  }

  // 5.8 代理权主动注销申请 (SCM) - 满足“已被代理的中心需要先注销代理，才能申请”
  if (url.match(/\/agent\/centers\/([^/]+)\/cancel/) && method === 'POST') {
    const centerId = url.split('/')[3];
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));
    const targetMyCenter = myAgentCentersStore.find((c) => c.centerId === String(centerId));

    if (targetCenter) {
      targetCenter.status = '已注销(空置待申请)';
      targetCenter.canApply = true;
      targetCenter.canRestore = true;
      targetCenter.currentAgentId = null;
      targetCenter.currentAgentName = `原代理：${data.agentName || MOCK_CURRENT_AGENT_PROFILE.name} (已注销)`;
      targetCenter.lastCancellationReason = data.reason || (isEn ? 'Agent voluntary deregistration or transfer clearance declaration' : '代理人主动申报注销或转让清退');
      targetCenter.cancellationDate = new Date().toISOString().slice(0, 10);
    }

    if (targetMyCenter) {
      targetMyCenter.status = '已注销';
      targetMyCenter.isCurrentActive = false;
      targetMyCenter.cancellationReason = data.reason || (isEn ? 'Voluntarily deregistered' : '已主动注销');
      addMockNotification('agent', 'outlet', 'outlets');
    }

    // 记录一条注销工单
    const ticketNo = `AGT-CAN-${Date.now()}`;
    agentApplicationsStore.unshift({
      ticketNo,
      type: 'CANCELLATION',
      typeName: '代理权主动注销',
      centerId: centerId,
      centerName: targetCenter ? targetCenter.centerName : '配给中心',
      province: targetCenter ? targetCenter.province : '未知省份',
      isArticle140: targetCenter ? targetCenter.isArticle140 : false,
      category: targetCenter ? targetCenter.category : '综合',
      applicantName: data.agentName || MOCK_CURRENT_AGENT_PROFILE.name,
      status: '已完成',
      currentStep: 4,
      feeAmount: 0,
      feePaid: true,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: '网点代理权已成功注销，已向系统公示为空置网点，可供符合条件之公民或亲属申请新代理权。'
    });

    return createResponse(
      { success: true, centerId },
      200,
      `网点【${targetCenter ? targetCenter.centerName : centerId}】已成功注销！当前已释放为空置状态，符合条件者可发起新申请。`
    );
  }

  // 5.9 电子规费支付 (SCM / PAYMENT)
  if (url.match(/\/agent\/applications\/([^/]+)\/pay/) && method === 'POST') {
    const ticketNo = url.split('/')[3];
    const targetApp = agentApplicationsStore.find((a) => a.ticketNo === ticketNo);

    if (!targetApp) {
      return createResponse({}, 404, (isEn ? 'The specified application not found!' : '未找到指定申请单！'));
    }

    targetApp.feePaid = true;
    targetApp.status = '已完成';
    targetApp.currentStep = 4;
    targetApp.payChannel = data.channel || 'QI-CARD-ONLINE';
    targetApp.payTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetApp.auditNotes = `规费 ${targetApp.feeAmount.toLocaleString()} IQD 已通过 ${targetApp.payChannel} 缴纳入国库。电子批件与经营许可证已颁发生效！`;

    // 联动更新中心与网点数据
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(targetApp.centerId));
    if (targetCenter) {
      if (targetApp.type === 'GRANT' || targetApp.type === 'RESTORATION') {
        targetCenter.status = '已被代理';
        targetCenter.canApply = false;
        targetCenter.currentAgentId = MOCK_CURRENT_AGENT_PROFILE.id;
        targetCenter.currentAgentName = targetApp.applicantName;
        targetCenter.lastCancellationReason = null;

        // 如果不在 myAgentCentersStore 中，则新加入
        const exists = myAgentCentersStore.find((m) => m.centerId === targetCenter.centerId);
        if (exists) {
          exists.status = '正常营业';
          exists.isCurrentActive = true;
          exists.ownerName = targetApp.applicantName;
        } else {
          myAgentCentersStore.unshift({
            id: `AG-${targetCenter.centerId}`,
            centerId: targetCenter.centerId,
            name: `${targetCenter.centerName}代销站`,
            centerName: targetCenter.centerName,
            agentType: targetApp.category || '综合',
            province: targetCenter.province,
            branchName: targetCenter.branchName,
            isArticle140: targetCenter.isArticle140,
            ownerName: targetApp.applicantName,
            phone: targetApp.applicantPhone || MOCK_CURRENT_AGENT_PROFILE.phone,
            address: targetCenter.address,
            storeAreaSqM: 45,
            householdsCount: targetCenter.registeredHouseholds || 800,
            maxCap: 1500,
            status: '正常营业',
            isCurrentActive: true,
            inspectionScore: 98.0,
            licenseNo: `LIC-${targetCenter.centerId}-2026`
          });
        }
      } else if (targetApp.type === 'ROTATION') {
        targetCenter.currentAgentName = targetApp.applicantName;
        const exists = myAgentCentersStore.find((m) => m.centerId === targetCenter.centerId);
        if (exists) {
          exists.ownerName = targetApp.applicantName;
          exists.status = '正常营业';
          exists.isCurrentActive = true;
        }
      }
    }

    if (targetCenter) addMockNotification('agent', 'outlet', 'outlets');

    return createResponse(
      targetApp,
      200,
      `电子规费 ${targetApp.feeAmount.toLocaleString()} IQD 结算成功！代理权证照已生效。`
    );
  }

  // 5.10 全网格代销网点列表查询 (GET)
  if (url.includes('/agent/list') && method === 'GET') {
    const allAgentsSource = isEn ? enAgent.MOCK_AGENTS : zhAgent.MOCK_AGENTS;
    let list = [...(allAgentsSource || myAgentCentersStore)];
    if (params.province && params.province !== '全部') {
      list = list.filter((a) => a.province?.includes(params.province));
    }
    if (params.category && params.category !== '全部') {
      list = list.filter((a) => a.agentType?.includes(params.category));
    }
    if (params.status && params.status !== '全部') {
      list = list.filter((a) => a.status?.includes(params.status));
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(kw)) ||
          (a.id && a.id.toLowerCase().includes(kw)) ||
          (a.ownerName && a.ownerName.toLowerCase().includes(kw)) ||
          (a.phone && a.phone.includes(kw)) ||
          (a.centerName && a.centerName.toLowerCase().includes(kw)) ||
          (a.address && a.address.toLowerCase().includes(kw))
      );
    }
    return createResponse(list);
  }

  const procurementProfile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
  const procurementStaff = ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(procurementProfile.role) || procurementProfile.permissionCodes?.includes('agents.view');
  const procurementAgentIds = procurementProfile.role === 'agent'
    ? (Array.isArray(procurementProfile.agentIds) ? procurementProfile.agentIds.map(String) : procurementProfile.agentId || procurementProfile.agentCode ? [String(procurementProfile.agentId || procurementProfile.agentCode)] : procurementProfile.id === 'usr-agt-01' ? myAgentCentersStore.map(item => item.id) : [])
    : procurementStaff ? myAgentCentersStore.map(item => item.id) : [];
  const canAccessProcurement = order => procurementStaff || procurementAgentIds.includes(order.agentId);
  const procurementWrite = procurementProfile.role === 'agent' || ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(procurementProfile.role) || procurementProfile.permissionCodes?.includes('agents.edit');

  if (url.endsWith('/agent/g2b/orders') && method === 'GET') {
    if (!procurementStaff && procurementProfile.role !== 'agent') return createResponse({}, 403, i18n.global.t('api.forbidden'));
    let result = g2bOrdersStore.filter(canAccessProcurement);
    if (params.status && params.status !== '全部') result = result.filter(order => params.status === 'UNFINISHED' ? order.status !== 'COMPLETED' : order.status === params.status);
    if (params.agentId) result = result.filter(order => order.agentId === params.agentId);
    if (params.keyword) {
      const keyword = String(params.keyword).toLowerCase();
      result = result.filter(order => [order.orderNo, order.pickupVoucherCode, order.centerName].some(value => String(value || '').toLowerCase().includes(keyword)));
    }
    return createResponse(result.map(order => presentProcurementOrder(order, localeCode)));
  }

  if (url.endsWith('/agent/g2b/orders') && method === 'POST') {
    if (!procurementWrite) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    const targetAgent = myAgentCentersStore.find(agent => agent.id === data.agentId);
    if (!targetAgent || !targetAgent.isCurrentActive || !canAccessProcurement({ agentId: data.agentId }) || String(targetAgent.centerId) !== String(data.centerId)) return createResponse({}, 403, i18n.global.t('agentProcurement.invalidAgent'));
    let items;
    try { items = normalizeProcurementItems(data.items); } catch { return createResponse({}, 400, i18n.global.t('agentProcurement.invalidItems')); }
    const limits = { 'FLOUR-WHT-02': 9, 'RICE-BAS-01': 4.5, 'OIL-SUN-03': 1.2, 'SUGAR-WHT-04': 2 };
    if (items.some(item => item.qty > Math.floor(Number(targetAgent.householdsCount || 0) * limits[item.itemCode] * 1.2))) return createResponse({}, 400, i18n.global.t('agentProcurement.invalidItems'));
    const requestId = String(data.requestId || '');
    const fingerprint = JSON.stringify([data.agentId, data.centerId, data.logisticsMode, data.timeSlot, items.map(item => [item.itemCode, item.qty])]);
    const existing = requestId && g2bOrdersStore.find(order => order.requestId === requestId && order.createdBy === String(procurementProfile.id || procurementProfile.username));
    if (existing) return existing.requestFingerprint === fingerprint ? createResponse(presentProcurementOrder(existing, localeCode)) : createResponse({}, 409, i18n.global.t('agentProcurement.duplicateRequest'));
    const orderNo = `G2B-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const paid = data.payStatus === 'PAID' || data.isPaid === true;
    const now = new Date().toISOString();
    const order = { orderNo, requestId, requestFingerprint: fingerprint, createdBy: String(procurementProfile.id || procurementProfile.username), agentId: targetAgent.id, agentName: targetAgent.name, centerId: String(targetAgent.centerId), centerName: targetAgent.centerName, province: targetAgent.province,
      items, totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0), currency: 'IQD', logisticsMode: data.logisticsMode === 'PICKUP' ? 'PICKUP' : 'DISPATCH', timeSlot: String(data.timeSlot || ''), deliveryVehicleNo: String(data.deliveryVehicleNo || ''), status: paid ? 'PAID_WMS_PICKING' : 'PENDING_PAYMENT', payStatus: paid ? 'PAID' : 'UNPAID', payChannel: paid ? data.payChannel || 'PUBLIC_TREASURY_ACCOUNT' : null, payTime: paid ? now : null,
      pickupVoucherCode: `PK-${orderNo}`, smsNotified: paid, smsContent: '', wmsTaskId: paid ? `WMS-${orderNo}` : null, createdAt: now, remarks: '' };
    writeProcurementOrder(order);
    appendSystemAudit({ actor: procurementProfile.name || procurementProfile.username, type: paid ? 'payment' : 'application', businessNo: orderNo, details: 'Created agent procurement order', after: { agentId: order.agentId, amount: order.totalAmount, payStatus: order.payStatus } });
    return createResponse(presentProcurementOrder(order, localeCode), 200, i18n.global.t('agentProcurement.created'));
  }

  const procurementAction = url.match(/\/agent\/g2b\/orders\/([^/]+)\/(pay|receive)$/);
  if (procurementAction && method === 'POST') {
    const order = g2bOrdersStore.find(item => item.orderNo === decodeURIComponent(procurementAction[1]));
    if (!order) return createResponse({}, 404, i18n.global.t('api.notFound'));
    if (!procurementWrite || !canAccessProcurement(order)) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    if (['CANCELLED', 'REJECTED'].includes(order.status)) return createResponse({}, 409, i18n.global.t('agentProcurement.invalidState'));
    if (procurementAction[2] === 'pay') {
      if (order.payStatus === 'PAID') return createResponse(presentProcurementOrder(order, localeCode));
      order.payStatus = 'PAID'; order.status = 'PAID_WMS_PICKING'; order.payTime = new Date().toISOString(); order.payChannel = data.channel || 'PUBLIC_TREASURY_ACCOUNT'; order.wmsTaskId = `WMS-${order.orderNo}`; order.smsNotified = true;
    } else {
      if (order.status === 'COMPLETED') return createResponse(presentProcurementOrder(order, localeCode));
      if (order.payStatus !== 'PAID' || !['PAID_WMS_PICKING', 'IN_TRANSIT'].includes(order.status) || data.confirmed !== true) return createResponse({}, 409, i18n.global.t('agentProcurement.invalidState'));
      order.status = 'COMPLETED'; order.completedAt = new Date().toISOString(); order.receivedBy = procurementProfile.id || procurementProfile.username;
    }
    writeProcurementOrder(order);
    appendSystemAudit({ actor: procurementProfile.name || procurementProfile.username, type: procurementAction[2] === 'pay' ? 'payment' : 'status_change', businessNo: order.orderNo, details: 'Updated agent procurement order', after: { status: order.status, payStatus: order.payStatus, amount: order.totalAmount } });
    return createResponse(presentProcurementOrder(order, localeCode), 200, i18n.global.t(procurementAction[2] === 'pay' ? 'agentProcurement.paymentSuccess' : 'agentProcurement.receivedSuccess'));
  }

  // 5.13.1 代理端根据提货码/二维码检索订单 (GET)
  if (url.includes('/agent/citizen-orders/lookup') && method === 'GET') {
    const code = (params.code || '').trim().toLowerCase();
    if (!code) {
      return createResponse({}, 400, isEn ? 'Please enter the pickup voucher code or scan the QR code' : '请输入提货凭证码或扫描二维码');
    }
    const sharedOrders = getSharedOrderPool(localeCode);
    const sourcePool = sharedOrders;
    const matched = sourcePool.find((o) =>
      (o.pickupCode && o.pickupCode.toLowerCase() === code) ||
      (o.orderId && o.orderId.toLowerCase() === code) ||
      (o.cardNo && o.cardNo.toLowerCase() === code) ||
      (o.pickupCode && o.pickupCode.toLowerCase().includes(code)) ||
      (o.orderId && o.orderId.toLowerCase().includes(code))
    );
    if (!matched) {
      return createResponse({}, 404, isEn ? `No matching pickup order voucher found for [${code}]; please check the anti-forgery QR code` : `未检索到匹配的提货订单凭证【${code}】，请核对防伪二维码`);
    }
    return createResponse(matched);
  }

  // 5.13.2 代理端查询公民购买配给订单列表 (GET)
  const citizenOrderDetailMatch = url.match(/\/agent\/citizen-orders\/([^/?]+)$/);
  if (citizenOrderDetailMatch && method === 'GET') {
    const orderId = decodeURIComponent(citizenOrderDetailMatch[1]);
    const order = findSharedOrder(orderId, localeCode);
    if (!order) return createResponse({}, 404, i18n.global.t('agentDelivery.orderNotFound'));
    const demoPositions = {
      'PO-20261013-1001': { lat: 33.3277, lng: 44.3674, accuracy: 'approximate' },
      'PO-20261013-1003': { lat: 33.3094, lng: 44.3377, accuracy: 'approximate' }
    };
    return createResponse({ ...order, deliveryLocation: order.deliveryLocation || demoPositions[orderId] || null });
  }

  if (url.includes('/agent/citizen-orders') && !url.includes('/dispatch') && !url.includes('/lookup') && !url.includes('/verify-claim') && method === 'GET') {
    // List, details and fulfillment share the same deduplicated business pool.
    const sharedOrders = getSharedOrderPool(localeCode);
    // PocketBase/共享缓存是订单列表的唯一来源；空数组表示已清空，不能回退到内存演示数据。
    let result = [...sharedOrders];
    const orderTimestamp = (order) => {
      const value = order.createdAt || order.paidAt || order.updatedAt || 0;
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    // 新订单保持在最前；同时兼容 ISO 与 PocketBase 日期字符串。
    result.sort((a, b) => orderTimestamp(b) - orderTimestamp(a));

    if (params.deliveryType && params.deliveryType !== 'ALL') {
      result = result.filter((o) => o.deliveryType === params.deliveryType);
    }
    if (params.status && params.status !== 'ALL') {
      result = result.filter((o) => o.status === params.status);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter((o) =>
        (o.orderId && o.orderId.toLowerCase().includes(kw)) ||
        (o.cardNo && o.cardNo.toLowerCase().includes(kw)) ||
        (o.headName && o.headName.toLowerCase().includes(kw)) ||
        (o.pickupCode && o.pickupCode.toLowerCase().includes(kw)) ||
        (o.phone && o.phone.includes(kw))
      );
    }

    return createResponse(result);
  }

  // 5.13.3 代理端安排配送或标记备货就绪 (POST)
  if (url.includes('/agent/citizen-orders') && url.includes('/dispatch') && method === 'POST') {
    const parts = url.split('/');
    const orderId = decodeURIComponent(parts[parts.indexOf('citizen-orders') + 1]);
    const targetOrder = findSharedOrder(orderId, localeCode);

    if (!targetOrder) {
      return createResponse({}, 404, i18n.global.t('agentDelivery.orderNotFoundById', { orderId }));
    }

    const {
      deliveryPerson = '默罕默德专属保供车队 (阿里)',
      phone = '+964 780 999 8811',
      vehicleNo = 'BG-78219 (厢式冷链保供货车)',
      estimatedTime = '2小时内送达'
    } = data || {};

    const isHomeDelivery = targetOrder.deliveryType === 'HOME_DELIVERY';
    targetOrder.status = isHomeDelivery ? 'DISPATCHED' : 'READY_FOR_PICKUP';
    targetOrder.dispatchInfo = {
      deliveryPerson,
      phone,
      vehicleNo,
      estimatedTime,
      dispatchedAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    updateSharedOrder(orderId, {
      status: targetOrder.status,
      dispatchInfo: targetOrder.dispatchInfo
    });

    // 跨标签页广播订单状态变更
    try {
      if (typeof broadcastTabMessage === 'function') {
        broadcastTabMessage('ORDER_UPDATED', targetOrder);
      }
    } catch (e) {
      console.warn('[MockAdapter] broadcastTabMessage ORDER_UPDATED failed:', e);
    }

    // 同步到 b2cReservationsStore
    const b2cItem = b2cReservationsStore.find((r) => r.ticketNo === targetOrder.ticketNo || r.pickupCode === targetOrder.pickupCode);
    if (b2cItem) {
      b2cItem.status = isHomeDelivery ? 'DISPATCHED' : 'READY_FOR_PICKUP';
      b2cItem.dispatchInfo = targetOrder.dispatchInfo;
    }

    const successMsg = isHomeDelivery
      ? `已成功安排配送车队出车！配送员【${deliveryPerson}】，送达时请出示提货二维码。`
      : `已标记网点备货就绪！已通知持卡公民持动态二维码到店领取。`;

    return createResponse(targetOrder, 200, successMsg);
  }

  // 5.13.4 阶段 4 核心：扫描二维码/输入提货码核验交货并扣减实物库存 (POST)
  if (url.includes('/agent/citizen-orders') && url.includes('/verify-claim') && method === 'POST') {
    const parts = url.split('/');
    const orderId = decodeURIComponent(parts[parts.indexOf('citizen-orders') + 1]);
    const sharedOrders = getSharedOrderPool(localeCode);
    const sourcePool = sharedOrders;
    const targetOrder = sourcePool.find((o) => o.orderId === orderId || o.id === orderId || o.pickupCode === orderId || (data && (data.orderId === o.orderId || data.pickupCode === o.pickupCode)));

    if (!targetOrder) {
      return createResponse({}, 404, isEn ? `No order voucher pending verification & delivery was found` : `未检索到需核销交割的订单凭据`);
    }

    if (targetOrder.status === 'DELIVERED') {
      return createResponse({ order: targetOrder, alreadyDelivered: true }, 200, (isEn ? `[Notice]: This order has already been verified and delivered; pickup voucher No. [${targetOrder.claimVoucherNo || targetOrder.orderId}].` : `【注意】：该订单此前已完成核验交付，提货凭证号【${targetOrder.claimVoucherNo || targetOrder.orderId}】。`));
    }

    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetOrder.status = 'DELIVERED';
    targetOrder.deliveredAt = nowStr;
    targetOrder.verifier = data?.verifier || '网点核验专员-穆罕默德';
    targetOrder.verifyMethod = data?.verifyMethod || 'DYNAMIC_QR_CODE';
    targetOrder.signature = data?.signature || 'CITIZEN_SIGNED';
    targetOrder.claimVoucherNo = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    updateSharedOrder(targetOrder.orderId || orderId, {
      status: 'DELIVERED',
      deliveredAt: targetOrder.deliveredAt,
      verifier: targetOrder.verifier,
      verifyMethod: targetOrder.verifyMethod,
      signature: targetOrder.signature,
      claimVoucherNo: targetOrder.claimVoucherNo
    });

    // 跨标签页广播订单状态变更 (已核销交付)
    try {
      if (typeof broadcastTabMessage === 'function') {
        broadcastTabMessage('ORDER_UPDATED', targetOrder);
      }
    } catch (e) {
      console.warn('[MockAdapter] broadcastTabMessage ORDER_UPDATED failed:', e);
    }

    // 扣减代理商本地实物现货库存 (agentLocalStocksStore)
    const deductedItems = [];
    const localStockBase = readAgentStockBase(targetOrder.agentId || 'FA-00128');
    const projectedStocks = projectProcurementStocks(localStockBase, g2bOrdersStore);
    for (const it of targetOrder.items || []) {
      const localStock = localStockBase.find((s) => s.itemCode === it.itemCode);
      const qty = Number(it.qty) || 0;
      if (localStock) {
        const beforeOnHand = projectedStocks.find(stock => stock.itemCode === it.itemCode)?.currentOnHand ?? localStock.currentOnHand;
        localStock.currentOnHand -= qty;
        localStock.b2cTotalSold = (localStock.b2cTotalSold || 0) + qty;
        deductedItems.push({
          itemCode: it.itemCode,
          itemName: it.itemName,
          qty,
          unit: it.unit,
          beforeOnHand,
          afterOnHand: beforeOnHand - qty
        });
      }
    }

    writeAgentStockBase(targetOrder.agentId || 'FA-00128', localStockBase);

    // 同步 b2cReservationsStore
    const b2cItem = b2cReservationsStore.find((r) => r.ticketNo === targetOrder.ticketNo || r.pickupCode === targetOrder.pickupCode);
    if (b2cItem) {
      b2cItem.status = 'DELIVERED';
      b2cItem.payStatus = 'VERIFIED';
    }

    // 写入 citizenClaimsStore (为阶段 5 政府对账提供真实出库与核销账目数据)
    citizenClaimsStore.unshift({
      claimVoucherNo: targetOrder.claimVoucherNo,
      rationCardNo: targetOrder.cardNo,
      headName: targetOrder.headName,
      eligiblePersons: targetOrder.memberCount || 5,
      claimPeriod: '2026年10月份',
      claimedItems: (targetOrder.items || []).map((i) => ({ itemName: i.itemName, qty: i.qty, unit: i.unit })),
      agentCenterId: targetOrder.centerId || '101',
      agentName: targetOrder.agentName || '巴格达卡尔赫第一代销站',
      claimTime: targetOrder.deliveredAt,
      securityHash: `CLAIM-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      amountPaid: targetOrder.selfPayAmount || 0,
      subsidyAmount: targetOrder.subsidyAmount || 0,
      orderId: targetOrder.orderId
    });

    return createResponse({
      order: targetOrder,
      deductedItems,
      claimVoucherNo: targetOrder.claimVoucherNo,
      deliveredAt: targetOrder.deliveredAt
    }, 200, `【交接核销成功】：已完成对户主【${targetOrder.headName}】的配给品交付，代销站现货库存已同步扣减，生成法定凭证【${targetOrder.claimVoucherNo}】！`);
  }

  // 5.14 查询 B2C 社区分时零售预约单 (SCM)
  if (url.includes('/agent/b2c/reservations') && method === 'GET') {
    let result = [...b2cReservationsStore];
    if (params.status && params.status !== '全部') {
      result = result.filter((r) => r.status === params.status);
    }
    if (params.timeSlot && params.timeSlot !== '全部') {
      result = result.filter((r) => r.timeSlot === params.timeSlot);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.ticketNo.toLowerCase().includes(kw) ||
          r.cardNo.toLowerCase().includes(kw) ||
          r.headName.toLowerCase().includes(kw) ||
          r.nationalId.includes(kw) ||
          r.pickupCode.toLowerCase().includes(kw)
      );
    }
    return createResponse(result);
  }

  // 5.15 现场到店核销履约 (V5 现场交付校验与扣减本地库存)
  // 规则：读卡/扫码严格校验预约单是否属于当前时间窗口 (±30分钟容差)；严禁无单发货；扣减代理现货
  if (url.includes('/agent/b2c/reservations/verify-redeem') && method === 'POST') {
    const { pickupCode, cardNo, nationalId, verifyMethod, forceOverride } = data;
    const targetReservation = b2cReservationsStore.find(
      (r) =>
        (pickupCode && r.pickupCode.toUpperCase() === pickupCode.toUpperCase()) ||
        (cardNo && r.cardNo === cardNo) ||
        (nationalId && r.nationalId === nationalId)
    );

    if (!targetReservation) {
      return createResponse({}, 404, isEn ? '[No Delivery Without Order]: No valid matching reservation or pickup code found; delivery of materials is prohibited!' : '【严禁无单发货】：未检索到有效匹配的预约单或提货码，禁止交付物资！');
    }

    if (targetReservation.status === 'VERIFIED') {
      return createResponse(
        {},
        400,
        isEn ? `[Anti-Duplicate-Verification Interception]: Reservation [${targetReservation.ticketNo}] was already physically verified at ${targetReservation.verifiedAt}; duplicate dispatch is strictly prohibited!` : `【防重复核销拦截】：预约单【${targetReservation.ticketNo}】已于 ${targetReservation.verifiedAt} 完成实物核销，严禁重复发货！`
      );
    }

    // 时间窗口校验 (演示容差检验)
    const isSlotValid = targetReservation.timeSlot.includes('08:00') || targetReservation.timeSlot.includes('10:00') || forceOverride;
    if (!isSlotValid && !forceOverride) {
      return createResponse(
        { requiresConfirmation: true, reservation: targetReservation },
        422,
        `【时段不匹配预警】：当前时间不在预约时段【${targetReservation.timeSlot}】（超前后±30分钟容差）。如现场排队特殊放行，请确认人工特批核销。`
      );
    }

    // 执行核销
    targetReservation.status = 'VERIFIED';
    targetReservation.verifiedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetReservation.verifier = '核销员-穆罕默德';
    targetReservation.verifyMethod = verifyMethod || 'DYNAMIC_QR_CODE';

    // 扣减本地库存
    const reservationAgentId = targetReservation.agentId || 'FA-00128';
    const reservationStockBase = readAgentStockBase(reservationAgentId);
    for (const item of targetReservation.items || []) {
      const localStock = reservationStockBase.find((s) => s.itemCode === item.itemCode);
      if (localStock) {
        localStock.currentOnHand -= Number(item.qty) || 0;
        localStock.b2cTotalSold += Number(item.qty) || 0;
      }
    }

    writeAgentStockBase(reservationAgentId, reservationStockBase);

    return createResponse(
      targetReservation,
      200,
      `【核销成功】：已完成对户主【${targetReservation.headName}】配给物资核销发货，代理本地实物库存已扣减，台账更新完成！`
    );
  }

  // 5.16 今日各时段接待容量与排期监控看板 (CAPACITY)
  if (url.includes('/agent/time-slots') && method === 'GET') {
    return createResponse(agentTimeSlotsStore);
  }

  // 5.17 查询代理实物库存与进销存账实自核台账 (RECONCILIATION)
  if (url.includes('/agent/local-stocks') && method === 'GET') {
    const ids = params.agentId ? procurementAgentIds.filter(id => id === params.agentId) : procurementAgentIds;
    return createResponse(ids.flatMap(id => projectProcurementStocks(readAgentStockBase(id), g2bOrdersStore)));
  }

  if (url.includes('/agent/local-stocks/inventory') && method === 'POST') {
    const agentId = String(data.agentId || procurementAgentIds[0] || '');
    if (!procurementWrite || !procurementAgentIds.includes(agentId)) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    const stocks = readAgentStockBase(agentId);
    const target = stocks.find(stock => stock.itemCode === data.itemCode);
    if (!target || !Number.isFinite(Number(data.actualCount)) || Number(data.actualCount) < 0 || !Number.isFinite(Number(data.lossAmount || 0)) || Number(data.lossAmount || 0) < 0) return createResponse({}, 400, i18n.global.t('agentProcurement.invalidItems'));
    const projected = projectProcurementStocks(stocks, g2bOrdersStore).find(stock => stock.itemCode === data.itemCode);
    target.currentOnHand = Number(data.actualCount) - projected.receivedDelta;
    target.lossDamaged += Number(data.lossAmount || 0);
    target.lastInventoryDate = new Date().toISOString(); target.reconciledStatus = 'BALANCED';
    writeAgentStockBase(agentId, stocks);
    return createResponse(projectProcurementStocks(stocks, g2bOrdersStore).find(stock => stock.itemCode === data.itemCode));
  }

  // 5.19 多维流转追溯穿透倒查 (TRACE)
  // 支持批次号 BatchNo、订单号 OrderNo、身份证号 NationalID 双向倒查
  if (url.includes('/agent/trace/pipeline') && method === 'GET') {
    const kw = (params.keyword || '').trim().toLowerCase();
    let matched = fullTraceChainStore;
    if (kw) {
      matched = fullTraceChainStore.filter(
        (t) =>
          t.traceId.toLowerCase().includes(kw) ||
          t.batchNo.toLowerCase().includes(kw) ||
          t.nationalId.includes(kw) ||
          t.cardNo.toLowerCase().includes(kw) ||
          t.g2bOrderNo.toLowerCase().includes(kw) ||
          t.b2cTicketNo.toLowerCase().includes(kw) ||
          t.pickupCode.toLowerCase().includes(kw)
      );
    }
    return createResponse(matched);
  }

  // 5.20 代理网格 1500 户户籍硬上限校验 (V1 强管控引擎)
  if (url.match(/\/agent\/grid-limit\/([^/]+)/) && method === 'GET') {
    const agentId = url.split('/')[3];
    const targetAgent = myAgentCentersStore.find((a) => a.id === agentId) || myAgentCentersStore[0];
    const count = targetAgent ? targetAgent.householdsCount : 1120;
    const maxLimit = 1500;
    const isSaturated = count >= maxLimit;
    const remainingSlots = Math.max(0, maxLimit - count);

    return createResponse({
      agentId,
      agentName: targetAgent ? targetAgent.name : '街道代理',
      currentHouseholds: count,
      maxLimit,
      isSaturated,
      remainingSlots,
      recommendBackupAgent: isSaturated ? '曼苏尔第二辅助便民配给站 (FA-00219)' : null,
      message: isSaturated
        ? `【网格饱和锁定】：当前代理已达 ${count}/1500 户硬上限，禁止新户迁入！请由区域经理分流设立新代理点。`
        : `当前网格负荷正常：已绑定 ${count}/1500 户，剩余容量 ${remainingSlots} 户。`
    });
  }

  // 5.21 查询代理三级层级拓扑树 (省级 -> 区域级 -> 街道级，含 GIS 坐标与饱和度) (SCM)
  if (url.includes('/agent/hierarchy/tree') && method === 'GET') {
    return createResponse(getMessageRecipientTreeData());
  }

  // 5.22 查询指定代理管辖范围内的公民家庭明细列表 (支持省级/区域/街道三级穿透) (SCM / CITIZEN)
  if (url.match(/\/agent\/hierarchy\/([^/]+)\/families/) && method === 'GET') {
    const id = url.split('/')[3];
    let list = [];
    if (id === 'PROV-AGT-BAG01') {
      // 省级代理：聚合全省各街道公民家庭样本
      list = Object.values(MOCK_AGENT_FAMILIES_MAP).flat();
    } else if (id === 'REG-AGT-01') {
      // 卡尔赫区域代理：聚合卡尔赫下辖曼苏尔、亚尔穆克、哈德拉网点公民
      list = [
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00128'] || []),
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00135'] || []),
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00142'] || [])
      ];
    } else if (id === 'REG-AGT-02') {
      // 鲁萨法区域代理
      list = [...(MOCK_AGENT_FAMILIES_MAP['FA-00201'] || [])];
    } else if (id === 'REG-AGT-03') {
      // 萨德尔城区域代理
      list = [...(MOCK_AGENT_FAMILIES_MAP['FA-00305'] || [])];
    } else {
      // 街道代理门店
      list = MOCK_AGENT_FAMILIES_MAP[id] || MOCK_AGENT_FAMILIES_MAP['FA-00128'] || [];
    }
    return createResponse(list);
  }

  // ==========================================
  // 6. 大屏看板统计 (Dashboard)
  // ==========================================
  // 6.1 管理角色专属：涵盖公民、家庭、各地区代理商、实际配给情况、投诉和处理五大维度统计
  if (url.includes('/dashboard/admin-overview') && method === 'GET') {
    let tr = params.timeRange;
    if (!tr && url.includes('timeRange=')) {
      const match = url.match(/timeRange=([a-zA-Z0-9_-]+)/);
      if (match) tr = match[1];
    }
    const key = tr || 'quarter';
    const data = MOCK_ADMIN_DASHBOARD_DATA[key] || MOCK_ADMIN_DASHBOARD_DATA.quarter;
    return createResponse(data);
  }

  // 6.2 配给代理专属：保持保供大盘指标，支持时间范围联动
  if (url.includes('/dashboard/agent-overview') && method === 'GET') {
    let tr = params.timeRange;
    if (!tr && url.includes('timeRange=')) {
      const match = url.match(/timeRange=([a-zA-Z0-9_-]+)/);
      if (match) tr = match[1];
    }
    const key = tr || 'quarter';
    const data = MOCK_AGENT_DASHBOARD_DATA[key] || MOCK_AGENT_DASHBOARD_DATA.quarter;
    return createResponse(data);
  }

  if (url.includes('/dashboard/overview') && method === 'GET') {
    return createResponse(MOCK_DASHBOARD_STATS);
  }

  // ==========================================
  // 7. 监督官后台管理模块 (Admin Management)
  // ==========================================
  // 7.1 公民配给卡列表
  if (url.includes('/admin/citizen-cards') && method === 'GET') {
    // 确保过滤掉废弃的冗余家庭卡号，基准精确对齐为 5 张卡
    adminCardsStore = adminCardsStore.filter((c) => c.cardNo !== 'RC-10034592');

    // 动态融合最新共享家庭档案数据 (包含公民APP新申报的成员数与配额)
    const sharedFams = getSharedFamilies();
    if (sharedFams && sharedFams.length > 0) {
      const nameEnMap = {
        '艾哈迈德·哈桑·萨利赫': 'Ahmed Hassan Saleh',
        '海德尔·阿卜杜勒·拉赫曼': 'Haider Abdul-Rahman',
        '海德尔·阿卜杜勒-拉赫曼': 'Haider Abdul-Rahman',
        '法蒂玛·扎赫拉·穆罕默德': 'Fatima Zahra Mohammed',
        '奥马尔·法鲁克·哈利勒': 'Omar Farooq Khalil',
        '优素福·易卜拉欣·卡西姆': 'Youssef Ibrahim Qasim',
        '优素福·恩卜拉欣·卡西姆': 'Youssef Ibrahim Qasim'
      };
      const districtEnMap = {
        '卡尔赫第一配给中心 (#04)': 'Karkh 1st Ration Center (#04)',
        '卡尔赫第一粮食供应分部': 'Karkh 1st Food Supply Branch',
        '卡尔赫区 (Al-Karkh)': 'Al-Karkh District',
        '鲁萨法区 (Al-Rusafa)': 'Al-Rusafa District',
        '鲁萨法区 (Al Rusafa)': 'Al-Rusafa District',
        '鲁萨法第二粮食供应分部': 'Al-Rusafa 2nd Food Supply Branch',
        '阿沙尔区 (Al-Ashar)': 'Al-Ashar District',
        '摩苏尔老城区 (Old Mosul)': 'Old Mosul District',
        '安卡瓦区 (Ainkawa)': 'Ainkawa District'
      };

      sharedFams.forEach((fam) => {
        if (!fam || fam.rationCardNo === 'RC-10034592') return;
        const found = adminCardsStore.find((c) => c.cardNo === fam.rationCardNo || c.id === fam.id);
        const mCount = fam.memberCount || fam.members?.length || 5;
        let displayName = fam.headName;
        let displayDistrict = fam.district;
        let displayProvince = fam.province;
        if (reqLang === 'en') {
          if (nameEnMap[displayName]) displayName = nameEnMap[displayName];
          if (districtEnMap[displayDistrict]) displayDistrict = districtEnMap[displayDistrict];
          if (displayProvince && displayProvince.includes('巴格达')) displayProvince = 'Baghdad Province';
          if (displayProvince && displayProvince.includes('巴士拉')) displayProvince = 'Basra Province';
          if (displayProvince && displayProvince.includes('尼尼微')) displayProvince = 'Nineveh Province';
          if (displayProvince && displayProvince.includes('埃尔比勒')) displayProvince = 'Erbil Province';
        }

        if (found) {
          found.headName = displayName || found.headName;
          found.memberCount = mCount;
          found.members = fam.members || found.members;
          found.province = displayProvince || found.province;
          found.district = displayDistrict || found.district;
          found.status = fam.status || found.status;
          found.quotas = {
            flour: mCount * 9,
            rice: mCount * 3,
            oil: mCount * 1,
            sugar: mCount * 2
          };
        }
      });
    }

    let result = [...adminCardsStore];
    if (reqLang === 'en') {
      const nameEnMap = {
        '艾哈迈德·哈桑·萨利赫': 'Ahmed Hassan Saleh',
        '海德尔·阿卜杜勒·拉赫曼': 'Haider Abdul-Rahman',
        '海德尔·阿卜杜勒-拉赫曼': 'Haider Abdul-Rahman',
        '法蒂玛·扎赫拉·穆罕默德': 'Fatima Zahra Mohammed',
        '奥马尔·法鲁克·哈利勒': 'Omar Farooq Khalil',
        '优素福·易卜拉欣·卡西姆': 'Youssef Ibrahim Qasim',
        '优素福·恩卜拉欣·卡西姆': 'Youssef Ibrahim Qasim'
      };
      const districtEnMap = {
        '卡尔赫第一配给中心 (#04)': 'Karkh 1st Ration Center (#04)',
        '卡尔赫第一粮食供应分部': 'Karkh 1st Food Supply Branch',
        '卡尔赫区 (Al-Karkh)': 'Al-Karkh District',
        '鲁萨法区 (Al-Rusafa)': 'Al-Rusafa District',
        '鲁萨法区 (Al Rusafa)': 'Al-Rusafa District',
        '鲁萨法第二粮食供应分部': 'Al-Rusafa 2nd Food Supply Branch',
        '阿沙尔区 (Al-Ashar)': 'Al-Ashar District',
        '摩苏尔老城区 (Old Mosul)': 'Old Mosul District',
        '安卡瓦区 (Ainkawa)': 'Ainkawa District'
      };
      result.forEach((c) => {
        if (nameEnMap[c.headName]) c.headName = nameEnMap[c.headName];
        if (districtEnMap[c.district]) c.district = districtEnMap[c.district];
        if (c.province && c.province.includes('巴格达')) c.province = 'Baghdad Province';
        if (c.province && c.province.includes('巴士拉')) c.province = 'Basra Province';
        if (c.province && c.province.includes('尼尼微')) c.province = 'Nineveh Province';
        if (c.province && c.province.includes('埃尔比勒')) c.province = 'Erbil Province';
      });
    }
    if (params.cardNo) {
      result = result.filter((c) => c.cardNo.toLowerCase().includes(params.cardNo.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((c) => c.headName.includes(params.headName));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.province && params.province !== '全部') {
      result = result.filter((c) => c.province.includes(params.province));
    }
    return createResponse(result);
  }

  // 7.2 修改配给卡状态（解冻 / 冻结 / 吊销）
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/status/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.status = data.status;
      target.freezeReason = data.reason || '';
      return createResponse(target, 200, (isEn ? `Ration card [${target.cardNo}] status changed to [${data.status}]` : `配给卡【${target.cardNo}】状态已变更为【${data.status}】`));
    }
    return createResponse({}, 404, (isEn ? 'The specified ration card record not found' : '未找到指定配给卡记录'));
  }

  // 7.3 调整月度配额
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/quota/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.quotas = { ...target.quotas, ...data.quotas };
      return createResponse(target, 200, (isEn ? `Monthly quota of ration card [${target.cardNo}] updated successfully` : `配给卡【${target.cardNo}】月度定额已更新成功`));
    }
    return createResponse({}, 404, (isEn ? 'The specified ration card record not found' : '未找到指定配给卡记录'));
  }

  // 7.4 换发新卡 / 重置 NFC
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/reissue/) && method === 'POST') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.rfidChipUid = `NFC-IQ-${Math.floor(1000000 + Math.random() * 8999999)}X`;
      target.lastVerifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      return createResponse(target, 200, (isEn ? `Ration card [${target.cardNo}] chip reset completed and new card issued` : `配给卡【${target.cardNo}】已完成芯片重置并换发新卡`));
    }
    return createResponse({}, 404, (isEn ? 'The specified ration card record not found' : '未找到指定配给卡记录'));
  }

  // 7.5 家庭户籍档案列表
  if (url.includes('/admin/families') && method === 'GET') {
    const sharedFams = getSharedFamilies();
    if (sharedFams && sharedFams.length > 0) {
      sharedFams.forEach((fam) => {
        const found = adminFamiliesStore.find((f) => f.cardNo === fam.rationCardNo || f.familyCode === fam.familyCode);
        if (found) {
          found.memberCount = fam.memberCount || fam.members?.length || found.memberCount;
          found.members = fam.members || found.members;
        }
      });
    }
    let result = [...adminFamiliesStore];
    if (params.familyCode) {
      result = result.filter((f) => f.familyCode.toLowerCase().includes(params.familyCode.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((f) => f.headName.includes(params.headName));
    }
    if (params.category && params.category !== '全部') {
      result = result.filter((f) => f.category === params.category);
    }
    return createResponse(result);
  }

  // 7.6 新增家庭户籍档案
  if (url.includes('/admin/families') && method === 'POST') {
    const newFamily = {
      id: `FAM-BAG-${Date.now().toString().slice(-4)}`,
      familyCode: `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`,
      cardNo: data.cardNo || `RC-1002${Math.floor(2000 + Math.random() * 7000)}`,
      headName: data.headName,
      headNationalId: data.headNationalId,
      category: data.category || '普通保障家庭',
      memberCount: data.memberCount || 1,
      address: data.address || '',
      registeredDate: new Date().toISOString().split('T')[0],
      adminBranch: data.adminBranch || '卡尔赫第一粮食供应分部',
      phone: data.phone || '',
      members: data.members || []
    };
    adminFamiliesStore.unshift(newFamily);
    return createResponse(newFamily, 200, (isEn ? `Household file [${newFamily.familyCode}] registered successfully!` : `家庭户籍档案【${newFamily.familyCode}】登记成功！`));
  }

  // 7.7 编辑家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'PUT') {
    const familyId = url.split('/').pop();
    const target = adminFamiliesStore.find((f) => f.id === familyId || f.familyCode === familyId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, (isEn ? `Family file [${target.familyCode}] updated!` : `家庭档案【${target.familyCode}】已更新！`));
    }
    return createResponse({}, 404, (isEn ? 'The specified family file not found' : '未找到指定家庭档案'));
  }

  // 7.8 删除家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'DELETE') {
    const familyId = url.split('/').pop();
    adminFamiliesStore = adminFamiliesStore.filter((f) => f.id !== familyId && f.familyCode !== familyId); activeStores.adminFamiliesStore = adminFamiliesStore;
    return createResponse({ success: true }, 200, (isEn ? 'Household file deregistered successfully' : '家庭户籍档案已注销注销成功'));
  }

  // 7.9 代理网点管理列表
  if (url.includes('/admin/agents') && method === 'GET') {
    let result = [...adminAgentsStore];
    if (params.code) {
      result = result.filter((a) => a.code.toLowerCase().includes(params.code.toLowerCase()));
    }
    if (params.name) {
      result = result.filter((a) => a.name.includes(params.name));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((a) => a.status === params.status);
    }
    return createResponse(result);
  }

  // 7.10 修改代理网点状态
  if (url.match(/\/admin\/agents\/([^/]+)\/status/) && method === 'PUT') {
    const agentId = url.split('/')[3];
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = data.status;
      return createResponse(target, 200, (isEn ? `Agent station [${target.name}] status switched to [${data.status}]` : `代理网点【${target.name}】状态已切换为【${data.status}】`));
    }
    return createResponse({}, 404, (isEn ? 'The specified agent station not found' : '未找到指定代理网点'));
  }

  // 7.11 新增代理网点
  if (url.includes('/admin/agents') && method === 'POST') {
    const newAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: data.name,
      manager: data.manager,
      phone: data.phone,
      province: data.province || '巴格达省',
      district: data.district || '',
      address: data.address || '',
      status: '正常营业',
      rating: 5,
      servedHouseholds: data.servedHouseholds || 500,
      storageCapacity: data.storageCapacity || 50,
      lastInspectedAt: new Date().toISOString().split('T')[0]
    };
    adminAgentsStore.unshift(newAgent);
    return createResponse(newAgent, 200, (isEn ? `Agent station [${newAgent.name}] registered successfully!` : `代理网点【${newAgent.name}】入网登记成功！`));
  }

  // 7.12 更新代理网点资料
  if (url.match(/\/admin\/agents\/([^/]+)/) && method === 'PUT') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, (isEn ? `Agent station profile updated successfully` : `代理网点资料已更新成功`));
    }
    return createResponse({}, 404, (isEn ? 'The specified agent station not found' : '未找到指定代理网点'));
  }

  // 7.13 仓储中心管理列表 (GET)
  if (url.includes('/admin/warehouses') && method === 'GET') {
    let result = [...adminWarehousesStore];
    if (params.province && params.province !== '全部') {
      result = result.filter((w) => w.province.includes(params.province));
    }
    if (params.center && params.center !== '全部') {
      result = result.filter((w) => w.center && w.center.includes(params.center));
    }
    if (params.keyword) {
      const kw = params.keyword.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.code.toLowerCase().includes(kw) ||
          w.name.toLowerCase().includes(kw) ||
          w.manager.toLowerCase().includes(kw)
      );
    }
    return createResponse(result);
  }

  // 7.13.1 新增储备仓库 (POST)
  if (url.includes('/admin/warehouses') && method === 'POST') {
    const newWh = {
      id: `WH-${Date.now().toString().slice(-4)}`,
      code: data.code || `WH-BAG-${Math.floor(10 + Math.random() * 89)}`,
      name: data.name || '新建战略储备仓',
      type: data.type || '战略储备总仓',
      province: data.province || '巴格达省',
      center: data.center || '卡尔赫第一粮食供应分部',
      capacity: Number(data.capacity) || 50000,
      currentStock: Number(data.currentStock) || 0,
      manager: data.manager || '待定负责人',
      phone: data.phone || '+964 780 000 0000',
      status: data.status || '正常运转',
      address: data.address || '示范储备库区'
    };
    adminWarehousesStore.unshift(newWh);
    return createResponse(newWh, 200, (isEn ? 'Reserve warehouse created successfully!' : '储备仓库已成功创建！'));
  }

  // 7.13.2 编辑仓库资料 (PUT)
  if (url.includes('/admin/warehouses/') && method === 'PUT') {
    const id = url.split('/admin/warehouses/')[1]?.split('?')[0];
    const target = adminWarehousesStore.find((w) => w.id === id || w.code === id);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, (isEn ? 'Warehouse information updated successfully!' : '仓库信息更新成功！'));
    }
    return createResponse({}, 404, (isEn ? 'The specified warehouse not found!' : '未找到指定仓库！'));
  }

  // 7.13.3 删除仓库 (DELETE)
  if (url.includes('/admin/warehouses/') && method === 'DELETE') {
    const id = url.split('/admin/warehouses/')[1]?.split('?')[0];
    const idx = adminWarehousesStore.findIndex((w) => w.id === id || w.code === id);
    if (idx !== -1) {
      adminWarehousesStore.splice(idx, 1);
      return createResponse({}, 200, (isEn ? 'Warehouse deregistered and deleted successfully!' : '仓库已成功注销删除！'));
    }
    return createResponse({}, 404, (isEn ? 'The specified warehouse not found!' : '未找到指定仓库！'));
  }

  // ========================================================
  // 8. 三大管理员法定专属职权分发与业务处理 (SCM / BPM / RBAC)
  // ========================================================

  // --------------------------------------------------------
  // 8.1 【配给中心部长专属职权】
  // --------------------------------------------------------
  // 8.1.1 授予代理权 (POST)
  if (url.includes('/admin/authority/minister/grant') && method === 'POST') {
    const { targetAgentId, licenseNo, approvedHouseholds } = data;
    const target = adminAgentsStore.find((a) => a.id === targetAgentId || a.code === targetAgentId);
    if (target) {
      target.status = '正常营业';
      target.licenseNo = licenseNo || `LIC-MIN-${Date.now().toString().slice(-4)}`;
      if (approvedHouseholds) target.servedHouseholds = Number(approvedHouseholds);
      return createResponse(target, 200, (isEn ? `[Ministerial Order of Ration Center]: Agency officially granted to station [${target.name}] with license issued!` : `【配给中心部长令】：已成功向网点【${target.name}】正式授予代理权并颁发许可！`));
    }
    return createResponse({}, 200, (isEn ? `[Ministerial Order of Ration Center]: The agency grant application has been signed, approved and issued the national unified license!` : `【配给中心部长令】：代理权授予申请已签署核准并颁发国家统一许可证！`));
  }

  // 8.1.2 统一代理权 (POST)
  if (url.includes('/admin/authority/minister/unify') && method === 'POST') {
    const { district, standardStandard } = data;
    return createResponse(
      { district, standardStandard, unifiedAt: new Date().toISOString() },
      200,
      `【配给中心部长令】：${district || '全辖区'}配给代理权标准化与统一经营体制整顿方案已正式签发执行！`
    );
  }

  // 8.1.3 设立代理权 (POST)
  if (url.includes('/admin/authority/minister/establish') && method === 'POST') {
    const newAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: data.name || '新设配给代销站',
      manager: data.manager || '待遴选责任人',
      phone: data.phone || '+964 770 000 0000',
      province: data.province || '巴格达省',
      district: data.district || '示范规划区',
      address: data.address || '示范大街1号',
      status: '正常营业',
      rating: 5,
      servedHouseholds: Number(data.servedHouseholds) || 600,
      storageCapacity: Number(data.storageCapacity) || 60,
      lastInspectedAt: new Date().toISOString().split('T')[0],
      isEstablishedByMinister: true
    };
    adminAgentsStore.unshift(newAgent);
    return createResponse(newAgent, 200, (isEn ? `[Ministerial Order of Ration Center]: New ration distribution station [${newAgent.name}] legally established (Code: ${newAgent.code})!` : `【配给中心部长令】：已依法新设立配给代销网点【${newAgent.name}】（编号: ${newAgent.code}）！`));
  }

  // 8.1.4 拆分大型代理权 (POST) - 解决超过 1,500 户红线问题
  if (url.match(/\/admin\/authority\/minister\/split\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (!target) {
      return createResponse({}, 404, (isEn ? 'The large agent station to split not found!' : '未找到拟拆分的大型代理网点！'));
    }

    const originalHouseholds = target.servedHouseholds || 1800;
    const splitCount1 = Math.floor(originalHouseholds / 2);
    const splitCount2 = originalHouseholds - splitCount1;

    // 原网点户数减半
    target.servedHouseholds = splitCount1;
    target.name = `${target.name} (拆分一分部)`;

    // 衍生创建拆分后的新网点
    const newSplitAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: `${target.name.replace(' (拆分一分部)', '')} (拆分二分部)`,
      manager: `${target.manager} (新设分立点负责人)`,
      phone: target.phone,
      province: target.province,
      district: target.district,
      address: `${target.address} (分流副区)`,
      status: '正常营业',
      rating: 5,
      servedHouseholds: splitCount2,
      storageCapacity: Math.floor((target.storageCapacity || 80) / 2),
      lastInspectedAt: new Date().toISOString().split('T')[0],
      isSplitFrom: target.code
    };
    adminAgentsStore.unshift(newSplitAgent);

    return createResponse(
      { original: target, split: newSplitAgent },
      200,
      `【配给中心部长令】：超负荷大型网点【${target.code}】拆分执行完毕！已平抑为 ${splitCount1} 户与 ${splitCount2} 户两处独立网点，彻底解除 1,500 户容量红线预警！`
    );
  }

  // --------------------------------------------------------
  // 8.2 【行政次长专属职权】
  // --------------------------------------------------------
  // 8.2.1 已故代理代理权的轮替裁定 (POST)
  if (url.match(/\/admin\/authority\/deputy\/deceased-rotation\/([^/]+)/) && method === 'POST') {
    const ticketId = url.split('/').pop();
    return createResponse(
      { ticketId, status: '已裁决生效', approvedBy: '行政次长' },
      200,
      `【行政次长签发令】：已故代理法定继承轮替裁定已获终审批准！三代合法继承人资格确认，许可证已依法换发。`
    );
  }

  // 8.2.2 已注销代理权的恢复 (POST) - 严格前置：必须由规划与跟进司确认
  if (url.match(/\/admin\/authority\/deputy\/restore\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);

    // 核心前置拦截：规划与跟进司确认检查
    if (!data.planningConfirmed && (!target || !target.planningConfirmed)) {
      return createResponse(
        {},
        400,
        `【法定程序拦截】：行政次长恢复已注销代理权的前提是【规划与跟进司】已完成联合调查并出具正式确认报告！当前尚未收到规划跟进司确认意见，禁止恢复。`
      );
    }

    if (target) {
      target.status = '正常营业';
      target.isRestored = true;
      target.restoredAt = new Date().toISOString();
      return createResponse(
        target,
        200,
        `【行政次长签发令】：基于规划与跟进司联合调查确认结论，网点【${target.name}】已注销代理权已由行政次长正式签署令核准恢复！配给物资通道即刻解冻。`
      );
    }
    return createResponse({}, 200, (isEn ? `[Deputy Ministerial Signing Order]: The deregistered agency restoration order has been signed and taken effect!` : `【行政次长签发令】：已注销代理权恢复命令签署生效！`));
  }

  // --------------------------------------------------------
  // 8.3 【规划与跟进司总干事专属职权】
  // --------------------------------------------------------
  // 8.3.1 代理注销 (POST)
  if (url.match(/\/admin\/authority\/planning\/cancel\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = '已注销(空置)';
      target.cancelReason = data.reason || (isEn ? 'Planning & Follow-up Directorate executes statutory clearance deregistration' : '规划与跟进司执行法定清退注销');
      return createResponse(target, 200, (isEn ? `[Director-General Resolution]: The agency of station [${target.name}] has been deregistered and cleared, released as vacant and publicly announced!` : `【规划与跟进司总干事决议】：网点【${target.name}】代理权已注销清退，已释放为空置状态并向社会公示！`));
    }
    return createResponse({}, 404, (isEn ? 'The specified station not found!' : '未找到指定网点！'));
  }

  // 8.3.2 代理轮替/转移审批 (POST)
  if (url.match(/\/admin\/authority\/planning\/rotate-transfer\/([^/]+)/) && method === 'POST') {
    const ticketId = url.split('/').pop();
    return createResponse(
      { ticketId, status: '规划跟进司初审/转移核准通过' },
      200,
      `【规划与跟进司总干事决议】：代理人自愿轮替与区域转移申请已完成法务及配额清算，审核核准通过！`
    );
  }

  // 8.3.3 合并代理权 (POST) - 针对低于750户的小型网点
  if (url.includes('/admin/authority/planning/merge') && method === 'POST') {
    const { primaryAgentId, secondaryAgentId } = data;
    const primary = adminAgentsStore.find((a) => a.id === primaryAgentId || a.code === primaryAgentId);
    const secondary = adminAgentsStore.find((a) => a.id === secondaryAgentId || a.code === secondaryAgentId);

    if (!primary || !secondary) {
      return createResponse({}, 400, (isEn ? 'Two valid stations to merge must be selected!' : '必须选择两处待合并的有效网点！'));
    }

    const totalHouseholds = (primary.servedHouseholds || 0) + (secondary.servedHouseholds || 0);
    if (totalHouseholds > 750) {
      return createResponse(
        {},
        400,
        `【合规红线拦截】：依据贸易部规范，合并后网点服务户数不得超过 750 户！当前合并后为 ${totalHouseholds} 户，禁止合并。`
      );
    }

    primary.servedHouseholds = totalHouseholds;
    primary.name = `${primary.name} (吸收合并点)`;
    secondary.status = '已合并注销';

    return createResponse(
      { primary, secondary },
      200,
      `【规划与跟进司总干事决议】：小型网点合并成功！网点【${secondary.code}】并入【${primary.code}】，总服务户数为 ${totalHouseholds} 户（符合 ≤ 750 户红线）。`
    );
  }

  // 8.3.4 行政处罚 (POST)
  if (url.match(/\/admin\/authority\/planning\/penalize\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = data.penaltyType === 'REVOKE' ? '吊销资质' : '停业整顿';
      target.penaltyRecord = {
        date: new Date().toISOString().split('T')[0],
        type: data.penaltyType,
        reason: data.reason || (isEn ? 'Violation of quota sales guidelines or withholding of public materials' : '违反配额发售准则或克扣群众物资'),
        officer: '规划与跟进司总干事'
      };
      return createResponse(target, 200, (isEn ? `[Director-General Punishment Decision]: Administrative punishment executed on station [${target.name}] (status changed to [${target.status}])!` : `【规划与跟进司总干事处罚决定书】：已对网点【${target.name}】执行行政处罚（状态变更为【${target.status}】）！`));
    }
    return createResponse({}, 404, (isEn ? 'The specified station not found!' : '未找到指定网点！'));
  }

  // 8.3.5 规划与跟进司联合调查确认 (恢复前置) (POST)
  if (url.match(/\/admin\/authority\/planning\/confirm-review\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.planningConfirmed = true;
      target.planningConfirmedAt = new Date().toISOString();
      return createResponse(
        target,
        200,
        `【规划与跟进司确认通过】：网点【${target.name}】已完成双司联合入户调查与整改复核，正式确认为【合规准予恢复】！已转交行政次长签发恢复命令。`
      );
    }
    return createResponse({}, 404, (isEn ? 'The specified station not found!' : '未找到指定网点！'));
  }

  // ==========================================
  // 9. 智能客服与私有化 RAG 问答服务 (AI & Customer Service)
  // ==========================================

  // 9.1 获取知识库目录与向量化状态概览
  if (url.includes('/ai-service/knowledge-bases') && method === 'GET') {
    return createResponse({
      knowledgeBases: MOCK_KNOWLEDGE_BASES,
      recommendedPrompts: MOCK_RECOMMENDED_PROMPTS,
      vectorEngine: {
        engine: 'Milvus v2.4 (Distributed)',
        indexType: 'HNSW (M=16, efConstruction=200)',
        metricType: 'Cosine Similarity',
        embeddingDimension: 1024,
        totalVectors: 109,
        lastIndexSync: new Date().toISOString()
      }
    });
  }

  // 9.2 获取单一切片政策全文详情
  if (url.match(/\/ai-service\/chunk-detail\/([^/]+)/) && method === 'GET') {
    const chunkId = url.split('/').pop();
    const reqLang = getAiServiceLang(config);
    const chunk = getTranslatedSource(chunkId, reqLang) || MOCK_KNOWLEDGE_CHUNKS.find((c) => c.id === chunkId);
    if (chunk) {
      return createResponse(chunk);
    }
    return createResponse({}, 404, (isEn ? 'The specified policy clause slice not found' : '未找到指定的政策条文切片'));
  }

  // Resolve actor-owned orders from the existing business stores, never from a client snapshot.
  const actorProfile = () => JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
  const customerOrders = () => {
    const profile = actorProfile();
    const all = [...getSharedOrderPool(localeCode), ...(profile.role === 'agent' ? g2bOrdersStore : [])];
    const byId = new Map();
    for (const order of all) {
      const id = order.orderId || order.id || order.orderNo;
      if (id && !byId.has(id) && ownsCustomerOrder(order, profile)) byId.set(id, customerOrderSnapshot(order));
    }
    return [...byId.values()].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  };
  if (url === '/ai-service/orders' && method === 'GET') return createResponse(customerOrders());

  // 9.3 RAG 检索增强智能问答
  if (url.includes('/ai-service/chat') && method === 'POST') {
    const question = (data.question || '').trim();
    const history = data.history || [];
    const kbId = data.kbId || '';
    const userContext = data.userContext || {};
    const reqLang = getAiServiceLang(config, data);

    const analysis = analyzeCustomerMessage(question);
    if (analysis.needsComfort || analysis.intent === 'COMPLAINT_PROGRESS') {
      const key = analysis.intent === 'COMPLAINT_PROGRESS' ? 'progressReply' : analysis.emotion === 'ANGRY' ? 'empathyAngry' : 'empathyConcern';
      const contentMap = Object.fromEntries(['zh', 'en', 'ar', 'ku'].map(lang => [lang, chatComplaintMessages[lang === 'ku' ? 'ckb' : lang][key]]));
      return createResponse({ answer: contentMap[reqLang] || contentMap.en, contentMap, analysis, action: analysis.complaintRequested ? 'OPEN_COMPLAINT_DRAFT' : analysis.intent === 'COMPLAINT_PROGRESS' ? 'OPEN_COMPLAINT_PROGRESS' : '', sources: [], suggestQuestions: [], needHumanTransfer: false });
    }
    if (data.orderId) {
      const order = customerOrders().find(item => item.orderId === data.orderId);
      if (!order) return createResponse({}, 404, i18n.global.t('chatOrders.unavailable'));
      const contentMap = Object.fromEntries(['zh', 'en', 'ar', 'ku'].map(lang => [lang, customerOrderAnswer(order, question, lang)]));
      return createResponse({ answer: contentMap[reqLang] || contentMap.en, contentMap, order, sources: [], suggestQuestions: [] });
    }
    const isHumanIntent = analysis.intent === 'HUMAN_HANDOFF';

    let matchedChunks = [];
    let answer = '';
    let suggestQuestions = [];
    let needHumanTransfer = isHumanIntent;
    let contentMap = {};
    let sourcesMap = { zh: [], en: [], ar: [], ku: [] };
    let suggestQuestionsMap = { zh: [], en: [], ar: [], ku: [] };
    let topicKey = '';
    let userQuestionMap = {};

    const matchedTopic = matchTopic(question);
    if (matchedTopic) {
      topicKey = matchedTopic.key;
      answer = matchedTopic.answer[reqLang] || matchedTopic.answer.zh;
      contentMap = matchedTopic.answer;
      userQuestionMap = matchedTopic.userQuestion;
      suggestQuestions = matchedTopic.suggestQuestions[reqLang] || matchedTopic.suggestQuestions.zh;
      suggestQuestionsMap = matchedTopic.suggestQuestions;

      matchedChunks = (matchedTopic.sourceIds || []).map((id) => getTranslatedSource(id, reqLang)).filter(Boolean);
      ['zh', 'en', 'ar', 'ku'].forEach((lang) => {
        sourcesMap[lang] = (matchedTopic.sourceIds || []).map((id) => getTranslatedSource(id, lang)).filter(Boolean);
      });
    } else {
      // 兜底通用咨询多语言
      topicKey = 'general';
      const defaultSourceIds = ['CHUNK-GUIDE-001', 'CHUNK-POLICY-001'];
      matchedChunks = defaultSourceIds.map((id) => getTranslatedSource(id, reqLang)).filter(Boolean);
      ['zh', 'en', 'ar', 'ku'].forEach((lang) => {
        sourcesMap[lang] = defaultSourceIds.map((id) => getTranslatedSource(id, lang)).filter(Boolean);
      });

      contentMap = {
        zh: `您好！关于您咨询的“${question}”，为您提供以下业务指导：\n\n1. **业务核验**：建议核对家庭配给卡号、在册人口及当前绑定的代理网点状态；\n2. **线上申办**：系统支持在线办理【家庭信息变更】、【户主变更】、【代理网点转移】及【解冻申报】等全流程业务；\n3. **政策保障**：国家口粮物资配额标准受共和国贸易部统一监管与法律保障。\n\n如遇复杂疑难，可随时点击【转人工客服】协同办理。`,
        en: `Hello! Regarding your inquiry on "${question}", here is the guidance:\n\n1. **Verification**: Please check your digital ration card number, household members, and active agent branch;\n2. **Online Services**: The platform supports online applications for Change of Head, Agent Transfer, Family Updates, and Unfreeze Requests;\n3. **Legal Protection**: All food ration quotas are guaranteed by the Ministry of Trade.\n\nIf you need further assistance, feel free to click "Connect to Live Agent".`,
        ar: `مرحباً بكم! بخصوص استفساركم حول "${question}"، نود توضيح ما يلي:\n\n1. **التدقيق**: يرجى التأكد من رقم البطاقة التموينية وأفراد الأسرة المسجلين والوكيل المعتمد؛\n2. **المعاملات الإلكترونية**: تتيح المنظومة تقديم طلبات تغيير رب الأسرة، نقل الوكيل، تحديث البيانات وفك التجميد؛\n3. **الحماية القانونية**: الحصص التموينية مضمونة وفق ضوابط وزارة التجارة.\n\nفي حال واجهتكم أي صعوبة، يمكنكم التحويل الفوري إلى "مكتب الدعم المباشر".`,
        ku: `سڵاو! سەبارەت بە پرسیارەکەت دەربارەی "${question}"، ئەم ڕێنماییانە بخوێنەرەوە:\n\n1. **پشکنین**: تکایە ژمارەی کارتی بەشەخۆراک و ناوی ئەندامان و بریکارەکەت بپشکنە؛\n2. **خزمەتگوزاری ئۆنلاین**: دەتوانیت داواکاری گۆڕینی سەرۆکی خێزان، گواستنەوەی بریکار و چالاککردنەوە لە سیستەم پێشکەش بکەیت؛\n3. **پاراستنی یاسایی**: بەشەخۆراک لەلایەن وەزارەتی بازرگانییەوە گەرەنتی کراوە.\n\nلە کاتی پێویستدا دەتوانیت پەیوەندی بە "فەرمانبەری ڕاستەوخۆ" بکەیت.`
      };
      answer = contentMap[reqLang] || contentMap.zh;

      suggestQuestionsMap = {
        zh: ['如何办理户主变更申请？', '每人每月的食品配给物资配额标准是多少？', '搬家后如何将配给网点转移到新住址？'],
        en: ['How to apply for change of household head?', 'What is the monthly food ration quota standard?', 'How to transfer the agent branch upon moving?'],
        ar: ['كيف يتم تقديم طلب تغيير رب الأسرة؟', 'ما هي الحصة التموينية المقررة شهرياً لكل فرد؟', 'كيفية نقل البطاقة إلى وكيل جديد عند الانتقال؟'],
        ku: ['چۆن داواکاری گۆڕینی سەرۆکی خێزان پێشکەش بکەم؟', 'بەشەخۆراکی مانگانەی هەر تاکێک چەندە؟', 'چۆن بریکار بگوازمەوە بۆ شوێنی نوێ؟']
      };
      suggestQuestions = suggestQuestionsMap[reqLang] || suggestQuestionsMap.zh;
      userQuestionMap = { zh: question, en: question, ar: question, ku: question };
    }

    return createResponse({
      answer,
      contentMap,
      topicKey,
      userQuestionMap,
      sources: matchedChunks,
      sourcesMap,
      suggestQuestions,
      suggestQuestionsMap,
      needHumanTransfer,
      analysis
    });
  }

  // 9.4 一键无缝转接 7x24 人工客服（同步多轮问答上下文）
  if (url.includes('/ai-service/transfer-human') && method === 'POST') {
    const { sessionId, conversationHistory = [], userContext = {}, reason = 'USER_TRIGGER' } = data;
    const reqLang = getAiServiceLang(config, data);
    const assignedAgent = MULTI_LANG_AGENTS[0];
    const ticketNo = `CS-2026-${Date.now().toString().slice(-6)}`;

    const agentName = assignedAgent.names[reqLang] || assignedAgent.names.zh;
    const agentDept = assignedAgent.departments[reqLang] || assignedAgent.departments.zh;
    const greetingMessage = assignedAgent.initialGreetings[reqLang] || assignedAgent.initialGreetings.zh;

    return createResponse({
      success: true,
      ticketNo,
      sessionId,
      agent: {
        ...assignedAgent,
        name: agentName,
        department: agentDept
      },
      agentNameMap: assignedAgent.names,
      agentDepartmentMap: assignedAgent.departments,
      initialGreeting: greetingMessage,
      initialGreetingMap: assignedAgent.initialGreetings,
      queuePosition: 1,
      handoffTime: new Date().toISOString()
    }, 200, 'Handed off to 24/7 human agent');
  }

  // 9.5 人工客服实时消息交流
  if (url.includes('/ai-service/human-message') && method === 'POST') {
    const { message = '', agentId = 'AGENT-CS-8092', sessionId } = data;
    const reqLang = getAiServiceLang(config, data);
    const mLower = message.toLowerCase();

    let matchedScenario = MULTI_LANG_HUMAN_REPLIES.default;
    for (const [key, item] of Object.entries(MULTI_LANG_HUMAN_REPLIES)) {
      if (item.keywords && item.keywords.some((k) => mLower.includes(k.toLowerCase()))) {
        matchedScenario = item;
        break;
      }
    }

    const reply = matchedScenario.replies[reqLang] || matchedScenario.replies.zh;
    const replyMap = matchedScenario.replies;
    const agent = MULTI_LANG_AGENTS[0];

    return createResponse({
      agent: {
        ...agent,
        name: agent.names[reqLang] || agent.names.zh,
        department: agent.departments[reqLang] || agent.departments.zh
      },
      agentNameMap: agent.names,
      reply,
      replyMap,
      timestamp: new Date().toISOString()
    });
  }

  // 9.6 满意度评价提交
  if (url.includes('/ai-service/feedback') && method === 'POST') {
    return createResponse({
      success: true,
      feedbackId: `FB-${Date.now()}`
    }, 200, '感谢您的宝贵反馈，我们将持续优化智能客服与政策检索服务！');
  }

  // ==========================================
  // 10. 投诉和处理模块 (Complaints & Handling)
  // ==========================================
  // 10.1 查询投诉工单列表 (支持来源、状态、省市、中心、关键词)
  if (url.includes('/complaint/list') && method === 'GET') {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
    const isAppUser = ['citizen', 'agent'].includes(profile.role);
    const canView = Array.isArray(profile.permissionCodes) ? profile.permissionCodes.includes('complaints.view') : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(profile.role);
    if (!isAppUser && !canView) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    let list = readSharedComplaints(complaintsStore).filter(ticket => !isAppUser || ownsComplaint(ticket, profile)).map(ticket => presentComplaint(ticket, isEn));
    if (params.mine && !isAppUser) list = [];
    if (params.id) list = list.filter(ticket => ticket.id === params.id);
    if (params.channel && params.channel !== '全部') {
      list = list.filter((c) => c.channel === params.channel);
    }
    if (params.status && params.status !== '全部') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params.type && params.type !== '全部') {
      list = list.filter((c) => c.type.includes(params.type));
    }
    if (params.province && params.province !== '全部') {
      list = list.filter((c) => c.province.includes(params.province));
    }
    if (params.center && params.center !== '全部') {
      list = list.filter((c) => c.center.includes(params.center));
    }
    if (params.keyword) {
      const kw = params.keyword.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(kw) ||
          c.applicantName.toLowerCase().includes(kw) ||
          c.callPhone.includes(kw) ||
          c.title.toLowerCase().includes(kw) ||
          c.content.toLowerCase().includes(kw) ||
          c.agentName.toLowerCase().includes(kw)
      );
    }
    return createResponse(list);
  }

  const canViewComplaint = profile => !['citizen', 'agent'].includes(profile.role) && (Array.isArray(profile.permissionCodes) ? profile.permissionCodes.includes('complaints.view') || profile.permissionCodes.includes('complaints.process') : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(profile.role));
  const evidenceMatch = url.match(/^\/complaint\/([^/]+)\/photos\/([^/]+)$/);
  if (evidenceMatch && method === 'GET') {
    const ticket = readSharedComplaints(complaintsStore).find(item => item.id === decodeURIComponent(evidenceMatch[1]));
    const profile = actorProfile();
    const photo = ticket?.photos?.find(item => item.id === decodeURIComponent(evidenceMatch[2]));
    if (!photo || (!ownsComplaint(ticket, profile) && !canViewComplaint(profile))) return createResponse({}, 404, i18n.global.t('api.notFound'));
    const file = await getMockMessageAttachment(photo.id);
    if (!file) return createResponse({}, 404, i18n.global.t('chatOrders.photoFailed'));
    return createResponse({ ...file, name: photo.name });
  }
  const ratingMatch = url.match(/^\/complaint\/([^/]+)\/rating$/);
  if (ratingMatch && method === 'POST') {
    const profile = actorProfile();
    const item = readSharedComplaints(complaintsStore).find(ticket => ticket.id === decodeURIComponent(ratingMatch[1]));
    if (!item || !['citizen', 'agent'].includes(profile.role) || !ownsComplaint(item, profile)) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    if (item.statusCode !== 'RESOLVED' || item.rating || !Number.isInteger(data.score) || data.score < 1 || data.score > 5 || typeof (data.comment ?? '') !== 'string' || String(data.comment || '').length > 1000) return createResponse({}, 400, i18n.global.t('chatOrders.ratingInvalid'));
    item.rating = { score: data.score, comment: String(data.comment || '').trim(), ratedAt: new Date().toISOString(), requesterId: complaintOwnerId(profile), requesterRole: profile.role };
    writeSharedComplaint(item);
    appendSystemAudit({ actor: profile.name || profile.username, type: 'application', details: 'Rated complaint handling', businessNo: item.id, after: item.rating });
    return createResponse(presentComplaint(item, isEn));
  }

  // 10.2 登记新投诉工单 (如 1919 热线或 AI 客服转交)
  if (url.includes('/complaint/create') && method === 'POST') {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
    const isAppUser = ['citizen', 'agent'].includes(profile.role);
    const canCreate = Array.isArray(profile.permissionCodes) ? profile.permissionCodes.includes('complaints.process') : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(profile.role);
    if (!isAppUser && !canCreate) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    if (!String(data.applicantName || '').trim() || !String(data.content || '').trim() || (isAppUser && (!String(data.title || '').trim() || !String(data.province || '').trim() || !String(data.agentName || '').trim() || !/^\+?[\d\s-]{7,20}$/.test(data.callPhone || '')))) {
      return createResponse({}, 400, i18n.global.t('chatComplaint.invalidForm'));
    }
    if (String(data.content).length > 5000 || String(data.title || '').length > 160) return createResponse({}, 400, i18n.global.t('chatComplaint.invalidForm'));
    const relatedOrder = data.orderId ? customerOrders().find(order => order.orderId === data.orderId) : null;
    if (data.orderId && !relatedOrder) return createResponse({}, 404, i18n.global.t('chatOrders.unavailable'));
    if (complaintPhotos.length > 5 || !(await Promise.all(complaintPhotos.map(validComplaintPhoto))).every(Boolean)) return createResponse({}, 400, i18n.global.t('chatOrders.invalidPhoto'));
    const photos = await Promise.all(complaintPhotos.map(async file => ({ id: await saveMockMessageAttachment(file, 'complaint-photo'), name: file.name, type: file.type, size: file.size })));
    const newId = `CMP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();
    const newComplaint = {
      id: newId,
      channelCode: isAppUser ? 'AI' : 'PHONE',
      channel: isAppUser ? 'AI智能客服助手' : (data.channel || '1919政务热线电话'),
      requesterId: isAppUser ? complaintOwnerId(profile) : '',
      requesterRole: isAppUser ? profile.role : '',
      ...(isAppUser && data.sourceMessageId ? {
        sourceMessageId: String(data.sourceMessageId).slice(0, 100),
        intakeAnalysis: analyzeCustomerMessage(data.content)
      } : {}),
      callPhone: data.callPhone || '',
      applicantName: data.applicantName || (isEn ? 'Anonymous Hotline Caller' : '匿名来电群众'),
      nationalId: data.nationalId || '',
      province: data.province || (isEn ? 'Baghdad Governorate' : '巴格达省'),
      center: data.center || (isAppUser ? '' : (isEn ? 'Karkh 1st Food Supply Branch' : '卡尔赫第一粮食供应分部')),
      agentName: data.agentName || (isEn ? 'District Distribution Station' : '辖区所属代销网点'),
      type: data.type || (isEn ? 'Poor Service Attitude / Long Queue Time' : '服务态度差/排队耗时'),
      typeCode: data.typeCode,
      title: data.title || (isEn ? 'Hotline Complaint Registration' : '群众致电投诉登记'),
      content: data.content || '',
      status: isEn ? 'Pending Assignment' : '待分配',
      statusCode: 'PENDING',
      handlerName: '',
      handledAt: '',
      result: '',
      satisfaction: '',
      rating: null,
      relatedOrder,
      photos,
      submittedAt: now,
      history: [{ id: crypto.randomUUID(), statusCode: 'PENDING', createdAt: now, result: '', handlerName: '' }]
    };
    writeSharedComplaint(newComplaint);
    appendSystemAudit({ actor: profile.name || profile.username, type: 'application', details: 'Submitted complaint', businessNo: newId, after: { statusCode: 'PENDING', requesterId: newComplaint.requesterId, requesterRole: newComplaint.requesterRole } });
    return createResponse(presentComplaint(newComplaint, isEn));
  }

  // 10.3 督办并办结工单
  if (url.includes('/complaint/handle/') && method === 'POST') {
    const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || '{}');
    const canHandle = Array.isArray(profile.permissionCodes) ? profile.permissionCodes.includes('complaints.process') : ['admin', 'minister_center', 'deputy_minister', 'director_planning'].includes(profile.role);
    if (!canHandle) return createResponse({}, 403, i18n.global.t('api.forbidden'));
    const id = url.split('/complaint/handle/')[1]?.split('?')[0];
    const item = readSharedComplaints(complaintsStore).find(c => c.id === id);
    if (!item) return createResponse({}, 404, i18n.global.t('api.notFound'));
    if (complaintStatusCode(item.statusCode || item.status) === 'RESOLVED') return createResponse({}, 409, i18n.global.t('complaint.closedReadOnly'));
    if (!String(data.result || '').trim()) return createResponse({}, 400, i18n.global.t('chatComplaint.resultRequired'));
    const before = { statusCode: item.statusCode, result: item.result, handlerName: item.handlerName };
    item.statusCode = complaintStatusCode(data.statusCode || data.status || 'RESOLVED');
    item.handlerName = profile.name || profile.username || profile.role;
    item.handlerId = complaintOwnerId(profile);
    item.handlerNameKey = profile.displayNameKey || '';
    item.handledAt = new Date().toISOString();
    item.result = String(data.result).trim();
    item.history = [...(item.history || []), { id: crypto.randomUUID(), statusCode: item.statusCode, createdAt: item.handledAt, result: item.result, handlerId: item.handlerId, handlerName: item.handlerName, handlerNameKey: item.handlerNameKey }];
    writeSharedComplaint(item);
    appendSystemAudit({ actor: item.handlerName, type: 'status_change', details: 'Updated complaint handling', businessNo: item.id, before, after: { statusCode: item.statusCode, result: item.result, handlerName: item.handlerName } });
    return createResponse(presentComplaint(item, isEn));
  }

  // ========================================================
  // 11. 阶段 5 核心：政府侧财政对账与清算管理系统 Mock API
  // (G2B批发货款、B2C销售规费、财政物价补贴结算、进销存100%账实平衡)
  // ========================================================

  // 11.1 财政对账综合概览指标 (GET)
  if (url.includes('/admin/reconciliation/overview') && method === 'GET') {
    const dynamicB2CSum = citizenPurchaseOrdersStore.reduce((acc, o) => acc + (Number(o.selfPayAmount) || 0), 0);
    const dynamicG2BSum = g2bOrdersStore.filter(o => o.payStatus === 'PAID').reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
    const deliveredCitizenCount = citizenPurchaseOrdersStore.filter(o => o.status === 'DELIVERED').length;

    const totalG2B = 428500000 + dynamicG2BSum;
    const totalB2C = 34200000 + dynamicB2CSum;
    const totalSubsidies = totalG2B - totalB2C;

    return createResponse({
      totalG2BAmount: totalG2B,
      totalB2CAmount: totalB2C,
      totalSubsidyAmount: totalSubsidies,
      subsidyRatio: ((totalSubsidies / totalG2B) * 100).toFixed(1),
      balanceRate: '100.00%',
      varianceRate: '0.00%',
      totalG2BOrdersCount: 156 + g2bOrdersStore.length,
      totalB2COrdersCount: 2840 + citizenPurchaseOrdersStore.length,
      totalDeliveredOrdersCount: 2795 + deliveredCitizenCount,
      dailyClearingStatus: 'CLEARED_TODAY',
      lastSettledAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      treasuryAccount: 'IQ-CBI-PUBLIC-TREASURY-88201',
      auditStatus: 'AUDIT_PASSED_ZERO_VARIANCE'
    });
  }

  // 11.2 G2B 批发进货款交易流水 (GET)
  if (url.includes('/admin/reconciliation/g2b-transactions') && method === 'GET') {
    const baselineG2B = [
      {
        orderNo: 'ORD-20261012-8812',
        agentId: 'FA-00128',
        agentName: '卡尔赫第一配给中心综合代销站',
        province: '巴格达省',
        centerName: '卡尔赫第一配给中心 (曼苏尔)',
        itemsSummary: '优质特级面粉 25,000kg / 进口长粒香米 15,000kg',
        totalAmount: 18750000,
        payChannel: 'PUBLIC_TREASURY_ACCOUNT',
        payStatus: 'PAID',
        payTime: '2026-10-12 10:15:30',
        wmsTaskId: 'WMS-TASK-WH01-992182',
        voucherNo: 'G2B-VCH-20261012-001'
      },
      {
        orderNo: 'ORD-20261011-7734',
        agentId: 'FA-00129',
        agentName: '鲁萨法第二配给保障供销社',
        province: '巴格达省',
        centerName: '鲁萨法第二粮食供应分部',
        itemsSummary: '精炼植物油 8,000L / 精制白糖 10,000kg',
        totalAmount: 14200000,
        payChannel: 'PUBLIC_TREASURY_ACCOUNT',
        payStatus: 'PAID',
        payTime: '2026-10-11 14:22:15',
        wmsTaskId: 'WMS-TASK-WH01-884102',
        voucherNo: 'G2B-VCH-20261011-002'
      },
      {
        orderNo: 'ORD-20261010-6621',
        agentId: 'FA-00130',
        agentName: '巴士拉港口平价配给便利店',
        province: '巴士拉省',
        centerName: '巴士拉港口配给保障站',
        itemsSummary: '优质特级面粉 30,000kg / 植物油 12,000L',
        totalAmount: 22600000,
        payChannel: 'PUBLIC_TREASURY_ACCOUNT',
        payStatus: 'PAID',
        payTime: '2026-10-10 09:30:00',
        wmsTaskId: 'WMS-TASK-WH02-661201',
        voucherNo: 'G2B-VCH-20261010-003'
      },
      {
        orderNo: 'ORD-20261009-5519',
        agentId: 'FA-00131',
        agentName: '摩苏尔老城保供代销中心',
        province: '尼尼微省',
        centerName: '摩苏尔老城配给管理中心',
        itemsSummary: '特级面粉 20,000kg / 纯白砂糖 8,000kg',
        totalAmount: 13800000,
        payChannel: 'PUBLIC_TREASURY_ACCOUNT',
        payStatus: 'PAID',
        payTime: '2026-10-09 16:45:10',
        wmsTaskId: 'WMS-TASK-WH03-550192',
        voucherNo: 'G2B-VCH-20261009-004'
      }
    ];

    const dynamicOrders = g2bOrdersStore.map((o, idx) => ({
      orderNo: o.orderNo,
      agentId: o.agentId || 'FA-00128',
      agentName: o.agentName || '卡尔赫第一配给中心综合代销站',
      province: o.province || '巴格达省',
      centerName: o.centerName || '卡尔赫第一配给中心',
      itemsSummary: (o.items || []).map(i => `${i.itemName} ${i.qty}${i.unit}`).join(' / ') || '集中调拨配给物资',
      totalAmount: o.totalAmount,
      payChannel: o.payChannel || 'PUBLIC_TREASURY_ACCOUNT',
      payStatus: o.payStatus || 'PAID',
      payTime: o.payTime || o.createdAt,
      wmsTaskId: o.wmsTaskId || `WMS-TASK-${idx + 100}`,
      voucherNo: `G2B-VCH-${o.orderNo.slice(-6)}`
    }));

    return createResponse([...dynamicOrders, ...baselineG2B]);
  }

  // 11.3 B2C 公民购粮规费与核销流水 (GET)
  if (url.includes('/admin/reconciliation/b2c-transactions') && method === 'GET') {
    const list = citizenPurchaseOrdersStore.map((o) => ({
      orderId: o.orderId,
      cardNo: o.cardNo,
      headName: o.headName,
      phone: o.phone,
      deliveryType: o.deliveryType,
      agentName: o.agentName,
      selfPayAmount: o.selfPayAmount || 3700,
      paymentMethod: o.paymentMethod || 'QI_CARD',
      status: o.status,
      paidAt: o.paidAt || o.createdAt,
      deliveredAt: o.deliveredAt || (o.status === 'DELIVERED' ? o.createdAt : null),
      pickupCode: o.pickupCode,
      claimVoucherNo: o.claimVoucherNo || null,
      itemsSummary: (o.items || []).map(i => `${i.itemName} x${i.qty}`).join(', ')
    }));

    return createResponse(list);
  }

  // 11.4 国家物价兜底财政补贴台账 (GET)
  if (url.includes('/admin/reconciliation/subsidies') && method === 'GET') {
    const subsidyItems = [
      {
        itemCode: 'FLOUR-WHT-02',
        itemName: '优质特级面粉 (标准白面)',
        unit: 'KG',
        marketPrice: 1250,
        citizenPrice: 150,
        unitSubsidy: 1100,
        subsidyRatio: '88.0%',
        allocatedQty: 120000,
        totalMarketCost: 150000000,
        totalCitizenPaid: 18000000,
        totalGovSubsidy: 132000000,
        fundingSource: '国家粮食安全战略基金专户',
        status: '100% 财政全额兑付'
      },
      {
        itemCode: 'RICE-BAS-01',
        itemName: '进口特级长粒香米 (一级优质大米)',
        unit: 'KG',
        marketPrice: 2200,
        citizenPrice: 250,
        unitSubsidy: 1950,
        subsidyRatio: '88.6%',
        allocatedQty: 75000,
        totalMarketCost: 165000000,
        totalCitizenPaid: 18750000,
        totalGovSubsidy: 146250000,
        fundingSource: '国家粮食安全战略基金专户',
        status: '100% 财政全额兑付'
      },
      {
        itemCode: 'OIL-SUN-01',
        itemName: '纯正压榨葵花籽油 (精炼食用油)',
        unit: 'L',
        marketPrice: 3500,
        citizenPrice: 500,
        unitSubsidy: 3000,
        subsidyRatio: '85.7%',
        allocatedQty: 45000,
        totalMarketCost: 157500000,
        totalCitizenPaid: 22500000,
        totalGovSubsidy: 135000000,
        fundingSource: '物价平抑与民生兜底专项直补',
        status: '100% 财政全额兑付'
      },
      {
        itemCode: 'SUGAR-WHT-01',
        itemName: '精制纯白砂糖 (优级原糖精炼)',
        unit: 'KG',
        marketPrice: 1600,
        citizenPrice: 200,
        unitSubsidy: 1400,
        subsidyRatio: '87.5%',
        allocatedQty: 50000,
        totalMarketCost: 80000000,
        totalCitizenPaid: 10000000,
        totalGovSubsidy: 70000000,
        fundingSource: '物价平抑与民生兜底专项直补',
        status: '100% 财政全额兑付'
      }
    ];

    return createResponse({
      items: subsidyItems,
      grandMarketCost: 552500000,
      grandCitizenPaid: 69250000,
      grandTreasurySubsidy: 483250000,
      overallSubsidyRate: '87.5%',
      fiscalYear: '2026年度',
      disbursementBatch: 'DISB-2026-Q4-01'
    });
  }

  // 11.5 进销存 100% 账实平衡大屏与穿透审计 (GET)
  if (url.includes('/admin/reconciliation/inventory-audit') && method === 'GET') {
    // 动态统计各品类已被公民核销的数量
    const dynamicClaimMap = {};
    for (const ord of citizenPurchaseOrdersStore) {
      if (ord.status === 'DELIVERED') {
        for (const it of ord.items || []) {
          dynamicClaimMap[it.itemCode] = (dynamicClaimMap[it.itemCode] || 0) + Number(it.qty || 0);
        }
      }
    }

    const auditLedger = [
      {
        itemCode: 'FLOUR-WHT-02',
        itemName: '优质特级面粉',
        unit: 'KG',
        centralOutbound: 120000,
        agentInbound: 120000,
        citizenClaimed: 98500 + (dynamicClaimMap['FLOUR-WHT-02'] || 0),
        agentOnHand: 21500 - (dynamicClaimMap['FLOUR-WHT-02'] || 0),
        varianceQty: 0,
        varianceRate: '0.00%',
        auditResult: 'PERFECT_MATCH',
        lastAuditTime: new Date().toISOString().slice(0, 10)
      },
      {
        itemCode: 'RICE-BAS-01',
        itemName: '进口长粒香米',
        unit: 'KG',
        centralOutbound: 75000,
        agentInbound: 75000,
        citizenClaimed: 61200 + (dynamicClaimMap['RICE-BAS-01'] || 0),
        agentOnHand: 13800 - (dynamicClaimMap['RICE-BAS-01'] || 0),
        varianceQty: 0,
        varianceRate: '0.00%',
        auditResult: 'PERFECT_MATCH',
        lastAuditTime: new Date().toISOString().slice(0, 10)
      },
      {
        itemCode: 'OIL-SUN-01',
        itemName: '精炼食用植物油',
        unit: 'L',
        centralOutbound: 45000,
        agentInbound: 45000,
        citizenClaimed: 36800 + (dynamicClaimMap['OIL-SUN-01'] || 0),
        agentOnHand: 8200 - (dynamicClaimMap['OIL-SUN-01'] || 0),
        varianceQty: 0,
        varianceRate: '0.00%',
        auditResult: 'PERFECT_MATCH',
        lastAuditTime: new Date().toISOString().slice(0, 10)
      },
      {
        itemCode: 'SUGAR-WHT-01',
        itemName: '精制纯白砂糖',
        unit: 'KG',
        centralOutbound: 50000,
        agentInbound: 50000,
        citizenClaimed: 41500 + (dynamicClaimMap['SUGAR-WHT-01'] || 0),
        agentOnHand: 8500 - (dynamicClaimMap['SUGAR-WHT-01'] || 0),
        varianceQty: 0,
        varianceRate: '0.00%',
        auditResult: 'PERFECT_MATCH',
        lastAuditTime: new Date().toISOString().slice(0, 10)
      }
    ];

    return createResponse({
      records: auditLedger,
      isBalanced: true,
      auditCertificateNo: `AUDIT-MOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-8899`,
      auditor: '伊拉克贸易部粮食总署 & 中央审计委员会联合审计组'
    });
  }

  // 11.6 发起中央日终对账与清算 (POST)
  if (url.includes('/admin/reconciliation/daily-settlement') && method === 'POST') {
    const batchNo = `CLR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const hash = `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    return createResponse({
      clearingBatchNo: batchNo,
      blockchainAuditHash: hash,
      settledAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      treasuryStatus: 'TREASURY_CLEARED_CONFIRMED',
      summary: {
        g2bWholesaleOrdersCleared: 158,
        b2cCitizenOrdersAudited: 2845,
        subsidySettledAmountIQD: 483250000,
        varianceCount: 0
      }
    }, 200, `【日终清算成功】：清算批次【${batchNo}】已完成中央国库账务划转与区块链存证，账实差额 0.00%！`);
  }

  // 11.7 导出官方中央对账清算凭单 (GET)
  if (url.includes('/admin/reconciliation/export-report') && method === 'GET') {
    return createResponse({
      reportTitle: '伊拉克共和国贸易部与财政部 · 国家配给系统每日对账审计报告',
      officialVoucherNo: `GOV-FIN-VOUCH-${Date.now().toString().slice(-8)}`,
      reportDate: new Date().toISOString().slice(0, 10),
      authority: 'REPUBLIC OF IRAQ · MINISTRY OF TRADE & MINISTRY OF FINANCE',
      auditSeal: '100% BALANCED & AUDITED',
      downloadUrl: '#mock-reconciliation-report.pdf'
    });
  }

  // 默认兜底响应
  return createResponse({}, 200, 'Mock Default Response');
}
