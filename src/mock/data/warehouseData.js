/**
 * 仓储管理 (SCM) 与配给代理业务数据模型
 * 契合 Spring Cloud 微服务架构 (Gateway -> Auth / Common / SCM / BPM / UNICODE)
 * 严格覆盖需求七大核心模块及 P1 ~ P5 阶段验证标准
 */

// 1. 六维实时库存数据模型 (物理仓库 - 货架货位 - 物资分类 - 生产批次 - 效期状态 - 业务状态)
export const MOCK_STOCKS = [
  {
    id: 'STK-001',
    itemName: '精制大米 (巴斯马蒂一等品)',
    itemCode: 'RICE-BAS-01',
    category: '谷物粮食',
    warehouseId: 'WH-BAG-01',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02', // 货架货位
    locationName: 'A区-03号重型货架-02货位',
    batchNo: 'BATCH-20261012-EXP202710-RC01', // 符合P1规则: 包含生产日期及效期
    productionDate: '2026-10-12',
    expiryDate: '2027-10-11',
    expiryStatus: '正常', // 正常 / 临界警戒 / 已过期
    bizStatus: '可用', // 可用(Available) / 锁定(Locked) / 在途(In-Transit) / 冻结(Frozen)
    availableQty: 184500,
    lockedQty: 13440,
    inTransitQty: 20000,
    frozenQty: 0,
    currentQty: 184500, // 兼容现有前端统计
    unit: '公斤 (KG)',
    minSafeQty: 50000,
    status: '库存充沛',
    uniqueTraceCode: 'UNI-BOX-20261012-0091823', // 全局唯一箱码标签 (UNICODE)
    inspectReportNo: 'QC-20261012-001',
    storageCondition: '常温干燥通风 (湿度≤65%, 温度≤20℃)'
  },
  {
    id: 'STK-002',
    itemName: '优质特级面粉 (标准白面)',
    itemCode: 'FLOUR-WHT-02',
    category: '谷物粮食',
    warehouseId: 'WH-BAG-02',
    warehouseName: '卡尔赫面粉战略储备仓',
    locationCode: 'B02-01-04',
    locationName: 'B区-01号平库货架-04货位',
    batchNo: 'BATCH-20260415-EXP202704-FL02',
    productionDate: '2026-04-15',
    expiryDate: '2027-04-14',
    expiryStatus: '正常',
    bizStatus: '可用',
    availableQty: 92400,
    lockedQty: 8000,
    inTransitQty: 0,
    frozenQty: 0,
    currentQty: 92400,
    unit: '公斤 (KG)',
    minSafeQty: 40000,
    status: '正常配给',
    uniqueTraceCode: 'UNI-BOX-20260415-0044129',
    inspectReportNo: 'QC-20260415-018',
    storageCondition: '防潮密封防虫 (湿度≤60%)'
  },
  {
    id: 'STK-003',
    itemName: '精炼食用植物油 (葵花籽配方)',
    itemCode: 'OIL-SUN-03',
    category: '副食品油脂',
    warehouseId: 'WH-BAG-01',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'C01-05-01',
    locationName: 'C区液体储罐库-05区-01位',
    batchNo: 'BATCH-20260120-EXP202801-OL03',
    productionDate: '2026-01-20',
    expiryDate: '2028-01-19',
    expiryStatus: '正常',
    bizStatus: '可用',
    availableQty: 34100,
    lockedQty: 4480,
    inTransitQty: 5000,
    frozenQty: 0,
    currentQty: 34100,
    unit: '升 (L)',
    minSafeQty: 30000,
    status: '临界警戒',
    uniqueTraceCode: 'UNI-BOX-20260120-0081290',
    inspectReportNo: 'QC-20260120-005',
    storageCondition: '避光阴凉 (温度10~25℃)'
  },
  {
    id: 'STK-004',
    itemName: '一级纯精制白砂糖',
    itemCode: 'SUGAR-WHT-04',
    category: '大宗副食',
    warehouseId: 'WH-BAG-03',
    warehouseName: '鲁萨法物资配送总站',
    locationCode: 'D03-02-03',
    locationName: 'D区包装食品库-02架-03位',
    batchNo: 'BATCH-20260630-EXP202806-SG04',
    productionDate: '2026-06-30',
    expiryDate: '2028-06-29',
    expiryStatus: '正常',
    bizStatus: '可用',
    availableQty: 68900,
    lockedQty: 4480,
    inTransitQty: 0,
    frozenQty: 0,
    currentQty: 68900,
    unit: '公斤 (KG)',
    minSafeQty: 25000,
    status: '库存充沛',
    uniqueTraceCode: 'UNI-BOX-20260630-0099411',
    inspectReportNo: 'QC-20260630-011',
    storageCondition: '防潮密封防结块'
  },
  {
    id: 'STK-005',
    itemName: '精制大米 (迪亚拉哈奈根前置储备)',
    itemCode: 'RICE-BAS-01',
    category: '谷物粮食',
    warehouseId: 'WH-DIY-01',
    warehouseName: '迪亚拉哈奈根前置战略保供仓 (第140号决议区)',
    locationCode: 'A02-01-01',
    locationName: 'A区保供专垛-01架-01位',
    batchNo: 'BATCH-20260901-EXP202709-RC05',
    productionDate: '2026-09-01',
    expiryDate: '2027-08-31',
    expiryStatus: '正常',
    bizStatus: '可用',
    availableQty: 45000,
    lockedQty: 3560,
    inTransitQty: 10000,
    frozenQty: 0,
    currentQty: 45000,
    unit: '公斤 (KG)',
    minSafeQty: 15000,
    status: '库存充沛',
    uniqueTraceCode: 'UNI-BOX-20260901-0077218',
    inspectReportNo: 'QC-20260901-003',
    storageCondition: '常温干燥通风'
  },
  {
    id: 'STK-006',
    itemName: '异常封存大米 (运输差异阻断)',
    itemCode: 'RICE-BAS-01',
    category: '谷物粮食',
    warehouseId: 'WH-BAG-01',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'Z01-01-01',
    locationName: 'Z区隔离待查库-01号垛位',
    batchNo: 'BATCH-20260810-EXP202708-ERR01',
    productionDate: '2026-08-10',
    expiryDate: '2027-08-09',
    expiryStatus: '正常',
    bizStatus: '冻结', // 差异阻断冻结
    availableQty: 0,
    lockedQty: 0,
    inTransitQty: 0,
    frozenQty: 400,
    currentQty: 400,
    unit: '公斤 (KG)',
    minSafeQty: 0,
    status: '异常冻结',
    uniqueTraceCode: 'UNI-BOX-20260810-0066112',
    inspectReportNo: 'QC-20260810-DISC',
    storageCondition: '隔离封存'
  }
];

