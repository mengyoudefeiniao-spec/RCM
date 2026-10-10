import { FeaturePoint, SystemId } from '../types';

export const ALL_125_FEATURES: FeaturePoint[] = [
  // 1. 公民与家庭管理服务 (1-7)
  {
    id: 1,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '账户管理',
    moduleId: 'account',
    featureName: '创建账户',
    description: '选择省份, 录入旧纸质卡信息与手机号码, 系统经短信下发新配给卡号与密码',
    role: '公民',
    targetView: 'create_account'
  },
  {
    id: 2,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '账户管理',
    moduleId: 'account',
    featureName: '用户登录',
    description: '使用新配给卡号和密码登录应用',
    role: '公民',
    targetView: 'login'
  },
  {
    id: 3,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '账户管理',
    moduleId: 'account',
    featureName: '旧卡信息采集',
    description: '上传旧纸质配给卡照片(如有)至对账存储, 辅助建立电子档案',
    role: '公民',
    targetView: 'old_card_capture'
  },
  {
    id: 4,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '家庭档案',
    moduleId: 'archive',
    featureName: '家庭成员录入',
    description: '录入全体家庭成员信息, 与统一卡比对完成建档',
    role: '公民',
    targetView: 'members_entry'
  },
  {
    id: 5,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '家庭档案',
    moduleId: 'archive',
    featureName: '家庭数据更新',
    description: '在配给卡系统中更新家庭成员信息',
    role: '公民',
    targetView: 'data_update'
  },
  {
    id: 6,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '家庭档案',
    moduleId: 'archive',
    featureName: '电子自核',
    description: '无需前往办事窗口, 在线更新并核对家庭数据',
    role: '公民',
    targetView: 'self_check'
  },
  {
    id: 7,
    system: '公民与家庭管理服务',
    systemId: 'citizenFamily',
    module: '家庭档案',
    moduleId: 'archive',
    featureName: '数据更正',
    description: '在线提交配给卡上错误姓名或个人信息的更正申请',
    role: '公民',
    targetView: 'correction'
  },

  // 2. 配给业务服务 (8-18)
  {
    id: 8,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '成员管理',
    moduleId: 'member_mgmt',
    featureName: '添加新成员',
    description: '添加新生儿或此前未登记的家庭成员, 支持自动批准与电子审核两条路径',
    role: '公民; 配给分部员工',
    targetView: 'add_member'
  },
  {
    id: 9,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '成员管理',
    moduleId: 'member_mgmt',
    featureName: '删除已故人员',
    description: '从配给卡中删除已故人员姓名, 确保数据准确',
    role: '公民',
    targetView: 'remove_deceased'
  },
  {
    id: 10,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '成员管理',
    moduleId: 'member_mgmt',
    featureName: '妻子或成员转移',
    description: '因结婚或居住地变更转移配给关系, 按成员类型自动识别分流, 支持监护、抚养等情形',
    role: '公民; 配给分部员工; 分部经理',
    targetView: 'transfer_member'
  },
  {
    id: 11,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '家庭管理',
    moduleId: 'family_mgmt',
    featureName: '家庭分户',
    description: '结婚或家庭分立后, 为新家庭单独设立配给卡并签发新卡, 夫妻双方均须年满14周岁',
    role: '公民; 配给分部员工; 分部经理',
    targetView: 'split_household'
  },
  {
    id: 12,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '家庭管理',
    moduleId: 'family_mgmt',
    featureName: '户主变更',
    description: '在符合条件时变更家庭户主, 系统按家庭编号自动识别新户主入选',
    role: '公民; 配给分部员工; 分部经理',
    targetView: 'change_head'
  },
  {
    id: 13,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '配给管控',
    moduleId: 'ration_control',
    featureName: '冻结管理',
    description: '按商业、旅行、高收入、死亡等情形冻结公民或家庭的食品配给',
    role: '公民; 配给分部员工',
    targetView: 'freeze_mgmt'
  },
  {
    id: 14,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '配给管控',
    moduleId: 'ration_control',
    featureName: '解冻管理',
    description: '按冻结类型恢复配给, 自动类型系统直批, 其他类型电子审核',
    role: '公民; 配给分部员工; 分部经理',
    targetView: 'unfreeze_mgmt'
  },
  {
    id: 15,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '配给管控',
    moduleId: 'ration_control',
    featureName: '代理转移管理',
    description: '核查代理户数上限, 自动办理省内转移, 跨省转移转电子审核',
    role: '公民; 配给分部员工; 分部经理',
    targetView: 'transfer_agent'
  },
  {
    id: 16,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '流程管控',
    moduleId: 'workflow_control',
    featureName: '自动核验规则',
    description: '按业务类型自动校验申请条件, 确定自动接受或电子审核路径',
    role: '系统 (自动)',
    targetView: 'rule_engine'
  },
  {
    id: 17,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '流程管控',
    moduleId: 'workflow_control',
    featureName: '电子审核',
    description: '分部员工审核数据和文件并出具意见, 分部经理作出最终决定',
    role: '配给分部员工; 分部经理',
    targetView: 'e_review'
  },
  {
    id: 18,
    system: '配给业务服务',
    systemId: 'rationing',
    module: '流程管控',
    moduleId: 'workflow_control',
    featureName: '投诉与诉讼',
    description: '由电子配给卡项目支持人员受理和处理',
    role: '公民; 项目支持人员',
    targetView: 'appeals_litigation'
  },

  // 3. 身份核验服务 (19-26)
  {
    id: 19,
    system: '身份核验服务',
    systemId: 'identity',
    module: '即时验证',
    moduleId: 'instant_verify',
    featureName: '人脸识别比对',
    description: '现场活体拍摄面部照片, 与统一卡信息进行生物识别比对',
    role: '公民; 被核验家庭成员',
    targetView: 'face_match'
  },
  {
    id: 20,
    system: '身份核验服务',
    systemId: 'identity',
    module: '即时验证',
    moduleId: 'instant_verify',
    featureName: '统一卡信息采集',
    description: '上传统一卡正反两面信息 (支持 NFC 读取), 用于卡人比对',
    role: '公民',
    targetView: 'unified_card_nfc'
  },
  {
    id: 21,
    system: '身份核验服务',
    systemId: 'identity',
    module: '远程验证',
    moduleId: 'remote_verify',
    featureName: '验证链接分享',
    description: '户主创建验证链接并发给不在现场的家庭成员',
    role: '户主',
    targetView: 'share_link'
  },
  {
    id: 22,
    system: '身份核验服务',
    systemId: 'identity',
    module: '远程验证',
    moduleId: 'remote_verify',
    featureName: '验证码核验',
    description: '成员下载应用后点击链接并输入验证码完成远程验证',
    role: '被核验家庭成员',
    targetView: 'code_verify'
  },
  {
    id: 23,
    system: '身份核验服务',
    systemId: 'identity',
    module: '远程验证',
    moduleId: 'remote_verify',
    featureName: '防冒用校验',
    description: '校验姓名一致性与地理位置, 姓名不符或与家庭同时拒绝验证',
    role: '系统 (自动)',
    targetView: 'anti_spoofing'
  },
  {
    id: 24,
    system: '身份核验服务',
    systemId: 'identity',
    module: '位置核验',
    moduleId: 'geo_verify',
    featureName: '地理位置校验',
    description: '业务办理过程中核验申请人地理位置信息',
    role: '系统 (自动); 公民',
    targetView: 'geo_check'
  },
  {
    id: 25,
    system: '身份核验服务',
    systemId: 'identity',
    module: '位置核验',
    moduleId: 'geo_verify',
    featureName: '位置异常提醒',
    description: '位置信息异常时向业务流程输出风险提示, 转人工复核',
    role: '配给分部员工',
    targetView: 'geo_anomaly'
  },
  {
    id: 26,
    system: '身份核验服务',
    systemId: 'identity',
    module: '验证留档',
    moduleId: 'verify_archive',
    featureName: '验证记录留存',
    description: '验证照片与结果上传对账存储留档, 与业务申请绑定, 供审核备查',
    role: '配给分部员工; 审计人员',
    targetView: 'archive_logs'
  },

  // 4. 代理商管理服务 (27-45)
  {
    id: 27,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '代理作业',
    moduleId: 'agent_operations',
    featureName: '自动读卡',
    description: '代理应用自动读取公民配给卡信息',
    role: '配给代理',
    targetView: 'auto_read_card'
  },
  {
    id: 28,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '代理作业',
    moduleId: 'agent_operations',
    featureName: '手动读卡',
    description: '手动录入或读取配给卡信息, 作为自动读卡的补充',
    role: '配给代理',
    targetView: 'manual_read_card'
  },
  {
    id: 29,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '代理作业',
    moduleId: 'agent_operations',
    featureName: '物品交付登记',
    description: '向公民交付食品配给时登记发放物品',
    role: '配给代理',
    targetView: 'delivery_register'
  },
  {
    id: 30,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '代理作业',
    moduleId: 'agent_operations',
    featureName: '配给物资查询',
    description: '查询配给物资数量、仓库库存情况和交货日期',
    role: '配给代理',
    targetView: 'ration_inquiry'
  },
  {
    id: 31,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权授予',
    description: '已注销代理权的授予管理, 优先原代理三代以内亲属',
    role: '申请人; 部长',
    targetView: 'grant_authority'
  },
  {
    id: 32,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权注销',
    description: '违规、户数不足、代理申请、死亡、司法判决等情形的注销管理',
    role: '规划与跟进司总干事',
    targetView: 'revoke_authority'
  },
  {
    id: 33,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权恢复',
    description: '满足未合并、联合调查、家庭支持等条件的恢复管理',
    role: '代理申请人; 规划与跟进司总干事',
    targetView: 'restore_authority'
  },
  {
    id: 34,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权合并',
    description: '满足并户人数最少代理, 合并户数不超过750户',
    role: '规划与跟进司总干事',
    targetView: 'merge_agency'
  },
  {
    id: 35,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权轮替',
    description: '已故代理亲属继承 (12个月内) 或申请转让二代以内亲属',
    role: '继承人; 行政次长',
    targetView: 'rotate_agency'
  },
  {
    id: 36,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权设立',
    description: '新建或偏远地区设立代理权, 征集家庭申请并经实地检查',
    role: '申请人; 征集部长',
    targetView: 'establish_agency'
  },
  {
    id: 37,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权统一',
    description: '食品与面粉代理互相提取配给, 场所面积不小于20平方米',
    role: '配给代理; 部长',
    targetView: 'unify_agency'
  },
  {
    id: 38,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '机构管理',
    moduleId: 'agency_mgmt',
    featureName: '代理权拆分',
    description: '户数达到1500户的大型代理拆分管理',
    role: '联合委员会; 部长',
    targetView: 'split_agency'
  },
  {
    id: 39,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '管控与费用',
    moduleId: 'agency_control_fee',
    featureName: '户数上限管控',
    description: '面粉、食品代理各不超过1500户, 超限阻止转入并提示改选',
    role: '系统 (自动)',
    targetView: 'cap_control'
  },
  {
    id: 40,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '管控与费用',
    moduleId: 'agency_control_fee',
    featureName: '费用管理',
    description: '电子申请 2,000 第纳尔, 授予/设立/统一/拆分 250,000 第纳尔, 轮替 50,000 第纳尔',
    role: '规划与跟进司; 申请人',
    targetView: 'fee_mgmt'
  },
  {
    id: 41,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '实地检查',
    moduleId: 'field_inspection',
    featureName: '检查任务与结果登记',
    description: '派发实地检查任务, 登记委员会检查结论 (配给分部、规划与跟进司、商业监督司及省级相关公司)',
    role: '实地检查委员会',
    targetView: 'field_tasks'
  },
  {
    id: 42,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '实地检查',
    moduleId: 'field_inspection',
    featureName: '家庭同意材料征集',
    description: '线上征集与核验家庭同意书 (授予30%、设立100户等), 按指标打印并派发复印件',
    role: '申请人; 受益家庭',
    targetView: 'family_consent'
  },
  {
    id: 43,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '台账管理',
    moduleId: 'ledger_mgmt',
    featureName: '代理台账管理',
    description: '维护代理基础信息、户数、场所面积与状态台账, 支持上限管控与接替评估',
    role: '规划与跟进司',
    targetView: 'agency_ledger'
  },
  {
    id: 44,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '调查协同',
    moduleId: 'investigation_collab',
    featureName: '联合调查登记',
    description: '登记恢复、设立场景下与商业和财务监督司联合调查的结果',
    role: '商业与财务监督司',
    targetView: 'joint_investigation'
  },
  {
    id: 45,
    system: '代理商管理服务',
    systemId: 'agentMgmt',
    module: '消息协同',
    moduleId: 'agent_messages',
    featureName: '代理通知',
    description: '向代理推送配给领取日期等通知信息',
    role: '配给代理',
    targetView: 'agent_notify'
  },

  // 5. 电子支付服务 (46-55)
  {
    id: 46,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '支付渠道',
    moduleId: 'channels',
    featureName: '电子支付卡支付',
    description: '支持通过电子支付卡完成在线付款',
    role: '公民; 配给代理',
    targetView: 'card_pay'
  },
  {
    id: 47,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '支付渠道',
    moduleId: 'channels',
    featureName: '电子钱包支付',
    description: '支持通过电子钱包完成在线付款',
    role: '公民; 配给代理',
    targetView: 'wallet_pay'
  },
  {
    id: 48,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '公民缴费',
    moduleId: 'citizen_payment',
    featureName: '业务费用缴纳',
    description: '在线支付各项配给业务办理费用',
    role: '公民',
    targetView: 'biz_fee'
  },
  {
    id: 49,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '公民缴费',
    moduleId: 'citizen_payment',
    featureName: '信息更新缴费',
    description: '在线支付家庭信息更新费用',
    role: '公民',
    targetView: 'update_fee'
  },
  {
    id: 50,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '代理缴费',
    moduleId: 'agent_payment',
    featureName: '配给在线采购',
    description: '代理通过电子支付采购公民的食品配给',
    role: '配给代理',
    targetView: 'procurement_pay'
  },
  {
    id: 51,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '交易管理',
    moduleId: 'orders',
    featureName: '待支付订单',
    description: '按业务类型生成待支付订单, 超时未支付自动关闭并提示',
    role: '公民; 配给代理',
    targetView: 'pending_orders'
  },
  {
    id: 52,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '交易管理',
    moduleId: 'orders',
    featureName: '交易记录与电子收据',
    description: '公民与代理在线查询历史交易明细, 并开具电子收据',
    role: '公民; 配给代理',
    targetView: 'receipts'
  },
  {
    id: 53,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '对账管理',
    moduleId: 'reconciliation',
    featureName: '支付对账与异常核查',
    description: '与支付机构周期性对账, 差异自动预警, 支持财务在线核查',
    role: '贸易部财务人员',
    targetView: 'reconcile_audit'
  },
  {
    id: 54,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '异常处理',
    moduleId: 'reconciliation',
    featureName: '失败退回',
    description: '支付失败或订单超时款项原路退回, 并推送消息通知',
    role: '系统 (自动); 公民; 配给代理',
    targetView: 'refund_handling'
  },
  {
    id: 55,
    system: '电子支付服务',
    systemId: 'ePayment',
    module: '支付协同',
    moduleId: 'orders',
    featureName: '支付结果回传',
    description: '支付结果实时回传业务服务, 支撑申请受理',
    role: '系统 (自动)',
    targetView: 'callback_service'
  },

  // 6. 消息通知服务 (56-64)
  {
    id: 56,
    system: '消息通知服务',
    systemId: 'notification',
    module: '公民通知',
    moduleId: 'citizen_notify',
    featureName: '配给到货通知',
    description: '推送食品配给到货信息、领取日期和物品数量',
    role: '公民',
    targetView: 'arrival_notice'
  },
  {
    id: 57,
    system: '消息通知服务',
    systemId: 'notification',
    module: '公民通知',
    moduleId: 'citizen_notify',
    featureName: '申请状态通知',
    description: '申请状态由审核中变为接受或拒绝时实时推送',
    role: '公民',
    targetView: 'app_status_notice'
  },
  {
    id: 58,
    system: '消息通知服务',
    systemId: 'notification',
    module: '公民通知',
    moduleId: 'citizen_notify',
    featureName: '账户短信通知',
    description: '账户创建后短信下发新配给卡号和密码',
    role: '公民',
    targetView: 'account_sms'
  },
  {
    id: 59,
    system: '消息通知服务',
    systemId: 'notification',
    module: '代理通知',
    moduleId: 'agent_notify',
    featureName: '领取日期通知',
    description: '向代理推送配给领取日期等作业信息',
    role: '配给代理',
    targetView: 'agent_schedule'
  },
  {
    id: 60,
    system: '消息通知服务',
    systemId: 'notification',
    module: '通知渠道',
    moduleId: 'channels_config',
    featureName: '短信通道',
    description: '面向手机短信的通知发送通道',
    role: '系统 (自动)',
    targetView: 'sms_gateway'
  },
  {
    id: 61,
    system: '消息通知服务',
    systemId: 'notification',
    module: '通知渠道',
    moduleId: 'channels_config',
    featureName: '应用内通知',
    description: '面向移动应用和网站站内的消息推送通道',
    role: '公民; 配给代理; 管理员',
    targetView: 'in_app_push'
  },
  {
    id: 62,
    system: '消息通知服务',
    systemId: 'notification',
    module: '模板管理',
    moduleId: 'templates',
    featureName: '通知模板配置',
    description: '按业务事件与接收角色维护模板文案, 支持变量填充与多语言扩展',
    role: '运营管理人员',
    targetView: 'template_config'
  },
  {
    id: 63,
    system: '消息通知服务',
    systemId: 'notification',
    module: '发送管理',
    moduleId: 'logs',
    featureName: '发送记录与回执',
    description: '记录通知发送、送达与已读状态, 失败自动重发并告警',
    role: '系统 (自动); 运营管理人员',
    targetView: 'send_logs'
  },
  {
    id: 64,
    system: '消息通知服务',
    systemId: 'notification',
    module: '订阅管理',
    moduleId: 'preferences',
    featureName: '通知偏好设置',
    description: '用户按渠道与类型自定义通知接收偏好',
    role: '公民; 配给代理; 管理员',
    targetView: 'preference_setup'
  },

  // 7. 数据交叉核验服务 (65-70)
  {
    id: 65,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '任务调度',
    moduleId: 'scheduler',
    featureName: '定期核验任务',
    description: '按机构配置核验周期, 定时或按事件触发批量比对任务',
    role: '系统 (自动)',
    targetView: 'batch_scheduler'
  },
  {
    id: 66,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '机构对接',
    moduleId: 'connectors',
    featureName: '机构数据适配',
    description: '为各部委和政府部门配置数据抽取与转换适配器',
    role: '系统集成方; 贸易部',
    targetView: 'agency_adapters'
  },
  {
    id: 67,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '差异管理',
    moduleId: 'discrepancy',
    featureName: '差异清单管理',
    description: '核验差异自动生成清单, 按死亡、高收入、旅行等类型分类推送',
    role: '系统 (自动); 运营管理人员',
    targetView: 'discrepancy_list'
  },
  {
    id: 68,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '差异管理',
    moduleId: 'discrepancy',
    featureName: '冻结流程承诺',
    description: '依据核验结果生成冻结或解冻建议, 人工确认后执行',
    role: '运营管理人员',
    targetView: 'freeze_actions'
  },
  {
    id: 69,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '结果处理',
    moduleId: 'results',
    featureName: '结果闭环记录',
    description: '差异处理全过程留痕, 处理结果闭环登记',
    role: '运营管理人员',
    targetView: 'closed_loop_log'
  },
  {
    id: 70,
    system: '数据交叉核验服务',
    systemId: 'crossVerify',
    module: '数据质量',
    moduleId: 'results',
    featureName: '核验质量报告',
    description: '输出各机构数据覆盖率与差异率报告, 支撑对接质量评估',
    role: '贸易部决策人员',
    targetView: 'quality_report'
  },

  // 8. 仓储管理服务 (71-82)
  {
    id: 71,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '入库管理',
    moduleId: 'inbound',
    featureName: '采购收货入库',
    description: '凭收货单验收水库, 登记品项、数量、批次与生产日期',
    role: '仓库管理员',
    targetView: 'purchase_inbound'
  },
  {
    id: 72,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '仓储管理',
    moduleId: 'inbound',
    featureName: '入库流水',
    description: '生成入库业务流水, 支持全程溯源查询',
    role: '仓库保管员',
    targetView: 'inbound_flow'
  },
  {
    id: 73,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '出库管理',
    moduleId: 'outbound',
    featureName: '配送出库',
    description: '按分配计划向代理出库配货, 生成交付流水',
    role: '仓库管理员',
    targetView: 'delivery_outbound'
  },
  {
    id: 74,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '出库管理',
    moduleId: 'outbound',
    featureName: '交付签收联动',
    description: '交付流水与代理签收记录联动核对, 差异预警',
    role: '仓库管理员; 配给代理',
    targetView: 'signature_sync'
  },
  {
    id: 75,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '调拨管理',
    moduleId: 'transfers',
    featureName: '仓库间调拨',
    description: '调拨单全程单据化跟踪, 库存实时结转',
    role: '仓库管理员',
    targetView: 'wh_transfers'
  },
  {
    id: 76,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '盘点管理',
    moduleId: 'stocktake',
    featureName: '定期盘点',
    description: '生成盘盈盘亏单, 差异溯源处理',
    role: '仓库保管员',
    targetView: 'periodic_stocktake'
  },
  {
    id: 77,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '盘点管理',
    moduleId: 'stocktake',
    featureName: '报损管理',
    description: '损耗报损审批并全程留痕',
    role: '仓库管理员; 供应链管理人员',
    targetView: 'damage_report'
  },
  {
    id: 78,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '流水台账',
    moduleId: 'ledger',
    featureName: '日常业务流水',
    description: '记录销售、采购、收货、交付等日常业务流水',
    role: '仓库保管员',
    targetView: 'daily_ledger'
  },
  {
    id: 79,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '报表分析',
    moduleId: 'ledger',
    featureName: '流转明细报表',
    description: '提供品项与数量流转的明细报表, 支持多维度查询',
    role: '供应链管理人员',
    targetView: 'flow_reports'
  },
  {
    id: 80,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '库存管理',
    moduleId: 'inventory',
    featureName: '多维度库存管理',
    description: '按仓库、品类、批次多维度管理库存与可用量',
    role: '仓库管理员; 供应链管理人员',
    targetView: 'multi_dim_stock'
  },
  {
    id: 81,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '联动追溯',
    moduleId: 'inventory',
    featureName: '分发数据联动',
    description: '与代理配给分发数据联动, 实现从仓库到家庭的全程可追溯',
    role: '系统 (自动); 配给代理',
    targetView: 'end_to_end_trace'
  },
  {
    id: 82,
    system: '仓储管理服务',
    systemId: 'warehouse',
    module: '权限管控',
    moduleId: 'inventory',
    featureName: '分级授权',
    description: '员工按角色与仓库范围分级授权, 关键操作上级复核',
    role: '仓库管理员; 供应链管理人员',
    targetView: 'warehouse_auth'
  },

  // 9. 运营管理服务 (83-92)
  {
    id: 83,
    system: '运营管理服务',
    systemId: 'operations',
    module: '角色权限',
    moduleId: 'rbac',
    featureName: '科室角色划分',
    description: '按规划与跟进司各科室 (如冻结科、添加科) 划分操作角色',
    role: '贸易部管理员',
    targetView: 'division_roles'
  },
  {
    id: 84,
    system: '运营管理服务',
    systemId: 'operations',
    module: '申请审核',
    moduleId: 'approvals',
    featureName: '在线审批',
    description: '管理人员在线审核公民申请并作出批准或拒绝的决定',
    role: '配给分部员工; 分部经理',
    targetView: 'online_approval'
  },
  {
    id: 85,
    system: '运营管理服务',
    systemId: 'operations',
    module: '统计分析',
    moduleId: 'analytics',
    featureName: '业务统计',
    description: '提供家庭总数、成员总数及各类申请类型和数量统计',
    role: '业务部门领导',
    targetView: 'biz_statistics'
  },
  {
    id: 86,
    system: '运营管理服务',
    systemId: 'operations',
    module: '报表管理',
    moduleId: 'analytics',
    featureName: '日报生成',
    description: '按日生成家庭数量及其变化报告',
    role: '系统 (自动); 贸易部管理员',
    targetView: 'daily_report'
  },
  {
    id: 87,
    system: '运营管理服务',
    systemId: 'operations',
    module: '账户管理',
    moduleId: 'staff_mgmt',
    featureName: '员工账户',
    description: '按各自角色开立和管理贸易部员工账户',
    role: '贸易部管理员',
    targetView: 'staff_accounts'
  },
  {
    id: 88,
    system: '运营管理服务',
    systemId: 'operations',
    module: '运营看板',
    moduleId: 'dashboards',
    featureName: '审核仪表板',
    description: '面向审核人员的中心、家庭、公民、打印卡片、已审核家庭等统计视图',
    role: '审核人员',
    targetView: 'review_dashboard'
  },
  {
    id: 89,
    system: '运营管理服务',
    systemId: 'operations',
    module: '运营看板',
    moduleId: 'dashboards',
    featureName: '活动仪表板',
    description: '面向贸易部及规划与跟进司、商业和财务监督司、食品贸易总公司等相关部门的业务活动监控视图',
    role: '贸易部; 相关部门',
    targetView: 'activity_dashboard'
  },
  {
    id: 90,
    system: '运营管理服务',
    systemId: 'operations',
    module: '审核管理',
    moduleId: 'approvals',
    featureName: '申请详情调阅',
    description: '在线调阅申请数据与上传的证明文件附件',
    role: '配给分部员工',
    targetView: 'doc_inspection'
  },
  {
    id: 91,
    system: '运营管理服务',
    systemId: 'operations',
    module: '审核管理',
    moduleId: 'approvals',
    featureName: '审核意见与驳回',
    description: '记录审核意见, 支持驳回补充材料后重新提交',
    role: '配给分部员工; 分部经理',
    targetView: 'reject_feedback'
  },
  {
    id: 92,
    system: '运营管理服务',
    systemId: 'operations',
    module: '操作审计',
    moduleId: 'audit',
    featureName: '操作日志',
    description: '关键操作全程留痕, 支持追溯审计',
    role: '审计人员; 管理员',
    targetView: 'audit_logs'
  },

  // 10. 移动应用 (93-108)
  {
    id: 93,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '角色视图切换',
    description: '按登录角色 (公民/配给代理/管理员) 动态加载对应功能视图',
    role: '公民; 配给代理; 管理员',
    targetView: 'role_switcher'
  },
  {
    id: 94,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '账号与安全',
    description: '登录、密码找回与生物识别解锁',
    role: '公民; 配给代理; 管理员',
    targetView: 'auth_security'
  },
  {
    id: 95,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '消息中心',
    description: '通知列表、提醒与已读管理',
    role: '公民; 配给代理; 管理员',
    targetView: 'messages_feed'
  },
  {
    id: 96,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '个人中心',
    description: '个人资料与通知偏好设置',
    role: '公民; 配给代理; 管理员',
    targetView: 'profile'
  },
  {
    id: 97,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '帮助中心',
    description: '用户指南、常见问题、最新新闻、下载安装协助与故障自助排查',
    role: '公民; 配给代理; 管理员',
    targetView: 'help_manual'
  },
  {
    id: 98,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '基础功能',
    moduleId: 'mobile_core',
    featureName: '在线客服',
    description: '一键转接每周7天、每天24小时人工支持窗口, 紧急问题即时协助',
    role: '公民; 配给代理; 管理员',
    targetView: 'live_service'
  },
  {
    id: 99,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '公民端',
    moduleId: 'citizen_mobile',
    featureName: '业务办理入口',
    description: '汇聚添加成员、分户、户主变更、冻结解冻等业务办理功能',
    role: '公民',
    targetView: 'citizen_services'
  },
  {
    id: 100,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '公民端',
    moduleId: 'citizen_mobile',
    featureName: '配给配额',
    description: '查看配给到货状态、领取日期与物品数量明细',
    role: '公民',
    targetView: 'ration_quota'
  },
  {
    id: 101,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '公民端',
    moduleId: 'citizen_mobile',
    featureName: '缴费与票据',
    description: '在线缴纳业务费用并查询、下载电子收据',
    role: '公民',
    targetView: 'bills_receipts'
  },
  {
    id: 102,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '公民端',
    moduleId: 'citizen_mobile',
    featureName: '投诉与咨询',
    description: '在线提交投诉与咨询, 跟踪处理进度与回复',
    role: '公民',
    targetView: 'citizen_appeals'
  },
  {
    id: 103,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '代理端',
    moduleId: 'agent_mobile',
    featureName: '作业操作',
    description: '自动/手动读卡识别、物品发放登记、库存与交货日期查询',
    role: '配给代理',
    targetView: 'agent_scanner'
  },
  {
    id: 104,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '代理端',
    moduleId: 'agent_mobile',
    featureName: '在线采购',
    description: '代理在线采购配给物品并完成电子付款, 采购记录可查',
    role: '配给代理',
    targetView: 'agent_cart'
  },
  {
    id: 105,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '管理端',
    moduleId: 'admin_mobile',
    featureName: '移动审批',
    description: '待办审批与审核意见录入',
    role: '管理员',
    targetView: 'mobile_review'
  },
  {
    id: 106,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '管理端',
    moduleId: 'admin_mobile',
    featureName: '数据速览',
    description: '家庭、成员、申请等关键统计指标浏览与重要消息处理',
    role: '管理员',
    targetView: 'mobile_kpi'
  },
  {
    id: 107,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '支持与改进',
    moduleId: 'support_feedback',
    featureName: '反馈收集',
    description: '应用内提交使用问题与建议, 运营团队定期分析并持续改进',
    role: '公民; 配给代理; 管理员',
    targetView: 'feedback_form'
  },
  {
    id: 108,
    system: '移动应用',
    systemId: 'mobileApp',
    module: '支持与改进',
    moduleId: 'support_feedback',
    featureName: '员工培训',
    description: '面向贸易部员工和操作人员提供系统使用培训材料与在线学习图书',
    role: '贸易部员工; 审核人员',
    targetView: 'training_academy'
  },

  // 11. 智能与大数据应用 (109-125)
  {
    id: 109,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '智能客服助手',
    moduleId: 'ai_support',
    featureName: '知识库构建与更新',
    description: '用户指南、业务规则、政策文件等内容向量化入库与版本更新',
    role: '知识库运营人员',
    targetView: 'knowledge_base'
  },
  {
    id: 110,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '智能客服助手',
    moduleId: 'ai_support',
    featureName: '智能问答',
    description: '基于大模型与 RAG 检索生成回答, 并标注引申依据出处',
    role: '公民; 全体用户',
    targetView: 'ai_rag_chat'
  },
  {
    id: 111,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '智能客服助手',
    moduleId: 'ai_support',
    featureName: '多轮对话',
    description: '支持上下文多轮追问, 准确理解用户意图',
    role: '公民',
    targetView: 'ai_rag_chat'
  },
  {
    id: 112,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '智能客服助手',
    moduleId: 'ai_support',
    featureName: '无缝人工转接',
    description: '无法解答或用户不满意时一键转接 7×24 人工客服, 会话上下文同步',
    role: '公民; 客服人员',
    targetView: 'human_handoff'
  },
  {
    id: 113,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '智能客服助手',
    moduleId: 'ai_support',
    featureName: '问答记录与质检',
    description: '会话记录全量留存, 未解决问题自动归集, 支撑知识库迭代',
    role: '客服运营人员',
    targetView: 'qa_quality_audit'
  },
  {
    id: 114,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '图像预处理',
    description: '对上传文件自动去噪、纠偏、增强, 提升识别率',
    role: '系统 (自动)',
    targetView: 'image_preprocess'
  },
  {
    id: 115,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '文字识别',
    description: '支持阿拉伯语印刷体与常见手写体的文字识别',
    role: '系统 (自动)',
    targetView: 'arabic_ocr'
  },
  {
    id: 116,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '结构化要素抽取',
    description: '大模型抽取姓名、日期、编号、签发机构等关键要素',
    role: '系统 (自动)',
    targetView: 'entity_extraction'
  },
  {
    id: 117,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '抽取结果人工校对',
    description: '抽取结果高亮呈现, 人工确认修正后入库',
    role: '审核人; 公民',
    targetView: 'ocr_verification'
  },
  {
    id: 118,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '要素自动比对',
    description: '抽取要素与申请信息自动交叉比对, 标注不一致项',
    role: '系统 (自动); 审核人',
    targetView: 'diff_matching'
  },
  {
    id: 119,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: 'OCR要素抽取与审核辅助',
    moduleId: 'ocr_audit',
    featureName: '审核建议生成',
    description: '综合比对结果生成审核建议与风险点标注, 供审核人参考',
    role: '审核人',
    targetView: 'review_suggestions'
  },
  {
    id: 120,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '一人多卡识别',
    description: '交叉比对身份要素, 识别同一人持有多个配给卡的情形',
    role: '系统 (自动); 运营管理人员',
    targetView: 'multi_card_alert'
  },
  {
    id: 121,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '死亡未销卡检测',
    description: '与死亡登记数据比对, 检测已故人员配给仍发放的情况',
    role: '系统 (自动); 运营管理人员',
    targetView: 'deceased_claim_alert'
  },
  {
    id: 122,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '高收入未冻结检测',
    description: '结合工资本税数据, 检测高收入未冻结家庭',
    role: '系统 (自动); 运营管理人员',
    targetView: 'high_income_alert'
  },
  {
    id: 123,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '异常领取频次分析',
    description: '分析领取频次与数量模式, 识别异常盗领行为',
    role: '系统 (自动); 运营管理人员',
    targetView: 'frequency_anomaly'
  },
  {
    id: 124,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '代理分发异常预警',
    description: '对分发短缺、客诉集中、投递集中等代理生成的异常预警',
    role: '系统 (自动); 监督机构',
    targetView: 'agent_shortage_alert'
  },
  {
    id: 125,
    system: '智能与大数据应用',
    systemId: 'aiBigData',
    module: '反欺诈与异常检测',
    moduleId: 'fraud_detection',
    featureName: '预警分级与工单',
    description: '预警高、中、低分级, 生成调度工单并闭环跟踪',
    role: '运营管理人员',
    targetView: 'alert_tickets'
  }
];

