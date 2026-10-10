import React, { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  CheckCircle,
  XCircle,
  BarChart,
  FileText,
  UserCheck,
  LayoutDashboard,
  Activity,
  FolderOpen,
  MessageSquareX,
  FileClock,
  Download,
  Check
} from 'lucide-react';
import { FamilyRecord, RationApplication } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  familyData: FamilyRecord[];
  applications: RationApplication[];
  onUpdateApplication: (app: RationApplication) => void;
}

export const OperationsSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  familyData,
  applications,
  onUpdateApplication
}) => {
  // Navigation tabs for 10 features:
  // 83: division_roles, 84, 90, 91: approvals & reject, 85: stats, 86: daily_report,
  // 87: staff, 88: review_dash, 89: activity_dash, 92: audit_logs
  const [activeTab, setActiveTab] = useState<'roles_staff' | 'approvals' | 'analytics' | 'dashboards' | 'audit'>(
    activeFeatureId && (activeFeatureId === 83 || activeFeatureId === 87) ? 'roles_staff' :
    activeFeatureId && (activeFeatureId === 84 || activeFeatureId === 90 || activeFeatureId === 91) ? 'approvals' :
    activeFeatureId && (activeFeatureId === 85 || activeFeatureId === 86) ? 'analytics' :
    activeFeatureId && (activeFeatureId === 88 || activeFeatureId === 89) ? 'dashboards' :
    activeFeatureId && activeFeatureId === 92 ? 'audit' : 'approvals'
  );

  // Selected application for detail review & reject modal
  const [selectedApp, setSelectedApp] = useState<RationApplication>(applications[1] || applications[0]);
  const [rejectReason, setRejectReason] = useState('佐证证明文件照片模糊，且未加盖宗教初审法院公章，请补充后重新提交。');
  const [reviewActionResult, setReviewActionResult] = useState<string | null>(null);

  // Daily Report Generator State
  const [reportDate, setReportDate] = useState('2026-10-09');
  const [dailyReportGenerated, setDailyReportGenerated] = useState(false);

  // Staff accounts
  const [staffList, setStaffList] = useState([
    { id: 'STF-01', name: '萨米拉·卡西姆·穆罕默德', dept: '添加科 (新生儿与家庭补录)', role: '初审审核专员', status: '在线' },
    { id: 'STF-02', name: '阿德南·法鲁克·巴格达迪', dept: '冻结科 (高收入与反冒领查处)', role: '资格裁决官', status: '在线' },
    { id: 'STF-03', name: '哈希姆·阿卜杜勒·拉扎克', dept: '规划与跟进司分部管理处', role: '分部经理 (终审决策人)', status: '在线' }
  ]);

  // Audit Logs (Feature 92)
  const [auditLogs] = useState([
    { id: 'AUD-9901', operator: '哈希姆·分部经理', action: '终审核准家庭分户申请 (APP-2026-002)', ip: '10.240.12.8', time: '2026-10-09 16:45:11' },
    { id: 'AUD-9902', operator: '阿德南·冻结科专员', action: '依据国税总局高收入比对结果执行冻结 (RC-10029382)', ip: '10.240.12.19', time: '2026-10-09 14:12:05' },
    { id: 'AUD-9903', operator: '萨米拉·添加科专员', action: '查阅户籍档案扫描件 (APP-2026-001)', ip: '10.240.12.33', time: '2026-10-09 11:03:40' }
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'approvals' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-blue-500" /> 在线审批与驳回 (84, 90, 91)
          </button>
          <button
            onClick={() => setActiveTab('dashboards')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboards' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-500" /> 88-89. 审核与部委活动仪表板
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'analytics' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <BarChart className="w-4 h-4 text-indigo-500" /> 85-86. 业务统计与自动化日报
          </button>
          <button
            onClick={() => setActiveTab('roles_staff')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'roles_staff' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-500" /> 83, 87. 科室角色与员工管理
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'audit' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileClock className="w-4 h-4 text-rose-500" /> 92. 关键操作审计留痕
          </button>
        </div>
      </div>

      {/* Module 1: Approvals, Inspections & Rejection Feedback (Features 84, 90, 91) */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 84, 90 & 91：在线审批中心、证明文件调阅与驳回补正
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              审查公民上传的法院结婚证、出生医学证明与薪资明细单；支持一键签批核准或出具详实审核意见退回补正重新提交。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">流转工单队列：</span>
              <div className="space-y-2">
                {applications.map(app => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors space-y-1.5 ${
                      selectedApp.id === app.id
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">{app.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        app.status === '已批准' ? 'bg-emerald-500/10 text-emerald-500' :
                        app.status === '需补正' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-slate-500">申请人: {app.applicantName} · 编号: {app.id}</div>
                    <div className="text-slate-400 truncate">{app.notes}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Inspection & Actions (90 & 91) */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 90：申请详情调阅与附件查看
              </span>

              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border space-y-1.5 font-mono">
                <div>业务类型: <span className="font-sans font-semibold text-slate-900 dark:text-white">{selectedApp.type}</span></div>
                <div>家庭卡号: {selectedApp.familyCardNo}</div>
                <div>申请陈述: <span className="font-sans text-slate-600 dark:text-slate-300">{selectedApp.notes}</span></div>
                <div>
                  证明材料附件:
                  <div className="mt-1 flex gap-2">
                    {selectedApp.attachments.map(att => (
                      <span key={att} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 rounded text-[11px] font-mono">
                        📎 {att} (已验真)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reject / Approve Form (91) */}
              <div className="space-y-2 pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  功能点 91：审核意见录入 (支持退回补充材料)
                </span>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border rounded"
                  placeholder="驳回时请输入详尽理由供当事人补正..."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => {
                      const updated = { ...selectedApp, status: '已批准' as const };
                      onUpdateApplication(updated);
                      setSelectedApp(updated);
                      setReviewActionResult('✓ 已作出【批准】决定，家庭配给数据已实时生效！');
                    }}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> 批准通过
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...selectedApp, status: '需补正' as const, reviewNotes: rejectReason };
                      onUpdateApplication(updated);
                      setSelectedApp(updated);
                      setReviewActionResult('✓ 已作出【退回补正】决定，意见已同步推送到公民应用端！');
                    }}
                    className="py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquareX className="w-4 h-4" /> 驳回补充材料
                  </button>
                </div>

                {reviewActionResult && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                    {reviewActionResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Dashboards (Features 88 & 89) */}
      {activeTab === 'dashboards' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 88 & 89：审核人员运营看板 与 跨部委多机构业务活动监控大盘
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              面向规划与跟进司、商业和财务监督司、食品贸易总公司实时呈现全省家庭总数、在审待办与调拨监控。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">全国在册配给家庭总数</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">9,412,850 户</div>
              <span className="text-emerald-600 font-sans">覆盖总人口 41,200,000 人</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">今日审核中心结案率</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">98.4%</div>
              <span className="text-slate-500 font-sans">平均办理时效 1.4 小时</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">新开辟偏远代销点</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">42 个</div>
              <span className="text-slate-500 font-sans">偏远乡村网点覆盖率 100%</span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
              <span className="text-slate-500 font-sans">当月反冒领挽损</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">21.8 亿 IQD</div>
              <span className="text-slate-500 font-sans">内政部/税务部联合协查</span>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Analytics & Daily Report (Features 85 & 86) */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 85 & 86：业务统计分析 与 自动化综合日报生成
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按日自动汇总家庭户数变化、新生儿登记数、分户及死亡核销净变化，一键导出贸易部官方运营日报。
            </p>
          </div>

          <div className="max-w-xl space-y-4 text-xs">
            <div className="flex gap-3 items-center">
              <label className="text-slate-500">选择日报统计基准日：</label>
              <input
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border rounded font-mono"
              />
              <button
                onClick={() => setDailyReportGenerated(true)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-700 text-white rounded font-medium"
              >
                生成当日官方业务日报
              </button>
            </div>

            {dailyReportGenerated && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-3 font-mono">
                <div className="font-bold font-sans text-sm text-slate-900 dark:text-white flex justify-between">
                  <span>伊拉克贸易部食品配给业务全景日报 ({reportDate})</span>
                  <span className="text-blue-600 cursor-pointer flex items-center gap-1 font-sans text-xs">
                    <Download className="w-3.5 h-3.5" /> 导出 PDF
                  </span>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  <div className="py-1.5 flex justify-between">
                    <span className="font-sans text-slate-600 dark:text-slate-300">当日新增新生儿入册：</span>
                    <span className="font-bold">+ 1,842 人 (自动直批 100%)</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="font-sans text-slate-600 dark:text-slate-300">当日结婚独立分户签发新卡：</span>
                    <span className="font-bold">+ 312 户 (双方均达14周岁)</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="font-sans text-slate-600 dark:text-slate-300">民政比对已故注销名额：</span>
                    <span className="font-bold text-rose-500">- 420 人</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="font-sans text-slate-600 dark:text-slate-300">高收入/商业注册新增冻结：</span>
                    <span className="font-bold text-amber-500">89 户</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module 4: Staff & RBAC (Features 83 & 87) */}
      {activeTab === 'roles_staff' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 83 & 87：科室角色权限矩阵 (添加科/冻结科) 与 员工账户管理
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按规划与跟进司内部职能严格划分操作权限，严禁跨科室越权审批。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-sans">
                <tr>
                  <th className="px-4 py-3 font-medium">员工工号</th>
                  <th className="px-4 py-3 font-medium">姓名</th>
                  <th className="px-4 py-3 font-medium">所属法定科室 (功能点 83)</th>
                  <th className="px-4 py-3 font-medium">职能岗位</th>
                  <th className="px-4 py-3 font-medium">当前状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {staffList.map(st => (
                  <tr key={st.id}>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{st.id}</td>
                    <td className="px-4 py-3 font-sans font-medium">{st.name}</td>
                    <td className="px-4 py-3 font-sans text-blue-600 font-semibold">{st.dept}</td>
                    <td className="px-4 py-3 font-sans">{st.role}</td>
                    <td className="px-4 py-3 font-sans text-emerald-500">● {st.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module 5: Audit Logs (Feature 92) */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 92：关键操作全程留痕审计日志 (不可篡改追溯)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              供监察审计部门与管理员审计追踪每一笔冻结、解冻、审批、改选与发卡操作。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-sans">
                <tr>
                  <th className="px-4 py-3 font-medium">审计编号</th>
                  <th className="px-4 py-3 font-medium">操作人</th>
                  <th className="px-4 py-3 font-medium">执行指令与对象</th>
                  <th className="px-4 py-3 font-medium">客户端 IP</th>
                  <th className="px-4 py-3 font-medium">时间戳</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 font-semibold text-rose-600">{log.id}</td>
                    <td className="px-4 py-3 font-sans text-slate-900 dark:text-white">{log.operator}</td>
                    <td className="px-4 py-3 font-sans">{log.action}</td>
                    <td className="px-4 py-3 text-slate-400">{log.ip}</td>
                    <td className="px-4 py-3">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