// 2. 模块一：贸易部物资配给月度总计划 (对接贸易部 BPM / SCM 下发)
export const MOCK_RATION_PLANS = [
  {
    id: 'PLAN-001',
    planNo: 'PLAN-2026-10-001',
    title: '2026年10月全国战略粮油口粮月度保供计划',
    periodName: '2026年10月度 (10-01 ~ 10-31)',
    periodMonth: '2026-10',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    scope: '全国18省全域 (重点倾斜覆盖第140号决议争议区与受损安置点)',
    targetHouseholds: 1250000,
    targetBeneficiaries: 5625000,
    issuer: '伊拉克贸易部食品配给署总规划司',
    issueDate: '2026-09-28',
    status: '执行中', // 待下发 / 执行中 / 已完成 / 已归档
    allocationStatus: '已完成三级代理排程',
    standardFamilyMonthlyAmountIQD: 53800, // 4口之家月度保供指导总货值
    quotaStandards: [
      { itemName: '精制大米', itemCode: 'RICE-BAS-01', quotaPerPerson: 3.0, unit: 'KG/人/月', guidePriceIQD: 1000, totalQty: 16875000 },
      { itemName: '特级面粉', itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9.0, unit: 'KG/人/月', guidePriceIQD: 750, totalQty: 50625000 },
      { itemName: '食用植物油', itemCode: 'OIL-SUN-03', quotaPerPerson: 1.0, unit: 'L/人/月', guidePriceIQD: 2500, totalQty: 5625000 },
      { itemName: '纯精白糖', itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1.0, unit: 'KG/人/月', guidePriceIQD: 1200, totalQty: 5625000 }
    ],
    overallProgress: {
      totalPlanWeightTon: 78750,
      outboundWeightTon: 63000,
      agentReceivedWeightTon: 50400,
      citizenClaimedWeightTon: 39375,
      outboundRate: 80.0,
      receivedRate: 64.0,
      claimedRate: 50.0
    }
  },
  {
    id: 'PLAN-002',
    planNo: 'PLAN-2026-09-002',
    title: '2026年09月全国战略粮油口粮月度保供计划',
    periodName: '2026年09月度 (09-01 ~ 09-30)',
    periodMonth: '2026-09',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    scope: '全国18省全域',
    targetHouseholds: 1248000,
    targetBeneficiaries: 5616000,
    issuer: '伊拉克贸易部食品配给署总规划司',
    issueDate: '2026-08-28',
    status: '已完成',
    allocationStatus: '已完结归档',
    standardFamilyMonthlyAmountIQD: 53800,
    quotaStandards: [
      { itemName: '精制大米', itemCode: 'RICE-BAS-01', quotaPerPerson: 3.0, unit: 'KG/人/月', guidePriceIQD: 1000, totalQty: 16848000 },
      { itemName: '特级面粉', itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9.0, unit: 'KG/人/月', guidePriceIQD: 750, totalQty: 50544000 },
      { itemName: '食用植物油', itemCode: 'OIL-SUN-03', quotaPerPerson: 1.0, unit: 'L/人/月', guidePriceIQD: 2500, totalQty: 5616000 },
      { itemName: '纯精白糖', itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1.0, unit: 'KG/人/月', guidePriceIQD: 1200, totalQty: 5616000 }
    ],
    overallProgress: {
      totalPlanWeightTon: 78624,
      outboundWeightTon: 78624,
      agentReceivedWeightTon: 78624,
      citizenClaimedWeightTon: 77500,
      outboundRate: 100.0,
      receivedRate: 100.0,
      claimedRate: 98.6
    }
  },
  {
    id: 'PLAN-003',
    planNo: 'PLAN-2026-11-003',
    title: '2026年11月全国战略粮油口粮月度保供预排计划',
    periodName: '2026年11月度 (11-01 ~ 11-30)',
    periodMonth: '2026-11',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    scope: '全国18省全域 (冬季储备保障阶段)',
    targetHouseholds: 1255000,
    targetBeneficiaries: 5647500,
    issuer: '伊拉克贸易部食品配给署总规划司',
    issueDate: '2026-10-10',
    status: '待执行',
    allocationStatus: '待代理中心排程分解',
    standardFamilyMonthlyAmountIQD: 53800,
    quotaStandards: [
      { itemName: '精制大米', itemCode: 'RICE-BAS-01', quotaPerPerson: 3.0, unit: 'KG/人/月', guidePriceIQD: 1000, totalQty: 16942500 },
      { itemName: '特级面粉', itemCode: 'FLOUR-WHT-02', quotaPerPerson: 9.0, unit: 'KG/人/月', guidePriceIQD: 750, totalQty: 50827500 },
      { itemName: '食用植物油', itemCode: 'OIL-SUN-03', quotaPerPerson: 1.0, unit: 'L/人/月', guidePriceIQD: 2500, totalQty: 5647500 },
      { itemName: '纯精白糖', itemCode: 'SUGAR-WHT-04', quotaPerPerson: 1.0, unit: 'KG/人/月', guidePriceIQD: 1200, totalQty: 5647500 }
    ],
    overallProgress: {
      totalPlanWeightTon: 79065,
      outboundWeightTon: 0,
      agentReceivedWeightTon: 0,
      citizenClaimedWeightTon: 0,
      outboundRate: 0.0,
      receivedRate: 0.0,
      claimedRate: 0.0
    }
  }
];

