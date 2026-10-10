import React, { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Receipt,
  Clock,
  History,
  FileCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';
import { PaymentOrder } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  orders: PaymentOrder[];
  onAddOrder: (order: PaymentOrder) => void;
  onUpdateOrder: (order: PaymentOrder) => void;
}

export const EPaymentSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  orders,
  onAddOrder,
  onUpdateOrder
}) => {
  // Navigation tabs for 10 features:
  // 46-47: channels, 48-50: payments (citizen biz fee, update fee, agent procurement),
  // 51: pending_orders, 52: receipts, 53: reconcile, 54: refunds, 55: callback
  const [activeTab, setActiveTab] = useState<'pay_desk' | 'pending' | 'receipts' | 'reconcile' | 'refunds' | 'callback'>(
    activeFeatureId && (activeFeatureId === 46 || activeFeatureId === 47 || activeFeatureId === 48 || activeFeatureId === 49 || activeFeatureId === 50) ? 'pay_desk' :
    activeFeatureId === 51 ? 'pending' :
    activeFeatureId === 52 ? 'receipts' :
    activeFeatureId === 53 ? 'reconcile' :
    activeFeatureId === 54 ? 'refunds' :
    activeFeatureId === 55 ? 'callback' : 'pay_desk'
  );

  // Pay Desk Form State
  const [payOrderType, setPayOrderType] = useState<
    '配给业务申请费' | '家庭信息更新费' | '代理在线采购配给'
  >('配给业务申请费');
  const [payChannel, setPayChannel] = useState<'电子支付卡 (Qi Card)' | '电子钱包 (ZainCash)'>('电子支付卡 (Qi Card)');
  const [payAmount, setPayAmount] = useState<number>(2000);
  const [payingStatus, setPayingStatus] = useState<string | null>(null);

  // Selected Order for Receipt View
  const [receiptOrder, setReceiptOrder] = useState<PaymentOrder | null>(orders[0] || null);

  // Reconciliation Discrepancy Filter
  const [reconcileDiffFound, setReconcileDiffFound] = useState(false);

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPayingStatus('银行清算路由连接中 (中央清算所网关)...');
    setTimeout(() => {
      const newOrder: PaymentOrder = {
        id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        orderType: payOrderType,
        amount: payAmount,
        payerType: payOrderType === '代理在线采购配给' ? '配给代理' : '公民',
        payerName: payOrderType === '代理在线采购配给' ? '卡拉达第一配给中心' : '艾哈迈德·哈桑',
        payerId: payOrderType === '代理在线采购配给' ? 'AGT-001' : 'RC-10029381',
        status: '已完成',
        paymentChannel: payChannel,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        paidAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        receiptNumber: `REC-IQD-2026-${Math.floor(1000000 + Math.random() * 9000000)}`
      };
      onAddOrder(newOrder);
      setReceiptOrder(newOrder);
      setPayingStatus(`✓ 支付成功！金额 ${payAmount.toLocaleString()} IQD 已结算。收据号：${newOrder.receiptNumber}，支付结果已秒级回传业务服务！`);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Navigation Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('pay_desk')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pay_desk' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CreditCard className="w-4 h-4" /> 支付收银台 (46-50)
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Clock className="w-4 h-4" /> 51. 待支付订单
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'receipts' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Receipt className="w-4 h-4" /> 52. 交易记录与电子收据
          </button>
          <button
            onClick={() => setActiveTab('reconcile')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'reconcile' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileCheck className="w-4 h-4" /> 53. 财务对账与核查
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'refunds' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <RotateCcw className="w-4 h-4" /> 54. 失败原路退回
          </button>
          <button
            onClick={() => setActiveTab('callback')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'callback' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ExternalLink className="w-4 h-4" /> 55. 支付结果事件回传
          </button>
        </div>
      </div>

      {/* Module 1: Pay Desk (Features 46 - 50) */}
      {activeTab === 'pay_desk' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 46 ~ 50：电子支付渠道收银台 (电子卡/钱包/公民规费/代理采购款)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              支持国家电子支付卡 (Qi Card) 与数字钱包 (ZainCash) 在线结算；覆盖配给业务申请费 (2,000 IQD)、信息更新费及代销网点批量进货款。
            </p>
          </div>

          <form onSubmit={handleMakePayment} className="max-w-2xl space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">支付业务类型</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPayOrderType('配给业务申请费');
                    setPayAmount(2000);
                  }}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    payOrderType === '配给业务申请费'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold">功能点 48: 业务申请费</div>
                  <div className="text-slate-500 mt-0.5">公民分户/加人 (2,000 IQD)</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayOrderType('家庭信息更新费');
                    setPayAmount(1000);
                  }}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    payOrderType === '家庭信息更新费'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold">功能点 49: 信息更新费</div>
                  <div className="text-slate-500 mt-0.5">地址/更正 (1,000 IQD)</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPayOrderType('代理在线采购配给');
                    setPayAmount(14500000);
                  }}
                  className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                    payOrderType === '代理在线采购配给'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold">功能点 50: 代理批量进货</div>
                  <div className="text-slate-500 mt-0.5">整车粮油订购款 (大额)</div>
                </button>
              </div>
            </div>

            {/* Channels (Features 46 & 47) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">选择支付渠道</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayChannel('电子支付卡 (Qi Card)')}
                  className={`p-3 rounded-lg border text-left text-xs flex items-center gap-3 ${
                    payChannel === '电子支付卡 (Qi Card)'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-600" />
                  <div>
                    <div className="font-semibold">功能点 46: 电子支付卡 (Qi Card)</div>
                    <div className="text-slate-500">国家官方万事达/银联借记卡</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPayChannel('电子钱包 (ZainCash)')}
                  className={`p-3 rounded-lg border text-left text-xs flex items-center gap-3 ${
                    payChannel === '电子钱包 (ZainCash)'
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-800 dark:text-cyan-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-semibold">功能点 47: 电子钱包 (ZainCash)</div>
                    <div className="text-slate-500">手机号码直连扫码扣款</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500">应付总金额 (Total Amount)</span>
                <div className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {payAmount.toLocaleString()} IQD
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>立即在线安全支付</span>
              </button>
            </div>

            {payingStatus && (
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 rounded text-xs text-cyan-800 dark:text-cyan-300">
                {payingStatus}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Feature 51: Pending Orders */}
      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 51：待支付订单全生命周期 (超时自动关闭与提醒)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              申请生成待支付订单后，系统启动 30 分钟支付倒计时窗口；逾期未支付将自动关闭订单并释放锁定的业务名额。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium">订单编号</th>
                  <th className="px-4 py-3 font-medium">业务类型</th>
                  <th className="px-4 py-3 font-medium">交费人</th>
                  <th className="px-4 py-3 font-medium">金额 (IQD)</th>
                  <th className="px-4 py-3 font-medium">创建时间</th>
                  <th className="px-4 py-3 font-medium">订单状态</th>
                  <th className="px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-semibold text-cyan-600">{o.id}</td>
                    <td className="px-4 py-3">{o.orderType}</td>
                    <td className="px-4 py-3">{o.payerName}</td>
                    <td className="px-4 py-3 font-mono font-bold">{o.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono">{o.createdAt}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${
                        o.status === '已完成' ? 'bg-emerald-500/10 text-emerald-500' :
                        o.status === '待支付' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.status === '待支付' ? (
                        <button
                          onClick={() => {
                            const updated = { ...o, status: '已完成' as const, paidAt: new Date().toISOString() };
                            onUpdateOrder(updated);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded"
                        >
                          立即结清
                        </button>
                      ) : (
                        <span className="text-slate-400">已归档</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature 52: Electronic Receipts */}
      {activeTab === 'receipts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                功能点 52：历史交易记录查询 与 官方电子收据开具
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                在线查看全量历史结算单，并生成具备财政部电子签章的防伪电子收据 (PDF/打印)。
              </p>
            </div>
            {receiptOrder && (
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>打印收据凭证</span>
              </button>
            )}
          </div>

          {receiptOrder ? (
            <div className="max-w-xl mx-auto bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                  REPUBLIC OF IRAQ · MINISTRY OF TRADE
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  伊拉克贸易部食品配给署 · 官方电子收费收据
                </div>
                <div className="font-mono text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                  收据编号: {receiptOrder.receiptNumber || 'REC-IQD-2026-0091823'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 font-sans">付款人：</span>
                  <div className="text-slate-900 dark:text-white font-semibold font-sans">{receiptOrder.payerName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">绑定配给账号：</span>
                  <div className="text-slate-900 dark:text-white font-semibold">{receiptOrder.payerId}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">收款项目：</span>
                  <div className="text-slate-900 dark:text-white font-sans">{receiptOrder.orderType}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">结算渠道：</span>
                  <div className="text-slate-900 dark:text-white font-sans">{receiptOrder.paymentChannel || 'Qi Card'}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">支付时间：</span>
                  <div className="text-slate-900 dark:text-white">{receiptOrder.paidAt || receiptOrder.createdAt}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-sans">结算状态：</span>
                  <div className="text-emerald-600 font-bold font-sans">财政已清算到账</div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">实付总额：</span>
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {receiptOrder.amount.toLocaleString()} IQD
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">暂无选定收据，请先在收银台完成一笔缴费。</p>
          )}
        </div>
      )}

      {/* Feature 53 & 54 & 55: Reconcile, Refund, Callback */}
      {(activeTab === 'reconcile' || activeTab === 'refunds' || activeTab === 'callback') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 53 ~ 55：支付对账平账、原路退款与业务事件驱动回传
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              自动比对清算通道对账单；扣款失败或超时自动原路退回电子卡；支付完成实时触发业务受理回调。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 53 Reconcile */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 53：中央清算所周期对账
              </span>
              <div className="space-y-1 text-slate-500 font-mono">
                <div>系统交易总数: 4 笔</div>
                <div>清算所入账: 14,754,000 IQD</div>
                <div>差异单数: <span className="text-emerald-500 font-bold">0 笔 (100% 自动平账)</span></div>
              </div>
              <button
                onClick={() => setReconcileDiffFound(!reconcileDiffFound)}
                className="w-full mt-2 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded font-medium text-slate-800 dark:text-slate-200"
              >
                {reconcileDiffFound ? '恢复平账状态' : '模拟注入对账差异单'}
              </button>
              {reconcileDiffFound && (
                <div className="p-2 bg-rose-50 text-rose-700 rounded text-[11px]">
                  ⚠️ 预警：发现1笔5000 IQD离线滞后单，已转入贸易部财务在线人工核查队列。
                </div>
              )}
            </div>

            {/* 54 Refunds */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 54：失败 / 超时原路退款
              </span>
              <p className="text-slate-500">
                当银行扣款成功但业务受理发生前置驳回时，款项自动原路退回持卡人 Qi Card。
              </p>
              <div className="p-2 bg-white dark:bg-slate-900 border rounded font-mono">
                <div>退款记录: REF-2026-0812</div>
                <div>退回金额: 2,000 IQD</div>
                <div>状态: <span className="text-emerald-500 font-semibold">已原路到账</span></div>
              </div>
            </div>

            {/* 55 Callbacks */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 55：支付结果事件回传
              </span>
              <p className="text-slate-500">
                Webhook 异步消息机制，在支付完成后立即向业务服务 (RBS) 投递 `PAYMENT_CONFIRMED` 事件。
              </p>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded font-mono">
                <div>Event: PAYMENT_SUCCESS</div>
                <div>Payload: Order #ORD-2026-9001</div>
                <div>Status: Delivered 200 OK</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
