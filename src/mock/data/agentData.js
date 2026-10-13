import {
  IRAQ_19_PROVINCES,
  IRAQ_PROVINCE_CITIES,
  IRAQ_ALL_600_CENTERS
} from './iraqRegionWarehouses.js';

export { IRAQ_19_PROVINCES, IRAQ_PROVINCE_CITIES, IRAQ_ALL_600_CENTERS };

/**
 * 代理商管理与配给网点数据中心
 * 契合 Spring Cloud 微服务架构 (SCM / BPM / UNICODE / AUTH)
 * 严格遵照伊拉克宪法第 140 号决议与贸易部代理管理条例
 */

// 当前登录代理人员工/商户档案
export const MOCK_CURRENT_AGENT_PROFILE = {
  id: 'AGT-00128',
  username: 'agent',
  name: '穆罕默德·贾巴尔·拉希德',
  idCardNo: '197803120019',
  phone: '07701122339',
  province: '巴格达省',
  district: '卡尔赫区 (Al-Karkh)',
  residentialAddress: '巴格达市卡尔赫区曼苏尔商业街18号',
  licenseNo: 'MO-TRD-AGT-2024-00128',
  registeredCategory: '综合 (食品+面粉)',
  qualificationLevel: '教育部认证合格 (持初高中及以上学历证书)',
  publicEmploymentStatus: '非公职人员 / 无国家财政薪俸 (合规在册)',
  age: 46,
  isPermanentResident: true,
  complianceScore: 98.5
};

/**
 * 伊拉克全国 19 个省份、300 多个城市、600 个配给仓库与中心数据库
 * 涵盖：第 140 号决议重点管辖省份与中心标识 (UNICODE / SCM 区域字典)
 */
export const MOCK_ARTICLE_140_CENTERS = IRAQ_ALL_600_CENTERS;

/**
 * 当前登录账号已有的代理网点与中心列表 (根据用户账号过滤展现)
 */
export const MOCK_MY_AGENT_CENTERS = [
  {
    id: 'FA-00128',
    centerId: '101',
    name: '卡尔赫第一配给中心综合代销站',
    centerName: '卡尔赫第一配给中心 (曼苏尔)',
    agentType: '综合 (食品+面粉)',
    province: '巴格达省 (Baghdad)',
    branchName: '卡尔赫第一粮食供应分部',
    isArticle140: false,
    ownerName: '穆罕默德·贾巴尔·拉希德',
    phone: '07701122339',
    address: '巴格达市卡尔赫区曼苏尔商业街18号',
    storeAreaSqM: 42,
    householdsCount: 1120,
    maxCap: 1500,
    status: '正常营业',
    isCurrentActive: true,
    inspectionScore: 98.5,
    licenseNo: 'LIC-BAG-101-2024'
  },
  {
    id: 'FD-00129',
    centerId: '496',
    name: '哈奈根第一边境综合代销保供站',
    centerName: '哈奈根 (Khanaqin) 第一配给中心',
    agentType: '食品',
    province: '迪亚拉省 (Diyala)',
    branchName: '迪亚拉东部粮食保障分部',
    isArticle140: true,
    ownerName: '穆罕默德·贾巴尔·拉希德',
    phone: '07701122339',
    address: '哈奈根市中心老城区粮库路12号',
    storeAreaSqM: 38,
    householdsCount: 890,
    maxCap: 1500,
    status: '正常营业',
    isCurrentActive: true,
    inspectionScore: 96.0,
    licenseNo: 'LIC-DIY-496-2025'
  },
  {
    id: 'FL-00130',
    centerId: '108',
    name: '萨德尔城中央第5面粉代销网点 (原分支)',
    centerName: '萨德尔城中央配给中心',
    agentType: '面粉',
    province: '巴格达省 (Baghdad)',
    branchName: '鲁萨法第二粮食供应分部',
    isArticle140: false,
    ownerName: '穆罕默德·贾巴尔·拉希德',
    phone: '07701122339',
    address: '萨德尔城中央大道第5区综合楼',
    storeAreaSqM: 30,
    householdsCount: 0,
    maxCap: 1500,
    status: '已注销(待轮替)',
    isCurrentActive: false,
    inspectionScore: 91.0,
    licenseNo: 'LIC-BAG-108-2023',
    cancellationReason: '原经办人故去，已完成份额核减，处于法定轮替/注销重审窗口期'
  }
];

