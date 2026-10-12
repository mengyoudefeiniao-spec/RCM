export const MOCK_REVIEW_TICKETS = [
  {
    id: 'REV-SPL-001',
    source: '申请分户',
    categoryType: '单人分户人工审核',
    appType: '配给卡分户 (单人分立路径B)',
    cardNo: 'RC-10029381',
    applicantName: '奥马尔·艾哈迈德·哈桑',
    targetMemberName: '奥马尔·艾哈迈德·哈桑',
    reason: '拟分立成员为单独一人，不满足“夫妻标准组合”系统自动判别条件，转入分部门人员手动审核。',
    status: '待分部初审',
    submittedAt: '2026-10-10 10:15',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: '待决',
    managerNotes: '',
    attachments: [
      { name: '最高司法委员会_民事结婚证书与分立公函_MC-2026-BAG-09921.pdf', type: 'required', verified: true },
      { name: '市政规划委员会_独立常住住宅不动产权公证书与租约_ADD-2026-7810.pdf', type: 'optional', verified: true }
    ],
    payload: {
      splitMemberIds: ['M-003']
    }
  },
  {
    id: 'REV-UNF-002',
    source: '申请解冻',
    categoryType: '商业解冻资质核查',
    appType: '解冻申请 (商业情形)',
    cardNo: 'RC-10029381',
    applicantName: '艾哈迈德·哈桑·萨利赫',
    targetMemberName: '宰娜卜·艾哈迈德·哈桑',
    reason: '商户名额已注销，依据工商税务清税公函COM-TAX-2026-9901申请解除配给卡冻结。',
    status: '待分部初审',
    submittedAt: '2026-10-11 09:30',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: '待决',
    managerNotes: '',
    attachments: [
      { name: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf', type: 'required', verified: true }
    ],
    payload: {
      unfreezeType: '商业',
      targetMemberId: 'M-004',
      docName: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf'
    }
  },
  {
    id: 'REV-DTH-003',
    source: '变更户主',
    categoryType: '户主死亡注销与继承任命',
    appType: '变更户主 (死亡医学鉴定核验)',
    cardNo: 'RC-10029381',
    applicantName: '法蒂玛·阿里·穆罕默德',
    targetMemberName: '原户主 → 法蒂玛·阿里·穆罕默德',
    reason: '依据法医死亡鉴定医学公函DTH-BAG-2026-90182申请指定配偶法蒂玛为法定继任户主。',
    status: '待经理终审',
    submittedAt: '2026-10-09 16:40',
    staffOpinion: '法医死亡证明真实有效，民政销籍底册比对无误，建议批准变更。',
    staffName: '萨米拉·卡西姆 (审核员工)',
    staffReviewedAt: '2026-10-10 11:30',
    managerDecision: '待决',
    managerNotes: '',
    attachments: [
      { name: '卫生部法医总局_户主死亡医学鉴定书及民政注销公函_DTH-BAG-2026-90182.pdf', type: 'required', verified: true }
    ],
    payload: {
      newHeadId: 'M-002',
      newHeadName: '法蒂玛·阿里·穆罕默德'
    }
  },
  {
    id: 'REV-ENT-004',
    source: '成员录入',
    categoryType: '家庭编号比对复核',
    appType: '家庭成员录入 (电子审核流)',
    cardNo: 'RC-10029381',
    applicantName: '艾哈迈德·哈桑·萨利赫',
    targetMemberName: '拉希德·艾哈迈德',
    reason: '系统自动校验比对发现家庭编号存在跨省异动记录，提请人工双岗复核。',
    status: '待分部初审',
    submittedAt: '2026-10-11 14:20',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: '待决',
    managerNotes: '',
    attachments: [
      { name: '内政部户政总局_国家统一国民卡数据校正批准通知书_UPD-2026-6219.pdf', type: 'required', verified: true }
    ]
  },
  {
    id: 'REV-TRF-005',
    source: '成员转移',
    categoryType: '婚嫁投靠跨卡转移',
    appType: '成员转移 (结婚投靠)',
    cardNo: 'RC-10029381',
    applicantName: '海德尔·卡西姆·纳赛尔',
    targetMemberName: '宰娜卜·艾哈迈德·哈桑',
    reason: '结婚跨卡迁移投靠，已提供最高民事法院登记证明，转入审核工单。',
    status: '已批准',
    submittedAt: '2026-10-08 09:10',
    staffOpinion: '核对结婚证书公证书真实，两卡代理人确认同意。',
    staffName: '萨米拉·卡西姆 (审核员工)',
    staffReviewedAt: '2026-10-08 14:00',
    managerDecision: '接受',
    managerNotes: '准予跨卡转移并签发新的属地配给配额。',
    managerDecidedAt: '2026-10-09 10:20',
    attachments: [
      { name: '最高司法委员会_跨区分立投靠证明书_TRF-2026-1182.pdf', type: 'required', verified: true }
    ]
  }
];
