// 监督官 (Admin) 后台管理专属 Mock 数据

export const MOCK_CITIZEN_CARDS = [
  {
    id: 'CARD-10029381',
    cardNo: 'RC-10029381',
    headName: '艾哈迈德·哈桑·萨利赫',
    nationalId: 'IQ-1980-0419-8271',
    phone: '+964 780 123 4567',
    province: '巴格达省',
    district: '卡尔赫区 (Al-Karkh)',
    memberCount: 5,
    status: '正常',
    freezeReason: '',
    quotas: { flour: 45, rice: 15, oil: 6, sugar: 4 },
    lastVerifiedAt: '2026-03-28 10:15',
    issueDate: '2024-01-15',
    rfidChipUid: 'NFC-IQ-8829104A'
  },
  {
    id: 'CARD-10029382',
    cardNo: 'RC-10029382',
    headName: '海德尔·阿卜杜勒·拉赫曼',
    nationalId: 'IQ-1975-1102-3392',
    phone: '+964 771 992 8831',
    province: '巴格达省',
    district: '鲁萨法区 (Al-Rusafa)',
    memberCount: 4,
    status: '已冻结',
    freezeReason: '连续3个月未进行居民生物特征年度核验',
    quotas: { flour: 36, rice: 12, oil: 4.8, sugar: 3.2 },
    lastVerifiedAt: '2025-12-10 14:20',
    issueDate: '2023-06-11',
    rfidChipUid: 'NFC-IQ-9102482B'
  },
  {
    id: 'CARD-10034820',
    cardNo: 'RC-10034820',
    headName: '法蒂玛·扎赫拉·穆罕默德',
    nationalId: 'IQ-1988-0814-7719',
    phone: '+964 750 443 1122',
    province: '巴士拉省',
    district: '阿沙尔区 (Al-Ashar)',
    memberCount: 3,
    status: '正常',
    freezeReason: '',
    quotas: { flour: 27, rice: 9, oil: 3.6, sugar: 2.4 },
    lastVerifiedAt: '2026-04-01 09:30',
    issueDate: '2024-03-20',
    rfidChipUid: 'NFC-IQ-1102938C'
  },
  {
    id: 'CARD-10041928',
    cardNo: 'RC-10041928',
    headName: '奥马尔·法鲁克·哈利勒',
    nationalId: 'IQ-1969-0220-4491',
    phone: '+964 782 556 7788',
    province: '尼尼微省',
    district: '摩苏尔老城区 (Old Mosul)',
    memberCount: 6,
    status: '审核中',
    freezeReason: '涉及户主离世遗产继承与新任法定户主任命申请',
    quotas: { flour: 54, rice: 18, oil: 7.2, sugar: 4.8 },
    lastVerifiedAt: '2026-02-14 11:45',
    issueDate: '2023-09-05',
    rfidChipUid: 'NFC-IQ-3394817D'
  },
  {
    id: 'CARD-10052910',
    cardNo: 'RC-10052910',
    headName: '优素福·易卜拉欣·卡西姆',
    nationalId: 'IQ-1992-0518-9921',
    phone: '+964 773 221 4455',
    province: '埃尔比勒省',
    district: '安卡瓦区 (Ainkawa)',
    memberCount: 2,
    status: '正常',
    freezeReason: '',
    quotas: { flour: 18, rice: 6, oil: 2.4, sugar: 1.6 },
    lastVerifiedAt: '2026-03-19 16:22',
    issueDate: '2025-02-01',
    rfidChipUid: 'NFC-IQ-7728190E'
  }
];

