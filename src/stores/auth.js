import { isEnNow } from '../utils/langHint.js';
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginUser, logoutUser } from '../api/auth.js';
import { ElMessage } from 'element-plus';
import { i18n } from '../locales/index.js';

/**
 * 管理员角色体系与法定职权常量定义
 * 对标 Spring Cloud Auth 授权中心与 RBAC
 */
export const ROLE_MINISTER_CENTER = 'minister_center';     // 配给中心部长
export const ROLE_DEPUTY_MINISTER = 'deputy_minister';     // 行政次长
export const ROLE_DIRECTOR_PLANNING = 'director_planning'; // 规划与跟进司总干事
export const ROLE_CITIZEN = 'citizen';                     // 配给卡公民
export const ROLE_AGENT = 'agent';                         // 配给代理网点

// 全部管理员角色集合
export const ADMIN_ROLES = [
  ROLE_MINISTER_CENTER,
  ROLE_DEPUTY_MINISTER,
  ROLE_DIRECTOR_PLANNING,
  'admin' // 向后兼容
];

/**
 * 管理员法定专属职权映射表
 */
export const ROLE_AUTHORITIES_MAP = {
  // 1. 配给中心部长：授予代理权、统一代理权、设立代理权、拆分大型代理权
  [ROLE_MINISTER_CENTER]: [
    { key: 'GRANT_AGENT', name: '授予代理权', desc: '审核并核发新代理权准入与物资经营许可' },
    { key: 'UNIFY_AGENT', name: '统一代理权', desc: '统筹规范辖区代理权标准化与统一经营体制' },
    { key: 'ESTABLISH_AGENT', name: '设立代理权', desc: '根据人口密度与城市规划主动新设代理网点' },
    { key: 'SPLIT_LARGE_AGENT', name: '拆分大型代理权', desc: '针对超过 1,500 户容量红线网点执行拆分重组' }
  ],
  // 2. 行政次长：已故代理代理权的轮替、已注销代理权的恢复（前提是规划与跟进司确认）
  [ROLE_DEPUTY_MINISTER]: [
    { key: 'DECEASED_ROTATION', name: '已故代理轮替', desc: '裁决并签发代理人死亡后三代亲属 12 个月继承轮替' },
    { key: 'RESTORE_AGENT', name: '恢复已注销代理权', desc: '经规划与跟进司联合调查确认后，最终核准恢复代理权' }
  ],
  // 3. 规划与跟进司总干事：代理注销、代理轮替/转移、合并代理权和处罚
  [ROLE_DIRECTOR_PLANNING]: [
    { key: 'CANCEL_AGENT', name: '代理注销', desc: '受理并执行代理权主动注销清退与资格清算' },
    { key: 'ROTATE_TRANSFER_AGENT', name: '代理轮替/转移', desc: '审批在任代理人自愿轮替转移与已故轮替初审' },
    { key: 'MERGE_AGENT', name: '合并代理权', desc: '合并低于 750 户的小型或相邻网点并优化运力' },
    { key: 'PENALIZE_AGENT', name: '处罚', desc: '对违规违纪网点实施行政处罚、责令停业整顿或吊销' }
  ]
};

/**
 * 根据指定角色名称构建独立的用户画像资料
 */
