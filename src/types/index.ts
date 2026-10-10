export type SystemId =
  | 'citizenFamily'
  | 'rationing'
  | 'identity'
  | 'agentMgmt'
  | 'ePayment'
  | 'notification'
  | 'crossVerify'
  | 'warehouse'
  | 'operations'
  | 'mobileApp'
  | 'aiBigData'
  | 'configMgmt';

export interface FeaturePoint {
  id: number;
  system: string;
  systemId: SystemId;
  module: string;
  moduleId: string;
  featureName: string;
  description: string;
  role: string;
  targetView: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  nationalId: string;
  familyCode?: string; // 统一国民卡上的家庭编号
  relation: '户主' | '配偶' | '子女' | '父母' | '受抚养人';
  birthDate: string;
  gender: '男' | '女';
  status: '正常' | '已故' | '已迁出' | '冻结';
  freezeReason?: '商业' | '旅行' | '高收入' | '死亡';
  freezeDate?: string;
  isUpdatedInSystem?: boolean; // 是否已在配给卡系统中完成更新
  phone?: string;
  residenceInfo?: string;
  monthlyIncome?: number;
  faceVerified?: boolean;
  remoteVerified?: boolean;
  remoteVerifiedLocation?: string;
  remoteVerifiedAt?: string;
}

export interface DeviceHardwareInfo {
  hardwareCode: string;
  deviceName: string;
  isTrusted: boolean;
  firstLogin: boolean;
  ipAddress?: string;
  lastVerifiedAt?: string;
}

export interface RemoteVerifySession {
  id: string;
  rationCardNo: string;
  headName: string;
  memberId: string;
  memberName: string;
  inviteCode: string;
  inviteLink: string;
  createdAt: string;
  expiresAt: string;
  status: '待核验' | '已核验' | '已拒绝';
  rejectionReason?: string;
  verifiedLocation?: string;
}

export interface FamilyRecord {
  rationCardNo: string;
  oldPaperCardNo: string;
  familyCode?: string; // 统一卡家庭编号 (如 FAM-BAG-08832)
  province: string;
  district: string;
  headName: string;
  phone: string;
  memberCount: number;
  status: '正常' | '已冻结' | '审核中' | '待自核';
  freezeReason?: string;
  agentId: string;
  agentName: string;
  members: FamilyMember[];
  address: string;
  createdDate: string;
  lastSelfCheckDate: string;
}

export interface RationApplication {
  id: string;
  type: '添加新成员' | '删除已故人员' | '妻子/成员转移' | '家庭分户' | '户主变更' | '解冻申请' | '代理转移' | '数据更正';
  familyCardNo: string;
  applicantName: string;
  phone: string;
  submitDate: string;
  status: '待自动校验' | '待分部初审' | '待经理终审' | '已批准' | '已驳回' | '需补正';
  autoApprovalPath: boolean;
  notes: string;
  attachments: string[];
  reviewNotes?: string;
  feePaid?: boolean;
  // Branch Electronic Review Details
  staffOpinion?: string;
  staffName?: string;
  staffReviewedAt?: string;
  managerDecision?: '接受' | '拒绝' | '待决';
  managerName?: string;
  managerDecidedAt?: string;
  // Payload details
  targetMemberId?: string;
  targetMemberName?: string;
  newHeadId?: string;
  freezeType?: '商业' | '旅行' | '高收入' | '死亡';
  unfreezeType?: '商业' | '旅行' | '高收入' | '住址不明' | '更新' | '重复' | '临时' | '地理位置';
  transferReason?: string;
  sourceFamilyCardNo?: string;
  targetFamilyCardNo?: string;
  splitFamilyType?: 'husband_wife' | 'other_manual';
  splitMemberIds?: string[];
}

export interface AgentRecord {
  id: string;
  name: string;
  agentType: '食品' | '面粉' | '综合';
  province: string;
  address: string;
  storeAreaSqM: number;
  householdsCount: number;
  maxCap: number; // 1500
  status: '正常营业' | '已注销' | '暂停营业' | '待实地检查' | '轮替中';
  ownerName: string;
  phone: string;
  lastInspectionScore?: number;
  familyConsentRate?: number;
}

