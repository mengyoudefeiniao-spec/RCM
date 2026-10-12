<template>
  <div class="change-head-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <!-- 标题与业务说明 -->
      <div>
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <el-icon class="text-blue-600"><UserFilled /></el-icon>
          <span>户主死亡注销与替代户主任命</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          原户主身故需提交法医死亡医学证明公函与户籍注销公函，经内政部底账核验后任命新法定户主。
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 左侧：原户主与死亡公函附件上传 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">需注销的原法定户主</label>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div class="font-bold text-slate-900">{{ currentHead?.name }}</div>
              <div class="text-slate-400 font-mono mt-0.5">
                配给卡号：{{ citizenStore.currentFamily?.rationCardNo }} · 身份证号：{{ currentHead?.nationalId }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">法医死亡医学鉴定公函备案编号</label>
            <el-input
              v-model="deathProofNo"
              placeholder="请输入公函文号 (例如: DTH-BAG-2026-90182)"
              size="default"
              class="font-mono mb-3"
            />

            <!-- 独立附件上传组件 -->
            <DocumentUploader
              v-model="deathProofUploaded"
              title="法定死亡医学证明与民政注销公函"
              subtitle="上传法定死亡医学证明与户籍注销公证书，核实后方可指定替代户主"
              category-badge="法医死亡鉴定与注销公函"
              issuer="伊拉克卫生部法医总局 & 内政部户政司"
              default-file-name="卫生部法医总局_户主死亡医学鉴定书及民政注销公函_DTH-BAG-2026-90182.pdf"
              :default-ref-no="deathProofNo"
              ocr-summary="已识别原户主身份销籍备案条码，法定死亡鉴定印章与全国户籍底册销户记录比对属实"
              :is-required="true"
            />
          </div>
        </div>

        <!-- 右侧：指定替代继任新户主 -->
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              指定家庭替代继任户主候选人
            </label>
            <el-select
              v-model="replacementHeadId"
              placeholder="请在现有成员中指定新户主"
              class="w-full"
              size="large"
            >
              <el-option
                v-for="m in eligibleCandidates"
                :key="m.id"
                :label="`${m.name} (${m.relation} · ${m.nationalId})`"
                :value="m.id"
              />
            </el-select>
            <p class="text-[11px] text-slate-400 mt-1">
              必须为配给卡内年满 18 周岁且具备完全民事行为能力的直系亲属。
            </p>
          </div>

          <div class="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
            <div class="font-bold">审核流转须知：</div>
            <p>
              提交后将生成工单自动转入<strong>【审核工作台】</strong>，经分部员工初审与分部经理终审双岗确认后正式变更。
            </p>
          </div>

          <div class="pt-4">
            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md"
              :loading="submitting"
              @click="handleSubmitChangeHead"
            >
              提交变更户主申请 (转入审核工作台)
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import { UserFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const citizenStore = useCitizenStore();

const deathProofNo = ref('DTH-BAG-2026-90182');
const deathProofUploaded = ref(true);
const replacementHeadId = ref('');
const submitting = ref(false);

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  const firstCandidate = eligibleCandidates.value[0];
  if (firstCandidate) {
    replacementHeadId.value = firstCandidate.id;
  }
});

const currentHead = computed(() => {
  return citizenStore.currentFamily?.members?.find((m) => m.relation === '户主');
});

const eligibleCandidates = computed(() => {
  return (citizenStore.currentFamily?.members || []).filter(
    (m) => m.relation !== '户主' && m.status === '正常'
  );
});

async function handleSubmitChangeHead() {
  if (!deathProofUploaded.value) {
    ElMessage.error('请先上传有效的户主死亡医学证明与户籍注销公函！');
    return;
  }

  if (!replacementHeadId.value) {
    ElMessage.error('请在家庭成员中指定替代继任新户主！');
    return;
  }

  submitting.value = true;
  try {
    const res = await citizenStore.changeHead({
      cardNo: citizenStore.currentFamily.rationCardNo,
      newHeadId: replacementHeadId.value,
      deathProofNo: deathProofNo.value
    });
    router.push('/review');
  } finally {
    submitting.value = false;
  }
}
</script>