export const MOCK_FAMILIES_ADMIN = [
  {
    id: 'FAM-BAG-001',
    familyCode: 'FAM-BAG-10029',
    cardNo: 'RC-10029381',
    headName: '艾哈迈德·哈桑·萨利赫',
    headNationalId: 'IQ-1980-0419-8271',
    category: '普通保障家庭',
    memberCount: 5,
    address: '巴格达省卡尔赫区曼苏尔街区14号院',
    registeredDate: '2024-01-15',
    adminBranch: '卡尔赫第一粮食供应分部',
    phone: '+964 780 123 4567',
    members: [
      { id: 'm-01', name: '艾哈迈德·哈桑·萨利赫', relation: '户主', nationalId: 'IQ-1980-0419-8271', birthDate: '1980-04-19', gender: '男', isFrozen: false },
      { id: 'm-02', name: '法蒂玛·扎赫拉·侯赛因', relation: '配偶', nationalId: 'IQ-1984-0712-9921', birthDate: '1984-07-12', gender: '女', isFrozen: false },
      { id: 'm-03', name: '扎伊德·艾哈迈德·萨利赫', relation: '长子', nationalId: 'IQ-2006-1103-4412', birthDate: '2006-11-03', gender: '男', isFrozen: false },
      { id: 'm-04', name: '玛利亚姆·艾哈迈德·萨利赫', relation: '次女', nationalId: 'IQ-2010-0218-3382', birthDate: '2010-02-18', gender: '女', isFrozen: false },
      { id: 'm-05', name: '优素福·艾哈迈德·萨利赫', relation: '幼子', nationalId: 'IQ-2015-0909-1120', birthDate: '2015-09-09', gender: '男', isFrozen: false }
    ]
  },
  {
    id: 'FAM-BAG-002',
    familyCode: 'FAM-BAG-10030',
    cardNo: 'RC-10029382',
    headName: '海德尔·阿卜杜勒·拉赫曼',
    headNationalId: 'IQ-1975-1102-3392',
    category: '特困供养家庭',
    memberCount: 4,
    address: '巴格达省鲁萨法区萨德尔城32号',
    registeredDate: '2023-06-11',
    adminBranch: '鲁萨法第二粮食供应分部',
    phone: '+964 771 992 8831',
    members: [
      { id: 'm-11', name: '海德尔·阿卜杜勒·拉赫曼', relation: '户主', nationalId: 'IQ-1975-1102-3392', birthDate: '1975-11-02', gender: '男', isFrozen: true },
      { id: 'm-12', name: '莱拉·萨米尔', relation: '配偶', nationalId: 'IQ-1979-0520-2219', birthDate: '1979-05-20', gender: '女', isFrozen: true },
      { id: 'm-13', name: '穆斯塔法·海德尔', relation: '长子', nationalId: 'IQ-2005-0814-6621', birthDate: '2005-08-14', gender: '男', isFrozen: true },
      { id: 'm-14', name: '萨拉·海德尔', relation: '长女', nationalId: 'IQ-2009-1201-8843', birthDate: '2009-12-01', gender: '女', isFrozen: true }
    ]
  },
  {
    id: 'FAM-BAS-001',
    familyCode: 'FAM-BAS-20018',
    cardNo: 'RC-10034820',
    headName: '法蒂玛·扎赫拉·穆罕默德',
    headNationalId: 'IQ-1988-0814-7719',
    category: '优抚保障家庭',
    memberCount: 3,
    address: '巴士拉省阿沙尔区海滨路8号',
    registeredDate: '2024-03-20',
    adminBranch: '巴士拉港口配给保障站',
    phone: '+964 750 443 1122',
    members: [
      { id: 'm-21', name: '法蒂玛·扎赫拉·穆罕默德', relation: '户主', nationalId: 'IQ-1988-0814-7719', birthDate: '1988-08-14', gender: '女', isFrozen: false },
      { id: 'm-22', name: '哈桑·阿里·穆罕默德', relation: '长子', nationalId: 'IQ-2012-0311-5521', birthDate: '2012-03-11', gender: '男', isFrozen: false },
      { id: 'm-23', name: '努尔·阿里·穆罕默德', relation: '长女', nationalId: 'IQ-2016-1025-7734', birthDate: '2016-10-25', gender: '女', isFrozen: false }
    ]
  }
];

