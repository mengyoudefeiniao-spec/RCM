const messages = {
  zh: { matched: '已匹配订单，请核对物资与库存。', matchedTitle: '核验成功', receipt: '交付回执', title: '物资明细与扣库', issued: '实发', before: '当前库存', after: '交付后库存', paid: '已付自费', subsidy: '财政补贴', stockLoading: '正在获取网点库存…', stockUnavailable: '暂无库存数据', stockLoadFailed: '无法加载网点库存，请重新扫码后重试。', unitKg: 'kg', unitLitre: 'L' },
  en: { matched: 'Order matched. Check the items and stock.', matchedTitle: 'Verified', receipt: 'Handover receipt', title: 'Items & stock deduction', issued: 'Issued', before: 'Current stock', after: 'After handover', paid: 'Citizen paid', subsidy: 'Treasury subsidy', stockLoading: 'Loading outlet stock…', stockUnavailable: 'Stock unavailable', stockLoadFailed: 'Could not load outlet stock. Scan again to retry.', unitKg: 'kg', unitLitre: 'L' },
  ar: { matched: 'تمت مطابقة الطلب. تحقق من المواد والمخزون.', matchedTitle: 'تم التحقق', receipt: 'إيصال التسليم', title: 'المواد وخصم المخزون', issued: 'المصروف', before: 'المخزون الحالي', after: 'بعد التسليم', paid: 'المدفوع من المواطن', subsidy: 'الدعم الحكومي', stockLoading: 'جارٍ تحميل مخزون المنفذ…', stockUnavailable: 'المخزون غير متوفر', stockLoadFailed: 'تعذر تحميل مخزون المنفذ. أعد المسح للمحاولة مجدداً.', unitKg: 'كجم', unitLitre: 'لتر' },
  ckb: { matched: 'داواکاری گونجا. کەلوپەل و کۆگا بپشکنە.', matchedTitle: 'پشتڕاست کرایەوە', receipt: 'پسووڵەی ڕادەستکردن', title: 'کەلوپەل و کەمکردنەوەی کۆگا', issued: 'دراو', before: 'کۆگای ئێستا', after: 'دوای ڕادەستکردن', paid: 'پارەی هاووڵاتی', subsidy: 'یارمەتیی حکومی', stockLoading: 'کۆگای بنکە بار دەکرێت…', stockUnavailable: 'زانیاریی کۆگا نییە', stockLoadFailed: 'نەتوانرا کۆگای بنکە باربکرێت. دووبارە سکان بکە.', unitKg: 'کگم', unitLitre: 'لیتر' }
};

const scannerMessages = {
  zh: { capturePhoto: '拍照识别', supportedCodes: '支持配给订单、公民电子配给卡及采购凭证二维码。', cardNotFound: '未找到对应的电子配给卡，请核对卡号后重新扫码。' },
  en: { capturePhoto: 'Take a photo', supportedCodes: 'Scan ration orders, citizen ration cards or procurement vouchers.', cardNotFound: 'The ration card was not found. Check the card number and scan again.' },
  ar: { capturePhoto: 'التقاط صورة', supportedCodes: 'امسح رموز طلبات التموين أو بطاقات المواطنين أو قسائم الشراء.', cardNotFound: 'لم يتم العثور على البطاقة التموينية. تحقق من رقمها وأعد المسح.' },
  ckb: { capturePhoto: 'وێنە بگرە', supportedCodes: 'کۆدی داواکاریی بەشەخۆراک، کارتی هاووڵاتی یان پسووڵەی کڕین سکان بکە.', cardNotFound: 'کارتی بەشەخۆراک نەدۆزرایەوە. ژمارەکە بپشکنە و دووبارە سکان بکە.' }
};

const cardInformationMessages = {
  zh: { cardInfoTitle: '电子配给卡用户信息', cardInfoLoading: '正在读取用户信息…', cardInfoUnavailable: '暂时无法读取用户信息，请稍后重试。' },
  en: { cardInfoTitle: 'Ration Card User Information', cardInfoLoading: 'Loading user information…', cardInfoUnavailable: 'User information could not be loaded. Please try again later.' },
  ar: { cardInfoTitle: 'معلومات صاحب البطاقة التموينية', cardInfoLoading: 'جارٍ تحميل معلومات صاحب البطاقة…', cardInfoUnavailable: 'تعذر تحميل معلومات صاحب البطاقة. يرجى المحاولة لاحقاً.' },
  ckb: { cardInfoTitle: 'زانیاریی خاوەنی کارتی بەشەخۆراک', cardInfoLoading: 'زانیاریی خاوەن کارت بار دەکرێت…', cardInfoUnavailable: 'نەتوانرا زانیاریی خاوەن کارت بار بکرێت. تکایە دواتر هەوڵ بدەوە.' }
};

export default Object.fromEntries(Object.entries(messages).map(([lang, labels]) => [lang, { ...labels, ...scannerMessages[lang], ...cardInformationMessages[lang] }]));