// 3. 模块一：根据“我的代理中心列表”自动分解排程的各级配送任务单与配额基准 (三级代理层级架构：省级代理 -> 区域代理 -> 街道代理)
export const MOCK_AGENT_ALLOCATION_TASKS = [
  // =============== 1. 省级代理层级 (PROVINCE) ===============
  {
    id: 'TASK-001',
    taskNo: 'TASK-202610-BAG-PROV01',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'PROVINCE',
    agentLevelName: '省级代理',
    agentCenterId: 'PROV-AGT-BAG01',
    centerName: '巴格达省配给运营总代理 (省级总调度中心)',
    province: '巴格达省 (Baghdad)',
    district: '巴格达全境 (涵盖卡尔赫与鲁萨法)',
    responsiblePerson: '穆罕默德·贾巴尔·拉希德 (运营总监)',
    isSelf: true,
    isArticle140: false,
    registeredHouseholds: 7650,
    coveredCitizens: 30600, // 7650户 * 4人
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-05',
    totalGuideAmountIQD: 411570000, // 7650 * 53,800 IQD (4.1157 亿 IQD)
    autoAllocatedFormula: '签约户数 7,650户 × 4人/户 × 国家月度保供配额指标 (依据名下管辖全量家庭户数算法锁定，严禁手动篡改)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 91800, // 30600 * 3
        allocatedQtyTon: 91.8,
        outboundQty: 80000,
        receivedQty: 75000,
        claimedQty: 48000,
        unit: 'KG',
        subtotalIQD: 91800000,
        completionRate: 52.3
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 275400, // 30600 * 9
        allocatedQtyTon: 275.4,
        outboundQty: 240000,
        receivedQty: 220000,
        claimedQty: 142000,
        unit: 'KG',
        subtotalIQD: 206550000,
        completionRate: 51.6
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 30600,
        allocatedQtyTon: 30.6,
        outboundQty: 28000,
        receivedQty: 26000,
        claimedQty: 16500,
        unit: 'L',
        subtotalIQD: 76500000,
        completionRate: 53.9
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 30600,
        allocatedQtyTon: 30.6,
        outboundQty: 28000,
        receivedQty: 26000,
        claimedQty: 16500,
        unit: 'KG',
        subtotalIQD: 36720000,
        completionRate: 53.9
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261005-0001-PROV'
  },

  // =============== 2. 区域代理层级 (DISTRICT) ===============
  {
    id: 'TASK-002',
    taskNo: 'TASK-202610-BAG-REG01',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'DISTRICT',
    agentLevelName: '区域代理',
    agentCenterId: 'REG-AGT-01',
    centerName: '卡尔赫区区域代理运营部 (卡尔赫调度中心)',
    province: '巴格达省 (Baghdad)',
    district: '卡尔赫区 (Al-Karkh)',
    responsiblePerson: '海德尔·法蒂赫·纳吉姆 (区域经理)',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 4100,
    coveredCitizens: 16400, // 4100 * 4
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-08',
    totalGuideAmountIQD: 220580000, // 4100 * 53,800 IQD
    autoAllocatedFormula: '签约户数 4,100户 × 4人/户 × 国家月度保供配额指标 (区域汇聚核算，算法硬性锁定)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 49200,
        allocatedQtyTon: 49.2,
        outboundQty: 49200,
        receivedQty: 49200,
        claimedQty: 32000,
        unit: 'KG',
        subtotalIQD: 49200000,
        completionRate: 65.0
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 147600,
        allocatedQtyTon: 147.6,
        outboundQty: 147600,
        receivedQty: 147600,
        claimedQty: 96000,
        unit: 'KG',
        subtotalIQD: 110700000,
        completionRate: 65.0
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 16400,
        allocatedQtyTon: 16.4,
        outboundQty: 16400,
        receivedQty: 16400,
        claimedQty: 11000,
        unit: 'L',
        subtotalIQD: 41000000,
        completionRate: 67.1
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 16400,
        allocatedQtyTon: 16.4,
        outboundQty: 16400,
        receivedQty: 16400,
        claimedQty: 11000,
        unit: 'KG',
        subtotalIQD: 19680000,
        completionRate: 67.1
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261008-0101-REG'
  },
  {
    id: 'TASK-003',
    taskNo: 'TASK-202610-BAG-REG02',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'DISTRICT',
    agentLevelName: '区域代理',
    agentCenterId: 'REG-AGT-02',
    centerName: '鲁萨法区区域代理运营部 (鲁萨法调度中心)',
    province: '巴格达省 (Baghdad)',
    district: '鲁萨法区 (Al-Rusafa)',
    responsiblePerson: '扎伊德·卡西姆·阿尔-萨迪 (区域经理)',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 3550,
    coveredCitizens: 14200,
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-10',
    totalGuideAmountIQD: 190990000, // 3550 * 53,800 IQD
    autoAllocatedFormula: '签约户数 3,550户 × 4人/户 × 国家月度保供配额指标 (区域汇聚核算，算法硬性锁定)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 42600,
        allocatedQtyTon: 42.6,
        outboundQty: 30800,
        receivedQty: 25800,
        claimedQty: 16000,
        unit: 'KG',
        subtotalIQD: 42600000,
        completionRate: 37.6
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 127800,
        allocatedQtyTon: 127.8,
        outboundQty: 92400,
        receivedQty: 72400,
        claimedQty: 46000,
        unit: 'KG',
        subtotalIQD: 95850000,
        completionRate: 36.0
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 14200,
        allocatedQtyTon: 14.2,
        outboundQty: 11600,
        receivedQty: 9600,
        claimedQty: 5500,
        unit: 'L',
        subtotalIQD: 35500000,
        completionRate: 38.7
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 14200,
        allocatedQtyTon: 14.2,
        outboundQty: 11600,
        receivedQty: 9600,
        claimedQty: 5500,
        unit: 'KG',
        subtotalIQD: 17040000,
        completionRate: 38.7
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261010-0201-REG'
  },

  // =============== 3. 街道代理终端网点 (STREET) ===============
  {
    id: 'TASK-004',
    taskNo: 'TASK-202610-BAG-STR01',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FA-00128',
    centerName: '卡尔赫第一配给中心综合代销站 (曼苏尔)',
    province: '巴格达省 (Baghdad)',
    district: '卡尔赫区 · 曼苏尔街道',
    responsiblePerson: '穆罕默德·贾巴尔·拉希德 (本人经营代销站)',
    isSelf: true,
    isArticle140: false,
    registeredHouseholds: 1120,
    coveredCitizens: 4480, // 1120 * 4
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-12',
    totalGuideAmountIQD: 60256000, // 1120 * 53,800 IQD
    autoAllocatedFormula: '签约户数 1,120户 × 4人/户 × 国家月度保供配额指标 (按实名户籍公式化原子分配，严禁人工修改)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 13440,
        allocatedQtyTon: 13.44,
        outboundQty: 13440,
        receivedQty: 13440,
        claimedQty: 9600,
        unit: 'KG',
        subtotalIQD: 13440000,
        completionRate: 71.4
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 40320,
        allocatedQtyTon: 40.32,
        outboundQty: 40320,
        receivedQty: 40320,
        claimedQty: 28800,
        unit: 'KG',
        subtotalIQD: 30240000,
        completionRate: 71.4
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 4480,
        allocatedQtyTon: 4.48,
        outboundQty: 4480,
        receivedQty: 4480,
        claimedQty: 3200,
        unit: 'L',
        subtotalIQD: 11200000,
        completionRate: 71.4
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 4480,
        allocatedQtyTon: 4.48,
        outboundQty: 4480,
        receivedQty: 4480,
        claimedQty: 3200,
        unit: 'KG',
        subtotalIQD: 5376000,
        completionRate: 71.4
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261012-9901-BAG'
  },
  {
    id: 'TASK-005',
    taskNo: 'TASK-202610-BAG-STR02',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FA-00135',
    centerName: '亚尔穆克第3街道便民配给站',
    province: '巴格达省 (Baghdad)',
    district: '卡尔赫区 · 亚尔穆克街道',
    responsiblePerson: '奥马尔·萨巴赫·阿尔-纳西尔',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 1480,
    coveredCitizens: 5920,
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-14',
    totalGuideAmountIQD: 79624000, // 1480 * 53,800 IQD
    autoAllocatedFormula: '签约户数 1,480户 × 4人/户 × 国家月度保供配额指标 (按户数自动核算锁定)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 17760,
        allocatedQtyTon: 17.76,
        outboundQty: 17760,
        receivedQty: 17760,
        claimedQty: 12500,
        unit: 'KG',
        subtotalIQD: 17760000,
        completionRate: 70.4
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 53280,
        allocatedQtyTon: 53.28,
        outboundQty: 53280,
        receivedQty: 53280,
        claimedQty: 38000,
        unit: 'KG',
        subtotalIQD: 39960000,
        completionRate: 71.3
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 5920,
        allocatedQtyTon: 5.92,
        outboundQty: 5920,
        receivedQty: 5920,
        claimedQty: 4100,
        unit: 'L',
        subtotalIQD: 14800000,
        completionRate: 69.3
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 5920,
        allocatedQtyTon: 5.92,
        outboundQty: 5920,
        receivedQty: 5920,
        claimedQty: 4100,
        unit: 'KG',
        subtotalIQD: 7104000,
        completionRate: 69.3
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261014-9903-BAG'
  },
  {
    id: 'TASK-006',
    taskNo: 'TASK-202610-BAG-STR03',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FA-00142',
    centerName: '多拉区第12配给便民站 (满载负荷)',
    province: '巴格达省 (Baghdad)',
    district: '卡尔赫区 · 多拉街道',
    responsiblePerson: '哈立德·瓦利德·阿尔-杜莱米',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 1500, // 达到1500硬上限
    coveredCitizens: 6000,
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-15',
    totalGuideAmountIQD: 80700000, // 1500 * 53,800 IQD
    autoAllocatedFormula: '签约户数 1,500户 (饱和封顶) × 4人/户 × 国家月度保供配额指标',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 18000,
        allocatedQtyTon: 18.0,
        outboundQty: 18000,
        receivedQty: 18000,
        claimedQty: 11200,
        unit: 'KG',
        subtotalIQD: 18000000,
        completionRate: 62.2
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 54000,
        allocatedQtyTon: 54.0,
        outboundQty: 54000,
        receivedQty: 54000,
        claimedQty: 34000,
        unit: 'KG',
        subtotalIQD: 40500000,
        completionRate: 63.0
      },
      {
        itemName: '食用植物油',
        itemCode: 'OIL-SUN-03',
        quotaPerPerson: 1.0,
        guidePriceIQD: 2500,
        plannedQty: 6000,
        allocatedQtyTon: 6.0,
        outboundQty: 6000,
        receivedQty: 6000,
        claimedQty: 3900,
        unit: 'L',
        subtotalIQD: 15000000,
        completionRate: 65.0
      },
      {
        itemName: '纯精白糖',
        itemCode: 'SUGAR-WHT-04',
        quotaPerPerson: 1.0,
        guidePriceIQD: 1200,
        plannedQty: 6000,
        allocatedQtyTon: 6.0,
        outboundQty: 6000,
        receivedQty: 6000,
        claimedQty: 3900,
        unit: 'KG',
        subtotalIQD: 7200000,
        completionRate: 65.0
      }
    ],
    taskStatus: '正常履约中',
    status: '执行中',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20261015-9905-BAG'
  },
  {
    id: 'TASK-007',
    taskNo: 'TASK-202610-BAG-STR04',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FL-00130',
    centerName: '萨德尔城中央第5面粉代销网点 (原分支)',
    province: '巴格达省 (Baghdad)',
    district: '鲁萨法区 · 萨德尔城',
    responsiblePerson: '哈桑·阿里·穆萨维',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 1250,
    coveredCitizens: 5000,
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-18',
    totalGuideAmountIQD: 67250000, // 1250 * 53,800 IQD
    autoAllocatedFormula: '签约户数 1,250户 × 4人/户 × 国家月度保供配额指标',
    items: [
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 45000,
        allocatedQtyTon: 45.0,
        outboundQty: 0,
        receivedQty: 0,
        claimedQty: 0,
        unit: 'KG',
        subtotalIQD: 33750000,
        completionRate: 0.0
      },
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 15000,
        allocatedQtyTon: 15.0,
        outboundQty: 0,
        receivedQty: 0,
        claimedQty: 0,
        unit: 'KG',
        subtotalIQD: 15000000,
        completionRate: 0.0
      }
    ],
    taskStatus: '短缺风险预警',
    status: '执行中',
    riskLevel: 'HIGH',
    riskReason: '网点轮替过渡期待前置仓集中备货，在库面粉与大米储备低于安全红线',
    lastDispatchedDeliveryNo: null
  },
  {
    id: 'TASK-008',
    taskNo: 'TASK-202610-DIY-STR05',
    planNo: 'PLAN-2026-10-001',
    periodMonth: '2026-10',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FD-00129',
    centerName: '哈奈根第一边境综合代销保供站 (第140号决议争议区)',
    province: '迪亚拉省 (Diyala)',
    district: '哈奈根区 (Khanaqin)',
    responsiblePerson: '卡里姆·萨迪克·库尔迪',
    isSelf: false,
    isArticle140: true,
    registeredHouseholds: 890,
    coveredCitizens: 3560,
    deliveryCycle: '2026年10月月度全量配额',
    scheduleStartDate: '2026-10-01',
    scheduleEndDate: '2026-10-31',
    scheduledDeliveryDate: '2026-10-14',
    totalGuideAmountIQD: 47882000, // 890 * 53,800 IQD
    autoAllocatedFormula: '签约户数 890户 × 4人/户 × 国家月度保供配额指标 (第140号决议区倾斜保障，公式锁定)',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 10680,
        allocatedQtyTon: 10.68,
        outboundQty: 10680,
        receivedQty: 10640, // 存在40KG差异
        claimedQty: 4200,
        unit: 'KG',
        subtotalIQD: 10680000,
        completionRate: 39.3
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 32040,
        allocatedQtyTon: 32.04,
        outboundQty: 25000,
        receivedQty: 0,
        claimedQty: 0,
        unit: 'KG',
        subtotalIQD: 24030000,
        completionRate: 0.0
      }
    ],
    taskStatus: '履约滞后预警',
    status: '执行中',
    riskLevel: 'MEDIUM',
    riskReason: '边境检查站中转核验延迟，实收大米存在40KG差额已启动批次阻断',
    lastDispatchedDeliveryNo: 'DELIV-20261012-9902-DIY'
  },

  // =============== 4. 2026年9月份历史月度已完结任务单 ===============
  {
    id: 'TASK-009',
    taskNo: 'TASK-202609-BAG-STR01',
    planNo: 'PLAN-2026-09-002',
    periodMonth: '2026-09',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FA-00128',
    centerName: '卡尔赫第一配给中心综合代销站 (曼苏尔)',
    province: '巴格达省 (Baghdad)',
    district: '卡尔赫区 · 曼苏尔街道',
    responsiblePerson: '穆罕默德·贾巴尔·拉希德 (本人)',
    isSelf: true,
    isArticle140: false,
    registeredHouseholds: 1120,
    coveredCitizens: 4480,
    deliveryCycle: '2026年09月月度全量配额',
    scheduleStartDate: '2026-09-01',
    scheduleEndDate: '2026-09-30',
    scheduledDeliveryDate: '2026-09-12',
    totalGuideAmountIQD: 60256000,
    autoAllocatedFormula: '签约户数 1,120户 × 4人/户 × 国家月度保供配额指标',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 13440,
        allocatedQtyTon: 13.44,
        outboundQty: 13440,
        receivedQty: 13440,
        claimedQty: 13440,
        unit: 'KG',
        subtotalIQD: 13440000,
        completionRate: 100.0
      },
      {
        itemName: '特级面粉',
        itemCode: 'FLOUR-WHT-02',
        quotaPerPerson: 9.0,
        guidePriceIQD: 750,
        plannedQty: 40320,
        allocatedQtyTon: 40.32,
        outboundQty: 40320,
        receivedQty: 40320,
        claimedQty: 40320,
        unit: 'KG',
        subtotalIQD: 30240000,
        completionRate: 100.0
      }
    ],
    taskStatus: '已完结',
    status: '已完成',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20260912-7711-BAG'
  },
  {
    id: 'TASK-010',
    taskNo: 'TASK-202609-BAS-STR02',
    planNo: 'PLAN-2026-09-002',
    periodMonth: '2026-09',
    agentLevel: 'STREET',
    agentLevelName: '街道代理',
    agentCenterId: 'FB-00140',
    centerName: '巴士拉阿舒尔港口直营代销联络处',
    province: '巴士拉省 (Basra)',
    district: '巴士拉阿舒尔港区',
    responsiblePerson: '贾西姆·穆罕默德·巴斯拉维',
    isSelf: false,
    isArticle140: false,
    registeredHouseholds: 1450,
    coveredCitizens: 5800,
    deliveryCycle: '2026年09月月度全量配额',
    scheduleStartDate: '2026-09-01',
    scheduleEndDate: '2026-09-30',
    scheduledDeliveryDate: '2026-09-10',
    totalGuideAmountIQD: 78010000, // 1450 * 53,800 IQD
    autoAllocatedFormula: '签约户数 1,450户 × 4人/户 × 国家月度保供配额指标',
    items: [
      {
        itemName: '精制大米',
        itemCode: 'RICE-BAS-01',
        quotaPerPerson: 3.0,
        guidePriceIQD: 1000,
        plannedQty: 17400,
        allocatedQtyTon: 17.4,
        outboundQty: 17400,
        receivedQty: 17400,
        claimedQty: 17400,
        unit: 'KG',
        subtotalIQD: 17400000,
        completionRate: 100.0
      }
    ],
    taskStatus: '已完结',
    status: '已完成',
    riskLevel: 'LOW',
    lastDispatchedDeliveryNo: 'DELIV-20260910-6623-BAS'
  }
];

