<template>
  <el-dialog
    v-model="visible"
    title="生物人脸识别与统一国民卡双因子核验"
    width="720px"
    align-center
    :before-close="handleClose"
  >
    <div class="space-y-5">
      <!-- 官方安全提示 -->
      <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between text-xs text-blue-800">
        <div class="flex items-center gap-2">
          <el-icon :size="16" class="text-blue-600"><Lock /></el-icon>
          <span>核验受访人员：<strong class="text-slate-900">{{ userName }}</strong> (配给卡号: {{ userCardNo || '待绑定' }})</span>
        </div>
        <el-tag size="small" type="primary" effect="plain" class="font-mono">NID-CHIP · ICAO-9303</el-tag>
      </div>

      <!-- 三要素采集卡片网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- 1. 现场活体人脸 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">① 现场活体人脸</span>
            <el-icon v-if="faceCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">调用高清摄像终端，采集活体微表情与瞳孔反光。</p>

          <!-- 模拟取景器画面 -->
          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center relative">
            <div v-if="faceCaptured" class="w-full h-full relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                alt="Face Preview"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-1 right-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                PASS: 99.8%
              </div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><Camera /></el-icon>
              <div>待采像</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="faceCaptured = !faceCaptured">
            {{ faceCaptured ? '重新拍摄人脸' : '拍摄活体人脸' }}
          </el-button>
        </div>

        <!-- 2. 统一国民卡正面 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">② 国民卡正面</span>
            <el-icon v-if="cardFrontCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">光学核验卡面防伪暗纹、姓名存根与证件头像。</p>

          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardFrontCaptured" class="w-full h-full flex flex-col justify-between text-[9px] font-mono text-slate-300">
              <div class="flex justify-between border-b border-slate-800 pb-0.5 text-emerald-400 font-bold">
                <span>REPUBLIC OF IRAQ</span>
                <span>NID-FRONT</span>
              </div>
              <div>
                <div class="text-white font-bold">{{ userName }}</div>
                <div class="text-[8px] text-slate-400">NID: 198004198271</div>
              </div>
              <div class="text-[8px] text-slate-500">内政部国籍与民事总局</div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><Postcard /></el-icon>
              <div>待扫描正面</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="cardFrontCaptured = !cardFrontCaptured">
            {{ cardFrontCaptured ? '重新扫描正面' : '扫描国民卡正面' }}
          </el-button>
        </div>

        <!-- 3. 统一国民卡背面芯片 -->
        <div class="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col justify-between border border-slate-800 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-400">③ 实体卡背面芯片</span>
            <el-icon v-if="cardBackCaptured" class="text-emerald-400"><CircleCheckFilled /></el-icon>
          </div>
          <p class="text-[11px] text-slate-400">读取 ICAO-9303 机读码与非接触式加密芯片序列。</p>

          <div class="aspect-4/3 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center p-2 relative">
            <div v-if="cardBackCaptured" class="w-full h-full flex flex-col justify-between text-[8px] font-mono text-slate-400">
              <div class="flex justify-between border-b border-slate-800 pb-0.5 text-amber-400">
                <span>CHIP: NFC-9941</span>
                <span>ICAO-9303</span>
              </div>
              <div class="bg-slate-900 p-1 rounded leading-none text-slate-300">
                <div>I&lt;IRQ198004198271&lt;&lt;&lt;&lt;&lt;&lt;</div>
                <div>8004194M3110298IRQ&lt;&lt;&lt;&lt;9</div>
              </div>
              <div class="text-emerald-400 font-bold">CHIP INTEGRITY: OK</div>
            </div>
            <div v-else class="text-center text-slate-500 text-[11px] space-y-1">
              <el-icon :size="24"><CreditCard /></el-icon>
              <div>待感应芯片</div>
            </div>
          </div>

          <el-button size="small" type="primary" plain class="w-full" @click="cardBackCaptured = !cardBackCaptured">
            {{ cardBackCaptured ? '重新感应芯片' : '感应卡片背面芯片' }}
          </el-button>
        </div>
      </div>

      <!-- 对碰核验结果展示栏 -->
      <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
        <div v-if="verifying" class="flex items-center gap-2 text-indigo-400">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在将活体特征向量与内政部公民身份数据库进行安全专线对碰比对...</span>
        </div>
        <div v-else-if="verificationPassed" class="space-y-2">
          <div class="flex items-center gap-2 text-emerald-400 font-bold">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>双因子生物特征比对全要素通过！已建立终端授信存根。</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2 font-mono">
            <div>特征比对度: <strong class="text-white">99.4%</strong></div>
            <div>芯片防伪: <strong class="text-white">通过 (Valid)</strong></div>
            <div>内政部底账: <strong class="text-white">一致吻合</strong></div>
            <div>终端授信: <strong class="text-emerald-400">已绑定存根</strong></div>
          </div>
        </div>
        <div v-else class="flex items-center justify-between text-slate-400">
          <span>请完成人脸拍摄与国民卡正反面采集，系统将自动进行身份核验。</span>
          <el-button type="success" text size="small" @click="handleQuickCollectAll">
            一键全要素快速模拟填充
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!allCaptured"
          :loading="verifying"
          @click="handleExecuteVerify"
        >
          确认核验并放行进入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { verifyBiometricFace } from '../../api/auth.js';
import { ElMessage } from 'element-plus';
import {
  Lock,
  Camera,
  Postcard,
  CreditCard,
  CircleCheckFilled,
  Loading
} from '@element-plus/icons-vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userName: { type: String, default: '艾哈迈德·哈桑·萨利赫' },
  userCardNo: { type: String, default: 'RC-10029381' }
});

const emit = defineEmits(['update:modelValue', 'success']);

const visible = ref(props.modelValue);
watch(() => props.modelValue, (val) => { visible.value = val; });

const faceCaptured = ref(false);
const cardFrontCaptured = ref(false);
const cardBackCaptured = ref(false);
const verifying = ref(false);
const verificationPassed = ref(false);

const allCaptured = computed(() => faceCaptured.value && cardFrontCaptured.value && cardBackCaptured.value);

function handleQuickCollectAll() {
  faceCaptured.value = true;
  cardFrontCaptured.value = true;
  cardBackCaptured.value = true;
  ElMessage.success('已一键模拟完成人脸自拍与国民卡正反面要素采集');
}

async function handleExecuteVerify() {
  verifying.value = true;
  try {
    const res = await verifyBiometricFace({
      userName: props.userName,
      cardNo: props.userCardNo
    });
    verificationPassed.value = true;
    ElMessage.success('生物识别与国民卡对碰核验通过！');
    setTimeout(() => {
      visible.value = false;
      emit('update:modelValue', false);
      emit('success', res);
    }, 800);
  } catch (e) {
    ElMessage.error('生物核验失败，请重试');
  } finally {
    verifying.value = false;
  }
}

function handleClose() {
  visible.value = false;
  emit('update:modelValue', false);
}
</script>
