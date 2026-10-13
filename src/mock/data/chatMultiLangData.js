/**
 * 智能客服多语言知识库与会话映射字典
 * 支持 zh (中文), en (英文), ar (阿拉伯文), ku (库尔德文) 4 种语言的无缝互译与热切换
 */

// 1. 政策出处规程切片多语言字典
export const MULTI_LANG_SOURCES = {
  'CHUNK-RULE-001': {
    id: 'CHUNK-RULE-001',
    kbId: 'KB-RULE',
    docNumber: 'MOT-RULE-2026-002',
    publishDate: '2026-01-10',
    score: 99.2,
    titles: {
      zh: '《全天候食品配给核心口粮物资发放配额标准表（2026年修订版）》',
      en: 'Core Food Ration Distribution Quota Standards (2026 Revised Edition)',
      ar: 'جدول معايير الحصص التموينية الأساسية المقررة (نسخة 2026 المحدثة)',
      ku: 'خشتەی پێوەرەکانی بەشەخۆراکی بنەڕەتی سەرتاسەری (چاپکراوی نوێکراوەی 2026)'
    },
    docTypes: {
      zh: '业务规则',
      en: 'Business Rule',
      ar: 'ضوابط تشغيلية',
      ku: 'ڕێسای کارگێڕی'
    },
    clauses: {
      zh: '第一章 第二条【法定基础口粮人均指标与婴幼儿特殊津贴】',
      en: 'Chapter 1, Article 2: Statutory Basic Food Ration & Infant Quotas',
      ar: 'الباب الأول، المادة الثانية: الحصة التموينية الأساسية ومخصصات الأطفال',
      ku: 'بەشی یەکەم، ماددەی دووەم: بەشەخۆراکی سەرەکی یاسایی و شیری منداڵان'
    },
    issuingAgencies: {
      zh: '伊拉克共和国贸易部食品配给署',
      en: 'Republic of Iraq Ministry of Trade - Food Rationing Administration',
      ar: 'جمهورية العراق - وزارة التجارة - دائرة تنظيم التجارة والتموين',
      ku: 'کۆماری عێراق - وەزارەتی بازرگانی - بەڕێوەبەرایەتی بەشەخۆراک'
    },
    contents: {
      zh: '【法定物资人均配额基准（每人/每月）】\n1. 小麦面粉：9.00 公斤 / 人 / 月；\n2. 精选大米：3.00 公斤 / 人 / 月；\n3. 精炼食用植物油：1.00 升 / 人 / 月；\n4. 精制白砂糖：2.00 公斤 / 人 / 月；\n5. 婴幼儿营养补贴：在册 0-24 个月周岁婴儿，每人每月增发优质配方奶粉 1.80 公斤（900g 罐装两罐）。',
      en: 'Statutory Basic Quota per Person per Month:\n1. Wheat Flour: 9.00 kg / person / month;\n2. Selected Rice: 3.00 kg / person / month;\n3. Refined Cooking Oil: 1.00 L / person / month;\n4. Refined Sugar: 2.00 kg / person / month;\n5. Infant Allowance: 1.80 kg formula milk (2 cans of 900g) for registered infants aged 0-24 months.',
      ar: 'المعايير التموينية الشهرية المقررة للفرد:\n1. طحين الحنطة: 9.00 كغم / فرد / شهر؛\n2. الرز الفاخر: 3.00 كغم / فرد / شهر؛\n3. زيت الطعام المكرر: 1.00 لتر / فرد / شهر؛\n4. السكر الأبيض المكرر: 2.00 كغم / فرد / شهر؛\n5. مخصصات الرضع: 1.80 كغم حليب أطفال (عبوتان 900 غرام) للأطفال المسجلين بعمر 0-24 شهراً.',
      ku: 'پێوەرە یاساییەکانی بەشەخۆراکی مانگانەی هەر تاکێک:\n1. ئاردی گەنم: 9.00 کگم / کەس / مانگ؛\n2. برنجی نایاب: 3.00 کگم / کەس / مانگ؛\n3. ڕۆنی شل: 1.00 لیتر / کەس / مانگ؛\n4. شەکر: 2.00 کگم / کەس / مانگ؛\n5. شیری منداڵان: 1.80 کگم شیری وشک (دوو قوتووی 900 گم) بۆ منداڵانی تەمەن 0-24 مانگ.'
    }
  },
  'CHUNK-GUIDE-003': {
    id: 'CHUNK-GUIDE-003',
    kbId: 'KB-GUIDE',
    docNumber: 'MOT-UG-2026-005',
    publishDate: '2026-02-10',
    score: 98.5,
    titles: {
      zh: '《家庭户主变更申请指引与继承规范》',
      en: 'Household Head Change and Succession Guidelines',
      ar: 'دليل إجراءات تغيير وتوارث رب الأسرة التموينية',
      ku: 'ڕێبەری گۆڕین و گواستنەوەی سەرۆکی خێزان'
    },
    docTypes: {
      zh: '用户指南',
      en: 'User Guide',
      ar: 'دليل المستخدم',
      ku: 'ڕێبەری بەکارهێنەر'
    },
    clauses: {
      zh: '第三章 第一条【继承顺位与知情同意程序】',
      en: 'Chapter 3, Article 1: Succession Order and Joint Consent',
      ar: 'الباب الثالث، المادة الأولى: أسبقية التنازل وإقرار الموافقة المشتركة',
      ku: 'بەشی سێیەم، ماددەی یەکەم: پلەبەندی شوێنگرتنەوە و ڕەزامەندی هاوبەش'
    },
    issuingAgencies: {
      zh: '贸易部配给中心部与司法审查协调办公室',
      en: 'Ministry of Trade Rationing Center & Judicial Review Coordination Office',
      ar: 'وزارة التجارة - مكتب التنسيق القضائي والتدقيق التمويني',
      ku: 'وەزارەتی بازرگانی - ناوەندی بەشەخۆراک و دەستەی پێداچوونەوەی دادوەری'
    },
    contents: {
      zh: '当原户主去世、丧失完全行为能力或长期失踪时：\n1. 第一顺位继任人：合法在世配偶优先继任；\n2. 第二顺位继任人：年满 18 周岁之在册成年在籍子女推举一人继任；\n3. 提交材料：死亡证明公函、全体成年家庭成员联署知情同意声明书；\n4. 法定审查期：5 个工作日内完成系统换绑。',
      en: 'When the household head passes away, becomes incapacitated, or is absent:\n1. 1st Priority: Lawful surviving spouse has priority succession;\n2. 2nd Priority: Adult registered child (18+) nominated with family consensus;\n3. Required Documents: Official death certificate, notarized joint consent from adult members;\n4. Statutory Timeline: Registry updated within 5 working days upon verification.',
      ar: 'عند وفاة رب الأسرة أو فقدانه للأهلية القانونية أو غيابه:\n1. الأسبقية الأولى: الزوج/الزوجة الباقي على قيد الحياة؛\n2. الأسبقية الثانية: أحد الأبناء البالغين (18 عاماً فأكثر) بتوافق أفراد الأسرة؛\n3. المستندات المطلوبة: شهادة الوفاة، إقرار موافقة موقع من أفراد الأسرة البالغين؛\n4. المدة القانونية: استكمال الإجراءات وتحديث القيد خلال 5 أيام عمل.',
      ku: 'لە کاتی کۆچی دوایی سەرۆکی خێزان یان لەدەستدانی توانای یاسایی:\n1. پلەی یەکەم: هاوسەری یاسایی کە لە ژیاندا ماوە؛\n2. پلەی دووەم: یەکێک لە منداڵە باڵغەکان (١٨ ساڵ و بەرەو سەر) بە ڕەزامەندی هەمووان؛\n3. بەڵگەنامەکان: بڕوانامەی کۆچی دوایی و ڕەزامەندی نووسراوی سەرجەم ئەندامە باڵغەکان؛\n4. ماوەی یاسایی: لە ماوەی 5 ڕۆژی کارکردندا دەگوازرێتەوە.'
    }
  },
  'CHUNK-GUIDE-004': {
    id: 'CHUNK-GUIDE-004',
    kbId: 'KB-GUIDE',
    docNumber: 'MOT-UG-2026-007',
    publishDate: '2026-02-18',
    score: 97.8,
    titles: {
      zh: '《跨行政区与跨代理网点定点转移办理指南》',
      en: 'Inter-District and Inter-Agent Transfer Operating Guidelines',
      ar: 'دليل نقل البطاقة التموينية بين الوكلاء والمحافظات',
      ku: 'ڕێبەری گواستنەوەی کارتی بەشەخۆراک لە نێوان بریکارەکان و پارێزگاکاندا'
    },
    docTypes: {
      zh: '用户指南',
      en: 'User Guide',
      ar: 'دليل المستخدم',
      ku: 'ڕێبەری بەکارهێنەر'
    },
    clauses: {
      zh: '第二章 第二条【网点容量上限与迁移时限】',
      en: 'Chapter 2, Article 2: Agent Branch Capacity Cap and Transfer Schedule',
      ar: 'الباب الثاني، المادة الثانية: سقف سعة الوكيل ومواعيد النقل',
      ku: 'بەشی دووەم، ماددەی دووەم: سنووری وەرگرتنی بریکار و کاتی گواستنەوە'
    },
    issuingAgencies: {
      zh: '贸易部配给调度与网点监管中心',
      en: 'Ministry of Trade Distribution Scheduling & Agent Supervision Center',
      ar: 'وزارة التجارة - مركز التوزيع والرقابة على الوكلاء',
      ku: 'وەزارەتی بازرگانی - ناوەندی چاودێری و دابەشکردنی بەشەخۆراک'
    },
    contents: {
      zh: '1. 频次约束：同一家庭每 6 个月内仅允许申请转移一次；\n2. 容量限制：目标代理网点服务家庭数不得超过 1,500 户系统容量上限；\n3. 证明文件：需上传新居住地址的正式租赁合同或不动产登记凭据；\n4. 生效时间：线上审核核准后，于次月 1 日零时生效划转。',
      en: '1. Frequency: Families permitted one transfer every 6 months;\n2. Capacity Cap: Target agent branch cannot exceed 1,500 registered households;\n3. Proof Required: Certified residential lease agreement or property deed;\n4. Effective Date: Takes effect at 00:00 on the 1st day of the following month.',
      ar: '1. تكرار النقل: يُسمح بنقل البطاقة مرة واحدة كل 6 أشهر فقط؛\n2. سقف السعة: لا يجوز أن يتجاوز عدد الأسر لدى الوكيل الهدف 1,500 أسرة؛\n3. الوثائق المطلوبة: عقد إيجار مصدق أو سند ملكية لمحل السكن الجديد؛\n4. موعد النفاذ: يسري النقل في اليوم الأول من الشهر التالي بعد الموافقة.',
      ku: '1. سنووردارکردن: هەر 6 مانگ جارێک ڕێگە بە گواستنەوە دەدرێت؛\n2. ڕێژەی بریکار: بریکاری مەبەست نابێت زیاتر لە 1,500 خێزانی لەلا بێت؛\n3. بەڵگەنامە: گرێبەستی فەرمی خانوو یان تاپۆ لە شوێنی نوێ؛\n4. کاتی جێبەجێکردن: لە یەکی مانگی داهاتووەوە کارا دەبێت.'
    }
  },
  'CHUNK-GUIDE-005': {
    id: 'CHUNK-GUIDE-005',
    kbId: 'KB-GUIDE',
    docNumber: 'MOT-UG-2026-009',
    publishDate: '2026-03-01',
    score: 98.1,
    titles: {
      zh: '《数字配给卡异常冻结核查与线上解冻申办流程》',
      en: 'Ration Card Account Freeze Audit and Online Unfreezing Procedures',
      ar: 'إجراءات تدقيق تجميد البطاقة التموينية وفك التجميد إلكترونياً',
      ku: 'ڕێکارەکانی پشکنینی سڕکردن و چالاککردنەوەی کارتی بەشەخۆراک بە ئۆنلاین'
    },
    docTypes: {
      zh: '用户指南',
      en: 'User Guide',
      ar: 'دليل المستخدم',
      ku: 'ڕێبەری بەکارهێنەر'
    },
    clauses: {
      zh: '第四章 第一条【连续90天未核销休眠保护机制与解冻自证】',
      en: 'Chapter 4, Article 1: 90-Day Dormancy Protection and Unfreeze Verification',
      ar: 'الباب الرابع، المادة الأولى: قفل الحماية لعدم الاستلام 90 يوماً وإثبات الهوية',
      ku: 'بەشی چوارەم، ماددەی یەکەم: قفڵی پاراستنی 90 ڕۆژ و سەلماندنی ناسنامە'
    },
    issuingAgencies: {
      zh: '国家数字配给卡安全稽查中心',
      en: 'National Digital Ration Card Security Audit Center',
      ar: 'المركز الوطني للتدقيق والأمن السيبراني للبطاقة التموينية',
      ku: 'ناوەندی نیشتمانی بۆ وردبینی و ئاسایشی کارتی بەشەخۆراک'
    },
    contents: {
      zh: '1. 自动冻结条件：连续 90 天未在定点网点核销领粮，系统自动触发休眠安全锁；\n2. 申办材料：户主在线完成活体人脸识别，拍摄上传手持国民身份证（NID）及未领取原因声明；\n3. 复核办结时效：稽查中心于 24-48 小时内核实并即刻恢复发放状态。',
      en: '1. Trigger: Inactive for 90 consecutive days automatically activates security dormancy lock;\n2. Verification: Complete facial biometric check, upload photo holding National ID and explanation;\n3. Timeline: Restored within 24-48 hours upon security review.',
      ar: '1. شروط التجميد: التوقف عن الاستلام لمدة 90 يوماً متتالية يفعل قفل الأمان التلقائي؛\n2. متطلبات فك التجميد: فحص بصمة الوجه الحيوية ورفع صورة حامل البطاقة الوطنية وتبرير عدم الاستلام؛\n3. وقت المعالجة: يفك التجميد خلال 24-48 ساعة بعد المراجعة الأمنية.',
      ku: '1. مەرجی سڕکردن: وەرنەگرتنی بەشەخۆراک بۆ 90 ڕۆژی لەسەریەک قفڵی پاراستن چالاک دەکات؛\n2. بەڵگەنامە: پشکنینی ڕاستەوخۆی دەموچاو و وێنەی کارتی نیشتمانی و هۆکاری وەرنەگرتن؛\n3. ماوەی پێداچوونەوە: لە ماوەی 24-48 کاتژمێردا کارتەکە چالاک دەکرێتەوە.'
    }
  },
  'CHUNK-POLICY-001': {
    id: 'CHUNK-POLICY-001',
    kbId: 'KB-POLICY',
    docNumber: 'MOT-POLICY-2025-088',
    publishDate: '2025-11-20',
    score: 94.1,
    titles: {
      zh: '《国家民生保障战略物资法定义务与监督令》',
      en: 'National Strategic Livelihood Supplies Statutory Obligations & Supervision Decree',
      ar: 'قانون المواد الاستراتيجية التموينية وحماية الأمن الغذائي الوطني',
      ku: 'یاسای دابینکردنی بەشەخۆراکی ستراتیژی و چاودێری نیشتمانی'
    },
    docTypes: {
      zh: '法律法规',
      en: 'Statutory Law',
      ar: 'قانون وتشريع',
      ku: 'یاسا و ڕێسای فەرمی'
    },
    clauses: {
      zh: '第二章 第七条【各级配给网点足额足期保供法定责任】',
      en: 'Chapter 2, Article 7: Mandatory Full & Timely Supply Obligations of Agents',
      ar: 'الباب الثاني، المادة السابعة: المسؤولية القانونية للوكلاء في توفير الحصص كاملة',
      ku: 'بەشی دووەم، ماددەی حەوتەم: ئەرکی یاسایی بریکارەکان لە دابەشکردنی تەواوی بەشەخۆراک'
    },
    issuingAgencies: {
      zh: '共和国总理府内阁会议法制局',
      en: 'Cabinet Office Legal Bureau of the Republic of Iraq',
      ar: 'مجلس الوزراء - الدائرة القانونية العامة',
      ku: 'ئەنجومەنی وەزیران - فەرمانگەی یاسایی گشتی'
    },
    contents: {
      zh: '各级特许代理网点必须按法定时限备齐当月口粮物资，严禁擅自以缺货、次品为由拒发、克扣或挪用国家口粮物资。违者吊销特许经营资质并追究法律责任。',
      en: 'Authorized agent branches must stock complete monthly ration commodities. Denying, withholding or embezzling state rations under pretext of stockout is strictly prohibited under penalty of license revocation.',
      ar: 'يلتزم الوكلاء المعتمدون بتوفير كامل مفردات البطاقة التموينية في المواعيد المحددة، ويُحظر الامتناع أو استقطاع أي مادة بذريعة نفاد المخزون تحت طائلة سحب الإجازة والمساءلة القانونية.',
      ku: 'سەرجەم بریکارەکان پابەندن بە دابینکردنی تەواوی بەشەخۆراکی مانگانە لە کاتی دیاریکراودا، کەمکردنەوە یان نەدانی بەشەخۆراک بە بیانووی نەبوونی کەلوپەل سزای یاسایی و هەڵوەشاندنەوەی مۆڵەتی بەدوادادێت.'
    }
  }
};