// 4. 模块二：采购收货与质检入库单据 (符合 P1 验证标准)
export const MOCK_INBOUND_ORDERS = [
  {
    id: 'IN-001',
    inboundNo: 'IN-20261012-001',
    purchaseOrderNo: 'PO-MOT-2026-089', // 贸易部采购单号
    tradePlanNo: 'PLAN-2026-Q4-001', // 强制校验贸易部计划编号 (P1规则)
    itemName: '精制大米 (巴斯马蒂一等品)',
    itemCode: 'RICE-BAS-01',
    category: '谷物粮食',
    expectedQty: 50000,
    actualQty: 50000,
    unit: '公斤 (KG)',
    supplier: '伊拉克国家粮食贸易总公司 (GFTC)',
    warehouseId: 'WH-BAG-01',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    // 强制登记批次号包含生产日期与效期 (P1规则)
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    productionDate: '2026-10-12',
    expiryDate: '2027-10-11',
    uniqueTraceCode: 'UNI-BOX-20261012-0091823', // 一物一码标签 (UNICODE)
    inspectStatus: '质检合格', // 待质检 / 质检合格 / 让步接收 / 不合格退回
    inspectReport: '水分12.8% (≤13.5%), 杂质0.15% (≤0.2%), 包装双层聚乙烯编织袋完好密封',
    inspector: '哈利德·优素福 (高级品控检验师)',
    inboundOperator: '阿里·扎基 (主仓管员)',
    inboundTime: '2026-10-12 09:30:15',
    status: '已上架入库'
  },
  {
    id: 'IN-002',
    inboundNo: 'IN-20261010-002',
    purchaseOrderNo: 'PO-MOT-2026-082',
    tradePlanNo: 'PLAN-2026-Q4-001',
    itemName: '优质特级面粉 (标准白面)',
    itemCode: 'FLOUR-WHT-02',
    category: '谷物粮食',
    expectedQty: 40000,
    actualQty: 40000,
    unit: '公斤 (KG)',
    supplier: '巴格达面粉工业总联社',
    warehouseId: 'WH-BAG-02',
    warehouseName: '卡尔赫面粉战略储备仓',
    locationCode: 'B02-01-04',
    batchNo: 'BATCH-20260415-EXP202704-FL02',
    productionDate: '2026-04-15',
    expiryDate: '2027-04-14',
    uniqueTraceCode: 'UNI-BOX-20260415-0044129',
    inspectStatus: '质检合格',
    inspectReport: '灰分0.55%, 面筋吸水率62%, 包装防潮完好无板结',
    inspector: '努尔·萨巴赫',
    inboundOperator: '瓦利德·贾西姆',
    inboundTime: '2026-10-10 14:20:00',
    status: '已上架入库'
  }
];

// 5. 模块二：出库管理、波次拣选与交付流水 (符合 P2 验证标准)
export const MOCK_OUTBOUND_ORDERS = [
  {
    id: 'OUT-001',
    outboundNo: 'OUT-20261012-005',
    taskNo: 'TASK-2026-Q4-BAG-001', // 依据代理配给任务生成
    targetAgentId: 'FA-00128',
    targetAgentName: '卡尔赫第一配给中心综合代销站',
    waveNo: 'WAVE-20261012-01',
    pickingRule: '先进先出 (FIFO) & 效期优先 (优先发运 BATCH-2026-RICE-09)',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    itemCode: 'RICE-BAS-01',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    plannedQty: 13440,
    actualOutQty: 13440,
    unit: '公斤 (KG)',
    // 审核后生成具备全局唯一校验码的“配送交付流水单” (P2规则)
    deliveryFlowNo: 'DELIV-20261012-9901-BAG',
    securityCheckCode: 'SEC-HASH-8F921B-2026',
    status: '已复核出库(在途锁定)', // 待拣选 / 拣选中 / 已复核出库(在途锁定) / 代理已签收
    lockedInTransitQty: 13440, // 库位可用库存同步转为在途锁定 (P2规则)
    carrierName: '伊拉克国家粮食运输第一车队',
    vehicleNo: 'BAG-T88102',
    driverName: '拉希姆·卡西姆',
    driverPhone: '07705544332',
    outboundTime: '2026-10-12 11:15:00',
    dispatchTime: '2026-10-12 11:45:00'
  },
  {
    id: 'OUT-002',
    outboundNo: 'OUT-20261011-003',
    taskNo: 'TASK-2026-Q4-DIY-002',
    targetAgentId: 'FD-00129',
    targetAgentName: '哈奈根第一边境综合代销保供站',
    waveNo: 'WAVE-20261011-03',
    pickingRule: '先进先出 (FIFO) & 效期优先',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米',
    itemCode: 'RICE-BAS-01',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    plannedQty: 10680,
    actualOutQty: 10680,
    unit: '公斤 (KG)',
    deliveryFlowNo: 'DELIV-20261012-9902-DIY',
    securityCheckCode: 'SEC-HASH-7A119C-2026',
    status: '代理异常签收(差额锁定)',
    lockedInTransitQty: 40, // 差额40KG处于锁定冻结状态
    carrierName: '迪亚拉专线武装护送运输车队',
    vehicleNo: 'DIY-T10992',
    driverName: '奥马尔·法鲁克',
    driverPhone: '07706677889',
    outboundTime: '2026-10-11 08:30:00',
    dispatchTime: '2026-10-11 09:00:00'
  }
];

