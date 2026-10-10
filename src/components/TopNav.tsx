import React, { useState, useRef, useEffect } from 'react';
import { SystemId, UserProfile } from '../types';
import {
  LogIn,
  LogOut,
  Shield,
  User,
  CheckCircle2,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  X,
  Menu,
  Globe,
  Sliders
} from 'lucide-react';
import { SYSTEMS_META } from '../data/featuresRegistry';
import { RationCardLogo } from './RationCardLogo';
import { Language, useI18n } from '../i18n/translations';

interface Props {
  currentSystemId: SystemId;
  standaloneMode: boolean;
  onSelectSystem: (id: SystemId) => void;
  onExitStandalone: () => void;
  onOpenMatrix: () => void;
  currentUser: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onRoleChange: (role: UserProfile['role']) => void;
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const TopNav: React.FC<Props> = ({
  currentSystemId,
  standaloneMode,
  onSelectSystem,
  onExitStandalone,
  onOpenMatrix,
  currentUser,
  onLogin,
  onLogout,
  onRoleChange,
  currentLang,
  onLanguageChange
}) => {
  const { t, isRtl } = useI18n();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer when system is selected or on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primarySystems: { id: SystemId; name: string; code: string }[] = [
    { id: 'citizenFamily', name: t.navCitizenFamily, code: 'CFMS-01' },
    { id: 'rationing', name: t.navRationing, code: 'RMS-02' },
    { id: 'agentMgmt', name: t.navAgentMgmt, code: 'AMS-04' },
    { id: 'warehouse', name: t.navWarehouse, code: 'WMS-08' },
    { id: 'aiBigData', name: t.navAiBigData, code: 'BDA-11' }
  ];

  const secondarySystems: { id: SystemId; name: string; code: string; desc: string }[] = [
    { id: 'identity', name: t.sysIdentity, code: 'IVS-03', desc: t.sysIdentityDesc },
    { id: 'ePayment', name: t.sysEPayment, code: 'EPS-05', desc: t.sysEPaymentDesc },
    { id: 'notification', name: t.sysNotification, code: 'NS-06', desc: t.sysNotificationDesc },
    { id: 'crossVerify', name: t.sysCrossVerify, code: 'CVS-07', desc: t.sysCrossVerifyDesc },
    { id: 'operations', name: t.sysOperations, code: 'OMS-09', desc: t.sysOperationsDesc },
    { id: 'mobileApp', name: t.sysMobileApp, code: 'UMA-10', desc: t.sysMobileAppDesc }
  ];

  const allSystems: { id: SystemId; name: string; code: string; desc?: string }[] = [
    ...primarySystems,
    ...secondarySystems,
    { id: 'configMgmt', name: t.navConfigMgmt, code: 'CMS-12', desc: t.sysConfigDesc }
  ];

  const isCurrentSecondary = secondarySystems.some(s => s.id === currentSystemId);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Section */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#portal"
            onClick={e => {
              e.preventDefault();
              onSelectSystem('citizenFamily');
            }}
            className="flex items-center gap-2 group"
          >
            <RationCardLogo size="sm" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                {t.platformName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                {t.ministryName}
              </span>
            </div>
          </a>
        </div>

        {/* Clean Center Navigation Bar (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
          <button
            onClick={() => onSelectSystem('citizenFamily')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentSystemId === 'citizenFamily'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navCitizenFamily}
          </button>
          <button
            onClick={() => onSelectSystem('rationing')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentSystemId === 'rationing'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navRationing}
          </button>
          <button
            onClick={() => onSelectSystem('agentMgmt')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentSystemId === 'agentMgmt'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navAgentMgmt}
          </button>
          <button
            onClick={() => onSelectSystem('warehouse')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentSystemId === 'warehouse'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navWarehouse}
          </button>
          <button
            onClick={() => onSelectSystem('aiBigData')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentSystemId === 'aiBigData'
                ? 'bg-slate-800 text-white font-semibold'
                : 'hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.navAiBigData}
          </button>

          {/* More Subsystems Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                isCurrentSecondary
                  ? 'bg-slate-800 text-amber-300 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>{t.navMoreSystems}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1"
              >
                <div className="text-[10px] text-slate-500 font-mono px-2 py-1 uppercase">
                  {currentLang === 'zh' ? '独立微前端子系统路由' : 'الأنظمة الفرعية المستقلة'}
                </div>
                {secondarySystems.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSelectSystem(sub.id);
                      setMoreMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                      currentSystemId === sub.id
                        ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-500">{sub.code}</span>
                        <span>{sub.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{sub.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Config Management Button */}
          <button
            onClick={() => onSelectSystem('configMgmt')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-1 cursor-pointer ${
              currentSystemId === 'configMgmt'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-amber-400 hover:bg-amber-400/10'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t.navConfigMgmt}</span>
          </button>
        </nav>

        {/* Right Actions: Lang Switcher, User Profile, Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active Standalone indicator */}
          {standaloneMode && (
            <div className="hidden sm:flex items-center gap-1.5 bg-blue-600/20 border border-blue-500 text-blue-300 px-2 py-0.5 rounded-lg text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{t.sandboxMode}</span>
              <button
                onClick={onExitStandalone}
                className="hover:text-white ml-1 text-slate-400 cursor-pointer"
                title={t.exitSandbox}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Language Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px] sm:text-[11px]">
            <button
              onClick={() => onLanguageChange('zh')}
              className={`px-1.5 sm:px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                currentLang === 'zh'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="切换为中文"
            >
              中
            </button>
            <button
              onClick={() => onLanguageChange('ar')}
              className={`px-1.5 sm:px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                currentLang === 'ar'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="التبديل إلى العربية"
            >
              عربي
            </button>
            <button
              onClick={() => onLanguageChange('ku')}
              className={`px-1.5 sm:px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                currentLang === 'ku'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="گۆڕین بۆ زمانی کوردی"
            >
              کوردی
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 sm:px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                currentLang === 'en'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          {/* User Auth Profile (Desktop & Tablet) */}
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg text-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-purple-400" />
              )}
              <span className="font-medium text-slate-200 hidden md:inline truncate max-w-[90px]">
                {currentUser.displayName}
              </span>
              <select
                value={currentUser.role}
                onChange={e => onRoleChange(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] sm:text-[11px] rounded px-1 py-0.5 focus:outline-none cursor-pointer"
                title="切换系统身份"
              >
                <option value="citizen">{t.roleCitizen}</option>
                <option value="agent">{t.roleAgent}</option>
                <option value="admin">{t.roleAdmin}</option>
                <option value="auditor">{t.roleAuditor}</option>
              </select>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 p-0.5 transition-colors ml-0.5 cursor-pointer"
                title={t.logoutBtn}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer touch-manipulation"
            aria-label="打开移动端系统导航"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Quick-Access Horizontal Bar (lg:hidden) */}
      <div className="lg:hidden bg-slate-950/90 border-t border-slate-850 px-2 py-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1">
        {primarySystems.map(sys => {
          const isActive = currentSystemId === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => onSelectSystem(sys.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 font-medium ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {sys.name}
            </button>
          );
        })}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 flex items-center gap-1 ${
            isCurrentSecondary || currentSystemId === 'configMgmt'
              ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <span>更多系统</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Standalone Banner Bar only when explicitly launched */}
      {standaloneMode && (
        <div className="bg-blue-600 text-white text-xs py-1 px-3 sm:px-4 shadow-xs border-t border-blue-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold uppercase tracking-wider bg-blue-800 px-1.5 py-0.2 rounded text-[10px] shrink-0">
                {currentLang === 'zh' ? '微前端沙盒' : 'Sandbox'}
              </span>
              <span className="truncate text-[11px]">
                {currentLang === 'zh' ? `子系统：${currentSystemId} 独立运行` : `Subsystem: ${currentSystemId}`}
              </span>
            </div>
            <button
              onClick={onExitStandalone}
              className="underline hover:text-white font-medium text-[11px] cursor-pointer shrink-0"
            >
              {t.exitSandbox}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer / Slide-Over Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <RationCardLogo size="sm" />
                  <div>
                    <div className="text-xs font-bold text-white">{t.platformName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">12微前端子系统路由</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile User Profile & Role Selector */}
              {currentUser && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        {currentUser.displayName.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate max-w-[140px]">
                          {currentUser.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
                      title={t.logoutBtn}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logoutBtn}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-850">
                    <span className="text-[11px] text-slate-400">当前操作身份：</span>
                    <select
                      value={currentUser.role}
                      onChange={e => onRoleChange(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="citizen">{t.roleCitizen}</option>
                      <option value="agent">{t.roleAgent}</option>
                      <option value="admin">{t.roleAdmin}</option>
                      <option value="auditor">{t.roleAuditor}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Systems List */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1 py-1">
                  业务子系统列表 (12 Subsystems)
                </div>

                <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                  {allSystems.map(sys => {
                    const isSelected = currentSystemId === sys.id;
                    return (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => {
                          onSelectSystem(sys.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer touch-manipulation ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-slate-950/60 hover:bg-slate-800 text-slate-200 border border-slate-800/80'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {sys.code}
                            </span>
                            <span className="text-xs font-semibold truncate">{sys.name}</span>
                          </div>
                          {sys.desc && (
                            <div
                              className={`text-[10px] truncate mt-0.5 ${
                                isSelected ? 'text-emerald-100' : 'text-slate-500'
                              }`}
                            >
                              {sys.desc}
                            </div>
                          )}
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer with Language Selector */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>界面语言</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-400 uppercase">{currentLang}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => onLanguageChange('zh')}
                  className={`py-1.5 rounded-lg text-xs font-semibold ${
                    currentLang === 'zh' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  中文
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('ar')}
                  className={`py-1.5 rounded-lg text-xs font-semibold ${
                    currentLang === 'ar' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  عربي
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('ku')}
                  className={`py-1.5 rounded-lg text-xs font-semibold ${
                    currentLang === 'ku' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  کوردی
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange('en')}
                  className={`py-1.5 rounded-lg text-xs font-semibold ${
                    currentLang === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
