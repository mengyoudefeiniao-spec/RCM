import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  MessageSquare,
  FileCode2,
  ListFilter,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Eye,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  notifications: NotificationItem[];
  onAddNotification: (notif: NotificationItem) => void;
  onMarkRead: (id: string) => void;
}

export const NotificationSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  notifications,
  onAddNotification,
  onMarkRead
}) => {
  // Navigation tabs for 9 features:
  // 56-59: inbox / alerts (arrival, status, account, agent schedule)
  // 60-61: channels (sms gateway & in-app push)
  // 62: templates
  // 63: send_logs & receipts
  // 64: preferences
  const [activeTab, setActiveTab] = useState<'inbox' | 'channels' | 'templates' | 'logs' | 'preferences'>(
    activeFeatureId && (activeFeatureId >= 56 && activeFeatureId <= 59) ? 'inbox' :
    activeFeatureId && (activeFeatureId === 60 || activeFeatureId === 61) ? 'channels' :
    activeFeatureId === 62 ? 'templates' :
    activeFeatureId === 63 ? 'logs' :
    activeFeatureId === 64 ? 'preferences' : 'inbox'
  );

  // Quick Dispatch Simulator State
  const [testChannel, setTestChannel] = useState<'短信通道' | '应用内通知' | '双通道'>('双通道');
  const [testRecipientRole, setTestRecipientRole] = useState<'公民' | '配给代理' | '管理员'>('公民');
  const [testTitle, setTestTitle] = useState('【配给到货】2026年10月配额已送达');
  const [testContent, setTestContent] = useState('尊敬的艾哈迈德先生：您的配给面粉45公斤与长粒大米已就绪，请凭电子卡领取。');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Template State (Feature 62)
  const [selectedTemplateEvent, setSelectedTemplateEvent] = useState('配给物资到货提醒');
  const [templateLang, setTemplateLang] = useState<'zh' | 'ar'>('zh');

  // Preferences (Feature 64)
  const [prefSmsEnabled, setPrefSmsEnabled] = useState(true);
  const [prefPushEnabled, setPrefPushEnabled] = useState(true);
  const [prefArrivalAlert, setPrefArrivalAlert] = useState(true);
  const [prefAuditAlert, setPrefAuditAlert] = useState(true);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      recipientRole: testRecipientRole,
      channel: testChannel,
      title: testTitle,
      content: testContent,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: '已送达',
      isRead: false
    };
    onAddNotification(newNotif);
    setDispatchedSuccess(true);
    setTimeout(() => setDispatchedSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inbox' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bell className="w-4 h-4" /> 消息中心 (56-59)
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'channels' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Smartphone className="w-4 h-4" /> 60-61. 短信与推送通道
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'templates' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileCode2 className="w-4 h-4" /> 62. 通知模板配置
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'logs' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ListFilter className="w-4 h-4" /> 63. 发送记录与回执
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'preferences' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders className="w-4 h-4" /> 64. 订阅偏好设置
          </button>
        </div>
      </div>

      {/* Module 1: Inbox (Features 56-59) */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                功能点 56 ~ 59：公民与代理消息通知中心 (到货排期 / 申请审批 / 卡号下发 / 领料通知)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                推送食品配给到货日期和数量、申请状态实时变更、账户开通卡号密码短信，及面向代销商的调拨排期指令。
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => onMarkRead(notif.id)}
                className={`p-4 rounded-xl border text-xs transition-colors cursor-pointer space-y-2 ${
                  notif.isRead
                    ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                    : 'bg-violet-50/40 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {notif.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {notif.channel}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      接收角色: {notif.recipientRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono">
                    <span>{notif.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded font-sans text-[11px] ${
                      notif.isRead ? 'text-slate-400' : 'text-violet-600 dark:text-violet-400 font-bold'
                    }`}>
                      {notif.isRead ? '已读' : '● 未读'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {notif.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module 2: Channels (Features 60 & 61) */}
      {activeTab === 'channels' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 60 & 61：短信通道 (SMS Gateway) 与 应用内推送通道 (Push Service)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              测试面向移动通信运营商 (Asiacell, Zain, Korek) 的下行短信通道与全平台 WebSocket / FCM 应用内推送信道。
            </p>
          </div>

          <form onSubmit={handleDispatch} className="max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">下发通道</label>
                <select
                  value={testChannel}
                  onChange={e => setTestChannel(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="短信通道">功能点 60: 短信通道 (SMS Gateway)</option>
                  <option value="应用内通知">功能点 61: 应用内通知 (App Push)</option>
                  <option value="双通道">双通道冗余下发 (SMS + App Push)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">接收受众角色</label>
                <select
                  value={testRecipientRole}
                  onChange={e => setTestRecipientRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="公民">公民 (家庭户主/成员)</option>
                  <option value="配给代理">配给代理代销商</option>
                  <option value="管理员">贸易部管理员工</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">消息标题</label>
              <input
                type="text"
                value={testTitle}
                onChange={e => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">消息正文</label>
              <textarea
                rows={3}
                value={testContent}
                onChange={e => setTestContent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>立即通过选定通道下发通知</span>
            </button>

            {dispatchedSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                ✓ 消息发送成功！运营商回执状态：200 Delivered，消息已收录至用户收件箱。
              </div>
            )}
          </form>
        </div>
      )}

      {/* Module 3: Templates (Feature 62) */}
      {activeTab === 'templates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 62：通知模板配置 (变量填充与多语言阿拉伯语支持)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按业务事件与接收角色维护模板文案，支持动态变量 (`{"{{name}}"}`) 与阿拉伯语 / 中文双语扩展。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">预设业务事件模板库：</span>
              <div className="space-y-2">
                {[
                  '配给物资到货提醒',
                  '业务审批结果通知',
                  '新开户卡密下发',
                  '代销网点领料排期',
                  '资格冻结预警通知'
                ].map(tmpl => (
                  <button
                    key={tmpl}
                    onClick={() => setSelectedTemplateEvent(tmpl)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                      selectedTemplateEvent === tmpl
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{tmpl}</div>
                    <div className="text-slate-500 mt-0.5">事件代码: EVT-NOTIF-{tmpl.slice(0, 4)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">模板定义工作区：</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTemplateLang('zh')}
                    className={`px-2.5 py-1 text-xs rounded ${templateLang === 'zh' ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    中文版本
                  </button>
                  <button
                    onClick={() => setTemplateLang('ar')}
                    className={`px-2.5 py-1 text-xs rounded ${templateLang === 'ar' ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    العربية (阿拉伯语)
                  </button>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="text-slate-500">可用宏变量：`{"{{head_name}}"}` `{"{{card_no}}"}` `{"{{agent_name}}"}` `{"{{quota_summary}}"}`</div>
                <textarea
                  rows={4}
                  readOnly
                  value={
                    templateLang === 'zh'
                      ? `【伊拉克配给署】尊敬的 {{head_name}}：您所属的电子配给卡 ({{card_no}}) 本月物资已运抵 {{agent_name}}。请于 {{deadline}} 前前往领取。`
                      : `عزيزي المواطن {{head_name}}، نود إعلامكم بوصول الحصة التموينية للبطاقة رقم {{card_no}} لدى وكيلكم {{agent_name}}. يرجى المراجعة للاستلام.`
                  }
                  className="w-full p-3 bg-white dark:bg-slate-900 border rounded-lg"
                />
              </div>

              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ 模板签名校验有效，支持多运营商字符集 UTF-8 / GSM-7 自动转码。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Send Logs & Receipts (Feature 63) */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 63：通知发送记录与全生命周期回执 (失败自动重发与告警)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              全量记录短信与推送已发送、已送达、已读状态；遇到运营商超时未响应时触发指数退避自动重发。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">流水号</th>
                  <th className="px-4 py-3 font-medium">接收目标</th>
                  <th className="px-4 py-3 font-medium font-sans">通道</th>
                  <th className="px-4 py-3 font-medium font-sans">摘要</th>
                  <th className="px-4 py-3 font-medium">送达回执</th>
                  <th className="px-4 py-3 font-medium font-sans">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="px-4 py-3 font-semibold text-violet-600">SMS-2026-8801</td>
                  <td className="px-4 py-3">+964 770 123 4567</td>
                  <td className="px-4 py-3 font-sans">Asiacell 4G网关</td>
                  <td className="px-4 py-3 font-sans">新开户卡密下发</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">DELIVRD (0.8s)</td>
                  <td className="px-4 py-3 font-sans text-emerald-600">已送达</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-violet-600">PUSH-2026-8802</td>
                  <td className="px-4 py-3">UID-AGT-001 (代理端)</td>
                  <td className="px-4 py-3 font-sans">App FCM Socket</td>
                  <td className="px-4 py-3 font-sans">10月中央仓调拨排期</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">READ_ACK (14:18)</td>
                  <td className="px-4 py-3 font-sans text-emerald-600">已读</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-violet-600">SMS-2026-8803</td>
                  <td className="px-4 py-3">+964 780 987 6543</td>
                  <td className="px-4 py-3 font-sans">Zain IQ 网关</td>
                  <td className="px-4 py-3 font-sans">高收入冻结告知函</td>
                  <td className="px-4 py-3 text-emerald-600 font-bold">DELIVRD (1.2s)</td>
                  <td className="px-4 py-3 font-sans text-emerald-600">已送达</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module 5: Preferences (Feature 64) */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 64：订阅偏好与消息静音设置
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              用户可按通信渠道 (短信/应用内推送) 及业务类型自定义接收偏好，确保重要通知不漏收的同时杜绝扰民。
            </p>
          </div>

          <div className="max-w-xl space-y-4">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">短信通道提醒 (SMS)</div>
                  <div className="text-[11px] text-slate-500">接收关键配额与重要账户变动短信</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefSmsEnabled}
                  onChange={e => setPrefSmsEnabled(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">移动应用内推送 (App Push)</div>
                  <div className="text-[11px] text-slate-500">即时接收到货排期与审批进度变动提示</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefPushEnabled}
                  onChange={e => setPrefPushEnabled(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">食品配给到货与领取提醒</div>
                  <div className="text-[11px] text-slate-500">当下属代销点粮油入库就绪时第一时间告知</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefArrivalAlert}
                  onChange={e => setPrefArrivalAlert(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">业务申请审核流转进度</div>
                  <div className="text-[11px] text-slate-500">初审签署、终审批准或驳回通知</div>
                </div>
                <input
                  type="checkbox"
                  checked={prefAuditAlert}
                  onChange={e => setPrefAuditAlert(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
              </label>
            </div>

            <button
              onClick={() => alert('通知偏好已更新并同步到个人档案！')}
              className="px-5 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
            >
              保存消息订阅偏好
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
