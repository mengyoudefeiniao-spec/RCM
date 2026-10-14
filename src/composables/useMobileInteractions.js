import { ref, reactive, watch, isRef, onMounted, onBeforeUnmount, nextTick } from 'vue';
import gsap from 'gsap';

/**
 * ====================================================================
 * useMobileInteractions - GSAP 移动端微交互与动效 Composable
 * 专为现场移动端核销作业与 Google Pixel 9 设计
 * 包含：
 * 1. 核心数据平滑补间滚动 (千分位格式化 + 销毁安全保护)
 * 2. 扫码主按钮轻触/按压微缩放手感反馈 (scale: 0.97 弹性恢复)
 * 3. 列表卡片交错进场动效 (Stagger Slide Up)
 * ====================================================================
 */

/**
 * 格式化千分位辅助函数
 */
function formatNumberWithSeparator(num, decimals = 0, separator = ',') {
  const fixed = Number(num).toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * 1. 单项数字平滑滚动
 */
export function useSmoothNumber(targetValue, options = {}) {
  const {
    duration = 1.4,
    delay = 0.1,
    ease = 'power2.out',
    separator = ',',
    decimals = 0,
    prefix = '',
    suffix = ''
  } = options;

  function parseVal(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const sanitized = val.replace(/,/g, '').trim();
      const n = parseFloat(sanitized);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  }

  const state = reactive({
    current: 0
  });

  const displayValue = ref(`${prefix}0${suffix}`);
  let tween = null;

  function runAnimation(toVal) {
    if (tween) tween.kill();
    tween = gsap.to(state, {
      current: toVal,
      duration,
      delay,
      ease,
      onUpdate: () => {
        displayValue.value = `${prefix}${formatNumberWithSeparator(state.current, decimals, separator)}${suffix}`;
      },
      onComplete: () => {
        displayValue.value = `${prefix}${formatNumberWithSeparator(toVal, decimals, separator)}${suffix}`;
      }
    });
  }

  onMounted(() => {
    const target = parseVal(isRef(targetValue) ? targetValue.value : targetValue);
    runAnimation(target);
  });

  if (isRef(targetValue)) {
    watch(targetValue, (newVal) => {
      runAnimation(parseVal(newVal));
    });
  }

  onBeforeUnmount(() => {
    if (tween) tween.kill();
  });

  return {
    displayValue,
    animateTo: (val) => runAnimation(parseVal(val)),
    kill: () => tween && tween.kill()
  };
}

/**
 * 2. 扫码主按钮轻触反馈 (Active 按压微缩放)
 * 支持原生 touch / pointer 事件，提供真实移动端物理回弹触感
 */
export function useButtonPress(buttonRef, options = {}) {
  const {
    pressScale = 0.965,
    pressDuration = 0.1,
    releaseDuration = 0.35,
    ease = 'back.out(2)'
  } = options;

  let isPressed = false;

  function onPress() {
    if (!buttonRef.value || isPressed) return;
    isPressed = true;
    gsap.to(buttonRef.value, {
      scale: pressScale,
      duration: pressDuration,
      ease: 'power1.out',
      overwrite: 'auto'
    });
  }

  function onRelease() {
    if (!buttonRef.value || !isPressed) return;
    isPressed = false;
    gsap.to(buttonRef.value, {
      scale: 1,
      duration: releaseDuration,
      ease,
      overwrite: 'auto'
    });
  }

  onMounted(() => {
    const el = buttonRef.value;
    if (!el) return;

    el.addEventListener('pointerdown', onPress);
    el.addEventListener('pointerup', onRelease);
    el.addEventListener('pointercancel', onRelease);
    el.addEventListener('pointerleave', onRelease);
  });

  onBeforeUnmount(() => {
    const el = buttonRef.value;
    if (!el) return;
    el.removeEventListener('pointerdown', onPress);
    el.removeEventListener('pointerup', onRelease);
    el.removeEventListener('pointercancel', onRelease);
    el.removeEventListener('pointerleave', onRelease);
    gsap.killTweensOf(el);
  });

  return {
    triggerPressEffect: () => {
      onPress();
      setTimeout(onRelease, 120);
    }
  };
}

/**
 * 3. 列表卡片交错入场动画 (Stagger Enter)
 */
export function useStaggerListEnter(containerRef, itemSelector = '.rcm-stagger-item', options = {}) {
  const {
    stagger = 0.08,
    duration = 0.55,
    y = 22,
    ease = 'power2.out',
    delay = 0.15
  } = options;

  let animation = null;

  function play() {
    nextTick(() => {
      if (!containerRef.value) return;
      const items = containerRef.value.querySelectorAll(itemSelector);
      if (!items || items.length === 0) return;

      if (animation) animation.kill();

      gsap.set(items, { opacity: 0, y });
      animation = gsap.to(items, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        delay,
        clearProps: 'transform,opacity'
      });
    });
  }

  onMounted(() => {
    play();
  });

  onBeforeUnmount(() => {
    if (animation) animation.kill();
    if (containerRef.value) {
      const items = containerRef.value.querySelectorAll(itemSelector);
      gsap.killTweensOf(items);
    }
  });

  return {
    play
  };
}

/**
 * 综合组合式函数封装：useMobileInteractions
 */
export function useMobileInteractions() {
  return {
    useSmoothNumber,
    useButtonPress,
    useStaggerListEnter
  };
}
