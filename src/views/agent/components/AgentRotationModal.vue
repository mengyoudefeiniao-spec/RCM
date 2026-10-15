<template>
  <el-dialog
    v-model="visible"
    :title="isEn ? 'Agent License Succession & Rotation' : '代理权轮替 (转移) 申请办理'"
    width="840px"
    destroy-on-close
    :close-on-click-modal="false"
    class="agent-rotation-modal"
  >
    <div class="space-y-5">
      <!-- 顶部政策通告栏 (已精简) -->
      <div class="p-3 bg-blue-50/80 border border-blue-200/90 rounded-xl text-xs flex items-center justify-between text-blue-900">
        <div class="flex items-center gap-2">
          <el-icon class="text-blue-600"><InfoFilled /></el-icon>
          <span class="text-[11px]">已故轮替须在 12 个月内办理；自愿轮替须在法务部出具放弃声明；受让人限三代以内亲属。</span>
        </div>
        <el-tag size="small" type="primary" effect="light">规费 50,000 IQD</el-tag>
      </div>

      <!-- 4 步骤条导航 -->
      <el-steps :active="activeStep" finish-status="success" align-center class="my-2">
        <el-step title="第 1 步" description="选择轮替情形与受让亲属" />
        <el-step title="第 2 步" description="上传法务与注销证明附件" />
        <el-step title="第 3 步" description="时限审查与法务部审核" />
        <el-step title="第 4 步" description="电子支付与完成转移" />
      </el-steps>

      <!-- ======================================================== -->
      <!-- 步骤 1: 选择轮替类型与亲属受让人资格核验 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 0" class="space-y-4">
        <!-- 轮替情形单选 -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <span class="block text-xs font-bold text-slate-800">法定轮替情形分类 <span class="text-rose-500">*</span></span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              class="p-3 rounded-xl border cursor-pointer transition-all"
              :class="form.rotationScenario === 'DECEASED' ? 'bg-amber-50/80 border-amber-500 shadow-xs' : 'bg-white border-slate-200'"
              @click="form.rotationScenario = 'DECEASED'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">1. 已故代理的代理权轮替</span>
                <el-tag size="small" type="warning" effect="plain">12个月时限</el-tag>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">
                代理人不幸去世，居住在同地区的继承人依法申请继承轮替。
              </p>
            </div>

            <div
              class="p-3 rounded-xl border cursor-pointer transition-all"
              :class="form.rotationScenario === 'VOLUNTARY' ? 'bg-blue-50/80 border-blue-500 shadow-xs' : 'bg-white border-slate-200'"
              @click="form.rotationScenario = 'VOLUNTARY'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">2. 应代理申请的自愿轮替</span>
                <el-tag size="small" type="primary" effect="plain">生前转让</el-tag>
              </div>
              <p class="text-[11px] text-slate-500 mt-1">
                原代理年迈或申请自愿放弃，在法务部门提交放弃申请并转让给三代内亲属。
              </p>
            </div>
          </div>
        </div>

        <!-- 目标网点与原代理 -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <el-icon class="text-blue-600"><Shop /></el-icon>
            <span>拟办理轮替的原代理网点</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span class="block text-xs font-semibold text-slate-600 mb-1">选择网点中心 <span class="text-rose-500">*</span></span>
              <el-select v-model="form.centerId" placeholder="选择网点 (支持输入关键字搜索)" class="w-full" filterable>
                <el-option
                  v-for="c in centerOptions"
                  :key="c.centerId"
                  :label="`[${c.province}] ${c.city ? c.city + ' - ' : ''}${c.centerName} (${c.status})`"
                  :value="c.centerId"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span>
                      <span v-if="c.isArticle140" class="text-amber-500 font-bold mr-1">★</span>{{ c.centerName }}
                      <span v-if="c.city" class="text-[11px] text-slate-400 ml-1">({{ c.province }} · {{ c.city }})</span>
                    </span>
                    <div class="flex items-center gap-1">
                      <el-tag v-if="c.isArticle140" size="small" type="warning" effect="dark" class="scale-90">140号决议</el-tag>
                      <el-tag size="small" :type="c.status === '已被代理' ? 'danger' : 'success'">{{ c.status }}</el-tag>
                    </div>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div>
              <span class="block text-xs font-semibold text-slate-600 mb-1">原持权代理人姓名</span>
              <el-input v-model="form.originalAgentName" placeholder="例如：纳赛尔·贾巴尔" />
            </div>
          </div>

          <!-- 已故特定时限填写 -->
          <div v-if="form.rotationScenario === 'DECEASED'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <span class="block text-xs font-semibold text-slate-600 mb-1">代理死亡日期 (起算12个月完成红线) <span class="text-rose-500">*</span></span>
              <el-date-picker
                v-model="form.deceasedDate"
                type="date"
                placeholder="选择死亡日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>
            <div>
              <span class="block text-xs font-semibold text-slate-600 mb-1">逝者配给份额注销日期 (4个月红线) <span class="text-rose-500">*</span></span>
              <el-date-picker
                v-model="form.quotaDeductionDate"
                type="date"
                placeholder="选择份额注销日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- 受让方亲属资格核查 -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <el-icon class="text-blue-600"><User /></el-icon>
            <span>拟接任亲属资格与三代血亲审查</span>
          </h4>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="block text-xs text-slate-600 mb-1">受让人姓名 <span class="text-rose-500">*</span></span>
              <el-input v-model="form.successorName" placeholder="受让人全名" />
            </div>
            <div>
              <span class="block text-xs text-slate-600 mb-1">与原代理人亲属关系 <span class="text-rose-500">*</span></span>
              <el-select v-model="form.successorKinship" class="w-full">
                <el-option label="配偶 (妻子 - 享免声明特权)" value="WIFE" />
                <el-option label="配偶 (丈夫 - 享免声明特权)" value="HUSBAND" />
                <el-option label="直系子女 (第一代/第二代亲属)" value="CHILD" />
                <el-option label="父母 (直系亲属)" value="PARENT" />
                <el-option label="兄弟姐妹 (三代以内旁系亲属)" value="SIBLING" />
              </el-select>
            </div>
            <div>
              <span class="block text-xs text-slate-600 mb-1">受让人国民身份证号 <span class="text-rose-500">*</span></span>
              <el-input v-model="form.successorNationalId" placeholder="12位国民编号" />
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200/60 space-y-2 text-xs text-slate-700">
            <el-checkbox v-model="form.isResidentInDistrict">
              <strong>同区域居住核验</strong>：申请人确与原代理人居住在同一地区辖区，并有家庭底账为据。
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.isDevotedCommitment">
              <strong>专职经营公证承诺</strong>：全力投入代理事务管理，非雇员、军人、学生、退休人员、公司股东，不领国家工资。
            </el-checkbox>
            <br />
            <el-checkbox v-model="form.isNotAgentOfAgent">
              <strong>排他合规承诺</strong>：受让人绝非作为“代理的代理人”之三代以内亲属。
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 2: 上传对应证明附件 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 1" class="space-y-4">
        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800">
          依据《代理权继承与法务转让条例》，系统已根据受让人身份自动配置所需材料清单：
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <!-- 附件 1 -->
          <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">1. 教法分割证书 (qassam shar'i) <span class="text-rose-500">*</span></span>
              <el-tag size="small" type="success" effect="plain">合法继承</el-tag>
            </div>
            <p class="text-[11px] text-slate-500">载明代理全体合法继承人姓名与法教份额认证文件。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docQassam', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传教法继承证书</el-button>
              </el-upload>
              <span class="text-[11px] text-emerald-600 font-medium truncate">{{ docs.docQassam?.name || '已自动加载默认证书' }}</span>
            </div>
          </div>

          <!-- 附件 2：放弃声明 (针对妻子免予提交) -->
          <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">2. 法务部门放弃声明 / 特别授权书</span>
              <el-tag size="small" :type="isExemptWaiver ? 'info' : 'success'" effect="plain">
                {{ isExemptWaiver ? '依法免予提交' : '必需' }}
              </el-tag>
            </div>
            <p class="text-[11px] text-slate-500">
              <span v-if="isExemptWaiver" class="text-amber-700 font-bold">
                【法规特权豁免】：轮替给已故代理妻子或已故女性之丈夫，依法无需提交其他继承人放弃声明！
              </span>
              <span v-else>
                继承人在食品/谷物公司法务部门出具的放弃声明或特别授权书。
              </span>
            </p>
            <div class="flex items-center gap-2">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :disabled="isExemptWaiver"
                @change="(f) => handleFileChange('docWaiver', f)"
              >
                <el-button size="small" :type="isExemptWaiver ? 'info' : 'primary'" plain :disabled="isExemptWaiver">
                  <el-icon class="mr-1"><Upload /></el-icon>{{ isExemptWaiver ? '免提交' : '上传放弃声明' }}
                </el-button>
              </el-upload>
              <span class="text-[11px] text-slate-400 font-medium truncate">
                {{ isExemptWaiver ? '依法豁免' : (docs.docWaiver?.name || '已上传放弃声明公证书') }}
              </span>
            </div>
          </div>

          <!-- 附件 3 -->
          <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">3. 死亡证明及逝者份额注销报告 <span class="text-rose-500">*</span></span>
              <el-tag size="small" type="success" effect="plain">注销凭证</el-tag>
            </div>
            <p class="text-[11px] text-slate-500">卫生部死亡证明及4个月内逝者配给份额注销报告（注销报告）。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docDeath', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传注销回执</el-button>
              </el-upload>
              <span class="text-[11px] text-emerald-600 font-medium truncate">{{ docs.docDeath?.name || '已上传份额注销回执' }}</span>
            </div>
          </div>

          <!-- 附件 4 -->
          <div class="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800">4. 专职投入与公证处承诺书 <span class="text-rose-500">*</span></span>
              <el-tag size="small" type="success" effect="plain">专职公证</el-tag>
            </div>
            <p class="text-[11px] text-slate-500">经按捺拇指印并由有权限公证人正式认证的书面专职承诺。</p>
            <div class="flex items-center gap-2">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" @change="(f) => handleFileChange('docCommitment', f)">
                <el-button size="small" type="primary" plain><el-icon class="mr-1"><Upload /></el-icon>上传公证承诺</el-button>
              </el-upload>
              <span class="text-[11px] text-emerald-600 font-medium truncate">{{ docs.docCommitment?.name || '已上传按印公证书' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 3: 时限审查与法务部审核 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 2" class="space-y-4">
        <!-- 时限合格研判卡片 -->
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
          <div class="flex items-center gap-2 text-emerald-800 font-bold">
            <el-icon class="text-base"><CircleCheckFilled /></el-icon>
            <span>法定办理时限研判结果：完全符合规程</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-900">
            <div>• 代理轮替完成周期：自死亡起 2 个月（法定上限 12 个月内，达标）</div>
            <div>• 逝者配额注销报告：死亡后 45 天完成注销（法定上限 4 个月内，达标）</div>
          </div>
        </div>

        <!-- 公司法务与规划跟进司审查意见 -->
        <div class="bg-white border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
          <h4 class="font-bold text-slate-800 flex items-center gap-1.5">
            <el-icon class="text-amber-600"><Stamp /></el-icon>
            <span>食品与谷物加工公司法务部 / 规划与跟进司联合审核结论</span>
          </h4>

          <div class="space-y-2">
            <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span class="font-medium text-slate-700">1. 食品与谷物加工总公司法务部</span>
              <span class="text-emerald-600 font-bold flex items-center gap-1"><el-icon><Check /></el-icon>教法分割与合法继承人资格合规审验通过</span>
            </div>
            <div class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span class="font-medium text-slate-700">2. 规划与跟进司配额清算科</span>
              <span class="text-emerald-600 font-bold flex items-center gap-1"><el-icon><Check /></el-icon>逝者名下份额清零核查无误，准予换发</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 4: 电子规费支付与完成转移 -->
      <!-- ======================================================== -->
      <div v-if="activeStep === 3" class="space-y-4">
        <div class="p-4 bg-slate-900 text-white rounded-xl space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span class="text-xs text-slate-400 block">法定轮替规费收取机构</span>
              <span class="text-sm font-bold text-amber-400">规划与跟进司 / 代理分支管理科</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400 block">应缴纳法定轮替规费</span>
              <span class="text-xl font-bold font-mono text-emerald-400">50,000 IQD</span>
              <span class="text-[10px] text-slate-400 block">(五万伊拉克第纳尔)</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div>原持权人：{{ form.originalAgentName }}</div>
            <div>新受让亲属：{{ form.successorName }} ({{ kinshipLabel }})</div>
            <div>目标中心：{{ selectedCenter?.centerName }}</div>
            <div>业务情形：{{ form.rotationScenario === 'DECEASED' ? '已故亲属轮替' : '生前申请自愿转让' }}</div>
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <span class="block font-bold text-slate-800">选择伊拉克国家电子支付通道：</span>
          <div class="grid grid-cols-3 gap-3">
            <div
              class="p-3 rounded-xl border cursor-pointer text-center transition-all"
              :class="payChannel === 'QI_CARD' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-600'"
              @click="payChannel = 'QI_CARD'"
            >
              <div class="text-sm font-bold">QI Card</div>
              <div class="text-[10px] text-slate-400 mt-1">国家银联数字卡</div>
            </div>
            <div
              class="p-3 rounded-xl border cursor-pointer text-center transition-all"
              :class="payChannel === 'ZAIN_CASH' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-600'"
              @click="payChannel = 'ZAIN_CASH'"
            >
              <div class="text-sm font-bold">ZainCash</div>
              <div class="text-[10px] text-slate-400 mt-1">移动电子钱包</div>
            </div>
            <div
              class="p-3 rounded-xl border cursor-pointer text-center transition-all"
              :class="payChannel === 'CENTRAL_BANK' ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs' : 'bg-white border-slate-200 text-slate-600'"
              @click="payChannel = 'CENTRAL_BANK'"
            >
              <div class="text-sm font-bold">国库专户直联</div>
              <div class="text-[10px] text-slate-400 mt-1">财政统一清算号</div>
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
            确认电子支付 50,000 IQD 并换发代理许可证
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
import { ElMessage } from 'element-plus';
import { submitAgentRotationApplication, payAgentApplicationFee } from '../../../api/agent.js';
import {
  InfoFilled,
  Shop,
  User,
  Upload,
  Stamp,
  CircleCheckFilled,
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
  rotationScenario: 'DECEASED', // DECEASED 或 VOLUNTARY
  centerId: '',
  originalAgentName: '纳赛尔·贾巴尔 (已故)',
  deceasedDate: '2026-08-10',
  quotaDeductionDate: '2026-09-20',
  successorName: '穆斯塔法·纳赛尔·贾巴尔',
  successorKinship: 'CHILD',
  successorNationalId: '198805120042',
  isResidentInDistrict: true,
  isDevotedCommitment: true,
  isNotAgentOfAgent: true
});

const docs = reactive({
  docQassam: { name: '教法分割证书(qassam shar-i).pdf' },
  docWaiver: { name: '继承人法务部放弃声明书.pdf' },
  docDeath: { name: '死亡证明与4个月内份额注销报告.pdf' },
  docCommitment: { name: '公证专职承诺书.pdf' }
});

function syncBilingualDefaults() {
  if (isEn.value) {
    form.originalAgentName = 'Nasser Jabbar (Deceased)';
    form.successorName = 'Mustafa Nasser Jabbar';
    docs.docQassam = { name: 'Qassam_Shar-i_Inheritance_Certificate.pdf' };
    docs.docWaiver = { name: 'Heirs_Legal_Waiver_Declaration.pdf' };
    docs.docDeath = { name: 'Death_Certificate_and_Deduction_Report.pdf' };
    docs.docCommitment = { name: 'Notarized_Commitment_Letter.pdf' };
  } else {
    form.originalAgentName = '纳赛尔·贾巴尔 (已故)';
    form.successorName = '穆斯塔法·纳赛尔·贾巴尔';
    docs.docQassam = { name: '教法分割证书(qassam shar-i).pdf' };
    docs.docWaiver = { name: '继承人法务部放弃声明书.pdf' };
    docs.docDeath = { name: '死亡证明与4个月内份额注销报告.pdf' };
    docs.docCommitment = { name: '公证专职承诺书.pdf' };
  }
}

watch(isEn, () => syncBilingualDefaults(), { immediate: true });

const selectedCenter = computed(() => {
  return props.centerOptions.find((c) => c.centerId === form.centerId);
});

// 若轮替给妻子或已故女性之丈夫，依法免予继承人放弃声明
const isExemptWaiver = computed(() => {
  return form.successorKinship === 'WIFE' || form.successorKinship === 'HUSBAND';
});

const kinshipLabel = computed(() => {
  const map = {
    WIFE: '妻子',
    HUSBAND: '丈夫',
    CHILD: '子女',
    PARENT: '父母',
    SIBLING: '兄弟姐妹'
  };
  return map[form.successorKinship] || '亲属';
});

const canProceedNextStep = computed(() => {
  if (activeStep.value === 0) {
    if (!form.centerId || !form.successorName || !form.successorNationalId) return false;
    if (!form.isResidentInDistrict || !form.isDevotedCommitment || !form.isNotAgentOfAgent) return false;
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
    const res = await submitAgentRotationApplication({
      ...form,
      isWifeSuccession: isExemptWaiver.value
    });

    await payAgentApplicationFee(res.ticketNo, { channel: payChannel.value });

    ElMessage.success({
      message: (isEnNow() ? 'Agency rotation application has taken effect; the 50,000 IQD fee was paid successfully and the legal operator has been updated!' : '代理权轮替申请已生效，50,000 IQD 规费缴纳成功，已更新法定经营负责人！'),
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
  }
}

defineExpose({ open });
</script>
