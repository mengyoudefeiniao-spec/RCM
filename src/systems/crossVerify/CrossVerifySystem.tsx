import React, { useState } from 'react';
import {
  RefreshCw,
  GitBranch,
  ListCheck,
  ShieldCheck,
  CheckCircle,
  FileBarChart2,
  Play,
  Check,
  AlertTriangle
} from 'lucide-react';
import { CrossCheckTask, DiscrepancyItem } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  tasks: CrossCheckTask[];
  discrepancies: DiscrepancyItem[];
  onTriggerTask: (taskId: string) => void;
  onExecuteDiscrepancyAction: (discrepancyId: string, action: string) => void;
}

export const CrossVerifySystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  tasks,
  discrepancies,
  onTriggerTask,
  onExecuteDiscrepancyAction
}) => {
  // Navigation tabs for 6 features:
  // 65: batch_scheduler, 66: connectors, 67: discrepancy_list,
  // 68: freeze_actions, 69: closed_loop_log, 70: quality_report
  const [activeTab, setActiveTab] = useState<'scheduler' | 'adapters' | 'discrepancy' | 'quality'>(
    activeFeatureId && activeFeatureId === 65 ? 'scheduler' :
    activeFeatureId && activeFeatureId === 66 ? 'adapters' :
    activeFeatureId && (activeFeatureId === 67 || activeFeatureId === 68 || activeFeatureId === 69) ? 'discrepancy' :
    activeFeatureId && activeFeatureId === 70 ? 'quality' : 'scheduler'
  );

  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleRunTask = (id: string) => {
    setRunningTaskId(id);
    setTimeout(() => {
      onTriggerTask(id);
      setRunningTaskId(null);
      setActionFeedback(`✓ 批量比对任务 ${id} 执行完毕！已比对 142,500 条部委记录并更新差异清单。`);
      setTimeout(() => setActionFeedback(null), 4000);
    }, 1200);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'scheduler' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> 65. 定期核验任务调度
          </button>
          <button
            onClick={() => setActiveTab('adapters')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'adapters' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <GitBranch className="w-4 h-4" /> 66. 部委机构数据适配器
          </button>
          <button
            onClick={() => setActiveTab('discrepancy')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'discrepancy' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ListCheck className="w-4 h-4" /> 67-69. 差异清单与冻结闭环
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'quality' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileBarChart2 className="w-4 h-4" /> 70. 机构数据质量评估报告
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
          {actionFeedback}
        </div>
      )}

      {/* Feature 65: Scheduler */}
      {activeTab === 'scheduler' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 65：定期与事件触发核验调度引擎
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按机构配置每日/每周核验周期，定时或按重大申请事件触发与外部部委库的批量并发比对。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map(t => (
              <div key={t.id} className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs text-rose-600 font-bold">{t.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{t.targetAgency}</h4>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {t.checkType}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-mono space-y-1">
                  <div>上次执行: {t.lastRun}</div>
                  <div>比对检出差异: <span className="text-rose-600 font-bold">{t.discrepancyCount} 户</span></div>
                  <div>运行状态: <span className="text-emerald-600 font-semibold">{t.status}</span></div>
                </div>

                <button
                  onClick={() => handleRunTask(t.id)}
                  disabled={runningTaskId === t.id}
                  className="w-full py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className={`w-3.5 h-3.5 ${runningTaskId === t.id ? 'animate-spin' : ''}`} />
                  <span>{runningTaskId === t.id ? '比对中...' : '立即手动触发批量比对'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 66: Adapters */}
      {activeTab === 'adapters' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 66：各部委和政府部门数据适配器配置 (ETL Connectors)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              通过安全专网配置抽取、加密解密转换与字段对齐适配器，无缝桥接多部门异构数据协议。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white">1. 内政部公民身份与死亡民籍适配器 (MOI-Connector)</span>
              <p className="text-slate-500">协议: gRPC over mTLS · 频率: 每日 02:00 增量拉取死亡注销与国籍变动名单。</p>
              <div className="text-emerald-600 font-mono">Status: Connected (Ping 14ms)</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white">2. 国家税务总局高收入库适配器 (GCT-Tax-API)</span>
              <p className="text-slate-500">协议: REST/JSON Webhook · 频率: 季度申报时按税后月入超 150 万第纳尔比对。</p>
              <div className="text-emerald-600 font-mono">Status: Connected (Ping 22ms)</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white">3. 边境与出入境管理局旅客通关适配器 (Borders-Sync)</span>
              <p className="text-slate-500">协议: Kafka 消息流订阅 · 频率: 实时监听出境超过 180 天未入境公民。</p>
              <div className="text-emerald-600 font-mono">Status: Connected (Lag: 0)</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white">4. 贸易部企业与商会登记局适配器 (Chamber-Corp)</span>
              <p className="text-slate-500">协议: Oracle DB Link 视图 · 频率: 每周比对商业注册公司法人与股东名单。</p>
              <div className="text-emerald-600 font-mono">Status: Connected (Read-Only)</div>
            </div>
          </div>
        </div>
      )}

      {/* Features 67-69: Discrepancy List & Actions */}
      {activeTab === 'discrepancy' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 67 ~ 69：差异清单分类推送、冻结建议承诺与闭环全过程留痕
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              自动分类死亡、高收入、长期旅行及商业法人未报记录；生成冻结处置建议并由运营人员确认后一键闭环执行。
            </p>
          </div>

          <div className="space-y-3">
            {discrepancies.map(d => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/20 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{d.id}</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{d.personName}</span>
                    <span className="font-mono text-slate-500">卡号: {d.rationCardNo} · NID: {d.nationalId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-medium bg-rose-500/10 text-rose-500">
                      {d.discrepancyType}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      d.handledStatus === '已执行冻结' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {d.handledStatus}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">部委外部比对证据：</span>
                  {d.externalAgencyData}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500 font-medium">
                    系统策略建议：<span className="text-rose-600 font-bold">{d.systemActionAdvice}</span>
                  </span>
                  {d.handledStatus === '待处理' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          onExecuteDiscrepancyAction(d.id, '已执行冻结');
                          setActionFeedback(`✓ 已采纳建议！配给卡 ${d.rationCardNo} 已依法执行冻结，并将闭环存证归档。`);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                      >
                        采纳建议并执行冻结
                      </button>
                      <button
                        onClick={() => {
                          onExecuteDiscrepancyAction(d.id, '已核实放行');
                          setActionFeedback(`✓ 运营人员已人工核实材料属误报，予以放行留痕。`);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                      >
                        人工核实放行
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 70: Quality Report */}
      {activeTab === 'quality' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 70：各机构数据覆盖率与差异率质检评估报告
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              输出各外部对接部委的数据对接质量报告，供贸易部决策层评估数据可信度与防冒领成果。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">死亡数据比对覆盖率</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">99.4%</div>
              <span className="text-emerald-600 font-sans">内政部接口月查漏 18,200 人</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">高收入申报核准率</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">96.8%</div>
              <span className="text-rose-500 font-sans">差异率 3.2% (已冻结阻断)</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">出入境边检比对精度</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">100.0%</div>
              <span className="text-slate-500 font-sans">通关记录实时回传无延迟</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">财政粮食基金挽回节省</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">82.5 亿 IQD</div>
              <span className="text-slate-500 font-sans">累计阻断 52,000 起冒领</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