/**
 * 兼容旧列表视图的全局代理商数据 (供其他模块/监督官视图复用)
 */
export const MOCK_AGENTS = [
  ...MOCK_MY_AGENT_CENTERS,
  {
    id: 'FL-00341',
    centerId: '102',
    name: '鲁萨法面粉专项代销点',
    centerName: '卡达米亚第二配给中心',
    agentType: '面粉',
    province: '巴格达省 (Baghdad)',
    branchName: '鲁萨法第二粮食供应分部',
    isArticle140: false,
    ownerName: '萨利姆·努里',
    phone: '07702233445',
    address: '巴格达市鲁萨法区工业路9号',
    storeAreaSqM: 28,
    householdsCount: 680,
    maxCap: 1500,
    status: '正常营业',
    inspectionScore: 94.0,
    licenseNo: 'LIC-BAG-102-2024'
  },
  {
    id: 'FA-00210',
    centerId: '201',
    name: '巴士拉阿夏尔港口联合代销站',
    centerName: '阿沙尔滨海配给中心',
    agentType: '食品',
    province: '巴士拉省 (Basra)',
    branchName: '巴士拉港口配给保障分部',
    isArticle140: false,
    ownerName: '哈立德·奥马尔',
    phone: '07803344556',
    address: '巴士拉市阿夏尔码头大道77号',
    storeAreaSqM: 55,
    householdsCount: 1480,
    maxCap: 1500,
    status: '容量预警 (逼近上限)',
    inspectionScore: 96.0,
    licenseNo: 'LIC-BAS-201-2023'
  }
];

/**
 * 代理业务申请工单记录 (BPM 工作流追踪)
 */
