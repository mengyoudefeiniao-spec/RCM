<template>
  <div class="member-transfer-view space-y-4 sm:space-y-6">
    <SupplementMaterialsPanel />
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('memberTransfer.title')"
          :content="$t('memberTransfer.subtitle')"
          badge-type="primary"
          title-class="text-base font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#326445] text-lg"><User /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 当前接收卡家庭概览 (布局弹性优化，适配多语言长文本) -->
      <div v-if="citizenStore.currentFamily" class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-3 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'">
        <div class="min-w-0">
          <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('common.rationCardNo') }} ({{ $t('memberTransfer.receivingCard') }})：</span>
          <span class="font-mono font-bold text-[#326445] truncate block">{{ citizenStore.currentFamily.rationCardNo }}</span>
        </div>
        <div class="min-w-0">
          <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('citizen.headName') }}：</span>
          <span class="font-bold text-[#1F3326] truncate block">{{ currentHeadName }} ({{ citizenStore.currentFamily.memberCount }} {{ $t('common.person') }})</span>
        </div>
        <div class="min-w-0">
          <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.newCardFamilyCode') }}：</span>
          <span class="font-mono font-medium text-[#1F3326] truncate block">{{ currentFamilyCode }}</span>
        </div>
        <div class="min-w-0">
          <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('citizen.province') }} / {{ $t('citizen.district') }}：</span>
          <span class="font-medium text-[#1F3326] truncate block">{{ citizenStore.currentFamily.province }} · {{ citizenStore.currentFamily.district }}</span>
        </div>
      </div>

      <!-- 流程与表单联动容器：包含左侧流程节点时间线与右侧自适应业务内容 -->
      <div class="process-card-wrapper relative bg-white rounded-lg border border-[#D9E5DB] overflow-hidden shadow-xs">
        <div class="flex items-stretch" :class="isAppMode ? 'flex-col' : 'flex-col lg:flex-row'">
          
          <!-- 左侧时间线节点 -->
          <div v-if="!isAppMode" class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-e border-[#D9E5DB] lg:p-6 p-0">
            <!-- 桌面端侧边栏标题 -->
            <div class="items-center justify-between pb-4 mb-5 border-b border-[#D9E5DB]" :class="isAppMode ? 'hidden' : 'hidden lg:flex'">
              <span class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
                <el-icon class="text-[#326445]"><Guide /></el-icon>
                <span>{{ cleanMemberTransferTitle }}</span>
              </span>
              <span class="text-[11px] font-mono text-[#2A5440] bg-[#EFF5F1] px-2 py-0.5 rounded border border-[#C7DED0] font-semibold shrink-0">
                {{ $t('common.stepsCount', { current: currentStep, total: 5 }) }}
              </span>
            </div>

            <!-- 时间线节点列表 -->
            <div class="timeline-nodes-list">
              <div class="timeline-connector-line"></div>

              <div
                v-for="s in processSteps"
                :key="s.step"
                class="timeline-node-item"
                :class="[
                  s.step === currentStep ? 'is-active' : '',
                  s.step < currentStep ? 'is-finish' : 'is-pending'
                ]"
              >
                <div class="node-icon-wrapper">
                  <el-icon v-if="s.step < currentStep" class="text-xs"><Check /></el-icon>
                  <span v-else class="font-bold text-xs">{{ s.step }}</span>
                </div>

                <div class="node-text-wrapper" :class="isAppMode ? 'hidden' : 'hidden lg:block'">
                  <div class="node-title font-bold text-xs" :class="s.step === currentStep ? 'text-[#326445]' : s.step < currentStep ? 'text-[#43554B]' : 'text-[#8A9A8F]'">
                    {{ s.name }}
                  </div>
                  <div class="node-desc text-[11px] text-[#8A9A8F] mt-0.5">
                    {{ s.desc }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧主操作区 (针对多语言长文本优化内边距与排版) -->
          <div class="flex-1 min-w-0 w-full space-y-6" :class="isAppMode ? 'p-4' : 'p-4 sm:p-6 lg:p-7 ps-9 sm:ps-10 lg:ps-7'">
            <!-- 移动端顶部轻量步骤指示器 -->
            <!-- APP 视口：顶部横向 1-5 步骤条 (适配手机窗口与操作习惯) -->
            <div v-if="isAppMode" class="flex items-center mb-3 px-1">
              <template v-for="(s, idx) in processSteps" :key="s.step">
                <div
                  class="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                  :class="s.step < currentStep ? 'bg-[#3E9B68] border-[#3E9B68] text-white' : s.step === currentStep ? 'bg-[#326445] border-[#326445] text-white ring-4 ring-[#326445]/15' : 'bg-white border-[#C9DBCE] text-[#8A9A8F]'"
                >
                  <el-icon v-if="s.step < currentStep" class="text-xs"><Check /></el-icon>
                  <span v-else>{{ s.step }}</span>
                </div>
                <div v-if="idx < processSteps.length - 1" class="flex-1 h-0.5 mx-1 rounded-full" :class="s.step < currentStep ? 'bg-[#3E9B68]' : 'bg-[#D9E5DB]'"></div>
              </template>
            </div>

            <div class="flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs" :class="isAppMode ? '' : 'lg:hidden'">
              <span class="font-bold text-[#1F3326] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#326445]"></span>
                <span>{{ $t('common.stepNumber', { step: currentStep }) }}：{{ processSteps[currentStep - 1]?.name }}</span>
              </span>
              <span class="font-mono text-[#8A9A8F] text-[11px]">{{ $t('common.progress', { current: currentStep, total: 5 }) }}</span>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 1: 录入成员国民编号与资格核验 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 1" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB] flex-wrap gap-2">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">1</span>
                  <span>{{ $t('memberTransfer.step1') }}</span>
                </label>
                <span class="text-xs text-[#8A9A8F]">{{ $t('memberTransfer.step1Sub') }}</span>
              </div>

              <!-- 关联家庭成员列表 (卡片选择) -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <span class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
                    <el-icon class="text-[#326445]"><UserFilled /></el-icon>
                    <span>{{ $t('memberTransfer.familyMemberList') }}</span>
                  </span>
                  <span class="text-[11px] text-[#8A9A8F]">{{ $t('memberTransfer.familyMemberHint') }}</span>
                </div>

                <!-- 家庭成员卡片网格 (支持自适应长文本) -->
                <div class="grid gap-3" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'">
                  <div
                    v-for="item in familyMemberList"
                    :key="item.nationalId"
                    class="p-3.5 rounded-lg border transition-all cursor-pointer relative flex flex-col justify-between gap-2 min-w-0"
                    :class="selectedMember?.nationalId === item.nationalId
                      ? 'bg-[#EFF5F1]/60 border-[#5C8A6B] shadow-xs ring-1 ring-[#5C8A6B]'
                      : 'bg-white border-[#D9E5DB] hover:border-[#C9DBCE] hover:bg-[#F3F8F4]/50'"
                    @click="handleSelectFamilyMember(item)"
                  >
                    <div class="flex items-start justify-between gap-2 min-w-0">
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-[#1F3326] text-xs flex items-center gap-1.5 flex-wrap">
                          <span class="truncate">{{ item.name }}</span>
                          <el-tag size="small" type="primary" effect="plain" class="scale-90 origin-left rtl:origin-right">
                            {{ item.relationLabel || $t('memberTransfer.relatedMember') }}
                          </el-tag>
                        </div>
                        <div class="text-[11px] font-mono text-[#58685D] mt-0.5 truncate">
                          ID: {{ item.nationalId }}
                        </div>
                      </div>

                      <el-tag
                        size="small"
                        :type="item.isUpdatedInSystem ? 'success' : 'danger'"
                        effect="dark"
                        class="shrink-0 scale-90"
                      >
                        {{ item.isUpdatedInSystem ? $t('memberTransfer.statusEnrolled') : $t('memberTransfer.statusNotUpdated') }}
                      </el-tag>
                    </div>

                    <div class="flex items-center justify-between text-[11px] text-[#8A9A8F] border-t border-[#E9F1EB]/80 pt-1.5 mt-0.5">
                      <span class="truncate">{{ item.currentProvince }}</span>
                      <span class="text-[#326445] font-semibold shrink-0" v-if="selectedMember?.nationalId === item.nationalId">
                        {{ $t('memberTransfer.selectedBadge') }}
                      </span>
                      <span class="text-[#8A9A8F] hover:text-[#326445] shrink-0" v-else>
                        {{ $t('memberTransfer.clickToSelect') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 国民编号查询输入框 -->
              <div class="space-y-1.5 pt-1">
                <div class="text-xs font-semibold text-[#43554B]">
                  {{ $t('memberTransfer.inputNationalId') }}：
                </div>
                <div class="flex gap-3">
                  <div class="flex-1">
                    <el-input
                      v-model="searchNationalId"
                      :placeholder="$t('memberTransfer.inputNationalIdPlaceholder')"
                      size="large"
                      clearable
                      maxlength="18"
                      @keyup.enter="handleQueryMember"
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                  <el-button
                    type="primary"
                    size="large"
                    :loading="querying"
                    class="px-6 font-bold shrink-0"
                    @click="handleQueryMember"
                  >
                    {{ $t('memberTransfer.queryBtn') }}
                  </el-button>
                </div>
              </div>

              <!-- 查找到的被转移成员卡片 -->
              <div v-if="selectedMember" class="space-y-4 pt-1">
                <!-- 法定红线拦截警示条 -->
                <div
                  v-if="!selectedMember.isUpdatedInSystem"
                  class="p-4 bg-[#FBEAE9] border border-[#E8B7B5] rounded-lg text-[#6E2F2E] space-y-1.5 animate-shake"
                >
                  <div class="font-bold flex items-center gap-2 text-sm text-[#6E2F2E]">
                    <el-icon :size="18"><CircleCloseFilled /></el-icon>
                    <span>{{ $t('memberTransfer.notUpdatedAlert') }}</span>
                  </div>
                  <p class="text-xs text-[#A93B39] leading-relaxed">
                    {{ $t('memberTransfer.notUpdatedAlertDetail') }}
                  </p>
                </div>

                <!-- 成员详情档案卡片 (针对多语言优化网格列宽与换行) -->
                <div
                  class="p-4 rounded-lg border grid gap-4 text-xs"
                  :class="[
                    isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
                    selectedMember.isUpdatedInSystem ? 'bg-[#F3F8F4] border-[#D9E5DB]' : 'bg-[#FBEAE9]/30 border-[#F2D5D4] opacity-80'
                  ]"
                >
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('citizen.headName') }}：</span>
                    <span class="font-bold text-[#1F3326] text-sm truncate block">{{ selectedMember.name }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.nationalIdLabel') }}：</span>
                    <span class="font-mono font-bold text-[#1F3326] truncate block">{{ selectedMember.nationalId }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('citizen.gender') }} / {{ $t('citizen.birthDate') }}：</span>
                    <span class="text-[#1F3326] truncate block">{{ selectedMember.gender }} ({{ selectedMember.birthDate }})</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.fatherNameLabel') }}：</span>
                    <span class="font-bold text-[#1F3326] truncate block">{{ selectedMember.fatherName }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('citizen.familyCode') }}：</span>
                    <span class="font-mono text-[#1F3326] truncate block">{{ selectedMember.familyCode }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.currentCardNoLabel') }}：</span>
                    <span class="font-mono text-[#1F3326] truncate block">{{ selectedMember.currentCardNo }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.currentProvinceCenter') }}：</span>
                    <span class="text-[#1F3326] truncate block">{{ selectedMember.currentProvince }} · {{ selectedMember.currentCenterName }}</span>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.systemUpdateStatus') }}：</span>
                    <el-tag :type="selectedMember.isUpdatedInSystem ? 'success' : 'danger'" size="small" class="max-w-full whitespace-normal break-words leading-snug">
                      {{ selectedMember.isUpdatedInSystem ? $t('memberTransfer.updatedPass') : $t('memberTransfer.statusNotUpdated') }}
                    </el-tag>
                  </div>
                </div>

                <!-- 生物识别核验模块 -->
                <div
                  v-if="selectedMember.isUpdatedInSystem"
                  class="p-4 bg-[#EFF5F1]/40 border border-[#C7DED0] rounded-lg space-y-3"
                >
                  <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="space-y-0.5">
                      <div class="text-xs font-bold text-[#12241A] flex items-center gap-1.5">
                        <el-icon class="text-[#2F7A50]"><CircleCheckFilled /></el-icon>
                        <span>{{ $t('memberTransfer.biometricTitle') }}</span>
                      </div>
                      <div class="text-[11px] text-[#58685D]">
                        {{ $t('memberTransfer.biometricNotice') }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <el-tag v-if="biometricVerified" type="success" effect="dark" size="small">
                        {{ $t('memberTransfer.biometricVerified') }}
                      </el-tag>
                      <el-button
                        size="small"
                        :type="biometricVerified ? 'default' : 'primary'"
                        :loading="verifyingBiometric"
                        @click="handleDoBiometric"
                      >
                        {{ biometricVerified ? $t('memberTransfer.reverifyBtn') : $t('memberTransfer.verifyBiometricBtn') }}
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 2: 选择转移原因与关系匹配 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 2" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB] flex-wrap gap-2">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">2</span>
                  <span>{{ $t('memberTransfer.step2') }}</span>
                </label>
                <span class="text-xs text-[#8A9A8F]">{{ $t('memberTransfer.step2Sub') }}</span>
              </div>

              <!-- 转移情形单选组 (优化按钮尺寸与自适应多行文本排版) -->
              <div class="space-y-2">
                <span class="block text-xs font-semibold text-[#43554B]">{{ $t('memberTransfer.transferTypeLabel') }}：</span>
                <el-radio-group v-model="transferReasonType" class="w-full grid gap-2.5" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'">
                  <el-radio-button value="wife" class="w-full text-start custom-radio-btn">
                    {{ $t('memberTransfer.typeWife') }}
                  </el-radio-button>
                  <el-radio-button value="child" class="w-full text-start custom-radio-btn">
                    {{ $t('memberTransfer.typeChild') }}
                  </el-radio-button>
                  <el-radio-button value="guardianship" class="w-full text-start custom-radio-btn">
                    {{ $t('memberTransfer.typeGuardianship') }}
                  </el-radio-button>
                  <el-radio-button value="support" class="w-full text-start custom-radio-btn">
                    {{ $t('memberTransfer.typeSupport') }}
                  </el-radio-button>
                  <el-radio-button value="other" class="w-full text-start custom-radio-btn">
                    {{ $t('memberTransfer.typeOther') }}
                  </el-radio-button>
                </el-radio-group>
              </div>

              <!-- 规则引擎实时研判卡片 -->
              <div class="space-y-3">
                <!-- 妻子规则比对展示 -->
                <div v-if="transferReasonType === 'wife'" class="p-4 rounded-lg border text-xs space-y-2" :class="wifeRecognized ? 'bg-[#EFF5F1] border-[#C7E0CE] text-[#12241A]' : 'bg-[#FDF3E0] border-[#F2E3C6] text-[#5A4718]'">
                  <div class="font-bold flex items-center gap-1.5 text-sm">
                    <el-icon><Connection /></el-icon>
                    <span>{{ $t('memberTransfer.wifeMatchTitle') }}</span>
                  </div>
                  <div class="grid gap-2 text-[11px]" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'">
                    <div>{{ $t('memberTransfer.familyCodeCompare') }}：<span class="font-mono font-bold">{{ selectedMember?.familyCode }} vs {{ currentFamilyCode }}</span> ({{ selectedMember?.familyCode === currentFamilyCode ? $t('memberTransfer.consistent') : $t('memberTransfer.inconsistent') }})</div>
                    <div>{{ $t('memberTransfer.fatherNameCompare') }}：<span class="font-bold">{{ selectedMember?.fatherName }} vs {{ currentHeadFatherName }}</span> ({{ selectedMember?.fatherName !== currentHeadFatherName ? $t('memberTransfer.notSisters') : $t('memberTransfer.sameSister') }})</div>
                  </div>
                  <p class="font-medium pt-1">
                    {{ wifeRecognized ? $t('memberTransfer.wifeMatchSuccess') : $t('memberTransfer.wifeMatchFail') }}
                  </p>
                </div>

                <!-- 子女规则比对展示 -->
                <div v-else-if="transferReasonType === 'child'" class="p-4 rounded-lg border text-xs space-y-2" :class="childRecognized ? 'bg-[#EFF5F1] border-[#C7E0CE] text-[#12241A]' : 'bg-[#FDF3E0] border-[#F2E3C6] text-[#5A4718]'">
                  <div class="font-bold flex items-center gap-1.5 text-sm">
                    <el-icon><Connection /></el-icon>
                    <span>{{ $t('memberTransfer.childMatchTitle') }}</span>
                  </div>
                  <div class="grid gap-2 text-[11px]" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'">
                    <div>{{ $t('memberTransfer.childFamilyCodeCompare') }}：<span class="font-mono font-bold">{{ selectedMember?.familyCode === currentFamilyCode ? $t('memberTransfer.consistent') : $t('memberTransfer.inconsistent') }}</span></div>
                    <div>{{ $t('memberTransfer.childFatherCompare') }}：<span class="font-bold">{{ selectedMember?.fatherName }} vs {{ currentHeadName }}</span> ({{ selectedMember?.fatherName === currentHeadName ? $t('memberTransfer.perfectMatch') : $t('memberTransfer.notMatch') }})</div>
                  </div>
                  <p class="font-medium pt-1">
                    {{ childRecognized ? $t('memberTransfer.childMatchSuccess') : $t('memberTransfer.childMatchFail') }}
                  </p>
                </div>

                <!-- 监护 / 抚养 / 其他规则提示 -->
                <div v-else class="p-4 bg-[#EFF5F1] border border-[#C7DED0] rounded-lg text-xs text-[#1F3326] space-y-1.5">
                  <div class="font-bold flex items-center gap-1.5 text-sm">
                    <el-icon><InfoFilled /></el-icon>
                    <span>{{ $t('memberTransfer.guardianshipNoticeTitle') }}</span>
                  </div>
                  <p class="leading-relaxed">
                    {{ $t('memberTransfer.guardianshipNoticeContent') }}
                  </p>
                </div>
              </div>

              <!-- 证明转移原因的官方文件上传 -->
              <div>
                <DocumentUploader
                  v-model="proofDocUploaded"
                  :title="$t('memberTransfer.proofUploadTitle')"
                  :subtitle="$t('memberTransfer.proofUploadSubtitle')"
                  is-required
                  :category-badge="$t('memberTransfer.proofCategoryBadge')"
                  :issuer="$t('memberTransfer.proofIssuer')"
                  :default-file-name="isEn ? 'Kinship_Relationship_Proof_2026.pdf' : (selectedMember?.proofDocName || '法定关系证明公文_2026.pdf')"
                />
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 3: 第 140 号决议合规核验 与 智能研判业务流转路径 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 3" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB] flex-wrap gap-2">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">3</span>
                  <span>{{ $t('memberTransfer.step3') }}</span>
                </label>
                <el-tag :type="isArticle140Area ? 'danger' : 'success'" size="small">
                  {{ isArticle140Area ? $t('memberTransfer.article140InWarning') : $t('memberTransfer.article140OutNotice') }}
                </el-tag>
              </div>

              <!-- 命中第 140 号决议的提示与公函上传 -->
              <div v-if="isArticle140Area" class="space-y-4">
                <div class="p-4 bg-[#FBEAE9] border border-[#F2D5D4] rounded-lg text-xs text-[#6E2F2E] space-y-1.5">
                  <div class="font-bold flex items-center gap-1.5 text-sm text-[#6E2F2E]">
                    <el-icon><WarningFilled /></el-icon>
                    <span>{{ $t('memberTransfer.art140AlertTitle') }}</span>
                  </div>
                  <p class="leading-relaxed">
                    {{ $t('memberTransfer.art140AlertContent') }}
                  </p>
                </div>

                <DocumentUploader
                  v-model="article140Uploaded"
                  :title="$t('transfer.art140DocTitle')"
                  :subtitle="$t('transfer.art140DocSubtitle')"
                  is-required
                  :category-badge="$t('transfer.art140DocBadge')"
                  :issuer="$t('transfer.art140DocIssuer')"
                  :default-file-name="isEn ? 'Article_140_No_Objection_Letter_2026.pdf' : '第140号决议转移无异议批函_2026.pdf'"
                />
              </div>

              <!-- 未涉及第 140 号决议的提示 -->
              <div v-else class="p-6 bg-[#EFF5F1]/50 border border-[#C7E0CE] rounded-lg text-xs space-y-2">
                <div class="flex items-center gap-2 text-[#24483A] font-bold text-sm">
                  <el-icon class="text-[#2F7A50]" :size="18"><CircleCheckFilled /></el-icon>
                  <span>{{ $t('memberTransfer.art140ExemptTitle') }}</span>
                </div>
                <p class="text-[#2F5B44] leading-relaxed">
                  {{ $t('memberTransfer.art140ExemptContent') }}
                </p>
              </div>

              <!-- 最终研判流转路径大卡片 -->
              <div class="p-4 rounded-lg border text-xs space-y-2" :class="finalPathDecision === 'auto' ? 'bg-[#EFF5F1] border-[#A7D9BC]' : 'bg-[#FDF3E0] border-[#E5CEA1]'">
                <div class="font-bold text-sm flex items-center justify-between" :class="finalPathDecision === 'auto' ? 'text-[#12241A]' : 'text-[#5A4718]'">
                  <div class="flex items-center gap-1.5">
                    <el-icon><Compass /></el-icon>
                    <span>{{ $t('memberTransfer.pathDecisionTitle') }}</span>
                  </div>
                  <el-tag :type="finalPathDecision === 'auto' ? 'success' : 'warning'" effect="dark">
                    {{ finalPathDecision === 'auto' ? $t('transfer.autoApprovedBadge') : $t('transfer.reviewingBadge') }}
                  </el-tag>
                </div>
                <p class="leading-relaxed font-medium" :class="finalPathDecision === 'auto' ? 'text-[#24483A]' : 'text-[#6B5321]'">
                  {{ finalPathDecision === 'auto' ? $t('memberTransfer.autoPath') : $t('memberTransfer.reviewPath') }}
                </p>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 4: 确认申请摘要与规费电子支付 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 4" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB] flex-wrap gap-2">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">4</span>
                  <span>{{ $t('memberTransfer.step4') }}</span>
                </label>
                <el-tag :type="finalPathDecision === 'auto' ? 'success' : 'warning'" effect="dark">
                  {{ finalPathDecision === 'auto' ? $t('transfer.autoApprovedBadge') : $t('transfer.reviewingBadge') }}
                </el-tag>
              </div>

              <!-- 申请明细摘要核对卡 -->
              <div class="bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-4 grid gap-4 text-xs" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'">
                <div>
                  <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.movingMember') }}：</span>
                  <span class="font-bold text-[#1F3326] truncate block">{{ selectedMember?.name }} (<bdi dir="ltr">{{ selectedMember?.nationalId }}</bdi>)</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.receivingRationCard') }}：</span>
                  <span class="font-mono font-bold text-[#326445] truncate block">{{ citizenStore.currentFamily?.rationCardNo }}</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.legalReason') }}：</span>
                  <span class="font-bold text-[#1F3326] truncate block">{{ getReasonTypeLabel(transferReasonType) }}</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px] truncate">{{ $t('memberTransfer.businessPath') }}：</span>
                  <span class="font-bold truncate block" :class="finalPathDecision === 'auto' ? 'text-[#2F7A50]' : 'text-[#C9A13B]'">
                    {{ finalPathDecision === 'auto' ? $t('transfer.autoApprovedBadge') : $t('transfer.reviewingBadge') }}
                  </span>
                </div>
              </div>

              <!-- 规费账单提示 -->
              <div class="p-4 bg-[#1B3123] text-white rounded-lg flex flex-col justify-between gap-4" :class="isAppMode ? '' : 'sm:flex-row sm:items-center'">
                <div class="space-y-1">
                  <div class="text-xs text-[#8A9A8F]">{{ $t('memberTransfer.feeLabel') }}</div>
                  <div class="text-2xl font-bold font-mono text-[#6FBF92]">
                    5,000 IQD <span class="text-xs text-[#8A9A8F] font-normal">({{ $t('common.iqdUnit') }})</span>
                  </div>
                </div>
                <div class="text-xs text-[#8A9A8F] sm:text-end">
                  <div>{{ $t('memberTransfer.payChannel') }}</div>
                  <div class="text-[11px] text-[#58685D]">{{ $t('memberTransfer.payChannelSub') }}</div>
                </div>
              </div>

              <!-- 引导进行扫码支付卡片 -->
              <div class="p-6 bg-[#EFF5F1]/50 border border-[#C7DED0] rounded-lg text-center space-y-3">
                <div class="w-12 h-12 rounded-lg bg-[#E1F4E4] text-[#326445] flex items-center justify-center mx-auto">
                  <el-icon :size="24"><CreditCard /></el-icon>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[#1B3123]">{{ $t('memberTransfer.lastStepTitle') }}</h4>
                  <p class="text-xs text-[#58685D] mt-1">
                    {{ $t('memberTransfer.lastStepSub') }}
                  </p>
                </div>
                <el-button
                  type="primary"
                  size="large"
                  class="px-8 font-bold shadow-md bg-[#326445] border-[#326445] hover:bg-[#5C8A6B]"
                  :loading="submitting"
                  @click="handleOpenPaymentDialog"
                >
                  <el-icon class="me-1.5"><Cellphone /></el-icon>
                  {{ $t('memberTransfer.payAndSubmitBtn') }}
                </el-button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 5: 受理办结与审核流转凭据 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 5" class="space-y-6 animate-fade-in text-center py-6">
              <div
                class="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                :class="finalPathDecision === 'auto' ? 'bg-[#E1F4E4] text-[#2F7A50]' : 'bg-[#E1F4E4] text-[#326445]'"
              >
                <el-icon :size="36"><CircleCheckFilled /></el-icon>
              </div>

              <div class="space-y-2">
                <h3 class="text-lg font-bold text-[#1B3123]">
                  {{ finalPathDecision === 'auto' ? $t('memberTransfer.autoSuccessTitle') : $t('memberTransfer.reviewSuccessTitle') }}
                </h3>
                <p class="text-xs text-[#58685D] max-w-lg mx-auto">
                  {{ transferMemberResult?.message || (finalPathDecision === 'auto' ? $t('memberTransfer.autoSuccessDesc') : $t('memberTransfer.reviewSuccessDesc')) }}
                </p>
              </div>

              <!-- 凭证卡片 -->
              <div class="max-w-xl mx-auto bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-5 text-start space-y-3 text-xs">
                <div class="flex items-center justify-between border-b border-[#D9E5DB]/80 pb-2">
                  <span class="font-bold text-[#1F3326]">{{ $t('memberTransfer.receiptTitle') }}</span>
                  <el-tag :type="finalPathDecision === 'auto' ? 'success' : 'warning'" size="small">
                    {{ finalPathDecision === 'auto' ? $t('transfer.autoApprovedBadge') : $t('transfer.reviewingBadge') }}
                  </el-tag>
                </div>
                <div class="grid grid-cols-2 gap-3 text-[#58685D]">
                  <div>{{ $t('transfer.ticketNo') }}：<span class="font-mono font-bold text-[#1F3326]">{{ transferMemberResult?.ticketId || `MT-${Date.now().toString().slice(-8)}` }}</span></div>
                  <div>{{ $t('memberTransfer.receivingRationCard') }}：<span class="font-mono font-bold text-[#2A5440]">{{ citizenStore.currentFamily?.rationCardNo }}</span></div>
                  <div>{{ $t('memberTransfer.movingMember') }}：<span class="font-bold text-[#1F3326]">{{ selectedMember?.name }}</span></div>
                  <div>{{ $t('memberTransfer.nationalIdLabel') }}：<span class="font-mono text-[#1F3326]">{{ selectedMember?.nationalId }}</span></div>
                  <div>{{ $t('memberTransfer.legalReason') }}：<span class="text-[#1F3326]">{{ getReasonTypeLabel(transferReasonType) }}</span></div>
                  <div>{{ $t('transfer.feePaid') }}：<span class="font-mono text-[#2F7A50] font-bold">{{ $t('transfer.feePaidAmount') }}</span></div>
                </div>
              </div>

              <div class="flex items-center justify-center gap-3 pt-2">
                <el-button type="primary" size="large" class="px-8 font-bold" @click="handleGoBack">
                  {{ $t('transfer.backToFamily') }}
                </el-button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 底部步骤切换操作栏 (上一步 / 下一步) -->
            <!-- ======================================================== -->
            <div v-if="currentStep < 5" class="flex items-center justify-between pt-4 border-t border-[#E9F1EB]">
              <el-button
                v-if="currentStep > 1"
                size="large"
                @click="handlePrevStep"
              >
                <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
                {{ $t('common.prevStep') }}
              </el-button>
              <div v-else />

              <div>
                <el-button
                  v-if="currentStep < 4"
                  type="primary"
                  size="large"
                  class="px-6 font-bold"
                  :disabled="currentStep === 1 && selectedMember && !selectedMember.isUpdatedInSystem"
                  @click="handleNextStep"
                >
                  {{ $t('common.nextStep') }}
                  <el-icon class="rtl-mirror-icon ms-1"><Right /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通用电子支付二维码收银台弹窗 -->
    <ElectronicPaymentDialog
      v-model="paymentDialogVisible"
      :title="$t('memberTransfer.paymentTitle')"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCitizenStore } from '../../stores/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import { queryMemberForTransfer, submitMemberTransfer, getTransferrableMembers } from '../../api/citizen.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import SupplementMaterialsPanel from '../../components/citizen/SupplementMaterialsPanel.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import {
  User,
  Back,
  Right,
  Search,
  CircleCloseFilled,
  CircleCheckFilled,
  WarningFilled,
  Compass,
  Connection,
  InfoFilled,
  CreditCard,
  Cellphone,
  UserFilled,
  Guide,
  Check
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
const router = useRouter();
const route = useRoute();
const citizenStore = useCitizenStore();

// APP 仿真视口判定：APP 模式下强制移动端布局（与 AppLayout 判定保持一致）
const isAppMode = computed(() => {
  return route.query.layout === 'app' || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
});

function handleGoBack() {
  if (route.query.layout === 'app') {
    router.push({ path: '/citizen', query: { layout: 'app' } });
  } else {
    router.push('/citizen');
  }
}

// 纯模块主标题
const cleanMemberTransferTitle = computed(() => {
  return t('memberTransfer.title').replace(/\s*[\(（].*?[\)）]/g, '').trim();
});

// 流程节点定义
const processSteps = computed(() => [
  { step: 1, name: t('memberTransfer.step1Name'), desc: t('memberTransfer.step1Desc') },
  { step: 2, name: t('memberTransfer.step2Name'), desc: t('memberTransfer.step2Desc') },
  { step: 3, name: t('memberTransfer.step3Name'), desc: t('memberTransfer.step3Desc') },
  { step: 4, name: t('memberTransfer.step4Name'), desc: t('memberTransfer.step4Desc') },
  { step: 5, name: t('common.completed'), desc: t('transfer.autoApprovedBadge') },
]);

const currentStep = ref(1);
const transferMemberResult = ref(null);

const querying = ref(false);
const submitting = ref(false);
const verifyingBiometric = ref(false);
const paymentDialogVisible = ref(false);

const searchNationalId = ref('');
const selectedMember = ref(null);
const familyMemberList = ref([]);

const biometricVerified = ref(false);
const proofDocUploaded = ref(true);
const article140Uploaded = ref(true);
const transferReasonType = ref('wife');

const handleLangChanged = async () => {
  await citizenStore.fetchFamilies();
  await loadAvailableMembers();
};

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  await loadAvailableMembers();
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
  }
});