// 6. 模块二：中心仓向区域前置仓跨库调拨 (三段式流水: 调出出库 -> 在途管理 -> 调入验收)
export const MOCK_TRANSFER_ORDERS = [
  {
    id: 'TRF-001',
    transferNo: 'TRF-20261012-001',
    itemName: '精制大米',
    itemCode: 'RICE-BAS-01',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    transferQty: 20000,
    unit: '公斤 (KG)',
    fromWarehouseId: 'WH-BAG-01',
    fromWarehouseName: '巴格达第一国家储备粮库 (中心仓)',
    toWarehouseId: 'WH-DIY-01',
    toWarehouseName: '迪亚拉哈奈根前置战略保供仓 (前置仓)',
    reason: '第140号决议争议区冬季防灾前置储备加仓',
    currentStage: '阶段2: 在途管理', // 阶段1: 调出出库完成 -> 阶段2: 在途管理 -> 阶段3: 调入验收完成
    stage1Outbound: {
      outboundFlowNo: 'TRF-OUT-88192',
      operator: '阿里·扎基',
      time: '2026-10-12 08:00:00',
      status: '调出完成'
    },
    stage2InTransit: {
      carrier: '跨省干线机动运输三队',
      vehicleNo: 'BAG-T44091',
      gpsLocation: '曼苏尔经行巴古拜干线公路 K45 公里处',
      estimatedArrival: '2026-10-12 17:30:00',
      status: '干线在途中'
    },
    stage3Inbound: {
      inboundFlowNo: null,
      receiver: '哈奈根仓管员：法哈德·阿齐兹',
      inspectStatus: '待验收',
      status: '未完成'
    }
  },
  {
    id: 'TRF-002',
    transferNo: 'TRF-20261005-002',
    itemName: '精炼食用植物油',
    itemCode: 'OIL-SUN-03',
    batchNo: 'BATCH-20260120-EXP202801-OL03',
    transferQty: 5000,
    unit: '升 (L)',
    fromWarehouseId: 'WH-BAG-01',
    fromWarehouseName: '巴格达第一国家储备粮库 (中心仓)',
    toWarehouseId: 'WH-BAG-03',
    toWarehouseName: '鲁萨法物资配送总站 (区域仓)',
    reason: '首都东部配给网点高峰期平衡补仓',
    currentStage: '阶段3: 调入验收完成',
    stage1Outbound: {
      outboundFlowNo: 'TRF-OUT-77102',
      operator: '阿里·扎基',
      time: '2026-10-05 09:00:00',
      status: '调出完成'
    },
    stage2InTransit: {
      carrier: '巴格达城内短驳车队',
      vehicleNo: 'BAG-S00912',
      gpsLocation: '鲁萨法总站入场卸货口',
      estimatedArrival: '2026-10-05 11:30:00',
      status: '已送达'
    },
    stage3Inbound: {
      inboundFlowNo: 'TRF-IN-77102-AC',
      receiver: '鲁萨法仓管员：萨迪克·海达尔',
      inspectStatus: '验收合格',
      time: '2026-10-05 12:10:00',
      status: '已验收入库'
    }
  }
];

// 7. 模块二：全流程盘点管理 (周期盘点、盲盘、动销盘点；差异禁止直接冲抵，需双人审批)
export const MOCK_STOCKTAKE_RECORDS = [
  {
    id: 'STK-CHK-001',
    stocktakeNo: 'STK-CHK-202610-01',
    type: '盲盘 (Blind Count)', // 周期盘点 / 盲盘 / 动销盘点
    warehouseName: '卡尔赫面粉战略储备仓',
    locationCode: 'B02-01-04',
    itemName: '优质特级面粉 (标准白面)',
    batchNo: 'BATCH-20260415-EXP202704-FL02',
    bookQty: 92400,
    countedQty: 92380, // 盘亏20KG
    diffQty: -20,
    diffAmountIQD: 18000,
    unit: '公斤 (KG)',
    counterName: '盘点员：侯赛因·拉希德',
    countDate: '2026-10-10',
    diffReason: '包装微量粉尘自然散耗及边角轻微磨损，差异率0.02%符合国家标准',
    diffResolution: '禁止直接冲抵！生成盈亏差异报告，已流转主管双人审批 (BPM)',
    status: '差异待双人审批', // 盘点无差异 / 差异待双人审批 / 已审批入账 / 已驳回
    approver1: '盘点主管：萨巴赫·卡迪姆',
    approver2: '总调度官：哈桑·马吉德 (待签批)'
  },
  {
    id: 'STK-CHK-002',
    stocktakeNo: 'STK-CHK-202609-02',
    type: '周期盘点 (Cycle Count)',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    bookQty: 184500,
    countedQty: 184500,
    diffQty: 0,
    diffAmountIQD: 0,
    unit: '公斤 (KG)',
    counterName: '盘点员：阿里·扎基',
    countDate: '2026-09-30',
    diffReason: '账实严格相符',
    diffResolution: '账实一致，直接归档',
    status: '盘点无差异',
    approver1: '系统自动核销',
    approver2: '系统自动核销'
  }
];

// 8. 模块二：报损与报溢记录 (强制录入损耗原因，绑定现场存证影像)
export const MOCK_LOSS_RECORDS = [
  {
    id: 'LOSS-001',
    lossNo: 'LOSS-20261012-003',
    lossType: '物理破损 (Damage)', // 物理破损 / 过期变质 / 不可抗力损耗 / 盘盈报溢
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    qty: 50,
    unit: '公斤 (KG)',
    estimatedCostIQD: 45000,
    damageReason: '叉车在转弯入库位时卡脚剐蹭托盘下层编织袋，导致单袋外包装开裂漏粮，已就地清理留样封存。',
    evidenceImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600', // 现场存证影像
    reporter: '仓管员：阿里·扎基',
    reportTime: '2026-10-12 10:15:30',
    approvalStatus: '双人签批通过', // 待双人审批 / 双人签批通过 / 已驳回
    approvers: [
      { name: '主操作人：阿里·扎基', time: '2026-10-12 10:15:30' },
      { name: '复核主管：塔里克·阿齐兹', time: '2026-10-12 10:45:10' }
    ]
  },
  {
    id: 'LOSS-002',
    lossNo: 'LOSS-20260920-001',
    lossType: '过期变质 (Expired)',
    warehouseName: '鲁萨法物资配送总站',
    locationCode: 'D03-02-03',
    itemName: '纯精白糖 (受潮轻度结块)',
    batchNo: 'BATCH-20240901-EXP202609-OLD',
    qty: 120,
    unit: '公斤 (KG)',
    estimatedCostIQD: 108000,
    damageReason: '历年积存样品库位微量回潮硬化结块，经品控化验建议报损作非食用降级处理。',
    evidenceImageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600',
    reporter: '仓管员：萨迪克·海达尔',
    reportTime: '2026-09-20 16:30:00',
    approvalStatus: '双人签批通过',
    approvers: [
      { name: '主操作人：萨迪克·海达尔', time: '2026-09-20 16:30:00' },
      { name: '粮食署监督主管：阿卜杜拉·法希米', time: '2026-09-21 09:20:00' }
    ]
  }
];

// 9. 模块三：流水台账中心 (“单据 - 流水 - 库位余额”三级钩稽关系记录)
export const MOCK_INVENTORY_LEDGERS = [
  {
    id: 'LED-001',
    ledgerNo: 'FLW-20261012-00918',
    docType: '采购入库单 (Inbound)',
    docNo: 'IN-20261012-001',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    changeType: '+增加',
    changeQty: 50000,
    beforeBalanceQty: 134500,
    afterBalanceQty: 184500,
    unit: '公斤 (KG)',
    operator: '阿里·扎基',
    timestamp: '2026-10-12 09:30:15',
    reconciliationStatus: '三级钩稽核验通过' // 单据-流水-余额钩稽一致
  },
  {
    id: 'LED-002',
    ledgerNo: 'FLW-20261012-00925',
    docType: '配送出库交付单 (Outbound)',
    docNo: 'DELIV-20261012-9901-BAG',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    changeType: '-出库(转在途锁定)',
    changeQty: -13440,
    beforeBalanceQty: 184500,
    afterBalanceQty: 171060,
    unit: '公斤 (KG)',
    operator: '系统自动锁库 / 出库复核员',
    timestamp: '2026-10-12 11:15:00',
    reconciliationStatus: '三级钩稽核验通过'
  },
  {
    id: 'LED-003',
    ledgerNo: 'FLW-20261012-00931',
    docType: '现场报损单 (Damage)',
    docNo: 'LOSS-20261012-003',
    warehouseName: '巴格达第一国家储备粮库',
    locationCode: 'A01-03-02',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    changeType: '-破损扣减',
    changeQty: -50,
    beforeBalanceQty: 171060,
    afterBalanceQty: 171010,
    unit: '公斤 (KG)',
    operator: '阿里·扎基 / 塔里克·阿齐兹',
    timestamp: '2026-10-12 10:45:10',
    reconciliationStatus: '三级钩稽核验通过'
  }
];

