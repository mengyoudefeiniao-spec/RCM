import React, { useState } from 'react';
import {
  UserPlus2,
  UserMinus2,
  Users2,
  Split,
  Crown,
  Lock,
  Unlock,
  Truck,
  Cpu,
  FileCheck2,
  AlertOctagon,
  CheckCircle,
  XCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { FamilyRecord, RationApplication, AgentRecord } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  familyData: FamilyRecord[];
  agentData: AgentRecord[];
  applications: RationApplication[];
  onAddApplication: (app: RationApplication) => void;
  onUpdateApplication: (app: RationApplication) => void;
  onUpdateFamily: (family: FamilyRecord) => void;
}

export const RationingSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  familyData,
  agentData,
  applications,
  onAddApplication,
  onUpdateApplication,
  onUpdateFamily
}) => {
  // Navigation tabs for the 11 features:
  // 8: add_member, 9: remove_deceased, 10: transfer_member, 11: split_household,
  // 12: change_head, 13: freeze_mgmt, 14: unfreeze_mgmt, 15: transfer_agent,
  // 16: rule_engine, 17: e_review, 18: appeals
  const [activeTab, setActiveTab] = useState<string>(
    activeFeatureId === 8 ? 'add_member' :
    activeFeatureId === 9 ? 'remove_deceased' :
    activeFeatureId === 10 ? 'transfer_member' :
    activeFeatureId === 11 ? 'split_household' :
    activeFeatureId === 12 ? 'change_head' :
    activeFeatureId === 13 ? 'freeze_mgmt' :
    activeFeatureId === 14 ? 'unfreeze_mgmt' :
    activeFeatureId === 15 ? 'transfer_agent' :
    activeFeatureId === 16 ? 'rule_engine' :
    activeFeatureId === 17 ? 'e_review' :
    activeFeatureId === 18 ? 'appeals' : 'add_member'
  );

  const currentFamily = familyData[0]; // Active family context

  // Feature 8 State
  const [newMemberCategory, setNewMemberCategory] = useState<'newborn' | 'unregistered'>('newborn');
  const [newMemberName, setNewMemberName] = useState('扎伊德·艾哈迈德');
  const [newMemberBirthCert, setNewMemberBirthCert] = useState('BC-2026-BAG-0918');
  const [addMemberMsg, setAddMemberMsg] = useState<string | null>(null);

  // Feature 9 State
  const [selectedDeceasedMemberId, setSelectedDeceasedMemberId] = useState(currentFamily.members[currentFamily.members.length - 1]?.id || '');
  const [deathCertNo, setDeathCertNo] = useState('DTH-2026-99120');
  const [removeDeceasedMsg, setRemoveDeceasedMsg] = useState<string | null>(null);

  // Feature 10 State
  const [transferMemberId, setTransferMemberId] = useState(currentFamily.members[1]?.id || '');
  const [transferTargetCard, setTransferTargetCard] = useState('RC-10029383');
  const [transferReason, setTransferReason] = useState<'结婚迁移' | '抚养监护变更' | '法定同住'>('结婚迁移');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // Feature 11 State
  const [spouse1Age, setSpouse1Age] = useState(18);
  const [spouse2Age, setSpouse2Age] = useState(17);
  const [splitNotes, setSplitNotes] = useState('巴格达第一初级宗教法庭合法结婚证明登记，双方已达到法定14周岁要求');
  const [splitResult, setSplitResult] = useState<string | null>(null);

  // Feature 12 State
  const [selectedNewHeadId, setSelectedNewHeadId] = useState(currentFamily.members[1]?.id || '');
  const [changeHeadMsg, setChangeHeadMsg] = useState<string | null>(null);

  // Feature 13 State (Freeze)
  const [freezeType, setFreezeType] = useState<'商业注册' | '长期境外旅行' | '高收入超标' | '死亡整户注销'>('商业注册');
  const [freezeFamilyCard, setFreezeFamilyCard] = useState(currentFamily.rationCardNo);
  const [freezeSuccessMsg, setFreezeSuccessMsg] = useState<string | null>(null);

  // Feature 14 State (Unfreeze)
  const [unfreezeProofType, setUnfreezeProofType] = useState<'商业注销官方公函' | '月薪重核证明' | '入境归国护照戳记'>('商业注销官方公函');
  const [unfreezeResultMsg, setUnfreezeResultMsg] = useState<string | null>(null);

  // Feature 15 State (Agent Transfer)
  const [targetAgentId, setTargetAgentId] = useState('AGT-003');
  const [agentTransferType, setAgentTransferType] = useState<'省内同城转移' | '跨省转移'>('省内同城转移');
  const [agentTransferResult, setAgentTransferResult] = useState<string | null>(null);

  // Feature 17 State (Electronic Review)
  const [selectedAppId, setSelectedAppId] = useState(applications[1]?.id || applications[0]?.id || '');
  const [reviewStaffComment, setReviewStaffComment] = useState('经与民事局底册核对无误，材料完整合规，建议予以批准。');
  const [reviewManagerDecision, setReviewManagerDecision] = useState<'已批准' | '已驳回' | '需补正'>('已批准');
  const [reviewDoneMsg, setReviewDoneMsg] = useState<string | null>(null);

  // Feature 18 State (Appeals & Litigation)
  const [appealCategory, setAppealCategory] = useState<'配给物资克扣短少' | '冻结认定不服' | '代理服务违规投诉' | '行政诉讼受理'>('配给物资克扣短少');
  const [appealText, setAppealText] = useState('反映本月配给面粉袋装短少3公斤，且代理商拒绝登记调换...');
  const [appealSubmitted, setAppealSubmitted] = useState(false);

  // Submit Feature 8: Add Member
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAuto = newMemberCategory === 'newborn';
    const newApp: RationApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: '添加新成员',
      familyCardNo: currentFamily.rationCardNo,
      applicantName: currentFamily.headName,
      phone: currentFamily.phone,
      submitDate: new Date().toISOString().slice(0, 10),
      status: isAuto ? '已批准' : '待分部初审',
      autoApprovalPath: isAuto,
      notes: isAuto ? `新生儿 (${newMemberName}) 出生医学证明直连核准` : `未登记家庭成员 (${newMemberName}) 补录，进入电子审核`,
      attachments: ['birth_cert_system.pdf']
    };
    onAddApplication(newApp);
    setAddMemberMsg(
      isAuto
        ? `✓ 经规则引擎判定为「新生儿凭出生证」，自动比对医院卫生部数据一致，已直批生效！`
        : `✓ 已提交申请，由于属于「非新生儿补登」，系统已自动分流进入「电子审核流程」。`
    );
  };

  // Submit Feature 9: Remove Deceased
  const handleRemoveDeceasedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: RationApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: '删除已故人员',
      familyCardNo: currentFamily.rationCardNo,
      applicantName: currentFamily.headName,
      phone: currentFamily.phone,
      submitDate: new Date().toISOString().slice(0, 10),
      status: '已批准',
      autoApprovalPath: true,
      notes: `申报家庭已故成员核销注销 (死亡证明号: ${deathCertNo})`,
      attachments: ['death_certificate_verified.pdf']
    };
    onAddApplication(newApp);
    setRemoveDeceasedMsg(`✓ 已核实死亡证明编号，已从配给名单自动剔除并冻结对应配给额度，有效防止冒领！`);
  };

  // Submit Feature 11: Household Split
  const handleSplitHouseholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (spouse1Age < 14 || spouse2Age < 14) {
      setSplitResult(`❌ 校验失败：法律强制要求夫妻双方均须年满14周岁 (当前: 男方${spouse1Age}岁, 女方${spouse2Age}岁)，无法设立独立配给卡。`);
      return;
    }
    const newApp: RationApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: '家庭分户',
      familyCardNo: currentFamily.rationCardNo,
      applicantName: '新成婚当事人',
      phone: currentFamily.phone,
      submitDate: new Date().toISOString().slice(0, 10),
      status: '待经理终审',
      autoApprovalPath: false,
      notes: `夫妻年龄符合要求 (${spouse1Age}岁 & ${spouse2Age}岁 >= 14岁)，已转规划跟进司经理签发新卡`,
      attachments: ['marriage_contract.pdf']
    };
    onAddApplication(newApp);
    setSplitResult(`✓ 法定年龄核查通过 (男方${spouse1Age}岁，女方${spouse2Age}岁 >= 14周岁)。申请已送达分部经理终审签批，核准后将自动生成并签发全新配给卡号！`);
  };

  // Submit Feature 13: Freeze Management
  const handleFreezeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentFamily,
      status: '已冻结' as const,
      freezeReason: `按【${freezeType}】条例暂扣食品配给发放资格`
    };
    onUpdateFamily(updated);
    setFreezeSuccessMsg(`✓ 配给卡 ${currentFamily.rationCardNo} 已执行冻结操作！原因：${freezeType}。代销网点将立即暂停该卡发粮。`);
  };

  // Submit Feature 15: Agent Transfer
  const handleAgentTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAgent = agentData.find(a => a.id === targetAgentId);
    if (!targetAgent) return;

    if (targetAgent.householdsCount >= targetAgent.maxCap) {
      setAgentTransferResult(`❌ 转移阻止：目标代理商【${targetAgent.name}】已达到 ${targetAgent.maxCap} 户服务上限 (当前已满额 ${targetAgent.householdsCount} 户)！系统自动阻止转入，请选择其他网点。`);
      return;
    }

    if (agentTransferType === '省内同城转移') {
      const updatedFamily = {
        ...currentFamily,
        agentId: targetAgent.id,
        agentName: targetAgent.name
      };
      onUpdateFamily(updatedFamily);
      setAgentTransferResult(`✓ 省内同城转移直办成功！目标网点容量充足 (${targetAgent.householdsCount}/${targetAgent.maxCap})，新分配网点：【${targetAgent.name}】。`);
    } else {
      setAgentTransferResult(`✓ 跨省转移申请已登记！按规定转入「电子审核」路径，待接收省规划分部确认调配指标。`);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 11 Feature Navigation Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('add_member')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'add_member' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserPlus2 className="w-3.5 h-3.5" /> 8. 添加新成员
          </button>
          <button
            onClick={() => setActiveTab('remove_deceased')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'remove_deceased' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserMinus2 className="w-3.5 h-3.5" /> 9. 删除已故人员
          </button>
          <button
            onClick={() => setActiveTab('transfer_member')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'transfer_member' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" /> 10. 成员转移
          </button>
          <button
            onClick={() => setActiveTab('split_household')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'split_household' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Split className="w-3.5 h-3.5" /> 11. 家庭分户(14岁)
          </button>
          <button
            onClick={() => setActiveTab('change_head')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'change_head' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Crown className="w-3.5 h-3.5" /> 12. 户主变更
          </button>
          <button
            onClick={() => setActiveTab('freeze_mgmt')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'freeze_mgmt' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> 13. 冻结管理
          </button>
          <button
            onClick={() => setActiveTab('unfreeze_mgmt')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'unfreeze_mgmt' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" /> 14. 解冻管理
          </button>
          <button
            onClick={() => setActiveTab('transfer_agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'transfer_agent' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> 15. 代理转移
          </button>
          <button
            onClick={() => setActiveTab('rule_engine')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'rule_engine' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> 16. 自动核验规则
          </button>
          <button
            onClick={() => setActiveTab('e_review')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'e_review' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" /> 17. 电子审核(两级)
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'appeals' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" /> 18. 投诉与诉讼
          </button>
        </div>
      </div>

      {/* Feature 8: Add Member */}
      {activeTab === 'add_member' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 08：添加新成员 (新生儿自动批准 / 未登记成员电子审核)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：添加新生儿通过出生医学证明与卫生部联网比对，走【自动直批路径】；补登此前漏记成年成员走【人工电子审核路径】。
            </p>
          </div>

          <form onSubmit={handleAddMemberSubmit} className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">新成员类型划分</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                  newMemberCategory === 'newborn'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="cat"
                    checked={newMemberCategory === 'newborn'}
                    onChange={() => setNewMemberCategory('newborn')}
                  />
                  <span>新生儿登记 (自动批准路径)</span>
                </label>
                <label className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${
                  newMemberCategory === 'unregistered'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="cat"
                    checked={newMemberCategory === 'unregistered'}
                    onChange={() => setNewMemberCategory('unregistered')}
                  />
                  <span>历史未登记成员 (电子审核路径)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">成员全名</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">医院出生证明号 / 身份编号</label>
                <input
                  type="text"
                  value={newMemberBirthCert}
                  onChange={e => setNewMemberBirthCert(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              提交添加成员申报
            </button>

            {addMemberMsg && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                {addMemberMsg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 9: Remove Deceased */}
      {activeTab === 'remove_deceased' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 09：删除已故人员 (配给卡防冒领数据注销)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：已故人员在配给卡中及时注销除名，系统将扣减对应口粮配额并同步注销，确保存量数据高度准确。
            </p>
          </div>

          <form onSubmit={handleRemoveDeceasedSubmit} className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">选择家庭中申报已故成员</label>
              <select
                value={selectedDeceasedMemberId}
                onChange={e => setSelectedDeceasedMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {currentFamily.members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation} · {m.nationalId})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">民事医院正式死亡证明编号 (Death Certificate No)</label>
              <input
                type="text"
                value={deathCertNo}
                onChange={e => setDeathCertNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
            >
              提交已故核销并调整家庭配额
            </button>

            {removeDeceasedMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                {removeDeceasedMsg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 10: Transfer Member */}
      {activeTab === 'transfer_member' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 10：妻子或成员配给关系转移
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              因结婚迁入丈夫配给卡、居住地变更迁入亲属卡或法定监护抚养调整，系统按成员身份自动识别分流。
            </p>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              setTransferSuccessMsg(`✓ 转移申请已建档并生成流转工单：成员将由当前卡划转至目标配给卡【${transferTargetCard}】。`);
            }}
            className="max-w-2xl space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">迁出成员姓名</label>
                <select
                  value={transferMemberId}
                  onChange={e => setTransferMemberId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {currentFamily.members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">转移原因与类型</label>
                <select
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="结婚迁移">结婚迁移 (迁入配偶配给卡)</option>
                  <option value="抚养监护变更">未成年人抚养监护变更</option>
                  <option value="法定同住">老人/亲属法定同住归并</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">目标接收配给卡编号 (Target Ration Card No)</label>
              <input
                type="text"
                value={transferTargetCard}
                onChange={e => setTransferTargetCard(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              提交转移审核申请
            </button>

            {transferSuccessMsg && (
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-300">
                {transferSuccessMsg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 11: Household Split with 14-year-old law */}
      {activeTab === 'split_household' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 11：家庭分户与法定年龄管控 (夫妻双方均须年满14周岁)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：结婚或家庭分立后为新家庭单独设立新配给卡，依据民事法规定【夫妻双方均须年满14周岁】；如任一方未满14周岁系统将强制拦截拒绝分户。
            </p>
          </div>

          <form onSubmit={handleSplitHouseholdSubmit} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">男方当事人年龄 (岁)</label>
                <input
                  type="number"
                  min={10}
                  max={99}
                  value={spouse1Age}
                  onChange={e => setSpouse1Age(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono ${
                    spouse1Age < 14 ? 'border-rose-500 text-rose-600' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                />
                {spouse1Age < 14 && <span className="text-[11px] text-rose-500">未满法定14周岁！</span>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">女方当事人年龄 (岁)</label>
                <input
                  type="number"
                  min={10}
                  max={99}
                  value={spouse2Age}
                  onChange={e => setSpouse2Age(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono ${
                    spouse2Age < 14 ? 'border-rose-500 text-rose-600' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                />
                {spouse2Age < 14 && <span className="text-[11px] text-rose-500">未满法定14周岁！</span>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">结婚证书与分立住所说明</label>
              <textarea
                rows={2}
                value={splitNotes}
                onChange={e => setSplitNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              验证14周岁法定年龄并申请分立新卡
            </button>

            {splitResult && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                splitResult.includes('❌')
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {splitResult}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 12: Change Head */}
      {activeTab === 'change_head' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 12：户主变更 (符合条件时系统按家庭编号自动识别新户主入选)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              原户主因年迈、迁出或去世时，系统自动识别同户直系亲属并推荐新户主候选，审核后完成户主更替。
            </p>
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">当前在册户主</label>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200">
                {currentFamily.headName} (卡号: {currentFamily.rationCardNo})
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">系统按家庭编号自动推荐之顺位新户主候选</label>
              <select
                value={selectedNewHeadId}
                onChange={e => setSelectedNewHeadId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {currentFamily.members.filter(m => m.relation !== '户主').map(m => (
                  <option key={m.id} value={m.id}>
                    【优先推荐】{m.name} ({m.relation} · 出生: {m.birthDate})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                const newHead = currentFamily.members.find(m => m.id === selectedNewHeadId);
                if (!newHead) return;
                const updated = {
                  ...currentFamily,
                  headName: newHead.name,
                  members: currentFamily.members.map(m =>
                    m.id === selectedNewHeadId ? { ...m, relation: '户主' as const } : m
                  )
                };
                onUpdateFamily(updated);
                setChangeHeadMsg(`✓ 户主变更已核准！新户主【${newHead.name}】已正位并更新至国家配给数据库。`);
              }}
              className="px-5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              确认变更并签批新户主
            </button>

            {changeHeadMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                {changeHeadMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 13: Freeze Management */}
      {activeTab === 'freeze_mgmt' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 13：配给资格冻结管理
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按【商业公司注册】、【长期境外旅行】、【高收入超标】、【死亡整户注销】等四类法定情形依法冻结食品配给。
            </p>
          </div>

          <form onSubmit={handleFreezeSubmit} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">冻结配给卡号</label>
                <input
                  type="text"
                  value={freezeFamilyCard}
                  onChange={e => setFreezeFamilyCard(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">冻结情形法定依据</label>
                <select
                  value={freezeType}
                  onChange={e => setFreezeType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="商业注册">商业注册 (设立企业法人/持股公司)</option>
                  <option value="长期境外旅行">长期境外旅行 (出境满6个月未归)</option>
                  <option value="高收入超标">高收入超标 (月薪超150万第纳尔)</option>
                  <option value="死亡整户注销">死亡整户注销 (无在籍直系受益人)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>执行配给资格冻结指令</span>
            </button>

            {freezeSuccessMsg && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300">
                {freezeSuccessMsg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 14: Unfreeze Management */}
      {activeTab === 'unfreeze_mgmt' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 14：解冻管理 (系统直批 vs 电子审核)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：商业注销证明通过官方接口核验属实可【系统直批】恢复配给；薪资复核与海外入境等类型需分部经理【电子审核】。
            </p>
          </div>

          <div className="max-w-2xl space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">解冻证明附件类别</label>
              <select
                value={unfreezeProofType}
                onChange={e => setUnfreezeProofType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="商业注销官方公函">商业注销官方公函 (支持工商联网自动秒级直批)</option>
                <option value="月薪重核证明">劳动部月薪重核证明 (走分部电子审核流程)</option>
                <option value="入境归国护照戳记">边检入境归国护照戳记 (走分部电子审核流程)</option>
              </select>
            </div>

            <button
              onClick={() => {
                const isAuto = unfreezeProofType === '商业注销官方公函';
                if (isAuto) {
                  const updated = {
                    ...currentFamily,
                    status: '正常' as const,
                    freezeReason: undefined
                  };
                  onUpdateFamily(updated);
                  setUnfreezeResultMsg(`✓ 【系统直批通过】：工商注册注销证明与国家企业数据库比对一致，已解除冻结，食品配给资格立即恢复！`);
                } else {
                  setUnfreezeResultMsg(`✓ 【已转入电子审核】：证明材料已呈递至配给分部初审员工与经理终审队列。`);
                }
              }}
              className="px-5 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>提交解冻核验申请</span>
            </button>

            {unfreezeResultMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
                {unfreezeResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 15: Agent Transfer Management with 1500 household limit */}
      {activeTab === 'transfer_agent' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 15：代理转移管理 (1500户上限管控 / 省内直转 vs 跨省审核)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              业务规则：严密核查目标代理点户数是否达到1500户法规划线，超限强制阻止转入；未超限且属于省内转移自动办理，跨省转移转电子审核。
            </p>
          </div>

          <form onSubmit={handleAgentTransferSubmit} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">转移范围划分</label>
                <select
                  value={agentTransferType}
                  onChange={e => setAgentTransferType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="省内同城转移">省内同城转移 (容量未满自动办理)</option>
                  <option value="跨省转移">跨省转移 (需转两省电子审核)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">选择目标代销网点</label>
                <select
                  value={targetAgentId}
                  onChange={e => setTargetAgentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {agentData.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.householdsCount} / {a.maxCap} 户) {a.householdsCount >= a.maxCap ? '【已满额】' : '【可接纳】'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              校验代理户数上限并提交转移
            </button>

            {agentTransferResult && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                agentTransferResult.includes('❌')
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {agentTransferResult}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 16: Automatic Verification Rule Engine */}
      {activeTab === 'rule_engine' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 16：自动核验规则引擎 (Rule Engine Matrix)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按业务类型与风险评级自动校验申请条件，智能化路由流向「系统自动接受直批」或「两级人工电子审核」。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">业务类型</th>
                  <th className="px-4 py-3 font-medium">前置硬性条件</th>
                  <th className="px-4 py-3 font-medium">路由路径</th>
                  <th className="px-4 py-3 font-medium">规则代码</th>
                  <th className="px-4 py-3 font-medium">执行引擎状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">添加新生儿</td>
                  <td className="px-4 py-3">卫生部医院出生证明编号存在且未被绑定</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">自动直批 (Auto-Approve)</td>
                  <td className="px-4 py-3 font-mono">RULE-NEWBORN-DIRECT</td>
                  <td className="px-4 py-3 text-emerald-500">运行中</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">家庭分户设立新卡</td>
                  <td className="px-4 py-3">夫妻双方年满14周岁 + 法院结婚证扫描</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">电子审核 (分部经理终审)</td>
                  <td className="px-4 py-3 font-mono">RULE-SPLIT-AGE14-CHECK</td>
                  <td className="px-4 py-3 text-emerald-500">运行中</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">代理转移 (省内)</td>
                  <td className="px-4 py-3">目标代销网点户数 &lt; 1500户</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">自动直批 (Auto-Approve)</td>
                  <td className="px-4 py-3 font-mono">RULE-AGENT-CAP-1500</td>
                  <td className="px-4 py-3 text-emerald-500">运行中</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">商业注销解冻</td>
                  <td className="px-4 py-3">商会企业注册状态已变更为已注销</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">自动直批 (Auto-Approve)</td>
                  <td className="px-4 py-3 font-mono">RULE-CORP-DISSOLVED</td>
                  <td className="px-4 py-3 text-emerald-500">运行中</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">高收入申诉解冻</td>
                  <td className="px-4 py-3">劳动部薪资单重核证明附件</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">电子审核 (初审员工+经理终审)</td>
                  <td className="px-4 py-3 font-mono">RULE-INCOME-DISPUTE</td>
                  <td className="px-4 py-3 text-emerald-500">运行中</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature 17: Electronic Review Workflow */}
      {activeTab === 'e_review' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 17：两级电子审核 (分部员工初审意见签署 ➔ 分部经理终审签批)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              分部初审员工核验数据和材料出具意见，分部经理依据规章作出批准或驳回最终决定。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">待审核申请列表：</span>
              <div className="space-y-2">
                {applications.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                      selectedAppId === app.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{app.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        app.status === '已批准' ? 'bg-emerald-500/10 text-emerald-500' :
                        app.status === '已驳回' ? 'bg-rose-500/10 text-rose-500' :
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-slate-500">申请人: {app.applicantName} · 卡号: {app.familyCardNo}</div>
                    <div className="text-slate-400 mt-1 truncate">{app.notes}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">审核裁定工作台：</span>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">分部初审员工意见 (萨米拉·卡西姆)：</label>
                <textarea
                  rows={2}
                  value={reviewStaffComment}
                  onChange={e => setReviewStaffComment(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500">分部经理终审签批决定：</label>
                <select
                  value={reviewManagerDecision}
                  onChange={e => setReviewManagerDecision(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md"
                >
                  <option value="已批准">批准通过 (核发/执行变动)</option>
                  <option value="已驳回">驳回申请 (终止办理)</option>
                  <option value="需补正">退回补正 (要求补充法院证明)</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const target = applications.find(a => a.id === selectedAppId);
                  if (!target) return;
                  const updated: RationApplication = {
                    ...target,
                    status: reviewManagerDecision,
                    reviewNotes: reviewStaffComment
                  };
                  onUpdateApplication(updated);
                  setReviewDoneMsg(`✓ 终审决定已完成！工单 ${target.id} 已变更为【${reviewManagerDecision}】，系统已向公民下发通知。`);
                }}
                className="w-full py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                签署终审意见并归档
              </button>

              {reviewDoneMsg && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  {reviewDoneMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature 18: Appeals & Litigation */}
      {activeTab === 'appeals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 18：投诉与行政诉讼支持受理
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              由电子配给卡数字化项目支持人员专席受理、行政调处与司法诉讼立案登记全流程留痕。
            </p>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              setAppealSubmitted(true);
            }}
            className="max-w-2xl space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">诉求争议类型</label>
              <select
                value={appealCategory}
                onChange={e => setAppealCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="配给物资克扣短少">配给物资克扣短少 / 质量异议投诉</option>
                <option value="冻结认定不服">冻结资格行政复议申请</option>
                <option value="代理服务违规投诉">代销网点加价或拒收电子卡投诉</option>
                <option value="行政诉讼受理">贸易部食品配给署行政诉讼受理立案</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">诉求事由与陈述</label>
              <textarea
                rows={3}
                value={appealText}
                onChange={e => setAppealText(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
            >
              提交诉讼与投诉专席登记
            </button>

            {appealSubmitted && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <div className="font-semibold">✓ 诉求工单已建立：CASE-LIT-2026-00449</div>
                <div>项目支持团队已立案，承诺于3个工作日内与相关代销网点及规划分部核查并出具行政答复书。</div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
