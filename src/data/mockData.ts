import {
  FamilyRecord,
  RationApplication,
  AgentRecord,
  PaymentOrder,
  NotificationItem,
  CrossCheckTask,
  DiscrepancyItem,
  WarehouseStockItem,
  WarehouseFlowOrder,
  FraudAlertItem,
  SystemConfigParameters,
  ManageableUser,
  RolePermissionDefinition
} from '../types';

export const INITIAL_FAMILIES: FamilyRecord[] = [
  {
    rationCardNo: 'RC-10029381',
    oldPaperCardNo: 'BAG-1996-08832',
    familyCode: 'FAM-BAG-08832',
    province: '巴格达省 (Baghdad)',
    district: '卡拉达区 (Al-Karrada)',
    headName: '艾哈迈德·哈桑·萨利赫 (Ahmed Hassan)',
    phone: '+964 770 123 4567',
    memberCount: 5,
    status: '正常',
    agentId: 'AGT-001',
    agentName: '卡拉达第一配给分销中心 (Al-Karrada Center 1)',
    address: '巴格达市卡拉达大街42号',
    createdDate: '2025-01-15',
    lastSelfCheckDate: '2026-09-12',
    members: [
      {
        id: 'M-1',
        name: '艾哈迈德·哈桑·萨利赫',
        nationalId: 'NID-1980031201',
        familyCode: 'FAM-BAG-08832',
        relation: '户主',
        birthDate: '1980-03-12',
        gender: '男',
        status: '正常',
        monthlyIncome: 650000,
        phone: '+964 770 123 4567',
        residenceInfo: '巴格达市卡拉达大街42号',
        isUpdatedInSystem: true,
        faceVerified: true
      },
      {
        id: 'M-2',
        name: '法蒂玛·拉希德·阿里',
        nationalId: 'NID-1984071802',
        familyCode: 'FAM-BAG-08832',
        relation: '配偶',
        birthDate: '1984-07-18',
        gender: '女',
        status: '正常',
        monthlyIncome: 0,
        phone: '+964 770 234 5678',
        residenceInfo: '巴格达市卡拉达大街42号',
        isUpdatedInSystem: true,
        faceVerified: true
      },
      {
        id: 'M-3',
        name: '奥马尔·艾哈迈德·哈桑',
        nationalId: 'NID-2010110503',
        familyCode: 'FAM-BAG-08832',
        relation: '子女',
        birthDate: '2010-11-05',
        gender: '男',
        status: '正常',
        phone: '+964 770 345 6789',
        residenceInfo: '巴格达市卡拉达大街42号',
        isUpdatedInSystem: true,
        faceVerified: false
      },
      {
        id: 'M-4',
        name: '扎伊娜卜·艾哈迈德·哈桑',
        nationalId: 'NID-2015042204',
        familyCode: 'FAM-BAG-08832',
        relation: '子女',
        birthDate: '2015-04-22',
        gender: '女',
        status: '冻结',
        freezeReason: '商业',
        freezeDate: '2026-08-10',
        phone: '+964 770 456 7890',
        residenceInfo: '巴格达市卡拉达大街42号',
        isUpdatedInSystem: true,
        faceVerified: false
      },
      {
        id: 'M-5',
        name: '优素福·艾哈迈德·哈桑',
        nationalId: 'NID-2023021405',
        familyCode: 'FAM-BAG-08832',
        relation: '子女',
        birthDate: '2023-02-14',
        gender: '男',
        status: '正常',
        phone: '+964 770 567 8901',
        residenceInfo: '巴格达市卡拉达大街42号',
        isUpdatedInSystem: false, // 供测试：未更新成员无法选择
        faceVerified: false
      }
    ]
  },
  {
    rationCardNo: 'RC-10029382',
    oldPaperCardNo: 'BSR-2001-44109',
    province: '巴士拉省 (Basra)',
    district: '阿沙尔区 (Al-Ashar)',
    headName: '穆罕默德·贾西姆·卡齐姆 (Mohammed Jassim)',
    phone: '+964 780 987 6543',
    memberCount: 4,
    status: '已冻结',
    freezeReason: '高收入未申报 (税务局月薪超标准核验检出)',
    agentId: 'AGT-002',
    agentName: '阿沙尔粮食综合代销点 (Al-Ashar Depot)',
    address: '巴士拉市港口大道88号',
    createdDate: '2024-11-20',
    lastSelfCheckDate: '2026-06-01',
    members: [
      {
        id: 'M-6',
        name: '穆罕默德·贾西姆·卡齐姆',
        nationalId: 'NID-1976050911',
        relation: '户主',
        birthDate: '1976-05-09',
        gender: '男',
        status: '冻结',
        monthlyIncome: 3200000,
        faceVerified: true
      },
      {
        id: 'M-7',
        name: '诺拉·萨阿德·穆萨',
        nationalId: 'NID-1981093012',
        relation: '配偶',
        birthDate: '1981-09-30',
        gender: '女',
        status: '冻结',
        monthlyIncome: 0,
        faceVerified: true
      },
      {
        id: 'M-8',
        name: '阿里·穆罕默德·贾西姆',
        nationalId: 'NID-2008031513',
        relation: '子女',
        birthDate: '2008-03-15',
        gender: '男',
        status: '冻结',
        faceVerified: false
      },
      {
        id: 'M-9',
        name: '玛丽亚姆·穆罕默德·贾西姆',
        nationalId: 'NID-2012082014',
        relation: '子女',
        birthDate: '2012-08-20',
        gender: '女',
        status: '冻结',
        faceVerified: false
      }
    ]
  },
  {
    rationCardNo: 'RC-10029383',
    oldPaperCardNo: 'ERB-2005-77210',
    province: '埃尔比勒省 (Erbil)',
    district: '中央区 (Central)',
    headName: '卡万·阿里·拉希德 (Kawan Ali)',
    phone: '+964 750 334 1122',
    memberCount: 3,
    status: '待自核',
    agentId: 'AGT-003',
    agentName: '城堡街区配给代理站 (Citadel Station)',
    address: '埃尔比勒市城堡路15号',
    createdDate: '2025-03-10',
    lastSelfCheckDate: '2025-03-10',
    members: [
      {
        id: 'M-10',
        name: '卡万·阿里·拉希德',
        nationalId: 'NID-1988120121',
        relation: '户主',
        birthDate: '1988-12-01',
        gender: '男',
        status: '正常',
        monthlyIncome: 800000,
        faceVerified: true
      },
      {
        id: 'M-11',
        name: '蕾拉·马哈茂德·穆斯塔法',
        nationalId: 'NID-1992041022',
        relation: '配偶',
        birthDate: '1992-04-10',
        gender: '女',
        status: '正常',
        monthlyIncome: 0,
        faceVerified: true
      },
      {
        id: 'M-12',
        name: '阿兰·卡万·阿里',
        nationalId: 'NID-2020061823',
        relation: '子女',
        birthDate: '2020-06-18',
        gender: '男',
        status: '正常',
        faceVerified: false
      }
    ]
  }
];