// 10. 模块四：在途配送追踪与交接链路监控
export const MOCK_DELIVERY_TRACKINGS = [
  {
    id: 'TRK-001',
    deliveryFlowNo: 'DELIV-20261012-9901-BAG',
    taskNo: 'TASK-2026-Q4-BAG-001',
    fromWarehouse: '巴格达第一国家储备粮库',
    toAgentCenter: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    agentOwner: '穆罕默德·贾巴尔·拉希德',
    carrierName: '伊拉克国家粮食运输第一车队',
    vehicleNo: 'BAG-T88102',
    driverName: '拉希姆·卡西姆',
    driverPhone: '07705544332',
    deliveryItems: [
      { itemName: '精制大米', qty: 13440, unit: 'KG', batchNo: 'BATCH-20261012-EXP202710-RC01' }
    ],
    dispatchTime: '2026-10-12 11:45:00',
    estimatedArrivalTime: '2026-10-12 14:30:00',
    status: '已安全送达待签收', // 在途中 / 已送达待签收 / 已扫码核签 / 存在差异报警
    inTransitHours: 2.5,
    maxAllowedHours: 4.0,
    currentLocation: '卡尔赫区曼苏尔商业街18号网点门前装卸位',
    gpsNodes: [
      { time: '11:45', desc: '离开粮库总装卸台，出库封签完毕', status: 'done' },
      { time: '12:30', desc: '经行底格里斯河曼苏尔过江大桥，GPS正常', status: 'done' },
      { time: '13:50', desc: '抵达曼苏尔商业街代销站，司机已出示交付流水码', status: 'done' }
    ]
  },
  {
    id: 'TRK-002',
    deliveryFlowNo: 'DELIV-20261012-9902-DIY',
    taskNo: 'TASK-2026-Q4-DIY-002',
    fromWarehouse: '巴格达第一国家储备粮库',
    toAgentCenter: '哈奈根第一边境综合代销保供站 (FD-00129)',
    agentOwner: '穆罕默德·贾巴尔·拉希德',
    carrierName: '迪亚拉专线武装护送运输车队',
    vehicleNo: 'DIY-T10992',
    driverName: '奥马尔·法鲁克',
    driverPhone: '07706677889',
    deliveryItems: [
      { itemName: '精制大米', qty: 10680, unit: 'KG', batchNo: 'BATCH-20261012-EXP202710-RC01' }
    ],
    dispatchTime: '2026-10-11 09:00:00',
    estimatedArrivalTime: '2026-10-11 15:00:00',
    status: '已触发差异预警(阻断流转)',
    inTransitHours: 6.0,
    maxAllowedHours: 6.0,
    currentLocation: '哈奈根边境保供站卸货仓',
    gpsNodes: [
      { time: '09:00', desc: '粮库启运发车', status: 'done' },
      { time: '12:00', desc: '巴古拜特别检查站联合安检核查通关', status: 'done' },
      { time: '15:00', desc: '哈奈根网点终端扫码核收：实到10,640KG，短缺40KG', status: 'warning' }
    ]
  },
  {
    id: 'TRK-003',
    deliveryFlowNo: 'DELIV-20261013-3301-BAG',
    taskNo: 'TASK-2026-Q4-BAG-003',
    fromWarehouse: '卡尔赫面粉战略储备仓',
    toAgentCenter: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    agentOwner: '穆罕默德·贾巴尔·拉希德',
    carrierName: '国家粮食应急调度直运二队',
    vehicleNo: 'BAG-F33201',
    driverName: '萨迪克·海达尔',
    driverPhone: '07701122334',
    deliveryItems: [
      { itemName: '优质特级面粉', qty: 20000, unit: 'KG', batchNo: 'BATCH-20260415-EXP202704-FL02' }
    ],
    dispatchTime: '2026-10-13 08:30:00',
    estimatedArrivalTime: '2026-10-13 11:30:00',
    status: '已送达待签收',
    inTransitHours: 3.0,
    maxAllowedHours: 4.5,
    currentLocation: '卡尔赫区曼苏尔商业街代销站装卸平台',
    gpsNodes: [
      { time: '08:30', desc: '面粉储备仓发运完成封签', status: 'done' },
      { time: '10:00', desc: '驶过卡尔赫中央立交桥', status: 'done' },
      { time: '11:20', desc: '货车已停靠代销站，待收货人扫码核收', status: 'done' }
    ]
  },
  {
    id: 'TRK-004',
    deliveryFlowNo: 'DELIV-20261013-4402-BAG',
    taskNo: 'TASK-2026-Q4-BAG-004',
    fromWarehouse: '巴格达第一国家储备粮库',
    toAgentCenter: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    agentOwner: '穆罕默德·贾巴尔·拉希德',
    carrierName: '伊拉克国家粮食运输第一车队',
    vehicleNo: 'BAG-T88199',
    driverName: '卡西姆·纳吉姆',
    driverPhone: '07709988776',
    deliveryItems: [
      { itemName: '精炼食用植物油', qty: 5000, unit: 'L', batchNo: 'BATCH-20260901-EXP202809-OL01' }
    ],
    dispatchTime: '2026-10-13 09:15:00',
    estimatedArrivalTime: '2026-10-13 13:00:00',
    status: '运输在途中',
    inTransitHours: 1.5,
    maxAllowedHours: 4.0,
    currentLocation: '机场高速公路北段巡航中',
    gpsNodes: [
      { time: '09:15', desc: '粮库冷链油罐装载完毕起运', status: 'done' },
      { time: '10:10', desc: '通过第一外环安检收费站', status: 'done' }
    ]
  },
  {
    id: 'TRK-005',
    deliveryFlowNo: 'DELIV-20261010-1100-BAG',
    taskNo: 'TASK-2026-Q4-BAG-002',
    fromWarehouse: '鲁萨法物资配送总站',
    toAgentCenter: '卡尔赫第一配给中心综合代销站 (FA-00128)',
    agentOwner: '穆罕默德·贾巴尔·拉希德',
    carrierName: '伊拉克国家粮食运输第一车队',
    vehicleNo: 'BAG-T77012',
    driverName: '哈桑·迈赫迪',
    driverPhone: '07703344556',
    deliveryItems: [
      { itemName: '纯精白糖', qty: 8000, unit: 'KG', batchNo: 'BATCH-20261010-EXP202710-SG01' }
    ],
    dispatchTime: '2026-10-10 10:00:00',
    estimatedArrivalTime: '2026-10-10 12:30:00',
    status: '已签收',
    signedTime: '2026-10-10 12:45:18',
    inTransitHours: 2.2,
    maxAllowedHours: 4.0,
    currentLocation: '已交付卡尔赫代销站完成入库上架',
    gpsNodes: [
      { time: '10:00', desc: '总站装卸完成起运', status: 'done' },
      { time: '12:20', desc: '运抵网点', status: 'done' },
      { time: '12:45', desc: '公民与代理现场扫码二维码核验成功，完成签收', status: 'done' }
    ]
  }
];

// 11. 模块四：代理移动终端扫码签收与对账核验记录
export const MOCK_AGENT_RECEIPTS = [
  {
    id: 'RCP-001',
    receiptNo: 'RCP-20261012-001',
    deliveryFlowNo: 'DELIV-20261012-9901-BAG',
    agentCenterId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    signedBy: '穆罕默德·贾巴尔·拉希德 (移动终端指纹确认)',
    signTime: '2026-10-12 14:15:20',
    shippedQty: 13440,
    receivedQty: 13440,
    discrepancyQty: 0,
    intactRate: 100.0, // 到货完好率
    packageIntegrity: '外包装完好无损、防伪铅封一致、温湿度正常',
    reconciliationResult: '账单相符 (MATCHED)',
    status: '核销入店成功'
  },
  {
    id: 'RCP-002',
    receiptNo: 'RCP-20261011-002',
    deliveryFlowNo: 'DELIV-20261012-9902-DIY',
    agentCenterId: 'FD-00129',
    agentName: '哈奈根第一边境综合代销保供站',
    signedBy: '穆罕默德·贾巴尔·拉希德 (扫码终端录入)',
    signTime: '2026-10-11 15:20:00',
    shippedQty: 10680,
    receivedQty: 10640, // 短缺40KG
    discrepancyQty: -40,
    intactRate: 99.6,
    packageIntegrity: '有2包外包装在崎岖山路颠簸中被紧固绳索割裂漏损，称重短少40KG',
    reconciliationResult: '存在差异 (DISCREPANCY_ALERT)',
    status: '已阻断流转并派发核查工单' // P3规则触发
  }
];

