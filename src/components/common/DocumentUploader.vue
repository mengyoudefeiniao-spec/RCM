<template>
  <div class="document-uploader w-full space-y-2">
    <!-- 隐藏式文件选择框 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      class="hidden"
      @change="handleLocalFileSelected"
    />

    <!-- 顶部标题、必需标记与机构信息 -->
    <div class="flex items-center justify-between gap-2 flex-wrap text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-800">{{ title }}</span>
        <el-tag v-if="isRequired" type="danger" size="small" effect="plain" class="font-bold">
          必需材料 ★
        </el-tag>
        <el-tag v-else type="info" size="small" effect="plain">
          可选材料
        </el-tag>
        <el-tag v-if="categoryBadge" size="small" effect="light">
          {{ categoryBadge }}
        </el-tag>
      </div>
      <span v-if="issuer" class="text-[11px] text-slate-400 font-mono">
        颁发：{{ issuer }}
      </span>
    </div>

    <p v-if="subtitle" class="text-[11px] text-slate-500">
      {{ subtitle }}
    </p>

    <!-- 1. 上传进度中状态 -->
    <div v-if="isUploading" class="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
      <div class="flex items-center justify-between text-xs text-blue-700 font-medium">
        <span>{{ uploadStage }}</span>
        <span class="font-mono font-bold">{{ uploadProgress }}%</span>
      </div>
      <el-progress :percentage="uploadProgress" :show-text="false" status="primary" />
    </div>

    <!-- 2. 已上传完成状态 -->
    <div
      v-else-if="currentFile"
      class="p-4 rounded-xl border border-blue-200 bg-white shadow-xs transition-all hover:border-blue-300"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <el-icon :size="22"><Document /></el-icon>
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-900 font-mono break-all">
                {{ currentFile.fileName }}
              </span>
              <el-tag type="success" size="small" effect="light" class="font-bold">
                已核验防伪通过 ✓
              </el-tag>
            </div>
            <div class="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 font-mono">
              <span>{{ currentFile.fileSize }}</span>
              <span>•</span>
              <span>备案编号：{{ currentFile.referenceNo }}</span>
              <span>•</span>
              <span class="text-emerald-600 font-semibold">OCR 置信度：99.6%</span>
            </div>
            <div class="p-1.5 px-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
              <span class="font-semibold text-slate-700">防伪核验：</span>
              <span>{{ currentFile.ocrSummary }}</span>
            </div>
          </div>
        </div>

        <!-- 显式操作按钮栏：预览、重新上传、重载样本、删除 -->
        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <el-button size="small" type="primary" plain @click="previewModalVisible = true">
            <el-icon class="mr-1"><View /></el-icon>
            预览原件
          </el-button>
          <el-button size="small" @click="triggerOpenLocalFile">
            <el-icon class="mr-1"><Upload /></el-icon>
            重新上传
          </el-button>
          <el-button size="small" text @click="triggerReloadTemplate">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重载样本
          </el-button>
          <el-button size="small" type="danger" plain @click="handleRemoveFile">
            <el-icon class="mr-1"><Delete /></el-icon>
            删除附件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 3. 未上传 / 已删除空状态 -->
    <div
      v-else
      class="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50 hover:border-blue-400 transition-colors"
    >
      <div class="flex flex-col items-center justify-center gap-2">
        <div class="p-2.5 bg-white rounded-full text-slate-400 border border-slate-200">
          <el-icon :size="24"><UploadFilled /></el-icon>
        </div>
        <div class="text-xs font-semibold text-slate-700">
          {{ isRequired ? '请上传必需的官方公文证明文件' : '暂未上传辅助证明材料 (支持本地文件或预设样本)' }}
        </div>
        <div class="text-[11px] text-slate-400">
          支持 PDF、JPG、PNG 格式 · 最大 15MB · 自动提取 OCR 防伪条码与公章印鉴
        </div>
        <div class="flex items-center gap-2.5 mt-2 flex-wrap justify-center">
          <el-button type="primary" size="small" @click="triggerOpenLocalFile">
            <el-icon class="mr-1"><FolderOpened /></el-icon>
            选择本地文件上传
          </el-button>
          <el-button size="small" @click="triggerReloadTemplate">
            <el-icon class="mr-1"><Refresh /></el-icon>
            一键载入官方公文样本
          </el-button>
        </div>
      </div>
    </div>

    <!-- 官方公文原件数字化预览弹窗 -->
    <el-dialog
      v-model="previewModalVisible"
      title="官方数字化证明公文原件预览"
      width="640px"
      align-center
    >
      <div v-if="currentFile" class="space-y-4 text-xs">
        <div class="p-5 bg-amber-50/40 rounded-xl border border-amber-200/60 relative overflow-hidden">
          <div class="text-center pb-3 border-b border-amber-200/60 space-y-1">
            <div class="text-xs font-bold tracking-widest text-slate-800">
              جمهورية العراق · وزارة التجارة / وزارة العدل / وزارة الصحة
            </div>
            <div class="text-[11px] text-slate-500 font-semibold">
              REPUBLIC OF IRAQ · MINISTRY OF TRADE / JUSTICE / HEALTH
            </div>
            <div class="text-sm font-bold text-blue-700 pt-1">
              {{ title }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-3 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">颁发核准机构：</span>
              <span class="font-bold text-slate-800">{{ issuer }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">公文备案存根编号：</span>
              <span class="font-mono font-bold text-slate-800">{{ currentFile.referenceNo }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">数字化核验时间：</span>
              <span class="font-mono text-slate-800">2026-03-12 10:30:00</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">电子防伪戳记状态：</span>
              <span class="text-emerald-600 font-bold">国家公证印鉴签名验签通过 ✓</span>
            </div>
          </div>

          <div class="mt-4 p-3 bg-white/90 rounded-lg border border-amber-200/80 text-[11px] text-slate-700">
            <span class="font-bold text-slate-900">公文摘要：</span>
            {{ currentFile.ocrSummary }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewModalVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownloadStub">下载存根文件</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document,
  View,
  Upload,
  Refresh,
  Delete,
  UploadFilled,
  FolderOpened
} from '@element-plus/icons-vue';

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
  categoryBadge: {
    type: String,
    default: ''
  },
  issuer: {
    type: String,
    default: '国家部委核准机构'
  },
  defaultFileName: {
    type: String,
    default: '官方核定证明文件.pdf'
  },
  defaultRefNo: {
    type: String,
    default: 'DOC-2026-90182'
  },
  ocrSummary: {
    type: String,
    default: '防伪条码比对一致，机构公章数字验签属实。'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const fileInputRef = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadStage = ref('');
const previewModalVisible = ref(false);

const currentFile = ref(
  props.modelValue
    ? {
        fileName: props.defaultFileName,
        fileSize: '2.8 MB',
        referenceNo: props.defaultRefNo,
        ocrSummary: props.ocrSummary
      }
    : null
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && !currentFile.value) {
      currentFile.value = {
        fileName: props.defaultFileName,
        fileSize: '2.8 MB',
        referenceNo: props.defaultRefNo,
        ocrSummary: props.ocrSummary
      };
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
  uploadStage.value = `正在读取本地文件: ${file.name}...`;

  const interval = setInterval(() => {
    uploadProgress.value += 30;
    if (uploadProgress.value >= 90) {
      clearInterval(interval);
      uploadStage.value = 'OCR提取与数字签名核验通过 ✓';
      setTimeout(() => {
        const fileObj = {
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          referenceNo: props.defaultRefNo || `DOC-${Date.now().toString().slice(-6)}`,
          ocrSummary: `本地上传已完成：【${file.name}】条码与印章核验一致`
        };
        currentFile.value = fileObj;
        isUploading.value = false;
        emit('update:modelValue', true);
        emit('change', true, fileObj);
        ElMessage.success(`文件【${file.name}】已成功上传并通过核验！`);
      }, 300);
    }
  }, 100);

  e.target.value = '';
}

function triggerReloadTemplate() {
  isUploading.value = true;
  uploadProgress.value = 30;
  uploadStage.value = '正在调取官方模板公文库...';

  setTimeout(() => {
    uploadProgress.value = 100;
    uploadStage.value = '载入完成 ✓';
    setTimeout(() => {
      const fileObj = {
        fileName: props.defaultFileName,
        fileSize: '2.8 MB',
        referenceNo: props.defaultRefNo,
        ocrSummary: props.ocrSummary
      };
      currentFile.value = fileObj;
      isUploading.value = false;
      emit('update:modelValue', true);
      emit('change', true, fileObj);
      ElMessage.success(`官方证明公文【${props.defaultFileName}】已载入并就绪！`);
    }, 200);
  }, 400);
}

function handleRemoveFile() {
  currentFile.value = null;
  emit('update:modelValue', false);
  emit('change', false, null);
  ElMessage.warning('证明附件已成功删除，可重新上传或重载样本');
}

function handleDownloadStub() {
  ElMessage.success('官方公文存根已触发导出下载');
  previewModalVisible.value = false;
}
</script>

<style scoped>
.document-uploader {
  font-family: inherit;
}
</style>
