<template>
  <div class="complaint-statistics">

    <header class="page-header">
      <div class="heading"><span class="heading-dot" aria-hidden="true"></span><div><h1>{{ t('complaintAnalytics.title') }}</h1><p>{{ t('complaintAnalytics.subtitle') }}</p></div></div>
      <el-button :icon="Refresh" :loading="loading" @click="loadComplaints">{{ t('common.refresh') }}</el-button>
    </header>

    <section class="panel filters" :aria-label="t('complaint.filterSearch')">
      <div class="filter-grid">
        <label class="date-filter"><span>{{ t('complaintAnalytics.dateRange') }}</span>
          <el-date-picker v-model="filters.dates" type="daterange" value-format="YYYY-MM-DD" :start-placeholder="t('complaintAnalytics.start')" :end-placeholder="t('complaintAnalytics.end')" :aria-label="t('complaintAnalytics.dateRange')" unlink-panels />
        </label>
        <label><span>{{ t('complaint.channelSource') }}</span><el-select v-model="filters.channel" :aria-label="t('complaint.channelSource')"><el-option :label="t('complaint.allChannels')" value="" /><el-option v-for="channel in ['AI', 'PHONE']" :key="channel" :label="channelLabel(channel)" :value="channel" /></el-select></label>
        <label><span>{{ t('complaintAnalytics.category') }}</span><el-select v-model="filters.type" :aria-label="t('complaintAnalytics.category')"><el-option :label="t('complaint.allTypes')" value="" /><el-option v-for="type in typeOptions" :key="type" :label="typeLabel(type)" :value="type" /></el-select></label>
        <label><span>{{ t('common.province') }}</span><el-select v-model="filters.province" :aria-label="t('common.province')"><el-option :label="t('complaint.allProvinces')" value="" /><el-option v-for="province in provinces" :key="province" :label="regionLabel(province)" :value="province" /></el-select></label>
        <el-button class="reset" @click="resetFilters">{{ t('complaintAnalytics.reset') }}</el-button>
      </div>
      <p class="methodology">{{ t('complaintAnalytics.methodology') }} {{ t('complaintAnalytics.legacyNote') }}</p>
    </section>

    <div v-if="loadError" class="load-error" role="alert"><span>{{ t('complaintAnalytics.loadFailed') }}</span><el-button size="small" :loading="loading" @click="loadComplaints">{{ t('complaintAnalytics.retry') }}</el-button></div>

    <div :aria-busy="loading">
      <section class="metrics" :aria-label="t('complaintAnalytics.title')">
        <article v-for="metric in metrics" :key="metric.key" class="panel metric" :class="metric.tone">
          <span>{{ t(`complaintAnalytics.${metric.key}`) }}</span><strong>{{ metric.value }}</strong><small>{{ metric.note }}</small>
        </article>
      </section>

      <div v-if="!loading && !summary.rated" class="empty-rating" role="status"><el-icon><InfoFilled /></el-icon><div><strong>{{ t('complaintAnalytics.noRatings') }}</strong><p>{{ t('complaintAnalytics.noRatingsHint') }}</p></div></div>

      <div class="charts">
        <section class="panel chart-panel">
          <div class="section-heading"><h2>{{ t('complaintAnalytics.distribution') }}</h2><span>{{ t('complaintAnalytics.votes', { count: count(summary.rated) }) }}</span></div>
          <div class="distribution">
            <div v-for="bucket in summary.distribution" :key="bucket.score" class="score-row">
              <span>{{ t('complaintAnalytics.stars', { score: count(bucket.score) }) }}</span>
              <div class="bar-track"><div :class="{ low: bucket.score <= 2 }" :style="{ width: `${summary.rated ? bucket.count / summary.rated * 100 : 0}%` }"></div></div>
              <strong>{{ count(bucket.count) }}</strong><small>{{ percent(summary.rated ? bucket.count / summary.rated * 100 : null) }}</small>
            </div>
          </div>
        </section>
        <section class="panel chart-panel">
          <div class="section-heading"><h2>{{ t('complaintAnalytics.trend') }}</h2></div><p class="section-note">{{ t('complaintAnalytics.trendHint') }}</p>
          <div v-if="trend.length" class="table-scroll" tabindex="0" :aria-label="t('complaintAnalytics.trend')"><table class="trend-table"><thead><tr><th>{{ t('complaintAnalytics.month') }}</th><th>{{ t('complaintAnalytics.average') }}</th><th>{{ t('complaintAnalytics.rated') }}</th><th>{{ t('complaintAnalytics.low') }}</th></tr></thead><tbody><tr v-for="month in trend" :key="month.month"><th>{{ monthLabel(month.month) }}</th><td><div class="trend-score"><span class="bar-track"><span :style="{ width: `${month.average / 5 * 100}%` }"></span></span><strong>{{ scoreLabel(month.average) }}</strong></div></td><td>{{ count(month.rated) }}</td><td>{{ count(month.low) }}</td></tr></tbody></table></div>
          <p v-else class="empty-state">{{ t('complaintAnalytics.noData') }}</p>
        </section>
      </div>

      <section class="panel analysis-panel">
        <div class="section-heading"><div><h2>{{ t('complaintAnalytics.categories') }}</h2><p>{{ t('complaintAnalytics.categoryHint') }}</p></div></div>
        <div class="table-scroll" tabindex="0" :aria-label="t('complaintAnalytics.categories')"><table><thead><tr><th>{{ t('complaintAnalytics.category') }}</th><th>{{ t('complaintAnalytics.total') }}</th><th>{{ t('complaintAnalytics.share') }}</th><th>{{ t('complaintAnalytics.resolved') }}</th><th>{{ t('complaintAnalytics.rated') }}</th><th>{{ t('complaintAnalytics.average') }}</th><th>{{ t('complaintAnalytics.low') }}</th><th>{{ t('complaintAnalytics.records') }}</th></tr></thead>
          <tbody><tr v-for="category in categories" :key="category.key"><th>{{ typeLabel(category.key) }}</th><td>{{ count(category.total) }}</td><td><div class="share-cell"><span class="bar-track"><span :style="{ width: `${category.total / summary.total * 100}%` }"></span></span>{{ percent(category.total / summary.total * 100) }}</div></td><td>{{ count(category.resolved) }}</td><td>{{ count(category.rated) }}</td><td>{{ scoreLabel(category.average) }}</td><td :class="{ 'low-text': category.low }">{{ count(category.low) }}</td><td><el-button link type="primary" @click="openEvidence(() => typeLabel(category.key), selected.filter(ticket => ticket.typeCode === category.key))">{{ t('complaintAnalytics.details') }}</el-button></td></tr>
          <tr v-if="!categories.length"><td colspan="8" class="empty-state">{{ t('complaintAnalytics.noData') }}</td></tr></tbody></table></div>
        <div class="insights-heading"><h3>{{ t('complaintAnalytics.insights') }}</h3><p>{{ t('complaintAnalytics.insightHint') }} {{ t('complaintAnalytics.priorityRule') }}</p></div>
        <div class="insights-grid">
          <article v-for="insight in insights" :key="insight.key" class="insight" :class="{ urgent: insight.low }">
            <div class="section-heading"><h4>{{ t(`complaintAnalytics.themes.${insight.key}`) }}</h4><span class="priority" :class="insight.priority">{{ t(priorityKeys[insight.priority]) }}</span></div>
            <p class="insight-count">{{ t('complaintAnalytics.evidenceSummary', { total: count(insight.total), rated: count(insight.rated), low: count(insight.low) }) }}</p>
            <p>{{ t(`complaintAnalytics.suggestions.${insight.key}`) }}</p>
            <el-button link type="primary" @click="openEvidence(() => t(`complaintAnalytics.themes.${insight.key}`), insight.evidence)">{{ t('complaintAnalytics.evidence') }}<el-icon><Document /></el-icon></el-button>
          </article>
          <p v-if="!insights.length" class="empty-state">{{ t('complaintAnalytics.noData') }}</p>
        </div>
      </section>

      <section class="panel staff-panel">
        <div class="section-heading"><div><h2>{{ t('complaintAnalytics.staff') }}</h2><p>{{ t('complaintAnalytics.staffHint') }}</p></div><span>{{ t('complaintAnalytics.unassigned', { count: count(unassigned) }) }}</span></div>
        <div class="table-scroll" tabindex="0" :aria-label="t('complaintAnalytics.staff')"><table><thead><tr><th>{{ t('complaintAnalytics.person') }}</th><th>{{ t('complaintAnalytics.handled') }}</th><th>{{ t('complaintAnalytics.resolved') }}</th><th>{{ t('complaintAnalytics.sample') }}</th><th>{{ t('complaintAnalytics.coverage') }}</th><th>{{ t('complaintAnalytics.average') }}</th><th>{{ t('complaintAnalytics.satisfaction') }}</th><th>{{ t('complaintAnalytics.low') }}</th><th>{{ t('complaintAnalytics.hours') }}</th><th>{{ t('complaintAnalytics.records') }}</th></tr></thead>
          <tbody><tr v-for="person in staff" :key="person.key"><th class="person-cell">{{ staffLabel(person) }}</th><td>{{ count(person.total) }}</td><td>{{ count(person.resolved) }}</td><td><div class="sample-cell"><strong>{{ count(person.rated) }}</strong><small v-if="person.rated < 3" class="sample-note">{{ t('complaintAnalytics.insufficient') }}</small></div></td><td>{{ percent(person.coverage) }}</td><td>{{ scoreLabel(person.average) }}</td><td>{{ percent(person.satisfaction) }}</td><td :class="{ 'low-text': person.low }">{{ count(person.low) }}</td><td>{{ hoursLabel(person.hours) }}</td><td><el-button link type="primary" @click="openEvidence(() => staffLabel(person), person.tickets)">{{ t('complaintAnalytics.details') }}</el-button></td></tr>
          <tr v-if="!staff.length"><td colspan="10" class="empty-state">{{ t('complaintAnalytics.noData') }}</td></tr></tbody></table></div>
      </section>

      <section class="panel feedback-panel">
        <div class="section-heading"><div><h2>{{ t('complaintAnalytics.feedback') }}</h2><p>{{ t('complaintAnalytics.feedbackHint') }}</p></div><span>{{ t('complaintAnalytics.feedbackCount', { count: count(feedback.length) }) }}</span></div>
        <div class="feedback-tools"><div class="feedback-tabs" :aria-label="t('complaintAnalytics.feedback')"><button v-for="scope in feedbackScopes" :key="scope.value" type="button" :class="{ active: feedbackScope === scope.value }" :aria-pressed="feedbackScope === scope.value" @click="feedbackScope = scope.value">{{ t(scope.label) }}</button></div><el-input v-model="feedbackSearch" clearable :prefix-icon="Search" :placeholder="t('complaintAnalytics.search')" :aria-label="t('complaintAnalytics.search')" /></div>
        <div class="table-scroll" tabindex="0" :aria-label="t('complaintAnalytics.feedback')"><table><thead><tr><th>{{ t('review.ticketId') }}</th><th>{{ t('complaintAnalytics.category') }}</th><th>{{ t('complaintAnalytics.person') }}</th><th>{{ t('complaintAnalytics.score') }}</th><th>{{ t('complaintAnalytics.comment') }}</th><th>{{ t('complaintAnalytics.ratedAt') }}</th><th>{{ t('complaintAnalytics.records') }}</th></tr></thead><tbody>
          <tr v-for="ticket in feedbackPage" :key="ticket.id"><th><bdi class="ticket-id">{{ ticket.id }}</bdi></th><td>{{ typeLabel(ticket.typeCode) }}</td><td>{{ handlerLabel(ticket) }}</td><td><span :class="{ 'low-text': userScore(ticket) !== null && userScore(ticket) <= 2 }">{{ userScore(ticket) === null ? t('complaintAnalytics.unrated') : scoreLabel(userScore(ticket)) }}</span></td><td class="comment-cell"><p dir="auto">{{ ticket.rating?.comment || (userScore(ticket) === null ? '—' : t('complaintAnalytics.noComment')) }}</p></td><td>{{ dateLabel(ticket.rating?.ratedAt) }}</td><td><el-button link type="primary" @click="openEvidence(() => ticket.id, [ticket])">{{ t('complaintAnalytics.details') }}</el-button></td></tr>
          <tr v-if="!feedback.length"><td colspan="7" class="empty-state">{{ t('complaintAnalytics.noData') }}</td></tr></tbody></table></div>
        <div v-if="feedback.length > 10" class="pagination"><el-pagination v-model:current-page="feedbackPageNumber" :page-size="10" :total="feedback.length" layout="prev, pager, next" /></div>
      </section>
    </div>

    <el-dialog v-model="evidenceVisible" :title="evidenceTitle()" width="min(960px, 94vw)" class="complaint-evidence-dialog" destroy-on-close>
      <p class="section-note">{{ t('complaintAnalytics.feedbackCount', { count: count(evidenceTickets.length) }) }}</p>
      <div class="evidence-list"><details v-for="ticket in evidencePage" :key="ticket.id" class="evidence-ticket" :open="evidenceTickets.length === 1">
        <summary><span><bdi class="ticket-id">{{ ticket.id }}</bdi><strong dir="auto">{{ ticket.title }}</strong></span><span :class="{ 'low-text': userScore(ticket) !== null && userScore(ticket) <= 2 }">{{ userScore(ticket) === null ? statusLabel(ticket.statusCode) : scoreLabel(userScore(ticket)) }}</span></summary>
        <dl class="ticket-meta"><div><dt>{{ t('complaintAnalytics.person') }}</dt><dd>{{ handlerLabel(ticket) }}</dd></div><div><dt>{{ t('common.province') }}</dt><dd>{{ regionLabel(ticket.province) }}</dd></div><div><dt>{{ t('complaintAnalytics.submittedAt') }}</dt><dd>{{ dateLabel(ticket.submittedAt) }}</dd></div><div><dt>{{ t('complaintAnalytics.handledAt') }}</dt><dd>{{ ticket.statusCode === 'RESOLVED' ? dateLabel(ticket.handledAt) : '—' }}</dd></div></dl>
        <div class="evidence-text"><h4>{{ t('complaintAnalytics.original') }}</h4><p dir="auto">{{ ticket.content || '—' }}</p><h4>{{ t('complaintAnalytics.result') }}</h4><p dir="auto">{{ ticket.result || '—' }}</p></div>
        <div class="rating-evidence"><h4>{{ t('complaintAnalytics.comment') }} · {{ scoreLabel(userScore(ticket)) }}</h4><p dir="auto">{{ userScore(ticket) === null ? t('complaintAnalytics.unrated') : ticket.rating?.comment || t('complaintAnalytics.noComment') }}</p><small v-if="userScore(ticket) !== null">{{ t('complaintAnalytics.ratedAt') }}: {{ dateLabel(ticket.rating.ratedAt) }}</small></div>
      </details></div>
      <p v-if="!evidenceTickets.length" class="empty-state">{{ t('complaintAnalytics.noData') }}</p>
      <el-pagination v-if="evidenceTickets.length > 5" v-model:current-page="evidencePageNumber" :page-size="5" :total="evidenceTickets.length" layout="prev, pager, next" />
      <template #footer><el-button @click="evidenceVisible = false">{{ t('complaintAnalytics.close') }}</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Refresh, Search, Document, InfoFilled } from '@element-plus/icons-vue';