export const INITIAL_AGENTS: AgentRecord[] = [
  {
    id: 'AGT-001',
    name: '卡拉达第一配给分销中心',
    agentType: '综合',
    province: '巴格达省',
    address: '巴格达市卡拉达大街42号',
    storeAreaSqM: 45,
    householdsCount: 1420,
    maxCap: 1500,
    status: '正常营业',
    ownerName: '塔里克·阿齐兹·哈希姆',
    phone: '+964 771 556 7788',
    lastInspectionScore: 94,
    familyConsentRate: 88
  },
  {
    id: 'AGT-002',
    name: '阿沙尔粮食综合代销点',
    agentType: '食品',
    province: '巴士拉省',
    address: '巴士拉市港口大道88号',
    storeAreaSqM: 32,
    householdsCount: 1495,
    maxCap: 1500,
    status: '正常营业',
    ownerName: '哈米德·阿卜杜拉·谢里夫',
    phone: '+964 781 223 9900',
    lastInspectionScore: 89,
    familyConsentRate: 92
  },
  {
    id: 'AGT-003',
    name: '城堡街区配给代理站',
    agentType: '综合',
    province: '埃尔比勒省',
    address: '埃尔比勒市城堡路15号',
    storeAreaSqM: 50,
    householdsCount: 680,
    maxCap: 1500,
    status: '正常营业',
    ownerName: '达纳·奥斯曼·巴扎尔',
    phone: '+964 751 889 0011',
    lastInspectionScore: 96,
    familyConsentRate: 85
  },
  {
    id: 'AGT-004',
    name: '曼苏尔面粉专营代销社',
    agentType: '面粉',
    province: '巴格达省',
    address: '巴格达市曼苏尔区第14街',
    storeAreaSqM: 18, // Less than 20 sqm warning for unification
    householdsCount: 520,
    maxCap: 1500,
    status: '待实地检查',
    ownerName: '萨巴赫·卡里姆·努里',
    phone: '+964 772 443 1122',
    lastInspectionScore: 78,
    familyConsentRate: 64
  },
  {
    id: 'AGT-005',
    name: '杜拉大型集中代理所 (拟拆分)',
    agentType: '综合',
    province: '巴格达省',
    address: '巴格达市杜拉区中心广场',
    storeAreaSqM: 120,
    householdsCount: 1680, // Exceeds 1500! Triggering split
    maxCap: 1500,
    status: '正常营业',
    ownerName: '纳齐尔·法鲁克·马吉德',
    phone: '+964 773 990 4455',
    lastInspectionScore: 82,
    familyConsentRate: 74
  }
];

