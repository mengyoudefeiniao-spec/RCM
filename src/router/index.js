import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';
import { createProfileByRole, useAuthStore } from '../stores/auth.js';
import { i18n } from '../locales/index.js';

/**
 * 角色说明：
 * - citizen (公民): 仅可访问公民服务及其子页面
 * - agent (代理): 仅可访问代理管理、数据看板、仓储管理
 * - admin (监督官): 可访问全部面板（包括后台管理）
 */

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/LoginView.vue'),
    meta: { title: '用户登录', public: true }
  },
  {
    path: '/portal',
    name: 'PortalHub',
    component: () => import('../views/portal/PortalView.vue'),
    meta: { title: '国家物资配给综合调度门户', public: true }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: () => {
          const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
          return profile.role === 'citizen' ? '/citizen' : '/dashboard';
        }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '数据看板', roles: ['admin', 'agent'], permissionCode: 'dashboard.view' }
      },
      {
        path: 'stats',
        name: 'GeoStats',
        component: () => import('../views/stats/RationGeoStatsView.vue'),
        meta: { title: '配给地理统计', roles: ['admin', 'agent'], permissionCode: 'dashboard.view' }
      },
      {
        path: 'citizen',
        name: 'CitizenFamily',
        component: () => import('../views/citizen/CitizenFamilyView.vue'),
        meta: { title: '公民服务', roles: ['citizen'] }
      },
      {
        path: 'my',
        name: 'MyAccount',
        component: () => import('../views/my/MyAccountView.vue'),
        meta: { titleKey: 'my.title', roles: ['citizen', 'agent'] }
      },
      {
        path: 'citizen/change-head',
        name: 'ChangeHead',
        component: () => import('../views/citizen/ChangeHeadView.vue'),
        meta: { title: '变更户主申请', roles: ['citizen'] }
      },
      {
        path: 'citizen/unfreeze',
        name: 'Unfreeze',
        component: () => import('../views/citizen/UnfreezeView.vue'),
        meta: { title: '申请解冻申报', roles: ['citizen'] }
      },
      {
        path: 'citizen/ration-orders/:orderId',
        name: 'CitizenOrderDetail',
        component: () => import('../views/warehouse/CitizenOrderDetail.vue'),
        meta: { titleKey: 'citizenOrder.title', roles: ['citizen'] }
      },
      {
        path: 'citizen/split-household',
        name: 'SplitHousehold',
        component: () => import('../views/citizen/SplitHouseholdView.vue'),
        meta: { title: '申请分立分户', roles: ['citizen'] }
      },
      {
        path: 'citizen/transfer-agent',
        name: 'TransferAgent',
        component: () => import('../views/citizen/TransferAgentView.vue'),
        meta: { title: '申请代理转移', roles: ['citizen'] }
      },
      {
        path: 'citizen/member-transfer',
        name: 'MemberTransfer',
        component: () => import('../views/citizen/MemberTransferView.vue'),
        meta: { title: '申请成员转移', roles: ['citizen'] }
      },
      {
        path: 'review',
        name: 'ElectronicReview',
        component: () => import('../views/review/ElectronicReviewView.vue'),
        meta: { title: '审核工作台', roles: ['admin'], permissionCode: 'review.view' }
      },
      {
        path: 'complaint',
        name: 'ComplaintManagement',
        component: () => import('../views/complaint/ComplaintMgmtView.vue'),
        meta: { title: '投诉和处理', roles: ['admin'], permissionCode: 'complaints.view' }
      },
      {
        path: 'family-agent',
        name: 'FamilyAgent',
        component: () => import('../views/citizen/FamilyAgentView.vue'),
        meta: { title: '家庭代理', roles: ['citizen'] }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('../views/warehouse/WarehouseView.vue'),
        meta: { title: '配给管理', roles: ['admin', 'agent', 'citizen'], permissionCode: 'ration.view' }
      },
      {
        path: 'warehouse/delivery/:orderId',
        name: 'AgentDeliveryOrderDetail',
        component: () => import('../views/warehouse/AgentDeliveryOrderDetail.vue'),
        meta: { titleKey: 'agentDelivery.detailTitle', roles: ['agent'] }
      },
      {
        path: 'agent',
        name: 'AgentMgmt',
        component: () => import('../views/agent/AgentMgmtView.vue'),
        meta: { title: '代理管理', roles: ['admin', 'agent'], permissionCode: 'agents.view' }
      },
      {
        path: 'agent-orders',
        name: 'AgentOrders',
        component: () => import('../views/agent/AgentOrdersView.vue'),
        meta: { title: '代理订单', roles: ['agent', 'admin'], permissionCode: 'agents.view' }
      },
      {
        path: 'agent-analytics',
        name: 'AgentAnalytics',
        component: () => import('../views/agent/AgentAnalyticsView.vue'),
        meta: { title: '库存台账', roles: ['agent', 'admin'], permissionCode: 'agents.view' }
      },
      {
        path: 'admin',
        name: 'AdminManagement',
        component: () => import('../views/admin/AdminManagementView.vue'),
        meta: { title: '后台管理', roles: ['admin'], permissionCode: 'system.users' }
      },
      {
        path: 'system-management',
        name: 'SystemManagement',
        component: () => import('../views/admin/SystemManagementView.vue'),
        meta: { titleKey: 'system.title', roles: ['admin'], permissionCode: 'system.users' }
      },
      {
        path: 'messages',
        name: 'MessageCenter',
        component: () => import('../views/messages/MessageCenterView.vue'),
        meta: { titleKey: 'messages.title', roles: ['admin', 'agent', 'citizen'], permissionCode: 'messages.view', anyPermissionCodes: ['messages.send'] }
      },
      {
        path: 'messages/review',
        name: 'MessageReview',
        component: () => import('../views/messages/MessageReviewView.vue'),
        meta: { titleKey: 'mail.reviewPageTitle', roles: ['admin', 'agent', 'citizen'], permissionCode: 'messages.review' }
      },
      {
        path: 'access-denied',
        name: 'AccessDenied',
        component: () => import('../views/common/AccessDeniedView.vue'),
        meta: { titleKey: 'systemExtras.accessDenied' }
      },
      {
        path: 'mobile-agent',
        name: 'MobileAgentDashboard',
        component: () => import('../views/dashboard/components/MobileAgentDashboard.vue'),
        meta: { title: '现场核销作业 (Pixel 9)', roles: ['admin', 'agent'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const profile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
      return profile.role === 'citizen' ? '/citizen' : '/dashboard';
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 获取各角色默认可访问的首页
export function getDefaultPathByRole(role) {
  if (role === 'citizen') return '/citizen';
  return '/dashboard';
}

// 统一管理员角色集合
const ALL_ADMIN_ROLES = ['admin', 'minister_center', 'deputy_minister', 'director_planning'];

// 全局路由导航守卫：统一 Token 验证与基于角色的 RBAC 鉴权 (单标签页专属会话隔离)
router.beforeEach((to, from, next) => {
  // 优先从当前标签页私有的 sessionStorage 读取，实现多标签页角色隔离
  let token = sessionStorage.getItem('rcm_auth_token') || localStorage.getItem('rcm_auth_token');
  const isPublic = to.meta?.public;
  let userProfile = JSON.parse(sessionStorage.getItem('rcm_user_profile') || localStorage.getItem('rcm_user_profile') || '{}');
  let currentRole = userProfile.role || 'citizen';

  // 0. 自动识别 URL 查询参数中的目标角色身份并无缝同步至当前标签页专属 sessionStorage (Portal 新开标签页直达)
  if (to.query.role && to.path !== '/login') {
    const targetRole = String(to.query.role);
    const validRoles = ['citizen', 'agent', 'minister_center', 'deputy_minister', 'director_planning', 'admin'];
    if (validRoles.includes(targetRole)) {
      userProfile = createProfileByRole(targetRole);
      currentRole = targetRole;
      token = 'mock-token-' + targetRole;
      sessionStorage.setItem('rcm_user_profile', JSON.stringify(userProfile));
      sessionStorage.setItem('rcm_auth_token', token);

      try {
        const authStore = useAuthStore();
        authStore.setSessionUser(userProfile, token);
      } catch (e) {
        // ignore
      }
    }
  }

  // 若明确要求进入演示模式或注册模式，清除旧 session 避免被已登录拦截
  if (to.path === '/login' && (to.query.demo === 'true' || to.query.mode === 'register' || to.query.action === 'register')) {
    sessionStorage.removeItem('rcm_auth_token');
    sessionStorage.removeItem('rcm_user_profile');
    localStorage.removeItem('rcm_auth_token');
    token = null;
  }

  if (to.meta?.title || to.meta?.titleKey) {
    const pageTitle = to.meta.titleKey ? i18n.global.t(to.meta.titleKey) : (to.path === '/warehouse' && (currentRole === 'citizen' || currentRole === 'agent')) ? '配给管理' : to.meta.title;
    document.title = `${pageTitle} - Ration Card Management (RCM)`;
  }

  // 1. 未登录拦截
  if (!token && !isPublic) {
    return next('/login');
  }

  // 2. 已登录访问登录页，跳转对应角色首页
  if (token && to.path === '/login') {
    return next(getDefaultPathByRole(currentRole));
  }

  const requiredCodes = [to.meta?.permissionCode, ...(to.meta?.anyPermissionCodes || [])].filter(Boolean);
  const hasExplicitGrant = requiredCodes.length > 0 && (ALL_ADMIN_ROLES.includes(currentRole) || (Array.isArray(userProfile.permissionCodes) && userProfile.permissionCodes.some((code) => requiredCodes.some((requiredCode) => code === requiredCode || String(code).startsWith(`${requiredCode}.`)))));

  // 3. 角色路由权限拦截 (支持拆分后的三种管理员自动继承 admin 权限)
  if (token && to.meta?.roles) {
    const allowedRoles = [...to.meta.roles];
    if (allowedRoles.includes('admin')) {
      allowedRoles.push(...ALL_ADMIN_ROLES);
    }
    if (!allowedRoles.includes(currentRole) && !hasExplicitGrant) {
      // 越权访问，自动重定向到其合规首页
      return next(getDefaultPathByRole(currentRole));
    }
  }

  if (token && to.meta?.permissionCode && Array.isArray(userProfile.permissionCodes) && !ALL_ADMIN_ROLES.includes(currentRole) && !hasExplicitGrant) {
    return next('/access-denied');
  }

  next();
});

export default router;
