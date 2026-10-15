import { ref, reactive, computed, watch, isRef, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';

/**
 * useNumberCounter - 基于 GSAP 的高质感数字平滑滚动 Composable
 *
 * @param {import('vue').Ref<number | string> | number | string} targetValue 目标数值
 * @param {Object} options 配置选项
 * @param {number} [options.duration=1.6] 补间动画时长 (秒)
 * @param {number} [options.delay=0] 补间动画延迟 (秒)
 * @param {string} [options.ease='power2.out'] GSAP 缓动函数
 * @param {number} [options.decimals] 小数保留位数 (默认自动侦测)
 * @param {string} [options.separator=','] 千分位分隔符
 * @param {string} [options.prefix=''] 前缀 (如 '$', '+')
 * @param {string} [options.suffix=''] 后缀 (如 '%', '天')
 * @param {boolean} [options.immediate=true] 挂载时是否立即播放
 * @returns {Object} { displayValue, currentNumber, animateTo, restart, kill }
 */
export function useNumberCounter(targetValue, options = {}) {
  const {
    duration = 1.6,
    delay = 0,
    ease = 'power2.out',
    separator = ',',
    prefix = '',
    suffix = '',
    immediate = true
  } = options;

  // 解析数字字符串（去除已有逗号等）
  function parseToNumber(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const sanitized = val.replace(/,/g, '').trim();
      const num = parseFloat(sanitized);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  // 检测小数位
  function detectDecimals(val) {
    if (options.decimals !== undefined) return options.decimals;
    const str = String(val);
    if (str.includes('.')) {
      const parts = str.split('.');
      return parts[1] ? parts[1].length : 0;
    }
    return 0;
  }

  const initialNum = parseToNumber(isRef(targetValue) ? targetValue.value : targetValue);
  const decimals = detectDecimals(isRef(targetValue) ? targetValue.value : targetValue);

  // 内部 GSAP 补间状态对象：初值直接设为目标值，杜绝首屏空白或闪烁，在 mounted 后启动动态平滑滚动
  const state = reactive({
    current: initialNum
  });

  // 保存 GSAP Tween 实例引用以便随时销毁
  let tween = null;

  // 格式化千分位数字
  function formatNumber(num, decCount, sep) {
    const fixed = num.toFixed(decCount);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  // 呈现给模板的响应式字符串
  const displayValue = computed(() => {
    const formatted = formatNumber(state.current, decimals, separator);
    return `${prefix}${formatted}${suffix}`;
  });

  // 当前纯数值
  const currentNumber = computed(() => state.current);

  // 核心执行补间方法
  function animateTo(newVal, customDuration = duration) {
    if (tween) {
      tween.kill();
    }
    const targetNum = parseToNumber(newVal);

    tween = gsap.to(state, {
      current: targetNum,
      duration: customDuration,
      delay,
      ease,
      onComplete: () => {
        state.current = targetNum; // 确保最终值精准匹配
      }
    });
  }

  // 重置并从 0 重新平滑滚动
  function restart() {
    state.current = 0;
    const targetNum = parseToNumber(isRef(targetValue) ? targetValue.value : targetValue);
    animateTo(targetNum);
  }

  // 安全销毁方法
  function kill() {
    if (tween) {
      tween.kill();
      tween = null;
    }
  }

  // 响应式监听外部 targetValue 变动
  if (isRef(targetValue)) {
    watch(
      targetValue,
      (newVal) => {
        animateTo(newVal);
      },
      { flush: 'post' }
    );
  }

  onMounted(() => {
    if (immediate) {
      animateTo(initialNum);
    }
  });

  // 核心安全生命周期：组件卸载前强行销毁补间，杜绝内存泄漏与悬挂操作
  onBeforeUnmount(() => {
    kill();
  });

  return {
    displayValue,
    currentNumber,
    animateTo,
    restart,
    kill
  };
}