async function loadAvailableMembers() {
  try {
    const list = await getTransferrableMembers();
    familyMemberList.value = list || [];
    if (familyMemberList.value.length > 0 && !selectedMember.value) {
      handleSelectFamilyMember(familyMemberList.value[0]);
    }
  } catch (err) {
    // handled by axios
  }
}

function handleSelectFamilyMember(item) {
  selectedMember.value = item;
  searchNationalId.value = item.nationalId;
  biometricVerified.value = true;
  proofDocUploaded.value = true;
  article140Uploaded.value = true;
}

const currentHeadName = computed(() => citizenStore.currentFamily?.headName || (isEn.value ? 'Ahmed Hassan' : '艾哈迈德·哈桑'));
const currentHeadFatherName = computed(() => isEn.value ? 'Hassan Saleh' : '哈桑·萨利赫');
const currentFamilyCode = computed(() => citizenStore.currentFamily?.familyCode || 'FAM-10029381');

// 规则引擎研判
const wifeRecognized = computed(() => {
  if (!selectedMember.value) return false;
  return selectedMember.value.familyCode === currentFamilyCode.value && selectedMember.value.fatherName !== currentHeadFatherName.value;
});

const childRecognized = computed(() => {
  if (!selectedMember.value) return false;
  return selectedMember.value.familyCode === currentFamilyCode.value && selectedMember.value.fatherName === currentHeadName.value;
});