export const MOCK_AGENT_APPLICATIONS = [
  {
    ticketNo: 'AGT-APP-20261012-001',
    type: 'GRANT', // GRANT (申请代理权), ROTATION (轮替/转移), RESTORATION (恢复已注销), CANCELLATION (注销代理权)
    typeName: '新代理权授予申请',
    centerId: '497',
    centerName: '贾劳拉 (Jalawla) 干线配给中心',
    province: '迪亚拉省 (Diyala)',
    isArticle140: true,
    category: '面粉',
    applicantName: '穆罕默德·贾巴尔·拉希德',
    applicantNationalId: '197803120019',
    applicantPhone: '07701122339',
    status: '联合实地检查中', // 待初审 -> 联合实地检查中 -> 待电子支付 -> 已完成 / 已驳回
    currentStep: 2,
    feeAmount: 250000,
    feePaid: false,
    payChannel: null,
    submitTime: '2026-10-10 14:20:00',
    auditNotes: '分部与规划跟进司委员会已完成档案初审，正前往巴格达/迪亚拉现场抽验经营面积及仓储防火标准。',
    committeeMembers: [
      { dept: '迪亚拉配给分部', status: '已签字批准', officer: '卡西姆·哈希姆' },
      { dept: '商业监督司 (观察员)', status: '实地抽检中', officer: '拉希姆·扎希德' },
      { dept: '谷物加工与面粉总公司', status: '审核通过', officer: '马吉德·奥斯曼' }
    ],
    documents: [
      { name: '部长批准授予公函.pdf', size: '1.2MB', verified: true },
      { name: '30%服务家庭联署拇指印同意书.pdf', size: '4.8MB', verified: true },
      { name: '申请人国民身份证与学历证书.pdf', size: '2.1MB', verified: true },
      { name: '公证租赁经营合同及房屋产权书.pdf', size: '3.4MB', verified: true }
    ]
  },
  {
    ticketNo: 'AGT-ROT-20261008-003',
    type: 'ROTATION',
    typeName: '代理权轮替 (已故代理亲属轮替)',
    centerId: '108',
    centerName: '萨德尔城中央配给中心',
    province: '巴格达省 (Baghdad)',
    isArticle140: false,
    category: '面粉',
    applicantName: '穆斯塔法·纳赛尔·贾巴尔 (子)',
    originalAgentName: '纳赛尔·贾巴尔 (已故)',
    kinship: '直系亲属 (第二代 - 子)',
    status: '待电子支付',
    currentStep: 3,
    feeAmount: 50000,
    feePaid: false,
    payChannel: null,
    submitTime: '2026-10-08 10:15:20',
    auditNotes: '法务部与规划跟进司审查通过：教法继承证书与放弃声明合法，逝者配给份额已于4个月内规范注销。请缴纳50,000 IQD规费完成换发。',
    committeeMembers: [
      { dept: '配给分部法务科', status: '教法继承认证通过', officer: '哈桑·阿里' },
      { dept: '规划与跟进司', status: '份额注销核验通过', officer: '阿德南·巴希尔' }
    ],
    documents: [
      { name: '教法分割证书(qassam-shar-i).pdf', size: '1.8MB', verified: true },
      { name: '继承人放弃声明特别授权书.pdf', size: '1.5MB', verified: true },
      { name: '死亡证明与逝者配给份额注销回执.pdf', size: '2.0MB', verified: true },
      { name: '专职经营按捺拇指印公证承诺书.pdf', size: '1.1MB', verified: true }
    ]
  },
  {
    ticketNo: 'AGT-RES-20260925-002',
    type: 'RESTORATION',
    typeName: '恢复已注销代理权 (整改恢复)',
    centerId: '499',
    centerName: '曼德利 (Mandali) 边境便民配给中心',
    province: '迪亚拉省 (Diyala)',
    isArticle140: true,
    category: '综合 (食品+面粉)',
    applicantName: '塔里克·萨利赫',
    status: '已完成',
    currentStep: 4,
    feeAmount: 50000,
    feePaid: true,
    payChannel: 'QI-CARD-ONLINE',
    payTime: '2026-09-27 16:30:12',
    submitTime: '2026-09-25 09:00:00',
    auditNotes: '联合调查结束：未涉及道德败坏及司法罪行，现场抽检达标且32%辖区家庭支持恢复，规费已结算，代理权正式恢复！',
    committeeMembers: [
      { dept: '规划与跟进司', status: '家庭支持率核查达标(32%)', officer: '努尔丁·穆尔塔达' },
      { dept: '商业和财务监督司', status: '整改复查合格', officer: '海德尔·法蒂赫' }
    ],
    documents: [
      { name: '恢复代理权正式申报书.pdf', size: '1.0MB', verified: true },
      { name: '违规整改与专职经营保证书.pdf', size: '1.4MB', verified: true },
      { name: '超25%家庭支持恢复签名按印底册.pdf', size: '3.6MB', verified: true },
      { name: '无犯罪与无商业篡改司法记录证明.pdf', size: '0.9MB', verified: true }
    ]
  }
];

/**
 * ========================================================
 * 阶段一：G2B 代理向政府集中批发补货数据模型
 * 依据辖区 1500 户配额上限提交采购预约单，资金入专户后触发出库
 * ========================================================
 */
