<template>
  <div class="agent-hierarchy-panel space-y-4">
    <!-- 移动端专属模式切换分段按钮 (仅在移动端小屏显示) -->
    <div class="block lg:hidden">
      <el-radio-group v-model="mobileViewMode" size="small" class="w-full flex">
        <el-radio-button value="HIERARCHY" class="flex-1 text-center">🏢 {{ isEn ? '3-Level Agent Linkage' : '三级代理联动' }}</el-radio-button>
        <el-radio-button value="FAMILIES" class="flex-1 text-center">👥 {{ isEn ? 'Registered Citizens' : '管辖公民列表' }} ({{ currentScopeFamilies.length }})</el-radio-button>
        <el-radio-button value="MAP" class="flex-1 text-center">🗺️ {{ isEn ? 'Real GIS Heatmap' : '真实GIS热力图' }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 主体协同布局：左侧三级联动列表与管辖范围，右侧上方公民列表、下方真实在线地图热力图 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <!-- ======================================================== -->
      <!-- 左栏 (5/12)：三级代理联动展示列表 + 当前代理管辖范围档案卡 -->
      <!-- ======================================================== -->
      <div
        class="lg:col-span-5 space-y-3.5"
        :class="{ 'hidden lg:block': mobileViewMode !== 'HIERARCHY' && isMobile }"
      >
        <div class="bg-white rounded-lg p-4 border border-[#D9E5DB]/90 shadow-2xs space-y-3">
          <!-- 联动列表标题与快速重置 -->
          <div class="flex items-center justify-between pb-2.5 border-b border-[#E9F1EB] text-xs">
            <div class="flex items-center gap-2 font-bold text-[#1F3326]">
              <span class="w-2 h-2 rounded-full bg-[#326445]"></span>
              <span>{{ isEn ? 'Three-Level Agent Architecture Linkage List' : '三级代理架构联动列表' }}</span>
            </div>
            <span class="text-[11px] text-[#8A9A8F] font-mono">{{ isEn ? 'Province → District → Street Penetration' : '省 → 区 → 街 逐级穿透' }}</span>
          </div>

          <!-- 3级联动选择面板 -->
          <div v-loading="loadingHierarchy" class="space-y-3 text-xs">
            <!-- 1. 第一级：省级代理列表 -->
            <div class="space-y-1.5">
              <div class="text-[11px] font-bold text-[#58685D] flex items-center justify-between">
                <span>{{ isEn ? '① Provincial Agent (Macro Monitoring & Approval)' : '① 省级代理 (宏观监控审批)' }}</span>
                <span class="font-mono text-[#326445] text-[10px]">{{ isEn ? '1 Provincial Governor' : '1 个省管总督' }}</span>
              </div>
              <div
                v-for="prov in hierarchyTree"
                :key="prov.id"
                class="p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between"
                :class="selectedLevel === 'PROVINCE' && selectedProvId === prov.id
                  ? 'bg-[#EFF5F1] border-[#5C8A6B] shadow-2xs ring-1 ring-[#7FA48C]'
                  : 'bg-[#F3F8F4]/80 border-[#D9E5DB] hover:bg-[#E9F1EB]/70'"
                @click="onSelectProvince(prov)"
              >
                <div class="flex items-center gap-2">
                  <el-tag size="small" type="primary" effect="dark" class="font-bold scale-90">{{ isEn ? 'Prov.' : '省级' }}</el-tag>
                  <div>
                    <div class="font-bold text-[#1B3123] flex items-center gap-1.5">
                      <span>{{ prov.name }}</span>
                      <el-tag v-if="prov.isSelf" size="small" type="warning" effect="plain" class="scale-75 font-bold">{{ isEn ? 'Me' : '我' }}</el-tag>
                    </div>
                    <div class="text-[10px] text-[#8A9A8F]">{{ prov.province }} · {{ isEn ? `${prov.totalDistricts} districts` : `辖区 ${prov.totalDistricts} 区` }}</div>
                  </div>
                </div>
                <div class="text-end font-mono">
                  <div class="font-bold text-[#2A5440]">{{ isEn ? `${prov.totalHouseholdsServed} HH` : `${prov.totalHouseholdsServed} 户` }}</div>
                  <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? `Load ${prov.overallSaturationRate}%` : `负荷率 ${prov.overallSaturationRate}%` }}</div>
                </div>
              </div>
            </div>

            <!-- 2. 第二级：区域代理列表 (根据选中的省联动) -->
            <div class="space-y-1.5 pt-1 border-t border-[#E9F1EB]">
              <div class="text-[11px] font-bold text-[#58685D] flex items-center justify-between">
                <span>{{ isEn ? '② Regional Agent (Multi-Center Coordination)' : '② 区域代理 (多中心协调调度)' }}</span>
                <span class="font-mono text-[#326445] text-[10px]">{{ isEn ? `${currentDistrictsList.length} regions` : `下辖 ${currentDistrictsList.length} 个区域` }}</span>
              </div>
              <div class="space-y-1.5">
                <div
                  v-for="dist in currentDistrictsList"
                  :key="dist.id"
                  class="p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between"
                  :class="selectedLevel === 'DISTRICT' && selectedDistrictId === dist.id
                    ? 'bg-[#EFF5F1] border-[#5C8A6B] shadow-2xs ring-1 ring-[#7FA48C]'
                    : 'bg-[#F3F8F4]/70 border-[#D9E5DB] hover:bg-[#E9F1EB]/70'"
                  @click="onSelectDistrict(dist)"
                >
                  <div class="flex items-center gap-2">
                    <el-tag size="small" type="info" effect="plain" class="scale-90 font-bold">{{ isEn ? 'Reg.' : '区级' }}</el-tag>
                    <div>
                      <div class="font-bold text-[#1B3123]">{{ dist.district }}</div>
                      <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? `Manager: ${dist.name} | ${dist.children?.length} stations` : `经理: ${dist.name} | ${dist.children?.length} 个终端站` }}</div>
                    </div>
                  </div>
                  <div class="text-end font-mono">
                    <div class="font-bold text-[#2A5440]">{{ isEn ? `${dist.totalHouseholdsServed} HH` : `${dist.totalHouseholdsServed} 户` }}</div>
                    <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? `${dist.overallSaturationRate}% Load` : `${dist.overallSaturationRate}% 负荷` }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 第三级：街道代理列表 (根据选中的区域联动，1500户硬上限强约束) -->
            <div class="space-y-1.5 pt-1 border-t border-[#E9F1EB]">
              <div class="text-[11px] font-bold text-[#58685D] flex items-center justify-between">
                <span>{{ isEn ? '③ Street Agents (Terminal Stores · 1,500-Household Ceiling)' : '③ 街道代理 (终端服务门店 · 上限1,500户)' }}</span>
                <span class="font-mono text-[#2F7A50] text-[10px]">{{ isEn ? `${currentStreetStationsList.length} stations in district` : `当前区 ${currentStreetStationsList.length} 个网点` }}</span>
              </div>
              <div class="space-y-1.5 max-h-[190px] overflow-y-auto pe-1">
                <div
                  v-for="st in currentStreetStationsList"
                  :key="st.id"
                  class="p-2 rounded-lg border transition-all cursor-pointer space-y-1"
                  :class="selectedLevel === 'STREET' && selectedStationId === st.id
                    ? 'bg-[#EFF5F1] border-[#3E9B68] shadow-2xs ring-1 ring-[#6FBF92]'
                    : 'bg-[#F3F8F4]/70 border-[#D9E5DB] hover:bg-[#E9F1EB]/70'"
                  @click="onSelectStreetStation(st)"
                >
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5 font-bold truncate">
                      <el-tag size="small" type="success" effect="plain" class="scale-85">{{ isEn ? 'Street' : '街道' }}</el-tag>
                      <span class="truncate text-[#1B3123]">{{ st.storeName }}</span>
                      <el-tag v-if="st.isSelf" size="small" type="warning" effect="dark" class="scale-75 origin-left rtl:origin-right">{{ isEn ? 'Mine' : '我经营' }}</el-tag>
                    </div>

                    <el-tag
                      size="small"
                      :type="st.lockStatus === 'SATURATED_LOCKED' ? 'danger' : (st.lockStatus === 'WARNING' ? 'warning' : 'success')"
                      effect="light"
                      class="scale-90 shrink-0 font-bold"
                    >
                      {{ st.status }}
                    </el-tag>
                  </div>

                  <div class="flex items-center justify-between text-[10px]">
                    <span class="text-[#58685D] truncate">{{ st.streetName }} ({{ st.name }})</span>
                    <span class="font-mono font-bold" :class="st.lockStatus === 'SATURATED_LOCKED' ? 'text-[#C04442]' : 'text-[#43554B]'">
                      {{ isEn ? `${st.householdsCount} / 1,500 HH` : `${st.householdsCount} / 1,500 户` }} ({{ st.saturationRate }}%)
                    </span>
                  </div>

                  <el-progress
                    :percentage="Math.min(100, st.saturationRate)"
                    :status="st.lockStatus === 'SATURATED_LOCKED' ? 'exception' : (st.lockStatus === 'WARNING' ? 'warning' : 'primary')"
                    :show-text="false"
                    :stroke-width="4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前选中代理的【法定管辖范围与业务档案卡】 (需求 2) -->
        <div class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]/90 shadow-2xs space-y-2 text-xs">
          <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]">
            <span class="font-bold text-[#1F3326] flex items-center gap-1.5">
              <el-icon class="text-[#326445]"><OfficeBuilding /></el-icon>
              <span>{{ isEn ? 'Legal Jurisdiction of Selected Agent' : '当前选中代理的法定管辖范围' }}</span>
            </span>
            <el-tag size="small" :type="currentScopeLevelTagType" effect="dark" class="font-bold">
              {{ currentScopeLevelTitle }}
            </el-tag>
          </div>

          <div class="space-y-1.5 text-[#58685D] leading-relaxed text-[11px]">
            <div class="flex justify-between items-start">
              <span class="text-[#8A9A8F] shrink-0">{{ isEn ? 'Agent Responsible:' : '代理责任人：' }}</span>
            <span class="font-bold text-[#1F3326] text-end">{{ currentScopeAgentName }} (<bdi dir="ltr">{{ currentScopeAgentPhone }}</bdi>)</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-[#8A9A8F] shrink-0">{{ isEn ? 'Administrative Scope:' : '管辖行政范围：' }}</span>
              <span class="font-semibold text-[#2A5440] text-end">{{ currentScopeJurisdiction }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-[#8A9A8F] shrink-0">{{ isEn ? 'Bound Ration Center:' : '物理绑定配给中心：' }}</span>
              <span class="text-[#1F3326] text-end">{{ currentScopeCenterName }}</span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-[#D9E5DB]/60 font-mono">
              <span class="text-[#8A9A8F]">{{ isEn ? 'Served Households:' : '管辖服务户数：' }}</span>
              <span class="font-bold text-base text-[#1B3123]">
                {{ currentScopeHouseholdsCount.toLocaleString() }}
                <span class="text-[10px] text-[#58685D] font-normal">/ {{ currentScopeCapacityLimit.toLocaleString() }} {{ isEn ? 'HH ceiling' : '户上限' }}</span>
              </span>
            </div>
            <div v-if="currentScopeIsLocked" class="p-2 bg-[#FBEAE9] border border-[#F2D5D4] rounded-lg text-[#A93B39] text-[10px] leading-normal font-medium">
              ⚠️ {{ isEn ? '[V1 Grid Saturation Interception]: The 1,500-household hard ceiling has been reached and saturation-locked; new household immigration is prohibited — a regional manager must split off and establish a new agent station!' : '【V1 网格饱和拦截】：已达 1,500 户硬上限饱和锁定，禁止新户迁入，必须由区域经理分流设立新代理点！' }}
            </div>
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- 右栏 (7/12)：上方公民列表 + 下方伊拉克真实在线地图热力图 -->
      <!-- ======================================================== -->
      <div class="lg:col-span-7 space-y-4">
        <!-- 2.1 右侧上方：当前代理管辖范围内的公民列表 (需求 2 & 3 位置互换) -->
        <div
          class="bg-white rounded-lg p-4 sm:p-5 border border-[#D9E5DB]/90 shadow-2xs space-y-3"
          :class="{ 'hidden lg:block': mobileViewMode !== 'FAMILIES' && isMobile }"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[#E9F1EB]">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#3E9B68]"></span>
                <h4 class="font-bold text-[#1F3326] text-xs sm:text-sm">
                  {{ isEn ? `Registered Citizens under [${currentScopeAgentName}]` : `【${currentScopeAgentName}】管辖范围内的在册公民列表` }}
                </h4>
                <el-tag size="small" type="success" effect="plain" class="scale-90 font-mono">
                  {{ isEn ? `${filteredFamilies.length} HH` : `共 ${filteredFamilies.length} 户` }}
                </el-tag>
              </div>
              <p class="text-[11px] text-[#8A9A8F] mt-0.5">
                {{ isEn ? `Jurisdiction: ${currentScopeJurisdiction} | Includes all verified ration families and registered citizens` : `管辖区域：${currentScopeJurisdiction} | 包含全部已核验配给家庭与在册公民` }}
              </p>
            </div>

            <!-- 搜索框 -->
            <el-input
              v-model="familySearchKeyword"
              :placeholder="isEn ? 'Search head name / family code / national ID' : '搜索户主姓名 / 户号 / 身份证号'"
              clearable
              size="small"
              style="width: 210px"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>

          <!-- 公民家庭明细表格 -->
          <el-table
            :data="pagedFamilies"
            v-loading="loadingFamilies"
            border
            style="width: 100%"
            class="text-xs"
            max-height="250"
          >
            <el-table-column prop="familyCode" :label="isEn ? 'Family / Ration Card No.' : '家庭编号 / 配给卡号'" width="165">
              <template #default="{ row }">
                <div class="font-mono font-bold text-[#2A5440]">{{ row.familyCode }}</div>
                <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.rationCardNo }}</div>
              </template>
            </el-table-column>

            <el-table-column :label="isEn ? 'Head Name & Identity' : '户主姓名与公民身份'" min-width="155">
              <template #default="{ row }">
                <div class="font-bold text-[#1B3123]">{{ row.headName }}</div>
                <div class="text-[10px] text-[#8A9A8F] font-mono">{{ isEn ? 'National Card:' : '国民卡:' }} {{ row.nationalId }}</div>
              </template>
            </el-table-column>

            <el-table-column prop="memberCount" :label="isEn ? 'Members' : '人口'" width="75" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="info" effect="plain" class="font-mono font-bold">
                  {{ isEn ? `${row.memberCount} ppl` : `${row.memberCount} 人` }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column :label="isEn ? 'Monthly Quota (Flour/Rice/Oil)' : '核定月配额 (面粉/米/油)'" min-width="180">
              <template #default="{ row }">
                <div class="text-[11px] text-[#58685D] font-mono">
                  {{ isEn ? 'Flour:' : '面粉:' }} <strong>{{ row.quotaFlourKg }}</strong> KG | {{ isEn ? 'Rice:' : '大米:' }} <strong>{{ row.quotaRiceKg }}</strong> KG
                  <div class="text-[#8A9A8F] text-[10px]">{{ isEn ? 'Oil:' : '食用油:' }} <strong>{{ row.quotaOilL }}</strong> L</div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="assignedDate" :label="isEn ? 'Contract Date' : '签约日期'" width="105" align="center">
              <template #default="{ row }">
                <span class="font-mono text-[#58685D] text-[11px]">{{ row.assignedDate }}</span>
              </template>
            </el-table-column>

            <el-table-column :label="isEn ? 'Ration Status' : '配给状态'" width="95" align="center">
              <template #default="{ row }">
                <el-tag size="small" type="success" effect="light">{{ row.cardStatus }}</el-tag>
              </template>
            </el-table-column>

            <el-table-column :label="isEn ? 'Action' : '操作'" width="85" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="viewFamilyDetail(row)">
                  {{ isEn ? 'Dossier' : '档案' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页器 -->
          <div class="flex items-center justify-between text-xs pt-2 border-t border-[#E9F1EB]">
            <span class="text-[#8A9A8F] text-[11px]">
              {{ isEn ? `Page ${familyCurrentPage} of ${Math.ceil(filteredFamilies.length / familyPageSize) || 1}` : `当前显示第 ${familyCurrentPage} 页 / 共 ${Math.ceil(filteredFamilies.length / familyPageSize) || 1} 页` }}
            </span>
            <el-pagination
              v-model:current-page="familyCurrentPage"
              v-model:page-size="familyPageSize"
              :page-sizes="[5, 10, 20]"
              layout="sizes, prev, pager, next"
              :total="filteredFamilies.length"
              size="small"
            />
          </div>
        </div>

        <!-- 2.2 右侧下方：伊拉克真实在线地图与公民热力图 (需求 3 位置互换) -->
        <div :class="{ 'hidden lg:block': mobileViewMode !== 'MAP' && isMobile }">
          <AgentRealGISMap
            :center-coords="mapCenterCoords"
            :target-location-title="currentScopeJurisdiction"
            :heat-points="mapHeatPoints"
            :agent-stations="currentAvailableStations"
            :selected-agent-id="selectedStationId"
          />
        </div>
      </div>
    </div>

    <!-- 公民家庭档案抽屉 -->
    <el-drawer
      v-model="familyDrawerVisible"
      :title="isEn ? 'Ration Citizen Family Dossier Details' : '配给公民家庭档案详情'"
      :direction="currentDirection === 'rtl' ? 'ltr' : 'rtl'"
      size="400px"
      destroy-on-close
    >
      <div v-if="activeFamilyRow" class="space-y-4 text-xs">
        <div class="p-3 bg-[#EFF5F1] border border-[#C7DED0] rounded-lg space-y-1">
          <div class="font-bold text-[#1F3326] flex items-center justify-between">
            <span>{{ activeFamilyRow.headName }} {{ isEn ? '(Head)' : '(户主)' }}</span>
            <el-tag size="small" type="success" effect="dark">{{ activeFamilyRow.complianceStatus }}</el-tag>
          </div>
          <div class="text-[11px] text-[#2A5440] font-mono">
            {{ isEn ? 'Family Code:' : '家庭编号:' }} {{ activeFamilyRow.familyCode }} | {{ isEn ? 'Ration Card:' : '配给卡:' }} {{ activeFamilyRow.rationCardNo }}
          </div>
        </div>

        <div class="space-y-2 text-[#58685D]">
          <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
            <span>{{ isEn ? 'National ID Number:' : '国民身份识别号：' }}</span>
            <span class="font-mono text-[#1F3326]">{{ activeFamilyRow.nationalId }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
            <span>{{ isEn ? 'Contact Phone:' : '联系电话：' }}</span>
            <span class="font-mono text-[#1F3326]">{{ activeFamilyRow.phone }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
            <span>{{ isEn ? 'Residential Address:' : '常住居所地址：' }}</span>
            <span class="text-[#1F3326] text-end">{{ activeFamilyRow.address }}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-[#E9F1EB]">
            <span>{{ isEn ? 'Affiliated Street Station:' : '归属街道代销站：' }}</span>
            <span class="font-bold text-[#2A5440]">{{ currentSelectedStreetStation?.storeName || (isEn ? 'Mansour Comprehensive Distribution Station' : '曼苏尔综合代销站') }}</span>
          </div>
        </div>

        <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] space-y-1.5">
          <div class="font-bold text-[#1F3326]">{{ isEn ? 'Statutory Monthly Supply Standards:' : '法定月度补给额定标准：' }}</div>
          <div class="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
            <div class="p-1.5 bg-white rounded border border-[#D9E5DB]">
              <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? 'Premium Flour' : '特级面粉' }}</div>
              <div class="font-bold text-[#1F3326] text-sm">{{ activeFamilyRow.quotaFlourKg }} KG</div>
            </div>
            <div class="p-1.5 bg-white rounded border border-[#D9E5DB]">
              <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? 'Premium Rice' : '精制大米' }}</div>
              <div class="font-bold text-[#1F3326] text-sm">{{ activeFamilyRow.quotaRiceKg }} KG</div>
            </div>
            <div class="p-1.5 bg-white rounded border border-[#D9E5DB]">
              <div class="text-[10px] text-[#8A9A8F]">{{ isEn ? 'Vegetable Oil' : '植物油' }}</div>
              <div class="font-bold text-[#1F3326] text-sm">{{ activeFamilyRow.quotaOilL }} L</div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { currentDirection } from '../../../locales/index.js';
import { ElMessage } from 'element-plus';
import {
  OfficeBuilding,
  Search
} from '@element-plus/icons-vue';
import AgentRealGISMap from './AgentRealGISMap.vue';
import { getAgentHierarchyTree, getAgentFamilies } from '../../../api/agent.js';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');

const loadingHierarchy = ref(false);
const loadingFamilies = ref(false);
const hierarchyTree = ref([]);

// 3级联动选中状态
const selectedLevel = ref('STREET'); // 'PROVINCE' | 'DISTRICT' | 'STREET'
const selectedProvId = ref('PROV-AGT-BAG01');
const selectedDistrictId = ref('REG-AGT-01');
const selectedStationId = ref('FA-00128');

const currentScopeFamilies = ref([]);
const familySearchKeyword = ref('');
const familyCurrentPage = ref(1);
const familyPageSize = ref(10);

const familyDrawerVisible = ref(false);
const activeFamilyRow = ref(null);

// 移动端视口检测
const mobileViewMode = ref('HIERARCHY'); // HIERARCHY / FAMILIES / MAP
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const isMobile = computed(() => windowWidth.value < 1024);

const updateWindowWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth;
  }
};

// 1. 获取当前选中的省级节点
const currentProvince = computed(() => {
  return hierarchyTree.value.find((p) => p.id === selectedProvId.value) || hierarchyTree.value[0];
});

// 2. 获取当前省级下辖的区域列表
const currentDistrictsList = computed(() => {
  return currentProvince.value?.children || [];
});

// 3. 获取当前选中的区域节点
const currentDistrict = computed(() => {
  return currentDistrictsList.value.find((d) => d.id === selectedDistrictId.value) || currentDistrictsList.value[0];
});

// 4. 获取当前区域下辖的街道代理列表
const currentStreetStationsList = computed(() => {
  return currentDistrict.value?.children || [];
});

// 5. 获取当前选中的街道代理节点
const currentSelectedStreetStation = computed(() => {
  return currentStreetStationsList.value.find((s) => s.id === selectedStationId.value) || currentStreetStationsList.value[0];
});

// 所有街道网点集合
const allStreetStations = computed(() => {
  const result = [];
  hierarchyTree.value.forEach((prov) => {
    prov.children?.forEach((dist) => {
      dist.children?.forEach((st) => {
        result.push(st);
      });
    });
  });
  return result;
});

// 地图当前可显示的站点（根据选中范围）
const currentAvailableStations = computed(() => {
  if (selectedLevel.value === 'STREET') {
    return currentSelectedStreetStation.value ? [currentSelectedStreetStation.value] : allStreetStations.value;
  }
  if (selectedLevel.value === 'DISTRICT') {
    return currentStreetStationsList.value;
  }
  return allStreetStations.value;
});

// 动态计算管辖范围档案卡中的字段
const currentScopeLevelTitle = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return isEn.value ? 'Provincial Governor' : '省级总管';
  if (selectedLevel.value === 'DISTRICT') return isEn.value ? 'Regional Dispatch' : '区域调度';
  return isEn.value ? 'Terminal Street Store' : '终端街道门店';
});

