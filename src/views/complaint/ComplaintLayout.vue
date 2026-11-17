<template>
  <div class="complaint-workspace space-y-6">
    <header class="workspace-overview">
      <div class="workspace-heading">
        <span class="workspace-icon"><el-icon><Service /></el-icon></span>
        <ModuleDescTip :title="t('complaint.title')" :content="t('complaint.subtitle')" :badge="t('complaint.badgeAiChannel')" badge-type="warning" title-class="text-lg font-bold text-[#1B3123]" />
      </div>
      <el-tag type="warning" effect="plain">{{ t('complaint.supervision') }}</el-tag>
    </header>

    <section class="workspace-panel" :aria-label="t('complaintAnalytics.navigation')">
      <el-tabs v-model="activeTab" class="complaint-tabs">
        <el-tab-pane name="handling">
          <template #label><span class="tab-label"><el-icon><Service /></el-icon>{{ t('complaintAnalytics.handling') }}</span></template>
          <div v-if="activeTab === 'handling'" class="workspace-content"><router-view /></div>
        </el-tab-pane>
        <el-tab-pane name="statistics" lazy>
          <template #label><span class="tab-label"><el-icon><DataAnalysis /></el-icon>{{ t('complaintAnalytics.title') }}</span></template>
          <div v-if="activeTab === 'statistics'" class="workspace-content"><router-view /></div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Service, DataAnalysis } from '@element-plus/icons-vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const activeTab = computed({
  get: () => route.path.startsWith('/complaint/statistics') ? 'statistics' : 'handling',
  set: value => router.push({ path: value === 'statistics' ? '/complaint/statistics' : '/complaint', query: route.query })
});
</script>

<style scoped>
.complaint-workspace { min-width: 0; }
.workspace-overview { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: white; border: 1px solid #D9E5DBCC; border-radius: .5rem; padding: 1.5rem; box-shadow: 0 1px 3px #1F332608; }
.workspace-heading { display: flex; align-items: center; gap: .75rem; min-width: 0; }
.workspace-icon { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; flex-shrink: 0; background: #C9A13B; border-radius: .5rem; color: white; font-size: 1.25rem; }
.workspace-panel { min-width: 0; overflow: hidden; border: 1px solid #D9E5DBCC; border-radius: .5rem; background: white; box-shadow: 0 1px 3px #1F332608; }
.complaint-tabs { padding-inline: 1.5rem; padding-top: .75rem; }
.complaint-tabs :deep(.el-tabs__header) { margin-bottom: 0; border-bottom: 1px solid #D9E5DB; }
.complaint-tabs :deep(.el-tabs__item) { padding-inline: 1rem; height: 3rem; font-size: .8125rem; }
.tab-label { display: inline-flex; align-items: center; gap: .4rem; font-weight: 700; padding-block: .25rem; }
.workspace-content { min-width: 0; padding-block: 1rem; }
@media (max-width: 640px) {
  .complaint-workspace { padding: .75rem; }
  .workspace-overview { padding: 1rem; align-items: start; flex-wrap: wrap; }
  .complaint-tabs { padding-inline: .75rem; padding-top: .5rem; }
  .workspace-content { padding-block: .75rem; }
}
</style>
