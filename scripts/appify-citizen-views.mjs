import fs from 'fs';

/**
 * 公民申办类视图 APP 视口适配：
 * 在 APP 仿真视口 (isAppMode) 下强制移动端布局，桌面端保持原 lg:/sm: 响应式不变。
 * 仅调整 class 绑定，不改动任何业务逻辑与 DOM 结构。
 */

const IS_APP_SNIPPET = `// APP 仿真视口判定：APP 模式下强制移动端布局（与 AppLayout 判定保持一致）
const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});

function handleGoBack() {`;

// 三个流程视图共用的模板替换（逐字精确匹配）
const COMMON = [
  [`<div class="flex flex-col lg:flex-row items-stretch">`,
   `<div class="flex items-stretch" :class="isAppMode ? 'flex-col' : 'flex-col lg:flex-row'">`],
  [`class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r border-[#D9E5DB] lg:p-6 p-0"`,
   `class="timeline-rail-aside border-[#D9E5DB] p-0" :class="isAppMode ? '' : 'lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r lg:p-6'"`],
  [`class="hidden lg:flex items-center justify-between pb-4 mb-5 border-b border-[#D9E5DB]"`,
   `class="items-center justify-between pb-4 mb-5 border-b border-[#D9E5DB]" :class="isAppMode ? 'hidden' : 'hidden lg:flex'"`],
  [`class="node-text-wrapper hidden lg:block"`,
   `class="node-text-wrapper" :class="isAppMode ? 'hidden' : 'hidden lg:block'"`],
  [`class="lg:hidden flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs"`,
   `class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'"`],
  [`class="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7 space-y-6"`,
   `class="flex-1 min-w-0 w-full space-y-6" :class="isAppMode ? 'p-4 pl-9' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`],
  [`class="p-4 bg-[#1B3123] text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"`,
   `class="p-4 bg-[#1B3123] text-white rounded-lg flex flex-col justify-between gap-4" :class="isAppMode ? '' : 'sm:flex-row sm:items-center'"`],
];

const FILES = {
  'src/views/citizen/TransferAgentView.vue': [
    [`class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"`,
     `class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-3 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-4'"`],
    [`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">`,
     `<div class="grid gap-4" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'">`, 'all'],
    [`<div v-if="selectedCenter" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">`,
     `<div v-if="selectedCenter" class="grid gap-4 pt-2" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'">`],
    [`grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs`,
     `grid gap-4 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'`],
  ],
  'src/views/citizen/MemberTransferView.vue': [
    [`class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"`,
     `class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-3 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'"`],
    [`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">`,
     `<div class="grid gap-3" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'">`],
    [`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs`,
     `grid gap-4 text-xs" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'`, 'all'],
    [`class="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5"`,
     `class="w-full grid gap-2.5" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'"`],
    [`<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">`,
     `<div class="grid gap-2 text-[11px]" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'">`, 'all'],
  ],
  'src/views/citizen/SplitHouseholdView.vue': [
    [`class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"`,
     `class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-3 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-4'"`],
    [`<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">`,
     `<div class="grid gap-3" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'">`],
    [`<div class="grid grid-cols-1 md:grid-cols-2 gap-4">`,
     `<div class="grid gap-4" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'">`],
    [`<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[#58685D]">`,
     `<div class="grid gap-3 text-[#58685D]" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'">`],
    [`grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs`,
     `grid gap-4 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'`],
  ],
  'src/views/citizen/ChangeHeadView.vue': [
    [`<div class="grid grid-cols-1 md:grid-cols-2 gap-6">`,
     `<div class="grid gap-6" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'">`],
  ],
};

let total = 0;
for (const [file, rules] of Object.entries(FILES)) {
  let text = fs.readFileSync(file, 'utf8');
  let count = 0;

  // 注入 isAppMode computed
  if (!text.includes('const isAppMode')) {
    if (!text.includes('function handleGoBack() {')) {
      console.log('SKIP (no handleGoBack):', file);
      continue;
    }
    text = text.replace('function handleGoBack() {', IS_APP_SNIPPET);
    count++;
  }

  for (const rule of COMMON.concat(rules)) {
    const [from, to, mode] = rule;
    if (!text.includes(from)) {
      console.log('MISS:', file, '::', from.slice(0, 60));
      continue;
    }
    if (mode === 'all') {
      text = text.split(from).join(to);
    } else {
      text = text.replace(from, to);
    }
    count++;
  }

  fs.writeFileSync(file, text);
  total += count;
  console.log('updated:', file, '| replacements:', count);
}
console.log('total replacements:', total);
