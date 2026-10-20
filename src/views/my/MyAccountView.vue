<template>
  <div class="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 space-y-5 text-[#1F3326]">
    <header class="space-y-1">
      <h1 class="text-xl font-bold">{{ isCitizen ? $t('my.citizenTitle') : $t('my.agentTitle') }}</h1>
      <p class="text-sm text-[#58685D]">{{ isCitizen ? $t('my.citizenSubtitle') : $t('my.agentSubtitle') }}</p>
    </header>

    <section class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm flex items-center gap-4">
      <div class="size-14 shrink-0 rounded-xl bg-[#FDF3E0] text-[#7A5F21] flex items-center justify-center">
        <el-icon :size="28"><User /></el-icon>
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">{{ displayName }}</div>
        <div class="text-sm text-[#58685D] mt-0.5">
          <bdi dir="ltr">{{ isCitizen ? profile.phone : agentProfile?.phone }}</bdi>
        </div>
      </div>
      <span class="shrink-0 rounded-full bg-[#E2F4E4] px-2.5 py-1 text-xs font-semibold text-[#326445]">
        ● {{ $t(isCitizen ? 'my.verified' : 'my.authorized') }}
      </span>
    </section>

    <template v-if="isCitizen">
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-bold text-base">{{ $t('my.contactTitle') }}</h2>
          <el-button size="small" @click="openContactDialog"><el-icon class="me-1"><Edit /></el-icon>{{ $t('my.editContact') }}</el-button>
        </div>
        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Message /></el-icon><div class="min-w-0"><div class="text-xs text-[#8A9A8F]">{{ $t('my.email') }}</div><bdi dir="ltr" class="block break-all">{{ profile.email }}</bdi></div></div>
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Iphone /></el-icon><div><div class="text-xs text-[#8A9A8F]">{{ $t('my.phone') }}</div><bdi dir="ltr">{{ profile.phone }}</bdi></div></div>
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Location /></el-icon><div><div class="text-xs text-[#8A9A8F]">{{ $t('my.address') }}</div><span>{{ profile.address }}</span></div></div>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="grid grid-cols-4 gap-1 rounded-xl bg-[#EFF5F1] p-1.5">
        <button v-for="tab in agentTabs" :key="tab.key" type="button"
          class="min-w-0 rounded-lg px-1 py-2 text-xs sm:text-sm transition-colors flex flex-col items-center gap-1"
          :class="currentTab === tab.key ? 'bg-white text-[#326445] font-bold shadow-sm' : 'text-[#58685D]'"
          @click="currentTab = tab.key">
          <el-icon :size="18"><component :is="tab.icon" /></el-icon>
          <span class="truncate max-w-full">{{ $t(`my.${tab.key}`) }}</span>
        </button>
      </div>

      <section v-if="currentTab === 'overview'" class="space-y-4">
        <div class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm">
          <h2 class="font-bold mb-4">{{ $t('my.todayOverview') }}</h2>
          <div class="grid grid-cols-3 gap-2 text-center">
            <div><div class="text-xl font-bold text-[#326445]">{{ outlets.length }}</div><div class="text-xs text-[#58685D]">{{ $t('my.outletCount') }}</div></div>
            <div><div class="text-xl font-bold text-[#326445]">{{ couriers.length }}</div><div class="text-xs text-[#58685D]">{{ $t('my.courierCount') }}</div></div>
            <div><div class="text-xl font-bold text-[#C9A13B]">{{ unreadCount }}</div><div class="text-xs text-[#58685D]">{{ $t('my.unread') }}</div></div>
          </div>
        </div>
        <div class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm space-y-3">
          <h2 class="font-bold">{{ $t('my.pendingItems') }}</h2>
          <button type="button" class="w-full text-start flex items-center justify-between gap-3 border-b border-[#E9F1EB] pb-3 text-sm" @click="currentTab = 'notifications'">
            <span>{{ $t('my.pendingStock') }}</span><el-icon class="rtl-mirror-icon"><ArrowRight /></el-icon>
          </button>
          <button type="button" class="w-full text-start flex items-center justify-between gap-3 text-sm" @click="currentTab = 'notifications'">
            <span>{{ $t('my.pendingDelivery') }}</span><el-icon class="rtl-mirror-icon"><ArrowRight /></el-icon>
          </button>
        </div>
      </section>
    </template>

    <section v-if="isCitizen || currentTab === 'notifications'" class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2">
          <el-icon class="text-[#326445]"><Bell /></el-icon>
          <h2 class="font-bold">{{ $t('my.notificationCenter') }}</h2>
          <span v-if="unreadCount" class="rounded-full bg-[#FDF3E0] px-2 py-0.5 text-xs text-[#7A5F21]">{{ $t('my.unreadCount', { count: unreadCount }) }}</span>
        </div>
        <el-button v-if="unreadCount" size="small" text type="primary" @click="markAllRead">{{ $t('my.markAllRead') }}</el-button>
      </div>
      <div v-if="notifications.length === 0" class="py-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noNotifications') }}</div>
      <div v-for="item in notifications" :key="item.id" class="border-t border-[#E9F1EB] py-3 first:border-t-0">
        <button type="button" class="w-full text-start flex items-start gap-3" @click="openNotification(item)">
          <span class="mt-1 size-2 shrink-0 rounded-full" :class="item.read ? 'bg-[#D9E5DB]' : 'bg-[#C9A13B]'" />
          <span class="min-w-0 flex-1">
            <span class="flex items-center justify-between gap-2"><span class="font-semibold text-sm">{{ $t(`my.notice.${role}.${item.type}.title`) }}</span><span class="text-[11px] text-[#8A9A8F] shrink-0" dir="ltr">{{ formatDate(item.createdAt) }}</span></span>
            <span class="block mt-1 text-xs leading-relaxed text-[#58685D]">{{ $t(`my.notice.${role}.${item.type}.body`) }}</span>
            <span class="block mt-1 text-xs font-semibold text-[#326445]">{{ $t('my.viewRelated') }}</span>
          </span>
          <el-icon class="rtl-mirror-icon mt-1 text-[#58685D]"><ArrowRight /></el-icon>
        </button>
      </div>
    </section>

    <section v-if="!isCitizen && currentTab === 'outlets'" class="space-y-3">
      <h2 class="font-bold">{{ $t('my.outletInfo') }}</h2>
      <div v-if="!outlets.length" class="rounded-xl bg-white p-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noOutlets') }}</div>
      <article v-for="outlet in outlets" :key="outlet.id || outlet.centerId" class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm space-y-3 text-sm">
        <div class="flex items-start justify-between gap-3"><div class="font-bold">{{ displayOutletName(outlet) }}</div><el-tag size="small" type="success">{{ outletStatus(outlet) }}</el-tag></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletCode') }}</div><bdi dir="ltr" class="font-mono">{{ outlet.id || outlet.centerId }}</bdi></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.center') }}</div><span>{{ displayCenter(outlet) }}</span></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletPhone') }}</div><bdi dir="ltr">{{ outlet.phone || agentProfile?.phone }}</bdi></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletAddress') }}</div><span>{{ displayOutletAddress(outlet) }}</span></div>
        </div>
      </article>
    </section>

    <section v-if="!isCitizen && currentTab === 'couriers'" class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-3"><h2 class="font-bold">{{ $t('my.courierManagement') }}</h2><el-button size="small" type="primary" @click="openCourierDialog()"><el-icon class="me-1"><Plus /></el-icon>{{ $t('my.addCourier') }}</el-button></div>
      <div v-if="!couriers.length" class="py-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noCouriers') }}</div>
      <article v-for="courier in couriers" :key="courier.id" class="border-t border-[#E9F1EB] py-3 flex items-center gap-3">
        <div class="size-10 shrink-0 rounded-full bg-[#EFF5F1] flex items-center justify-center text-[#326445]"><el-icon><Van /></el-icon></div>
        <div class="min-w-0 flex-1 text-sm"><div class="font-semibold">{{ courier.name }} <span class="ms-1 text-xs font-normal" :class="courier.active ? 'text-[#326445]' : 'text-[#8A9A8F]'">{{ $t(courier.active ? 'my.active' : 'my.inactive') }}</span></div><div class="text-xs text-[#58685D]"><bdi dir="ltr">{{ courier.phone }}</bdi> · <bdi dir="ltr">{{ courier.vehicleNo }}</bdi></div></div>
        <el-button size="small" text @click="openCourierDialog(courier)"><el-icon><Edit /></el-icon></el-button>
        <el-button size="small" text type="danger" @click="removeCourier(courier)"><el-icon><Delete /></el-icon></el-button>
      </article>
    </section>

    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm space-y-2">
      <el-button class="w-full !justify-start" text @click="passwordDialogOpen = true"><el-icon class="me-2"><Lock /></el-icon>{{ $t('my.changePassword') }}</el-button>
      <el-button class="w-full !justify-start !ms-0" text type="danger" @click="handleLogout"><el-icon class="me-2"><SwitchButton /></el-icon>{{ $t('my.logout') }}</el-button>
    </section>

    <el-dialog v-model="contactDialogOpen" :title="$t('my.editContact')" width="min(92vw, 440px)" append-to-body>
      <el-form label-position="top" @submit.prevent="saveContact">
        <el-form-item :label="$t('my.email')"><el-input v-model.trim="contactForm.email" type="email" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.phone')"><el-input v-model.trim="contactForm.phone" type="tel" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.address')"><el-input v-model.trim="contactForm.address" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="contactDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="saveContact">{{ $t('my.saveContact') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="courierDialogOpen" :title="$t(courierForm.id ? 'my.editCourier' : 'my.addCourier')" width="min(92vw, 440px)" append-to-body>
      <el-form label-position="top" @submit.prevent="saveCourier">
        <el-form-item :label="$t('my.courierName')"><el-input v-model.trim="courierForm.name" /></el-form-item>
        <el-form-item :label="$t('my.phone')"><el-input v-model.trim="courierForm.phone" type="tel" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.vehicleNo')"><el-input v-model.trim="courierForm.vehicleNo" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.active')"><el-switch v-model="courierForm.active" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="courierDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="saveCourier">{{ $t('my.saveCourier') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="passwordDialogOpen" :title="$t('my.changePassword')" width="min(92vw, 440px)" append-to-body @closed="resetPasswordForm">
      <el-form label-position="top" @submit.prevent="savePassword">
        <el-form-item :label="$t('my.currentPassword')"><el-input v-model="passwordForm.currentPassword" type="password" show-password autocomplete="current-password" /></el-form-item>
        <el-form-item :label="$t('my.newPassword')"><el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item :label="$t('my.confirmPassword')"><el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
        <div class="text-xs text-[#8A9A8F]">{{ $t('my.passwordHint') }}</div>
      </el-form>
      <template #footer><el-button @click="passwordDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="savePassword">{{ $t('my.changePassword') }}</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Edit, Message, Iphone, Location, Bell, ArrowRight, Van, Plus, Delete, Lock, SwitchButton, DataAnalysis, Shop } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import { getAgentProfile, getMyAgentCenters } from '../../api/agent.js';
import { getMyProfile, updateMyProfile, changeMyPassword, getMyNotifications, markMyNotificationsRead, getMyCouriers, createMyCourier, updateMyCourier, deleteMyCourier } from '../../api/my.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const role = computed(() => authStore.currentRole);
const isCitizen = computed(() => role.value === 'citizen');
const isAppMode = computed(() => route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app');
const profile = ref({ email: '', phone: '', address: '' });
const agentProfile = ref(null);
const outlets = ref([]);
const couriers = ref([]);
const notifications = ref([]);
const unreadCount = computed(() => notifications.value.filter(item => !item.read).length);
const currentTab = ref('overview');
const agentTabs = [
  { key: 'overview', icon: DataAnalysis }, { key: 'notifications', icon: Bell },
  { key: 'outlets', icon: Shop }, { key: 'couriers', icon: User }
];
const demoIdentity = computed(() => ['usr-cit-01', 'usr-002', 'usr-agt-01', 'usr-003'].includes(authStore.userProfile?.id));
const displayName = computed(() => demoIdentity.value ? t(isCitizen.value ? 'my.demoCitizenName' : 'my.demoAgentName') : (authStore.userProfile?.name || ''));
const contactDialogOpen = ref(false);
const courierDialogOpen = ref(false);
const passwordDialogOpen = ref(false);
const saving = ref(false);
const contactForm = reactive({ email: '', phone: '', address: '' });
const courierForm = reactive({ id: '', name: '', phone: '', vehicleNo: '', active: true });
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });

async function loadData() {
  try {
    const [account, inbox] = await Promise.all([getMyProfile(), getMyNotifications()]);
    profile.value = account;
    notifications.value = inbox;
    if (!isCitizen.value) {
      const [agent, sites, people] = await Promise.all([getAgentProfile(), getMyAgentCenters(), getMyCouriers()]);
      agentProfile.value = agent;
      outlets.value = sites;
      couriers.value = people;
    }
  } catch {
    ElMessage.error(t('my.loadFailed'));
  }
}

function formatDate(value) {
  if (!value) return '';
  const language = { zh: 'zh-CN', en: 'en-US', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-US';
  return new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(new Date(value));
}

function openContactDialog() {
  Object.assign(contactForm, profile.value);
  contactDialogOpen.value = true;
}

async function saveContact() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email) || !/^\+?[\d\s-]{7,20}$/.test(contactForm.phone) || !contactForm.address.trim()) {
    ElMessage.warning(t('my.invalidProfile'));
    return;
  }
  saving.value = true;
  try {
    profile.value = await updateMyProfile({ ...contactForm });
    contactDialogOpen.value = false;
    ElMessage.success(t('my.contactSaved'));
  } catch {
    // 请求层已显示后端错误。
  } finally { saving.value = false; }
}

