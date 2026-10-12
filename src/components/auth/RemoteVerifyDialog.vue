<template>
  <el-dialog
    v-model="visible"
    title="异地家庭成员远程身份与地理位置核查"
    width="740px"
    align-center
    :before-close="handleClose"
  >
    <div class="space-y-4">
      <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <el-icon :size="16" class="text-amber-600"><Location /></el-icon>
          <span>依据配给条例，家庭成员异地工作求学时，需通过远程终端 GPS 基站完成异地居住真实性核查。</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 左侧：户主端邀请码与分享链接 -->
        <div class="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
          <div class="border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-emerald-400">户主端 · 异地核验授权码</span>
            <p class="text-[11px] text-slate-400 mt-0.5">将此 6 位核验码发送给异地居住的家庭成员。</p>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">动态授权码 (有效期 15 分钟)</label>
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xl font-bold text-center tracking-widest text-emerald-400">
              {{ inviteCode }}
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-[11px] text-slate-400">异地核验移动端直连链接</label>
            <div class="p-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[10px] text-slate-400 break-all">
              https://rcm.trade.gov.iq/verify-remote?code={{ inviteCode }}
            </div>
          </div>

          <el-button type="primary" plain class="w-full" size="small" @click="handleCopyLink">
            <el-icon class="mr-1"><CopyDocument /></el-icon>
            复制邀请码及短信内容
          </el-button>
        </div>

        <!-- 右侧：异地成员手机端模拟核查面板 -->
        <div class="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3">
          <div class="border-b border-slate-800 pb-2 flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-blue-400">异地成员手机端模拟器</span>
              <p class="text-[11px] text-slate-400 mt-0.5">模拟异地成员在手机端填写并上传位置。</p>
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
              ① 异地相符 (通过)
            </button>
            <button
              type="button"
              class="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded cursor-pointer hover:bg-rose-500/20"
              @click="fillQuickWrongName"
            >
              ② 姓名不符 (拒绝)
            </button>
            <button
              type="button"
              class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded cursor-pointer hover:bg-amber-500/20"
              @click="fillQuickSameLocation"
            >
              ③ 同一住址 (拒绝)
            </button>
          </div>

          <el-form label-position="top" class="text-xs space-y-2">
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">输入的 6 位邀请码</label>
              <el-input v-model="form.code" placeholder="6 位邀请码" size="small" maxlength="6" class="font-mono" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">成员完整姓名</label>
              <el-input v-model="form.name" placeholder="请输入成员姓名" size="small" />
            </div>
            <div>
              <label class="block text-[11px] text-slate-300 mb-1">GPS 与基站定位位置</label>
              <el-select v-model="form.location" size="small" class="w-full">
                <el-option label="与家庭同一住址 (非异地)" value="same" />
                <el-option label="埃尔比勒省 (异地求学)" value="埃尔比勒省 (Ainkawa)" />
                <el-option label="巴士拉省 (异地港口工作)" value="巴士拉省 (Al-Faw)" />
                <el-option label="摩苏尔省 (异地驻防)" value="摩苏尔省 (Nineveh)" />
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
            确认提交异地核验
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { verifyRemoteMember } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import { Location, CopyDocument, Cellphone } from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultMemberName: { type: String, default: '扎伊德·艾哈迈德·萨利赫' }
});

const emit = defineEmits(['update:modelValue', 'success']);

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => { visible.value = val; });

const inviteCode = ref('839201');
const submitting = ref(false);

const form = reactive({
  code: '839201',
  name: props.defaultMemberName,
  location: '埃尔比勒省 (Ainkawa)'
});

function handleCopyLink() {
  navigator.clipboard?.writeText(`【伊拉克配给总署】您的家庭户主邀请您进行异地成员配给核验，验证码为【${inviteCode.value}】，有效时间15分钟。`);
  ElMessage.success('已复制异地核验短信与邀请码到剪贴板！');
}

function fillQuickValid() {
  form.code = inviteCode.value;
  form.name = props.defaultMemberName;
  form.location = '埃尔比勒省 (Ainkawa)';
  ElMessage.info('已填入：正常异地且姓名相符');
}

function fillQuickWrongName() {
  form.code = inviteCode.value;
  form.name = '无此成员名字';
  form.location = '埃尔比勒省 (Ainkawa)';
  ElMessage.warning('已填入：测试姓名不符');
}

function fillQuickSameLocation() {
  form.code = inviteCode.value;
  form.name = props.defaultMemberName;
  form.location = 'same';
  ElMessage.warning('已填入：测试与家庭处于同一位置');
}

async function handleSubmitRemote() {
  if (!form.code || !form.name) {
    ElMessage.warning('请填写邀请码与成员姓名');
    return;
  }
  submitting.value = true;
  try {
    const res = await verifyRemoteMember({
      inviteCode: form.code,
      memberName: form.name,
      location: form.location
    });
    ElMessage.success(res.message || '异地家庭成员核查通过！');
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