export interface SystemMeta {
  id: SystemId;
  name: string;
  nameEn: string;
  code: string;
  iconName: string;
  featureCount: number;
  deployPort: number;
  domain: string;
  description: string;
  primaryRole: string;
  color: string;
}

export const SYSTEMS_META: SystemMeta[] = [
  {
    id: 'citizenFamily',
    name: '公民服务',
    nameEn: 'Citizen Services',
    code: 'CFMS-01',
    iconName: 'Users',
    featureCount: 7,
    deployPort: 8081,
    domain: 'citizen.rationcard.gov.iq',
    description: '数字配给卡家庭成员录入、人脸与证件核验、户主变更、信息更新、冻结与解冻、分户与成员转移',
    primaryRole: '公民',
    color: 'emerald'
  },
  {
    id: 'rationing',
    name: '配给业务服务',
    nameEn: 'Rationing Business Service',
    code: 'RBS-02',
    iconName: 'FileCheck',
    featureCount: 11,
    deployPort: 8082,
    domain: 'biz.rationcard.gov.iq',
    description: '新增成员、已故注销、夫妻分户(年满14周岁)、户主变更、冻结解冻与代理转移管控',
    primaryRole: '公民 / 分部员工 / 经理',
    color: 'blue'
  },
  {
    id: 'identity',
    name: '身份核验服务',
    nameEn: 'Identity Verification Service',
    code: 'IVS-03',
    iconName: 'ShieldCheck',
    featureCount: 8,
    deployPort: 8083,
    domain: 'auth.rationcard.gov.iq',
    description: '人脸识别活体比对、统一卡NFC芯片读取、异地成员远程验证链与电子存证留档',
    primaryRole: '公民 / 审计人员',
    color: 'indigo'
  },
  {
    id: 'agentMgmt',
    name: '代理商管理服务',
    nameEn: 'Agent & Distributor Management',
    code: 'ADMS-04',
    iconName: 'Store',
    featureCount: 19,
    deployPort: 8084,
    domain: 'agent.rationcard.gov.iq',
    description: '扫码自动读卡发货、机构授予/注销/恢复/合并(≤750户)/轮替/设立/拆分(>1500户)、实地检查四方委员会',
    primaryRole: '配给代理 / 规划跟进司 / 监督司',
    color: 'amber'
  },
  {
    id: 'ePayment',
    name: '电子支付服务',
    nameEn: 'Electronic Payment Service',
    code: 'EPS-05',
    iconName: 'CreditCard',
    featureCount: 10,
    deployPort: 8085,
    domain: 'pay.rationcard.gov.iq',
    description: 'Qi Card与电子钱包通道、2000第纳尔业务费/250,000资质费、30分钟订单闭环与自动退款',
    primaryRole: '公民 / 代理 / 财务人员',
    color: 'cyan'
  },
  {
    id: 'notification',
    name: '消息通知服务',
    nameEn: 'Message Notification Service',
    code: 'MNS-06',
    iconName: 'BellRing',
    featureCount: 9,
    deployPort: 8086,
    domain: 'notify.rationcard.gov.iq',
    description: '配给到货排期、审批状态流转即时推送、双通道短信/站内信、多语言模板与送达回执',
    primaryRole: '公民 / 代理 / 运营人员',
    color: 'violet'
  },
  {
    id: 'crossVerify',
    name: '数据交叉核验服务',
    nameEn: 'Data Cross-Verification Service',
    code: 'DCVS-07',
    iconName: 'RefreshCw',
    featureCount: 6,
    deployPort: 8087,
    domain: 'crosscheck.rationcard.gov.iq',
    description: '对接内政部死亡库、税务高收入库、海关出入境与企业工商库，生成差异清单与建议',
    primaryRole: '贸易部 / 运营人员',
    color: 'rose'
  },
  {
    id: 'warehouse',
    name: '仓储管理服务',
    nameEn: 'Warehouse & Inventory Service',
    code: 'WIMS-08',
    iconName: 'Warehouse',
    featureCount: 12,
    deployPort: 8088,
    domain: 'warehouse.rationcard.gov.iq',
    description: '采购收货入库批次管理、配送出库签收联动、跨库调拨、盘点报损与全程批次追溯',
    primaryRole: '仓库管理员 / 供应链团队',
    color: 'teal'
  },
  {
    id: 'operations',
    name: '运营管理服务',
    nameEn: 'Operations & Governance Service',
    code: 'OGS-09',
    iconName: 'Briefcase',
    featureCount: 10,
    deployPort: 8089,
    domain: 'admin.rationcard.gov.iq',
    description: '科室角色权限 (冻结科/添加科)、两级在线审批驳回、日报自动化生成与全过程审计留痕',
    primaryRole: '分部经理 / 贸易部领导',
    color: 'slate'
  },
  {
    id: 'mobileApp',
    name: '移动应用',
    nameEn: 'Unified Mobile App Client',
    code: 'UMA-10',
    iconName: 'Smartphone',
    featureCount: 16,
    deployPort: 8090,
    domain: 'm.rationcard.gov.iq',
    description: '公民端/代理端/管理端三端无缝切换、手机扫码发放、7×24一键人工转接与员工培训图书',
    primaryRole: '公民 / 代理 / 移动端管理员',
    color: 'sky'
  },
  {
    id: 'aiBigData',
    name: '智能与大数据应用',
    nameEn: 'AI & Big Data Intelligence',
    code: 'ABDI-11',
    iconName: 'Sparkles',
    featureCount: 17,
    deployPort: 8091,
    domain: 'ai.rationcard.gov.iq',
    description: 'RAG智能客服、阿拉伯语手写/印刷体OCR与表单自动比对、六大反欺诈与异常预警闭环',
    primaryRole: '全员 / 审核人 / 反欺诈风控官',
    color: 'purple'
  },
  {
    id: 'configMgmt',
    name: '系统配置与服务治理',
    nameEn: 'System Configuration & Gateway Governance',
    code: 'SCGG-12',
    iconName: 'Settings',
    featureCount: 6,
    deployPort: 8092,
    domain: 'config.rationcard.gov.iq',
    description: '微前端服务拓扑与端口治理、网关反向代理、RBAC角色权限、用户状态管理及全网配给业务基准参数',
    primaryRole: '超级系统管理员 / 运维中枢',
    color: 'amber'
  }
];
