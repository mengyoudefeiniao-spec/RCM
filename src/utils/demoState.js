import { ref } from 'vue';

/**
 * 01 阶段子步骤枚举：
 * - 'step1_1': 登录页 -> 点击“注册”按钮
 * - 'step1_2': 注册弹窗 Step 0 -> 点击“拍照上传”
 * - 'step1_3': 注册弹窗 Step 1 -> 点击“户主姓名”自动输入
 * - 'step1_4': 注册弹窗 Step 1 -> 点击“获取验证码”
 * - 'step1_5': 注册弹窗 Step 1 -> 点击“一键填入”
 * - 'step1_6': 注册弹窗 Step 1 -> 点击“选择身份认证方式”
 * - 'step1_7': 注册弹窗 Step 2 -> 点击“立即启动人脸与国民卡核验”
 * - 'step1_8': 生物核验弹窗 -> 点击“确认核验并放行进入”
 * - 'step1_9': 注册弹窗 Step 2 -> 点击“完成注册并签发电子配给卡”
 * - 'step1_done': 公民 APP 页面 -> 01 阶段完成提示
 */

const getInitialDemoActive = () => {
  if (typeof window === 'undefined') return false;
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
  if (urlParams.get('demo') === 'true') return true;
  return sessionStorage.getItem('rcm_demo_active') === 'true';
};

const getInitialSubStep = () => {
  if (typeof window === 'undefined') return 'step1_1';
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
  if (urlParams.get('done') === 'true') return 'step1_done';
  const stepParam = urlParams.get('demoStep');
  if (stepParam) return stepParam;
  return sessionStorage.getItem('rcm_demo_substep') || 'step1_1';
};

export const isDemoActive = ref(getInitialDemoActive());
export const demoSubStep = ref(getInitialSubStep());

export function setDemoStep(step) {
  demoSubStep.value = step;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('rcm_demo_substep', step);
  }
}

export function activateDemo(step = 'step1_1') {
  isDemoActive.value = true;
  demoSubStep.value = step;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('rcm_demo_active', 'true');
    sessionStorage.setItem('rcm_demo_substep', step);
    sessionStorage.setItem('rcm_layout_mode', 'app');
  }
}

export function deactivateDemo() {
  isDemoActive.value = false;
  demoSubStep.value = '';
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('rcm_demo_active');
    sessionStorage.removeItem('rcm_demo_substep');
  }
}
