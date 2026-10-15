<template>
  <div class="transfer-agent-view space-y-4 sm:space-y-6">
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 顶部标题与返回导航 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('transfer.title')"
          :content="$t('transfer.subtitle')"
          title-class="text-base font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#326445] text-lg"><Switch /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="mr-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 当前家庭配给卡与原代理存根概览 -->
      <div v-if="citizenStore.currentFamily" class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.rationCardNo') }}：</span>
          <span class="font-mono font-bold text-[#326445]">{{ citizenStore.currentFamily.rationCardNo }}</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('citizen.headName') }}：</span>
          <span class="font-bold text-[#1F3326]">{{ citizenStore.currentFamily.headName }} ({{ citizenStore.currentFamily.memberCount }} {{ $t('common.person') }})</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.currentProvince') }}：</span>
          <span class="font-medium text-[#1F3326]">{{ currentFromProvince }}</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.currentAgent') }}：</span>
          <span class="font-medium text-[#7A5F21] truncate block">{{ citizenStore.currentFamily.agentName }}</span>
        </div>
      </div>

      <!-- 流程与表单联动容器：包含左侧流程节点时间线与右侧自适应业务内容 -->
      <div class="process-card-wrapper relative bg-white rounded-lg border border-[#D9E5DB] overflow-hidden shadow-xs">
        <div class="flex flex-col lg:flex-row items-stretch">
          
          <!-- 左侧时间线节点 (移动端收入左侧边框仅露半圆，桌面端为标准流程侧栏) -->
          <div class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-r border-[#D9E5DB] lg:p-6 p-0">
            <!-- 桌面端侧边栏标题 -->
            <div class="hidden lg:flex items-center justify-between pb-4 mb-5 border-b border-[#D9E5DB]">
              <span class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
                <el-icon class="text-[#326445]"><Guide /></el-icon>
                <span>{{ cleanTransferTitle }}</span>
              </span>
              <span class="text-[11px] font-mono text-[#2A5440] bg-[#EFF5F1] px-2 py-0.5 rounded border border-[#C7DED0] font-semibold">
                {{ $t('common.stepsCount', { current: currentStep, total: 5 }) }}
              </span>
            </div>

            <!-- 时间线节点列表 -->
            <div class="timeline-nodes-list">
              <!-- 纵向连接线 -->
              <div class="timeline-connector-line"></div>

              <!-- 各节点 -->
              <div
                v-for="s in processSteps"
                :key="s.step"
                class="timeline-node-item"
                :class="[
                  s.step === currentStep ? 'is-active' : '',
                  s.step < currentStep ? 'is-finish' : 'is-pending'
                ]"
              >
                <!-- 节点圆圈图标 -->
                <div class="node-icon-wrapper">
                  <el-icon v-if="s.step < currentStep" class="text-xs"><Check /></el-icon>
                  <span v-else class="font-bold text-xs">{{ s.step }}</span>
                </div>

                <!-- 节点文本 (仅桌面端显示) -->
                <div class="node-text-wrapper hidden lg:block">
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

          <!-- 右侧主操作区 -->
          <div class="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-7 pl-9 sm:pl-10 lg:pl-7 space-y-6">
            <!-- 移动端顶部轻量步骤指示器 -->
            <div class="lg:hidden flex items-center justify-between p-2.5 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg text-xs">
              <span class="font-bold text-[#1F3326] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#326445]"></span>
                <span>{{ $t('common.stepNumber', { step: currentStep }) }}：{{ processSteps[currentStep - 1]?.name }}</span>
              </span>
              <span class="font-mono text-[#8A9A8F] text-[11px]">{{ $t('common.progress', { current: currentStep, total: 5 }) }}</span>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 1: 选择目标分部、中心及代理 (带 1,500 户容量红线监控) -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 1" class="space-y-4 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB] flex-wrap gap-2">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2 flex-wrap">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">1</span>
                  <span>{{ $t('transfer.step1TargetTitle') }}</span>
                  <el-tag size="small" type="danger" effect="plain" class="scale-90">{{ $t('transfer.capacityAlert') }}</el-tag>
                </label>
                <span class="text-xs text-[#8A9A8F]">{{ $t('transfer.capacityNotice') }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.targetProvince') }}</span>
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
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.targetBranch') }}</span>
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
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.targetCenter') }}</span>
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
                class="p-3 rounded-lg border text-xs flex items-center justify-between"
                :class="isSameProvince ? 'bg-[#EFF5F1] border-[#C7E0CE] text-[#12241A]' : 'bg-[#FDF3E0] border-[#F2E3C6] text-[#5A4718]'"
              >
                <div class="flex items-center gap-2">
                  <el-icon><Compass /></el-icon>
                  <span>
                    {{ $t('transfer.routeNotice', { prov: targetProvince, route: isSameProvince ? $t('transfer.autoRoute') : $t('transfer.reviewRoute'), approval: isSameProvince ? $t('transfer.autoPathNotice') : $t('transfer.reviewPathNotice') }) }}
                  </span>
                </div>
                <el-tag :type="isSameProvince ? 'success' : 'warning'" size="small">
                  {{ isSameProvince ? $t('transfer.autoRoute') : $t('transfer.reviewRoute') }}
                </el-tag>
              </div>

              <!-- 双代理选择：面粉代理 & 食品代理 -->
              <div v-if="selectedCenter" class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <!-- 面粉代理网点选择 -->
                <div class="border rounded-lg p-4 space-y-3 bg-[#F3F8F4]/70 border-[#D9E5DB]">
                  <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]/80">
                    <span class="text-xs font-bold text-[#5A4718] flex items-center gap-1.5">
                      <span>{{ $t('transfer.flourAgent') }}</span>
                      <span class="text-[11px] text-[#8A9A8F] font-normal">({{ $t('transfer.limit1500') }})</span>
                    </span>
                    <el-tag size="small" type="warning" effect="dark">{{ $t('transfer.flourSupply') }}</el-tag>
                  </div>

                  <el-radio-group v-model="selectedFlourAgentId" class="w-full space-y-2 flex flex-col">
                    <div
                      v-for="ag in selectedCenter.flourAgents"
                      :key="ag.id"
                      class="p-3 rounded-lg border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                      :class="[
                        selectedFlourAgentId === ag.id ? 'border-[#D3AF62] ring-1 ring-[#D3AF62] shadow-2xs' : 'border-[#D9E5DB] hover:border-[#C9DBCE]',
                        ag.currentHouseholds >= 1500 ? 'opacity-60 bg-[#E9F1EB] cursor-not-allowed' : ''
                      ]"
                    >
                      <el-radio :value="ag.id" :disabled="ag.currentHouseholds >= 1500">
                        <span class="font-bold text-[#1F3326]">{{ ag.name }}</span>
                        <span class="text-[11px] text-[#8A9A8F] block mt-0.5">{{ $t('transfer.manager') }}: {{ ag.manager }}</span>
                      </el-radio>

                      <div class="text-right shrink-0">
                        <span
                          class="font-mono font-bold text-xs"
                          :class="ag.currentHouseholds >= 1500 ? 'text-[#C04442]' : 'text-[#326445]'"
                        >
                          {{ ag.currentHouseholds }} / {{ ag.maxCapacity }} {{ $t('common.households') }}
                        </span>
                        <el-tag
                          v-if="ag.currentHouseholds >= 1500"
                          size="small"
                          type="danger"
                          effect="dark"
                          class="scale-90 origin-right block mt-0.5"
                        >
                          {{ $t('transfer.capacityFull') }}
                        </el-tag>
                        <span v-else class="text-[10px] text-[#2F7A50] block">{{ $t('transfer.capacityAvailable') }}</span>
                      </div>
                    </div>
                  </el-radio-group>
                </div>

                <!-- 食品代理网点选择 -->
                <div class="border rounded-lg p-4 space-y-3 bg-[#F3F8F4]/70 border-[#D9E5DB]">
                  <div class="flex items-center justify-between pb-2 border-b border-[#D9E5DB]/80">
                    <span class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
                      <span>{{ $t('transfer.foodAgent') }}</span>
                      <span class="text-[11px] text-[#8A9A8F] font-normal">({{ $t('transfer.limit1500') }})</span>
                    </span>
                    <el-tag size="small" type="primary" effect="dark">{{ $t('transfer.foodSupply') }}</el-tag>
                  </div>

                  <el-radio-group v-model="selectedFoodAgentId" class="w-full space-y-2 flex flex-col">
                    <div
                      v-for="ag in selectedCenter.foodAgents"
                      :key="ag.id"
                      class="p-3 rounded-lg border bg-white flex items-center justify-between text-xs cursor-pointer transition-all"
                      :class="[
                        selectedFoodAgentId === ag.id ? 'border-[#5C8A6B] ring-1 ring-[#5C8A6B] shadow-2xs' : 'border-[#D9E5DB] hover:border-[#C9DBCE]',
                        ag.currentHouseholds >= 1500 ? 'opacity-60 bg-[#E9F1EB] cursor-not-allowed' : ''
                      ]"
                    >
                      <el-radio :value="ag.id" :disabled="ag.currentHouseholds >= 1500">
                        <span class="font-bold text-[#1F3326]">{{ ag.name }}</span>
                        <span class="text-[11px] text-[#8A9A8F] block mt-0.5">{{ $t('transfer.manager') }}: {{ ag.manager }}</span>
                      </el-radio>

                      <div class="text-right shrink-0">
                        <span
                          class="font-mono font-bold text-xs"
                          :class="ag.currentHouseholds >= 1500 ? 'text-[#C04442]' : 'text-[#326445]'"
                        >
                          {{ ag.currentHouseholds }} / {{ ag.maxCapacity }} {{ $t('common.households') }}
                        </span>
                        <el-tag
                          v-if="ag.currentHouseholds >= 1500"
                          size="small"
                          type="danger"
                          effect="dark"
                          class="scale-90 origin-right block mt-0.5"
                        >
                          {{ $t('transfer.capacityFull') }}
                        </el-tag>
                        <span v-else class="text-[10px] text-[#2F7A50] block">{{ $t('transfer.capacityAvailable') }}</span>
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
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">2</span>
                  <span>{{ $t('transfer.step2Title') }}</span>
                </label>
                <span class="text-xs text-[#C04442]">{{ $t('transfer.mandatoryNotice') }}</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.residenceDistrict') }} <span class="text-[#C04442]">*</span></span>
                  <el-input v-model="residenceForm.district" size="large" :placeholder="$t('transfer.districtPlaceholder')" />
                </div>
                <div>
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.residenceSubDistrict') }} <span class="text-[#C04442]">*</span></span>
                  <el-input v-model="residenceForm.subDistrict" size="large" :placeholder="$t('transfer.subDistrictPlaceholder')" />
                </div>
                <div>
                  <span class="block text-xs font-semibold text-[#58685D] mb-1.5">{{ $t('transfer.residenceLandmark') }} <span class="text-[#C04442]">*</span></span>
                  <el-input v-model="residenceForm.nearestLandmark" size="large" :placeholder="$t('transfer.landmarkPlaceholder')" />
                </div>
              </div>

              <!-- 居住证明文件上传模块 (必需材料) -->
              <div class="pt-2">
                <DocumentUploader
                  v-model="residenceProofUploaded"
                  :title="$t('transfer.residenceProofTitle')"
                  :subtitle="$t('transfer.residenceProofSubtitle')"
                  is-required
                  :category-badge="$t('transfer.residenceProofBadge')"
                  :issuer="$t('transfer.residenceProofIssuer')"
                  :default-file-name="isEn ? 'Residence_Confirmation_Certificate_2026.pdf' : '公民常住新地址居住确认公函_2026.pdf'"
                />
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 3: 第 140 号决议合规核验 (特定争议领土强制要求) -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 3" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">3</span>
                  <span>{{ $t('transfer.article140Title') }}</span>
                </label>
                <el-tag :type="requiresArticle140 ? 'danger' : 'success'" size="small">
                  {{ requiresArticle140 ? $t('transfer.article140Warning') : $t('transfer.article140Exempted') }}
                </el-tag>
              </div>

              <!-- 涉及第 140 号决议的警示与上传模块 -->
              <div v-if="requiresArticle140" class="space-y-4">
                <div class="p-4 bg-[#FBEAE9] border border-[#F2D5D4] rounded-lg text-xs text-[#6E2F2E] space-y-1.5">
                  <div class="font-bold flex items-center gap-1.5 text-sm text-[#6E2F2E]">
                    <el-icon><WarningFilled /></el-icon>
                    <span>{{ $t('transfer.art140NoticeTitle') }}</span>
                  </div>
                  <p class="leading-relaxed">
                    {{ $t('transfer.art140NoticeContent') }}
                  </p>
                </div>

                <DocumentUploader
                  v-model="article140Uploaded"
                  :title="$t('transfer.art140DocTitle')"
                  :subtitle="$t('transfer.art140DocSubtitle')"
                  is-required
                  :category-badge="$t('transfer.art140DocBadge')"
                  :issuer="$t('transfer.art140DocIssuer')"
                  :default-file-name="isEn ? 'Article_140_No_Objection_Letter_2026.pdf' : '第140号决议无异议执行批文_2026.pdf'"
                />
              </div>

              <!-- 不涉及第 140 号决议的友好提示 -->
              <div v-else class="p-6 bg-[#EFF5F1]/50 border border-[#C7E0CE] rounded-lg text-xs space-y-3">
                <div class="flex items-center gap-2 text-[#24483A] font-bold text-sm">
                  <el-icon class="text-[#2F7A50]" :size="18"><CircleCheckFilled /></el-icon>
                  <span>{{ $t('transfer.art140ExemptTitle') }}</span>
                </div>
                <p class="text-[#2F5B44] leading-relaxed">
                  {{ $t('transfer.art140ExemptContent', { from: currentFromProvince, target: `${targetProvince} · ${targetBranchName}` }) }}
                </p>
                <div>
                  <el-tag type="success" effect="dark" size="small">{{ $t('transfer.art140ExemptBadge') }}</el-tag>
                </div>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 4: 确认信息与规费电子支付 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 4" class="space-y-5 animate-fade-in">
              <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
                <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#E1F4E4] text-[#326445] text-xs flex items-center justify-center font-bold">4</span>
                  <span>{{ $t('transfer.step4Title') }}</span>
                </label>
                <el-tag :type="isSameProvince ? 'success' : 'warning'" effect="dark">
                  {{ isSameProvince ? $t('transfer.intraProvinceAuto') : $t('transfer.interProvinceReview') }}
                </el-tag>
              </div>

              <!-- 申请明细摘要核对卡 -->
              <div class="bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.summaryTarget') }}：</span>
                  <span class="font-bold text-[#1F3326]">{{ targetProvince }} / {{ targetBranchName }}</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.flourAgent') }}：</span>
                  <span class="font-bold text-[#6B5321]">{{ currentSelectedFlourAgent?.name }}</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.foodAgent') }}：</span>
                  <span class="font-bold text-[#24483A]">{{ currentSelectedFoodAgent?.name }}</span>
                </div>
                <div>
                  <span class="text-[#8A9A8F] block text-[11px]">{{ $t('transfer.summaryLandmark') }}：</span>
                  <span class="font-bold text-[#1F3326] truncate block">{{ residenceForm.nearestLandmark }}</span>
                </div>
              </div>

              <!-- 规费账单提示 -->
              <div class="p-4 bg-[#1B3123] text-white rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="space-y-1">
                  <div class="text-xs text-[#8A9A8F]">{{ $t('transfer.feeDescription') }}：</div>
                  <div class="text-2xl font-bold font-mono text-[#6FBF92]">
                    5,000 IQD <span class="text-xs text-[#8A9A8F] font-normal">({{ $t('common.iqdUnit') }})</span>
                  </div>
                  <div class="text-[11px] text-[#8A9A8F]">
                    {{ $t('transfer.payChannels') }}
                  </div>
                </div>
                <div>
                  <el-tag type="success" effect="dark" size="small">
                    {{ $t('transfer.feeReady') }}
                  </el-tag>
                </div>
              </div>

              <!-- 引导进行扫码支付卡片 -->
              <div class="p-6 bg-[#EFF5F1]/50 border border-[#C7E0CE] rounded-lg text-center space-y-3">
                <div class="w-12 h-12 rounded-lg bg-[#E1F4E4] text-[#2F7A50] flex items-center justify-center mx-auto">
                  <el-icon :size="24"><CreditCard /></el-icon>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-[#1B3123]">{{ $t('transfer.lastStepTitle') }}</h4>
                  <p class="text-xs text-[#58685D] mt-1">
                    {{ $t('transfer.lastStepSubtitle') }}
                  </p>
                </div>
                <el-button
                  type="success"
                  size="large"
                  class="px-8 font-bold shadow-md bg-[#2F7A50] border-[#2F7A50] hover:bg-[#3E9B68]"
                  :loading="submitting"
                  @click="handleOpenPaymentDialog"
                >
                  <el-icon class="mr-1.5"><Cellphone /></el-icon>
                  {{ $t('transfer.payAndSubmit') }}
                </el-button>
              </div>
            </div>

            <!-- ======================================================== -->
            <!-- 步骤 5: 受理办结与审核流转凭据 -->
            <!-- ======================================================== -->
            <div v-show="currentStep === 5" class="space-y-6 animate-fade-in text-center py-6">
              <div
                class="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                :class="transferResult?.autoApproved ? 'bg-[#E1F4E4] text-[#2F7A50]' : 'bg-[#E1F4E4] text-[#326445]'"
              >
                <el-icon :size="36"><CircleCheckFilled /></el-icon>
              </div>

              <div class="space-y-2">
                <h3 class="text-lg font-bold text-[#1B3123]">
                  {{ transferResult?.autoApproved ? $t('transfer.autoSuccessTitle') : $t('transfer.reviewSuccessTitle') }}
                </h3>
                <p class="text-xs text-[#58685D] max-w-lg mx-auto">
                  {{ transferResult?.message || (transferResult?.autoApproved ? $t('transfer.autoSuccessDesc') : $t('transfer.reviewSuccessDesc')) }}
                </p>
              </div>

              <!-- 凭证卡片 -->
              <div class="max-w-xl mx-auto bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-5 text-left space-y-3 text-xs">
                <div class="flex items-center justify-between border-b border-[#D9E5DB]/80 pb-2">
                  <span class="font-bold text-[#1F3326]">{{ $t('transfer.receiptTitle') }}</span>
                  <el-tag :type="transferResult?.autoApproved ? 'success' : 'warning'" size="small">
                    {{ transferResult?.autoApproved ? $t('transfer.autoApprovedBadge') : $t('transfer.reviewingBadge') }}
                  </el-tag>
                </div>
                <div class="grid grid-cols-2 gap-3 text-[#58685D]">
                  <div>{{ $t('transfer.ticketNo') }}：<span class="font-mono font-bold text-[#1F3326]">{{ transferResult?.ticketId || 'TR-2026-BAG-0918' }}</span></div>
                  <div>{{ $t('citizen.headName') }}：<span class="font-bold text-[#1F3326]">{{ citizenStore.currentFamily?.headName }}</span></div>
                  <div>{{ $t('transfer.originalAgent') }}：<span class="text-[#1F3326]">{{ citizenStore.currentFamily?.agentName }}</span></div>
                  <div>{{ $t('transfer.flourAgent') }}：<span class="font-bold text-[#7A5F21]">{{ currentSelectedFlourAgent?.name }}</span></div>
                  <div>{{ $t('transfer.foodAgent') }}：<span class="font-bold text-[#2A5440]">{{ currentSelectedFoodAgent?.name }}</span></div>
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
                <el-icon class="mr-1"><Back /></el-icon>
                {{ $t('common.prevStep') }}
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
                  {{ $t('common.nextStep') }}
                  <el-icon class="ml-1"><Right /></el-icon>
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
      :title="$t('transfer.paymentTitle')"
      :amount="5000"
      currency="IQD"
      :business-no="citizenStore.currentFamily?.rationCardNo"
      :applicant-name="citizenStore.currentFamily?.headName"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import { getTransferOptions, submitTransferAgent } from '../../api/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import {
  Switch,
  Back,
  Right,
  Compass,
  WarningFilled,
  CircleCheckFilled,
  CreditCard,
  Cellphone,
  Guide,
  Check
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const { t, locale } = useI18n();
const isEn = computed(() => locale.value === 'en');
const router = useRouter();
const route = useRoute();
const citizenStore = useCitizenStore();

function handleGoBack() {
  if (route.query.layout === 'app') {
    router.push({ path: '/citizen', query: { layout: 'app' } });
  } else {
    router.push('/citizen');
  }
}

// 纯模块主标题
const cleanTransferTitle = computed(() => {
  return t('transfer.title').replace(/\s*[\(（].*?[\)）]/g, '').trim();
});

// 流程节点定义 (响应式多语言适配)
const processSteps = computed(() => [
  { step: 1, name: t('transfer.step1Name'), desc: t('transfer.step1Desc') },
  { step: 2, name: t('transfer.step2Name'), desc: t('transfer.step2Desc') },
  { step: 3, name: t('transfer.step3Name'), desc: t('transfer.step3Desc') },
  { step: 4, name: t('transfer.step4Name'), desc: t('transfer.step4Desc') },
  { step: 5, name: t('common.completed'), desc: t('transfer.autoApprovedBadge') },
]);

// 当前向导步骤：1 | 2 | 3 | 4 | 5
const currentStep = ref(1);
const transferResult = ref(null);

const submitting = ref(false);
const paymentDialogVisible = ref(false);
const provinceOptions = ref([]);

// 目标省份/分部/中心/代理选择状态
const targetProvince = ref('');
const targetBranchName = ref('');
const targetCenterId = ref('');
const selectedFlourAgentId = ref('');
const selectedFoodAgentId = ref('');

// 新居住信息表单
const residenceForm = reactive({
  district: '',
  subDistrict: '',
  nearestLandmark: ''
});

function initResidenceForm() {
  if (locale.value === 'en') {
    residenceForm.district = 'Al-Mansour District, Karkh';
    residenceForm.subDistrict = 'Street 14, Sector 6';
    residenceForm.nearestLandmark = 'West of Grand Mosque';
  } else {
    residenceForm.district = '卡尔赫区曼苏尔街区';
    residenceForm.subDistrict = '第14住宅大街';
    residenceForm.nearestLandmark = '中央大清真寺西侧';
  }
}

// 证明文件状态
const residenceProofUploaded = ref(true);
const article140Uploaded = ref(true);

const handleLangChanged = async () => {
  await citizenStore.fetchFamilies();
  await loadTransferOptions();
  initResidenceForm();
};

onMounted(async () => {
  initResidenceForm();
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  await loadTransferOptions();
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('rcm-language-changed', handleLangChanged);
  }
});

