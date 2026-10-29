<template>
  <el-dialog v-model="visible" :title="$t('register.title')" :width="dialogWidth" align-center :class="{ 'rcm-compact-dialog': isCompact }" :before-close="close">
    <el-alert :title="$t('registrationFlow.unavailable')" type="warning" :closable="false" show-icon class="mb-4" />
    <el-steps :active="step" finish-status="success" simple class="mb-5">
      <el-step :title="$t('registrationFlow.account')" />
      <el-step :title="$t('registrationFlow.identity')" />
      <el-step :title="$t('registrationFlow.family')" />
    </el-steps>
    <el-form v-if="step === 0" label-position="top">
      <el-form-item :label="$t('common.province')" required>
        <el-select v-model="form.province" class="w-full" :placeholder="$t('registrationFlow.chooseProvince')">
          <el-option v-for="province in provinces" :key="province" :value="province" :label="$t(`registrationFlow.provinces.${province}`)" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('register.nidLabel')" required><el-input v-model.trim="form.nationalId" class="bidi-ltr" /></el-form-item>
      <el-form-item :label="$t('register.phoneLabel')" required><el-input v-model.trim="form.phone" class="bidi-ltr" /></el-form-item>
      <el-form-item :label="$t('register.headNameLabel')" required><el-input v-model.trim="form.headName" /></el-form-item>
      <p class="text-sm text-gray-600">{{ $t('registrationFlow.smsPending') }}</p>
    </el-form>
    <div v-else-if="step === 1" class="space-y-4">
      <p>{{ $t('registrationFlow.identityPending') }}</p>
      <el-form label-position="top">
        <el-form-item :label="$t('registrationFlow.familyNumber')" required><el-input v-model.trim="form.familyNumber" class="bidi-ltr" /></el-form-item>
      </el-form>
      <p class="text-sm text-gray-600">{{ $t('registrationFlow.cardPending') }}</p>
    </div>
    <div v-else class="space-y-4">
      <el-form label-position="top">
        <el-form-item :label="$t('registrationFlow.oldCardNumber')"><el-input v-model.trim="form.paperCardNo" class="bidi-ltr" /></el-form-item>
        <el-form-item :label="$t('registrationFlow.oldCardPhoto')"><input type="file" accept="image/*" capture="environment" @change="handleImage" /></el-form-item>
      </el-form>
      <p class="text-sm">{{ $t('registrationFlow.membersHint') }}</p>
      <div v-for="(member, index) in form.members" :key="member.key" class="border rounded-lg p-3 space-y-2">
        <el-input v-model.trim="member.name" :placeholder="$t('registrationFlow.memberName')" />
        <el-input v-model.trim="member.nationalId" class="bidi-ltr" :placeholder="$t('register.nidLabel')" />
        <el-input v-model.trim="member.relation" :placeholder="$t('registrationFlow.relation')" />
        <el-button text type="danger" @click="form.members.splice(index, 1)">{{ $t('registrationFlow.remove') }}</el-button>
      </div>
      <el-button @click="addMember">{{ $t('registrationFlow.addMember') }}</el-button>
      <p class="text-sm text-gray-600">{{ $t('registrationFlow.memberVerificationPending') }}</p>
    </div>
    <template #footer>
      <div class="flex justify-between gap-2">
        <el-button v-if="step > 0" @click="step--">{{ $t('register.backPrev') }}</el-button><span v-else></span>
        <el-button v-if="step < 2" type="primary" @click="next">{{ $t('registrationFlow.next') }}</el-button>
        <el-button v-else type="primary" disabled>{{ $t('register.finishBtn') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useCompactDialog } from '../../composables/useCompactDialog.js';
import { readRegistrationImage } from '../../utils/memberRegistration.js';

const props = defineProps({ modelValue: Boolean, demoMode: Boolean });
const emit = defineEmits(['update:modelValue', 'registered']);
const { t } = useI18n();
const { isCompact, dialogWidth } = useCompactDialog(680);
const visible = ref(props.modelValue);
const step = ref(0);
const provinces = ['baghdad','nineveh','basra','diyala','kirkuk','anbar','erbil','sulaymaniyah','duhok','babylon','karbala','najaf','wasit','salahuddin','qadisiyyah','muthanna','dhiqar','maysan','halabja'];
const blank = () => ({ province: '', nationalId: '', phone: '', headName: '', familyNumber: '', familyId: null, rationCardNo: null, paperCardNo: '', paperCardImage: '', members: [] });
const form = reactive(blank());
let nextKey = 0;
watch(() => props.modelValue, value => { visible.value = value; if (value) { Object.assign(form, blank()); step.value = 0; } });
function close() { visible.value = false; emit('update:modelValue', false); }
function next() {
  if (step.value === 0 && (!form.province || !form.nationalId || !form.phone || !form.headName)) { ElMessage.warning(t('registrationFlow.required')); return; }
  if (step.value === 1 && !form.familyNumber) { ElMessage.warning(t('registrationFlow.required')); return; }
  step.value++;
}
function addMember() { form.members.push({ key: ++nextKey, name: '', nationalId: '', relation: '' }); }
async function handleImage(event) {
  const file = event.target.files?.[0];
  if (!file) { form.paperCardImage = ''; return; }
  try { form.paperCardImage = await readRegistrationImage(file); } catch { ElMessage.error(t('memberRegistration.imageReadFailed')); }
}
</script>
