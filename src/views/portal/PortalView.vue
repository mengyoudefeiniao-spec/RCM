<template>
  <div class="portal-view w-full min-h-screen bg-[#F8F7F3] flex flex-col font-sans text-slate-800">
    <!-- 主体内容容器：自适应桌面宽屏与移动端 Google Pixel 9 (412x924px) 视口 -->
    <div class="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-4 sm:space-y-6 flex-1 flex flex-col justify-between">
      
      <!-- ======================================================== -->
      <!-- 0. 顶栏操作区：仅在最右侧增加切换国际化语言的下拉框 (无返回按钮) -->
      <!-- ======================================================== -->
      <div class="flex items-center justify-end w-full">
        <LanguageSwitcher />
      </div>

      <!-- ======================================================== -->
      <!-- 1. 顶部 Header Banner：中东高端政务现代建筑背景大图 + 上层文字浮层 -->
      <!-- ======================================================== -->
      <div
        class="portal-hero relative overflow-hidden rounded-2xl border border-[#ECE7DE] shadow-xs flex items-center justify-end min-h-[160px] sm:min-h-[195px] md:min-h-[220px]"
        style="box-shadow: 0 6px 24px -2px rgba(60, 48, 25, 0.05);"
      >
        <!-- 背景图图层：真实截图处理后的无字背景大图 -->
        <img
          src="/images/dashboard-banner.png"
          alt="National Food Support Platform Background"
          class="absolute inset-0 w-full h-full object-cover object-left md:object-center select-none pointer-events-none"
          loading="eager"
        />

        <!-- 柔和微弱渐变保护层：确保在不同屏幕分辨率与多语言下文字图层均清晰易读 -->
        <div class="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#FBF9F5]/30 to-[#FAF8F5]/85 pointer-events-none"></div>

        <!-- 文字内容图层：位于图片图层上方 (relative z-10)，支持独立排版与交互 -->
        <div class="relative z-10 w-full md:w-3/5 lg:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-center items-start md:items-end text-left md:text-right">
          <!-- 金色微标 -->
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED]/95 backdrop-blur-xs border border-[#E8D9BF] text-[#B88B4A] text-xs font-semibold mb-2.5 shadow-2xs">
            <span class="font-sans font-bold">{{ $t('portal.serviceTag') }}</span>
            <el-icon :size="13" class="text-[#B88B4A]"><Check /></el-icon>
          </div>

          <!-- 主标题 -->
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1E3F35] tracking-tight leading-snug">
              {{ $t('portal.mainTitle') }}
            </h1>
          </div>

          <!-- 标语 -->
          <p class="text-xs sm:text-sm text-[#5E6862] mt-2 font-medium max-w-lg leading-relaxed">
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
          class="portal-card group relative bg-white rounded-2xl p-5 sm:p-6 border border-[#ECE7DE] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AA6A]/60"
          style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
          @click="openTerminal('citizen')"
        >
          <!-- 卡片顶栏：左侧平台标识，右侧浅金方圆图标容器 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F1EA] text-[#7A827D] border border-[#E8E3D8]">
              {{ $t('portal.citizenApp.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (38px x 38px) -->
            <div class="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#E8D9BF] flex items-center justify-center text-[#C59D5F] group-hover:scale-105 group-hover:bg-[#C59D5F] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><Cellphone /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#18231E] group-hover:text-[#1E3F35] transition-colors">
              {{ $t('portal.citizenApp.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8C958F] pt-0.5 leading-relaxed">
              {{ $t('portal.citizenApp.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#5E6862] leading-relaxed">
              {{ $t('portal.citizenApp.desc') }}
            </p>
          </div>

          <!-- 卡片底栏：进入按钮与方向箭头 (在新标签页打开) -->
          <div class="pt-4 border-t border-[#F4EFE6] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3F35] group-hover:text-[#C59D5F] transition-colors">
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
          class="portal-card group relative bg-white rounded-2xl p-5 sm:p-6 border border-[#ECE7DE] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AA6A]/60"
          style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
          @click="openTerminal('agent')"
        >
          <!-- 卡片顶栏 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F1EA] text-[#7A827D] border border-[#E8E3D8]">
              {{ $t('portal.agentApp.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (扫码核销) -->
            <div class="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#E8D9BF] flex items-center justify-center text-[#C59D5F] group-hover:scale-105 group-hover:bg-[#C59D5F] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><FullScreen /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#18231E] group-hover:text-[#1E3F35] transition-colors">
              {{ $t('portal.agentApp.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8C958F] pt-0.5 leading-relaxed">
              {{ $t('portal.agentApp.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#5E6862] leading-relaxed">
              {{ $t('portal.agentApp.desc') }}
            </p>
          </div>

          <!-- 卡片底栏 -->
          <div class="pt-4 border-t border-[#F4EFE6] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3F35] group-hover:text-[#C59D5F] transition-colors">
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
          class="portal-card group relative bg-white rounded-2xl p-5 sm:p-6 border border-[#ECE7DE] flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#D4AA6A]/60"
          style="box-shadow: 0 4px 20px -2px rgba(60, 48, 25, 0.04);"
          @click="openTerminal('admin')"
        >
          <!-- 卡片顶栏 -->
          <div class="flex items-center justify-between pb-3">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F4F1EA] text-[#7A827D] border border-[#E8E3D8]">
              {{ $t('portal.adminWeb.tag') }}
            </span>

            <!-- 浅砂金圆角方框图标容器 (大盘控制台) -->
            <div class="w-10 h-10 rounded-xl bg-[#FAF5ED] border border-[#E8D9BF] flex items-center justify-center text-[#C59D5F] group-hover:scale-105 group-hover:bg-[#C59D5F] group-hover:text-white transition-all duration-300 shadow-2xs">
              <el-icon :size="20"><DataAnalysis /></el-icon>
            </div>
          </div>

          <!-- 卡片内容区 -->
          <div class="py-3 space-y-2" :class="isRtl ? 'text-right' : 'text-left'">
            <h2 class="text-lg sm:text-xl font-black text-[#18231E] group-hover:text-[#1E3F35] transition-colors">
              {{ $t('portal.adminWeb.title') }}
            </h2>
            <!-- 功能要点 -->
            <p class="text-xs font-semibold text-[#8C958F] pt-0.5 leading-relaxed">
              {{ $t('portal.adminWeb.summary') }}
            </p>
            <!-- 详细说明 -->
            <p class="text-[12px] text-[#5E6862] leading-relaxed">
              {{ $t('portal.adminWeb.desc') }}
            </p>
          </div>

          <!-- 卡片底栏 -->
          <div class="pt-4 border-t border-[#F4EFE6] flex items-center" :class="isRtl ? 'justify-start' : 'justify-end'">
            <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3F35] group-hover:text-[#C59D5F] transition-colors">
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
        <div class="inline-flex flex-wrap items-center justify-center gap-2 text-xs text-[#7A827D] px-4 py-2.5 rounded-full bg-white/70 border border-[#ECE7DE] shadow-2xs">
          <!-- 金色建筑小图标 -->
          <el-icon :size="15" class="text-[#C59D5F] shrink-0"><OfficeBuilding /></el-icon>
          <span class="font-bold text-[#1E3F35]">{{ $t('portal.footer.agenciesLabel') }}</span>
          <span>{{ $t('portal.footer.agenciesList') }}</span>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Check,
  Cellphone,
  FullScreen,
  DataAnalysis,
  Back,
  Right,
  OfficeBuilding
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
  box-shadow: 0 12px 28px -4px rgba(60, 48, 25, 0.08);
}
</style>