import { getComplaintList } from '../../api/complaint.js';
import { COMPLAINT_TYPES, COMPLAINT_STATUSES, COMPLAINT_STORAGE_PREFIX } from '../../utils/complaints.js';
import { analyticsTickets, filterAnalyticsTickets, summarizeComplaints, userScore, complaintDate, complaintCategories, problemInsights, staffEvaluations, ratingTrend } from '../../utils/complaintAnalytics.js';
import { getProvinceStatsByName } from '../../mock/data/geoStatsData.js';
import { provinceLabel } from '../../utils/dataLabels.js';
import { REVIEW_SCOPE_REGIONS } from '../../utils/reviewPermission.js';
import systemManagementLabels from '../../locales/systemManagementLabels.js';
import { onTabMessage } from '../../utils/crossTabBus.js';

const { t, te, locale } = useI18n();
const records = ref([]);
const loading = ref(false);
const loadError = ref(false);
const filters = reactive({ dates: [], channel: '', type: '', province: '' });
const feedbackScope = ref('all');
const feedbackSearch = ref('');
const feedbackPageNumber = ref(1);
const evidenceVisible = ref(false);
const evidenceTitle = ref(() => '');
const evidenceIds = ref([]);
const evidencePageNumber = ref(1);
const numberLocale = computed(() => ({ zh: 'zh-CN', en: 'en-GB', ar: 'ar-IQ', ckb: 'ckb-IQ' })[locale.value] || 'en-GB');
const count = value => new Intl.NumberFormat(numberLocale.value, { maximumFractionDigits: 0 }).format(value);
const decimal = value => new Intl.NumberFormat(numberLocale.value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
const percent = value => value === null ? '—' : new Intl.NumberFormat(numberLocale.value, { style: 'percent', maximumFractionDigits: 1 }).format(value / 100);
const scoreLabel = value => value === null ? t('complaintAnalytics.noScore') : t('complaintAnalytics.starValue', { score: decimal(value) });
const hoursLabel = value => value === null ? '—' : t('complaintAnalytics.hoursValue', { hours: decimal(value) });
const typeOptions = [...Object.keys(COMPLAINT_TYPES), 'UNKNOWN'];
const typeLabel = code => COMPLAINT_TYPES[code] ? t(`complaint.${COMPLAINT_TYPES[code][2]}`) : t('complaintAnalytics.unknown');
const statusLabel = code => COMPLAINT_STATUSES[code] ? t(`complaint.${COMPLAINT_STATUSES[code][2]}`) : t('complaintAnalytics.unknown');
const channelLabel = code => t(code === 'AI' ? 'complaint.aiOnline' : 'complaint.phoneHotline');
const regionLabel = province => {
  const region = REVIEW_SCOPE_REGIONS.find(item => item.code === province);
  return region ? t(`systemExtras.${region.labelKey}`) : provinceLabel(t, locale.value, province) || t('complaintAnalytics.unknown');
};
const staffLabel = person => person.nameKey && te(person.nameKey) ? t(person.nameKey) : person.name || t('complaintAnalytics.unknown');
const handlerLabel = ticket => staffLabel({ name: ticket.handlerName, nameKey: ticket.handlerNameKey });
const priorityKeys = { high: 'complaintAnalytics.priorityHigh', recurring: 'complaintAnalytics.priorityRecurring', observe: 'complaintAnalytics.priorityObserve' };
const feedbackScopes = [{ value: 'all', label: 'complaintAnalytics.feedbackAll' }, { value: 'low', label: 'complaintAnalytics.feedbackLow' }, { value: 'unrated', label: 'complaintAnalytics.feedbackUnrated' }];

function dateLabel(value) {
  const date = complaintDate(value);
  return date ? new Intl.DateTimeFormat(numberLocale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(date) : '—';
}
function monthLabel(value) {
  return new Intl.DateTimeFormat(numberLocale.value, { year: 'numeric', month: 'short' }).format(new Date(`${value}-01T12:00:00`));
}
const provinceAliases = new Map(REVIEW_SCOPE_REGIONS.flatMap(region => [region.value, region.code,
  ...Object.values(systemManagementLabels).map(messages => messages.systemExtras[region.labelKey])
].filter(Boolean).map(name => [name, region.code])));
function provinceIdentity(value) {
  const name = String(value || '').trim().replace(/ (Province|Governorate)$/, '');
  if (provinceAliases.has(name)) return provinceAliases.get(name);
  const province = getProvinceStatsByName(name);
  return province ? (province.id === 'SUL' ? 'SLY' : province.id) : name;
}
const tickets = computed(() => analyticsTickets(records.value).map(ticket => ({ ...ticket, province: provinceIdentity(ticket.province) })));
const provinces = computed(() => [...new Set(tickets.value.map(ticket => ticket.province).filter(Boolean))].sort());
const selected = computed(() => filterAnalyticsTickets(tickets.value, filters));
const summary = computed(() => summarizeComplaints(selected.value));
const categories = computed(() => complaintCategories(selected.value));
const insights = computed(() => problemInsights(selected.value));
const staff = computed(() => staffEvaluations(selected.value));
const unassigned = computed(() => selected.value.filter(ticket => !ticket.handlerId && !ticket.handlerNameKey && !String(ticket.handlerName || '').trim()).length);
const trend = computed(() => ratingTrend(selected.value));
const metrics = computed(() => [
  { key: 'total', value: count(summary.value.total), note: `${t('complaintAnalytics.resolved')}: ${count(summary.value.resolved)}` },
  { key: 'rated', value: count(summary.value.rated), note: t('complaintAnalytics.ratedOfResolved', { rated: count(summary.value.rated), resolved: count(summary.value.resolved) }) },
  { key: 'coverage', value: percent(summary.value.coverage), note: `${t('complaintAnalytics.unrated')}: ${count(summary.value.unrated)}` },
  { key: 'average', value: summary.value.average === null ? '—' : decimal(summary.value.average), note: t('complaintAnalytics.starValue', { score: summary.value.average === null ? '—' : decimal(summary.value.average) }), tone: 'positive' },
  { key: 'satisfaction', value: percent(summary.value.satisfaction), note: t('complaintAnalytics.stars', { score: `${count(4)}–${count(5)}` }), tone: 'positive' },
  { key: 'low', value: count(summary.value.low), note: t('complaintAnalytics.stars', { score: `${count(1)}–${count(2)}` }), tone: summary.value.low ? 'negative' : '' }
]);
const feedback = computed(() => {
  const keyword = feedbackSearch.value.trim().toLocaleLowerCase();
  return selected.value.filter(ticket => {
    const score = userScore(ticket);
    return ticket.statusCode === 'RESOLVED' && (feedbackScope.value !== 'low' || (score !== null && score <= 2))
      && (feedbackScope.value !== 'unrated' || score === null)
      && (!keyword || [ticket.id, ticket.title, ticket.content, handlerLabel(ticket), ticket.rating?.comment].join(' ').toLocaleLowerCase().includes(keyword));
  }).sort((a, b) => (complaintDate(b.rating?.ratedAt || b.handledAt)?.getTime() || 0) - (complaintDate(a.rating?.ratedAt || a.handledAt)?.getTime() || 0));
});
const feedbackPage = computed(() => feedback.value.slice((feedbackPageNumber.value - 1) * 10, feedbackPageNumber.value * 10));
const evidenceTickets = computed(() => {
  const ids = new Set(evidenceIds.value);
  return selected.value.filter(ticket => ids.has(ticket.id)).sort((a, b) => (userScore(a) ?? 6) - (userScore(b) ?? 6) || String(b.submittedAt).localeCompare(String(a.submittedAt)));
});
const evidencePage = computed(() => evidenceTickets.value.slice((evidencePageNumber.value - 1) * 5, evidencePageNumber.value * 5));
function openEvidence(title, items) {
  evidenceTitle.value = title;
  evidenceIds.value = items.map(ticket => ticket.id);
  evidencePageNumber.value = 1;
  evidenceVisible.value = true;
}
function resetFilters() { Object.assign(filters, { dates: [], channel: '', type: '', province: '' }); }
watch([filters, feedbackScope, feedbackSearch], () => { feedbackPageNumber.value = 1; });
watch(() => feedback.value.length, length => { feedbackPageNumber.value = Math.max(1, Math.min(feedbackPageNumber.value, Math.ceil(length / 10))); });
watch(() => evidenceTickets.value.length, length => { evidencePageNumber.value = Math.max(1, Math.min(evidencePageNumber.value, Math.ceil(length / 5))); });

let generation = 0;
let disposed = false;
let refreshTimer;
let unsubscribe;
async function loadComplaints() {
  const requestGeneration = ++generation;
  loading.value = true;
  try {
    const response = await getComplaintList();
    if (disposed || requestGeneration !== generation) return;
    records.value = Array.isArray(response) ? response : [];
    loadError.value = false;
  } catch {
    if (!disposed && requestGeneration === generation) loadError.value = true;
  } finally {
    if (!disposed && requestGeneration === generation) loading.value = false;
  }
}
function scheduleRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(loadComplaints, 120);
}
function handleStorage(event) { if (event.key === null || event.key?.startsWith(COMPLAINT_STORAGE_PREFIX)) scheduleRefresh(); }
onMounted(() => {
  loadComplaints();
  unsubscribe = onTabMessage('COMPLAINT_CHANGED', scheduleRefresh);
  window.addEventListener('rcm:complaints-changed', scheduleRefresh);
  window.addEventListener('rcm-language-changed', scheduleRefresh);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', scheduleRefresh);
});
onUnmounted(() => {
  disposed = true;
  clearTimeout(refreshTimer);
  unsubscribe?.();
  window.removeEventListener('rcm:complaints-changed', scheduleRefresh);
  window.removeEventListener('rcm-language-changed', scheduleRefresh);
  window.removeEventListener('storage', handleStorage);
  window.removeEventListener('focus', scheduleRefresh);
});
</script>

<style scoped>
.complaint-statistics { display: grid; gap: 1rem; min-width: 0; color: #1F3326; font-size: .8125rem; }
.complaint-statistics > div[aria-busy] { display: grid; gap: 1rem; min-width: 0; }
.panel { min-width: 0; background: #fff; border: 1px solid #D9E5DB; border-radius: .65rem; box-shadow: 0 2px 8px #1F332604; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-bottom: .75rem; border-bottom: 1px solid #E9F1EB; }
.heading { display: flex; align-items: center; gap: .8rem; }
.heading-dot { width: .625rem; height: .625rem; background: #326445; border-radius: 50%; flex-shrink: 0; }
h1, h2, h3, h4, p { margin: 0; }
h1 { font-size: .875rem; font-weight: 700; }
h2 { font-size: .95rem; font-weight: 700; }
h3 { font-size: .9rem; font-weight: 700; }
h4 { font-size: .85rem; font-weight: 600; }
.heading p, .section-heading p, .section-note, .insights-heading p { font-size: .75rem; line-height: 1.7; color: #65796D; margin-top: .35rem; }
.filters { padding: 1rem 1.25rem; background: #F3F8F4; }
.filter-grid { display: grid; grid-template-columns: minmax(250px, 1.7fr) repeat(3, minmax(130px, 1fr)) auto; gap: .75rem; align-items: end; }
.filter-grid label { display: grid; gap: .4rem; min-width: 0; font-size: .75rem; color: #58685D; }
.filter-grid :deep(.el-date-editor), .filter-grid :deep(.el-select) { width: 100%; min-width: 0; }
.filter-grid :deep(.el-range-input) { min-width: 0; }
.methodology { margin-top: .9rem; padding-top: .8rem; border-top: 1px solid #ECF2ED; font-size: .75rem; color: #65796D; line-height: 1.8; }
.metrics { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .75rem; }
.metric { padding: 1rem; display: flex; flex-direction: column; gap: .35rem; }
.metric > span { font-size: .75rem; color: #65796D; }
.metric strong { font-size: 1.65rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.35; }
.metric small { font-size: .68rem; color: #65796D; }
.metric.positive { border-top: 3px solid #75AC82; padding-top: calc(1rem - 2px); }
.metric.positive strong { color: #326445; }
.metric.negative { border-top: 3px solid #C04442; padding-top: calc(1rem - 2px); }
.metric.negative strong { color: #C04442; }
.empty-rating, .load-error { display: flex; align-items: flex-start; gap: .7rem; padding: .9rem 1.1rem; border: 1px solid #E5CEA1; border-radius: .6rem; background: #FFFAEE; color: #7A5F21; }
.empty-rating p { font-size: .75rem; line-height: 1.7; margin-top: .2rem; }
.empty-rating .el-icon { font-size: 1.1rem; margin-top: .1rem; flex-shrink: 0; }
.load-error { align-items: center; justify-content: space-between; background: #FBEAE9; border-color: #F2D5D4; color: #C04442; }
.charts { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; min-width: 0; }
.chart-panel { padding: 1.1rem 1.25rem; }
.section-heading { display: flex; justify-content: space-between; align-items: start; gap: .8rem; }
.section-heading > span { color: #65796D; font-size: .72rem; flex-shrink: 0; }
.distribution { display: grid; gap: .85rem; padding-block: 1.2rem .35rem; }
.score-row { display: grid; grid-template-columns: minmax(55px, auto) 1fr 2rem 3.5rem; align-items: center; gap: .65rem; }
.score-row strong, .score-row small { text-align: end; font-variant-numeric: tabular-nums; }
.score-row small { color: #65796D; }
.bar-track { display: block; height: .5rem; background: #ECF2ED; border-radius: 1rem; overflow: hidden; }
.bar-track > div, .bar-track > span { display: block; height: 100%; background: #609A70; border-radius: inherit; }
.bar-track .low { background: #CC7970; }
.trend-score { display: flex; align-items: center; gap: .7rem; }
.trend-score .bar-track { width: 5rem; flex-shrink: 0; }
.trend-score strong { font-weight: 500; white-space: nowrap; }
.table-scroll { width: 100%; overflow: auto; scrollbar-width: thin; }
.table-scroll:focus-visible { outline: 2px solid #326445; outline-offset: -2px; }
table { border-collapse: collapse; width: 100%; font-size: .75rem; text-align: start; }
th, td { padding: .85rem 1rem; border-bottom: 1px solid #E8F0EA; text-align: start; vertical-align: middle; }
thead th { color: #52675A; background: #F3F8F4; font-size: .72rem; font-weight: 600; white-space: nowrap; }
tbody th { font-weight: 500; min-width: 10rem; }
tbody td { white-space: nowrap; font-variant-numeric: tabular-nums; }
tbody tr:last-child > * { border-bottom: 0; }
tbody tr:hover { background: #F8FBF8; }
.trend-table { margin-top: .7rem; }
.trend-table th, .trend-table td { padding: .6rem .45rem; }
.trend-table tbody th { min-width: 5rem; }
.analysis-panel > .section-heading, .staff-panel > .section-heading, .feedback-panel > .section-heading { padding: 1.1rem 1.25rem; }
.share-cell { display: flex; align-items: center; gap: .6rem; min-width: 7rem; }
.share-cell .bar-track { width: 4rem; }
.insights-heading { border-top: 1px solid #E8F0EA; padding: 1.1rem 1.25rem .7rem; }
.insights-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .75rem; padding: 0 1.25rem 1.25rem; }
.insight { background: #F8FBF8; border: 1px solid #E0EAE2; border-radius: .55rem; padding: 1rem; display: flex; flex-direction: column; gap: .65rem; }
.insight.urgent { background: #FFFBF5; border-color: #E5CEA1; }
.insight p { font-size: .75rem; line-height: 1.8; color: #43554B; }
.insight .insight-count { color: #65796D; font-size: .7rem; }
.insight .el-button { align-self: flex-start; margin-top: auto; gap: .3rem; }
.priority { font-size: .65rem !important; padding: .15rem .4rem; border-radius: .3rem; background: #EDF3EE; color: #52675A !important; line-height: 1.5; }
.priority.high { background: #FBEAE9; color: #A93B39 !important; }
.priority.recurring { background: #FDF3E0; color: #7A5F21 !important; }
.low-text { color: #A93B39; font-weight: 600; }
.person-cell { max-width: 16rem; overflow-wrap: anywhere; }
.sample-cell { display: flex; align-items: center; flex-wrap: wrap; gap: .4rem; }
.sample-note { color: #7A5F21; background: #FDF3E0; border-radius: .25rem; font-size: .65rem; padding: .1rem .3rem; }
.feedback-tools { padding: 0 1.25rem 1rem; display: flex; justify-content: space-between; align-items: center; gap: .75rem; flex-wrap: wrap; }
.feedback-tabs { display: flex; flex-wrap: wrap; gap: .3rem; }
.feedback-tabs button { border: 1px solid #D9E5DB; border-radius: .4rem; padding: .45rem .75rem; background: white; color: #43554B; cursor: pointer; font-size: .75rem; }
.feedback-tabs button.active { background: #326445; border-color: #326445; color: white; }
.feedback-tabs button:focus-visible { outline: 2px solid #D3AF62; outline-offset: 2px; }
.feedback-tools .el-input { width: min(100%, 340px); }
.ticket-id { font-family: ui-monospace, monospace; font-size: .72rem; white-space: nowrap; }
.comment-cell { min-width: 15rem; max-width: 25rem; white-space: normal; }
.comment-cell p { max-height: 5rem; overflow: auto; overflow-wrap: anywhere; line-height: 1.7; }
.pagination { padding: .75rem 1.25rem; display: flex; justify-content: flex-end; }
.empty-state { text-align: center; padding: 2rem 1rem; color: #65796D; }
.evidence-list { display: grid; gap: .8rem; margin-block: .8rem; }
.evidence-ticket { border: 1px solid #D9E5DB; border-radius: .5rem; padding: 1rem; color: #1F3326; }
.evidence-ticket summary { display: flex; justify-content: space-between; align-items: start; gap: 1rem; cursor: pointer; }
.evidence-ticket summary > span:first-child { min-width: 0; display: grid; gap: .35rem; }
.evidence-ticket summary > span:last-child { flex-shrink: 0; font-size: .75rem; }
.evidence-ticket summary strong { font-size: .85rem; font-weight: 600; overflow-wrap: anywhere; }
.evidence-ticket summary:focus-visible { outline: 2px solid #326445; outline-offset: 3px; }
.ticket-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; margin-block: 1.2rem; font-size: .75rem; }
.ticket-meta dt { color: #65796D; margin-bottom: .3rem; }
.ticket-meta dd { margin: 0; overflow-wrap: anywhere; }
.evidence-text p, .rating-evidence p { font-size: .8rem; line-height: 1.9; white-space: pre-wrap; overflow-wrap: anywhere; margin-block: .5rem 1rem; }
.rating-evidence { padding: .8rem; border-radius: .4rem; background: #F3F8F4; margin-top: .8rem; }
.rating-evidence small { color: #65796D; }
@media (max-width: 1250px) {
  .filter-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .date-filter { grid-column: span 2; }
  .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .insights-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .page-header { align-items: start; }
  .page-header .el-button { flex-shrink: 0; }
  .filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .date-filter { grid-column: 1 / -1; }
  .charts, .insights-grid { grid-template-columns: 1fr; }
  .metric { padding: .75rem; }
  .metric strong { font-size: 1.35rem; }
  .staff-panel > .section-heading { flex-direction: column; }
  .insight .section-heading { flex-wrap: wrap; }
  .feedback-tools .el-input { width: 100%; }
}
@media (max-width: 450px) {
  .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filter-grid { grid-template-columns: 1fr; }
  .date-filter { grid-column: auto; }
  .ticket-meta { grid-template-columns: 1fr; }
  .evidence-ticket summary { flex-direction: column; }
  .section-heading { flex-wrap: wrap; }
}
</style>