// 12. 模块四：差异预警与异常阻断核查工单 (符合 P3 验证标准)
export const MOCK_DISCREPANCY_TICKETS = [
  {
    id: 'DISC-001',
    ticketNo: 'DISC-20261011-001',
    deliveryFlowNo: 'DELIV-20261012-9902-DIY',
    agentCenterId: 'FD-00129',
    centerName: '哈奈根第一边境综合代销保供站',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    itemName: '精制大米',
    shippedQty: 10680,
    receivedQty: 10640,
    discrepancyQty: -40, // 异常差额40KG
    unit: '公斤 (KG)',
    createdTime: '2026-10-11 15:25:00',
    // 自动阻断该批次异常货物的后续发放流转 (P3规则)
    quarantineStatus: '已锁定并阻断流转 (LOCKED)',
    assignedAuditor: '迪亚拉粮食局审计专员：优素福·拉齐',
    investigationReport: '经护送车队与代理人共同勘验，系山路颠簸绳索勒破2袋，责任归属物流承运方，拟向承运险企索赔 36,000 IQD。',
    resolutionStatus: '核查中 (调查工单派发至承运车队与审计处)'
  }
];

// 13. 模块五：末端配给与家庭核销明细记录 (符合 P4 验证标准: 事务原子性与秒级双向同步)
export const MOCK_CITIZEN_CLAIMS = [
  {
    id: 'CLM-001',
    claimVoucherNo: 'CLM-20261012-8821',
    rationCardNo: 'RC-10029381',
    familyCode: 'FAM-BAG-08832',
    headName: '艾哈迈德·哈桑·萨利赫',
    nationalId: '197582910481',
    agentCenterId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    claimPeriod: '2026年10月份配额',
    claimTime: '2026-10-12 15:10:02',
    eligibleMembers: 4, // 5人中1人商业冻结，实领4人
    claimedItems: [
      { itemName: '精制大米', qty: 12.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 36.0, unit: 'KG', quotaPerHead: 9.0 },
      { itemName: '食用植物油', qty: 4.0, unit: 'L', quotaPerHead: 1.0 },
      { itemName: '纯精白糖', qty: 4.0, unit: 'KG', quotaPerHead: 1.0 }
    ],
    // 数字防伪凭证与哈希防重领校验 (P4规则)
    digitalVoucherHash: 'VOUCHER-SHA256-A8912E8B991F02',
    cardReadMethod: '移动智能终端 NFC 读卡',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 38, // 延迟控制在秒级以内 (38ms)
    syncTimestamp: '2026-10-12 15:10:02.038',
    status: '已即刻交付核销'
  },
  {
    id: 'CLM-002',
    claimVoucherNo: 'CLM-20261012-9902',
    rationCardNo: 'RC-10045892',
    familyCode: 'FAM-BAG-09921',
    headName: '法蒂玛·扎赫拉·卡迪姆',
    nationalId: '198204910293',
    agentCenterId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    claimPeriod: '2026年10月份配额',
    claimTime: '2026-10-12 16:25:40',
    eligibleMembers: 3,
    claimedItems: [
      { itemName: '精制大米', qty: 9.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 27.0, unit: 'KG', quotaPerHead: 9.0 },
      { itemName: '食用植物油', qty: 3.0, unit: 'L', quotaPerHead: 1.0 }
    ],
    digitalVoucherHash: 'VOUCHER-SHA256-CC99102EA98104',
    cardReadMethod: '公民数字卡扫码',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 42,
    syncTimestamp: '2026-10-12 16:25:40.042',
    status: '已即刻交付核销'
  },
  {
    id: 'CLM-003',
    claimVoucherNo: 'CLM-20261010-3321',
    rationCardNo: 'RC-10088910',
    familyCode: 'FAM-DIY-00182',
    headName: '卡西姆·哈米德·阿齐兹',
    nationalId: '197901048921',
    agentCenterId: 'FD-00129',
    agentName: '哈奈根第一边境综合代销保供站',
    claimPeriod: '2026年10月份配额',
    claimTime: '2026-10-10 11:20:15',
    eligibleMembers: 5,
    claimedItems: [
      { itemName: '精制大米', qty: 15.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 45.0, unit: 'KG', quotaPerHead: 9.0 },
      { itemName: '食用植物油', qty: 5.0, unit: 'L', quotaPerHead: 1.0 },
      { itemName: '纯精白糖', qty: 5.0, unit: 'KG', quotaPerHead: 1.0 }
    ],
    digitalVoucherHash: 'VOUCHER-SHA256-FF81042B669911',
    cardReadMethod: '移动终端生物特征核验',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 48,
    syncTimestamp: '2026-10-10 11:20:15.048',
    status: '已即刻交付核销'
  },
  {
    id: 'CLM-004',
    claimVoucherNo: 'CLM-20261008-1190',
    rationCardNo: 'RC-10034199',
    familyCode: 'FAM-BAG-04412',
    headName: '奥马尔·法鲁克·拉希德',
    nationalId: '199003189021',
    agentCenterId: 'FA-00132',
    agentName: '卡拉达半岛社区平价物资供应代销点',
    claimPeriod: '2026年10月份配额',
    claimTime: '2026-10-08 09:45:10',
    eligibleMembers: 2,
    claimedItems: [
      { itemName: '精制大米', qty: 6.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 18.0, unit: 'KG', quotaPerHead: 9.0 }
    ],
    digitalVoucherHash: 'VOUCHER-SHA256-BB110948AC2910',
    cardReadMethod: '实体芯片卡接触式读取',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 35,
    syncTimestamp: '2026-10-08 09:45:10.035',
    status: '已即刻交付核销'
  },
  {
    id: 'CLM-005',
    claimVoucherNo: 'CLM-20260925-8819',
    rationCardNo: 'RC-10029381',
    familyCode: 'FAM-BAG-08832',
    headName: '艾哈迈德·哈桑·萨利赫',
    nationalId: '197582910481',
    agentCenterId: 'FA-00128',
    agentName: '卡尔赫第一配给中心综合代销站',
    claimPeriod: '2026年9月份配额',
    claimTime: '2026-09-25 14:30:20',
    eligibleMembers: 4,
    claimedItems: [
      { itemName: '精制大米', qty: 12.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 36.0, unit: 'KG', quotaPerHead: 9.0 }
    ],
    digitalVoucherHash: 'VOUCHER-SHA256-EE771092891102',
    cardReadMethod: '移动智能终端 NFC 读卡',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 36,
    syncTimestamp: '2026-09-25 14:30:20.036',
    status: '已即刻交付核销'
  },
  {
    id: 'CLM-006',
    claimVoucherNo: 'CLM-20260918-6621',
    rationCardNo: 'RC-10067182',
    familyCode: 'FAM-BAS-01192',
    headName: '塔哈·亚辛·迈赫迪',
    nationalId: '198607129031',
    agentCenterId: 'FB-00140',
    agentName: '巴士拉阿舒尔港口直营代销联络处',
    claimPeriod: '2026年9月份配额',
    claimTime: '2026-09-18 10:15:00',
    eligibleMembers: 6,
    claimedItems: [
      { itemName: '精制大米', qty: 18.0, unit: 'KG', quotaPerHead: 3.0 },
      { itemName: '特级面粉', qty: 54.0, unit: 'KG', quotaPerHead: 9.0 },
      { itemName: '食用植物油', qty: 6.0, unit: 'L', quotaPerHead: 1.0 }
    ],
    digitalVoucherHash: 'VOUCHER-SHA256-DD88291048A109',
    cardReadMethod: '公民身份凭据识别',
    syncToCloudLedger: true,
    cloudSyncLatencyMs: 40,
    syncTimestamp: '2026-09-18 10:15:00.040',
    status: '已即刻交付核销'
  }
];

