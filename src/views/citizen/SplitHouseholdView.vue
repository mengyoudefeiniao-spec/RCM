<template>
  <div class="split-household-view space-y-4 sm:space-y-6">
    <SupplementMaterialsPanel />
    <div class="bg-white rounded-lg p-4 sm:p-6 border border-[#D9E5DB]/80 shadow-xs space-y-4 sm:space-y-6">
      <!-- 标题与业务说明 -->
      <div class="flex items-start sm:items-center justify-between gap-4 border-b border-[#E9F1EB] pb-4">
        <ModuleDescTip
          :title="$t('split.title')"
          :content="$t('split.subtitle')"
          badge-type="warning"
          title-class="text-base font-bold text-[#1B3123]"
        >
          <template #icon>
            <el-icon class="text-[#C9A13B] text-lg"><Share /></el-icon>
          </template>
        </ModuleDescTip>
        <el-button size="small" plain class="shrink-0" @click="handleGoBack">
          <el-icon class="rtl-mirror-icon me-1"><Back /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 当前家庭配给卡存根概览 -->
      <div v-if="citizenStore.currentFamily" class="p-4 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] grid gap-3 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-4'">
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('split.currentCardNo') }}</span>
          <span class="font-mono font-bold text-[#7A5F21]">{{ citizenStore.currentFamily.rationCardNo }}</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('split.legalHeadName') }}</span>
          <span class="font-bold text-[#1F3326]">{{ citizenStore.currentFamily.headName }} ({{ citizenStore.currentFamily.memberCount }} {{ $t('common.person') }})</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('split.provinceDistrict') }}</span>
          <span class="font-medium text-[#1F3326]">{{ citizenStore.currentFamily.province }} · {{ citizenStore.currentFamily.district }}</span>
        </div>
        <div>
          <span class="text-[#8A9A8F] block text-[11px]">{{ $t('split.contractedAgent') }}</span>
          <span class="font-medium text-[#7A5F21] truncate block">{{ citizenStore.currentFamily.agentName }}</span>
        </div>
      </div>

      <!-- 流程与表单联动容器：包含左侧流程节点时间线与右侧自适应业务内容 -->
      <div class="process-card-wrapper relative bg-white rounded-lg border border-[#D9E5DB] overflow-hidden shadow-xs">
        <div class="flex items-stretch" :class="isAppMode ? 'flex-col' : 'flex-col lg:flex-row'">
          
          <!-- 左侧时间线节点 (移动端收入左侧边框仅露半圆，桌面端为标准流程侧栏) -->
          <div v-if="!isAppMode" class="timeline-rail-aside lg:w-72 xl:w-80 lg:shrink-0 lg:bg-[#F3F8F4]/80 lg:border-e border-[#D9E5DB] lg:p-6 p-0">
            <!-- 桌面端侧边栏标题 -->
            <div class="items-center justify-between pb-4 mb-5 border-b border-[#D9E5DB]" :class="isAppMode ? 'hidden' : 'hidden lg:flex'">
              <span class="text-xs font-bold text-[#1F3326] flex items-center gap-1.5">
                <el-icon class="text-[#C9A13B]"><Guide /></el-icon>
                <span>{{ cleanSplitTitle }}</span>
              </span>
              <span class="text-[11px] font-mono text-[#7A5F21] bg-[#FDF3E0] px-2 py-0.5 rounded border border-[#F2E3C6] font-semibold">
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
                <!-- 节点圆圈图标 (移动端收入左边框仅露半圆，当前步骤放大并着色) -->
                <div class="node-icon-wrapper">
                  <el-icon v-if="s.step < currentStep" class="text-xs"><Check /></el-icon>
                  <span v-else class="font-bold text-xs">{{ s.step }}</span>
                </div>

                <!-- 节点文本 (仅桌面端显示) -->
                <div class="node-text-wrapper" :class="isAppMode ? 'hidden' : 'hidden lg:block'">
                  <div class="node-title font-bold text-xs" :class="s.step === currentStep ? 'text-[#C9A13B]' : s.step < currentStep ? 'text-[#43554B]' : 'text-[#8A9A8F]'">
                    {{ s.name }}
                  </div>
                  <div class="node-desc text-[11px] text-[#8A9A8F] mt-0.5">
                    {{ s.desc }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧主操作区 (根据页面自适应延展优化，移动端留出左侧内边距避免遮挡半节点) -->
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
                <span class="w-2 h-2 rounded-full bg-[#C9A13B]"></span>
                <span>{{ $t('common.stepNumber', { step: currentStep }) }}：{{ processSteps[currentStep - 1]?.name }}</span>
              </span>
              <span class="font-mono text-[#8A9A8F] text-[11px]">{{ $t('common.progress', { current: currentStep, total: 5 }) }}</span>
            </div>
          <!-- ======================================================== -->
          <!-- 步骤 1: 勾选移入新卡成员 -->
          <!-- ======================================================== -->
          <div v-show="currentStep === 1" class="space-y-4 animate-fade-in">
            <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
              <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#FDF3E0] text-[#C9A13B] text-xs flex items-center justify-center font-bold">1</span>
                <span>{{ $t('split.selectMembersTitle') }}</span>
              </label>
              <span class="text-xs text-[#C9A13B] font-bold font-mono">
                {{ $t('split.selectedCount', { count: selectedMemberIds.length }) }}
              </span>
            </div>

            <div class="grid gap-3" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'">
              <div
                v-for="m in currentMembers"
                :key="m.id"
                class="p-3.5 rounded-lg border cursor-pointer text-xs flex items-center justify-between transition-all"
                :class="
                  selectedMemberIds.includes(m.id)
                    ? 'border-[#D3AF62] bg-[#FDF3E0]/50 text-[#5A4718] shadow-xs'
                    : 'border-[#D9E5DB] hover:border-[#C9DBCE] bg-[#F3F8F4]/50 text-[#43554B]'
                "
                @click="toggleMember(m.id)"
              >
                <div>
                  <div class="font-bold flex items-center gap-1.5">
                    <span>{{ m.name }}</span>
                    <el-tag size="small" type="purple" effect="plain" class="scale-90 origin-left rtl:origin-right">
                      {{ m.relation }}
                    </el-tag>
                  </div>
                  <div class="text-[11px] text-[#8A9A8F] font-mono mt-0.5">
                    {{ m.gender }} · NID: {{ m.nationalId }}
                  </div>
                </div>
                <el-checkbox
                  :model-value="selectedMemberIds.includes(m.id)"
                  @click.stop
                  @change="toggleMember(m.id)"
                />
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 步骤 2: 两份材料各自独立上传 (必需与可选分离) -->
          <!-- ======================================================== -->
          <div v-show="currentStep === 2" class="space-y-4 animate-fade-in">
            <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
              <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#FDF3E0] text-[#C9A13B] text-xs flex items-center justify-center font-bold">2</span>
                <span>上传分户法定证明文件 (支持两份材料各自独立上传)</span>
              </label>
              <span class="text-xs text-[#C04442]">* 为法定必需材料</span>
            </div>

            <div class="grid gap-4" :class="isAppMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'">
              <!-- 材料一：结婚证明或同等效力公文 (必需 ★) -->
              <div class="p-4 rounded-lg border border-[#F2E3C6] bg-[#FDF3E0]/20 space-y-2">
                <DocumentUploader
                  v-model="marriageCertUploaded"
                  title="1. 结婚证明或同等效力公文"
                  subtitle="民政婚姻登记证书或最高司法委员会法院判决文书（系统自动判别夫妻合法关系的核心依据）"
                  category-badge="民政结婚证书 / 司法判决书"
                  issuer="伊拉克最高司法委员会 · 卡尔赫民事法庭"
                  default-file-name="最高司法委员会_民事结婚证书与分立公函_MC-2026-BAG-09921.pdf"
                  default-ref-no="MC-2026-BAG-09921"
                  ocr-summary="已识别民政婚姻公证印鉴，配偶身份核验属实，符合婚姻分户立卡规定"
                  :is-required="true"
                />
              </div>

              <!-- 材料二：其他辅助证明文件 (可选) -->
              <div class="p-4 rounded-lg border border-[#D9E5DB] bg-[#F3F8F4]/40 space-y-2">
                <DocumentUploader
                  v-model="otherDocUploaded"
                  title="2. 其他辅助证明文件"
                  subtitle="如独立常住住宅产权证/房屋租赁合同、独立水电气户头单据或社区常住网格证明（可选提交）"
                  category-badge="住所产权 / 租赁合同 / 补充公文"
                  issuer="地方市政规划委员会 & 房屋所有权登记局"
                  default-file-name="市政规划委员会_独立常住住宅不动产权公证书与租约_ADD-2026-7810.pdf"
                  default-ref-no="ADD-DOC-2026-7810"
                  ocr-summary="已识别房屋租赁合同及独立网格电费编号，具备独立常住生活居住条件"
                  :is-required="false"
                />
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 步骤 3: 智能判别与流转路径 -->
          <!-- ======================================================== -->
          <div v-show="currentStep === 3" class="space-y-4 animate-fade-in">
            <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
              <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#FDF3E0] text-[#C9A13B] text-xs flex items-center justify-center font-bold">3</span>
                <span>分立合规研判与业务流转路径</span>
              </label>
              <el-tag type="purple" size="small" effect="dark">优先智能判别</el-tag>
            </div>

            <div class="p-4 rounded-lg border border-[#F2E3C6] bg-[#FDF3E0]/40 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-[#5A4718] text-sm flex items-center gap-1.5">
                  <el-icon><Compass /></el-icon>
                  <span>预审合规匹配状态</span>
                </span>
                <el-tag type="success" size="small">就绪 ✓</el-tag>
              </div>

              <div class="grid gap-3 text-[#58685D]" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'">
                <div>拟分出成员数：<span class="font-bold text-[#7A5F21]">{{ selectedMemberIds.length }} 人</span></div>
                <div>婚姻关系材料：<span class="font-bold text-[#2F7A50]">已上传验证 ✓</span></div>
                <div>独立居住证明：<span class="text-[#58685D]">{{ otherDocUploaded ? '已附辅助公文 ✓' : '免交 / 依户主住所' }}</span></div>
              </div>

              <p class="text-[#6B5321] leading-relaxed border-t border-[#F2E3C6]/60 pt-2 text-[11px]">
                ● <strong>业务流转规则</strong>：提交支付后，系统将优先进行规则库自动比对。如夫妻双方婚姻合法存续且无名下其他活动配给卡，将<strong>全自动审批通过并签发新卡</strong>；如不满足自动标准，将自动转入分部两级人工复核。
              </p>
            </div>

            <!-- 选中的成员名单标签展示 -->
            <div class="p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB] space-y-1.5 text-xs">
              <span class="font-medium text-[#43554B] block text-[11px]">拟分入独立新户的成员清单：</span>
              <div class="flex flex-wrap gap-1.5">
                <el-tag
                  v-for="m in selectedMembers"
                  :key="m.id"
                  type="info"
                  size="small"
                >
                  {{ m.name }} ({{ m.relation }})
                </el-tag>
              </div>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 步骤 4: 规费核算与电子支付 -->
          <!-- ======================================================== -->
          <div v-show="currentStep === 4" class="space-y-5 animate-fade-in">
            <div class="flex items-center justify-between pb-2 border-b border-[#E9F1EB]">
              <label class="text-sm font-bold text-[#1F3326] flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#FDF3E0] text-[#C9A13B] text-xs flex items-center justify-center font-bold">4</span>
                <span>核对申请摘要并完成电子支付</span>
              </label>
              <el-tag type="purple" effect="dark">规费 10,000 IQD</el-tag>
            </div>

            <!-- 摘要核对卡片 -->
            <div class="bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-4 grid gap-4 text-xs" :class="isAppMode ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'">
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">原配给卡号：</span>
                <span class="font-mono font-bold text-[#1F3326]">{{ citizenStore.currentFamily?.rationCardNo }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">原法定户主：</span>
                <span class="font-bold text-[#1F3326]">{{ citizenStore.currentFamily?.headName }}</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">分出成员人口：</span>
                <span class="font-bold text-[#7A5F21]">{{ selectedMemberIds.length }} 人</span>
              </div>
              <div>
                <span class="text-[#8A9A8F] block text-[11px]">分立规费标准：</span>
                <span class="font-mono font-bold text-[#2F7A50]">10,000 IQD</span>
              </div>
            </div>

            <!-- 规费提示 -->
            <div class="p-4 bg-[#1B3123] text-white rounded-lg flex flex-col justify-between gap-4" :class="isAppMode ? '' : 'sm:flex-row sm:items-center'">
              <div class="space-y-1">
                <div class="text-xs text-[#8A9A8F]">数字配给卡家庭分立分户与独立建卡行政规费：</div>
                <div class="text-2xl font-bold font-mono text-[#6FBF92]">
                  10,000 IQD <span class="text-xs text-[#8A9A8F] font-normal">(伊拉克第纳尔)</span>
                </div>
                <div class="text-[11px] text-[#8A9A8F]">
                  支持 Qi Card、ZainCash、Switch 在线支付 (密码 / 指纹 / 刷脸)
                </div>
              </div>
              <div>
                <el-tag type="success" effect="dark" size="small">
                  规费核定就绪 ✓
                </el-tag>
              </div>
            </div>

            <!-- 引导在线支付卡片 -->
            <div class="p-6 bg-[#FDF3E0]/50 border border-[#F2E3C6] rounded-lg text-center space-y-3">
              <div class="w-12 h-12 rounded-lg bg-[#FDF3E0] text-[#C9A13B] flex items-center justify-center mx-auto">
                <el-icon :size="24"><CreditCard /></el-icon>
              </div>
              <div>
                <h4 class="text-sm font-bold text-[#1B3123]">最后一步：进行在线支付并执行申报</h4>
                <p class="text-xs text-[#58685D] mt-1">
                  点击下方按钮将打开在线收银台，支持输入密码、感应指纹或刷脸免密支付，付款完成后系统将即刻启动智能判别与流转
                </p>
              </div>
              <el-button
                type="primary"
                size="large"
                class="px-8 font-bold shadow-md bg-[#C9A13B] border-[#C9A13B] hover:bg-[#D3AF62]"
                :loading="judging"
                @click="handleStartSplitPayment"
              >
                <el-icon class="me-1.5"><CreditCard /></el-icon>
                打开在线收银台并完成支付
              </el-button>
            </div>
          </div>

          <!-- ======================================================== -->
          <!-- 步骤 5: 受理办结与建卡流转凭据 -->
          <!-- ======================================================== -->
          <div v-show="currentStep === 5" class="space-y-6 animate-fade-in text-center py-6">
            <div
              class="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
              :class="splitResult?.passed ? 'bg-[#E1F4E4] text-[#2F7A50]' : 'bg-[#FDF3E0] text-[#C9A13B]'"
            >
              <el-icon :size="36">
                <CircleCheckFilled v-if="splitResult?.passed" />
                <WarningFilled v-else />
              </el-icon>
            </div>

            <div class="space-y-2">
              <h3 class="text-lg font-bold text-[#1B3123]">
                {{ splitResult?.passed ? '家庭分立分户已全自动核准生效！' : '系统自动判别未通过，已转入分部电子审核' }}
              </h3>
              <p class="text-xs text-[#58685D] max-w-lg mx-auto">
                {{ splitResult?.passed ? (splitResult?.message || '已成功为分出成员设立全新独立电子配给卡，配给定额已自动剥离独立。') : splitResult?.reason }}
              </p>
            </div>

            <!-- 凭证卡片 -->
            <div class="max-w-xl mx-auto bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-5 text-start space-y-3 text-xs">
              <div class="flex items-center justify-between border-b border-[#D9E5DB]/80 pb-2">
                <span class="font-bold text-[#1F3326]">分立建卡存根凭证</span>
                <el-tag :type="splitResult?.passed ? 'success' : 'warning'" size="small">
                  {{ splitResult?.passed ? '自动建卡生效' : '分部审核受理' }}
                </el-tag>
              </div>
              <div class="grid grid-cols-2 gap-3 text-[#58685D]">
                <div>业务流水单号：<span class="font-mono font-bold text-[#1F3326]">{{ splitResult?.ticketId || 'SPLIT-2026-BAG-0182' }}</span></div>
                <div>新独立配给卡号：<span class="font-mono font-bold text-[#7A5F21]">{{ splitResult?.newCardNo || 'RC-10029399' }}</span></div>
                <div>原家庭配给卡：<span class="font-mono text-[#43554B]">{{ citizenStore.currentFamily?.rationCardNo }}</span></div>
                <div>分立成员人数：<span class="font-bold text-[#1F3326]">{{ selectedMemberIds.length }} 人</span></div>
                <div>分立公文规费：<span class="font-mono text-[#2F7A50] font-bold">10,000 IQD (已实缴)</span></div>
                <div>办理处理模式：<span class="font-bold" :class="splitResult?.passed ? 'text-[#2F7A50]' : 'text-[#C9A13B]'">{{ splitResult?.passed ? '优先智能自动核准' : '分部两级人工复核' }}</span></div>
              </div>
            </div>

            <div class="flex items-center justify-center gap-3 pt-2">
              <template v-if="splitResult?.passed">
                <el-button type="primary" size="large" class="px-8 font-bold bg-[#C9A13B] border-[#C9A13B] hover:bg-[#D3AF62]" @click="handleGoBack">
                  返回我的家庭配给卡
                </el-button>
              </template>
              <template v-else>
                <el-button
                  type="warning"
                  size="large"
                  class="font-bold"
                  :loading="reviewSubmitting"
                  @click="handleTransferToElectronicReview"
                >
                  <el-icon class="me-1.5"><Stamp /></el-icon>
                  转入分部电子审核 (提交分部门人员手动复核)
                </el-button>
                <el-button size="large" @click="currentStep = 1">
                  重新调整成员
                </el-button>
              </template>
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
                :disabled="currentStep === 1 && selectedMemberIds.length === 0"
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

  <!-- 电子支付二维码收银台 -->
  <ElectronicPaymentDialog
    v-model="paymentDialogVisible"
    title="数字配给卡家庭分立分户与独立建卡规费"
    :amount="10000"
    currency="IQD"
    :business-no="citizenStore.currentFamily?.rationCardNo"
    :applicant-name="citizenStore.currentFamily?.headName"
    @success="handlePaymentSuccess"
  />
</div>
</template>

<script setup>
import { isEnNow } from '../../utils/langHint.js';
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCitizenStore } from '../../stores/citizen.js';
import { addSharedTicket } from '../../utils/sharedSession.js';
import DocumentUploader from '../../components/common/DocumentUploader.vue';
import SupplementMaterialsPanel from '../../components/citizen/SupplementMaterialsPanel.vue';
import ElectronicPaymentDialog from '../../components/common/ElectronicPaymentDialog.vue';
import ModuleDescTip from '../../components/common/ModuleDescTip.vue';
import {
  Share,
  Compass,
  Document,
  WarningFilled,
  CircleCheckFilled,
  Stamp,
  Back,
  Right,
  CreditCard,
  Cellphone,
  Guide,
  Check
} from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

const { t } = useI18n();
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

// 纯模块主标题（剔除括号内容）
const cleanSplitTitle = computed(() => {
  return t('split.title').replace(/\s*[\(（].*?[\)）]/g, '').trim();
});

// 流程节点定义 (响应式多语言适配)
const processSteps = computed(() => [
  { step: 1, name: t('split.step1Name'), desc: t('split.step1Desc') },
  { step: 2, name: t('split.step2Name'), desc: t('split.step2Desc') },
  { step: 3, name: t('split.step3Name'), desc: t('split.step3Desc') },
  { step: 4, name: t('split.step4Name'), desc: t('split.step4Desc') },
  { step: 5, name: t('split.step5Name'), desc: t('split.step5Desc') },
]);

// 步骤状态 (1-5 步)
const currentStep = ref(1);

const selectedMemberIds = ref([]);
const marriageCertUploaded = ref(true);
const otherDocUploaded = ref(false);

const splitResult = ref(null);
const judging = ref(false);
const reviewSubmitting = ref(false);
const paymentDialogVisible = ref(false);

const handleLangChanged = async () => {
  await citizenStore.fetchFamilies();
};

onMounted(async () => {
  if (!citizenStore.currentFamily) {
    await citizenStore.fetchFamilies();
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('rcm-language-changed', handleLangChanged);
  }
});

const currentMembers = computed(() => {
  return citizenStore.currentFamily?.members || [];
});

const selectedMembers = computed(() => {
  return currentMembers.value.filter((m) => selectedMemberIds.value.includes(m.id));
});

function toggleMember(memberId) {
  splitResult.value = null;
  if (selectedMemberIds.value.includes(memberId)) {
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => id !== memberId);
  } else {
    selectedMemberIds.value.push(memberId);
  }
}

function handlePrevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function handleNextStep() {
  if (currentStep.value === 1) {
    if (selectedMemberIds.value.length === 0) {
      ElMessage.warning((isEnNow() ? 'Please select family members to move into the new independent household!' : '请勾选移入独立新户的家庭成员！'));
      return;
    }
    currentStep.value = 2;
    return;
  }
  if (currentStep.value === 2) {
    if (!marriageCertUploaded.value) {
      ElMessage.warning((isEnNow() ? 'A marriage certificate or equivalent official document is legally required; please upload it and retry!' : '结婚证明或同等效力公文为法定必需材料，请上传后重试！'));
      return;
    }
    currentStep.value = 3;
    return;
  }
  if (currentStep.value === 3) {
    currentStep.value = 4;
  }
}

/**
 * 1. 验证资料信息通过后，唤起电子支付二维码收银台
 */
function handleStartSplitPayment() {
  if (selectedMemberIds.value.length === 0) {
    ElMessage.error((isEnNow() ? 'Please select family members to move into the new household!' : '请勾选移入新户的家庭成员！'));
    return;
  }

  if (!marriageCertUploaded.value) {
    ElMessage.error((isEnNow() ? 'A marriage certificate or equivalent document is required; please upload it and retry!' : '结婚证明或同等效力公文为必需材料，请上传后重试！'));
    return;
  }

  paymentDialogVisible.value = true;
}