const currentScopeLevelTagType = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return 'primary';
  if (selectedLevel.value === 'DISTRICT') return 'info';
  return 'success';
});

const currentScopeAgentName = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return currentProvince.value?.name || (isEn.value ? 'Mohammed Jabbar' : '穆罕默德·贾巴尔');
  if (selectedLevel.value === 'DISTRICT') return currentDistrict.value?.name || (isEn.value ? 'Regional Manager' : '区域经理');
  return currentSelectedStreetStation.value?.name || (isEn.value ? 'Street Agent' : '街道代理');
});

const currentScopeAgentPhone = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return currentProvince.value?.phone || '07701122339';
  if (selectedLevel.value === 'DISTRICT') return currentDistrict.value?.phone || '07705544331';
  return currentSelectedStreetStation.value?.phone || '07701122339';
});

const currentScopeJurisdiction = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return currentProvince.value?.jurisdictionScope || (isEn.value ? 'All 14 districts of Baghdad' : '巴格达全境 14 个行政区');
  if (selectedLevel.value === 'DISTRICT') return isEn.value
    ? `${currentDistrict.value?.district || 'Karkh District'} (covering ${currentDistrict.value?.children?.length || 3} streets)`
    : `${currentDistrict.value?.district || '卡尔赫区'}全境 (下辖 ${currentDistrict.value?.children?.length || 3} 个街道)`;
  return `${currentSelectedStreetStation.value?.district} · ${currentSelectedStreetStation.value?.streetName} (${currentSelectedStreetStation.value?.address})`;
});

