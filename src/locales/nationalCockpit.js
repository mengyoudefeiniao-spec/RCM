// National cockpit + organization-unit management copy (zh / en / ar / ckb).
// Dynamic business records stay language-neutral: they store keys and numbers only.
export default {
  zh: {
    nav: { cockpit: '国家驾驶舱' },
    cockpit: {
      title: '国家驾驶舱',
      subtitle: '伊拉克全国配给运行态势与系统健康度总览',
      updatedAt: '数据更新于 {time}',
      refresh: '刷新',
      loadFailed: '国家驾驶舱数据加载失败，请稍后重试。',
      retry: '重新加载',
      noData: '暂无数据',
      mapTitle: '全国配给覆盖地图',
      mapHint: '按省份查看指标分布，悬停点位查看数据，点击省份查看明细。',
      pointHint: '点位大小代表代理网点数量',
      mapMetricLabel: '地图指标',
      legendTitle: '图例',
      legendLow: '低',
      legendHigh: '高',
      provinceDetail: '省级明细',
      closeDetail: '关闭明细',
      fieldPopulation: '人口',
      fieldHouseholds: '家庭户数',
      fieldFulfillment: '履约率',
      fieldAgents: '代理网点',
      fieldSites: '配给站点',
      mapMetrics: { fulfillment: '履约率', households: '覆盖家庭', agents: '代理网点', sites: '配给站点' },
      indicators: {
        population: '覆盖人口', households: '覆盖家庭', provinces: '覆盖省份', agents: '在网代理网点',
        sites: '配给站点', inventory: '在库物资', fulfillment: '配给履约率', compliance: '网点合规率',
        reviews: '待办审核', messages: '消息触达', uptime: '系统可用率', sync: '数据同步完整度'
      },
      units: { people: '人', households: '户', provinces: '省', outlets: '个', sites: '座', tons: '吨', cases: '项', messages: '条', percent: '%' },
      charts: {
        fulfillmentTrend: '月度配给履约', quota: '月度额度', actual: '实际配发',
        itemMix: '品类配给结构', rationTop: '省级配给量 Top 6',
        agentTop: '代理网点 Top 8', fulfillmentRank: '省级履约率 Top 8',
        systemRadar: '系统运行指标', nationalAverage: '全国均值',
        radarFulfillment: '履约率', radarCompliance: '合规率', radarUptime: '可用率', radarSync: '同步完整度'
      }
    },
    system: {
      orgUnits: '组织机构',
      orgUnitKeyword: '搜索机构名称、编码、类型或上级机构',
      orgUnitCreated: '组织机构已添加',
      orgUnitUpdated: '组织机构已更新',
      orgUnitDeleted: '组织机构已删除',
      orgUnitDemoMinistry: '伊拉克贸易部',
      orgUnitDemoDirectorate: '配给总局',
      orgUnitDemoBaghdadBranch: '巴格达分局'
    },
    systemUi: {
      'create_org-units': '新增组织机构',
      'edit_org-units': '编辑组织机构',
      orgDetails: '机构信息',
      orgName: '机构名称',
      orgCode: '机构编码',
      orgType: '机构类型',
      orgParent: '上级机构',
      orgParentHint: '留空表示顶级机构。'
    },
    systemExtras: {
      orgTypeMinistry: '部委机关', orgTypeDirectorate: '直属司局', orgTypeBranch: '省级分局', orgTypeCenter: '配给中心',
      entityOrgUnit: '组织机构', orgUnitCodeTaken: '机构编码已存在', orgUnitNone: '未关联', orgUnitInUse: '该组织机构已被系统用户或角色关联，无法删除。',
      orgUnitParentNone: '顶级机构'
    }
  },
  en: {
    nav: { cockpit: 'National Cockpit' },
    cockpit: {
      title: 'National Cockpit',
      subtitle: 'National ration operations and system health across Iraq',
      updatedAt: 'Updated {time}',
      refresh: 'Refresh',
      loadFailed: 'The national cockpit could not be loaded. Try again shortly.',
      retry: 'Reload',
      noData: 'No data available',
      mapTitle: 'National ration coverage',
      mapHint: 'Explore indicators by province. Hover a point for data, select a province for details.',
      pointHint: 'Point size reflects agent outlet count',
      mapMetricLabel: 'Map indicator',
      legendTitle: 'Legend',
      legendLow: 'Low',
      legendHigh: 'High',
      provinceDetail: 'Province details',
      closeDetail: 'Close details',
      fieldPopulation: 'Population',
      fieldHouseholds: 'Households',
      fieldFulfillment: 'Fulfillment',
      fieldAgents: 'Agent outlets',
      fieldSites: 'Ration sites',
      mapMetrics: { fulfillment: 'Fulfillment', households: 'Households', agents: 'Agent outlets', sites: 'Ration sites' },
      indicators: {
        population: 'Covered population', households: 'Covered households', provinces: 'Covered provinces', agents: 'Active agent outlets',
        sites: 'Ration sites', inventory: 'Stock on hand', fulfillment: 'Monthly fulfillment', compliance: 'Outlet compliance',
        reviews: 'Pending reviews', messages: 'Messages delivered', uptime: 'System uptime', sync: 'Data sync completeness'
      },
      units: { people: 'people', households: 'households', provinces: 'provinces', outlets: 'outlets', sites: 'sites', tons: 't', cases: 'cases', messages: 'messages', percent: '%' },
      charts: {
        fulfillmentTrend: 'Monthly fulfillment', quota: 'Monthly quota', actual: 'Distributed',
        itemMix: 'Commodity mix', rationTop: 'Top 6 provinces by ration',
        agentTop: 'Top 8 agent outlets', fulfillmentRank: 'Top 8 provinces by fulfillment',
        systemRadar: 'System operations', nationalAverage: 'National average',
        radarFulfillment: 'Fulfillment', radarCompliance: 'Compliance', radarUptime: 'Uptime', radarSync: 'Data sync'
      }
    },
    system: {
      orgUnits: 'Organization Units',
      orgUnitKeyword: 'Search unit name, code, type or parent',
      orgUnitCreated: 'Organization unit added',
      orgUnitUpdated: 'Organization unit updated',
      orgUnitDeleted: 'Organization unit deleted',
      orgUnitDemoMinistry: 'Ministry of Trade',
      orgUnitDemoDirectorate: 'General Ration Directorate',
      orgUnitDemoBaghdadBranch: 'Baghdad Branch'
    },
    systemUi: {
      'create_org-units': 'Create organization unit',
      'edit_org-units': 'Edit organization unit',
      orgDetails: 'Unit details',
      orgName: 'Unit name',
      orgCode: 'Unit code',
      orgType: 'Unit type',
      orgParent: 'Parent unit',
      orgParentHint: 'Leave blank for a top-level unit.'
    },
    systemExtras: {
      orgTypeMinistry: 'Ministry', orgTypeDirectorate: 'Directorate', orgTypeBranch: 'Provincial branch', orgTypeCenter: 'Ration center',
      entityOrgUnit: 'organization unit', orgUnitCodeTaken: 'This unit code already exists', orgUnitNone: 'Not linked', orgUnitInUse: 'This organization unit is still linked to a system user or role and cannot be deleted.',
      orgUnitParentNone: 'Top-level unit'
    }
  },
  ar: {
    nav: { cockpit: 'قمرة القيادة الوطنية' },
    cockpit: {
      title: 'قمرة القيادة الوطنية',
      subtitle: 'نظرة وطنية على عمليات التموين وصحة النظام في العراق',
      updatedAt: 'آخر تحديث {time}',
      refresh: 'تحديث',
      loadFailed: 'تعذر تحميل قمرة القيادة الوطنية. أعد المحاولة بعد قليل.',
      retry: 'إعادة التحميل',
      noData: 'لا توجد بيانات',
      mapTitle: 'خريطة تغطية التموين الوطنية',
      mapHint: 'استعرض المؤشرات حسب المحافظة. مرّر فوق نقطة لعرض البيانات واختر محافظة للتفاصيل.',
      pointHint: 'حجم النقطة يعكس عدد منافذ الوكلاء',
      mapMetricLabel: 'مؤشر الخريطة',
      legendTitle: 'المفتاح',
      legendLow: 'منخفض',
      legendHigh: 'مرتفع',
      provinceDetail: 'تفاصيل المحافظة',
      closeDetail: 'إغلاق التفاصيل',
      fieldPopulation: 'السكان',
      fieldHouseholds: 'الأسر',
      fieldFulfillment: 'الإنجاز',
      fieldAgents: 'الوكلاء',
      fieldSites: 'المواقع',
      mapMetrics: { fulfillment: 'الإنجاز', households: 'الأسر', agents: 'الوكلاء', sites: 'المواقع' },
      indicators: {
        population: 'السكان المشمولون', households: 'الأسر المشمولة', provinces: 'المحافظات المشمولة', agents: 'الوكلاء النشطون',
        sites: 'مواقع التموين', inventory: 'المخزون المتاح', fulfillment: 'الإنجاز الشهري', compliance: 'التزام المنافذ',
        reviews: 'مراجعات معلقة', messages: 'الرسائل المرسلة', uptime: 'جهوزية النظام', sync: 'اكتمال مزامنة البيانات'
      },
      units: { people: 'شخص', households: 'أسرة', provinces: 'محافظة', outlets: 'منفذ', sites: 'موقع', tons: 'طن', cases: 'حالة', messages: 'رسالة', percent: '%' },
      charts: {
        fulfillmentTrend: 'الإنجاز الشهري للتموين', quota: 'الحصة الشهرية', actual: 'الموزع فعلياً',
        itemMix: 'تركيبة السلع', rationTop: 'أعلى 6 محافظات في التموين',
        agentTop: 'أعلى 8 منافذ وكلاء', fulfillmentRank: 'أعلى 8 محافظات في الإنجاز',
        systemRadar: 'مؤشرات تشغيل النظام', nationalAverage: 'المتوسط الوطني',
        radarFulfillment: 'الإنجاز', radarCompliance: 'الالتزام', radarUptime: 'الجهوزية', radarSync: 'المزامنة'
      }
    },
    system: {
      orgUnits: 'الوحدات التنظيمية',
      orgUnitKeyword: 'ابحث باسم الوحدة أو رمزها أو نوعها أو الوحدة الأعلى',
      orgUnitCreated: 'تمت إضافة الوحدة التنظيمية',
      orgUnitUpdated: 'تم تحديث الوحدة التنظيمية',
      orgUnitDeleted: 'تم حذف الوحدة التنظيمية',
      orgUnitDemoMinistry: 'وزارة التجارة',
      orgUnitDemoDirectorate: 'المديرية العامة للتموين',
      orgUnitDemoBaghdadBranch: 'فرع بغداد'
    },
    systemUi: {
      'create_org-units': 'إضافة وحدة تنظيمية',
      'edit_org-units': 'تعديل وحدة تنظيمية',
      orgDetails: 'بيانات الوحدة',

      orgName: 'اسم الوحدة',
      orgCode: 'رمز الوحدة',
      orgType: 'نوع الوحدة',
      orgParent: 'الوحدة الأعلى',
      orgParentHint: 'اتركه فارغاً للوحدة العليا.'
    },
    systemExtras: {
      orgTypeMinistry: 'وزارة', orgTypeDirectorate: 'مصلحة مركزية', orgTypeBranch: 'فرع محافظة', orgTypeCenter: 'مركز تموين',
      entityOrgUnit: 'وحدة تنظيمية', orgUnitCodeTaken: 'رمز الوحدة موجود بالفعل', orgUnitNone: 'غير مرتبط', orgUnitInUse: 'الوحدة التنظيمية مرتبطة بمستخدم نظام أو دور ولا يمكن حذفها.',
      orgUnitParentNone: 'الوحدة العليا'
    }
  },
  ckb: {
    nav: { cockpit: 'کابینەی نیشتمانی' },
    cockpit: {
      title: 'کابینەی نیشتمانی',
      subtitle: 'بارودۆخی دابەشکردنی بەشەخۆراک و تەندروستیی سیستەم لە سەرتاسەری عێراق',
      updatedAt: 'دوایین نوێکردنەوە {time}',
      refresh: 'نوێکردنەوە',
      loadFailed: 'بارکردنی کابینەی نیشتمانی سەرکەوتوو نەبوو. دواتر هەوڵ بدەوە.',
      retry: 'دووبارە بارکردنەوە',
      noData: 'داتا نییە',
      mapTitle: 'داپۆشینی بەشەخۆراکی نیشتمانی',
      mapHint: 'ئاماژەکان بەپێی پارێزگا ببینە. لەسەر خاڵێک بمێنەوە بۆ داتا و پارێزگایەک هەڵبژێرە بۆ وردەکاری.',
      pointHint: 'قەبارەی خاڵ ڕەنگیژمارەی بنکەی بریکارەکانە',
      mapMetricLabel: 'ئاماژەی نەخشە',
      legendTitle: 'ڕوونکردنەوە',
      legendLow: 'کەم',
      legendHigh: 'زۆر',
      provinceDetail: 'وردەکاری پارێزگا',
      closeDetail: 'داخستنی وردەکاری',
      fieldPopulation: 'دانیشتووان',
      fieldHouseholds: 'خێزان',
      fieldFulfillment: 'جێبەجێکردن',
      fieldAgents: 'بریکار',
      fieldSites: 'شوێن',
      mapMetrics: { fulfillment: 'جێبەجێکردن', households: 'خێزان', agents: 'بریکار', sites: 'شوێن' },
      indicators: {
        population: 'دانیشتووانی داپۆشراو', households: 'خێزانە داپۆشراوەکان', provinces: 'پارێزگاکانی داپۆشراو', agents: 'بریکارە چالاکەکان',
        sites: 'شوێنەکانی بەشەخۆراک', inventory: 'کۆگای بەردەست', fulfillment: 'جێبەجێکردنی مانگانە', compliance: 'پابەندبوونی بنکەکان',
        reviews: 'پشکنینە چاوەڕوانەکان', messages: 'پەیامە گەیشتووەکان', uptime: 'بەردەستبوونی سیستەم', sync: 'تەواوی هاوکاتکردنی داتا'
      },
      units: { people: 'کەس', households: 'خێزان', provinces: 'پارێزگا', outlets: 'بنکە', sites: 'شوێن', tons: 'تۆن', cases: 'حاڵەت', messages: 'پەیام', percent: '%' },
      charts: {
        fulfillmentTrend: 'جێبەجێکردنی مانگانەی بەشەخۆراک', quota: 'ڕێژەی مانگانە', actual: 'دابەشکراوی ڕاستەقینە',
        itemMix: 'پێکهاتەی کاڵا', rationTop: '٦ پارێزگای سەرەوە لە بەشەخۆراک',
        agentTop: '٨ بنکەی سەرەوەی بریکار', fulfillmentRank: '٨ پارێزگای سەرەوە لە جێبەجێکردن',
        systemRadar: 'ئاماژەکانی کارکردنی سیستەم', nationalAverage: 'ناوەندی نیشتمانی',
        radarFulfillment: 'جێبەجێکردن', radarCompliance: 'پابەندبوون', radarUptime: 'بەردەستبوون', radarSync: 'هاوکاتکردن'
      }
    },
    system: {
      orgUnits: 'یەکەی دامەزراوەیی',
      orgUnitKeyword: 'گەڕان بە ناوی یەکە، کۆد، جۆر یان یەکەی سەرەوە',
      orgUnitCreated: 'یەکەی دامەزراوەیی زیادکرا',
      orgUnitUpdated: 'یەکەی دامەزراوەیی نوێکرایەوە',
      orgUnitDeleted: 'یەکەی دامەزراوەیی سڕایەوە',
      orgUnitDemoMinistry: 'وەزارەتی بازرگانی',
      orgUnitDemoDirectorate: 'بەڕێوەبەرایەتیی گشتیی بەشەخۆراک',
      orgUnitDemoBaghdadBranch: 'لقى بەغدا'
    },
    systemUi: {
      'create_org-units': 'زیادکردنی یەکەی دامەزراوەیی',
      'edit_org-units': 'دەستکاریکردنی یەکەی دامەزراوەیی',
      orgDetails: 'زانیاری یەکە',

      orgName: 'ناوی یەکە',
      orgCode: 'کۆدی یەکە',
      orgType: 'جۆری یەکە',
      orgParent: 'یەکەی سەرەوە',
      orgParentHint: 'بەتاڵی بهێڵەوە بۆ یەکەی سەرەوە.'
    },
    systemExtras: {
      orgTypeMinistry: 'وەزارەت', orgTypeDirectorate: 'بەڕێوەبەرایەتیی گشتی', orgTypeBranch: 'لقى پارێزگا', orgTypeCenter: 'ناوەندی بەشەخۆراک',
      entityOrgUnit: 'یەکەی دامەزراوەیی', orgUnitCodeTaken: 'کۆدی یەکە پێشتر هەیە', orgUnitNone: 'پەیوەست نییە', orgUnitInUse: 'ئەم یەکەی دامەزراوەیییە پەیوەستە بە بەکارهێنەرێکی سیستەم یان ڕۆڵ و ناتوانرێت بسڕدرێتەوە.',
      orgUnitParentNone: 'یەکەی سەرەوە'
    }
  }
};