// 当前家庭原省份
const currentFromProvince = computed(() => {
  return citizenStore.currentFamily?.province || (isEn.value ? 'Baghdad Governorate' : '巴格达省 (Baghdad)');
});

// 是否为省内转移
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

// 是否涉及第 140 号决议特定争议领土
const ARTICLE_140_KEYWORDS = ['迪亚拉', '尼尼微', '萨拉赫丁', '基尔库克', 'Diyala', 'Ninawa', 'Nineveh', 'Kirkuk', 'Salah al-Din', 'Khanaqin', 'Sinjar'];
const requiresArticle140 = computed(() => {
  const from = currentFromProvince.value;
  const to = `${targetProvince.value} ${targetBranchName.value}`;
  return ARTICLE_140_KEYWORDS.some((kw) => from.includes(kw) || to.includes(kw));
});

// 加载省市区网点树形元数据
async function loadTransferOptions() {
  try {
    const list = await getTransferOptions();
    provinceOptions.value = list || [];
    if (provinceOptions.value.length > 0) {
      if (!targetProvince.value || !provinceOptions.value.some(p => p.province === targetProvince.value)) {
        targetProvince.value = provinceOptions.value[0].province;
      }
      handleProvinceChange(targetProvince.value);
    }
  } catch (err) {
    // handled by axios
  }
}

