<template>
  <div class="citizen-family-view space-y-6">
    <!-- 顶部配给卡基本信息面板 (强化展示电子配给卡编号与关联纸质卡编号) -->
    <div v-if="citizenStore.currentFamily" class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
            卡
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-slate-900">{{ citizenStore.currentFamily.headName }} (户主)</span>
              <el-tag size="small" type="success" effect="light">{{ citizenStore.currentFamily.status }}</el-tag>
              <el-tag size="small" type="primary" effect="plain" class="font-mono">电子配给卡</el-tag>
            </div>
            <!-- 电子配给卡与关联纸质卡编号 -->
            <div class="text-xs text-slate-500 font-mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                电子配给卡号：<strong class="text-blue-600 font-bold">{{ citizenStore.currentFamily.rationCardNo }}</strong>
              </span>
              <span>
                关联纸质卡存根：<strong class="text-amber-700 font-bold">{{ citizenStore.currentFamily.oldPaperCardNo || 'IQ-P-1994-082194' }}</strong>
              </span>
              <span class="text-slate-400">家庭编号：{{ citizenStore.currentFamily.familyCode }}</span>
            </div>
          </div>
        </div>

        <!-- 业务快捷操作按钮 -->
        <div class="flex items-center gap-2 flex-wrap">
          <el-button type="success" plain @click="$router.push('/citizen/transfer-agent')">
            <el-icon class="mr-1"><Switch /></el-icon>
            申请代理转移
          </el-button>
          <el-button type="primary" plain @click="$router.push('/citizen/split-household')">
            <el-icon class="mr-1"><Share /></el-icon>
            申请分户
          </el-button>
          <el-button type="warning" plain @click="$router.push('/citizen/change-head')">
            <el-icon class="mr-1"><UserFilled /></el-icon>
            变更户主
          </el-button>
          <el-button type="info" plain @click="$router.push('/citizen/unfreeze')">
            <el-icon class="mr-1"><Unlock /></el-icon>
            申请解冻
          </el-button>
        </div>
      </div>

      <!-- 属性网格 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block text-[11px]">所属行政省区：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.province }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">基层配给服务网格：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.district }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">对应食品/面粉代销网点：</span>
          <span class="font-medium text-slate-800">{{ citizenStore.currentFamily.agentName }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[11px]">家庭登记常住地址：</span>
          <span class="font-medium text-slate-800 truncate block">{{ citizenStore.currentFamily.address }}</span>
        </div>
      </div>
    </div>

    <!-- 家庭成员清单表格 -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>家庭全部成员名单 ({{ citizenStore.currentFamily?.members?.length || 0 }} 人)</span>
        </h3>
        <!-- 将原来的“刷新成员列表”改为“添加新成员” (需求 2) -->
        <el-button type="primary" size="small" class="font-bold shadow-xs" @click="openAddMemberDialog">
          <el-icon class="mr-1"><Plus /></el-icon>
          添加新成员
        </el-button>
      </div>

      <el-table
        :data="citizenStore.currentFamily?.members || []"
        v-loading="citizenStore.loading"
        style="width: 100%"
        class="text-xs"
        border
        stripe
      >
        <el-table-column prop="name" label="姓名" min-width="140" fixed>
          <template #default="{ row }">
            <span class="font-bold text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <!-- 需求 1: 加上电子配给卡编号 (并关联纸质配给卡编号) -->
        <el-table-column label="电子配给卡 / 关联纸质卡编号" min-width="210">
          <template #default>
            <div class="space-y-0.5">
              <div class="flex items-center gap-1 font-mono">
                <span class="font-bold text-blue-600">{{ citizenStore.currentFamily?.rationCardNo }}</span>
                <el-tag size="small" effect="plain" type="primary" class="scale-90 origin-left">电子卡</el-tag>
              </div>
              <div class="text-[11px] text-amber-800 font-mono flex items-center gap-1">
                <span>关联纸卡:</span>
                <span class="font-semibold">{{ citizenStore.currentFamily?.oldPaperCardNo || 'IQ-P-1994-082194' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="relation" label="家庭关系" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.relation === '户主' ? 'primary' : row.relation === '配偶' ? 'success' : 'info'"
            >
              {{ row.relation }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="gender" label="性别" width="70" align="center" />

        <el-table-column prop="nationalId" label="统一国民卡身份编码" min-width="160">
          <template #default="{ row }">
            <span class="font-mono text-slate-600">{{ row.nationalId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="配给资格状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.status === '正常' ? 'success' : row.status === '冻结' ? 'danger' : 'info'"
              effect="light"
            >
              {{ row.status }}{{ row.freezeReason ? ` (${row.freezeReason})` : '' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="联系电话" min-width="130">
          <template #default="{ row }">
            <span class="font-mono">{{ row.phone || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="110" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditModal(row)">
              更新信息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 添加新成员对话框 (全量覆盖六大法定前提条件) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="addMemberDialogVisible"
      title="申报登记添加新家庭成员"
      width="680px"
      align-center
    >
      <div class="space-y-4 text-xs">
        <!-- 顶部法定申报须知 -->
        <div class="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 space-y-1">
          <div class="font-bold flex items-center gap-1.5">
            <el-icon><InfoFilled /></el-icon>
            <span>国家配给成员纳保前置法定核验</span>
          </div>
          <p>
            依据国家数字配给卡管理条例，新增成员必须完成系统更新、生物识别、地理位置核验与指定社会关系，未满12岁儿童须上传相符证明，且父亲须具备生物识别与电子支付方式。
          </p>
        </div>

        <!-- 父亲资格核验卡 (前提条件 6: 父亲具备有效生物数据 & 电子支付) -->
        <div class="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="font-bold text-amber-400">法定父亲资质核验存根</span>
            <el-tag size="small" type="success" effect="dark">内政部已校验 ✓</el-tag>
          </div>
          <div class="grid grid-cols-2 gap-3 text-slate-300">
            <div class="flex items-center gap-2">
              <el-icon class="text-emerald-400"><CircleCheckFilled /></el-icon>
              <span>父亲生物识别数据：<strong class="text-white">有效在册 (活体人脸及虹膜)</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <el-icon class="text-emerald-400"><CircleCheckFilled /></el-icon>
              <span>电子支付方式：<strong class="text-white">已绑定国家 Qi Card 电子账户</strong></span>
            </div>
          </div>
        </div>

        <el-form label-position="top" class="space-y-3">
          <!-- 1. 基本信息 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <el-form-item label="成员完整姓名" required>
              <el-input v-model="newMemberForm.name" placeholder="请输入成员真实姓名" />
            </el-form-item>
            <el-form-item label="统一国民卡身份编码 (NID)" required>
              <el-input v-model="newMemberForm.nationalId" placeholder="例如：201882910489" />
            </el-form-item>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <el-form-item label="出生日期 (自动判定儿童)" required>
              <el-date-picker
                v-model="newMemberForm.birthDate"
                type="date"
                placeholder="选择出生日期"
                value-format="YYYY-MM-DD"
                class="w-full"
                @change="handleBirthDateChange"
              />
            </el-form-item>
            <el-form-item label="性别" required>
              <el-select v-model="newMemberForm.gender" class="w-full">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
            <!-- 前提条件 4: 指定婚姻／社会关系 -->
            <el-form-item label="指定婚姻 / 社会关系" required>
              <el-select v-model="newMemberForm.relation" placeholder="选择家庭关系" class="w-full">
                <el-option label="子女 (亲生/法定收养)" value="子女" />
                <el-option label="配偶 (法定民事婚姻)" value="配偶" />
                <el-option label="父亲 (户主直系长辈)" value="父亲" />
                <el-option label="母亲 (户主直系长辈)" value="母亲" />
                <el-option label="受抚养亲属" value="受抚养人" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 2. 前提条件 1 & 2 & 3: 系统更新比对、生物识别验证、地理位置核验 -->
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div class="font-bold text-slate-800">三重法定合规实时核验：</div>

            <!-- 条件 1: 信息在配给卡系统中更新 -->
            <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <div class="space-y-0.5">
                <div class="font-semibold text-slate-800">1. 内政部配给卡底账系统更新比对</div>
                <div class="text-[11px] text-slate-500">比对该成员是否已在国家统一身份管理底账完成最新存根登记</div>
              </div>
              <el-button
                size="small"
                :type="systemInfoUpdated ? 'success' : 'primary'"
                :plain="systemInfoUpdated"
                @click="systemInfoUpdated = true"
              >
                {{ systemInfoUpdated ? '已更新比对吻合 ✓' : '执行系统更新对碰' }}
              </el-button>
            </div>

            <!-- 条件 2: 生物识别验证 -->
            <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <div class="space-y-0.5">
                <div class="font-semibold text-slate-800">2. 该成员现场生物识别特征验证</div>
                <div class="text-[11px] text-slate-500">采集活体人脸微表情及指纹/虹膜特征向量</div>
              </div>
              <el-button
                size="small"
                :type="memberBiometricVerified ? 'success' : 'primary'"
                :plain="memberBiometricVerified"
                @click="memberBiometricVerified = true"
              >
                {{ memberBiometricVerified ? '生物识别验证通过 ✓' : '启动生物特征采集' }}
              </el-button>
            </div>

            <!-- 条件 3: 地理位置核验 -->
            <div class="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <div class="space-y-0.5">
                <div class="font-semibold text-slate-800">3. 居住网格 GPS 与基站地理位置核验</div>
                <div class="text-[11px] text-slate-500">核查当前定位与家庭配给卡登记地址（巴格达卡尔赫区）一致性</div>
              </div>
              <el-button
                size="small"
                :type="locationVerified ? 'success' : 'primary'"
                :plain="locationVerified"
                @click="locationVerified = true"
              >
                {{ locationVerified ? '地理位置核验一致 ✓' : '检测基站与GPS位置' }}
              </el-button>
            </div>
          </div>

          <!-- 前提条件 5: 上传与该儿童情形相符的文件 (如果添加新成员未满12岁) -->
          <div v-if="isUnder12" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-700">未满 12 岁儿童证明文件上传 (法定必需 ★)：</span>
              <el-tag type="danger" size="small" effect="dark">儿童情形文件</el-tag>
            </div>
            <DocumentUploader
              v-model="childDocumentUploaded"
              title="卫生部出生医学证明 / 司法收养公函"
              subtitle="请上传儿童出生证明或法定抚养权公文原件（PDF或图片）"
              is-required
              category-badge="儿童出生证明"
              issuer="卫生部与民政总局"
              default-file-name="儿童出生医学证明存根_2020.pdf"
            />
          </div>
          <div v-else class="text-[11px] text-slate-400 bg-slate-50 p-2 rounded border border-slate-200">
            经出生日期核算，该成员已年满 12 周岁，根据配给管理规定，免于提交儿童医学出生证明。
          </div>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="addMemberDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addingMember" @click="handleSubmitAddMember">
          确认申报并纳保
        </el-button>
      </template>
    </el-dialog>

    <!-- 成员信息更新弹窗 -->
    <el-dialog
      v-model="editModalVisible"
      title="更新家庭成员电子档案信息"
      width="480px"
      align-center
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item label="成员姓名">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="联系手机号码">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="常住详细住址">
          <el-input v-model="editForm.residenceInfo" placeholder="请输入居住地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveMember">确认更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import {
  Share,
  UserFilled,
  Unlock,
  Switch,
  Plus,
  InfoFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const citizenStore = useCitizenStore();
const editModalVisible = ref(false);
const saving = ref(false);

const editForm = reactive({
  id: '',
  name: '',
  phone: '',
  residenceInfo: ''
});

onMounted(() => {
  citizenStore.fetchFamilies();
});

function openEditModal(member) {
  editForm.id = member.id;
  editForm.name = member.name;
  editForm.phone = member.phone || '';
  editForm.residenceInfo = member.residenceInfo || '';
  editModalVisible.value = true;
}

async function handleSaveMember() {
  saving.value = true;
  try {
    await citizenStore.updateMember(editForm.id, {
      phone: editForm.phone,
      residenceInfo: editForm.residenceInfo
    });
    editModalVisible.value = false;
  } finally {
    saving.value = false;
  }
}

// ==========================================
// 需求 2: 添加新成员 (覆盖六大前提条件)
// ==========================================
const addMemberDialogVisible = ref(false);
const addingMember = ref(false);

// 核验前提状态
const systemInfoUpdated = ref(false);
const memberBiometricVerified = ref(false);
const locationVerified = ref(false);
const childDocumentUploaded = ref(false);

const newMemberForm = reactive({
  name: '',
  nationalId: '',
  birthDate: '2019-05-15',
  gender: '男',
  relation: '子女',
  phone: ''
});

// 计算是否未满 12 岁
const isUnder12 = computed(() => {
  if (!newMemberForm.birthDate) return true;
  const birthYear = new Date(newMemberForm.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return (currentYear - birthYear) < 12;
});

function handleBirthDateChange() {
  if (isUnder12.value) {
    childDocumentUploaded.value = true; // 自动加载儿童证明样本以方便快速体验
  }
}

function openAddMemberDialog() {
  newMemberForm.name = '优素福·艾哈迈德·哈桑';
  newMemberForm.nationalId = '201982910488';
  newMemberForm.birthDate = '2019-05-15';
  newMemberForm.gender = '男';
  newMemberForm.relation = '子女';
  newMemberForm.phone = '';

  // 初始化前提核验为就绪状态
  systemInfoUpdated.value = true;
  memberBiometricVerified.value = true;
  locationVerified.value = true;
  childDocumentUploaded.value = true;

  addMemberDialogVisible.value = true;
}

async function handleSubmitAddMember() {
  if (!newMemberForm.name || !newMemberForm.nationalId || !newMemberForm.relation) {
    ElMessage.warning('请填写成员姓名、身份证号及指定家庭关系');
    return;
  }

  // 1. 校验系统更新
  if (!systemInfoUpdated.value) {
    ElMessage.error('前提条件未满足：家庭成员信息须已在配给卡系统中更新！');
    return;
  }

  // 2. 校验生物识别
  if (!memberBiometricVerified.value) {
    ElMessage.error('前提条件未满足：须对该成员进行生物识别验证！');
    return;
  }

  // 3. 校验地理位置
  if (!locationVerified.value) {
    ElMessage.error('前提条件未满足：须通过地理位置核验！');
    return;
  }

  // 4. 校验未满 12 岁儿童证明
  if (isUnder12.value && !childDocumentUploaded.value) {
    ElMessage.error('前提条件未满足：该成员未满12岁，须上传与该儿童情形相符的证明文件！');
    return;
  }

  addingMember.value = true;
  try {
    const cardNo = citizenStore.currentFamily?.rationCardNo || 'RC-10029381';
    await citizenStore.addMember(cardNo, {
      ...newMemberForm,
      isUnder12: isUnder12.value
    });
    addMemberDialogVisible.value = false;
  } catch (err) {
    ElMessage.error('添加新成员申报失败');
  } finally {
    addingMember.value = false;
  }
}
</script>
