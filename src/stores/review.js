import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  getReviewTicketList,
  submitStaffOpinion,
  submitManagerDecision
} from '../api/review.js';
import { ElMessage, ElNotification } from 'element-plus';
import { i18n } from '../locales/index.js';
import { getSharedTickets, updateSharedTicket } from '../utils/sharedSession.js';
import { onTabMessage } from '../utils/crossTabBus.js';

export const useReviewStore = defineStore('review', () => {
  const tickets = ref([]);
  const selectedTicket = ref(null);
  const filterSource = ref('全部');
  const loading = ref(false);

  // 初始化跨标签页业务公文实时监听器 (公民端标签页提交 -> 政府端标签页秒级接收)
  if (typeof window !== 'undefined') {
    onTabMessage('TICKET_SUBMITTED', (newTicket) => {
      // 避免重复推入
      if (!tickets.value.some((t) => t.id === newTicket.id)) {
        tickets.value.unshift(newTicket);
        selectedTicket.value = newTicket;

        // 弹出高层政务跨标签页业务实时通知
        ElNotification({
          title: '【跨标签页联动】收到新申报公文',
          message: `公民【${newTicket.applicantName}】刚刚提交了《${newTicket.source}》（编号: #${newTicket.id}），已实时同步入库！`,
          type: 'success',
          duration: 5000,
          position: 'top-right'
        });
      }
    });

    onTabMessage('TICKET_UPDATED', (updatedTicket) => {
      const idx = tickets.value.findIndex((t) => t.id === updatedTicket.id);
      if (idx !== -1) {
        tickets.value[idx] = updatedTicket;
        if (selectedTicket.value?.id === updatedTicket.id) {
          selectedTicket.value = updatedTicket;
        }
      }
    });
  }

  /**
   * 加载电子审核工单列表 (支持来源过滤并优先融合多标签页共享持久化缓存)
   */
  async function fetchTickets(source = '全部') {
    loading.value = true;
    filterSource.value = source;
    try {
      // 1. 获取持久化共享公文池数据
      const sharedList = getSharedTickets();

      // 2. 根据来源进行过滤
      let data = sharedList;
      if (source && source !== '全部') {
        data = sharedList.filter((item) => item.source === source);
      }

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
    const staffName = isEn ? 'Samira Qasim (Review Officer)' : '萨米拉·卡西姆 (资格审核专员)';
    const res = await submitStaffOpinion({
      ticketId,
      staffOpinion: opinion,
      staffName
    });
    
    // 同步到多标签页持久化存储并广播
    updateSharedTicket(ticketId, {
      staffOpinion: opinion,
      staffName,
      status: '待经理终审'
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
    const managerName = isEn ? 'Haider Abdullah (Branch Manager)' : '海德尔·阿卜杜拉 (分部经理)';
    const res = await submitManagerDecision({
      ticketId,
      decision,
      notes,
      managerName
    });

    // 同步到多标签页持久化存储并广播
    updateSharedTicket(ticketId, {
      managerDecision: decision,
      managerNotes: notes,
      status: decision === '接受' || decision === 'Approved' ? '已办结归档' : '已驳回'
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