// 14. 模块六：“仓库到家庭”端到端全链路溯源拓扑数据 (正向追溯与反向倒查)
export const MOCK_TRACE_CHAINS = [
  {
    traceId: 'TRC-RICE-2026-001',
    itemName: '精制大米 (巴斯马蒂一等品)',
    batchNo: 'BATCH-20261012-EXP202710-RC01',
    uniqueTraceCode: 'UNI-BOX-20261012-0091823',
    // 正向追溯: 采购批次 -> 入库货位 -> 出库流水 -> 代理签收 -> 家庭领取
    forwardChain: [
      {
        step: 1,
        nodeType: '采购与质检',
        title: '贸易部统购进货 & 品控质检',
        keyDocNo: 'PO-MOT-2026-089 / QC-20261012-001',
        time: '2026-10-12 09:30',
        location: '国家粮食总公司进境检验口岸',
        handler: '质检师：哈利德·优素福',
        desc: '化验指标合格，生成一物一码标签 UNI-BOX-20261012-0091823'
      },
      {
        step: 2,
        nodeType: '仓储入库货位',
        title: '战略储备中心仓精准上架',
        keyDocNo: 'IN-20261012-001',
        time: '2026-10-12 10:00',
        location: '巴格达第一国家储备粮库 A01-03-02 库位',
        handler: '仓管员：阿里·扎基',
        desc: '批次效期绑定，入库 50,000 KG'
      },
      {
        step: 3,
        nodeType: '出库配送流水',
        title: '波次拣选与交付流水锁定',
        keyDocNo: 'DELIV-20261012-9901-BAG',
        time: '2026-10-12 11:15',
        location: '出库复核总台 -> 国家车队 BAG-T88102',
        handler: '复核员：萨米尔·卡西姆 / 司机：拉希姆',
        desc: '严格 FIFO 拣选出库 13,440 KG，生成全局唯一交付校验码'
      },
      {
        step: 4,
        nodeType: '代理网点签收',
        title: '代理代销网点终端扫码核收',
        keyDocNo: 'RCP-20261012-001',
        time: '2026-10-12 14:15',
        location: '卡尔赫第一配给中心综合代销站 (FA-00128)',
        handler: '代理人：穆罕默德·贾巴尔·拉希德',
        desc: '移动终端实到 13,440 KG 全额核销入店，完好率 100%'
      },
      {
        step: 5,
        nodeType: '末端家庭核销',
        title: '公民智能读卡即时核销交付',
        keyDocNo: 'CLM-20261012-8821',
        time: '2026-10-12 15:10',
        location: '卡尔赫代销站便民服务窗口',
        handler: '持卡人：艾哈迈德·哈桑·萨利赫 (RC-10029381)',
        desc: '校验资格发放 12 KG 大米，原子更新家庭主账本 (耗时 38ms)'
      }
    ]
  }
];

// 15. 模块六：多维流转与损耗审计分析指标
export const MOCK_LOSS_AUDIT_STATS = {
  storageLossRate: 0.08, // 仓储存储损耗率 0.08% (国标上限 0.15%)
  transportLossRate: 0.12, // 运输损耗率 0.12% (国标上限 0.20%)
  agentDeliveryLossRate: 0.05, // 代理交付损耗率 0.05% (国标上限 0.10%)
  totalCompliantRate: 99.75, // 分发合规与账实相符率
  auditedDiscrepancyCount: 1, // 异常差异笔数
  recoveredValueIQD: 36000 // 追回/索赔价值
};

// 16. 模块七：安全审计与高风险操作不可篡改留痕日志
export const MOCK_AUDIT_LOGS = [
  {
    id: 'AUD-001',
    timestamp: '2026-10-12 15:10:02',
    operatorId: 'AGT-00128',
    operatorName: '穆罕默德·贾巴尔·拉希德',
    role: '配给代理 (Agent)',
    terminalIp: '192.168.10.45',
    microservice: 'SCM / UNICODE',
    module: '末端配给核销',
    action: 'CITIZEN_CLAIM_VERIFY',
    actionDesc: '智能读卡完成艾哈迈德家庭(RC-10029381) 10月份配额原子扣减与凭据生成',
    riskLevel: 'LOW',
    beforeSnapshot: '{"cardNo":"RC-10029381","claimedStatus":"UNCLAIMED","riceBalance":12}',
    afterSnapshot: '{"cardNo":"RC-10029381","claimedStatus":"CLAIMED","riceBalance":0}'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-10-12 11:15:00',
    operatorId: 'WH-OP-002',
    operatorName: '阿里·扎基',
    role: '仓管出库员',
    terminalIp: '10.20.1.88',
    microservice: 'SCM',
    module: '出库配送作业',
    action: 'OUTBOUND_DISPATCH_LOCK',
    actionDesc: '审核生成交付流水 DELIV-20261012-9901-BAG，在途锁定库存 13,440 KG',
    riskLevel: 'MEDIUM',
    beforeSnapshot: '{"available":184500,"locked":0}',
    afterSnapshot: '{"available":171060,"locked":13440}'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-10-12 10:45:10',
    operatorId: 'WH-MGR-001',
    operatorName: '塔里克·阿齐兹 (双人复核)',
    role: '储备粮库主管',
    terminalIp: '10.20.1.12',
    microservice: 'BPM / SCM',
    module: '报损与报溢',
    action: 'DOUBLE_APPROVAL_LOSS',
    actionDesc: '双人签批通过 LOSS-20261012-003 物理破损 50KG 报损并核对存证影像',
    riskLevel: 'HIGH',
    beforeSnapshot: '{"status":"PENDING_DOUBLE_APPROVAL"}',
    afterSnapshot: '{"status":"DOUBLE_APPROVED","approver1":"阿里·扎基","approver2":"塔里克·阿齐兹"}'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-10-11 16:02:11',
    operatorId: 'SECURITY-GATEWAY',
    operatorName: 'Spring Cloud Gateway 防火墙拦截',
    role: 'SYSTEM',
    terminalIp: '172.16.89.201',
    microservice: 'GATEWAY',
    module: '权限系统 / RBAC 跨域安全',
    action: 'CROSS_REGION_BLOCKED',
    actionDesc: '拦截非本网格代理跨省越权调取尼尼微省受限配给档案请求，阻断成功',
    riskLevel: 'CRITICAL',
    beforeSnapshot: '{"requestUri":"/scm/agent/nin-320/confidential","region":"BAGHDAD"}',
    afterSnapshot: '{"responseCode":403,"message":"跨区域越权访问已被 100% 拦截阻断"}'
  }
];

// 17. 核心验证标准 P1~P5 阶段规则定义 (用于系统交互式实体验证看板)
export const MOCK_P1_P5_VALIDATION_RULES = [
  {
    code: 'P1',
    title: '仓储入库规则',
    modules: '计划管理、入库作业、批次管理',
    ruleDescription: '采购入库单必须校验贸易部计划编号，批次号生成时必须包含生产日期及效期字段。',
    validationFunction: 'validateP1Rule',
    testInput: {
      tradePlanNo: 'PLAN-2026-Q4-001',
      productionDate: '2026-10-12',
      expiryDate: '2027-10-11',
      batchNo: 'BATCH-20261012-EXP202710-RC01'
    },
    status: 'PASSED',
    complianceRate: '100%'
  },
  {
    code: 'P2',
    title: '出库配送规则',
    modules: '出库作业、流水台账中心',
    ruleDescription: '出库单据审核后必须生成唯一的交付流水号，库位可用库存同步转为在途锁定库存。',
    validationFunction: 'validateP2Rule',
    testInput: {
      outboundNo: 'OUT-20261012-005',
      outQty: 13440,
      deliveryFlowNo: 'DELIV-20261012-9901-BAG'
    },
    status: 'PASSED',
    complianceRate: '100%'
  },
  {
    code: 'P3',
    title: '代理交接规则',
    modules: '代理配送协同、差异预警',
    ruleDescription: '代理网点端签收数量 ≠ 交付流水数量时，系统自动锁定异常差额并派发核查工单，阻断异常批次后续发放流转。',
    validationFunction: 'validateP3Rule',
    testInput: {
      shippedQty: 10680,
      receivedQty: 10640,
      diffQty: -40,
      deliveryFlowNo: 'DELIV-20261012-9902-DIY'
    },
    status: 'PASSED',
    complianceRate: '100%'
  },
  {
    code: 'P4',
    title: '末端兑付规则',
    modules: '读卡核销、家庭台账、溯源中心',
    ruleDescription: '读卡调取配额与扣减必须具备事务原子性，核销成功后家庭账目更新延迟控制在秒级以内。',
    validationFunction: 'validateP4Rule',
    testInput: {
      cardNo: 'RC-10029381',
      claimedQty: 12.0,
      syncLatencyMs: 38
    },
    status: 'PASSED',
    complianceRate: '100%'
  },
  {
    code: 'P5',
    title: '管控审计规则',
    modules: '权限系统、审计日志、多维报表',
    ruleDescription: '跨区域数据越权访问拦截率 100%；报损与盘亏调整必须具备双人签批记录。',
    validationFunction: 'validateP5Rule',
    testInput: {
      crossRegionAttemptBlocked: true,
      lossId: 'LOSS-20261012-003',
      approversCount: 2
    },
    status: 'PASSED',
    complianceRate: '100%'
  }
];