export const MOCK_G2B_PURCHASE_ORDERS = [
  {
    orderNo: 'G2B-ORD-20261013-001',
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    centerName: '卡尔赫第一配给中心 (曼苏尔)',
    province: '巴格达省',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质特级面粉 (标准白面)', qty: 9000, unit: '公斤 (KG)', unitPrice: 350, subtotal: 3150000 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米 (巴斯马蒂一等品)', qty: 4500, unit: '公斤 (KG)', unitPrice: 500, subtotal: 2250000 },
      { itemCode: 'OIL-SUN-03', itemName: '精炼食用植物油 (葵花籽配方)', qty: 1200, unit: '升 (L)', unitPrice: 1200, subtotal: 1440000 },
      { itemCode: 'SUGAR-WHT-04', itemName: '一级纯精制白砂糖', qty: 1500, unit: '公斤 (KG)', unitPrice: 400, subtotal: 600000 }
    ],
    totalAmount: 7440000,
    currency: 'IQD',
    logisticsMode: 'DISPATCH', // DISPATCH: 中心配送到店, PICKUP: 代理上门自提
    timeSlot: '2026-10-14 09:00-11:00',
    deliveryVehicleNo: 'BAG-TRK-7841',
    status: 'IN_TRANSIT', // PENDING_PAYMENT(待支付), PAID_WMS_PICKING(已付款待拣货), IN_TRANSIT(配送在途/待自提), COMPLETED(已验收出库), REJECTED(已驳回)
    payStatus: 'PAID',
    payChannel: 'PUBLIC_TREASURY_ACCOUNT', // 对公账户专户扣划
    payTime: '2026-10-13 10:15:30',
    pickupVoucherCode: 'PK-VOUCH-101-20261013-8821',
    smsNotified: true,
    smsContent: '【伊拉克贸易部】您的G2B集中采购单G2B-ORD-20261013-001货款7,440,000第纳尔已核销入库，排期2026-10-14 09:00-11:00配送到店，提货码PK-VOUCH-101-20261013-8821。',
    wmsTaskId: 'WMS-TASK-BAG01-20261013-089',
    createdAt: '2026-10-13 09:40:00',
    remarks: '满足当前网格1120户家庭本期标准补给配额，未超过1.2倍冗余安全库存。'
  },
  {
    orderNo: 'G2B-ORD-20261012-004',
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    centerName: '卡尔赫第一配给中心 (曼苏尔)',
    province: '巴格达省',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质特级面粉 (标准白面)', qty: 4500, unit: '公斤 (KG)', unitPrice: 350, subtotal: 1575000 },
      { itemCode: 'OIL-SUN-03', itemName: '精炼食用植物油 (葵花籽配方)', qty: 600, unit: '升 (L)', unitPrice: 1200, subtotal: 720000 }
    ],
    totalAmount: 2295000,
    currency: 'IQD',
    logisticsMode: 'PICKUP',
    timeSlot: '2026-10-12 14:00-16:00',
    deliveryVehicleNo: '自提卡车 AGT-BAG-091',
    status: 'COMPLETED',
    payStatus: 'PAID',
    payChannel: 'QI_CARD_ENTERPRISE',
    payTime: '2026-10-12 11:00:22',
    pickupVoucherCode: 'PK-VOUCH-101-20261012-3341',
    smsNotified: true,
    smsContent: '【伊拉克贸易部】G2B自提单已核验出库完毕，现货台账已同步累加。',
    wmsTaskId: 'WMS-TASK-BAG01-20261012-045',
    createdAt: '2026-10-12 10:20:00',
    completedAt: '2026-10-12 15:40:00',
    remarks: '自提验收合格，质检封条完好，粮食无受潮变质。'
  },
  {
    orderNo: 'G2B-ORD-20261013-009',
    agentId: 'FD-00129',
    agentName: '哈奈根第一边境综合代销保供站',
    centerId: '496',
    centerName: '哈奈根 (Khanaqin) 第一配给中心',
    province: '迪亚拉省',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质特级面粉 (标准白面)', qty: 8000, unit: '公斤 (KG)', unitPrice: 350, subtotal: 2800000 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米 (巴斯马蒂一等品)', qty: 4000, unit: '公斤 (KG)', unitPrice: 500, subtotal: 2000000 }
    ],
    totalAmount: 4800000,
    currency: 'IQD',
    logisticsMode: 'DISPATCH',
    timeSlot: '2026-10-15 10:00-12:00',
    deliveryVehicleNo: 'DIY-TRK-1092',
    status: 'PAID_WMS_PICKING',
    payStatus: 'PAID',
    payChannel: 'PUBLIC_TREASURY_ACCOUNT',
    payTime: '2026-10-13 13:05:00',
    pickupVoucherCode: 'PK-VOUCH-496-20261013-9012',
    smsNotified: true,
    smsContent: '【伊拉克贸易部】第140号决议重点保供网点G2B采购已入库锁定，WMS专班拣货中。',
    wmsTaskId: 'WMS-TASK-DIY496-20261013-012',
    createdAt: '2026-10-13 12:45:00',
    remarks: '迪亚拉边境重点保障中心，第140号决议优先履约绿色通道。'
  }
];

/**
 * ========================================================
 * 阶段二：B2C 社区分时零售预约与到店核销数据模型
 * 公民分时段预约、时段容量锁、线上预付自付费、到店扫码/读卡核销扣减现货
 * ========================================================
 */
