import fs from 'fs';

/**
 * 公民申办流程视图 APP 视口二轮适配：
 * 1) 流程节点图重构为 APP 顶部横向步骤条（隐藏左侧绝对定位节点轨道）
 * 2) 面粉/食品代理选择框改为 APP 单列堆叠，标签允许换行，不再横向溢出
 * 3) Registry Update Status 长值胶囊允许换行显示
 */

const STEPPER = `<!-- APP 视口：顶部横向 1-5 步骤条 (适配手机窗口与操作习惯) -->
            <div v-if="isAppMode" class="flex items-center mb-3 px-1">
              <template v-for="(s, idx) in processSteps" :key="s.step">
                <div
                  class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                  :class="s.step < currentStep ? 'bg-[#3E9B68] border-[#3E9B68] text-white' : s.step === currentStep ? 'bg-[#326445] border-[#326445] text-white ring-4 ring-[#326445]/15' : 'bg-white border-[#C9DBCE] text-[#8A9A8F]'"
                >
                  <el-icon v-if="s.step < currentStep" class="text-xs"><Check /></el-icon>
                  <span v-else>{{ s.step }}</span>
                </div>
                <div v-if="idx < processSteps.length - 1" class="flex-1 h-0.5 mx-1 rounded-full" :class="s.step < currentStep ? 'bg-[#3E9B68]' : 'bg-[#D9E5DB]'"></div>
              </template>
            </div>

            `;

const FILES = {
  'src/views/citizen/TransferAgentView.vue': [
    // 1. APP 模式下隐藏左侧节点轨道，恢复桌面侧栏原始定义（仅桌面 lg+ 渲染）
    [`<div class="timeline-rail-aside border-[#D9E5DB] p-0" :class="isAppMode ? '' : 'lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r lg:p-6'">`,
     `<div v-if="!isAppMode" class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r border-[#D9E5DB] lg:p-6 p-0">`],
    // 2. APP 模式内容区不再为节点轨道预留左内边距
    [`:class="isAppMode ? 'p-4 pl-9' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`,
     `:class="isAppMode ? 'p-4' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`],
    // 3. 插入顶部横向步骤条
    [`<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`,
     `${STEPPER}<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`],
    // 4. 代理网点选择行：APP 单列堆叠，避免横向溢出
    [`class="p-3 rounded-lg border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"`,
     `class="p-3 rounded-lg border bg-white flex gap-2 text-xs cursor-pointer transition-all" :class="isAppMode ? 'flex-col items-stretch' : 'items-center justify-between'"`, 'all'],
    // 5. 代理名称长文本允许换行
    [`<el-radio :value="ag.id" :disabled="ag.currentHouseholds >= 1500">`,
     `<el-radio :value="ag.id" :disabled="ag.currentHouseholds >= 1500" class="!h-auto items-start [&_.el-radio__label]:whitespace-normal [&_.el-radio__label]:break-words [&_.el-radio__label]:leading-snug">`, 'all'],
    // 6. 选择框标题行允许换行
    [`<div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]/80">`,
     `<div class="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-[#D9E5DB]/80">`, 'all'],
  ],
  'src/views/citizen/MemberTransferView.vue': [
    [`<div class="timeline-rail-aside border-[#D9E5DB] p-0" :class="isAppMode ? '' : 'lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r lg:p-6'">`,
     `<div v-if="!isAppMode" class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r border-[#D9E5DB] lg:p-6 p-0">`],
    [`:class="isAppMode ? 'p-4 pl-9' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`,
     `:class="isAppMode ? 'p-4' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`],
    [`<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`,
     `${STEPPER}<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`],
    // Registry Update Status 长值胶囊允许换行
    [`<el-tag :type="selectedMember.isUpdatedInSystem ? 'success' : 'danger'" size="small">`,
     `<el-tag :type="selectedMember.isUpdatedInSystem ? 'success' : 'danger'" size="small" class="max-w-full whitespace-normal break-words leading-snug">`],
  ],
  'src/views/citizen/SplitHouseholdView.vue': [
    [`<div class="timeline-rail-aside border-[#D9E5DB] p-0" :class="isAppMode ? '' : 'lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r lg:p-6'">`,
     `<div v-if="!isAppMode" class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r border-[#D9E5DB] lg:p-6 p-0">`],
    [`:class="isAppMode ? 'p-4 pl-9' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`,
     `:class="isAppMode ? 'p-4' : 'p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7'"`],
    [`<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`,
     `${STEPPER}<div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">`],
  ],
};

let total = 0;
for (const [file, rules] of Object.entries(FILES)) {
  let text = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [from, to, mode] of rules) {
    if (!text.includes(from)) {
      console.log('MISS:', file, '::', from.slice(0, 70));
      continue;
    }
    text = mode === 'all' ? text.split(from).join(to) : text.replace(from, to);
    count++;
  }
  fs.writeFileSync(file, text);
  total += count;
  console.log('updated:', file, '| replacements:', count);
}
console.log('total replacements:', total);
