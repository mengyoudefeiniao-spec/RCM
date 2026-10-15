import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

/**
 * 判定当前是否处于 APP / 移动端模式
 * 与 AppLayout / LoginView 的判定规则保持一致：
 * 1. 路由 query: layout=app 或 mode=mobile
 * 2. 路由 query: layout=web 强制桌面模式
 * 3. 兜底读取 sessionStorage 中的布局模式记忆
 */
export function useAppMode() {
  const route = useRoute();
  const isAppMode = computed(() => {
    if (route.query.layout === 'app' || route.query.mode === 'mobile') return true;
    if (route.query.layout === 'web') return false;
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
  });
  return isAppMode;
}

/**
 * 弹窗紧凑模式组合式函数
 * APP 模式或窄屏视口下返回紧凑布局标识与自适应弹窗宽度，
 * 使注册流程弹窗族 (注册向导 / 生物人脸核验 / 异地远程核验 / 活体检测) 适配手机屏幕。
 */
export function useCompactDialog(desktopWidth = 680) {
  const isAppMode = useAppMode();
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1280);

  const handleResize = () => {
    if (typeof window !== 'undefined') windowWidth.value = window.innerWidth;
  };
  onMounted(() => window.addEventListener('resize', handleResize));
  onUnmounted(() => window.removeEventListener('resize', handleResize));

  // 紧凑布局：APP 模式 或 视口宽度 < 640px
  const isCompact = computed(() => isAppMode.value || windowWidth.value < 640);

  // 弹窗宽度：APP 模式对齐手机视口 (412px 手机框)，窄屏留出边距，桌面使用原始宽度
  const dialogWidth = computed(() => {
    if (isAppMode.value) return 'min(412px, calc(100vw - 16px))';
    if (windowWidth.value < 640) return 'calc(100vw - 24px)';
    return `${desktopWidth}px`;
  });

  return { isAppMode, isCompact, dialogWidth };
}