// 2. 核心问答主题多语言字典 (包含用户问句、AI答复、推荐追问、关联切片引用)
export const MULTI_LANG_TOPICS = {
  // 1. 配额标准 (Quota standard)
  quota: {
    key: 'quota',
    keywords: [
      '配额', '标准', '口粮', '面粉', '大米', '白糖', '食用油', '奶粉', '斤', '公斤',
      'quota', 'standard', 'ration', 'flour', 'rice', 'sugar', 'oil', 'milk', 'kg',
      'حصة', 'تموينية', 'طحين', 'رز', 'سكر', 'زيت', 'حليب', 'معيار',
      'بەشەخۆراک', 'ئارد', 'برنج', 'شەکر', 'ڕۆن', 'شیر', 'پێوەر'
    ],
    userQuestion: {
      zh: '2026年家庭成员的每月基础口粮物资配额标准是多少？',
      en: 'What is the monthly basic food ration quota standard for 2026?',
      ar: 'ما هي الحصة التموينية الغذائية الشهرية لعام 2026؟',
      ku: 'پێوەر و بەشەخۆراکی مانگانەی بنەماڵە بۆ ساڵی 2026 چەندە؟'
    },
    answer: {
      zh: `依据共和国贸易部食品配给署颁布的《全天候食品配给核心口粮物资发放配额标准表（2026年修订版）》（文号：MOT-RULE-2026-002），法定基础口粮标准严格按在册人数统一计量计发：

1. **每人每月基础物资配额标准**：
   - **小麦面粉**（标准一级精粉）：**9.00 公斤** / 人 / 月；
   - **精选大米**（长粒香米）：**3.00 公斤** / 人 / 月；
   - **植物精炼烹调油**：**1.00 升** / 人 / 月；
   - **精制白砂糖**：**2.00 公斤** / 人 / 月；
2. **婴幼儿专属营养津贴**：
   - 家庭中若有 **0 - 24 个月周岁婴幼儿**，每名婴儿每月额外增配 **1.80 公斤**（即 2 罐 900g 高品质配方奶粉）；
3. **物资领取与补领机制**：
   - 当月配额自每月 1 日零时起生效，户主凭数字配给卡动态核销码到定点网点领取；
   - 若当月因故未能按时领取，可在次月 15 日前在原网点申请补领，严禁网点克扣或截留。`,
      en: `According to the Core Food Ration Distribution Quota Standards (2026 Revised Edition) issued by the Ministry of Trade (MOT-RULE-2026-002), the statutory basic food ration is measured strictly per registered member:

1. **Monthly Basic Quota per Person**:
   - **Wheat Flour** (Standard Grade 1): **9.00 kg** / person / month;
   - **Selected Rice** (Long-grain): **3.00 kg** / person / month;
   - **Refined Vegetable Cooking Oil**: **1.00 L** / person / month;
   - **Refined White Sugar**: **2.00 kg** / person / month;
2. **Infant Nutritional Allowance**:
   - For families with infants aged **0 - 24 months**, an extra **1.80 kg** per infant/month is allocated (2 cans of 900g formula milk);
3. **Collection & Makeup Rules**:
   - Active from 00:00 on the 1st of each month; head presents dynamic QR code at the agent branch;
   - If uncollected within the month, makeup claims can be made at the original branch before the 15th of next month.`,
      ar: `استناداً إلى جدول معايير الحصص التموينية الأساسية (نسخة 2026) الصادر عن دائرة تنظيم التجارة بوزارة التجارة (MOT-RULE-2026-002)، تُصرف الحصص المقررة قانوناً بحسب عدد الأفراد المسجلين:

1. **الحصة الشهرية الأساسية للفرد**:
   - **طحين الحنطة** (درجة أولى): **9.00 كغم** / فرد / شهر؛
   - **الرز الفاخر** (حبة طويلة): **3.00 كغم** / فرد / شهر؛
   - **زيت الطعام النباتي المكرر**: **1.00 لتر** / فرد / شهر؛
   - **السكر الأبيض المكرر**: **2.00 كغم** / فرد / شهر؛
2. **مخصصات الأطفال والرضع**:
   - للأسر التي لديها أطفال بعمر **0 - 24 شهراً**، تُصرف حصة إضافية قدرها **1.80 كغم** (عبوتان زنة 900 غرام من حليب الأطفال)؛
3. **آلية الاستلام والتعويض**:
   - تصبح الحصة نافذة اعتباراً من اليوم الأول من كل شهر عبر رمز التحقق الديناميكي، ويمكن تعويض الحصة غير المستلمة قبل اليوم 15 من الشهر التالي.`,
      ku: `بەپێی خشتەی پێوەرەکانی بەشەخۆراکی بنەڕەتی (چاپکراوی نوێکراوەی 2026) لە وەزارەتی بازرگانی (MOT-RULE-2026-002)، بەشەخۆراکی یاسایی بەپێی ژمارەی ئەندامانی تۆمارکراو بەم شێوەیە دابەش دەکرێت:

1. **بەشەخۆراکی مانگانەی هەر تاکێک**:
   - **ئاردی گەنم** (پلە یەک): **9.00 کگم** / کەس / مانگ؛
   - **برنجی نایاب** (دەنک درێژ): **3.00 کگم** / کەس / مانگ؛
   - **ڕۆنی شلی ڕووەکی**: **1.00 لیتر** / کەس / مانگ؛
   - **شەکر**: **2.00 کگم** / کەس / مانگ؛
2. **بەشەخۆراکی تایبەتی منداڵانی ساوا**:
   - بۆ خێزانەکانی خاوەن منداڵی تەمەن **0 - 24 مانگ**، مانگانە **1.80 کگم** شیری وشک زیادە دەدرێت (دوو قوتووی 900 گم)؛
3. **وەرگرتن و قەرەبووکردنەوە**:
   - بەشەخۆراک لە یەکی هەموو مانگێکەوە کارا دەبێت بە کۆدی QR، لە کاتی وەرنەگرتندا تا ١٥ی مانگی دواتر دەتوانرێت قەرەبوو بکرێتەوە.`
    },
    sourceIds: ['CHUNK-RULE-001', 'CHUNK-POLICY-001'],
    suggestQuestions: {
      zh: [
        '当月口粮未领取，次月还可以继续补领吗？',
        '如何为刚出生的婴儿登记并领取婴儿配方奶粉配额？',
        '代理网点如果以缺货为由拒发完整配额该如何申诉？'
      ],
      en: [
        'Can uncollected monthly rations be claimed in the following month?',
        'How to register a newborn for infant formula quota?',
        'How to file a grievance if an agent refuses quota due to stock shortage?'
      ],
      ar: [
        'هل يمكن استلام الحصة غير المستلمة في الشهر التالي؟',
        'كيف يتم تسجيل حديثي الولادة لاستلام حصة الحليب؟',
        'كيف أقدم شكوى إذا رفض الوكيل تسليم الحصة بدعوى نفاد الكمية؟'
      ],
      ku: [
        'ئایا دەتوانرێت بەشەخۆراکی وەرنەگیراو لە مانگی دواتردا قەرەبوو بکرێتەوە؟',
        'چۆن ناوی کۆرپەی تازەلەدایکبوو تۆمار بکەم بۆ شیری وشک؟',
        'چۆن سکاڵا تۆمار بکەم ئەگەر بریکار بە بیانووی نەبوونی کەلوپەل بەشەخۆراک نەدات؟'
      ]
    }
  },

  // 2. 户主变更 (Change household head)
  changeHead: {
    key: 'changeHead',
    keywords: [
      '户主', '去世', '继任', '继承', '变更户主', '换户主', '生病', '丧失',
      'head', 'deceased', 'successor', 'succession', 'household head', 'change head', 'incapacitated',
      'رب الأسرة', 'وفاة', 'تغيير رب الأسرة', 'نقل رب الأسرة', 'حصر إرث', 'عجز',
      'سەرۆکی خێزان', 'گۆڕینی سەرۆک', 'کۆچی دوایی', 'مردن', 'نەخۆشی'
    ],
    userQuestion: {
      zh: '原户主因病去世或丧失行为能力，该如何办理户主变更？',
      en: 'How to apply for change of household head if deceased or incapacitated?',
      ar: 'كيف يتم نقل ملكية رب الأسرة في حال الوفاة أو العجز؟',
      ku: 'چۆن دەتوانم سەرۆکی خێزان بگۆڕم لە کاتی کۆچی دوایی یان نەخۆشیدا؟'
    },
    answer: {
      zh: `根据《Ration Card Management (RCM) 业务规范》及《家庭户主变更申请指引与继承规范》，办理户主变更的具体规则与流程如下：

1. **法定继承与变更顺位**：
   - 第一顺位：合法在世配偶优先继任；
   - 第二顺位：无在世配偶或配偶主动声明放弃的，由年满 18 周岁之在册成年子女协商推选。
2. **所需审核材料清单**：
   - 原户主法定死亡证明（或医疗机关证明 / 法院宣告判决书）；
   - 直系亲属关系证明公证书（或户籍关系底册）；
   - 在册全体成年家庭成员联署知情同意声明书。
3. **系统线上办理入口**：
   - 您可直接在当前系统进入【公民服务】菜单下的【变更户主申请】页面；
   - 在成员列表中选取拟继任的新户主候选人，并上传上述材料照片或扫描件提交。
4. **审核与配额生效时效**：
   - 提交后将流转至所在辖区监督官审核工作台，法定审核时限为 **5 个工作日**；
   - 审核通过后，系统自动换绑户主身份，家庭名下配给物资配额不受任何中断影响。`,
      en: `According to RCM Operational Specifications and Household Head Succession Guidelines, the rules and procedures for changing the head of household are as follows:

1. **Statutory Succession Order**:
   - 1st Priority: Lawful surviving spouse has priority succession;
   - 2nd Priority: In the absence of a spouse or if waived, an adult registered child aged 18+ elected by family agreement.
2. **Required Documentation**:
   - Official death certificate (or medical/court ruling);
   - Notarized direct relationship certificate or civil registry record;
   - Joint consent statement signed by all registered adult family members.
3. **Online Application Portal**:
   - Navigate to Citizen Services -> Change Household Head Application;
   - Select the successor candidate and upload supporting documentation.
4. **Review & Effective Timeline**:
   - Reviewed by the district supervisor within **5 working days**;
   - Upon approval, the head role is updated automatically without interruption to household rations.`,
      ar: `وفقاً للضوابط التشغيلية لمنظومة البطاقة التموينية الإلكترونية ودليل توارث رب الأسرة، تكون الإجراءات والشروط كما يلي:

1. **الأولوية القانونية للتنازل/الخلافة**:
   - المرتبة الأولى: الزوج/الزوجة الباقي على قيد الحياة بحكم القانون؛
   - المرتبة الثانية: في حال عدم وجود زوج أو التنازل الخطي، يتم التوافق على أحد الأبناء المسجلين البالغين (18 عاماً فأكثر).
2. **المستندات المطلوبة**:
   - شهادة الوفاة الرسمية (أو حجة حصر الإرث / قرار المحكمة)؛
   - حجة إثبات صلة القرابة المصدقة أو القيد العائلي؛
   - إقرار موافقة خطي موقع من جميع أفراد الأسرة البالغين المسجلين.
3. **طريقة التقديم عبر المنظومة**:
   - الدخول إلى [خدمات المواطنين] -> [طلب تغيير رب الأسرة]؛
   - اختيار المرشح الجديد وتحميل صور المستندات المطلوبة.
4. **المدة الزمنية للتدقيق**:
   - يتم تدقيق المعاملة من المشرف الإداري خلال **5 أيام عمل** دون انقطاع الحصة التموينية.`,
      ku: `بەپێی ڕێنماییە کارگێڕییەکانی سیستەمی کارتی بەشەخۆراک و گواستنەوەی سەرۆکی خێزان، ڕێکارەکان بەم شێوەیەن:

1. **پلەبەندی یاسایی بۆ شوێنگرتنەوە**:
   - پلەی یەکەم: هاوسەری یاسایی کە لە ژیاندا ماوە لە پێشینەیە؛
   - پلەی دووەم: لە کاتی نەبوونی هاوسەر یان دەستبەرداربوون، یەکێک لە منداڵە باڵغەکان (١٨ ساڵ و بەرەو سەرەوە) بە ڕەزامەندی.
2. **بەڵگەنامە پێویستەکان**:
   - بڕوانامەی فەرمی کۆچی دوایی یان بڕیاری دادگا؛
   - بەڵگەنامەی سەلماندنی خزمایەتی یان قەیدی باری شارستانی؛
   - ڕەزامەندی نووسراوی سەرجەم ئەندامە باڵغەکانی خێزان.
3. **شێوازی پێشکەشکردن لە سیستەم**:
   - چوونە ژوورەوە بۆ [خزمەتگوزاری هاووڵاتیان] -> [داواکاری گۆڕینی سەرۆکی خێزان]؛
   - هەڵبژاردنی سەرۆکی نوێ و بارکردنی بەڵگەنامەکان.
4. **ماوەی پێداچوونەوە**:
   - لە ماوەی **5 ڕۆژی کارکردن** لەلایەن سەرپەرشتیارەوە پەسەند دەکرێت بەبێ پچڕانی بەشەخۆراک.`
    },
    sourceIds: ['CHUNK-GUIDE-003', 'CHUNK-POLICY-001'],
    suggestQuestions: {
      zh: [
        '变更户主申请提交后需要多久审核通过？',
        '如果其他家庭成员对新户主产生争议该如何处理？',
        '原户主健在但年迈重病，可以自愿移交户主身份吗？'
      ],
      en: [
        'How long does it take for a head change application to be reviewed?',
        'How are disputes among family members over the new head resolved?',
        'Can an elderly head voluntarily transfer status to an adult child?'
      ],
      ar: [
        'كم يستغرق تدقيق طلب تغيير رب الأسرة؟',
        'كيف يتم التعامل مع النزاعات العائلية حول رب الأسرة الجديد؟',
        'هل يجوز لرب الأسرة المسن التنازل طوعاً لأحد أبنائه؟'
      ],
      ku: [
        'پێداچوونەوەی داواکاری گۆڕینی سەرۆکی خێزان چەند دەخایەنێت؟',
        'چۆن کێشەی نێوان ئەندامانی خێزان لەسەر سەرۆکی نوێ چارەسەر دەکرێت؟',
        'ئایا سەرۆکی بەتەمەن دەتوانێت بە ئارەزوومەندانە دەستبەردار بێت؟'
      ]
    }
  },

  // 3. 代理转移 (Agent transfer)
  transferAgent: {
    key: 'transferAgent',
    keywords: [
      '转移', '代理', '网点', '搬家', '迁址', '换网点', '换代理',
      'transfer', 'agent', 'branch', 'relocation', 'move', 'switch agent',
      'نقل', 'وكيل', 'منفذ', 'انتقال', 'سكن جديد', 'تبديل الوكيل',
      'گواستنەوە', 'بریکار', 'ماڵگواستنەوە', 'لق', 'گۆڕینی بریکار'
    ],
    userQuestion: {
      zh: '搬家到新的行政区，如何申请把配给卡转移到新的代理网点？',
      en: 'How to transfer the ration card to a new agent upon relocation?',
      ar: 'كيفية نقل البطاقة التموينية إلى وكيل غذائي جديد عند الانتقال؟',
      ku: 'چۆن کارتی بەشەخۆراک بگوازمەوە بۆ بریکارێکی نوێ لە کاتی ماڵگواستنەوە؟'
    },
    answer: {
      zh: `根据《跨行政区与跨代理网点定点转移办理指南》（MOT-UG-2026-007）及代理网点容量管理规定：

1. **受理条件与频次限制**：
   - 因常住地搬迁、工作调动或网点撤并需要变更定点网点者均可申请；
   - 同一家庭原则上**每 6 个月内仅允许申请转移一次**；当月已在原网点领取口粮的，当月配额不予追溯转移。
2. **目标网点容量红线限制**：
   - 目标网点服务家庭总数不得超过 **1,500 户**系统容量上限。若目标网点已满额，需选择相邻的备选网点。
3. **办理流程**：
   - 进入【公民服务 -> 申请代理转移】页面；
   - 选取拟迁入的目标省份、行政区及目标代理网点，上传新常住地址的正式租赁合同或不动产凭证；
4. **生效时效**：
   - 线上审核通过后，系统于**次月 1 日零时**正式将全家物资配额划转至新网点。`,
      en: `According to the Inter-District & Inter-Agent Transfer Guidelines (MOT-UG-2026-007) and branch quota rules:

1. **Conditions & Frequency Limit**:
   - Permitted for relocation, job transfer, or branch consolidation;
   - Families are allowed **one transfer every 6 months**; rations already claimed for the current month cannot be retroactively transferred.
2. **Branch Capacity Threshold**:
   - Target branch cannot exceed the **1,500 household** system cap. If saturated, an adjacent branch must be chosen.
3. **Procedure**:
   - Visit Citizen Services -> Apply for Agent Transfer;
   - Select target province, district and agent branch, then upload lease agreement or property deed;
4. **Effective Date**:
   - Once approved, quota transfers to the new agent at **00:00 on the 1st of next month**.`,
      ar: `بموجب دليل التحويل بين الوكلاء الغذائيين (MOT-UG-2026-007) وضوابط سعة المنافذ التموينية:

1. **شروط التحويل والتكرار**:
   - يحق للمواطن التحويل عند تغيير محل السكن أو العمل؛
   - يُسمح بالتحويل **مرة واحدة كل 6 أشهر**، ولا تُحول حصة الشهر الجاري إذا استلمت مسبقاً من الوكيل القديم.
2. **الحد الأقصى لسعة الوكيل**:
   - لا يجوز للوكيل تجاوز سقف **1,500 أسرة**. في حال امتلاء الوكيل، يجب اختيار وكيل بديل مجاور.
3. **خطوات المعاملة الإلكترونية**:
   - الدخول إلى [خدمات المواطنين] -> [طلب نقل الوكيل الغذائي]؛
   - تحديد المحافظة والقضاء والوكيل الجديد، ورفع عقد الإيجار أو سند الملكية المصدق؛
4. **موعد نفاذ النقل**:
   - بعد التدقيق والموافقة، تنتقل الحصة رسمياً في **اليوم الأول من الشهر التالي**.`,
      ku: `بەپێی ڕێنماییەکانی گواستنەوەی نێوان بریکارەکان (MOT-UG-2026-007) و مەرجەکانی ژمارەی بەشداربووان:

1. **مەرجەکانی گواستنەوە**:
   - ڕێگەپێدراوە لە کاتی ماڵگواستنەوە یان گۆڕینی شوێنی کار؛
   - هەر خێزانێک دەتوانێت **هەر 6 مانگ جارێک** داوای گواستنەوە بکات؛ بەشەخۆراکی وەرگیراوی ئەم مانگە ناگوازرێتەوە.
2. **سنووری بەشداربووانی بریکار**:
   - بریکار نابێت زیاتر لە **1,500 خێزان** وەربگرێت، ئەگەر پڕ بوو دەبێت بریکارێکی نزیک هەڵبژێردرێت.
3. **هەنگاوەکانی پێشکەشکردن**:
   - چوون بۆ [خزمەتگوزاری هاووڵاتیان] -> [داواکاری گواستنەوەی بریکار]؛
   - هەڵبژاردنی پارێزگا و بریکاری نوێ، و بارکردنی گرێبەستی خانوو یان تاپۆ؛
4. **کاتی کارابوون**:
   - دوای پەسەندکردن، لە **١ی مانگی داهاتووەوە** بەشەخۆراک دەچێتە لای بریکاری نوێ.`
    },
    sourceIds: ['CHUNK-GUIDE-004', 'CHUNK-POLICY-001'],
    suggestQuestions: {
      zh: [
        '如果目标网点已达 1500 户上限无法迁入怎么办？',
        '代理转移提交申请后可以撤回取消吗？',
        '如何查询我家附近所有正常营业的代理网点清单？'
      ],
      en: [
        'What if the target agent branch reached the 1500 household cap?',
        'Can an agent transfer application be cancelled after submission?',
        'How to view the list of active agent branches near my residence?'
      ],
      ar: [
        'ماذا أفعل إذا بلغ الوكيل الحد الأقصى 1500 أسرة؟',
        'هل يمكن إلغاء طلب نقل الوكيل بعد إرساله؟',
        'كيف أستعلم عن قائمة الوكلاء العاملين بالقرب من سكني؟'
      ],
      ku: [
        'ئەگەر بریکاری مەبەست گەیشتبووە 1500 خێزان چی بکەم؟',
        'ئایا دەتوانرێت داواکاری گواستنەوەی بریکار هەڵبوەشێنرێتەوە؟',
        'چۆن لیستی بریکارە چالاکەکانی نزیک ماڵمان ببینم؟'
      ]
    }
  },

  // 4. 账号解冻 (Unfreeze account)
  unfreeze: {
    key: 'unfreeze',
    keywords: [
      '解冻', '冻结', '锁死', '休眠', '无法领取', '封禁',
      'unfreeze', 'freeze', 'locked', 'dormant', 'blocked', 'reactivate',
      'تجميد', 'فك التجميد', 'حساب معطل', 'إلغاء التجميد', 'إعادة تفعيل',
      'سڕکردن', 'بەستن', 'چالاککردنەوە', 'کارتی وەستاو', 'قفڵ'
    ],
    userQuestion: {
      zh: '配给卡账户为什么会被冻结？如何在线上申请解冻恢复发放？',
      en: 'Why was the ration card account frozen and how to unfreeze online?',
      ar: 'لماذا تم تجميد حساب البطاقة وكيفية تقديم طلب فك التجميد؟',
      ku: 'بۆچی کارتی بەشەخۆراک بەستراوە و چۆن لە ڕێگەی ئۆنلاینەوە چالاکی بکەمەوە؟'
    },
    answer: {
      zh: `关于数字配给卡账户冻结原因及线上解冻指引：

1. **常见冻结诱因**：
   - **连续 90 天（3 个月）未核销**：系统自动启动休眠防冒领保护锁；
   - **人口库比对疑义**：与民政/医院数据库比对时发现疑似双重户籍或死亡未注销待核查；
   - **代理网点失联异常核查上报**。
2. **线上解冻申办流程**：
   - 户主登录系统进入【公民服务 -> 申请解冻申报】；
   - 按提示完成**活体人脸识别自证**，拍摄上传手持国民身份证清晰照；
   - 填写连续未领取原因说明（如：外地就医、出差、被派驻工作等）并提交；
3. **复核办结时效**：
   - 稽查中心专职坐席将于 **24 - 48 小时**内完成远程视频或电话核实，核准后系统即刻恢复正常发粮状态。`,
      en: `Reasons for ration card account freeze and online unfreezing guidelines:

1. **Common Freeze Causes**:
   - **Inactive for 90 consecutive days (3 months)**: Dormancy protection lock triggered automatically;
   - **Registry Discrepancy**: Cross-check with civil database flagged potential duplicate or unverified record;
   - **Agent Branch Audit Flag**.
2. **Online Unfreeze Procedure**:
   - Log in and navigate to Citizen Services -> Apply to Unfreeze;
   - Complete **live facial recognition** and upload a photo holding national ID;
   - Provide reason for inactivity (medical treatment, travel, deployment, etc.);
3. **Review Timeline**:
   - Audit desk completes verification within **24 - 48 hours**, restoring active ration entitlement immediately.`,
      ar: `أسباب تجميد حساب البطاقة التموينية وطريقة فك التجميد إلكترونياً:

1. **أسباب التجميد الشائعة**:
   - **عدم الاستلام لمدة 90 يوماً متتالية (3 أشهر)**: قفل أمان تلقائي لمنع الاستلام غير المشروع؛
   - **تضارب في السجل المدني**: اشتباه في قيد مزدوج أو تحديثات قيد التدقيق؛
   - **ملاحظات تدقيق من الوكيل الغذائي**.
2. **خطوات فك التجميد الإلكتروني**:
   - الدخول إلى [خدمات المواطنين] -> [طلب فك تجميد البطاقة]؛
   - إجراء **التحقق البيومتري للوجه** ورفع صورة واضحة مع البطاقة الوطنية الموحدة؛
   - ذكر سبب عدم الاستلام (علاج خارج المحافظة، سفر، مهمة عمل رسمية)؛
3. **مدة المعالجة**:
   - يكمل فريق التدقيق المراجعة خلال **24 - 48 ساعة** ويعاد تفعيل الحساب فوراً.`,
      ku: `هۆکارەکانی سڕکردنی کارتی بەشەخۆراک و شێوازی چالاککردنەوەی ئۆنلاین:

1. **هۆکارە باوەکانی سڕکردن**:
   - **وەرنەگرتنی بەشەخۆراک بۆ 90 ڕۆژی لەسەریەک (3 مانگ)**: قفڵی پاراستنی خۆکار بۆ ڕێگری لە فەوتان؛
   - **ناڕێکی لە تۆماری باری شارستانی**: گومانی تۆماری دووبارە یان پێویستی بە نوێکردنەوە؛
   - **ڕاپۆرتی پشکنینی بریکار**.\n2. **هەنگاوەکانی چالاککردنەوە لە سیستەم**:
   - چوونە سەر [خزمەتگوزاری هاووڵاتیان] -> [داواکاری چالاککردنەوەی کارت]؛
   - ئەنجامدانی **پشکنینی دەموچاو** و بارکردنی وێنەی ڕوونی کارتی نیشتمانی؛
   - ڕوونکردنەوەی هۆکاری وەرنەگرتن (نەخۆشی، گەشت، کار)؛
3. **ماوەی پێداچوونەوە**:
   - لە ماوەی **24 - 48 کاتژمێردا** وردبینی دەکرێت و کارتەکە کارا دەکرێتەوە.`
    },
    sourceIds: ['CHUNK-GUIDE-005', 'CHUNK-POLICY-001'],
    suggestQuestions: {
      zh: [
        '线上解冻申请被驳回后如何重新申诉？',
        '由于在境外长期工作导致账户冻结，需要补充哪些证明材料？',
        '可以直接前往线下配给中心现场窗口办理即时解冻吗？'
      ],
      en: [
        'How to appeal if an unfreeze application is rejected?',
        'What documents are required if frozen due to overseas work?',
        'Can I visit an offline ration center for instant unfreezing?'
      ],
      ar: [
        'كيف أقدم اعتراضاً إذا تم رفض طلب فك التجميد؟',
        'ما هي الوثائق المطلوبة عند التجميد بسبب الإقامة خارج البلاد؟',
        'هل يمكن مراجعة مركز التموين الميداني لفك التجميد فوراً؟'
      ],
      ku: [
        'ئایا دەتوانم تانە بدەم ئەگەر داواکاری چالاککردنەوە ڕەتکرایەوە؟',
        'چ بەڵگەنامەیەک پێویستە ئەگەر بەهۆی مانەوە لە دەرەوە کارتەکە بەسترابێت؟',
        'ئایا دەتوانم سەردانی ناوەندی بەشەخۆراک بکەم بۆ چالاککردنەوەی دەستبەجێ؟'
      ]
    }
  }
};