function handleProvinceChange(val) {
  const prov = provinceOptions.value.find((p) => p.province === val);
  if (prov && prov.branches?.length > 0) {
    targetBranchName.value = prov.branches[0].branchName;
    handleBranchChange(targetBranchName.value);
  } else {
    targetBranchName.value = '';
    targetCenterId.value = '';
    selectedFlourAgentId.value = '';
    selectedFoodAgentId.value = '';
  }
}

function handleBranchChange(val) {
  const branch = currentBranchList.value.find((b) => b.branchName === val);
  if (branch && branch.centers?.length > 0) {
    targetCenterId.value = branch.centers[0].centerId;
    handleCenterChange(targetCenterId.value);
  } else {
    targetCenterId.value = '';
    selectedFlourAgentId.value = '';
    selectedFoodAgentId.value = '';
  }
}

function handleCenterChange(val) {
  const center = currentCenterList.value.find((c) => c.centerId === val);
  if (center) {
    selectedFlourAgentId.value = center.flourAgents?.[0]?.id || '';
    selectedFoodAgentId.value = center.foodAgents?.[0]?.id || '';
  }
}

// 步骤切换与严格前置校验
function handlePrevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function handleNextStep() {
  if (currentStep.value === 1) {
    if (!targetBranchName.value || !targetCenterId.value) {
      ElMessage.warning(t('transfer.selectBranchAndCenter'));
      return;
    }
    if (!selectedFlourAgentId.value || !selectedFoodAgentId.value) {
      ElMessage.warning(t('transfer.selectBothAgents'));
      return;
    }
    const flourAg = currentSelectedFlourAgent.value;
    const foodAg = currentSelectedFoodAgent.value;
    if (flourAg?.currentHouseholds >= 1500) {
      ElMessage.error(t('transfer.agentCapacityFull', { name: flourAg.name }));
      return;
    }
    if (foodAg?.currentHouseholds >= 1500) {
      ElMessage.error(t('transfer.agentCapacityFull', { name: foodAg.name }));
      return;
    }
    currentStep.value = 2;
    return;
  }

  if (currentStep.value === 2) {
    if (!residenceForm.district || !residenceForm.subDistrict || !residenceForm.nearestLandmark) {
      ElMessage.warning(t('transfer.fillAddressFields'));
      return;
    }
    if (!residenceProofUploaded.value) {
      ElMessage.warning(t('transfer.uploadResidenceProof'));
      return;
    }
    currentStep.value = 3;
    return;
  }

  if (currentStep.value === 3) {
    if (requiresArticle140.value && !article140Uploaded.value) {
      ElMessage.warning(t('transfer.uploadArt140Doc'));
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
      fromProvince: currentFromProvince.value,
      toProvince: targetProvince.value,
      toBranch: targetBranchName.value,
      toCenter: selectedCenter.value,
      toFlourAgent: currentSelectedFlourAgent.value,
      toFoodAgent: currentSelectedFoodAgent.value,
      district: residenceForm.district,
      subDistrict: residenceForm.subDistrict,
      nearestLandmark: residenceForm.nearestLandmark,
      residenceProofDoc: isEn.value ? 'Residence_Confirmation_Certificate_2026.pdf' : '新居所官方确认公函_2026.pdf',
      article140Doc: requiresArticle140.value ? (isEn.value ? 'Article_140_No_Objection_Letter_2026.pdf' : '第140号决议无异议执行批文_2026.pdf') : '',
      paymentInfo
    };

    const res = await submitTransferAgent(payload);
    transferResult.value = res;
    currentStep.value = 5;

    // 跨标签页数据同步与广播：政府端工作台将实时收到该申办公文
    addSharedTicket({
      source: '申请代理转移',
      sourceCode: 'TRF',
      appType: `配给代理转移 (${payload.fromProvince} ➔ ${payload.toProvince})`,
      cardNo: payload.cardNo,
      applicantName: citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫',
      reason: `跨辖区住所变迁，申请自【${payload.fromProvince}】转移至【${payload.toProvince} · ${payload.toBranch}】接收代销网点。`,
      payload
    });

    await citizenStore.fetchFamilies();
    ElMessage.success(t('transfer.paySuccessMsg'));
  } catch (err) {
    // handled by axios interceptor
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.process-card-wrapper {
  --theme-color: #326445;
  --theme-color-rgb: 37, 99, 235;
}

/* 桌面端时间线样式 */
@media (min-width: 1024px) {
  .timeline-nodes-list {
    position: relative;
  }
  .timeline-connector-line {
    position: absolute;
    left: 15px;
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
    left: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    z-index: 20;
    pointer-events: none;
  }
  .timeline-nodes-list {
    position: absolute;
    left: 0;
    top: 56px;
    bottom: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .timeline-connector-line {
    position: absolute;
    left: 0;
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
    left: 0;
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
