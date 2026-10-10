import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Globe,
  X,
  CheckCircle2,
  Copy,
  Check,
  Cpu
} from 'lucide-react';
import { RationCardLogo } from './RationCardLogo';
import { BiometricLoginModal } from './BiometricLoginModal';
import { UserProfile, FamilyRecord } from '../types';
import { INITIAL_FAMILIES, INITIAL_AGENTS } from '../data/mockData';
import { Language, useI18n } from '../i18n/translations';

interface Props {
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterFamily?: (family: FamilyRecord) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LoginPage: React.FC<Props> = ({
  onLoginSuccess,
  onRegisterFamily,
  currentLang,
  onLanguageChange
}) => {
  const { t } = useI18n();

  // Login form state
  const [identifier, setIdentifier] = useState('RC-10029381');
  const [password, setPassword] = useState('iq-pass-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hardware Device & Biometric Verification State
  const [hardwareCode] = useState('HW-BAGHDAD-8291-B730');
  const [isDeviceTrusted, setIsDeviceTrusted] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);

  // Paper card upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [province, setProvince] = useState('巴格达省 (Baghdad)');
  const [rationCenter, setRationCenter] = useState('卡尔赫第一配给中心 (#04)');
  const [paperCardNo, setPaperCardNo] = useState('');
  const [foodAgentCode, setFoodAgentCode] = useState('FA-00128');
  const [flourAgentCode, setFlourAgentCode] = useState('FL-00341');
  const [headName, setHeadName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showUpgradePassword, setShowUpgradePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [smsCode, setSmsCode] = useState('');

  // SMS countdown & simulated message
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [simulatedSms, setSimulatedSms] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Upgrade success state
  const [upgradedCardData, setUpgradedCardData] = useState<{
    newCardNo: string;
    headName: string;
    phone: string;
    nationalId: string;
    password: string;
  } | null>(null);
  const [copiedCardNo, setCopiedCardNo] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (smsCountdown > 0) {
      const timer = setTimeout(() => setSmsCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [smsCountdown]);

  // Background auto-detection of identifier type
  const isPhoneNumber = (val: string): boolean => {
    const clean = val.replace(/[\s\-+]/g, '');
    return /^\d{7,15}$/.test(clean) && !val.toUpperCase().startsWith('RC') && !val.toUpperCase().startsWith('ADM');
  };

  const detectedTypeHint = identifier.trim()
    ? isPhoneNumber(identifier.trim())
      ? t.detectedPhoneType
      : t.detectedCardType
    : null;

  // Handle Login Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId) {
      setErrorMessage(t.errorIdentifierEmpty);
      return;
    }

    if (!trimmedPass) {
      setErrorMessage(t.errorPasswordEmpty);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let authenticatedProfile: UserProfile = {
        uid: `usr-${Date.now().toString().slice(-6)}`,
        displayName: '配给卡持有人',
        email: 'citizen@rationcard.gov.iq',
        role: 'citizen'
      };

      // 1. Check if matches family card or phone
      const matchedFamily = INITIAL_FAMILIES.find(
        f => f.rationCardNo.toLowerCase() === trimmedId.toLowerCase() ||
             f.phone.replace(/[\s\-]/g, '') === trimmedId.replace(/[\s\-]/g, '') ||
             f.oldPaperCardNo.toLowerCase() === trimmedId.toLowerCase()
      );
      if (matchedFamily) {
        authenticatedProfile = {
          uid: `family-${matchedFamily.rationCardNo}`,
          displayName: matchedFamily.headName,
          email: `${matchedFamily.rationCardNo.toLowerCase()}@ration.gov.iq`,
          role: 'citizen'
        };
      }

      // 2. Check if matches agent id or phone
      const matchedAgent = INITIAL_AGENTS.find(
        a => a.id.toLowerCase() === trimmedId.toLowerCase() ||
             a.phone.replace(/[\s\-]/g, '') === trimmedId.replace(/[\s\-]/g, '')
      );
      if (matchedAgent) {
        authenticatedProfile = {
          uid: `agent-${matchedAgent.id}`,
          displayName: `${matchedAgent.ownerName} (${matchedAgent.name})`,
          email: `${matchedAgent.id.toLowerCase()}@agent.gov.iq`,
          role: 'agent'
        };
      }

      // 3. Check admin / auditor
      if (trimmedId.includes('ADM') || trimmedId.toLowerCase().includes('admin') || trimmedId.includes('8019')) {
        authenticatedProfile = {
          uid: 'officer-iraq-8019',
          displayName: '塔里克·卡西姆配给督察官',
          email: 'inspector@ration.gov.iq',
          role: 'admin'
        };
      } else if (trimmedId.toLowerCase().includes('auditor') || trimmedId.includes('LAB') || trimmedId.toLowerCase().includes('zayd')) {
        authenticatedProfile = {
          uid: 'auditor-zayd-qasim',
          displayName: '扎伊德·卡西姆博士 (国家质检主任)',
          email: 'dr.zayd@lab.ration.gov.iq',
          role: 'auditor'
        };
      }

      setIsLoading(false);

      // If user is a citizen and logging in on a new/first-time device hardware code
      if (!isDeviceTrusted && authenticatedProfile.role === 'citizen') {
        setPendingProfile(authenticatedProfile);
        setShowBiometricModal(true);
        return;
      }

      onLoginSuccess(authenticatedProfile);
    }, 450);
  };