// 3. 人工客服专员资料与多语言文案
export const MULTI_LANG_AGENTS = [
  {
    id: 'AGENT-CS-8092',
    badgeNo: 'CS-8092',
    names: {
      zh: '萨拉赫 · 阿卜杜勒',
      en: 'Salah Abdul',
      ar: 'صلاح عبد',
      ku: 'سەلاح عەبدول'
    },
    departments: {
      zh: '贸易部配给署 7×24 综合客服应急调度中心',
      en: 'Ministry of Trade 24/7 Citizen Care & Emergency Dispatch Center',
      ar: 'وزارة التجارة - مركز الطوارئ والدعم الشامل 7×24',
      ku: 'وەزارەتی بازرگانی - ناوەندی فریاگوزاری و خزمەتگوزاری هاووڵاتیان 7×24'
    },
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    initialGreetings: {
      zh: '您好！我是 7×24 人工客服专员 萨拉赫 (CS-8092)。已同步您的完整会话上下文，请问有什么可以协助您？',
      en: 'Hello! I am desk officer Salah Abdul (CS-8092). Your conversation history has been synchronized. How may I assist you today?',
      ar: 'مرحباً بكم! أنا موظف الدعم المباشر صلاح عبد (CS-8092). تمت مزامنة سجل محادثتكم بالكامل، كيف يمكنني مساعدتكم اليوم؟',
      ku: 'سڵاو! من فەرمانبەری پشتگیری ڕاستەوخۆ سەلاح عەبدولم (CS-8092). تەواوی مێژووی گفتوگۆکەت هاوکات کرا، چۆن دەتوانم هاوکاریت بکەم؟'
    }
  }
];

