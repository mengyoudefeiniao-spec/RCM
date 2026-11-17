import { warehouseEntities } from '../locales/warehouseEntities.js';

export const WAREHOUSE_INVENTORY_STORAGE_KEY = 'rcm_shared_warehouse_inventory_v1';
export const WAREHOUSE_ITEM_CODES = ['RICE', 'FLOUR', 'OIL', 'SUGAR'];
export const WAREHOUSE_STATUS_CODES = ['available', 'locked', 'frozen'];

const LANGUAGES = ['zh', 'en', 'ar', 'ckb'];
const SEED_UPDATED_AT = '2026-11-17T00:00:00.000Z';

const text = (zh, en, ar, ckb) => ({ zh, en, ar, ckb });
const entityText = (key) => Object.fromEntries(LANGUAGES.map((lang, index) => [lang, warehouseEntities[key][index]]));
const clone = (value) => JSON.parse(JSON.stringify(value));

export const WAREHOUSE_ITEM_NAMES = {
  RICE: text('大米', 'Rice', 'الأرز', 'برنج'),
  FLOUR: text('面粉', 'Flour', 'الطحين', 'ئارد'),
  OIL: text('食用油', 'Cooking oil', 'زيت الطعام', 'ڕۆنی خواردن'),
  SUGAR: text('糖', 'Sugar', 'السكر', 'شەکر')
};

export const WAREHOUSE_ITEM_UNITS = {
  RICE: 'kg',
  FLOUR: 'kg',
  OIL: 'l',
  SUGAR: 'kg'
};

export function deriveStockStatus(quantities = {}) {
  const values = WAREHOUSE_STATUS_CODES.map((code) => [code, Math.max(0, Number(quantities?.[code]) || 0)]);
  const top = values.reduce((best, current) => (current[1] > best[1] ? current : best), values[0]);
  return top[1] > 0 ? top[0] : 'available';
}

const WAREHOUSES = [
  {
    id: 'WH-BAG-01',
    code: 'WH-BAG-01',
    name: entityText('baghdadWarehouse'),
    address: text('伊拉克巴格达省卡尔赫区国家储备路 1 号', '1 National Reserve Road, Karkh, Baghdad', 'شارع الاحتياطي الوطني 1، الكرخ، بغداد', 'ژمارە 1 ڕێگای یەدەگی نیشتمانی، کەرخ، بەغدا'),
    locations: [
      { code: 'A01-03-02', label: entityText('heavySlot') },
      { code: 'C01-05-01', label: entityText('oilSlot') },
      { code: 'Z01-01-01', label: entityText('quarantineSlot') },
      { code: 'D01-03-01', label: entityText('foodSlot') }
    ]
  },
  {
    id: 'WH-BAG-02',
    code: 'WH-BAG-02',
    name: entityText('karkhWarehouse'),
    address: text('伊拉克巴格达省卡尔赫区战略库区 12 号', '12 Strategic Reserve Zone, Karkh, Baghdad', 'منطقة الاحتياطي الاستراتيجي 12، الكرخ، بغداد', 'ناوچەی یەدەگی ستراتیژی 12، کەرخ، بەغدا'),
    locations: [
      { code: 'B02-01-04', label: entityText('flourSlot') },
      { code: 'B02-01-05', label: entityText('flourSlot') }
    ]
  },
  {
    id: 'WH-BAG-03',
    code: 'WH-BAG-03',
    name: entityText('rusafaWarehouse'),
    address: text('伊拉克巴格达省鲁萨法区配送总站 8 号', '8 Distribution Main Station, Rusafa, Baghdad', 'محطة التوزيع الرئيسية 8، الرصافة، بغداد', 'بنکەی سەرەکیی دابەشکردن 8، ڕەصافە، بەغدا'),
    locations: [
      { code: 'D03-02-03', label: entityText('foodSlot') },
      { code: 'C02-01-02', label: entityText('oilSlot') }
    ]
  },
  {
    id: 'WH-DIY-01',
    code: 'WH-DIY-01',
    name: text('迪亚拉省哈奈根前置保供仓', 'Diyala Khanaqin Forward Supply Warehouse', 'مخزن خانقين الأمامي للإمداد في ديالى', 'کۆگای پێشەوەی دابینکردنی خانەقین لە دیالە'),
    address: text('伊拉克迪亚拉省哈奈根区边境保供路 6 号', '6 Border Supply Road, Khanaqin, Diyala', 'طريق الإمداد الحدودي 6، خانقين، ديالى', 'ڕێگای دابینکردنی سنوور 6، خانەقین، دیالە'),
    locations: [
      { code: 'A02-01-01', label: entityText('supplySlot') },
      { code: 'A03-02-01', label: entityText('supplySlot') },
      { code: 'A04-01-02', label: entityText('oilSlot') },
      { code: 'A05-01-01', label: entityText('foodSlot') }
    ]
  }
];

