<template>
  <section v-if="request" class="rounded-xl border border-[#D3AF62] bg-[#FFFBF2] p-4 sm:p-5 space-y-3 text-start">
    <div>
      <h2 class="font-bold text-[#1F3326]">{{ $t('my.supplementTitle') }}</h2>
      <p class="text-sm text-[#58685D]">{{ $t('my.materialRequestBody', { flow: $t(`my.materialFlow.${request.flow}`) }) }}</p>
    </div>
    <div v-if="request.attachments?.length" class="text-xs text-[#326445] space-y-1">
      <div v-for="file in request.attachments" :key="file.id">{{ $t('my.materialSubmitted') }}: <bdi dir="ltr">{{ file.name }}</bdi></div>
    </div>
    <span class="block text-sm font-semibold text-[#43554B]">{{ $t('my.chooseMaterial') }}</span>
    <input id="supplement-file" ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" class="sr-only" tabindex="-1" aria-hidden="true" @change="pickFile" />
    <div class="flex min-w-0 items-center gap-2 rounded-lg border border-[#D9E5DB] bg-white p-2">
      <span class="min-w-0 flex-1 truncate text-sm text-[#58685D]" aria-live="polite">{{ selectedFile?.name || $t('my.noFileSelected') }}</span>
      <el-button id="supplement-file-trigger" plain @click="fileInput?.click()">{{ $t('my.chooseFile') }}</el-button>
    </div>
    <p class="text-xs text-[#8A9A8F]">{{ $t('my.materialFileHint') }}</p>
    <el-button type="primary" :loading="uploading" :disabled="!selectedFile" @click="submitFile">{{ $t('my.submitSupplement') }}</el-button>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { getMyNotifications, uploadMySupplement } from '../../api/my.js';
import { useMyNotificationsStore } from '../../stores/myNotifications.js';

const route = useRoute();
const { t } = useI18n();
const notificationStore = useMyNotificationsStore();
const request = ref(null);
const selectedFile = ref(null);
const fileInput = ref(null);
const uploading = ref(false);
const notificationId = computed(() => String(route.query.supplement || ''));

async function loadRequest() {
  request.value = null;
  if (!notificationId.value) return;
  try {
    const items = await getMyNotifications();
    request.value = items.find((item) => item.id === notificationId.value && item.type === 'material' && item.path === route.path) || null;
  } catch { /* The request layer shows the error. */ }
}

function pickFile(event) {
  const file = event.target.files?.[0];
  selectedFile.value = null;
  if (!file) return;
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
    ElMessage.warning(t('my.invalidMaterialFile'));
    event.target.value = '';
    return;
  }
  selectedFile.value = file;
}

async function submitFile() {
  if (!request.value || !selectedFile.value) return;
  uploading.value = true;
  try {
    await uploadMySupplement(request.value.id, selectedFile.value);
    selectedFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    await Promise.all([loadRequest(), notificationStore.refresh()]);
    ElMessage.success(t('my.materialSubmitted'));
  } catch { /* The request layer shows the error. */ }
  finally { uploading.value = false; }
}

onMounted(loadRequest);
watch(() => route.query.supplement, loadRequest);
</script>
