<template>
  <el-drawer
    v-model="visible"
    title="代理管理流程优化：业务全景流转与约束引擎全貌"
    size="720px"
    direction="rtl"
    destroy-on-close
  >
    <div class="space-y-6 text-xs text-slate-700 pr-1">
      <!-- 顶部概述提示 -->
      <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <h3 class="font-bold text-sm text-blue-900">双层配额池与资金清算闭环体系</h3>
        </div>
        <p class="text-[12px] text-blue-800 leading-relaxed">
          系统划分为 <strong>G2B 集中批发补货链路</strong> 与 <strong>B2C 社区分时零售链路</strong>，构建自“贸易部国家中心仓 $\rightarrow$ 街道代理网点 $\rightarrow$ 辖区居民家庭”的端到端保供网络，执行 1500 户硬上限和分时并发原子容量锁。
        </p>
      </div>

      <!-- 阶段一与阶段二 时序流转对比卡片 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-blue-600 text-base"><Connection /></el-icon>
          <span>一、业务全景流转与时序设计</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- 阶段一 G2B -->
          <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-900 flex items-center gap-1.5">
                <el-tag size="small" type="primary" effect="dark">阶段一</el-tag>
                G2B 集中批发补货链路
              </span>
              <el-tag size="small" type="primary" effect="plain">街道代理 $\rightarrow$ 政府中心仓</el-tag>
            </div>
            <ol class="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
              <li>依据辖区 1500 户配额上限提交采购预约单 (选定自提/配送时段)</li>
              <li>中心校验代理资质、单中心物理归属与中心库存</li>
              <li>代理线上通过对公专户支付采购货款</li>
              <li>支付成功入专管账户，自动下发提货凭证与短信确认</li>
              <li>中心出库配送/自提核验，代理端库存与进货台账同步累加</li>
            </ol>
          </div>

          <!-- 阶段二 B2C -->
          <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-900 flex items-center gap-1.5">
                <el-tag size="small" type="success" effect="dark">阶段二</el-tag>
                B2C 社区分时零售链路
              </span>
              <el-tag size="small" type="success" effect="plain">辖区公民 $\rightarrow$ 街道代理</el-tag>
            </div>
            <ol class="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
              <li>公民浏览归属代理库存，选择提货时段提交补给购买预约</li>
              <li>校验家庭本期剩余额度（防超额）与时段并发容量 Capacity</li>
              <li>公民线上收银台支付自付费用</li>
              <li>下发取件码/动态防截屏二维码，并触发短信预约通知</li>
              <li>按预约时段到店出示取件码/读卡，代理核销发货并扣减现货</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- 核心业务规则与约束引擎 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-amber-600 text-base"><Lock /></el-icon>
          <span>二、核心业务规则与约束引擎设计</span>
        </h4>

        <div class="space-y-2.5">
          <!-- 规则 1 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">1. 代理网格与户数强管控（1500 户硬上限）</span>
              <el-tag size="small" type="danger" effect="plain">硬约束</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <strong>单中心绑定：</strong>每个街道代理物理上仅能隶属于一个配给中心，严禁跨中心调货与履约。<br />
              <strong>1500 户户籍硬上限：</strong>系统在居民绑定代理网格时进行校验，当前绑定户数达 1500 户即触发“网格饱和锁定”，禁止新户迁入，必须由区域经理分流设立新代理点。
            </p>
          </div>

          <!-- 规则 2 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">2. 双层分时段预约与并发控制池</span>
              <el-tag size="small" type="warning" effect="plain">并发配额池</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <strong>时段粒度与并发配额池：</strong>每天划分为固定时间窗口 (08:00-10:00, 10:00-12:00, 14:00-16:00, 16:00-18:00)，每个时段配置固定接待阈值 Capacity。采用预扣减机制实现分时段库存与号源锁定，超时 15 分钟未支付自动回滚释放。<br />
              <strong>家庭额度上限：</strong>SUM(已购数量 + 本次预约数量) $\le$ 周期家庭核定配额。<br />
              <strong>代理安全库存：</strong>在途与在库总和不得超过其绑定的 1500 户总额定配额的动态冗余系数（1.2 倍安全库存）。
            </p>
          </div>

          <!-- 规则 3 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">3. 资金结算与支付闭环</span>
              <el-tag size="small" type="info" effect="plain">清算闭环</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <strong>G2B 批发资金：</strong>对公账户充值或专户扣划直连网关，款项入政府专管财政账户后方可触发仓储出库拣货。<br />
              <strong>B2C 零售资金：</strong>公民移动支付单笔核算，统收统结日清模式，关联交易流水与电子收据。
            </p>
          </div>
        </div>
      </div>

      <!-- 三、终端与功能模块矩阵划分 & RBAC 权限体系 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-indigo-600 text-base"><UserFilled /></el-icon>
          <span>三、终端与功能模块矩阵 & 各级代理经理 RBAC 授权体系</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div class="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
            <div class="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              省级代理经理
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              全省宏观经营看板、19省跨市物资缺口调度预警、省级集中资金与对账报表审计。
            </p>
          </div>

          <div class="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
            <div class="font-bold text-purple-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              区域代理经理
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              辖区各中心仓与街道代理准入审核、时段并发容量调控、超1500户网格跨区分流新设。
            </p>
          </div>

          <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
            <div class="font-bold text-blue-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              街道代理管理员
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              维护网点营业时间、各时段接待容量 Quota 阈值、现场核销员账号分派与日清对账。
            </p>
          </div>
        </div>
      </div>

      <!-- 落地验证与五大硬性校验清单 V1 ~ V5 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-emerald-600 text-base"><CircleCheckFilled /></el-icon>
          <span>四、落地验证与数据校验清单 (V1 ~ V5)</span>
        </h4>

        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-[11px] text-left">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5 w-16 text-center">节点</th>
                <th class="p-2.5 w-24">校验实体</th>
                <th class="p-2.5">关键业务规则与硬性校验逻辑</th>
                <th class="p-2.5 w-20 text-center">系统状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V1</td>
                <td class="p-2.5 font-semibold text-slate-800">居民建档</td>
                <td class="p-2.5 text-slate-600">CurrentHouseholdCount + 1 $\le$ 1500，超额阻断并引导至邻近备用代理。</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">已装配</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V2</td>
                <td class="p-2.5 font-semibold text-slate-800">预约防超额</td>
                <td class="p-2.5 text-slate-600">UserPurchasedQty + CurrentOrderQty $\le$ MaxAllowedQuota，对预约时段执行原子性容量锁。</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">已装配</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V3</td>
                <td class="p-2.5 font-semibold text-slate-800">G2B 集中采购</td>
                <td class="p-2.5 text-slate-600">校验代理商隶属关系是否属于目标中心仓；未付款订单禁止生成仓储拣货任务。</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">已装配</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V4</td>
                <td class="p-2.5 font-semibold text-slate-800">履约通知</td>
                <td class="p-2.5 text-slate-600">订单支付成功后 5 秒内下发预约短信；提货码包含“网点+日期+时段+防重随机串”。</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">已装配</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V5</td>
                <td class="p-2.5 font-semibold text-slate-800">现场交付</td>
                <td class="p-2.5 text-slate-600">读卡/扫码严格校验预约单是否属于当前时间段窗口 (容差 $\pm 30$ 分钟)，严禁无单发货。</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">已装配</el-tag></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref } from 'vue';
import { Connection, Lock, CircleCheckFilled, UserFilled } from '@element-plus/icons-vue';

const visible = ref(false);

const open = () => {
  visible.value = true;
};

defineExpose({
  open
});
</script>