function makeRecord(config) {
  const quantities = {
    available: config.available || 0,
    locked: config.locked || 0,
    frozen: config.frozen || 0
  };
  return {
    id: config.id,
    warehouseId: config.warehouseId,
    locationCode: config.locationCode,
    itemCode: config.itemCode,
    itemName: WAREHOUSE_ITEM_NAMES[config.itemCode],
    batchNo: config.batchNo,
    uniqueTraceCode: config.uniqueTraceCode,
    productionDate: config.productionDate,
    expiryDate: config.expiryDate,
    expiryStatus: config.expiryStatus,
    quantities,
    unit: WAREHOUSE_ITEM_UNITS[config.itemCode],
    status: deriveStockStatus(quantities),
    updatedAt: SEED_UPDATED_AT
  };
}

export function createDefaultWarehouseInventory() {
  const records = [
    makeRecord({ id: 'INV-001', warehouseId: 'WH-BAG-01', locationCode: 'A01-03-02', itemCode: 'RICE', batchNo: 'BATCH-20261012-EXP202710-RC01', uniqueTraceCode: 'UNI-BOX-20261012-0091823', productionDate: '2026-10-12', expiryDate: '2027-10-11', expiryStatus: 'normal', available: 184500, locked: 13440 }),
    makeRecord({ id: 'INV-002', warehouseId: 'WH-BAG-02', locationCode: 'B02-01-04', itemCode: 'FLOUR', batchNo: 'BATCH-20260415-EXP202704-FL02', uniqueTraceCode: 'UNI-BOX-20260415-0044129', productionDate: '2026-04-15', expiryDate: '2027-04-14', expiryStatus: 'normal', available: 92400, locked: 8000 }),
    makeRecord({ id: 'INV-003', warehouseId: 'WH-BAG-01', locationCode: 'C01-05-01', itemCode: 'OIL', batchNo: 'BATCH-20260120-EXP202801-OL03', uniqueTraceCode: 'UNI-BOX-20260120-0081290', productionDate: '2026-01-20', expiryDate: '2028-01-19', expiryStatus: 'normal', available: 34100, locked: 4480 }),
    makeRecord({ id: 'INV-004', warehouseId: 'WH-BAG-03', locationCode: 'D03-02-03', itemCode: 'SUGAR', batchNo: 'BATCH-20260630-EXP202806-SG04', uniqueTraceCode: 'UNI-BOX-20260630-0099411', productionDate: '2026-06-30', expiryDate: '2028-06-29', expiryStatus: 'normal', available: 68900, locked: 4480 }),
    makeRecord({ id: 'INV-005', warehouseId: 'WH-DIY-01', locationCode: 'A02-01-01', itemCode: 'RICE', batchNo: 'BATCH-20260901-EXP202612-RC05', uniqueTraceCode: 'UNI-BOX-20260901-0077218', productionDate: '2026-09-01', expiryDate: '2026-12-25', expiryStatus: 'expiring', available: 45000, locked: 3560 }),
    makeRecord({ id: 'INV-006', warehouseId: 'WH-BAG-01', locationCode: 'Z01-01-01', itemCode: 'RICE', batchNo: 'BATCH-20260810-EXP202708-ERR01', uniqueTraceCode: 'UNI-BOX-20260810-0066112', productionDate: '2026-08-10', expiryDate: '2027-08-09', expiryStatus: 'normal', frozen: 400 }),
    makeRecord({ id: 'INV-007', warehouseId: 'WH-BAG-02', locationCode: 'B02-01-05', itemCode: 'FLOUR', batchNo: 'BATCH-20260510-EXP202612-FL07', uniqueTraceCode: 'UNI-BOX-20260510-0033187', productionDate: '2026-05-10', expiryDate: '2026-12-20', expiryStatus: 'expiring', locked: 12000 }),
    makeRecord({ id: 'INV-008', warehouseId: 'WH-BAG-03', locationCode: 'C02-01-02', itemCode: 'OIL', batchNo: 'BATCH-20260211-EXP202801-OL08', uniqueTraceCode: 'UNI-BOX-20260211-0022471', productionDate: '2026-02-11', expiryDate: '2028-01-30', expiryStatus: 'normal', available: 15600 }),
    makeRecord({ id: 'INV-009', warehouseId: 'WH-BAG-01', locationCode: 'D01-03-01', itemCode: 'SUGAR', batchNo: 'BATCH-20260318-EXP202610-SG09', uniqueTraceCode: 'UNI-BOX-20260318-0055038', productionDate: '2026-03-18', expiryDate: '2026-10-31', expiryStatus: 'expired', frozen: 850 }),
    makeRecord({ id: 'INV-010', warehouseId: 'WH-DIY-01', locationCode: 'A03-02-01', itemCode: 'FLOUR', batchNo: 'BATCH-20261002-EXP202710-FL10', uniqueTraceCode: 'UNI-BOX-20261002-0088126', productionDate: '2026-10-02', expiryDate: '2027-10-01', expiryStatus: 'normal', available: 22000 }),
    makeRecord({ id: 'INV-011', warehouseId: 'WH-DIY-01', locationCode: 'A04-01-02', itemCode: 'OIL', batchNo: 'BATCH-20260705-EXP202612-OL11', uniqueTraceCode: 'UNI-BOX-20260705-0066124', productionDate: '2026-07-05', expiryDate: '2026-12-28', expiryStatus: 'expiring', locked: 6800 }),
    makeRecord({ id: 'INV-012', warehouseId: 'WH-DIY-01', locationCode: 'A05-01-01', itemCode: 'SUGAR', batchNo: 'BATCH-20261015-EXP202810-SG12', uniqueTraceCode: 'UNI-BOX-20261015-0099873', productionDate: '2026-10-15', expiryDate: '2028-10-14', expiryStatus: 'normal', available: 18700 })
  ];
  return { version: 1, updatedAt: SEED_UPDATED_AT, warehouses: clone(WAREHOUSES), records };
}