  // Quick fill sample data for testing
  const handleQuickFillDemo = () => {
    setProvince('巴格达省 (Baghdad)');
    setRationCenter('卡尔赫第一配给中心 (#04)');
    setPaperCardNo('PRC-92817462');
    setFoodAgentCode('FA-00128');
    setFlourAgentCode('FL-00341');
    setHeadName('穆斯塔法·卡西姆·哈希米');
    setNationalId('198709124819');
    setPhone('07702819384');
    setUpgradePassword('iq-pass-2026');
    setConfirmPassword('iq-pass-2026');
    setSmsCode('839201');
    setSimulatedSms('839201');
  };

  // Send simulated SMS verification code
  const handleSendSmsCode = () => {
    if (!phone.trim()) {
      setUpgradeError(currentLang === 'zh' ? '请先填写用于接收验证码的电话号码' : 'يرجى إدخال رقم الهاتف أولاً لإرسال رمز التحقق');
      return;
    }
    setUpgradeError(null);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedSms(code);
    setSmsCountdown(60);
  };

  // Submit Paper Card Upgrade & Register
  const handleConfirmUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);

    if (
      !province.trim() ||
      !rationCenter.trim() ||
      !paperCardNo.trim() ||
      !foodAgentCode.trim() ||
      !flourAgentCode.trim() ||
      !headName.trim() ||
      !nationalId.trim() ||
      !phone.trim() ||
      !upgradePassword.trim() ||
      !confirmPassword.trim() ||
      !smsCode.trim()
    ) {
      setUpgradeError(t.errorFillAllFields);
      return;
    }

    if (upgradePassword.length < 6) {
      setUpgradeError(t.errorPasswordTooShort);
      return;
    }

    if (upgradePassword !== confirmPassword) {
      setUpgradeError(t.errorPasswordsMismatch);
      return;
    }

    if (smsCode.trim().length !== 6) {
      setUpgradeError(t.errorSmsCodeInvalid);
      return;
    }

    setIsUpgrading(true);

    setTimeout(() => {
      // Generate new digital card number e.g. RC-20268892
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      const generatedCardNo = `RC-2026${randomSuffix}`;

      // Create new family record
      const newFamily: FamilyRecord = {
        rationCardNo: generatedCardNo,
        oldPaperCardNo: paperCardNo.trim(),
        province: province.trim(),
        district: rationCenter.trim(),
        headName: headName.trim(),
        phone: phone.trim(),
        memberCount: 4,
        status: '正常',
        agentId: foodAgentCode.trim(),
        agentName: '阿里·哈桑粮食便利发售处',
        address: `${province.trim()} ${rationCenter.trim()} 第14区88号`,
        createdDate: new Date().toISOString().slice(0, 10),
        lastSelfCheckDate: new Date().toISOString().slice(0, 10),
        members: [
          {
            id: `mem-${Date.now()}-1`,
            name: headName.trim(),
            nationalId: nationalId.trim(),
            relation: '户主',
            birthDate: '1987-09-12',
            gender: '男',
            status: '正常',
            faceVerified: true
          },
          {
            id: `mem-${Date.now()}-2`,
            name: '宰纳卜·阿卜杜拉',
            nationalId: '199003152839',
            relation: '配偶',
            birthDate: '1990-03-15',
            gender: '女',
            status: '正常',
            faceVerified: true
          },
          {
            id: `mem-${Date.now()}-3`,
            name: `奥马尔·${headName.trim()}`,
            nationalId: '201506129841',
            relation: '子女',
            birthDate: '2015-06-12',
            gender: '男',
            status: '正常'
          },
          {
            id: `mem-${Date.now()}-4`,
            name: `法蒂玛·${headName.trim()}`,
            nationalId: '201911048293',
            relation: '子女',
            birthDate: '2019-11-04',
            gender: '女',
            status: '正常'
          }
        ]
      };

      // Add to shared families pool
      INITIAL_FAMILIES.unshift(newFamily);
      if (onRegisterFamily) {
        onRegisterFamily(newFamily);
      }

      setIsUpgrading(false);
      setUpgradedCardData({
        newCardNo: generatedCardNo,
        headName: headName.trim(),
        phone: phone.trim(),
        nationalId: nationalId.trim(),
        password: upgradePassword
      });
    }, 550);
  };

  const handleStartUsingNow = () => {
    if (!upgradedCardData) return;
    const profile: UserProfile = {
      uid: `family-${upgradedCardData.newCardNo}`,
      displayName: upgradedCardData.headName,
      email: `${upgradedCardData.newCardNo.toLowerCase()}@ration.gov.iq`,
      role: 'citizen'
    };
    setShowUpgradeModal(false);
    onLoginSuccess(profile);
  };

  const handleReturnToLogin = () => {
    if (upgradedCardData) {
      setIdentifier(upgradedCardData.newCardNo);
      setPassword(upgradedCardData.password);
    }
    setShowUpgradeModal(false);
    setUpgradedCardData(null);
  };

  const handleCopyCardNo = () => {
    if (upgradedCardData) {
      navigator.clipboard.writeText(upgradedCardData.newCardNo);
      setCopiedCardNo(true);
      setTimeout(() => setCopiedCardNo(false), 2000);
    }
  };

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white relative"
    >
      {/* Language Switcher in top corner (No header bar) */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg text-xs">
        <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
        <button
          type="button"
          onClick={() => onLanguageChange('zh')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            currentLang === 'zh'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          中文
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('ar')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            currentLang === 'ar'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          العربية
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('ku')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            currentLang === 'ku'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          کوردی
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            currentLang === 'en'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          English
        </button>
      </div>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Official Iraqi Ration Card Logo */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-800/80">
            <div className="flex justify-center pb-1">
              <RationCardLogo size="lg" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {t.loginTitle}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {t.loginSubtitle}
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hardware Device Fingerprint & Security Status Banner */}
          <div className="mt-4 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400 truncate">{t.hardwareCodeLabel}:</span>
              <span className="font-mono text-white font-semibold truncate">{hardwareCode}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsDeviceTrusted(!isDeviceTrusted)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                  isDeviceTrusted
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}
                title={t.toggleDeviceEnv}
              >
                {isDeviceTrusted ? t.simulateTrustedDevice : t.simulateFirstLogin}
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 text-xs">
            {/* Unified Identifier Input: Ration Card or Phone */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">
                  {t.identifierLabel}
                </label>
                {detectedTypeHint && (
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {detectedTypeHint}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={t.identifierPlaceholder}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium">
                  {t.passwordLabel}
                </label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    alert(currentLang === 'zh' ? '请联系所在省份食品配给分支机构或通过注册手机号申诉重置。' : 'يرجى مراجعة فرع التموين في محافظتك أو تقديم طلب استعادة عبر الهاتف المسجل.');
                  }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  {t.forgotPassword}
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full py-2.5 pr-10 pl-4 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-2.5 right-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>{t.rememberMe}</span>
              </label>
            </div>

            {/* Submit Button: text only "登录" / "تسجيل الدخول", NO icons */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 mt-4 cursor-pointer"
            >
              {isLoading ? t.loggingIn : t.loginBtn}
            </button>

            {/* Paper Card Upgrade Button below Login Button: NO icon (per user request 1) */}
            <button
              type="button"
              onClick={() => {
                setShowUpgradeModal(true);
                setUpgradedCardData(null);
                setUpgradeError(null);
              }}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 font-medium rounded-xl text-xs transition-all flex items-center justify-center shadow-sm cursor-pointer"
            >
              <span>{t.paperCardUpgradeBtn}</span>
            </button>
          </form>

          {/* Minimal Security Badge */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500">
              {t.securityNotice}
            </span>
          </div>
        </div>
      </main>

      {/* Official Footer Disclaimer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto">
          <p>{t.ministryFooter}</p>
        </div>
      </footer>

      {/* Paper Ration Card Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top Close Button Only - Header title completely removed (per user request 2) */}
            <div className="flex justify-end pb-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                title={t.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Verified: Prompt notice and card details (per user request 5) */}
            {upgradedCardData ? (
              <div className="space-y-5">
                {/* Notice specified by user request 5 */}
                <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-start gap-3.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-300 leading-relaxed">
                      {t.upgradeSuccessNotice}
                    </h3>
                  </div>
                </div>

                {/* Digital Card Showcase Box */}
                <div className="p-5 bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-inner space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">
                        {t.generatedDigitalCardLabel}
                      </span>
                      <span className="text-lg font-mono font-bold text-amber-300 tracking-wider">
                        {upgradedCardData.newCardNo}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCardNo}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition-colors border border-slate-700 cursor-pointer"
                    >
                      {copiedCardNo ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.copyCardNo}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.registeredHeadLabel}</span>
                      <span className="text-slate-200 font-semibold">{upgradedCardData.headName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.registeredPhoneLabel}</span>
                      <span className="text-slate-200 font-mono">{upgradedCardData.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.provinceLabel}</span>
                      <span className="text-slate-200">{province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.rationCenterLabel}</span>
                      <span className="text-slate-200">{rationCenter}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.foodAgentCodeLabel}</span>
                      <span className="text-slate-200 font-mono">{foodAgentCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">{t.flourAgentCodeLabel}</span>
                      <span className="text-slate-200 font-mono">{flourAgentCode}</span>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-emerald-400">
                    <span>{t.quotaStatusLabel}</span>
                  </div>
                </div>

                {/* Actions: NO icons on confirm buttons (per user request 4) */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReturnToLogin}
                    className="w-full py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center cursor-pointer"
                  >
                    <span>{t.goToLoginBtn}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartUsingNow}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{t.startUsingBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Input Form for Upgrading */
              <form onSubmit={handleConfirmUpgrade} className="space-y-4 text-xs">
                {/* Demo Quick Fill Banner */}
                <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400">
                    💡 支持一键填入测试数据快速验证
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillDemo}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors cursor-pointer"
                  >
                    {t.quickFillDemo}
                  </button>
                </div>

                {/* Error Banner */}
                {upgradeError && (
                  <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{upgradeError}</span>
                  </div>
                )}

                {/* 1. Before 纸质配给卡卡号: 省份 and 配给中心 (per user request 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.provinceLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      placeholder={t.provincePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.rationCenterLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rationCenter}
                      onChange={e => setRationCenter(e.target.value)}
                      placeholder={t.rationCenterPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>
                </div>

                {/* 2. 纸质配给卡卡号 */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">
                    {t.paperCardNoLabel} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paperCardNo}
                    onChange={e => setPaperCardNo(e.target.value)}
                    placeholder={t.paperCardNoPlaceholder}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                  />
                </div>

                {/* 3. Below 纸质配给卡卡号: 食品代理编号 and 面粉代理编号 (per user request 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.foodAgentCodeLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={foodAgentCode}
                      onChange={e => setFoodAgentCode(e.target.value)}
                      placeholder={t.foodAgentCodePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.flourAgentCodeLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={flourAgentCode}
                      onChange={e => setFlourAgentCode(e.target.value)}
                      placeholder={t.flourAgentCodePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 4. 户主姓名 & 身份证 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.headNameLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={headName}
                      onChange={e => setHeadName(e.target.value)}
                      placeholder={t.headNamePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.nationalIdLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={nationalId}
                      onChange={e => setNationalId(e.target.value)}
                      placeholder={t.nationalIdPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 5. 电话号码 & 短信验证码 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.phoneLabel} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.smsCodeLabel} <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={smsCode}
                        onChange={e => setSmsCode(e.target.value)}
                        placeholder={t.smsCodePlaceholder}
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleSendSmsCode}
                        disabled={smsCountdown > 0}
                        className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-emerald-400 border border-slate-700 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {smsCountdown > 0 ? `${smsCountdown}s` : t.sendCodeBtn}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated SMS Toast if generated */}
                {simulatedSms && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between gap-2">
                    <div>
                      <span>{t.smsCodeDemoNotice} <strong className="font-mono text-white text-xs">{simulatedSms}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmsCode(simulatedSms)}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded font-medium cursor-pointer"
                    >
                      {currentLang === 'zh' ? '一键填入' : 'إدراج'}
                    </button>
                  </div>
                )}

                {/* 6. 登录密码 & 密码确认 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.newPasswordLabel} <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showUpgradePassword ? 'text' : 'password'}
                        required
                        value={upgradePassword}
                        onChange={e => setUpgradePassword(e.target.value)}
                        placeholder={t.newPasswordPlaceholder}
                        className="w-full py-2.5 pr-10 pl-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowUpgradePassword(!showUpgradePassword)}
                        className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showUpgradePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">
                      {t.confirmPasswordLabel} <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPasswordPlaceholder}
                        className="w-full py-2.5 pr-10 pl-3.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Buttons: NO icon on submitUpgradeBtn (per user request 4) */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUpgradeModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isUpgrading}
                    className="px-6 py-2.5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <span>{isUpgrading ? t.submittingText : t.submitUpgradeBtn}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Biometric Face & Unified National ID Cross-Verification Modal */}
      <BiometricLoginModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onConfirmSuccess={() => {
          setIsDeviceTrusted(true);
          setShowBiometricModal(false);
          if (pendingProfile) {
            onLoginSuccess(pendingProfile);
          }
        }}
        hardwareCode={hardwareCode}
        userName={pendingProfile?.displayName || '公民持卡人'}
        userCardNo={identifier}
        currentLang={currentLang}
      />
    </div>
  );
};
