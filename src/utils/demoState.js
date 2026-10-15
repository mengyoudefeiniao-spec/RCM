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
 * - 'step1_7a': 生物核验弹窗 -> 点击“现场活体人脸采集” (第 1/3 项)
 * - 'step1_7b': 生物核验弹窗 -> 点击“扫描统一国民卡正面” (第 2/3 项)
 * - 'step1_7c': 生物核验弹窗 -> 点击“读取统一国民卡背面芯片” (第 3/3 项)
 * - 'step1_8': 生物核验弹窗 -> 点击“确认核验并放行进入”
 * - 'step1_9': 注册弹窗 Step 2 -> 点击“完成注册并签发电子配给卡”
 * - 'step1_done': 公民 APP 页面 -> 01 阶段完成提示
 *
 * 02 阶段子步骤枚举（配给购买与取货）：
 * - 'step2_1': 购买页 Step 1 -> 点击“一键选满本月配额”
 * - 'step2_2': 购买页 Step 1 -> 点击“选择配送方式”
 * - 'step2_3': 购买页 Step 2 -> 点击选择“送货上门”
 * - 'step2_4': 购买页 Step 2 -> 点击“下一步：支付”
 * - 'step2_5': 购买页 Step 3 -> 确认支付金额后点击“支付”
 * - 'step2_6': 电子支付弹窗 -> 输入支付密码确认支付
 * - 'step2_7': 支付成功 -> 提货二维码电子凭证（02 阶段演示完成，不关闭二维码窗口）
 *
 * 03 阶段子步骤枚举（政府端订单统计监控与审核穿透）：
 * - 'step3_1': 订单统计页 -> 下滑至「公民配给订单明细列表」并点击选中的第一条订单记录（默认最新提交订单）
 * - 'step3_done': 03 阶段完成提示
 *
 * 04 阶段子步骤枚举（代理端发货履约 · 订单配送）：
 * - 'step4_1': 订单配送页 -> 选中列表第一条订单并点击“安排配送”
 * - 'step4_2': 指派弹窗 -> 点击快捷配送员胶囊选择配送员
 * - 'step4_3': 指派弹窗 -> 点击“确认出车发货”（确认后即完成 04 阶段演示）
 * - 'step4_done': 04 阶段完成提示（引导跳转 05 阶段）
 *
 * 05 阶段子步骤枚举（公民出示防伪取货码）：
 * - 'step5_1': 配给购买与取货页申领记录 -> 选中第一条（最新配送中）订单，提示点击“提货码”
 * - 'step5_2': 提货二维码凭证弹窗 -> 提示将二维码交配送人员扫描后确认收货
 * - 'step5_done': 05 阶段完成提示
 *
 * 06 阶段子步骤枚举（代理端扫码核销 · 全流程最终阶段）：
 * - 'step6_1': 现场核销页 -> 点击“扫码核销”主按钮弹出扫码取景窗口
 * - 'step6_2': 扫码取景窗口 -> 扫描公民动态防伪二维码确认收货人并完成配送
 * - 'step6_done': 全流程演示完成提示（01-06 阶段全部完成）
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

/**
 * 清理当前地址（hash 路由）中的演示参数，
 * 防止退出后路由重进/组件重挂载时因 URL 仍带 demo=true 而被重新激活
 */
function cleanDemoQueryFromUrl() {
  if (typeof window === 'undefined' || !window.location || !window.location.hash) return;
  try {
    if (!window.location.hash.includes('?')) return;
    const [hashPath, hashQuery] = window.location.hash.split('?');
    const params = new URLSearchParams(hashQuery);
    let changed = false;
    ['demo', 'demoStep', 'done', 'step'].forEach((key) => {
      if (params.has(key)) {
        params.delete(key);
        changed = true;
      }
    });
    if (!changed) return;
    const qs = params.toString();
    const newHash = hashPath + (qs ? `?${qs}` : '');
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search + newHash
    );
  } catch (e) {
    // ignore
  }
}

export function deactivateDemo() {
  isDemoActive.value = false;
  demoSubStep.value = '';
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('rcm_demo_active');
    sessionStorage.removeItem('rcm_demo_substep');
  }
  cleanDemoQueryFromUrl();
}
