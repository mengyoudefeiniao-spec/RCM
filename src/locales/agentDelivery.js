// Agent delivery and purchasing surfaces share these keys in all shipped languages.
export default {
  zh: {
    detailTitle: '配送订单详情', details: '查看订单详情', backToOrders: '返回配送订单',
    priorityOverdue: '配送已超时', prioritySoon: '即将超时', priorityCount: '{count} 单需优先处理',
    expectedBy: '最迟配送时间', estimatedDeadline: '根据现有订单时间估算',
    recipient: '收货人', contactPhone: '联系电话', rationCard: '配给卡号', householdSize: '家庭人数',
    deliveryAddress: '收货地址', orderNotes: '配送备注', orderItems: '配给物资',
    deliveryStatus: '配送状态', courier: '配送人员', vehicle: '配送车辆',
    orderTime: '下单时间', deliveryMethod: '履约方式', paymentAmount: '实付金额',
    mapTitle: '收货位置', approximateLocation: '地址未提供精确坐标，地图显示区域参考位置',
    exactLocation: '订单提供的收货坐标', coordinates: '坐标', mapUnavailable: '订单未提供坐标，地图仅显示伊拉克区域',
    detailLoadFailed: '加载订单详情失败', orderNotFound: '未找到该订单',
    filterType: '履约类型', filterStatus: '订单状态', refreshList: '刷新列表',
    centerInfo: '配给中心信息', outletInfo: '所属代理站', centerCode: '中心编号',
    centerAddress: '网点地址', centerPhone: '网点电话', centerHouseholds: '服务家庭',
    centerCapacity: '配给上限', activeCenter: '服务中', noCenter: '暂无配给中心信息',
    demoOrders: {
      '1001': { recipient: '艾哈迈德·哈桑·萨利赫', address: '巴格达省卡尔赫区海法街88号 3号楼201', notes: '家中老人行动不便，送达前请电话联系' },
      '1002': { recipient: '法蒂玛·扎赫拉·侯赛因', address: '巴格达卡尔赫第一代销站（自提）', notes: '预计下午下班后来取' },
      '1003': { recipient: '穆斯塔法·卡迪米', address: '巴格达省卡尔赫区曼苏尔商业街12号 402', notes: '请放置于门口保供安全柜', courier: '哈希姆·阿里（配送员）' }
    }
  },
  en: {
    detailTitle: 'Delivery Order Details', details: 'View order details', backToOrders: 'Back to delivery orders',
    priorityOverdue: 'Delivery overdue', prioritySoon: 'Due soon', priorityCount: '{count} orders need priority',
    expectedBy: 'Delivery deadline', estimatedDeadline: 'Estimated from available order times',
    recipient: 'Recipient', contactPhone: 'Phone', rationCard: 'Ration card', householdSize: 'Household members',
    deliveryAddress: 'Delivery address', orderNotes: 'Delivery notes', orderItems: 'Ration items',
    deliveryStatus: 'Delivery status', courier: 'Courier', vehicle: 'Vehicle',
    orderTime: 'Ordered at', deliveryMethod: 'Fulfillment', paymentAmount: 'Amount paid',
    mapTitle: 'Delivery location', approximateLocation: 'No exact coordinates supplied; map shows an approximate area',
    exactLocation: 'Recipient coordinates supplied with the order', coordinates: 'Coordinates', mapUnavailable: 'No coordinates supplied; map shows Iraq only',
    detailLoadFailed: 'Could not load order details', orderNotFound: 'Order not found',
    filterType: 'Fulfillment type', filterStatus: 'Order status', refreshList: 'Refresh orders',
    centerInfo: 'Ration center information', outletInfo: 'Agent outlet', centerCode: 'Center ID',
    centerAddress: 'Outlet address', centerPhone: 'Outlet phone', centerHouseholds: 'Households served',
    centerCapacity: 'Capacity', activeCenter: 'In service', noCenter: 'No ration center information',
    demoOrders: {
      '1001': { recipient: 'Ahmed Hassan Saleh', address: 'Building 3, Apt 201, Haifa St 88, Karkh, Baghdad', notes: 'Please call before arrival; an elderly family member needs assistance' },
      '1002': { recipient: 'Fatima Zahra Hussein', address: 'Baghdad Karkh 1st Station (Self-Pickup)', notes: 'Will pick up after work in the afternoon' },
      '1003': { recipient: 'Mustafa Al-Kadhimi', address: 'Mansour St 12, Apt 402, Karkh, Baghdad', notes: 'Please leave at the front door if unavailable', courier: 'Hashim Ali (courier)' }
    }
  },
  ar: {
    detailTitle: 'تفاصيل طلب التوصيل', details: 'عرض تفاصيل الطلب', backToOrders: 'العودة إلى طلبات التوصيل',
    priorityOverdue: 'تأخر التوصيل', prioritySoon: 'اقترب موعد التوصيل', priorityCount: '{count} طلبات تتطلب الأولوية',
    expectedBy: 'آخر موعد للتوصيل', estimatedDeadline: 'تقدير استناداً إلى أوقات الطلب المتاحة',
    recipient: 'المستلم', contactPhone: 'رقم الهاتف', rationCard: 'البطاقة التموينية', householdSize: 'أفراد الأسرة',
    deliveryAddress: 'عنوان التوصيل', orderNotes: 'ملاحظات التوصيل', orderItems: 'المواد التموينية',
    deliveryStatus: 'حالة التوصيل', courier: 'مندوب التوصيل', vehicle: 'المركبة',
    orderTime: 'وقت الطلب', deliveryMethod: 'طريقة التسليم', paymentAmount: 'المبلغ المدفوع',
    mapTitle: 'موقع التسليم', approximateLocation: 'لم تُقدَّم إحداثيات دقيقة؛ تعرض الخريطة موقعاً تقريبياً',
    exactLocation: 'إحداثيات المستلم المقدمة مع الطلب', coordinates: 'الإحداثيات', mapUnavailable: 'لم تُقدَّم إحداثيات؛ تعرض الخريطة منطقة العراق فقط',
    detailLoadFailed: 'تعذر تحميل تفاصيل الطلب', orderNotFound: 'لم يتم العثور على الطلب',
    filterType: 'نوع التسليم', filterStatus: 'حالة الطلب', refreshList: 'تحديث الطلبات',
    centerInfo: 'معلومات مركز التموين', outletInfo: 'منفذ الوكيل', centerCode: 'رمز المركز',
    centerAddress: 'عنوان المنفذ', centerPhone: 'هاتف المنفذ', centerHouseholds: 'الأسر المخدومة',
    centerCapacity: 'الحد الأقصى', activeCenter: 'قيد الخدمة', noCenter: 'لا تتوفر معلومات عن مركز التموين',
    demoOrders: {
      '1001': { recipient: 'أحمد حسن صالح', address: 'بناية ٣، شقة ٢٠١، شارع حيفا ٨٨، الكرخ، بغداد', notes: 'يرجى الاتصال قبل الوصول لأن أحد كبار السن يحتاج إلى المساعدة' },
      '1002': { recipient: 'فاطمة الزهراء حسين', address: 'منفذ الكرخ الأول ببغداد (استلام شخصي)', notes: 'سأستلم الطلب بعد العمل مساءً' },
      '1003': { recipient: 'مصطفى الكاظمي', address: 'شارع المنصور ١٢، شقة ٤٠٢، الكرخ، بغداد', notes: 'يرجى ترك الطلب عند الباب إذا لم أكن متاحاً', courier: 'هاشم علي (مندوب التوصيل)' }
    }
  },
  ckb: {
    detailTitle: 'وردەکاری داواکاری گەیاندن', details: 'بینینی وردەکاری داواکاری', backToOrders: 'گەڕانەوە بۆ داواکارییەکانی گەیاندن',
    priorityOverdue: 'گەیاندن دواکەوتووە', prioritySoon: 'کاتی گەیاندن نزیکە', priorityCount: '{count} داواکاری پێویستی بە پێشینەیە',
    expectedBy: 'دوا کاتی گەیاندن', estimatedDeadline: 'خەمڵاندن لەسەر بنەمای کاتی داواکاری',
    recipient: 'وەرگر', contactPhone: 'ژمارەی تەلەفۆن', rationCard: 'کارتی بەشەخۆراک', householdSize: 'ژمارەی ئەندامانی خێزان',
    deliveryAddress: 'ناونیشانی گەیاندن', orderNotes: 'تێبینیی گەیاندن', orderItems: 'کەلوپەلی بەشەخۆراک',
    deliveryStatus: 'دۆخی گەیاندن', courier: 'گەیەنەر', vehicle: 'ئۆتۆمبێل',
    orderTime: 'کاتی داواکاری', deliveryMethod: 'شێوازی وەرگرتن', paymentAmount: 'بڕی پارەدراو',
    mapTitle: 'شوێنی گەیاندن', approximateLocation: 'هاوکێشەی ورد نییە؛ نەخشە شوێنێکی نزیکەیی دەردەخات',
    exactLocation: 'هاوکێشەی وەرگر لەگەڵ داواکاری نێردراوە', coordinates: 'هاوکێشەکان', mapUnavailable: 'هاوکێشە نەدراوە؛ نەخشە تەنها ناوچەی عێراق نیشان دەدات',
    detailLoadFailed: 'بارکردنی وردەکاری داواکاری سەرکەوتوو نەبوو', orderNotFound: 'داواکاری نەدۆزرایەوە',
    filterType: 'جۆری وەرگرتن', filterStatus: 'دۆخی داواکاری', refreshList: 'نوێکردنەوەی داواکارییەکان',
    centerInfo: 'زانیاری ناوەندی بەشەخۆراک', outletInfo: 'بنکەی بریکار', centerCode: 'کۆدی ناوەند',
    centerAddress: 'ناونیشانی بنکە', centerPhone: 'تەلەفۆنی بنکە', centerHouseholds: 'خێزانە خزمەتکراوەکان',
    centerCapacity: 'سنووری توانای کار', activeCenter: 'لە خزمەتدایە', noCenter: 'زانیاری ناوەندی بەشەخۆراک نییە',
    demoOrders: {
      '1001': { recipient: 'ئەحمەد حەسەن ساڵح', address: 'بینا ٣، شووقە ٢٠١، شەقامی حەیفا ٨٨، کەرخ، بەغدا', notes: 'تکایە پێش گەیشتن پەیوەندی بکەن؛ ئەندامێکی بەساڵاچوو پێویستی بە یارمەتییە' },
      '1002': { recipient: 'فاتمە زەهرا حوسێن', address: 'بنکەی یەکەمی کەرخ لە بەغدا (وەرگرتنی کەسی)', notes: 'دوای کار لە ئێوارەدا وەریدەگرم' },
      '1003': { recipient: 'مستەفا کازمی', address: 'شەقامی مەنسوور ١٢، شووقە ٤٠٢، کەرخ، بەغدا', notes: 'ئەگەر لە ماڵەوە نەبووم لەبەردەم دەرگاکە دابنێن', courier: 'هاشم عەلی (گەیەنەر)' }
    }
  }
};
