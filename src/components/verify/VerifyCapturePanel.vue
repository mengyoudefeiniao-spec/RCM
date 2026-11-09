<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <label class="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#326445] px-3 py-2 text-xs font-semibold text-white hover:bg-[#244c34]">
        {{ photo ? $t('verification.cap.retake') : $t('verification.cap.takePhoto') }}
        <input ref="fileInput" type="file" accept="image/*" :capture="facing" class="sr-only" @change="onFile" />
      </label>
      <span v-if="busy" class="text-xs text-[#8A9A8F]">{{ $t('verification.probing') }}</span>
      <span v-else-if="photo" class="text-xs text-[#326445]">{{ photo.width }} × {{ photo.height }} · {{ formatBytes(photo.blob.size) }}</span>
    </div>

    <div v-if="previewUrl" class="overflow-hidden rounded-lg border border-[#D9E5DB] bg-[#F4F8F5]">
      <img :src="previewUrl" alt="" class="mx-auto max-h-64 w-auto object-contain" />
    </div>

    <div v-if="!photoOnly" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div v-for="field in fields" :key="field.key" class="space-y-1" :class="field.type === 'multi' ? 'sm:col-span-2' : ''">
        <label class="block text-xs font-semibold text-[#43554B]">
          {{ $t(`verification.fields.${field.key}`) }}
          <span v-if="field.required" class="text-[#C04442]">*</span>
        </label>
        <el-input
          v-if="field.type === 'text'"
          v-model="values[field.key]"
          size="small"
          :class="field.mono ? 'font-mono' : ''"
          :placeholder="placeholderFor(field)"
          maxlength="60"
        />
        <el-select v-else-if="field.type === 'select'" v-model="values[field.key]" size="small" class="w-full">
          <el-option v-for="option in field.options" :key="option" :label="optionLabel(option)" :value="option" />
        </el-select>
        <div v-else-if="field.type === 'multi'" class="flex flex-wrap gap-1">
          <button
            v-for="option in field.options"
            :key="option"
            type="button"
            class="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
            :class="(values[field.key] || []).includes(option)
              ? 'border-[#326445] bg-[#E2F4E4] font-semibold text-[#326445]'
              : 'border-[#D9E5DB] text-[#58685D]'"
            @click="toggleMulti(field.key, option)"
          >
            {{ optionLabel(option) }}
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <el-button size="small" type="primary" :loading="busy" @click="save">{{ $t('verification.cap.save') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { fieldsForCase, CAPTURE_IMAGE_HINTS } from '../../utils/verificationCases.js';
import { normalizeImage, formatBytes } from '../../utils/verificationImage.js';

const props = defineProps({
  caseDef: { type: Object, required: true },
  photoOnly: { type: Boolean, default: false },
});
const emit = defineEmits(['record']);
const { t, te } = useI18n();

const fileInput = ref(null);
const busy = ref(false);
const photo = ref(null);
const previewUrl = ref('');
const values = reactive({});

const fields = computed(() => fieldsForCase(props.caseDef));
const facing = computed(() => CAPTURE_IMAGE_HINTS[props.caseDef?.captureType]?.facing || 'environment');

function resetValues() {
  for (const key of Object.keys(values)) delete values[key];
  for (const field of fields.value) {
    if (field.type === 'multi') values[field.key] = [];
    else if (field.type === 'select') values[field.key] = field.options[0];
    else values[field.key] = '';
  }
}

watch(() => props.caseDef?.id, () => {
  resetValues();
  clearPhoto();
}, { immediate: true });

// Years and other literal options are not translated.
function optionLabel(option) {
  const key = `verification.options.${option}`;
  return te(key) ? t(key) : option;
}

function placeholderFor(field) {
  if (field.key === 'householdNo') return t('verification.fields.householdNoHint');
  if (field.key === 'subjectId') return t('verification.fields.subjectIdHint');
  return '';
}

function toggleMulti(key, option) {
  const current = values[key] || [];
  values[key] = current.includes(option) ? current.filter(item => item !== option) : [...current, option];
}

function clearPhoto() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
  photo.value = null;
  if (fileInput.value) fileInput.value.value = '';
}

async function onFile(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  busy.value = true;
  try {
    const hints = CAPTURE_IMAGE_HINTS[props.caseDef.captureType] || {};
    const normalized = await normalizeImage(file, hints);
    clearPhoto();
    photo.value = normalized;
    previewUrl.value = URL.createObjectURL(normalized.blob);
  } catch {
    ElMessage.error(t('verification.cap.imageError'));
  } finally {
    busy.value = false;
  }
}

function save() {
  if (!photo.value) {
    ElMessage.warning(t('verification.cap.photoRequired'));
    return;
  }
  for (const field of fields.value) {
    if (!field.required) continue;
    const value = values[field.key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      ElMessage.warning(t('verification.fields.' + field.key));
      return;
    }
  }
  const input = {};
  for (const field of fields.value) {
    const value = values[field.key];
    if (Array.isArray(value)) {
      if (value.length) input[field.key] = [...value];
    } else if (value !== '' && value !== undefined && value !== null) {
      input[field.key] = value;
    }
  }
  emit('record', {
    metrics: {
      width: photo.value.width,
      height: photo.value.height,
      bytes: photo.value.blob.size,
      sourceWidth: photo.value.originalWidth,
      sourceHeight: photo.value.originalHeight,
    },
    input,
    photo: photo.value.blob,
    photoMeta: { width: photo.value.width, height: photo.value.height },
  });
  ElMessage.success(t('verification.cap.saved'));
  // Keep the select answers for a batch, but a new card or subject needs new text.
  for (const field of fields.value) {
    if (field.type === 'text' && field.key !== 'subjectId') values[field.key] = '';
  }
  clearPhoto();
}

onBeforeUnmount(clearPhoto);
</script>