export const MOCK_B2C_RESERVATIONS = [
  {
    ticketNo: 'B2C-RES-20261013-001',
    cardNo: 'RC-10029381',
    headName: '艾哈迈德·哈桑·萨利赫',
    nationalId: '198504110023',
    phone: '07701928374',
    familyMemberCount: 5,
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    reserveDate: '2026-10-13',
    timeSlot: '08:00-10:00',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质面粉', qty: 45, unit: 'KG', quotaConsumed: 45 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米', qty: 15, unit: 'KG', quotaConsumed: 15 },
      { itemCode: 'OIL-SUN-03', itemName: '食用植物油', qty: 5, unit: 'L', quotaConsumed: 5 },
      { itemCode: 'SUGAR-WHT-04', itemName: '白砂糖', qty: 5, unit: 'KG', quotaConsumed: 5 }
    ],
    selfPayAmount: 7500, // 居民自付服务工本规费 (IQD)
    payStatus: 'PAID',
    payChannel: 'QI_CARD',
    pickupCode: 'AGT101-20261013-0810-7719', // 格式：网点+日期+时段+防重随机串
    smsStatus: 'SENT',
    smsSentTime: '2026-10-13 07:15:02',
    status: 'VERIFIED', // PENDING_VERIFY(待核销), VERIFIED(已核销履约), EXPIRED(逾期爽约), CANCELLED(已取消)
    verifiedAt: '2026-10-13 08:42:15',
    verifier: '核销员-萨贾德',
    verifyMethod: 'DYNAMIC_QR_CODE', // DYNAMIC_QR_CODE(扫动态码), NFC_CARD_READER(NFC读卡), MANUAL_INPUT(人工核对)
    householdRemainingQuota: { flour: 0, rice: 0, oil: 0, sugar: 0 },
    isWithinTolerance: true
  },
  {
    ticketNo: 'B2C-RES-20261013-002',
    cardNo: 'RC-10029382',
    headName: '穆斯塔法·卡里姆·纳赛尔',
    nationalId: '197906150031',
    phone: '07802837461',
    familyMemberCount: 4,
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    reserveDate: '2026-10-13',
    timeSlot: '10:00-12:00',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质面粉', qty: 36, unit: 'KG', quotaConsumed: 36 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米', qty: 12, unit: 'KG', quotaConsumed: 12 },
      { itemCode: 'OIL-SUN-03', itemName: '食用植物油', qty: 4, unit: 'L', quotaConsumed: 4 }
    ],
    selfPayAmount: 6000,
    payStatus: 'PAID',
    payChannel: 'ZAIN_CASH',
    pickupCode: 'AGT101-20261013-1012-3841',
    smsStatus: 'SENT',
    smsSentTime: '2026-10-13 08:30:19',
    status: 'PENDING_VERIFY',
    verifiedAt: null,
    verifier: null,
    verifyMethod: null,
    householdRemainingQuota: { flour: 0, rice: 0, oil: 0, sugar: 4 },
    isWithinTolerance: true
  },
  {
    ticketNo: 'B2C-RES-20261013-003',
    cardNo: 'RC-10029383',
    headName: '贾西姆·穆罕默德·阿里',
    nationalId: '199002180045',
    phone: '07703344112',
    familyMemberCount: 6,
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    reserveDate: '2026-10-13',
    timeSlot: '14:00-16:00',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质面粉', qty: 54, unit: 'KG', quotaConsumed: 54 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米', qty: 18, unit: 'KG', quotaConsumed: 18 },
      { itemCode: 'OIL-SUN-03', itemName: '食用植物油', qty: 6, unit: 'L', quotaConsumed: 6 },
      { itemCode: 'SUGAR-WHT-04', itemName: '白砂糖', qty: 6, unit: 'KG', quotaConsumed: 6 }
    ],
    selfPayAmount: 9000,
    payStatus: 'PAID',
    payChannel: 'QI_CARD',
    pickupCode: 'AGT101-20261013-1416-8890',
    smsStatus: 'SENT',
    smsSentTime: '2026-10-13 09:12:44',
    status: 'PENDING_VERIFY',
    verifiedAt: null,
    verifier: null,
    verifyMethod: null,
    householdRemainingQuota: { flour: 0, rice: 0, oil: 0, sugar: 0 },
    isWithinTolerance: false
  },
  {
    ticketNo: 'B2C-RES-20261013-004',
    cardNo: 'RC-10029384',
    headName: '法蒂玛·扎赫拉·奥马尔',
    nationalId: '199408250089',
    phone: '07804455667',
    familyMemberCount: 3,
    agentId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    centerId: '101',
    reserveDate: '2026-10-13',
    timeSlot: '08:00-10:00',
    items: [
      { itemCode: 'FLOUR-WHT-02', itemName: '优质面粉', qty: 27, unit: 'KG', quotaConsumed: 27 },
      { itemCode: 'RICE-BAS-01', itemName: '精制大米', qty: 9, unit: 'KG', quotaConsumed: 9 }
    ],
    selfPayAmount: 4500,
    payStatus: 'PAID',
    payChannel: 'QI_CARD',
    pickupCode: 'AGT101-20261013-0810-1209',
    smsStatus: 'SENT',
    smsSentTime: '2026-10-13 06:40:00',
    status: 'EXPIRED', // 逾期未到店
    verifiedAt: null,
    verifier: null,
    verifyMethod: null,
    householdRemainingQuota: { flour: 27, rice: 9, oil: 3, sugar: 3 },
    isWithinTolerance: false
  }
];

