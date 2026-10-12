<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <button
      type="button"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs transition-all cursor-pointer"
      :title="$t('nav.langSwitch')"
    >
      <span class="text-sm">{{ activeLangObj.flag }}</span>
      <span class="hidden sm:inline font-sans">{{ activeLangObj.name }}</span>
      <el-icon :size="12" class="text-slate-400"><ArrowDown /></el-icon>
    </button>

    <template #dropdown>
      <el-dropdown-menu class="min-w-[150px]">
        <el-dropdown-item
          v-for="item in SUPPORTED_LANGUAGES"
          :key="item.code"
          :command="item.code"
          :class="{ 'text-blue-600 font-bold bg-blue-50/50': currentLang === item.code }"
        >
          <div class="flex items-center justify-between w-full gap-3 py-0.5">
            <span class="flex items-center gap-2">
              <span>{{ item.flag }}</span>
              <span>{{ item.name }}</span>
            </span>
            <span class="text-[11px] text-slate-400 font-mono">{{ item.nativeName }}</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';
import { SUPPORTED_LANGUAGES, currentLang, setLanguage } from '../../locales/index.js';

const activeLangObj = computed(() => {
  return SUPPORTED_LANGUAGES.find((l) => l.code === currentLang.value) || SUPPORTED_LANGUAGES[0];
});

function handleCommand(code) {
  setLanguage(code);
}
</script>
