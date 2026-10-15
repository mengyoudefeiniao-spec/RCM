<template>
  <el-dialog
    v-model="visible"
    :title="$t('register.remote.title')"
    :width="dialogWidth"
    align-center
    :class="{ 'rcm-compact-dialog': isCompact }"
    :before-close="handleClose"
  >
    <div class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon :size="16" class="text-amber-600"><Location /></el-icon>
          <span>{{ $t('register.remote.bannerText') }}</span>
        </div>
      </div>

      <div :class="isCompact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'">
        <!-- 左侧：户主端邀请码与分享链接 -->
        <div class="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
          <div class="border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-emerald-400">{{ $t('register.remote.hostPanelTitle') }}</span>
            <p class="text-[11px] text-slate-400 mt-0.5">{{ $t('register.remote.hostPanelDesc') }}</p>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">{{ $t('register.remote.authCodeLabel') }}</label>
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xl font-bold text-center tracking-widest text-emerald-400">
              {{ inviteCode }}
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">{{ $t('register.remote.linkLabel') }}</label>
            <div class="p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[10px] text-slate-400 break-all">
              https://rcm.trade.gov.iq/verify-remote?code={{ inviteCode }}
            </div>
          </div>

          <el-button type="primary" plain class="w-full" size="small" @click="handleCopyLink">
            <el-icon class="mr-1"><CopyDocument /></el-icon>
            {{ $t('register.remote.copyBtn') }}
          </el-button>
        </div>

        <!-- 右侧：异地成员手机端模拟核查面板 -->
        <div class="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
          <div class="border-b border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-blue-400">{{ $t('register.remote.memberPanelTitle') }}</span>
              <p class="text-[11px] text-slate-400 mt-0.5">{{ $t('register.remote.memberPanelDesc') }}</p>
            </div>
            <el-icon class="text-slate-400"><Cellphone /></el-icon>
          </div>

          <!-- 快捷规则测试按钮 -->
          <div class="flex flex-wrap gap-1.5 text-[10px]">
            <button
              type="button"
              class="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded cursor-pointer hover:bg-emerald-500/20"
              @click="fillQuickValid"
            >
              {{ $t('register.remote.quickValid') }}
            </button>
            <button
              type="button"
              class="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded cursor-pointer hover:bg-rose-500/20"
              @click="fillQuickWrongName"
            >
              {{ $t('register.remote.quickWrongName') }}
            </button>
            <button
              type="button"
              class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded cursor-pointer hover:bg-amber-500/20"
              @click="fillQuickSameLocation"
            >
              {{ $t('register.remote.quickSameLocation') }}
            </button>
          </div>

          <el-form label-position="top" class="text-xs space-y-2">
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">{{ $t('register.remote.inputCodeLabel') }}</label>
              <el-input v-model="form.code" :placeholder="$t('register.remote.codePlaceholder')" size="small" maxlength="6" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">{{ $t('register.remote.memberNameLabel') }}</label>
              <el-input v-model="form.name" :placeholder="$t('register.remote.namePlaceholder')" size="small" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">{{ $t('register.remote.gpsLabel') }}</label>
              <el-select v-model="form.location" size="small" class="w-full">
                <el-option :label="$t('register.remote.optSame')" value="same" />
                <el-option :label="$t('register.remote.optErbil')" value="erbil" />
                <el-option :label="$t('register.remote.optBasra')" value="basra" />
                <el-option :label="$t('register.remote.optMosul')" value="mosul" />
              </el-select>
            </div>
          </el-form>

          <el-button
            type="success"
            class="w-full font-bold"
            size="small"
            :loading="submitting"
            @click="handleSubmitRemote"
          >
            {{ $t('register.remote.submitBtn') }}
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ $t('common.close') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { verifyRemoteMember } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import { Location, CopyDocument, Cellphone } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultMemberName: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue', 'success']);

const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(740);

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => { visible.value = val; });

const inviteCode = ref('839201');
const submitting = ref(false);

// 定位选项值与多语言标签的映射（提交时随请求携带标签供接口消息使用）
const locationLabelMap = computed(() => ({
  same: t('register.remote.optSame'),
  erbil: t('register.remote.optErbil'),
  basra: t('register.remote.optBasra'),
  mosul: t('register.remote.optMosul')
}));

const form = reactive({
  code: '839201',
  name: props.defaultMemberName || t('register.defaultMemberName'),
  location: 'erbil'
});

function handleCopyLink() {
  navigator.clipboard?.writeText(t('register.remote.copySmsTemplate', { code: inviteCode.value }));
  ElMessage.success(t('register.remote.msgCopyDone'));
}

function fillQuickValid() {
  form.code = inviteCode.value;
  form.name = props.defaultMemberName || t('register.defaultMemberName');
  form.location = 'erbil';
  ElMessage.info(t('register.remote.msgFillValid'));
}

function fillQuickWrongName() {
  form.code = inviteCode.value;
  form.name = t('register.remote.wrongNameSample');
  form.location = 'erbil';
  ElMessage.warning(t('register.remote.msgFillWrongName'));
}

function fillQuickSameLocation() {
  form.code = inviteCode.value;
  form.name = props.defaultMemberName || t('register.defaultMemberName');
  form.location = 'same';
  ElMessage.warning(t('register.remote.msgFillSame'));
}

async function handleSubmitRemote() {
  if (!form.code || !form.name) {
    ElMessage.warning(t('register.remote.msgFormIncomplete'));
    return;
  }
  submitting.value = true;
  try {
    const res = await verifyRemoteMember({
      inviteCode: form.code,
      memberName: form.name,
      location: form.location,
      locationLabel: locationLabelMap.value[form.location] || form.location
    });
    ElMessage.success(res.message || t('register.remote.msgSuccessFallback'));
    setTimeout(() => {
      visible.value = false;
      emit('update:modelValue', false);
      emit('success', res);
    }, 600);
  } catch (err) {
    // error message is shown by response interceptor
  } finally {
    submitting.value = false;
  }
}

function handleClose() {
  visible.value = false;
  emit('update:modelValue', false);
}
</script>