export function createProfileByRole(role) {
  switch (role) {
    case ROLE_MINISTER_CENTER:
      return {
        id: 'usr-admin-01',
        username: 'minister_center',
        name: '阿卜杜勒·拉赫曼 (配给中心部长)',
        displayNameKey: 'mail.senderMinisterCenterName',
        role: ROLE_MINISTER_CENTER,
        department: '贸易部配给中心部',
        title: '配给中心部长'
      };
    case ROLE_DEPUTY_MINISTER:
      return {
        id: 'usr-admin-02',
        username: 'deputy_minister',
        name: '法鲁克·卡西姆 (行政次长)',
        displayNameKey: 'mail.senderDeputyMinisterName',
        role: ROLE_DEPUTY_MINISTER,
        department: '贸易部行政次长室',
        title: '行政次长'
      };
    case ROLE_DIRECTOR_PLANNING:
      return {
        id: 'usr-admin-03',
        username: 'director_planning',
        name: '塔里克·萨利赫 (规划与跟进司总干事)',
        displayNameKey: 'mail.senderDirectorPlanningName',
        role: ROLE_DIRECTOR_PLANNING,
        department: '规划与跟进司',
        title: '规划与跟进司总干事'
      };
    case 'citizen':
      return {
        id: 'usr-cit-01',
        username: 'RC-10029381',
        cardNo: 'RC-10029381',
        name: '艾哈迈德·哈桑·萨利赫 (户主)',
        displayNameKey: 'mail.senderCitizenName',
        role: 'citizen',
        department: '巴格达省卡尔赫区',
        title: '配给卡公民户主'
      };
    case 'agent':
      return {
        id: 'usr-agt-01',
        username: 'agent_jabar',
        name: '穆罕默德·贾巴尔 (第一代销网点)',
        displayNameKey: 'mail.senderAgentName',
        role: 'agent',
        department: '综合食品面粉代销网点',
        title: '配给代销责任人'
      };
    case 'admin':
    default:
      return {
        id: 'usr-admin-01',
        username: 'minister_center',
        name: '阿卜杜勒·拉赫曼 (配给中心部长)',
        displayNameKey: 'mail.senderMinisterCenterName',
        role: ROLE_MINISTER_CENTER,
        department: '贸易部配给中心部',
        title: '配给中心部长'
      };
  }
}

/**
 * 获取当前标签页初始 Profile (优先按 URL role 参数与 sessionStorage 隔离)
 */
function getInitialProfile() {
  if (typeof window !== 'undefined') {
    let existingProfile = null;
    try { existingProfile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || 'null'); } catch (_) { /* ignore invalid cache */ }
    // 1. 优先提取当前 URL hash 中的 role 参数 (如 #/citizen?role=citizen)
    const hash = window.location.hash || '';
    const match = hash.match(/[\?&]role=([^&]+)/);
    const demoRequested = /[\?&]demo=true(?:&|$)/.test(hash);
    const forceRoleRequested = /[\?&]forceRole=true(?:&|$)/.test(hash);
    // Registered citizen and agent sessions belong to a real account and must
    // not be replaced by the demo profile carried in a `role=` query string.
    const registeredSession = existingProfile?.registeredAccount === true
      || (existingProfile?.role === 'citizen' && existingProfile?.needsFamilySetup && existingProfile?.nationalId);
    if (match && match[1] && (!registeredSession || demoRequested || forceRoleRequested)) {
      const urlRole = decodeURIComponent(match[1]);
      const profile = createProfileByRole(urlRole);
      sessionStorage.setItem('rcm_user_profile', JSON.stringify(profile));
      sessionStorage.setItem('rcm_auth_token', 'mock-token-' + urlRole);
      return profile;
    }

    // 2. 检查 sessionStorage 当前标签页专属存储
    try {
      const sess = sessionStorage.getItem('rcm_user_profile');
      if (sess) return JSON.parse(sess);
    } catch (e) {
      // ignore
    }

    // 3. 兜底从 localStorage 读取
    try {
      const local = localStorage.getItem('rcm_user_profile');
      if (local) {
        const p = JSON.parse(local);
        sessionStorage.setItem('rcm_user_profile', local);
        return p;
      }
    } catch (e) {
      // ignore
    }
  }

  // 默认部长
  const defaultProf = createProfileByRole(ROLE_MINISTER_CENTER);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('rcm_user_profile', JSON.stringify(defaultProf));
  }
  return defaultProf;
}

function getInitialToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('rcm_auth_token') || localStorage.getItem('rcm_auth_token') || 'mock-token-admin';
  }
  return 'mock-token-admin';
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getInitialToken());
  const userProfile = ref(getInitialProfile());
  const pendingIdentityVerification = ref(null);

  const isAuthenticated = computed(() => !!token.value);
  const currentRole = computed(() => userProfile.value?.role || 'minister_center');

  // 管理员多维研判
  const isAdmin = computed(() => ADMIN_ROLES.includes(currentRole.value));
  const hasPermission = (code) => {
    if (!code || isAdmin.value) return true;
    const codes = userProfile.value?.permissionCodes;
    return !Array.isArray(codes) || codes.includes(code) || codes.some((permission) => String(permission).startsWith(`${code}.`));
  };
  const isMinisterCenter = computed(() => currentRole.value === ROLE_MINISTER_CENTER);
  const isDeputyMinister = computed(() => currentRole.value === ROLE_DEPUTY_MINISTER);
  const isDirectorPlanning = computed(() => currentRole.value === ROLE_DIRECTOR_PLANNING);

  // 当前角色的法定专属职权清单
  const currentAuthorities = computed(() => {
    return ROLE_AUTHORITIES_MAP[currentRole.value] || [];
  });

  /**
   * 校验当前角色是否具备指定专属职权
   */
  function hasAuthority(authorityKey) {
    if (currentRole.value === 'admin') return true;
    const list = currentAuthorities.value;
    return list.some((item) => item.key === authorityKey);
  }

  /**
   * 登录
   */
  async function login(username, password, options = {}) {
    pendingIdentityVerification.value = null;
    try {
      const res = await loginUser({ username, password, role: options.role || undefined });
      completeIdentityLogin(res);

      const demoNameKey = res.user.needsFamilySetup || res.user.registeredAccount ? null : res.user.role === 'citizen'
        ? 'login.demoCitizenName'
        : res.user.role === 'agent'
          ? 'login.demoAgentName'
          : null;
      const displayName = demoNameKey ? i18n.global.t(demoNameKey) : res.user.name;
      ElMessage.success(i18n.global.t('login.welcomeMessage', { name: displayName }));
      return true;
    } catch (err) {
      if (err.code === 428 && err.verification?.challenge) {
        pendingIdentityVerification.value = err.verification;
      }
      return false;
    }
  }

  function completeIdentityLogin(result) {
    if (!result?.token || !result?.user) throw new Error('Missing authenticated session');
    token.value = result.token;
    userProfile.value = result.user;
    sessionStorage.setItem('rcm_auth_token', result.token);
    sessionStorage.setItem('rcm_user_profile', JSON.stringify(result.user));
    localStorage.setItem('rcm_auth_token', result.token);
    localStorage.setItem('rcm_user_profile', JSON.stringify(result.user));
    pendingIdentityVerification.value = null;
  }

  /**
   * 退出登录
   */
  async function logout() {
    pendingIdentityVerification.value = null;
    token.value = '';
    userProfile.value = null;
    sessionStorage.removeItem('rcm_auth_token');
    sessionStorage.removeItem('rcm_user_profile');
    localStorage.removeItem('rcm_auth_token');
    localStorage.removeItem('rcm_user_profile');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rcm-close-chat'));
    }

    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    ElMessage.info(i18n.global.t('my.logoutSuccess'));
  }

  /**
   * 显式设定当前标签页会话用户 (路由守卫识别到 URL role 时调用)
   */
  function setSessionUser(profile, tokenVal) {
    userProfile.value = profile;
    if (tokenVal) {
      token.value = tokenVal;
      sessionStorage.setItem('rcm_auth_token', tokenVal);
    }
    sessionStorage.setItem('rcm_user_profile', JSON.stringify(profile));
  }

  /**
   * 切换当前查看角色 (支持新拆分的三种管理员身份，单标签页会话隔离)
   */
  function switchRole(role) {
    const updated = createProfileByRole(role);
    userProfile.value = updated;
    token.value = 'mock-token-' + role;

    sessionStorage.setItem('rcm_user_profile', JSON.stringify(updated));
    sessionStorage.setItem('rcm_auth_token', token.value);

    // 先清除可能残留的旧提示，防止多条堆叠
    ElMessage.closeAll();

    const msgInstance = ElMessage({
      message: (isEnNow() ? `Role switched to [${updated.title}] mode` : `角色已切换为【${updated.title}】模式`),
      type: 'success',
      duration: 1500,
      showClose: true,
      grouping: true
    });

    setTimeout(() => {
      try {
        if (msgInstance && typeof msgInstance.close === 'function') {
          msgInstance.close();
        }
      } catch (e) {
        // 忽略可能已销毁的异常
      }
    }, 1800);
  }

  // 移动端现场核销作业专属模式激活状态
  const isMobileVerificationActive = ref(false);
  function setMobileVerificationActive(val) {
    isMobileVerificationActive.value = !!val;
  }

  return {
    token,
    userProfile,
    isAuthenticated,
    currentRole,
    isAdmin,
    hasPermission,
    isMinisterCenter,
    isDeputyMinister,
    isDirectorPlanning,
    currentAuthorities,
    hasAuthority,
    isMobileVerificationActive,
    setMobileVerificationActive,
    login,
    pendingIdentityVerification,
    completeIdentityLogin,
    logout,
    switchRole,
    setSessionUser
  };
});