export const INITIAL_APPLICATIONS: RationApplication[] = [
  {
    id: 'APP-2026-001',
    type: '添加新成员',
    familyCardNo: 'RC-10029381',
    applicantName: '艾哈迈德·哈桑·萨利赫',
    phone: '+964 770 123 4567',
    submitDate: '2026-10-08',
    status: '已批准',
    autoApprovalPath: true,
    notes: '新生儿登记: 优素福 (附出生医学证明与国家身份芯片联动)',
    attachments: ['birth_cert_scan_01.jpg', 'nid_chip_record.json'],
    reviewNotes: '系统自动核验通过: 医院出生网签信息比对一致',
    feePaid: true
  },
  {
    id: 'APP-2026-002',
    type: '家庭分户',
    familyCardNo: 'RC-10029381',
    applicantName: '奥马尔·艾哈迈德·哈桑',
    phone: '+964 770 123 9988',
    submitDate: '2026-10-09',
    status: '待经理终审',
    autoApprovalPath: false,
    notes: '新婚分立独立配给卡: 夫妻双方已满法定结婚年龄14周岁 (男16岁，女16岁)，符合民法典与配给署分立条件',
    attachments: ['marriage_contract_official.pdf', 'both_passports.pdf'],
    reviewNotes: '分部初审员工 (萨米拉·卡西姆): 结婚证与居住证明已核实真实无误，建议签发新配给卡',
    feePaid: true
  },
  {
    id: 'APP-2026-003',
    type: '解冻申请',
    familyCardNo: 'RC-10029382',
    applicantName: '穆罕默德·贾西姆·卡齐姆',
    phone: '+964 780 987 6543',
    submitDate: '2026-10-09',
    status: '待分部初审',
    autoApprovalPath: false,
    notes: '因税务局误报月薪提出申诉: 实为项目退税款非固定高月薪，已上传劳动部正式薪资明细单',
    attachments: ['salary_slip_official_mo_labor.pdf', 'tax_reconciliation.pdf'],
    reviewNotes: '',
    feePaid: false
  },
  {
    id: 'APP-2026-004',
    type: '代理转移',
    familyCardNo: 'RC-10029383',
    applicantName: '卡万·阿里·拉希德',
    phone: '+964 750 334 1122',
    submitDate: '2026-10-07',
    status: '已批准',
    autoApprovalPath: true,
    notes: '埃尔比勒市内同城跨街道搬迁: 目标代销点 (城堡站) 户数680未满1500上限，省内直接办理',
    attachments: ['lease_contract_2026.pdf'],
    reviewNotes: '系统自动核验通过: 目标代理容量充足 (680/1500)',
    feePaid: true
  }
];

