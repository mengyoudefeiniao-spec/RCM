// “我的”模块使用独立词包，四种已上线语言保持相同的键结构。
export default {
  zh: {
    nav: '我的', title: '我的', citizenTitle: '公民账户', agentTitle: '代理账户',
    citizenSubtitle: '管理个人资料与配给消息', agentSubtitle: '管理网点、配送人员与业务消息',
    demoCitizenName: '艾哈迈德·哈桑·萨利赫', demoAgentName: '穆罕默德·贾巴尔·拉希德',
    demoCitizenAddress: '巴格达市卡尔赫区曼苏尔街区14号', demoAgentAddress: '巴格达市卡尔赫区曼苏尔商业街18号',
    demoOutletName: '卡尔赫第一配给中心综合代销站', demoCenterName: '卡尔赫第一配给中心',
    verified: '已验证', authorized: '已授权',
    overview: '概览', notifications: '通知', outlets: '网点', couriers: '人员',
    unreadCount: '{count} 条未读', notificationCenter: '通知中心', markAllRead: '全部标为已读',
    noNotifications: '暂无通知', unread: '未读', viewRelated: '查看相关业务',
    contactTitle: '联系资料', email: '邮箱', phone: '电话号码', address: '收货地址',
    editContact: '编辑资料', saveContact: '保存资料', contactSaved: '资料已保存',
    invalidProfile: '请填写有效的邮箱、电话号码和收货地址',
    outletInfo: '代理网点信息', outletCode: '网点编号', center: '所属中心',
    outletStatus: '经营状态', outletActive: '正常营业', outletInactive: '停用',
    outletAddress: '网点地址', outletPhone: '联系电话', noOutlets: '暂无代理网点',
    courierManagement: '配送人员管理', addCourier: '新增配送人员', editCourier: '编辑配送人员',
    courierName: '姓名', vehicleNo: '车辆编号', active: '在岗', inactive: '停用',
    saveCourier: '保存人员', deleteCourier: '删除', deleteCourierConfirm: '确定删除这名配送人员吗？',
    courierSaved: '配送人员已保存', courierDeleted: '配送人员已删除',
    noCouriers: '暂无配送人员', invalidCourier: '请填写姓名和有效的电话号码', selectCourier: '选择已登记配送人员',
    todayOverview: '业务概览', outletCount: '我的网点', courierCount: '配送人员',
    pendingItems: '待处理事项', pendingStock: '库存告警需要处理', pendingDelivery: '配送通知待确认',
    changePassword: '修改密码', currentPassword: '当前密码', newPassword: '新密码',
    confirmPassword: '确认新密码', passwordHint: '新密码至少 8 位',
    passwordTooShort: '新密码至少需要 8 位', passwordMismatch: '两次输入的新密码不一致',
    currentPasswordWrong: '当前密码不正确', invalidCredentials: '账号或密码不正确',
    passwordChanged: '密码已修改', logout: '退出登录', logoutSuccess: '已安全退出登录',
    loadFailed: '加载账户资料失败', saveFailed: '保存失败，请重试',
    notice: {
      citizen: {
        review: { title: '审核结果', body: '您的配给业务申请已有新的审核结果，请查看办理进度。' },
        material: { title: '补充材料', body: '有一项申请需要补充证明材料，请及时提交。' },
        ration: { title: '待领取配给', body: '本月家庭配给已备妥，可前往指定网点领取。' },
        system: { title: '系统通知', body: '请核对您的联系方式与收货地址，确保业务通知及时送达。' }
      },
      agent: {
        review: { title: '审核结果', body: '代理业务申请已更新审核状态，请查看办理记录。' },
        stock: { title: '库存告警', body: '部分配给商品库存低于预警线，请及时补货。' },
        delivery: { title: '配送通知', body: '有新的配送任务等待网点确认。' },
        system: { title: '系统通知', body: '请保持配送人员和网点联系信息为最新状态。' }
      }
    }
  },
  en: {
    nav: 'My', title: 'My Account', citizenTitle: 'Citizen Account', agentTitle: 'Agent Account',
    citizenSubtitle: 'Manage your profile and ration updates', agentSubtitle: 'Manage outlets, couriers and updates',
    demoCitizenName: 'Ahmed Hassan Saleh', demoAgentName: 'Mohammed Jabbar Al-Rasheed',
    demoCitizenAddress: '14 Mansour Block, Karkh, Baghdad', demoAgentAddress: '18 Mansour Commercial St, Karkh, Baghdad',
    demoOutletName: 'Karkh First Ration Center Distribution Station', demoCenterName: 'Karkh First Ration Center',
    verified: 'Verified', authorized: 'Authorized',
    overview: 'Overview', notifications: 'Notifications', outlets: 'Outlets', couriers: 'Couriers',
    unreadCount: '{count} unread', notificationCenter: 'Notification Center', markAllRead: 'Mark all as read',
    noNotifications: 'No notifications', unread: 'Unread', viewRelated: 'View related item',
    contactTitle: 'Contact Details', email: 'Email', phone: 'Phone number', address: 'Delivery address',
    editContact: 'Edit details', saveContact: 'Save details', contactSaved: 'Details saved',
    invalidProfile: 'Enter a valid email, phone number and delivery address',
    outletInfo: 'Agent Outlet Information', outletCode: 'Outlet code', center: 'Ration center',
    outletStatus: 'Operating status', outletActive: 'Active', outletInactive: 'Inactive',
    outletAddress: 'Outlet address', outletPhone: 'Contact number', noOutlets: 'No outlets available',
    courierManagement: 'Courier Management', addCourier: 'Add courier', editCourier: 'Edit courier',
    courierName: 'Name', vehicleNo: 'Vehicle number', active: 'Active', inactive: 'Inactive',
    saveCourier: 'Save courier', deleteCourier: 'Delete', deleteCourierConfirm: 'Delete this courier?',
    courierSaved: 'Courier saved', courierDeleted: 'Courier deleted',
    noCouriers: 'No couriers yet', invalidCourier: 'Enter a name and valid phone number', selectCourier: 'Select a registered courier',
    todayOverview: 'Business Overview', outletCount: 'My outlets', courierCount: 'Couriers',
    pendingItems: 'Items requiring attention', pendingStock: 'Stock alert requires action', pendingDelivery: 'Delivery awaiting confirmation',
    changePassword: 'Change password', currentPassword: 'Current password', newPassword: 'New password',
    confirmPassword: 'Confirm new password', passwordHint: 'Use at least 8 characters',
    passwordTooShort: 'New password must be at least 8 characters', passwordMismatch: 'New passwords do not match',
    currentPasswordWrong: 'Current password is incorrect', invalidCredentials: 'Invalid username or password',
    passwordChanged: 'Password changed', logout: 'Log out', logoutSuccess: 'Signed out securely',
    loadFailed: 'Could not load account details', saveFailed: 'Could not save; please try again',
    notice: {
      citizen: {
        review: { title: 'Review result', body: 'A ration service request has a new review result. Check its progress.' },
        material: { title: 'Additional documents', body: 'A request needs supporting documents. Please submit them soon.' },
        ration: { title: 'Ration ready for collection', body: 'Your family ration is ready at the assigned outlet.' },
        system: { title: 'System notice', body: 'Check your contact and delivery details to receive updates.' }
      },
      agent: {
        review: { title: 'Review result', body: 'An agent application has a new review status. Check your records.' },
        stock: { title: 'Stock alert', body: 'Some ration items are below the stock threshold. Please replenish them.' },
        delivery: { title: 'Delivery notice', body: 'A new delivery task is awaiting outlet confirmation.' },
        system: { title: 'System notice', body: 'Keep courier and outlet contact details up to date.' }
      }
    }
  },
  ar: {
    nav: 'حسابي', title: 'حسابي', citizenTitle: 'حساب المواطن', agentTitle: 'حساب الوكيل',
    citizenSubtitle: 'إدارة البيانات الشخصية وإشعارات الحصة التموينية', agentSubtitle: 'إدارة المنافذ والمندوبين والإشعارات',
    demoCitizenName: 'أحمد حسن صالح', demoAgentName: 'محمد جبار الرشيد',
    demoCitizenAddress: 'محلة المنصور 14، الكرخ، بغداد', demoAgentAddress: 'شارع المنصور التجاري 18، الكرخ، بغداد',
    demoOutletName: 'منفذ التوزيع الشامل بمركز الكرخ الأول', demoCenterName: 'مركز الكرخ الأول للتموين',
    verified: 'تم التحقق', authorized: 'معتمد',
    overview: 'نظرة عامة', notifications: 'الإشعارات', outlets: 'المنافذ', couriers: 'المندوبون',
    unreadCount: '{count} غير مقروءة', notificationCenter: 'مركز الإشعارات', markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات', unread: 'غير مقروء', viewRelated: 'عرض المعاملة',
    contactTitle: 'بيانات الاتصال', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', address: 'عنوان التسليم',
    editContact: 'تعديل البيانات', saveContact: 'حفظ البيانات', contactSaved: 'حُفظت البيانات',
    invalidProfile: 'أدخل بريداً إلكترونياً ورقم هاتف وعنوان تسليم صالحاً',
    outletInfo: 'معلومات منفذ الوكيل', outletCode: 'رمز المنفذ', center: 'مركز التموين',
    outletStatus: 'حالة التشغيل', outletActive: 'نشط', outletInactive: 'متوقف',
    outletAddress: 'عنوان المنفذ', outletPhone: 'هاتف الاتصال', noOutlets: 'لا توجد منافذ',
    courierManagement: 'إدارة مندوبي التوصيل', addCourier: 'إضافة مندوب', editCourier: 'تعديل مندوب',
    courierName: 'الاسم', vehicleNo: 'رقم المركبة', active: 'في الخدمة', inactive: 'متوقف',
    saveCourier: 'حفظ المندوب', deleteCourier: 'حذف', deleteCourierConfirm: 'هل تريد حذف هذا المندوب؟',
    courierSaved: 'حُفظت بيانات المندوب', courierDeleted: 'حُذف المندوب',
    noCouriers: 'لا يوجد مندوبون', invalidCourier: 'أدخل اسماً ورقم هاتف صالحاً', selectCourier: 'اختر مندوب توصيل مسجلاً',
    todayOverview: 'نظرة على الأعمال', outletCount: 'منافذي', courierCount: 'المندوبون',
    pendingItems: 'بنود تحتاج إلى متابعة', pendingStock: 'تنبيه مخزون يحتاج إلى معالجة', pendingDelivery: 'توصيل بانتظار التأكيد',
    changePassword: 'تغيير كلمة المرور', currentPassword: 'كلمة المرور الحالية', newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة', passwordHint: 'ثمانية أحرف على الأقل',
    passwordTooShort: 'يجب أن تتكون كلمة المرور الجديدة من ثمانية أحرف على الأقل', passwordMismatch: 'كلمتا المرور الجديدتان غير متطابقتين',
    currentPasswordWrong: 'كلمة المرور الحالية غير صحيحة', invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    passwordChanged: 'تغيرت كلمة المرور', logout: 'تسجيل الخروج', logoutSuccess: 'تم تسجيل الخروج بأمان',
    loadFailed: 'تعذر تحميل بيانات الحساب', saveFailed: 'تعذر الحفظ، حاول مرة أخرى',
    notice: {
      citizen: {
        review: { title: 'نتيجة التدقيق', body: 'صدرت نتيجة جديدة لتدقيق طلبك التمويني. راجع حالة المعاملة.' },
        material: { title: 'استكمال المستندات', body: 'يتطلب أحد طلباتك مستندات داعمة إضافية. يرجى تقديمها قريباً.' },
        ration: { title: 'حصة جاهزة للاستلام', body: 'حصة أسرتك لهذا الشهر جاهزة للاستلام من المنفذ المحدد.' },
        system: { title: 'إشعار النظام', body: 'تحقق من بيانات الاتصال وعنوان التسليم لتصلك الإشعارات.' }
      },
      agent: {
        review: { title: 'نتيجة التدقيق', body: 'تغيرت حالة تدقيق طلب الوكالة. راجع سجل المعاملات.' },
        stock: { title: 'تنبيه المخزون', body: 'انخفض مخزون بعض المواد التموينية دون الحد المحدد. يرجى إعادة التزويد.' },
        delivery: { title: 'إشعار التوصيل', body: 'هناك مهمة توصيل جديدة تنتظر تأكيد المنفذ.' },
        system: { title: 'إشعار النظام', body: 'حافظ على تحديث بيانات اتصال المنفذ ومندوبي التوصيل.' }
      }
    }
  },
  ckb: {
    nav: 'هەژمارەکەم', title: 'هەژمارەکەم', citizenTitle: 'هەژماری هاووڵاتی', agentTitle: 'هەژماری بریکار',
    citizenSubtitle: 'بەڕێوەبردنی زانیاری کەسی و ئاگادارکردنەوەکانی بەشەخۆراک', agentSubtitle: 'بەڕێوەبردنی بنکەکان و گەیەنەران و ئاگادارکردنەوەکان',
    demoCitizenName: 'ئەحمەد حەسەن ساڵح', demoAgentName: 'محەمەد جەبار ڕەشید',
    demoCitizenAddress: 'گەڕەکی مەنسوور ١٤، کەرخ، بەغدا', demoAgentAddress: 'شەقامی بازرگانی مەنسوور ١٨، کەرخ، بەغدا',
    demoOutletName: 'بنکەی گشتی دابەشکردنی ناوەندی یەکەمی کەرخ', demoCenterName: 'ناوەندی یەکەمی بەشەخۆراکی کەرخ',
    verified: 'پشتڕاستکراو', authorized: 'ڕێپێدراو',
    overview: 'پوختە', notifications: 'ئاگادارکردنەوەکان', outlets: 'بنکەکان', couriers: 'گەیەنەران',
    unreadCount: '{count} نەخوێندراو', notificationCenter: 'ناوەندی ئاگادارکردنەوە', markAllRead: 'هەمووی وەک خوێندراو دیاری بکە',
    noNotifications: 'ئاگادارکردنەوە نییە', unread: 'نەخوێندراو', viewRelated: 'بینینی کاروباری پەیوەندیدار',
    contactTitle: 'زانیاری پەیوەندی', email: 'ئیمەیڵ', phone: 'ژمارەی تەلەفۆن', address: 'ناونیشانی گەیاندن',
    editContact: 'دەستکاریکردنی زانیاری', saveContact: 'پاشەکەوتکردنی زانیاری', contactSaved: 'زانیاری پاشەکەوتکرا',
    invalidProfile: 'ئیمەیڵ و ژمارەی تەلەفۆن و ناونیشانی گەیاندنی دروست بنووسە',
    outletInfo: 'زانیاری بنکەی بریکار', outletCode: 'کۆدی بنکە', center: 'ناوەندی بەشەخۆراک',
    outletStatus: 'دۆخی کارکردن', outletActive: 'چالاک', outletInactive: 'ناچالاک',
    outletAddress: 'ناونیشانی بنکە', outletPhone: 'ژمارەی پەیوەندی', noOutlets: 'بنکە نییە',
    courierManagement: 'بەڕێوەبردنی گەیەنەران', addCourier: 'زیادکردنی گەیەنەر', editCourier: 'دەستکاریکردنی گەیەنەر',
    courierName: 'ناو', vehicleNo: 'ژمارەی ئۆتۆمبێل', active: 'لە کاردایە', inactive: 'ناچالاک',
    saveCourier: 'پاشەکەوتکردنی گەیەنەر', deleteCourier: 'سڕینەوە', deleteCourierConfirm: 'دڵنیایت لە سڕینەوەی ئەم گەیەنەرە؟',
    courierSaved: 'گەیەنەر پاشەکەوتکرا', courierDeleted: 'گەیەنەر سڕایەوە',
    noCouriers: 'هێشتا گەیەنەر نییە', invalidCourier: 'ناو و ژمارەی تەلەفۆنی دروست بنووسە', selectCourier: 'گەیەنەری تۆمارکراو هەڵبژێرە',
    todayOverview: 'پوختەی کار', outletCount: 'بنکەکانم', courierCount: 'گەیەنەران',
    pendingItems: 'کارە چاوەڕوانەکان', pendingStock: 'هۆشداری کۆگا پێویستی بە چارەسەرە', pendingDelivery: 'گەیاندنێک چاوەڕوانی پشتڕاستکردنەوەیە',
    changePassword: 'گۆڕینی وشەی نهێنی', currentPassword: 'وشەی نهێنی ئێستا', newPassword: 'وشەی نهێنی نوێ',
    confirmPassword: 'پشتڕاستکردنەوەی وشەی نهێنی نوێ', passwordHint: 'لانیکەم ٨ پیت',
    passwordTooShort: 'وشەی نهێنی نوێ دەبێت لانیکەم ٨ پیت بێت', passwordMismatch: 'دوو وشەی نهێنی نوێ یەک ناگرنەوە',
    currentPasswordWrong: 'وشەی نهێنی ئێستا هەڵەیە', invalidCredentials: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە',
    passwordChanged: 'وشەی نهێنی گۆڕدرا', logout: 'دەرچوون', logoutSuccess: 'بە سەلامەتی دەرچوویت',
    loadFailed: 'بارکردنی زانیاری هەژمار سەرکەوتوو نەبوو', saveFailed: 'پاشەکەوتکردن سەرکەوتوو نەبوو؛ دووبارە هەوڵ بدە',
    notice: {
      citizen: {
        review: { title: 'ئەنجامی وردبینی', body: 'ئەنجامێکی نوێ بۆ وردبینی داواکاریی بەشەخۆراکەکەت دەرچووە. دۆخی داواکارییەکە ببینە.' },
        material: { title: 'تەواوکردنی بەڵگەنامەکان', body: 'یەکێک لە داواکارییەکانت پێویستی بە بەڵگەنامەی زیاتر هەیە. تکایە بە زوویی پێشکەشی بکە.' },
        ration: { title: 'بەشەخۆراک ئامادەیە بۆ وەرگرتن', body: 'بەشەخۆراکی ئەم مانگەی خێزانەکەت لە بنکەی دیاریکراو ئامادەیە.' },
        system: { title: 'ئاگادارکردنەوەی سیستەم', body: 'زانیاری پەیوەندی و ناونیشانی گەیاندنت بپشکنە بۆ گەیشتنی ئاگادارکردنەوەکان.' }
      },
      agent: {
        review: { title: 'ئەنجامی وردبینی', body: 'دۆخی وردبینی داواکاریی بریکاری نوێکرایەوە. تۆمارەکان ببینە.' },
        stock: { title: 'هۆشداری کۆگا', body: 'بڕی هەندێک کەلوپەلی بەشەخۆراک لە سنووری هۆشداری کەمترە. تکایە پڕی بکەرەوە.' },
        delivery: { title: 'ئاگادارکردنەوەی گەیاندن', body: 'ئەرکی گەیاندنی نوێ چاوەڕوانی پشتڕاستکردنەوەی بنکەیە.' },
        system: { title: 'ئاگادارکردنەوەی سیستەم', body: 'زانیاری پەیوەندی بنکە و گەیەنەران بە نوێیی بهێڵەرەوە.' }
      }
    }
  }
};