const currentScopeCenterName = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return isEn.value ? 'Baghdad National Grain No.1 Reserve Master Warehouse / Strategic Dispatch Center' : '巴格达国家粮食第一储备总仓 / 战略调度中心';
  if (selectedLevel.value === 'DISTRICT') return currentDistrict.value?.centerBindingName || (isEn.value ? 'Karkh 1st Ration Center' : '卡尔赫第一配给中心');
  return currentSelectedStreetStation.value?.centerName || (isEn.value ? 'Karkh 1st Ration Center (Mansour)' : '卡尔赫第一配给中心 (曼苏尔)');
});

const currentScopeHouseholdsCount = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return currentProvince.value?.totalHouseholdsServed || 7650;
  if (selectedLevel.value === 'DISTRICT') return currentDistrict.value?.totalHouseholdsServed || 4100;
  return currentSelectedStreetStation.value?.householdsCount || 1120;
});

const currentScopeCapacityLimit = computed(() => {
  if (selectedLevel.value === 'PROVINCE') return currentProvince.value?.maxCapacitySum || 10500;
  if (selectedLevel.value === 'DISTRICT') return currentDistrict.value?.maxCapacitySum || 4500;
  return currentSelectedStreetStation.value?.maxHouseholdsLimit || 1500;
});

const currentScopeIsLocked = computed(() => {
  return selectedLevel.value === 'STREET' && currentSelectedStreetStation.value?.lockStatus === 'SATURATED_LOCKED';
});

