<template>
  <el-dialog
    v-model="visible"
    title="办理配给中心代理权注销"
    width="560px"
    destroy-on-close
    class="agent-cancellation-modal"
  >
    <div class="space-y-4">
      <!-- 顶部注销通告 (已精简) -->
      <div class="p-3 bg-[#FDF3E0] border border-[#F2E3C6] rounded-lg text-xs text-[#5A4718] flex items-center gap-2">
        <el-icon class="text-[#C9A13B]"><WarningFilled /></el-icon>
        <span class="text-[11px]">注销后该中心将变更为已注销空置状态，方可由其他人重新申请或办理亲属轮替。</span>
      </div>

      <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#D9E5DB] text-xs space-y-2">
        <div class="flex justify-between">
          <span class="text-[#58685D]">拟注销中心名称：</span>
          <span class="font-bold text-[#1F3326]">{{ center?.centerName || center?.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#58685D]">所属行政省份：</span>
          <span class="font-medium text-[#43554B]">{{ center?.province }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#58685D]">当前在册签约户数：</span>
          <span class="font-mono font-bold text-[#7A5F21]">{{ center?.householdsCount || center?.currentHouseholds || 0 }} 户</span>
        </div>
        <div v-if="center?.isArticle140" class="flex justify-between text-[#7A5F21] font-semibold">
          <span>区域性质：</span>
          <span>受宪法第 140 号决议管辖</span>
        </div>
      </div>

      <div class="space-y-1.5 text-xs">
        <span class="font-semibold text-[#43554B]">申报注销理由 / 法定事由 <span class="text-[#C04442]">*</span></span>
        <el-select v-model="reasonCategory" class="w-full">
          <el-option label="原代理人自愿申请注销 / 清退交接" value="VOLUNTARY" />
          <el-option label="原代理人故去 / 启动继承轮替前法定清退" value="DECEASED" />
          <el-option label="网点合并与迁址调整前主动注销" value="RELOCATION" />
          <el-option label="行政合规清退 / 经营范围变更" value="COMPLIANCE" />
        </el-select>
      </div>

      <div class="space-y-1.5 text-xs">
        <span class="font-semibold text-[#43554B]">注销详细说明与善后处置承诺</span>
        <el-input
          v-model="detailedNotes"
          type="textarea"
          :rows="2"
          placeholder="说明辖区家庭物资交接与过渡方案..."
        />
      </div>

      <el-checkbox v-model="confirmedAgreement" class="text-xs">
        <span class="text-xs text-[#43554B] font-medium">
          本人已知晓注销后该中心物资调拨权限将立即冻结，并作为空置网点向社会或合格亲属开放申请。
        </span>
      </el-checkbox>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <el-button @click="visible = false">取消</el-button>
        <el-button
          type="danger"
          :disabled="!confirmedAgreement"
          :loading="submitting"
          @click="handleConfirmCancel"
        >
          确认注销代理权并释放为空置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { cancelAgentCenter } from '../../../api/agent.js';
import { WarningFilled } from '@element-plus/icons-vue';

const emit = defineEmits(['success']);

const visible = ref(false);
const submitting = ref(false);
const center = ref(null);
const reasonCategory = ref('VOLUNTARY');
const detailedNotes = ref('代理人自愿申请清退，已结清物资库存，申请释放为空置网点以供符合条件之公民重选。');
const confirmedAgreement = ref(false);

function open(targetCenter) {
  center.value = targetCenter;
  confirmedAgreement.value = false;
  visible.value = true;
}

async function handleConfirmCancel() {
  if (!center.value) return;
  submitting.value = true;
  try {
    const reasonText = `${reasonCategory.value === 'DECEASED' ? '原代理人故去' : '自愿申请清退'}: ${detailedNotes.value}`;
    await cancelAgentCenter(center.value.centerId || center.value.id, {
      reason: reasonText,
      agentName: center.value.ownerName || center.value.currentAgentName
    });

    ElMessage.success({
      message: (isEnNow() ? `The agency of station [${center.value.centerName || center.value.name}] has been deregistered! Status changed to [Deregistered (Vacant, Open for Application)]; a new application may be filed.` : `网点【${center.value.centerName || center.value.name}】代理权已注销！现已变更为【已注销(空置待申请)】，可重新发起申请。`),
      duration: 4000
    });

    visible.value = false;
    emit('success');
  } catch (err) {
    // handled in client
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>
