import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getReviewTicketList,
  submitStaffOpinion,
  submitManagerDecision
} from '../api/review.js';
import { ElMessage } from 'element-plus';

import { i18n } from '../locales/index.js';

export const useReviewStore = defineStore('review', () => {
  const tickets = ref([]);
  const selectedTicket = ref(null);
  const filterSource = ref('全部');
  const loading = ref(false);

  /**
   * 加载电子审核工单列表 (支持来源过滤)
   */
  async function fetchTickets(source = '全部') {
    loading.value = true;
    filterSource.value = source;
    try {
      const data = await getReviewTicketList({ source });
      tickets.value = data;
      if (data.length > 0) {
        if (!selectedTicket.value || !data.some((t) => t.id === selectedTicket.value.id)) {
          selectedTicket.value = data[0];
        } else {
          // 保持选中同 ID 工单，但更新实体数据（适配多语言）
          selectedTicket.value = data.find((t) => t.id === selectedTicket.value.id);
        }
      } else {
        selectedTicket.value = null;
      }
    } finally {
      loading.value = false;
    }
  }

  /**
   * 选中某个工单
   */
  function selectTicket(ticket) {
    selectedTicket.value = ticket;
  }

  /**
   * 提交第一级员工审核意见
   */
  async function reviewStaff(ticketId, opinion) {
    const isEn = i18n.global.locale.value === 'en';
    const res = await submitStaffOpinion({
      ticketId,
      staffOpinion: opinion,
      staffName: isEn ? 'Samira Qasim (Review Officer)' : '萨米拉·卡西姆 (资格审核专员)'
    });
    const msg = i18n.global.t('review.staffSubmitSuccess');
    ElMessage.success(msg);
    await fetchTickets(filterSource.value);
    return res;
  }

  /**
   * 提交第二级分部经理终审裁决
   */
  async function reviewManager(ticketId, decision, notes) {
    const isEn = i18n.global.locale.value === 'en';
    const res = await submitManagerDecision({
      ticketId,
      decision,
      notes,
      managerName: isEn ? 'Haider Abdullah (Branch Manager)' : '海德尔·阿卜杜拉 (分部经理)'
    });
    const decisionText = decision === '接受' || decision === 'Approved'
      ? i18n.global.t('review.decisionAccept')
      : i18n.global.t('review.decisionReject');
    const msg = i18n.global.t('review.managerDecisionSuccess', { decision: decisionText });
    ElMessage.success(msg);
    await fetchTickets(filterSource.value);
    return res;
  }

  return {
    tickets,
    selectedTicket,
    filterSource,
    loading,
    fetchTickets,
    selectTicket,
    reviewStaff,
    reviewManager
  };
});
