import { MOCK_USERS } from './data/authData.js';
import { MOCK_FAMILIES } from './data/citizenData.js';
import { MOCK_REVIEW_TICKETS } from './data/reviewData.js';
import { MOCK_STOCKS } from './data/warehouseData.js';
import { MOCK_AGENTS } from './data/agentData.js';
import { MOCK_DASHBOARD_STATS } from './data/dashboardData.js';

// 本地内存持久化副本，支持前端交互后的数据联动
let familiesStore = JSON.parse(JSON.stringify(MOCK_FAMILIES));
let ticketsStore = JSON.parse(JSON.stringify(MOCK_REVIEW_TICKETS));
let stocksStore = JSON.parse(JSON.stringify(MOCK_STOCKS));
let agentsStore = JSON.parse(JSON.stringify(MOCK_AGENTS));

/**
 * 包装为企业级统一规范响应体
 * @param {number} code 业务状态码
 * @param {string} message 业务提示
 * @param {any} data 载荷数据
 */
export function createResponse(data = {}, code = 200, message = 'success') {
  return {
    code,
    message,
    data
  };
}

/**
 * Mock 路由分发器
 */
export async function mockDispatch(config) {
  const method = (config.method || 'get').toUpperCase();
  const url = (config.url || '').replace(/^https?:\/\/[^/]+/, ''); // 剥离域名前缀
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
  const params = config.params || {};

  // 模拟真实网络 100~200ms 异步延迟
  await new Promise((resolve) => setTimeout(resolve, 120));

  // ==========================================
  // 1. 认证模块 (Auth)
  // ==========================================
  if (url.includes('/auth/login') && method === 'POST') {
    const { username } = data;
    const user = MOCK_USERS.find(
      (u) => u.username === username || u.role === username || (u.cardNo && u.cardNo === username)
    ) || MOCK_USERS[0];

    return createResponse({
      token: user.token,
      user
    });
  }

  if (url.includes('/auth/profile') && method === 'GET') {
    const user = MOCK_USERS[0];
    return createResponse(user);
  }

  if (url.includes('/auth/logout') && method === 'POST') {
    return createResponse({ success: true }, 200, '登出成功');
  }

  // ==========================================
  // 2. 公民与家庭管理模块 (Citizen & Family)
  // ==========================================
  if (url.includes('/citizen/families') && method === 'GET') {
    return createResponse(familiesStore);
  }

  if (url.match(/\/citizen\/family\/([^/]+)/) && method === 'GET') {
    const cardNo = url.split('/').pop();
    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    return createResponse(family);
  }

  // 更新成员信息 (PUT)
  if (url.match(/\/citizen\/members\/([^/]+)/) && method === 'PUT') {
    const memberId = url.split('/').pop();
    familiesStore.forEach((f) => {
      const target = f.members.find((m) => m.id === memberId);
      if (target) {
        Object.assign(target, data, { isUpdatedInSystem: true });
      }
    });
    return createResponse({ success: true, memberId }, 200, '家庭成员信息已成功更新');
  }

  // 变更户主 (POST)
  if (url.includes('/citizen/change-head') && method === 'POST') {
    const { cardNo, newHeadId, deathProofNo } = data;
    const ticketId = `REV-DTH-${Date.now().toString().slice(-4)}`;
    
    // 生成电子审核工单流转
    const newTicket = {
      id: ticketId,
      source: '变更户主',
      categoryType: '户主死亡注销与继承任命',
      appType: '变更户主 (死亡医学鉴定核验)',
      cardNo: cardNo || 'RC-10029381',
      applicantName: '继承户主候选人',
      targetMemberName: '原户主 → 新任法定户主',
      reason: `原户主身故注销，依据法医公函【${deathProofNo}】申请指定继任户主。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [{ name: `卫生部法医总局_死亡证明_${deathProofNo}.pdf`, type: 'required', verified: true }],
      payload: { newHeadId, deathProofNo, cardNo }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `户主变更申请已提交！已自动转入【电子审核工作台】(工单号 ${ticketId})`);
  }

  // 申请解冻 (POST)
  if (url.includes('/citizen/apply-unfreeze') && method === 'POST') {
    const { cardNo, unfreezeType, targetMemberId, docName } = data;
    const ticketId = `REV-UNF-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id: ticketId,
      source: '申请解冻',
      categoryType: `解冻申诉 (${unfreezeType}情形)`,
      appType: `解冻申请 (${unfreezeType}情形)`,
      cardNo: cardNo || 'RC-10029381',
      applicantName: '配给卡持有人',
      targetMemberName: '解冻当事人',
      reason: `依据【${unfreezeType}】情形提交证明材料【${docName}】，申请恢复配给。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [{ name: docName, type: 'required', verified: true }],
      payload: { unfreezeType, targetMemberId, docName }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `解冻申请已受理！已转入【电子审核工作台】(工单号 ${ticketId})`);
  }

  // 申请分户：优先系统智能自动判别 (POST)
  if (url.includes('/citizen/split-household/auto-judge') && method === 'POST') {
    const { memberIds, currentCardNo } = data;
    const family = familiesStore.find((f) => f.rationCardNo === currentCardNo) || familiesStore[0];
    const selectedMembers = (family?.members || []).filter((m) => memberIds.includes(m.id));

    const hasMale = selectedMembers.some((m) => m.gender === '男');
    const hasFemale = selectedMembers.some((m) => m.gender === '女');
    const isCouple = selectedMembers.length >= 2 && hasMale && hasFemale;

    if (isCouple) {
      // 判别通过：自动执行分户并签发新卡
      const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
      const newFamilyCode = `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`;
      const headCandidate = selectedMembers.find((m) => m.gender === '男') || selectedMembers[0];

      const splitFamily = {
        rationCardNo: newCardNo,
        oldPaperCardNo: 'NEW-SPLIT-AUTO',
        familyCode: newFamilyCode,
        province: family.province,
        district: family.district,
        headName: headCandidate.name,
        phone: headCandidate.phone || family.phone,
        memberCount: selectedMembers.length,
        status: '正常',
        agentId: family.agentId,
        agentName: family.agentName,
        address: headCandidate.residenceInfo || family.address,
        createdDate: new Date().toISOString().split('T')[0],
        lastSelfCheckDate: new Date().toISOString().split('T')[0],
        members: selectedMembers.map((m) => ({
          ...m,
          familyCode: newFamilyCode,
          relation: m.id === headCandidate.id ? '户主' : m.gender === '女' ? '配偶' : '子女',
          isUpdatedInSystem: true
        }))
      };

      // 从原家庭剔除分立成员
      family.members = family.members.filter((m) => !memberIds.includes(m.id));
      family.memberCount = family.members.length;
      familiesStore.unshift(splitFamily);

      return createResponse({
        passed: true,
        newCardNo,
        message: `【系统自动判别通过】识别为标准合法夫妻，已自动批准分户并签发新配给卡号：${newCardNo}！`
      });
    } else {
      // 判别未通过
      const reason = selectedMembers.length === 1
        ? '拟分立成员仅为单独一人，不满足“夫妻标准组合”自动识别规则，系统自动判别未通过。'
        : '拟分立成员组合非标准夫妻结构，系统自动判别未通过。';
      return createResponse({
        passed: false,
        reason,
        message: reason
      });
    }
  }

  // 申请分户：提交分部电子审核 (POST)
  if (url.includes('/citizen/split-household/submit-review') && method === 'POST') {
    const { currentCardNo, memberIds, reason } = data;
    const ticketId = `REV-SPL-${Date.now().toString().slice(-4)}`;

    const newTicket = {
      id: ticketId,
      source: '申请分户',
      categoryType: memberIds.length === 1 ? '单人分户人工审核' : '非夫妻组合分户审核',
      appType: `配给卡分户 (${memberIds.length === 1 ? '单人分立' : '非夫妻组合'})`,
      cardNo: currentCardNo || 'RC-10029381',
      applicantName: '原家庭户主/申请人',
      targetMemberName: `分立人员(${memberIds.length}人)`,
      reason: reason || '系统自动判别未通过，转交分部门人员手动审核',
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      attachments: [
        { name: '民事结婚证书或等效分户司法文件.pdf', type: 'required', verified: true }
      ],
      payload: { splitMemberIds: memberIds }
    };
    ticketsStore.unshift(newTicket);

    return createResponse({ ticketId }, 200, `已成功提交电子审核！工单号【${ticketId}】，等待分部门人员手动审核`);
  }

  // ==========================================
  // 3. 电子审核工作台模块 (Electronic Review)
  // ==========================================
  if (url.includes('/review/tickets') && method === 'GET') {
    const source = params.source;
    if (!source || source === '全部') {
      return createResponse(ticketsStore);
    }
    const filtered = ticketsStore.filter((t) => t.source === source);
    return createResponse(filtered);
  }

  // 提交第一级员工审核意见 (POST)
  if (url.includes('/review/staff-opinion') && method === 'POST') {
    const { ticketId, staffOpinion, staffName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = '待经理终审';
      ticket.staffOpinion = staffOpinion;
      ticket.staffName = staffName || '萨米拉·卡西姆 (资格审核专员)';
      ticket.staffReviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    }
    return createResponse(ticket, 200, '初审意见已提交，工单已流转至经理终审阶段');
  }

  // 提交第二级经理终审裁决 (POST)
  if (url.includes('/review/manager-decision') && method === 'POST') {
    const { ticketId, decision, notes, managerName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = decision === '接受' ? '已批准' : '已驳回';
      ticket.managerDecision = decision;
      ticket.managerNotes = notes;
      ticket.managerName = managerName || '海德尔·阿卜杜拉 (分部经理)';
      ticket.managerDecidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      // 若终审接受，自动落地对应业务实体变更
      if (decision === '接受' && ticket.payload) {
        if (ticket.payload.newHeadId) {
          const family = familiesStore.find((f) => f.rationCardNo === ticket.cardNo);
          if (family) {
            const newHead = family.members.find((m) => m.id === ticket.payload.newHeadId);
            if (newHead) {
              family.members.forEach((m) => {
                if (m.relation === '户主') m.status = '已故';
                if (m.id === ticket.payload.newHeadId) m.relation = '户主';
              });
              family.headName = newHead.name;
            }
          }
        } else if (ticket.payload.unfreezeType && ticket.payload.targetMemberId) {
          familiesStore.forEach((f) => {
            const m = f.members.find((item) => item.id === ticket.payload.targetMemberId);
            if (m) {
              m.status = '正常';
              m.freezeReason = '';
            }
          });
        }
      }
    }
    return createResponse(ticket, 200, `终审已裁决为【${decision}】！`);
  }

  // ==========================================
  // 4. 仓储供应链模块 (Warehouse)
  // ==========================================
  if (url.includes('/warehouse/stocks') && method === 'GET') {
    return createResponse(stocksStore);
  }

  // ==========================================
  // 5. 代理商模块 (Agent)
  // ==========================================
  if (url.includes('/agent/list') && method === 'GET') {
    return createResponse(agentsStore);
  }

  // ==========================================
  // 6. 大屏看板统计 (Dashboard)
  // ==========================================
  if (url.includes('/dashboard/overview') && method === 'GET') {
    return createResponse(MOCK_DASHBOARD_STATS);
  }

  // 默认兜底响应
  return createResponse({}, 200, 'Mock Default Response');
}
