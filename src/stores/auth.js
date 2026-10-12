import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { loginUser, logoutUser } from '../api/auth.js';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('rcm_auth_token') || '');
  const userProfile = ref(
    JSON.parse(localStorage.getItem('rcm_user_profile') || 'null') || {
      id: 'usr-001',
      username: 'admin',
      name: '塔里克·卡西姆 (配给总督察官)',
      role: 'admin',
      department: '国家配给监督司'
    }
  );

  const isAuthenticated = computed(() => !!token.value);
  const currentRole = computed(() => userProfile.value?.role || 'admin');

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
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    token.value = '';
    userProfile.value = null;
    localStorage.removeItem('rcm_auth_token');
    localStorage.removeItem('rcm_user_profile');
    ElMessage.info('已安全退出登录');
  }

  /**
   * 切换当前查看角色
   */
  function switchRole(role) {
    if (!userProfile.value) return;
    userProfile.value.role = role;
    if (role === 'admin') {
      userProfile.value.name = '塔里克·卡西姆 (配给总督察官)';
    } else if (role === 'citizen') {
      userProfile.value.name = '艾哈迈德·哈桑·萨利赫 (户主)';
    } else if (role === 'agent') {
      userProfile.value.name = '穆罕默德·贾巴尔 (第一代销网点)';
    }
    localStorage.setItem('rcm_user_profile', JSON.stringify(userProfile.value));
    ElMessage.success(`角色已切换为【${role.toUpperCase()}】模式`);
  }

  return {
    token,
    userProfile,
    isAuthenticated,
    currentRole,
    login,
    logout,
    switchRole
  };
});