/**
 * ========================================================
 * 核心规则 2: 双层分时段预约与并发控制池 (今日各时段容量与接待看板)
 * 每日固定时间窗口，配置接待上限 Capacity，预扣减与排期错峰
 * ========================================================
 */
export const MOCK_AGENT_TIME_SLOTS = [
  {
    slotId: 'SLOT-01',
    timeRange: '08:00 - 10:00',
    capacity: 60, // 阈值上限
    reservedCount: 52, // 已预约人数
    verifiedCount: 46, // 现已核销出库
    missedCount: 6, // 爽约逾期
    status: 'ACTIVE_NOW', // COMPLETED(已过时), ACTIVE_NOW(当前进行中), UPCOMING(即将开始)
    loadPercent: 86.7
  },
  {
    slotId: 'SLOT-02',
    timeRange: '10:00 - 12:00',
    capacity: 60,
    reservedCount: 58,
    verifiedCount: 18,
    missedCount: 0,
    status: 'UPCOMING',
    loadPercent: 96.7
  },
  {
    slotId: 'SLOT-03',
    timeRange: '14:00 - 16:00',
    capacity: 60,
    reservedCount: 42,
    verifiedCount: 0,
    missedCount: 0,
    status: 'UPCOMING',
    loadPercent: 70.0
  },
  {
    slotId: 'SLOT-04',
    timeRange: '16:00 - 18:00',
    capacity: 50,
    reservedCount: 30,
    verifiedCount: 0,
    missedCount: 0,
    status: 'UPCOMING',
    loadPercent: 60.0
  }
];

/**
 * ========================================================
 * 街道代理本地现货库存与对账台账 (G2B 进货流水 vs B2C 销售流水账实自核)
 * ========================================================
 */
export const MOCK_AGENT_LOCAL_STOCKS = [
  {
    itemCode: 'FLOUR-WHT-02',
    itemName: '优质特级面粉 (标准白面)',
    unit: '公斤 (KG)',
    currentOnHand: 11250, // 代理端本地实物库存
    g2bTotalIn: 22500, // G2B 累计进货入库
    b2cTotalSold: 11180, // B2C 累计核销发货
    lossDamaged: 70, // 残损报损
    bookDiscrepancy: 0, // 账实差异 (0 表示完全一致)
    reconciledStatus: 'BALANCED', // BALANCED(账实相符), DISCREPANCY(存在偏差), AUDITING(审计复核中)
    batchNo: 'BATCH-20261012-EXP202704-FL02',
    lastInventoryDate: '2026-10-13 07:30'
  },
  {
    itemCode: 'RICE-BAS-01',
    itemName: '精制大米 (巴斯马蒂一等品)',
    unit: '公斤 (KG)',
    currentOnHand: 5320,
    g2bTotalIn: 11000,
    b2cTotalSold: 5650,
    lossDamaged: 30,
    bookDiscrepancy: 0,
    reconciledStatus: 'BALANCED',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    lastInventoryDate: '2026-10-13 07:30'
  },
  {
    itemCode: 'OIL-SUN-03',
    itemName: '精炼食用植物油 (葵花籽配方)',
    unit: '升 (L)',
    currentOnHand: 1840,
    g2bTotalIn: 3600,
    b2cTotalSold: 1750,
    lossDamaged: 10,
    bookDiscrepancy: 0,
    reconciledStatus: 'BALANCED',
    batchNo: 'BATCH-20260120-EXP202801-OL03',
    lastInventoryDate: '2026-10-13 07:30'
  },
  {
    itemCode: 'SUGAR-WHT-04',
    itemName: '一级纯精制白砂糖',
    unit: '公斤 (KG)',
    currentOnHand: 2210,
    g2bTotalIn: 4500,
    b2cTotalSold: 2280,
    lossDamaged: 10,
    bookDiscrepancy: 0,
    reconciledStatus: 'BALANCED',
    batchNo: 'BATCH-20260630-EXP202806-SG04',
    lastInventoryDate: '2026-10-13 07:30'
  }
];

