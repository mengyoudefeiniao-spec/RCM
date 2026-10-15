<template>
  <div class="module-desc-tip-wrapper inline-flex items-center gap-1.5 flex-wrap">
    <!-- 前置图标插槽或默认 -->
    <slot name="icon" />

    <!-- 主标题：优先使用 default 插槽，未提供时使用解析后的 parsedTitle -->
    <slot>
      <span class="font-bold text-[#1B3123]" :class="titleClass">
        {{ parsedTitle }}
      </span>
    </slot>

    <!-- 额外插槽（如原有在标题旁的标签） -->
    <slot name="extra" />

    <!-- 感叹号+圆圈信息提示图标按钮 (采用独立新图层 Popover 弹出标签提示，不侵入现有框体) -->
    <el-popover
      v-if="hasDescContent"
      v-model:visible="popoverVisible"
      trigger="click"
      placement="bottom-start"
      popper-class="module-desc-layer-popover"
      :teleported="true"
      :show-arrow="true"
      :width="popoverWidth"
      :offset="8"
    >
      <template #reference>
        <button
          type="button"
          class="desc-tip-btn inline-flex items-center justify-center w-6 h-6 rounded-full text-[#8A9A8F] hover:text-[#326445] hover:bg-[#EFF5F1] active:scale-95 transition-all cursor-pointer select-none shrink-0"
          :class="{ 'text-[#326445] bg-[#E1F4E4]/70 ring-2 ring-[#AECBB8]/40': popoverVisible }"
          :title="popoverVisible ? '关闭说明提示' : '点击查看功能说明与规则'"
          :aria-expanded="popoverVisible"
        >
          <el-icon :size="15"><InfoFilled /></el-icon>
        </button>
      </template>

      <!-- 新图层内容：以标签形式展示 (括号特征标签 + 详细规则说明标签) -->
      <div class="desc-layer-content space-y-2.5 p-1 text-xs">
        <!-- 标签头部行 -->
        <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-[#E9F1EB]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- 原括号内的短特征/分类标签 -->
            <el-tag
              v-if="parsedBadge"
              :type="badgeType"
              size="small"
              effect="plain"
              class="font-semibold shadow-2xs"
            >
              <span class="flex items-center gap-1">
                <el-icon :size="12"><CollectionTag /></el-icon>
                {{ parsedBadge }}
              </span>
            </el-tag>
            <span v-else class="font-bold text-[#1F3326] flex items-center gap-1 text-[11px]">
              <el-icon class="text-[#5C8A6B]" :size="13"><InfoFilled /></el-icon>
              <span>功能模块规则说明</span>
            </span>
          </div>

          <!-- 右上角关闭按钮 -->
          <button
            type="button"
            class="text-[#8A9A8F] hover:text-[#58685D] p-0.5 rounded hover:bg-[#E9F1EB] transition-colors cursor-pointer shrink-0"
            title="关闭提示"
            @click="popoverVisible = false"
          >
            <el-icon :size="13"><Close /></el-icon>
          </button>
        </div>

        <!-- 详细说明文本：以优雅的标签卡片形式呈现 -->
        <div
          v-if="content"
          class="desc-text-tag bg-[#F3F8F4] border border-[#D9E5DB]/90 text-[#58685D] rounded-lg p-2.5 text-xs leading-relaxed break-words font-normal shadow-2xs"
        >
          <div class="flex items-start gap-1.5">
            <el-icon class="text-[#5C8A6B] mt-0.5 shrink-0" :size="12"><InfoFilled /></el-icon>
            <span class="flex-1 break-words">{{ content }}</span>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { InfoFilled, CollectionTag, Close } from '@element-plus/icons-vue'

const props = defineProps({
  // 完整标题（若包含括号，如 '申请配给卡代理转移 (就近获取与迁居转网)'，将自动拆分）
  title: {
    type: String,
    default: ''
  },
  // 原括号内的副标题/分类标签（若未传且 title 中含有括号，则自动从 title 中提取）
  badge: {
    type: String,
    default: ''
  },
  // 原下方的灰色小字详细描述说明
  content: {
    type: String,
    default: ''
  },
  // 标签主题类型：'primary' | 'success' | 'warning' | 'danger' | 'info'
  badgeType: {
    type: String,
    default: 'primary'
  },
  // 标题 CSS 类名（当直接通过 prop 传递 title 时生效）
  titleClass: {
    type: String,
    default: 'text-base'
  }
})

const popoverVisible = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

// 响应式自适应 Popover 宽度（在 Google Pixel 9 等 412px 手机屏幕下保证不超过视口，桌面端更宽适）
const popoverWidth = computed(() => {
  if (windowWidth.value < 450) {
    return Math.min(320, windowWidth.value - 40)
  }
  return 360
})

// 智能拆分标题与括号中的内容 (支持中文括号 （） 与英文括号 ())
const parsedInfo = computed(() => {
  if (!props.title) {
    return { title: '', badge: '' }
  }
  const match = props.title.match(/^(.*?)\s*[\(（](.*?)[\)）]\s*$/)
  if (match) {
    return {
      title: match[1].trim(),
      badge: match[2].trim()
    }
  }
  return {
    title: props.title.trim(),
    badge: ''
  }
})

// 纯主标题
const parsedTitle = computed(() => {
  return parsedInfo.value.title
})

// 短特征标签：优先取显式传入的 props.badge，次之从 title 中自动解析
const parsedBadge = computed(() => {
  return props.badge || parsedInfo.value.badge
})

// 是否有需要展示的描述性内容（badge 或 content 其中之一存在）
const hasDescContent = computed(() => {
  return Boolean(parsedBadge.value || props.content)
})
</script>

<style>
/* 新图层全局样式优化，确保脱离原框体流并具备精致阴影 */
.module-desc-layer-popover.el-popover.el-popper {
  padding: 8px 10px !important;
  border-radius: 14px !important;
  border: 1px solid rgba(217, 229, 219, 0.95) !important;
  box-shadow: 0 10px 25px -5px rgba(31, 51, 38, 0.12), 0 8px 10px -6px rgba(31, 51, 38, 0.08) !important;
}
</style>
