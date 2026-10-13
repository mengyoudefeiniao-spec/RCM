const fs = require('fs');
const path = require('path');

const zhPath = path.resolve('src/locales/zh.js');
const enPath = path.resolve('src/locales/en.js');
const arPath = path.resolve('src/locales/ar.js');
const kuPath = path.resolve('src/locales/ku.js');

const newTranslations = {
  warehouse: {
    inTransitTitle: {
      zh: '在途口粮物资配送追踪与终端扫码核收',
      en: 'In-Transit Ration Distribution Tracking & Delivery Verification',
      ar: 'تتبع توزيع الحصص التموينية أثناء النقل والتحقق من الاستلام',
      ku: 'شوێنپێهەڵگرتنی دابەشکردنی بەشەخۆراک لە ڕێگادا و پشتڕاستکردنەوەی وەرگرتن'
    },
    realtimeSync: {
      zh: '实时同步',
      en: 'Real-Time Sync',
      ar: 'مزامنة فورية',
      ku: 'هاوکاتکردنی ڕاستەوخۆ'
    },
    viewTracking: {
      zh: '在途配送追踪',
      en: 'In-Transit Tracking',
      ar: 'تتبع النقل في الطريق',
      ku: 'شوێنپێهەڵگرتنی گواستنەوە لە ڕێگادا'
    },
    viewReceipt: {
      zh: '网点扫码核收对账',
      en: 'Agent Scan Reconciliation',
      ar: 'مطابقة استلام الوكلاء بالمسح',
      ku: 'هاوسەنگکردنی وەرگرتنی بریکار بە سکان'
    },
    viewDiscrepancy: {
      zh: '差异预警与核查工单',
      en: 'Discrepancy Alerts & Audits',
      ar: 'تنبيهات الفروقات وأوامر التدقيق',
      ku: 'ئاگادارکردنەوەکانی جیاوازی و فەرمانەکانی وردبینی'
    },
    trackingSearchPlaceholder: {
      zh: '搜索交付流水号 / 代理中心 / 承运车队 / 司机',
      en: 'Search Flow No / Center / Fleet / Driver',
      ar: 'البحث عن رقم التدفق / المركز / الأسطول / السائق',
      ku: 'گەڕان بەدوای ژمارەی کارکردن / مەڵبەند / کاروان / شۆفێر'
    },
    trackingStatus: {
      zh: '配送状态',
      en: 'Delivery Status',
      ar: 'حالة التوصيل',
      ku: 'دۆخی گەیاندن'
    },
    statusInTransit: {
      zh: '在途运输中',
      en: 'In-Transit',
      ar: 'قيد النقل',
      ku: 'لە گواستنەوەدایە'
    },
    statusDelivered: {
      zh: '已送达待签收',
      en: 'Delivered (Pending Sign)',
      ar: 'تم التسليم (بانتظار التوقيع)',
      ku: 'گەیشتووە (چاوەڕوانی واژۆیە)'
    },
    statusSigned: {
      zh: '已签收',
      en: 'Signed & Received',
      ar: 'تم الاستلام والتوقيع',
      ku: 'وەرگیراوە و واژۆ کراوە'
    },
    statusDiscrepancy: {
      zh: '签收异常差异',
      en: 'Discrepancy Exception',
      ar: 'اختلاف غير طبيعي في الاستلام',
      ku: 'جیاوازی نائاسایی لە وەرگرتن'
    },
    deliveryFlowNo: {
      zh: '交付流水号',
      en: 'Delivery Flow No.',
      ar: 'رقم تدفق التسليم',
      ku: 'ژمارەی زنجیرەی گەیاندن'
    },
    toAgentCenter: {
      zh: '目的代理网点',
      en: 'Destination Agent Station',
      ar: 'منفذ الوكيل الوجهة',
      ku: 'بنکەی بریکاری مەبەست'
    },
    carrierName: {
      zh: '物流承运车队',
      en: 'Logistics Fleet',
      ar: 'أسطول النقل اللوجستي',
      ku: 'کاروانی گواستنەوەی لۆجستی'
    },
    inTransitAging: {
      zh: '在途时效',
      en: 'Transit Aging',
      ar: 'مدة النقل الفعلي',
      ku: 'ماوەی مانەوە لە گواستنەوە'
    },
    latestTrace: {
      zh: '最新轨迹',
      en: 'Latest Trace',
      ar: 'أحدث مسار',
      ku: 'نوێترین شوێنپێ'
    },
    actualGoodsList: {
      zh: '本期实发口粮物资清单',
      en: 'Issued Ration Commodity List',
      ar: 'قائمة المواد التموينية الفعلية المصروفة',
      ku: 'لیستی کەلوپەلە بەشەخۆراکییە دابەشکراوەکان'
    },
    claimTimestamp: {
      zh: '核销交付时间戳',
      en: 'Claim Timestamp',
      ar: 'الطابع الزمني لصرف الحصة',
      ku: 'کاتی تۆمارکراوی وەرگرتنی بەشەخۆراک'
    },
    cloudSync: {
      zh: '云端同步',
      en: 'Cloud Sync',
      ar: 'مزامنة سحابية',
      ku: 'هاوکاتکردنی هەوری'
    },
    agentStation: {
      zh: '承运核销网点',
      en: 'Contracted Station',
      ar: 'منفذ الصرف المعتمد',
      ku: 'بنکەی پەسەندکراوی وەرگرتن'
    },
    subInbound: {
      zh: '入库质检与建档',
      en: 'Inbound Inspection & Storage',
      ar: 'فحص الجودة والتخزين الوارد',
      ku: 'پشکنینی کوالیتی و کۆگاکردنی هاتوو'
    },
    subOutbound: {
      zh: '出库波次与交付',
      en: 'Outbound Wave & Delivery',
      ar: 'موجات الصرف والتسليم',
      ku: 'دەرکردنی شەپۆلی و گەیاندن'
    },
    subTransfer: {
      zh: '跨库调拨(三段式)',
      en: 'Inter-Warehouse Transfer (3-Stage)',
      ar: 'المناقلة بين المستودعات (ثلاثية المراحل)',
      ku: 'گواستنەوەی نێوان کۆگاکان (سێ قۆناغی)'
    },
    subStocktake: {
      zh: '盘点与存证报损',
      en: 'Stocktake & Loss Evidence',
      ar: 'الجرد وإثبات التلفيات',
      ku: 'ژماردنی کۆگا و تۆماری زەرەروزیان'
    },
    newInbound: {
      zh: '新建收货质检入库',
      en: 'New Inbound Inspection',
      ar: 'إنشاء فحص واستلام وارد جديد',
      ku: 'دروستکردنی پشکنین و وەرگرتنی هاتووی نوێ'
    },
    securityAuditTitle: {
      zh: '安全审计与操作留痕',
      en: 'Security Audit & Traceability Logs',
      ar: 'التدقيق الأمني وسجلات التتبع',
      ku: 'وردبینی ئاسایش و تۆمارەکانی بەدواداچوون'
    },
    multidimTitle: {
      zh: '多维库存与流水台账操作区 (SCM)',
      en: 'Multi-Dimensional Inventory & Ledgers (SCM)',
      ar: 'المخزون متعدد الأبعاد وسجلات القيود (SCM)',
      ku: 'کۆگای فرەڕەهەند و دەفتەرەکانی ژمێریاری (SCM)'
    },
    realtimeInventory: {
      zh: '六维实时库存视图',
      en: '6D Real-Time Inventory',
      ar: 'عرض المخزون الفعلي سداسي الأبعاد',
      ku: 'بینینی کۆگای ڕاستەوخۆی شەش ڕەهەندی'
    },
    ledgerCenter: {
      zh: '流水台账中心 (三级钩稽)',
      en: 'Ledger Center (3-Tier Reconciliation)',
      ar: 'مركز سجلات القيود (المطابقة الثلاثية)',
      ku: 'مەڵبەندی دەفتەرەکان (هاوسەنگکردنی سێ قۆناغی)'
    },
    snapshotRollback: {
      zh: '历史快照时光回溯',
      en: 'Historical Snapshot Rollback',
      ar: 'استرجاع اللقطات التاريخية',
      ku: 'گەڕانەوە بۆ دۆخی تۆمارکراوی پێشوو'
    }
  },
  dashboard: {
    enrolledCitizens: {
      zh: '在册持卡公民',
      en: 'Enrolled Cardholding Citizens',
      ar: 'المواطنون المسجلون حاملو البطاقات',
      ku: 'هاووڵاتیانی تۆمارکراوی خاوەن کارت'
    },
    enrolledFamilies: {
      zh: '建档保障家庭',
      en: 'Registered Protected Households',
      ar: 'الأسر المشمولة المسجلة',
      ku: 'خێزانە تۆمارکراوە پارێزراوەکان'
    },
    contractedAgents: {
      zh: '全国签约代理商',
      en: 'National Contracted Agents',
      ar: 'الوكلاء المعتمدون في عموم البلاد',
      ku: 'بریکارە گرێبەستکراوەکانی سەرتاسەری وڵات'
    },
    actualDistribution: {
      zh: '实际配发总量',
      en: 'Actual Distributed Volume',
      ar: 'إجمالي المواد الموزعة فعلياً',
      ku: 'کۆی گشتی دابەشکراوی ڕاستەقینە'
    },
    complaintEfficiency: {
      zh: '群众投诉与办结',
      en: 'Citizen Complaints & Resolutions',
      ar: 'شكاوى المواطنين والإنجاز',
      ku: 'سکاڵای هاووڵاتیان و چارەسەرکردن'
    },
    citizenDemographics: {
      zh: '公民年龄构成与新增核验走势',
      en: 'Citizen Demographics & Verification Trends',
      ar: 'التركيبة العمرية للمواطنين ومسار التحقق الجديد',
      ku: 'پێکهاتەی تەمەنی هاووڵاتیان و ڕەوتی پشتڕاستکردنەوە'
    },
    familyDistribution: {
      zh: '家庭规模分布与弱势群体占比',
      en: 'Household Size Distribution & Vulnerability Rate',
      ar: 'توزيع حجم الأسر ونسبة الفئات الهشة',
      ku: 'دابەشبوونی قەبارەی خێزان و ڕێژەی توێژە لاوازەکان'
    },
    regionalAgentMap: {
      zh: '各省代理商网点密度与负荷分布',
      en: 'Provincial Agent Density & Workload Distribution',
      ar: 'كثافة منافذ الوكلاء وتوزيع الأحمال حسب المحافظات',
      ku: 'چڕی بنکەکانی بریکار و دابەشبوونی بار بەپێی پارێزگاکان'
    },
    monthlyRationTrend: {
      zh: '月度口粮物资配发走势 (吨)',
      en: 'Monthly Commodity Distribution Trend (Tons)',
      ar: 'مسار توزيع المواد التموينية الشهري (بالطن)',
      ku: 'ڕەوتی دابەشکردنی مانگانەی کەلوپەل (تەن)'
    },
    complaintCategories: {
      zh: '群众投诉类型构成与闭环整改时效',
      en: 'Complaint Categories & Resolution Turnaround',
      ar: 'تصنيفات الشكاوى وسرعة المعالجة والإغلاق',
      ku: 'جۆرەکانی سکاڵا و خێرایی چارەسەرکردن و داخستن'
    }
  },
  agent: {
    applyModalTitle: {
      zh: '申请代理网点经营权 (新准入)',
      en: 'Apply for Ration Agent License (New Entry)',
      ar: 'طلب منح وكالة تموينية جديدة',
      ku: 'داواکاری مۆڵەتی بریکاری بەشەخۆراک (نوێ)'
    },
    rotationModalTitle: {
      zh: '代理权直系亲属依法轮替 (转移)',
      en: 'Agent License Succession & Rotation',
      ar: 'تدوير الوكالة للأقارب من الدرجة الأولى',
      ku: 'گواستنەوەی مۆڵەتی بریکار بۆ خزمانی پلە یەک'
    },
    cancellationModalTitle: {
      zh: '代销经营权自愿或依法注销',
      en: 'Agent License Cancellation & Revocation',
      ar: 'إلغاء الوكالة التموينية طوعياً أو قانونياً',
      ku: 'هەڵوەشاندنەوەی مۆڵەتی بریکاری بە خواستی خۆ یان یاسایی'
    },
    restorationModalTitle: {
      zh: '已注销代理权依法申诉恢复',
      en: 'Agent License Reinstatement Appeal',
      ar: 'طلب استعادة وكالة تموينية ملغاة',
      ku: 'داواکاری گەڕاندنەوەی مۆڵەتی بریکاری هەڵوەشاوە'
    },
    agentName: {
      zh: '代理人姓名',
      en: 'Agent Name',
      ar: 'اسم الوكيل',
      ku: 'ناوی بریکار'
    },
    nationalId: {
      zh: '国民身份证号 (National ID)',
      en: 'National ID',
      ar: 'الرقم الوطني الموحد',
      ku: 'ژمارەی ناسنامەی نیشتمانی'
    },
    contactPhone: {
      zh: '联系电话',
      en: 'Contact Phone',
      ar: 'رقم الهاتف للتواصل',
      ku: 'ژمارەی مۆبایل'
    },
    targetProvince: {
      zh: '所属行政省份',
      en: 'Province',
      ar: 'المحافظة',
      ku: 'پارێزگا'
    },
    targetCenter: {
      zh: '归属配给中心',
      en: 'Ration Center',
      ar: 'مركز التموين',
      ku: 'مەڵبەندی خۆراک'
    },
    agentType: {
      zh: '代理类型',
      en: 'Agent Type',
      ar: 'نوع الوكالة',
      ku: 'جۆری بریکاری'
    },
    flourAgent: {
      zh: '面粉代理',
      en: 'Flour Agent',
      ar: 'وكيل الطحين',
      ku: 'بریکاری ئارد'
    },
    foodAgent: {
      zh: '食品/副食代理',
      en: 'Food/Grocery Agent',
      ar: 'وكيل المواد الغذائية',
      ku: 'بریکاری خۆراک'
    },
    storeAddress: {
      zh: '实体网点营业地址',
      en: 'Physical Store Address',
      ar: 'عنوان المحل أو المنفذ التجاري',
      ku: 'ناونیشانی شوێنی بازرگانی'
    },
    storageCapacity: {
      zh: '核定仓储容量 (吨)',
      en: 'Approved Storage Capacity (Tons)',
      ar: 'السعة التخزينية المعتمدة (بالطن)',
      ku: 'توانای کۆگاکردنی پەسەندکراو (تەن)'
    },
    guaranteeDeposit: {
      zh: '保供履约保证金',
      en: 'Security Deposit',
      ar: 'التأمين المالي لضمان التجهيز',
      ku: 'بارمتەی دارایی دڵنیایی دابینکردن'
    },
    uploadCommercialReg: {
      zh: '商业登记证或营业执照 (必需)',
      en: 'Commercial Registration or License (Required)',
      ar: 'إجازة ممارسة المهنة أو السجل التجاري (إلزامي)',
      ku: 'مۆڵەتی بازرگانی یان تۆماری بازرگانی (پێویستە)'
    },
    uploadCleanRecord: {
      zh: '司法无犯罪记录官方证明 (必需)',
      en: 'Official Police Clearance Certificate (Required)',
      ar: 'شهادة عدم محكومية رسمية (إلزامي)',
      ku: 'بڕوانامەی فەرمی پاکی لە تاوان (پێویستە)'
    },
    uploadWarehouseProof: {
      zh: '实体营业场所产权或法定租赁公函',
      en: 'Property Deed or Legal Lease Certificate',
      ar: 'سند ملكية المحل أو عقد إيجار مصدق',
      ku: 'تاپۆی موڵک یان گرێبەستی کرێی پەسەندکراو'
    },
    rotationReason: {
      zh: '代理轮替法定原因',
      en: 'Succession Reason',
      ar: 'السبب القانوني لتدوير الوكالة',
      ku: 'هۆکاری یاسایی بۆ گواستنەوەی بریکاری'
    },
    retireRotation: {
      zh: '法定退休依法传承给直系亲属',
      en: 'Statutory Retirement to Direct Kin',
      ar: 'التقاعد القانوني والتنازل للأقارب من الدرجة الأولى',
      ku: 'خانەنشینی یاسایی و بەخشین بە خزمانی پلە یەک'
    },
    incapacityRotation: {
      zh: '因伤病丧失劳动能力指定亲属承接',
      en: 'Loss of Working Capacity to Designated Kin',
      ar: 'العجز الصحي والتنازل للقريب المعتمد',
      ku: 'ناچالاکی تەندروستی و گواستنەوە بۆ کەسی دیاریکراو'
    },
    kinshipProof: {
      zh: '直系亲属关系公证书 (必需)',
      en: 'Direct Kinship Notarial Certificate (Required)',
      ar: 'حجة وصاية أو قسام شرعي يثبت صلة القرابة (إلزامي)',
      ku: 'بەڵگەنامەی دادنووسی بۆ سەلماندنی خزمایەتی (پێویستە)'
    },
    cancelReason: {
      zh: '申请注销主要原因',
      en: 'Cancellation Reason',
      ar: 'سبب طلب الإلغاء',
      ku: 'هۆکاری داواکاری هەڵوەشاندنەوە'
    },
    settleClearance: {
      zh: '承诺已结清代销款项与库存无遗留',
      en: 'Certify All Payments & Grain Stock Cleared',
      ar: 'تعهد ببراءة الذمة وتسوية الأرصدة والمخزون',
      ku: 'بەڵێننامەی پاکتاوکردنی دارایی و کۆگا'
    },
    restoreReason: {
      zh: '申诉恢复事实理由',
      en: 'Reinstatement Statement & Grounds',
      ar: 'أسباب ودفوعات طلب الاستعادة',
      ku: 'هۆکار و پاساوەکانی گەڕاندنەوە'
    },
    penaltyRectified: {
      zh: '原有违规/整改事项已全部达标通过',
      en: 'Prior Deficiencies Fully Rectified & Audited',
      ar: 'إزالة كافة المخالفات السابقة واستيفاء الشروط',
      ku: 'نەهێشتنی سەرپێچییەکانی پێشوو و جێبەجێکردنی مەرجەکان'
    },
    submitReview: {
      zh: '确认提交审核',
      en: 'Submit for Review',
      ar: 'تأكيد الإرسال للتدقيق',
      ku: 'پشتڕاستکردنەوە بۆ پێداچوونەوە'
    },
    cancelBtn: {
      zh: '取消',
      en: 'Cancel',
      ar: 'إلغاء',
      ku: 'هەڵوەشاندنەوە'
    }
  },
  admin: {
    tabCards: {
      zh: '公民配给卡管理',
      en: 'Citizen Ration Cards',
      ar: 'إدارة بطاقات المواطنين التموينية',
      ku: 'بەڕێوەبردنی کارتە بەشەخۆراکییەکانی هاووڵاتیان'
    },
    tabFamilies: {
      zh: '家庭关系与分立管理',
      en: 'Household Relations & Splits',
      ar: 'إدارة شؤون الأسر والانشطار',
      ku: 'بەڕێوەبردنی پەیوەندی خێزان و جیاکردنەوە'
    },
    tabAgents: {
      zh: '代销商准入与全生命周期',
      en: 'Agent Lifecycle & Licensing',
      ar: 'إدارة وكلاء التموين ودورة العمل',
      ku: 'بەڕێوەبردنی بریکارەکان و مۆڵەتدان'
    },
    tabWarehouse: {
      zh: '战略仓储与跨省调拨',
      en: 'Strategic Storage & Provincial Transfers',
      ar: 'المستودعات الإستراتيجية والمناقلة بين المحافظات',
      ku: 'کۆگا ستراتیژییەکان و گواستنەوەی نێوان پارێزگاکان'
    },
    searchQuery: {
      zh: '查询',
      en: 'Search',
      ar: 'بحث',
      ku: 'گەڕان'
    },
    resetQuery: {
      zh: '重置',
      en: 'Reset',
      ar: 'إعادة ضبط',
      ku: 'ڕێکخستنەوە'
    },
    matchCards: {
      zh: '匹配 {count} 张卡',
      en: 'Matched {count} cards',
      ar: 'تمت مطابقة {count} بطاقة',
      ku: '{count} کارت دۆزرایەوە'
    },
    matchFamilies: {
      zh: '匹配 {count} 个家庭',
      en: 'Matched {count} households',
      ar: 'تمت مطابقة {count} أسرة',
      ku: '{count} خێزان دۆزرایەوە'
    },
    matchAgents: {
      zh: '匹配 {count} 家代销网点',
      en: 'Matched {count} agents',
      ar: 'تمت مطابقة {count} وكيل',
      ku: '{count} بریکار دۆزرایەوە'
    },
    matchTransfers: {
      zh: '匹配 {count} 笔调拨单',
      en: 'Matched {count} transfer orders',
      ar: 'تمت مطابقة {count} أمر مناقلة',
      ku: '{count} فەرمانی گواستنەوە دۆزرایەوە'
    },
    cardNo: {
      zh: '配给卡号',
      en: 'Ration Card No.',
      ar: 'رقم البطاقة التموينية',
      ku: 'ژمارەی کارتی بەشەخۆراک'
    },
    headInfo: {
      zh: '户主信息',
      en: 'Household Head',
      ar: 'معلومات رب الأسرة',
      ku: 'زانیاری سەرۆکی خێزان'
    },
    regionInfo: {
      zh: '所属行政省市/基层区',
      en: 'Province / Sub-district',
      ar: 'المحافظة / القضاء أو الناحية',
      ku: 'پارێزگا / قەزا یان ناحیە'
    },
    centerInfo: {
      zh: '归属配给中心',
      en: 'Ration Center',
      ar: 'مركز التموين التابع له',
      ku: 'مەڵبەندی خۆراکی پەیوەندیدار'
    },
    familyMembersCount: {
      zh: '在册人数',
      en: 'Enrolled Members',
      ar: 'عدد الأفراد المسجلين',
      ku: 'ژمارەی کەسانی تۆمارکراو'
    },
    cardStatus: {
      zh: '卡片状态',
      en: 'Card Status',
      ar: 'حالة البطاقة',
      ku: 'دۆخی کارت'
    },
    actions: {
      zh: '操作',
      en: 'Actions',
      ar: 'الإجراءات',
      ku: 'کردارەکان'
    },
    viewDetail: {
      zh: '详情',
      en: 'Details',
      ar: 'التفاصيل',
      ku: 'وردەکارییەکان'
    },
    freezeCard: {
      zh: '冻结',
      en: 'Freeze',
      ar: 'تجميد',
      ku: 'بەستن'
    },
    unfreezeCard: {
      zh: '解冻',
      en: 'Unfreeze',
      ar: 'إلغاء التجميد',
      ku: 'لابردنی بەستن'
    },
    rotateAgent: {
      zh: '转移代理',
      en: 'Transfer Agent',
      ar: 'نقل الوكيل',
      ku: 'گواستنەوەی بریکار'
    },
    addMember: {
      zh: '增补成员',
      en: 'Add Member',
      ar: 'إضافة فرد',
      ku: 'زیادکردنی ئەندام'
    },
    splitFamily: {
      zh: '分立家庭',
      en: 'Split Household',
      ar: 'شطر الأسرة',
      ku: 'جیاکردنەوەی خێزان'
    },
    governanceActions: {
      zh: '中央法定治理职权',
      en: 'Central Statutory Authorities',
      ar: 'الصلاحيات الإدارية المركزية القانونية',
      ku: 'دەسەڵاتە یاساییە ناوەندییەکان'
    }
  }
};

function updateFile(filePath, langKey) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const section of Object.keys(newTranslations)) {
    for (const [key, val] of Object.entries(newTranslations[section])) {
      const translation = val[langKey] || val.en || val.zh;
      const targetKey = `"${key}":`;
      if (!content.includes(targetKey)) {
        const secRegex = new RegExp(`("${section}"\\s*:\\s*\\{)`);
        if (secRegex.test(content)) {
          content = content.replace(secRegex, `$1\n    "${key}": ${JSON.stringify(translation)},`);
        }
      }
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

updateFile(zhPath, 'zh');
updateFile(enPath, 'en');
updateFile(arPath, 'ar');
updateFile(kuPath, 'ku');
console.log('All locales updated successfully.');