const ARTICLE_140_KEYWORDS = ['迪亚拉', '尼尼微', '萨拉赫丁', '基尔库克', 'Diyala', 'Ninawa', 'Nineveh', 'Kirkuk', 'Salah al-Din', 'Khanaqin', 'Sinjar'];
const isArticle140Area = computed(() => {
  if (!selectedMember.value) return false;
  const prov = selectedMember.value.currentProvince || '';
  const center = selectedMember.value.currentCenterName || '';
  return ARTICLE_140_KEYWORDS.some((kw) => prov.includes(kw) || center.includes(kw));
});

const finalPathDecision = computed(() => {
  if (!selectedMember.value) return 'review';
  if (isArticle140Area.value) return 'review';
  if (transferReasonType.value === 'wife' && wifeRecognized.value) return 'auto';
  if (transferReasonType.value === 'child' && childRecognized.value) return 'auto';
  return 'review';
});

function getReasonTypeLabel(type) {
  const map = {
    wife: t('memberTransfer.typeWife'),
    child: t('memberTransfer.typeChild'),
    guardianship: t('memberTransfer.typeGuardianship'),
    support: t('memberTransfer.typeSupport'),
    other: t('memberTransfer.typeOther')
  };
  return map[type] || type;
}

async function handleQueryMember() {
  if (!searchNationalId.value.trim()) {
    ElMessage.warning(t('memberTransfer.inputNationalIdPlaceholder'));
    return;
  }
  querying.value = true;
  try {
    const res = await queryMemberForTransfer(searchNationalId.value.trim());
    if (res) {
      selectedMember.value = res;
      biometricVerified.value = true;
      proofDocUploaded.value = true;
    }
  } catch (err) {
    // handled by axios
  } finally {
    querying.value = false;
  }
}

