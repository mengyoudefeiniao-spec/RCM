<template>
  <div class="citizen-family-view space-y-6">
    <!-- 顶部配给卡基本信息面板 -->
    <div v-if="citizenStore.currentFamily" class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl border border-blue-100">
            卡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-slate-900">{{ citizenStore.currentFamily.headName }} (户主)</span>
              <el-tag size="small" type="success" effect="light">{{ citizenStore.currentFamily.status }}</el-tag>
            </div>
            <div class="text-xs text-slate-400 font-mono mt-0.5">
              配给卡号：{{ citizenStore.currentFamily.rationCardNo }} · 家庭编号：{{ citizenStore.currentFamily.familyCode }}
            </div>
          </div>
        </div>

        <!-- 业务快捷操作按钮 -->
        <div class="flex items-center gap-2 flex-wrap">
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
        <el-button size="small" @click="citizenStore.fetchFamilies">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新成员列表
        </el-button>
      </div>

      <el-table
        :data="citizenStore.currentFamily?.members || []"
        v-loading="citizenStore.loading"
        style="width: 100%"
        class="text-xs"
        border
      >
        <el-table-column prop="name" label="姓名" min-width="140">
          <template #default="{ row }">
            <span class="font-bold text-slate-800">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="relation" label="家庭关系" width="100">
          <template #default="{ row }">
            <el-tag
              size="small"
              :type="row.relation === '户主' ? 'primary' : row.relation === '配偶' ? 'success' : 'info'"
            >
              {{ row.relation }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="gender" label="性别" width="80" align="center" />

        <el-table-column prop="nationalId" label="统一国民卡身份编码" min-width="160">
          <template #default="{ row }">
            <span class="font-mono text-slate-600">{{ row.nationalId }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="配给资格状态" width="120" align="center">
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

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditModal(row)">
              更新信息
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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
import { ref, reactive, onMounted } from 'vue';
import { useCitizenStore } from '../../stores/citizen.js';
import { Share, UserFilled, Unlock, Refresh } from '@element-plus/icons-vue';

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
</script>
