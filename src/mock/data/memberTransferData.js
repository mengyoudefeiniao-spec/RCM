/**
/**
 * 成员转移业务数据源与智能识别候选池
 * 严格对齐伊拉克配给卡转移规程：
 * - 妻子转移：妻子与丈夫同家庭编号且双方父亲姓名不同，自动批准
 * - 子女转移：在第140地区外满足家庭编号与父亲名字一致则自动批准；第140地区内始终转电子审核
 * - 监护/抚养/其他原因：始终转电子审核
 * - 未在系统中更新者：系统直接阻断无法办理
 */

export const MOCK_TRANSFERABLE_MEMBERS = [
  {
    nationalId: '198302194821',
    name: '萨米拉·卡西姆·哈米德',
    relationType: 'wife',
    relationLabel: '妻子 (配偶)',
    gender: '女',
    birthDate: '1983-02-19',
    fatherName: '卡西姆·哈米德', // 与艾哈迈德的父亲"哈桑·萨利赫"不同
    familyCode: 'FAM-BAG-08832', // 与当前新卡家庭编号一致
    currentCardNo: 'RC-99081293',
    currentProvince: '巴格达省 (Baghdad)',
    currentCenterName: '鲁萨法第二配给中心 (#08)',
    isArticle140Area: false,
    isUpdatedInSystem: true,
    faceVerified: true,
    suggestedReason: '民事缔结婚姻，配偶由娘家卡转移至夫家新配给卡',
    proofDocName: '伊拉克最高司法委员会民事结婚登记证书_MC-2026-092.pdf'
  },
  {
    nationalId: '198503281094',
    name: '莱拉·马吉德·卡利勒',
    relationType: 'wife',
    relationLabel: '妻子 (未识别)',
    gender: '女',
    birthDate: '1985-03-28',
    fatherName: '马吉德·卡利勒',
    familyCode: 'FAM-DIY-77192', // 与当前新卡家庭编号不一致，无法自动识别
    currentCardNo: 'RC-88129031',
    currentProvince: '迪亚拉省 (Diyala)',
    currentCenterName: '巴古拜第一中心 (#401)',
    isArticle140Area: false,
    isUpdatedInSystem: true,
    faceVerified: true,
    suggestedReason: '跨省结婚迁居，因家庭编号未同步需由分部员工人工核验',
    proofDocName: '巴古拜民事法庭婚姻公证书与户籍档案_DIY-2026-88.pdf'
  },
  {
    nationalId: '201509124481',
    name: '比拉勒·艾哈迈德·哈桑',
    relationType: 'child',
    relationLabel: '子女 (非140地区·条件满足)',
    gender: '男',
    birthDate: '2015-09-12',
    fatherName: '艾哈迈德·哈桑·萨利赫', // 与新卡户主名字完全一致
    familyCode: 'FAM-BAG-08832', // 与新卡家庭编号一致
    currentCardNo: 'RC-77218390',
    currentProvince: '巴格达省 (Baghdad)',
    currentCenterName: '曼苏尔第一配给中心 (#03)',
    isArticle140Area: false,
    isUpdatedInSystem: true,
    faceVerified: true,
    suggestedReason: '户主亲生子女，学籍就近入学转移至新卡',
    proofDocName: '卫生部儿童出生医学公证书及接种存根_BC-2015-BAG.pdf'
  },
  {
    nationalId: '201608219902',
    name: '阿里·艾哈迈德·哈桑',
    relationType: 'child',
    relationLabel: '子女 (第140号决议地区·强制审核)',
    gender: '男',
    birthDate: '2016-08-21',
    fatherName: '艾哈迈德·哈桑·萨利赫',
    familyCode: 'FAM-BAG-08832',
    currentCardNo: 'RC-55092182',
    currentProvince: '基尔库克省 (Kirkuk)', // 第140号决议全境覆盖
    currentCenterName: '基尔库克第一配给中心 (#101)',
    isArticle140Area: true, // 命中第140号决议
    isUpdatedInSystem: true,
    faceVerified: true,
    suggestedReason: '由第140号决议争议领土转移子女，须经分部两级电子审核并附无异议批文',
    proofDocName: '基尔库克民事地位局子女关系证明公函_KIR-2016-41.pdf'
  },
  {
    nationalId: '201011029871',
    name: '塔里克·萨利赫·阿卜杜拉',
    relationType: 'guardianship',
    relationLabel: '法定监护 / 孤儿抚养',
    gender: '男',
    birthDate: '2010-11-02',
    fatherName: '萨利赫·阿卜杜拉',
    familyCode: 'FAM-MOS-44120',
    currentCardNo: 'RC-33129840',
    currentProvince: '尼尼微省 (Nineveh)',
    currentCenterName: '摩苏尔第三配给中心 (#310)',
    isArticle140Area: false,
    isUpdatedInSystem: true,
    faceVerified: true,
    suggestedReason: '亲属身故依法裁决由新卡户主行使合法监护权与抚养义务',
    proofDocName: '最高司法委员会卡尔赫人身地位法庭法定监护判决书_GD-2026-90.pdf'
  },
  {
    nationalId: '200109128833',
    name: '阿德南·努尔·丁',
    relationType: 'child',
    relationLabel: '受限成员 (未在配给卡系统中更新)',
    gender: '男',
    birthDate: '2001-09-12',
    fatherName: '努尔·丁',
    familyCode: 'FAM-BAG-08832',
    currentCardNo: 'RC-11092837',
    currentProvince: '巴格达省 (Baghdad)',
    currentCenterName: '卡尔赫第二配给中心 (#05)',
    isArticle140Area: false,
    isUpdatedInSystem: false, // 核心测试点：未更新！
    faceVerified: false,
    suggestedReason: '未在系统中完成更新，系统将严厉拦截禁止选择',
    proofDocName: ''
  }
];