function handleDoBiometric() {
  verifyingBiometric.value = true;
  setTimeout(() => {
    biometricVerified.value = true;
    verifyingBiometric.value = false;
    ElMessage.success(t('memberTransfer.biometricVerified'));
  }, 600);
}

function handlePrevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function handleNextStep() {
  if (currentStep.value === 1) {
    if (!selectedMember.value) {
      ElMessage.warning(t('memberTransfer.searchMemberRequired'));
      return;
    }
    if (!selectedMember.value.isUpdatedInSystem) {
      ElMessage.error(t('memberTransfer.memberNotUpdatedError'));
      return;
    }
    if (!biometricVerified.value) {
      ElMessage.warning(t('memberTransfer.biometricRequired'));
      return;
    }
    currentStep.value = 2;
    return;
  }

  if (currentStep.value === 2) {
    if (!proofDocUploaded.value) {
      ElMessage.warning(t('memberTransfer.uploadProofDocRequired'));
      return;
    }
    currentStep.value = 3;
    return;
  }

  if (currentStep.value === 3) {
    if (isArticle140Area.value && !article140Uploaded.value) {
      ElMessage.warning(t('memberTransfer.uploadArt140Required'));
      return;
    }
    currentStep.value = 4;
  }
}

function handleOpenPaymentDialog() {
  paymentDialogVisible.value = true;
}