function normalizeWarehouseInventory(payload) {
  if (!payload || !Array.isArray(payload.warehouses) || !Array.isArray(payload.records)) {
    throw new Error('Invalid ration warehouse inventory payload');
  }
  return {
    ...payload,
    version: 1,
    warehouses: payload.warehouses,
    records: payload.records.map((record) => {
      const quantities = {
        available: Math.max(0, Number(record.quantities?.available) || 0),
        locked: Math.max(0, Number(record.quantities?.locked) || 0),
        frozen: Math.max(0, Number(record.quantities?.frozen) || 0)
      };
      return {
        ...record,
        itemName: record.itemName || WAREHOUSE_ITEM_NAMES[record.itemCode] || text(String(record.itemCode || ''), '', '', ''),
        unit: record.unit || WAREHOUSE_ITEM_UNITS[record.itemCode] || 'kg',
        quantities,
        status: deriveStockStatus(quantities)
      };
    })
  };
}

function seedAndRead() {
  const seeded = createDefaultWarehouseInventory();
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(WAREHOUSE_INVENTORY_STORAGE_KEY, JSON.stringify(seeded));
    } catch (error) {
      console.warn('[WarehouseInventory] Unable to seed local business cache.', error);
    }
  }
  return seeded;
}

export function readWarehouseInventory() {
  if (typeof localStorage === 'undefined') return createDefaultWarehouseInventory();
  let raw = null;
  try {
    raw = localStorage.getItem(WAREHOUSE_INVENTORY_STORAGE_KEY);
  } catch (error) {
    console.warn('[WarehouseInventory] Unable to read local business cache.', error);
  }
  if (!raw) return seedAndRead();
  try {
    return normalizeWarehouseInventory(JSON.parse(raw));
  } catch (error) {
    console.warn('[WarehouseInventory] Resetting invalid business cache.', error);
    return seedAndRead();
  }
}

export async function saveWarehouseInventory(payload) {
  const next = { ...payload, version: 1, updatedAt: new Date().toISOString() };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(WAREHOUSE_INVENTORY_STORAGE_KEY, JSON.stringify(next));
  }
  if (typeof window !== 'undefined') {
    const { flushPocketBaseWrites } = await import('./pocketBaseSync.js');
    await flushPocketBaseWrites();
  }
  return next;
}
