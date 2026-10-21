// Copy for the household head succession form, its sample document and review ticket.
export default {
  zh: {
    legalBadge: '法定继承与变更',
    applicationType: '法定户主更替申办（继承轮替）',
    applicationReason: '原户主亡故注销，依据死亡证明 #{reference} 申办户主继承轮替。'
  },
  en: {
    legalBadge: 'Legal Succession and Head Replacement',
    applicationType: 'Legal Household Head Succession Application',
    applicationReason: 'Deregistration of the deceased head and appointment of a successor requested under death certificate #{reference}.'
  },
  ar: {
    currentHeadLabel: 'رب الأسرة المتوفى المطلوب شطبه',
    deathDocNoLabel: 'الرقم المرجعي لشهادة الوفاة الصادرة عن الطب العدلي',
    deathDocNoPlaceholder: 'أدخل رقم الوثيقة الرسمية (مثال: DTH-BAG-2026-90182)',
    deathProofTitle: 'شهادة الوفاة العدلية ووثيقة الشطب من السجل المدني',
    deathProofSubtitle: 'ارفع شهادة الوفاة الرسمية ووثيقة الشطب من السجل المدني للتحقق منهما قبل تعيين رب الأسرة البديل',
    deathProofBadge: 'شهادة الوفاة ووثيقة الشطب',
    deathProofIssuer: 'دائرة الطب العدلي بوزارة الصحة ومديرية الأحوال المدنية بوزارة الداخلية',
    deathProofDefaultFile: 'وزارة_الصحة_شهادة_الوفاة_العدلية_ووثيقة_الشطب_DTH-BAG-2026-90182.pdf',
    deathProofOcrSummary: 'تمت مطابقة الرمز الشريطي مع السجل المدني الوطني والتحقق من شهادة الوفاة العدلية وسجل الشطب.',
    candidateSelectPlaceholder: 'اختر رب الأسرة البديل من أفراد الأسرة الحاليين',
    candidateNotice: 'يجب أن يكون من الأقارب المباشرين المسجلين في البطاقة التموينية، وألا يقل عمره عن 18 عاماً، وأن يكون كامل الأهلية المدنية.',
    reviewNoticeTitle: 'إجراءات تدقيق الطلب:',
    reviewNoticeText: 'يُحال الطلب تلقائياً إلى منصة التدقيق لإجراء المراجعة الأولية من الموظف والاعتماد النهائي من المدير.',
    paymentTitle: 'الرسوم القانونية لتعيين رب الأسرة البديل',
    errorUploadProof: 'يرجى رفع شهادة وفاة عدلية ووثيقة شطب من السجل المدني ساريتين!',
    errorSelectCandidate: 'يرجى اختيار رب الأسرة البديل من الأفراد المؤهلين!',
    submitSuccess: 'تم دفع الرسوم وتقديم الطلب بنجاح وإحالته إلى منصة التدقيق للمراجعة.',
    candidateDefault: 'المرشح ليكون رب الأسرة البديل',
    legalBadge: 'الخلافة القانونية وتغيير رب الأسرة',
    applicationType: 'طلب تعيين رب الأسرة البديل',
    applicationReason: 'طلب شطب رب الأسرة المتوفى وتعيين بديل استناداً إلى شهادة الوفاة رقم {reference}.'
  },
  ckb: {
    currentHeadLabel: 'سەرۆکی خێزانی کۆچکردوو کە دەبێت ناوی بسڕدرێتەوە',
    deathDocNoLabel: 'ژمارەی بەڵگەنامەی مردنی پزیشکی داد',
    deathDocNoPlaceholder: 'ژمارەی بەڵگەنامەی فەرمی بنووسە (نموونە: DTH-BAG-2026-90182)',
    deathProofTitle: 'بەڵگەنامەی مردنی پزیشکی داد و بەڵگەی سڕینەوە لە تۆماری مەدەنی',
    deathProofSubtitle: 'پێش دانانی سەرۆکی جێگرەوە، بەڵگەنامەی فەرمی مردن و بەڵگەی سڕینەوە لە تۆماری مەدەنی باربکە بۆ پشتڕاستکردنەوە',
    deathProofBadge: 'بەڵگەنامەی مردن و سڕینەوەی تۆمار',
    deathProofIssuer: 'بەڕێوەبەرایەتی پزیشکی دادی وەزارەتی تەندروستی و بەڕێوەبەرایەتی باری شارستانی وەزارەتی ناوخۆ',
    deathProofDefaultFile: 'وەزارەتی_تەندروستی_بەڵگەنامەی_مردن_و_سڕینەوەی_تۆمار_DTH-BAG-2026-90182.pdf',
    deathProofOcrSummary: 'بارکۆدەکە لەگەڵ تۆماری مەدەنی نیشتمانی بەراورد کرا؛ بەڵگەنامەی مردنی پزیشکی داد و تۆماری سڕینەوە پشتڕاست کرانەوە.',
    candidateSelectPlaceholder: 'سەرۆکی جێگرەوە لە ئەندامەکانی ئێستای خێزان هەڵبژێرە',
    candidateNotice: 'دەبێت لە خزمە ڕاستەوخۆ تۆمارکراوەکانی کارتی خۆراک بێت، تەمەنی لە 18 ساڵ کەمتر نەبێت و توانای تەواوی مامەڵەی مەدەنی هەبێت.',
    reviewNoticeTitle: 'ڕێکاری وردبینی داواکاری:',
    reviewNoticeText: 'داواکارییەکە خۆکارانە دەنێردرێت بۆ سەکۆی وردبینی، بۆ پشکنینی سەرەتایی لەلایەن کارمەند و پەسەندکردنی کۆتایی لەلایەن بەڕێوەبەر.',
    paymentTitle: 'رسوماتی یاسایی دانانی سەرۆکی جێگرەوەی خێزان',
    errorUploadProof: 'تکایە بەڵگەنامەی دروستی مردنی پزیشکی داد و بەڵگەی سڕینەوە لە تۆماری مەدەنی باربکە!',
    errorSelectCandidate: 'تکایە سەرۆکی جێگرەوە لە ئەندامە شیاوەکانی خێزان هەڵبژێرە!',
    submitSuccess: 'رسومات دران و داواکارییەکە بە سەرکەوتوویی پێشکەش کرا و بۆ سەکۆی وردبینی نێردرا.',
    candidateDefault: 'پاڵێوراوی سەرۆکی جێگرەوەی خێزان',
    legalBadge: 'جێنشینی یاسایی و گۆڕینی سەرۆکی خێزان',
    applicationType: 'داواکاری دانانی سەرۆکی جێگرەوەی خێزان',
    applicationReason: 'داواکاری سڕینەوەی سەرۆکی خێزانی کۆچکردوو و دانانی جێگرەوە بەپێی بەڵگەنامەی مردن بە ژمارەی {reference}.'
  }
};
