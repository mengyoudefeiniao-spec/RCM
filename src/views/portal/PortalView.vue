<template>
  <div class="portal-view w-full min-h-screen bg-[#F8FBF8] flex flex-col font-sans text-[#1F3326]">
    <!-- 主体内容容器：自适应桌面宽屏与移动端 Google Pixel 9 (412x924px) 视口 -->
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-between">
      
      <!-- ======================================================== -->
      <!-- 0. 顶栏操作区：国际化语言切换 + 全流程演示按钮 -->
      <!-- ======================================================== -->
      <div class="flex items-center justify-end w-full gap-2.5">
        <!-- 全流程演示按钮 -->
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 shadow-2xs border bg-white text-[#326445] border-[#D9E5DB] hover:bg-[#326445] hover:text-white hover:border-[#326445] hover:shadow-md cursor-pointer group"
          @click="showFlowDemoDialog = true"
        >
          <el-icon :size="15" class="text-[#D3AF62] group-hover:text-[#E5CEA1] transition-colors">
            <VideoPlay />
          </el-icon>
          <span>{{ $t('portal.flowDemo.btnText') }}</span>
        </button>

        <LanguageSwitcher />
      </div>

      <!-- ======================================================== -->
      <!-- 1. 顶部 Header Banner：中东高端政务现代建筑背景大图 + 上层文字浮层 -->
      <!-- ======================================================== -->
      <div
        class="portal-hero relative overflow-hidden rounded-lg border border-[#D9E5DB] shadow-xs flex items-center justify-end min-h-[160px] sm:min-h-[195px] md:min-h-[220px]"
        style="box-shadow: 0 6px 24px -2px rgba(47, 68, 52, 0.05);"
      >
        <!-- 背景图图层：真实截图处理后的无字背景大图 -->
        <img
          src="/images/dashboard-banner.png"
          alt="National Ration Card System Background"
          class="absolute inset-0 w-full h-full object-cover object-left md:object-center select-none pointer-events-none"
          loading="eager"
        />

        <!-- 柔和微弱渐变保护层：确保在不同屏幕分辨率与多语言下文字图层均清晰易读 -->
        <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#F3F8F4]/30 to-[#F3F8F4]/85 pointer-events-none"></div>

        <!-- 文字内容图层：位于图片图层上方 (relative z-10)，支持独立排版与交互 -->
        <div class="relative z-10 w-full md:w-3/5 lg:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-center items-start md:items-end text-left md:text-right">
          <!-- 金色微标 -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF3E0]/95 backdrop-blur-xs border border-[#E5CEA1] text-[#B8934A] text-xs font-semibold mb-2.5 shadow-2xs">
            <span class="font-sans font-bold">{{ $t('portal.serviceTag') }}</span>
            <el-icon :size="13" class="text-[#B8934A]"><Check /></el-icon>
          </div>

          <!-- 主标题 -->
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#326445] tracking-tight leading-snug">
              {{ $t('portal.mainTitle') }}
            </h1>
          </div>

          <!-- 标语 -->
          <p class="text-xs sm:text-sm text-[#58685D] mt-2 font-medium max-w-lg leading-relaxed">
            {{ $t('portal.slogan') }}
          </p>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 2. 核心终端卡片矩阵 (3 大模块，纯净统一国际化词条) -->
      <!-- 桌面端 3 列网格，移动端 Google Pixel 9 单列沉浸式自适应 -->
      <!-- ======================================================== -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        <!-- ======================================================== -->
        <!-- 卡片 1: 公民端服务 APP -->
        <!-- ======================================================== -->
        <div
          class="portal-card group relative bg-white rounded-lg p-5 sm:p-6 border border-[#D9E5DB] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D3AF62]/60"
          style="box-shadow: 0 4px 20px -2px rgba(47, 68, 52, 0.04);"
          @click="openTerminal('citizen')"
        >
          <!-- 卡片顶栏：左侧平台标识，右侧浅金方圆图标容器 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E9F1EB] text-[#8A9A8F] border border-[#D9E5DB]">
              {{ $t('portal.citizenApp.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (38px x 38px) -->
            <div class="w-10 h-10 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] flex items-center justify-center text-[#D3AF62] group-hover:scale-105 group-hover:bg-[#D3AF62] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><Cellphone /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#1F3326] group-hover:text-[#326445] transition-colors">
              {{ $t('portal.citizenApp.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8A9A8F] pt-0.5 leading-relaxed">
              {{ $t('portal.citizenApp.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#58685D] leading-relaxed">
              {{ $t('portal.citizenApp.desc') }}
            </p>
          </div>

          <!-- 卡片底栏：进入按钮与方向箭头 (在新标签页打开) -->
          <div class="pt-4 border-t border-[#E9F1EB] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#326445] group-hover:text-[#D3AF62] transition-colors">
              <span>{{ $t('portal.citizenApp.btn') }}</span>
              <el-icon class="transform transition-transform duration-300" :class="isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'">
                <component :is="isRtl ? Back : Right" />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 卡片 2: 代理网点现场核销 APP -->
        <!-- ======================================================== -->
        <div
          class="portal-card group relative bg-white rounded-lg p-5 sm:p-6 border border-[#D9E5DB] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D3AF62]/60"
          style="box-shadow: 0 4px 20px -2px rgba(47, 68, 52, 0.04);"
          @click="openTerminal('agent')"
        >
          <!-- 卡片顶栏 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E9F1EB] text-[#8A9A8F] border border-[#D9E5DB]">
              {{ $t('portal.agentApp.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (扫码核销) -->
            <div class="w-10 h-10 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] flex items-center justify-center text-[#D3AF62] group-hover:scale-105 group-hover:bg-[#D3AF62] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><FullScreen /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#1F3326] group-hover:text-[#326445] transition-colors">
              {{ $t('portal.agentApp.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8A9A8F] pt-0.5 leading-relaxed">
              {{ $t('portal.agentApp.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#58685D] leading-relaxed">
              {{ $t('portal.agentApp.desc') }}
            </p>
          </div>

          <!-- 卡片底栏 -->
          <div class="pt-4 border-t border-[#E9F1EB] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#326445] group-hover:text-[#D3AF62] transition-colors">
              <span>{{ $t('portal.agentApp.btn') }}</span>
              <el-icon class="transform transition-transform duration-300" :class="isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'">
                <component :is="isRtl ? Back : Right" />
              </el-icon>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 卡片 3: 国家宏观管理控制台 Web -->
        <!-- ======================================================== -->
        <div
          class="portal-card group relative bg-white rounded-lg p-5 sm:p-6 border border-[#D9E5DB] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D3AF62]/60"
          style="box-shadow: 0 4px 20px -2px rgba(47, 68, 52, 0.04);"
          @click="openTerminal('admin')"
        >
          <!-- 卡片顶栏 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E9F1EB] text-[#8A9A8F] border border-[#D9E5DB]">
              {{ $t('portal.adminWeb.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (大盘控制台) -->
            <div class="w-10 h-10 rounded-lg bg-[#FDF3E0] border border-[#E5CEA1] flex items-center justify-center text-[#D3AF62] group-hover:scale-105 group-hover:bg-[#D3AF62] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><DataAnalysis /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#1F3326] group-hover:text-[#326445] transition-colors">
              {{ $t('portal.adminWeb.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8A9A8F] pt-0.5 leading-relaxed">
              {{ $t('portal.adminWeb.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#58685D] leading-relaxed">
              {{ $t('portal.adminWeb.desc') }}
            </p>
          </div>

          <!-- 卡片底栏 -->
          <div class="pt-4 border-t border-[#E9F1EB] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#326445] group-hover:text-[#D3AF62] transition-colors">
              <span>{{ $t('portal.adminWeb.btn') }}</span>
              <el-icon class="transform transition-transform duration-300" :class="isRtl ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'">
                <component :is="isRtl ? Back : Right" />
              </el-icon>
            </div>
          </div>
        </div>

      </div>

      <!-- ======================================================== -->
      <!-- 3. 底部协同部委信息栏 (完全纯净接入国际化) -->
      <!-- ======================================================== -->
      <footer class="pt-4 sm:pt-8 pb-3 text-center">
        <div class="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-[#8A9A8F] px-4 py-2.5 rounded-full bg-white/70 border border-[#D9E5DB] shadow-2xs">
          <!-- 金色建筑小图标 -->
          <el-icon :size="15" class="text-[#D3AF62] shrink-0"><OfficeBuilding /></el-icon>
          <span class="font-bold text-[#326445]">{{ $t('portal.footer.agenciesLabel') }}</span>
          <span>{{ $t('portal.footer.agenciesList') }}</span>
        </div>
      </footer>

    </div>

    <!-- ======================================================== -->
    <!-- 4. 公民电子配给卡全流程操作演示弹窗 (E-Ration Flow Demo) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="showFlowDemoDialog"
      :title="null"
      width="940px"
      align-center
      append-to-body
      class="flow-demo-dialog"
      :show-close="false"
    >
      <div class="p-3 sm:p-5 space-y-4" :dir="isRtl ? 'rtl' : 'ltr'">
        <!-- 头部 Header：标题与关闭按钮 -->
        <div class="flex items-start justify-between gap-4 border-b border-[#D9E5DB] pb-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FDF3E0] border border-[#E5CEA1] text-[#B8934A] text-[11px] font-bold">
              <el-icon :size="12"><VideoPlay /></el-icon>
              <span>E-RATION WORKFLOW GUIDE</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-[#326445] tracking-tight">
              {{ $t('portal.flowDemo.dialogTitle') }}
            </h2>
            <p class="text-xs text-[#58685D] leading-relaxed">
              {{ $t('portal.flowDemo.dialogSubtitle') }}
            </p>
          </div>

          <button
            type="button"
            class="w-8 h-8 rounded-full bg-[#E9F1EB] hover:bg-[#D9E5DB] text-[#58685D] hover:text-[#1F3326] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            @click="showFlowDemoDialog = false"
          >
            <el-icon :size="16"><Close /></el-icon>
          </button>
        </div>

        <!-- 流程提示指引条 -->
        <div class="p-3 rounded-lg bg-gradient-to-r from-[#FDF3E0] to-[#E9F1EB] border border-[#E5CEA1] text-xs text-[#7A5F21] flex items-start gap-2.5 shadow-2xs">
          <div class="w-5 h-5 rounded-full bg-[#D3AF62] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
            💡
          </div>
          <div class="leading-relaxed">
            {{ $t('portal.flowDemo.bannerTip') }}
          </div>
        </div>

        <!-- 6 个流程卡片网格列表 (桌面端 2 列 x 3 行，移动端 1 列 x 6 行) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          <div
            v-for="item in flowSteps"
            :key="item.step"
            class="flow-step-card group relative bg-[#F3F9F5] hover:bg-white border border-[#D9E5DB] hover:border-[#D3AF62] rounded-lg p-4 transition-all duration-300 cursor-pointer shadow-2xs hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
            @click="openFlowStep(item)"
          >
            <!-- 卡片顶栏：步骤编号与角色视口徽章 -->
            <div class="flex items-center justify-between pb-2.5 border-b border-[#E9F1EB]">
              <div class="inline-flex items-center gap-1.5">
                <span class="w-6 h-6 rounded-lg bg-[#326445] text-white text-xs font-mono font-bold flex items-center justify-center shadow-2xs group-hover:bg-[#D3AF62] transition-colors">
                  0{{ item.step }}
                </span>
                <span class="text-xs font-bold text-[#326445] font-mono tracking-tight">
                  {{ $t('portal.flowDemo.stepBadge', { step: `0${item.step}` }) }}
                </span>
              </div>

              <!-- 终端与角色胶囊 -->
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border"
                :class="item.roleType === 'citizen' ? 'bg-[#E2F4E4] text-[#326445] border-[#C7E0CE]' : item.roleType === 'agent' ? 'bg-[#FDF3E0] text-[#7A5F21] border-[#E5CEA1]' : 'bg-[#E9F1EB] text-[#24483A] border-[#C9DBCE]'"
              >
                <el-icon :size="12">
                  <Cellphone v-if="item.roleType === 'citizen'" />
                  <FullScreen v-else-if="item.roleType === 'agent'" />
                  <Monitor v-else />
                </el-icon>
                <span>{{ $t(item.roleLabelKey) }}</span>
              </span>
            </div>

            <!-- 卡片核心内容：标题与说明 -->
            <div class="py-3 space-y-1.5 flex-1" :class="isRtl ? 'text-right' : 'text-left'">
              <h3 class="text-sm font-bold text-[#1F3326] group-hover:text-[#326445] transition-colors flex items-center gap-1">
                <span>{{ $t(item.titleKey) }}</span>
              </h3>
              <p class="text-xs text-[#58685D] leading-relaxed">
                {{ $t(item.descKey) }}
              </p>
            </div>

            <!-- 卡片底栏：操作指引与新标签页跳转按钮 -->
            <div class="pt-2.5 border-t border-[#E9F1EB] flex items-center justify-between gap-2 text-xs">
              <span class="text-[11px] text-[#8A9A8F] truncate max-w-[200px] sm:max-w-[240px]">
                {{ $t(item.actionHintKey) }}
              </span>

              <div class="inline-flex items-center gap-1 font-bold text-xs text-[#326445] group-hover:text-[#D3AF62] transition-colors shrink-0">
                <span>{{ $t('portal.flowDemo.openInNewTab') }}</span>
                <el-icon class="transform group-hover:translate-x-0.5 transition-transform"><TopRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹窗底栏 -->
        <div class="pt-3 border-t border-[#D9E5DB] flex items-center justify-between">
          <div class="text-[11px] text-[#8A9A8F]">
            © 2026 Republic of Iraq · National Food Support System
          </div>
          <el-button @click="showFlowDemoDialog = false">
            {{ $t('common.close') || '关闭' }}
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  Check,
  Cellphone,
  FullScreen,
  DataAnalysis,
  Back,
  Right,
  OfficeBuilding,
  VideoPlay,
  Close,
  Monitor,
  TopRight
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../../components/common/LanguageSwitcher.vue';
import { currentLang } from '../../locales/index.js';
import { useAuthStore } from '../../stores/auth.js';

const { t } = useI18n();
const authStore = useAuthStore();

// 是否为 RTL 语言环境 (阿语、库尔德语)
const isRtl = computed(() => ['ar', 'ku'].includes(currentLang.value));

// 流程演示弹窗控制
const showFlowDemoDialog = ref(false);

// 6 大核心流程步骤定义
const flowSteps = [
  {
    step: 1,
    roleType: 'citizen',
    layout: 'app',
    roleLabelKey: 'portal.flowDemo.roleCitizenApp',
    titleKey: 'portal.flowDemo.steps.step1.title',
    descKey: 'portal.flowDemo.steps.step1.desc',
    actionHintKey: 'portal.flowDemo.steps.step1.actionHint',
    targetPath: '/login?role=citizen&layout=app&demo=true&demoStep=step1_1'
  },
  {
    step: 2,
    roleType: 'citizen',
    layout: 'app',
    roleLabelKey: 'portal.flowDemo.roleCitizenApp',
    titleKey: 'portal.flowDemo.steps.step2.title',
    descKey: 'portal.flowDemo.steps.step2.desc',
    actionHintKey: 'portal.flowDemo.steps.step2.actionHint',
    targetPath: '/warehouse?role=citizen&layout=app&tab=purchase&demo=true&demoStep=step2_1'
  },
  {
    step: 3,
    roleType: 'admin',
    layout: 'web',
    roleLabelKey: 'portal.flowDemo.roleAdminWeb',
    titleKey: 'portal.flowDemo.steps.step3.title',
    descKey: 'portal.flowDemo.steps.step3.desc',
    actionHintKey: 'portal.flowDemo.steps.step3.actionHint',
    targetPath: '/warehouse?role=minister_center&layout=web&tab=orderStats&demo=true&demoStep=step3_1'
  },
  {
    step: 4,
    roleType: 'agent',
    layout: 'app',
    roleLabelKey: 'portal.flowDemo.roleAgentApp',
    titleKey: 'portal.flowDemo.steps.step4.title',
    descKey: 'portal.flowDemo.steps.step4.desc',
    actionHintKey: 'portal.flowDemo.steps.step4.actionHint',
    targetPath: '/warehouse?role=agent&layout=app&tab=orderStats&demo=true&demoStep=step4_1'
  },
  {
    step: 5,
    roleType: 'citizen',
    layout: 'app',
    roleLabelKey: 'portal.flowDemo.roleCitizenApp',
    titleKey: 'portal.flowDemo.steps.step5.title',
    descKey: 'portal.flowDemo.steps.step5.desc',
    actionHintKey: 'portal.flowDemo.steps.step5.actionHint',
    targetPath: '/warehouse?role=citizen&layout=app&tab=purchase&demo=true&demoStep=step5_1'
  },
  {
    step: 6,
    roleType: 'agent',
    layout: 'app',
    roleLabelKey: 'portal.flowDemo.roleAgentApp',
    titleKey: 'portal.flowDemo.steps.step6.title',
    descKey: 'portal.flowDemo.steps.step6.desc',
    actionHintKey: 'portal.flowDemo.steps.step6.actionHint',
    targetPath: '/dashboard?role=agent&mode=mobile&layout=app&demo=true&demoStep=step6_1'
  }
];

/**
 * 点击某个步骤卡片后，自动在新标签页中打开对应流程模块
 * @param {object} stepItem 
 */
function openFlowStep(stepItem) {
  const baseUrl = window.location.origin + window.location.pathname;
  const fullUrl = `${baseUrl}#${stepItem.targetPath}`;
  const title = t(stepItem.titleKey);

  ElMessage.success(t('portal.openingNotice', { title }));

  // 按步骤命名窗口：浏览器自动复用已打开的同名演示标签页（跳转并聚焦），
  // 已关闭则重新打开，避免每次都新开标签页
  const win = window.open(fullUrl, `rcm_demo_flow_${stepItem.step}`);
  if (win && typeof win.focus === 'function') {
    win.focus();
  }
}

/**
 * 点击对应卡片模块后，自动设置好目标角色身份，并在新标签页中打开对应终端
 * @param {'citizen' | 'agent' | 'admin'} terminalType 
 */
function openTerminal(terminalType) {
  let targetPath = '';
  let roleTitle = '';

  // 构建当前应用的基准 URL
  const baseUrl = window.location.origin + window.location.pathname;

  switch (terminalType) {
    case 'citizen':
      targetPath = `${baseUrl}#/citizen?role=citizen&layout=app`;
      roleTitle = t('portal.citizenApp.title');
      break;

    case 'agent':
      targetPath = `${baseUrl}#/dashboard?role=agent&mode=mobile&layout=app`;
      roleTitle = t('portal.agentApp.title');
      break;

    case 'admin':
      targetPath = `${baseUrl}#/dashboard?role=minister_center&mode=overview&layout=web`;
      roleTitle = t('portal.adminWeb.title');
      break;

    default:
      targetPath = `${baseUrl}#/dashboard`;
      roleTitle = t('app.shortTitle');
  }

  // 提示用户并打开新标签页
  ElMessage.success(t('portal.openingNotice', { title: roleTitle }));
  window.open(targetPath, '_blank');
}
</script>

<style scoped>
.portal-card {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.portal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -4px rgba(47, 68, 52, 0.08);
}

.flow-step-card {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.flow-step-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -2px rgba(47, 68, 52, 0.08);
}

:deep(.el-dialog.flow-demo-dialog) {
  border-radius: 24px;
  overflow: hidden;
  max-width: 95vw !important;
  box-shadow: 0 25px 60px -15px rgba(20, 35, 28, 0.3);
}

:deep(.el-dialog.flow-demo-dialog .el-dialog__header) {
  display: none;
}

:deep(.el-dialog.flow-demo-dialog .el-dialog__body) {
  padding: 0;
}
</style>