async function markAllRead() {
  const ids = notifications.value.filter(item => !item.read).map(item => item.id);
  if (!ids.length) return;
  try {
    await markMyNotificationsRead(ids);
    notifications.value = notifications.value.map(item => ({ ...item, read: true }));
  } catch { /* 请求层负责提示 */ }
}

async function openNotification(item) {
  if (!item.read) {
    try {
      await markMyNotificationsRead([item.id]);
      item.read = true;
    } catch { /* 仍允许查看对应业务 */ }
  }
  await router.push(isAppMode.value ? { path: item.path, query: { layout: 'app' } } : item.path);
}

function displayOutletName(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoOutletName') : (outlet.name || outlet.centerName || '');
}

function displayCenter(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoCenterName') : (outlet.centerName || '');
}

function displayOutletAddress(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoAgentAddress') : (outlet.address || profile.value.address);
}

function outletStatus(outlet) {
  return /注销|停用|Cancel|Inactive/i.test(outlet.status || '') ? t('my.outletInactive') : t('my.outletActive');
}

function openCourierDialog(courier) {
  Object.assign(courierForm, courier || { id: '', name: '', phone: '', vehicleNo: '', active: true });
  courierDialogOpen.value = true;
}

async function saveCourier() {
  if (!courierForm.name.trim() || !/^\+?[\d\s-]{7,20}$/.test(courierForm.phone)) {
    ElMessage.warning(t('my.invalidCourier'));
    return;
  }
  saving.value = true;
  try {
    const payload = { name: courierForm.name, phone: courierForm.phone, vehicleNo: courierForm.vehicleNo, active: courierForm.active };
    if (courierForm.id) await updateMyCourier(courierForm.id, payload);
    else await createMyCourier(payload);
    couriers.value = await getMyCouriers();
    courierDialogOpen.value = false;
    ElMessage.success(t('my.courierSaved'));
  } catch { /* 请求层负责提示 */ }
  finally { saving.value = false; }
}

async function removeCourier(courier) {
  try {
    await ElMessageBox.confirm(t('my.deleteCourierConfirm'), t('my.deleteCourier'), { type: 'warning' });
    await deleteMyCourier(courier.id);
    couriers.value = await getMyCouriers();
    ElMessage.success(t('my.courierDeleted'));
  } catch { /* 用户取消或请求层已提示 */ }
}

function resetPasswordForm() {
  Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '' });
}

async function savePassword() {
  if (passwordForm.newPassword.length < 8) return ElMessage.warning(t('my.passwordTooShort'));
  if (passwordForm.newPassword !== passwordForm.confirmPassword) return ElMessage.warning(t('my.passwordMismatch'));
  saving.value = true;
  try {
    await changeMyPassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
    passwordDialogOpen.value = false;
    resetPasswordForm();
    ElMessage.success(t('my.passwordChanged'));
  } catch { /* 请求层负责提示 */ }
  finally { saving.value = false; }
}

async function handleLogout() {
  await authStore.logout();
  await router.replace('/login');
}

onMounted(loadData);
watch(role, loadData);
</script>
