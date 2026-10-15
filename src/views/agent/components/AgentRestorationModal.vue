<template>
  <el-dialog
    v-model="visible"
    :title="isEn ? 'Appeal for Reinstatement of Agent License' : '申请恢复已注销的代理权'"
    width="840px"
    destroy-on-close
    :close-on-click-modal="false"
    class="agent-restoration-modal"
  >
    <div class="space-y-5">
      <!-- 顶部政策通告栏 (已精简) -->
      <div class="p-3 bg-[#FBEAE9]/80 border border-[#F2D5D4]/90 rounded-lg text-xs flex items-center justify-between text-[#6E2F2E]">
        <div class="flex items-center gap-2">
          <el-icon class="text-[#C04442]"><WarningFilled /></el-icon>
          <span class="text-[11px]">仅限未被合并的已注销中心申请恢复。处罚注销须获 25% 以上家庭支持；涉及犯罪篡改者一票否决。</span>
        </div>
        <el-tag size="small" type="danger" effect="light">规费 50,000 IQD</el-tag>
      </div>

      <!-- 4 步骤条导航 -->
      <el-steps :active="activeStep" finish-status="success" align-center class="my-2">
        <el-step title="第 1 步" description="网点选择与一票否决自查" />
        <el-step title="第 2 步" description="上传整改与25%联署附件" />
        <el-step title="第 3 步" description="双司联合调查与合规初审" />
        <el-step title="第 4 步" description="电子支付与完成恢复" />
      </el-steps>

      <!-- ======================================================== -->
      <!-- 步骤 1: 网点选择与一票否决申报 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 0" class="space-y-4">
        <!-- 恢复类型 -->
        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-3">
          <span class="block text-xs font-bold text-[#1F3326]">恢复代理权原注销原因与分类 <span class="text-[#C04442]">*</span></span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="form.restorationType === 'VOLUNTARY' ? 'bg-[#EFF5F1]/80 border-[#5C8A6B] shadow-xs' : 'bg-white border-[#D9E5DB]'"
              @click="form.restorationType = 'VOLUNTARY'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#1B3123]">1. 应代理申请恢复已注销代理权</span>
                <el-tag size="small" type="primary" effect="plain">自愿复业</el-tag>
              </div>
              <p class="text-[11px] text-[#58685D] mt-1">
                原代理因私人原因或暂时停业注销，现提出复业申请并承诺专职经营。
              </p>
            </div>

            <div
              class="p-3 rounded-lg border cursor-pointer transition-all"
              :class="form.restorationType === 'PUNISHMENT' ? 'bg-[#FDF3E0]/80 border-[#D3AF62] shadow-xs' : 'bg-white border-[#D9E5DB]'"
              @click="form.restorationType = 'PUNISHMENT'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#1B3123]">2. 作为处罚被注销的代理权恢复</span>
                <el-tag size="small" type="danger" effect="plain">须25%民意支持</el-tag>
              </div>
              <p class="text-[11px] text-[#58685D] mt-1">
                因违规受处罚注销，已彻底整改，并征集不低于 25% 辖区家庭同意支持。
              </p>
            </div>
          </div>
        </div>

        <!-- 目标中心选择与未合并校验 -->
        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-3">
          <h4 class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#326445]"><Shop /></el-icon>
            <span>拟申请恢复的已注销配给中心 (必须未被合并)</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">选择已注销网点中心 <span class="text-[#C04442]">*</span></span>
              <el-select v-model="form.centerId" placeholder="选择已注销中心 (支持输入关键字搜索)" class="w-full" filterable>
                <el-option
                  v-for="c in cancelledCenterOptions"
                  :key="c.centerId"
                  :label="`[${c.province}] ${c.city ? c.city + ' - ' : ''}${c.centerName} (${c.status})`"
                  :value="c.centerId"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span>
                      <span v-if="c.isArticle140" class="text-[#D3AF62] font-bold mr-1">★</span>{{ c.centerName }}
                      <span v-if="c.city" class="text-[11px] text-[#8A9A8F] ml-1">({{ c.province }} · {{ c.city }})</span>
                    </span>
                    <el-tag v-if="c.isArticle140" size="small" type="warning" effect="dark" class="scale-90">140号决议</el-tag>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">网点合并状态审查</span>
              <el-input :value="selectedCenter?.isMerged ? '已被并入其他网点 (禁止恢复)' : '独立网点 / 未被合并 (允许恢复)'" readonly :class="{'text-[#C04442] font-bold': selectedCenter?.isMerged}" />
            </div>
          </div>

          <!-- 处罚注销时需要填写的支持率 -->
          <div v-if="form.restorationType === 'PUNISHMENT'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">辖区家庭支持恢复联署比例 (%) <span class="text-[#C04442]">*</span></span>
              <el-input-number v-model="form.supportFamilyPercent" :min="0" :max="100" class="w-full" />
              <span class="text-[10px]" :class="form.supportFamilyPercent < 25 ? 'text-[#C04442] font-bold' : 'text-[#2F7A50]'">
                法定红线：不少于 25% 家庭支持 (当前：{{ form.supportFamilyPercent }}%)
              </span>
            </div>
            <div>
              <span class="block text-xs font-semibold text-[#58685D] mb-1">整改方案与合规承诺摘要</span>
              <el-input v-model="form.rectificationSummary" placeholder="已整改违规库房防潮与称重设备..." />
            </div>
          </div>
        </div>

        <!-- 负面清单与一票否决申报 (核心法律红线) -->
        <div class="bg-[#FBEAE9]/60 p-4 rounded-lg border border-[#F2D5D4] space-y-2.5">
          <div class="flex items-center gap-1.5 text-xs font-bold text-[#6E2F2E]">
            <el-icon><CircleCloseFilled /></el-icon>
            <span>法定一票否决负面清单自查申报 (任何一条触犯即终身禁止恢复)</span>
          </div>

          <div class="space-y-2 text-xs text-[#6E2F2E]">
            <el-checkbox v-model="form.declNoCourtConviction">
              本人<strong>未曾被法院判决有罪</strong>，无任何刑事犯罪在案记录。
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.declNoMoralOrTerrorCrime">
              本人<strong>未犯有任何涉及道德败坏罪行或恐怖主义罪行</strong>。
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.declNoTamperingOrReplacing">
              本人经商业与财务监督司核查，<strong>绝无滥用、篡改或替换贸易部交付配给物资之违禁行为</strong>。
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.declDevotedCommitment">
              <strong>专职经营承诺</strong>：恢复后全职投入代理业务管理，不从事公职或领取财政工资。
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 2: 上传对应证明附件 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 1" class="space-y-4">
        <div class="p-3 bg-[#EFF5F1]/70 border border-[#C7DED0] rounded-lg text-xs text-[#24483A]">
          请上传向规划与跟进司及商业监督司提交的恢复代理权法定要件（支持 PDF/JPG）：
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- 附件 1 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">1. 恢复代理权正式申请书 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">必需文书</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">向规划与跟进司提交的恢复代理权正式呈报公函原件。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docApplication', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传正式申请书</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docApplication?.name || '已自动加载申请公文' }}</span>
            </div>
          </div>

          <!-- 附件 2 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">2. 专职经营与整改违规书面承诺书 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">法务承诺</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">承诺整改导致注销的违规行为，按捺拇指印公证书。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docRectification', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传整改承诺</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docRectification?.name || '已上传整改承诺书' }}</span>
            </div>
          </div>

          <!-- 附件 3：25%家庭支持联署 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">3. 25%家庭支持联署按印底册 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" :type="form.restorationType === 'PUNISHMENT' ? 'danger' : 'info'" effect="plain">
                {{ form.restorationType === 'PUNISHMENT' ? '处罚恢复必需' : '建议提供' }}
              </el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">不少于25%家庭支持恢复的签名按印与配给卡复印底账。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docSupportList', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传联署底册</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docSupportList?.name || '已上传 (28.4%家庭签名册)' }}</span>
            </div>
          </div>

          <!-- 附件 4：无罪公证与监督司联合调查申请 -->
          <div class="p-3 bg-white border border-[#D9E5DB] rounded-lg space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#1F3326]">4. 司法无罪证明及联合调查申请表 <span class="text-[#C04442]">*</span></span>
              <el-tag size="small" type="success" effect="plain">背景证明</el-tag>
            </div>
            <p class="text-[11px] text-[#58685D]">内政部无犯罪记录证明及双司联合调查申请登记表。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docClearance', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传无犯罪证明</el-button>
              </el-upload>
              <span class="text-[11px] text-[#2F7A50] font-medium truncate">{{ docs.docClearance?.name || '已上传无罪公函' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 3: 双司联合调查与合规初审 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 2" class="space-y-4">
        <!-- 司法背景与合规结论 -->
        <div class="p-4 bg-[#EFF5F1] border border-[#C7E0CE] rounded-lg space-y-2 text-xs">
          <div class="flex items-center gap-2 text-[#24483A] font-bold">
            <el-icon class="text-base"><CircleCheckFilled /></el-icon>
            <span>一票否决黑名单穿透核查结果：背景清白，无不良违禁记录</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#12241A]">
            <div>• 最高司法委员会判决库：无刑事及道德败坏犯罪记录</div>
            <div>• 贸易部商业监督司台账：无任何物品调换/侵占记录</div>
          </div>
        </div>

        <!-- 双司联合实地调查意见 -->
        <div class="bg-white border border-[#D9E5DB] p-4 rounded-lg space-y-3 text-xs">
          <h4 class="font-bold text-[#1F3326] flex items-center gap-1.5">
            <el-icon class="text-[#C9A13B]"><Stamp /></el-icon>
            <span>规划与跟进司 / 商业和财务监督司联合调查结论</span>
          </h4>

          <div class="space-y-2">
            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] rounded-lg border border-[#E9F1EB]">
              <span class="font-medium text-[#43554B]">1. 规划与跟进司联合调查组</span>
              <span class="text-[#2F7A50] font-bold flex items-center gap-1">
                <el-icon><Check /></el-icon>网点独立性复核通过 (未被合并)
              </span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] rounded-lg border border-[#E9F1EB]">
              <span class="font-medium text-[#43554B]">2. 商业和财务监督司入户抽查</span>
              <span class="text-[#2F7A50] font-bold flex items-center gap-1">
                <el-icon><Check /></el-icon>入户抽查支持率：{{ form.supportFamilyPercent }}% (大于25%法定阈值)
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 4: 电子规费支付与完成恢复 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 3" class="space-y-4">
        <div class="p-4 bg-[#1B3123] text-white rounded-lg space-y-3">
          <div class="flex items-center justify-between border-b border-[#1F3326] pb-3">
            <div>
              <span class="text-xs text-[#8A9A8F] block">法定规费收取部门</span>
              <span class="text-sm font-bold text-[#DFC08B]">规划与跟进司 / 代理管理司</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-[#8A9A8F] block">应缴纳恢复核发规费</span>
              <span class="text-xl font-bold font-mono text-[#6FBF92]">50,000 IQD</span>
              <span class="text-[10px] text-[#8A9A8F] block">(五万伊拉克第纳尔)</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-[#C9DBCE]">
            <div>恢复中心：{{ selectedCenter?.centerName }}</div>
            <div>申请类型：{{ form.restorationType === 'PUNISHMENT' ? '处罚违规整改恢复' : '自愿申请恢复' }}</div>
            <div>网点合并状态：未合并 (独立)</div>
            <div>民意支持率：{{ form.supportFamilyPercent }}% (核验达标)</div>
          </div>
        </div>

        <div class="bg-[#F3F8F4] p-4 rounded-lg border border-[#D9E5DB] space-y-3 text-xs">
          <span class="block font-bold text-[#1F3326]">选择伊拉克国家电子支付通道：</span>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'QI_CARD' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'QI_CARD'"
            >
              <div class="text-sm font-bold">QI Card</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">国家银联数字卡</div>
            </div>
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'ZAIN_CASH' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'ZAIN_CASH'"
            >
              <div class="text-sm font-bold">ZainCash</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">移动电子钱包</div>
            </div>
            <div
              class="p-3 rounded-lg border cursor-pointer text-center transition-all"
              :class="payChannel === 'CENTRAL_BANK' ? 'bg-[#EFF5F1] border-[#326445] text-[#2A5440] font-bold shadow-xs' : 'bg-white border-[#D9E5DB] text-[#58685D]'"
              @click="payChannel = 'CENTRAL_BANK'"
            >
              <div class="text-sm font-bold">国库专户直联</div>
              <div class="text-[10px] text-[#8A9A8F] mt-1">财政统一清算号</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="flex items-center justify-between">
        <el-button @click="visible = false">取消</el-button>
        <div class="space-x-2">
          <el-button v-if="activeStep > 0" @click="activeStep--">上一步</el-button>
          <el-button
            v-if="activeStep < 3"
            type="primary"
            :disabled="!canProceedNextStep"
            @click="activeStep++"
          >
            下一步
          </el-button>
          <el-button
            v-else
            type="success"
            :loading="submitting"
            @click="handleSubmitAndPay"
          >
            <el-icon class="mr-1"><Check /></el-icon>
            确认电子支付 50,000 IQD 并重新激活代理权
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { isEnNow } from '../../../utils/langHint.js';
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import { submitAgentRestorationApplication, payAgentApplicationFee } from '../../../api/agent.js';
import {
  WarningFilled,
  Shop,
  Upload,
  Stamp,
  CircleCheckFilled,
  CircleCloseFilled,
  Check
} from '@element-plus/icons-vue';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const props = defineProps({
  centerOptions: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['success']);

const visible = ref(false);
const activeStep = ref(0);
const submitting = ref(false);
const payChannel = ref('QI_CARD');

const form = reactive({
  restorationType: 'PUNISHMENT', // VOLUNTARY 或 PUNISHMENT
  centerId: '',
  supportFamilyPercent: 28,
  rectificationSummary: '违规营业面积及计量器械已完成整改，经质监部门校准合格',
  declNoCourtConviction: true,
  declNoMoralOrTerrorCrime: true,
  declNoTamperingOrReplacing: true,
  declDevotedCommitment: true
});

const docs = reactive({
  docApplication: { name: '恢复代理权正式申报书.pdf' },
  docRectification: { name: '违规整改与专职经营保证书.pdf' },
  docSupportList: { name: '28%辖区家庭签名联署底册.pdf' },
  docClearance: { name: '内政部无犯罪记录证明.pdf' }
});

function syncBilingualDefaults() {
  if (isEn.value) {
    form.rectificationSummary = 'Deficiencies rectified; weighing scales calibrated.';
    docs.docApplication = { name: 'Formal_Reinstatement_Application.pdf' };
    docs.docRectification = { name: 'Rectification_and_Commitment_Letter.pdf' };
    docs.docSupportList = { name: '28_Percent_Household_Petition_Roster.pdf' };
    docs.docClearance = { name: 'Police_Clearance_Certificate.pdf' };
  } else {
    form.rectificationSummary = '违规营业面积及计量器械已完成整改，经质监部门校准合格';
    docs.docApplication = { name: '恢复代理权正式申报书.pdf' };
    docs.docRectification = { name: '违规整改与专职经营保证书.pdf' };
    docs.docSupportList = { name: '28%辖区家庭签名联署底册.pdf' };
    docs.docClearance = { name: '内政部无犯罪记录证明.pdf' };
  }
}

watch(isEn, () => syncBilingualDefaults(), { immediate: true });

const cancelledCenterOptions = computed(() => {
  return props.centerOptions.filter((c) => c.status.includes('注销'));
});

const selectedCenter = computed(() => {
  return props.centerOptions.find((c) => c.centerId === form.centerId);
});

const canProceedNextStep = computed(() => {
  if (activeStep.value === 0) {
    if (!form.centerId) return false;
    if (selectedCenter.value?.isMerged) return false; // 已被合并不可恢复
    if (!form.declNoCourtConviction || !form.declNoMoralOrTerrorCrime || !form.declNoTamperingOrReplacing || !form.declDevotedCommitment) {
      return false; // 触犯一票否决红线
    }
    if (form.restorationType === 'PUNISHMENT' && form.supportFamilyPercent < 25) {
      return false; // 低于25%家庭支持
    }
    return true;
  }
  return true;
});

function handleFileChange(key, file) {
  docs[key] = { name: file.name };
  ElMessage.success((isEnNow() ? `File [${file.name}] selected` : `文件【${file.name}】已选定`));
}

async function handleSubmitAndPay() {
  submitting.value = true;
  try {
    const res = await submitAgentRestorationApplication({
      ...form,
      hasCriminalRecord: !form.declNoCourtConviction || !form.declNoMoralOrTerrorCrime,
      hasTamperingRecord: !form.declNoTamperingOrReplacing
    });

    await payAgentApplicationFee(res.ticketNo, { channel: payChannel.value });

    ElMessage.success({
      message: (isEnNow() ? 'Deregistered agency restored successfully! The 50,000 IQD fee has been paid and the ration supply channel re-activated!' : '已注销代理权恢复成功！50,000 IQD 规费缴纳完成，配给物资供给通道已重新激活！'),
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

function open(presetCenterId = '') {
  visible.value = true;
  activeStep.value = 0;
  if (presetCenterId) {
    form.centerId = String(presetCenterId);
  } else if (cancelledCenterOptions.value.length > 0) {
    form.centerId = cancelledCenterOptions.value[0].centerId;
  }
}

defineExpose({ open });
</script>
