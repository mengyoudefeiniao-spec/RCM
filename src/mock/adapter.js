// 中文测试数据源
import * as zhAuth from './data/authData.js';
import * as zhCitizen from './data/citizenData.js';
import * as zhReview from './data/reviewData.js';
import * as zhWarehouse from './data/warehouseData.js';
import * as zhAgent from './data/agentData.js';
import * as zhDashboard from './data/dashboardData.js';
import * as zhAdmin from './data/adminData.js';
import * as zhTransfer from './data/transferData.js';
import * as zhMemberTransfer from './data/memberTransferData.js';
import * as zhKB from './data/knowledgeBaseData.js';
import * as zhComplaint from './data/complaintData.js';

// 英文测试数据源
import * as enAuth from './data/en/authData.js';
import * as enCitizen from './data/en/citizenData.js';
import * as enReview from './data/en/reviewData.js';
import * as enWarehouse from './data/en/warehouseData.js';
import * as enAgent from './data/en/agentData.js';
import * as enDashboard from './data/en/dashboardData.js';
import * as enAdmin from './data/en/adminData.js';
import * as enTransfer from './data/en/transferData.js';
import * as enMemberTransfer from './data/en/memberTransferData.js';
import * as enKB from './data/en/knowledgeBaseData.js';
import * as enComplaint from './data/en/complaintData.js';
import { MOCK_AGENT_HIERARCHY_TREE, MOCK_AGENT_FAMILIES_MAP } from './data/agentHierarchyData.js';

// 智能客服多语言数据源与匹配工具
import {
  MULTI_LANG_SOURCES,
  MULTI_LANG_TOPICS,
  MULTI_LANG_AGENTS,
  MULTI_LANG_HUMAN_REPLIES,
  matchTopic,
  getTranslatedSource
} from './data/chatMultiLangData.js';

// 多语言内存持久化存储池
const multiLangStores = {
  zh: {
    complaintsStore: JSON.parse(JSON.stringify(zhComplaint.MOCK_COMPLAINTS)),
    adminWarehousesStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_WAREHOUSES_ADMIN)),
    familiesStore: JSON.parse(JSON.stringify(zhCitizen.MOCK_FAMILIES)),
    transferableMembersStore: JSON.parse(JSON.stringify(zhMemberTransfer.MOCK_TRANSFERABLE_MEMBERS)),
    ticketsStore: JSON.parse(JSON.stringify(zhReview.MOCK_REVIEW_TICKETS)),
    stocksStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_STOCKS)),
    rationPlansStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_RATION_PLANS)),
    agentAllocationTasksStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AGENT_ALLOCATION_TASKS)),
    inboundOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_INBOUND_ORDERS)),
    outboundOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_OUTBOUND_ORDERS)),
    transferOrdersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_TRANSFER_ORDERS)),
    stocktakeRecordsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_STOCKTAKE_RECORDS)),
    lossRecordsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_LOSS_RECORDS)),
    inventoryLedgersStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_INVENTORY_LEDGERS)),
    deliveryTrackingsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_DELIVERY_TRACKINGS)),
    agentReceiptsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AGENT_RECEIPTS)),
    discrepancyTicketsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_DISCREPANCY_TICKETS)),
    citizenClaimsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_CITIZEN_CLAIMS)),
    auditLogsStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_AUDIT_LOGS)),
    validationRulesStore: JSON.parse(JSON.stringify(zhWarehouse.MOCK_P1_P5_VALIDATION_RULES)),
    agentsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENTS)),
    myAgentCentersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_MY_AGENT_CENTERS)),
    article140CentersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_ARTICLE_140_CENTERS)),
    agentApplicationsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_APPLICATIONS)),
    adminCardsStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_CITIZEN_CARDS)),
    adminFamiliesStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_FAMILIES_ADMIN)),
    adminAgentsStore: JSON.parse(JSON.stringify(zhAdmin.MOCK_AGENTS_ADMIN)),
    g2bOrdersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_G2B_PURCHASE_ORDERS || [])),
    b2cReservationsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_B2C_RESERVATIONS || [])),
    agentTimeSlotsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_TIME_SLOTS || [])),
    agentLocalStocksStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_LOCAL_STOCKS || [])),
    fullTraceChainStore: JSON.parse(JSON.stringify(zhAgent.MOCK_FULL_TRACE_CHAIN || []))
  },
  en: {
    complaintsStore: JSON.parse(JSON.stringify(enComplaint.MOCK_COMPLAINTS)),
    adminWarehousesStore: JSON.parse(JSON.stringify(enAdmin.MOCK_WAREHOUSES_ADMIN)),
    familiesStore: JSON.parse(JSON.stringify(enCitizen.MOCK_FAMILIES)),
    transferableMembersStore: JSON.parse(JSON.stringify(enMemberTransfer.MOCK_TRANSFERABLE_MEMBERS)),
    ticketsStore: JSON.parse(JSON.stringify(enReview.MOCK_REVIEW_TICKETS)),
    stocksStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_STOCKS)),
    rationPlansStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_RATION_PLANS)),
    agentAllocationTasksStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_AGENT_ALLOCATION_TASKS)),
    inboundOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_INBOUND_ORDERS)),
    outboundOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_OUTBOUND_ORDERS)),
    transferOrdersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_TRANSFER_ORDERS)),
    stocktakeRecordsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_STOCKTAKE_RECORDS)),
    lossRecordsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_LOSS_RECORDS)),
    inventoryLedgersStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_INVENTORY_LEDGERS)),
    deliveryTrackingsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_DELIVERY_TRACKINGS)),
    agentReceiptsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_AGENT_RECEIPTS)),
    discrepancyTicketsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_DISCREPANCY_TICKETS)),
    citizenClaimsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_CITIZEN_CLAIMS)),
    auditLogsStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_AUDIT_LOGS)),
    validationRulesStore: JSON.parse(JSON.stringify(enWarehouse.MOCK_P1_P5_VALIDATION_RULES)),
    agentsStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENTS)),
    myAgentCentersStore: JSON.parse(JSON.stringify(enAgent.MOCK_MY_AGENT_CENTERS)),
    article140CentersStore: JSON.parse(JSON.stringify(enAgent.MOCK_ARTICLE_140_CENTERS || zhAgent.MOCK_ARTICLE_140_CENTERS)),
    agentApplicationsStore: JSON.parse(JSON.stringify(enAgent.MOCK_AGENT_APPLICATIONS || zhAgent.MOCK_AGENT_APPLICATIONS)),
    adminCardsStore: JSON.parse(JSON.stringify(enAdmin.MOCK_CITIZEN_CARDS)),
    adminFamiliesStore: JSON.parse(JSON.stringify(enAdmin.MOCK_FAMILIES_ADMIN)),
    adminAgentsStore: JSON.parse(JSON.stringify(enAdmin.MOCK_AGENTS_ADMIN)),
    g2bOrdersStore: JSON.parse(JSON.stringify(zhAgent.MOCK_G2B_PURCHASE_ORDERS || [])),
    b2cReservationsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_B2C_RESERVATIONS || [])),
    agentTimeSlotsStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_TIME_SLOTS || [])),
    agentLocalStocksStore: JSON.parse(JSON.stringify(zhAgent.MOCK_AGENT_LOCAL_STOCKS || [])),
    fullTraceChainStore: JSON.parse(JSON.stringify(zhAgent.MOCK_FULL_TRACE_CHAIN || []))
  }
};

export function getActiveLang(config) {
  if (config && config.headers && config.headers['Accept-Language']) {
    return config.headers['Accept-Language'] === 'en' ? 'en' : 'zh';
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('rcm_language') === 'en' ? 'en' : 'zh';
  }
  return 'zh';
}

/**
 * 获取智能客服当前请求的精确语言代码 (支持 zh, en, ar, ku)
 */
