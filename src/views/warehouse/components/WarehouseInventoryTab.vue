<template>
  <div class="warehouse-inventory-tab space-y-4">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-[#D9E5DB]/80 bg-white p-4 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-[#E9F3EC] text-[#326445] flex items-center justify-center">
          <el-icon :size="20"><Warehouse /></el-icon>
        </div>
        <div>
          <div class="text-sm font-bold text-[#1B3123]">{{ t('warehouseInventory.title') }}</div>
          <div class="text-[11px] text-[#6B7C70] mt-0.5">{{ t('warehouseInventory.subtitle') }}</div>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <el-input v-model="keyword" :placeholder="t('warehouseInventory.searchPlaceholder')" clearable class="w-full sm:w-64">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="warehouseFilter" :placeholder="t('warehouseInventory.allWarehouses')" clearable class="w-full sm:w-52">
          <el-option v-for="warehouse in warehouses" :key="warehouse.id" :label="localize(warehouse.name)" :value="warehouse.id" />
        </el-select>
        <el-button :loading="loading" @click="load">
          <el-icon class="me-1"><Refresh /></el-icon>{{ t('warehouseInventory.refresh') }}
        </el-button>
        <el-button @click="resetFilters">
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <button
        v-for="card in statusCards"
        :key="card.key"
        type="button"
        class="status-card rounded-xl border p-3.5 text-start transition"
        :class="[statusToneClass(card.key), statusFilter === card.key ? 'ring-2 ring-[#326445]/25' : '']"
        @click="statusFilter = card.key"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-bold">{{ card.label }}</span>
          <el-icon :size="16"><component :is="card.icon" /></el-icon>
        </div>
        <div class="font-mono text-xl font-bold mt-2">{{ formatNumber(card.value) }}</div>
      </button>
    </div>

    <div class="rounded-xl border border-[#D9E5DB]/80 bg-white shadow-xs overflow-hidden">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9F1EB] px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="chip in itemChips"
            :key="chip.code"
            type="button"
            class="item-chip px-3 py-1.5 rounded-full border text-[11px] font-bold transition"
            :class="itemFilter === chip.code ? 'border-[#326445] bg-[#326445] text-white' : 'border-[#D9E5DB] bg-white text-[#43554B] hover:border-[#9FBCAA]'"
            @click="itemFilter = chip.code"
          >
            {{ chip.name }}
          </button>
        </div>
        <button type="button" class="text-[11px] text-[#6B7C70] hover:text-[#326445]" @click="resetFilters">
          {{ t('warehouseInventory.reset') }}
        </button>
      </div>

      <el-table :data="paginatedRecords" v-loading="loading" row-key="id" border class="text-xs" :empty-text="t('warehouseInventory.empty')">
        <el-table-column :label="t('warehouseInventory.warehouse')" min-width="210">
          <template #default="{ row }">
            <div class="font-bold text-[13px] text-[#1B3123]">{{ localize(row.warehouse?.name) }}</div>
            <div class="text-[11px] text-[#6B7C70] flex items-start gap-1 mt-1">
              <el-icon class="mt-0.5 shrink-0"><Location /></el-icon>
              <span>{{ localize(row.warehouse?.address) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.slot')" min-width="150">
          <template #default="{ row }">
            <span dir="ltr" class="inline-flex font-mono font-bold text-[11px] text-[#326445] bg-[#F3F8F4] border border-[#D9E5DB] px-1.5 py-0.5 rounded">{{ row.locationCode }}</span>
            <div class="text-[10px] text-[#8A9A8F] mt-1">{{ localize(row.location?.label) }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.itemName')" min-width="135">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <span class="h-7 w-7 rounded-md flex items-center justify-center" :class="itemToneClass(row.itemCode)">
                <el-icon :size="14"><Box /></el-icon>
              </span>
              <div>
                <div class="font-bold text-[#1B3123]">{{ localize(row.itemName) }}</div>
                <div dir="ltr" class="font-mono text-[10px] text-[#8A9A8F]">{{ row.itemCode }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.batch')" min-width="200">
          <template #default="{ row }">
            <div dir="ltr" class="font-mono font-bold text-[11px] text-[#43554B] bg-[#F3F8F4] px-1.5 py-0.5 rounded border border-[#D9E5DB] inline-block">
              {{ row.batchNo }}
            </div>
            <div dir="ltr" class="font-mono text-[10px] text-[#326445] mt-1 truncate" :title="row.uniqueTraceCode">{{ row.uniqueTraceCode }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.expiry')" min-width="160">
          <template #default="{ row }">
            <div dir="ltr" class="font-mono text-[11px] text-[#58685D]">{{ row.expiryDate }}</div>
            <div class="flex flex-wrap items-center gap-1 mt-1">
              <el-tag size="small" :type="expiryTagType(row.expiryStatus)" effect="light">
                {{ t(`warehouseInventory.expiryStatus.${row.expiryStatus}`) }}
              </el-tag>
              <el-tag size="small" :type="statusTagType(row.status)" effect="dark">
                {{ t(`warehouseInventory.status.${row.status}`) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.balance')" min-width="220">
          <template #default="{ row }">
            <div class="grid grid-cols-3 gap-1.5">
              <div v-for="status in statusCodes" :key="status" class="rounded-md px-1.5 py-1 text-center" :class="balanceToneClass(status)">
                <div class="text-[9px] font-bold opacity-80">{{ t(`warehouseInventory.status.${status}`) }}</div>
                <div class="font-mono text-[11px] font-bold">{{ formatNumber(row.quantities?.[status]) }}</div>
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-[#8A9A8F] mt-1.5">
              <span>{{ t('warehouseInventory.total') }}</span>
              <span class="font-mono font-bold text-[#326445]">
                {{ formatNumber(totalOf(row.quantities)) }} {{ t(`warehouseInventory.unit.${row.unit}`) }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="t('warehouseInventory.actions')" width="110" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditor(row)">
              <el-icon class="me-1"><EditPen /></el-icon>{{ t('warehouseInventory.edit') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filteredRecords.length" class="flex flex-wrap items-center justify-between gap-2 border-t border-[#E9F1EB] px-4 py-3">
        <span class="text-[11px] text-[#8A9A8F]">{{ t('warehouseInventory.records', { total: filteredRecords.length }) }}</span>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filteredRecords.length"
          :page-sizes="[6, 12, 24]"
          :pager-count="5"
          layout="total, sizes, prev, pager, next"
          background
          size="small"
        />
      </div>
    </div>

    <el-dialog v-model="editorVisible" :title="t('warehouseInventory.editor.title')" width="520px" align-center destroy-on-close>
      <template v-if="editorCurrent">
        <div class="rounded-lg border border-[#D9E5DB] bg-[#F3F8F4] p-3 mb-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="font-bold text-[#1B3123]">{{ localize(editorRecord?.warehouse?.name) }}</div>
              <div dir="ltr" class="font-mono text-[11px] text-[#326445] mt-0.5">{{ editorRecord?.locationCode }}</div>
            </div>
            <div class="text-end">
              <div class="text-[10px] text-[#8A9A8F]">{{ t('warehouseInventory.editor.batchInfo') }}</div>
              <div dir="ltr" class="font-mono text-[11px] font-bold text-[#43554B]">{{ editorRecord?.batchNo }}</div>
              <div dir="ltr" class="font-mono text-[10px] text-[#326445]">{{ editorRecord?.uniqueTraceCode }}</div>
            </div>
          </div>
        </div>

        <div class="text-[11px] font-bold text-[#43554B] mb-2">{{ t('warehouseInventory.editor.itemTitle') }}</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            v-for="code in itemCodes"
            :key="code"
            type="button"
            class="rounded-lg border px-2 py-2 text-center transition"
            :class="editorItem === code ? 'border-[#326445] bg-[#E9F3EC]' : 'border-[#D9E5DB] bg-white hover:border-[#9FBCAA]'"
            @click="editorItem = code"
          >
            <span class="block text-[11px] font-bold text-[#1B3123]">{{ itemName(code) }}</span>
            <span class="block font-mono text-[10px] text-[#6B7C70] mt-0.5">{{ formatNumber(draftTotal(editorDraft[code])) }}</span>
          </button>
        </div>

        <div class="text-[11px] font-bold text-[#43554B] mb-2">{{ t('warehouseInventory.editor.statusTitle') }}</div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div v-for="status in statusCodes" :key="status" class="rounded-lg border p-2.5" :class="statusToneClass(status)">
            <div class="flex items-center justify-between text-[11px] font-bold mb-2">
              <span>{{ t(`warehouseInventory.status.${status}`) }}</span>
              <el-icon :size="14"><component :is="statusIcon(status)" /></el-icon>
            </div>
            <el-input-number v-model="editorCurrent.quantities[status]" :min="0" :step="100" controls-position="right" class="w-full" />
            <div class="text-[10px] text-[#6B7C70] mt-1">{{ t(`warehouseInventory.unit.${editorCurrent.unit}`) }}</div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="editorVisible = false">{{ t('warehouseInventory.editor.cancel') }}</el-button>
        <el-button type="primary" @click="saveEditor">{{ t('warehouseInventory.editor.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
  Box,
  CircleCheck,
  EditPen,
  Location,
  Lock,
  Refresh,
  RefreshLeft,
  Search,
  Warehouse,
  WarningFilled
} from '@element-plus/icons-vue';
import { currentLang } from '../../../locales/index.js';
import {
  WAREHOUSE_INVENTORY_STORAGE_KEY,
  WAREHOUSE_ITEM_CODES,
  WAREHOUSE_ITEM_NAMES,
  WAREHOUSE_ITEM_UNITS,
  WAREHOUSE_STATUS_CODES,
  deriveStockStatus,
  readWarehouseInventory,
  saveWarehouseInventory
} from '../../../services/warehouseInventoryStore.js';

const { t } = useI18n();

const statusCodes = WAREHOUSE_STATUS_CODES;
const itemCodes = WAREHOUSE_ITEM_CODES;
const statusIcons = { available: CircleCheck, locked: Lock, frozen: WarningFilled, all: Box };

const loading = ref(false);
const payload = ref({ warehouses: [], records: [] });
const records = ref([]);
const keyword = ref('');
const warehouseFilter = ref('');
const itemFilter = ref('ALL');
const statusFilter = ref('all');
const page = ref(1);
const pageSize = ref(6);

const editorVisible = ref(false);
const editorRecord = ref(null);
const editorItem = ref('RICE');
const editorDraft = ref({});

function localize(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[currentLang.value] || value.zh || value.en || '';
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function totalOf(quantities) {
  return statusCodes.reduce((sum, code) => sum + Number(quantities?.[code] || 0), 0);
}

function itemName(code) {
  return t(`warehouseInventory.item.${code.toLowerCase()}`);
}

function statusIcon(code) {
  return statusIcons[code] || Box;
}

function statusToneClass(code) {
  return {
    all: 'border-[#D9E5DB] bg-white text-[#1B3123]',
    available: 'border-[#C7E0CE] bg-[#F3F8F4] text-[#24543A]',
    locked: 'border-[#F2E3C6] bg-[#FDF8EC] text-[#7A5F21]',
    frozen: 'border-[#F2D5D4] bg-[#FDF1F0] text-[#8C3735]'
  }[code] || 'border-[#D9E5DB] bg-white text-[#1B3123]';
}

function balanceToneClass(code) {
  return {
    available: 'bg-[#E9F3EC] text-[#24543A]',
    locked: 'bg-[#FDF3E0] text-[#7A5F21]',
    frozen: 'bg-[#FBEAE9] text-[#8C3735]'
  }[code] || 'bg-[#F3F8F4] text-[#43554B]';
}

function itemToneClass(code) {
  return {
    RICE: 'bg-[#E9F3EC] text-[#326445]',
    FLOUR: 'bg-[#FDF3E0] text-[#8A6818]',
    OIL: 'bg-[#EAF3F8] text-[#2D637F]',
    SUGAR: 'bg-[#F5ECF7] text-[#71477A]'
  }[code] || 'bg-[#EFF5F1] text-[#326445]';
}

function statusTagType(code) {
  return { available: 'success', locked: 'warning', frozen: 'danger' }[code] || 'info';
}

function expiryTagType(code) {
  return { normal: 'success', expiring: 'warning', expired: 'danger' }[code] || 'info';
}

const warehouses = computed(() => payload.value.warehouses || []);
const warehouseMap = computed(() => Object.fromEntries(warehouses.value.map((item) => [item.id, item])));
const locationMap = computed(() => {
  const map = {};
  for (const warehouse of warehouses.value) {
    map[warehouse.id] = Object.fromEntries((warehouse.locations || []).map((location) => [location.code, location]));
  }
  return map;
});

const enrichedRecords = computed(() => records.value.map((record) => ({
  ...record,
  warehouse: warehouseMap.value[record.warehouseId],
  location: locationMap.value[record.warehouseId]?.[record.locationCode]
})));

function searchBlob(row) {
  return [
    localize(row.itemName),
    localize(row.warehouse?.name),
    localize(row.warehouse?.address),
    localize(row.location?.label),
    row.itemCode,
    row.locationCode,
    row.batchNo,
    row.uniqueTraceCode,
    row.expiryDate,
    row.status
  ].join(' ').toLowerCase();
}

const baseRecords = computed(() => {
  const term = keyword.value.trim().toLowerCase();
  return enrichedRecords.value.filter((row) => {
    if (itemFilter.value !== 'ALL' && row.itemCode !== itemFilter.value) return false;
    if (warehouseFilter.value && row.warehouseId !== warehouseFilter.value) return false;
    if (term && !searchBlob(row).includes(term)) return false;
    return true;
  });
});

const filteredRecords = computed(() => {
  if (statusFilter.value === 'all') return baseRecords.value;
  return baseRecords.value.filter((row) => row.status === statusFilter.value);
});

const paginatedRecords = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRecords.value.slice(start, start + pageSize.value);
});

const statusCards = computed(() => {
  const totals = { available: 0, locked: 0, frozen: 0 };
  for (const row of baseRecords.value) {
    for (const code of statusCodes) totals[code] += Number(row.quantities?.[code] || 0);
  }
  return [
    { key: 'all', label: t('warehouseInventory.summary.records'), value: baseRecords.value.length, icon: statusIcons.all },
    { key: 'available', label: t('warehouseInventory.summary.available'), value: totals.available, icon: statusIcons.available },
    { key: 'locked', label: t('warehouseInventory.summary.locked'), value: totals.locked, icon: statusIcons.locked },
    { key: 'frozen', label: t('warehouseInventory.summary.frozen'), value: totals.frozen, icon: statusIcons.frozen }
  ];
});

const itemChips = computed(() => [
  { code: 'ALL', name: t('warehouseInventory.item.all') },
  ...itemCodes.map((code) => ({ code, name: itemName(code) }))
]);

function resetFilters() {
  keyword.value = '';
  warehouseFilter.value = '';
  itemFilter.value = 'ALL';
  statusFilter.value = 'all';
}

function load() {
  loading.value = true;
  try {
    const data = readWarehouseInventory();
    payload.value = data;
    records.value = data.records;
  } finally {
    loading.value = false;
  }
}

function onStorage(event) {
  if (!event.key || event.key === WAREHOUSE_INVENTORY_STORAGE_KEY) load();
}

const editorCurrent = computed(() => editorDraft.value[editorItem.value] || null);

function draftTotal(draft) {
  return draft ? totalOf(draft.quantities) : 0;
}

function openEditor(row) {
  editorRecord.value = row;
  const scoped = records.value.filter((record) =>
    record.warehouseId === row.warehouseId &&
    record.locationCode === row.locationCode &&
    record.batchNo === row.batchNo &&
    record.uniqueTraceCode === row.uniqueTraceCode
  );
  const draft = {};
  for (const code of itemCodes) {
    const existing = scoped.find((record) => record.itemCode === code);
    draft[code] = {
      id: existing?.id || `${row.id}-${code}`,
      existing: Boolean(existing),
      itemCode: code,
      itemName: existing?.itemName || WAREHOUSE_ITEM_NAMES[code],
      warehouseId: row.warehouseId,
      locationCode: row.locationCode,
      batchNo: row.batchNo,
      uniqueTraceCode: existing?.uniqueTraceCode || `${row.uniqueTraceCode}-${code}`,
      productionDate: existing?.productionDate || row.productionDate,
      expiryDate: existing?.expiryDate || row.expiryDate,
      expiryStatus: existing?.expiryStatus || row.expiryStatus,
      unit: existing?.unit || WAREHOUSE_ITEM_UNITS[code],
      quantities: {
        available: Number(existing?.quantities?.available || 0),
        locked: Number(existing?.quantities?.locked || 0),
        frozen: Number(existing?.quantities?.frozen || 0)
      }
    };
  }
  editorDraft.value = draft;
  editorItem.value = row.itemCode || 'RICE';
  editorVisible.value = true;
}

async function saveEditor() {
  const drafts = Object.values(editorDraft.value);
  const invalid = drafts.some((draft) => statusCodes.some((code) => {
    const value = Number(draft.quantities?.[code]);
    return !Number.isFinite(value) || value < 0;
  }));
  if (invalid) {
    ElMessage.error(t('warehouseInventory.editor.invalid'));
    return;
  }

  const next = [...records.value];
  for (const draft of drafts) {
    const quantities = Object.fromEntries(statusCodes.map((code) => [code, Number(draft.quantities?.[code] || 0)]));
    const total = totalOf(quantities);
    const index = next.findIndex((record) => record.id === draft.id);
    if (total === 0) {
      if (index >= 0) next.splice(index, 1);
      continue;
    }
    const { existing, ...cleanDraft } = draft;
    const updated = {
      ...cleanDraft,
      quantities,
      status: deriveStockStatus(quantities),
      updatedAt: new Date().toISOString()
    };
    if (index >= 0) next.splice(index, 1, updated);
    else next.push(updated);
  }

  records.value = next;
  const saved = await saveWarehouseInventory({ ...payload.value, records: next });
  payload.value = saved;
  editorVisible.value = false;
  ElMessage.success(t('warehouseInventory.editor.saved'));
}

watch([keyword, warehouseFilter, itemFilter, statusFilter], () => { page.value = 1; });
watch(pageSize, () => { page.value = 1; });
watch(() => filteredRecords.value.length, (length) => {
  const maxPage = Math.max(1, Math.ceil(length / pageSize.value));
  if (page.value > maxPage) page.value = maxPage;
});

onMounted(() => {
  load();
  window.addEventListener('storage', onStorage);
});

onUnmounted(() => {
  window.removeEventListener('storage', onStorage);
});
</script>

<style scoped>
.warehouse-inventory-tab :deep(.el-table th.el-table__cell) {
  background: #f3f8f4;
  color: #43554b;
  font-size: 11px;
}

.status-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(50 100 69 / 8%);
}

.item-chip:hover {
  border-color: #9fbcaa;
}
</style>