/**
 * ========================================================
 * 多维流转与审计追溯模型 (政府中心仓 -> 街道代理 -> 公民家庭)
 * 支持批次号、订单号、身份证号双向倒查
 * ========================================================
 */
export const MOCK_FULL_TRACE_CHAIN = [
  {
    traceId: 'TRC-20261013-0001',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    itemCode: 'RICE-BAS-01',
    itemName: '精制大米 (巴斯马蒂一等品)',
    nationalId: '198504110023',
    cardNo: 'RC-10029381',
    citizenName: '艾哈迈德·哈桑·萨利赫',
    g2bOrderNo: 'G2B-ORD-20261012-004',
    b2cTicketNo: 'B2C-RES-20261013-001',
    pickupCode: 'AGT101-20261013-0810-7719',
    centerWarehouse: '巴格达第一国家储备粮库 (WH-BAG-01)',
    agentShop: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    timeline: [
      { time: '2026-10-12 09:15', title: '国家储备中心仓检验入库', detail: '批次BATCH-20261012-EXP202710-RC01通过商业与质量监督局质检(QC-20261012-001)' },
      { time: '2026-10-12 11:00', title: 'G2B批发货款入财政专管账户', detail: '代理商支付货款2,295,000第纳尔，触发仓储拣货排期' },
      { time: '2026-10-12 15:40', title: '中心出库至街道代理现货仓', detail: '自提卡车AGT-BAG-091验核提货码出库，代理现货台账同步增加' },
      { time: '2026-10-13 07:15', title: '公民B2C分时预约并支付工本费', detail: '锁定08:00-10:00时段，家庭配额预扣，短信通道下发提货码AGT101-20261013-0810-7719' },
      { time: '2026-10-13 08:42', title: '街道代理扫动态码核销发货', detail: '时段容差检验合格，完成实物交付15公斤大米，家庭台账核销扣减' }
    ]
  },
  {
    traceId: 'TRC-20261013-0002',
    batchNo: 'BATCH-20260415-EXP202704-FL02',
    itemCode: 'FLOUR-WHT-02',
    itemName: '优质特级面粉 (标准白面)',
    nationalId: '197906150031',
    cardNo: 'RC-10029382',
    citizenName: '穆斯塔法·卡里姆·纳赛尔',
    g2bOrderNo: 'G2B-ORD-20261013-001',
    b2cTicketNo: 'B2C-RES-20261013-002',
    pickupCode: 'AGT101-20261013-1012-3841',
    centerWarehouse: '卡尔赫面粉战略储备仓 (WH-BAG-02)',
    agentShop: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    timeline: [
      { time: '2026-10-13 10:15', title: 'G2B集中采购线上支付成功', detail: '对公专户扣划7,440,000第纳尔入国家粮食专管账户' },
      { time: '2026-10-13 10:30', title: '中心仓WMS生成出库配送单', detail: '卡车BAG-TRK-7841完成装车，发货短信送达街道代理' },
      { time: '2026-10-13 08:30', title: '公民预约10:00-12:00提货', detail: '配给卡RC-10029382成功锁定面粉36KG额度，下发提货二维码' },
      { time: '2026-10-13 10:10', title: '待到店核销履约', detail: '当前处于有效时间段窗口内，等待公民读卡/扫码核销' }
    ]
  }
];

