<template>
  <el-drawer
    v-model="visible"
    :title="isEn ? 'Agent Management Process Optimization: Business Panorama Flow & Constraint Engine Overview' : '代理管理流程优化：业务全景流转与约束引擎全貌'"
    size="720px"
    direction="rtl"
    destroy-on-close
  >
    <div class="space-y-6 text-xs text-slate-700 pr-1">
      <!-- 顶部概述提示 -->
      <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl space-y-2">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <h3 class="font-bold text-sm text-blue-900">{{ isEn ? 'Dual-Layer Quota Pool & Fund Settlement Closed-Loop System' : '双层配额池与资金清算闭环体系' }}</h3>
        </div>
        <p class="text-[12px] text-blue-800 leading-relaxed">
          {{ isEn
            ? 'The system is divided into the G2B centralized wholesale replenishment chain and the B2C community time-shared retail chain, building an end-to-end supply network from the Ministry of Trade national central warehouse to street agent stations to resident households, enforcing the 1,500-household hard ceiling and time-shared concurrent atomic capacity locks.'
            : '系统划分为 G2B 集中批发补货链路 与 B2C 社区分时零售链路，构建自“贸易部国家中心仓 → 街道代理网点 → 辖区居民家庭”的端到端保供网络，执行 1500 户硬上限和分时并发原子容量锁。' }}
        </p>
      </div>

      <!-- 阶段一与阶段二 时序流转对比卡片 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-blue-600 text-base"><Connection /></el-icon>
          <span>{{ isEn ? '1. Business Panorama Flow & Timing Design' : '一、业务全景流转与时序设计' }}</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- 阶段一 G2B -->
          <div class="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-900 flex items-center gap-1.5">
                <el-tag size="small" type="primary" effect="dark">{{ isEn ? 'Stage 1' : '阶段一' }}</el-tag>
                {{ isEn ? 'G2B Centralized Wholesale Replenishment Chain' : 'G2B 集中批发补货链路' }}
              </span>
              <el-tag size="small" type="primary" effect="plain">{{ isEn ? 'Street Agent → Government Central Warehouse' : '街道代理 → 政府中心仓' }}</el-tag>
            </div>
            <ol class="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
              <li v-if="isEn">Submit a procurement reservation order based on the district's 1,500-household quota ceiling (select a self-pickup / delivery time slot)</li>
              <li v-else>依据辖区 1500 户配额上限提交采购预约单 (选定自提/配送时段)</li>
              <li v-if="isEn">The center validates agent qualifications, single-center physical affiliation and central warehouse stock</li>
              <li v-else>中心校验代理资质、单中心物理归属与中心库存</li>
              <li v-if="isEn">The agent pays the procurement payment online via the corporate dedicated account</li>
              <li v-else>代理线上通过对公专户支付采购货款</li>
              <li v-if="isEn">Upon successful payment into the dedicated account, the pickup voucher and SMS confirmation are automatically issued</li>
              <li v-else>支付成功入专管账户，自动下发提货凭证与短信确认</li>
              <li v-if="isEn">Center outbound delivery / self-pickup verification; agent inventory and purchase ledger increment synchronously</li>
              <li v-else>中心出库配送/自提核验，代理端库存与进货台账同步累加</li>
            </ol>
          </div>

          <!-- 阶段二 B2C -->
          <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-900 flex items-center gap-1.5">
                <el-tag size="small" type="success" effect="dark">{{ isEn ? 'Stage 2' : '阶段二' }}</el-tag>
                {{ isEn ? 'B2C Community Time-Shared Retail Chain' : 'B2C 社区分时零售链路' }}
              </span>
              <el-tag size="small" type="success" effect="plain">{{ isEn ? 'District Citizens → Street Agent' : '辖区公民 → 街道代理' }}</el-tag>
            </div>
            <ol class="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
              <li v-if="isEn">Citizens browse the affiliated agent's inventory, pick a pickup time slot and submit a replenishment purchase reservation</li>
              <li v-else>公民浏览归属代理库存，选择提货时段提交补给购买预约</li>
              <li v-if="isEn">Validate the household's remaining quota for the period (anti-overrun) and the slot's concurrent capacity</li>
              <li v-else>校验家庭本期剩余额度（防超额）与时段并发容量 Capacity</li>
              <li v-if="isEn">The citizen pays the self-pay amount at the online cashier</li>
              <li v-else>公民线上收银台支付自付费用</li>
              <li v-if="isEn">Issue the pickup code / dynamic anti-screenshot QR code and trigger an SMS reservation notification</li>
              <li v-else>下发取件码/动态防截屏二维码，并触发短信预约通知</li>
              <li v-if="isEn">Present the pickup code / card at the reserved slot; the agent verifies, dispatches goods and deducts stock</li>
              <li v-else>按预约时段到店出示取件码/读卡，代理核销发货并扣减现货</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- 核心业务规则与约束引擎 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-amber-600 text-base"><Lock /></el-icon>
          <span>{{ isEn ? '2. Core Business Rules & Constraint Engine Design' : '二、核心业务规则与约束引擎设计' }}</span>
        </h4>

        <div class="space-y-2.5">
          <!-- 规则 1 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">{{ isEn ? '1. Strong Control of Agent Grids & Households (1,500-Household Hard Ceiling)' : '1. 代理网格与户数强管控（1500 户硬上限）' }}</span>
              <el-tag size="small" type="danger" effect="plain">{{ isEn ? 'Hard Constraint' : '硬约束' }}</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <template v-if="isEn">
                <strong>Single-center binding:</strong> each street agent is physically affiliated with exactly one ration center; cross-center transfers and fulfillment are strictly prohibited.<br />
                <strong>1,500-household hard ceiling:</strong> the system validates when residents are bound to the agent grid; at 1,500 bound households a "grid saturation lock" is triggered, prohibiting new household immigration — a regional manager must split off and establish a new agent station.
              </template>
              <template v-else>
                <strong>单中心绑定：</strong>每个街道代理物理上仅能隶属于一个配给中心，严禁跨中心调货与履约。<br />
                <strong>1500 户户籍硬上限：</strong>系统在居民绑定代理网格时进行校验，当前绑定户数达 1500 户即触发“网格饱和锁定”，禁止新户迁入，必须由区域经理分流设立新代理点。
              </template>
            </p>
          </div>

          <!-- 规则 2 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">{{ isEn ? '2. Dual-Layer Time-Shared Reservation & Concurrency Control Pool' : '2. 双层分时段预约与并发控制池' }}</span>
              <el-tag size="small" type="warning" effect="plain">{{ isEn ? 'Concurrent Quota Pool' : '并发配额池' }}</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <template v-if="isEn">
                <strong>Slot granularity & concurrent quota pool:</strong> each day is divided into fixed time windows (08:00-10:00, 10:00-12:00, 14:00-16:00, 16:00-18:00), each configured with a fixed reception threshold (Capacity). A pre-deduction mechanism achieves time-shared inventory and slot locking; unpaid reservations auto-rollback and release after a 15-minute timeout.<br />
                <strong>Household quota ceiling:</strong> SUM(purchased qty + reserved qty in this order) ≤ the household's assessed quota for the period.<br />
                <strong>Agent safety stock:</strong> the sum of in-transit and in-stock must not exceed the dynamic redundancy coefficient (1.2x safety stock) of the total assessed quota of its bound 1,500 households.
              </template>
              <template v-else>
                <strong>时段粒度与并发配额池：</strong>每天划分为固定时间窗口 (08:00-10:00, 10:00-12:00, 14:00-16:00, 16:00-18:00)，每个时段配置固定接待阈值 Capacity。采用预扣减机制实现分时段库存与号源锁定，超时 15 分钟未支付自动回滚释放。<br />
                <strong>家庭额度上限：</strong>SUM(已购数量 + 本次预约数量) ≤ 周期家庭核定配额。<br />
                <strong>代理安全库存：</strong>在途与在库总和不得超过其绑定的 1500 户总额定配额的动态冗余系数（1.2 倍安全库存）。
              </template>
            </p>
          </div>

          <!-- 规则 3 -->
          <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900">{{ isEn ? '3. Fund Settlement & Payment Closed Loop' : '3. 资金结算与支付闭环' }}</span>
              <el-tag size="small" type="info" effect="plain">{{ isEn ? 'Settlement Closed Loop' : '清算闭环' }}</el-tag>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              <template v-if="isEn">
                <strong>G2B wholesale funds:</strong> corporate account top-ups or dedicated-account deductions connect directly to the gateway; warehouse outbound picking is triggered only after funds enter the government's dedicated treasury account.<br />
                <strong>B2C retail funds:</strong> citizen mobile payments are settled per transaction under a unified daily-clearing model, linked to transaction flows and e-receipts.
              </template>
              <template v-else>
                <strong>G2B 批发资金：</strong>对公账户充值或专户扣划直连网关，款项入政府专管财政账户后方可触发仓储出库拣货。<br />
                <strong>B2C 零售资金：</strong>公民移动支付单笔核算，统收统结日清模式，关联交易流水与电子收据。
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- 三、终端与功能模块矩阵划分 & RBAC 权限体系 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-indigo-600 text-base"><UserFilled /></el-icon>
          <span>{{ isEn ? '3. Terminal & Module Matrix and Tiered Agent Manager RBAC Authorization System' : '三、终端与功能模块矩阵 & 各级代理经理 RBAC 授权体系' }}</span>
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div class="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
            <div class="font-bold text-indigo-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              {{ isEn ? 'Provincial Agent Manager' : '省级代理经理' }}
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              {{ isEn ? 'Province-wide macro operations dashboard, cross-city material gap dispatch early warning across 19 provinces, and provincial centralized funds and reconciliation report audits.' : '全省宏观经营看板、19省跨市物资缺口调度预警、省级集中资金与对账报表审计。' }}
            </p>
          </div>

          <div class="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-1">
            <div class="font-bold text-purple-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              {{ isEn ? 'Regional Agent Manager' : '区域代理经理' }}
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              {{ isEn ? 'Admission review of district central warehouses and street agents, slot concurrency capacity regulation, and cross-district split-off establishment for grids exceeding 1,500 households.' : '辖区各中心仓与街道代理准入审核、时段并发容量调控、超1500户网格跨区分流新设。' }}
            </p>
          </div>

          <div class="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
            <div class="font-bold text-blue-900 text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              {{ isEn ? 'Street Agent Administrator' : '街道代理管理员' }}
            </div>
            <p class="text-[10px] text-slate-600 leading-relaxed">
              {{ isEn ? 'Maintain station business hours, per-slot reception capacity quota thresholds, on-site verifier account assignment and daily reconciliation.' : '维护网点营业时间、各时段接待容量 Quota 阈值、现场核销员账号分派与日清对账。' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 落地验证与五大硬性校验清单 V1 ~ V5 -->
      <div class="space-y-3">
        <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <el-icon class="text-emerald-600 text-base"><CircleCheckFilled /></el-icon>
          <span>{{ isEn ? '4. Implementation Verification & Data Validation Checklist (V1 ~ V5)' : '四、落地验证与数据校验清单 (V1 ~ V5)' }}</span>
        </h4>

        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-[11px] text-left">
            <thead class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-2.5 w-16 text-center">{{ isEn ? 'Node' : '节点' }}</th>
                <th class="p-2.5 w-24">{{ isEn ? 'Validation Entity' : '校验实体' }}</th>
                <th class="p-2.5">{{ isEn ? 'Key Business Rules & Hard Validation Logic' : '关键业务规则与硬性校验逻辑' }}</th>
                <th class="p-2.5 w-20 text-center">{{ isEn ? 'Status' : '系统状态' }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V1</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ isEn ? 'Resident Registration' : '居民建档' }}</td>
                <td class="p-2.5 text-slate-600">{{ isEn ? 'CurrentHouseholdCount + 1 ≤ 1,500; overruns are blocked and residents are guided to a nearby backup agent.' : 'CurrentHouseholdCount + 1 ≤ 1500，超额阻断并引导至邻近备用代理。' }}</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">{{ isEn ? 'Deployed' : '已装配' }}</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V2</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ isEn ? 'Reservation Anti-Overrun' : '预约防超额' }}</td>
                <td class="p-2.5 text-slate-600">{{ isEn ? 'UserPurchasedQty + CurrentOrderQty ≤ MaxAllowedQuota; an atomic capacity lock is applied to the reserved slot.' : 'UserPurchasedQty + CurrentOrderQty ≤ MaxAllowedQuota，对预约时段执行原子性容量锁。' }}</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">{{ isEn ? 'Deployed' : '已装配' }}</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V3</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ isEn ? 'G2B Centralized Procurement' : 'G2B 集中采购' }}</td>
                <td class="p-2.5 text-slate-600">{{ isEn ? 'Validate that the agent is affiliated with the target central warehouse; warehouse picking tasks are prohibited for unpaid orders.' : '校验代理商隶属关系是否属于目标中心仓；未付款订单禁止生成仓储拣货任务。' }}</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">{{ isEn ? 'Deployed' : '已装配' }}</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V4</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ isEn ? 'Fulfillment Notification' : '履约通知' }}</td>
                <td class="p-2.5 text-slate-600">{{ isEn ? 'Reservation SMS is sent within 5 seconds of successful payment; the pickup code embeds "station + date + slot + anti-duplicate random string".' : '订单支付成功后 5 秒内下发预约短信；提货码包含“网点+日期+时段+防重随机串”。' }}</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">{{ isEn ? 'Deployed' : '已装配' }}</el-tag></td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 text-center font-bold text-blue-600 font-mono">V5</td>
                <td class="p-2.5 font-semibold text-slate-800">{{ isEn ? 'On-Site Delivery' : '现场交付' }}</td>
                <td class="p-2.5 text-slate-600">{{ isEn ? 'Card read / QR scan strictly validates that the reservation belongs to the current time window (±30 min tolerance); delivery without an order is strictly prohibited.' : '读卡/扫码严格校验预约单是否属于当前时间段窗口 (容差 ±30 分钟)，严禁无单发货。' }}</td>
                <td class="p-2.5 text-center"><el-tag size="small" type="success" effect="plain">{{ isEn ? 'Deployed' : '已装配' }}</el-tag></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Connection, Lock, CircleCheckFilled, UserFilled } from '@element-plus/icons-vue';

const { locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const visible = ref(false);

const open = () => {
  visible.value = true;
};

defineExpose({
  open
});
</script>