// 4. 人工客服回复预设库 (按关键字或情景)
export const MULTI_LANG_HUMAN_REPLIES = {
  docs: {
    keywords: ['材料', '证明', '上传', '图片', '照片', 'doc', 'proof', 'upload', 'file', 'وثيقة', 'مستند', 'رفع', 'بەڵگەنامە'],
    replies: {
      zh: '已在业务系统核验您的身份。有关补充证明材料，请确保照片或扫描件字迹清晰，支持 PDF 或 JPG 格式，单个文件大小不超过 10MB。系统将实时进行 OCR 比对。',
      en: 'Your identity has been verified in the system. For supplementary documentation, please ensure the photos/scans are legible, in PDF or JPG format under 10MB. The system performs automated OCR validation.',
      ar: 'تم التحقق من هويتكم في المنظومة. بخصوص المستندات الإضافية، يرجى التأكد من وضوح الصورة بصيغة PDF أو JPG بحجم لا يتجاوز 10 ميغابايت، حيث يتم الفحص الآلي بواسطة المنظومة.',
      ku: 'ناسنامەکەت لە سیستەمدا پشتڕاستکرایەوە. سەبارەت بە بەڵگەنامە هاوپێچەکان، تکایە دڵنیابە وێنەکان ڕوونن و بە فۆرماتی PDF یان JPG کە لە 10 مێگابایت زیاتر نەبێت.'
    }
  },
  urgent: {
    keywords: ['催办', '加急', '进度', '时间', '多久', 'urgent', 'expedite', 'status', 'progress', 'عاجل', 'تسريع', 'وقت', 'پەلە', 'کات'],
    replies: {
      zh: '已为您将本条服务工单标注为【加急督办】。所在辖区责任监督官将在 24 小时内完成复核，请您留意平台站内消息及短信通知。',
      en: 'Your ticket has been flagged as "Urgent Priority". The district supervisor will conclude the review within 24 hours. Please watch for system notifications and SMS.',
      ar: 'تم وسم التذكرة كأولوية قصوى "عاجل جداً". سيقوم المشرف الإداري للقضاء بإكمال التدقيق خلال 24 ساعة، يرجى متابعة الإشعارات في المنظومة.',
      ku: 'داواکارییەکەت وەک [بەپەلە] نیشانە کرا. سەرپەرشتیاری ناوچەکەت لە ماوەی 24 کاتژمێردا پێداچوونەوە تەواو دەکات، تکایە ئاگاداری پەیامەکانی سیستەم بە.'
    }
  },
  thanks: {
    keywords: ['谢谢', '感谢', '好的', '明白', 'thank', 'ok', 'great', 'شكرا', 'تمام', 'ممنون', 'سوپاس'],
    replies: {
      zh: '非常荣幸为您服务！保障国家口粮配给每一位公民的合法权益是我们的职责。如果您还有其他问题，随时可以向我提问；若业务已办结，可在上方点击【结束人工】。',
      en: 'It is an honor to assist you! Safeguarding every citizen\'s ration entitlement is our duty. Feel free to ask if you have more questions, or click "End Live Session" above when done.',
      ar: 'يسعدني خدمتكم دائماً! حماية حقوق المواطنين في الحصة التموينية واجبنا. إذا كانت لديكم استفسارات أخرى تفضلوا بطرحها، أو يمكنكم إنهاء الجلسة من الزر أعلاه.',
      ku: 'خۆشحاڵم بە خزمەتکردنتان! پاراستنی مافی بەشەخۆراکی هاووڵاتیان ئەرکی ئێمەیە. ئەگەر پرسیاری دیکەت هەیە فەرموو، یان دەتوانیت لە سەرەوە کۆتایی بە گفتوگۆ بهێنیت.'
    }
  },
  default: {
    keywords: [],
    replies: {
      zh: '已收到您的信息并记录到当前服务工单中。后台正在协调专席人员调取您的户籍与配额档案，请稍候。',
      en: 'Your message has been logged to the active service ticket. Our dispatch team is accessing your registry and quota record, please hold on.',
      ar: 'تم استلام رسالتكم وتوثيقها في التذكرة. يقوم الفريق المختص بمطابقة سجل العائلة والحصة التموينية، يرجى الانتظار.',
      ku: 'پەیامەکەت گەیشت و لە پسوولەی خزمەتگوزاری تۆمار کرا. تیمی پسپۆڕ خەریکی وەرگرتنی زانیارییەکانی خێزان و بەشەخۆراکەکەتن، تکایە چاوەڕێ بە.'
    }
  }
};