export const MOCK_AGENTS_ADMIN = [
  {
    id: 'AGT-001',
    code: 'FA-00128',
    name: '巴格达第一综合粮食代销中心',
    manager: '穆罕默德·贾巴尔',
    phone: '+964 770 123 4567',
    province: '巴格达省',
    district: '卡尔赫区曼苏尔街区',
    address: '曼苏尔商业街45号附1号',
    status: '正常营业',
    rating: 5,
    servedHouseholds: 1250,
    storageCapacity: 80, // 吨
    lastInspectedAt: '2026-03-25'
  },
  {
    id: 'AGT-002',
    code: 'FA-00256',
    name: '鲁萨法中央粮油惠民代销站',
    manager: '塔里克·阿齐兹',
    phone: '+964 771 234 5678',
    province: '巴格达省',
    district: '鲁萨法区萨德尔城',
    address: '解放广场东侧第3惠民服务站',
    status: '正常营业',
    rating: 4,
    servedHouseholds: 2100,
    storageCapacity: 120,
    lastInspectedAt: '2026-03-20'
  },
  {
    id: 'AGT-003',
    code: 'FA-00389',
    name: '卡拉达半岛应急粮食代发点',
    manager: '萨拉赫·丁·穆辛',
    phone: '+964 780 345 6789',
    province: '巴格达省',
    district: '卡拉达区',
    address: '卡拉达内街88号',
    status: '停业整顿',
    rating: 2,
    servedHouseholds: 680,
    storageCapacity: 45,
    lastInspectedAt: '2026-03-12'
  },
  {
    id: 'AGT-004',
    code: 'FA-00412',
    name: '阿沙尔滨海配给代销合作社',
    manager: '瓦利德·哈立德',
    phone: '+964 750 456 7890',
    province: '巴士拉省',
    district: '阿沙尔区',
    address: '滨海大道粮油保障大楼A座',
    status: '正常营业',
    rating: 5,
    servedHouseholds: 1850,
    storageCapacity: 100,
    lastInspectedAt: '2026-04-02'
  }
];

export const MOCK_WAREHOUSES_ADMIN = [
  {
    id: 'WH-01',
    code: 'WH-BAG-01',
    name: '巴格达第一国家储备粮库 (中心总仓)',
    type: '战略储备总仓',
    province: '巴格达省',
    center: '卡尔赫第一粮食供应分部',
    capacity: 160000,
    currentStock: 148500,
    manager: '阿卜杜勒·哈基姆',
    phone: '+964 780 998 1122',
    status: '正常运转',
    address: '巴格达卡尔赫区工业保供园1号'
  },
  {
    id: 'WH-02',
    code: 'WH-BAG-02',
    name: '卡尔赫面粉战略储备仓',
    type: '区域中心仓',
    province: '巴格达省',
    center: '卡尔赫第一粮食供应分部',
    capacity: 110000,
    currentStock: 98200,
    manager: '卡西姆·纳吉',
    phone: '+964 771 883 2233',
    status: '正常运转',
    address: '卡尔赫曼苏尔储备大街5号'
  },
  {
    id: 'WH-03',
    code: 'WH-BAG-03',
    name: '鲁萨法物资配送总站 (枢纽前置仓)',
    type: '枢纽前置仓',
    province: '巴格达省',
    center: '鲁萨法第二粮食供应分部',
    capacity: 75000,
    currentStock: 69400,
    manager: '拉希德·萨利赫',
    phone: '+964 782 119 3344',
    status: '正常运转',
    address: '鲁萨法萨德尔城东侧调拨物流港'
  },
  {
    id: 'WH-04',
    code: 'WH-BAS-01',
    name: '巴士拉海港战略粮油保供总仓',
    type: '战略储备总仓',
    province: '巴士拉省',
    center: '巴士拉港口配给保障站',
    capacity: 120000,
    currentStock: 113000,
    manager: '瓦利德·法鲁克',
    phone: '+964 750 443 8899',
    status: '正常运转',
    address: '乌姆盖斯尔深水港粮油专用码头库区'
  },
  {
    id: 'WH-05',
    code: 'WH-MOS-01',
    name: '摩苏尔北区口粮战备储备库',
    type: '区域中心仓',
    province: '尼尼微省',
    center: '摩苏尔老城配给管理中心',
    capacity: 90000,
    currentStock: 82000,
    manager: '萨米尔·马吉德',
    phone: '+964 773 665 7711',
    status: '正常运转',
    address: '摩苏尔西岸工业开发区第7号储备站'
  },
  {
    id: 'WH-06',
    code: 'WH-DIY-01',
    name: '迪亚拉哈奈根前置保供仓 (第140号决议区)',
    type: '应急保供仓',
    province: '迪亚拉省',
    center: '迪亚拉哈奈根前置保供仓服务分部',
    capacity: 35000,
    currentStock: 31200,
    manager: '哈桑·巴吉尔',
    phone: '+964 781 224 5566',
    status: '警戒储备',
    address: '哈奈根边境过境口岸储备基地'
  }
];