/**
 * 2. 扫码付款通过后，正式执行优先系统智能判别
 */
async function handlePaymentSuccess(paymentInfo) {
  judging.value = true;
  try {
    const res = await citizenStore.judgeSplitHousehold({
      memberIds: selectedMemberIds.value,
      currentCardNo: citizenStore.currentFamily?.rationCardNo,
      paymentInfo
    });

    splitResult.value = res;
    currentStep.value = 5;
    if (res.passed) {
      addSharedTicket({
        sourceCode: 'SPL',
        applicationStatus: 'approved',
        reviewMode: 'automatic',
        applicationResult: res.message || '',
        source: '申请分户',
        appType: '公民分户申请',
        cardNo: citizenStore.currentFamily?.rationCardNo || 'RC-10029381',
        applicantName: citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫 (户主)',
        targetMemberName: `${selectedMemberIds.value.length} 名家庭成员`,
        reason: res.reason || '提交家庭分户申请',
        payload: { memberIds: selectedMemberIds.value, newCardNo: res.newCardNo || '' }
      });
    }
    await citizenStore.fetchFamilies();

    if (res.passed) {
      ElMessage.success(res.message || (isEnNow() ? 'Household split succeeded; a new card has been issued for you!' : '分户成功，已为您签发新卡！'));
    } else {
      ElMessage.warning((isEnNow() ? 'Automatic judge failed; the branch electronic review entrance has been opened for you' : '系统自动判别未通过，已为您开启分部电子审核入口'));
    }
  } finally {
    judging.value = false;
  }
}

