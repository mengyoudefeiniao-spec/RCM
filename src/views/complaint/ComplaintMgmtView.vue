<template>
  <div class="complaint-mgmt-view space-y-4">
    <!-- 头部简要概览 -->
    <div class="bg-white px-5 py-4 rounded-lg border border-[#D9E5DB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-start sm:items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#FBEAE9] border border-[#F2D5D4] text-[#C04442] flex items-center justify-center font-bold shrink-0 mt-0.5 sm:mt-0">
          <el-icon class="text-base"><Service /></el-icon>
        </div>
        <ModuleDescTip
          :title="$t('complaint.title')"
          :content="$t('complaint.subtitle')"
          :badge="$t('complaint.badgeDualTrack')"
          badge-type="danger"
          title-class="text-sm font-bold text-[#1B3123]"
        >
          <template #extra>
            <el-tag size="small" type="danger" effect="plain" class="font-bold ms-1">
              {{ $t('complaint.supervision') }}
            </el-tag>
          </template>
        </ModuleDescTip>
      </div>

      <div class="flex items-center gap-2">
        <el-button type="primary" size="small" @click="openCreateComplaintDialog">
          <el-icon class="me-1"><Phone /></el-icon>
          {{ $t('complaint.registerPhone') }}
        </el-button>
        <el-button size="small" @click="loadComplaints" :loading="loading">
          <el-icon class="me-1"><Refresh /></el-icon>
          {{ $t('common.refresh') }}
        </el-button>
      </div>
    </div>

    <!-- 顶部 KPI 卡片 (针对 Google Pixel 9 412px 视口优化: 前4项2列对称排列，第5项通栏展示) -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
      <div class="bg-white p-3 rounded-lg border border-[#D9E5DB] shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-[#8A9A8F]">{{ $t('complaint.totalComplaints') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#1B3123]">{{ complaintsList.length }}</div>
        <div class="text-[10px] text-[#58685D]">{{ $t('complaint.channelDual') }}</div>
      </div>
      <div class="bg-white p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-[#2F7A50]">{{ $t('complaint.aiOnline') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#2F5B44]">{{ aiChannelCount }}</div>
        <div class="text-[10px] text-[#8A9A8F]">{{ $t('complaint.channelAiDesc') }}</div>
      </div>
      <div class="bg-white p-3 rounded-lg border border-[#FDF3E0] shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-[#C9A13B]">{{ $t('complaint.phoneHotline') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#7A5F21]">{{ phoneChannelCount }}</div>
        <div class="text-[10px] text-[#8A9A8F]">{{ $t('complaint.channelPhoneDesc') }}</div>
      </div>
      <div class="bg-white p-3 rounded-lg border border-[#F7E3E2] shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-[#C04442]">{{ $t('complaint.pendingHandling') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#A93B39]">{{ pendingCount }}</div>
        <div class="text-[10px] text-[#C04442] font-medium">{{ $t('complaint.pendingFollowup') }}</div>
      </div>
      <div class="col-span-2 sm:col-span-1 bg-white p-3 rounded-lg border border-[#E1F4E4] shadow-2xs space-y-1">
        <div class="text-[10px] sm:text-[11px] text-[#2F7A50]">{{ $t('complaint.resolvedRate') }}</div>
        <div class="text-lg sm:text-xl font-bold font-mono text-[#2F5B44]">{{ resolvedRate }}%</div>
        <div class="text-[10px] text-[#2F7A50]">{{ $t('complaint.resolvedRateDesc') }}</div>
      </div>
    </div>

    <!-- 检索筛选区 (移动端支持折叠，保持首屏整洁) -->
    <div class="bg-white p-3 sm:p-4 rounded-lg border border-[#D9E5DB] shadow-2xs space-y-3 text-xs">
      <div class="flex items-center justify-between">
        <span class="font-bold text-[#43554B] text-xs">{{ $t('complaint.filterSearch') }}</span>
        <button
          type="button"
          class="sm:hidden text-[#326445] text-[11px] underline"
          @click="showMobileFilter = !showMobileFilter"
        >
          {{ showMobileFilter ? $t('complaint.collapseFilters') : $t('complaint.expandFilters') }}
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 items-center">
        <!-- 移动端可折叠的高级下拉框 -->
        <div
          class="contents sm:grid sm:grid-cols-2 md:col-span-4 xl:col-span-5 sm:gap-2"
          :class="showMobileFilter ? '' : 'hidden sm:grid'"
        >
          <!-- 渠道来源 -->
          <el-select v-model="query.channel" :placeholder="$t('complaint.channelSource')" class="w-full" size="small" @change="handleSearch">
            <el-option v-for="opt in channelOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>

          <!-- 诉求类型 -->
          <el-select v-model="query.type" :placeholder="$t('complaint.appealType')" class="w-full" size="small" @change="handleSearch">
            <el-option v-for="opt in typeFilterOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>

          <!-- 办理状态 -->
          <el-select v-model="query.status" :placeholder="$t('complaint.handleStatus')" class="w-full" size="small" @change="handleSearch">
            <el-option v-for="opt in statusFilterOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>

          <!-- 省市 -->
          <el-select v-model="query.province" :placeholder="$t('common.province')" class="w-full" size="small" @change="handleProvinceChange">
            <el-option :label="$t('complaint.allProvinces')" value="" />
            <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
          </el-select>

          <!-- 中心 -->
          <el-select v-model="query.center" :placeholder="$t('common.center')" class="w-full md:col-span-2 xl:col-span-1" size="small" @change="handleSearch">
            <el-option :label="$t('complaint.allCenters')" value="" />
            <el-option v-for="c in currentCenterOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>

        <!-- 关键词搜索与按钮行 -->
        <div class="flex items-center gap-2 md:col-span-4 xl:col-span-3">
          <el-input
            v-model="query.keyword"
            :placeholder="$t('complaint.searchHint')"
            class="flex-1"
            size="small"
            clearable
            @keyup.enter="handleSearch"
          />

          <el-button type="primary" size="small" :icon="Search" @click="handleSearch">{{ $t('complaint.queryBtn') }}</el-button>
          <el-button size="small" :icon="Refresh" @click="resetQuery">{{ $t('complaint.resetBtn') }}</el-button>
        </div>
      </div>
    </div>

    <!-- 列表数据区 (移动端提供卡片流与传统表格双视图) -->
    <div class="bg-white rounded-lg border border-[#D9E5DB] shadow-2xs overflow-hidden p-3 sm:p-0">
      <div class="sm:hidden flex items-center justify-between pb-2.5 mb-2 border-b border-[#E9F1EB]">
        <span class="text-xs font-bold text-[#1F3326]">{{ $t('complaint.ticketList') }} ({{ filteredList.length }})</span>
        <div class="flex items-center bg-[#E9F1EB] p-0.5 rounded-lg text-[10px]">
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'card' ? 'bg-white text-[#C04442] shadow-2xs font-bold' : 'text-[#58685D]'"
            @click="viewMode = 'card'"
          >
            {{ $t('complaint.cardView') }}
          </button>
          <button
            type="button"
            class="px-2 py-0.5 rounded-md font-medium transition-all"
            :class="viewMode === 'table' ? 'bg-white text-[#C04442] shadow-2xs font-bold' : 'text-[#58685D]'"
            @click="viewMode = 'table'"
          >
            {{ $t('complaint.tableView') }}
          </button>
        </div>
      </div>

      <!-- 视图 1: 移动端专属工单卡片流 (Pixel 9 412px 视口流畅滑动) -->
      <div v-if="viewMode === 'card'" class="sm:hidden space-y-2.5">
        <div
          v-for="item in paginatedList"
          :key="item.id"
          class="p-3 rounded-lg border border-[#D9E5DB]/90 bg-white shadow-2xs space-y-2 active:scale-[0.99] transition-transform"
        >
          <!-- 头部: 编号、渠道、状态 -->
          <div class="flex items-center justify-between pb-1.5 border-b border-[#E9F1EB]">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-bold text-[#326445] text-xs">{{ item.id }}</span>
              <el-tag size="small" :type="item.channel.includes('AI') ? 'primary' : 'warning'" effect="plain" class="scale-90 origin-left rtl:origin-right">
                {{ item.channel.includes('AI') ? $t('complaint.channelAiTag') : $t('complaint.channelPhoneTag') }}
              </el-tag>
            </div>
            <el-tag size="small" :type="getStatusTag(item.status)" effect="light">
              {{ statusLabel(item.status) }}
            </el-tag>
          </div>

          <!-- 主体诉求与类型 -->
          <div>
            <div class="font-bold text-[#1F3326] text-xs leading-snug">{{ item.title }}</div>
            <div class="mt-1 flex items-center gap-1.5">
              <el-tag size="small" :type="getTypeTag(item.type)" class="scale-90 origin-left rtl:origin-right">{{ shortType(item.type) }}</el-tag>
              <span class="text-[10px] text-[#8A9A8F] font-mono">{{ item.submittedAt?.slice(0, 16).replace('T', ' ') }}</span>
            </div>
          </div>

          <!-- 市民信息与归属网点 -->
          <div class="p-2 rounded-lg bg-[#F3F8F4] text-[11px] grid grid-cols-2 gap-1.5">
            <div>
              <span class="text-[#8A9A8F] block text-[10px]">{{ $t('complaint.cardCitizen') }}</span>
              <span class="font-medium text-[#43554B]">{{ item.applicantName }} (<bdi dir="ltr">{{ item.callPhone || '—' }}</bdi>)</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block text-[10px]">{{ $t('complaint.cardArea') }}</span>
              <span class="text-[#43554B] truncate block">{{ item.province }} · {{ item.agentName }}</span>
            </div>
          </div>

          <!-- 操作按钮行 -->
          <div class="flex items-center justify-end gap-2 pt-1 border-t border-[#E9F1EB]">
            <el-button size="small" plain @click="openDetail(item)">{{ $t('complaint.viewDetail') }}</el-button>
            <el-button
              size="small"
              :type="item.status === '已办结' || item.status === 'Resolved' ? 'info' : 'danger'"
              :plain="item.status === '已办结' || item.status === 'Resolved'"
              @click="openHandleModal(item)"
            >
              {{ item.status === '已办结' || item.status === 'Resolved' ? $t('complaint.viewHandling') : $t('complaint.handleSupervise') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 视图 2: 经典表格视图 (桌面端显示，移动端可手动切换) -->
      <div v-show="viewMode === 'table' || isDesktop" class="overflow-x-auto">
        <el-table :data="paginatedList" v-loading="loading" size="small" stripe border class="text-xs">
          <el-table-column prop="id" :label="$t('review.ticketId')" width="130" fixed>
            <template #default="{ row }">
              <span class="font-mono font-bold text-[#326445]">{{ row.id }}</span>
            </template>
          </el-table-column>

        <el-table-column prop="channel" :label="$t('complaint.channelSource')" width="118">
          <template #default="{ row }">
            <el-tooltip :content="row.channel" placement="top">
              <el-tag size="small" :type="row.channel.includes('AI') ? 'primary' : 'warning'" effect="plain" class="font-medium">
                <el-icon class="me-1"><ChatDotRound v-if="row.channel.includes('AI')" /><Phone v-else /></el-icon>
                {{ shortChannel(row.channel) }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="type" :label="$t('complaint.appealType')" width="120">
          <template #default="{ row }">
            <el-tooltip :content="typeLabel(row.typeCode || row.type)" placement="top">
              <el-tag size="small" :type="getTypeTag(row.type)">{{ shortType(row.type) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="title" :label="$t('complaint.mainContent')" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="font-medium text-[#1F3326]">{{ row.title }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('complaint.citizenName')" width="160">
          <template #default="{ row }">
            <div class="text-[#1F3326] font-medium">{{ row.applicantName }}</div>
            <div class="text-[10px] text-[#8A9A8F] font-mono">{{ row.callPhone }}</div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('complaint.targetArea')" min-width="200">
          <template #default="{ row }">
            <div class="text-[#43554B] font-medium">{{ row.province }} · {{ row.center }}</div>
            <div class="text-[11px] text-[#58685D]">{{ row.agentName }}</div>
          </template>
        </el-table-column>

        <el-table-column prop="status" :label="$t('complaint.handleStatus')" width="104" align="center">
          <template #default="{ row }">
            <el-tooltip :content="statusLabel(row.status)" placement="top">
              <el-tag
                size="small"
                :type="row.status === '已办结' || row.status === 'Resolved' ? 'success' : (row.status === '待分配' || row.status === 'Pending Assignment' ? 'danger' : 'warning')"
                effect="light"
              >
                {{ shortStatus(row.status) }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <el-table-column prop="submittedAt" :label="$t('complaint.registerTime')" width="130" align="center" class-name="font-mono text-[#8A9A8F]" />

        <el-table-column :label="$t('common.action')" width="96" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <el-tooltip :content="$t('complaint.detailTip')" placement="top">
                <el-button size="small" type="primary" plain circle @click="openDetail(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip
                :content="row.status === '已办结' || row.status === 'Resolved' ? $t('complaint.viewHandleTip') : $t('complaint.handleTip')"
                placement="top"
              >
                <el-button
                  size="small"
                  circle
                  :type="row.status === '已办结' || row.status === 'Resolved' ? 'info' : 'danger'"
                  :plain="row.status === '已办结' || row.status === 'Resolved'"
                  @click="openHandleModal(row)"
                >
                  <el-icon><component :is="row.status === '已办结' || row.status === 'Resolved' ? View : EditPen" /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 分页栏 -->
      <div class="p-3 bg-[#F3F8F4] border-t border-[#D9E5DB] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#58685D]">
        <div>
          {{ $t('complaint.filterCount', { count: filteredList.length }) }}
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          :total="filteredList.length"
          size="small"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="$t('complaint.detailModalTitle')" width="620px" class="rcm-compact-dialog" align-center destroy-on-close>
      <div v-if="currentDetail" class="space-y-4 text-xs">
        <div class="bg-[#F3F8F4] p-3.5 rounded-lg border border-[#E9F1EB] flex items-center justify-between">
          <div>
            <div class="text-[11px] text-[#8A9A8F]">{{ $t('complaint.ticketIdLabel') }}</div>
            <div class="text-sm font-mono font-bold text-[#326445]">{{ currentDetail.id }}</div>
          </div>
          <el-tag :type="getStatusTag(currentDetail.status)">{{ statusLabel(currentDetail.status) }}</el-tag>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <span class="text-[#8A9A8F]">{{ $t('complaint.channelSource') }}:</span>
            <span class="ms-2 font-medium text-[#1F3326]">{{ currentDetail.channelCode === 'AI' || currentDetail.channel.includes('AI') ? t('complaint.aiOnline') : t('complaint.phoneHotline') }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F]">{{ $t('complaint.appealType') }}:</span>
            <span class="ms-2 font-medium text-[#1F3326]">{{ typeLabel(currentDetail.typeCode || currentDetail.type) }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F]">{{ $t('complaint.citizenName') }}:</span>
            <span class="ms-2 font-medium text-[#1F3326]">{{ currentDetail.applicantName }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F]">{{ $t('common.phone') }}:</span>
            <span class="ms-2 font-mono text-[#1F3326]">{{ currentDetail.callPhone }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F]">{{ $t('common.province') }}:</span>
            <span class="ms-2 text-[#1F3326]">{{ currentDetail.province }} · {{ currentDetail.center }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F]">{{ $t('nav.agent') }}:</span>
            <span class="ms-2 text-[#1F3326]">{{ currentDetail.agentName }}</span>
          </div>
        </div>

        <div>
          <div class="text-[#8A9A8F] mb-1">{{ $t('complaint.mainContent') }}:</div>
          <div class="p-3 bg-[#F3F8F4] rounded-lg text-[#43554B] leading-relaxed border border-[#E9F1EB]">
            {{ currentDetail.content }}
          </div>
        </div>

        <ComplaintEvidence :ticket="currentDetail" />
        <ComplaintRating :ticket="currentDetail" />

        <div v-if="currentDetail.result" class="p-3 bg-[#EFF5F1] rounded-lg border border-[#E1F4E4] text-[#24483A] space-y-1">
          <div class="font-bold flex items-center justify-between">
            <span>{{ $t('complaint.handlingResult') }}</span>
            <span class="text-[11px] font-normal text-[#2F7A50]">{{ currentDetail.handledAt }}</span>
          </div>
          <p class="leading-relaxed">{{ currentDetail.result }}</p>
          <div class="text-[11px] text-[#2F5B44] pt-1">
            <span>{{ $t('complaint.handler') }}: {{ currentDetail.handlerNameKey ? t(currentDetail.handlerNameKey) : currentDetail.handlerName }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 督办处理弹窗 -->
    <el-dialog v-model="handleVisible" :title="$t('complaint.handleModalTitle')" width="580px" class="rcm-compact-dialog" align-center destroy-on-close>
      <div v-if="currentHandling" class="space-y-4 text-xs">
        <div class="bg-[#FBEAE9]/50 p-3 rounded-lg border border-[#F7E3E2] space-y-1">
          <div class="font-bold text-[#6E2F2E]">{{ currentHandling.title }}</div>
          <p class="text-[#58685D] leading-relaxed">{{ currentHandling.content }}</p>
        </div>

        <ComplaintEvidence :ticket="currentHandling" />
        <ComplaintRating :ticket="currentHandling" />
        <div class="space-y-2">
          <label class="block font-medium text-[#43554B]">{{ $t('complaint.handlingResult') }}：</label>
          <el-input
            v-model="handleForm.result"
            type="textarea"
            :rows="3"
            :placeholder="$t('complaint.handleResultPlaceholder')"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-[#43554B] mb-1">{{ $t('complaint.handleStatus') }}：</label>
            <el-select v-model="handleForm.status" class="w-full" size="small">
              <el-option v-for="opt in statusHandleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button size="small" @click="handleVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="small" type="primary" :loading="handlingLoading" @click="submitHandle">
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 登记电话来电弹窗 -->
    <el-dialog v-model="createVisible" :title="$t('complaint.phoneModalTitle')" width="580px" destroy-on-close>
      <div class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-[#43554B] mb-1">{{ $t('complaint.citizenName') }}：</label>
            <el-input v-model="createForm.applicantName" :placeholder="$t('complaint.citizenNamePlaceholder')" size="small" />
          </div>
          <div>
            <label class="block font-medium text-[#43554B] mb-1">{{ $t('common.phone') }}：</label>
            <el-input class="bidi-ltr" v-model="createForm.callPhone" placeholder="+964 7XX XXX XXXX" size="small" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-medium text-[#43554B] mb-1">{{ $t('common.province') }}：</label>
            <el-select v-model="createForm.province" class="w-full" size="small">
              <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </div>
          <div>
            <label class="block font-medium text-[#43554B] mb-1">{{ $t('complaint.appealType') }}：</label>
            <el-select v-model="createForm.type" class="w-full" size="small">
              <el-option v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </div>
        </div>

        <div>
          <label class="block font-medium text-[#43554B] mb-1">{{ $t('complaint.targetArea') }}：</label>
          <el-input v-model="createForm.agentName" :placeholder="$t('complaint.outletNamePlaceholder')" size="small" />
        </div>

        <div>
          <label class="block font-medium text-[#43554B] mb-1">{{ $t('complaint.mainContent') }}：</label>
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="3"
            :placeholder="$t('complaint.contentPlaceholder')"
          />
        </div>
      </div>
      <template #footer>
        <el-button size="small" @click="createVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="small" type="primary" :loading="createLoading" @click="submitCreateComplaint">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, Refresh, Service, Phone, ChatDotRound, View, EditPen } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import ComplaintEvidence from '../../components/chat/ComplaintEvidence.vue';
import ComplaintRating from '../../components/chat/ComplaintRating.vue';
import { getComplaintList, createComplaintTicket, handleComplaintTicket } from '../../api/complaint.js';
import { useAuthStore } from '../../stores/auth.js';
import { COMPLAINT_STORAGE_PREFIX, COMPLAINT_STATUSES, COMPLAINT_TYPES, complaintStatusCode, complaintTypeCode } from '../../utils/complaints.js';
import { onTabMessage } from '../../utils/crossTabBus.js';

const { t, locale } = useI18n();
const authStore = useAuthStore();
const loading = ref(false);
const complaintsList = ref([]);

// 移动端视图控制：针对 Google Pixel 9 (412x924px) 视口
const viewMode = ref('card');
const isDesktop = ref(false);
const showMobileFilter = ref(false);

function handleResize() {
  if (typeof window !== 'undefined') {
    isDesktop.value = window.innerWidth >= 640;
    if (isDesktop.value) {
      viewMode.value = 'table';
    }
  }
}

const isEn = computed(() => locale.value === 'en');

const provinceOptions = computed(() => {
  return isEn.value ? [
    'Baghdad Province',
    'Basra Province',
    'Nineveh Province',
    'Diyala Province',
    'Kirkuk Province',
    'Anbar Province',
    'Erbil Province',
    'Sulaymaniyah Province'
  ] : [
    '巴格达省',
    '巴士拉省',
    '尼尼微省',
    '迪亚拉省',
    '基尔库克省',
    '安巴尔省',
    '埃尔比勒省',
    '苏莱曼尼亚省'
  ];
});

// 选项值按当前语言对齐数据源（en 数据为英文值，zh 数据为中文值），"全部" 使用空值
const channelOptions = computed(() => [
  { value: '', label: t('complaint.allChannels') },
  { value: isEn.value ? 'AI Smart Assistant' : 'AI智能客服助手', label: t('complaint.aiOnline') },
  { value: isEn.value ? '1919 Government Hotline' : '1919政务热线电话', label: t('complaint.phoneHotline') }
]);

const typeOptions = computed(() => [
  { value: isEn.value ? 'Unauthorized Overcharge / Illegal Fees' : '私自加价/违规收费', label: t('complaint.typeOvercharge') },
  { value: isEn.value ? 'Short Weight / Deductions' : '缺斤短两/克扣', label: t('complaint.typeShortage') },
  { value: isEn.value ? 'Quality / Odor Complaints' : '物资品质口感异议', label: t('complaint.typeQuality') },
  { value: isEn.value ? 'Poor Service / Long Waiting Queues' : '服务态度差/排队耗时', label: t('complaint.typeService') },
  { value: isEn.value ? 'Quota Calculation Dispute' : '配给份额核定有误', label: t('complaint.typeQuota') }
]);

const typeFilterOptions = computed(() => [{ value: '', label: t('complaint.allTypes') }, ...typeOptions.value]);

const statusOptions = computed(() => [
  { value: isEn.value ? 'Pending Assignment' : '待分配', label: t('complaint.statusPendingAssign') },
  { value: isEn.value ? 'Under Investigation' : '核查中', label: t('complaint.statusInvestigating') },
  { value: isEn.value ? 'Rectification in Progress' : '督办整改中', label: t('complaint.statusSupervising') },
  { value: isEn.value ? 'Resolved' : '已办结', label: t('complaint.statusResolved') }
]);

const statusFilterOptions = computed(() => [{ value: '', label: t('complaint.allStatuses') }, ...statusOptions.value]);

const statusHandleOptions = computed(() => statusOptions.value.filter(o => o.value !== (isEn.value ? 'Pending Assignment' : '待分配')));

const centerMap = {
  '巴格达省': ['卡尔赫第一粮食供应分部', '鲁萨法第二粮食供应分部', '曼苏尔配给中心'],
  '巴士拉省': ['巴士拉港口配给保障站', '阿沙尔滨海服务中心'],
  '尼尼微省': ['摩苏尔老城配给管理中心', '尼尼微平原调拨站'],
  '迪亚拉省': ['迪亚拉哈奈根前置保供仓服务分部', '巴古拜物资中心'],
  '基尔库克省': ['基尔库克第一配给服务中心'],
  '安巴尔省': ['费卢杰粮食供应站', '拉马迪保障中心'],
  '埃尔比勒省': ['埃尔比勒中心粮食调拨总站', '安卡瓦惠民站'],
  '苏莱曼尼亚省': ['苏莱曼尼亚中心配发处'],
  'Baghdad Province': ['Karkh 1st Food Supply Branch', 'Rusafa 2nd Food Supply Branch', 'Mansour Core Ration Center'],
  'Basra Province': ['Basra Port Ration Support Station', 'Ashar Portside Ration Center'],
  'Nineveh Province': ['Old Mosul Ration Management Center', 'Nineveh Plains Hub'],
  'Diyala Province': ['Khanaqin Forward Supply Warehouse Branch', 'Baquba Center'],
  'Kirkuk Province': ['Kirkuk Citadel Core Ration Center'],
  'Anbar Province': ['Fallujah Grain Station', 'Ramadi Support Center'],
  'Erbil Province': ['Erbil Central Grain Transfer Hub', 'Ainkawa Food Station'],
  'Sulaymaniyah Province': ['Sulaymaniyah Central Dispatch Center']
};

const query = ref({
  channel: '',
  type: '',
  status: '',
  province: '',
  center: '',
  keyword: ''
});

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

const currentCenterOptions = computed(() => {
  if (query.value.province) {
    return centerMap[query.value.province] || [];
  }
  const relevantKeys = isEn.value
    ? Object.keys(centerMap).filter(k => k.includes('Province'))
    : Object.keys(centerMap).filter(k => k.includes('省'));
  return relevantKeys.flatMap(k => centerMap[k] || []);
});

const aiChannelCount = computed(() => complaintsList.value.filter(c => c.channel.includes('AI')).length);
const phoneChannelCount = computed(() => complaintsList.value.filter(c => c.channel.includes('1919')).length);
const pendingCount = computed(() => complaintsList.value.filter(c => c.status !== '已办结' && c.status !== 'Resolved').length);
const resolvedRate = computed(() => {
  if (!complaintsList.value.length) return 100;
  const done = complaintsList.value.filter(c => c.status === '已办结' || c.status === 'Resolved').length;
  return Math.round((done / complaintsList.value.length) * 100);
});

// 前端联合多维筛选
const filteredList = computed(() => {
  let list = [...complaintsList.value];
  if (query.value.channel) {
    list = list.filter(item => item.channel.includes(query.value.channel) || (query.value.channel.includes('AI') && item.channel.includes('AI')));
  }
  if (query.value.type) {
    list = list.filter(item => item.type === query.value.type);
  }
  if (query.value.status) {
    list = list.filter(item => item.status === query.value.status);
  }
  if (query.value.province) {
    const pVal = query.value.province.replace(/省| Province/g, '');
    list = list.filter(item => item.province.includes(pVal));
  }
  if (query.value.center) {
    list = list.filter(item => item.center.includes(query.value.center));
  }
  if (query.value.keyword.trim()) {
    const kw = query.value.keyword.trim().toLowerCase();
    list = list.filter(item =>
      (item.id && item.id.toLowerCase().includes(kw)) ||
      (item.applicantName && item.applicantName.toLowerCase().includes(kw)) ||
      (item.callPhone && item.callPhone.includes(kw)) ||
      (item.title && item.title.toLowerCase().includes(kw)) ||
      (item.agentName && item.agentName.toLowerCase().includes(kw))
    );
  }
  return list;
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

function handleProvinceChange() {
  query.value.center = '';
  handleSearch();
}

function handleSearch() {
  currentPage.value = 1;
}

function resetQuery() {
  query.value = {
    channel: '',
    type: '',
    status: '',
    province: '',
    center: '',
    keyword: ''
  };
  currentPage.value = 1;
}

function getTypeTag(type) {
  if (type.includes('收费') || type.includes('Fee')) return 'danger';
  if (type.includes('品质') || type.includes('Quality')) return 'warning';
  if (type.includes('克扣') || type.includes('Weight')) return 'danger';
  if (type.includes('排队') || type.includes('Service')) return 'info';
  return 'primary';
}

// ===== 表格列短标签 (完整词条放 tooltip 悬停展示) =====
function shortChannel(ch) {
  return ch.includes('AI') ? t('complaint.channelAiShort') : t('complaint.channelPhoneShort');
}

function shortType(ty) {
  if (ty.includes('收费') || ty.includes('Fee')) return t('complaint.typeOverchargeShort');
  if (ty.includes('克扣') || ty.includes('Weight')) return t('complaint.typeShortageShort');
  if (ty.includes('品质') || ty.includes('Quality')) return t('complaint.typeQualityShort');
  if (ty.includes('排队') || ty.includes('Service')) return t('complaint.typeServiceShort');
  if (ty.includes('份额') || ty.includes('Quota')) return t('complaint.typeQuotaShort');
  return ty;
}

function shortStatus(st) {
  if (st.includes('待分配') || st.includes('Pending Assignment')) return t('complaint.statusShortPending');
  if (st.includes('核查中') || st.includes('Under Investigation')) return t('complaint.statusShortInvestigating');
  if (st.includes('整改中') || st.includes('Rectification')) return t('complaint.statusShortSupervising');
  if (st.includes('已办结') || st.includes('Resolved')) return t('complaint.statusShortResolved');
  return st;
}

const statusLabel = value => t('complaint.' + COMPLAINT_STATUSES[complaintStatusCode(value)][2]);
const typeLabel = value => t('complaint.' + COMPLAINT_TYPES[complaintTypeCode(value)][2]);
function getStatusTag(value) {
  const code = complaintStatusCode(value);
  return code === 'RESOLVED' ? 'success' : code === 'RECTIFYING' ? 'danger' : 'warning';
}

let loadVersion = 0;

async function loadComplaints() {
  const version = ++loadVersion;
  loading.value = true;
  try {
    const res = await getComplaintList();
    if (version === loadVersion) {
      complaintsList.value = res || [];
      if (currentHandling.value) currentHandling.value = complaintsList.value.find(item => item.id === currentHandling.value.id) || currentHandling.value;
      if (currentDetail.value) currentDetail.value = complaintsList.value.find(item => item.id === currentDetail.value.id) || currentDetail.value;
    }
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

// 详情弹窗
const detailVisible = ref(false);
const currentDetail = ref(null);
function openDetail(row) {
  currentDetail.value = row;
  detailVisible.value = true;
}

// 督办处理弹窗
const handleVisible = ref(false);
const currentHandling = ref(null);
const handlingLoading = ref(false);
const handleForm = ref({
  status: '已办结',
  result: ''
});

function openHandleModal(row) {
  currentHandling.value = row;
  handleForm.value = {
    status: isEn.value ? 'Resolved' : '已办结',
    result: row.result || ''
  };
  handleVisible.value = true;
}

async function submitHandle() {
  if (!currentHandling.value) return;
  if (!handleForm.value.result.trim()) { ElMessage.warning(t('chatComplaint.resultRequired')); return; }
  handlingLoading.value = true;
  try {
    await handleComplaintTicket(currentHandling.value.id, {
      ...handleForm.value,
      handlerName: authStore.userProfile?.title || (isEn.value ? 'Director General' : '规划与跟进司总干事')
    });
    ElMessage.success(t('common.success'));
    handleVisible.value = false;
    await loadComplaints();
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    handlingLoading.value = false;
  }
}

// 登记电话投诉弹窗
const createVisible = ref(false);
const createLoading = ref(false);
const createForm = ref({
  applicantName: '',
  callPhone: '',
  province: '巴格达省',
  agentName: '',
  type: '私自加价/违规收费',
  content: ''
});

function openCreateComplaintDialog() {
  createForm.value = {
    applicantName: '',
    callPhone: '',
    province: isEn.value ? 'Baghdad Province' : '巴格达省',
    agentName: '',
    type: isEn.value ? 'Unauthorized Overcharge / Illegal Fees' : '私自加价/违规收费',
    content: ''
  };
  createVisible.value = true;
}

async function submitCreateComplaint() {
  if (!createForm.value.applicantName || !createForm.value.content) {
    ElMessage.warning(t('common.input'));
    return;
  }
  createLoading.value = true;
  try {
    await createComplaintTicket({
      ...createForm.value,
      channel: isEn.value ? '1919 Government Hotline' : '1919政务热线电话',
      title: `${createForm.value.applicantName} - ${createForm.value.type}`
    });
    ElMessage.success(t('common.success'));
    createVisible.value = false;
    await loadComplaints();
  } catch (e) {
    ElMessage.error(t('common.failed'));
  } finally {
    createLoading.value = false;
  }
}

const handleLangChanged = () => {
  loadComplaints();
};

let refreshTimer;
let unsubscribeComplaint;
const onComplaintStorage = event => { if (event.key?.startsWith(COMPLAINT_STORAGE_PREFIX)) loadComplaints(); };

onMounted(() => {
  loadComplaints();
  handleResize();
  refreshTimer = setInterval(loadComplaints, 15000);
  unsubscribeComplaint = onTabMessage('COMPLAINT_CHANGED', loadComplaints);
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', onComplaintStorage);
    window.addEventListener('rcm:complaints-changed', loadComplaints);
  }
});

onUnmounted(() => {
  clearInterval(refreshTimer);
  unsubscribeComplaint?.();
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('storage', onComplaintStorage);
    window.removeEventListener('rcm:complaints-changed', loadComplaints);
  }
});
</script>

<style scoped>
</style>
