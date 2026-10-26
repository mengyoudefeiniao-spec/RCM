export default {
  zh: {
    action: '注销成员', title: '成员死亡注销申请', subtitle: '仅限成员死亡情形。提交法定死亡证明，经初审与终审批准后注销成员，并更新家庭配给人数。',
    member: '指定注销成员', chooseMember: '请选择已故的在册家庭成员', identity: '成员身份信息', deathProofNo: '死亡证明编号', deathProofPlaceholder: '填写法定死亡证明上的编号',
    proof: '上传死亡证明', proofHint: '上传 PDF、JPG 或 PNG 原件扫描件，最大 10 MB。证明须对应所选成员，真实性由审核人员核验。', chooseFile: '选择证明文件', noFile: '尚未选择死亡证明',
    confirmed: '我确认所选成员已经死亡，所提供的死亡证明真实且属于该成员。', noticeTitle: '审核与注销说明', notice: '提交申请不会立即注销成员。审核批准后，该成员将移出在册名单，其档案和证明保留备查；驳回不影响现有档案。',
    successor: '继任户主', chooseSuccessor: '请选择其他在册成员接任户主', successorHint: '注销户主时须同时指定符合条件的继任户主。', noSuccessor: '暂无可接任的有效成员，请先联系配给中心处理户主继任。',
    submit: '提交注销申请', submitSuccess: '注销成员申请已提交至审核工作台', errorMember: '请选择有效的在册家庭成员', errorProof: '请填写死亡证明编号并上传有效死亡证明', errorConfirm: '仅成员死亡可以申请注销，请确认死亡声明', errorSuccessor: '注销户主时请选择有效的继任户主',
    duplicate: '该成员已有待审核的注销申请，请勿重复提交', uploadFailed: '死亡证明保存失败，请重试', invalidFile: '请上传不超过 10 MB 的 PDF、JPG 或 PNG 文件',
    applicationType: '成员死亡注销', reason: '依据死亡证明【{reference}】申请注销已故成员。', reviewPermission: '注销成员审核', downloadProof: '下载死亡证明', pendingProof: '待人工核验', proofFailed: '无法读取死亡证明，请重试', reviewStateError: '请按初审、终审顺序办理该申请',
    reviewSubtitle: '统一受理分户、解冻、户主变更、代理转移、成员录入、成员转移及成员死亡注销申请，支持两级在线审批。'
  },
  en: {
    action: 'Deregister member', title: 'Deceased member deregistration', subtitle: 'For deceased members only. Submit an official death certificate for staff and final review before membership and household ration counts change.',
    member: 'Member to deregister', chooseMember: 'Select the deceased registered member', identity: 'Member identity', deathProofNo: 'Death certificate number', deathProofPlaceholder: 'Enter the number on the official death certificate',
    proof: 'Upload death certificate', proofHint: 'Upload a PDF, JPG or PNG scan, up to 10 MB. The certificate must identify the selected member and will be checked by a reviewer.', chooseFile: 'Choose certificate', noFile: 'No death certificate selected',
    confirmed: 'I confirm that this member is deceased and that the death certificate is authentic and belongs to this member.', noticeTitle: 'Review and deregistration', notice: 'Submitting does not immediately deregister the member. Approval removes them from the registered list and retains their record and certificate for audit. Rejection leaves the household unchanged.',
    successor: 'Successor household head', chooseSuccessor: 'Select another registered member as head', successorHint: 'Deregistering the household head requires an eligible successor.', noSuccessor: 'No eligible successor is available. Contact the ration center to arrange succession first.',
    submit: 'Submit deregistration request', submitSuccess: 'Deregistration request submitted to the review workbench', errorMember: 'Select a valid registered household member', errorProof: 'Enter the certificate number and upload a valid death certificate', errorConfirm: 'Only deceased members can be deregistered. Confirm the declaration.', errorSuccessor: 'Select an eligible successor when deregistering the household head',
    duplicate: 'A deregistration request for this member is already awaiting review', uploadFailed: 'Could not save the death certificate. Please retry.', invalidFile: 'Upload a PDF, JPG or PNG file no larger than 10 MB',
    applicationType: 'Deceased member deregistration', reason: 'Deregistration of a deceased member requested under death certificate [{reference}].', reviewPermission: 'Review member deregistration', downloadProof: 'Download death certificate', pendingProof: 'Awaiting manual verification', proofFailed: 'Could not read the death certificate. Please retry.', reviewStateError: 'Complete staff review before final review',
    reviewSubtitle: 'Review household splits, unfreezing, head changes, agent transfers, member registration, member transfers and deceased member deregistration through two approval stages.'
  },
  ar: {
    action: 'إلغاء تسجيل فرد', title: 'طلب إلغاء تسجيل فرد متوفى', subtitle: 'للمتوفين فقط. تُرفق شهادة وفاة رسمية للتحقق الأولي والموافقة النهائية قبل تعديل أفراد الأسرة وحصصها التموينية.',
    member: 'الفرد المطلوب إلغاء تسجيله', chooseMember: 'اختر الفرد المتوفى المسجل في الأسرة', identity: 'بيانات هوية الفرد', deathProofNo: 'رقم شهادة الوفاة', deathProofPlaceholder: 'أدخل الرقم الوارد في شهادة الوفاة الرسمية',
    proof: 'رفع شهادة الوفاة', proofHint: 'ارفع نسخة بصيغة PDF أو JPG أو PNG بحجم أقصاه 10 ميغابايت. يجب أن تخص الفرد المحدد، ويتحقق الموظف من صحتها.', chooseFile: 'اختيار الشهادة', noFile: 'لم يتم اختيار شهادة وفاة',
    confirmed: 'أقر بأن الفرد المحدد متوفى وأن شهادة الوفاة صحيحة وتخص هذا الفرد.', noticeTitle: 'المراجعة وإلغاء التسجيل', notice: 'لا يتم إلغاء التسجيل فور تقديم الطلب. بعد الموافقة يُحذف الفرد من القائمة المسجلة مع الاحتفاظ بملفه وشهادته للتدقيق. الرفض لا يغيّر سجل الأسرة.',
    successor: 'رب الأسرة البديل', chooseSuccessor: 'اختر فرداً مسجلاً آخر ليصبح رب الأسرة', successorHint: 'إلغاء تسجيل رب الأسرة يستلزم تحديد بديل مستوفٍ للشروط.', noSuccessor: 'لا يوجد بديل مؤهل. يرجى التواصل مع مركز التموين لترتيب تعيين رب الأسرة أولاً.',
    submit: 'تقديم طلب إلغاء التسجيل', submitSuccess: 'تم إرسال طلب إلغاء التسجيل إلى منصة التدقيق', errorMember: 'اختر فرداً مسجلاً صالحاً من الأسرة', errorProof: 'أدخل رقم شهادة الوفاة وارفع شهادة صالحة', errorConfirm: 'يُلغى التسجيل للمتوفين فقط. يرجى تأكيد الإقرار.', errorSuccessor: 'اختر رب أسرة بديلاً مؤهلاً عند إلغاء تسجيل رب الأسرة',
    duplicate: 'يوجد طلب إلغاء تسجيل لهذا الفرد بانتظار المراجعة', uploadFailed: 'تعذر حفظ شهادة الوفاة. يرجى المحاولة مجدداً.', invalidFile: 'ارفع ملف PDF أو JPG أو PNG لا يتجاوز 10 ميغابايت',
    applicationType: 'إلغاء تسجيل فرد متوفى', reason: 'طلب إلغاء تسجيل فرد متوفى بموجب شهادة الوفاة [{reference}].', reviewPermission: 'تدقيق إلغاء تسجيل الأفراد', downloadProof: 'تنزيل شهادة الوفاة', pendingProof: 'بانتظار التحقق اليدوي', proofFailed: 'تعذرت قراءة شهادة الوفاة. يرجى المحاولة مجدداً.', reviewStateError: 'أكمل التدقيق الأولي قبل الموافقة النهائية',
    reviewSubtitle: 'مراجعة فصل الأسر وإلغاء التجميد وتغيير رب الأسرة ونقل الوكيل وتسجيل الأفراد ونقلهم وإلغاء تسجيل المتوفين عبر مرحلتين من الموافقة.'
  },
  ckb: {
    action: 'هەڵوەشاندنەوەی تۆماری ئەندام', title: 'داواکاری هەڵوەشاندنەوەی تۆماری ئەندامی کۆچکردوو', subtitle: 'تەنها بۆ ئەندامی کۆچکردووە. بڕوانامەی فەرمیی مردن باربکە؛ دوای پشکنینی سەرەتایی و پەسەندی کۆتایی، ژمارەی ئەندام و بەشە خۆراکییەکان نوێ دەکرێنەوە.',
    member: 'ئەندامی مەبەست', chooseMember: 'ئەندامی کۆچکردووی تۆمارکراو هەڵبژێرە', identity: 'زانیاری ناسنامەی ئەندام', deathProofNo: 'ژمارەی بڕوانامەی مردن', deathProofPlaceholder: 'ژمارەی سەر بڕوانامەی فەرمیی مردن بنووسە',
    proof: 'بارکردنی بڕوانامەی مردن', proofHint: 'وێنەی سکانکراو بە PDF، JPG یان PNG تا 10 مێگابایت باربکە. دەبێت بڕوانامەکە هی ئەندامی هەڵبژێردراو بێت و کارمەند پشکنینی بکات.', chooseFile: 'هەڵبژاردنی بڕوانامە', noFile: 'بڕوانامەی مردن هەڵنەبژێردراوە',
    confirmed: 'پشتڕاست دەکەمەوە کە ئەندامەکە کۆچی کردووە و بڕوانامەی مردن ڕاستە و هی ئەو ئەندامەیە.', noticeTitle: 'پشکنین و هەڵوەشاندنەوە', notice: 'ناردنی داواکاری دەستبەجێ تۆمارەکە هەڵناوەشێنێتەوە. دوای پەسەندکردن ئەندام لە لیستی تۆمارکراوەکان لادەبرێت و دۆسیە و بڕوانامەکەی بۆ پشکنین دەپارێزرێن. ڕەتکردنەوە دۆسیەی خێزان ناگۆڕێت.',
    successor: 'سەرۆکی جێگرەوەی خێزان', chooseSuccessor: 'ئەندامێکی تۆمارکراوی تر بۆ سەرۆکایەتی هەڵبژێرە', successorHint: 'هەڵوەشاندنەوەی تۆماری سەرۆکی خێزان پێویستی بە جێگرەوەیەکی شیاو هەیە.', noSuccessor: 'جێگرەوەی شیاو نییە. سەرەتا پەیوەندی بە ناوەندی خۆراکەوە بکە بۆ دیاریکردنی جێگرەوە.',
    submit: 'ناردنی داواکاری هەڵوەشاندنەوە', submitSuccess: 'داواکارییەکە نێردرا بۆ سەکۆی پشکنین', errorMember: 'ئەندامێکی تۆمارکراوی دروستی خێزان هەڵبژێرە', errorProof: 'ژمارەی بڕوانامە بنووسە و بڕوانامەی مردنی دروست باربکە', errorConfirm: 'تەنها تۆماری کۆچکردووان هەڵدەوەشێنرێتەوە. تکایە ڕاگەیاندنەکە پشتڕاست بکەرەوە.', errorSuccessor: 'بۆ هەڵوەشاندنەوەی تۆماری سەرۆکی خێزان جێگرەوەیەکی شیاو هەڵبژێرە',
    duplicate: 'داواکارییەکی هەڵوەشاندنەوە بۆ ئەم ئەندامە چاوەڕێی پشکنینە', uploadFailed: 'بڕوانامەی مردن پاشەکەوت نەکرا. دووبارە هەوڵ بدەرەوە.', invalidFile: 'فایلێکی PDF، JPG یان PNG تا 10 مێگابایت باربکە',
    applicationType: 'هەڵوەشاندنەوەی تۆماری ئەندامی کۆچکردوو', reason: 'داواکاری هەڵوەشاندنەوەی تۆماری کۆچکردوو بەپێی بڕوانامەی مردن [{reference}].', reviewPermission: 'پشکنینی هەڵوەشاندنەوەی تۆماری ئەندام', downloadProof: 'داگرتنی بڕوانامەی مردن', pendingProof: 'چاوەڕوانی پشکنینی دەستی', proofFailed: 'بڕوانامەی مردن نەخوێندرایەوە. دووبارە هەوڵ بدەرەوە.', reviewStateError: 'پشکنینی سەرەتایی پێش پەسەندی کۆتایی تەواو بکە',
    reviewSubtitle: 'پشکنینی جیاکردنەوەی خێزان، لابردنی بەستن، گۆڕینی سەرۆک، گواستنەوەی بریکار، تۆمارکردن و گواستنەوەی ئەندام و هەڵوەشاندنەوەی تۆماری کۆچکردووان بە دوو قۆناغی پەسەندکردن.'
  }
};
