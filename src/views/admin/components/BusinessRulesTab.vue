<template>
  <div class="space-y-4 text-[#1F3326]">
    <!-- 版本摘要与发布操作 -->
    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-base font-bold text-[#183B28]">{{ $t('businessRules.title') }}</h2>
            <el-tag size="small" type="success" effect="dark" class="font-mono font-bold">{{ $t('businessRules.savedVersion', { version: doc.version }) }}</el-tag>
          </div>
          <p class="mt-1 max-w-3xl text-xs leading-relaxed text-[#8A9A8F]">{{ $t('businessRules.subtitle') }}</p>
          <p class="mt-1 text-[11px] text-[#8A9A8F]">
            <span>{{ $t('businessRules.lastUpdated') }}:</span>
            <bdi dir="ltr" class="mx-1 font-mono">{{ doc.updatedAt || $t('businessRules.never') }}</bdi>
            <span v-if="doc.updatedBy">· {{ $t('businessRules.updatedBy') }}: {{ doc.updatedBy }}</span>
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <el-button size="small" @click="openHistory">
            <el-icon class="me-1"><Clock /></el-icon>{{ $t('businessRules.history') }}
          </el-button>
          <el-button size="small" type="primary" :loading="saving" :disabled="!dirty" @click="publish">
            <el-icon class="me-1"><CircleCheck /></el-icon>{{ saving ? $t('businessRules.saving') : $t('businessRules.save') }}
          </el-button>
        </div>
      </div>
      <div v-if="dirty" class="mt-3 rounded-lg border border-[#EBD9B4] bg-[#FDF3E0] px-3 py-1.5 text-[11px] font-semibold text-[#7A5F21]">
        {{ $t('businessRules.dirtyHint') }}
      </div>
      <div v-if="validationMessage" class="mt-2 text-[11px] font-semibold text-[#C04442]">{{ validationMessage }}</div>
    </section>

    <div class="rounded-xl border border-[#D9E5DB] bg-white px-3 pb-4 pt-2 shadow-sm sm:px-4">
      <el-tabs v-model="section" class="custom-admin-tabs">
        <el-tab-pane v-for="tab in sectionTabs" :key="tab" :name="tab" :label="$t(`businessRules.sections.${tab}`)">
          <p class="mb-3 text-xs leading-relaxed text-[#8A9A8F]">{{ $t(`businessRules.sectionHints.${tab}`) }}</p>

          <!-- 一、双路径条件 -->
          <template v-if="tab === 'autoAcceptance'">
            <el-table :data="form.autoAcceptance" size="small" :border="false">
              <el-table-column :label="$t('businessRules.businessType')" min-width="150">
                <template #default="{ row }">{{ $t(`businessRules.business.${row.key}`) }}</template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.autoAccept')" width="100" align="center">
                <template #default="{ row }"><el-switch v-model="row.autoAccept" size="small" /></template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.requireFamilyCode')" width="130" align="center">
                <template #default="{ row }"><el-switch v-model="row.requireSameFamilyCode" size="small" /></template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.minAge')" width="150" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.minAge" :min="0" :max="120" size="small" controls-position="right" class="!w-24" />
                </template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.regionScope')" min-width="140">
                <template #default="{ row }">
                  <el-select v-model="row.regionScope" size="small">
                    <el-option :label="$t('businessRules.regionAny')" value="any" />
                    <el-option :label="$t('businessRules.regionIntra')" value="intra-province" />
                    <el-option :label="$t('businessRules.regionInter')" value="cross-province" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.manualLevel')" min-width="160">
                <template #default="{ row }">
                  <el-select v-model="row.manualLevel" size="small">
                    <el-option v-for="level in RULE_LEVELS" :key="level" :label="$t(`businessRules.levels.${level}`)" :value="level" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </template>

          <!-- 二、140 号决议地区清单 -->
          <template v-else-if="tab === 'article140Centers'">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <el-tag size="small" type="success" effect="plain" class="font-bold">{{ $t('businessRules.article140Count', { count: form.article140Centers.length }) }}</el-tag>
                <span class="text-[11px] font-semibold text-[#2F7A50]">● {{ $t('businessRules.immediate') }}</span>
              </div>
              <el-button size="small" type="primary" plain @click="openAddCenter">
                <el-icon class="me-1"><Plus /></el-icon>{{ $t('businessRules.addCenter') }}
              </el-button>
            </div>
            <div v-if="!form.article140Centers.length" class="rounded-lg bg-[#F8FAF8] py-8 text-center text-sm text-[#8A9A8F]">{{ $t('businessRules.noCenters') }}</div>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <div v-for="center in form.article140Centers" :key="center.id" class="flex items-center justify-between gap-2 rounded-lg border border-[#D9E5DB] bg-[#F8FAF8] px-3 py-2">
                <div class="min-w-0">
                  <div class="truncate text-sm font-semibold">{{ centerName(center) }}</div>
                  <div class="mt-0.5 text-[11px] text-[#8A9A8F]">
                    <bdi dir="ltr" class="font-mono">{{ center.id }}</bdi> · {{ centerProvince(center) }}
                  </div>
                </div>
                <el-button size="small" text type="danger" :aria-label="$t('businessRules.removeCenter')" @click="removeCenter(center)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <!-- 三、户数阈值 -->
          <template v-else-if="tab === 'householdThresholds'">
            <div class="grid gap-3 sm:grid-cols-2">
              <div v-for="field in thresholdFields" :key="field.key" class="rounded-lg border border-[#D9E5DB] bg-[#F8FAF8] p-3">
                <div class="text-xs font-semibold text-[#43554B]">{{ $t(field.labelKey) }}</div>
                <div class="mt-2 flex items-center gap-2">
                  <el-input-number v-model="form.householdThresholds[field.key]" :min="1" :max="100000" size="small" controls-position="right" class="!w-32" />
                  <span class="text-xs text-[#8A9A8F]">{{ $t('businessRules.householdsUnit') }}</span>
                </div>
              </div>
            </div>
            <p class="mt-3 text-[11px] font-semibold" :class="thresholdOrderValid ? 'text-[#2F7A50]' : 'text-[#C04442]'">{{ $t('businessRules.thresholdInvalid') }}</p>
          </template>

          <!-- 四、规费标准 -->
          <template v-else-if="tab === 'feeStandards'">
            <el-table :data="form.feeStandards" size="small" :border="false">
              <el-table-column :label="$t('businessRules.feeBusiness')" min-width="180">
                <template #default="{ row }">{{ $t(`businessRules.business.${row.key}`) }}</template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.feeAmount')" width="220">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <el-input-number v-model="row.amount" :min="0" :max="1000000" :step="500" size="small" controls-position="right" class="!w-36" />
                    <span class="text-xs text-[#8A9A8F]">{{ $t('businessRules.currency') }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <p class="mt-2 text-[11px] font-semibold text-[#2F7A50]">● {{ $t('businessRules.feeImmediate') }}</p>
          </template>

          <!-- 五、配额标准 -->
          <template v-else-if="tab === 'quotaStandards'">
            <div class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F3F8F4] px-3 py-2 text-[11px]">
              <span class="font-semibold text-[#2F5B44]">● {{ $t('businessRules.quotaNextCycle') }}</span>
              <span v-if="form.quotaStandards.effectiveFrom" class="font-mono text-[#7A5F21]">
                {{ $t('businessRules.quotaEffectiveFrom') }}: <bdi dir="ltr">{{ form.quotaStandards.effectiveFrom }}</bdi>
              </span>
            </div>
            <el-table :data="form.quotaStandards.items" size="small" :border="false">
              <el-table-column :label="$t('businessRules.quotaItem')" min-width="170">
                <template #default="{ row }">{{ $t(`businessRules.items.${row.itemCode}`) }}</template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.quotaPerPerson')" width="200">
                <template #default="{ row }">
                  <el-input-number v-model="row.quotaPerPerson" :min="0.1" :max="1000" :step="0.5" :precision="1" size="small" controls-position="right" class="!w-32" />
                </template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.quotaUnit')" width="100" align="center">
                <template #default="{ row }"><bdi dir="ltr" class="font-mono">{{ row.unit }}</bdi></template>
              </el-table-column>
            </el-table>
            <p v-if="form.quotaStandards.effectiveFrom" class="mt-2 text-[11px] text-[#8A9A8F]">
              {{ $t('businessRules.quotaPending', { date: form.quotaStandards.effectiveFrom }) }}
            </p>
          </template>

          <!-- 六、审批矩阵 -->
          <template v-else-if="tab === 'approvalMatrix'">
            <el-table :data="form.approvalMatrix" size="small" :border="false">
              <el-table-column :label="$t('businessRules.approvalBusiness')" min-width="200">
                <template #default="{ row }">{{ $t(`businessRules.business.${row.key}`) }}</template>
              </el-table-column>
              <el-table-column :label="$t('businessRules.approvalLevel')" min-width="200">
                <template #default="{ row }">
                  <el-select v-model="row.level" size="small">
                    <el-option v-for="level in RULE_LEVELS" :key="level" :label="$t(`businessRules.levels.${level}`)" :value="level" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增 140 中心 -->
    <el-dialog v-model="addCenterOpen" :title="$t('businessRules.addCenter')" width="min(92vw, 460px)" append-to-body>
      <el-select v-model="selectedCenterId" filterable :loading="centersLoading" class="w-full" :placeholder="$t('businessRules.centerPicker')">
        <el-option v-for="option in availableCenters" :key="option.centerId" :label="`${option.centerName} · ${option.centerId}`" :value="String(option.centerId)" />
      </el-select>
      <p v-if="selectedCenterId && !selectedCenter" class="mt-2 text-xs font-semibold text-[#C04442]">{{ $t('businessRules.centerAlreadyAdded') }}</p>
      <template #footer>
        <el-button @click="addCenterOpen = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :disabled="!selectedCenter" @click="confirmAddCenter">{{ $t('businessRules.addCenter') }}</el-button>
      </template>
    </el-dialog>

    <!-- 版本历史 -->
    <el-drawer v-model="historyOpen" :title="$t('businessRules.historyTitle')" size="min(92vw, 520px)">
      <div v-if="!historyEntries.length" class="py-10 text-center text-sm text-[#8A9A8F]">{{ $t('businessRules.historyEmpty') }}</div>
      <div v-for="entry in historyEntries" :key="entry.version" class="border-b border-[#E9F1EB] py-3 last:border-b-0">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-mono text-sm font-bold text-[#183B28]">v{{ entry.version }}</span>
          <bdi dir="ltr" class="text-[11px] text-[#8A9A8F]">{{ entry.savedAt }}</bdi>
        </div>
        <div class="mt-1 flex flex-wrap gap-1">
          <el-tag v-for="group in entry.changedGroups" :key="group" size="small" type="warning" effect="plain">
            {{ $t(`businessRules.sections.${group}`) }}
          </el-tag>
          <el-tag v-if="!entry.changedGroups.length" size="small" effect="plain">{{ $t('businessRules.historyInitial') }}</el-tag>
        </div>
        <div class="mt-1.5 grid grid-cols-2 gap-1 text-[11px] text-[#58685D] sm:grid-cols-4">
          <span>{{ $t('businessRules.capacityRedline') }}: <bdi dir="ltr" class="font-mono">{{ entry.rules.householdThresholds.capacityRedline }}</bdi></span>
          <span>{{ $t('businessRules.sections.article140Centers') }}: <bdi dir="ltr" class="font-mono">{{ entry.rules.article140Centers.length }}</bdi></span>
          <span>{{ $t('businessRules.quotaItem') }}: <bdi dir="ltr" class="font-mono">{{ entry.rules.quotaStandards.items.length }}</bdi></span>
          <span>{{ $t('businessRules.sections.approvalMatrix') }}: <bdi dir="ltr" class="font-mono">{{ entry.rules.approvalMatrix.length }}</bdi></span>
        </div>
        <div v-if="entry.savedBy" class="mt-1 text-[11px] text-[#8A9A8F]">{{ $t('businessRules.historyActor') }}: {{ entry.savedBy }}</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Clock, Plus, Delete, CircleCheck } from '@element-plus/icons-vue';
import { getBusinessRulesDocument, saveBusinessRulesDocument } from '../../../api/businessRules.js';
import { getArticle140Centers as getCenterCatalog } from '../../../api/agent.js';
import {
  RULE_LEVELS,
  defaultBusinessRules,
  readBusinessRulesDocument,
  normalizeBusinessRulesDocument,
  inferArticle140ProvinceCode,
  getArticle140Centers as getConfiguredCenters
} from '../../../utils/businessRules.js';

const emit = defineEmits(['saved']);
const { t, te, locale } = useI18n();

const sectionTabs = ['autoAcceptance', 'article140Centers', 'householdThresholds', 'feeStandards', 'quotaStandards', 'approvalMatrix'];
const thresholdFields = [
  { key: 'capacityRedline', labelKey: 'businessRules.capacityRedline' },
  { key: 'smallOutlet', labelKey: 'businessRules.smallOutlet' },
  { key: 'newOutletBaseline', labelKey: 'businessRules.newOutletBaseline' },
  { key: 'minAcceptedHouseholds', labelKey: 'businessRules.minAcceptedHouseholds' }
];

const section = ref('autoAcceptance');
const saving = ref(false);
const validationMessage = ref('');
const doc = ref(readBusinessRulesDocument());
const form = ref(defaultBusinessRules());
const historyOpen = ref(false);
const addCenterOpen = ref(false);
const selectedCenterId = ref('');
const centersLoading = ref(false);
const centerCatalog = ref([]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadFormFromDoc() {
  form.value = clone(doc.value.rules || defaultBusinessRules());
}

function centerName(center) {
  const localizedName = center?.nameI18n?.[locale.value];
  const fallbackKey = `businessRules.centerNames.${center?.id}`;
  return localizedName || (te(fallbackKey) ? t(fallbackKey) : center?.name || '');
}

function centerProvince(center) {
  const localizedProvince = center?.provinceI18n?.[locale.value];
  const provinceCode = center?.provinceCode || inferArticle140ProvinceCode(center?.province);
  const fallbackKey = provinceCode ? `businessRules.provinceNames.${provinceCode}` : '';
  return localizedProvince || (fallbackKey && te(fallbackKey) ? t(fallbackKey) : center?.province || '—');
}

const dirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(doc.value.rules));

const thresholdOrderValid = computed(() => {
  const { minAcceptedHouseholds, newOutletBaseline, smallOutlet, capacityRedline } = form.value.householdThresholds;
  return minAcceptedHouseholds > 0 && minAcceptedHouseholds <= newOutletBaseline
    && newOutletBaseline <= smallOutlet && smallOutlet < capacityRedline;
});

const historyEntries = computed(() => [...(doc.value.history || [])].reverse());

const addedCenterIds = computed(() => new Set(form.value.article140Centers.map((center) => String(center.id))));
const availableCenters = computed(() => centerCatalog.value.filter((center) => !addedCenterIds.value.has(String(center.centerId))));
const selectedCenter = computed(() => centerCatalog.value.find((center) => String(center.centerId) === String(selectedCenterId.value)) || null);

async function loadDocument() {
  try {
    const result = await getBusinessRulesDocument();
    if (result?.rules) {
      doc.value = normalizeBusinessRulesDocument(result);
      loadFormFromDoc();
    }
  } catch {
    // 请求层已提示；继续使用本地缓存
    doc.value = readBusinessRulesDocument();
    loadFormFromDoc();
  }
}

async function publish() {
  validationMessage.value = '';
  if (!thresholdOrderValid.value) {
    validationMessage.value = t('businessRules.thresholdInvalid');
    return;
  }
  if (!form.value.article140Centers.length) {
    validationMessage.value = t('businessRules.noCenters');
    return;
  }
  saving.value = true;
  try {
    const result = await saveBusinessRulesDocument({ rules: clone(form.value) });
    doc.value = normalizeBusinessRulesDocument(result);
    loadFormFromDoc();
    ElMessage.success(t('businessRules.saved', { version: result.version }));
    emit('saved', result);
  } catch {
    // 请求层已提示
  } finally {
    saving.value = false;
  }
}

function openHistory() {
  historyOpen.value = true;
}

async function openAddCenter() {
  addCenterOpen.value = true;
  selectedCenterId.value = '';
  if (centerCatalog.value.length) return;
  centersLoading.value = true;
  try {
    const list = await getCenterCatalog();
    centerCatalog.value = Array.isArray(list) ? list : [];
  } catch {
    centerCatalog.value = getConfiguredCenters().map((center) => ({ centerId: center.id, centerName: center.name, province: center.province }));
  } finally {
    centersLoading.value = false;
  }
}

function confirmAddCenter() {
  if (!selectedCenter.value) {
    ElMessage.warning(t('businessRules.centerRequired'));
    return;
  }
  form.value.article140Centers.push({
    id: String(selectedCenter.value.centerId),
    name: selectedCenter.value.centerName,
    province: selectedCenter.value.province || '',
    provinceCode: selectedCenter.value.provinceCode || inferArticle140ProvinceCode(selectedCenter.value.province),
    nameI18n: selectedCenter.value.nameI18n || selectedCenter.value.centerNameI18n || {},
    provinceI18n: selectedCenter.value.provinceI18n || {}
  });
  addCenterOpen.value = false;
}

function removeCenter(center) {
  if (form.value.article140Centers.length <= 1) {
    ElMessage.warning(t('businessRules.noCenters'));
    return;
  }
  form.value.article140Centers = form.value.article140Centers.filter((item) => String(item.id) !== String(center.id));
}

onMounted(loadDocument);
</script>
