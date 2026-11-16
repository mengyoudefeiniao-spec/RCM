<template>
  <div class="document-uploader w-full max-w-full overflow-hidden box-border space-y-2">
    <!-- 隐藏式文件选择框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      class="hidden"
      @change="handleLocalFileSelected"
    />

    <!-- 顶部标题、必需标记与机构信息 -->
    <div class="flex items-center justify-between gap-1.5 flex-wrap text-xs">
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="font-bold text-[#1F3326]">{{ title }}</span>
        <!-- 感叹号+圆圈新图层提示图标 (不挤压卡片框体) -->
        <el-popover
          v-if="subtitle"
          trigger="click"
          placement="bottom-start"
          :width="280"
          :teleported="true"
          :show-arrow="true"
          popper-class="module-desc-layer-popover"
        >
          <template #reference>
            <button
              type="button"
              class="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#8A9A8F] hover:text-[#326445] hover:bg-[#EFF5F1] transition-colors cursor-pointer select-none"
              :title="$t('uploader.viewSpecTip')"
            >
              <el-icon :size="12"><InfoFilled /></el-icon>
            </button>
          </template>
          <div class="p-1 space-y-1.5 text-xs">
            <div class="font-bold text-[#1F3326] flex items-center gap-1 text-[11px] pb-1 border-b border-[#E9F1EB]">
              <el-icon class="text-[#5C8A6B]" :size="12"><InfoFilled /></el-icon>
              <span>{{ $t('uploader.specTitle') }}</span>
            </div>
            <div class="bg-[#F3F8F4] border border-[#D9E5DB]/90 text-[#58685D] rounded-lg p-2 text-xs leading-relaxed break-words font-normal">
              {{ subtitle }}
            </div>
          </div>
        </el-popover>
        <template v-if="showRequirementBadge">
          <el-tag v-if="isRequired" type="danger" size="small" effect="plain" class="font-bold scale-90 origin-left rtl:origin-right">
            {{ $t('uploader.required') }}
          </el-tag>
          <el-tag v-else type="info" size="small" effect="plain" class="scale-90 origin-left rtl:origin-right">
            {{ $t('uploader.optional') }}
          </el-tag>
        </template>
        <el-tag v-if="categoryBadge" size="small" effect="light" class="scale-90 origin-left rtl:origin-right">
          {{ categoryBadge }}
        </el-tag>
      </div>
      <span v-if="issuerText" class="text-[10px] text-[#8A9A8F] font-mono truncate max-w-[140px]">
        {{ $t('uploader.issuer') }} {{ issuerText }}
      </span>
    </div>

    <!-- 1. 上传进度中状态 -->
    <div v-if="isUploading" class="p-3 sm:p-4 rounded-lg border border-[#C7E0CE] bg-[#E2F4E4] space-y-2">
      <div class="flex items-center justify-between text-xs text-[#326445] font-bold">
        <span>{{ uploadStage }}</span>
        <span class="font-mono font-bold">{{ uploadProgress }}%</span>
      </div>
      <el-progress :percentage="uploadProgress" :show-text="false" color="#326445" />
    </div>

    <!-- 2. 已上传完成状态 (极致防溢出布局) -->
    <div
      v-else-if="currentFile"
      class="p-3 sm:p-4 rounded-lg border border-[#D9E5DB] bg-white shadow-xs transition-all hover:border-[#D3AF62] overflow-hidden"
    >
      <div class="flex flex-col gap-2.5">
        <div class="flex items-start gap-2.5 min-w-0">
          <div class="p-2 rounded-lg bg-[#FDF3E0] text-[#D3AF62] border border-[#E5CEA1] shrink-0">
            <el-icon :size="20"><Document /></el-icon>
          </div>
          <div class="space-y-1 min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-bold text-[#1F3326] font-mono truncate max-w-[190px] sm:max-w-none block">
                {{ displayedFile.fileName }}
              </span>
              <el-tag type="success" size="small" effect="light" class="font-bold scale-90 origin-left rtl:origin-right shrink-0">
                {{ $t('uploader.verifiedBadge') }}
              </el-tag>
            </div>
            <div class="text-[10px] sm:text-[11px] text-[#58685D] flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono">
              <span>{{ displayedFile.fileSize }}</span>
              <span>•</span>
              <span class="truncate max-w-[120px] sm:max-w-none">{{ $t('uploader.refNoLabel') }} <bdi dir="ltr">{{ displayedFile.referenceNo }}</bdi></span>
              <span>•</span>
              <span class="text-[#2F7A50] font-semibold">{{ $t('uploader.confidence') }}</span>
            </div>
            <div class="p-1 px-2 bg-[#F3F8F4] rounded border border-[#D9E5DB] text-[10px] text-[#58685D] line-clamp-1">
              <span class="font-semibold text-[#1F3326]">{{ $t('uploader.antiCounterfeit') }}</span>
              <span>{{ displayedFile.ocrSummary }}</span>
            </div>
          </div>
        </div>

        <!-- 显式操作按钮栏：移动端 4 按钮网格等分排列，绝不超界 -->
        <div class="grid grid-cols-4 gap-1 pt-2 border-t border-[#D9E5DB] w-full">
          <el-button size="small" type="primary" plain class="!px-1 !m-0 w-full text-center text-xs justify-center" @click="previewModalVisible = true">
            <el-icon class="me-0.5"><ZoomIn /></el-icon>
            {{ $t('uploader.btnPreview') }}
          </el-button>
          <el-button size="small" plain class="!px-1 !m-0 w-full text-center text-xs justify-center" @click="triggerOpenLocalFile">
            <el-icon class="me-0.5"><UploadFilled /></el-icon>
            {{ $t('uploader.btnReupload') }}
          </el-button>
          <el-button size="small" text type="info" class="!px-1 !m-0 w-full text-center text-xs justify-center bg-[#F3F8F4] border border-[#D9E5DB]" @click="triggerReloadTemplate">
            <el-icon class="rtl-mirror-icon me-0.5"><RefreshRight /></el-icon>
            {{ $t('uploader.btnReloadTemplate') }}
          </el-button>
          <el-button size="small" type="danger" plain class="!px-1 !m-0 w-full text-center text-xs justify-center" @click="handleRemoveFile">
            <el-icon class="me-0.5"><DeleteFilled /></el-icon>
            {{ $t('uploader.btnDelete') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 未上传 / 已删除空状态 -->
    <div
      v-else
      class="border-2 border-dashed border-[#C4D6C8] rounded-lg p-3.5 sm:p-5 text-center bg-[#F3F8F4] hover:border-[#D3AF62] transition-colors overflow-hidden"
    >
      <div class="flex flex-col items-center justify-center gap-1.5">
        <div class="p-2 bg-white rounded-full text-[#D3AF62] border border-[#D9E5DB] shadow-2xs">
          <el-icon :size="20"><UploadFilled /></el-icon>
        </div>
        <div class="text-xs font-semibold text-[#1F3326]">
          {{ isRequired ? $t('uploader.emptyRequired') : $t('uploader.emptyOptional') }}
        </div>
        <div class="text-[10px] text-[#8A9A8F] line-clamp-1">
          {{ $t('uploader.emptyTip') }}
        </div>
        <!-- 移动端并排按钮网格化防溢出 -->
        <div class="grid grid-cols-2 gap-2 mt-1.5 w-full max-w-[280px]">
          <el-button type="primary" size="small" class="!m-0 w-full font-medium justify-center" @click="triggerOpenLocalFile">
            <el-icon class="me-1"><UploadFilled /></el-icon>
            {{ $t('uploader.btnUploadFile') }}
          </el-button>
          <el-button size="small" plain class="!m-0 w-full justify-center" @click="triggerReloadTemplate">
            <el-icon class="me-1"><DocumentCopy /></el-icon>
            {{ $t('uploader.btnLoadSample') }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 官方公文原件数字化预览弹窗 -->
    <el-dialog
      v-model="previewModalVisible"
      :title="$t('uploader.specTitle')"
      :width="'min(92vw, 560px)'"
      align-center
      append-to-body
    >
      <div v-if="currentFile" class="space-y-4 text-xs">
        <div class="p-4 sm:p-5 bg-[#FDF3E0]/40 rounded-lg border border-[#F2E3C6]/60 relative overflow-hidden">
          <div class="text-center pb-3 border-b border-[#F2E3C6]/60 space-y-1">
            <div class="text-xs font-bold tracking-widest text-[#1F3326]">
              {{ $t('uploader.previewAuthority') }}
            </div>
            <div class="text-sm font-bold text-[#2A5440] pt-1">
              {{ title }}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 text-xs">
            <div>
              <span class="text-[#8A9A8F] block text-[11px]">{{ $t('uploader.issuer') }}</span>
              <span class="font-bold text-[#1F3326]">{{ issuerText }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block text-[11px]">{{ $t('uploader.refNoLabel') }}</span>
              <span class="font-mono font-bold text-[#1F3326]" dir="ltr">{{ displayedFile.referenceNo }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block text-[11px]">{{ $t('uploader.verifiedAtLabel') }}</span>
              <span class="font-mono text-[#1F3326]">2026-03-12 10:30:00</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block text-[11px]">{{ $t('uploader.statusLabel') }}</span>
              <span class="text-[#2F7A50] font-bold">{{ $t('uploader.verifiedBadge') }}</span>
            </div>
          </div>

          <div class="mt-4 p-3 bg-white/90 rounded-lg border border-[#F2E3C6]/80 text-[11px] text-[#43554B]">
            <span class="font-bold text-[#1B3123]">{{ $t('uploader.antiCounterfeit') }}</span>
            {{ displayedFile.ocrSummary }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleDownloadStub">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import {
  Document,
  ZoomIn,
  UploadFilled,
  RefreshRight,
  DeleteFilled,
  DocumentCopy,
  InfoFilled,
  Close
} from '@element-plus/icons-vue';

const { t } = useI18n();
const showSubtitle = ref(false);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  showRequirementBadge: {
    type: Boolean,
    default: true
  },
  categoryBadge: {
    type: String,
    default: ''
  },
  issuer: {
    type: String,
    default: ''
  },
  defaultFileName: {
    type: String,
    default: ''
  },
  defaultRefNo: {
    type: String,
    default: 'DOC-2026-90182'
  },
  ocrSummary: {
    type: String,
    default: ''
  }
});

// 默认值展示文案按当前语言动态生成
const issuerText = computed(() => props.issuer || t('uploader.defaultIssuer'));
const defaultFileLabel = computed(() => props.defaultFileName || t('uploader.defaultFileName'));
const ocrSummaryText = computed(() => props.ocrSummary || t('uploader.defaultOcrSummary'));

function buildTemplateFile() {
  return {
    isTemplate: true,
    fileName: defaultFileLabel.value,
    fileSize: '2.8 MB',
    referenceNo: props.defaultRefNo,
    ocrSummary: ocrSummaryText.value
  };
}

const emit = defineEmits(['update:modelValue', 'change']);

const fileInputRef = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadStage = ref('');
const previewModalVisible = ref(false);

const currentFile = ref(props.modelValue ? buildTemplateFile() : null);
// Translate generated samples and OCR labels on demand; retain user-selected filenames.
const displayedFile = computed(() => {
  if (!currentFile.value) return null;
  if (currentFile.value.isTemplate) return buildTemplateFile();
  return { ...currentFile.value, ocrSummary: t('uploader.localOcrSummary', { name: currentFile.value.fileName }) };
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !currentFile.value) {
      currentFile.value = buildTemplateFile();
    } else if (!newVal && currentFile.value) {
      currentFile.value = null;
    }
  }
);

function triggerOpenLocalFile() {
  fileInputRef.value?.click();
}

function handleLocalFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  uploadProgress.value = 20;
  uploadStage.value = t('uploader.readingLocal', { name: file.name });

  const interval = setInterval(() => {
    uploadProgress.value += 30;
    if (uploadProgress.value >= 90) {
      clearInterval(interval);
      uploadStage.value = t('uploader.ocrPassed');
      setTimeout(() => {
        const fileObj = {
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          referenceNo: props.defaultRefNo || `DOC-${Date.now().toString().slice(-6)}`,
          ocrSummary: t('uploader.localOcrSummary', { name: file.name })
        };
        currentFile.value = fileObj;
        isUploading.value = false;
        emit('update:modelValue', true);
        emit('change', true, fileObj);
        ElMessage.success(t('uploader.uploadSuccess', { name: file.name }));
      }, 300);
    }
  }, 100);

  e.target.value = '';
}

function triggerReloadTemplate() {
  isUploading.value = true;
  uploadProgress.value = 30;
  uploadStage.value = t('uploader.loadingTemplate');

  setTimeout(() => {
    uploadProgress.value = 100;
    uploadStage.value = t('uploader.loadedDone');
    setTimeout(() => {
      const fileObj = buildTemplateFile();
      currentFile.value = fileObj;
      isUploading.value = false;
      emit('update:modelValue', true);
      emit('change', true, fileObj);
      ElMessage.success(t('uploader.templateLoaded', { name: defaultFileLabel.value }));
    }, 200);
  }, 400);
}

function handleRemoveFile() {
  currentFile.value = null;
  emit('update:modelValue', false);
  emit('change', false, null);
  ElMessage.warning(t('uploader.attachmentDeleted'));
}

function handleDownloadStub() {
  ElMessage.success(t('uploader.stubExported'));
  previewModalVisible.value = false;
}
</script>

<style scoped>
.document-uploader {
  font-family: inherit;
}
</style>