export const INITIAL_ORDERS: PaymentOrder[] = [
  {
    id: 'ORD-2026-9001',
    orderType: '配给业务申请费',
    amount: 2000,
    payerType: '公民',
    payerName: '奥马尔·艾哈迈德·哈桑',
    payerId: 'RC-10029381',
    status: '已完成',
    paymentChannel: '电子支付卡 (Qi Card)',
    createdAt: '2026-10-09 09:20:11',
    paidAt: '2026-10-09 09:21:45',
    receiptNumber: 'REC-IQD-2026-0091823'
  },
  {
    id: 'ORD-2026-9002',
    orderType: '代理资质设立费',
    amount: 250000,
    payerType: '配给代理',
    payerName: '塔里克·阿齐兹·哈希姆 (AGT-001)',
    payerId: 'AGT-001',
    status: '已完成',
    paymentChannel: '电子钱包 (ZainCash)',
    createdAt: '2026-10-08 14:10:00',
    paidAt: '2026-10-08 14:12:30',
    receiptNumber: 'REC-IQD-2026-0087712'
  },
  {
    id: 'ORD-2026-9003',
    orderType: '配给业务申请费',
    amount: 2000,
    payerType: '公民',
    payerName: '穆罕默德·贾西姆·卡齐姆',
    payerId: 'RC-10029382',
    status: '待支付',
    createdAt: '2026-10-09 18:30:00'
  },
  {
    id: 'ORD-2026-9004',
    orderType: '代理在线采购配给',
    amount: 14500000,
    payerType: '配给代理',
    payerName: '卡拉达第一配给分销中心 (AGT-001)',
    payerId: 'AGT-001',
    status: '已完成',
    paymentChannel: '电子支付卡 (Qi Card)',
    createdAt: '2026-10-05 10:00:00',
    paidAt: '2026-10-05 10:04:12',
    receiptNumber: 'REC-IQD-2026-0078129'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    recipientRole: '公民',
    channel: '双通道',
    title: '【配给到货】2026年10月份第四批食品配给已运抵代销点',
    content: '尊敬的艾哈迈德先生：您家庭所属的配给物资（精制小麦粉45kg、长粒大米15kg、白糖10kg、葵花籽油5L）已运抵卡拉达第一分销中心。请于10月10日至10月25日期间凭电子配给卡前往领取。',
    timestamp: '2026-10-09 08:30',
    status: '已送达',
    isRead: false
  },
  {
    id: 'NOTIF-02',
    recipientRole: '公民',
    channel: '短信通道',
    title: '【账户下发】您的数字配给卡开户成功短信通知',
    content: '【伊拉克贸易部食品配给署】恭喜您开户成功！新配给卡号为：RC-10029381，初始安全密码已激活，请妥善保管或在移动应用中修改。',
    timestamp: '2026-10-08 11:20',
    status: '已送达',
    isRead: true
  },
  {
    id: 'NOTIF-03',
    recipientRole: '配给代理',
    channel: '应用内通知',
    title: '【领料通知】10月份第三批中央粮仓调拨入库已就绪',
    content: '致卡拉达第一分销点：您的配货单 (OUT-2026-1002) 计划于10月11日09:00由中央第二仓库直运发车，请安排仓管人员验收盖章。',
    timestamp: '2026-10-09 14:15',
    status: '已送达',
    isRead: false
  },
  {
    id: 'NOTIF-04',
    recipientRole: '公民',
    channel: '应用内通知',
    title: '【审批进度】您的家庭分户申请已完成分部初审',
    content: '您的家庭分户业务申请 (APP-2026-002) 已通过分部初审，正流转至规划与跟进司分部经理做终审签发。',
    timestamp: '2026-10-09 17:02',
    status: '已送达',
    isRead: true
  }
];

export const INITIAL_CROSS_CHECK_TASKS: CrossCheckTask[] = [
  {
    id: 'TASK-CC-01',
    targetAgency: '内政部公民身份与死亡库',
    checkType: '定期全量',
    lastRun: '2026-10-09 02:00:00',
    discrepancyCount: 14,
    status: '已生成差异清单'
  },
  {
    id: 'TASK-CC-02',
    targetAgency: '国家税务总局高收入库',
    checkType: '定期全量',
    lastRun: '2026-10-08 23:00:00',
    discrepancyCount: 28,
    status: '已生成差异清单'
  },
  {
    id: 'TASK-CC-03',
    targetAgency: '边境与出入境管理局',
    checkType: '事件触发',
    lastRun: '2026-10-09 06:30:00',
    discrepancyCount: 6,
    status: '已生成差异清单'
  },
  {
    id: 'TASK-CC-04',
    targetAgency: '商会与企业登记局',
    checkType: '定期全量',
    lastRun: '2026-10-07 18:00:00',
    discrepancyCount: 11,
    status: '就绪'
  }
];

export const INITIAL_DISCREPANCIES: DiscrepancyItem[] = [
  {
    id: 'DISC-01',
    rationCardNo: 'RC-10029382',
    personName: '穆罕默德·贾西姆·卡齐姆',
    nationalId: 'NID-1976050911',
    discrepancyType: '高收入未冻结',
    externalAgencyData: '国税总局2026年Q3申报月收入: 3,200,000 IQD (超配给上限1,500,000 IQD)',
    systemActionAdvice: '建议立即冻结',
    handledStatus: '已执行冻结'
  },
  {
    id: 'DISC-02',
    rationCardNo: 'RC-99021884',
    personName: '拉希姆·哈迪·朱马',
    nationalId: 'NID-1945100288',
    discrepancyType: '死亡未注销',
    externalAgencyData: '民政民籍系统登记死亡时间: 2026-08-14, 死亡证明编号: D-2026-08819',
    systemActionAdvice: '建议立即冻结',
    handledStatus: '待处理'
  },
  {
    id: 'DISC-03',
    rationCardNo: 'RC-88192301',
    personName: '萨巴赫·纳吉·卡米勒',
    nationalId: 'NID-1983021944',
    discrepancyType: '长期境外旅行',
    externalAgencyData: '边境出入境记录: 离境已连续满9个月未归 (入境地: 约旦安曼)',
    systemActionAdvice: '建议暂停配给',
    handledStatus: '待处理'
  },
  {
    id: 'DISC-04',
    rationCardNo: 'RC-77291044',
    personName: '阿卜杜勒·瓦希德·法赫德',
    nationalId: 'NID-1979061109',
    discrepancyType: '商业公司法人未申报',
    externalAgencyData: '商会工商注册: 巴格达天际贸易有限公司 控股法人 (注册资本5亿第纳尔)',
    systemActionAdvice: '建议立即冻结',
    handledStatus: '待处理'
  }
];

