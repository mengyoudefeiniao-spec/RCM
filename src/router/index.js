import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '../components/layout/AppLayout.vue';

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
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
        meta: { title: '业务调度大盘' }
      },
      {
        path: 'citizen',
        name: 'CitizenFamily',
        component: () => import('../views/citizen/CitizenFamilyView.vue'),
        meta: { title: '公民与家庭管理' }
      },
      {
        path: 'citizen/change-head',
        name: 'ChangeHead',
        component: () => import('../views/citizen/ChangeHeadView.vue'),
        meta: { title: '变更户主申请' }
      },
      {
        path: 'citizen/unfreeze',
        name: 'Unfreeze',
        component: () => import('../views/citizen/UnfreezeView.vue'),
        meta: { title: '申请解冻申报' }
      },
      {
        path: 'citizen/split-household',
        name: 'SplitHousehold',
        component: () => import('../views/citizen/SplitHouseholdView.vue'),
        meta: { title: '申请分立分户' }
      },
      {
        path: 'review',
        name: 'ElectronicReview',
        component: () => import('../views/review/ElectronicReviewView.vue'),
        meta: { title: '电子审核工作台' }
      },
      {
        path: 'warehouse',
        name: 'Warehouse',
        component: () => import('../views/warehouse/WarehouseView.vue'),
        meta: { title: '仓储战略储备' }
      },
      {
        path: 'agent',
        name: 'AgentMgmt',
        component: () => import('../views/agent/AgentMgmtView.vue'),
        meta: { title: '代销网点治理' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 全局路由导航守卫：统一 Token 验证与鉴权
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('rcm_auth_token');
  const isPublic = to.meta?.public;

  if (to.meta?.title) {
    document.title = `${to.meta.title} - 国家数字配给卡综合服务平台`;
  }

  if (!token && !isPublic) {
    next('/login');
  } else if (token && to.path === '/login') {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
