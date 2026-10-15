<template>
  <el-drawer
    v-model="visible"
    title="核心功能模块关系与落地验证清单 (P1 ~ P5 规则实体验证看板)"
    size="640px"
    destroy-on-close
  >
    <div class="space-y-5 text-xs">
      <div class="p-3.5 bg-[#EFF5F1]/70 rounded-lg border border-[#C7DED0]/80 text-[#1F3326] space-y-1">
        <div class="font-bold text-sm flex items-center gap-1.5">
          <el-icon class="text-[#326445]"><Checked /></el-icon>
          <span>国家数字配给卡综合服务平台 · 仓储管理规则验证体系</span>
        </div>
        <p class="text-[11px] text-[#2A5440]/90 leading-relaxed">
          针对仓储入库、配送出库、代理交接、末端兑付及管控审计 5 大核心阶段验证标准，系统实施严格的代码级约束、分布式事务原子性控制与不可篡改审计。
        </p>
      </div>

      <!-- P1 ~ P5 规则卡片清单 -->
      <div class="space-y-3">
        <div
          v-for="rule in rules"
          :key="rule.code"
          class="p-4 bg-white rounded-lg border border-[#D9E5DB] shadow-2xs space-y-2.5 transition-all hover:border-[#AECBB8]"
        >
          <div class="flex items-center justify-between border-b border-[#E9F1EB] pb-2">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-[#326445] text-white flex items-center justify-center font-mono font-bold text-xs">
                {{ rule.code }}
              </span>
              <div>
                <span class="font-bold text-[#1B3123] text-xs">{{ rule.title }}</span>
                <span class="text-[#8A9A8F] text-[11px] ml-2">({{ rule.modules }})</span>
              </div>
            </div>
            <el-tag size="small" type="success" effect="dark">
              合规率 {{ rule.complianceRate }}
            </el-tag>
          </div>

          <!-- 规则描述 -->
          <div class="p-2.5 bg-[#F3F8F4] rounded-lg text-[#43554B] font-medium text-[11px] leading-relaxed">
            ● 校验标准：{{ rule.ruleDescription }}
          </div>

          <!-- 仿真测试输入数据与执行动作 -->
          <div class="flex items-center justify-between pt-1">
            <div class="text-[10px] text-[#8A9A8F] font-mono">
              状态: <span class="text-[#2F7A50] font-bold">ACTIVE (已集成至微服务拦截器)</span>
            </div>
            <el-button
              size="small"
              type="primary"
              plain
              :loading="testingCode === rule.code"
              @click="handleRunTest(rule)"
            >
              运行仿真测试
            </el-button>
          </div>

          <!-- 测试通过结果反馈 -->
          <div
            v-if="testResults[rule.code]"
            class="p-2 bg-[#EFF5F1] rounded border border-[#C7E0CE] text-[#24483A] text-[11px] font-mono"
          >
            {{ testResults[rule.code] }}
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref } from 'vue';
import { getPhaseValidationRules, runPhaseRuleValidation } from '../../../api/warehouse.js';
import { ElMessage } from 'element-plus';
import { Checked } from '@element-plus/icons-vue';

const visible = ref(false);
const rules = ref([]);
const testingCode = ref('');
const testResults = ref({});

async function open() {
  visible.value = true;
  try {
    const list = await getPhaseValidationRules();
    rules.value = list || [];
  } catch (err) {
    ElMessage.error((isEnNow() ? 'Failed to load verification rules' : '加载验证规则失败'));
  }
}

async function handleRunTest(rule) {
  testingCode.value = rule.code;
  try {
    const res = await runPhaseRuleValidation(rule.code, rule.testInput);
    testResults.value[rule.code] = `✓ ${res.message} (验证时间: ${res.testTime})`;
    ElMessage.success((isEnNow() ? `[${rule.code} Stage Verification] Simulation check passed!` : `【${rule.code} 阶段验证】仿真校验通过！`));
  } catch (err) {
    ElMessage.error(err.message || (isEnNow() ? 'Simulation test failed' : '仿真测试失败'));
  } finally {
    testingCode.value = '';
  }
}

defineExpose({ open });
</script>
