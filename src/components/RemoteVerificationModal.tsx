import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { FamilyRecord, FamilyMember } from '../types';
import { Language, useI18n } from '../i18n/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  family: FamilyRecord;
  onVerifySuccess: (memberId: string, location: string) => void;
  currentLang: Language;
  initialMemberId?: string;
}

export const RemoteVerificationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  family,
  onVerifySuccess,
  currentLang,
  initialMemberId
}) => {
  const { t } = useI18n();

  // Selected member to verify remotely
  const [selectedMemberId, setSelectedMemberId] = useState<string>(() => {
    if (initialMemberId) return initialMemberId;
    const unverified = family.members.find(m => !m.faceVerified);
    return unverified ? unverified.id : (family.members[1]?.id || family.members[0]?.id || '');
  });

  // Generated Link & OTP State
  const [inviteCode, setInviteCode] = useState('839201');
  const [inviteLink, setInviteLink] = useState(
    `https://m.rationcard.gov.iq/remote-verify?session=REM-${Date.now().toString().slice(-6)}&card=${family.rationCardNo}`
  );
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Simulated Remote Member Portal Input State
  const [inputCode, setInputCode] = useState('839201');
  const [inputName, setInputName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'same' | 'basra' | 'erbil' | 'mosul'>('erbil');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'rejected_name' | 'rejected_location';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedMember = family.members.find(m => m.id === selectedMemberId) || family.members[0];

  // Generate new code and link
  const handleGenerateNewLink = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setInviteCode(code);
    setInputCode(code);
    setInviteLink(
      `https://m.rationcard.gov.iq/remote-verify?session=REM-${Date.now().toString().slice(-6)}&card=${family.rationCardNo}&m=${selectedMemberId}`
    );
    setVerificationResult(null);
  };

  // Copy share info
  const handleCopyInvite = () => {
    const shareText = `【伊拉克国家数字配给卡·远程核验】\n户主：${family.headName}，配给卡：${family.rationCardNo}\n请家庭成员下载APP或点击专属链接进行远程生物核验：\n链接：${inviteLink}\n6位验证码：${inviteCode}（24小时内有效）`;
    navigator.clipboard?.writeText(shareText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  // Quick fill matching data for demo
  const handleQuickFillValid = () => {
    if (selectedMember) {
      setInputName(selectedMember.name);
      setInputCode(inviteCode);
      setSelectedLocation('erbil'); // Remote location
      setVerificationResult(null);
    }
  };

  // Quick fill wrong name to test rejection
  const handleTestWrongName = () => {
    setInputName('萨利姆·穆罕默德·贾西姆'); // Not matching
    setInputCode(inviteCode);
    setSelectedLocation('erbil');
    setVerificationResult(null);
  };

  // Quick fill same location to test rejection
  const handleTestSameLocation = () => {
    if (selectedMember) {
      setInputName(selectedMember.name);
      setInputCode(inviteCode);
      setSelectedLocation('same'); // Same as household
      setVerificationResult(null);
    }
  };

  // Submit Remote Verification with STRICT Rejection Logic
  const handleSubmitRemoteVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult(null);

    if (!inputCode.trim() || inputCode.trim() !== inviteCode) {
      setVerificationResult({
        status: 'rejected_name',
        message: currentLang === 'zh' ? '【验证失败】请输入正确的6位动态验证码！' : '【فشل التحقق】يرجى إدخال رمز التحقق الصحيح المكون من 6 أرقام!'
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Rejection Rule 1: Name Mismatch
      const trimmedInputName = inputName.trim().replace(/\s+/g, '');
      const expectedMemberName = selectedMember.name.trim().replace(/\s+/g, '');

      if (trimmedInputName !== expectedMemberName) {
        setVerificationResult({
          status: 'rejected_name',
          message: t.rejectNameMismatchMsg
        });
        return;
      }

      // Rejection Rule 2: Same Location as Household
      if (selectedLocation === 'same') {
        setVerificationResult({
          status: 'rejected_location',
          message: t.rejectSameLocationMsg
        });
        return;
      }

      // Success: Remote Location and Name Matches!
      const locationLabels: Record<string, string> = {
        basra: '巴士拉港口区 (异地 540km)',
        erbil: '埃尔比勒科技城 (异地 360km)',
        mosul: '摩苏尔大学城 (异地 405km)'
      };
      const locText = locationLabels[selectedLocation] || '异地合规位置';

      setVerificationResult({
        status: 'success',
        message: t.remoteVerifySuccessMsg
      });

      // Update family member verified status
      onVerifySuccess(selectedMember.id, locText);
    }, 700);
  };

  return (
    <div
      dir="ltr"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 text-white shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title & Subtitle */}
        <div className="border-b border-slate-800 pb-4 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t.remoteVerifyTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.remoteVerifySubtitle}
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div>
              家庭户主：<span className="text-white font-bold">{family.headName}</span> · 配给卡号：<span className="font-mono text-emerald-400 font-bold">{family.rationCardNo}</span>
            </div>
            <div>
              家庭常住地：<span className="text-slate-300">{family.province} · {family.district}</span>
            </div>
          </div>
        </div>

        {/* Main Content: Two Columns (Left: Head of Household Invites; Right: Remote Member Mobile Simulation) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Head of Household Creates Link & OTP */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> 户主发起：创建远程验证链接
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                户主选择不在验证现场的成员，生成一次性防篡改安全链接
              </p>
            </div>

            {/* Select Absent Member */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {t.selectMemberLabel}
              </label>
              <select
                value={selectedMemberId}
                onChange={e => {
                  setSelectedMemberId(e.target.value);
                  setVerificationResult(null);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {family.members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relation}) · {m.faceVerified ? '已现场/远程核验' : '待异地核验'}
                  </option>
                ))}
              </select>
            </div>

            {/* Member Details Preview */}
            {selectedMember && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">成员姓名：</span>
                  <span className="text-white font-bold">{selectedMember.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">统一身份证号：</span>
                  <span className="font-mono text-slate-300">{selectedMember.nationalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">核验状态：</span>
                  <span className={selectedMember.faceVerified ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {selectedMember.faceVerified ? '已通过生物核验' : '未核验 (不在现场)'}
                  </span>
                </div>
              </div>
            )}

            {/* Generated Link & 6-digit Code */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">
                  {t.remoteShareCodeLabel}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNewLink}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  重新生成
                </button>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-lg font-bold text-center tracking-widest text-emerald-400">
                {inviteCode}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium">
                {t.remoteShareLinkLabel}
              </label>
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-[11px] text-slate-400 break-all">
                {inviteLink}
              </div>
            </div>

            {/* Copy & Share button */}
            <button
              type="button"
              onClick={handleCopyInvite}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>{t.copyInviteInfo}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Remote Member Mobile Simulation Portal */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> {t.remoteSimulatorTitle}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t.remotePortalDesc}
                </p>
              </div>
            </div>

            {/* Quick Testing Actions to Verify the 2 Rejection Rules */}
            <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-400 py-0.5">快捷规则测试：</span>
              <button
                type="button"
                onClick={handleQuickFillValid}
                className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded cursor-pointer"
              >
                ① 正常异地且姓名相符 (通过)
              </button>
              <button
                type="button"
                onClick={handleTestWrongName}
                className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded cursor-pointer"
              >
                ② 测试姓名不符 (拒绝)
              </button>
              <button
                type="button"
                onClick={handleTestSameLocation}
                className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded cursor-pointer"
              >
                ③ 测试与家庭同一位置 (拒绝)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRemoteVerify} className="space-y-3.5 text-xs">
              {/* Verification Code */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {t.inputInviteCodeLabel}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value)}
                  placeholder="例如: 839201"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Member Full Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">
                  {t.inputMemberNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={e => setInputName(e.target.value)}
                  placeholder="请输入您的完整公民姓名"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Geographic Location Check */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.verifyLocationCheckLabel}</span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    GPS与基站实时核查
                  </span>
                </div>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="same">{t.locSameHousehold}</option>
                  <option value="erbil">{t.locErbilRemote}</option>
                  <option value="basra">{t.locBasraRemote}</option>
                  <option value="mosul">{t.locMosulRemote}</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {t.remoteLocationDesc}
                </p>
              </div>

              {/* Verification Result Notice (Success or Rejected) */}
              {verificationResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    verificationResult.status === 'success'
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/60 border-rose-800 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {verificationResult.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{verificationResult.message}</span>
                  </div>
                </div>
              )}

              {/* Confirmation Button: Strictly NO ICON (per user requirement) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer"
              >
                {isSubmitting ? '正在核验位置与生物特征...' : t.confirmSubmitRemoteVerify}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
