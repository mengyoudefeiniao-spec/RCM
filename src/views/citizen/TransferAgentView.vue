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

      <!-- 业务路径与容量红线规则须知条 -->
      <div class="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs" :class="isSameProvince ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'">
        <div class="flex items-center gap-2">
          <el-icon :size="16"><Compass /></el-icon>
          <div>
            <strong>转移路径判别：</strong>
            <span v-if="isSameProvince">
              当前为【<strong>省内转移</strong>】，即使跨越不同分部，系统也将执行<strong>全自动即时批准生效</strong>。
            </span>
            <span v-else>
              当前为【<strong>跨省转移</strong>】({{ currentFromProvince }} → {{ targetProvince }})，申请将转交<strong>卡片转入分部两级电子审核</strong>。
            </span>
          </div>
        </div>
        <el-tag :type="isSameProvince ? 'success' : 'warning'" effect="dark" class="shrink-0 font-bold">
          {{ isSameProvince ? '省内自动审批' : '跨省两级电子审核' }}
        </el-tag>
      </div>

      <!-- 主体表单 -->
      <div class="space-y-6">
        <!-- ======================================================== -->
        <!-- 步骤 1: 选择目标分部、中心及代理 (带 1,500 户容量红线监控) -->
        <!-- ======================================================== -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>第一步：选择拟转入的配给分部、中心及代理</span>
              <el-tag size="small" type="danger" effect="plain" class="scale-90">1,500 户容量红线监控</el-tag>
            </label>
            <span class="text-[11px] text-slate-400">面粉代理与食品代理独立核算容量</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="block text-[11px] text-slate-500 mb-1">目标行政省份</span>
              <el-select v-model="targetProvince" class="w-full" @change="handleProvinceChange">
                <el-option
                  v-for="prov in provinceOptions"
                  :key="prov.province"
                  :label="prov.province"
                  :value="prov.province"
                />
              </el-select>
            </div>

            <div>
              <span class="block text-[11px] text-slate-500 mb-1">配给分部</span>
              <el-select v-model="targetBranchName" class="w-full" @change="handleBranchChange">
                <el-option
                  v-for="branch in currentBranchList"
                  :key="branch.branchName"
                  :label="branch.branchName"
                  :value="branch.branchName"
                />
              </el-select>
            </div>

            <div>
              <span class="block text-[11px] text-slate-500 mb-1">配给中心</span>
              <el-select v-model="targetCenterId" class="w-full" @change="handleCenterChange">
                <el-option
                  v-for="cnt in currentCenterList"
                  :key="cnt.centerId"
                  :label="`${cnt.centerName} (#${cnt.centerId})`"
                  :value="cnt.centerId"
                />
              </el-select>
            </div>
          </div>

          <!-- 双代理选择：面粉代理 & 食品代理 -->
          <div v-if="selectedCenter" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <!-- 面粉代理网点选择 -->
            <div class="border rounded-xl p-4 space-y-3 bg-slate-50">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-amber-900">拟选面粉代销网点 (上限 1,500 户)</span>
                <el-tag size="small" type="warning">面粉保供</el-tag>
              </div>

              <el-radio-group v-model="selectedFlourAgentId" class="w-full space-y-2 flex flex-col">
                <div
                  v-for="ag in selectedCenter.flourAgents"
                  :key="ag.id"
                  class="p-3 rounded-lg border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                  :class="[
                    selectedFlourAgentId === ag.id ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200',
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
            <div class="border rounded-xl p-4 space-y-3 bg-slate-50">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-blue-900">拟选食品代销网点 (上限 1,500 户)</span>
                <el-tag size="small" type="primary">粮油副食保供</el-tag>
              </div>

              <el-radio-group v-model="selectedFoodAgentId" class="w-full space-y-2 flex flex-col">
                <div
                  v-for="ag in selectedCenter.foodAgents"
                  :key="ag.id"
                  class="p-3 rounded-lg border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                  :class="[
                    selectedFoodAgentId === ag.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200',
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
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <label class="text-xs font-bold text-slate-800 block">
            第二步：录入新居住信息并上传有效居住证明文件
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span class="block text-[11px] text-slate-500 mb-1">行政区 (District) <span class="text-rose-500">*</span></span>
              <el-input v-model="residenceForm.district" placeholder="例如：曼苏尔区 / 辛贾尔镇" />
            </div>
            <div>
              <span class="block text-[11px] text-slate-500 mb-1">乡 / 街区 (Sub-district) <span class="text-rose-500">*</span></span>
              <el-input v-model="residenceForm.subDistrict" placeholder="例如：第14住宅小区 / 商业街" />
            </div>
            <div>
              <span class="block text-[11px] text-slate-500 mb-1">最近显著地标 (Landmark) <span class="text-rose-500">*</span></span>
              <el-input v-model="residenceForm.nearestLandmark" placeholder="例如：中央大清真寺东侧200米" />
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
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>第三步：宪法第 140 号决议特定区域合规核验</span>
            </label>
            <el-tag :type="requiresArticle140 ? 'danger' : 'info'" size="small">
              {{ requiresArticle140 ? '涉及第140号决议：强制无异议公文' : '未涉及争议领土：免予提交' }}
            </el-tag>
          </div>

          <!-- 涉及第 140 号决议的警示与上传模块 -->
          <div v-if="requiresArticle140" class="space-y-3">
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <div class="font-bold flex items-center gap-1.5">
                <el-icon><WarningFilled /></el-icon>
                <span>重要法令合规提示：</span>
              </div>
              <p>
                检测到您拟转入或当前转出的区域属于<strong>伊拉克宪法第 140 号决议所覆盖之争议省份与中心</strong>（如迪亚拉省哈奈根、尼尼微省辛贾尔/祖马尔、萨拉赫丁省图兹或基尔库克全境）。依据国家法令，必须上传<strong>第 140 号决议无异议批文 (No-Objection Certificate)</strong>。
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
          <div v-else class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <el-icon class="text-emerald-500"><CircleCheckFilled /></el-icon>
              <span>经系统智能地理比对，您当前原住址与拟转入网点均未涵盖在第 140 号决议清单内，免于提交此文件。</span>
            </div>
            <span class="text-[11px] text-emerald-600 font-bold font-mono">EXEMPTED ✓</span>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- 步骤 4: 规费电子支付与最终提交 -->
        <!-- ======================================================== -->
        <div class="space-y-3 pt-4 border-t border-slate-100">
          <label class="text-xs font-bold text-slate-800 block">
            第四步：电子支付规费与确认提交
          </label>

          <div class="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div class="space-y-1">
              <div class="text-slate-400">配给卡转网与数据同步法定公文规费：</div>
              <div class="text-lg font-bold font-mono text-emerald-400">
                5,000 IQD <span class="text-xs text-slate-400 font-normal">(伊拉克第纳尔)</span>
              </div>
              <div class="text-[11px] text-slate-400">
                支持国家 Qi Card 电子支付钱包或电子转账结算 · 具备电子支付方式
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <el-tag type="success" effect="dark" size="small">
                电子支付通道就绪 ✓
              </el-tag>
            </div>
          </div>

          <div class="pt-2">
            <el-button
              type="primary"
              size="large"
              class="w-full font-bold shadow-md tracking-wide"
              :loading="submitting"
              @click="handleSubmitTransfer"
            >
              {{ isSameProvince ? '确认支付 5,000 IQD 并立即生效 (省内自动批准)' : '确认支付 5,000 IQD 并提交审核 (转入跨省审核工作台)' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import { getTransferOptions, submitTransferAgent } from '../../api/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import {
  Switch,
  Back,
  Compass,
  WarningFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const citizenStore = useCitizenStore();

const submitting = ref(false);
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

// 核心规则：第 140 号决议判断
// 从或向第140号决议覆盖的省份和中心转移时必须提供无异议文件
const requiresArticle140 = computed(() => {
  // 1. 转入中心是否属于第 140 号决议
  const toCenterIs140 = selectedCenter.value?.isArticle140;
  // 2. 原省份是否属于第 140 号区域 (当前默认家庭在巴格达，非140号区域)
  const fromIs140 = currentFromProvince.value.includes('基尔库克') || currentFromProvince.value.includes('迪亚拉') || currentFromProvince.value.includes('尼尼微');
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
    // 默认选中第一个未满额的面粉代理和食品代理
    const validFlour = selectedCenter.value.flourAgents.find((a) => a.currentHouseholds < 1500);
    selectedFlourAgentId.value = validFlour ? validFlour.id : '';

    const validFood = selectedCenter.value.foodAgents.find((a) => a.currentHouseholds < 1500);
    selectedFoodAgentId.value = validFood ? validFood.id : '';
  }
}

async function handleSubmitTransfer() {
  // 校验输入
  if (!targetBranchName.value || !targetCenterId.value) {
    ElMessage.warning('请选择拟转入的目标配给分部与配给中心');
    return;
  }
  if (!selectedFlourAgentId.value || !selectedFoodAgentId.value) {
    ElMessage.warning('请选择面粉代销网点和食品代销网点');
    return;
  }
  if (!residenceForm.district || !residenceForm.subDistrict || !residenceForm.nearestLandmark) {
    ElMessage.warning('请完整填写新居住地址及最近地标');
    return;
  }
  if (!residenceProofUploaded.value) {
    ElMessage.warning('请上传必需的新居住地有效居住证明公函');
    return;
  }
  if (requiresArticle140.value && !article140Uploaded.value) {
    ElMessage.warning('涉及第 140 号决议争议领土，必须上传第 140 号决议无异议官方公函！');
    return;
  }

  // 容量红线终审确认
  const flourAg = selectedCenter.value.flourAgents.find((a) => a.id === selectedFlourAgentId.value);
  const foodAg = selectedCenter.value.foodAgents.find((a) => a.id === selectedFoodAgentId.value);

  if (flourAg?.currentHouseholds >= 1500) {
    ElMessage.error(`面粉代理【${flourAg.name}】已达到 1,500 户上限，禁止转入！`);
    return;
  }
  if (foodAg?.currentHouseholds >= 1500) {
    ElMessage.error(`食品代理【${foodAg.name}】已达到 1,500 户上限，禁止转入！`);
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      cardNo: citizenStore.currentFamily?.rationCardNo,
      fromProvince: currentFromProvince.value,
      toProvince: targetProvince.value,
      toBranch: targetBranchName.value,
      toCenter: selectedCenter.value,
      toFlourAgent: flourAg,
      toFoodAgent: foodAg,
      district: residenceForm.district,
      subDistrict: residenceForm.subDistrict,
      nearestLandmark: residenceForm.nearestLandmark,
      residenceProofDoc: '新居所官方确认公函_2026.pdf',
      article140Doc: requiresArticle140.value ? '第140号决议无异议执行批文_2026.pdf' : ''
    };

    const res = await submitTransferAgent(payload);

    if (res.autoApproved) {
      // 省内转移全自动批准
      await ElMessageBox.alert(
        res.message || '恭喜！省内转移已全自动审批通过并即刻生效，配给卡上的供货网点与代理信息已刷新。',
        '省内转移自动批准通过 ✓',
        { confirmButtonText: '查看我的配给卡', type: 'success' }
      );
      await citizenStore.fetchFamilies();
      router.push('/citizen');
    } else {
      // 跨省转移流转至审核工作台
      await ElMessageBox.alert(
        res.message || `跨省代理转移申报已受理！工单号【${res.ticketId}】，已流转至目标分部审核工作台，请等待分部员工与经理两级终审。`,
        '跨省转移已提交电子审核 ⏳',
        { confirmButtonText: '确定并返回', type: 'info' }
      );
      router.push('/citizen');
    }
  } catch (err) {
    // handled by client
  } finally {
    submitting.value = false;
  }
}
</script>
