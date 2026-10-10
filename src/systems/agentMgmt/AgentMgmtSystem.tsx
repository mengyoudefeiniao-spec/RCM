import React, { useState } from 'react';
import {
  Store,
  QrCode,
  Keyboard,
  PackageCheck,
  Search,
  Award,
  Ban,
  RotateCcw,
  GitMerge,
  Shuffle,
  PlusCircle,
  Layers,
  Scissors,
  ShieldCheck,
  Coins,
  ClipboardList,
  FileCheck,
  FileSpreadsheet,
  FileSearch,
  Bell,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { AgentRecord, FamilyRecord } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  agentData: AgentRecord[];
  familyData: FamilyRecord[];
  onUpdateAgent: (agent: AgentRecord) => void;
  onAddAgent: (agent: AgentRecord) => void;
}

export const AgentMgmtSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  agentData,
  familyData,
  onUpdateAgent,
  onAddAgent
}) => {
  // Navigation tabs matching the groups of 19 features
  const [activeTab, setActiveTab] = useState<string>(
    activeFeatureId && activeFeatureId >= 27 && activeFeatureId <= 30 ? 'operations' :
    activeFeatureId && activeFeatureId >= 31 && activeFeatureId <= 38 ? 'authority' :
    activeFeatureId && activeFeatureId >= 39 && activeFeatureId <= 40 ? 'control_fees' :
    activeFeatureId && activeFeatureId >= 41 && activeFeatureId <= 42 ? 'inspection' :
    activeFeatureId && activeFeatureId >= 43 && activeFeatureId <= 45 ? 'ledger_collab' : 'operations'
  );

  const [selectedAgent, setSelectedAgent] = useState<AgentRecord>(agentData[0]);

  // Feature 27 & 28: Read Card
  const [readCardMethod, setReadCardMethod] = useState<'auto' | 'manual'>('auto');
  const [manualCardNo, setManualCardNo] = useState('RC-10029381');
  const [scannedFamily, setScannedFamily] = useState<FamilyRecord | null>(familyData[0]);

  // Feature 29: Delivery Register
  const [deliveredFlourKg, setDeliveredFlourKg] = useState(45);
  const [deliveredRiceKg, setDeliveredRiceKg] = useState(15);
  const [deliveredSugarKg, setDeliveredSugarKg] = useState(10);
  const [deliveredOilL, setDeliveredOilL] = useState(5);
  const [deliveryResult, setDeliveryResult] = useState<string | null>(null);

  // Feature 31-38: Authority Actions State
  const [authorityAction, setAuthorityAction] = useState<
    'grant' | 'revoke' | 'restore' | 'merge' | 'rotate' | 'establish' | 'unify' | 'split'
  >('merge');
  const [authorityResultMsg, setAuthorityResultMsg] = useState<string | null>(null);

  // Authority Parameters
  const [mergeAgent1, setMergeAgent1] = useState(agentData[2]?.id || '');
  const [mergeAgent2, setMergeAgent2] = useState(agentData[3]?.id || '');
  const [unifyAreaSqM, setUnifyAreaSqM] = useState(25);
  const [splitSourceAgentId, setSplitSourceAgentId] = useState(agentData[4]?.id || '');

  // Feature 40: Fee State
  const [feeCategory, setFeeCategory] = useState<'电子申请' | '设立/授予/统一/拆分' | '亲属轮替'>('设立/授予/统一/拆分');

  // Feature 41: Inspection Committee Results
  const [inspectionResultSubmitted, setInspectionResultSubmitted] = useState(false);

  // Feature 42: Family Consent Collection
  const [consentThresholdAchieved, setConsentThresholdAchieved] = useState(false);

  // Feature 44: Joint Investigation
  const [investigationLogged, setInvestigationLogged] = useState(false);

  // Feature 45: Notification
  const [agentNotificationSent, setAgentNotificationSent] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'operations' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <QrCode className="w-4 h-4" /> 代理日常作业 (27-30)
          </button>
          <button
            onClick={() => setActiveTab('authority')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'authority' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" /> 机构资质全周期 (31-38)
          </button>
          <button
            onClick={() => setActiveTab('control_fees')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'control_fees' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Coins className="w-4 h-4" /> 1500户管控与规费 (39-40)
          </button>
          <button
            onClick={() => setActiveTab('inspection')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inspection' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> 实地四方检查与同意书 (41-42)
          </button>
          <button
            onClick={() => setActiveTab('ledger_collab')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ledger_collab' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 台账·联合调查·排期 (43-45)
          </button>
        </div>
      </div>

      {/* Module 1: Daily Operations (Features 27-30) */}
      {activeTab === 'operations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 27 ~ 30：代理作业 (自动/手动读卡、配给交付登记与库存物资查询)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              代销网点现场自动感应配给卡或手动应急录入，核对家庭额度并完成实物发放登记与库存扣减。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Reader */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReadCardMethod('auto')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    readCardMethod === 'auto' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}
                >
                  功能点 27: 自动读卡 (扫码/NFC)
                </button>
                <button
                  onClick={() => setReadCardMethod('manual')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                    readCardMethod === 'manual' ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }`}
                >
                  功能点 28: 手动读卡 (应急输入)
                </button>
              </div>

              {readCardMethod === 'auto' ? (
                <div className="p-6 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-xl text-center space-y-3 bg-amber-50/20 dark:bg-amber-950/10">
                  <QrCode className="w-10 h-10 mx-auto text-amber-500" />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    请将公民电子配给卡二维码或芯片贴近扫描枪
                  </span>
                  <button
                    onClick={() => setScannedFamily(familyData[0])}
                    className="block mx-auto px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                  >
                    模拟自动扫描成功
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-slate-500">手动输入配给卡号：</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualCardNo}
                      onChange={e => setManualCardNo(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
                    />
                    <button
                      onClick={() => {
                        const f = familyData.find(x => x.rationCardNo === manualCardNo) || familyData[0];
                        setScannedFamily(f);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg"
                    >
                      查询读取
                    </button>
                  </div>
                </div>
              )}

              {scannedFamily && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    读取成功：{scannedFamily.headName} ({scannedFamily.rationCardNo})
                  </div>
                  <div className="text-slate-500">
                    登记人口: {scannedFamily.memberCount} 人 · 状态: <span className="text-emerald-500 font-bold">{scannedFamily.status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature 29: Delivery Register */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                功能点 29：物品交付登记 (实发数量核销)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">精制小麦粉 (kg)</label>
                  <input
                    type="number"
                    value={deliveredFlourKg}
                    onChange={e => setDeliveredFlourKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">长粒大米 (kg)</label>
                  <input
                    type="number"
                    value={deliveredRiceKg}
                    onChange={e => setDeliveredRiceKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">食用白糖 (kg)</label>
                  <input
                    type="number"
                    value={deliveredSugarKg}
                    onChange={e => setDeliveredSugarKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">葵花籽油 (L)</label>
                  <input
                    type="number"
                    value={deliveredOilL}
                    onChange={e => setDeliveredOilL(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setDeliveryResult(
                    `✓ 发放登记完成！已核销小麦粉 ${deliveredFlourKg}kg, 大米 ${deliveredRiceKg}kg, 白糖 ${deliveredSugarKg}kg, 油 ${deliveredOilL}L。电子凭单与出库流水已同步生成并推送公民手机。`
                  );
                }}
                className="w-full py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>确认发放登记并扣减库存</span>
              </button>

              {deliveryResult && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  {deliveryResult}
                </div>
              )}
            </div>
          </div>

          {/* Feature 30: Ration inquiry */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-2">
              功能点 30：配给物资查询 (网点当前可用库存与下次交货批次)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                <span className="text-slate-500 font-sans">小麦粉当前存量</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">12,450 kg</div>
                <span className="text-[10px] text-slate-400 font-sans">预计支持 14 天配发</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                <span className="text-slate-500 font-sans">长粒大米存量</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">4,200 kg</div>
                <span className="text-[10px] text-slate-400 font-sans">预计支持 18 天配发</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                <span className="text-slate-500 font-sans">食用白糖存量</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">2,800 kg</div>
                <span className="text-[10px] text-slate-400 font-sans">预计支持 20 天配发</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
                <span className="text-slate-500 font-sans">下次中央仓交货日</span>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">2026-10-14</div>
                <span className="text-[10px] text-slate-400 font-sans">批次号: TRK-2026-901</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Authority Actions (Features 31-38) */}
      {activeTab === 'authority' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 31 ~ 38：机构管理全周期矩阵
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              授予 (优先原代理三代内亲属)、注销、恢复、合并 (≤750户)、轮替继承 (12个月内)、新建设立、食品面粉统一 (面积≥20㎡)、超大网点拆分 (&ge;1500户)。
            </p>
          </div>

          {/* Action Selector */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setAuthorityAction('grant')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'grant' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              31. 代理权授予 (三代直系)
            </button>
            <button
              onClick={() => setAuthorityAction('revoke')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'revoke' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              32. 代理权注销
            </button>
            <button
              onClick={() => setAuthorityAction('restore')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'restore' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              33. 代理权恢复
            </button>
            <button
              onClick={() => setAuthorityAction('merge')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'merge' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              34. 代理权合并 (≤750户校验)
            </button>
            <button
              onClick={() => setAuthorityAction('rotate')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'rotate' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              35. 代理权轮替 (12个月继承)
            </button>
            <button
              onClick={() => setAuthorityAction('establish')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'establish' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              36. 偏远地区设立
            </button>
            <button
              onClick={() => setAuthorityAction('unify')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'unify' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              37. 代理权统一 (场所≥20㎡)
            </button>
            <button
              onClick={() => setAuthorityAction('split')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
                authorityAction === 'split' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
              }`}
            >
              38. 超大代理拆分 (≥1500户)
            </button>
          </div>

          {/* Action Specific Workstation */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-2xl">
            {authorityAction === 'merge' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  代理权合并法定核验：合并后总户数严禁超过 750 户
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500">代理商 A (拟合并)</label>
                    <select
                      value={mergeAgent1}
                      onChange={e => setMergeAgent1(e.target.value)}
                      className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border rounded"
                    >
                      {agentData.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.householdsCount}户)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500">代理商 B (拟合并)</label>
                    <select
                      value={mergeAgent2}
                      onChange={e => setMergeAgent2(e.target.value)}
                      className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border rounded"
                    >
                      {agentData.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.householdsCount}户)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const a1 = agentData.find(x => x.id === mergeAgent1);
                    const a2 = agentData.find(x => x.id === mergeAgent2);
                    const sum = (a1?.householdsCount || 0) + (a2?.householdsCount || 0);
                    if (sum > 750) {
                      setAuthorityResultMsg(`❌ 合并拦截：两家合并后总户数达 ${sum} 户，超过法定 750 户合并上限，规划与跟进司总干事依法予以否决！`);
                    } else {
                      setAuthorityResultMsg(`✓ 合并核准：合并后总户数 ${sum} 户 (符合 ≤ 750 户规定)。总干事签批核准！`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  执行法定合并条件审查并签批
                </button>
              </div>
            )}

            {authorityAction === 'unify' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  食品与面粉代理统一核验：代销场所营业面积不得小于 20 平方米
                </span>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">代销门面实测建筑面积 (㎡)</label>
                  <input
                    type="number"
                    value={unifyAreaSqM}
                    onChange={e => setUnifyAreaSqM(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 text-sm bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <button
                  onClick={() => {
                    if (unifyAreaSqM < 20) {
                      setAuthorityResultMsg(`❌ 面积不达标：当前门面仅 ${unifyAreaSqM} ㎡，低于统一经营法定最低 20 ㎡ 门槛，部长驳回统一申请！`);
                    } else {
                      setAuthorityResultMsg(`✓ 营业面积核验达标 (${unifyAreaSqM} ㎡ >= 20 ㎡)。部长签发食品与面粉互相提取配给统一资质！`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  验证营业面积并核发统营批件
                </button>
              </div>
            )}

            {authorityAction === 'split' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  超大网点拆分管理：达到 1500 户由联合委员会启动拆分
                </span>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">选择待拆分之特大型代销中心</label>
                  <select
                    value={splitSourceAgentId}
                    onChange={e => setSplitSourceAgentId(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-900 border rounded"
                  >
                    {agentData.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (当前服务家庭: {a.householdsCount} 户)</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const target = agentData.find(x => x.id === splitSourceAgentId);
                    if ((target?.householdsCount || 0) < 1500) {
                      setAuthorityResultMsg(`ℹ️ 该网点户数 (${target?.householdsCount}户) 尚未达到 1500 户强制拆分红线，可维持现状经营。`);
                    } else {
                      setAuthorityResultMsg(`✓ 触发拆分程序：该网点已达 ${target?.householdsCount} 户 (&ge;1500户)，联合委员会已立项并向部长呈递一分为二拆分方案 (拆分为两家 840 户网点)。`);
                    }
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  触发联合委员会拆分审查
                </button>
              </div>
            )}

            {authorityAction !== 'merge' && authorityAction !== 'unify' && authorityAction !== 'split' && (
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  当前业务操作：{authorityAction === 'grant' ? '代理权授予 (优先原代理三代内亲属)' :
                                authorityAction === 'revoke' ? '代理权注销 (违规或户数不足)' :
                                authorityAction === 'restore' ? '代理权恢复 (联合调查与家庭支持)' :
                                authorityAction === 'rotate' ? '代理权轮替 (已故代理12个月内继承)' : '偏远/新建地区设立'}
                </span>
                <p className="text-slate-500">
                  系统已载入伊拉克贸易部食品配给署规程与前置法审文件，点击下方按扭即可签发裁决。
                </p>
                <button
                  onClick={() => {
                    setAuthorityResultMsg(`✓ 资质管理批件已生成：已正式完成【${authorityAction}】行政公文流转，相关配给代理台账已同步！`);
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                >
                  签发行政核准命令
                </button>
              </div>
            )}

            {authorityResultMsg && (
              <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                authorityResultMsg.includes('❌') ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300' :
                'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}>
                {authorityResultMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module 3: Control & Fees (Features 39-40) */}
      {activeTab === 'control_fees' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 39 & 40：1500户上限管控 与 阶梯收费标准管理
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              面粉、食品代理各不超过 1500 户，超限阻止转入；电子申请 2,000 第纳尔，设立/授予/统一/拆分 250,000 第纳尔，轮替 50,000 第纳尔。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 39: Cap Monitoring */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                功能点 39：各代理点户数容量实时监控 (1500户红线)
              </span>
              <div className="space-y-2">
                {agentData.map(a => {
                  const percent = Math.min(100, Math.round((a.householdsCount / a.maxCap) * 100));
                  const isOver = a.householdsCount >= a.maxCap;
                  return (
                    <div key={a.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-900 dark:text-white">{a.name}</span>
                        <span className={`font-mono font-bold ${isOver ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'}`}>
                          {a.householdsCount} / {a.maxCap} 户 ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isOver ? 'bg-rose-500' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      {isOver && (
                        <div className="text-[11px] text-rose-500 font-medium">
                          ⚠️ 已达1500户上限，系统已锁定转入功能！
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature 40: Fee Management */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                功能点 40：法定官方行政规费标准与计费
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">公民各项配给业务电子申请费</div>
                    <div className="text-slate-500">分户、加人、更正、解冻等常规申请</div>
                  </div>
                  <div className="font-mono text-base font-bold text-slate-900 dark:text-white">2,000 IQD</div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">代理资质授予 / 设立 / 统一 / 拆分费</div>
                    <div className="text-slate-500">规划与跟进司官方行政许可牌照费</div>
                  </div>
                  <div className="font-mono text-base font-bold text-amber-600 dark:text-amber-400">250,000 IQD</div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">代理权二代亲属轮替继承费</div>
                    <div className="text-slate-500">已故代理12个月内继承过户审核费</div>
                  </div>
                  <div className="font-mono text-base font-bold text-blue-600 dark:text-blue-400">50,000 IQD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Inspection & Consent (Features 41-42) */}
      {activeTab === 'inspection' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 41 & 42：四方联合实地检查 与 受益家庭同意书材料征集
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              由配给分部、规划与跟进司、商业监督司及省级公司组成联合实地检查委员会；线上征集家庭同意书 (授予达30%、设立达100户)。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 41 */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                功能点 41：四方联合委员会实地检查结论登记
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded border">
                  <span>1. 配给分部现场验收代表</span>
                  <span className="text-emerald-600 font-semibold">合格 (92分)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded border">
                  <span>2. 规划与跟进司实地核查员</span>
                  <span className="text-emerald-600 font-semibold">合格 (95分)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded border">
                  <span>3. 商业与财务监督司巡视组</span>
                  <span className="text-emerald-600 font-semibold">合格 (90分)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded border">
                  <span>4. 省级粮食储运总公司专员</span>
                  <span className="text-emerald-600 font-semibold">合格 (94分)</span>
                </div>
              </div>

              <button
                onClick={() => setInspectionResultSubmitted(true)}
                className="w-full py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
              >
                登记并签章归档四方联合检查结论
              </button>

              {inspectionResultSubmitted && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  ✓ 检查报告已签章上报！综合得分 92.75 分，符合网点经营执照下发条件。
                </div>
              )}
            </div>

            {/* Feature 42 */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                功能点 42：家庭同意书材料线上征集核验
              </span>
              <p className="text-xs text-slate-500">
                法定指标：授予网点需获得辖区不少于 30% 受益家庭书面或电子签名支持；偏远新建设立需征集满 100 户支持。
              </p>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">当前已征集家庭数：</span>
                  <span className="font-bold text-slate-900 dark:text-white">128 户 / 目标 100 户</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">辖区家庭同意支持率：</span>
                  <span className="font-bold text-emerald-600">84.2% / 法定最低 30%</span>
                </div>
              </div>

              <button
                onClick={() => setConsentThresholdAchieved(true)}
                className="w-full py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                核验同意率并批量打印派发复印件
              </button>

              {consentThresholdAchieved && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  ✓ 同意率核查达标！已导出 128 户电子签名清册与防伪复印派发存根。
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Module 5: Ledger, Collab & Notifications (Features 43-45) */}
      {activeTab === 'ledger_collab' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 43 ~ 45：代理台账全貌、经侦监察联合调查与领料排期通知
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              维护代理基础信息与面积台账，登记与商业和财务监督司联合调查结果，实时向代理推送配给排期作业指令。
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature 43: Full Ledger Table */}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              功能点 43：代理商综合管理总台账
            </span>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">网点编号</th>
                    <th className="px-4 py-3 font-medium">网点名称</th>
                    <th className="px-4 py-3 font-medium">代理类型</th>
                    <th className="px-4 py-3 font-medium">服务户数</th>
                    <th className="px-4 py-3 font-medium">营业面积</th>
                    <th className="px-4 py-3 font-medium">负责人</th>
                    <th className="px-4 py-3 font-medium">四方检查得分</th>
                    <th className="px-4 py-3 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {agentData.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono font-semibold text-amber-600 dark:text-amber-400">{a.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{a.name}</td>
                      <td className="px-4 py-3">{a.agentType}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className={a.householdsCount >= 1500 ? 'text-rose-600 font-bold' : ''}>
                          {a.householdsCount} / {a.maxCap} 户
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{a.storeAreaSqM} ㎡</td>
                      <td className="px-4 py-3">{a.ownerName}</td>
                      <td className="px-4 py-3 font-mono text-emerald-600 font-semibold">{a.lastInspectionScore || 90} 分</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          a.status === '正常营业' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feature 44 & 45 Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  功能点 44：与商业和财务监督司联合调查登记
                </span>
                <p className="text-xs text-slate-500">
                  针对涉嫌套利或资质争议网点，联动监督司录入专项稽查报告。
                </p>
                <button
                  onClick={() => setInvestigationLogged(true)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg"
                >
                  登记联合调查结论报告
                </button>
                {investigationLogged && (
                  <div className="text-xs text-emerald-600 font-medium">✓ 商业与财务监督司联合备忘录已归档，评级：合规正常。</div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  功能点 45：向代理推送配给领取排期通知
                </span>
                <p className="text-xs text-slate-500">
                  向所选网点下发10月份第四批面粉粮食调拨提取排期与工作提醒。
                </p>
                <button
                  onClick={() => setAgentNotificationSent(true)}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>向全部网点广播排期通知</span>
                </button>
                {agentNotificationSent && (
                  <div className="text-xs text-emerald-600 font-medium">✓ 已通过专线Push向全部网点推送调拨日程。</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
