import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getReviewTicketList,
  submitStaffOpinion,
  submitManagerDecision
} from '../api/review.js';
import { ElMessage } from 'element-plus';

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
    const res = await submitStaffOpinion({
      ticketId,
      staffOpinion: opinion,
      staffName: '萨米拉·卡西姆 (资格审核专员)'
    });
    ElMessage.success('第一级初审意见已提交，流转至经理终审');
    await fetchTickets(filterSource.value);
    return res;
  }

  /**
   * 提交第二级分部经理终审裁决
   */
  async function reviewManager(ticketId, decision, notes) {
    const res = await submitManagerDecision({
      ticketId,
      decision,
      notes,
      managerName: '海德尔·阿卜杜拉 (分部经理)'
    });
    ElMessage.success(`终审已裁决为【${decision}】`);
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