export const INITIAL_WAREHOUSE_STOCKS: WarehouseStockItem[] = [
  {
    id: 'STK-01',
    skuCode: 'SKU-FLOUR-GRADE1',
    commodityName: '精制小麦粉',
    warehouseName: '中央粮食第一战略储备库 (巴格达北)',
    batchNumber: 'BATCH-2026-W091',
    quantityTons: 1250.0,
    allocatedTons: 980.0,
    availableTons: 270.0,
    productionDate: '2026-08-15',
    expiryDate: '2027-08-14',
    status: '正常在库'
  },
  {
    id: 'STK-02',
    skuCode: 'SKU-RICE-LONGGRAIN',
    commodityName: '长粒大米',
    warehouseName: '中央粮食第一战略储备库 (巴格达北)',
    batchNumber: 'BATCH-2026-R044',
    quantityTons: 850.0,
    allocatedTons: 600.0,
    availableTons: 250.0,
    productionDate: '2026-07-20',
    expiryDate: '2028-07-19',
    status: '正常在库'
  },
  {
    id: 'STK-03',
    skuCode: 'SKU-SUGAR-REFINED',
    commodityName: '食用白砂糖',
    warehouseName: '南部粮食分储库 (巴士拉港区)',
    batchNumber: 'BATCH-2026-S102',
    quantityTons: 420.0,
    allocatedTons: 350.0,
    availableTons: 70.0,
    productionDate: '2026-09-01',
    expiryDate: '2028-08-31',
    status: '正常在库'
  },
  {
    id: 'STK-04',
    skuCode: 'SKU-OIL-SUNFLOWER',
    commodityName: '精炼葵花籽油',
    warehouseName: '北部粮食分储库 (埃尔比勒)',
    batchNumber: 'BATCH-2026-O089',
    quantityTons: 310.0,
    allocatedTons: 240.0,
    availableTons: 70.0,
    productionDate: '2026-08-30',
    expiryDate: '2027-08-29',
    status: '正常在库'
  }
];

export const INITIAL_WAREHOUSE_FLOWS: WarehouseFlowOrder[] = [
  {
    id: 'FLOW-IN-8801',
    type: '采购验收入库',
    fromLocation: '国家粮食进出口总局 (南欧采购批次)',
    toLocation: '中央粮食第一战略储备库 (巴格达北)',
    commodityName: '精制小麦粉',
    batchNumber: 'BATCH-2026-W091',
    quantityTons: 500.0,
    carrier: '伊拉克国家铁路粮运特车队',
    status: '已完成',
    createdAt: '2026-10-06 11:30'
  },
  {
    id: 'FLOW-OUT-8802',
    type: '配送出库',
    fromLocation: '中央粮食第一战略储备库',
    toLocation: '卡拉达第一配给分销中心 (AGT-001)',
    commodityName: '精制小麦粉 / 长粒大米',
    batchNumber: 'BATCH-2026-W091',
    quantityTons: 28.5,
    carrier: '巴格达城市冷链配送3号车',
    status: '已完成',
    createdAt: '2026-10-08 09:15'
  },
  {
    id: 'FLOW-TR-8803',
    type: '仓库间调拨',
    fromLocation: '中央粮食第一战略储备库',
    toLocation: '南部粮食分储库 (巴士拉港区)',
    commodityName: '食用白砂糖',
    batchNumber: 'BATCH-2026-S102',
    quantityTons: 50.0,
    carrier: '跨省直运物流挂车',
    status: '在途中',
    createdAt: '2026-10-09 10:45'
  }
];

