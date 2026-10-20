<template>
  <el-dialog :model-value="modelValue" :title="t('memberRegistration.title')" width="min(960px, 94vw)" align-center destroy-on-close @update:model-value="emit('update:modelValue', $event)">
    <div v-loading="loading" class="registration-details" :aria-busy="loading">
      <div v-if="member" class="registration-summary">
        <strong>{{ member.name }}</strong>
        <span>{{ member.relation }}</span>
        <span dir="ltr">{{ family?.cardNo || family?.rationCardNo || '—' }}</span>
      </div>
      <el-alert v-if="loadFailed" :title="t('memberRegistration.loadFailed')" type="warning" :closable="false" show-icon />
      <template v-if="record && !loading">
        <el-descriptions :column="isCompact ? 1 : 2" border class="registration-identity">
          <el-descriptions-item v-for="field in identityFields" :key="field" :label="t(`memberRegistration.${field}`)">
            <span :dir="['nationalId', 'documentNumber', 'phone', 'birthDate', 'expiryDate'].includes(field) ? 'ltr' : undefined">{{ record.identity[field] || '—' }}</span>
          </el-descriptions-item>
          <el-descriptions-item :label="t('memberRegistration.paperCardNo')"><span dir="ltr">{{ record.paperCardNo || '—' }}</span></el-descriptions-item>
          <el-descriptions-item :label="t('memberRegistration.registeredAt')"><span dir="ltr">{{ formatTime(record.registeredAt) }}</span></el-descriptions-item>
        </el-descriptions>
        <div class="registration-materials">
          <section v-for="section in sections" :key="section.key" class="registration-material">
            <h3>{{ t(`memberRegistration.${section.key}`) }}</h3>
            <template v-if="section.key === 'face'">
              <el-tag :type="record.faceVerified === true ? 'success' : 'info'" size="small">{{ t(record.faceVerified === true ? 'memberRegistration.verified' : record.faceVerified === false ? 'memberRegistration.unverified' : 'memberRegistration.noVerification') }}</el-tag>
              <p v-if="record.verifiedAt" class="registration-meta">{{ t('memberRegistration.verifiedAt') }}: {{ formatTime(record.verifiedAt) }}</p>
            </template>
            <div v-for="image in section.images" :key="image.field" class="registration-image">
              <span v-if="section.images.length > 1" class="registration-meta">{{ t(`memberRegistration.${image.field}`) }}</span>
              <el-image v-if="record[image.field]" :src="record[image.field]" :alt="t(`memberRegistration.${section.key}`)" :preview-src-list="previewImages" :initial-index="previewImages.indexOf(record[image.field])" fit="contain" preview-teleported>
                <template #error><div class="registration-empty">{{ t('memberRegistration.imageUnavailable') }}</div></template>
              </el-image>
              <div v-else class="registration-empty">{{ t('memberRegistration.noOriginal') }}</div>
            </div>
          </section>
        </div>
        <p class="registration-meta">{{ t('memberRegistration.previewHint') }}</p>
      </template>
    </div>
    <template #footer><el-button @click="emit('update:modelValue', false)">{{ t('memberRegistration.close') }}</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getRegistrationArchive, resolveMemberRegistration } from '../../../utils/memberRegistration.js';
import { useCompactDialog } from '../../../composables/useCompactDialog.js';

const props = defineProps({ modelValue: Boolean, member: Object, family: Object });
const emit = defineEmits(['update:modelValue']);
const { t, locale } = useI18n();
const { isCompact } = useCompactDialog(960);
const loading = ref(false);
const loadFailed = ref(false);
const record = ref(null);
const identityFields = ['name', 'nationalId', 'gender', 'birthDate', 'phone', 'documentType', 'documentNumber', 'issuingAuthority', 'expiryDate'];
const sections = [
  { key: 'face', images: [{ field: 'faceImage' }] },
  { key: 'paperCard', images: [{ field: 'paperCardImage' }] },
  { key: 'identityDocuments', images: [{ field: 'identityFrontImage' }, { field: 'identityBackImage' }] }
];
const previewImages = computed(() => record.value ? sections.flatMap(section => section.images.map(image => record.value[image.field])).filter(Boolean) : []);

function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

watch(() => [props.modelValue, props.member, props.family], async (_, __, onCleanup) => {
  let active = true;
  onCleanup(() => { active = false; });
  record.value = null;
  loadFailed.value = false;
  loading.value = false;
  if (!props.modelValue || !props.member) return;
  loading.value = true;
  let archive = null;
  try {
    if (import.meta.env.VITE_APP_MOCK_MODE === 'true') archive = await getRegistrationArchive(props.member.nationalId);
  } catch {
    if (active) loadFailed.value = true;
  } finally {
    if (active) {
      record.value = resolveMemberRegistration(props.member, props.family || {}, archive);
      loading.value = false;
    }
  }
}, { immediate: true });
</script>

<style scoped>
.registration-details { display: grid; gap: 16px; max-height: 65vh; overflow-y: auto; padding-inline-end: 4px; }
.registration-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #c7e0ce; border-radius: 8px; background: #eff5f1; color: #326445; }
.registration-materials { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.registration-material { border: 1px solid #d9e5db; border-radius: 8px; padding: 12px; }
.registration-material h3 { font-size: 13px; font-weight: 700; color: #326445; margin-block: 0 10px; }
.registration-meta { font-size: 12px; color: #58685d; overflow-wrap: anywhere; }
.registration-image { margin-block-start: 10px; }
.registration-image .el-image { display: block; width: 100%; height: 180px; background: #f3f8f4; border-radius: 6px; }
.registration-empty { display: flex; align-items: center; justify-content: center; min-height: 120px; height: 100%; padding: 16px; background: #f3f8f4; color: #8a9a8f; font-size: 12px; border-radius: 6px; text-align: center; }
.registration-identity :deep(.el-descriptions__body) { overflow-x: auto; }
.registration-identity :deep(.el-descriptions__content) { overflow-wrap: anywhere; }
@media (max-width: 640px) { .registration-materials { grid-template-columns: 1fr; } }
</style>