// 计算地图中心定位与缩放级别
const mapCenterCoords = computed(() => {
  if (selectedLevel.value === 'PROVINCE') {
    return { lat: 33.3152, lng: 44.3661, zoom: 11 };
  }
  if (selectedLevel.value === 'DISTRICT') {
    const lat = currentDistrict.value?.children?.[0]?.gisCoords?.lat || 33.3128;
    const lng = currentDistrict.value?.children?.[0]?.gisCoords?.lng || 44.3450;
    return { lat, lng, zoom: 13 };
  }
  if (currentSelectedStreetStation.value?.gisCoords) {
    return {
      lat: currentSelectedStreetStation.value.gisCoords.lat,
      lng: currentSelectedStreetStation.value.gisCoords.lng,
      zoom: 15
    };
  }
  return { lat: 33.3128, lng: 44.3615, zoom: 14 };
});

// 动态生成公民数量热力图点集 [[lat, lng, weight], ...]
const mapHeatPoints = computed(() => {
  const points = [];
  const families = currentScopeFamilies.value;
  const baseLat = mapCenterCoords.value.lat;
  const baseLng = mapCenterCoords.value.lng;

  families.forEach((f, idx) => {
    // 根据家庭成员数计算热力权重 (3~7人对应 0.5~1.0)
    const weight = Math.min(1.0, 0.4 + (f.memberCount || 5) * 0.1);
    // 生成自然分布的经纬度散点
    const offsetLat = ((idx % 5) - 2) * 0.0025 + (Math.sin(idx) * 0.001);
    const offsetLng = (((idx * 2) % 5) - 2) * 0.0025 + (Math.cos(idx) * 0.001);
    points.push([baseLat + offsetLat, baseLng + offsetLng, weight]);
  });

  // 如果点数较少，补充围绕中心的高斯热力样本
  if (points.length > 0 && points.length < 15) {
    for (let i = 0; i < 20; i++) {
      const radius = 0.004;
      const angle = (i / 20) * 2 * Math.PI;
      points.push([
        baseLat + Math.sin(angle) * radius * (0.3 + (i % 3) * 0.3),
        baseLng + Math.cos(angle) * radius * (0.3 + (i % 3) * 0.3),
        0.6 + (i % 4) * 0.1
      ]);
    }
  }
  return points;
});