export const INITIAL_FRAUD_ALERTS: FraudAlertItem[] = [
  {
    id: 'ALERT-FR-001',
    alertType: '一人多卡识别',
    level: '高级',
    targetEntity: '居民：塔哈·阿卜杜勒·拉赫曼 (NID-1982051189)',
    riskScore: 97,
    description: '同一国家身份编号与相同指纹/面部特征，在巴格达与安巴尔省分别登记有RC-109923与RC-308812两张有效配给卡',
    detectionRule: 'RULE-ID-UNIQUENESS-CROSS-PROVINCE',
    status: '待工单派发',
    timestamp: '2026-10-09 15:40:22'
  },
  {
    id: 'ALERT-FR-002',
    alertType: '代理分发短缺预警',
    level: '高级',
    targetEntity: '代理：阿沙尔粮食综合代销点 (AGT-002)',
    riskScore: 92,
    description: '连续3天市民投诉缺粮登记超18起，进销存比对发现库出25吨而实际公民核销记录仅16吨，疑似截留9吨配给粮',
    detectionRule: 'RULE-AGENT-SHORTAGE-AND-DISCREPANCY',
    status: '核实处理中',
    timestamp: '2026-10-09 11:20:00'
  },
  {
    id: 'ALERT-FR-003',
    alertType: '死亡未销卡冒领',
    level: '中级',
    targetEntity: '配给卡：RC-99021884 (已故人员：拉希姆·哈迪)',
    riskScore: 84,
    description: '民政系统死亡记录已注销达55天，本月系统仍产生代领物品打卡事件',
    detectionRule: 'RULE-DECEASED-CLAIM-PREVENTION',
    status: '待工单派发',
    timestamp: '2026-10-09 09:15:33'
  },
  {
    id: 'ALERT-FR-004',
    alertType: '异常高频盗领',
    level: '中级',
    targetEntity: '配给卡：RC-66120934 (领物人：卡西姆·哈希姆)',
    riskScore: 78,
    description: '同月内分别在相隔45公里的3家不同代理点尝试读卡申领油粮配额',
    detectionRule: 'RULE-ABNORMAL-FREQUENCY-GEO-CLUSTER',
    status: '已闭环解决',
    timestamp: '2026-10-08 17:04:10'
  }
];

export const INITIAL_AI_KNOWLEDGE = [
  {
    id: 'K-01',
    category: '政策法律',
    title: '伊拉克配给卡家庭分户法定条件及年龄标准',
    content: '依据伊拉克贸易部食品配给署第42号法令与民法典规定，新婚分户单独签发电子配给卡时，夫妻双方须均已年满14周岁；须提供正式法院/宗教审判庭签发之有效结婚证书，并提交独立居住证明。',
    source: '《伊拉克内阁关于国家食品配给网数字化转型实施细则》第14条'
  },
  {
    id: 'K-02',
    category: '代理商规程',
    title: '配给代理点户数上限及拆分、合并管控细则',
    content: '每一食品配给代理点与面粉代理点所服务家庭户数上限严格控制在1500户以内，达到或超过1500户由联合委员会会同部长启动拆分程序；两家代理合并时，合并后总户数严禁超过750户；食品与面粉统一经营时代销营业场所面积不得小于20平方米。',
    source: '《全国配给代销网点设立、拆分与资质管理办法》第22-26条'
  },
  {
    id: 'K-03',
    category: '收费标准',
    title: '配给业务电子化申请及代理资质官方规费',
    content: '各项公民业务在线电子申请规费为 2,000 伊拉克第纳尔 (IQD)；新设立、注销再授予、食品面粉统营合并、大型网点拆分之代理权核准规费为 250,000 IQD；亲属轮替继承规费为 50,000 IQD。',
    source: '《贸易部财务与规划司官方收费核准批件(2025/110号)》'
  },
  {
    id: 'K-04',
    category: '配给管控',
    title: '食品配给资格冻结与解冻申请审核流程',
    content: '凡月收入超过150万第纳尔之公职或高薪人员、已故未报人员、连续境外旅行出境超6个月者、登记为商业公司实控法人者，系统将自动列入冻结名单。商业注销证明可在线直批解冻；收入申诉需上传劳动与社会事务部有效薪资证明并经分部经理电子终审。',
    source: '《跨部门反冒领与配给精准化管控联席备忘录》'
  }
];

