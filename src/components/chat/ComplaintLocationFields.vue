<template>
  <div class="complaint-location-fields">
    <p class="mb-2 text-[11px] leading-relaxed text-[#58685D]" role="status">{{ t(loading ? 'chatOrders.locationLoading' : source === 'card' ? 'chatOrders.locationFromCard' : source === 'outlet' ? 'chatOrders.locationFromOutlet' : 'chatOrders.locationChoose') }}</p>
    <div class="grid grid-cols-2 gap-x-2">
      <el-form-item :label="t('common.province')" required>
        <el-select v-if="provinceOptions.length" :model-value="province" filterable allow-create default-first-option clearable class="w-full" :loading="loading" :disabled="disabled" :aria-label="t('common.province')" :placeholder="t('chatOrders.selectProvince')" @update:model-value="changeProvince">
          <el-option v-for="option in provinceOptions" :key="option.id" :label="option.value" :value="option.value" />
        </el-select>
        <el-input v-else :model-value="province" :disabled="disabled" :aria-label="t('common.province')" maxlength="100" @update:model-value="changeProvince" />
      </el-form-item>
      <el-form-item :label="t('common.center')">
        <el-select v-if="centerOptions.length" :model-value="center" filterable allow-create default-first-option clearable class="w-full" :loading="loading" :disabled="disabled" :aria-label="t('common.center')" :placeholder="t('chatOrders.selectCenter')" @update:model-value="changeCenter">
          <el-option v-for="option in centerOptions" :key="option.id" :label="option.value" :value="option.value" />
        </el-select>
        <el-input v-else :model-value="center" :disabled="disabled" :aria-label="t('common.center')" maxlength="120" @update:model-value="changeCenter" />
      </el-form-item>
    </div>
    <el-form-item :label="t('complaint.outletNamePlaceholder')" required>
      <el-select v-if="agentOptions.length" :model-value="agentName" filterable allow-create default-first-option clearable class="w-full" :loading="loading" :disabled="disabled" :aria-label="t('complaint.outletNamePlaceholder')" :placeholder="t('chatOrders.selectOutlet')" @update:model-value="changeAgent">
        <el-option v-for="option in agentOptions" :key="option.id" :label="option.value" :value="option.value" />
      </el-select>
      <el-input v-else :model-value="agentName" :disabled="disabled" :aria-label="t('complaint.outletNamePlaceholder')" maxlength="160" @update:model-value="changeAgent" />
    </el-form-item>
    <p v-if="!loading && !rows.length" class="mb-3 text-[11px] text-[#58685D]">{{ t('chatOrders.locationManual') }}</p>
  </div>
</template>
<script setup>
import { computed, ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.js';
import { getComplaintLocations } from '../../api/complaintLocations.js';
import { complaintLocationOptions } from '../../utils/complaintLocations.js';
const props = defineProps({ province: String, center: String, agentName: String, disabled: Boolean });
const emit = defineEmits(['update:province', 'update:center', 'update:agentName']);
const { t, locale } = useI18n();
const auth = useAuthStore();
const rows = ref([]), loading = ref(false), source = ref('');
const selected = reactive({ province: '', center: '', agentName: '' });
const dirty = { province: false, center: false, agentName: false };
const provinceOptions = computed(() => complaintLocationOptions(rows.value, 'province'));
const centerOptions = computed(() => selected.province ? complaintLocationOptions(rows.value, 'center', selected.province) : []);
const agentOptions = computed(() => selected.province && selected.center ? complaintLocationOptions(rows.value, 'agentName', selected.province, selected.center) : []);
let alive = true, version = 0;
function setField(field, value, options, user = false) {
  const option = options.find(item => item.value === value);
  selected[field] = option?.id || '';
  if (user) dirty[field] = true;
  emit(`update:${field}`, value || '');
}
function changeProvince(value) {
  setField('province', value, provinceOptions.value, true);
  changeCenter('');
}
function changeCenter(value) {
  setField('center', value, centerOptions.value, true);
  changeAgent('');
}
function changeAgent(value) { setField('agentName', value, agentOptions.value, true); }
async function load() {
  const current = ++version;
  loading.value = true;
  try {
    const data = await getComplaintLocations({ ...auth.userProfile });
    if (!alive || current !== version) return;
    rows.value = data.rows; source.value = data.defaults?.source || '';
    for (const [field, options] of [['province', provinceOptions], ['center', centerOptions], ['agentName', agentOptions]]) {
      const translated = selected[field] && options.value.find(item => item.id === selected[field]);
      const value = dirty[field] ? translated?.value ?? props[field] : data.defaults?.[field] || props[field];
      setField(field, value, options.value);
    }
  } catch { /* Keep the current values available for manual entry. */ }
  finally { if (alive && current === version) loading.value = false; }
}
watch(locale, load);
onMounted(load);
onBeforeUnmount(() => { alive = false; });
</script>