async function handlePaymentSuccess(paymentInfo) {
  submitting.value = true;
  try {
    const payload = {
      cardNo: citizenStore.currentFamily?.rationCardNo,
      member: selectedMember.value,
      transferReasonType: transferReasonType.value,
      finalPathDecision: finalPathDecision.value,
      isArticle140: isArticle140Area.value,
      proofDoc: isEn.value ? 'Kinship_Relationship_Proof_2026.pdf' : (selectedMember.value?.proofDocName || '法定关系证明公文_2026.pdf'),
      article140Doc: isArticle140Area.value ? (isEn.value ? 'Article_140_No_Objection_Letter_2026.pdf' : '第140号决议转移无异议批函_2026.pdf') : '',
      paymentInfo
    };

    const res = await submitMemberTransfer(payload);
    transferMemberResult.value = res;
    currentStep.value = 5;
    await citizenStore.fetchFamilies();

    // 跨标签页共享与广播新成员转移公文
    addSharedTicket({
      source: '家庭成员关系转移公文',
      sourceCode: 'TRM',
      categoryType: '成员户籍转移',
      appType: '跨户成员合并/转移',
      cardNo: citizenStore.currentFamily?.rationCardNo || 'RC-10029381',
      applicantName: citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫 (户主)',
      targetMemberName: selectedMember.value?.name || '家庭成员',
      reason: `办理成员 [${selectedMember.value?.name || '申请人'}] 跨户转移，事由：${getReasonLabel(transferReasonType.value)}`,
      attachments: [
        { name: payload.proofDoc || '法定关系证明公文_2026.pdf', type: 'required', verified: true }
      ]
    });

    ElMessage.success(t('memberTransfer.submitSuccessMsg'));
  } catch (err) {
    // handled by axios
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.process-card-wrapper {
  --theme-color: #B8934A;
  --theme-color-rgb: 79, 70, 229;
}

:deep(.custom-radio-btn .el-radio-button__inner) {
  width: 100%;
  white-space: normal;
  line-height: 1.35;
  padding-top: 10px;
  padding-bottom: 10px;
  height: auto;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 11px;
}

/* 桌面端时间线样式 */
@media (min-width: 1024px) {
  .timeline-nodes-list {
    position: relative;
  }
  .timeline-connector-line {
    position: absolute;
    inset-inline-start: 15px;
    top: 24px;
    bottom: 24px;
    width: 2px;
    background-color: #D9E5DB;
    z-index: 1;
  }
  .timeline-node-item {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding-bottom: 24px;
  }
  .timeline-node-item:last-child {
    padding-bottom: 0;
  }
  .node-icon-wrapper {
    width: 30px;
    height: 30px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background-color: #ffffff;
    border: 2px solid #C9DBCE;
    color: #58685D;
    transition: all 0.25s ease;
  }
  .timeline-node-item.is-finish .node-icon-wrapper {
    background-color: #3E9B68;
    border-color: #3E9B68;
    color: #ffffff;
  }
  .timeline-node-item.is-active .node-icon-wrapper {
    background-color: var(--theme-color);
    border-color: var(--theme-color);
    color: #ffffff;
    box-shadow: 0 0 0 3px rgba(var(--theme-color-rgb), 0.2);
    transform: scale(1.08);
  }
}

/* 移动端时间线样式 */
@media (max-width: 1023px) {
  .timeline-rail-aside {
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    z-index: 20;
    pointer-events: none;
  }
  .timeline-nodes-list {
    position: absolute;
    inset-inline-start: 0;
    top: 56px;
    bottom: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .timeline-connector-line {
    position: absolute;
    inset-inline-start: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #C9DBCE;
    z-index: 1;
  }
  .timeline-node-item {
    position: relative;
    z-index: 2;
  }
  .node-icon-wrapper {
    position: absolute;
    inset-inline-start: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F8FBF8;
    border: 2px solid #C9DBCE;
    color: #8A9A8F;
    font-size: 10px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .timeline-node-item.is-finish .node-icon-wrapper {
    background-color: #3E9B68;
    border-color: #2F7A50;
    color: #ffffff;
  }
  .timeline-node-item.is-active .node-icon-wrapper {
    width: 32px;
    height: 32px;
    border-width: 3px;
    border-color: #ffffff;
    background-color: var(--theme-color);
    color: #ffffff;
    font-size: 13px;
    font-weight: bold;
    box-shadow: 0 0 0 2px var(--theme-color), 0 4px 10px rgba(0, 0, 0, 0.18);
    z-index: 10;
  }
}
</style>