/**
 * 判别失败，转入分部电子审核
 */
async function handleTransferToElectronicReview() {
  reviewSubmitting.value = true;
  try {
    const res = await citizenStore.submitSplitReview({
      currentCardNo: citizenStore.currentFamily?.rationCardNo,
      memberIds: selectedMemberIds.value,
      reason: splitResult.value?.reason || '系统自动判别未通过，转交分部门人员手动审核'
    });

    // 跨标签页共享与广播新公文
    addSharedTicket({
      id: res.ticketId,
      sourceCode: 'SPL',
      reviewMode: 'manual',
      source: '分户申请公文',
      categoryType: '分户与配给卡拆分',
      appType: '公民分户申请',
      cardNo: citizenStore.currentFamily?.rationCardNo || 'RC-10029381',
      applicantName: citizenStore.currentFamily?.headName || '艾哈迈德·哈桑·萨利赫 (户主)',
      reason: `拟分出成员 ${selectedMemberIds.value.length} 人，转交分部两级人工审核。`,
      attachments: [
        { name: '结婚证明与分户申请文件_SPL-2026.pdf', type: 'required', verified: true }
      ]
    });

    ElMessage.success((isEnNow() ? 'Routed to the target branch two-tier electronic audit workbench' : '已转入目标分部两级电子审核工作台'));
    handleGoBack();
  } finally {
    reviewSubmitting.value = false;
  }
}
</script>

<style scoped>
.process-card-wrapper {
  --theme-color: #B8934A;
  --theme-color-rgb: 124, 58, 237;
}

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

.timeline-nodes-list {
  position: relative;
}

/* 桌面端时间线样式 */
@media (min-width: 1024px) {
  .timeline-connector-line {
    position: absolute;
    inset-inline-start: 14px;
    top: 14px;
    bottom: 24px;
    width: 2px;
    background-color: #D9E5DB;
    z-index: 1;
  }
  .timeline-node-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    position: relative;
    padding-bottom: 24px;
    z-index: 2;
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

/* 移动端时间线样式：半收入左侧边框，仅露半圆，当前节点放大并颜色区分 */
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
  /* 半收入左侧边框：中心位于 inset-inline-start: 0，左半部分被左边框截断收入，仅露右半圆 */
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
  /* 当前活动节点放大、标记颜色区分、突出显示 */
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
