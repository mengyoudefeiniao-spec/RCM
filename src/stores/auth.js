import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginUser, logoutUser } from '../api/auth.js';
import { ElMessage } from 'element-plus';

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

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('rcm_auth_token') || '');
  const userProfile = ref(
    JSON.parse(localStorage.getItem('rcm_user_profile') || 'null') || {
      id: 'usr-admin-01',
      username: 'minister_center',
      name: '阿卜杜勒·拉赫曼 (配给中心部长)',
      role: 'minister_center',
      department: '贸易部配给中心部',
      title: '配给中心部长'
    }
  );

  const isAuthenticated = computed(() => !!token.value);
  const currentRole = computed(() => userProfile.value?.role || 'minister_center');

  // 管理员多维研判
  const isAdmin = computed(() => ADMIN_ROLES.includes(currentRole.value));
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
    // 兼容通用 super admin 模式
    if (currentRole.value === 'admin') return true;
    const list = currentAuthorities.value;
    return list.some((item) => item.key === authorityKey);
  }

  /**
   * 登录
   */
  async function login(username, password) {
    try {
      const res = await loginUser({ username, password });
      token.value = res.token;
      userProfile.value = res.user;

      localStorage.setItem('rcm_auth_token', res.token);
      localStorage.setItem('rcm_user_profile', JSON.stringify(res.user));

      ElMessage.success(`欢迎进入系统，${res.user.name}`);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * 退出登录
   */
  async function logout() {
    // 1. 同步立即清除本地 Token 与用户资料，确保路由守卫立即放行至登录页且避免竞态重定向
    token.value = '';
    userProfile.value = null;
    localStorage.removeItem('rcm_auth_token');
    localStorage.removeItem('rcm_user_profile');

    // 2. 派发全局事件通知关闭并卸载客服对话浮窗
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rcm-close-chat'));
    }

    // 3. 异步通知网关与认证中心吊销 Token
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    ElMessage.info('已安全退出登录');
  }

  /**
   * 切换当前查看角色 (支持新拆分的三种管理员身份)
   */
  function switchRole(role) {
    if (!userProfile.value) return;
    userProfile.value.role = role;

    switch (role) {
      case ROLE_MINISTER_CENTER:
        userProfile.value.name = '阿卜杜勒·拉赫曼 (配给中心部长)';
        userProfile.value.department = '贸易部配给中心部';
        userProfile.value.title = '配给中心部长';
        break;
      case ROLE_DEPUTY_MINISTER:
        userProfile.value.name = '法鲁克·卡西姆 (行政次长)';
        userProfile.value.department = '贸易部行政次长室';
        userProfile.value.title = '行政次长';
        break;
      case ROLE_DIRECTOR_PLANNING:
        userProfile.value.name = '塔里克·萨利赫 (规划与跟进司总干事)';
        userProfile.value.department = '规划与跟进司';
        userProfile.value.title = '规划与跟进司总干事';
        break;
      case 'citizen':
        userProfile.value.name = '艾哈迈德·哈桑·萨利赫 (户主)';
        userProfile.value.department = '巴格达省卡尔赫区';
        userProfile.value.title = '配给卡公民户主';
        break;
      case 'agent':
        userProfile.value.name = '穆罕默德·贾巴尔 (第一代销网点)';
        userProfile.value.department = '综合食品面粉代销网点';
        userProfile.value.title = '配给代销责任人';
        break;
      default:
        userProfile.value.name = '阿卜杜勒·拉赫曼 (配给中心部长)';
        userProfile.value.department = '贸易部配给中心部';
        userProfile.value.title = '配给中心部长';
    }

    localStorage.setItem('rcm_user_profile', JSON.stringify(userProfile.value));

    // 先清除可能残留的旧提示，防止多条堆叠
    ElMessage.closeAll();

    // 弹出轻量提示，设置短 duration (1.5秒)、允许手动关闭及分组显示
    const msgInstance = ElMessage({
      message: `角色已切换为【${userProfile.value.title}】模式`,
      type: 'success',
      duration: 1500,
      showClose: true,
      grouping: true
    });

    // 兜底双重保障定时器：无论移动端触控/鼠标悬停是否卡死 Element Plus 内部计时器，1.8秒后强制关闭该提示
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

  return {
    token,
    userProfile,
    isAuthenticated,
    currentRole,
    isAdmin,
    isMinisterCenter,
    isDeputyMinister,
    isDirectorPlanning,
    currentAuthorities,
    hasAuthority,
    login,
    logout,
    switchRole
  };
});
