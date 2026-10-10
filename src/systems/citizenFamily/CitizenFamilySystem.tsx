import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ArrowRightLeft,
  FileCheck2,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Camera,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  MapPin,
  IdCard,
  HeartHandshake,
  Filter,
  Tag,
  Send,
  Layers,
  ChevronRight,
  FileText
} from 'lucide-react';
import { FamilyRecord, FamilyMember, RationApplication } from '../../types';
import { RemoteVerificationModal } from '../../components/RemoteVerificationModal';
import { useI18n } from '../../i18n/translations';
import { MockDocumentUploader } from './MockDocumentUploader';

export interface ReviewTicket {
  id: string;
  source: '申请分户' | '申请解冻' | '变更户主' | '成员录入' | '成员转移';
  categoryType: string;
  appType: string;
  cardNo: string;
  applicantName: string;
  targetMemberName: string;
  reason: string;
  status: '待分部初审' | '待经理终审' | '已批准' | '已驳回';
  submittedAt: string;
  staffOpinion?: string;
  staffName?: string;
  staffReviewedAt?: string;
  managerDecision?: '接受' | '拒绝' | '待决';
  managerName?: string;
  managerNotes?: string;
  managerDecidedAt?: string;
  payload?: any;
}

const UNFREEZE_DOC_CONFIGS: Record<
  string,
  {
    badge: string;
    color: 'teal' | 'indigo' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
    issuer: string;
    fileName: string;
    refNo: string;
    ocrSummary: string;
  }
> = {
  商业: {
    badge: '商业登记与税务清算',
    color: 'teal',
    issuer: '伊拉克贸易部企业注册总局 & 国家税务局',
    fileName: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf',
    refNo: 'COM-TAX-2026-9901',
    ocrSummary: '企业法人营业执照名额已注销，纳税零申报及税务清算完毕，符合配给补贴恢复标准'
  },
  旅行: {
    badge: '海关出入境与永久居留',
    color: 'indigo',
    issuer: '伊拉克内政部居留与边境总局',
    fileName: '内政部海关边检_入境戳记护照扫描件及回国定居申明_TRV-2026-5521.pdf',
    refNo: 'CUST-TRV-2026-4418',
    ocrSummary: '巴格达国际机场入境戳记核实属实，居留常驻伊拉克境内声明经公证生效'
  },
  高收入: {
    badge: '财政薪资核定与雇主证明',
    color: 'amber',
    issuer: '财政部公共薪资核准司 & 雇主单位',
    fileName: '财政部与雇主用人单位_最新月收入核定单与社保证明_INC-2026-3108.pdf',
    refNo: 'FIN-SAL-2026-7821',
    ocrSummary: '月度核算收入低于国家配给补助门槛标准，雇主公章与税单一致'
  },
  住址不明: {
    badge: '社区网格户籍实地核查',
    color: 'emerald',
    issuer: '巴格达省地方行政委员会 & 社区网格处',
    fileName: '地方社区行政处_网格长常住户籍确认公函与水电账单_LOC-2026-7740.pdf',
    refNo: 'LOC-GRD-2026-1193',
    ocrSummary: '社区网格员现场入户核验属实，已连续常住超过6个月，地址有效激活'
  },
  更新: {
    badge: '统一国民卡档案更正',
    color: 'blue',
    issuer: '内政部统一国民卡户政局',
    fileName: '内政部户政总局_国家统一国民卡数据校正批准通知书_UPD-2026-6219.pdf',
    refNo: 'NID-UPD-2026-5532',
    ocrSummary: '统一国民卡数据库记录已更正，户籍底账与生物特征重新同步'
  },
  重复: {
    badge: '司法唯一身份公证',
    color: 'purple',
    issuer: '最高民事法院与户政注销处',
    fileName: '最高民政法院_唯一身份法定公证书及重复配给卡注销回执_DUP-2026-8831.pdf',
    refNo: 'DUP-CAN-2026-3390',
    ocrSummary: '重复卡号已依法注销并封存档案，当事人唯一合法配给卡已锁定'
  },
  临时: {
    badge: '临时管制措施核销',
    color: 'rose',
    issuer: '贸易部食品配给监管与安全审计局',
    fileName: '贸易部配给监管局_解除临时配给限制批复公文_TMP-2026-1402.pdf',
    refNo: 'REG-TMP-2026-8812',
    ocrSummary: '临时行政核查周期结束，限制措施已撤回，配发配额全额恢复'
  },
  地理位置: {
    badge: '测绘坐标公证与属地核验',
    color: 'teal',
    issuer: '国家土地测绘局 & 市政规划委员会',
    fileName: '国家测绘局与市政厅_常住住宅地理网格坐标测绘公证书_GEO-2026-9903.pdf',
    refNo: 'GEO-SUR-2026-6641',
    ocrSummary: '住宅地理坐标符合巴格达卡尔赫网格化配给中心服务半径'
  }
};

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  familyData: FamilyRecord[];
  applications?: RationApplication[];
  onUpdateFamily: (updated: FamilyRecord) => void;
  onAddFamily: (newFamily: FamilyRecord) => void;
  onAddApplication?: (app: RationApplication) => void;
  onUpdateApplication?: (app: RationApplication) => void;
}