/**
 * 智能判定消息所属主题并提取多语言包
 * @param {string} text 用户输入的文本
 * @returns {Object} 匹配到的主题对象或 null
 */
export function matchTopic(text = '') {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // 1. 严格全匹配用户预设问题
  for (const topic of Object.values(MULTI_LANG_TOPICS)) {
    for (const q of Object.values(topic.userQuestion)) {
      if (lower === q.toLowerCase()) return topic;
    }
  }

  // 2. 关键词匹配
  for (const topic of Object.values(MULTI_LANG_TOPICS)) {
    if (topic.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return topic;
    }
  }

  return null;
}

/**
 * 获取特定出处切片在指定语言下的结构化对象
 */
export function getTranslatedSource(sourceId, lang = 'zh') {
  const item = MULTI_LANG_SOURCES[sourceId];
  if (!item) return null;
  return {
    id: item.id,
    kbId: item.kbId,
    title: item.titles[lang] || item.titles.zh,
    docType: item.docTypes[lang] || item.docTypes.zh,
    docNumber: item.docNumber,
    clause: item.clauses[lang] || item.clauses.zh,
    issuingAgency: item.issuingAgencies[lang] || item.issuingAgencies.zh,
    publishDate: item.publishDate,
    score: item.score,
    content: item.contents[lang] || item.contents.zh,
    summary: item.clauses[lang] || item.clauses.zh
  };
}
