<template>
  <main class="mx-auto w-full max-w-4xl space-y-4 p-3.5 text-start sm:p-6">
    <section class="space-y-5 rounded-lg border border-[#D9E5DB] bg-white p-4 shadow-xs sm:p-6">
      <header class="flex items-start justify-between gap-3 border-b border-[#E9F1EB] pb-4">
        <div class="min-w-0">
          <h1 class="flex items-center gap-2 text-base font-bold text-[#1B3123]"><el-icon class="shrink-0 text-[#A53A2D]"><Remove /></el-icon>{{ $t('memberDeregistration.title') }}</h1>
          <p class="mt-2 text-xs leading-relaxed text-[#718277]">{{ $t('memberDeregistration.subtitle') }}</p>
        </div>
        <el-button size="small" plain class="shrink-0" @click="goBack"><el-icon class="me-1 rtl:scale-x-[-1]"><Back /></el-icon>{{ $t('common.back') }}</el-button>
      </header>

      <form class="space-y-5" @submit.prevent="submit">
        <div>
          <label for="deregister-member" class="mb-2 block text-xs font-semibold text-[#43554B]">{{ $t('memberDeregistration.member') }}</label>
          <el-select id="deregister-member" v-model="targetMemberId" :placeholder="$t('memberDeregistration.chooseMember')" :disabled="submitting" class="w-full" size="large">
            <el-option v-for="member in members" :key="member.id" :value="member.id" :label="`${member.name} · ${member.nationalId}`" />
          </el-select>
          <div v-if="targetMember" class="mt-2 rounded-lg border border-[#D9E5DB] bg-[#F3F8F4] p-3 text-xs text-[#43554B]">
            <span class="font-semibold">{{ $t('memberDeregistration.identity') }}: {{ targetMember.name }}</span>
            <bdi dir="ltr" class="mt-1 block font-mono">{{ family?.rationCardNo }} · {{ targetMember.nationalId }}</bdi>
          </div>
        </div>

        <div v-if="isHead" class="rounded-lg border border-[#EED9AE] bg-[#FFFBF2] p-3">
          <label for="deregister-successor" class="mb-2 block text-xs font-semibold text-[#6B5321]">{{ $t('memberDeregistration.successor') }}</label>
          <el-select id="deregister-successor" v-model="replacementHeadId" :placeholder="$t('memberDeregistration.chooseSuccessor')" :disabled="submitting" class="w-full">
            <el-option v-for="member in successors" :key="member.id" :value="member.id" :label="`${member.name} · ${member.nationalId}`" />
          </el-select>
          <p class="mt-2 text-xs leading-relaxed text-[#8D713D]">{{ $t(successors.length ? 'memberDeregistration.successorHint' : 'memberDeregistration.noSuccessor') }}</p>
        </div>

        <div>
          <label for="deregister-proof-number" class="mb-2 block text-xs font-semibold text-[#43554B]">{{ $t('memberDeregistration.deathProofNo') }}</label>
          <el-input id="deregister-proof-number" v-model="deathProofNo" :placeholder="$t('memberDeregistration.deathProofPlaceholder')" :disabled="submitting" maxlength="100" />
        </div>

        <div class="space-y-2 rounded-lg border border-[#D9E5DB] p-3">
          <h2 class="text-sm font-bold text-[#1B3123]">{{ $t('memberDeregistration.proof') }} <span class="text-[#A53A2D]">*</span></h2>
          <p class="text-xs leading-relaxed text-[#718277]">{{ $t('memberDeregistration.proofHint') }}</p>
          <input ref="fileInput" type="file" class="hidden" :disabled="submitting" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" @change="chooseProof" />
          <div class="flex min-w-0 flex-col gap-3 pt-1">
            <div class="flex min-w-0 items-start gap-2 rounded-lg bg-[#F3F8F4] p-3" aria-live="polite">
              <el-icon class="mt-0.5 shrink-0 text-[#326445]"><Document /></el-icon>
              <div class="min-w-0 flex-1 space-y-1">
                <span class="block break-words text-xs font-semibold text-[#43554B]">{{ isDefaultProof ? $t('memberDeregistration.defaultFileName', { reference: deathProofNo || DEFAULT_DEATH_PROOF_NO }) : proof?.name }}</span>
                <p v-if="isDefaultProof" class="text-xs leading-relaxed text-[#718277]">{{ $t('memberDeregistration.defaultProofHint') }}</p>
              </div>
            </div>
            <el-button plain native-type="button" :disabled="submitting" class="!h-auto max-w-full self-end !whitespace-normal py-2" @click="fileInput?.click()"><el-icon class="me-1"><Upload /></el-icon>{{ $t('memberDeregistration.chooseFile') }}</el-button>
          </div>
        </div>

        <el-checkbox v-model="deceasedConfirmed" :disabled="submitting" class="member-declaration">{{ $t('memberDeregistration.confirmed') }}</el-checkbox>

        <aside class="rounded-lg border border-[#EED9AE] bg-[#FFFBF2] p-3 text-xs leading-relaxed text-[#6B5321]">
          <h2 class="mb-1 font-bold">{{ $t('memberDeregistration.noticeTitle') }}</h2>
          <p>{{ $t('memberDeregistration.notice') }}</p>
        </aside>
        <el-button native-type="submit" type="primary" :loading="submitting" class="!h-auto min-h-11 w-full !whitespace-normal py-2 font-bold">{{ $t('memberDeregistration.submit') }}</el-button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { Remove, Back, Upload, Document } from '@element-plus/icons-vue';
