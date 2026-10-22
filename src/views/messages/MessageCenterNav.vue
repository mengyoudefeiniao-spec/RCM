<template>
  <nav class="message-subnav" :aria-label="t('mail.sectionNavigation')">
    <router-link to="/messages" class="message-subnav-link" :class="{ 'is-active': route.path === '/messages' }" :aria-current="route.path === '/messages' ? 'page' : undefined">
      <el-icon><Bell /></el-icon>
      <span>{{ t('mail.title') }}</span>
    </router-link>
    <router-link v-if="canReview" to="/messages/review" class="message-subnav-link" :class="{ 'is-active': route.path.startsWith('/messages/review') }" :aria-current="route.path.startsWith('/messages/review') ? 'page' : undefined">
      <el-icon><Stamp /></el-icon>
      <span>{{ t('mail.reviewPageTitle') }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Bell, Stamp } from '@element-plus/icons-vue';

defineProps({ canReview: { type: Boolean, default: false } });
const route = useRoute();
const { t } = useI18n();
</script>

<style scoped>
.message-subnav { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
.message-subnav-link { display: inline-flex; align-items: center; gap: .5rem; min-height: 2.5rem; border: 1px solid var(--el-border-color); border-radius: var(--el-border-radius-base); background: var(--el-bg-color); padding: .5rem .875rem; color: var(--el-text-color-regular); font-size: .875rem; font-weight: 500; text-decoration: none; transition: color .15s, background-color .15s, border-color .15s; }
.message-subnav-link:hover { border-color: var(--gold-border); background: var(--gold-soft); color: var(--gold-ink); }
.message-subnav-link.is-active { border-color: var(--gold-border); background: var(--secondary); color: var(--primary); font-weight: 600; }
.message-subnav-link:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
</style>
