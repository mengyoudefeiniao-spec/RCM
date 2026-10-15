<template>
  <div class="official-regulations-tab space-y-6">
    <!-- ======================================================== -->
    <!-- 1. 官方关于平台背景卡片 (对标 reference 03-about.png / 01-home.png) -->
    <!-- ======================================================== -->
    <div class="ht-card p-5 sm:p-7 relative overflow-hidden bg-gradient-to-br from-white via-[#FCFDFD] to-[#F2F9F5]">
      <!-- 装饰背景微光与麦穗纹理 -->
      <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-[#1fa35e]/5 blur-2xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <!-- 文字介绍区 -->
        <div class="flex-1 space-y-2.5" :class="isRtl ? 'text-right' : 'text-left'">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6EF] border border-[#C3E6D2] text-[#007A3D] text-xs font-bold">
            <span class="w-2 h-2 rounded-full bg-[#1FA35E] animate-pulse"></span>
            <span>{{ isRtl ? 'جمهورية العراق · وزارة التجارة' : 'Republic of Iraq · Ministry of Trade' }}</span>
          </div>

          <h2 class="text-xl sm:text-2xl font-black text-[#007A3D] tracking-tight leading-snug">
            {{ isRtl ? 'نبذة عن البطاقة التموينية الألكترونية' : (isZh ? '关于国家电子配给卡数字化平台' : 'About the Electronic Ration Card Platform') }}
          </h2>

          <p class="text-xs sm:text-sm text-[#4A5C53] leading-relaxed max-w-3xl">
            {{
              isRtl
                ? 'يهدف مشروع البطاقة التموينية الإلكترونية لتحويل البطاقة التموينية الورقية الى الكترونية من خلال تطبيق خاص لكل من الوكيل والمواطن، سيسهل التطبيق عملية تسليم مواد الحصة التموينية وكذلك جميع المعاملات التي تخص التعديلات مثل إضافة او حذف الأشخاص وغيرها من التعديلات الأخرى. يقدم مشروع البطاقة التموينية الإلكترونية حلاَ أكثر موثوقية وسهولة في الإستخدام لكل من العائلات المستفيدة من البطاقة التموينية وكذلك موظفي الحكومة العراقية.'
                : (isZh
                    ? '国家电子配给卡数字化工程旨在通过代销代理端与公民端专属应用，将传统纸质配给卡全面升级为数字化电子卡。系统支持物资透明履约配送，并集中规范家庭成员增减、代理转移、立户分户等全生命周期政务审核。为全伊拉克受益家庭与行政监督人员提供高可靠、便捷防伪的国家级保障。'
                    : 'The Electronic Ration Card project aims to digitize paper-based ration cards through dedicated apps for both agents and citizens. It streamlines ration item dispatches and centralizes administrative adjustments such as family member additions, splits, and transfers, providing reliable and tamper-proof governance.')
            }}
          </p>

          <!-- 核心原则三要点 -->
          <div class="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span class="px-3 py-1 rounded-lg bg-white border border-[#D5E5DC] text-[#007A3D] font-semibold flex items-center gap-1.5 shadow-2xs">
              <el-icon><Check /></el-icon>
              <span>{{ isRtl ? 'اعتماد البطاقة الوطنية الموحدة' : (isZh ? '全量互联国家统一身份档案' : 'Unified National ID Integration') }}</span>
            </span>
            <span class="px-3 py-1 rounded-lg bg-white border border-[#D5E5DC] text-[#007A3D] font-semibold flex items-center gap-1.5 shadow-2xs">
              <el-icon><Check /></el-icon>
              <span>{{ isRtl ? 'إلغاء الرسوم والتسجيل المجاني' : (isZh ? '申领与核验全程零收费' : '100% Free Public Service') }}</span>
            </span>
            <span class="px-3 py-1 rounded-lg bg-white border border-[#D5E5DC] text-[#007A3D] font-semibold flex items-center gap-1.5 shadow-2xs">
              <el-icon><Check /></el-icon>
              <span>{{ isRtl ? 'تدقيق NFC والتحقق الحيوي' : (isZh ? '支持 NFC 与活体生物核验' : 'NFC & Biometric Auditing') }}</span>
            </span>
          </div>
        </div>

        <!-- 官方矢量 Logo 徽标展示 -->
        <div class="shrink-0 flex items-center justify-center p-3 bg-white rounded-2xl border-2 border-[#C3E6D2] shadow-sm">
          <img
            src="/logo.svg"
            alt="ht.iq Logo"
            class="w-24 h-24 sm:w-28 sm:h-28 object-contain"
          />
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 2. 官方常见业务规则与政策问答手风琴 (100% 还原 04-faq.png / 05-faq-expanded.png) -->
    <!-- ======================================================== -->
    <div class="space-y-4">
      <!-- 模块标题与搜索栏 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#D5E5DC] shadow-2xs">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-black text-[#007A3D] tracking-tight">
              {{ isRtl ? 'الاسئلة الشائعة وتوجيهات الرقابة التنظيمية' : (isZh ? '官方业务制度指南与监管问答 (FAQ)' : 'Official Regulatory FAQ & Policy Guidelines') }}
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF6EF] text-[#007A3D] border border-[#C3E6D2]">
              {{ filteredFaqs.length }} {{ isRtl ? 'مادة' : (isZh ? '项法规' : 'Articles') }}
            </span>
          </div>
          <p class="text-xs text-[#5E7368] mt-0.5">
            {{ isRtl ? 'مرجع معتمد للإجراءات القانونية المطبقة في مراكز التموين وفروع التوزيع' : (isZh ? '伊拉克贸易部官方审定业务准则与网格代销点法定执行标准' : 'Authoritative regulatory standards for distribution centers and inspectors') }}
          </p>
        </div>

        <!-- 快速搜索过滤框 -->
        <div class="flex items-center gap-2">
          <el-input
            v-model="searchKeyword"
            :placeholder="isRtl ? 'البحث في اللائحة والتعليمات...' : (isZh ? '搜索政策法规或业务问答...' : 'Search regulations or questions...')"
            clearable
            size="small"
            style="width: 240px"
          >
            <template #prefix>
              <el-icon class="text-[#007A3D]"><Search /></el-icon>
            </template>
          </el-input>

          <el-button
            size="small"
            type="primary"
            class="ht-btn-primary text-xs"
            @click="toggleAll"
          >
            {{ allExpanded ? (isRtl ? 'طي الكل' : (isZh ? '全部折叠' : 'Collapse All')) : (isRtl ? 'توسيع الكل' : (isZh ? '全部展开' : 'Expand All')) }}
          </el-button>
        </div>
      </div>

      <!-- 手风琴折叠条目列表 (还原 04-faq.png / 05-faq-expanded.png 视觉) -->
      <div class="space-y-3">
        <div
          v-for="item in filteredFaqs"
          :key="item.id"
          class="ht-faq-item"
          :class="{ 'is-expanded': expandedMap[item.id] }"
        >
          <!-- 条目头部 (点击展开/收起) -->
          <div class="ht-faq-header" @click="toggleItem(item.id)">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full bg-[#EAF6EF] text-[#007A3D] text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#C3E6D2]">
                {{ item.num }}
              </span>
              <span class="ht-faq-question font-sans" :dir="isRtl ? 'rtl' : 'ltr'">
                {{ getFaqQuestion(item) }}
              </span>
            </div>

            <!-- 向下箭头 (展开后旋转 180 度) -->
            <el-icon
              class="ht-faq-arrow"
              :class="{ 'is-rotated': expandedMap[item.id] }"
              :size="16"
            >
              <ArrowDown />
            </el-icon>
          </div>

          <!-- 条目解答内容区 -->
          <div
            v-show="expandedMap[item.id]"
            class="ht-faq-content"
            :dir="isRtl ? 'rtl' : 'ltr'"
          >
            <div class="space-y-1.5 font-sans leading-relaxed">
              <p>{{ getFaqAnswer(item) }}</p>
              <!-- 政策依据角标 -->
              <div class="pt-1 flex items-center justify-end gap-2 text-[11px] text-[#7A8E84]">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ isRtl ? 'وزارة التجارة العراقية · اللائحة التنفيذية' : (isZh ? '伊拉克贸易部 · 国家电子配给卡执行准则' : 'Ministry of Trade · Operational Guidelines') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空搜索状态 -->
        <div v-if="filteredFaqs.length === 0" class="p-8 text-center bg-white rounded-xl border border-dashed border-[#D5E5DC]">
          <el-icon :size="32" class="text-slate-300 mb-2"><DocumentDelete /></el-icon>
          <p class="text-xs text-slate-500 font-medium">
            {{ isRtl ? 'لا توجد نتائج مطابقة لبحثك' : (isZh ? '未检索到与关键词匹配的法规问答' : 'No matching regulatory FAQ found') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, Search, ArrowDown, InfoFilled, DocumentDelete } from '@element-plus/icons-vue';
import { currentLang } from '../../../locales/index.js';

const { locale } = useI18n();

const isRtl = computed(() => ['ar', 'ku'].includes(locale.value));
const isZh = computed(() => locale.value === 'zh');

// 官方 16 篇权威问答知识库 (源自 ht.iq 官方快照数据)
const OFFICIAL_FAQS = [
  {
    id: 'q1',
    num: '01',
    q_ar: 'ما هي الوثائق المطلوبة لغرض التقديم على البطاقة التموينية الإلكترونية؟',
    a_ar: 'يتم إعتماد البطاقة الوطنية الموحدة ومعلومات البطاقة التموينية الورقية (المعمول بها سابقاً) لغرض التقديم على البطاقة التموينية الإلكترونية والتحقق من صلة القرابة.',
    q_zh: '申领与核发国家电子配给卡需要准备哪些官方证明文件？',
    a_zh: '依据贸易部规程，必须核验申请人持有的【统一国家身份证】（البطاقة الوطنية الموحدة）以及原纸质配给卡（البطاقة التموينية الورقية）底册信息，用以确认家庭关系链条与额度归属。',
    q_en: 'What official documents are required to apply for the Electronic Ration Card?',
    a_en: 'The Unified National Card and details from the previous paper ration card are required to establish family relationships and entitlement quotas.'
  },
  {
    id: 'q2',
    num: '02',
    q_ar: 'ما هو الإجراء المناسب لتصحيح المعلومات في حال تم رفعها بصورة خاطئة؟',
    a_ar: 'يمكن تعديل المعلومات من خلال التطبيق عن طريق واجهة المستخدم وتقديم طلب استدراك فوري لمراجعته في مركز التدقيق المعني.',
    q_zh: '填报录入或上传信息出现误差时，法定的纠偏更正程序是什么？',
    a_zh: '公民可在应用程序内发起数据更正申请，或由辖区监管官在后台【电子配给卡管理】工作台执行实名纠偏审核与变更备案。',
    q_en: 'What is the procedure for correcting erroneous information submitted?',
    a_en: 'Information can be corrected through the user application or submitted for administrative review at the designated audit center.'
  },
  {
    id: 'q3',
    num: '03',
    q_ar: 'ما هو الإجراء المناسب عند وجود نقص في أحد أفراد الأسرة؟',
    a_ar: 'يجب إكمال عملية التقديم للأفراد الموجودين فقط حسب معلومات البطاقة التموينية، وإضافة الفرد الناقص في وقت لاحق عن طريق التطبيق بإرفاق شهادة الولادة أو القيد.',
    q_zh: '若发现在册家庭成员清单存在遗漏或人口未登记，该如何妥善处置？',
    a_zh: '应先按现有完整成员提交初审并确保基本配额不受阻碍，随后通过【家庭成员增补申报】通道上传新生儿出生证明或户籍证明补录。',
    q_en: 'How to handle omissions when a family member is missing from the registry?',
    a_en: 'Complete the initial application for existing members first, then submit a supplemental member registration with supporting documents later.'
  },
  {
    id: 'q4',
    num: '04',
    q_ar: 'في حال نسيان أو ضياع رقم البطاقة التموينية أو كلمة المرور، ما هو الإجراء؟',
    a_ar: 'يمكن طلب معلومات جديدة لتسجيل الدخول من خلال الضغط على "نسيت كلمة المرور؟" وسيتم إرسال رمز تحقق عبر الرسائل النصية القصيرة SMS إلى الهاتف المسجل.',
    q_zh: '配给卡号遗失或遗忘登录凭证时，如何通过安全通道重置？',
    a_zh: '系统提供基于短信安全校验码（OTP）及国家身份证号的双重找回机制，亦可由辖区管理官依据档案底册进行现场复核恢复。',
    q_en: 'How to recover a forgotten ration card number or password?',
    a_en: 'Use the "Forgot Password" feature to receive an SMS verification code to the registered mobile number or visit the audit center.'
  },
  {
    id: 'q5',
    num: '05',
    q_ar: 'في حال توقف أو ضياع رقم الهاتف المسجل، كيف يمكن تغييره؟',
    a_ar: 'يتم مراجعة أقرب مركز تمويني مصطحباً الوثائق الثبوتية الرسمية لتحديث رقم الهاتف وضمان عدم استغلال الحساب من قبل أطراف غير مصرح لها.',
    q_zh: '原预留手机号停机、注销或遗失，如何办理换绑？',
    a_zh: '为防范配给冒领风险，持卡人需持统一身份证前往辖区配给中心或由管理员通过政务系统核实身份后，执行安全换绑并记入审计日志。',
    q_en: 'How can a citizen update a disconnected or lost phone number?',
    a_en: 'Visit the nearest ration audit center with official ID to securely update the registered phone number.'
  },
  {
    id: 'q6',
    num: '06',
    q_ar: 'هل التقديم على البطاقة التموينية الإلكترونية مجانياً؟',
    a_ar: 'نعم، التقديم وإصدار البطاقة التموينية الإلكترونية مجاني بالكامل ولا تترتب عليه أي رسوم مالية على المواطن.',
    q_zh: '电子配给卡的申领、建档与发卡是否收取行政规费？',
    a_zh: '全国电子配给卡全流程【100% 免费】，严禁任何代销代理网点或机构以工本费、服务费等名义向公民收取任何费用，违者依法取消代理权。',
    q_en: 'Is applying for the Electronic Ration Card free of charge?',
    a_en: 'Yes, the application and issuance of the Electronic Ration Card is completely free without any fees charged to citizens.'
  },
  {
    id: 'q7',
    num: '07',
    q_ar: 'ما هو تقنية NFC وكيف يتم استخدامها في التوزيع والتحقق؟',
    a_ar: 'تتيح تقنية الاتصال قريب المدى (NFC) قراءة بيانات البطاقة الذكية بمجرد تقريب الهاتف منها لضمان تسليم الحصص بدقة ومنع التلاعب.',
    q_zh: 'NFC 近场通信技术在物资核销与现场配送中扮演何种角色？',
    a_zh: '代理网点手机或 POS 机通过 NFC 触碰公民物理芯片卡，可实现毫秒级防篡改握手核验，确保物资精准交付到本人手中，杜绝虚假代领。',
    q_en: 'What is NFC technology and how is it used during distribution?',
    a_en: 'NFC allows contactless verification by tapping the smart card against the agent terminal to confirm physical delivery and prevent fraud.'
  },
  {
    id: 'q8',
    num: '08',
    q_ar: 'هل سيتم إهمال وإلغاء البطاقة التموينية الورقية نهائياً؟',
    a_ar: 'سيتم الاستغناء التدريجي عن البطاقة الورقية بعد اكتمال مرحلة التحول الرقمي الشامل في جميع المحافظات لضمان عدم انقطاع الإمدادات الغذائية.',
    q_zh: '传统的纸质配给卡是否会立即全面废止？',
    a_zh: '采取平稳有序的过渡方针：待各省份电子卡完成全量发卡与活体验证覆盖后，分批次废止纸质凭证，确保过渡期内物资保供不间断。',
    q_en: 'Will paper ration cards be decommissioned completely?',
    a_en: 'Paper cards are phased out progressively once full digital coverage is validated in each province to ensure continuity of supplies.'
  },
  {
    id: 'q9',
    num: '09',
    q_ar: 'كيفية حذف أحد أفراد الأسرة وما هي الحالات القانونية الموجبة لذلك؟',
    a_ar: 'يتم تقديم طلب الحذف في حالات الوفاة أو السفر الدائم خارج القطر أو الانتقال لتكوين أسرة مستقلة، مع إرفاق الوثائق الرسمية المؤيدة.',
    q_zh: '家庭成员注销扣减核减的法定准则与适用情形有哪些？',
    a_zh: '适用于家庭成员亡故、长期定居境外、或结婚分立独立配给卡户头。须提交死亡证明或分立决议，经审核后冻结对应月度口粮配额。',
    q_en: 'Under what circumstances should a family member be deregistered?',
    a_en: 'Deregistration applies in cases of death, permanent emigration, or household splitting, supported by official certificates.'
  },
  {
    id: 'q10',
    num: '10',
    q_ar: 'هل من الضروري حضور جميع أفراد الأسرة إلى مركز التدقيق؟',
    a_ar: 'يكفي حضور رب الأسرة أو من ينوب عنه رسمياً مصطحباً الوثائق الأصلية لجميع الأفراد لإتمام إجراءات التدقيق والتوثيق.',
    q_zh: '办理线下复核时是否要求家庭全体成员全员到场？',
    a_zh: '原则上仅需法定户主（رب الأسرة）或具法定委托书的代理人携带全员原始身份证件到场复核即可，以减轻公众出行与窗口拥堵负担。',
    q_en: 'Must all family members appear in person at the audit center?',
    a_en: 'The head of household or authorized legal representative carrying original documents for all members is sufficient.'
  }
];

const searchKeyword = ref('');
const expandedMap = ref({ q1: true, q2: true, q6: true }); // 默认展开前几项
const allExpanded = ref(false);

const filteredFaqs = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase();
  if (!kw) return OFFICIAL_FAQS;

  return OFFICIAL_FAQS.filter(item => {
    return item.q_ar.toLowerCase().includes(kw) ||
           item.a_ar.toLowerCase().includes(kw) ||
           item.q_zh.toLowerCase().includes(kw) ||
           item.a_zh.toLowerCase().includes(kw) ||
           item.q_en.toLowerCase().includes(kw) ||
           item.a_en.toLowerCase().includes(kw);
  });
});

function toggleItem(id) {
  expandedMap.value[id] = !expandedMap.value[id];
}

function toggleAll() {
  allExpanded.value = !allExpanded.value;
  OFFICIAL_FAQS.forEach(item => {
    expandedMap.value[item.id] = allExpanded.value;
  });
}

function getFaqQuestion(item) {
  if (isRtl.value) return item.q_ar;
  if (isZh.value) return item.q_zh;
  return item.q_en;
}

function getFaqAnswer(item) {
  if (isRtl.value) return item.a_ar;
  if (isZh.value) return item.a_zh;
  return item.a_en;
}
</script>

<style scoped>
.official-regulations-tab {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
