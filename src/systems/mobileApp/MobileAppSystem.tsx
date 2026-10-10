import React, { useState } from 'react';
import {
  Smartphone,
  User,
  Store,
  ShieldAlert,
  Fingerprint,
  Bell,
  Settings,
  HelpCircle,
  Headphones,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  QrCode,
  ShoppingCart,
  FileCheck2,
  TrendingUp,
  MessageCircleQuestion,
  GraduationCap,
  ChevronRight,
  Send,
  Check,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { FamilyRecord, AgentRecord, RationApplication } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  familyData: FamilyRecord[];
  agentData: AgentRecord[];
  applications: RationApplication[];
}

export const MobileAppSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  familyData,
  agentData,
  applications
}) => {
  // Mobile role: Citizen, Agent, or Admin (Feature 93)
  const [mobileRole, setMobileRole] = useState<'citizen' | 'agent' | 'admin'>(
    activeFeatureId && activeFeatureId >= 103 && activeFeatureId <= 104 ? 'agent' :
    activeFeatureId && (activeFeatureId === 105 || activeFeatureId === 106 || activeFeatureId === 108) ? 'admin' :
    'citizen'
  );

  // Active view inside mobile
  const [mobileSubView, setMobileSubView] = useState<string>(
    activeFeatureId === 94 ? 'auth_security' :
    activeFeatureId === 95 ? 'messages' :
    activeFeatureId === 96 ? 'profile' :
    activeFeatureId === 97 ? 'help' :
    activeFeatureId === 98 ? 'live_service' :
    activeFeatureId === 99 ? 'services' :
    activeFeatureId === 100 ? 'quota' :
    activeFeatureId === 101 ? 'bills' :
    activeFeatureId === 102 ? 'appeals' :
    activeFeatureId === 103 ? 'agent_scan' :
    activeFeatureId === 104 ? 'agent_buy' :
    activeFeatureId === 105 ? 'admin_review' :
    activeFeatureId === 106 ? 'admin_kpi' :
    activeFeatureId === 107 ? 'feedback' :
    activeFeatureId === 108 ? 'training' :
    mobileRole === 'citizen' ? 'services' : mobileRole === 'agent' ? 'agent_scan' : 'admin_review'
  );

  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [deviceFrameMode, setDeviceFrameMode] = useState(true);
  const [liveChatMsg, setLiveChatMsg] = useState('');
  const [liveChatHistory, setLiveChatHistory] = useState([
    { sender: 'agent', text: '您好！欢迎接入伊拉克贸易部食品配给 7×24 小时人工专席，请问有什么可以协助您？' }
  ]);

  const currentFamily = familyData[0];
  const currentAgent = agentData[0];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveChatMsg.trim()) return;
    const userMsg = liveChatMsg;
    setLiveChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLiveChatMsg('');
    setTimeout(() => {
      setLiveChatHistory(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `感谢您的咨询！客服坐席工号 #8019 已登记您的问题（配给卡：${currentFamily.rationCardNo}），正在核查代销点调拨排期记录。`
        }
      ]);
    }, 1000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">终端角色模式：</span>
          <div className="flex bg-slate-800 p-0.5 sm:p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => {
                setMobileRole('citizen');
                setMobileSubView('services');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                mobileRole === 'citizen' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              公民端
            </button>
            <button
              onClick={() => {
                setMobileRole('agent');
                setMobileSubView('agent_scan');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                mobileRole === 'agent' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              代理端
            </button>
            <button
              onClick={() => {
                setMobileRole('admin');
                setMobileSubView('admin_review');
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                mobileRole === 'admin' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              管理端
            </button>
          </div>
        </div>

        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 cursor-pointer self-start sm:self-auto"
        >
          {deviceFrameMode ? '展开全屏模式' : '手机模拟器模式'}
        </button>
      </div>

      {/* Main Container: Mobile Frame vs Wide view */}
      <div className={`mx-auto w-full ${deviceFrameMode ? 'max-w-md' : 'w-full'}`}>
        <div className="bg-slate-900 border-2 sm:border-4 border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[580px] sm:min-h-[640px]">
          {/* Smartphone Status Bar */}
          <div className="px-5 py-2.5 bg-slate-950 text-white flex justify-between items-center text-[11px] font-mono select-none">
            <span>09:41 · Asiacell 5G</span>
            <div className="flex items-center gap-1.5">
              <span>●●● 88%</span>
            </div>
          </div>

          {/* App Top Brand Header inside Mobile */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center text-white font-bold text-xs">
                R
              </div>
              <span className="font-bold text-sm tracking-tight">
                {mobileRole === 'citizen' ? '数字配给卡 · 公民服务' :
                 mobileRole === 'agent' ? '数字配给卡 · 代销作业端' : '数字配给卡 · 移动管理端'}
              </span>
            </div>
            <button
              onClick={() => setMobileSubView('messages')}
              className="relative p-1.5 text-slate-400 hover:text-white"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>
          </div>

          {/* Mobile Screen Body Viewport */}
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto space-y-4 text-slate-900 dark:text-slate-100">
            {/* Quick Banner for Role */}
            <div className="p-3 bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl text-white space-y-1">
              <div className="text-[11px] opacity-80">当前登录角色 / 身份凭据</div>
              <div className="font-bold text-sm">
                {mobileRole === 'citizen' ? currentFamily.headName :
                 mobileRole === 'agent' ? currentAgent.name : '审核主管 (规划与跟进司)'}
              </div>
              <div className="text-[11px] font-mono opacity-90">
                {mobileRole === 'citizen' ? `配给卡: ${currentFamily.rationCardNo}` :
                 mobileRole === 'agent' ? `网点编号: ${currentAgent.id}` : '工号: STF-03 (哈希姆·经理)'}
              </div>
            </div>

            {/* View 1: Citizen Services (Feature 99) */}
            {mobileRole === 'citizen' && mobileSubView === 'services' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-500 block">功能点 99：业务办理大厅入口</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-xs">添加新成员</div>
                    <p className="text-[10px] text-slate-500">新生儿凭出生证自动直批</p>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-xs">家庭独立分户</div>
                    <p className="text-[10px] text-slate-500">夫妻双方年满14周岁</p>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-xs">户主顺位变更</div>
                    <p className="text-[10px] text-slate-500">自动推荐直系亲属入选</p>
                  </div>
                  <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="font-semibold text-xs">解冻申诉直通车</div>
                    <p className="text-[10px] text-slate-500">上传劳动部薪资单</p>
                  </div>
                </div>

                {/* Feature 100 Quota Preview */}
                <span className="text-xs font-semibold text-slate-500 block pt-2">功能点 100：配额到货与明细</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">2026年10月份第四批配额</span>
                    <span className="text-emerald-500 font-bold">已运抵网点</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1 font-mono">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">面粉 45kg</div>
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">大米 15kg</div>
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">白糖 10kg</div>
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded">油 5L</div>
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Agent Operations (Feature 103 & 104) */}
            {mobileRole === 'agent' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-500 block">功能点 103：移动端扫码发粮作业</span>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <QrCode className="w-12 h-12 mx-auto text-amber-500" />
                  <div className="text-xs font-medium">使用手机摄像头快速读取公民配给卡</div>
                  <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium">
                    开启摄像头扫描
                  </button>
                </div>

                <span className="text-xs font-semibold text-slate-500 block pt-2">功能点 104：代销网点在线粮油进货</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>中央仓订货批次：</span>
                    <span className="font-mono font-bold">BATCH-2026-W092</span>
                  </div>
                  <div className="flex justify-between">
                    <span>采购规模：</span>
                    <span className="font-bold text-amber-600">28.5 吨 (小麦粉/大米)</span>
                  </div>
                  <button className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-medium">
                    在线下单并电子支付采购款
                  </button>
                </div>
              </div>
            )}

            {/* View 3: Admin Mobile Review (Feature 105 & 106) */}
            {mobileRole === 'admin' && (
              <div className="space-y-4">
                <span className="text-xs font-semibold text-slate-500 block">功能点 105：移动端待办一键审批</span>
                <div className="space-y-2">
                  {applications.slice(0, 2).map(app => (
                    <div key={app.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border text-xs space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>{app.type}</span>
                        <span className="text-blue-500">{app.status}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">申请人: {app.applicantName}</div>
                      <div className="flex gap-2 pt-1">
                        <button className="flex-1 py-1.5 bg-emerald-600 text-white rounded font-medium text-[11px]">
                          终审核准
                        </button>
                        <button className="flex-1 py-1.5 bg-amber-600 text-white rounded font-medium text-[11px]">
                          退回补正
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <span className="text-xs font-semibold text-slate-500 block pt-2">功能点 106：全区数据速览大盘</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border">
                    <span className="text-slate-400 font-sans text-[10px]">今日办结率</span>
                    <div className="text-base font-bold text-emerald-600 mt-1">98.4%</div>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border">
                    <span className="text-slate-400 font-sans text-[10px]">冻结风控阻断</span>
                    <div className="text-base font-bold text-rose-500 mt-1">14 起</div>
                  </div>
                </div>
              </div>
            )}

            {/* View 4: Live Service 7x24 (Feature 98) */}
            {mobileSubView === 'live_service' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 block">功能点 98：7×24 在线专席客服</span>
                <div className="h-64 bg-white dark:bg-slate-900 rounded-xl border p-3 overflow-y-auto space-y-2 text-xs">
                  {liveChatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-2.5 rounded-xl max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={liveChatMsg}
                    onChange={e => setLiveChatMsg(e.target.value)}
                    placeholder="请输入咨询问题..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border rounded-lg"
                  />
                  <button type="submit" className="p-2 bg-sky-600 text-white rounded-lg">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* View 5: Training Academy (Feature 108) */}
            {mobileSubView === 'training' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 block">功能点 108：员工与操作人员培训学院</span>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">《配给卡数字化终端标准操作规程 (SOP)》</div>
                    <div className="text-[11px] text-slate-500">包含自动读卡、1500户红线判断、离线应急登记标准</div>
                    <button className="mt-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-sky-600 rounded text-[11px] font-medium">
                      开始在线学习
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border space-y-1">
                    <div className="font-semibold text-slate-900 dark:text-white">《反冒领风控稽查与死亡注销指引》</div>
                    <div className="text-[11px] text-slate-500">贸易部监察司官方必修培训材料</div>
                    <button className="mt-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-sky-600 rounded text-[11px] font-medium">
                      开始在线学习
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View 6: Feedback (Feature 107) */}
            {mobileSubView === 'feedback' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500 block">功能点 107：应用使用反馈与建议收集</span>
                <textarea
                  rows={3}
                  placeholder="请输入您的意见或遇到的系统故障，我们将持续改进..."
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl"
                />
                <button
                  onClick={() => alert('感谢您的反馈！运营团队已收到工单。')}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-medium"
                >
                  提交使用反馈
                </button>
              </div>
            )}
          </div>

          {/* Smartphone Bottom Tab Bar */}
          <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <button
              onClick={() => setMobileSubView(mobileRole === 'citizen' ? 'services' : mobileRole === 'agent' ? 'agent_scan' : 'admin_review')}
              className={`flex flex-col items-center gap-1 ${mobileSubView === 'services' || mobileSubView === 'agent_scan' || mobileSubView === 'admin_review' ? 'text-sky-500 font-bold' : ''}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>主页</span>
            </button>
            <button
              onClick={() => setMobileSubView('live_service')}
              className={`flex flex-col items-center gap-1 ${mobileSubView === 'live_service' ? 'text-sky-500 font-bold' : ''}`}
            >
              <Headphones className="w-4 h-4" />
              <span>7x24客服</span>
            </button>
            <button
              onClick={() => setMobileSubView('training')}
              className={`flex flex-col items-center gap-1 ${mobileSubView === 'training' ? 'text-sky-500 font-bold' : ''}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>培训</span>
            </button>
            <button
              onClick={() => setMobileSubView('feedback')}
              className={`flex flex-col items-center gap-1 ${mobileSubView === 'feedback' ? 'text-sky-500 font-bold' : ''}`}
            >
              <MessageCircleQuestion className="w-4 h-4" />
              <span>反馈</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
