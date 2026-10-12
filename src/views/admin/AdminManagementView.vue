<template>
  <div class="space-y-6">
    <!-- 监督官专属顶部控制台横幅 -->
    <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded bg-indigo-600/80 text-[11px] font-mono font-semibold tracking-wider uppercase border border-indigo-400/30">
              National Inspectorate Module
            </span>
            <el-tag type="danger" effect="dark" size="small" class="font-mono">SUPER ADMIN</el-tag>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">后台综合管控中心</h1>
          <p class="text-xs text-slate-300">
            面向国家配给监督司，统筹公民电子配给卡、家庭全周期户籍档案以及全国代销配给网点治理全景
          </p>
        </div>

        <!-- 快速统计指示牌 -->
        <div class="grid grid-cols-3 gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <div class="text-center px-3 border-r border-slate-700">
            <div class="text-[11px] text-slate-400">配给卡总数</div>
            <div class="text-lg font-bold font-mono text-emerald-400">{{ totalCardCount }}</div>
          </div>
          <div class="text-center px-3 border-r border-slate-700">
            <div class="text-[11px] text-slate-400">家庭档案</div>
            <div class="text-lg font-bold font-mono text-blue-400">{{ totalFamilyCount }}</div>
          </div>
          <div class="text-center px-3">
            <div class="text-[11px] text-slate-400">在册代理</div>
            <div class="text-lg font-bold font-mono text-amber-400">{{ totalAgentCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心管理选项卡 (Element Plus el-tabs) -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <el-tabs v-model="activeTab" class="custom-admin-tabs px-6 pt-4" @tab-change="handleTabChange">
        
        <!-- ======================================================== -->
        <!-- Tab 1: 公民（电子配给卡）管理 -->
        <!-- ======================================================== -->
        <el-tab-pane label="公民（电子配给卡）管理" name="cards">
          <div class="py-4 space-y-4">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <el-input
                  v-model="cardQuery.cardNo"
                  placeholder="搜索配给卡号 (RC-...)"
                  style="width: 200px"
                  clearable
                  @keyup.enter="loadCards"
                />
                <el-input
                  v-model="cardQuery.headName"
                  placeholder="搜索户主姓名"
                  style="width: 180px"
                  clearable
                  @keyup.enter="loadCards"
                />
                <el-select v-model="cardQuery.status" placeholder="配给卡状态" style="width: 140px" @change="loadCards">
                  <el-option label="全部状态" value="全部" />
                  <el-option label="正常" value="正常" />
                  <el-option label="已冻结" value="已冻结" />
                  <el-option label="审核中" value="审核中" />
                </el-select>
                <el-button type="primary" :icon="Search" @click="loadCards">查询</el-button>
                <el-button :icon="Refresh" @click="resetCardQuery">重置</el-button>
              </div>

              <div class="text-xs text-slate-500">
                共检索到 <span class="font-bold text-blue-600">{{ cardsList.length }}</span> 张电子配给卡记录
              </div>
            </div>

            <!-- 配给卡数据表格 -->
            <el-table :data="cardsList" v-loading="cardsLoading" border stripe style="width: 100%">
              <el-table-column prop="cardNo" label="配给卡号" width="150" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-blue-600">{{ row.cardNo }}</span>
                </template>
              </el-table-column>
              <el-table-column label="户主信息" min-width="180">
                <template #default="{ row }">
                  <div class="font-medium text-slate-800">{{ row.headName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ row.nationalId }}</div>
                </template>
              </el-table-column>
              <el-table-column label="所属行政区" min-width="160">
                <template #default="{ row }">
                  <div class="text-xs text-slate-700">{{ row.province }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.district }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="memberCount" label="人口" width="70" align="center">
                <template #default="{ row }">
                  <el-tag size="small" type="info">{{ row.memberCount }} 人</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === '正常'" type="success" effect="dark" size="small">正常</el-tag>
                  <el-tag v-else-if="row.status === '已冻结'" type="danger" effect="dark" size="small">已冻结</el-tag>
                  <el-tag v-else type="warning" effect="dark" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="月度保障配额" min-width="220">
                <template #default="{ row }">
                  <div class="text-xs text-slate-600 flex flex-wrap gap-2">
                    <span class="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">面粉: {{ row.quotas.flour }}kg</span>
                    <span class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">大米: {{ row.quotas.rice }}kg</span>
                    <span class="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">油: {{ row.quotas.oil }}L</span>
                    <span class="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">糖: {{ row.quotas.sugar }}kg</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="NFC 芯片 / 核验" width="160">
                <template #default="{ row }">
                  <div class="text-[11px] font-mono text-slate-500">{{ row.rfidChipUid }}</div>
                  <div class="text-[10px] text-slate-400">验: {{ row.lastVerifiedAt }}</div>
                </template>
              </el-table-column>
              <el-table-column label="管理操作" width="220" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1">
                    <el-button size="small" type="primary" plain @click="openQuotaDialog(row)">
                      配额
                    </el-button>
                    <el-button
                      size="small"
                      :type="row.status === '已冻结' ? 'success' : 'danger'"
                      plain
                      @click="handleToggleCardStatus(row)"
                    >
                      {{ row.status === '已冻结' ? '解冻' : '冻结' }}
                    </el-button>
                    <el-button size="small" type="info" plain @click="handleReissueCard(row)">
                      重发
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- ======================================================== -->
        <!-- Tab 2: 家庭户籍档案管理 -->
        <!-- ======================================================== -->
        <el-tab-pane label="家庭户籍档案管理" name="families">
          <div class="py-4 space-y-4">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <el-input
                  v-model="familyQuery.familyCode"
                  placeholder="搜索户籍号 (FAM-...)"
                  style="width: 200px"
                  clearable
                  @keyup.enter="loadFamilies"
                />
                <el-input
                  v-model="familyQuery.headName"
                  placeholder="搜索户主姓名"
                  style="width: 180px"
                  clearable
                  @keyup.enter="loadFamilies"
                />
                <el-select v-model="familyQuery.category" placeholder="家庭类别" style="width: 150px" @change="loadFamilies">
                  <el-option label="全部类别" value="全部" />
                  <el-option label="普通保障家庭" value="普通保障家庭" />
                  <el-option label="特困供养家庭" value="特困供养家庭" />
                  <el-option label="优抚保障家庭" value="优抚保障家庭" />
                </el-select>
                <el-button type="primary" :icon="Search" @click="loadFamilies">查询</el-button>
                <el-button :icon="Refresh" @click="resetFamilyQuery">重置</el-button>
              </div>

              <div>
                <el-button type="success" :icon="Plus" @click="openCreateFamilyDialog">
                  新增家庭建档
                </el-button>
              </div>
            </div>

            <!-- 家庭表格 -->
            <el-table :data="familiesList" v-loading="familiesLoading" border stripe style="width: 100%">
              <el-table-column prop="familyCode" label="户籍档案编号" width="160" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-slate-800">{{ row.familyCode }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="cardNo" label="关联配给卡" width="140">
                <template #default="{ row }">
                  <span class="font-mono text-blue-600">{{ row.cardNo }}</span>
                </template>
              </el-table-column>
              <el-table-column label="户主信息" min-width="160">
                <template #default="{ row }">
                  <div class="font-medium text-slate-800">{{ row.headName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ row.headNationalId }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="category" label="家庭类别" width="130" align="center">
                <template #default="{ row }">
                  <el-tag
                    :type="row.category === '特困供养家庭' ? 'danger' : row.category === '优抚保障家庭' ? 'warning' : 'primary'"
                    size="small"
                  >
                    {{ row.category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="memberCount" label="家庭人数" width="90" align="center">
                <template #default="{ row }">
                  <span class="font-semibold text-slate-700">{{ row.memberCount }} 人</span>
                </template>
              </el-table-column>
              <el-table-column prop="address" label="户籍住址" min-width="200" show-overflow-tooltip />
              <el-table-column prop="registeredDate" label="建档日期" width="120" />
              <el-table-column label="管理操作" width="220" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1">
                    <el-button size="small" type="primary" plain @click="viewFamilyMembers(row)">
                      成员明细
                    </el-button>
                    <el-button size="small" type="warning" plain @click="openEditFamilyDialog(row)">
                      编辑
                    </el-button>
                    <el-button size="small" type="danger" plain @click="handleDeleteFamily(row)">
                      注销
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- ======================================================== -->
        <!-- Tab 3: 代理网点治理管理 -->
        <!-- ======================================================== -->
        <el-tab-pane label="代理网点治理管理" name="agents">
          <div class="py-4 space-y-4">
            <!-- 检索筛选栏 -->
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <el-input
                  v-model="agentQuery.code"
                  placeholder="代理代号 (FA-...)"
                  style="width: 180px"
                  clearable
                  @keyup.enter="loadAgents"
                />
                <el-input
                  v-model="agentQuery.name"
                  placeholder="网点名称"
                  style="width: 200px"
                  clearable
                  @keyup.enter="loadAgents"
                />
                <el-select v-model="agentQuery.status" placeholder="运营状态" style="width: 140px" @change="loadAgents">
                  <el-option label="全部状态" value="全部" />
                  <el-option label="正常营业" value="正常营业" />
                  <el-option label="停业整顿" value="停业整顿" />
                  <el-option label="吊销资质" value="吊销资质" />
                </el-select>
                <el-button type="primary" :icon="Search" @click="loadAgents">查询</el-button>
                <el-button :icon="Refresh" @click="resetAgentQuery">重置</el-button>
              </div>

              <div>
                <el-button type="success" :icon="Plus" @click="openCreateAgentDialog">
                  新设网点入网
                </el-button>
              </div>
            </div>

            <!-- 代理网点表格 -->
            <el-table :data="agentsList" v-loading="agentsLoading" border stripe style="width: 100%">
              <el-table-column prop="code" label="网点代号" width="120" fixed>
                <template #default="{ row }">
                  <span class="font-mono font-bold text-amber-700">{{ row.code }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="网点名称" min-width="180">
                <template #default="{ row }">
                  <div class="font-bold text-slate-800">{{ row.name }}</div>
                  <div class="text-[11px] text-slate-400">{{ row.address }}</div>
                </template>
              </el-table-column>
              <el-table-column label="负责人信息" min-width="160">
                <template #default="{ row }">
                  <div class="text-sm font-medium text-slate-700">{{ row.manager }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">{{ row.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="运营状态" width="110" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.status === '正常营业'" type="success" effect="dark" size="small">正常营业</el-tag>
                  <el-tag v-else-if="row.status === '停业整顿'" type="warning" effect="dark" size="small">停业整顿</el-tag>
                  <el-tag v-else type="danger" effect="dark" size="small">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="综合星级" width="130" align="center">
                <template #default="{ row }">
                  <el-rate v-model="row.rating" disabled size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="servedHouseholds" label="服务户数" width="100" align="center">
                <template #default="{ row }">
                  <span class="font-mono font-semibold">{{ row.servedHouseholds }} 户</span>
                </template>
              </el-table-column>
              <el-table-column prop="storageCapacity" label="仓储容积" width="100" align="center">
                <template #default="{ row }">
                  <span class="font-mono">{{ row.storageCapacity }} 吨</span>
                </template>
              </el-table-column>
              <el-table-column prop="lastInspectedAt" label="最近巡检" width="120" />
              <el-table-column label="管理操作" width="200" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center gap-1">
                    <el-button
                      size="small"
                      :type="row.status === '正常营业' ? 'warning' : 'success'"
                      plain
                      @click="handleToggleAgentStatus(row)"
                    >
                      {{ row.status === '正常营业' ? '停业整顿' : '恢复营业' }}
                    </el-button>
                    <el-button size="small" type="primary" plain @click="openEditAgentDialog(row)">
                      编辑
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 调整配给定额对话框 -->
    <!-- ======================================================== -->
    <el-dialog v-model="quotaDialogVisible" title="调整月度粮食配给定额" width="450px" align-center>
      <div v-if="currentEditingCard" class="space-y-4">
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 space-y-1">
          <div>配给卡号：<span class="font-mono font-bold">{{ currentEditingCard.cardNo }}</span></div>
          <div>户主姓名：<span class="font-bold">{{ currentEditingCard.headName }}</span> (家庭人口: {{ currentEditingCard.memberCount }}人)</div>
        </div>

        <el-form label-position="left" label-width="110px">
          <el-form-item label="标准面粉 (kg)">
            <el-input-number v-model="quotaForm.flour" :min="0" :max="300" :step="5" class="w-full" />
          </el-form-item>
          <el-form-item label="优质大米 (kg)">
            <el-input-number v-model="quotaForm.rice" :min="0" :max="150" :step="2" class="w-full" />
          </el-form-item>
          <el-form-item label="食用植物油 (L)">
            <el-input-number v-model="quotaForm.oil" :min="0" :max="50" :step="0.5" :precision="1" class="w-full" />
          </el-form-item>
          <el-form-item label="精制食糖 (kg)">
            <el-input-number v-model="quotaForm.sugar" :min="0" :max="50" :step="1" class="w-full" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="quotaDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="quotaSaving" @click="saveQuotaChange">保存配额调整</el-button>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 模态框 2: 家庭成员明细查看抽屉/对话框 -->
    <!-- ======================================================== -->
    <el-dialog v-model="membersDialogVisible" title="家庭成员户籍存根明细" width="650px" align-center>
      <div v-if="selectedFamilyForMembers" class="space-y-4">
        <div class="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>户籍档案编号：<span class="font-mono font-bold text-slate-800">{{ selectedFamilyForMembers.familyCode }}</span></div>
          <div>法定户主：<span class="font-bold text-slate-800">{{ selectedFamilyForMembers.headName }}</span></div>
        </div>

        <el-table :data="selectedFamilyForMembers.members || []" border size="small">
          <el-table-column prop="name" label="姓名" min-width="130" />
          <el-table-column prop="relation" label="与户主关系" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.relation === '户主' ? 'danger' : 'info'">{{ row.relation }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别" width="60" align="center" />
          <el-table-column prop="birthDate" label="出生日期" width="110" />
          <el-table-column prop="nationalId" label="国民卡身份证号" min-width="160" />
          <el-table-column label="配给状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.isFrozen ? 'danger' : 'success'">
                {{ row.isFrozen ? '已冻结' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="membersDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 模态框 3: 新增/编辑家庭档案对话框 -->
    <!-- ======================================================== -->
    <el-dialog v-model="familyDialogVisible" :title="isEditFamily ? '编辑家庭户籍档案' : '新增家庭户籍建档'" width="500px" align-center>
      <el-form label-position="top" :model="familyForm" class="space-y-3">
        <el-form-item label="户主姓名" required>
          <el-input v-model="familyForm.headName" placeholder="例如：萨利赫·穆罕默德" />
        </el-form-item>
        <el-form-item label="户主国民身份证号" required>
          <el-input v-model="familyForm.headNationalId" placeholder="例如：IQ-1985-0511-9921" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="家庭保障类别">
            <el-select v-model="familyForm.category" class="w-full">
              <el-option label="普通保障家庭" value="普通保障家庭" />
              <el-option label="特困供养家庭" value="特困供养家庭" />
              <el-option label="优抚保障家庭" value="优抚保障家庭" />
            </el-select>
          </el-form-item>
          <el-form-item label="成员人数">
            <el-input-number v-model="familyForm.memberCount" :min="1" :max="20" class="w-full" />
          </el-form-item>
        </div>
        <el-form-item label="联系电话">
          <el-input v-model="familyForm.phone" placeholder="+964 780 000 0000" />
        </el-form-item>
        <el-form-item label="户籍登记地址">
          <el-input v-model="familyForm.address" type="textarea" :rows="2" placeholder="省份、城市、街区、门牌" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="familyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="familySaving" @click="saveFamily">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- ======================================================== -->
    <!-- 模态框 4: 新增/编辑代理网点对话框 -->
    <!-- ======================================================== -->
    <el-dialog v-model="agentDialogVisible" :title="isEditAgent ? '编辑代理网点资料' : '新设代理网点入网登记'" width="500px" align-center>
      <el-form label-position="top" :model="agentForm" class="space-y-3">
        <el-form-item label="网点机构名称" required>
          <el-input v-model="agentForm.name" placeholder="例如：巴格达第十配给代销惠民站" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="责任人姓名" required>
            <el-input v-model="agentForm.manager" placeholder="负责人姓名" />
          </el-form-item>
          <el-form-item label="联系电话" required>
            <el-input v-model="agentForm.phone" placeholder="+964 770 000 0000" />
          </el-form-item>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <el-form-item label="覆盖保供家庭数">
            <el-input-number v-model="agentForm.servedHouseholds" :min="50" :max="5000" class="w-full" />
          </el-form-item>
          <el-form-item label="仓储容积 (吨)">
            <el-input-number v-model="agentForm.storageCapacity" :min="5" :max="500" class="w-full" />
          </el-form-item>
        </div>
        <el-form-item label="营业详细地址">
          <el-input v-model="agentForm.address" type="textarea" :rows="2" placeholder="所在街区及营业房门牌号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="agentDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="agentSaving" @click="saveAgent">保存网点档案</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import {
  getCitizenCards,
  updateCitizenCardStatus,
  updateCitizenCardQuota,
  reissueCitizenCard,
  getFamilyList,
  createFamily,
  updateFamily,
  deleteFamily,
  getAdminAgentList,
  updateAdminAgentStatus,
  createAdminAgent,
  updateAdminAgent
} from '../../api/admin.js';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh, Plus } from '@element-plus/icons-vue';

// 当前激活 Tab
const activeTab = ref('cards');

// ==========================================
// 1. 公民（电子配给卡）管理
// ==========================================
const cardsLoading = ref(false);
const cardsList = ref([]);
const cardQuery = reactive({
  cardNo: '',
  headName: '',
  status: '全部',
  province: '全部'
});

async function loadCards() {
  cardsLoading.value = true;
  try {
    const res = await getCitizenCards(cardQuery);
    cardsList.value = res || [];
  } catch (err) {
    ElMessage.error('加载配给卡数据失败');
  } finally {
    cardsLoading.value = false;
  }
}

function resetCardQuery() {
  cardQuery.cardNo = '';
  cardQuery.headName = '';
  cardQuery.status = '全部';
  cardQuery.province = '全部';
  loadCards();
}

// 调整配额
const quotaDialogVisible = ref(false);
const quotaSaving = ref(false);
const currentEditingCard = ref(null);
const quotaForm = reactive({
  flour: 0,
  rice: 0,
  oil: 0,
  sugar: 0
});

function openQuotaDialog(row) {
  currentEditingCard.value = row;
  quotaForm.flour = row.quotas.flour;
  quotaForm.rice = row.quotas.rice;
  quotaForm.oil = row.quotas.oil;
  quotaForm.sugar = row.quotas.sugar;
  quotaDialogVisible.value = true;
}

async function saveQuotaChange() {
  if (!currentEditingCard.value) return;
  quotaSaving.value = true;
  try {
    await updateCitizenCardQuota(currentEditingCard.value.id, { quotas: quotaForm });
    currentEditingCard.value.quotas = { ...quotaForm };
    ElMessage.success(`已成功更新【${currentEditingCard.value.cardNo}】的月度配额`);
    quotaDialogVisible.value = false;
  } catch (e) {
    ElMessage.error('保存配额失败');
  } finally {
    quotaSaving.value = false;
  }
}

// 冻结 / 解冻
async function handleToggleCardStatus(row) {
  const nextStatus = row.status === '已冻结' ? '正常' : '已冻结';
  const actionText = nextStatus === '正常' ? '解除冻结' : '实施冻结';

  try {
    const { value: reason } = await ElMessageBox.prompt(
      `请输入对配给卡【${row.cardNo}】执行【${actionText}】的公函号或事由依据：`,
      `${actionText} 操作确认`,
      {
        confirmButtonText: '立即执行',
        cancelButtonText: '取消',
        inputPattern: /\S+/,
        inputErrorMessage: '处理原因不能为空'
      }
    );

    await updateCitizenCardStatus(row.id, { status: nextStatus, reason });
    row.status = nextStatus;
    row.freezeReason = nextStatus === '已冻结' ? reason : '';
    ElMessage.success(`配给卡【${row.cardNo}】已成功${actionText}！`);
  } catch (e) {
    // cancelled
  }
}

// 重发 / 换发新卡
async function handleReissueCard(row) {
  try {
    await ElMessageBox.confirm(
      `确定为户主【${row.headName}】换发新卡？系统将生成新 NFC 芯片序列号并作废原有卡片存根。`,
      '换发新卡确认',
      { confirmButtonText: '确认换发', cancelButtonText: '取消', type: 'warning' }
    );
    const res = await reissueCitizenCard(row.id);
    if (res?.rfidChipUid) {
      row.rfidChipUid = res.rfidChipUid;
      row.lastVerifiedAt = res.lastVerifiedAt;
    }
    ElMessage.success(`配给卡【${row.cardNo}】已成功重置芯片并换发新卡！`);
  } catch (e) {
    // cancelled
  }
}

// ==========================================
// 2. 家庭户籍档案管理
// ==========================================
const familiesLoading = ref(false);
const familiesList = ref([]);
const familyQuery = reactive({
  familyCode: '',
  headName: '',
  category: '全部'
});

async function loadFamilies() {
  familiesLoading.value = true;
  try {
    const res = await getFamilyList(familyQuery);
    familiesList.value = res || [];
  } catch (err) {
    ElMessage.error('加载家庭户籍档案失败');
  } finally {
    familiesLoading.value = false;
  }
}

function resetFamilyQuery() {
  familyQuery.familyCode = '';
  familyQuery.headName = '';
  familyQuery.category = '全部';
  loadFamilies();
}

// 查看成员明细
const membersDialogVisible = ref(false);
const selectedFamilyForMembers = ref(null);

function viewFamilyMembers(row) {
  selectedFamilyForMembers.value = row;
  membersDialogVisible.value = true;
}

// 新增 / 编辑家庭
const familyDialogVisible = ref(false);
const familySaving = ref(false);
const isEditFamily = ref(false);
const currentEditingFamilyId = ref(null);
const familyForm = reactive({
  headName: '',
  headNationalId: '',
  category: '普通保障家庭',
  memberCount: 3,
  phone: '',
  address: ''
});

function openCreateFamilyDialog() {
  isEditFamily.value = false;
  currentEditingFamilyId.value = null;
  familyForm.headName = '';
  familyForm.headNationalId = '';
  familyForm.category = '普通保障家庭';
  familyForm.memberCount = 3;
  familyForm.phone = '';
  familyForm.address = '';
  familyDialogVisible.value = true;
}

function openEditFamilyDialog(row) {
  isEditFamily.value = true;
  currentEditingFamilyId.value = row.id;
  familyForm.headName = row.headName;
  familyForm.headNationalId = row.headNationalId;
  familyForm.category = row.category;
  familyForm.memberCount = row.memberCount;
  familyForm.phone = row.phone || '';
  familyForm.address = row.address || '';
  familyDialogVisible.value = true;
}

async function saveFamily() {
  if (!familyForm.headName || !familyForm.headNationalId) {
    ElMessage.warning('请填写户主姓名与身份证号');
    return;
  }
  familySaving.value = true;
  try {
    if (isEditFamily.value) {
      await updateFamily(currentEditingFamilyId.value, familyForm);
      ElMessage.success('家庭档案已更新');
    } else {
      await createFamily(familyForm);
      ElMessage.success('新家庭档案登记成功');
    }
    familyDialogVisible.value = false;
    loadFamilies();
  } catch (e) {
    ElMessage.error('保存家庭档案失败');
  } finally {
    familySaving.value = false;
  }
}

async function handleDeleteFamily(row) {
  try {
    await ElMessageBox.confirm(
      `确定注销户籍档案【${row.familyCode}】(${row.headName})？此操作不可逆。`,
      '档案注销警告',
      { confirmButtonText: '确认注销', cancelButtonText: '取消', type: 'error' }
    );
    await deleteFamily(row.id);
    ElMessage.success('家庭档案已注销');
    loadFamilies();
  } catch (e) {
    // cancelled
  }
}

// ==========================================
// 3. 代理网点治理管理
// ==========================================
const agentsLoading = ref(false);
const agentsList = ref([]);
const agentQuery = reactive({
  code: '',
  name: '',
  status: '全部'
});

async function loadAgents() {
  agentsLoading.value = true;
  try {
    const res = await getAdminAgentList(agentQuery);
    agentsList.value = res || [];
  } catch (err) {
    ElMessage.error('加载代理网点失败');
  } finally {
    agentsLoading.value = false;
  }
}

function resetAgentQuery() {
  agentQuery.code = '';
  agentQuery.name = '';
  agentQuery.status = '全部';
  loadAgents();
}

async function handleToggleAgentStatus(row) {
  const nextStatus = row.status === '正常营业' ? '停业整顿' : '正常营业';
  try {
    await ElMessageBox.confirm(
      `确定将网点【${row.name}】状态切换为【${nextStatus}】？`,
      '运营状态变更',
      { confirmButtonText: '立即生效', cancelButtonText: '取消' }
    );
    await updateAdminAgentStatus(row.id, { status: nextStatus });
    row.status = nextStatus;
    ElMessage.success(`网点【${row.name}】状态已变更`);
  } catch (e) {
    // cancelled
  }
}

// 新增/编辑代理
const agentDialogVisible = ref(false);
const agentSaving = ref(false);
const isEditAgent = ref(false);
const currentEditingAgentId = ref(null);
const agentForm = reactive({
  name: '',
  manager: '',
  phone: '',
  servedHouseholds: 500,
  storageCapacity: 50,
  address: ''
});

function openCreateAgentDialog() {
  isEditAgent.value = false;
  currentEditingAgentId.value = null;
  agentForm.name = '';
  agentForm.manager = '';
  agentForm.phone = '';
  agentForm.servedHouseholds = 500;
  agentForm.storageCapacity = 50;
  agentForm.address = '';
  agentDialogVisible.value = true;
}

function openEditAgentDialog(row) {
  isEditAgent.value = true;
  currentEditingAgentId.value = row.id;
  agentForm.name = row.name;
  agentForm.manager = row.manager;
  agentForm.phone = row.phone;
  agentForm.servedHouseholds = row.servedHouseholds;
  agentForm.storageCapacity = row.storageCapacity;
  agentForm.address = row.address;
  agentDialogVisible.value = true;
}

async function saveAgent() {
  if (!agentForm.name || !agentForm.manager) {
    ElMessage.warning('请填写网点名称与负责人姓名');
    return;
  }
  agentSaving.value = true;
  try {
    if (isEditAgent.value) {
      await updateAdminAgent(currentEditingAgentId.value, agentForm);
      ElMessage.success('网点资料已更新');
    } else {
      await createAdminAgent(agentForm);
      ElMessage.success('新设代理入网成功');
    }
    agentDialogVisible.value = false;
    loadAgents();
  } catch (e) {
    ElMessage.error('保存代理资料失败');
  } finally {
    agentSaving.value = false;
  }
}

// 统计总数计算
const totalCardCount = computed(() => cardsList.value.length);
const totalFamilyCount = computed(() => familiesList.value.length);
const totalAgentCount = computed(() => agentsList.value.length);

function handleTabChange(tab) {
  if (tab === 'cards' && cardsList.value.length === 0) loadCards();
  if (tab === 'families' && familiesList.value.length === 0) loadFamilies();
  if (tab === 'agents' && agentsList.value.length === 0) loadAgents();
}

onMounted(() => {
  loadCards();
  loadFamilies();
  loadAgents();
});
</script>

<style scoped>
.custom-admin-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
}
</style>