import { useCitizenStore } from '../../stores/citizen.js';
import { submitMemberDeregistration } from '../../api/citizen.js';
import { isHouseholdHead, deregistrationSuccessors, DEFAULT_DEATH_PROOF_NO, createDefaultDeathProofFile } from '../../utils/memberDeregistration.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const citizenStore = useCitizenStore();
const family = computed(() => citizenStore.currentFamily);
const members = computed(() => family.value?.members || []);
const targetMemberId = ref('');
const targetMember = computed(() => members.value.find(member => member.id === targetMemberId.value));
const isHead = computed(() => isHouseholdHead(targetMember.value));
const successors = computed(() => deregistrationSuccessors(family.value, targetMember.value));
const replacementHeadId = ref('');
const deathProofNo = ref(DEFAULT_DEATH_PROOF_NO);
const proof = ref(null);
const isDefaultProof = ref(true);
const fileInput = ref(null);
const deceasedConfirmed = ref(false);
const submitting = ref(false);

function goBack() {
  const app = route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app';
  router.push({ path: '/citizen', query: app ? { layout: 'app' } : {} });
}
function chooseProof(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
    ElMessage.warning(t('memberDeregistration.invalidFile'));
    event.target.value = '';
    return;
  }
  proof.value = file;
  isDefaultProof.value = false;
  deceasedConfirmed.value = false;
  event.target.value = '';
}
watch(targetMemberId, () => {
  // Retain an uploaded certificate and its number even when chosen before the member.
  deceasedConfirmed.value = false;
  replacementHeadId.value = '';
});
async function submit() {
  if (submitting.value) return;
  if (!targetMember.value) return ElMessage.warning(t('memberDeregistration.errorMember'));
  if (!deathProofNo.value.trim() || (!proof.value && !isDefaultProof.value)) return ElMessage.warning(t('memberDeregistration.errorProof'));
  if (!deceasedConfirmed.value) return ElMessage.warning(t('memberDeregistration.errorConfirm'));
  if (isHead.value && !successors.value.some(member => member.id === replacementHeadId.value)) return ElMessage.warning(t('memberDeregistration.errorSuccessor'));
  submitting.value = true;
  try {
    const attachment = isDefaultProof.value
      ? await createDefaultDeathProofFile({ t, locale: locale.value, member: targetMember.value, cardNo: family.value.rationCardNo, reference: deathProofNo.value.trim() }).catch(error => {
        ElMessage.error(t('memberDeregistration.uploadFailed'));
        throw error;
      })
      : proof.value;
    await submitMemberDeregistration({
      cardNo: family.value.rationCardNo,
      targetMemberId: targetMember.value.id,
      targetNationalId: targetMember.value.nationalId,
      deathProofNo: deathProofNo.value.trim(),
      deceasedConfirmed: true,
      replacementHeadId: isHead.value ? replacementHeadId.value : ''
    }, attachment);
    ElMessage.success(t('memberDeregistration.submitSuccess'));
    goBack();
  } catch { /* The request layer presents the localized error. */ }
  finally { submitting.value = false; }
}
onMounted(() => citizenStore.fetchFamilies());
watch(locale, () => citizenStore.fetchFamilies());
</script>

<style scoped>
.member-declaration {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin: 0;
  white-space: normal;
}
.member-declaration :deep(.el-checkbox__input) {
  flex: 0 0 auto;
  margin-top: 0.2rem;
}
.member-declaration :deep(.el-checkbox__label) {
  flex: 1 1 0;
  min-width: 0;
  padding-inline-start: 0.5rem;
  padding-inline-end: 0;
  white-space: normal !important;
  overflow-wrap: anywhere;
  text-align: start;
  font-size: 0.75rem;
  line-height: 1.65;
}
</style>