export const CitizenFamilySystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  familyData,
  applications = [],
  onUpdateFamily,
  onAddFamily,
  onAddApplication,
  onUpdateApplication
}) => {
  const { t, lang } = useI18n();

  // Active view tab in Citizen Services
  const [activeTab, setActiveTab] = useState<
    'members' | 'change_head' | 'unfreeze' | 'split' | 'transfer' | 'branch_review'
  >('members');

  // Active selected family record context
  const [selectedFamilyCard, setSelectedFamilyCard] = useState<string>(
    familyData[0]?.rationCardNo || 'RC-10029381'
  );
  const currentFamily = familyData.find(f => f.rationCardNo === selectedFamilyCard) || familyData[0];

  // Remote verification modal state
  const [remoteVerifyTargetId, setRemoteVerifyTargetId] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 1 & 2: Add New Family Member Modal & Auto Check
  // ----------------------------------------------------
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addName, setAddName] = useState('哈立德·艾哈迈德·哈桑');
  const [addRelation, setAddRelation] = useState<'配偶' | '子女' | '父母' | '受抚养人'>('子女');
  const [addDob, setAddDob] = useState('2024-03-15');
  const [addGender, setAddGender] = useState<'男' | '女'>('男');
  const [addNid, setAddNid] = useState('NID-2024031588');
  const [addFamilyCode, setAddFamilyCode] = useState(currentFamily?.familyCode || 'FAM-BAG-08832');
  const [addPhone, setAddPhone] = useState('+964 770 665 4321');
  const [addResidence, setAddResidence] = useState(currentFamily?.address || '巴格达市卡拉达大街42号');
  const [childDocType, setChildDocType] = useState<'birth_cert' | 'custody' | 'adoption'>('birth_cert');
  const [childDocNo, setChildDocNo] = useState('BC-BAG-2024-8891');
  const [faceCaptured, setFaceCaptured] = useState(false);
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);
  const [docFileUploaded, setDocFileUploaded] = useState(true);
  const [testMismatchCode, setTestMismatchCode] = useState(false); // toggle to test electronic review trigger

  // ----------------------------------------------------
  // FEATURE 3: Change Household Head
  // ----------------------------------------------------
  const [deathProofNo, setDeathProofNo] = useState('DTH-BAG-2026-90182');
  const [deathProofFileUploaded, setDeathProofFileUploaded] = useState(true);
  const [replacementHeadId, setReplacementHeadId] = useState<string>(
    currentFamily?.members.find(m => m.relation !== '户主' && m.status === '正常')?.id || ''
  );
  const [changeHeadMsg, setChangeHeadMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 4: Update Member Info
  // ----------------------------------------------------
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editNid, setEditNid] = useState('');
  const [editResidence, setEditResidence] = useState('');
  const [updateSuccessNotice, setUpdateSuccessNotice] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 7: Unfreeze Application
  // ----------------------------------------------------
  const [unfreezeTargetMemberId, setUnfreezeTargetMemberId] = useState<string>(
    currentFamily?.members.find(m => m.status === '冻结')?.id || currentFamily?.members[0]?.id || ''
  );
  const [unfreezeType, setUnfreezeType] = useState<
    '商业' | '旅行' | '高收入' | '住址不明' | '更新' | '重复' | '临时' | '地理位置'
  >('商业');
  const [unfreezeDocName, setUnfreezeDocName] = useState('商业登记注销公文函件_2026.pdf');
  const [unfreezeFileUploaded, setUnfreezeFileUploaded] = useState(true);
  const [unfreezeStatement, setUnfreezeStatement] = useState('该商户名额已于2026年正式注销并完成清税，申请恢复食品配给。');
  const [unfreezeSubmittedMsg, setUnfreezeSubmittedMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 8: Household Separation / Splitting
  // ----------------------------------------------------
  const [splitSelectedIds, setSplitSelectedIds] = useState<string[]>([]);
  const [splitMarriageCertNo, setSplitMarriageCertNo] = useState('MC-2026-BAG-09921');
  const [splitMarriageCertUploaded, setSplitMarriageCertUploaded] = useState(true);
  const [splitOtherDocNo, setSplitOtherDocNo] = useState('ADD-DOC-2026-7810');
  const [splitOtherDocUploaded, setSplitOtherDocUploaded] = useState(false);
  const [splitJudgeResult, setSplitJudgeResult] = useState<{ passed: boolean; reason: string } | null>(null);
  const [splitResultNotice, setSplitResultNotice] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 9: Member Transfer Service
  // ----------------------------------------------------
  const [transferSourceCardNo, setTransferSourceCardNo] = useState<string>('RC-10029381');
  const [transferMemberId, setTransferMemberId] = useState<string>('');
  const [transferBiometricVerified, setTransferBiometricVerified] = useState(false);
  const [transferReason, setTransferReason] = useState<string>('结婚转移 (夫妻团聚投靠)');
  const [transferDocNo, setTransferDocNo] = useState('TRF-DOC-2026-4401');
  const [transferResultMsg, setTransferResultMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // FEATURE 5: Electronic Review Tickets & Console
  // ----------------------------------------------------
  const [staffOpinionInput, setStaffOpinionInput] = useState('经调阅民政底账与原件比对，证明文件核验属实，建议准予办理。');
  const [managerNotesInput, setManagerNotesInput] = useState('符合贸易部例外审批规范，同意按员工审查意见核发。');
  const [selectedTicketId, setSelectedTicketId] = useState<string>('REV-2026-001');
  const [reviewFilterSource, setReviewFilterSource] = useState<string>('全部');
  const [reviewFilterStatus, setReviewFilterStatus] = useState<string>('全部');

  // Initial internal electronic review tickets with source and categoryType
  const [reviewTickets, setReviewTickets] = useState<ReviewTicket[]>([
    {
      id: 'REV-2026-001',
      source: '成员录入',
      categoryType: '家庭编号比对复核',
      appType: '家庭成员录入 (电子审核流)',
      cardNo: 'RC-10029381',
      applicantName: '艾哈迈德·哈桑·萨利赫',
      targetMemberName: '优素福·哈桑',
      reason: '未通过系统自动校验：家庭成员之间家庭编号不一致 (FAM-BAG-08832 与 FAM-BAG-09914 不符)',
      status: '待分部初审',
      submittedAt: '2026-10-09 14:30',
      staffOpinion: '',
      managerDecision: '待决'
    },
    {
      id: 'REV-2026-002',
      source: '申请分户',
      categoryType: '单人分户人工审核',
      appType: '配给卡分户 (单人分立路径B)',
      cardNo: 'RC-10029381',
      applicantName: '奥马尔·艾哈迈德·哈桑',
      targetMemberName: '奥马尔·艾哈迈德·哈桑',
      reason: '拟分立成员为单独一人，不符合丈夫＋妻子自动批准路径，转交分部电子审核',
      status: '待经理终审',
      submittedAt: '2026-10-08 10:15',
      staffOpinion: '分部员工 (萨米拉·卡西姆)：申请人已年满成年并出具独立居住租房凭据，初审合规，提请经理签批。',
      staffName: '萨米拉·卡西姆 (审核员工)',
      staffReviewedAt: '2026-10-09 09:20',
      managerDecision: '待决',
      payload: {
        splitMemberIds: ['M-002']
      }
    },
    {
      id: 'REV-2026-003',
      source: '申请解冻',
      categoryType: '商业解冻资质核查',
      appType: '解冻申请 (商业情形)',
      cardNo: 'RC-10029381',
      applicantName: '艾哈迈德·哈桑·萨利赫',
      targetMemberName: '扎伊德·艾哈迈德·哈桑',
      reason: '商户名额已注销，依据工商税务清税证明COM-TAX-2026-9901申请解除配给卡冻结',
      status: '待分部初审',
      submittedAt: '2026-10-10 09:00',
      staffOpinion: '',
      managerDecision: '待决',
      payload: {
        unfreezeType: '商业',
        targetMemberId: 'M-003',
        docName: '商业总商会与税务局_商户执照注销与清税核定公函_COM-2026-0914.pdf'
      }
    },
    {
      id: 'REV-2026-004',
      source: '变更户主',
      categoryType: '户主死亡注销与继承任命',
      appType: '变更户主 (死亡医学鉴定核验)',
      cardNo: 'RC-10029381',
      applicantName: '法蒂玛·阿里·穆罕默德',
      targetMemberName: '艾哈迈德·哈桑·萨利赫 → 法蒂玛·阿里·穆罕默德',
      reason: '原户主身故，依据法医鉴定公文DTH-BAG-2026-90182申请指定配偶继任法定户主',
      status: '待经理终审',
      submittedAt: '2026-10-07 16:40',
      staffOpinion: '法医死亡证明真实有效，民政销籍底册比对无误，建议批准变更。',
      staffName: '萨米拉·卡西姆 (审核员工)',
      staffReviewedAt: '2026-10-08 11:30',
      managerDecision: '待决',
      payload: {
        newHeadId: 'M-001',
        newHeadName: '法蒂玛·阿里·穆罕默德'
      }
    }
  ]);

  // Handle remote verify callback
  const handleRemoteVerifySuccess = (memberId: string, location: string) => {
    if (!currentFamily) return;
    const updatedMembers = currentFamily.members.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          faceVerified: true,
          remoteVerified: true,
          remoteVerifiedLocation: location,
          remoteVerifiedAt: new Date().toISOString()
        };
      }
      return m;
    });
    const updated = { ...currentFamily, members: updatedMembers };
    onUpdateFamily(updated);
  };

  // ----------------------------------------------------
  // SUBMIT HANDLERS
  // ----------------------------------------------------

  // 1. Submit Add Member
  const handleConfirmAddMember = () => {
    if (!currentFamily) return;

    // Multi-criteria verification logic
    const isNidDuplicate = familyData.some(f =>
      f.members.some(m => m.nationalId === addNid.trim())
    );
    const effectiveFamilyCode = testMismatchCode ? 'FAM-MISMATCH-99999' : addFamilyCode;
    const isFamilyCodeMismatch = effectiveFamilyCode !== currentFamily.familyCode;
    const isPassAuto = !isNidDuplicate && !isFamilyCodeMismatch && faceCaptured;

    if (isPassAuto) {
      // Auto-approved path
      const newMember: FamilyMember = {
        id: `M-${Date.now().toString().slice(-4)}`,
        name: addName.trim(),
        nationalId: addNid.trim(),
        familyCode: currentFamily.familyCode,
        relation: addRelation,
        birthDate: addDob,
        gender: addGender,
        status: '正常',
        phone: addPhone,
        residenceInfo: addResidence,
        isUpdatedInSystem: true,
        faceVerified: true
      };

      const updatedFamily: FamilyRecord = {
        ...currentFamily,
        memberCount: currentFamily.members.length + 1,
        members: [...currentFamily.members, newMember]
      };
      onUpdateFamily(updatedFamily);

      if (onAddApplication) {
        onAddApplication({
          id: `APP-ADD-${Date.now().toString().slice(-4)}`,
          type: '添加新成员',
          familyCardNo: currentFamily.rationCardNo,
          applicantName: currentFamily.headName,
          phone: currentFamily.phone,
          submitDate: new Date().toISOString().split('T')[0],
          status: '已批准',
          autoApprovalPath: true,
          notes: `系统自动审核通过：成员【${newMember.name}】已成功录入并签发数字配给卡`,
          attachments: ['live_face_verified.jpg', 'national_id_front.jpg', 'national_id_back.jpg'],
          feePaid: true
        });
      }

      setShowAddMemberModal(false);
      resetAddMemberForm();
    } else {
      // Route to Electronic Review (Branch Staff -> Branch Manager)
      const ticketId = `REV-${Date.now().toString().slice(-4)}`;
      const failReason = isFamilyCodeMismatch
        ? `家庭成员之间家庭编号不一致 (${effectiveFamilyCode} 与当前卡 ${currentFamily.familyCode} 不符)`
        : '父母双方未在同一张配给卡上或身份标识需人工复核';

      const newTicket: ReviewTicket = {
        id: ticketId,
        source: '成员录入',
        categoryType: '家庭编号比对复核',
        appType: '家庭成员录入 (电子审核流)',
        cardNo: currentFamily.rationCardNo,
        applicantName: currentFamily.headName,
        targetMemberName: addName.trim(),
        reason: failReason,
        status: '待分部初审',
        submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        staffOpinion: '',
        managerDecision: '待决',
        payload: {
          name: addName.trim(),
          relation: addRelation,
          nationalId: addNid.trim(),
          familyCode: effectiveFamilyCode,
          phone: addPhone,
          residence: addResidence
        }
      };

      setReviewTickets(prev => [newTicket, ...prev]);
      setShowAddMemberModal(false);
      resetAddMemberForm();
      setActiveTab('branch_review');
      setSelectedTicketId(ticketId);
    }
  };

  const resetAddMemberForm = () => {
    setAddName('哈立德·艾哈迈德·哈桑');
    setAddNid(`NID-${Date.now().toString().slice(-8)}`);
    setFaceCaptured(false);
    setIdFrontUploaded(false);
    setIdBackUploaded(false);
    setTestMismatchCode(false);
  };

  // 2. Submit Change Household Head (Enters Electronic Review)
  const handleConfirmChangeHead = () => {
    if (!currentFamily || !replacementHeadId) return;
    if (!deathProofFileUploaded) {
      alert('请先上传有效的户主死亡医学证明与户籍注销公函！');
      return;
    }
    const oldHead = currentFamily.members.find(m => m.relation === '户主');
    const newHead = currentFamily.members.find(m => m.id === replacementHeadId);
    if (!newHead) return;

    // Create review ticket for electronic review console
    const ticketId = `REV-DTH-${Date.now().toString().slice(-4)}`;
    const newTicket: ReviewTicket = {
      id: ticketId,
      source: '变更户主',
      categoryType: '户主死亡注销与继承任命',
      appType: '变更户主 (死亡医学鉴定核验)',
      cardNo: currentFamily.rationCardNo,
      applicantName: newHead.name,
      targetMemberName: `${oldHead?.name || '原户主'} → ${newHead.name}`,
      reason: `原户主身故注销，依据法医公函【${deathProofNo}】申请指定【${newHead.name}】为法定替代户主，转交分部门审核。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      payload: {
        newHeadId: replacementHeadId,
        newHeadName: newHead.name,
        oldHeadId: oldHead?.id,
        deathProofNo
      }
    };

    setReviewTickets(prev => [newTicket, ...prev]);
    setChangeHeadMsg(`户主变更申请已提交！工单号【${ticketId}】，已转入【电子审核工作台】，等待分部门人员手动审核。`);
    setTimeout(() => setChangeHeadMsg(null), 5000);
  };

  // 3. Submit Member Info Update
  const handleOpenUpdateModal = (member: FamilyMember) => {
    setEditingMember(member);
    setEditPhone(member.phone || currentFamily.phone);
    setEditNid(member.nationalId);
    setEditResidence(member.residenceInfo || currentFamily.address);
    setShowUpdateModal(true);
  };

  const handleConfirmUpdateMember = () => {
    if (!currentFamily || !editingMember) return;

    const updatedMembers = currentFamily.members.map(m => {
      if (m.id === editingMember.id) {
        return {
          ...m,
          phone: editPhone.trim(),
          nationalId: editNid.trim(),
          residenceInfo: editResidence.trim(),
          isUpdatedInSystem: true
        };
      }
      return m;
    });

    const updatedFamily = { ...currentFamily, members: updatedMembers };
    onUpdateFamily(updatedFamily);
    setShowUpdateModal(false);
    setUpdateSuccessNotice(`成员【${editingMember.name}】的手机号码、统一卡及居住信息已成功更新并建档！`);
    setTimeout(() => setUpdateSuccessNotice(null), 3500);
  };

  // 4. Submit Unfreeze Application (Enters Electronic Review)
  const handleConfirmUnfreeze = () => {
    if (!currentFamily) return;
    if (!unfreezeFileUploaded) {
      alert('请上传对应解冻官方证明文件！');
      return;
    }
    const targetMember = currentFamily.members.find(m => m.id === unfreezeTargetMemberId);
    const memberName = targetMember ? targetMember.name : currentFamily.headName;

    // Route to electronic review for verification
    const ticketId = `REV-UNF-${Date.now().toString().slice(-4)}`;
    const newTicket: ReviewTicket = {
      id: ticketId,
      source: '申请解冻',
      categoryType: `解冻申诉 (${unfreezeType}情形)`,
      appType: `解冻申请 (${unfreezeType}情形)`,
      cardNo: currentFamily.rationCardNo,
      applicantName: currentFamily.headName,
      targetMemberName: memberName,
      reason: `依据【${unfreezeType}】情形提交官方证明材料：${unfreezeDocName}，申请恢复食品配给。`,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      payload: {
        unfreezeType,
        targetMemberId: unfreezeTargetMemberId,
        docName: unfreezeDocName
      }
    };

    setReviewTickets(prev => [newTicket, ...prev]);
    setUnfreezeSubmittedMsg(`解冻申请已成功受理！工单号【${ticketId}】，已转入【电子审核工作台】，等待分部门人员手动审核。`);
    setTimeout(() => setUnfreezeSubmittedMsg(null), 5000);
  };

  // 5a. Submit Household Splitting - Auto Path
  const handleExecuteAutoSplit = () => {
    if (!currentFamily || splitSelectedIds.length === 0) return;
    if (!splitMarriageCertUploaded) {
      alert('结婚证明或同等效力文件为必需材料，请上传后重试！');
      return;
    }
    const selectedMembers = currentFamily.members.filter(m => splitSelectedIds.includes(m.id));
    const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
    const newFamilyCode = `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`;
    const headCandidate = selectedMembers.find(m => m.gender === '男') || selectedMembers[0];

    const splitFamily: FamilyRecord = {
      rationCardNo: newCardNo,
      oldPaperCardNo: 'NEW-SPLIT-AUTO',
      familyCode: newFamilyCode,
      province: currentFamily.province,
      district: currentFamily.district,
      headName: headCandidate.name,
      phone: headCandidate.phone || currentFamily.phone,
      memberCount: selectedMembers.length,
      status: '正常',
      agentId: currentFamily.agentId,
      agentName: currentFamily.agentName,
      address: headCandidate.residenceInfo || currentFamily.address,
      createdDate: new Date().toISOString().split('T')[0],
      lastSelfCheckDate: new Date().toISOString().split('T')[0],
      members: selectedMembers.map(m => ({
        ...m,
        familyCode: newFamilyCode,
        relation: m.id === headCandidate.id ? '户主' : m.gender === '女' ? '配偶' : '子女',
        isUpdatedInSystem: true
      }))
    };

    // Remove split members from source family
    const remainingMembers = currentFamily.members.filter(m => !splitSelectedIds.includes(m.id));
    const updatedSourceFamily: FamilyRecord = {
      ...currentFamily,
      memberCount: remainingMembers.length,
      members: remainingMembers
    };

    onAddFamily(splitFamily);
    onUpdateFamily(updatedSourceFamily);
    setSplitResultNotice(
      `【系统自动判别通过】新家庭被成功识别为合法夫妻，系统已自动批准分户并签发新配给卡号：${newCardNo}！`
    );
    setSplitSelectedIds([]);
    setSplitJudgeResult(null);
  };

  // 5b. Automated Priority Judge Handler
  const handleSystemAutoJudgeSplit = () => {
    if (!currentFamily || splitSelectedIds.length === 0) {
      alert('请先勾选需要移入新户的家庭成员！');
      return;
    }
    if (!splitMarriageCertUploaded) {
      alert('结婚证明或同等效力文件为必需材料，请上传后重试！');
      return;
    }

    const selectedMembers = currentFamily.members.filter(m => splitSelectedIds.includes(m.id));
    const hasMale = selectedMembers.some(m => m.gender === '男');
    const hasFemale = selectedMembers.some(m => m.gender === '女');
    const isCoupleStructure = selectedMembers.length >= 2 && hasMale && hasFemale;

    if (isCoupleStructure) {
      // Automatic judgment passed!
      handleExecuteAutoSplit();
    } else {
      // Automatic judgment failed!
      const failReason = selectedMembers.length === 1
        ? '拟分立成员仅为单独一人，不满足“夫妻标准组合”自动识别规则，系统自动判别未通过。'
        : '拟分立成员组合非标准夫妻结构，系统自动判别未通过。';
      setSplitJudgeResult({ passed: false, reason: failReason });
    }
  };

  // 5c. Submit Household Splitting - Electronic Review Path (when auto judgment fails, click to submit for manual review)
  const handleSubmitSplitForElectronicReview = () => {
    if (!currentFamily || splitSelectedIds.length === 0) return;
    if (!splitMarriageCertUploaded) {
      alert('结婚证明或同等效力文件为必需材料，请先上传！');
      return;
    }

    const selectedMembers = currentFamily.members.filter(m => splitSelectedIds.includes(m.id));
    const isSinglePerson = selectedMembers.length === 1;
    const ticketId = `REV-SPL-${Date.now().toString().slice(-4)}`;
    const reasonDesc = isSinglePerson
      ? '拟分立成员仅为单独一人，系统自动判别未通过，转交分部门人员手动审核'
      : '拟分立成员非标准夫妻组合，系统自动判别未通过，转交分部门人员手动审核';

    const newTicket: ReviewTicket = {
      id: ticketId,
      source: '申请分户',
      categoryType: isSinglePerson ? '单人分户人工审核' : '非夫妻组合分户审核',
      appType: `配给卡分户 (${isSinglePerson ? '单人分立' : '非夫妻组合'})`,
      cardNo: currentFamily.rationCardNo,
      applicantName: currentFamily.headName,
      targetMemberName: selectedMembers.map(m => m.name).join('、'),
      reason: reasonDesc,
      status: '待分部初审',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      staffOpinion: '',
      managerDecision: '待决',
      payload: {
        splitMemberIds: splitSelectedIds
      }
    };

    setReviewTickets(prev => [newTicket, ...prev]);
    setSplitResultNotice(
      `【已提交电子审核】记录已提交至配给分部门（工单号 ${ticketId}），已进入【电子审核工作台】，等待分部门人员手动审核！`
    );
    setSplitSelectedIds([]);
    setSplitJudgeResult(null);
    setActiveTab('branch_review');
    setSelectedTicketId(ticketId);
  };

  // 6. Submit Member Transfer
  const handleConfirmTransfer = () => {
    if (!currentFamily || !transferMemberId) return;

    const sourceFamily = familyData.find(f => f.rationCardNo === transferSourceCardNo);
    const targetMember = sourceFamily?.members.find(m => m.id === transferMemberId);

    if (!targetMember) return;
    if (!targetMember.isUpdatedInSystem) {
      alert(t.memberNotUpdatedErr);
      return;
    }
    if (!transferBiometricVerified) {
      alert('被转移成员尚未完成生物识别现场拍照核验！');
      return;
    }

    // Move member from source to target
    if (sourceFamily && sourceFamily.rationCardNo !== currentFamily.rationCardNo) {
      const updatedSourceMembers = sourceFamily.members.filter(m => m.id !== transferMemberId);
      onUpdateFamily({
        ...sourceFamily,
        memberCount: updatedSourceMembers.length,
        members: updatedSourceMembers
      });
    }

    const transferredMember: FamilyMember = {
      ...targetMember,
      familyCode: currentFamily.familyCode,
      relation: transferReason.includes('结婚') ? '配偶' : '受抚养人',
      isUpdatedInSystem: true,
      faceVerified: true
    };

    const updatedTargetFamily: FamilyRecord = {
      ...currentFamily,
      memberCount: currentFamily.members.length + 1,
      members: [...currentFamily.members, transferredMember]
    };

    onUpdateFamily(updatedTargetFamily);
    setTransferResultMsg(
      `成员跨卡转移已成功完成！被转移成员【${targetMember.name}】已并入当前配给卡【${currentFamily.rationCardNo}】。`
    );
    setTransferMemberId('');
    setTransferBiometricVerified(false);
    setTimeout(() => setTransferResultMsg(null), 4000);
  };

  // 7. Electronic Review: Staff submits opinion
  const handleStaffSubmitOpinion = (ticketId: string) => {
    setReviewTickets(prev =>
      prev.map(tk => {
        if (tk.id === ticketId) {
          return {
            ...tk,
            status: '待经理终审',
            staffOpinion: staffOpinionInput,
            staffName: '萨米拉·卡西姆 (配给分部资格审核专员)',
            staffReviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
        }
        return tk;
      })
    );
  };

  // 8. Electronic Review: Manager decrees Accept / Reject
  const handleManagerDecision = (ticketId: string, decision: '接受' | '拒绝') => {
    setReviewTickets(prev =>
      prev.map(tk => {
        if (tk.id === ticketId) {
          return {
            ...tk,
            status: decision === '接受' ? '已批准' : '已驳回',
            managerDecision: decision,
            managerName: '海德尔·阿卜杜拉 (巴格达配给分部经理)',
            managerNotes: managerNotesInput,
            managerDecidedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
          };
        }
        return tk;
      })
    );

    // If accepted, execute corresponding business logic
    const ticket = reviewTickets.find(t => t.id === ticketId);
    if (ticket && decision === '接受' && currentFamily) {
      if (ticket.payload?.name) {
        // Add member
        const newMember: FamilyMember = {
          id: `M-${Date.now().toString().slice(-4)}`,
          name: ticket.payload.name,
          nationalId: ticket.payload.nationalId,
          familyCode: ticket.payload.familyCode || currentFamily.familyCode,
          relation: ticket.payload.relation || '子女',
          birthDate: '2024-01-01',
          gender: '男',
          status: '正常',
          phone: ticket.payload.phone,
          residenceInfo: ticket.payload.residence,
          isUpdatedInSystem: true,
          faceVerified: true
        };
        onUpdateFamily({
          ...currentFamily,
          memberCount: currentFamily.members.length + 1,
          members: [...currentFamily.members, newMember]
        });
      } else if (ticket.payload?.unfreezeType && ticket.payload?.targetMemberId) {
        // Unfreeze member
        const updatedMembers = currentFamily.members.map(m => {
          if (m.id === ticket.payload.targetMemberId) {
            return { ...m, status: '正常' as const, freezeReason: undefined };
          }
          return m;
        });
        onUpdateFamily({
          ...currentFamily,
          status: '正常',
          freezeReason: undefined,
          members: updatedMembers
        });
      } else if (ticket.payload?.newHeadId) {
        // Approve change head of household
        const newHead = currentFamily.members.find(m => m.id === ticket.payload.newHeadId);
        if (newHead) {
          const updatedMembers = currentFamily.members.map(m => {
            if (m.relation === '户主') {
              return { ...m, relation: '父母' as const, status: '已故' as const };
            }
            if (m.id === ticket.payload.newHeadId) {
              return { ...m, relation: '户主' as const };
            }
            return m;
          });
          onUpdateFamily({
            ...currentFamily,
            headName: newHead.name,
            phone: newHead.phone || currentFamily.phone,
            members: updatedMembers
          });
        }
      } else if (ticket.payload?.splitMemberIds) {
        // Approve household splitting
        const selectedMembers = currentFamily.members.filter(m => ticket.payload.splitMemberIds.includes(m.id));
        if (selectedMembers.length > 0) {
          const newCardNo = `RC-1002${Math.floor(2000 + Math.random() * 7000)}`;
          const newFamilyCode = `FAM-BAG-${Math.floor(10000 + Math.random() * 89999)}`;
          const headCandidate = selectedMembers.find(m => m.gender === '男') || selectedMembers[0];

          const splitFamily: FamilyRecord = {
            rationCardNo: newCardNo,
            oldPaperCardNo: 'NEW-SPLIT-APPROVED',
            familyCode: newFamilyCode,
            province: currentFamily.province,
            district: currentFamily.district,
            headName: headCandidate.name,
            phone: headCandidate.phone || currentFamily.phone,
            memberCount: selectedMembers.length,
            status: '正常',
            agentId: currentFamily.agentId,
            agentName: currentFamily.agentName,
            address: headCandidate.residenceInfo || currentFamily.address,
            createdDate: new Date().toISOString().split('T')[0],
            lastSelfCheckDate: new Date().toISOString().split('T')[0],
            members: selectedMembers.map(m => ({
              ...m,
              familyCode: newFamilyCode,
              relation: m.id === headCandidate.id ? '户主' : '子女',
              isUpdatedInSystem: true
            }))
          };

          const remainingMembers = currentFamily.members.filter(m => !ticket.payload.splitMemberIds.includes(m.id));
          onAddFamily(splitFamily);
          onUpdateFamily({
            ...currentFamily,
            memberCount: remainingMembers.length,
            members: remainingMembers
          });
        }
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Sub-Tabs - Mobile Scrollable & Touch Friendly */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>家庭成员名册与录入</span>
          </button>

          <button
            onClick={() => setActiveTab('change_head')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'change_head'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>{t.actionChangeHead}</span>
          </button>

          <button
            onClick={() => setActiveTab('unfreeze')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'unfreeze'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Unlock className="w-4 h-4 text-amber-500" />
            <span>{t.actionUnfreeze}</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'split'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-purple-500" />
            <span>{t.actionSplit}</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-indigo-500" />
            <span>{t.actionTransfer}</span>
          </button>

          <button
            onClick={() => setActiveTab('branch_review')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 sm:ml-auto cursor-pointer ${
              activeTab === 'branch_review'
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>电子审核工作台</span>
            {reviewTickets.filter(t => t.status === '待分部初审' || t.status === '待经理终审').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {reviewTickets.filter(t => t.status === '待分部初审' || t.status === '待经理终审').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Success Notices */}
      {updateSuccessNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{updateSuccessNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MEMBERS LIST & REGISTRATION (Requirements 1, 2, 4, 6)             */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>{t.memberListTitle}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.memberListSubtitle}</p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.addNewMemberBtn}</span>
            </button>
          </div>

          {/* Members Table & Mobile Card View */}
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/60 p-2 sm:p-3 space-y-3">
              {currentFamily?.members.map(m => (
                <div key={m.id} className="pt-3 first:pt-0 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                        {m.name.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {m.gender} · {m.birthDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          m.relation === '户主'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : m.relation === '配偶'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {m.relation}
                      </span>
                      {m.status === '正常' ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t.statusNormal}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {m.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">国民卡号:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{m.nationalId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">联系电话:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate block">{m.phone || currentFamily.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">统一家庭编号:</span>
                      <span className="text-slate-500 text-[10px] truncate block">{m.familyCode || currentFamily.familyCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">生物核验:</span>
                      {m.faceVerified ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>已通过</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setRemoteVerifyTargetId(m.id)}
                          className="text-amber-500 underline text-[10px] cursor-pointer"
                        >
                          待远程核验
                        </button>
                      )}
                    </div>
                  </div>

                  {m.freezeReason && (
                    <div className="text-[10px] text-rose-400 bg-rose-500/10 p-1.5 rounded">
                      冻结原因: {m.freezeReason}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenUpdateModal(m)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 text-center transition-colors cursor-pointer"
                    >
                      {t.actionUpdateInfo}
                    </button>
                    {m.status === '冻结' && (
                      <button
                        onClick={() => {
                          setUnfreezeTargetMemberId(m.id);
                          setActiveTab('unfreeze');
                        }}
                        className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer"
                      >
                        {t.actionUnfreeze}
                      </button>
                    )}
                    {!m.faceVerified && (
                      <button
                        onClick={() => setRemoteVerifyTargetId(m.id)}
                        className="py-1.5 px-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer"
                      >
                        核验
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">{t.colName}</th>
                    <th className="px-4 py-3">{t.colRelation}</th>
                    <th className="px-4 py-3">{t.colNationalId}</th>
                    <th className="px-4 py-3">{t.colFamilyCode}</th>
                    <th className="px-4 py-3">{t.colCardStatus}</th>
                    <th className="px-4 py-3">{t.colBiometricStatus}</th>
                    <th className="px-4 py-3">{t.colPhone}</th>
                    <th className="px-4 py-3 text-right">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-700 dark:text-slate-200">
                  {currentFamily?.members.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            {m.name.slice(0, 1)}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{m.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {m.gender} · {m.birthDate}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            m.relation === '户主'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              : m.relation === '配偶'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {m.relation}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{m.nationalId}</td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {m.familyCode || currentFamily.familyCode || 'FAM-BAG-08832'}
                      </td>

                      <td className="px-4 py-3">
                        {m.status === '正常' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {t.statusNormal}
                          </span>
                        ) : m.status === '冻结' ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 inline-block w-fit">
                              {t.statusFrozen}
                            </span>
                            {m.freezeReason && (
                              <span className="text-[10px] text-rose-400">
                                原因: {m.freezeReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {m.status}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {m.faceVerified ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-emerald-500 font-medium flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.verifiedBadge}</span>
                            </span>
                            {m.remoteVerified && (
                              <span className="text-[10px] text-slate-400">
                                异地: {m.remoteVerifiedLocation?.slice(0, 10)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setRemoteVerifyTargetId(m.id)}
                            className="text-amber-500 hover:text-amber-400 font-medium underline text-[11px] cursor-pointer"
                          >
                            待远程核验
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {m.phone || currentFamily.phone}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenUpdateModal(m)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          >
                            {t.actionUpdateInfo}
                          </button>
                          {m.status === '冻结' && (
                            <button
                              onClick={() => {
                                setUnfreezeTargetMemberId(m.id);
                                setActiveTab('unfreeze');
                              }}
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              {t.actionUnfreeze}
                            </button>
                          )}
                          {!m.faceVerified && (
                            <button
                              onClick={() => setRemoteVerifyTargetId(m.id)}
                              className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              {t.actionRemoteVerify}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHANGE HOUSEHOLD HEAD (Requirement 3)                              */}
      {/* ========================================================================= */}
      {activeTab === 'change_head' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>{t.changeHeadModalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.changeHeadModalSubtitle}</p>
          </div>

          {changeHeadMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{changeHeadMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.currentHeadLabel} (需变更的原户主)
                </label>
                <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">{currentFamily?.headName}</div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    {currentFamily?.rationCardNo} · {currentFamily?.province}
                  </div>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={deathProofNo}
                  onChange={e => setDeathProofNo(e.target.value)}
                  placeholder={t.deathCertNoInputLabel}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs mb-3 font-mono"
                />
                <MockDocumentUploader
                  documentKey="death_proof"
                  title={t.deathProofDocLabel}
                  subtitle="上传法定死亡医学证明与户籍注销公证书，核实后方可指定替代户主"
                  categoryBadge="法医死亡鉴定与注销公函"
                  categoryColor="rose"
                  issuer="伊拉克卫生部法医总局 & 内政部户政司"
                  defaultFileName="卫生部法医总局_户主死亡医学鉴定书及民政注销公函_DTH-BAG-2026-90182.pdf"
                  defaultRefNo={deathProofNo}
                  ocrSummary="已识别原户主身份销籍备案条码，法定死亡鉴定印章与全国户籍底册销户记录比对属实"
                  isRequired={true}
                  onStatusChange={(uploaded, file) => {
                    setDeathProofFileUploaded(uploaded);
                    if (file) {
                      setDeathProofNo(file.referenceNo);
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.replacementHeadSelectLabel}
                </label>
                <select
                  value={replacementHeadId}
                  onChange={e => setReplacementHeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {currentFamily?.members
                    .filter(m => m.relation !== '户主' && m.status === '正常')
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relation} · {m.nationalId})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{t.replacementHeadHint}</p>
              </div>

              <div className="pt-4">
                {/* Confirmation button with NO ICON */}
                <button
                  type="button"
                  onClick={handleConfirmChangeHead}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                >
                  {t.confirmChangeHeadSubmit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: UNFREEZE APPLICATION (Requirement 7)                               */}
      {/* ========================================================================= */}
      {activeTab === 'unfreeze' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-amber-500" />
              <span>{t.unfreezeModalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.unfreezeModalSubtitle}</p>
          </div>

          {unfreezeSubmittedMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{unfreezeSubmittedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  选择解冻对象 (家庭成员或全户)
                </label>
                <select
                  value={unfreezeTargetMemberId}
                  onChange={e => setUnfreezeTargetMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {currentFamily?.members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation} · 状态: {m.status} {m.freezeReason ? `[${m.freezeReason}]` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.unfreezeTypeSelectLabel} (支持全部8大指定解冻情形)
                </label>
                <select
                  value={unfreezeType}
                  onChange={e => setUnfreezeType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
                >
                  <option value="商业">1. 商业 (需上传：商业注销证明或非营利纳税清算函)</option>
                  <option value="旅行">2. 旅行 (需上传：海关入境归国护照戳记及回国证明)</option>
                  <option value="高收入">3. 高收入 (需上传：财政/税务用人单位最新月薪核算单)</option>
                  <option value="住址不明">4. 住址不明 (需上传：所属社区民政网格常住证明)</option>
                  <option value="更新">5. 更新 (需上传：统一国民卡最新更正档案确认公函)</option>
                  <option value="重复">6. 重复 (需上传：户政唯一身份申明公证书及销重证明)</option>
                  <option value="临时">7. 临时 (需上传：临时限制解除官方通告书)</option>
                  <option value="地理位置">8. 地理位置 (需上传：属地居住公证与实地定位核验件)</option>
                </select>
              </div>

              <div>
                <MockDocumentUploader
                  documentKey={`unfreeze_${unfreezeType}`}
                  title={t.unfreezeDocUploadLabel}
                  subtitle={
                    unfreezeType === '商业'
                      ? t.unfreezeDoc_commercial
                      : unfreezeType === '旅行'
                      ? t.unfreezeDoc_travel
                      : unfreezeType === '高收入'
                      ? t.unfreezeDoc_high_income
                      : unfreezeType === '住址不明'
                      ? t.unfreezeDoc_unknown_address
                      : unfreezeType === '更新'
                      ? t.unfreezeDoc_update
                      : unfreezeType === '重复'
                      ? t.unfreezeDoc_duplicate
                      : unfreezeType === '临时'
                      ? t.unfreezeDoc_temporary
                      : t.unfreezeDoc_geo_location
                  }
                  categoryBadge={UNFREEZE_DOC_CONFIGS[unfreezeType]?.badge || '官方证明材料'}
                  categoryColor={UNFREEZE_DOC_CONFIGS[unfreezeType]?.color || 'teal'}
                  issuer={UNFREEZE_DOC_CONFIGS[unfreezeType]?.issuer || '伊拉克政府认证部门'}
                  defaultFileName={UNFREEZE_DOC_CONFIGS[unfreezeType]?.fileName || unfreezeDocName}
                  defaultRefNo={UNFREEZE_DOC_CONFIGS[unfreezeType]?.refNo || 'UNF-2026-DOC'}
                  ocrSummary={UNFREEZE_DOC_CONFIGS[unfreezeType]?.ocrSummary || '已自动核验公章与文号存根一致'}
                  isRequired={true}
                  onStatusChange={(isUploaded, file) => {
                    setUnfreezeFileUploaded(isUploaded);
                    if (file) {
                      setUnfreezeDocName(file.fileName);
                    } else {
                      setUnfreezeDocName('');
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  申诉陈述与解冻理由说明
                </label>
                <textarea
                  rows={4}
                  value={unfreezeStatement}
                  onChange={e => setUnfreezeStatement(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2">
                {/* Confirmation button with NO ICON */}
                <button
                  type="button"
                  onClick={handleConfirmUnfreeze}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                >
                  {t.confirmUnfreezeSubmit}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HOUSEHOLD SPLITTING (Requirement 8)                                */}
      {/* ========================================================================= */}
      {activeTab === 'split' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-purple-500" />
              <span>{t.splitModalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.splitModalSubtitle}</p>
          </div>

          {/* Instructions Banner: Priority Automatic Judgment */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
              <span>办理说明：无需手动选择路径。提交后系统将<strong>优先智能自动判别</strong>，若未满足全自动标准，可一键<strong>转入分部电子审核</strong>。</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold shrink-0">
              智能分流
            </span>
          </div>

          {splitResultNotice && (
            <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-400">
              {splitResultNotice}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t.selectSplitMembersTitle} (从当前配给卡勾选移入新卡的人员)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentFamily?.members.map(m => {
                  const isSelected = splitSelectedIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSplitJudgeResult(null);
                        if (isSelected) {
                          setSplitSelectedIds(prev => prev.filter(id => id !== m.id));
                        } else {
                          setSplitSelectedIds(prev => [...prev, m.id]);
                        }
                      }}
                      className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {m.gender} · {m.relation} · {m.nationalId}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-purple-600 focus:ring-0"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Uploads: Two Independent Documents */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700/80">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>分户证明材料上传 (支持两份各自独立上传)</span>
              </div>

              {/* Document 1: Marriage Certificate or Equivalent - REQUIRED */}
              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-2">
                <MockDocumentUploader
                  documentKey="split_marriage_cert"
                  title="1. 结婚证明或同等效力公文"
                  subtitle="民政婚姻登记证书或最高司法委员会法院判决文书（系统自动判别夫妻合法关系的核心依据）"
                  categoryBadge="民政结婚证书 / 司法判决书"
                  categoryColor="purple"
                  issuer="伊拉克最高司法委员会 · 卡尔赫民事法庭"
                  defaultFileName="最高司法委员会_民事结婚证书与分立公函_MC-2026-BAG-09921.pdf"
                  defaultRefNo={splitMarriageCertNo}
                  ocrSummary="已识别民政婚姻公证印鉴，配偶身份核验属实，符合婚姻分户立卡规定"
                  sampleApplicantName={currentFamily?.headName}
                  isRequired={true}
                  initialUploaded={splitMarriageCertUploaded}
                  onStatusChange={(uploaded, file) => {
                    setSplitMarriageCertUploaded(uploaded);
                    if (file) setSplitMarriageCertNo(file.referenceNo);
                  }}
                />
              </div>

              {/* Document 2: Other Supporting Documents - OPTIONAL */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                <MockDocumentUploader
                  documentKey="split_other_doc"
                  title="2. 其他辅助证明文件"
                  subtitle="如独立常住住宅产权证/房屋租赁合同、独立水电气户头单据或社区常住网格证明（可选提交）"
                  categoryBadge="住所产权 / 租赁合同 / 补充公文"
                  categoryColor="indigo"
                  issuer="地方市政规划委员会 & 房屋所有权登记局"
                  defaultFileName="市政规划委员会_独立常住住宅不动产权公证书与租约_ADD-2026-7810.pdf"
                  defaultRefNo={splitOtherDocNo}
                  ocrSummary="已识别房屋租赁合同及独立网格电费编号，具备独立常住生活居住条件"
                  sampleApplicantName={currentFamily?.headName}
                  isRequired={false}
                  initialUploaded={splitOtherDocUploaded}
                  onStatusChange={(uploaded, file) => {
                    setSplitOtherDocUploaded(uploaded);
                    if (file) setSplitOtherDocNo(file.referenceNo);
                  }}
                />
              </div>
            </div>

            {/* Judge Result & Action Buttons */}
            <div className="pt-2 space-y-3">
              {splitJudgeResult && !splitJudgeResult.passed && (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>系统自动判别未通过</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                    {splitJudgeResult.reason}
                  </p>
                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSubmitSplitForElectronicReview}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>转入分部电子审核 (提交分部门人员手动复核)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitJudgeResult(null)}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      重新调整人员
                    </button>
                  </div>
                </div>
              )}

              {(!splitJudgeResult || splitJudgeResult.passed) && (
                <button
                  type="button"
                  disabled={splitSelectedIds.length === 0}
                  onClick={handleSystemAutoJudgeSplit}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>提交分户申请 · 优先系统智能判别</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MEMBER TRANSFER (Requirement 9)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'transfer' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-500" />
              <span>{t.transferModalTitle}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.transferModalSubtitle}</p>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-400">
            {t.receiverCardNotice}：当前接收卡为【{currentFamily?.rationCardNo}】(户主: {currentFamily?.headName})
          </div>

          {transferResultMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{transferResultMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1: Select Source & Check Updated Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.step1VerifyUpdated}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {currentFamily?.members.map(m => {
                  const isUpdated = m.isUpdatedInSystem !== false;
                  const isSelected = transferMemberId === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        if (!isUpdated) {
                          alert(t.memberNotUpdatedErr);
                          return;
                        }
                        setTransferMemberId(m.id);
                      }}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        !isUpdated
                          ? 'opacity-60 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 cursor-not-allowed'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 cursor-pointer'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{m.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            isUpdated
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {isUpdated ? t.memberUpdatedOk : '未更新 (不可选)'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {m.relation} · {m.nationalId}
                      </div>
                      {!isUpdated && (
                        <div className="text-[10px] text-rose-500 font-medium mt-1">
                          {t.memberNotUpdatedErr}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Biometric Verification */}
            {transferMemberId && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  <span>{t.step2BiometricVerify}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.step2BiometricDesc}</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferBiometricVerified(true)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    现场拍摄面部照片核验
                  </button>
                  {transferBiometricVerified && (
                    <span className="text-emerald-500 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>生物识别比对通过 (本人知情确认)</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Select Transfer Reason & Submit */}
            {transferMemberId && transferBiometricVerified && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.transferReasonLabel}
                  </label>
                  <select
                    value={transferReason}
                    onChange={e => setTransferReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="结婚转移 (夫妻团聚投靠)">{t.transferReason_marriage}</option>
                    <option value="子女转移 (随父母变更)">{t.transferReason_child}</option>
                    <option value="法定义务监护转移">{t.transferReason_custody}</option>
                    <option value="赡养抚养法定转移">{t.transferReason_support}</option>
                  </select>
                </div>

                {/* Transfer reason proof document uploader */}
                <div className="pt-1">
                  <MockDocumentUploader
                    documentKey={`transfer_${transferReason.substring(0, 2)}`}
                    title="转移事由法定证明文件"
                    subtitle="依据所选转移事由类型上传对应的法定公证书或判决书"
                    categoryBadge={
                      transferReason.includes('结婚')
                        ? '民事婚姻公证书'
                        : transferReason.includes('子女')
                        ? '医学亲子关系公证'
                        : transferReason.includes('监护')
                        ? '法院监护判决公文'
                        : '法定赡养抚养协议'
                    }
                    categoryColor={
                      transferReason.includes('结婚')
                        ? 'purple'
                        : transferReason.includes('子女')
                        ? 'blue'
                        : transferReason.includes('监护')
                        ? 'amber'
                        : 'teal'
                    }
                    issuer={
                      transferReason.includes('结婚')
                        ? '最高司法委员会 · 卡尔赫民事公证处'
                        : transferReason.includes('子女')
                        ? '卫生部与内政部户政司'
                        : transferReason.includes('监护')
                        ? '巴格达少年民事法院'
                        : '国家司法公证中心'
                    }
                    defaultFileName={
                      transferReason.includes('结婚')
                        ? '民事法庭_夫妻投靠婚姻证明公证书_TRF-MC-2026-4401.pdf'
                        : transferReason.includes('子女')
                        ? '卫生与户政局_随父母转移亲子关系医学公证书_TRF-CHD-2026-4402.pdf'
                        : transferReason.includes('监护')
                        ? '法院法定监护权变更判决书_TRF-CUS-2026-4403.pdf'
                        : '公证处_法定赡养抚养协议与亲属证明_TRF-SUP-2026-4404.pdf'
                    }
                    defaultRefNo={transferDocNo}
                    ocrSummary="法定公证机构条码校验通过，亲属关系链条完整，符合跨卡接收核准规范"
                    sampleApplicantName={
                      currentFamily?.members.find(m => m.id === transferMemberId)?.name || '申请转移成员'
                    }
                  />
                </div>

                {/* Confirmation button with NO ICON */}
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                >
                  {t.confirmTransferSubmit}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BRANCH ELECTRONIC REVIEW CONSOLE (Requirement 5)                   */}
      {/* ========================================================================= */}
      {activeTab === 'branch_review' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-500" />
              <span>电子审核工作台</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              统一受理申请分户、申请解冻、变更户主、成员录入、成员转移等需分部门人工核验的电子审核工单，支持两级在线审批
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List Column with Source Filters */}
            <div className="space-y-3 lg:col-span-1">
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>待办工单清单</span>
                  <span className="text-[11px] text-slate-400">
                    共 {reviewTickets.length} 笔工单
                  </span>
                </div>

                {/* Source Filter Pills */}
                <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
                  {(['全部', '申请分户', '申请解冻', '变更户主', '成员录入', '成员转移'] as const).map(sourceName => {
                    const count = sourceName === '全部'
                      ? reviewTickets.length
                      : reviewTickets.filter(t => t.source === sourceName).length;
                    const isActive = reviewFilterSource === sourceName;
                    return (
                      <button
                        key={sourceName}
                        type="button"
                        onClick={() => setReviewFilterSource(sourceName)}
                        className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          isActive
                            ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <span>{sourceName}</span>
                        <span className={`text-[10px] px-1 rounded-full ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtered Tickets List */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-0.5">
                {(() => {
                  const displayedTickets = reviewTickets.filter(
                    t => reviewFilterSource === '全部' || t.source === reviewFilterSource
                  );

                  if (displayedTickets.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                        当前【{reviewFilterSource}】来源下暂无待办工单
                      </div>
                    );
                  }

                  const getSourceBadgeStyle = (source: ReviewTicket['source']) => {
                    switch (source) {
                      case '申请分户':
                        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
                      case '申请解冻':
                        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                      case '变更户主':
                        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
                      case '成员录入':
                        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                      case '成员转移':
                        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
                      default:
                        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
                    }
                  };

                  return displayedTickets.map(tk => (
                    <div
                      key={tk.id}
                      onClick={() => setSelectedTicketId(tk.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedTicketId === tk.id
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getSourceBadgeStyle(tk.source)}`}>
                            {tk.source}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">{tk.id}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                            tk.status === '待分部初审'
                              ? 'bg-amber-500/10 text-amber-500'
                              : tk.status === '待经理终审'
                              ? 'bg-blue-500/10 text-blue-500'
                              : tk.status === '已批准'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {tk.status}
                        </span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-semibold">{tk.appType}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span className="truncate">目标: {tk.targetMemberName}</span>
                        <span className="font-mono shrink-0 ml-1">{tk.submittedAt.slice(5)}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Ticket Work Area Column */}
            <div className="lg:col-span-2 space-y-6">
              {(() => {
                const activeTicket = reviewTickets.find(t => t.id === selectedTicketId) || reviewTickets[0];
                if (!activeTicket) {
                  return <div className="text-xs text-slate-400">暂无选中的电子审核工单</div>;
                }

                return (
                  <div className="space-y-6">
                    {/* Ticket Header & Reason */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                            工单编号：{activeTicket.id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            来源：{activeTicket.source}
                          </span>
                        </div>
                        <span className="text-slate-400">{activeTicket.submittedAt}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300">
                        申请类型：<span className="font-semibold">{activeTicket.appType}</span> | 配给卡号：
                        <span className="font-mono">{activeTicket.cardNo}</span>
                      </div>
                      <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-xs">
                        触发电子审核原因：{activeTicket.reason}
                      </div>
                    </div>

                    {/* Stage 1: Branch Staff Review */}
                    <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span>第一级：分部员工审核 (资格与数据查验)</span>
                        {activeTicket.staffReviewedAt && (
                          <span className="text-emerald-500 font-normal">已出具初审意见 ({activeTicket.staffReviewedAt})</span>
                        )}
                      </div>

                      {activeTicket.staffOpinion ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                          <div className="text-slate-400 text-[10px] mb-1">
                            审查人员：{activeTicket.staffName}
                          </div>
                          <div>{activeTicket.staffOpinion}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.staffOpinionInputLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={staffOpinionInput}
                            onChange={e => setStaffOpinionInput(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                          {/* Confirmation button with NO ICON */}
                          <button
                            type="button"
                            onClick={() => handleStaffSubmitOpinion(activeTicket.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                          >
                            {t.confirmStaffSubmit}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage 2: Branch Manager Final Decree */}
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>第二级：分部经理终审裁决</span>
                        {activeTicket.managerDecidedAt && (
                          <span
                            className={`font-semibold ${
                              activeTicket.managerDecision === '接受' ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            最终裁决：{activeTicket.managerDecision} ({activeTicket.managerDecidedAt})
                          </span>
                        )}
                      </div>

                      {activeTicket.managerNotes && activeTicket.managerDecision !== '待决' ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                          <div className="text-slate-400 text-[10px] mb-1">
                            签发领导：{activeTicket.managerName}
                          </div>
                          <div>{activeTicket.managerNotes}</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                            {t.managerDecisionInputLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={managerNotesInput}
                            onChange={e => setManagerNotesInput(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                          <div className="flex items-center gap-3 pt-1">
                            {/* Confirmation buttons with NO ICONS */}
                            <button
                              type="button"
                              onClick={() => handleManagerDecision(activeTicket.id, '接受')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                            >
                              {t.confirmManagerAccept}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleManagerDecision(activeTicket.id, '拒绝')}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                            >
                              {t.confirmManagerReject}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD MEMBER WITH LIVE BIOMETRICS & AUTO VALIDATION (Req 1 & 2)      */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 text-white shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold">{t.addMemberModalTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{t.addMemberModalSubtitle}</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                {t.close}
              </button>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.memberNameLabel}</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.memberRelationLabel}</label>
                <select
                  value={addRelation}
                  onChange={e => setAddRelation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="子女">子女</option>
                  <option value="配偶">配偶</option>
                  <option value="父母">父母</option>
                  <option value="受抚养人">受抚养人</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.memberNidLabel}</label>
                <input
                  type="text"
                  value={addNid}
                  onChange={e => setAddNid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.memberFamilyCodeLabel}</label>
                <input
                  type="text"
                  value={testMismatchCode ? 'FAM-MISMATCH-99999' : addFamilyCode}
                  onChange={e => setAddFamilyCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setTestMismatchCode(!testMismatchCode)}
                  className="text-[10px] text-amber-400 underline mt-1 block"
                >
                  {testMismatchCode ? '切换回正常一致编号' : '模拟家庭编号不一致 (测试电子审核)'}
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.memberPhoneLabel}</label>
                <input
                  type="text"
                  value={addPhone}
                  onChange={e => setAddPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.childDocTypeLabel}</label>
                <select
                  value={childDocType}
                  onChange={e => setChildDocType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="birth_cert">{t.childDocBirthCert}</option>
                  <option value="custody">{t.childDocCustody}</option>
                  <option value="adoption">{t.childDocAdoption}</option>
                </select>
              </div>
            </div>

            {/* Live Face Capture Simulation */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>现场人脸识别拍摄比对</span>
                </span>
                {faceCaptured ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>人脸活体特征匹配成功 (99.4%)</span>
                  </span>
                ) : (
                  <span className="text-amber-400 text-[11px]">待拍照</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFaceCaptured(true)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {faceCaptured ? '重新拍摄面部照片' : '现场拍摄面部照片'}
              </button>
            </div>

            {/* Document Uploads Preview with Differentiated Mock Uploaders */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-slate-200">
                法定证明材料与证件数字化扫描件上传核验
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <MockDocumentUploader
                  documentKey="id_front"
                  title="统一国民卡正面"
                  subtitle="含公民肖像、12位统一国民身份证号及姓名"
                  categoryBadge="国民卡正面肖像"
                  categoryColor="blue"
                  issuer="内政部统一国民卡户政局"
                  defaultFileName="统一国民智能卡_正面原件扫描_NID-FRT-6829104.jpg"
                  defaultRefNo={addNid}
                  ocrSummary="肖像面部特征与现场拍照比对吻合，12位国民统一身份证号有效"
                  sampleApplicantName={addName}
                  onStatusChange={(up) => setIdFrontUploaded(up)}
                />

                <MockDocumentUploader
                  documentKey="id_back"
                  title="统一国民卡反面"
                  subtitle="含安全芯片编码、MRZ机读码及家庭户籍编号"
                  categoryBadge="国民卡反面芯片"
                  categoryColor="indigo"
                  issuer="内政部统一国民卡户政局"
                  defaultFileName="统一国民智能卡_反面芯片与机读码_NID-BCK-6829104.jpg"
                  defaultRefNo={testMismatchCode ? 'FAM-MISMATCH-99999' : addFamilyCode}
                  ocrSummary="安全芯片序列号验真通过，MRZ机读码与家庭底册编号登记一致"
                  sampleApplicantName={addName}
                  onStatusChange={(up) => setIdBackUploaded(up)}
                />
              </div>

              {/* Differentiated Child / Member Condition Document */}
              <div className="pt-2">
                <MockDocumentUploader
                  documentKey={`child_doc_${childDocType}`}
                  title={
                    childDocType === 'birth_cert'
                      ? '出生医学证明文件'
                      : childDocType === 'custody'
                      ? '民事法庭法定监护判决公文'
                      : '收养公证登记批准文书'
                  }
                  subtitle={
                    childDocType === 'birth_cert'
                      ? '官方出生医学证明（含条形码联网存根与医院公章）'
                      : childDocType === 'custody'
                      ? '民事法庭生效裁定书（含法官判决签章与案卷号）'
                      : '劳动与社会事务部收养核准登记批文'
                  }
                  categoryBadge={
                    childDocType === 'birth_cert'
                      ? '医学出生证明'
                      : childDocType === 'custody'
                      ? '司法监护判决'
                      : '收养民政公文'
                  }
                  categoryColor={
                    childDocType === 'birth_cert'
                      ? 'teal'
                      : childDocType === 'custody'
                      ? 'amber'
                      : 'purple'
                  }
                  issuer={
                    childDocType === 'birth_cert'
                      ? '伊拉克卫生部 · 巴格达省母婴妇产中心'
                      : childDocType === 'custody'
                      ? '最高司法委员会 · 卡尔赫民事法庭'
                      : '劳动与社会事务部 · 儿童福利保护司'
                  }
                  defaultFileName={
                    childDocType === 'birth_cert'
                      ? '巴格达卫生局_出生医学证明_BC-BAG-2024-8891.pdf'
                      : childDocType === 'custody'
                      ? '最高司法委员会_卡尔赫法庭法定监护判决书_CUS-2026-4019.pdf'
                      : '社会事务部_合法收养孤儿民政审批公函_ADP-2026-0812.pdf'
                  }
                  defaultRefNo={childDocNo}
                  ocrSummary={
                    childDocType === 'birth_cert'
                      ? '出生联网登记条形码匹配属实，医院防伪数字水印及妇产科医师签章有效'
                      : childDocType === 'custody'
                      ? '法庭案卷判决生效，明确法定监护权归属，审判长电子签名验真通过'
                      : '社会福利署批准文件存根核验一致，孤儿合法收养公证书具备完全法律效力'
                  }
                  sampleApplicantName={addName}
                  onStatusChange={(up) => setDocFileUploaded(up)}
                />
              </div>
            </div>

            {/* 4 Automatic Checks Inspection Box */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-slate-200">{t.autoCheckSectionTitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.checkRule1Title}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.checkRule2Title}</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    testMismatchCode ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {testMismatchCode ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {t.checkRule3Title} {testMismatchCode ? '(编号不符 -> 电子审核)' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.checkRule4Title}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
              >
                {t.cancelBtn}
              </button>
              {/* Confirmation button with NO ICON */}
              <button
                type="button"
                onClick={handleConfirmAddMember}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
              >
                {t.confirmAddMemberSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPDATE MEMBER INFO (Requirement 4)                                 */}
      {/* ========================================================================= */}
      {showUpdateModal && editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 text-white shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold">{t.updateMemberModalTitle}</h3>
                <p className="text-xs text-slate-400 mt-0.5">当前更新成员：{editingMember.name}</p>
              </div>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                {t.close}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.editPhoneLabel}</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.editNationalIdLabel}</label>
                <input
                  type="text"
                  value={editNid}
                  onChange={e => setEditNid(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t.editResidenceLabel}</label>
                <textarea
                  rows={2}
                  value={editResidence}
                  onChange={e => setEditResidence(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Supporting document for information update */}
              <div className="pt-1">
                <MockDocumentUploader
                  documentKey="residence_update_proof"
                  title="居住地址与实名认证证明文件"
                  subtitle="上传新住址网格居住证明、不动产权属公证书或房屋租赁协议"
                  categoryBadge="常住网格证明与租约"
                  categoryColor="teal"
                  issuer="市政房屋不动产管理局 & 社区网格处"
                  defaultFileName="市政房屋管理局_常住地址变更核准公函与网格证明_RES-2026-1182.pdf"
                  defaultRefNo="RES-BAG-2026-1182"
                  ocrSummary="新门牌地址通过国家测绘网格库比对，实地核查公章清晰，信息准予入库更新"
                  sampleApplicantName={editingMember.name}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
              >
                {t.cancelBtn}
              </button>
              {/* Confirmation button with NO ICON */}
              <button
                type="button"
                onClick={handleConfirmUpdateMember}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow transition-colors"
              >
                {t.confirmUpdateMemberSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remote Verification Modal (Requirement 5 from previous turn) */}
      {currentFamily && (
        <RemoteVerificationModal
          isOpen={!!remoteVerifyTargetId}
          onClose={() => setRemoteVerifyTargetId(null)}
          family={currentFamily}
          currentLang={lang}
          initialMemberId={remoteVerifyTargetId || undefined}
          onVerifySuccess={handleRemoteVerifySuccess}
        />
      )}
    </div>
  );
};