export const INITIAL_SCIENCE_INSPECTIONS = [
  {
    id: 'LAB-2026-001',
    commodity: '精制小麦粉' as const,
    pubchemCid: 5462224,
    chemicalFormula: 'C20H32N4O7 (Glutenin Component)',
    batchNumber: 'WF-BAG-20261001-A',
    moisturePercent: 13.1, // standard <= 14.0%
    glutenPercent: 26.8, // standard >= 24.0%
    acidValueMgKoh: 0.12, // standard <= 0.20
    aflatoxinB1Ppb: 0.0, // undetected
    inspectionVerdict: '合格 (准予调拨配发)' as const,
    inspectorName: '扎伊德·卡西姆博士 (理化生化室主任)',
    labTechnique: '高效液相色谱 (HPLC) & 近红外快速定硫分析仪',
    createdAt: '2026-10-08 09:30:00'
  },
  {
    id: 'LAB-2026-002',
    commodity: '精炼葵花籽油' as const,
    pubchemCid: 5280450,
    chemicalFormula: 'C18H32O2 (Linoleic Acid Ester)',
    batchNumber: 'CO-BAS-20260928-B',
    moisturePercent: 0.08,
    glutenPercent: 0.0,
    acidValueMgKoh: 0.15, // standard <= 0.20
    aflatoxinB1Ppb: 0.0,
    inspectionVerdict: '合格 (准予调拨配发)' as const,
    inspectorName: '玛丽亚姆·穆斯塔法工程师',
    labTechnique: '气相色谱-质谱联用 (GC-MS) & 紫外分光光度计',
    createdAt: '2026-10-08 14:15:00'
  },
  {
    id: 'LAB-2026-003',
    commodity: '食用白砂糖' as const,
    pubchemCid: 5988,
    chemicalFormula: 'C12H22O11 (Pure D-Sucrose)',
    batchNumber: 'SU-NAJ-20261002-C',
    moisturePercent: 0.04,
    glutenPercent: 0.0,
    acidValueMgKoh: 0.05,
    aflatoxinB1Ppb: 0.0,
    inspectionVerdict: '合格 (准予调拨配发)' as const,
    inspectorName: '阿里·哈桑分析员',
    labTechnique: '自动旋光仪旋光度标定 (比旋度 ≥ +66.5°)',
    createdAt: '2026-10-09 11:20:00'
  },
  {
    id: 'LAB-2026-004',
    commodity: '长粒大米' as const,
    pubchemCid: 5755,
    chemicalFormula: '(C6H10O5)n (Amylose/Amylopectin)',
    batchNumber: 'RC-MOS-20260930-D',
    moisturePercent: 14.8, // standard <= 14.5% -> Warning trigger
    glutenPercent: 0.0,
    acidValueMgKoh: 0.22,
    aflatoxinB1Ppb: 1.2,
    inspectionVerdict: '警示 (双人复测)' as const,
    inspectorName: '萨巴赫·拉希德研究员',
    labTechnique: '酶联免疫吸附测定 (ELISA) 真菌毒素定量筛查',
    createdAt: '2026-10-09 16:40:00'
  }
];

export const INITIAL_SYSTEM_CONFIG: SystemConfigParameters = {
  agentHouseholdMaxCap: 1500, // 代理商户数上限 (1500户拆分)
  agentMergeMaxCap: 750, // 代理商合并户数上限 (750户)
  agentMinAreaSqM: 20, // 食品面粉统营最小营业面积 (20㎡)
  marriageMinAgeYears: 14, // 夫妻分户最低法定年龄 (14周岁)
  citizenApplicationFeeIqd: 2000, // 公民常规电子申请规费 (2,000 IQD)
  agentLicenseFeeIqd: 250000, // 代理商设立/统营牌照费 (250,000 IQD)
  agentInheritanceFeeIqd: 50000, // 代理商直系继承规费 (50,000 IQD)
  salaryFreezeThresholdIqd: 1500000, // 高薪冻结月薪阈值 (150万 IQD)
  outOfCountryFreezeMonths: 6 // 连续离境冻结月份 (6个月)
};

export const INITIAL_MANAGEABLE_USERS: ManageableUser[] = [
  {
    id: 'USR-001',
    uid: 'officer-iraq-8019',
    displayName: '塔里克·卡西姆配给督察官',
    email: 'inspector@ration.gov.iq',
    role: 'admin',
    province: '巴格达省 (Baghdad)',
    department: '贸易部配给总局 · 数字化中心',
    status: '正常',
    lastLogin: '2026-10-09 21:05:12',
    createdAt: '2025-01-15'
  },
  {
    id: 'USR-002',
    uid: 'user-ahmed-salih',
    displayName: '艾哈迈德·哈桑·萨利赫',
    email: 'ahmed.salih@gmail.com',
    role: 'citizen',
    province: '巴格达省 (Baghdad)',
    department: '个人家庭用户',
    status: '正常',
    lastLogin: '2026-10-09 19:42:00',
    createdAt: '2025-03-20'
  },
  {
    id: 'USR-003',
    uid: 'agent-tariq-karrada',
    displayName: '塔里克·阿齐兹·哈希姆 (代销商)',
    email: 'agent.karrada@ration.gov.iq',
    role: 'agent',
    province: '巴格达省 (Baghdad)',
    department: '卡拉达第一配给分销中心 (AGT-001)',
    status: '正常',
    lastLogin: '2026-10-09 20:15:33',
    createdAt: '2025-02-10'
  },
  {
    id: 'USR-004',
    uid: 'auditor-zayd-qasim',
    displayName: '扎伊德·卡西姆博士 (国家质检主任)',
    email: 'dr.zayd@lab.ration.gov.iq',
    role: 'auditor',
    province: '巴格达省 (Baghdad)',
    department: '粮食储备生化质检室 / 外部审计司',
    status: '正常',
    lastLogin: '2026-10-09 18:30:19',
    createdAt: '2025-01-20'
  },
  {
    id: 'USR-005',
    uid: 'user-layla-basra',
    displayName: '莱拉·法鲁克·海达尔',
    email: 'layla.haidar@yahoo.com',
    role: 'citizen',
    province: '巴士拉省 (Basra)',
    department: '个人家庭用户',
    status: '已冻结',
    lastLogin: '2026-10-05 14:11:05',
    createdAt: '2025-04-12'
  }
];