export interface PaymentOrder {
  id: string;
  orderType: '配给业务申请费' | '家庭信息更新费' | '代理在线采购配给' | '代理资质设立费' | '代理轮替继承费';
  amount: number; // in Iraqi Dinar (IQD)
  payerType: '公民' | '配给代理';
  payerName: string;
  payerId: string;
  status: '待支付' | '已完成' | '已退款' | '已超时';
  paymentChannel?: '电子支付卡 (Qi Card)' | '电子钱包 (ZainCash)' | '银联快通';
  createdAt: string;
  paidAt?: string;
  receiptNumber?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole: '公民' | '配给代理' | '管理员';
  channel: '短信通道' | '应用内通知' | '双通道';
  title: string;
  content: string;
  timestamp: string;
  status: '已送达' | '发送失败' | '待发送';
  isRead: boolean;
}

export interface CrossCheckTask {
  id: string;
  targetAgency: '内政部公民身份与死亡库' | '国家税务总局高收入库' | '边境与出入境管理局' | '商会与企业登记局';
  checkType: '定期全量' | '事件触发';
  lastRun: string;
  discrepancyCount: number;
  status: '就绪' | '核验中' | '已生成差异清单';
}

export interface DiscrepancyItem {
  id: string;
  rationCardNo: string;
  personName: string;
  nationalId: string;
  discrepancyType: '死亡未注销' | '高收入未冻结' | '商业公司法人未申报' | '长期境外旅行';
  externalAgencyData: string;
  systemActionAdvice: '建议立即冻结' | '建议暂停配给' | '人工核实';
  handledStatus: '待处理' | '已执行冻结' | '已核实放行';
}

export interface WarehouseStockItem {
  id: string;
  skuCode: string;
  commodityName: '精制小麦粉' | '长粒大米' | '食用白砂糖' | '精炼葵花籽油' | '婴幼儿奶粉';
  warehouseName: string;
  batchNumber: string;
  quantityTons: number;
  allocatedTons: number;
  availableTons: number;
  productionDate: string;
  expiryDate: string;
  status: '正常在库' | '待质检' | '损耗待审';
}

export interface WarehouseFlowOrder {
  id: string;
  type: '采购验收入库' | '配送出库' | '仓库间调拨' | '损耗报损';
  fromLocation: string;
  toLocation: string;
  commodityName: string;
  batchNumber: string;
  quantityTons: number;
  carrier: string;
  status: '已完成' | '在途中' | '待审批' | '签收异常预警';
  createdAt: string;
}

export interface FraudAlertItem {
  id: string;
  alertType: '一人多卡识别' | '死亡未销卡冒领' | '高收入未冻结' | '异常高频盗领' | '代理分发短缺预警';
  level: '高级' | '中级' | '低级';
  targetEntity: string;
  riskScore: number;
  description: string;
  detectionRule: string;
  status: '待工单派发' | '核实处理中' | '已闭环解决';
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'citizen' | 'agent' | 'admin' | 'auditor';
}

export interface ScienceInspectionItem {
  id: string;
  commodity: '精制小麦粉' | '长粒大米' | '食用白砂糖' | '精炼葵花籽油' | '婴幼儿奶粉';
  pubchemCid: number;
  chemicalFormula: string;
  batchNumber: string;
  moisturePercent: number; // e.g. 13.2% (standard <= 14%)
  glutenPercent: number; // e.g. 26.5% (standard >= 24%)
  acidValueMgKoh: number; // e.g. 0.15 (standard <= 0.20)
  aflatoxinB1Ppb: number; // e.g. 0.0 (undetected)
  inspectionVerdict: '合格 (准予调拨配发)' | '警示 (双人复测)' | '不合格 (立即扣押封存)';
  inspectorName: string;
  labTechnique: string;
  createdAt: string;
}

export interface GeminiChatLog {
  id: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  modelName: string;
  citations?: string[];
  createdAt: string;
}

export interface SystemConfigParameters {
  agentHouseholdMaxCap: number; // default 1500
  agentMergeMaxCap: number; // default 750
  agentMinAreaSqM: number; // default 20
  marriageMinAgeYears: number; // default 14
  citizenApplicationFeeIqd: number; // default 2000
  agentLicenseFeeIqd: number; // default 250000
  agentInheritanceFeeIqd: number; // default 50000
  salaryFreezeThresholdIqd: number; // default 1500000
  outOfCountryFreezeMonths: number; // default 6
}

export interface ManageableUser {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  role: 'citizen' | 'agent' | 'admin' | 'auditor';
  province: string;
  department?: string;
  status: '正常' | '已冻结' | '待审核';
  lastLogin: string;
  createdAt: string;
}

export interface RolePermissionDefinition {
  roleId: 'citizen' | 'agent' | 'admin' | 'auditor';
  roleName: string;
  description: string;
  permissions: {
    systemId: SystemId;
    systemName: string;
    canRead: boolean;
    canWrite: boolean;
    canApprove: boolean;
    canAudit: boolean;
  }[];
}