// 1. 点击选择第一级：省级代理
const onSelectProvince = (prov) => {
  selectedLevel.value = 'PROVINCE';
  selectedProvId.value = prov.id;
  // 联动刷新区域与街道默认项
  if (prov.children && prov.children.length > 0) {
    selectedDistrictId.value = prov.children[0].id;
    if (prov.children[0].children && prov.children[0].children.length > 0) {
      selectedStationId.value = prov.children[0].children[0].id;
    }
  }
  fetchScopeFamilies(prov.id);
  ElMessage.success(isEn.value ? `Switched to provincial macro view: ${prov.name}` : `已切换至省级宏观视角：${prov.name}`);
};

// 2. 点击选择第二级：区域代理
const onSelectDistrict = (dist) => {
  selectedLevel.value = 'DISTRICT';
  selectedDistrictId.value = dist.id;
  if (dist.children && dist.children.length > 0) {
    selectedStationId.value = dist.children[0].id;
  }
  fetchScopeFamilies(dist.id);
  ElMessage.success(isEn.value ? `Drilled down to regional dispatch view: ${dist.district}` : `已下钻至区域级调度视角：${dist.district}`);
};

// 3. 点击选择第三级：街道代理
const onSelectStreetStation = (st) => {
  selectedLevel.value = 'STREET';
  selectedStationId.value = st.id;
  fetchScopeFamilies(st.id);
};

