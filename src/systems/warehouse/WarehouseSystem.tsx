import React, { useState } from 'react';
import {
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  Truck,
  Repeat,
  ClipboardCheck,
  AlertOctagon,
  BookOpen,
  BarChart3,
  Boxes,
  Compass,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { WarehouseStockItem, WarehouseFlowOrder } from '../../types';

interface Props {
  standalone?: boolean;
  activeFeatureId?: number;
  stocks: WarehouseStockItem[];
  flows: WarehouseFlowOrder[];
  onAddStock: (item: WarehouseStockItem) => void;
  onAddFlow: (flow: WarehouseFlowOrder) => void;
}

export const WarehouseSystem: React.FC<Props> = ({
  standalone = false,
  activeFeatureId,
  stocks,
  flows,
  onAddStock,
  onAddFlow
}) => {
  // Navigation tabs for 12 features:
  // in_out: 71-74, transfer_stocktake: 75-77, inventory_ledger: 78-80, trace_auth: 81-82
  const [activeTab, setActiveTab] = useState<'in_out' | 'transfer_stocktake' | 'inventory_ledger' | 'trace_auth'>(
    activeFeatureId && (activeFeatureId >= 71 && activeFeatureId <= 74) ? 'in_out' :
    activeFeatureId && (activeFeatureId >= 75 && activeFeatureId <= 77) ? 'transfer_stocktake' :
    activeFeatureId && (activeFeatureId >= 78 && activeFeatureId <= 80) ? 'inventory_ledger' :
    activeFeatureId && (activeFeatureId >= 81 && activeFeatureId <= 82) ? 'trace_auth' : 'in_out'
  );

  // Inbound Form State (Feature 71 & 72)
  const [inboundCommodity, setInboundCommodity] = useState<'精制小麦粉' | '长粒大米' | '食用白砂糖' | '精炼葵花籽油'>('精制小麦粉');
  const [inboundWarehouse, setInboundWarehouse] = useState('中央粮食第一战略储备库 (巴格达北)');
  const [inboundBatch, setInboundBatch] = useState('BATCH-2026-W092');
  const [inboundTons, setInboundTons] = useState(300);
  const [inboundMsg, setInboundMsg] = useState<string | null>(null);

  // Outbound & Delivery Sync (Feature 73 & 74)
  const [outboundTargetAgent, setOutboundTargetAgent] = useState('卡拉达第一配给分销中心 (AGT-001)');
  const [outboundTons, setOutboundTons] = useState(25.0);
  const [deliverySignMismatch, setDeliverySignMismatch] = useState(false);

  // Stocktake & Damage (Feature 76 & 77)
  const [stocktakeVarianceKg, setStocktakeVarianceKg] = useState(-120); // 120kg loss
  const [damageReportSubmitted, setDamageReportSubmitted] = useState(false);

  // Trace Query (Feature 81)
  const [traceInputBatch, setTraceInputBatch] = useState('BATCH-2026-W091');
  const [traceResult, setTraceResult] = useState(true);

  const handleInboundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStock: WarehouseStockItem = {
      id: `STK-${Date.now()}`,
      skuCode: `SKU-${inboundCommodity.slice(0, 3)}-2026`,
      commodityName: inboundCommodity,
      warehouseName: inboundWarehouse,
      batchNumber: inboundBatch,
      quantityTons: inboundTons,
      allocatedTons: 0,
      availableTons: inboundTons,
      productionDate: '2026-09-15',
      expiryDate: '2027-09-14',
      status: '正常在库'
    };
    onAddStock(newStock);

    const newFlow: WarehouseFlowOrder = {
      id: `FLOW-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: '采购验收入库',
      fromLocation: '国家进出口战略物资局',
      toLocation: inboundWarehouse,
      commodityName: inboundCommodity,
      batchNumber: inboundBatch,
      quantityTons: inboundTons,
      carrier: '粮食运输专列',
      status: '已完成',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    onAddFlow(newFlow);

    setInboundMsg(`✓ 验收成功！${inboundCommodity} ${inboundTons} 吨已正式入库并生成防伪批次条码 (批次: ${inboundBatch})。`);
    setTimeout(() => setInboundMsg(null), 4000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Tabs - Mobile Scrollable */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth pb-1">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 w-max sm:w-auto sm:flex-wrap">
          <button
            onClick={() => setActiveTab('in_out')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'in_out' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ArrowDownToLine className="w-4 h-4" /> 出入库流转 (71-74)
          </button>
          <button
            onClick={() => setActiveTab('transfer_stocktake')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'transfer_stocktake' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Repeat className="w-4 h-4" /> 调拨与盘点报损 (75-77)
          </button>
          <button
            onClick={() => setActiveTab('inventory_ledger')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'inventory_ledger' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Boxes className="w-4 h-4" /> 进销存台账与多维库存 (78-80)
          </button>
          <button
            onClick={() => setActiveTab('trace_auth')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'trace_auth' ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs font-semibold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" /> 全链条追溯与分级授权 (81-82)
          </button>
        </div>
      </div>

      {/* Module 1: In & Out Operations (Features 71-74) */}
      {activeTab === 'in_out' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 71 ~ 74：采购收货入库批次登记 与 配送签收联动预警
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按到库收货单严格验收品项、数量、生产日期与质检批次号；配送至代销商时将出库流水与代理实签数量实时交叉核对，若短缺即时告警。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 71 & 72: Inbound */}
            <form onSubmit={handleInboundSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 71 & 72：采购收货入库登记 (生成入库溯源流水)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">物资品类</label>
                  <select
                    value={inboundCommodity}
                    onChange={e => setInboundCommodity(e.target.value as any)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded"
                  >
                    <option value="精制小麦粉">精制小麦粉</option>
                    <option value="长粒大米">长粒大米</option>
                    <option value="食用白砂糖">食用白砂糖</option>
                    <option value="精炼葵花籽油">精炼葵花籽油</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">入库吨数 (Tons)</label>
                  <input
                    type="number"
                    value={inboundTons}
                    onChange={e => setInboundTons(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">入库批次编码</label>
                  <input
                    type="text"
                    value={inboundBatch}
                    onChange={e => setInboundBatch(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">接收目标仓库</label>
                  <input
                    type="text"
                    value={inboundWarehouse}
                    onChange={e => setInboundWarehouse(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                验收合格并签发出库流水单
              </button>

              {inboundMsg && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                  {inboundMsg}
                </div>
              )}
            </form>

            {/* Feature 73 & 74: Delivery Outbound and Sign Sync */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 73 & 74：配发代理配送出库与交付签收联动预警
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">配发接收代销网点：</label>
                  <input
                    type="text"
                    value={outboundTargetAgent}
                    onChange={e => setOutboundTargetAgent(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded"
                  />
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">配送装车数量 (吨)：</label>
                  <input
                    type="number"
                    value={outboundTons}
                    onChange={e => setOutboundTons(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white dark:bg-slate-900 border rounded font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setDeliverySignMismatch(!deliverySignMismatch)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded"
                  >
                    {deliverySignMismatch ? '取消签收差异模拟' : '模拟注入签收短缺异常 (实签少2吨)'}
                  </button>
                </div>

                {deliverySignMismatch ? (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded text-xs text-rose-800 dark:text-rose-300 space-y-1">
                    <div className="font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>功能点 74 触发差异预警！</span>
                    </div>
                    <div>出库计划: {outboundTons} 吨 ➔ 代理APP实签: {outboundTons - 2} 吨 (差异短少 2.0 吨)。已锁定在途责任链路，抄送商业监督司稽查！</div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300">
                    ✓ 交付流水与代理实签数据 100% 联动吻合，自动完成库存借贷平账。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: Transfers & Stocktake (Features 75-77) */}
      {activeTab === 'transfer_stocktake' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 75 ~ 77：仓间调拨单据化跟踪、定期盘点与损耗报损审批留痕
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              调拨单全程在途跟踪；定期盘点生成盘盈盘亏单；超出自然合理损耗上限时触发供应链主管与财务联审报损。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 75: Transfers */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-3 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 75：跨省战略储备库调拨跟踪 (在途中单据化)
              </span>
              <div className="p-3 bg-white dark:bg-slate-900 border rounded-lg space-y-1.5 font-mono">
                <div>调拨单号: TR-2026-9004</div>
                <div>调出仓库: 中央粮食第一战略储备库 (巴格达)</div>
                <div>调入仓库: 南部粮食分储库 (巴士拉港区)</div>
                <div>调运物资: 食用白砂糖 50.0 吨 (BATCH-2026-S102)</div>
                <div>运输状态: <span className="text-blue-600 font-bold">在途中 (GPS航迹: 纳西里耶路段)</span></div>
              </div>
            </div>

            {/* 76 & 77: Stocktake & Damage */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border space-y-3 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                功能点 76 & 77：季度盘点盈亏与损耗审批留痕
              </span>
              <div className="space-y-2">
                <div className="flex justify-between p-2.5 bg-white dark:bg-slate-900 rounded border">
                  <span>长粒大米盘点盈亏差异:</span>
                  <span className="font-mono font-bold text-rose-500">{stocktakeVarianceKg} kg (盘亏)</span>
                </div>
                <div className="text-slate-500">法定自然损耗容限: 0.05% 以内。</div>
                <button
                  onClick={() => setDamageReportSubmitted(true)}
                  className="w-full py-2 bg-slate-800 text-white rounded hover:bg-slate-900 font-medium"
                >
                  提交报损审批表至供应链主管
                </button>
                {damageReportSubmitted && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded">
                    ✓ 损耗审批单 DMG-2026-118 已留痕归档，核销原因：受潮自然挥发，主管已电子签批。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Inventory & Ledger (Features 78-80) */}
      {activeTab === 'inventory_ledger' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 78 ~ 80：进销存流水台账、流转明细报表与多维库存全景
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              按仓库、品类、批次多维度查询实时可用库存与锁定占用配额；支持多条件流转明细报表导出。
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium font-sans">品项物资</th>
                  <th className="px-4 py-3 font-medium font-sans">所在仓库</th>
                  <th className="px-4 py-3 font-medium">批次编号</th>
                  <th className="px-4 py-3 font-medium">在库总吨数</th>
                  <th className="px-4 py-3 font-medium">已配额占用</th>
                  <th className="px-4 py-3 font-medium">实际可用量</th>
                  <th className="px-4 py-3 font-medium">质保截至</th>
                  <th className="px-4 py-3 font-medium font-sans">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {stocks.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-white">{s.commodityName}</td>
                    <td className="px-4 py-3 font-sans">{s.warehouseName}</td>
                    <td className="px-4 py-3 text-teal-600 font-bold">{s.batchNumber}</td>
                    <td className="px-4 py-3 font-bold">{s.quantityTons} T</td>
                    <td className="px-4 py-3 text-slate-400">{s.allocatedTons} T</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{s.availableTons} T</td>
                    <td className="px-4 py-3">{s.expiryDate}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-600">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module 4: Traceability & Auth (Features 81-82) */}
      {activeTab === 'trace_auth' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              功能点 81 & 82：中央仓库至家庭全程联动追溯 与 分级权限管控
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              通过批次防伪编号打通【进口收货 ➔ 中央战略库 ➔ 省级分储库 ➔ 基层代理商 ➔ 公民家庭领用】全链路闭环，实现“每一袋面粉来源可查、去向可追”。
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={traceInputBatch}
                onChange={e => setTraceInputBatch(e.target.value)}
                placeholder="输入批次号或配给卡号溯源"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg font-mono"
              />
              <button
                onClick={() => setTraceResult(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-600 rounded-lg flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>一键溯源全生命周期</span>
              </button>
            </div>

            {traceResult && (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  批次溯源链条可视化：{traceInputBatch} (精制小麦粉 Grade 1)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-[10px] text-slate-400">环节 1: 国际采购验收</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-1">南欧采购船运批次</div>
                    <div className="font-mono text-slate-500 mt-1">2026-08-15 · 500吨</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-[10px] text-slate-400">环节 2: 中央战略储备</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-1">中央一库 (巴格达北)</div>
                    <div className="font-mono text-slate-500 mt-1">验收单: IN-8801</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-[10px] text-slate-400">环节 3: 城市冷链配送</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-1">特种粮运3号车</div>
                    <div className="font-mono text-slate-500 mt-1">出库单: OUT-8802</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border">
                    <span className="text-[10px] text-slate-400">环节 4: 代销网点签收</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-1">卡拉达第一配给中心</div>
                    <div className="font-mono text-slate-500 mt-1">实签: 28.5吨 (无短缺)</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-teal-500/50 bg-teal-50/20">
                    <span className="text-[10px] text-teal-600 font-semibold">环节 5: 家庭实名领用</span>
                    <div className="font-semibold text-slate-900 dark:text-white mt-1">艾哈迈德家庭 (RC-10029381)</div>
                    <div className="font-mono text-slate-500 mt-1">45kg 已核销领走</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
