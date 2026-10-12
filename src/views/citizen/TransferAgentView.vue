<template>
  <div class="transfer-agent-view space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <el-icon class="text-blue-600"><Switch /></el-icon>
            <span>申请配给卡代理转移 (就近获取与迁居转网)</span>
          </h2>
          <p class="text-xs text-slate-500 mt-1">
            允许持卡公民因居住地变更或就近获取配给物资需要，将配给卡转移至新的面粉及食品代理。
          </p>
        </div>
        <el-button size="small" plain @click="$router.push('/citizen')">
          <el-icon class="mr-1"><Back /></el-icon>
          返回公民服务
        </el-button>
      </div>

      <!-- 当前家庭配给卡与原代理存根概览 -->
      <div v-if="citizenStore.currentFamily" class="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">电子配给卡号：</span>
          <span class="font-mono font-bold text-blue-600">{{ citizenStore.currentFamily.rationCardNo }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">法定户主姓名：</span>
          <span class="font-bold text-slate-800">{{ citizenStore.currentFamily.headName }} ({{ citizenStore.currentFamily.memberCount }} 人)</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">当前所在省份：</span>
          <span class="font-medium text-slate-800">{{ currentFromProvince }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">当前签约代销网点：</span>
          <span class="font-medium text-amber-700 truncate block">{{ citizenStore.currentFamily.agentName }}</span>
        </div>
      </div>

      <!-- 顶部步骤条导航 (清晰展示当前进度) -->
      <div class="py-2">
        <el-steps :active="currentStep - 1" finish-status="success" align-center>
          <el-step title="第一步" description="选择目标代理网点" />
          <el-step title="第二步" description="新居住信息与证明" />
          <el-step title="第三步" description="第140号决议核验" />
          <el-step title="第四步" description="电子支付与提交" />
        </el-steps>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 1: 选择目标分部、中心及代理 (带 1,500 户容量红线监控) -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 1" class="space-y-4 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
            <span>选择拟转入的目标配给分部、中心及代理网点</span>
            <el-tag size="small" type="danger" effect="plain" class="scale-90">1,500 户容量红线监控</el-tag>
          </label>
          <span class="text-xs text-slate-400">面粉代理与食品代理独立核算容量</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">目标行政省份</span>
            <el-select v-model="targetProvince" class="w-full" size="large" @change="handleProvinceChange">
              <el-option
                v-for="prov in provinceOptions"
                :key="prov.province"
                :label="prov.province"
                :value="prov.province"
              />
            </el-select>
          </div>

          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">配给分部</span>
            <el-select v-model="targetBranchName" class="w-full" size="large" @change="handleBranchChange">
              <el-option
                v-for="branch in currentBranchList"
                :key="branch.branchName"
                :label="branch.branchName"
                :value="branch.branchName"
              />
            </el-select>
          </div>

          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">配给中心</span>
            <el-select v-model="targetCenterId" class="w-full" size="large" @change="handleCenterChange">
              <el-option
                v-for="cnt in currentCenterList"
                :key="cnt.centerId"
                :label="`${cnt.centerName} (#${cnt.centerId})`"
                :value="cnt.centerId"
              />
            </el-select>
          </div>
        </div>

        <!-- 路径快速感知提示 -->
        <div
          class="p-3 rounded-xl border text-xs flex items-center justify-between"
          :class="isSameProvince ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'"
        >
          <div class="flex items-center gap-2">
            <el-icon><Compass /></el-icon>
            <span>
              目标省份为【{{ targetProvince }}】，属于【<strong>{{ isSameProvince ? '省内转移' : '跨省转移' }}</strong>】
              ({{ isSameProvince ? '系统全自动批准生效' : '需转入分部两级电子审核' }})
            </span>
          </div>
          <el-tag :type="isSameProvince ? 'success' : 'warning'" size="small">
            {{ isSameProvince ? '自动路径' : '电子审核' }}
          </el-tag>
        </div>

        <!-- 双代理选择：面粉代理 & 食品代理 -->
        <div v-if="selectedCenter" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <!-- 面粉代理网点选择 -->
          <div class="border rounded-2xl p-4 space-y-3 bg-slate-50/70 border-slate-200">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span class="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span>拟选面粉代销网点</span>
                <span class="text-[11px] text-slate-400 font-normal">(上限 1,500 户)</span>
              </span>
              <el-tag size="small" type="warning" effect="dark">面粉保供</el-tag>
            </div>

            <el-radio-group v-model="selectedFlourAgentId" class="w-full space-y-2 flex flex-col">
              <div
                v-for="ag in selectedCenter.flourAgents"
                :key="ag.id"
                class="p-3 rounded-xl border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                :class="[
                  selectedFlourAgentId === ag.id ? 'border-amber-500 ring-1 ring-amber-500 shadow-2xs' : 'border-slate-200 hover:border-slate-300',
                  ag.currentHouseholds >= 1500 ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''
                ]"
              >
                <el-radio :label="ag.id" :disabled="ag.currentHouseholds >= 1500">
                  <span class="font-bold text-slate-800">{{ ag.name }}</span>
                  <span class="text-[11px] text-slate-400 block mt-0.5">责任人: {{ ag.manager }}</span>
                </el-radio>

                <div class="text-right shrink-0">
                  <span
                    class="font-mono font-bold text-xs"
                    :class="ag.currentHouseholds >= 1500 ? 'text-rose-600' : 'text-blue-600'"
                  >
                    {{ ag.currentHouseholds }} / {{ ag.maxCapacity }} 户
                  </span>
                  <el-tag
                    v-if="ag.currentHouseholds >= 1500"
                    size="small"
                    type="danger"
                    effect="dark"
                    class="scale-90 origin-right block mt-0.5"
                  >
                    已满额禁止转入
                  </el-tag>
                  <span v-else class="text-[10px] text-emerald-600 block">容量充裕 ✓</span>
                </div>
              </div>
            </el-radio-group>
          </div>

          <!-- 食品代理网点选择 -->
          <div class="border rounded-2xl p-4 space-y-3 bg-slate-50/70 border-slate-200">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span>拟选食品代销网点</span>
                <span class="text-[11px] text-slate-400 font-normal">(上限 1,500 户)</span>
              </span>
              <el-tag size="small" type="primary" effect="dark">粮油副食保供</el-tag>
            </div>

            <el-radio-group v-model="selectedFoodAgentId" class="w-full space-y-2 flex flex-col">
              <div
                v-for="ag in selectedCenter.foodAgents"
                :key="ag.id"
                class="p-3 rounded-xl border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                :class="[
                  selectedFoodAgentId === ag.id ? 'border-blue-500 ring-1 ring-blue-500 shadow-2xs' : 'border-slate-200 hover:border-slate-300',
                  ag.currentHouseholds >= 1500 ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''
                ]"
              >
                <el-radio :label="ag.id" :disabled="ag.currentHouseholds >= 1500">
                  <span class="font-bold text-slate-800">{{ ag.name }}</span>
                  <span class="text-[11px] text-slate-400 block mt-0.5">责任人: {{ ag.manager }}</span>
                </el-radio>

                <div class="text-right shrink-0">
                  <span
                    class="font-mono font-bold text-xs"
                    :class="ag.currentHouseholds >= 1500 ? 'text-rose-600' : 'text-blue-600'"
                  >
                    {{ ag.currentHouseholds }} / {{ ag.maxCapacity }} 户
                  </span>
                  <el-tag
                    v-if="ag.currentHouseholds >= 1500"
                    size="small"
                    type="danger"
                    effect="dark"
                    class="scale-90 origin-right block mt-0.5"
                  >
                    已满额禁止转入
                  </el-tag>
                  <span v-else class="text-[10px] text-emerald-600 block">容量充裕 ✓</span>
                </div>
              </div>
            </el-radio-group>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 2: 录入新居住信息与上传居住证明 -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 2" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">2</span>
            <span>录入新常住地址信息并上传居住证明文件</span>
          </label>
          <span class="text-xs text-rose-500">* 为法定必填材料</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">行政区 (District) <span class="text-rose-500">*</span></span>
            <el-input v-model="residenceForm.district" size="large" placeholder="例如：曼苏尔区 / 辛贾尔镇" />
          </div>
          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">乡 / 街区 (Sub-district) <span class="text-rose-500">*</span></span>
            <el-input v-model="residenceForm.subDistrict" size="large" placeholder="例如：第14住宅大街 / 商业区" />
          </div>
          <div>
            <span class="block text-xs font-semibold text-slate-600 mb-1.5">最近显著地标 (Landmark) <span class="text-rose-500">*</span></span>
            <el-input v-model="residenceForm.nearestLandmark" size="large" placeholder="例如：中央大清真寺东侧200米" />
          </div>
        </div>

        <!-- 居住证明文件上传模块 (必需材料) -->
        <div class="pt-2">
          <DocumentUploader
            v-model="residenceProofUploaded"
            title="居住证或官方居住确认公证书 (必需)"
            subtitle="请上传由内政部居住署、当地市政委员会或治安官签发的常住地址公证书"
            is-required
            category-badge="居住凭证"
            issuer="内政部居住署 / 市政委员会"
            default-file-name="公民常住新地址居住确认公函_2026.pdf"
          />
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 3: 第 140 号决议合规核验 (特定争议领土强制要求) -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 3" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">3</span>
            <span>宪法第 140 号决议特定区域合规核验</span>
          </label>
          <el-tag :type="requiresArticle140 ? 'danger' : 'success'" size="small">
            {{ requiresArticle140 ? '涉及第140号决议：强制无异议公文' : '未涉及争议领土：免予提交' }}
          </el-tag>
        </div>

        <!-- 涉及第 140 号决议的警示与上传模块 -->
        <div v-if="requiresArticle140" class="space-y-4">
          <div class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5">
            <div class="font-bold flex items-center gap-1.5 text-sm text-rose-900">
              <el-icon><WarningFilled /></el-icon>
              <span>重要法令合规提示：命中第 140 号决议监管区域</span>
            </div>
            <p class="leading-relaxed">
              检测到您拟转入或当前转出的区域属于<strong>伊拉克宪法第 140 号决议所覆盖之省份与中心</strong>（迪亚拉省哈奈根/贾劳拉、尼尼微省辛贾尔/祖马尔、萨拉赫丁省图兹或基尔库克全境）。依据国家特别法令，必须提交<strong>第 140 号决议无异议批文 (No-Objection Certificate)</strong>方可受理流转。
            </p>
          </div>

          <DocumentUploader
            v-model="article140Uploaded"
            title="第 140 号决议官方无异议批文 (No-Objection Certificate)"
            subtitle="请上传由联邦内政部与第140号决议实施委员会签发的跨区转移无异议官方公函"
            is-required
            category-badge="第140号决议文书"
            issuer="第140号决议最高实施委员会"
            default-file-name="第140号决议无异议执行批文_2026.pdf"
          />
        </div>

        <!-- 不涉及第 140 号决议的友好提示 -->
        <div v-else class="p-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs space-y-3">
          <div class="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <el-icon class="text-emerald-600" :size="18"><CircleCheckFilled /></el-icon>
            <span>经系统智能地理比对：未涵盖在第 140 号决议争议清单内</span>
          </div>
          <p class="text-emerald-700 leading-relaxed">
            您当前的原所属省份（{{ currentFromProvince }}）与拟转入网点（{{ targetProvince }} · {{ targetBranchName }}）均不属于宪法第 140 号决议覆盖区域，依法<strong>免于提交第 140 号决议无异议批文</strong>，可直接进入下一步办理。
          </p>
          <div>
            <el-tag type="success" effect="dark" size="small">法定免除通过 (EXEMPTED ✓)</el-tag>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 步骤 4: 确认信息与规费电子支付 -->
      <!-- ======================================================== -->
      <div v-show="currentStep === 4" class="space-y-5 animate-fade-in">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <label class="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">4</span>
            <span>核对申请摘要并扫码完成电子支付</span>
          </label>
          <el-tag :type="isSameProvince ? 'success' : 'warning'" effect="dark">
            {{ isSameProvince ? '省内自动审批生效' : '跨省两级电子审核' }}
          </el-tag>
        </div>

        <!-- 申请明细摘要核对卡 -->
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">目标省份与分部：</span>
            <span class="font-bold text-slate-800">{{ targetProvince }} / {{ targetBranchName }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">拟签约面粉代理：</span>
            <span class="font-bold text-amber-800">{{ currentSelectedFlourAgent?.name }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">拟签约食品代理：</span>
            <span class="font-bold text-blue-800">{{ currentSelectedFoodAgent?.name }}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">新常住地标：</span>
            <span class="font-bold text-slate-800 truncate block">{{ residenceForm.nearestLandmark }}</span>
          </div>
        </div>

        <!-- 规费账单提示 -->
        <div class="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="text-xs text-slate-400">配给卡转网与数据同步法定公文规费：</div>
            <div class="text-2xl font-bold font-mono text-emerald-400">
              5,000 IQD <span class="text-xs text-slate-400 font-normal">(伊拉克第纳尔)</span>
            </div>
            <div class="text-[11px] text-slate-400">
              支持国家 Qi Card 电子支付钱包、ZainCash 扫码支付
            </div>
          </div>
          <div>
            <el-tag type="success" effect="dark" size="small">
              规费核定就绪 ✓
            </el-tag>
          </div>
        </div>

        <!-- 引导进行扫码支付卡片 -->
        <div class="p-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <el-icon :size="24"><CreditCard /></el-icon>
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900">最后一步：进行电子支付并提交</h4>
            <p class="text-xs text-slate-500 mt-1">
              点击下方按钮将打开电子支付二维码收银台，手机扫码付款通过后，系统将正式受理
            </p>
          </div>
          <el-button
            type="success"
            size="large"
            class="px-8 font-bold shadow-md bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
            :loading="submitting"
            @click="handleOpenPaymentDialog"
          >
            <el-icon class="mr-1.5"><Cellphone /></el-icon>
            打开电子支付二维码并完成付款
          </el-button>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 底部步骤切换操作栏 (上一步 / 下一步) -->
      <!-- ======================================================== -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <el-button
          v-if="currentStep > 1"
          size="large"
          @click="handlePrevStep"
        >
          <el-icon class="mr-1"><Back /></el-icon>
          上一步
        </el-button>
        <div v-else />

        <div>
          <el-button
            v-if="currentStep < 4"
            type="primary"
            size="large"
            class="px-6 font-bold"
            @click="handleNextStep"
          >
            下一步
            <el-icon class="ml-1"><Right /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 通用电子支付二维码收银台弹窗 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      title="配给卡代理转移转网行政规费"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import { getTransferOptions, submitTransferAgent } from '../../api/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import {
  Switch,
  Back,
  Right,
  Compass,
  WarningFilled,
  CircleCheckFilled,
  CreditCard,
  Cellphone
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const citizenStore = useCitizenStore();

// 当前向导步骤：1 | 2 | 3 | 4
const currentStep = ref(1);

const submitting = ref(false);
const paymentDialogVisible = ref(false);
const provinceOptions = ref([]);

// 目标省份/分部/中心/代理选择状态
const targetProvince = ref('巴格达省 (Baghdad)');
const targetBranchName = ref('');
const targetCenterId = ref('');
const selectedFlourAgentId = ref('');
const selectedFoodAgentId = ref('');

// 新居住信息表单
const residenceForm = reactive({
  district: '卡尔赫区曼苏尔街区',
  subDistrict: '第14住宅大街',
  nearestLandmark: '中央大清真寺西侧'
});

// 证明文件状态
const residenceProofUploaded = ref(true);
const article140Uploaded = ref(true);

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  await loadTransferOptions();
});

// 当前家庭原省份
const currentFromProvince = computed(() => {
  return citizenStore.currentFamily?.province || '巴格达省 (Baghdad)';
});

// 是否为省内转移 (同一省份自动审批，跨省两级电子审核)
const isSameProvince = computed(() => {
  const fromP = currentFromProvince.value.split(' ')[0];
  const toP = targetProvince.value.split(' ')[0];
  return fromP === toP;
});

// 当前选中的省份对象
const selectedProvinceObj = computed(() => {
  return provinceOptions.value.find((p) => p.province === targetProvince.value);
});

// 分部列表
const currentBranchList = computed(() => {
  return selectedProvinceObj.value?.branches || [];
});

// 当前选中的分部对象
const selectedBranchObj = computed(() => {
  return currentBranchList.value.find((b) => b.branchName === targetBranchName.value);
});

// 中心列表
const currentCenterList = computed(() => {
  return selectedBranchObj.value?.centers || [];
});

// 当前选中的中心对象
const selectedCenter = computed(() => {
  return currentCenterList.value.find((c) => c.centerId === targetCenterId.value);
});

const currentSelectedFlourAgent = computed(() => {
  return selectedCenter.value?.flourAgents.find((a) => a.id === selectedFlourAgentId.value);
});

const currentSelectedFoodAgent = computed(() => {
  return selectedCenter.value?.foodAgents.find((a) => a.id === selectedFoodAgentId.value);
});

// 核心规则：第 140 号决议判断
const requiresArticle140 = computed(() => {
  const toCenterIs140 = selectedCenter.value?.isArticle140;
  const fromIs140 =
    currentFromProvince.value.includes('基尔库克') ||
    currentFromProvince.value.includes('迪亚拉') ||
    currentFromProvince.value.includes('尼尼微');
  return !!(toCenterIs140 || fromIs140);
});

async function loadTransferOptions() {
  try {
    const data = await getTransferOptions();
    provinceOptions.value = data || [];
    if (data && data.length > 0) {
      targetProvince.value = data[0].province;
      handleProvinceChange();
    }
  } catch (err) {
    ElMessage.error('加载转网候选代理网点失败');
  }
}

function handleProvinceChange() {
  if (currentBranchList.value.length > 0) {
    targetBranchName.value = currentBranchList.value[0].branchName;
    handleBranchChange();
  }
}

function handleBranchChange() {
  if (currentCenterList.value.length > 0) {
    targetCenterId.value = currentCenterList.value[0].centerId;
    handleCenterChange();
  }
}

function handleCenterChange() {
  if (selectedCenter.value) {
    const validFlour = selectedCenter.value.flourAgents.find((a) => a.currentHouseholds < 1500);
    selectedFlourAgentId.value = validFlour ? validFlour.id : '';

    const validFood = selectedCenter.value.foodAgents.find((a) => a.currentHouseholds < 1500);
    selectedFoodAgentId.value = validFood ? validFood.id : '';
  }
}

// ========================
// 步骤切换与严格前置校验
// ========================
function handlePrevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function handleNextStep() {
  // 校验步骤 1
  if (currentStep.value === 1) {
    if (!targetBranchName.value || !targetCenterId.value) {
      ElMessage.warning('请选择拟转入的目标配给分部与配给中心');
      return;
    }
    if (!selectedFlourAgentId.value || !selectedFoodAgentId.value) {
      ElMessage.warning('请选择面粉代销网点和食品代销网点');
      return;
    }
    const flourAg = currentSelectedFlourAgent.value;
    const foodAg = currentSelectedFoodAgent.value;
    if (flourAg?.currentHouseholds >= 1500) {
      ElMessage.error(`面粉代理【${flourAg.name}】已达到 1,500 户上限，禁止转入！`);
      return;
    }
    if (foodAg?.currentHouseholds >= 1500) {
      ElMessage.error(`食品代理【${foodAg.name}】已达到 1,500 户上限，禁止转入！`);
      return;
    }
    currentStep.value = 2;
    return;
  }

  // 校验步骤 2
  if (currentStep.value === 2) {
    if (!residenceForm.district || !residenceForm.subDistrict || !residenceForm.nearestLandmark) {
      ElMessage.warning('请完整填写新常住行政区、街区及最近地标');
      return;
    }
    if (!residenceProofUploaded.value) {
      ElMessage.warning('请上传必需的新居住地有效居住证明公函');
      return;
    }
    currentStep.value = 3;
    return;
  }

  // 校验步骤 3
  if (currentStep.value === 3) {
    if (requiresArticle140.value && !article140Uploaded.value) {
      ElMessage.warning('涉及第 140 号决议争议领土，必须上传第 140 号决议无异议官方公函！');
      return;
    }
    currentStep.value = 4;
  }
}

// 唤起电子支付二维码
function handleOpenPaymentDialog() {
  paymentDialogVisible.value = true;
}

// 支付成功回调：正式提交系统流转
async function handlePaymentSuccess(paymentInfo) {
  submitting.value = true;
  try {
    const payload = {
      cardNo: citizenStore.currentFamily?.rationCardNo,
      fromProvince: currentFromProvince.value,
      toProvince: targetProvince.value,
      toBranch: targetBranchName.value,
      toCenter: selectedCenter.value,
      toFlourAgent: currentSelectedFlourAgent.value,
      toFoodAgent: currentSelectedFoodAgent.value,
      district: residenceForm.district,
      subDistrict: residenceForm.subDistrict,
      nearestLandmark: residenceForm.nearestLandmark,
      residenceProofDoc: '新居所官方确认公函_2026.pdf',
      article140Doc: requiresArticle140.value ? '第140号决议无异议执行批文_2026.pdf' : '',
      paymentInfo
    };

    const res = await submitTransferAgent(payload);

    if (res.autoApproved) {
      await ElMessageBox.alert(
        res.message || '恭喜！省内转移已全自动审批通过并即刻生效，配给卡上的供货网点与代理信息已刷新。',
        '省内转移自动批准通过 ✓',
        { confirmButtonText: '查看我的配给卡', type: 'success' }
      );
      await citizenStore.fetchFamilies();
      router.push('/citizen');
    } else {
      await ElMessageBox.alert(
        res.message || `跨省代理转移申报已受理！工单号【${res.ticketId}】，已流转至目标分部审核工作台，请等待分部员工与经理两级终审。`,
        '跨省转移已提交电子审核 ⏳',
        { confirmButtonText: '确定并返回', type: 'info' }
      );
      router.push('/citizen');
    }
  } catch (err) {
    // handled by axios interceptor
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