// 获取对应代理范围内的公民列表
const fetchScopeFamilies = async (scopeId) => {
  loadingFamilies.value = true;
  familyCurrentPage.value = 1;
  try {
    const res = await getAgentFamilies(scopeId);
    currentScopeFamilies.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    ElMessage.error(t('agent.familiesLoadFailed'));
  } finally {
    loadingFamilies.value = false;
  }
};

const loadHierarchyData = async () => {
  loadingHierarchy.value = true;
  try {
    const res = await getAgentHierarchyTree();
    hierarchyTree.value = Array.isArray(res) ? res : (res?.data || []);
    if (hierarchyTree.value.length > 0) {
      const prov = hierarchyTree.value[0];
      selectedProvId.value = prov.id;
      if (prov.children?.[0]) {
        selectedDistrictId.value = prov.children[0].id;
        if (prov.children[0].children?.[0]) {
          selectedStationId.value = prov.children[0].children[0].id;
        }
      }
      fetchScopeFamilies(selectedStationId.value);
    }
  } catch (error) {
    ElMessage.error(t('agent.hierarchyLoadFailed'));
  } finally {
    loadingHierarchy.value = false;
  }
};

// 过滤家庭列表
const filteredFamilies = computed(() => {
  let list = [...currentScopeFamilies.value];
  if (familySearchKeyword.value) {
    const kw = familySearchKeyword.value.toLowerCase().trim();
    list = list.filter(
      (f) =>
        f.headName.toLowerCase().includes(kw) ||
        f.familyCode.toLowerCase().includes(kw) ||
        f.nationalId.includes(kw) ||
        f.rationCardNo.toLowerCase().includes(kw)
    );
  }
  return list;
});

const pagedFamilies = computed(() => {
  const start = (familyCurrentPage.value - 1) * familyPageSize.value;
  return filteredFamilies.value.slice(start, start + familyPageSize.value);
});

const viewFamilyDetail = (row) => {
  activeFamilyRow.value = row;
  familyDrawerVisible.value = true;
};

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
  loadHierarchyData();
});

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth);
});
</script>

<style scoped>
.agent-hierarchy-panel {
  animation: fadeIn 0.25s ease-out forwards;
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