export const INITIAL_ROLE_PERMISSIONS: RolePermissionDefinition[] = [
  {
    roleId: 'citizen',
    roleName: '公民个人 (Citizen)',
    description: '数字配给卡持有人，具备家庭成员查看、自核申报、分户申请与到货查询权限',
    permissions: [
      { systemId: 'citizenFamily', systemName: '公民与家庭管理', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'rationing', systemName: '配给业务办理', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'identity', systemName: '身份生物识别', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'agentMgmt', systemName: '代理商管理', canRead: true, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'ePayment', systemName: '电子规费支付', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'notification', systemName: '到货短信通知', canRead: true, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'crossVerify', systemName: '跨部门核验', canRead: false, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'warehouse', systemName: '国家仓储物流', canRead: false, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'operations', systemName: '行政与科室审批', canRead: false, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'mobileApp', systemName: '移动端App', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'aiBigData', systemName: 'Gemini智能导办', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'configMgmt', systemName: '系统配置管理', canRead: false, canWrite: false, canApprove: false, canAudit: false }
    ]
  },
  {
    roleId: 'agent',
    roleName: '配给代理商 (Distributor)',
    description: '特许代销网点，具备扫码核销、发料记账、网点资质牌照与到货签收权限',
    permissions: [
      { systemId: 'citizenFamily', systemName: '公民与家庭管理', canRead: true, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'rationing', systemName: '配给业务办理', canRead: true, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'identity', systemName: '身份生物识别', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'agentMgmt', systemName: '代理商管理', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'ePayment', systemName: '电子规费支付', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'notification', systemName: '到货短信通知', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'crossVerify', systemName: '跨部门核验', canRead: false, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'warehouse', systemName: '国家仓储物流', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'operations', systemName: '行政与科室审批', canRead: false, canWrite: false, canApprove: false, canAudit: false },
      { systemId: 'mobileApp', systemName: '移动端App', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'aiBigData', systemName: 'Gemini智能导办', canRead: true, canWrite: true, canApprove: false, canAudit: false },
      { systemId: 'configMgmt', systemName: '系统配置管理', canRead: false, canWrite: false, canApprove: false, canAudit: false }
    ]
  },
  {
    roleId: 'admin',
    roleName: '系统管理员 (Administrator)',
    description: '国家贸易部总局管理员，掌控全系统125项功能配置、审批流、服务端口与用户管理',
    permissions: [
      { systemId: 'citizenFamily', systemName: '公民与家庭管理', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'rationing', systemName: '配给业务办理', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'identity', systemName: '身份生物识别', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'agentMgmt', systemName: '代理商管理', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'ePayment', systemName: '电子规费支付', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'notification', systemName: '到货短信通知', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'crossVerify', systemName: '跨部门核验', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'warehouse', systemName: '国家仓储物流', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'operations', systemName: '行政与科室审批', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'mobileApp', systemName: '移动端App', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'aiBigData', systemName: 'Gemini智能导办', canRead: true, canWrite: true, canApprove: true, canAudit: true },
      { systemId: 'configMgmt', systemName: '系统配置管理', canRead: true, canWrite: true, canApprove: true, canAudit: true }
    ]
  },
  {
    roleId: 'auditor',
    roleName: '监督审计官 (Auditor / Inspector)',
    description: '外部法纪监察与食品生化质检专员，具备全量溯源、反欺诈排查与生化质检录入权限',
    permissions: [
      { systemId: 'citizenFamily', systemName: '公民与家庭管理', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'rationing', systemName: '配给业务办理', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'identity', systemName: '身份生物识别', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'agentMgmt', systemName: '代理商管理', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'ePayment', systemName: '电子规费支付', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'notification', systemName: '到货短信通知', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'crossVerify', systemName: '跨部门核验', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'warehouse', systemName: '国家仓储物流', canRead: true, canWrite: true, canApprove: false, canAudit: true },
      { systemId: 'operations', systemName: '行政与科室审批', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'mobileApp', systemName: '移动端App', canRead: true, canWrite: false, canApprove: false, canAudit: true },
      { systemId: 'aiBigData', systemName: 'Gemini智能导办', canRead: true, canWrite: true, canApprove: false, canAudit: true },
      { systemId: 'configMgmt', systemName: '系统配置管理', canRead: true, canWrite: false, canApprove: false, canAudit: true }
    ]
  }
];