export function getAiServiceLang(config, data) {
  if (data && data.lang && ['zh', 'en', 'ar', 'ku'].includes(data.lang)) {
    return data.lang;
  }
  const headerLang = config?.headers?.['Accept-Language'];
  if (headerLang && ['zh', 'en', 'ar', 'ku'].includes(headerLang)) {
    return headerLang;
  }
  if (typeof localStorage !== 'undefined') {
    const storedLang = localStorage.getItem('rcm_language');
    if (storedLang && ['zh', 'en', 'ar', 'ku'].includes(storedLang)) {
      return storedLang;
    }
  }
  return 'zh';
}


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

  const reqLang = getActiveLang(config);
  const isEn = reqLang === 'en';
  const activeStores = multiLangStores[reqLang];

  // 解构当前语言环境下对应的测试数据
  let complaintsStore = activeStores.complaintsStore;
  let adminWarehousesStore = activeStores.adminWarehousesStore;
  let familiesStore = activeStores.familiesStore;
  let transferableMembersStore = activeStores.transferableMembersStore;
  let ticketsStore = activeStores.ticketsStore;
  let stocksStore = activeStores.stocksStore;
  let rationPlansStore = activeStores.rationPlansStore;
  let agentAllocationTasksStore = activeStores.agentAllocationTasksStore;
  let inboundOrdersStore = activeStores.inboundOrdersStore;
  let outboundOrdersStore = activeStores.outboundOrdersStore;
  let transferOrdersStore = activeStores.transferOrdersStore;
  let stocktakeRecordsStore = activeStores.stocktakeRecordsStore;
  let lossRecordsStore = activeStores.lossRecordsStore;
  let inventoryLedgersStore = activeStores.inventoryLedgersStore;
  let deliveryTrackingsStore = activeStores.deliveryTrackingsStore;
  let agentReceiptsStore = activeStores.agentReceiptsStore;
  let discrepancyTicketsStore = activeStores.discrepancyTicketsStore;
  let citizenClaimsStore = activeStores.citizenClaimsStore;
  let auditLogsStore = activeStores.auditLogsStore;
  let validationRulesStore = activeStores.validationRulesStore;
  let agentsStore = activeStores.agentsStore;
  let myAgentCentersStore = activeStores.myAgentCentersStore;
  let article140CentersStore = activeStores.article140CentersStore;
  let agentApplicationsStore = activeStores.agentApplicationsStore;
  let adminCardsStore = activeStores.adminCardsStore;
  let adminFamiliesStore = activeStores.adminFamiliesStore;
  let adminAgentsStore = activeStores.adminAgentsStore;
  let g2bOrdersStore = activeStores.g2bOrdersStore;
  let b2cReservationsStore = activeStores.b2cReservationsStore;
  let agentTimeSlotsStore = activeStores.agentTimeSlotsStore;
  let agentLocalStocksStore = activeStores.agentLocalStocksStore;
  let fullTraceChainStore = activeStores.fullTraceChainStore;

  // 绑定当前语言的常量集合
  const MOCK_USERS = isEn ? enAuth.MOCK_USERS : zhAuth.MOCK_USERS;
  const MOCK_CURRENT_AGENT_PROFILE = isEn ? enAgent.MOCK_CURRENT_AGENT_PROFILE : zhAgent.MOCK_CURRENT_AGENT_PROFILE;
  const TRANSFER_BRANCH_OPTIONS = isEn ? enTransfer.TRANSFER_BRANCH_OPTIONS : zhTransfer.TRANSFER_BRANCH_OPTIONS;
  const MOCK_DASHBOARD_STATS = isEn ? enDashboard.MOCK_DASHBOARD_STATS : zhDashboard.MOCK_DASHBOARD_STATS;
  const MOCK_ADMIN_DASHBOARD_DATA = isEn ? enDashboard.MOCK_ADMIN_DASHBOARD_DATA : zhDashboard.MOCK_ADMIN_DASHBOARD_DATA;
  const MOCK_AGENT_DASHBOARD_DATA = isEn ? enDashboard.MOCK_AGENT_DASHBOARD_DATA : zhDashboard.MOCK_AGENT_DASHBOARD_DATA;
  const MOCK_TRACE_CHAINS = isEn ? enWarehouse.MOCK_TRACE_CHAINS : zhWarehouse.MOCK_TRACE_CHAINS;
  const MOCK_LOSS_AUDIT_STATS = isEn ? enWarehouse.MOCK_LOSS_AUDIT_STATS : zhWarehouse.MOCK_LOSS_AUDIT_STATS;
  const MOCK_KNOWLEDGE_BASES = isEn ? enKB.MOCK_KNOWLEDGE_BASES : zhKB.MOCK_KNOWLEDGE_BASES;
  const MOCK_KNOWLEDGE_CHUNKS = isEn ? enKB.MOCK_KNOWLEDGE_CHUNKS : zhKB.MOCK_KNOWLEDGE_CHUNKS;
  const MOCK_RECOMMENDED_PROMPTS = isEn ? enKB.MOCK_RECOMMENDED_PROMPTS : zhKB.MOCK_RECOMMENDED_PROMPTS;
  const MOCK_HUMAN_AGENTS = isEn ? enKB.MOCK_HUMAN_AGENTS : zhKB.MOCK_HUMAN_AGENTS;


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

  // 1.1 纸质配给卡 OCR 扫描识别与有效性比对校验
  if (url.includes('/auth/ocr-paper-card') && method === 'POST') {
    if (data.mockInvalid) {
      return createResponse({
        paperCardNo: 'IQ-P-1988-001928',
        headName: '萨巴赫·努里',
        province: '巴格达省',
        district: '曼苏尔区',
        memberCount: 0,
        isValid: false,
        validationStatus: '已注销失效',
        validationNotice: '核验未通过：该纸质配给卡存根已于历史系统完成注销注记，存在重卡风险，禁止申领新卡。'
      }, 400, '纸质配给卡已被注销或存根失效，无法升级注册！');
    }

    return createResponse({
      paperCardNo: 'IQ-P-1994-082194',
      headName: data.headName || '艾哈迈德·哈桑·萨利赫',
      province: '巴格达省',
      district: '卡尔赫区 (Al-Karkh)',
      memberCount: 5,
      issueYear: '1994',
      branchCode: 'BAG-KARKH-01',
      confidenceScore: 0.985,
      isValid: true,
      validationStatus: '有效在册',
      validationNotice: '内政部底账存根真实有效，经防重筛查无历史重复建卡记录，准予进入数字化建档。'
    }, 200, '纸质配给卡 OCR 识别完成并通过有效性校验！');
  }

  // 1.2 发送手机短信验证码
  if (url.includes('/auth/send-sms') && method === 'POST') {
    const code = '839201'; // 固化演示验证码便于一键填入
    return createResponse({
      smsCode: code,
      phone: data.phone,
      expireSeconds: 300
    }, 200, `验证码已发送至手机 ${data.phone || ''}，演示验证码：${code}`);
  }

  // 1.3 纸质卡升级换发与公民账号注册
  if (url.includes('/auth/register-citizen') && method === 'POST') {
    const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      username: newCardNo,
      name: `${data.headName || '新注册持卡人'} (户主)`,
      role: 'citizen',
      department: `${data.province || '巴格达省'}${data.district || '卡尔赫区'}`,
      cardNo: newCardNo,
      token: `jwt-token-citizen-new-${Date.now()}`
    };
    MOCK_USERS.push(newUser);
    return createResponse({
      user: newUser,
      token: newUser.token,
      cardNo: newCardNo
    }, 200, `恭喜！纸质配给卡数字化升级成功，已签发新电子配给卡【${newCardNo}】！`);
  }

  // 1.4 活体人脸识别与统一国民卡双因子核验
  if (url.includes('/auth/verify-biometric') && method === 'POST') {
    return createResponse({
      passed: true,
      similarityScore: '99.4%',
      chipStatus: 'AUTHENTIC',
      matchNotice: '生物活体人脸与统一国民卡 ICAO-9303 防伪芯片匹配通过',
      timestamp: new Date().toISOString()
    }, 200, '生物活体及统一卡双因子对碰成功！');
  }

  // 1.5 异地家庭成员 GPS 与邀请码远程核查
  if (url.includes('/auth/verify-remote') && method === 'POST') {
    const { memberName, location } = data;
    if (location === 'same' || location === '同一住址') {
      return createResponse({
        passed: false,
        message: '核验未通过：定位检测该成员与户主处于同一物理位置，不属于异地居住情形，拒绝授权。'
      }, 400, '非异地成员定位异常');
    }
    if (!memberName || memberName.trim().length < 2) {
      return createResponse({
        passed: false,
        message: '核验未通过：姓名与家庭存根不吻合。'
      }, 400, '姓名核对未通过');
    }
    return createResponse({
      passed: true,
      message: `异地基站与 GPS 核验通过！已确认家庭成员【${memberName}】在【${location || '异地'}】的合法配给授信。`
    }, 200, '异地远程验证通过！');
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

  // 申报添加新家庭成员 (POST)
  if (url.match(/\/citizen\/family\/([^/]+)\/members/) && method === 'POST') {
    const cardNo = url.split('/')[3];
    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const newMember = {
      id: `M-${Date.now().toString().slice(-4)}`,
      name: data.name,
      nationalId: data.nationalId,
      familyCode: family.familyCode,
      relation: data.relation || '子女',
      birthDate: data.birthDate || '2020-01-01',
      gender: data.gender || '男',
      status: '正常',
      phone: data.phone || '',
      residenceInfo: data.residenceInfo || family.address,
      isUpdatedInSystem: true,
      faceVerified: true
    };
    family.members.push(newMember);
    family.memberCount = family.members.length;
    return createResponse(newMember, 200, `新成员【${newMember.name}】已成功申报登记并纳入电子配给卡！`);
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

    return createResponse({ ticketId }, 200, `户主变更申请已提交！已自动转入【审核工作台】(工单号 ${ticketId})`);
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

    return createResponse({ ticketId }, 200, `解冻申请已受理！已转入【审核工作台】(工单号 ${ticketId})`);
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

  // 代理转移候选分部、中心及代理元数据 (GET)
  if (url.includes('/citizen/transfer-agent/options') && method === 'GET') {
    return createResponse(TRANSFER_BRANCH_OPTIONS);
  }

  // 提交配给卡代理转移申请 (POST)
  if (url.includes('/citizen/transfer-agent/submit') && method === 'POST') {
    const {
      cardNo,
      fromProvince,
      toProvince,
      toBranch,
      toCenter,
      toFlourAgent,
      toFoodAgent,
      district,
      subDistrict,
      nearestLandmark,
      residenceProofDoc,
      article140Doc
    } = data;

    // 1. 容量红线检查 (1,500户上限)
    if (toFlourAgent?.currentHouseholds >= 1500) {
      return createResponse({}, 400, `所选面粉代理【${toFlourAgent.name}】已达 1,500 户服务上限，禁止转入，请选择其他网点！`);
    }
    if (toFoodAgent?.currentHouseholds >= 1500) {
      return createResponse({}, 400, `所选食品代理【${toFoodAgent.name}】已达 1,500 户服务上限，禁止转入，请选择其他网点！`);
    }

    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const isIntraProvince = fromProvince && toProvince && (fromProvince.split(' ')[0] === toProvince.split(' ')[0]);

    if (isIntraProvince) {
      // 路径 A: 省内转移 (全自动批准)
      family.province = toProvince;
      family.district = `${toBranch} · ${toCenter?.centerName || ''}`;
      family.agentId = `${toFlourAgent?.id || 'FA'} / ${toFoodAgent?.id || 'FD'}`;
      family.agentName = `${toFlourAgent?.name || ''} ＆ ${toFoodAgent?.name || ''}`;
      family.address = `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`;

      return createResponse({
        autoApproved: true,
        passed: true,
        message: `【省内转移自动核准通过】已自动将配给卡转移至【${toFlourAgent?.name}】与【${toFoodAgent?.name}】，配给卡代理及供货点已即时更新生效！`
      }, 200, '省内转移全自动批准生效！');
    } else {
      // 路径 B: 跨省转移 (流转至转入分部两级电子审核工作台)
      const ticketId = `REV-TRF-${Date.now().toString().slice(-4)}`;
      const newTicket = {
        id: ticketId,
        source: '代理转移',
        categoryType: '跨省代理转移两级审批',
        appType: `跨省代理转移 (${fromProvince} → ${toProvince})`,
        cardNo: cardNo || family.rationCardNo,
        applicantName: family.headName,
        targetMemberName: `${family.headName} (全户 ${family.memberCount} 人)`,
        reason: `因工作/家庭迁居由【${fromProvince}】跨省迁往【${toProvince} · ${toBranch} · ${toCenter?.centerName}】，申请就近转移面粉代理【${toFlourAgent?.name}】与食品代理【${toFoodAgent?.name}】。`,
        status: '待分部初审',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: '待决',
        attachments: [
          { name: residenceProofDoc || '新迁入地居住证及确认证明公函.pdf', type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'transferAgent',
          cardNo: cardNo || family.rationCardNo,
          toProvince,
          toBranch,
          toCenterName: toCenter?.centerName,
          toFlourAgent,
          toFoodAgent,
          newAddress: `${toProvince} ${district || ''} ${subDistrict || ''} (地标: ${nearestLandmark || '就近街区'})`
        }
      };
      ticketsStore.unshift(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        message: `跨省代理转移申请已提交！已流转至【${toProvince}】转入分部审核工作台，工单编号：${ticketId}。`
      }, 200, `跨省转移申报已转入分部审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 2.2 成员转移业务 (Member Transfer)
  // ==========================================
  // 成员转移候选池 (GET)
  if (url.includes('/citizen/member-transfer/candidates') && method === 'GET') {
    return createResponse(transferableMembersStore);
  }

  // 根据国民编号查询待转移成员档案与状态 (GET)
  if (url.includes('/citizen/member-transfer/query') && method === 'GET') {
    const cleanUrl = url.split('?')[0];
    const nationalId = cleanUrl.replace(/\/+$/, '').split('/').pop().trim();

    const found = transferableMembersStore.find((m) => m.nationalId === nationalId);
    if (!found) {
      return createResponse({}, 404, `国家人口在册档案数据库未查找到国民编号为【${nationalId}】的在册公民档案，请核对后重试。`);
    }
    return createResponse(found);
  }

  // 提交成员转移申请 (POST)
  if (url.includes('/citizen/member-transfer/submit') && method === 'POST') {
    const {
      targetCardNo,
      nationalId,
      member: reqMember,
      transferType: reqTransferType,
      transferReasonType,
      article140Doc,
      article140DocName,
      reasonDoc,
      proofDocName,
      paymentInfo
    } = data;

    const transferType = reqTransferType || transferReasonType || 'wife';
    const effectiveNationalId = nationalId || reqMember?.nationalId;
    let member = reqMember || transferableMembersStore.find((m) => m.nationalId === effectiveNationalId);

    // 若通过 ID 未找到，动态构建有效在册人员以确保全流程演示通畅
    if (!member) {
      member = {
        nationalId: effectiveNationalId || '198302194821',
        name: '萨米拉·卡西姆·哈米德',
        relationType: transferType,
        gender: transferType === 'wife' ? '女' : '男',
        birthDate: '1983-02-19',
        fatherName: '卡西姆·哈米德',
        familyCode: 'FAM-BAG-08832',
        currentCardNo: 'RC-99081293',
        currentProvince: '巴格达省 (Baghdad)',
        currentCenterName: '鲁萨法第二配给中心 (#08)',
        isArticle140Area: false,
        isUpdatedInSystem: true,
        faceVerified: true
      };
    }

    // 核心前置拦截：未在系统中更新的成员禁止转移
    if (member.isUpdatedInSystem === false) {
      return createResponse({}, 400, '【前置条件未满足】：该成员未在配给卡系统中完成登记更新，国家法令严禁办理转移业务！');
    }

    const currentFamily = familiesStore.find((f) => f.rationCardNo === targetCardNo) || familiesStore[0];
    const isArticle140 = !!(member.isArticle140Area || currentFamily.province.includes('基尔库克') || currentFamily.province.includes('迪亚拉') || currentFamily.province.includes('尼尼微'));

    let autoApproved = false;
    let reasonText = '';

    // 5. 按成员类型划分的自动批准条件
    if (transferType === 'wife') {
      // 5.1 妻子转移：同家庭编号 且 双方父亲姓名不同
      // 夫家父亲名 (艾哈迈德的父亲为哈桑·萨利赫)
      const isIdentified = (member.familyCode === currentFamily.familyCode) && (member.fatherName !== '哈桑·萨利赫');
      if (isIdentified) {
        autoApproved = true;
        reasonText = '【妻子自动识别通过】：妻子与新卡户主同属已登记家庭档案，且双方父亲姓名不同（排除近亲），系统自动核准通过。';
      } else {
        autoApproved = false;
        reasonText = '系统未能自动匹配妻子关联信息（家庭档案未同步或近亲识别异常），申请转交配给分部两级电子审核。';
      }
    } else if (transferType === 'child') {
      // 5.2 子女转移
      if (isArticle140) {
        // 在第140号决议地区以内：子女转移始终须经配给分部员工电子审核，并上传第140号决议无异议文件
        autoApproved = false;
        reasonText = '涉及第140号决议争议覆盖区域，依据国家法规，子女转移必须转交转入分部两级人工电子审核并备案无异议公函。';
      } else {
        // 在第140号决议地区以外：同时满足 1.家庭编号一致 2.父亲名字与新卡户主一致
        const famCodeMatch = member.familyCode === currentFamily.familyCode;
        const fatherNameMatch = member.fatherName === currentFamily.headName;
        if (famCodeMatch && fatherNameMatch) {
          autoApproved = true;
          reasonText = '【子女自动识别通过】：子女与新卡家庭编号一致且生父姓名与新卡户主一致，系统自动批准转移。';
        } else {
          autoApproved = false;
          reasonText = '子女亲属比对信息未完全吻合，申请转交配给分部员工进行电子审核。';
        }
      }
    } else {
      // 5.3 其他情况（监护、抚养或其他原因）：始终须经配给分部员工电子审核
      autoApproved = false;
      reasonText = `转移事由属于【${transferType === 'guardianship' ? '法定监护' : transferType === 'support' ? '亲属抚养' : '特殊法定原因'}】，依法须经配给分部两级人工审查法定证明公文。`;
    }

    if (autoApproved) {
      // 路径 1: 自动批准：将成员正式移入当前家庭
      const newMember = {
        id: `M-TRF-${Date.now().toString().slice(-4)}`,
        name: member.name,
        nationalId: member.nationalId,
        familyCode: currentFamily.familyCode,
        relation: transferType === 'wife' ? '配偶' : '子女',
        birthDate: member.birthDate || '1995-01-01',
        gender: member.gender || '女',
        status: '正常',
        phone: member.phone || currentFamily.phone,
        residenceInfo: currentFamily.address,
        isUpdatedInSystem: true,
        faceVerified: true
      };

      currentFamily.members.push(newMember);
      currentFamily.memberCount = currentFamily.members.length;

      // 从候选池移除
      transferableMembersStore = transferableMembersStore.filter((m) => m.nationalId !== member.nationalId); activeStores.transferableMembersStore = transferableMembersStore;

      return createResponse({
        autoApproved: true,
        passed: true,
        member: newMember,
        message: `【成员转移全自动批准生效】${reasonText}，新成员【${member.name}】已成功移入您的电子配给卡！`
      }, 200, '成员转移已自动批准并即刻生效！');
    } else {
      // 路径 2: 电子审核：转入配给分部工作台 (分部初审 -> 经理终审)
      const ticketId = `REV-MEM-${Date.now().toString().slice(-4)}`;
      const newTicket = {
        id: ticketId,
        source: '成员转移',
        categoryType: transferType === 'wife' ? '妻子转移人工核验' : transferType === 'child' ? '子女跨卡转移审核' : '法定监护/抚养跨卡转移',
        appType: `跨卡成员转移 (${member.name})`,
        cardNo: targetCardNo || currentFamily.rationCardNo,
        applicantName: currentFamily.headName,
        targetMemberName: `${member.name} (国民号: ${member.nationalId})`,
        reason: `${reasonText} 原持卡所属【${member.currentProvince} · ${member.currentCenterName}】`,
        status: '待分部初审',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: '待决',
        attachments: [
          { name: reasonDoc || '亲属法律关系证明公函.pdf', type: 'required', verified: true },
          ...(article140Doc ? [{ name: article140Doc, type: 'required', verified: true }] : [])
        ],
        payload: {
          type: 'memberTransfer',
          targetCardNo,
          member,
          transferType
        }
      };
      ticketsStore.unshift(newTicket);

      return createResponse({
        autoApproved: false,
        passed: true,
        ticketId,
        message: `成员转移申请已受理！工单号【${ticketId}】，已转入接收分部审核工作台，请等待分部专员与经理两级终审签批。`
      }, 200, `已成功转入分部电子审核工作台 (工单号 ${ticketId})`);
    }
  }

  // ==========================================
  // 3. 审核工作台模块 (Electronic Review)
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
      ticket.status = isEn ? 'Pending Manager Review' : '待经理终审';
      ticket.staffOpinion = staffOpinion;
      ticket.staffName = staffName || (isEn ? 'Samira Qasim (Review Officer)' : '萨米拉·卡西姆 (资格审核专员)');
      ticket.staffReviewedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const otherLang = isEn ? 'zh' : 'en';
      const otherTicket = multiLangStores[otherLang]?.ticketsStore?.find(t => t.id === ticketId);
      if (otherTicket) {
        otherTicket.status = otherLang === 'en' ? 'Pending Manager Review' : '待经理终审';
        otherTicket.staffOpinion = staffOpinion;
        otherTicket.staffReviewedAt = ticket.staffReviewedAt;
      }
    }
    return createResponse(ticket, 200, '初审意见已提交，工单已流转至经理终审阶段');
  }

  // 提交第二级经理终审裁决 (POST)
  if (url.includes('/review/manager-decision') && method === 'POST') {
    const { ticketId, decision, notes, managerName } = data;
    const ticket = ticketsStore.find((t) => t.id === ticketId);
    if (ticket) {
      const isAccept = decision === '接受' || decision === 'Approved';
      ticket.status = isAccept ? (isEn ? 'Approved' : '已批准') : (isEn ? 'Rejected' : '已驳回');
      ticket.managerDecision = isAccept ? (isEn ? 'Approved' : '接受') : (isEn ? 'Rejected' : '已驳回');
      ticket.managerNotes = notes;
      ticket.managerName = managerName || (isEn ? 'Haider Abdullah (Branch Manager)' : '海德尔·阿卜杜拉 (分部经理)');
      ticket.managerDecidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

      const otherLang = isEn ? 'zh' : 'en';
      const otherTicket = multiLangStores[otherLang]?.ticketsStore?.find(t => t.id === ticketId);
      if (otherTicket) {
        otherTicket.status = isAccept ? (otherLang === 'en' ? 'Approved' : '已批准') : (otherLang === 'en' ? 'Rejected' : '已驳回');
        otherTicket.managerDecision = isAccept ? (otherLang === 'en' ? 'Approved' : '接受') : (otherLang === 'en' ? 'Rejected' : '拒绝');
        otherTicket.managerNotes = notes;
        otherTicket.managerDecidedAt = ticket.managerDecidedAt;
      }

      // 若终审接受，自动落地对应业务实体变更
      if (decision === '接受' && ticket.payload) {
        if (ticket.payload.type === 'transferAgent') {
          // 跨省代理转移终审落地
          const targetFam = familiesStore.find((f) => f.rationCardNo === ticket.payload.cardNo);
          if (targetFam) {
            targetFam.province = ticket.payload.toProvince;
            targetFam.district = `${ticket.payload.toBranch} · ${ticket.payload.toCenterName}`;
            targetFam.agentId = `${ticket.payload.toFlourAgent?.id || 'FA'} / ${ticket.payload.toFoodAgent?.id || 'FD'}`;
            targetFam.agentName = `${ticket.payload.toFlourAgent?.name || ''} ＆ ${ticket.payload.toFoodAgent?.name || ''}`;
            targetFam.address = ticket.payload.newAddress;
          }
        } else if (ticket.payload.newHeadId) {
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
        } else if (ticket.payload.type === 'memberTransfer' && ticket.payload.member) {
          // 成员转移终审落地
          const targetFam = familiesStore.find((f) => f.rationCardNo === ticket.payload.targetCardNo) || familiesStore[0];
          if (targetFam) {
            const mem = ticket.payload.member;
            targetFam.members.push({
              id: `M-TRF-${Date.now().toString().slice(-4)}`,
              name: mem.name,
              nationalId: mem.nationalId,
              familyCode: targetFam.familyCode,
              relation: ticket.payload.transferType === 'wife' ? '配偶' : ticket.payload.transferType === 'child' ? '子女' : '被监护亲属',
              birthDate: mem.birthDate || '2000-01-01',
              gender: mem.gender || '女',
              status: '正常',
              phone: mem.phone || targetFam.phone,
              residenceInfo: targetFam.address,
              isUpdatedInSystem: true,
              faceVerified: true
            });
            targetFam.memberCount = targetFam.members.length;
          }
        }
      }
    }
    return createResponse(ticket, 200, `终审已裁决为【${decision}】！`);
  }

  // ==========================================
  // 4. 仓储供应链模块 (Warehouse - SCM / BPM / UNICODE)
  // ==========================================

  // 4.1 配给总计划列表 (SCM / BPM)
  if (url.includes('/warehouse/ration-plans') && method === 'GET') {
    return createResponse(rationPlansStore);
  }

  // 4.1.1 制定并下发新的宏观物资配给总计划
  if (url.includes('/warehouse/ration-plans') && method === 'POST') {
    const newPlan = {
      id: `PLAN-${Date.now().toString().slice(-4)}`,
      planNo: data.planNo || `PLAN-2026-N${rationPlansStore.length + 1}`,
      title: data.title || '新增战略物资口粮保供计划',
      periodName: data.periodName || '2026年保供周期',
      startDate: data.startDate || '2026-10-01',
      endDate: data.endDate || '2026-12-31',
      scope: data.scope || '全国全域覆盖',
      targetHouseholds: data.targetHouseholds || 1200000,
      targetBeneficiaries: data.targetBeneficiaries || 5400000,
      issuer: data.issuer || '贸易部食品配给署',
      issueDate: new Date().toISOString().split('T')[0],
      status: '执行中',
      allocationStatus: '待分解排程',
      quotaStandards: data.quotaStandards || [
        { itemName: '精制大米', itemCode: 'RICE-BAS-01', quotaPerPerson: 3.0, unit: 'KG/人/月', totalQty: 48000000 },
        { itemName: '特级面粉', itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9.0, unit: 'KG/人/月', totalQty: 144000000 },
        { itemName: '食用植物油', itemCode: 'OIL-SUN-03', quotaPerPerson: 1.0, unit: 'L/人/月', totalQty: 16000000 },
        { itemName: '纯精白糖', itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1.0, unit: 'KG/人/月', totalQty: 16000000 }
      ],
      overallProgress: {
        totalPlanWeightTon: 224000,
        outboundWeightTon: 40000,
        agentReceivedWeightTon: 20000,
        citizenClaimedWeightTon: 5000,
        outboundRate: 17.8,
        receivedRate: 8.9,
        claimedRate: 2.2
      }
    };
    rationPlansStore.unshift(newPlan);
    return createResponse(newPlan, 200, '配给总计划制定并下发成功！');
  }

  // 4.2 查询代理网点配额分解与排程任务单 (联动“我的代理中心列表”)
  if (url.includes('/warehouse/agent-tasks') && method === 'GET') {
    let result = [...agentAllocationTasksStore];
    if (params.agentCenterId) {
      result = result.filter((t) => t.agentCenterId === params.agentCenterId);
    }
    if (params.planNo) {
      result = result.filter((t) => t.planNo === params.planNo);
    }
    return createResponse(result);
  }

  // 4.2.1 触发依据贸易部月度计划自动生成自己和下级代理的三层月度配给计划 (省级 -> 区域 -> 街道)
  if (url.includes('/warehouse/agent-tasks/decompose') && method === 'POST') {
    const selectedPlan = rationPlansStore.find((p) => p.planNo === data.planNo || p.id === data.planId) || rationPlansStore[0];
    const month = data.targetMonth || selectedPlan.periodMonth || '2026-10';

    // 扁平化三级代理节点树
    const nodes = [];
    function traverseNode(node, parentTitle = '') {
      nodes.push({ ...node, parentTitle });
      if (node.children && node.children.length > 0) {
        node.children.forEach((c) => traverseNode(c, node.title || node.levelName || node.name));
      }
    }
    (MOCK_AGENT_HIERARCHY_TREE || []).forEach((r) => traverseNode(r));

    // 严格根据对应代理的户数自动分配额度 (禁止手动分配)
    const newTasks = nodes.map((agent, index) => {
      const households =
        agent.level === 'PROVINCE'
          ? (agent.totalHouseholdsServed || 7650)
          : agent.level === 'DISTRICT'
          ? (agent.totalHouseholdsServed || 4100)
          : (agent.householdsCount || 1000);
      const citizens = households * 4;
      const totalAmount = households * 53800;

      const items = (selectedPlan.quotaStandards || []).map((std) => {
        const plannedQty = Math.round(std.quotaPerPerson * citizens);
        const subtotalIQD = plannedQty * (std.guidePriceIQD || 1000);
        return {
          itemName: std.itemName,
          itemCode: std.itemCode,
          quotaPerPerson: std.quotaPerPerson,
          guidePriceIQD: std.guidePriceIQD || 1000,
          plannedQty,
          allocatedQtyTon: Number((plannedQty / 1000).toFixed(2)),
          outboundQty: Math.round(plannedQty * 0.8),
          receivedQty: Math.round(plannedQty * 0.7),
          claimedQty: Math.round(plannedQty * 0.5),
          unit: std.unit.split('/')[0] || 'KG',
          subtotalIQD,
          completionRate: 50.0
        };
      });

      return {
        id: `TASK-AUTO-${month.replace('-', '')}-${agent.id}`,
        taskNo: `TASK-${month.replace('-', '')}-${agent.level.slice(0, 3)}-${agent.id}`,
        planNo: selectedPlan.planNo,
        periodMonth: month,
        agentLevel: agent.level,
        agentLevelName:
          agent.level === 'PROVINCE'
            ? '省级代理'
            : agent.level === 'DISTRICT'
            ? '区域代理'
            : '街道代理',
        agentCenterId: agent.id,
        centerName: agent.storeName || agent.title || agent.name,
        province: agent.province || '巴格达省 (Baghdad)',
        district: agent.district || agent.jurisdictionScope || '巴格达全境',
        responsiblePerson: agent.name,
        isSelf: !!agent.isSelf,
        isArticle140: !!agent.isArticle140,
        registeredHouseholds: households,
        coveredCitizens: citizens,
        deliveryCycle: `${month} 月度全量配额`,
        scheduleStartDate: `${month}-01`,
        scheduleEndDate: `${month}-28`,
        scheduledDeliveryDate: `${month}-15`,
        totalGuideAmountIQD: totalAmount,
        autoAllocatedFormula: `签约户数 ${households.toLocaleString()}户 × 4人/户 × 国家月度保供配额指标 (依据名下实名签约家庭户数算法锁定，严禁手动篡改)`,
        items,
        taskStatus: '正常履约中',
        status: '执行中',
        riskLevel: 'LOW',
        lastDispatchedDeliveryNo: `DELIV-${month.replace('-', '')}-${agent.id}`
      };
    });

    agentAllocationTasksStore = [
      ...newTasks,
      ...agentAllocationTasksStore.filter((t) => t.periodMonth !== month)
    ];
    activeStores.agentAllocationTasksStore = agentAllocationTasksStore;
    selectedPlan.allocationStatus = '已完成三级代理排程';
    return createResponse(
      newTasks,
      200,
      `系统已成功依据贸易部【${selectedPlan.title}】及三级代理架构 (${nodes.length} 个层级节点) 的签约户数，自动完成 ${month} 月度配额分解与国家指导价格测算！`
    );
  }

  // 4.3 采购收货与质检入库单列表 (SCM)
  if (url.includes('/warehouse/inbound-orders') && method === 'GET') {
    return createResponse(inboundOrdersStore);
  }

  // 4.3.1 提交采购收货与质检入库申请 (强制 P1 校验: 贸易部计划编号 + 生产日期与效期批次 + 一物一码建档)
  if (url.includes('/warehouse/inbound-orders') && method === 'POST') {
    // [P1 校验 1] 必须校验贸易部计划编号
    if (!data.tradePlanNo || String(data.tradePlanNo).trim() === '') {
      return createResponse(null, 400, '【P1 规则校验拦截】采购入库单必须校验并关联贸易部物资配给总计划编号 (tradePlanNo)！');
    }
    const planExists = rationPlansStore.some((p) => p.planNo === data.tradePlanNo);
    if (!planExists) {
      return createResponse(null, 400, `【P1 规则校验拦截】贸易部计划编号【${data.tradePlanNo}】在总规系统不存在或已失效！`);
    }

    // [P1 校验 2] 批次号生成时必须包含生产日期及效期字段
    if (!data.batchNo || !data.productionDate || !data.expiryDate) {
      return createResponse(null, 400, '【P1 规则校验拦截】强制登记物资生产批次号、生产日期及有效截止日期！');
    }
    const prodClean = data.productionDate.replace(/-/g, '');
    const expClean = data.expiryDate.replace(/-/g, '').slice(0, 6);
    if (!data.batchNo.includes(prodClean) || (!data.batchNo.includes('EXP') && !data.batchNo.includes(expClean))) {
      return createResponse(
        null,
        400,
        `【P1 规则校验拦截】批次号生成规则不合规！批次号必须包含生产日期（${prodClean}）及效期字段（如 EXP${expClean}）！当前批次号：${data.batchNo}`
      );
    }

    // 生成全局唯一一物一码/箱码标签 (UNICODE 服务)
    const traceCode = `UNI-BOX-${prodClean}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const newInbound = {
      id: `IN-${Date.now().toString().slice(-4)}`,
      inboundNo: `IN-${prodClean}-${Math.floor(100 + Math.random() * 900)}`,
      purchaseOrderNo: data.purchaseOrderNo || `PO-MOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      tradePlanNo: data.tradePlanNo,
      itemName: data.itemName || '精制大米',
      itemCode: data.itemCode || 'RICE-BAS-01',
      category: data.category || '谷物粮食',
      expectedQty: Number(data.qty || 10000),
      actualQty: Number(data.qty || 10000),
      unit: data.unit || '公斤 (KG)',
      supplier: data.supplier || '国家粮食贸易总公司',
      warehouseId: data.warehouseId || 'WH-BAG-01',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      batchNo: data.batchNo,
      productionDate: data.productionDate,
      expiryDate: data.expiryDate,
      uniqueTraceCode: traceCode,
      inspectStatus: data.inspectStatus || '质检合格',
      inspectReport: data.inspectReport || '化验指标合格，符合国家战略保供标准',
      inspector: data.inspector || '阿里·扎基 (品控质检员)',
      inboundOperator: '当前登录操作人',
      inboundTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '已上架入库'
    };
    inboundOrdersStore.unshift(newInbound);

    // 联动 1: 更新或追加六维库存
    const existingStock = stocksStore.find(
      (s) => s.warehouseName === newInbound.warehouseName && s.locationCode === newInbound.locationCode && s.batchNo === newInbound.batchNo
    );
    if (existingStock) {
      existingStock.availableQty += newInbound.actualQty;
      existingStock.currentQty += newInbound.actualQty;
    } else {
      stocksStore.unshift({
        id: `STK-${Date.now().toString().slice(-4)}`,
        itemName: newInbound.itemName,
        itemCode: newInbound.itemCode,
        category: newInbound.category,
        warehouseId: newInbound.warehouseId,
        warehouseName: newInbound.warehouseName,
        locationCode: newInbound.locationCode,
        locationName: `${newInbound.locationCode} 绑定货位`,
        batchNo: newInbound.batchNo,
        productionDate: newInbound.productionDate,
        expiryDate: newInbound.expiryDate,
        expiryStatus: '正常',
        bizStatus: '可用',
        availableQty: newInbound.actualQty,
        lockedQty: 0,
        inTransitQty: 0,
        frozenQty: 0,
        currentQty: newInbound.actualQty,
        unit: newInbound.unit,
        minSafeQty: 10000,
        status: '库存充沛',
        uniqueTraceCode: traceCode,
        inspectReportNo: `QC-${prodClean}-01`
      });
    }

    // 联动 2: 写入流水台账中心
    inventoryLedgersStore.unshift({
      id: `LED-${Date.now().toString().slice(-4)}`,
      ledgerNo: `FLW-${Date.now()}`,
      docType: '采购入库单 (Inbound)',
      docNo: newInbound.inboundNo,
      warehouseName: newInbound.warehouseName,
      locationCode: newInbound.locationCode,
      itemName: newInbound.itemName,
      batchNo: newInbound.batchNo,
      changeType: '+增加',
      changeQty: newInbound.actualQty,
      beforeBalanceQty: existingStock ? existingStock.availableQty - newInbound.actualQty : 0,
      afterBalanceQty: existingStock ? existingStock.availableQty : newInbound.actualQty,
      unit: newInbound.unit,
      operator: '采购入库操作员',
      timestamp: newInbound.inboundTime,
      reconciliationStatus: '三级钩稽核验通过'
    });

    // 联动 3: 写入操作审计日志
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newInbound.inboundTime,
      operatorId: 'AGT-WH-OPERATOR',
      operatorName: '仓管入库员',
      role: '仓管员 (Warehouse Operator)',
      terminalIp: '192.168.10.82',
      microservice: 'SCM / UNICODE',
      module: '入库质检管理',
      action: 'INBOUND_QC_PASS',
      actionDesc: `完成采购入库质检，生成一物一码【${traceCode}】，上架至货位【${newInbound.locationCode}】`,
      riskLevel: 'LOW',
      beforeSnapshot: '{"status":"PO_WAIT_INBOUND"}',
      afterSnapshot: JSON.stringify(newInbound)
    });

    return createResponse(newInbound, 200, `入库质检合格！已生成唯一箱码标签【${traceCode}】并完成货位绑定。`);
  }

  // 4.4 配给配送出库单列表 (SCM)
  if (url.includes('/warehouse/outbound-orders') && method === 'GET') {
    return createResponse(outboundOrdersStore);
  }

  // 4.4.1 创建出库波次并复核发运 (强制 P2 校验: 生成唯一交付流水号，库位可用库存转在途锁定)
  if (url.includes('/warehouse/outbound-orders/wave') && method === 'POST') {
    const outQty = Number(data.outQty || 5000);
    const targetStock = stocksStore.find((s) => s.id === data.stockId || s.batchNo === data.batchNo) || stocksStore[0];

    if (targetStock.availableQty < outQty) {
      return createResponse(null, 400, `库位可用库存不足！当前可用：${targetStock.availableQty} ${targetStock.unit}，申请出库：${outQty} ${targetStock.unit}`);
    }

    // [P2 规则] 必须生成唯一的全局交付流水号
    const flowSeq = Math.floor(1000 + Math.random() * 9000);
    const deliveryFlowNo = `DELIV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${flowSeq}-BAG`;
    const secHash = `SEC-HASH-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

    // [P2 规则] 库位可用库存同步转为在途锁定库存
    targetStock.availableQty -= outQty;
    targetStock.lockedQty += outQty;
    targetStock.currentQty = targetStock.availableQty; // 保持在库余量口径一致

    const newOutbound = {
      id: `OUT-${Date.now().toString().slice(-4)}`,
      outboundNo: `OUT-${Date.now().toString().slice(-8)}`,
      taskNo: data.taskNo || 'TASK-2026-Q4-BAG-001',
      targetAgentId: data.targetAgentId || 'FA-00128',
      targetAgentName: data.targetAgentName || '卡尔赫第一配给中心综合代销站',
      waveNo: `WAVE-${Date.now().toString().slice(-6)}`,
      pickingRule: '先进先出 (FIFO) & 效期优先 (Strict FIFO)',
      warehouseName: targetStock.warehouseName,
      locationCode: targetStock.locationCode,
      itemName: targetStock.itemName,
      itemCode: targetStock.itemCode,
      batchNo: targetStock.batchNo,
      plannedQty: outQty,
      actualOutQty: outQty,
      unit: targetStock.unit,
      deliveryFlowNo, // P2 交付流水号
      securityCheckCode: secHash,
      status: '已复核出库(在途锁定)',
      lockedInTransitQty: outQty,
      carrierName: data.carrierName || '伊拉克国家粮食运输总队',
      vehicleNo: data.vehicleNo || 'BAG-T99201',
      driverName: data.driverName || '穆斯塔法·纳吉',
      driverPhone: data.driverPhone || '07708899112',
      outboundTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      dispatchTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    outboundOrdersStore.unshift(newOutbound);

    // 联动 1: 新增在途配送监控记录
    deliveryTrackingsStore.unshift({
      id: `TRK-${Date.now().toString().slice(-4)}`,
      deliveryFlowNo,
      taskNo: newOutbound.taskNo,
      fromWarehouse: targetStock.warehouseName,
      toAgentCenter: `${newOutbound.targetAgentName} (${newOutbound.targetAgentId})`,
      agentOwner: '穆罕默德·贾巴尔·拉希德',
      carrierName: newOutbound.carrierName,
      vehicleNo: newOutbound.vehicleNo,
      driverName: newOutbound.driverName,
      driverPhone: newOutbound.driverPhone,
      deliveryItems: [{ itemName: targetStock.itemName, qty: outQty, unit: targetStock.unit, batchNo: targetStock.batchNo }],
      dispatchTime: newOutbound.dispatchTime,
      estimatedArrivalTime: '2026-10-12 18:00:00',
      status: '在途中',
      inTransitHours: 0.5,
      maxAllowedHours: 4.0,
      currentLocation: '已离开粮库发运总台，行驶在干线公路',
      gpsNodes: [
        { time: newOutbound.dispatchTime.slice(11, 16), desc: '完成波次复核封签，启运出库', status: 'done' }
      ]
    });

    // 联动 2: 写入流水台账
    inventoryLedgersStore.unshift({
      id: `LED-${Date.now().toString().slice(-4)}`,
      ledgerNo: `FLW-${Date.now()}`,
      docType: '配送出库交付单 (Outbound)',
      docNo: deliveryFlowNo,
      warehouseName: targetStock.warehouseName,
      locationCode: targetStock.locationCode,
      itemName: targetStock.itemName,
      batchNo: targetStock.batchNo,
      changeType: '-出库(转在途锁定)',
      changeQty: -outQty,
      beforeBalanceQty: targetStock.availableQty + outQty,
      afterBalanceQty: targetStock.availableQty,
      unit: targetStock.unit,
      operator: '波次拣选复核员',
      timestamp: newOutbound.outboundTime,
      reconciliationStatus: '三级钩稽核验通过 (在途数量锁定)'
    });

    // 联动 3: 写入操作审计
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newOutbound.outboundTime,
      operatorId: 'WH-DISPATCHER',
      operatorName: '出库调度官',
      role: '调度员',
      terminalIp: '192.168.10.83',
      microservice: 'SCM / UNICODE',
      module: '出库作业',
      action: 'OUTBOUND_DISPATCH_LOCK',
      actionDesc: `遵循 FIFO 原则出库审核，生成交付流水【${deliveryFlowNo}】，锁定在途库存 ${outQty} ${targetStock.unit}`,
      riskLevel: 'MEDIUM',
      beforeSnapshot: `{"available":${targetStock.availableQty + outQty},"locked":0}`,
      afterSnapshot: `{"available":${targetStock.availableQty},"locked":${targetStock.lockedQty}}`
    });

    return createResponse(newOutbound, 200, `波次出库复核完成！已生成唯一交付流水单【${deliveryFlowNo}】，${outQty} ${targetStock.unit} 在途库存已成功锁定！`);
  }

  // 4.5 跨库调拨单列表 (SCM)
  if (url.includes('/warehouse/transfer-orders') && method === 'GET') {
    return createResponse(transferOrdersStore);
  }

  // 4.5.1 创建跨库调拨
  if (url.includes('/warehouse/transfer-orders') && method === 'POST') {
    const newTrf = {
      id: `TRF-${Date.now().toString().slice(-4)}`,
      transferNo: `TRF-${Date.now().toString().slice(-8)}`,
      itemName: data.itemName || '精制大米',
      itemCode: data.itemCode || 'RICE-BAS-01',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      transferQty: Number(data.transferQty || 10000),
      unit: data.unit || '公斤 (KG)',
      fromWarehouseId: data.fromWarehouseId || 'WH-BAG-01',
      fromWarehouseName: data.fromWarehouseName || '巴格达第一国家储备粮库 (中心仓)',
      toWarehouseId: data.toWarehouseId || 'WH-DIY-01',
      toWarehouseName: data.toWarehouseName || '迪亚拉哈奈根前置战略保供仓 (前置仓)',
      reason: data.reason || '跨区域战略保供调拨',
      currentStage: '阶段1: 调出出库完成',
      stage1Outbound: {
        outboundFlowNo: `TRF-OUT-${Math.floor(10000 + Math.random() * 90000)}`,
        operator: '阿里·扎基',
        time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: '调出完成'
      },
      stage2InTransit: {
        carrier: '跨省干线车队',
        vehicleNo: 'BAG-T66102',
        gpsLocation: '中心仓出场核验区',
        estimatedArrival: '2026-10-13 12:00:00',
        status: '待启运'
      },
      stage3Inbound: {
        inboundFlowNo: null,
        receiver: '前置仓管员',
        inspectStatus: '待验收',
        status: '未完成'
      }
    };
    transferOrdersStore.unshift(newTrf);
    return createResponse(newTrf, 200, '跨库调拨申请已创建，第一阶段【调出出库】已完成！');
  }

  // 4.5.2 推进调拨单流转阶段 (三段式流水)
  const transferAdvanceMatch = url.match(/\/warehouse\/transfer-orders\/([^/]+)\/advance/);
  if (transferAdvanceMatch && method === 'POST') {
    const trfId = transferAdvanceMatch[1];
    const trf = transferOrdersStore.find((t) => t.id === trfId || t.transferNo === trfId);
    if (!trf) {
      return createResponse(null, 404, '调拨单据未找到！');
    }
    if (trf.currentStage.includes('阶段1')) {
      trf.currentStage = '阶段2: 在途管理';
      trf.stage2InTransit.status = '干线在途中';
      trf.stage2InTransit.gpsLocation = '已驶出巴格达省界，正向迪亚拉哈奈根行驶';
    } else if (trf.currentStage.includes('阶段2')) {
      trf.currentStage = '阶段3: 调入验收完成';
      trf.stage3Inbound.inboundFlowNo = `TRF-IN-${Math.floor(10000 + Math.random() * 90000)}-AC`;
      trf.stage3Inbound.status = '已验收入库';
      trf.stage3Inbound.inspectStatus = '验收合格';
      trf.stage3Inbound.time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    return createResponse(trf, 200, `调拨流转成功！当前推进至【${trf.currentStage}】！`);
  }

  // 4.6 盘点记录列表 (SCM)
  if (url.includes('/warehouse/stocktakes') && method === 'GET') {
    return createResponse(stocktakeRecordsStore);
  }

  // 4.6.1 提交盘点记录 (差异禁止直接冲抵，必须双人签批)
  if (url.includes('/warehouse/stocktakes') && method === 'POST') {
    const diffQty = Number(data.countedQty || 0) - Number(data.bookQty || 0);
    const newStocktake = {
      id: `STK-CHK-${Date.now().toString().slice(-4)}`,
      stocktakeNo: `STK-CHK-${Date.now().toString().slice(-8)}`,
      type: data.type || '周期盘点 (Cycle Count)',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      itemName: data.itemName || '精制大米',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      bookQty: Number(data.bookQty || 1000),
      countedQty: Number(data.countedQty || 1000),
      diffQty,
      diffAmountIQD: Math.abs(diffQty) * 900,
      unit: data.unit || '公斤 (KG)',
      counterName: data.counterName || '盘点员：阿里·扎基',
      countDate: new Date().toISOString().split('T')[0],
      diffReason: diffQty === 0 ? '账实相符' : (data.diffReason || '抽样称重微量损耗'),
      diffResolution: diffQty === 0 ? '直接归档' : '【系统红线规则】禁止直接冲抵！生成盈亏差异报告，已流转双人审批！',
      status: diffQty === 0 ? '盘点无差异' : '差异待双人审批',
      approver1: diffQty === 0 ? '系统自核' : '待主操作人提交',
      approver2: diffQty === 0 ? '系统自核' : '待复核主管签批'
    };
    stocktakeRecordsStore.unshift(newStocktake);
    return createResponse(
      newStocktake,
      200,
      diffQty === 0 ? '盘点完成，账实一致！' : '盘点记录已录入。存在盈亏差异，已生成差异报告并严格禁止直接冲抵，请发起双人签批！'
    );
  }

  // 4.7 报损报溢明细列表 (SCM)
  if (url.includes('/warehouse/loss-records') && method === 'GET') {
    return createResponse(lossRecordsStore);
  }

  // 4.7.1 登记报损报溢记录 (强制损耗原因与存证影像，双人审批)
  if (url.includes('/warehouse/loss-records') && method === 'POST') {
    if (!data.damageReason || String(data.damageReason).trim() === '') {
      return createResponse(null, 400, '报损与报溢操作必须强制录入损耗原因与现场事实说明！');
    }
    const newLoss = {
      id: `LOSS-${Date.now().toString().slice(-4)}`,
      lossNo: `LOSS-${Date.now().toString().slice(-8)}`,
      lossType: data.lossType || '物理破损 (Damage)',
      warehouseName: data.warehouseName || '巴格达第一国家储备粮库',
      locationCode: data.locationCode || 'A01-03-02',
      itemName: data.itemName || '精制大米',
      batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
      qty: Number(data.qty || 10),
      unit: data.unit || '公斤 (KG)',
      estimatedCostIQD: Number(data.qty || 10) * 900,
      damageReason: data.damageReason,
      evidenceImageUrl: data.evidenceImageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600',
      reporter: data.reporter || '当前仓管员',
      reportTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      approvalStatus: '待双人审批',
      approvers: []
    };
    lossRecordsStore.unshift(newLoss);
    return createResponse(newLoss, 200, '报损申请已受理并绑定存证影像！依据安全合规机制，需经双人签批后方可核销入账。');
  }

  // 4.8 六维多维库存实时视图 (SCM)
  if (url.includes('/warehouse/stocks/snapshot') && method === 'GET') {
    // 历史时间点快照回溯
    const timeParam = params.time || '2026-10-01 00:00:00';
    const snapshot = stocksStore.map((s) => ({
      ...s,
      snapshotTime: timeParam,
      availableQty: Math.round(s.availableQty * 0.95),
      currentQty: Math.round(s.currentQty * 0.95),
      snapshotNotice: `基于历史账本【单据-流水-余额】钩稽回溯至 ${timeParam}`
    }));
    return createResponse(snapshot);
  }

  if (url.includes('/warehouse/stocks') && method === 'GET') {
    let result = [...stocksStore];
    if (params.category) result = result.filter((s) => s.category.includes(params.category));
    if (params.warehouseName) result = result.filter((s) => s.warehouseName.includes(params.warehouseName));
    if (params.bizStatus) result = result.filter((s) => s.bizStatus === params.bizStatus);
    if (params.batchNo) result = result.filter((s) => s.batchNo.includes(params.batchNo));
    return createResponse(result);
  }

  // 4.9 流水台账中心 (SCM)
  if (url.includes('/warehouse/ledgers') && method === 'GET') {
    return createResponse(inventoryLedgersStore);
  }

  // 4.10 配送在途追踪监控 (SCM)
  if (url.includes('/warehouse/delivery-trackings') && method === 'GET') {
    return createResponse(deliveryTrackingsStore);
  }

  // 4.10.1 公民/代理扫描二维码签收配送单并更新在途状态为已签收
  const confirmReceiptMatch = url.match(/\/warehouse\/delivery-trackings\/([^/]+)\/confirm-receipt/);
  if (confirmReceiptMatch && method === 'POST') {
    const flowNo = decodeURIComponent(confirmReceiptMatch[1]);
    const trk = deliveryTrackingsStore.find(t => t.deliveryFlowNo === flowNo || t.id === flowNo);
    const signTime = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (trk) {
      trk.status = '已签收';
      trk.signedTime = signTime;
      trk.currentLocation = '已完成扫码核验并签收交付';
      trk.gpsNodes = trk.gpsNodes || [];
      trk.gpsNodes.push({
        time: signTime.slice(11, 16),
        desc: `【扫码签收成功】由收货人核验二维码防伪凭证，实收无误完成签收。`,
        status: 'done'
      });
    }

    const item = trk?.deliveryItems?.[0] || { itemName: '配给物资', qty: 13440 };
    agentReceiptsStore.unshift({
      id: `RCP-${Date.now().toString().slice(-4)}`,
      receiptNo: `RCP-${Date.now().toString().slice(-8)}`,
      deliveryFlowNo: flowNo,
      agentCenterId: data?.agentCenterId || 'FA-00128',
      agentName: trk?.toAgentCenter || '卡尔赫第一配给中心综合代销站',
      signedBy: data?.signedBy || '配给卡公民 (扫码核验确认)',
      signTime,
      shippedQty: item.qty,
      receivedQty: item.qty,
      discrepancyQty: 0,
      intactRate: 100.0,
      packageIntegrity: '二维码防伪封签核验通过，外包装完好',
      reconciliationResult: '账单相符 (MATCHED)',
      status: '已签收交付'
    });

    return createResponse({
      flowNo,
      status: '已签收',
      signedTime: signTime
    }, 200, `配送交付流水【${flowNo}】扫码核验成功，状态已变更为已签收！`);
  }

  // 4.11 代理网点签收记录 (SCM)
  if (url.includes('/warehouse/agent-receipts') && method === 'GET') {
    return createResponse(agentReceiptsStore);
  }

  // 4.11.1 代理网点移动终端扫码核收 (强制 P3 校验: 数量与交付流水核对，异常差额锁定、阻断流转并派发工单)
  if (url.includes('/warehouse/agent-receipts') && method === 'POST') {
    const shippedQty = Number(data.shippedQty || 0);
    const receivedQty = Number(data.receivedQty || 0);
    const diffQty = receivedQty - shippedQty;
    const isDiscrepant = diffQty !== 0;

    const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
    const newReceipt = {
      id: `RCP-${Date.now().toString().slice(-4)}`,
      receiptNo,
      deliveryFlowNo: data.deliveryFlowNo || 'DELIV-20261012-9901-BAG',
      agentCenterId: data.agentCenterId || 'FA-00128',
      agentName: data.agentName || '卡尔赫第一配给中心综合代销站',
      signedBy: data.signedBy || '穆罕默德·贾巴尔·拉希德 (移动终端指纹核签)',
      signTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      shippedQty,
      receivedQty,
      discrepancyQty: diffQty,
      intactRate: Number(data.intactRate || (isDiscrepant ? 99.5 : 100.0)),
      packageIntegrity: data.packageIntegrity || '包装完好核验正常',
      reconciliationResult: isDiscrepant ? '存在差异 (DISCREPANCY_ALERT)' : '账单相符 (MATCHED)',
      status: isDiscrepant ? '已阻断流转并派发核查工单' : '核销入店成功'
    };
    agentReceiptsStore.unshift(newReceipt);

    // [P3 规则] 当实收数量、批次与交付流水存在差异时，系统即刻触发在途损耗/短缺预警，并阻断该批次异常货物的后续发放流转
    if (isDiscrepant) {
      const ticketNo = `DISC-${Date.now().toString().slice(-8)}`;
      const newDiscTicket = {
        id: `DISC-${Date.now().toString().slice(-4)}`,
        ticketNo,
        deliveryFlowNo: newReceipt.deliveryFlowNo,
        agentCenterId: newReceipt.agentCenterId,
        centerName: newReceipt.agentName,
        batchNo: data.batchNo || 'BATCH-20261012-EXP202710-RC01',
        itemName: data.itemName || '精制大米',
        shippedQty,
        receivedQty,
        discrepancyQty: diffQty,
        unit: data.unit || '公斤 (KG)',
        createdTime: newReceipt.signTime,
        quarantineStatus: '已锁定并阻断流转 (LOCKED)', // P3 自动阻断后续流转
        assignedAuditor: '迪亚拉与巴格达分部联合审计组',
        investigationReport: `终端扫码核收短少 ${Math.abs(diffQty)} ${data.unit || 'KG'}，已锁定差额，派发工单调查承运物流！`,
        resolutionStatus: '核查中 (调查工单派发至承运车队与审计处)'
      };
      discrepancyTicketsStore.unshift(newDiscTicket);

      // 将该批次货物状态冻结阻断
      const errStock = stocksStore.find((s) => s.batchNo === newDiscTicket.batchNo);
      if (errStock) {
        errStock.frozenQty += Math.abs(diffQty);
        errStock.lockedQty = Math.max(0, errStock.lockedQty - Math.abs(diffQty));
      }

      // 记录审计日志
      auditLogsStore.unshift({
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: newReceipt.signTime,
        operatorId: 'AGT-RECEIPT-AUTO',
        operatorName: '代理终端对账联动引擎',
        role: 'SYSTEM',
        terminalIp: '192.168.10.45',
        microservice: 'SCM / BPM',
        module: '代理交接核对',
        action: 'DISCREPANCY_ALERT_BLOCKED',
        actionDesc: `【P3规则触发】实收与流水存在差异（短缺 ${Math.abs(diffQty)} ${data.unit || 'KG'}），自动锁定差额并派发核查工单【${ticketNo}】，阻断流转！`,
        riskLevel: 'HIGH',
        beforeSnapshot: `{"shipped":${shippedQty},"received":${receivedQty}}`,
        afterSnapshot: JSON.stringify(newDiscTicket)
      });

      return createResponse(
        { receipt: newReceipt, ticket: newDiscTicket },
        200,
        `【P3差异预警触发】实收数量与交付流水存在差额（${diffQty} ${data.unit || 'KG'}）！系统已自动锁定异常差额并派发核查工单【${ticketNo}】，阻断异常批次后续流转！`
      );
    }

    return createResponse(newReceipt, 200, '代理网点终端扫码核收成功！账单点对点对账完全相符。');
  }

  // 4.12 差异核查工单列表 (SCM)
  if (url.includes('/warehouse/discrepancy-tickets') && method === 'GET') {
    return createResponse(discrepancyTicketsStore);
  }

  // 4.12.1 协同处理差异工单
  const discResolveMatch = url.match(/\/warehouse\/discrepancy-tickets\/([^/]+)\/resolve/);
  if (discResolveMatch && method === 'POST') {
    const tId = discResolveMatch[1];
    const ticket = discrepancyTicketsStore.find((t) => t.id === tId || t.ticketNo === tId);
    if (!ticket) {
      return createResponse(null, 404, '核查工单不存在！');
    }
    ticket.resolutionStatus = '核查完结 (责任已定)';
    ticket.quarantineStatus = '已解除阻断并执行折损认定';
    ticket.investigationReport += `\n[处理批示]: ${data.resolutionNote || '责任认定完毕，已由承运保险全额理赔。'}`;
    return createResponse(ticket, 200, '差异核查工单已闭环处置！');
  }

  // 4.13 末端配给智能读卡核验 (SCM / UNICODE)
  if (url.includes('/warehouse/citizen-claim/verify') && method === 'GET') {
    const cardInput = (params.cardNo || 'RC-10029381').trim();
    const family =
      familiesStore.find((f) => f.rationCardNo === cardInput || f.oldPaperCardNo === cardInput || f.headName.includes(cardInput)) ||
      familiesStore[0];

    const eligibleMembers = (family.members || []).filter((m) => m.status === '正常').length;
    // 检查本月是否已核销
    const alreadyClaimed = citizenClaimsStore.some(
      (c) => c.rationCardNo === family.rationCardNo && c.claimPeriod.includes('2026年10月')
    );

    const quotaInfo = {
      family,
      cardNo: family.rationCardNo,
      headName: family.headName,
      eligibleMembers,
      alreadyClaimed,
      claimPeriod: '2026年10月份配额',
      quotaList: [
        { itemName: '精制大米', quotaPerHead: 3.0, totalQuota: eligibleMembers * 3.0, unit: 'KG' },
        { itemName: '特级面粉', quotaPerHead: 9.0, totalQuota: eligibleMembers * 9.0, unit: 'KG' },
        { itemName: '食用植物油', quotaPerHead: 1.0, totalQuota: eligibleMembers * 1.0, unit: 'L' },
        { itemName: '纯精白糖', quotaPerHead: 1.0, totalQuota: eligibleMembers * 1.0, unit: 'KG' }
      ]
    };
    return createResponse(quotaInfo);
  }

  // 4.13.1 提交末端配额核销与即时交付 (强制 P4 校验: 事务原子性、防跨期重领冒领、秒级双向同步云端主账本)
  if (url.includes('/warehouse/citizen-claim/claim') && method === 'POST') {
    const cardNo = data.rationCardNo || 'RC-10029381';
    const period = data.claimPeriod || '2026年10月份配额';

    // [P4 规则 1: 防跨期重领冒领超额申领校验]
    const exists = citizenClaimsStore.find((c) => c.rationCardNo === cardNo && c.claimPeriod === period);
    if (exists) {
      return createResponse(
        null,
        400,
        `【P4 防重领安全拦截】电子配给卡【${cardNo}】在【${period}】已于 ${exists.claimTime} 完成核销领取！防伪凭证：${exists.claimVoucherNo}。严禁跨期重领、冒领与超额申领！`
      );
    }

    const family = familiesStore.find((f) => f.rationCardNo === cardNo) || familiesStore[0];
    const eligibleMembers = (family.members || []).filter((m) => m.status === '正常').length || 4;

    // [P4 规则 2: 事务原子性操作与数字防伪凭证哈希]
    const hash = `VOUCHER-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString().slice(-4)}`;
    const voucherNo = `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClaim = {
      id: `CLM-${Date.now().toString().slice(-4)}`,
      claimVoucherNo: voucherNo,
      rationCardNo: cardNo,
      familyCode: family.familyCode,
      headName: family.headName,
      nationalId: (family.members && family.members[0]?.nationalId) || '197582910481',
      agentCenterId: data.agentCenterId || 'FA-00128',
      agentName: data.agentName || '卡尔赫第一配给中心综合代销站',
      claimPeriod: period,
      claimTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eligibleMembers,
      claimedItems: data.claimedItems || [
        { itemName: '精制大米', qty: eligibleMembers * 3.0, unit: 'KG', quotaPerHead: 3.0 },
        { itemName: '特级面粉', qty: eligibleMembers * 9.0, unit: 'KG', quotaPerHead: 9.0 },
        { itemName: '食用植物油', qty: eligibleMembers * 1.0, unit: 'L', quotaPerHead: 1.0 },
        { itemName: '纯精白糖', qty: eligibleMembers * 1.0, unit: 'KG', quotaPerHead: 1.0 }
      ],
      digitalVoucherHash: hash,
      cardReadMethod: '移动智能终端 NFC 读卡',
      syncToCloudLedger: true,
      cloudSyncLatencyMs: 38, // 秒级以内延迟 (P4 规则)
      syncTimestamp: `${new Date().toISOString().replace('T', ' ').slice(0, 19)}.038`,
      status: '已即刻交付核销'
    };
    citizenClaimsStore.unshift(newClaim);

    // 扣减代理任务单中的已核销数量
    const agentTask = agentAllocationTasksStore.find((t) => t.agentCenterId === newClaim.agentCenterId);
    if (agentTask) {
      agentTask.items.forEach((item) => {
        const claimed = newClaim.claimedItems.find((ci) => ci.itemName === item.itemName);
        if (claimed) {
          item.claimedQty += claimed.qty;
          item.completionRate = Math.min(100, Number(((item.claimedQty / item.plannedQty) * 100).toFixed(1)));
        }
      });
    }

    // 写入安全操作审计
    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: newClaim.claimTime,
      operatorId: 'AGT-00128',
      operatorName: '穆罕默德·贾巴尔·拉希德',
      role: '配给代理 (Agent)',
      terminalIp: '192.168.10.45',
      microservice: 'SCM / UNICODE',
      module: '末端配给核销',
      action: 'CITIZEN_CLAIM_VERIFY',
      actionDesc: `智能读卡完成【${family.headName}】(${cardNo}) 配额原子扣减，生成数字凭证【${voucherNo}】，秒级同步云端主账本 (耗时 38ms)`,
      riskLevel: 'LOW',
      beforeSnapshot: `{"cardNo":"${cardNo}","status":"UNCLAIMED"}`,
      afterSnapshot: JSON.stringify(newClaim)
    });

    return createResponse(
      newClaim,
      200,
      `【P4 核销成功】物资已即刻交付！数字凭证【${voucherNo}】生成完毕，家庭主账本已完成双向原子同步 (同步耗时 38ms)！`
    );
  }

  // 4.13.2 查询核销记录列表
  if (url.includes('/warehouse/citizen-claim/records') && method === 'GET') {
    return createResponse(citizenClaimsStore);
  }

  // 4.14 全链路端到端溯源引擎 (UNICODE / SCM)
  if (url.includes('/warehouse/traceability/chain') && method === 'GET') {
    return createResponse(MOCK_TRACE_CHAINS[0]);
  }

  // 4.15 多维切片流转报表 (SCM)
  if (url.includes('/warehouse/analytics/reports') && method === 'GET') {
    const reportData = [
      { province: '巴格达省', totalAllocatedTon: 84000, outboundTon: 72000, receivedTon: 68000, claimedTon: 52000, fulfillmentRate: 76.5 },
      { province: '迪亚拉省 (第140号决议区)', totalAllocatedTon: 42000, outboundTon: 34000, receivedTon: 29000, claimedTon: 21000, fulfillmentRate: 72.4 },
      { province: '基尔库克省 (第140号决议区)', totalAllocatedTon: 38000, outboundTon: 31000, receivedTon: 28000, claimedTon: 22000, fulfillmentRate: 78.5 },
      { province: '尼尼微省 (第140号决议区)', totalAllocatedTon: 52000, outboundTon: 41000, receivedTon: 36000, claimedTon: 26000, fulfillmentRate: 72.2 },
      { province: '巴士拉省', totalAllocatedTon: 68000, outboundTon: 60000, receivedTon: 58000, claimedTon: 48000, fulfillmentRate: 82.7 }
    ];
    return createResponse(reportData);
  }

  // 4.16 损耗与差异审计分析 (SCM)
  if (url.includes('/warehouse/analytics/loss-stats') && method === 'GET') {
    return createResponse(MOCK_LOSS_AUDIT_STATS);
  }

  // 4.17 操作审计不可篡改日志 (BPM / GATEWAY)
  if (url.includes('/warehouse/security/audit-logs') && method === 'GET') {
    return createResponse(auditLogsStore);
  }

  // 4.17.1 高风险操作双人复核审批 (强制 P5 校验: 双人签批记录)
  if (url.includes('/warehouse/security/double-approval') && method === 'POST') {
    if (!data.approver1 || !data.approver2) {
      return createResponse(null, 400, '【P5 规则拦截】高风险操作（大额报损/盘点差异调整）必须具备主操作人与复核主管双人签批记录！');
    }

    if (data.lossId) {
      const loss = lossRecordsStore.find((l) => l.id === data.lossId || l.lossNo === data.lossId);
      if (loss) {
        loss.approvalStatus = '双人签批通过';
        loss.approvers = [
          { name: data.approver1, time: new Date().toISOString().replace('T', ' ').slice(0, 19) },
          { name: data.approver2, time: new Date().toISOString().replace('T', ' ').slice(0, 19) }
        ];
      }
    }

    if (data.stocktakeId) {
      const stk = stocktakeRecordsStore.find((s) => s.id === data.stocktakeId || s.stocktakeNo === data.stocktakeId);
      if (stk) {
        stk.status = '已审批入账';
        stk.approver1 = data.approver1;
        stk.approver2 = data.approver2;
      }
    }

    auditLogsStore.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operatorId: 'BPM-DOUBLE-SIGN',
      operatorName: `${data.approver1} / ${data.approver2}`,
      role: '双人签批授权',
      terminalIp: '192.168.10.12',
      microservice: 'BPM / SCM',
      module: '安全审计与复核',
      action: 'DOUBLE_APPROVAL_CONFIRMED',
      actionDesc: `完成高风险业务双人签批：${data.targetTitle || '报损与盘亏调整审核'}`,
      riskLevel: 'HIGH',
      beforeSnapshot: '{"status":"PENDING_APPROVAL"}',
      afterSnapshot: JSON.stringify(data)
    });

    return createResponse({ success: true }, 200, `【P5 双人签批完成】主操作人【${data.approver1}】与复核主管【${data.approver2}】双重验证通过！`);
  }

  // 4.18 P1 ~ P5 阶段验证规则列表与在线测试 (验证中心)
  if (url.includes('/warehouse/verification/rules') && method === 'GET') {
    return createResponse(validationRulesStore);
  }

  const pTestMatch = url.match(/\/warehouse\/verification\/rules\/([^/]+)\/test/);
  if (pTestMatch && method === 'POST') {
    const rCode = pTestMatch[1].toUpperCase();
    const rule = validationRulesStore.find((r) => r.code === rCode);
    if (!rule) {
      return createResponse(null, 404, '规则不存在！');
    }
    // 仿真验证成功
    return createResponse(
      {
        code: rCode,
        verified: true,
        testTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        complianceRate: '100%',
        message: `【${rCode}阶段规则仿真验证通过】${rule.ruleDescription}`
      },
      200,
      `阶段规则【${rCode}】仿真验证通过！符合国家战略保供与审计规范。`
    );
  }

  // ==========================================
  // 5. 代理商模块 (Agent)
  // ==========================================
  // 5.1 查询当前登录代理人名下的中心列表 (SCM)
  if (url.includes('/agent/my-centers') && method === 'GET') {
    let result = [...myAgentCentersStore];
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.isArticle140 !== undefined && params.isArticle140 !== '') {
      const is140 = String(params.isArticle140) === 'true';
      result = result.filter((c) => c.isArticle140 === is140);
    }
    return createResponse(result);
  }

  // 5.2 查询全国及第140号决议覆盖省份与中心列表 (UNICODE / SCM)
  if (url.includes('/agent/article140-centers') && method === 'GET') {
    let result = [...article140CentersStore];
    if (params.province && params.province !== '全部') {
      result = result.filter((c) => c.province.includes(params.province));
    }
    if (params.city && params.city !== '全部') {
      result = result.filter((c) => c.city && c.city.includes(params.city));
    }
    if (params.isArticle140 !== undefined && params.isArticle140 !== '') {
      const is140 = String(params.isArticle140) === 'true';
      result = result.filter((c) => c.isArticle140 === is140);
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status.includes(params.status));
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter(
        (c) =>
          c.centerId.includes(kw) ||
          c.centerName.toLowerCase().includes(kw) ||
          (c.city && c.city.toLowerCase().includes(kw)) ||
          (c.warehouseCode && c.warehouseCode.toLowerCase().includes(kw)) ||
          (c.address && c.address.toLowerCase().includes(kw))
      );
    }
    return createResponse(result);
  }

  // 5.3 查询当前代理人档案及法定资格状态 (AUTH / SCM)
  if (url.includes('/agent/profile') && method === 'GET') {
    return createResponse(MOCK_CURRENT_AGENT_PROFILE);
  }

  // 5.4 查询业务申请工单流水 (BPM)
  if (url.includes('/agent/applications') && method === 'GET' && !url.includes('/pay')) {
    let result = [...agentApplicationsStore];
    if (params.type && params.type !== '全部') {
      result = result.filter((t) => t.type === params.type);
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((t) => t.status === params.status);
    }
    return createResponse(result);
  }

  // 5.5 提交新代理权授予申请 (BPM / SCM)
  // 严格法定校验：申请代理的中心当前不能已被代理，已被代理的中心需要先注销代理，才能申请
  if (url.includes('/agent/apply-grant') && method === 'POST') {
    const { centerId, category, applicantName, applicantNationalId, applicantAge, isNonPublicEmployee, ministerApprovalNo } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, '拟申请的配给中心不存在，请重新选择！');
    }

    // 核心前置拦截：已被代理的中心不能申请，必须先注销
    if (targetCenter.status === '已被代理') {
      return createResponse(
        {},
        400,
        `【合规红线拦截】：配给中心【${targetCenter.centerName}】当前已被代理！依照第140号决议与贸易部规定，已被代理的中心须先注销代理，方可提出授予申请。`
      );
    }

    // 年龄红线拦截：18 至 48 周岁之间
    const age = Number(applicantAge) || 30;
    if (age < 18 || age > 48) {
      return createResponse({}, 400, `【资格不符】：候选人年龄须在 18 至 48 周岁之间（当前填写为 ${age} 周岁）。`);
    }

    // 公职人员/军人/学生排他拦截
    if (!isNonPublicEmployee) {
      return createResponse({}, 400, '【资格不符】：申请人不得为学生、雇员、军人、公司所有者或股东或承包商，且不得以任何名义领取国家工资！');
    }

    // 部长批准文号校验
    if (!ministerApprovalNo) {
      return createResponse({}, 400, '【缺少前置批件】：申请代理权须已获得贸易部长批准（食品或面粉）并填写批件号及上传原件！');
    }

    const ticketNo = `AGT-APP-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'GRANT',
      typeName: '新代理权授予申请',
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: category || targetCenter.category || '面粉',
      applicantName: applicantName || MOCK_CURRENT_AGENT_PROFILE.name,
      applicantNationalId: applicantNationalId || MOCK_CURRENT_AGENT_PROFILE.idCardNo,
      applicantPhone: data.applicantPhone || MOCK_CURRENT_AGENT_PROFILE.phone,
      status: '待电子支付', // 预先生成待缴规费环节
      currentStep: 3,
      feeAmount: 250000, // 二十五万伊拉克第纳尔
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: '自动审核通过（年龄与非公职身份校验合格），委员会现场联合抽查合格，准予进入电子缴纳250,000 IQD规费阶段。',
      committeeMembers: [
        { dept: targetCenter.province.includes('巴格达') ? '巴格达配给分部' : `${targetCenter.province}配给分部`, status: '实地核查通过', officer: '拉希姆·扎希德' },
        { dept: '规划与跟进司', status: '配额合规审核通过', officer: '阿德南·巴希尔' },
        { dept: '商业监督司 (观察员)', status: '观察员现场签字核准', officer: '海德尔·法蒂赫' }
      ],
      documents: [
        { name: '贸易部长批准公函.pdf', size: '1.5MB', verified: true },
        { name: '30%服务家庭拇指印同意书.pdf', size: '4.2MB', verified: true },
        { name: '申请人国民身份证与小学及以上毕业证.pdf', size: '2.0MB', verified: true },
        { name: '营业用房产权证或公证租赁合同.pdf', size: '3.1MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, '代理权授予申请提交成功，已完成资格自动核验，进入规费缴纳与证书颁发环节！');
  }

  // 5.6 提交代理权轮替 (转移) 申请 (BPM / SCM)
  if (url.includes('/agent/apply-rotation') && method === 'POST') {
    const { centerId, rotationScenario, successorName, successorKinship, deceasedDate, isWifeSuccession } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, '拟办理轮替的配给中心不存在！');
    }

    // 已故轮替时限校验：12个月内完成轮替
    if (rotationScenario === 'DECEASED' && deceasedDate) {
      const deathDateObj = new Date(deceasedDate);
      const now = new Date();
      const diffMonths = (now.getFullYear() - deathDateObj.getFullYear()) * 12 + (now.getMonth() - deathDateObj.getMonth());
      if (diffMonths > 12) {
        return createResponse({}, 400, '【时限超期拦截】：已故代理轮替必须在代理死亡之日起 12 个月内完成，超期代理权将被依法立即注销！');
      }
    }

    const ticketNo = `AGT-ROT-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'ROTATION',
      typeName: rotationScenario === 'DECEASED' ? '代理权轮替 (已故代理亲属轮替)' : '代理权轮替 (应代理申请转让)',
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: targetCenter.category || '面粉',
      applicantName: successorName || '受让人',
      originalAgentName: targetCenter.currentAgentName || MOCK_CURRENT_AGENT_PROFILE.name,
      kinship: successorKinship || '三代以内直系亲属',
      status: '待电子支付',
      currentStep: 3,
      feeAmount: 50000, // 五万伊拉克第纳尔
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: '公司法务部及规划跟进司审查通过：亲属继承材料完备，逝者配给份额已核销，请支付50,000 IQD法定公文规费以完成证书更新。',
      committeeMembers: [
        { dept: '粮食及谷物加工公司法务部', status: isWifeSuccession ? '配偶轮替免予继承人放弃声明，直接合规核准' : '继承证书与法务放弃声明核验通过', officer: '萨利姆·努里' },
        { dept: '规划与跟进司', status: '逝者配额注销报告核查无误', officer: '阿里·哈立德' }
      ],
      documents: [
        { name: '合法继承证书(教法分割证书 qassam shar-i).pdf', size: '2.1MB', verified: true },
        { name: '死亡证明及4个月内逝者配额注销回执.pdf', size: '1.8MB', verified: true },
        { name: '受让亲属专职投入与非公职公证承诺书.pdf', size: '1.2MB', verified: true },
        { name: '双方有效身份证明及同地区居民证明.pdf', size: '2.3MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, '代理权轮替申请已受理并经法务审核，请缴纳50,000 IQD规费完成转移！');
  }

  // 5.7 提交恢复已注销代理权申请 (BPM / SCM)
  if (url.includes('/agent/apply-restoration') && method === 'POST') {
    const { centerId, restorationType, hasCriminalRecord, hasTamperingRecord, supportFamilyPercent } = data;
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));

    if (!targetCenter) {
      return createResponse({}, 404, '目标中心不存在！');
    }

    // 核心前置拦截：该代理权未被合并
    if (targetCenter.isMerged) {
      return createResponse({}, 400, '【合规拦截】：该代理权已被并入其他配给中心网点，依照贸易部规定禁止恢复！');
    }

    // 负面清单一票否决：已被法院判决、道德败坏/恐怖主义罪行、篡改或替换物资
    if (hasCriminalRecord || hasTamperingRecord) {
      return createResponse(
        {},
        400,
        '【法定义务一票否决】：已被法院判决、涉及道德败坏或恐怖主义罪行、或查实篡改替换贸易部物资的代理，法律明令禁止恢复代理权！'
      );
    }

    // 处罚恢复：不少于 25% 家庭支持
    const supportPct = Number(supportFamilyPercent) || 0;
    if (restorationType === 'PUNISHMENT' && supportPct < 25) {
      return createResponse(
        {},
        400,
        `【民意支持率不足】：因处罚注销的代理权恢复，须有不低于 25% 的辖区家庭联署支持（当前上报为 ${supportPct}%）。`
      );
    }

    const ticketNo = `AGT-RES-${Date.now()}`;
    const newApp = {
      ticketNo,
      type: 'RESTORATION',
      typeName: restorationType === 'PUNISHMENT' ? '恢复已注销代理权 (违规处罚整改恢复)' : '恢复已注销代理权 (应代理申请恢复)',
      centerId: targetCenter.centerId,
      centerName: targetCenter.centerName,
      province: targetCenter.province,
      isArticle140: targetCenter.isArticle140,
      category: targetCenter.category || '面粉',
      applicantName: data.applicantName || MOCK_CURRENT_AGENT_PROFILE.name,
      status: '待电子支付',
      currentStep: 3,
      feeAmount: 50000,
      feePaid: false,
      payChannel: null,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: '规划与跟进司联合商业财务监督司联合调查完毕：未被合并、无一票否决司法污点且家庭支持率达标。准予支付规费恢复！',
      committeeMembers: [
        { dept: '规划与跟进司', status: `联合调查核实家庭支持率通过 (${supportPct || 28}%)`, officer: '努尔丁·穆尔塔达' },
        { dept: '商业和财务监督司', status: '整改现场验收合格', officer: '海德尔·法蒂赫' }
      ],
      documents: [
        { name: '恢复代理权正式申请公函.pdf', size: '1.2MB', verified: true },
        { name: '专职经营及整改违规书面承诺书.pdf', size: '1.4MB', verified: true },
        { name: '辖区25%以上家庭联署支持拇指印证明底册.pdf', size: '3.8MB', verified: true },
        { name: '司法无刑事罪行与无物资篡改公函.pdf', size: '1.1MB', verified: true }
      ],
      payload: { ...data }
    };

    agentApplicationsStore.unshift(newApp);
    return createResponse(newApp, 200, '恢复申请已通过双司联合调查，请缴纳规费完成代理权恢复！');
  }

  // 5.8 代理权主动注销申请 (SCM) - 满足“已被代理的中心需要先注销代理，才能申请”
  if (url.match(/\/agent\/centers\/([^/]+)\/cancel/) && method === 'POST') {
    const centerId = url.split('/')[3];
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(centerId));
    const targetMyCenter = myAgentCentersStore.find((c) => c.centerId === String(centerId));

    if (targetCenter) {
      targetCenter.status = '已注销(空置待申请)';
      targetCenter.canApply = true;
      targetCenter.canRestore = true;
      targetCenter.currentAgentId = null;
      targetCenter.currentAgentName = `原代理：${data.agentName || MOCK_CURRENT_AGENT_PROFILE.name} (已注销)`;
      targetCenter.lastCancellationReason = data.reason || '代理人主动申报注销或转让清退';
      targetCenter.cancellationDate = new Date().toISOString().slice(0, 10);
    }

    if (targetMyCenter) {
      targetMyCenter.status = '已注销';
      targetMyCenter.isCurrentActive = false;
      targetMyCenter.cancellationReason = data.reason || '已主动注销';
    }

    // 记录一条注销工单
    const ticketNo = `AGT-CAN-${Date.now()}`;
    agentApplicationsStore.unshift({
      ticketNo,
      type: 'CANCELLATION',
      typeName: '代理权主动注销',
      centerId: centerId,
      centerName: targetCenter ? targetCenter.centerName : '配给中心',
      province: targetCenter ? targetCenter.province : '未知省份',
      isArticle140: targetCenter ? targetCenter.isArticle140 : false,
      category: targetCenter ? targetCenter.category : '综合',
      applicantName: data.agentName || MOCK_CURRENT_AGENT_PROFILE.name,
      status: '已完成',
      currentStep: 4,
      feeAmount: 0,
      feePaid: true,
      submitTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      auditNotes: '网点代理权已成功注销，已向系统公示为空置网点，可供符合条件之公民或亲属申请新代理权。'
    });

    return createResponse(
      { success: true, centerId },
      200,
      `网点【${targetCenter ? targetCenter.centerName : centerId}】已成功注销！当前已释放为空置状态，符合条件者可发起新申请。`
    );
  }

  // 5.9 电子规费支付 (SCM / PAYMENT)
  if (url.match(/\/agent\/applications\/([^/]+)\/pay/) && method === 'POST') {
    const ticketNo = url.split('/')[3];
    const targetApp = agentApplicationsStore.find((a) => a.ticketNo === ticketNo);

    if (!targetApp) {
      return createResponse({}, 404, '未找到指定申请单！');
    }

    targetApp.feePaid = true;
    targetApp.status = '已完成';
    targetApp.currentStep = 4;
    targetApp.payChannel = data.channel || 'QI-CARD-ONLINE';
    targetApp.payTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetApp.auditNotes = `规费 ${targetApp.feeAmount.toLocaleString()} IQD 已通过 ${targetApp.payChannel} 缴纳入国库。电子批件与经营许可证已颁发生效！`;

    // 联动更新中心与网点数据
    const targetCenter = article140CentersStore.find((c) => c.centerId === String(targetApp.centerId));
    if (targetCenter) {
      if (targetApp.type === 'GRANT' || targetApp.type === 'RESTORATION') {
        targetCenter.status = '已被代理';
        targetCenter.canApply = false;
        targetCenter.currentAgentId = MOCK_CURRENT_AGENT_PROFILE.id;
        targetCenter.currentAgentName = targetApp.applicantName;
        targetCenter.lastCancellationReason = null;

        // 如果不在 myAgentCentersStore 中，则新加入
        const exists = myAgentCentersStore.find((m) => m.centerId === targetCenter.centerId);
        if (exists) {
          exists.status = '正常营业';
          exists.isCurrentActive = true;
          exists.ownerName = targetApp.applicantName;
        } else {
          myAgentCentersStore.unshift({
            id: `AG-${targetCenter.centerId}`,
            centerId: targetCenter.centerId,
            name: `${targetCenter.centerName}代销站`,
            centerName: targetCenter.centerName,
            agentType: targetApp.category || '综合',
            province: targetCenter.province,
            branchName: targetCenter.branchName,
            isArticle140: targetCenter.isArticle140,
            ownerName: targetApp.applicantName,
            phone: targetApp.applicantPhone || MOCK_CURRENT_AGENT_PROFILE.phone,
            address: targetCenter.address,
            storeAreaSqM: 45,
            householdsCount: targetCenter.registeredHouseholds || 800,
            maxCap: 1500,
            status: '正常营业',
            isCurrentActive: true,
            inspectionScore: 98.0,
            licenseNo: `LIC-${targetCenter.centerId}-2026`
          });
        }
      } else if (targetApp.type === 'ROTATION') {
        targetCenter.currentAgentName = targetApp.applicantName;
        const exists = myAgentCentersStore.find((m) => m.centerId === targetCenter.centerId);
        if (exists) {
          exists.ownerName = targetApp.applicantName;
          exists.status = '正常营业';
          exists.isCurrentActive = true;
        }
      }
    }

    return createResponse(
      targetApp,
      200,
      `电子规费 ${targetApp.feeAmount.toLocaleString()} IQD 结算成功！代理权证照已生效。`
    );
  }

  // 5.10 兼容旧网点列表查询 (GET)
  if (url.includes('/agent/list') && method === 'GET') {
    return createResponse(myAgentCentersStore);
  }

  // 5.11 G2B 集中批发采购订单列表 (SCM)
  if (url.includes('/agent/g2b/orders') && method === 'GET') {
    let result = [...(activeStores.g2bOrdersStore || g2bOrdersStore)];
    if (params.status && params.status !== '全部') {
      if (params.status === 'UNFINISHED') {
        result = result.filter((o) => o.status !== 'COMPLETED');
      } else {
        result = result.filter((o) => o.status === params.status);
      }
    }
    if (params.agentId) {
      result = result.filter((o) => o.agentId === params.agentId);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(kw) ||
          o.pickupVoucherCode.toLowerCase().includes(kw) ||
          o.centerName.toLowerCase().includes(kw)
      );
    }
    return createResponse(result);
  }

  // 5.12 提交 G2B 集中采购预约单 (SCM / V3 规则引擎)
  // 关键规则：单中心物理绑定校验；在途+在库未超 1500 户 1.2 倍安全库存；未付款禁止生成仓储拣货
  if (url.includes('/agent/g2b/orders') && method === 'POST' && !url.includes('/pay')) {
    const { agentId, centerId, items, logisticsMode, timeSlot, deliveryVehicleNo } = data;
    const targetAgent = myAgentCentersStore.find((a) => a.id === agentId) || myAgentCentersStore[0];

    // 单中心绑定校验：严禁跨中心调货
    if (targetAgent && String(targetAgent.centerId) !== String(centerId)) {
      return createResponse(
        {},
        400,
        `【单中心物理归属拦截】：街道代理【${targetAgent.name}】物理上仅隶属于中心【${targetAgent.centerName}】，严禁跨中心采购订货！`
      );
    }

    // 1500 户安全库存冗余校验 (1.2 倍系数)
    const households = targetAgent ? targetAgent.householdsCount : 1120;
    const maxAllowedFlourKg = households * 9 * 1.2; // 每户标准9KG * 1.2倍冗余
    const maxAllowedRiceKg = households * 4.5 * 1.2; // 每户标准4.5KG * 1.2倍冗余
    const maxAllowedOilL = households * 1.2 * 1.2; // 每户标准1.2L * 1.2倍冗余

    const requestedFlour = (items || []).filter((i) => i.itemCode?.includes('FLOUR')).reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    const requestedRice = (items || []).filter((i) => i.itemCode?.includes('RICE')).reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    const requestedOil = (items || []).filter((i) => i.itemCode?.includes('OIL')).reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

    if (requestedFlour > maxAllowedFlourKg) {
      return createResponse(
        {},
        400,
        `【配额超限拦截】：本次面粉订货量 (${requestedFlour} KG) 超过当前网格 ${households} 户的 1.2 倍动态安全库存上限 (${maxAllowedFlourKg.toFixed(0)} KG)！`
      );
    }
    if (requestedRice > maxAllowedRiceKg) {
      return createResponse(
        {},
        400,
        `【配额超限拦截】：本次大米订货量 (${requestedRice} KG) 超过当前网格 ${households} 户的 1.2 倍动态安全库存上限 (${maxAllowedRiceKg.toFixed(0)} KG)！`
      );
    }
    if (requestedOil > maxAllowedOilL) {
      return createResponse(
        {},
        400,
        `【配额超限拦截】：本次食用油订货量 (${requestedOil} L) 超过当前网格 ${households} 户的 1.2 倍动态安全库存上限 (${maxAllowedOilL.toFixed(0)} L)！`
      );
    }

    const orderNo = `ORD-${Date.now().toString().slice(-8)}`;
    const totalAmount = (items || []).reduce((sum, i) => sum + (Number(i.qty || 0) * Number(i.unitPrice || 0)), 0);
    const isPaid = data.payStatus === 'PAID' || data.isPaid === true;
    const status = isPaid ? 'PAID_WMS_PICKING' : 'PENDING_PAYMENT';
    const pickupVoucherCode = `PK-VOUCH-${centerId || '101'}-${Date.now().toString().slice(-4)}`;

    const newOrder = {
      orderNo,
      agentId: targetAgent ? targetAgent.id : 'FA-00128',
      agentName: targetAgent ? targetAgent.name : '卡尔赫第一配给中心综合代销站',
      centerId: centerId || (targetAgent ? targetAgent.centerId : '101'),
      centerName: targetAgent ? targetAgent.centerName : '卡尔赫第一配给中心 (曼苏尔)',
      province: targetAgent ? targetAgent.province : '巴格达省',
      items: items || [
        { itemCode: 'FLOUR-WHT-02', itemName: '优质特级面粉 (标准白面)', qty: 5000, unit: '公斤 (KG)', unitPrice: 350, subtotal: 1750000 }
      ],
      totalAmount,
      currency: 'IQD',
      logisticsMode: logisticsMode || 'DISPATCH',
      timeSlot: timeSlot || '2026-10-15 09:00-11:00',
      deliveryVehicleNo: deliveryVehicleNo || '配送车待指派',
      status: status,
      payStatus: isPaid ? 'PAID' : 'UNPAID',
      payChannel: isPaid ? (data.payChannel || 'PUBLIC_TREASURY_ACCOUNT') : null,
      payTime: isPaid ? new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-') : null,
      pickupVoucherCode,
      smsNotified: isPaid,
      smsContent: isPaid ? `【伊拉克贸易部】集中采购单${orderNo}货款${totalAmount.toLocaleString()}第纳尔已核销入库，排期${timeSlot}履约，提货码${pickupVoucherCode}。` : null,
      wmsTaskId: isPaid ? `WMS-TASK-WH01-${Date.now().toString().slice(-6)}` : null,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      remarks: '依据辖区服务户数配额提交集中采购，货款入国家粮食财政专管账户。'
    };

    g2bOrdersStore.unshift(newOrder);
    if (activeStores.g2bOrdersStore && !activeStores.g2bOrdersStore.some(o => o.orderNo === newOrder.orderNo)) {
      activeStores.g2bOrdersStore.unshift(newOrder);
    }
    return createResponse(newOrder, 200, 'G2B 集中采购预约单已提交！请尽快完成货款支付以启动中心仓拣货排期。');
  }

  // 5.13 支付 G2B 集中采购货款 (V3 资金入专管账户触发仓储出库)
  if (url.match(/\/agent\/g2b\/orders\/([^/]+)\/pay/) && method === 'POST') {
    const orderNo = url.split('/')[4];
    const targetOrder = g2bOrdersStore.find((o) => o.orderNo === orderNo);

    if (!targetOrder) {
      return createResponse({}, 404, '指定的 G2B 采购单不存在！');
    }

    targetOrder.payStatus = 'PAID';
    targetOrder.status = 'PAID_WMS_PICKING';
    targetOrder.payChannel = data.channel || 'PUBLIC_TREASURY_ACCOUNT';
    targetOrder.payTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetOrder.wmsTaskId = `WMS-TASK-WH01-${Date.now().toString().slice(-6)}`;
    targetOrder.smsNotified = true;
    targetOrder.smsContent = `【伊拉克贸易部】您的G2B集中采购单${targetOrder.orderNo}货款${targetOrder.totalAmount.toLocaleString()}第纳尔已核销入库，排期${targetOrder.timeSlot}履约，提货码${targetOrder.pickupVoucherCode}。`;

    return createResponse(
      targetOrder,
      200,
      `货款 ${targetOrder.totalAmount.toLocaleString()} IQD 已成功入国家粮食专管账户！仓储拣货单【${targetOrder.wmsTaskId}】已生成，提货短信已送达！`
    );
  }

  // 5.14 查询 B2C 社区分时零售预约单 (SCM)
  if (url.includes('/agent/b2c/reservations') && method === 'GET') {
    let result = [...b2cReservationsStore];
    if (params.status && params.status !== '全部') {
      result = result.filter((r) => r.status === params.status);
    }
    if (params.timeSlot && params.timeSlot !== '全部') {
      result = result.filter((r) => r.timeSlot === params.timeSlot);
    }
    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      result = result.filter(
        (r) =>
          r.ticketNo.toLowerCase().includes(kw) ||
          r.cardNo.toLowerCase().includes(kw) ||
          r.headName.toLowerCase().includes(kw) ||
          r.nationalId.includes(kw) ||
          r.pickupCode.toLowerCase().includes(kw)
      );
    }
    return createResponse(result);
  }

  // 5.15 现场到店核销履约 (V5 现场交付校验与扣减本地库存)
  // 规则：读卡/扫码严格校验预约单是否属于当前时间窗口 (±30分钟容差)；严禁无单发货；扣减代理现货
  if (url.includes('/agent/b2c/reservations/verify-redeem') && method === 'POST') {
    const { pickupCode, cardNo, nationalId, verifyMethod, forceOverride } = data;
    const targetReservation = b2cReservationsStore.find(
      (r) =>
        (pickupCode && r.pickupCode.toUpperCase() === pickupCode.toUpperCase()) ||
        (cardNo && r.cardNo === cardNo) ||
        (nationalId && r.nationalId === nationalId)
    );

    if (!targetReservation) {
      return createResponse({}, 404, '【严禁无单发货】：未检索到有效匹配的预约单或提货码，禁止交付物资！');
    }

    if (targetReservation.status === 'VERIFIED') {
      return createResponse(
        {},
        400,
        `【防重复核销拦截】：预约单【${targetReservation.ticketNo}】已于 ${targetReservation.verifiedAt} 完成实物核销，严禁重复发货！`
      );
    }

    // 时间窗口校验 (演示容差检验)
    const isSlotValid = targetReservation.timeSlot.includes('08:00') || targetReservation.timeSlot.includes('10:00') || forceOverride;
    if (!isSlotValid && !forceOverride) {
      return createResponse(
        { requiresConfirmation: true, reservation: targetReservation },
        422,
        `【时段不匹配预警】：当前时间不在预约时段【${targetReservation.timeSlot}】（超前后±30分钟容差）。如现场排队特殊放行，请确认人工特批核销。`
      );
    }

    // 执行核销
    targetReservation.status = 'VERIFIED';
    targetReservation.verifiedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    targetReservation.verifier = '核销员-穆罕默德';
    targetReservation.verifyMethod = verifyMethod || 'DYNAMIC_QR_CODE';

    // 扣减本地库存
    for (const item of targetReservation.items || []) {
      const localStock = agentLocalStocksStore.find((s) => s.itemCode === item.itemCode);
      if (localStock) {
        localStock.currentOnHand = Math.max(0, localStock.currentOnHand - (Number(item.qty) || 0));
        localStock.b2cTotalSold += Number(item.qty) || 0;
      }
    }

    return createResponse(
      targetReservation,
      200,
      `【核销成功】：已完成对户主【${targetReservation.headName}】配给物资核销发货，代理本地实物库存已扣减，台账更新完成！`
    );
  }

  // 5.16 今日各时段接待容量与排期监控看板 (CAPACITY)
  if (url.includes('/agent/time-slots') && method === 'GET') {
    return createResponse(agentTimeSlotsStore);
  }

  // 5.17 查询代理实物库存与进销存账实自核台账 (RECONCILIATION)
  if (url.includes('/agent/local-stocks') && method === 'GET') {
    return createResponse(agentLocalStocksStore);
  }

  // 5.18 本地库存实物盘点与报损录入 (INVENTORY)
  if (url.includes('/agent/local-stocks/inventory') && method === 'POST') {
    const { itemCode, actualCount, lossAmount, lossReason } = data;
    const target = agentLocalStocksStore.find((s) => s.itemCode === itemCode);
    if (target) {
      target.currentOnHand = Number(actualCount);
      target.lossDamaged += Number(lossAmount || 0);
      target.lastInventoryDate = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16);
      target.reconciledStatus = 'BALANCED';
    }
    return createResponse(target, 200, '库存盘点与残损报损已同步至台账，账实校准完成！');
  }

  // 5.19 多维流转追溯穿透倒查 (TRACE)
  // 支持批次号 BatchNo、订单号 OrderNo、身份证号 NationalID 双向倒查
  if (url.includes('/agent/trace/pipeline') && method === 'GET') {
    const kw = (params.keyword || '').trim().toLowerCase();
    let matched = fullTraceChainStore;
    if (kw) {
      matched = fullTraceChainStore.filter(
        (t) =>
          t.traceId.toLowerCase().includes(kw) ||
          t.batchNo.toLowerCase().includes(kw) ||
          t.nationalId.includes(kw) ||
          t.cardNo.toLowerCase().includes(kw) ||
          t.g2bOrderNo.toLowerCase().includes(kw) ||
          t.b2cTicketNo.toLowerCase().includes(kw) ||
          t.pickupCode.toLowerCase().includes(kw)
      );
    }
    return createResponse(matched);
  }

  // 5.20 代理网格 1500 户户籍硬上限校验 (V1 强管控引擎)
  if (url.match(/\/agent\/grid-limit\/([^/]+)/) && method === 'GET') {
    const agentId = url.split('/')[3];
    const targetAgent = myAgentCentersStore.find((a) => a.id === agentId) || myAgentCentersStore[0];
    const count = targetAgent ? targetAgent.householdsCount : 1120;
    const maxLimit = 1500;
    const isSaturated = count >= maxLimit;
    const remainingSlots = Math.max(0, maxLimit - count);

    return createResponse({
      agentId,
      agentName: targetAgent ? targetAgent.name : '街道代理',
      currentHouseholds: count,
      maxLimit,
      isSaturated,
      remainingSlots,
      recommendBackupAgent: isSaturated ? '曼苏尔第二辅助便民配给站 (FA-00219)' : null,
      message: isSaturated
        ? `【网格饱和锁定】：当前代理已达 ${count}/1500 户硬上限，禁止新户迁入！请由区域经理分流设立新代理点。`
        : `当前网格负荷正常：已绑定 ${count}/1500 户，剩余容量 ${remainingSlots} 户。`
    });
  }

  // 5.21 查询代理三级层级拓扑树 (省级 -> 区域级 -> 街道级，含 GIS 坐标与饱和度) (SCM)
  if (url.includes('/agent/hierarchy/tree') && method === 'GET') {
    return createResponse(MOCK_AGENT_HIERARCHY_TREE);
  }

  // 5.22 查询指定代理管辖范围内的公民家庭明细列表 (支持省级/区域/街道三级穿透) (SCM / CITIZEN)
  if (url.match(/\/agent\/hierarchy\/([^/]+)\/families/) && method === 'GET') {
    const id = url.split('/')[3];
    let list = [];
    if (id === 'PROV-AGT-BAG01') {
      // 省级代理：聚合全省各街道公民家庭样本
      list = Object.values(MOCK_AGENT_FAMILIES_MAP).flat();
    } else if (id === 'REG-AGT-01') {
      // 卡尔赫区域代理：聚合卡尔赫下辖曼苏尔、亚尔穆克、哈德拉网点公民
      list = [
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00128'] || []),
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00135'] || []),
        ...(MOCK_AGENT_FAMILIES_MAP['FA-00142'] || [])
      ];
    } else if (id === 'REG-AGT-02') {
      // 鲁萨法区域代理
      list = [...(MOCK_AGENT_FAMILIES_MAP['FA-00201'] || [])];
    } else if (id === 'REG-AGT-03') {
      // 萨德尔城区域代理
      list = [...(MOCK_AGENT_FAMILIES_MAP['FA-00305'] || [])];
    } else {
      // 街道代理门店
      list = MOCK_AGENT_FAMILIES_MAP[id] || MOCK_AGENT_FAMILIES_MAP['FA-00128'] || [];
    }
    return createResponse(list);
  }

  // ==========================================
  // 6. 大屏看板统计 (Dashboard)
  // ==========================================
  // 6.1 管理角色专属：涵盖公民、家庭、各地区代理商、实际配给情况、投诉和处理五大维度统计
  if (url.includes('/dashboard/admin-overview') && method === 'GET') {
    let tr = params.timeRange;
    if (!tr && url.includes('timeRange=')) {
      const match = url.match(/timeRange=([a-zA-Z0-9_-]+)/);
      if (match) tr = match[1];
    }
    const key = tr || 'quarter';
    const data = MOCK_ADMIN_DASHBOARD_DATA[key] || MOCK_ADMIN_DASHBOARD_DATA.quarter;
    return createResponse(data);
  }

  // 6.2 配给代理专属：保持保供大盘指标，支持时间范围联动
  if (url.includes('/dashboard/agent-overview') && method === 'GET') {
    let tr = params.timeRange;
    if (!tr && url.includes('timeRange=')) {
      const match = url.match(/timeRange=([a-zA-Z0-9_-]+)/);
      if (match) tr = match[1];
    }
    const key = tr || 'quarter';
    const data = MOCK_AGENT_DASHBOARD_DATA[key] || MOCK_AGENT_DASHBOARD_DATA.quarter;
    return createResponse(data);
  }

  if (url.includes('/dashboard/overview') && method === 'GET') {
    return createResponse(MOCK_DASHBOARD_STATS);
  }

  // ==========================================
  // 7. 监督官后台管理模块 (Admin Management)
  // ==========================================
  // 7.1 公民配给卡列表
  if (url.includes('/admin/citizen-cards') && method === 'GET') {
    let result = [...adminCardsStore];
    if (params.cardNo) {
      result = result.filter((c) => c.cardNo.toLowerCase().includes(params.cardNo.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((c) => c.headName.includes(params.headName));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((c) => c.status === params.status);
    }
    if (params.province && params.province !== '全部') {
      result = result.filter((c) => c.province.includes(params.province));
    }
    return createResponse(result);
  }

  // 7.2 修改配给卡状态（解冻 / 冻结 / 吊销）
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/status/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.status = data.status;
      target.freezeReason = data.reason || '';
      return createResponse(target, 200, `配给卡【${target.cardNo}】状态已变更为【${data.status}】`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.3 调整月度配额
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/quota/) && method === 'PUT') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.quotas = { ...target.quotas, ...data.quotas };
      return createResponse(target, 200, `配给卡【${target.cardNo}】月度定额已更新成功`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.4 换发新卡 / 重置 NFC
  if (url.match(/\/admin\/citizen-cards\/([^/]+)\/reissue/) && method === 'POST') {
    const cardId = url.split('/')[3];
    const target = adminCardsStore.find((c) => c.id === cardId || c.cardNo === cardId);
    if (target) {
      target.rfidChipUid = `NFC-IQ-${Math.floor(1000000 + Math.random() * 8999999)}X`;
      target.lastVerifiedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
      return createResponse(target, 200, `配给卡【${target.cardNo}】已完成芯片重置并换发新卡`);
    }
    return createResponse({}, 404, '未找到指定配给卡记录');
  }

  // 7.5 家庭户籍档案列表
  if (url.includes('/admin/families') && method === 'GET') {
    let result = [...adminFamiliesStore];
    if (params.familyCode) {
      result = result.filter((f) => f.familyCode.toLowerCase().includes(params.familyCode.toLowerCase()));
    }
    if (params.headName) {
      result = result.filter((f) => f.headName.includes(params.headName));
    }
    if (params.category && params.category !== '全部') {
      result = result.filter((f) => f.category === params.category);
    }
    return createResponse(result);
  }

  // 7.6 新增家庭户籍档案
  if (url.includes('/admin/families') && method === 'POST') {
    const newFamily = {
      id: `FAM-BAG-${Date.now().toString().slice(-4)}`,
      familyCode: `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`,
      cardNo: data.cardNo || `RC-1002${Math.floor(2000 + Math.random() * 7000)}`,
      headName: data.headName,
      headNationalId: data.headNationalId,
      category: data.category || '普通保障家庭',
      memberCount: data.memberCount || 1,
      address: data.address || '',
      registeredDate: new Date().toISOString().split('T')[0],
      adminBranch: data.adminBranch || '卡尔赫第一粮食供应分部',
      phone: data.phone || '',
      members: data.members || []
    };
    adminFamiliesStore.unshift(newFamily);
    return createResponse(newFamily, 200, `家庭户籍档案【${newFamily.familyCode}】登记成功！`);
  }

  // 7.7 编辑家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'PUT') {
    const familyId = url.split('/').pop();
    const target = adminFamiliesStore.find((f) => f.id === familyId || f.familyCode === familyId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, `家庭档案【${target.familyCode}】已更新！`);
    }
    return createResponse({}, 404, '未找到指定家庭档案');
  }

  // 7.8 删除家庭档案
  if (url.match(/\/admin\/families\/([^/]+)/) && method === 'DELETE') {
    const familyId = url.split('/').pop();
    adminFamiliesStore = adminFamiliesStore.filter((f) => f.id !== familyId && f.familyCode !== familyId); activeStores.adminFamiliesStore = adminFamiliesStore;
    return createResponse({ success: true }, 200, '家庭户籍档案已注销注销成功');
  }

  // 7.9 代理网点管理列表
  if (url.includes('/admin/agents') && method === 'GET') {
    let result = [...adminAgentsStore];
    if (params.code) {
      result = result.filter((a) => a.code.toLowerCase().includes(params.code.toLowerCase()));
    }
    if (params.name) {
      result = result.filter((a) => a.name.includes(params.name));
    }
    if (params.status && params.status !== '全部') {
      result = result.filter((a) => a.status === params.status);
    }
    return createResponse(result);
  }

  // 7.10 修改代理网点状态
  if (url.match(/\/admin\/agents\/([^/]+)\/status/) && method === 'PUT') {
    const agentId = url.split('/')[3];
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = data.status;
      return createResponse(target, 200, `代理网点【${target.name}】状态已切换为【${data.status}】`);
    }
    return createResponse({}, 404, '未找到指定代理网点');
  }

  // 7.11 新增代理网点
  if (url.includes('/admin/agents') && method === 'POST') {
    const newAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: data.name,
      manager: data.manager,
      phone: data.phone,
      province: data.province || '巴格达省',
      district: data.district || '',
      address: data.address || '',
      status: '正常营业',
      rating: 5,
      servedHouseholds: data.servedHouseholds || 500,
      storageCapacity: data.storageCapacity || 50,
      lastInspectedAt: new Date().toISOString().split('T')[0]
    };
    adminAgentsStore.unshift(newAgent);
    return createResponse(newAgent, 200, `代理网点【${newAgent.name}】入网登记成功！`);
  }

  // 7.12 更新代理网点资料
  if (url.match(/\/admin\/agents\/([^/]+)/) && method === 'PUT') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, `代理网点资料已更新成功`);
    }
    return createResponse({}, 404, '未找到指定代理网点');
  }

  // 7.13 仓储中心管理列表 (GET)
  if (url.includes('/admin/warehouses') && method === 'GET') {
    let result = [...adminWarehousesStore];
    if (params.province && params.province !== '全部') {
      result = result.filter((w) => w.province.includes(params.province));
    }
    if (params.center && params.center !== '全部') {
      result = result.filter((w) => w.center && w.center.includes(params.center));
    }
    if (params.keyword) {
      const kw = params.keyword.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.code.toLowerCase().includes(kw) ||
          w.name.toLowerCase().includes(kw) ||
          w.manager.toLowerCase().includes(kw)
      );
    }
    return createResponse(result);
  }

  // 7.13.1 新增储备仓库 (POST)
  if (url.includes('/admin/warehouses') && method === 'POST') {
    const newWh = {
      id: `WH-${Date.now().toString().slice(-4)}`,
      code: data.code || `WH-BAG-${Math.floor(10 + Math.random() * 89)}`,
      name: data.name || '新建战略储备仓',
      type: data.type || '战略储备总仓',
      province: data.province || '巴格达省',
      center: data.center || '卡尔赫第一粮食供应分部',
      capacity: Number(data.capacity) || 50000,
      currentStock: Number(data.currentStock) || 0,
      manager: data.manager || '待定负责人',
      phone: data.phone || '+964 780 000 0000',
      status: data.status || '正常运转',
      address: data.address || '示范储备库区'
    };
    adminWarehousesStore.unshift(newWh);
    return createResponse(newWh, 200, '储备仓库已成功创建！');
  }

  // 7.13.2 编辑仓库资料 (PUT)
  if (url.includes('/admin/warehouses/') && method === 'PUT') {
    const id = url.split('/admin/warehouses/')[1]?.split('?')[0];
    const target = adminWarehousesStore.find((w) => w.id === id || w.code === id);
    if (target) {
      Object.assign(target, data);
      return createResponse(target, 200, '仓库信息更新成功！');
    }
    return createResponse({}, 404, '未找到指定仓库！');
  }

  // 7.13.3 删除仓库 (DELETE)
  if (url.includes('/admin/warehouses/') && method === 'DELETE') {
    const id = url.split('/admin/warehouses/')[1]?.split('?')[0];
    const idx = adminWarehousesStore.findIndex((w) => w.id === id || w.code === id);
    if (idx !== -1) {
      adminWarehousesStore.splice(idx, 1);
      return createResponse({}, 200, '仓库已成功注销删除！');
    }
    return createResponse({}, 404, '未找到指定仓库！');
  }

  // ========================================================
  // 8. 三大管理员法定专属职权分发与业务处理 (SCM / BPM / RBAC)
  // ========================================================

  // --------------------------------------------------------
  // 8.1 【配给中心部长专属职权】
  // --------------------------------------------------------
  // 8.1.1 授予代理权 (POST)
  if (url.includes('/admin/authority/minister/grant') && method === 'POST') {
    const { targetAgentId, licenseNo, approvedHouseholds } = data;
    const target = adminAgentsStore.find((a) => a.id === targetAgentId || a.code === targetAgentId);
    if (target) {
      target.status = '正常营业';
      target.licenseNo = licenseNo || `LIC-MIN-${Date.now().toString().slice(-4)}`;
      if (approvedHouseholds) target.servedHouseholds = Number(approvedHouseholds);
      return createResponse(target, 200, `【配给中心部长令】：已成功向网点【${target.name}】正式授予代理权并颁发许可！`);
    }
    return createResponse({}, 200, `【配给中心部长令】：代理权授予申请已签署核准并颁发国家统一许可证！`);
  }

  // 8.1.2 统一代理权 (POST)
  if (url.includes('/admin/authority/minister/unify') && method === 'POST') {
    const { district, standardStandard } = data;
    return createResponse(
      { district, standardStandard, unifiedAt: new Date().toISOString() },
      200,
      `【配给中心部长令】：${district || '全辖区'}配给代理权标准化与统一经营体制整顿方案已正式签发执行！`
    );
  }

  // 8.1.3 设立代理权 (POST)
  if (url.includes('/admin/authority/minister/establish') && method === 'POST') {
    const newAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: data.name || '新设配给代销站',
      manager: data.manager || '待遴选责任人',
      phone: data.phone || '+964 770 000 0000',
      province: data.province || '巴格达省',
      district: data.district || '示范规划区',
      address: data.address || '示范大街1号',
      status: '正常营业',
      rating: 5,
      servedHouseholds: Number(data.servedHouseholds) || 600,
      storageCapacity: Number(data.storageCapacity) || 60,
      lastInspectedAt: new Date().toISOString().split('T')[0],
      isEstablishedByMinister: true
    };
    adminAgentsStore.unshift(newAgent);
    return createResponse(newAgent, 200, `【配给中心部长令】：已依法新设立配给代销网点【${newAgent.name}】（编号: ${newAgent.code}）！`);
  }

  // 8.1.4 拆分大型代理权 (POST) - 解决超过 1,500 户红线问题
  if (url.match(/\/admin\/authority\/minister\/split\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (!target) {
      return createResponse({}, 404, '未找到拟拆分的大型代理网点！');
    }

    const originalHouseholds = target.servedHouseholds || 1800;
    const splitCount1 = Math.floor(originalHouseholds / 2);
    const splitCount2 = originalHouseholds - splitCount1;

    // 原网点户数减半
    target.servedHouseholds = splitCount1;
    target.name = `${target.name} (拆分一分部)`;

    // 衍生创建拆分后的新网点
    const newSplitAgent = {
      id: `AGT-${Date.now().toString().slice(-4)}`,
      code: `FA-${Math.floor(10000 + Math.random() * 89999)}`,
      name: `${target.name.replace(' (拆分一分部)', '')} (拆分二分部)`,
      manager: `${target.manager} (新设分立点负责人)`,
      phone: target.phone,
      province: target.province,
      district: target.district,
      address: `${target.address} (分流副区)`,
      status: '正常营业',
      rating: 5,
      servedHouseholds: splitCount2,
      storageCapacity: Math.floor((target.storageCapacity || 80) / 2),
      lastInspectedAt: new Date().toISOString().split('T')[0],
      isSplitFrom: target.code
    };
    adminAgentsStore.unshift(newSplitAgent);

    return createResponse(
      { original: target, split: newSplitAgent },
      200,
      `【配给中心部长令】：超负荷大型网点【${target.code}】拆分执行完毕！已平抑为 ${splitCount1} 户与 ${splitCount2} 户两处独立网点，彻底解除 1,500 户容量红线预警！`
    );
  }

  // --------------------------------------------------------
  // 8.2 【行政次长专属职权】
  // --------------------------------------------------------
  // 8.2.1 已故代理代理权的轮替裁定 (POST)
  if (url.match(/\/admin\/authority\/deputy\/deceased-rotation\/([^/]+)/) && method === 'POST') {
    const ticketId = url.split('/').pop();
    return createResponse(
      { ticketId, status: '已裁决生效', approvedBy: '行政次长' },
      200,
      `【行政次长签发令】：已故代理法定继承轮替裁定已获终审批准！三代合法继承人资格确认，许可证已依法换发。`
    );
  }

  // 8.2.2 已注销代理权的恢复 (POST) - 严格前置：必须由规划与跟进司确认
  if (url.match(/\/admin\/authority\/deputy\/restore\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);

    // 核心前置拦截：规划与跟进司确认检查
    if (!data.planningConfirmed && (!target || !target.planningConfirmed)) {
      return createResponse(
        {},
        400,
        `【法定程序拦截】：行政次长恢复已注销代理权的前提是【规划与跟进司】已完成联合调查并出具正式确认报告！当前尚未收到规划跟进司确认意见，禁止恢复。`
      );
    }

    if (target) {
      target.status = '正常营业';
      target.isRestored = true;
      target.restoredAt = new Date().toISOString();
      return createResponse(
        target,
        200,
        `【行政次长签发令】：基于规划与跟进司联合调查确认结论，网点【${target.name}】已注销代理权已由行政次长正式签署令核准恢复！配给物资通道即刻解冻。`
      );
    }
    return createResponse({}, 200, `【行政次长签发令】：已注销代理权恢复命令签署生效！`);
  }

  // --------------------------------------------------------
  // 8.3 【规划与跟进司总干事专属职权】
  // --------------------------------------------------------
  // 8.3.1 代理注销 (POST)
  if (url.match(/\/admin\/authority\/planning\/cancel\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = '已注销(空置)';
      target.cancelReason = data.reason || '规划与跟进司执行法定清退注销';
      return createResponse(target, 200, `【规划与跟进司总干事决议】：网点【${target.name}】代理权已注销清退，已释放为空置状态并向社会公示！`);
    }
    return createResponse({}, 404, '未找到指定网点！');
  }

  // 8.3.2 代理轮替/转移审批 (POST)
  if (url.match(/\/admin\/authority\/planning\/rotate-transfer\/([^/]+)/) && method === 'POST') {
    const ticketId = url.split('/').pop();
    return createResponse(
      { ticketId, status: '规划跟进司初审/转移核准通过' },
      200,
      `【规划与跟进司总干事决议】：代理人自愿轮替与区域转移申请已完成法务及配额清算，审核核准通过！`
    );
  }

  // 8.3.3 合并代理权 (POST) - 针对低于750户的小型网点
  if (url.includes('/admin/authority/planning/merge') && method === 'POST') {
    const { primaryAgentId, secondaryAgentId } = data;
    const primary = adminAgentsStore.find((a) => a.id === primaryAgentId || a.code === primaryAgentId);
    const secondary = adminAgentsStore.find((a) => a.id === secondaryAgentId || a.code === secondaryAgentId);

    if (!primary || !secondary) {
      return createResponse({}, 400, '必须选择两处待合并的有效网点！');
    }

    const totalHouseholds = (primary.servedHouseholds || 0) + (secondary.servedHouseholds || 0);
    if (totalHouseholds > 750) {
      return createResponse(
        {},
        400,
        `【合规红线拦截】：依据贸易部规范，合并后网点服务户数不得超过 750 户！当前合并后为 ${totalHouseholds} 户，禁止合并。`
      );
    }

    primary.servedHouseholds = totalHouseholds;
    primary.name = `${primary.name} (吸收合并点)`;
    secondary.status = '已合并注销';

    return createResponse(
      { primary, secondary },
      200,
      `【规划与跟进司总干事决议】：小型网点合并成功！网点【${secondary.code}】并入【${primary.code}】，总服务户数为 ${totalHouseholds} 户（符合 ≤ 750 户红线）。`
    );
  }

  // 8.3.4 行政处罚 (POST)
  if (url.match(/\/admin\/authority\/planning\/penalize\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.status = data.penaltyType === 'REVOKE' ? '吊销资质' : '停业整顿';
      target.penaltyRecord = {
        date: new Date().toISOString().split('T')[0],
        type: data.penaltyType,
        reason: data.reason || '违反配额发售准则或克扣群众物资',
        officer: '规划与跟进司总干事'
      };
      return createResponse(target, 200, `【规划与跟进司总干事处罚决定书】：已对网点【${target.name}】执行行政处罚（状态变更为【${target.status}】）！`);
    }
    return createResponse({}, 404, '未找到指定网点！');
  }

  // 8.3.5 规划与跟进司联合调查确认 (恢复前置) (POST)
  if (url.match(/\/admin\/authority\/planning\/confirm-review\/([^/]+)/) && method === 'POST') {
    const agentId = url.split('/').pop();
    const target = adminAgentsStore.find((a) => a.id === agentId || a.code === agentId);
    if (target) {
      target.planningConfirmed = true;
      target.planningConfirmedAt = new Date().toISOString();
      return createResponse(
        target,
        200,
        `【规划与跟进司确认通过】：网点【${target.name}】已完成双司联合入户调查与整改复核，正式确认为【合规准予恢复】！已转交行政次长签发恢复命令。`
      );
    }
    return createResponse({}, 404, '未找到指定网点！');
  }

  // ==========================================
  // 9. 智能客服与私有化 RAG 问答服务 (AI & Customer Service)
  // ==========================================

  // 9.1 获取知识库目录与向量化状态概览
  if (url.includes('/ai-service/knowledge-bases') && method === 'GET') {
    return createResponse({
      knowledgeBases: MOCK_KNOWLEDGE_BASES,
      recommendedPrompts: MOCK_RECOMMENDED_PROMPTS,
      vectorEngine: {
        engine: 'Milvus v2.4 (Distributed)',
        indexType: 'HNSW (M=16, efConstruction=200)',
        metricType: 'Cosine Similarity',
        embeddingDimension: 1024,
        totalVectors: 109,
        lastIndexSync: new Date().toISOString()
      }
    });
  }

  // 9.2 获取单一切片政策全文详情
  if (url.match(/\/ai-service\/chunk-detail\/([^/]+)/) && method === 'GET') {
    const chunkId = url.split('/').pop();
    const reqLang = getAiServiceLang(config);
    const chunk = getTranslatedSource(chunkId, reqLang) || MOCK_KNOWLEDGE_CHUNKS.find((c) => c.id === chunkId);
    if (chunk) {
      return createResponse(chunk);
    }
    return createResponse({}, 404, '未找到指定的政策条文切片');
  }

  // 9.3 RAG 检索增强智能问答
  if (url.includes('/ai-service/chat') && method === 'POST') {
    const question = (data.question || '').trim();
    const history = data.history || [];
    const kbId = data.kbId || '';
    const userContext = data.userContext || {};
    const reqLang = getAiServiceLang(config, data);

    const qLower = question.toLowerCase();
    const humanKeywords = ['人工', '转人工', '人工客服', '真人', '客服人员', '投诉', '无法解答', '不满意', '电话', 'live agent', 'agent', 'human', 'موظف', 'فەرمانبەر'];
    const isHumanIntent = humanKeywords.some((k) => qLower.includes(k));

    let matchedChunks = [];
    let answer = '';
    let suggestQuestions = [];
    let needHumanTransfer = isHumanIntent;
    let contentMap = {};
    let sourcesMap = { zh: [], en: [], ar: [], ku: [] };
    let suggestQuestionsMap = { zh: [], en: [], ar: [], ku: [] };
    let topicKey = '';
    let userQuestionMap = {};

    const matchedTopic = matchTopic(question);
    if (matchedTopic) {
      topicKey = matchedTopic.key;
      answer = matchedTopic.answer[reqLang] || matchedTopic.answer.zh;
      contentMap = matchedTopic.answer;
      userQuestionMap = matchedTopic.userQuestion;
      suggestQuestions = matchedTopic.suggestQuestions[reqLang] || matchedTopic.suggestQuestions.zh;
      suggestQuestionsMap = matchedTopic.suggestQuestions;

      matchedChunks = (matchedTopic.sourceIds || []).map((id) => getTranslatedSource(id, reqLang)).filter(Boolean);
      ['zh', 'en', 'ar', 'ku'].forEach((lang) => {
        sourcesMap[lang] = (matchedTopic.sourceIds || []).map((id) => getTranslatedSource(id, lang)).filter(Boolean);
      });
    } else {
      // 兜底通用咨询多语言
      topicKey = 'general';
      const defaultSourceIds = ['CHUNK-GUIDE-001', 'CHUNK-POLICY-001'];
      matchedChunks = defaultSourceIds.map((id) => getTranslatedSource(id, reqLang)).filter(Boolean);
      ['zh', 'en', 'ar', 'ku'].forEach((lang) => {
        sourcesMap[lang] = defaultSourceIds.map((id) => getTranslatedSource(id, lang)).filter(Boolean);
      });

      contentMap = {
        zh: `您好！关于您咨询的“${question}”，为您提供以下业务指导：\n\n1. **业务核验**：建议核对家庭配给卡号、在册人口及当前绑定的代理网点状态；\n2. **线上申办**：系统支持在线办理【家庭信息变更】、【户主变更】、【代理网点转移】及【解冻申报】等全流程业务；\n3. **政策保障**：国家口粮物资配额标准受共和国贸易部统一监管与法律保障。\n\n如遇复杂疑难，可随时点击【转人工客服】协同办理。`,
        en: `Hello! Regarding your inquiry on "${question}", here is the guidance:\n\n1. **Verification**: Please check your digital ration card number, household members, and active agent branch;\n2. **Online Services**: The platform supports online applications for Change of Head, Agent Transfer, Family Updates, and Unfreeze Requests;\n3. **Legal Protection**: All food ration quotas are guaranteed by the Ministry of Trade.\n\nIf you need further assistance, feel free to click "Connect to Live Agent".`,
        ar: `مرحباً بكم! بخصوص استفساركم حول "${question}"، نود توضيح ما يلي:\n\n1. **التدقيق**: يرجى التأكد من رقم البطاقة التموينية وأفراد الأسرة المسجلين والوكيل المعتمد؛\n2. **المعاملات الإلكترونية**: تتيح المنظومة تقديم طلبات تغيير رب الأسرة، نقل الوكيل، تحديث البيانات وفك التجميد؛\n3. **الحماية القانونية**: الحصص التموينية مضمونة وفق ضوابط وزارة التجارة.\n\nفي حال واجهتكم أي صعوبة، يمكنكم التحويل الفوري إلى "مكتب الدعم المباشر".`,
        ku: `سڵاو! سەبارەت بە پرسیارەکەت دەربارەی "${question}"، ئەم ڕێنماییانە بخوێنەرەوە:\n\n1. **پشکنین**: تکایە ژمارەی کارتی بەشەخۆراک و ناوی ئەندامان و بریکارەکەت بپشکنە؛\n2. **خزمەتگوزاری ئۆنلاین**: دەتوانیت داواکاری گۆڕینی سەرۆکی خێزان، گواستنەوەی بریکار و چالاککردنەوە لە سیستەم پێشکەش بکەیت؛\n3. **پاراستنی یاسایی**: بەشەخۆراک لەلایەن وەزارەتی بازرگانییەوە گەرەنتی کراوە.\n\nلە کاتی پێویستدا دەتوانیت پەیوەندی بە "فەرمانبەری ڕاستەوخۆ" بکەیت.`
      };
      answer = contentMap[reqLang] || contentMap.zh;

      suggestQuestionsMap = {
        zh: ['如何办理户主变更申请？', '每人每月的食品配给物资配额标准是多少？', '搬家后如何将配给网点转移到新住址？'],
        en: ['How to apply for change of household head?', 'What is the monthly food ration quota standard?', 'How to transfer the agent branch upon moving?'],
        ar: ['كيف يتم تقديم طلب تغيير رب الأسرة؟', 'ما هي الحصة التموينية المقررة شهرياً لكل فرد؟', 'كيفية نقل البطاقة إلى وكيل جديد عند الانتقال؟'],
        ku: ['چۆن داواکاری گۆڕینی سەرۆکی خێزان پێشکەش بکەم؟', 'بەشەخۆراکی مانگانەی هەر تاکێک چەندە؟', 'چۆن بریکار بگوازمەوە بۆ شوێنی نوێ؟']
      };
      suggestQuestions = suggestQuestionsMap[reqLang] || suggestQuestionsMap.zh;
      userQuestionMap = { zh: question, en: question, ar: question, ku: question };
    }

    return createResponse({
      answer,
      contentMap,
      topicKey,
      userQuestionMap,
      sources: matchedChunks,
      sourcesMap,
      suggestQuestions,
      suggestQuestionsMap,
      needHumanTransfer
    });
  }

  // 9.4 一键无缝转接 7x24 人工客服（同步多轮问答上下文）
  if (url.includes('/ai-service/transfer-human') && method === 'POST') {
    const { sessionId, conversationHistory = [], userContext = {}, reason = 'USER_TRIGGER' } = data;
    const reqLang = getAiServiceLang(config, data);
    const assignedAgent = MULTI_LANG_AGENTS[0];
    const ticketNo = `CS-2026-${Date.now().toString().slice(-6)}`;

    const agentName = assignedAgent.names[reqLang] || assignedAgent.names.zh;
    const agentDept = assignedAgent.departments[reqLang] || assignedAgent.departments.zh;
    const greetingMessage = assignedAgent.initialGreetings[reqLang] || assignedAgent.initialGreetings.zh;

    return createResponse({
      success: true,
      ticketNo,
      sessionId,
      agent: {
        ...assignedAgent,
        name: agentName,
        department: agentDept
      },
      agentNameMap: assignedAgent.names,
      agentDepartmentMap: assignedAgent.departments,
      initialGreeting: greetingMessage,
      initialGreetingMap: assignedAgent.initialGreetings,
      queuePosition: 1,
      handoffTime: new Date().toISOString()
    }, 200, 'Handed off to 24/7 human agent');
  }

  // 9.5 人工客服实时消息交流
  if (url.includes('/ai-service/human-message') && method === 'POST') {
    const { message = '', agentId = 'AGENT-CS-8092', sessionId } = data;
    const reqLang = getAiServiceLang(config, data);
    const mLower = message.toLowerCase();

    let matchedScenario = MULTI_LANG_HUMAN_REPLIES.default;
    for (const [key, item] of Object.entries(MULTI_LANG_HUMAN_REPLIES)) {
      if (item.keywords && item.keywords.some((k) => mLower.includes(k.toLowerCase()))) {
        matchedScenario = item;
        break;
      }
    }

    const reply = matchedScenario.replies[reqLang] || matchedScenario.replies.zh;
    const replyMap = matchedScenario.replies;
    const agent = MULTI_LANG_AGENTS[0];

    return createResponse({
      agent: {
        ...agent,
        name: agent.names[reqLang] || agent.names.zh,
        department: agent.departments[reqLang] || agent.departments.zh
      },
      agentNameMap: agent.names,
      reply,
      replyMap,
      timestamp: new Date().toISOString()
    });
  }

  // 9.6 满意度评价提交
  if (url.includes('/ai-service/feedback') && method === 'POST') {
    return createResponse({
      success: true,
      feedbackId: `FB-${Date.now()}`
    }, 200, '感谢您的宝贵反馈，我们将持续优化智能客服与政策检索服务！');
  }

  // ==========================================
  // 10. 投诉和处理模块 (Complaints & Handling)
  // ==========================================
  // 10.1 查询投诉工单列表 (支持来源、状态、省市、中心、关键词)
  if (url.includes('/complaint/list') && method === 'GET') {
    let list = [...complaintsStore];
    if (params.channel && params.channel !== '全部') {
      list = list.filter((c) => c.channel === params.channel);
    }
    if (params.status && params.status !== '全部') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params.type && params.type !== '全部') {
      list = list.filter((c) => c.type.includes(params.type));
    }
    if (params.province && params.province !== '全部') {
      list = list.filter((c) => c.province.includes(params.province));
    }
    if (params.center && params.center !== '全部') {
      list = list.filter((c) => c.center.includes(params.center));
    }
    if (params.keyword) {
      const kw = params.keyword.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(kw) ||
          c.applicantName.toLowerCase().includes(kw) ||
          c.callPhone.includes(kw) ||
          c.title.toLowerCase().includes(kw) ||
          c.content.toLowerCase().includes(kw) ||
          c.agentName.toLowerCase().includes(kw)
      );
    }
    return createResponse(list);
  }

  // 10.2 登记新投诉工单 (如 1919 热线或 AI 客服转交)
  if (url.includes('/complaint/create') && method === 'POST') {
    const newId = `CMP-2026-${String(1085 + complaintsStore.length).padStart(4, '0')}`;
    const newComplaint = {
      id: newId,
      channel: data.channel || '1919政务热线电话',
      callPhone: data.callPhone || '',
      applicantName: data.applicantName || '匿名来电群众',
      nationalId: data.nationalId || '',
      province: data.province || '巴格达省',
      center: data.center || '卡尔赫第一粮食供应分部',
      agentName: data.agentName || '辖区所属代销网点',
      type: data.type || '服务态度差/排队耗时',
      title: data.title || '群众致电投诉登记',
      content: data.content || '',
      status: '待分配',
      handlerName: '',
      handledAt: '',
      result: '',
      satisfaction: '待评价',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    complaintsStore.unshift(newComplaint);
    return createResponse(newComplaint, 200, '投诉工单已成功立案登记');
  }

  // 10.3 督办并办结工单
  if (url.includes('/complaint/handle/') && method === 'POST') {
    const id = url.split('/complaint/handle/')[1]?.split('?')[0];
    const item = complaintsStore.find((c) => c.id === id);
    if (item) {
      item.status = data.status || '已办结';
      item.handlerName = data.handlerName || '规划与跟进司总干事';
      item.handledAt = new Date().toISOString().slice(0, 16).replace('T', ' ');
      item.result = data.result || '已落实行政监督与整改闭环';
      item.satisfaction = data.satisfaction || '满意';
    }
    return createResponse(item, 200, '投诉案件已办结');
  }

  // 默认兜底响应
  return createResponse({}, 200, 'Mock Default Response');
}
