import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';

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
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: () => {
          const profile = JSON.parse(localStorage.getItem('rcm_user_profile') || '{}');
          return profile.role === 'citizen' ? '/citizen' : '/dashboard';
        }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '数据看板', roles: ['admin', 'agent'] }
      },
      {
        path: 'citizen',
        name: 'CitizenFamily',
        component: () => import('../views/citizen/CitizenFamilyView.vue'),
        meta: { title: '公民服务', roles: ['admin', 'citizen'] }
      },
      {
        path: 'citizen/change-head',
        name: 'ChangeHead',
        component: () => import('../views/citizen/ChangeHeadView.vue'),
        meta: { title: '变更户主申请', roles: ['admin', 'citizen'] }
      },
      {
        path: 'citizen/unfreeze',
        name: 'Unfreeze',
        component: () => import('../views/citizen/UnfreezeView.vue'),
        meta: { title: '申请解冻申报', roles: ['admin', 'citizen'] }
      },
      {
        path: 'citizen/split-household',
        name: 'SplitHousehold',
        component: () => import('../views/citizen/SplitHouseholdView.vue'),
        meta: { title: '申请分立分户', roles: ['admin', 'citizen'] }
      },
      {
        path: 'citizen/transfer-agent',
        name: 'TransferAgent',
        component: () => import('../views/citizen/TransferAgentView.vue'),
        meta: { title: '申请代理转移', roles: ['admin', 'citizen'] }
      },
      {
        path: 'review',
        name: 'ElectronicReview',
        component: () => import('../views/review/ElectronicReviewView.vue'),
        meta: { title: '审核工作台', roles: ['admin'] }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('../views/warehouse/WarehouseView.vue'),
        meta: { title: '仓储管理', roles: ['admin', 'agent'] }
      },
      {
        path: 'agent',
        name: 'AgentMgmt',
        component: () => import('../views/agent/AgentMgmtView.vue'),
        meta: { title: '代理管理', roles: ['admin', 'agent'] }
      },
      {
        path: 'admin',
        name: 'AdminManagement',
        component: () => import('../views/admin/AdminManagementView.vue'),
        meta: { title: '后台管理', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const profile = JSON.parse(localStorage.getItem('rcm_user_profile') || '{}');
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

// 全局路由导航守卫：统一 Token 验证与基于角色的 RBAC 鉴权
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('rcm_auth_token');
  const isPublic = to.meta?.public;
  const userProfile = JSON.parse(localStorage.getItem('rcm_user_profile') || '{}');
  const currentRole = userProfile.role || 'citizen';

  if (to.meta?.title) {
    document.title = `${to.meta.title} - 国家数字配给卡综合服务平台`;
  }

  // 1. 未登录拦截
  if (!token && !isPublic) {
    return next('/login');
  }

  // 2. 已登录访问登录页，跳转对应角色首页
  if (token && to.path === '/login') {
    return next(getDefaultPathByRole(currentRole));
  }

  // 3. 角色路由权限拦截
  if (token && to.meta?.roles && !to.meta.roles.includes(currentRole)) {
    // 越权访问，自动重定向到其合规首页
    return next(getDefaultPathByRole(currentRole));
  }

  next();
});

export default router;
