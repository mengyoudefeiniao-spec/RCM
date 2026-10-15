<template>
  <div class="citizen-family-view space-y-6">
    <!-- ======================================================== -->
    <!-- 移动端 APP 视图 (针对 Google Pixel 9 412px 视口极致适配) -->
    <!-- ======================================================== -->
    <div v-if="isAppMode" class="p-3.5 space-y-4">
      <!-- 1. 典雅电子配给卡 (Digital Ration Card) -->
      <div
        v-if="citizenStore.currentFamily"
        class="relative overflow-hidden rounded-lg p-5 text-white bg-gradient-to-br from-[#326445] via-[#2F5B44] to-[#1F3326] shadow-md border border-[#D3AF62]/30 select-none"
      >
        <!-- 金色装饰弧线纹理 -->
        <div class="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-[#D3AF62]/20 pointer-events-none"></div>
        <div class="absolute -right-4 -bottom-4 w-28 h-28 rounded-full border border-[#D3AF62]/15 pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#2F7A50] animate-pulse"></span>
              <span class="text-xs font-semibold text-[#D3AF62] tracking-wider uppercase">{{ $t('citizenCard.cardTitle') }}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D3AF62]/20 text-[#D3AF62] border border-[#D3AF62]/40">
              {{ citizenStore.currentFamily.status || $t('citizenCard.statusActive') }}
            </span>
          </div>

          <div class="py-3 flex items-center justify-between">
            <div class="space-y-1">
              <span class="text-[10px] text-white/60 tracking-wider">{{ $t('citizenCard.rationCardNoLabel') }}</span>
              <div class="text-xl font-extrabold tracking-widest font-mono text-[#FBFDFB]">
                {{ citizenStore.currentFamily.rationCardNo }}
              </div>
              <div class="text-[11px] text-[#D3AF62] font-mono">
                {{ $t('citizenCard.linkedPaperBook') }}：{{ citizenStore.currentFamily.oldPaperCardNo || 'IQ-P-1994-082194' }}
              </div>
            </div>

            <!-- 电子配给卡右侧二维码按钮 (点击弹出二级页面展示配给卡完整信息与防伪二维码) -->
            <button
              type="button"
              class="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 border border-[#D3AF62]/40 shadow-xs cursor-pointer transition-all shrink-0 ml-2 group"
              @click="openCardQrModal"
              :title="$t('citizenCard.showCardQr') || '出示二维码'"
            >
              <div class="w-8 h-8 rounded-lg bg-[#D3AF62] text-[#326445] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" stroke="none">
                  <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9 0h2v2h-2v-2zm3 0h2v2h-2v-2zm-3 3h2v2h-2v-2zm3 3h2v2h-2v-2zm-2-2h2v2h-2v-2zm4-3h2v4h-2v-4z"/>
                </svg>
              </div>
              <span class="text-[10px] font-bold text-[#E5CEA1] tracking-tight whitespace-nowrap group-hover:text-white">
                {{ $t('citizenCard.showCardQr') || '出示二维码' }}
              </span>
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            <div>
              <span class="text-[10px] text-white/50 block">{{ $t('citizenCard.legalHeadName') }}</span>
              <span class="font-bold text-white text-sm">{{ citizenStore.currentFamily.headName }}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-white/50 block">{{ $t('citizenCard.agentStore') }}</span>
              <span class="text-xs text-[#E5CEA1] font-medium truncate block">{{ citizenStore.currentFamily.agentName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 核心政务服务金刚区 (5大高频业务办理直通车) -->
      <div class="bg-white rounded-lg p-4 border border-[#D9E5DB] shadow-xs">
        <div class="flex items-center justify-between pb-3 border-b border-[#E9F1EB] mb-3">
          <span class="text-xs font-bold text-[#326445] flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-[#D3AF62] rounded-full"></span>
            <span>{{ $t('citizenCard.fastTrackTitle') }}</span>
          </span>
          <span class="text-[11px] text-[#8A9A8F]">{{ $t('citizenCard.fastTrackSubtitle') }}</span>
        </div>

        <div class="grid grid-cols-5 gap-1.5 text-center select-none">
          <!-- 1. 申请代理转移 -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F3F8F4] active:scale-95 transition-all cursor-pointer"
            @click="navigateToService('/citizen/transfer-agent')"
          >
            <div class="w-11 h-11 rounded-lg bg-[#E1F4E4] text-[#326445] flex items-center justify-center text-lg border border-[#CFE2D5] shadow-xs">
              <el-icon><Switch /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-[#43554B] leading-tight">{{ $t('citizenCard.applyAgentTransfer') }}</span>
          </div>

          <!-- 2. 申请成员转移 -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F3F8F4] active:scale-95 transition-all cursor-pointer"
            @click="navigateToService('/citizen/member-transfer')"
          >
            <div class="w-11 h-11 rounded-lg bg-[#FDF3E0] text-[#B8934A] flex items-center justify-center text-lg border border-[#EED9AE] shadow-xs">
              <el-icon><User /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-[#43554B] leading-tight">{{ $t('citizenCard.applyMemberTransfer') }}</span>
          </div>

          <!-- 3. 申请分户 -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F3F8F4] active:scale-95 transition-all cursor-pointer"
            @click="navigateToService('/citizen/split-household')"
          >
            <div class="w-11 h-11 rounded-lg bg-[#EFF5F1] text-[#B8934A] flex items-center justify-center text-lg border border-[#C9DBCE] shadow-xs">
              <el-icon><Share /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-[#43554B] leading-tight">{{ $t('citizenCard.applySplitHousehold') }}</span>
          </div>

          <!-- 4. 变更户主 -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F3F8F4] active:scale-95 transition-all cursor-pointer"
            @click="navigateToService('/citizen/change-head')"
          >
            <div class="w-11 h-11 rounded-lg bg-[#FDF3E0] text-[#D3AF62] flex items-center justify-center text-lg border border-[#EED9AE] shadow-xs">
              <el-icon><UserFilled /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-[#43554B] leading-tight">{{ $t('citizenCard.applyChangeHead') }}</span>
          </div>

          <!-- 5. 申请解冻 -->
          <div
            class="flex flex-col items-center gap-1.5 p-1.5 rounded-lg hover:bg-[#F3F8F4] active:scale-95 transition-all cursor-pointer"
            @click="navigateToService('/citizen/unfreeze')"
          >
            <div class="w-11 h-11 rounded-lg bg-[#FBEAE9] text-[#C04442] flex items-center justify-center text-lg border border-[#F2D5D4] shadow-xs">
              <el-icon><Unlock /></el-icon>
            </div>
            <span class="text-[10px] font-medium text-[#43554B] leading-tight">{{ $t('citizenCard.applyUnfreeze') }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 家庭在册成员卡片流 (Mobile Card Flow) -->
      <div class="bg-white rounded-lg p-4 border border-[#D9E5DB] shadow-xs space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-3.5 bg-[#326445] rounded-full"></span>
            <span class="text-xs font-bold text-[#1F3326]">{{ $t('citizenCard.registeredMemberList') }}</span>
            <span class="px-2 py-0.5 rounded-full bg-[#FDF3E0] text-[#D3AF62] font-bold text-[10px]">
              {{ citizenStore.currentFamily?.members?.length || 0 }} {{ $t('citizenCard.unitPerson') }}
            </span>
          </div>
          <el-button type="primary" size="small" class="!px-2.5 !py-1 text-xs font-bold" @click="openAddMemberDialog">
            <el-icon class="mr-1"><Plus /></el-icon>
            {{ $t('citizenCard.registerNewMember') }}
          </el-button>
        </div>

        <!-- 成员卡片项 -->
        <div class="space-y-2.5">
          <div
            v-for="member in (citizenStore.currentFamily?.members || [])"
            :key="member.id"
            class="p-3.5 rounded-lg border border-[#E9F1EB] bg-[#F3F8F4] flex items-center justify-between hover:border-[#D3AF62] transition-all"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                :class="isHeadRelation(member.relation) ? 'bg-[#326445] text-[#D3AF62]' : 'bg-[#E2F4E4] text-[#326445]'"
              >
                {{ member.name?.slice(0, 1) || '·' }}
              </div>
              <div class="space-y-0.5 text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-[#1B3123]">{{ member.name }}</span>
                  <span
                    class="px-1.5 py-0.2 rounded text-[10px]"
                    :class="isHeadRelation(member.relation) ? 'bg-[#FDF3E0] text-[#7A5F21] font-bold' : 'bg-[#E9F1EB] text-[#58685D]'"
                  >
                    {{ formatRelation(member.relation) }}
                  </span>
                </div>
                <div class="text-[11px] font-mono text-[#8A9A8F]">
                  UID: {{ member.nationalId }} · {{ formatGender(member.gender) }}
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1 shrink-0">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="isMemberActive(member.status) ? 'bg-[#E1F4E4] text-[#326445]' : 'bg-[#FBEAE9] text-[#C04442]'"
              >
                {{ formatMemberStatus(member.status) }}
              </span>
              <span
                v-if="!isMemberActive(member.status) && member.freezeReason"
                class="text-[9px] text-[#C04442] font-semibold bg-[#FBEAE9] px-1.5 py-0.5 rounded border border-[#F2D5D4] max-w-[90px] truncate"
                :title="formatFreezeReason(member.freezeReason)"
              >
                {{ formatFreezeReason(member.freezeReason) }}
              </span>
              <button
                type="button"
                class="text-[11px] text-[#D3AF62] hover:text-[#326445] underline cursor-pointer"
                @click="openEditModal(member)"
              >
                {{ $t('citizenCard.actionUpdate') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 桌面端 Web 完整视图 (保持现有完整表格与桌面宽排版) -->
    <!-- ======================================================== -->
    <div v-else class="space-y-6">
      <!-- 顶部配给卡基本信息面板 (强化展示电子配给卡编号与关联纸质卡编号) -->
      <div v-if="citizenStore.currentFamily" class="bg-white rounded-lg p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9F1EB]">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-[#EFF5F1] text-[#326445] flex items-center justify-center font-bold text-sm border border-[#E1F4E4]">
              {{ $t('citizen.cardBadge') }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-base font-bold text-[#1B3123]">{{ citizenStore.currentFamily.headName }} ({{ $t('citizen.head') }})</span>
                <el-tag size="small" type="success" effect="light">{{ citizenStore.currentFamily.status }}</el-tag>
                <el-tag size="small" type="primary" effect="plain" class="font-mono">{{ $t('citizen.rationCard') }}</el-tag>
              </div>
              <!-- 电子配给卡与关联纸质卡编号 -->
              <div class="text-xs text-[#58685D] font-mono mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  {{ $t('citizen.rationCardNo') }}：<strong class="text-[#326445] font-bold">{{ citizenStore.currentFamily.rationCardNo }}</strong>
                </span>
                <span>
                  {{ $t('citizen.oldPaperCardNo') }}：<strong class="text-[#7A5F21] font-bold">{{ citizenStore.currentFamily.oldPaperCardNo || 'IQ-P-1994-082194' }}</strong>
                </span>
                <span class="text-[#8A9A8F]">{{ $t('citizen.familyCode') }}：{{ citizenStore.currentFamily.familyCode }}</span>
              </div>
            </div>
          </div>

          <!-- 业务快捷操作按钮 -->
          <div class="flex items-center gap-2 flex-wrap">
            <el-button type="warning" plain class="shadow-xs font-bold" @click="openCardQrModal">
              <el-icon class="mr-1"><Tickets /></el-icon>
              {{ $t('warehouse.showMyCard') || '出示我的配给卡' }}
            </el-button>
            <el-button type="success" plain @click="navigateToService('/citizen/transfer-agent')">
              <el-icon class="mr-1"><Switch /></el-icon>
              {{ $t('citizen.applyTransferAgent') }}
            </el-button>
            <el-button color="#C9A13B" plain @click="navigateToService('/citizen/member-transfer')">
              <el-icon class="mr-1"><User /></el-icon>
              {{ $t('citizen.applyMemberTransfer') }}
            </el-button>
            <el-button type="primary" plain @click="navigateToService('/citizen/split-household')">
              <el-icon class="mr-1"><Share /></el-icon>
              {{ $t('citizen.applySplitHousehold') }}
            </el-button>
            <el-button type="warning" plain @click="navigateToService('/citizen/change-head')">
              <el-icon class="mr-1"><UserFilled /></el-icon>
              {{ $t('citizen.applyChangeHead') }}
            </el-button>
            <el-button type="info" plain @click="navigateToService('/citizen/unfreeze')">
              <el-icon class="mr-1"><Unlock /></el-icon>
              {{ $t('citizen.applyUnfreeze') }}
            </el-button>
          </div>
        </div>

        <!-- 属性网格 -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.province') }}：</span>
            <span class="font-medium text-[#1F3326]">{{ citizenStore.currentFamily.province }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.district') }}：</span>
            <span class="font-medium text-[#1F3326]">{{ citizenStore.currentFamily.district }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.agentName') }}：</span>
            <span class="font-medium text-[#1F3326]">{{ citizenStore.currentFamily.agentName }}</span>
          </div>
          <div>
            <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.address') }}：</span>
            <span class="font-medium text-[#1F3326] truncate block">{{ citizenStore.currentFamily.address }}</span>
          </div>
        </div>
      </div>

      <!-- 家庭成员清单表格 -->
      <div class="bg-white rounded-lg p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <ModuleDescTip
            :title="$t('citizen.memberList')"
            :content="`伊拉克内政部统一国民身份认证联网，当前家庭在册共 ${citizenStore.currentFamily?.members?.length || 0} 位直系亲属及受抚养成员。`"
            :badge="`${citizenStore.currentFamily?.members?.length || 0} ${$t('common.person')}`"
            badge-type="primary"
            title-class="text-sm font-bold text-[#1B3123]"
          >
            <template #icon>
              <el-icon class="text-[#326445] text-base"><User /></el-icon>
            </template>
          </ModuleDescTip>
          <!-- 添加新成员 -->
          <el-button type="primary" size="small" class="font-bold shadow-xs shrink-0" @click="openAddMemberDialog">
            <el-icon class="mr-1"><Plus /></el-icon>
            {{ $t('citizen.addNewMember') }}
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
          <el-table-column prop="name" :label="$t('citizen.headName')" min-width="140" fixed>
            <template #default="{ row }">
              <span class="font-bold text-[#1F3326]">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="`${$t('citizen.rationCardNo')} / ${$t('citizen.oldPaperCardNo')}`" min-width="210">
            <template #default>
              <div class="space-y-0.5">
                <div class="flex items-center gap-1 font-mono">
                  <span class="font-bold text-[#326445]">{{ citizenStore.currentFamily?.rationCardNo }}</span>
                  <el-tag size="small" effect="plain" type="primary" class="scale-90 origin-left">{{ $t('citizen.rationCard') }}</el-tag>
                </div>
                <div class="text-[11px] text-[#6B5321] font-mono flex items-center gap-1">
                  <span>{{ $t('citizen.oldPaperCardNo') }}:</span>
                  <span class="font-semibold">{{ citizenStore.currentFamily?.oldPaperCardNo || 'IQ-P-1994-082194' }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="relation" :label="$t('citizen.relation')" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="isHeadRelation(row.relation) ? 'primary' : 'info'"
              >
                {{ formatRelation(row.relation) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="gender" :label="$t('citizen.gender')" width="80" align="center">
            <template #default="{ row }">
              <span>{{ formatGender(row.gender) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="nationalId" :label="$t('citizen.nationalId')" min-width="160">
            <template #default="{ row }">
              <span class="font-mono text-[#58685D]">{{ row.nationalId }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="status" :label="$t('citizen.status')" width="110" align="center">
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="isMemberActive(row.status) ? 'success' : 'danger'"
                effect="light"
              >
                {{ formatMemberStatus(row.status) }}{{ row.freezeReason ? ` (${formatFreezeReason(row.freezeReason)})` : '' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="phone" :label="$t('citizen.phone')" min-width="130">
            <template #default="{ row }">
              <span class="font-mono">{{ row.phone || '—' }}</span>
            </template>
          </el-table-column>

          <el-table-column :label="$t('common.action')" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="openEditModal(row)">
                {{ $t('citizen.updateInfo') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- 模态框 1: 添加新成员对话框 (全量覆盖六大法定前提条件) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="addMemberDialogVisible"
      :title="$t('citizen.addMemberTitle')"
      :width="isAppMode ? 'min(94vw, 384px)' : '640px'"
      align-center
    >
      <div class="space-y-3.5 text-xs">
        <!-- 流程化步骤条导航 (移动端极简紧凑) -->
        <div class="py-1">
          <el-steps :active="addMemberStep - 1" finish-status="success" align-center>
            <el-step :title="isAppMode ? (isEn ? 'Basic' : '基本') : $t('citizen.stepBasic')" :description="isAppMode ? '' : $t('citizen.stepBasicDesc')" />
            <el-step :title="isAppMode ? (isEn ? 'Verify' : '核验') : $t('citizen.stepVerify')" :description="isAppMode ? '' : $t('citizen.stepVerifyDesc')" />
            <el-step :title="isAppMode ? (isEn ? 'Confirm' : '确认') : $t('citizen.stepConfirm')" :description="isAppMode ? '' : $t('citizen.stepConfirmDesc')" />
          </el-steps>
        </div>

        <!-- 步骤 1: 填写基本身份信息 -->
        <div v-show="addMemberStep === 1" class="space-y-3">
          <!-- 简要指引提示 -->
          <div class="bg-[#EFF5F1]/80 border border-[#C7DED0]/80 p-2.5 rounded-lg text-[#1F3326] flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0 flex-1">
              <el-icon class="text-[#326445] shrink-0"><InfoFilled /></el-icon>
              <span class="text-[11px] leading-tight">{{ $t('citizen.fillRealIdentityNotice') }}</span>
            </div>
            <!-- 法定户主就绪小标签 -->
            <el-tag size="small" type="success" effect="light" class="shrink-0 font-medium scale-95">{{ $t('citizen.headVerifiedBadge') }}</el-tag>
          </div>

          <el-form label-position="top" class="space-y-2.5">
            <div :class="isAppMode ? 'space-y-2' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'">
              <el-form-item :label="$t('citizen.memberFullName')" required class="!mb-1">
                <el-input v-model="newMemberForm.name" :placeholder="$t('citizen.inputFullNamePlaceholder')" />
              </el-form-item>
              <el-form-item :label="$t('citizen.nidLabel')" required class="!mb-1">
                <el-input v-model="newMemberForm.nationalId" :placeholder="$t('citizen.inputNidPlaceholder')" />
              </el-form-item>
            </div>

            <div :class="isAppMode ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 sm:grid-cols-3 gap-3'">
              <el-form-item :label="$t('citizen.birthDate')" required class="!mb-1">
                <el-date-picker
                  v-model="newMemberForm.birthDate"
                  type="date"
                  :placeholder="$t('citizen.selectBirthDate')"
                  value-format="YYYY-MM-DD"
                  class="w-full"
                  @change="handleBirthDateChange"
                />
              </el-form-item>
              <el-form-item :label="$t('citizen.gender')" required class="!mb-1">
                <el-select v-model="newMemberForm.gender" class="w-full">
                  <el-option :label="$t('citizen.male')" :value="isEn ? 'Male' : '男'" />
                  <el-option :label="$t('citizen.female')" :value="isEn ? 'Female' : '女'" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item :label="$t('citizen.specifyRelation')" required class="!mb-1">
              <el-select v-model="newMemberForm.relation" :placeholder="$t('citizen.selectRelation')" class="w-full">
                <el-option :label="$t('citizen.relationChild')" :value="isEn ? 'Child' : '子女'" />
                <el-option :label="$t('citizen.relationSpouse')" :value="isEn ? 'Spouse' : '配偶'" />
                <el-option :label="$t('citizen.relationFather')" :value="isEn ? 'Father' : '父亲'" />
                <el-option :label="$t('citizen.relationMother')" :value="isEn ? 'Mother' : '母亲'" />
                <el-option :label="$t('citizen.relationDependent')" :value="isEn ? 'Dependent' : '受抚养人'" />
              </el-select>
            </el-form-item>

            <!-- 户主资质极简展示 -->
            <div class="p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg flex items-center justify-between text-[11px] text-[#58685D]">
              <div class="flex items-center gap-1.5">
                <el-icon class="text-[#3E9B68]"><CircleCheckFilled /></el-icon>
                <span>{{ $t('citizen.headBioEnrolled') }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <el-icon class="text-[#3E9B68]"><CircleCheckFilled /></el-icon>
                <span>{{ $t('citizen.qiCardBound') }}</span>
              </div>
            </div>
          </el-form>
        </div>

        <!-- 步骤 2: 三重资格核验 -->
        <div v-show="addMemberStep === 2" class="space-y-3">
          <div class="bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB] text-xs text-[#58685D]">
            {{ $t('citizen.verifyNotice') }}
          </div>

          <div class="space-y-2.5">
            <!-- 条件 1: 系统更新 -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-[#D9E5DB] shadow-2xs">
              <div>
                <div class="font-bold text-[#1F3326]">{{ $t('citizen.step2Item1Title') }}</div>
                <div class="text-[11px] text-[#8A9A8F] mt-0.5">{{ $t('citizen.step2Item1Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="systemInfoUpdated ? 'success' : 'primary'"
                :plain="systemInfoUpdated"
                @click="systemInfoUpdated = true"
              >
                {{ systemInfoUpdated ? $t('citizen.step2Item1Done') : $t('citizen.step2Item1Action') }}
              </el-button>
            </div>

            <!-- 条件 2: 生物识别 -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-[#D9E5DB] shadow-2xs">
              <div>
                <div class="font-bold text-[#1F3326]">{{ $t('citizen.step2Item2Title') }}</div>
                <div class="text-[11px] text-[#8A9A8F] mt-0.5">{{ $t('citizen.step2Item2Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="memberBiometricVerified ? 'success' : 'primary'"
                :plain="memberBiometricVerified"
                @click="newMemberFaceDialogVisible = true"
              >
                {{ memberBiometricVerified ? $t('citizen.step2Item2Done') : $t('citizen.step2Item2Action') }}
              </el-button>
            </div>

            <!-- 条件 3: 地理位置 -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-white border border-[#D9E5DB] shadow-2xs">
              <div>
                <div class="font-bold text-[#1F3326]">{{ $t('citizen.step2Item3Title') }}</div>
                <div class="text-[11px] text-[#8A9A8F] mt-0.5">{{ $t('citizen.step2Item3Desc') }}</div>
              </div>
              <el-button
                size="small"
                :type="locationVerified ? 'success' : 'primary'"
                :plain="locationVerified"
                @click="locationVerified = true"
              >
                {{ locationVerified ? $t('citizen.step2Item3Done') : $t('citizen.step2Item3Action') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 步骤 3: 证明材料与确认纳保 -->
        <div v-show="addMemberStep === 3" class="space-y-3.5">
          <!-- 申报信息摘要 -->
          <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-2 text-[11px]" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'">
            <div>
              <span class="text-[#8A9A8F] block">{{ $t('citizen.headName') }}：</span>
              <span class="font-bold text-[#1F3326]">{{ newMemberForm.name }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block">{{ $t('citizen.nationalId') }}：</span>
              <span class="font-mono text-[#1F3326]">{{ newMemberForm.nationalId }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block">{{ $t('citizen.relation') }}：</span>
              <span class="font-bold text-[#2A5440]">{{ newMemberForm.relation }} ({{ newMemberForm.gender }})</span>
            </div>
            <div>
              <span class="text-[#8A9A8F] block">{{ $t('citizen.ageJudge') }}：</span>
              <span class="font-medium" :class="isUnder12 ? 'text-[#C04442]' : 'text-[#2F7A50]'">
                {{ isUnder12 ? $t('citizen.under12Child') : $t('citizen.over12Person') }}
              </span>
            </div>
          </div>

          <!-- 儿童证明文件上传 (若未满12岁) -->
          <div v-if="isUnder12" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-[#A93B39]">{{ $t('citizen.childDocTitle') }}</span>
              <el-tag type="danger" size="small" effect="plain">{{ $t('citizen.childDocBadge') }}</el-tag>
            </div>
            <DocumentUploader
              v-model="childDocumentUploaded"
              :title="$t('citizen.childDocName')"
              :subtitle="$t('citizen.childDocSubtitle')"
              is-required
              :category-badge="$t('citizen.childDocBadge')"
              issuer="MOH & Ministry of Interior"
              default-file-name="Medical_Birth_Certificate_2020.pdf"
            />
          </div>
          <div v-else class="p-3 bg-[#EFF5F1] border border-[#C7E0CE] rounded-lg text-[#24483A] flex items-center gap-2">
            <el-icon class="text-[#2F7A50]"><CircleCheckFilled /></el-icon>
            <span>{{ $t('citizen.over12ExemptNotice') }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <!-- 移动端 App 视口 (Pixel 9) 底部操作栏 -->
        <div v-if="isAppMode" class="w-full space-y-2">
          <!-- Step 3: 上方两按钮(上一步、取消)，下方通栏高亮主按钮(确认并纳保) -->
          <div v-if="addMemberStep === 3" class="space-y-2 w-full">
            <div class="grid grid-cols-2 gap-2 w-full">
              <el-button class="!m-0 w-full" @click="addMemberStep--">
                <el-icon class="mr-1"><ArrowLeft /></el-icon>{{ $t('common.prevStep') }}
              </el-button>
              <el-button class="!m-0 w-full" @click="addMemberDialogVisible = false">
                {{ $t('common.cancel') }}
              </el-button>
            </div>
            <el-button
              type="primary"
              class="!m-0 w-full !h-10 text-sm font-semibold shadow-sm"
              :loading="addingMember"
              @click="handleSubmitAddMember"
            >
              <el-icon class="mr-1.5"><Check /></el-icon>{{ $t('citizen.confirmAddMember') }}
            </el-button>
          </div>
          <!-- Step 2: 上方两按钮(上一步、取消)，下方通栏下一步 -->
          <div v-else-if="addMemberStep === 2" class="space-y-2 w-full">
            <div class="grid grid-cols-2 gap-2 w-full">
              <el-button class="!m-0 w-full" @click="addMemberStep--">
                <el-icon class="mr-1"><ArrowLeft /></el-icon>{{ $t('common.prevStep') }}
              </el-button>
              <el-button class="!m-0 w-full" @click="addMemberDialogVisible = false">
                {{ $t('common.cancel') }}
              </el-button>
            </div>
            <el-button
              type="primary"
              class="!m-0 w-full !h-10 text-sm font-semibold shadow-sm"
              @click="handleNextAddMemberStep"
            >
              {{ $t('common.nextStep') }}<el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <!-- Step 1: 取消与下一步等分双列 -->
          <div v-else class="grid grid-cols-2 gap-2 w-full">
            <el-button class="!m-0 w-full" @click="addMemberDialogVisible = false">
              {{ $t('common.cancel') }}
            </el-button>
            <el-button
              type="primary"
              class="!m-0 w-full !h-10 text-sm font-semibold shadow-sm"
              @click="handleNextAddMemberStep"
            >
              {{ $t('common.nextStep') }}<el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 桌面端普通视口底部操作栏 -->
        <div v-else class="flex items-center justify-between w-full">
          <div>
            <el-button v-if="addMemberStep > 1" @click="addMemberStep--">{{ $t('common.prevStep') }}</el-button>
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="addMemberDialogVisible = false">{{ $t('common.cancel') }}</el-button>
            <el-button v-if="addMemberStep < 3" type="primary" @click="handleNextAddMemberStep">
              {{ $t('common.nextStep') }}
            </el-button>
            <el-button v-else type="primary" :loading="addingMember" @click="handleSubmitAddMember">
              {{ $t('citizen.confirmAddMember') }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 成员信息更新弹窗 -->
    <el-dialog
      v-model="editModalVisible"
      :title="$t('citizen.editMemberTitle')"
      :width="isAppMode ? '350px' : '480px'"
      align-center
    >
      <el-form :model="editForm" label-position="top">
        <el-form-item :label="$t('citizen.headName')">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item :label="$t('citizen.contactPhone')">
          <el-input v-model="editForm.phone" :placeholder="$t('citizen.inputPhonePlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('citizen.residenceAddress')">
          <el-input v-model="editForm.residenceInfo" :placeholder="$t('citizen.inputAddressPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editModalVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveMember">{{ $t('citizen.confirmUpdate') }}</el-button>
      </template>
    </el-dialog>

    <!-- 活体人脸动作核验弹窗 (添加新成员生物识别) -->
    <FaceLivenessVerifyDialog
      v-model="newMemberFaceDialogVisible"
      title="新登记家庭成员活体人脸动作核验"
      :target-name="newMemberForm.name || '待登记成员'"
      :target-national-id="newMemberForm.nationalId || '198004198271'"
      @success="handleNewMemberFaceSuccess"
    />

    <!-- ======================================================== -->
    <!-- 电子配给卡凭证与现场核验动态二维码弹窗 (二级页面/弹窗) -->
    <!-- ======================================================== -->
    <el-dialog
      v-model="cardModalVisible"
      :title="null"
      :width="isAppMode ? 'min(92vw, 386px)' : '420px'"
      align-center
      class="citizen-card-verify-dialog"
      :show-close="true"
      @closed="handleCardModalClosed"
    >
      <div class="space-y-4 p-1">
        <!-- 弹窗顶栏 -->
        <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#326445] text-[#D3AF62] flex items-center justify-center text-xs">
              <el-icon><Tickets /></el-icon>
            </div>
            <div>
              <div class="text-xs font-bold text-[#1F3326]">{{ $t('citizenCard.voucherTitle') || '法定电子配给卡档案凭证' }}</div>
              <div class="text-[10px] text-[#8A9A8F]">{{ $t('citizenCard.voucherSubtitle') || '供代销网点专员现场终端扫描核验' }}</div>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F4E4] text-[#2F7A50] border border-[#C7E0CE] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-[#2F7A50] animate-pulse"></span>
            <span>{{ $t('citizenCard.recordActive') || '档案在册' }}</span>
          </span>
        </div>

        <!-- 1. 典雅电子配给卡主体 -->
        <div
          class="relative overflow-hidden rounded-lg p-4 text-white bg-gradient-to-br from-[#326445] via-[#2F5B44] to-[#1F3326] shadow-md border border-[#D3AF62]/35 select-none"
        >
          <!-- 金色装饰弧线纹理 -->
          <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-[#D3AF62]/20 pointer-events-none"></div>
          <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border border-[#D3AF62]/15 pointer-events-none"></div>

          <div class="relative z-10 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-white/10">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#2F7A50] animate-pulse"></span>
                <span class="text-[11px] font-semibold text-[#D3AF62] tracking-wider uppercase">
                  {{ $t('citizenCard.cardTitle') || '伊拉克共和国贸易部 · 电子配给卡' }}
                </span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D3AF62]/20 text-[#D3AF62] border border-[#D3AF62]/40">
                {{ citizenStore.currentFamily?.status || $t('citizenCard.statusActive') || '正常在册' }}
              </span>
            </div>

            <div class="space-y-0.5">
              <span class="text-[9px] text-white/60 tracking-wider uppercase">
                {{ $t('citizenCard.rationCardNoLabel') || '国家统一电子配给卡编码' }}
              </span>
              <div class="text-lg font-extrabold tracking-widest font-mono text-[#FBFDFB]">
                {{ citizenStore.currentFamily?.rationCardNo || 'RC-10029381' }}
              </div>
              <div class="text-[10px] text-[#D3AF62] font-mono">
                {{ $t('citizenCard.linkedPaperBook') || '关联纸质配给卡本号' }}：{{ citizenStore.currentFamily?.oldPaperCardNo || 'IQ-P-1994-082194' }}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
              <div>
                <span class="text-[9px] text-white/50 block">{{ $t('citizenCard.legalHeadName') || '法定户主姓名' }}</span>
                <span class="font-bold text-white text-xs">{{ citizenStore.currentFamily?.headName || '艾哈迈德·哈桑' }}</span>
                <span class="text-[10px] text-[#A7D9BC] font-mono block">{{ $t('citizenCard.totalMembersRegistered', { count: citizenStore.currentFamily?.members?.length || 0 }) || `（全户在册 ${citizenStore.currentFamily?.members?.length || 0} 人）` }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-white/50 block">{{ $t('citizenCard.agentStore') || '签约保供代销网点' }}</span>
                <span class="text-[11px] text-[#E5CEA1] font-medium truncate block" :title="citizenStore.currentFamily?.agentName">
                  {{ citizenStore.currentFamily?.agentName || '巴格达卡尔赫第一代销站' }}
                </span>
                <span class="text-[10px] text-white/50 font-mono">{{ $t('citizenCard.agentCodePrefix') || '代码: ' }}{{ citizenStore.currentFamily?.agentId || 'FA-00128' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 可扫描验证配给卡的防伪动态二维码 -->
        <div class="bg-[#F3F8F4] p-3 rounded-lg border border-[#D9E5DB] text-center space-y-2.5">
          <div class="flex items-center justify-between text-[11px] text-[#58685D] px-1">
            <span class="font-bold text-[#326445] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#D3AF62]"></span>
              <span>{{ $t('citizenCard.qrVerifyTitle') || '现场扫码验证凭证' }}</span>
            </span>
            <span class="font-mono text-[10px] text-[#D3AF62] bg-[#FDF3E0] px-2 py-0.5 rounded-full border border-[#E5CEA1]">
              {{ $t('citizenCard.antiCounterfeitActive') || '动态防伪中' }}
            </span>
          </div>

          <!-- 高保真防伪二维码容器 -->
          <div class="relative w-48 h-48 mx-auto p-2.5 rounded-lg bg-white border-2 border-[#326445] shadow-md flex flex-col items-center justify-center overflow-hidden">
            <!-- 动态扫描光束 -->
            <div class="absolute inset-x-2 h-0.5 bg-[#D3AF62] shadow-[0_0_12px_#D3AF62] animate-scan-card-qr z-20"></div>

            <!-- SVG 矢量精细二维码 -->
            <svg viewBox="0 0 200 200" class="w-full h-full text-[#326445]" fill="currentColor">
              <rect width="200" height="200" fill="#ffffff" />
              <!-- 三个定位角标 -->
              <rect x="14" y="14" width="46" height="46" fill="#326445" rx="6" />
              <rect x="22" y="22" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="28" y="28" width="18" height="18" fill="#326445" rx="2" />
              <rect x="140" y="14" width="46" height="46" fill="#326445" rx="6" />
              <rect x="148" y="22" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="154" y="28" width="18" height="18" fill="#326445" rx="2" />
              <rect x="14" y="140" width="46" height="46" fill="#326445" rx="6" />
              <rect x="22" y="148" width="30" height="30" fill="#ffffff" rx="4" />
              <rect x="28" y="154" width="18" height="18" fill="#326445" rx="2" />
              <!-- 数据点阵 -->
              <rect x="74" y="18" width="12" height="12" />
              <rect x="94" y="18" width="12" height="12" />
              <rect x="114" y="18" width="12" height="12" />
              <rect x="74" y="38" width="12" height="12" />
              <rect x="104" y="44" width="12" height="12" />
              <rect x="18" y="74" width="12" height="12" />
              <rect x="38" y="74" width="12" height="12" />
              <rect x="58" y="74" width="12" height="12" />
              <rect x="78" y="74" width="12" height="12" />
              <rect x="98" y="74" width="12" height="12" />
              <rect x="118" y="74" width="12" height="12" />
              <rect x="138" y="74" width="12" height="12" />
              <rect x="158" y="74" width="12" height="12" />
              <rect x="18" y="94" width="12" height="12" />
              <rect x="44" y="104" width="12" height="12" />
              <rect x="74" y="100" width="12" height="12" />
              <rect x="114" y="94" width="12" height="12" />
              <rect x="144" y="104" width="12" height="12" />
              <rect x="164" y="94" width="12" height="12" />
              <rect x="24" y="118" width="12" height="12" />
              <rect x="64" y="118" width="12" height="12" />
              <rect x="84" y="118" width="12" height="12" />
              <rect x="124" y="118" width="12" height="12" />
              <rect x="154" y="118" width="12" height="12" />
              <rect x="74" y="144" width="12" height="12" />
              <rect x="104" y="144" width="12" height="12" />
              <rect x="134" y="144" width="12" height="12" />
              <rect x="164" y="144" width="12" height="12" />
              <rect x="74" y="164" width="12" height="12" />
              <rect x="94" y="164" width="12" height="12" />
              <rect x="124" y="164" width="12" height="12" />
              <rect x="154" y="164" width="12" height="12" />
              <!-- 中心徽章 -->
              <rect x="80" y="80" width="40" height="40" fill="#326445" rx="8" />
              <rect x="84" y="84" width="32" height="32" fill="#D3AF62" rx="6" />
              <text x="100" y="104" font-size="11" font-weight="900" fill="#326445" text-anchor="middle" font-family="monospace">RCM</text>
            </svg>

            <!-- 动态时间戳水印 -->
            <div class="absolute bottom-1 inset-x-2 text-[9px] font-mono text-[#58685D] bg-white/95 py-0.5 rounded border border-[#D9E5DB]">
              {{ liveCardClock }}
            </div>
          </div>

          <!-- 动态验证密文与刷新控制 -->
          <div class="flex items-center justify-between text-xs bg-white px-3 py-1.5 rounded-lg border border-[#D9E5DB]">
            <div class="text-left font-mono">
              <span class="text-[10px] text-[#8A9A8F] block">{{ $t('citizenCard.securityCipherLabel') || '防伪安全校验密文：' }}</span>
              <span class="font-bold text-[#326445] text-[11px]">{{ dynamicCardCode }}</span>
            </div>
            <button
              type="button"
              class="text-[11px] text-[#D3AF62] hover:text-[#326445] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              @click="refreshDynamicCode"
            >
              <el-icon><Refresh /></el-icon>
              <span>{{ $t('citizenCard.refreshCipher') || '刷新密文' }}</span>
            </button>
          </div>

          <div class="text-[10px] text-[#8A9A8F] leading-tight">
            {{ $t('citizenCard.qrScanNotice') || '请保持手机屏幕常亮并调高亮度 · 网点专员扫码即可核查配额与办理核销发放' }}
          </div>
        </div>

        <!-- 底部完成按钮 -->
        <el-button
          type="primary"
          class="w-full font-bold shadow-xs !rounded-lg"
          style="background: #326445; border-color: #326445; color: #FFFFFF;"
          @click="cardModalVisible = false"
        >
          {{ $t('citizenCard.closeVoucher') || '完成出示 / 关闭' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import FaceLivenessVerifyDialog from '../../components/common/FaceLivenessVerifyDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import {
  Share,
  User,
  UserFilled,
  Unlock,
  Switch,
  Plus,
  InfoFilled,
  CircleCheckFilled,
  Tickets,
  Refresh,
  ArrowLeft,
  ArrowRight,
  Right,
  Check
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onTabMessage } from '../../utils/crossTabBus.js';
import { localizeFreezeReason } from '../../utils/freezeReason.js';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const isEn = computed(() => locale.value === 'en');
const citizenStore = useCitizenStore();
const editModalVisible = ref(false);
const saving = ref(false);

// 核心修复 BUG：全面兼容 query 与 sessionStorage，确保注册完成后准确展示最新移动 APP 页面
const isAppMode = computed(() => {
  if (route.query.layout === 'app' || route.query.mode === 'mobile') return true;
  if (route.query.layout === 'web') return false;
  return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app';
});

// 公民电子配给卡弹窗与动态防伪凭证
const cardModalVisible = ref(false);
const liveCardClock = ref('');
let cardClockTimer = null;
const dynamicCardCode = ref('');

function openCardQrModal() {
  refreshDynamicCode();
  cardModalVisible.value = true;
  startCardClock();
}

function handleCardModalClosed() {
  if (cardClockTimer) {
    clearInterval(cardClockTimer);
    cardClockTimer = null;
  }
}

function refreshDynamicCode() {
  const stamp = Date.now().toString().slice(-4);
  const cardPart = (citizenStore.currentFamily?.rationCardNo || 'RC-10029381').replace('RC-', '');
  dynamicCardCode.value = `VERIFY-${cardPart}-${stamp}`;
}

function startCardClock() {
  if (cardClockTimer) clearInterval(cardClockTimer);
  const updateTime = () => {
    const now = new Date();
    liveCardClock.value = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
  };
  updateTime();
  cardClockTimer = setInterval(updateTime, 100);
}

function isHeadRelation(relation) {
  if (!relation) return false;
  const rel = String(relation).toLowerCase();
  return rel === '户主' || rel === 'head' || rel === 'رب الأسرة' || rel === 'سەروکی خێزان';
}

function formatRelation(relation) {
  if (!relation) return '';
  const rel = String(relation).toLowerCase();
  if (rel === '户主' || rel === 'head' || rel === 'رب الأسرة' || rel === 'سەروکی خێزان') return t('citizenCard.relationHead');
  if (rel === '配偶' || rel === 'spouse' || rel === 'wife' || rel === 'husband' || rel === 'زوج / زوجة' || rel === 'هاوسەر') return t('citizenCard.relationSpouse');
  if (rel === '子女' || rel === 'child' || rel === 'son' || rel === 'daughter' || rel === 'ابن / ابنة' || rel === 'منداڵ') return t('citizenCard.relationChild');
  if (rel === '父亲' || rel === 'father' || rel === 'أب' || rel === 'باوک') return t('citizenCard.relationFather');
  if (rel === '母亲' || rel === 'mother' || rel === 'أم' || rel === 'دایک') return t('citizenCard.relationMother');
  if (rel === '受抚养人' || rel === 'dependent' || rel === 'معال' || rel === 'بژێویپێدراو') return t('citizenCard.relationDependent');
  return relation;
}

function formatGender(gender) {
  if (!gender) return '';
  const g = String(gender).toLowerCase();
  if (g === '男' || g === 'male' || g === 'ذكر' || g === 'نێر') return t('citizenCard.genderMale');
  if (g === '女' || g === 'female' || g === 'أنثى' || g === 'مێ') return t('citizenCard.genderFemale');
  return gender;
}

function formatMemberStatus(status) {
  if (!status) return t('citizenCard.statusActive');
  const s = String(status).trim().toLowerCase();
  if (s === '正常' || s === 'active' || s === 'نشط' || s === 'چالاک' || s === 'چالاکە') {
    return t('citizenCard.statusActive');
  }
  if (s === '已冻结' || s === '冻结' || s === 'frozen' || s === 'مجمد' || s === 'بەستراو' || s === 'بەستراوە' || s === 'بەستووە') {
    return t('citizenCard.statusFrozen');
  }
  return status;
}

// 冻结原因本地化展示：稳定代码/历史中英文持久化值 → 当前语言词根 (备注保留原文)
function formatFreezeReason(reason) {
  return localizeFreezeReason(reason, t);
}

function isMemberActive(status) {
  if (!status) return true;
  const s = String(status).trim().toLowerCase();
  return s === '正常' || s === 'active' || s === 'نشط' || s === 'چالاک' || s === 'چالاکە';
}

function navigateToService(path) {
  if (isAppMode.value) {
    router.push({ path, query: { layout: 'app' } });
  } else {
    router.push(path);
  }
}

const editForm = reactive({
  id: '',
  name: '',
  phone: '',
  residenceInfo: ''
});

function handleLanguageChange() {
  citizenStore.fetchFamilies();
}

watch(locale, () => {
  citizenStore.fetchFamilies();
});

let offFamilyUpdated = null;

function handleFamilyUpdatedSync() {
  citizenStore.fetchFamilies();
}

onMounted(() => {
  citizenStore.fetchFamilies();
  window.addEventListener('rcm-language-changed', handleLanguageChange);
  window.addEventListener('rcm-family-updated', handleFamilyUpdatedSync);
  offFamilyUpdated = onTabMessage('FAMILY_UPDATED', handleFamilyUpdatedSync);
});

onBeforeUnmount(() => {
  window.removeEventListener('rcm-language-changed', handleLanguageChange);
  window.removeEventListener('rcm-family-updated', handleFamilyUpdatedSync);
  if (offFamilyUpdated) {
    offFamilyUpdated();
    offFamilyUpdated = null;
  }
  if (cardClockTimer) {
    clearInterval(cardClockTimer);
    cardClockTimer = null;
  }
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
// 需求 2: 添加新成员 (流程化步骤与前提核验)
// ==========================================
const addMemberDialogVisible = ref(false);
const addingMember = ref(false);
const addMemberStep = ref(1);

// 核验前提状态
const newMemberFaceDialogVisible = ref(false);
const systemInfoUpdated = ref(false);
const memberBiometricVerified = ref(false);
const locationVerified = ref(false);
const childDocumentUploaded = ref(false);

function handleNewMemberFaceSuccess(data) {
  memberBiometricVerified.value = true;
  ElMessage.success((isEnNow() ? `Liveness face recognition and biometric matching passed for family member [${newMemberForm.name || 'pending registrant'}]!` : `家庭成员【${newMemberForm.name || (isEnNow() ? 'pending registrant' : '待登记成员')}】活体人脸识别与生物特征比对通过！`));
}

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
  addMemberStep.value = 1;
  const isEnglish = locale.value === 'en';
  newMemberForm.name = isEnglish ? 'Youssef Ahmed Hassan' : '优素福·艾哈迈德·哈桑';
  newMemberForm.nationalId = '201982910488';
  newMemberForm.birthDate = '2019-05-15';
  newMemberForm.gender = isEnglish ? 'Male' : '男';
  newMemberForm.relation = isEnglish ? 'Child' : '子女';
  newMemberForm.phone = '';

  // 初始化前提核验为就绪状态
  systemInfoUpdated.value = true;
  memberBiometricVerified.value = true;
  locationVerified.value = true;
  childDocumentUploaded.value = true;

  addMemberDialogVisible.value = true;
}

function handleNextAddMemberStep() {
  if (addMemberStep.value === 1) {
    if (!newMemberForm.name || !newMemberForm.nationalId || !newMemberForm.relation) {
      ElMessage.warning(t('citizen.pleaseFillMemberRequired'));
      return;
    }
    addMemberStep.value = 2;
    return;
  }
  if (addMemberStep.value === 2) {
    if (!systemInfoUpdated.value) {
      ElMessage.warning(t('citizen.pleaseCompleteSystemCheck'));
      return;
    }
    if (!memberBiometricVerified.value) {
      ElMessage.warning(t('citizen.pleaseCompleteBioCheck'));
      return;
    }
    if (!locationVerified.value) {
      ElMessage.warning(t('citizen.pleaseCompleteLocationCheck'));
      return;
    }
    addMemberStep.value = 3;
    return;
  }
}

async function handleSubmitAddMember() {
  if (!newMemberForm.name || !newMemberForm.nationalId || !newMemberForm.relation) {
    ElMessage.warning(t('citizen.pleaseFillMemberRequired'));
    return;
  }

  // 1. 校验系统更新
  if (!systemInfoUpdated.value) {
    ElMessage.error(t('citizen.precond1'));
    return;
  }

  // 2. 校验生物识别
  if (!memberBiometricVerified.value) {
    ElMessage.error(t('citizen.precond2'));
    return;
  }

  // 3. 校验地理位置
  if (!locationVerified.value) {
    ElMessage.error(t('citizen.precond3'));
    return;
  }

  // 4. 校验未满 12 岁儿童证明
  if (isUnder12.value && !childDocumentUploaded.value) {
    ElMessage.error(t('citizen.under12Notice'));
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
    ElMessage.error(t('citizen.addMemberFailed'));
  } finally {
    addingMember.value = false;
  }
}
</script>

<style scoped>
@keyframes scanCardQrAnimation {
  0% {
    top: 5%;
    opacity: 0.8;
  }
  50% {
    top: 90%;
    opacity: 1;
  }
  100% {
    top: 5%;
    opacity: 0.8;
  }
}

.animate-scan-card-qr {
  animation: scanCardQrAnimation 2s ease-in-out infinite;
}

:deep(.citizen-card-verify-dialog) {
  border-radius: 18px !important;
  overflow: hidden !important;
}

:deep(.citizen-card-verify-dialog .el-dialog__body) {
  padding: 12px 14px 16px !important;
  max-height: 86vh;
  overflow-y: auto;
}
</style>
