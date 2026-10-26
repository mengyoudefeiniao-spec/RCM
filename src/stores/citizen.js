import { isEnNow } from '../utils/langHint.js';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getFamilyList,
  updateMemberInfo,
  submitChangeHouseholdHead,
  submitApplyUnfreeze,
  autoJudgeSplitHousehold,
  submitSplitHouseholdForReview,
  addFamilyMember
} from '../api/citizen.js';
import { ElMessage } from 'element-plus';
import { i18n } from '../locales/index.js';

export const useCitizenStore = defineStore('citizen', () => {
  const families = ref([]);
  const currentFamily = ref(null);
  const loading = ref(false);
  let familyRequest = 0;

  /**
   * 加载所有家庭配给卡档案
   */
  async function fetchFamilies() {
    const request = ++familyRequest;
    loading.value = true;
    try {
      const data = await getFamilyList();
      if (request !== familyRequest) return;
      families.value = data;
      if (currentFamily.value && data.length > 0) {
        const found = data.find((f) => f.rationCardNo === currentFamily.value.rationCardNo);
        currentFamily.value = found || data[0];
      } else if (data.length > 0) {
        currentFamily.value = data[0];
      }
    } finally {
      if (request === familyRequest) loading.value = false;
    }
  }

  /**
   * 切换当前查看的家庭配给卡
   */
  function selectFamily(cardNo) {
    const found = families.value.find((f) => f.rationCardNo === cardNo);
    if (found) {
      currentFamily.value = found;
    }
  }

  /**
   * 更新家庭成员信息
   */
  async function updateMember(memberId, payload) {
    const res = await updateMemberInfo(memberId, payload);
    ElMessage.success(res.message || (isEnNow() ? 'Member information updated and filed successfully' : '成员信息已成功更新并建档'));
    await fetchFamilies();
    return res;
  }

  /**
   * 提交变更户主申请
   */
  async function changeHead(payload) {
    const res = await submitChangeHouseholdHead(payload);
    ElMessage.success(i18n.global.t('changeHead.submitSuccess'));
    await fetchFamilies();
    return res;
  }

  /**
   * 提交解冻申请
   */
  async function applyUnfreeze(payload) {
    const res = await submitApplyUnfreeze(payload);
    ElMessage.success(i18n.global.t('unfreeze.submitSuccess'));
    await fetchFamilies();
    return res;
  }

  /**
   * 申请分户：优先系统智能自动判别
   */
  async function judgeSplitHousehold(payload) {
    const res = await autoJudgeSplitHousehold(payload);
    await fetchFamilies();
    return res;
  }

  /**
   * 申请分户：判别失败转入分部电子审核
   */
  async function submitSplitReview(payload) {
    const res = await submitSplitHouseholdForReview(payload);
    ElMessage.success(i18n.global.t('split.reviewSubmitted'));
    await fetchFamilies();
    return res;
  }

  /**
   * 申报添加新家庭成员
   */
  async function addMember(cardNo, payload) {
    const res = await addFamilyMember(cardNo, payload);
    ElMessage.success(res.message || (isEnNow() ? 'New member added and covered successfully' : '新成员添加成功并纳保'));
    await fetchFamilies();
    return res;
  }

  return {
    families,
    currentFamily,
    loading,
    fetchFamilies,
    selectFamily,
    updateMember,
    addMember,
    changeHead,
    applyUnfreeze,
    judgeSplitHousehold,
    submitSplitReview
  };
});
