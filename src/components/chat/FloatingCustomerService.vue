<template>
  <div v-if="route.path !== '/portal'" class="rcm-customer-service-root font-sans">
    <!-- 1. 悬浮触发球 (Floating Action Button) - APP模式下严格放在 412px 手机视口区域内 -->
    <transition name="pop">
      <div
        v-if="!isOpen"
        class="fixed z-50 flex items-center group cursor-pointer select-none transition-all duration-300"
        :class="[
          isAppMode
            ? 'opacity-90 hover:opacity-100 active:scale-95'
            : 'right-3.5 bottom-20 sm:right-6 sm:bottom-6'
        ]"
        :style="isAppMode ? fabAppStyle : undefined"
        @click="openChatWindow"
      >
        <!-- 悬浮提示气泡 (仅宽屏桌面模式显示，APP模式下隐藏避免横向遮挡) -->
        <div
          v-if="!isAppMode"
          class="hidden sm:flex items-center mr-3 px-3.5 py-1.5 rounded-full bg-white text-[#326445] text-xs font-medium shadow-[0_3px_18px_-6px_rgba(58,77,62,0.18)] backdrop-blur-md border border-[#E5CEA1] transform translate-x-2 group-hover:translate-x-0 transition-all duration-300"
        >
          <span class="inline-block w-2 h-2 rounded-full bg-[#D3AF62] mr-2 animate-pulse"></span>
          <span>{{ $t('chat.fabTitle') }}</span>
        </div>

        <!-- 悬浮球体主体 (深墨绿+暖砂金高端政务质感) -->
        <button
          type="button"
          class="relative rounded-full bg-white text-[#326445] flex items-center justify-center transition-all duration-300"
          :class="[
            isAppMode
              ? 'w-9.5 h-9.5 shadow-md border border-[#D3AF62]/50 ring-1 ring-[#D3AF62]/20 active:scale-90'
              : 'w-10 h-10 sm:w-13 sm:h-13 shadow-xl hover:scale-105 active:scale-95 border-2 border-[#D3AF62]/50 ring-2 sm:ring-4 ring-[#D3AF62]/20'
          ]"
          :title="$t('chat.fabTooltip')"
        >
          <el-icon :class="isAppMode ? 'text-base text-[#326445]' : 'text-lg sm:text-xl text-[#326445] drop-shadow-xs'">
            <ChatDotRound />
          </el-icon>

          <!-- 在线状态角标 (APP模式下等比微型化) -->
          <span
            class="absolute flex"
            :class="isAppMode ? '-top-0.5 -right-0.5 h-2.5 w-2.5' : '-top-1 -right-1 h-3.5 w-3.5'"
          >
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D3AF62] opacity-75"></span>
            <span
              class="relative inline-flex rounded-full bg-[#2F7A50] border border-white text-white font-bold items-center justify-center"
              :class="isAppMode ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5 text-[8px]'"
            >
              <span v-if="!isAppMode" class="scale-75">●</span>
            </span>
          </span>
        </button>
      </div>
    </transition>

    <!-- 2. 对话主窗口 (Floating Chat Window) - APP模式下严格居中限制在视口区域内部 -->
    <transition name="chat-window">
      <div
        v-if="isOpen"
        class="fixed z-50 flex flex-col bg-white shadow-2xl rounded-lg overflow-hidden border border-[#E5CEA1] backdrop-blur-md transition-all duration-300"
        :class="[
          isExpanded
            ? 'right-2 bottom-2 sm:right-4 sm:bottom-4 w-[calc(100vw-16px)] sm:w-[740px] h-[90vh] sm:h-[88vh] max-h-[820px]'
            : (isAppMode
                ? 'h-[72vh]'
                : 'right-2 bottom-2 sm:right-4 sm:bottom-4 w-[calc(100vw-16px)] sm:w-[480px] h-[86vh] sm:h-[84vh] max-h-[720px]')
        ]"
        :style="isAppMode ? chatWindowAppStyle : undefined"
      >
        <!-- 2.1 顶部栏 (Header) - 与主系统统一的浅色卡头：白底 + 砂金下描边 -->
        <header
          class="px-2.5 sm:px-4 py-3 bg-white text-[#1F3326] flex items-center justify-between gap-1.5 sm:gap-2 border-b border-[#E5CEA1] select-none shadow-[0_3px_18px_-6px_rgba(58,77,62,0.12)] min-w-0"
        >
          <!-- 左侧：头像与客服状态 (允许收缩，长标题/英文模式下截断省略) -->
          <div class="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div class="relative shrink-0">
              <div
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold shadow-inner"
                :class="serviceMode === 'HUMAN' ? 'bg-[#E2F4E4] text-[#326445] border border-[#C7DED0]' : 'bg-[#FDF3E0] text-[#7A5F21] border border-[#E5CEA1]'"
              >
                <el-icon class="text-xl">
                  <Headset v-if="serviceMode === 'HUMAN'" />
                  <ChatDotRound v-else />
                </el-icon>
              </div>
              <span
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                :class="serviceMode === 'HUMAN' ? 'bg-[#DFC08B]' : 'bg-[#D3AF62] animate-pulse'"
              ></span>
            </div>

            <div class="leading-tight min-w-0">
              <div class="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
                <span class="font-semibold text-sm text-[#1F3326] tracking-wide truncate min-w-0">
                  {{ serviceMode === 'HUMAN' ? $t('chat.headerHumanTitle') : $t('chat.headerTitle') }}
                </span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border"
                  :class="serviceMode === 'HUMAN' ? 'bg-[#FDF3E0] text-[#7A5F21] border-[#E5CEA1]' : 'bg-[#E1F4E4] text-[#2F7A50] border-[#C7DED0]'"
                >
                  ● {{ serviceMode === 'HUMAN' ? $t('chat.headerHumanConnected') : $t('chat.online') }}
                </span>
              </div>
              <p class="text-[11px] text-[#58685D] mt-0.5 truncate max-w-[150px] sm:max-w-[200px]">
                {{ serviceMode === 'HUMAN' ? (activeHumanAgent?.department || 'Ministry of Trade Care') : $t('chat.headerSubtitle') }}
              </p>
            </div>
          </div>

          <!-- 右侧：核心动作（转人工/切回）与窗口控制按钮 (固定不收缩，保证X始终可见可点) -->
          <div class="flex items-center space-x-1 sm:space-x-2 text-[#58685D] shrink-0">
            <!-- 模式切换按钮 (醒目独立胶囊；小屏仅显示图标避免挤压关闭键) -->
            <button
              v-if="serviceMode === 'AI'"
              type="button"
              class="px-2 sm:px-2.5 py-1.5 bg-[#FDF3E0] hover:bg-[#F2E3C6] text-[#7A5F21] border border-[#E5CEA1] rounded-lg text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
              :title="$t('chat.transferHuman')"
              @click="triggerHumanHandoff('USER_HEADER_CLICK')"
            >
              <el-icon><Headset /></el-icon>
              <span class="hidden md:inline">{{ $t('chat.transferHuman') }}</span>
            </button>
            <button
              v-else
              type="button"
              class="px-2 sm:px-2.5 py-1.5 bg-[#E2F4E4] hover:bg-[#C7E0CE] text-[#326445] border border-[#C7DED0] rounded-lg text-xs font-medium transition flex items-center space-x-1 cursor-pointer"
              :title="$t('chat.switchAi')"
              @click="switchToAiMode"
            >
              <el-icon><ChatDotRound /></el-icon>
              <span class="hidden md:inline">{{ $t('chat.switchAi') }}</span>
            </button>

            <!-- 清空历史记录 -->
            <button
              type="button"
              class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center hover:bg-[#F3F8F4] text-[#58685D] hover:text-[#326445] transition cursor-pointer"
              :title="$t('chat.clearHistory')"
              @click="clearHistoryConfirm"
            >
              <el-icon class="text-base"><RefreshRight /></el-icon>
            </button>

            <!-- 窗口大小缩放 (大屏显示) -->
            <button
              type="button"
              class="w-8 h-8 rounded-lg shrink-0 items-center justify-center hover:bg-[#F3F8F4] text-[#58685D] hover:text-[#326445] transition hidden sm:flex cursor-pointer"
              :title="isExpanded ? $t('chat.restoreWindow') : $t('chat.expandWindow')"
              @click="isExpanded = !isExpanded"
            >
              <el-icon class="text-base"><FullScreen /></el-icon>
            </button>

            <!-- 关闭/最小化窗口 -->
            <button
              type="button"
              class="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center hover:bg-[#FBEAE9] text-[#58685D] hover:text-[#C04442] transition cursor-pointer"
              :title="$t('chat.closeWindow')"
              @click="closeWindow"
            >
              <el-icon class="text-base"><Close /></el-icon>
            </button>
          </div>
        </header>

        <!-- 2.2 消息对话滚动视窗 -->
        <div
          ref="messagesContainerRef"
          class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#F8FBF8]"
        >
          <!-- 欢迎卡片与热门业务推荐 (深墨绿+暖砂金高质感) -->
          <div class="p-4 rounded-lg bg-white border border-[#D9E5DB] shadow-xs space-y-3">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 rounded-lg bg-[#326445] text-[#D3AF62] border border-[#D3AF62]/30 flex items-center justify-center shrink-0 shadow-xs">
                <el-icon class="text-base"><ChatDotRound /></el-icon>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-[#1F3326] text-xs sm:text-sm">
                  {{ $t('chat.welcomeTitle') }}
                </h4>
                <p class="text-xs text-[#58685D] mt-1 leading-relaxed">
                  {{ $t('chat.welcomeDesc') }}
                </p>
              </div>
            </div>

            <!-- 热门业务常见问题快捷标签 (跟随系统语言动态切换) -->
            <div class="pt-2 border-t border-[#E9F1EB]">
              <span class="text-xs font-semibold text-[#1F3326] block mb-2">
                {{ $t('chat.faqTitle') }}
              </span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(item, idx) in currentPrompts"
                  :key="idx"
                  type="button"
                  class="px-3 py-1.5 bg-[#F3F8F4] hover:bg-[#FDF3E0] hover:text-[#326445] hover:border-[#D3AF62] text-[#58685D] border border-[#D9E5DB] rounded-lg text-xs transition duration-150 cursor-pointer text-left"
                  @click="handleQuickQuestion(item.question)"
                >
                  <span class="text-[#D3AF62] mr-1 font-bold">#{{ item.tag }}</span>
                  <span>{{ item.question }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 消息流列表 -->
          <div
            v-for="(msg, index) in messages"
            :key="msg.id || index"
            class="space-y-2"
          >
            <!-- 1. 用户提问消息 (深墨绿高奢渐变气泡) -->
            <div
              v-if="msg.role === 'user'"
              class="flex justify-end items-start space-x-2.5"
            >
              <div class="max-w-[82%] rounded-lg rounded-tr-xs bg-gradient-to-r from-[#326445] to-[#2F5B44] text-white px-4 py-2.5 shadow-xs text-[13px] leading-relaxed break-words">
                {{ msg.content }}
                <div class="text-[10px] text-[#C7DED0] text-right mt-1 font-mono">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>
              <div class="w-8 h-8 rounded-full bg-[#FDF3E0] text-[#326445] flex items-center justify-center shrink-0 font-bold text-xs border border-[#D3AF62]/30 shadow-2xs">
                {{ (currentUserContext.name || '我').slice(0, 1) }}
              </div>
            </div>

            <!-- 2. AI 助手回答消息 -->
            <div
              v-else-if="msg.role === 'assistant'"
              class="flex justify-start items-start space-x-2.5"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#326445] to-[#2F5B44] text-[#D3AF62] border border-[#D3AF62]/30 flex items-center justify-center shrink-0 shadow-xs text-sm">
                <el-icon><ChatDotRound /></el-icon>
              </div>

              <div class="max-w-[88%] space-y-2">
                <!-- AI 气泡主体 (干净排版) -->
                <div class="bg-white rounded-lg rounded-tl-xs p-4 border border-[#D9E5DB]/90 shadow-xs text-[13px] text-[#1F3326] space-y-3">
                  <!-- 正文回答 -->
                  <div class="leading-relaxed whitespace-pre-wrap break-words text-[#1F3326]">
                    {{ msg.content }}
                  </div>

                  <!-- 政策依据与出处展示 -->
                  <div
                    v-if="msg.sources && msg.sources.length > 0"
                    class="pt-3 border-t border-[#E9F1EB] space-y-2"
                  >
                    <div class="flex items-center text-xs font-semibold text-[#43554B]">
                      <el-icon class="text-[#326445] mr-1"><DocumentCopy /></el-icon>
                      <span>{{ $t('chat.sourcesTitle') }} ({{ msg.sources.length }}{{ $t('chat.items') }})：</span>
                    </div>

                    <!-- 出处卡片列表 (整洁大方) -->
                    <div class="space-y-1.5">
                      <div
                        v-for="source in msg.sources"
                        :key="source.id"
                        class="p-2.5 rounded-lg bg-[#F3F8F4] border border-[#D9E5DB]/80 hover:border-[#AECBB8] transition duration-150 flex flex-col space-y-1"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <span
                            class="font-medium text-xs text-[#1F3326] hover:underline cursor-pointer"
                            @click="viewSourceDetail(source)"
                          >
                            {{ source.title }}
                          </span>
                          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E1F4E4]/70 text-[#2A5440] shrink-0">
                            {{ source.score }}%
                          </span>
                        </div>
                        <div class="flex items-center justify-between text-[11px] text-[#58685D] pt-0.5">
                          <span class="truncate max-w-[260px]">
                            {{ source.docNumber }} · {{ source.clause }}
                          </span>
                          <button
                            type="button"
                            class="text-[#326445] hover:text-[#24483A] font-medium inline-flex items-center text-[11px] cursor-pointer"
                            @click="viewSourceDetail(source)"
                          >
                            <span>{{ $t('chat.viewClause') }}</span>
                            <el-icon class="ml-0.5"><Right /></el-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 追问建议 -->
                  <div
                    v-if="msg.suggestQuestions && msg.suggestQuestions.length > 0"
                    class="pt-2 border-t border-[#E9F1EB]"
                  >
                    <span class="text-xs text-[#58685D] block mb-1.5">💡 {{ $t('chat.suggestTitle') }}</span>
                    <div class="flex flex-wrap gap-1.5">
                      <button
                        v-for="(sq, sIdx) in msg.suggestQuestions"
                        :key="sIdx"
                        type="button"
                        class="px-2.5 py-1 bg-[#E9F1EB] hover:bg-[#EFF5F1] hover:text-[#2A5440] text-[#43554B] rounded-md text-xs transition cursor-pointer text-left"
                        @click="handleQuickQuestion(sq)"
                      >
                        {{ sq }}
                      </button>
                    </div>
                  </div>

                  <!-- 消息反馈与转人工动作栏 -->
                  <div class="flex items-center justify-between pt-2.5 border-t border-[#E9F1EB] text-xs text-[#58685D]">
                    <div class="flex items-center space-x-3">
                      <span class="text-[#8A9A8F]">{{ $t('chat.rateAnswer') }}</span>
                      <button
                        type="button"
                        class="hover:text-[#326445] transition flex items-center space-x-1 cursor-pointer"
                        :class="msg.feedback === 'like' ? 'text-[#326445] font-semibold' : ''"
                        @click="handleFeedback(msg, 'like')"
                        :title="$t('chat.helpful')"
                      >
                        <span>👍 {{ $t('chat.helpful') }}</span>
                      </button>
                      <button
                        type="button"
                        class="hover:text-[#C04442] transition flex items-center space-x-1 cursor-pointer"
                        :class="msg.feedback === 'dislike' ? 'text-[#C04442] font-semibold' : ''"
                        @click="handleFeedback(msg, 'dislike')"
                        :title="$t('chat.unhelpful')"
                      >
                        <span>👎 {{ $t('chat.unhelpful') }}</span>
                      </button>
                    </div>

                    <!-- 转人工快捷按钮 -->
                    <button
                      type="button"
                      class="text-[#C9A13B] hover:text-[#7A5F21] font-medium inline-flex items-center space-x-1 cursor-pointer"
                      @click="triggerHumanHandoff('MESSAGE_ACTION_CLICK', msg)"
                    >
                      <el-icon><Headset /></el-icon>
                      <span>{{ $t('chat.transferHumanBtn') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. 人工客服专员消息 -->
            <div
              v-else-if="msg.role === 'human_agent'"
              class="flex justify-start items-start space-x-2.5"
            >
              <div class="w-8 h-8 rounded-full overflow-hidden bg-[#D3AF62] text-white shrink-0 shadow-xs border border-[#E5CEA1]">
                <img
                  v-if="msg.agent?.avatar"
                  :src="msg.agent.avatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center font-bold text-xs">
                  CS
                </div>
              </div>

              <div class="max-w-[88%] space-y-1.5">
                <div class="flex items-center space-x-2 text-xs text-[#58685D]">
                  <span class="font-semibold text-[#1F3326]">{{ msg.agent?.name || 'Customer Agent' }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#FDF3E0] text-[#6B5321] font-mono">
                    {{ $t('chat.ticketNo') }}: {{ msg.agent?.badgeNo || 'CS-8092' }}
                  </span>
                  <span class="text-[10px] text-[#2F7A50] font-medium">● {{ $t('chat.online') }}</span>
                </div>

                <div class="bg-[#FDF3E0]/80 border border-[#F2E3C6]/80 rounded-lg rounded-tl-xs p-4 shadow-xs text-[13px] text-[#1F3326] leading-relaxed whitespace-pre-wrap break-words">
                  {{ msg.content }}
                  <div class="text-[10px] text-[#8A9A8F] text-right mt-1.5 font-mono">
                    {{ formatTime(msg.timestamp) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. 会话上下文同步完成提示卡片 -->
            <div
              v-else-if="msg.role === 'system'"
              class="my-2 p-3 rounded-lg bg-gradient-to-r from-[#FDF3E0] via-[#FDF3E0] to-[#FDF3E0] border border-[#F2E3C6]/90 text-center text-xs text-[#5A4718] space-y-1.5 shadow-2xs"
            >
              <div class="flex items-center justify-center space-x-1 font-semibold text-[#6B5321]">
                <el-icon class="text-[#C9A13B]"><CircleCheck /></el-icon>
                <span>{{ $t('chat.humanBanner') }}</span>
              </div>
              <p class="text-xs text-[#58685D]">
                {{ msg.content }}
              </p>
              <div v-if="msg.ticketNo" class="inline-block px-2.5 py-0.5 rounded bg-white text-[#43554B] font-mono text-[11px] border border-[#F2E3C6]">
                {{ $t('chat.ticketNo') }}: {{ msg.ticketNo }}
              </div>
            </div>
          </div>

          <!-- 加载中动效 (正在组织解答...) -->
          <div
            v-if="isThinking"
            class="flex items-center space-x-2.5 text-[#58685D] text-xs py-2"
          >
            <div class="w-8 h-8 rounded-lg bg-[#326445] text-white flex items-center justify-center shrink-0">
              <el-icon class="is-loading text-base"><Loading /></el-icon>
            </div>
            <div class="bg-white px-3.5 py-2 rounded-lg border border-[#D9E5DB] shadow-2xs flex items-center space-x-2">
              <span class="inline-block w-2 h-2 rounded-full bg-[#5C8A6B] animate-ping"></span>
              <span class="text-xs text-[#58685D]">
                {{ thinkingText }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2.3 人工客服模式下的状态操作条 -->
        <div
          v-if="serviceMode === 'HUMAN'"
          class="bg-[#FDF3E0]/90 px-4 py-2 border-t border-[#F2E3C6]/70 flex items-center justify-between text-xs"
        >
          <div class="flex items-center space-x-2 text-[#5A4718]">
            <span class="w-2 h-2 rounded-full bg-[#3E9B68] animate-pulse"></span>
            <span>{{ $t('chat.humanServing') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              class="px-2.5 py-1 bg-white hover:bg-[#E9F1EB] text-[#43554B] border border-[#C9DBCE] rounded-md text-xs transition cursor-pointer"
              @click="openSatisfactionDialog"
            >
              {{ $t('chat.serviceRating') }}
            </button>
            <button
              type="button"
              class="px-2.5 py-1 bg-[#C9A13B] hover:bg-[#7A5F21] text-white rounded-md text-xs font-medium transition cursor-pointer"
              @click="endHumanService"
            >
              {{ $t('chat.endHuman') }}
            </button>
          </div>
        </div>

        <!-- 2.4 底部输入区域 (一体化卡片，宽松舒展) -->
        <footer class="p-3.5 bg-white border-t border-[#D9E5DB]">
          <div class="relative bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg p-2.5 focus-within:border-[#D3AF62] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#D3AF62]/15 transition-all duration-200">
            <el-input
              ref="inputRef"
              v-model="inputQuery"
              type="textarea"
              :rows="2"
              resize="none"
              :placeholder="serviceMode === 'HUMAN' ? $t('chat.humanInputPlaceholder') : $t('chat.inputPlaceholder')"
              :disabled="isThinking"
              class="custom-chat-input"
              @keydown.enter.exact.prevent="handleSendMessage"
            />

            <!-- 输入框底部工具与操作栏 -->
            <div class="flex items-center justify-between pt-2 border-t border-[#D9E5DB]/60 mt-1">
              <div class="flex items-center space-x-3 text-[11px] text-[#8A9A8F]">
                <span>
                  {{ $t('chat.enterToSend') }}
                </span>
                <span
                  v-if="serviceMode === 'AI'"
                  class="text-[#D3AF62] hover:underline cursor-pointer hidden sm:inline font-medium"
                  @click="triggerHumanHandoff('USER_FOOTER_CLICK')"
                >
                  {{ $t('chat.needHumanTip') }}
                </span>
              </div>

              <!-- 发送按钮 (深墨绿主品牌按钮) -->
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg font-medium text-xs flex items-center space-x-1.5 text-white shadow-xs transition-all duration-200 cursor-pointer"
                :class="inputQuery.trim() && !isThinking
                  ? (serviceMode === 'HUMAN' ? 'bg-[#C9A13B] hover:bg-[#7A5F21] active:scale-95' : 'bg-[#326445] hover:bg-[#2A5440] active:scale-95')
                  : 'bg-[#C9DBCE] cursor-not-allowed'"
                :disabled="!inputQuery.trim() || isThinking"
                @click="handleSendMessage"
              >
                <span>{{ $t('chat.send') }}</span>
                <el-icon class="text-sm"><Position /></el-icon>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </transition>

    <!-- 3. 政策依据出处详情抽屉 (Source Detail Drawer) -->
    <el-drawer
      v-model="isSourceDrawerVisible"
      :title="$t('chat.drawerTitle')"
      direction="rtl"
      :size="isExpanded ? '540px' : '90%'"
      destroy-on-close
    >
      <div v-if="activeSourceChunk" class="space-y-4 text-xs text-[#43554B] p-1">
        <!-- 规章公文样式卡片 -->
        <div class="p-4 rounded-lg bg-gradient-to-br from-[#FBEAE9]/70 via-[#FDF3E0]/40 to-white border border-[#F2D5D4]/80 shadow-2xs">
          <div class="flex items-center space-x-2 text-[#A93B39] font-bold text-xs mb-1.5">
            <span class="px-2 py-0.5 bg-[#C04442] text-white rounded text-[10px] font-mono">{{ $t('chat.legalBasis') }}</span>
            <span>{{ activeSourceChunk.docType }}</span>
          </div>
          <h3 class="text-sm font-bold text-[#1B3123] leading-snug">
            {{ activeSourceChunk.title }}
          </h3>
          <div class="mt-3 pt-2.5 border-t border-[#F7E3E2] grid grid-cols-2 gap-2 text-xs text-[#58685D]">
            <div>
              <span class="text-[#8A9A8F]">{{ $t('chat.docNumber') }}：</span>
              <span class="font-mono font-medium">{{ activeSourceChunk.docNumber }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F]">{{ $t('chat.issuingAgency') }}：</span>
              <span>{{ activeSourceChunk.issuingAgency }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F]">{{ $t('chat.publishDate') }}：</span>
              <span class="font-mono">{{ activeSourceChunk.publishDate }}</span>
            </div>
            <div>
              <span class="text-[#8A9A8F]">{{ $t('chat.relevance') }}：</span>
              <span class="font-mono font-semibold text-[#2F7A50]">{{ activeSourceChunk.score }}%</span>
            </div>
          </div>
        </div>

        <!-- 条款章节与切片全文 -->
        <div class="space-y-2">
          <div class="flex items-center space-x-1.5 font-semibold text-[#1B3123] text-xs">
            <el-icon class="text-[#326445]"><DocumentCopy /></el-icon>
            <span>{{ $t('chat.clauseLabel') }}：{{ activeSourceChunk.clause }}</span>
          </div>

          <div class="p-4 bg-[#F3F8F4] border border-[#D9E5DB] rounded-lg leading-relaxed text-[#1F3326] whitespace-pre-wrap font-sans text-xs">
            {{ activeSourceChunk.content }}
          </div>
        </div>

        <!-- 效力提示 -->
        <div class="p-3 rounded-lg bg-[#EFF5F1] border border-[#E1F4E4] text-xs text-[#24483A] flex items-start space-x-2">
          <el-icon class="text-[#2F7A50] mt-0.5 text-sm shrink-0"><Warning /></el-icon>
          <div>
            <strong>{{ $t('chat.effectTipTitle') }}</strong>
            {{ $t('chat.effectTipDesc') }}
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 4. 人工客服满意度评价弹窗 -->
    <el-dialog
      v-model="isSatisfactionDialogVisible"
      :title="$t('chat.satisfactionTitle')"
      width="420px"
      append-to-body
    >
      <div class="space-y-4 text-xs">
        <div class="flex items-center space-x-3 p-3 bg-[#F3F8F4] rounded-lg border border-[#D9E5DB]">
          <img
            v-if="activeHumanAgent?.avatar"
            :src="activeHumanAgent.avatar"
            alt="Agent Avatar"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div class="font-bold text-[#1F3326]">{{ activeHumanAgent?.name }}</div>
            <div class="text-[11px] text-[#58685D] font-mono">{{ $t('chat.ticketNo') }}：{{ activeHumanAgent?.badgeNo }}</div>
          </div>
        </div>

        <div class="text-center py-2">
          <span class="block text-[#58685D] mb-2">{{ $t('chat.ratingPrompt') }}</span>
          <el-rate v-model="satisfactionRate" :colors="['#D9B567', '#D9B567', '#D9B567']" />
        </div>

        <div>
          <span class="block text-[#58685D] mb-1">{{ $t('chat.commentPlaceholder') }}</span>
          <el-input
            v-model="satisfactionComment"
            type="textarea"
            :rows="2"
            :placeholder="$t('chat.commentPlaceholder')"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <el-button @click="isSatisfactionDialogVisible = false">{{ $t('chat.skipRating') }}</el-button>
          <el-button type="primary" @click="submitSatisfaction">{{ $t('chat.submitRating') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ChatDotRound,
  Headset,
  Close,
  FullScreen,
  RefreshRight,
  DocumentCopy,
  Right,
  Position,
  Loading,
  CircleCheck,
  Warning
} from '@element-plus/icons-vue';

import {
  askRagAssistant,
  getKnowledgeBasesList,
  transferToHuman,
  sendHumanChatMessage,
  submitFeedback
} from '../../api/customerService.js';

import {
  MULTI_LANG_SOURCES,
  MULTI_LANG_TOPICS,
  MULTI_LANG_AGENTS,
  matchTopic,
  getTranslatedSource
} from '../../mock/data/chatMultiLangData.js';

const route = useRoute();
const { t, locale, tm } = useI18n();

// 1. 窗口显隐与形态控制
const isOpen = ref(false);
const isExpanded = ref(false);
const isThinking = ref(false);
const thinkingText = ref(t('chat.retrieving') || '正在检索政策依据...');

// APP 模式侦测 (支持移动端视口、WebView容器、PWA standalone、以及 URL 参数 ?layout=app 等)
const isAppMode = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

function detectAppMode() {
  if (typeof window === 'undefined') return;
  windowWidth.value = window.innerWidth;
  const urlParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash || '';
  const hasAppParam =
    urlParams.get('mode') === 'app' ||
    urlParams.get('app') === 'true' ||
    urlParams.get('client') === 'app' ||
    urlParams.get('layout') === 'app' ||
    hash.includes('mode=app') ||
    hash.includes('layout=app') ||
    hash.includes('mode=mobile') ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('rcm_layout_mode') === 'app');
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  const isNarrowScreen = window.innerWidth <= 640;

  isAppMode.value = hasAppParam || isStandalone || isMobileUA || isNarrowScreen;
}

// 悬浮球精准限制在 412px 视口内部右下角
const fabAppStyle = computed(() => {
  if (!isAppMode.value) return {};
  if (windowWidth.value < 640) {
    return {
      right: '12px',
      bottom: '68px'
    };
  }
  // 桌面端 Pixel 9 仿真视口预览：手机视口居中宽 412px，浮窗严格固定在手机视口右内侧
  return {
    right: 'calc(50vw - 192px)',
    bottom: 'calc(max(16px, (100vh - min(924px, 100vh - 20px)) / 2) + 68px)'
  };
});

// 对话窗口精准限制在 412px 视口内部正中
const chatWindowAppStyle = computed(() => {
  if (!isAppMode.value) return {};
  if (windowWidth.value < 640) {
    return {
      left: '10px',
      right: '10px',
      bottom: '64px',
      maxHeight: 'calc(100vh - 120px)'
    };
  }
  // 桌面端 Pixel 9 仿真视口预览：居中严密包裹在 412px 视口内
  return {
    width: '388px',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 'calc(max(16px, (100vh - min(924px, 100vh - 20px)) / 2) + 64px)',
    maxHeight: 'calc(min(924px, 100vh - 20px) - 100px)'
  };
});

// 服务模式: 'AI' (智能问答) | 'HUMAN' (7x24 人工客服专席)
const serviceMode = ref('AI');

// 输入框与对话视窗绑定
const inputQuery = ref('');
const inputRef = ref(null);
const messagesContainerRef = ref(null);

// 常见问题推荐配置 (随系统语言实时响应式计算)
const currentPrompts = computed(() => {
  try {
    const list = tm('chat.prompts');
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch (e) {}
  return [
    { tag: '配额标准', question: '2026年家庭成员的每月基础口粮物资配额标准是多少？' },
    { tag: '户主变更', question: '原户主因病去世或丧失行为能力，该如何办理户主变更？' },
    { tag: '代理转移', question: '搬家到新的行政区，如何申请把配给卡转移到新的代理网点？' },
    { tag: '账号解冻', question: '配给卡账户为什么会被冻结？如何在线上申请解冻恢复发放？' }
  ];
});

// 政策详情抽屉与满意度弹窗
const isSourceDrawerVisible = ref(false);
const activeSourceChunk = ref(null);
const isSatisfactionDialogVisible = ref(false);
const satisfactionRate = ref(5);
const satisfactionComment = ref('');

// 人工客服专员资料与当前工单
const activeHumanAgent = ref(null);
const currentTicketNo = ref('');

// 对话消息列表 (默认初始语具备 4 语言映射)
const messages = ref([
  {
    id: 'MSG-INIT-001',
    role: 'assistant',
    content: t('chat.initGreeting') || '您好！我是平台客服助手，支持解答物资配额、户主变更、网点转移、解冻申报等业务办理与政策咨询，请问有什么可以帮您？',
    contentMap: {
      zh: '您好！我是平台客服助手，支持解答物资配额、户主变更、网点转移、解冻申报等业务办理与政策咨询，请问有什么可以帮您？',
      en: 'Hello! I am your Ration Card assistant. Ask me anything about monthly quotas, change of head, agent transfer, unfreezing accounts and official guidelines.',
      ar: 'مرحباً بكم! أنا المساعد الذكي للبطاقة التموينية، تفضل بطرح استفسارك حول الحصص أو تبديل الوكيل أو تغيير رب الأسرة.',
      ku: 'بەخێربێن! من یاریدەدەری زیرەکی کارتی بەشەخۆراکم، دەتوانیت پرسیار لەسەر بەشەخۆراک، گۆڕینی بریکار و کارتی نوێ بکەیت.'
    },
    timestamp: new Date().toISOString(),
    suggestQuestions: []
  }
]);

// 核心多语言同步方法：智能助手内所有的聊天记录（用户提问、AI 回答、系统提示、人工客服消息）均自动切换为对应语言
function syncChatMessagesLanguage(newLang) {
  if (!newLang) newLang = locale.value;
  thinkingText.value = t('chat.retrieving') || '正在检索政策依据...';

  // 1. 更新初始问候语
  const initMsg = messages.value.find((m) => m.id && m.id.startsWith('MSG-INIT'));
  if (initMsg) {
    initMsg.content = t('chat.initGreeting') || initMsg.content;
  }

  // 2. 遍历更新所有已产生的新聊天内容 (包括用户提问、AI 回答、系统卡片、人工客服消息)
  messages.value.forEach((msg) => {
    // 2.1 针对有 contentMap 的消息，优先使用精确多语言文本
    if (msg.contentMap && msg.contentMap[newLang]) {
      msg.content = msg.contentMap[newLang];
    } else if (msg.topicKey && MULTI_LANG_TOPICS[msg.topicKey]) {
      // 若有主题 key，从主题字典获取对应角色文本
      const topic = MULTI_LANG_TOPICS[msg.topicKey];
      if (msg.role === 'user' && topic.userQuestion?.[newLang]) {
        msg.content = topic.userQuestion[newLang];
        msg.contentMap = { ...topic.userQuestion };
      } else if (msg.role === 'assistant' && topic.answer?.[newLang]) {
        msg.content = topic.answer[newLang];
        msg.contentMap = { ...topic.answer };
      }
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      // 尝试根据当前文本内容进行语义主题匹配
      const topic = matchTopic(msg.content);
      if (topic) {
        msg.topicKey = topic.key;
        if (msg.role === 'user' && topic.userQuestion?.[newLang]) {
          msg.content = topic.userQuestion[newLang];
          msg.contentMap = { ...topic.userQuestion };
        } else if (msg.role === 'assistant' && topic.answer?.[newLang]) {
          msg.content = topic.answer[newLang];
          msg.contentMap = { ...topic.answer };
        }
      }
    }

    // 2.2 更新 AI 助手回答中的政策依据 (sources)
    if (msg.sourcesMap && msg.sourcesMap[newLang] && msg.sourcesMap[newLang].length > 0) {
      msg.sources = msg.sourcesMap[newLang];
    } else if (Array.isArray(msg.sources) && msg.sources.length > 0) {
      msg.sources = msg.sources.map((src) => getTranslatedSource(src.id, newLang) || src);
    }

    // 2.3 更新 AI 助手回答中的推荐追问建议 (suggestQuestions)
    if (msg.suggestQuestionsMap && msg.suggestQuestionsMap[newLang] && msg.suggestQuestionsMap[newLang].length > 0) {
      msg.suggestQuestions = msg.suggestQuestionsMap[newLang];
    } else if (msg.topicKey && MULTI_LANG_TOPICS[msg.topicKey]) {
      msg.suggestQuestions = MULTI_LANG_TOPICS[msg.topicKey].suggestQuestions[newLang] || msg.suggestQuestions;
    }

    // 2.4 更新系统转接通知卡片 (system)
    if (msg.role === 'system') {
      const banner = t('chat.humanBanner') || '会话已接入 7×24 人工客服专席';
      const badge = msg.agentBadge || (msg.ticketNo ? 'CS-8092' : '');
      const agentName = (msg.agentNameMap && msg.agentNameMap[newLang]) || MULTI_LANG_AGENTS[0].names[newLang] || 'Salah Abdul';
      msg.content = `${banner} [${agentName}${badge ? ` - ${badge}` : ''}]`;
    }

    // 2.5 更新人工客服专员名与部门
    if (msg.role === 'human_agent' && msg.agent) {
      const agentName = (msg.agentNameMap && msg.agentNameMap[newLang]) || MULTI_LANG_AGENTS[0].names[newLang] || msg.agent.name;
      const dept = MULTI_LANG_AGENTS[0].departments[newLang] || msg.agent.department;
      msg.agent = {
        ...msg.agent,
        name: agentName,
        department: dept
      };
    }
  });

  // 3. 同步政策出处抽屉当前展示的切片内容
  if (activeSourceChunk.value && activeSourceChunk.value.id) {
    activeSourceChunk.value = getTranslatedSource(activeSourceChunk.value.id, newLang) || activeSourceChunk.value;
  }

  // 4. 同步当前人工客服专员档案
  if (activeHumanAgent.value) {
    activeHumanAgent.value = {
      ...activeHumanAgent.value,
      name: MULTI_LANG_AGENTS[0].names[newLang] || activeHumanAgent.value.name,
      department: MULTI_LANG_AGENTS[0].departments[newLang] || activeHumanAgent.value.department
    };
  }

  // 5. 保存到本地存储
  saveMessagesToStorage();
}

// 监听语言切换响应式同步
watch(locale, (newLang) => {
  syncChatMessagesLanguage(newLang);
});

// 读取当前登录用户信息
const currentUserContext = computed(() => {
  const profile = JSON.parse(localStorage.getItem('rcm_user_profile') || '{}');
  return {
    id: profile.id || 'anonymous',
    name: profile.name || profile.username || '当前用户',
    role: profile.role || 'citizen',
    routePath: route.path || '/citizen'
  };
});

// 格式化时间戳
function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

// 自动滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
}

// 打开窗口
function openChatWindow() {
  isOpen.value = true;
  scrollToBottom();
  nextTick(() => {
    inputRef.value?.focus();
  });
}

// 关闭窗口
function closeWindow() {
  isOpen.value = false;
}

// 快捷发送热门问题
function handleQuickQuestion(q) {
  inputQuery.value = q;
  handleSendMessage();
}

// 发送消息处理
async function handleSendMessage() {
  const query = inputQuery.value.trim();
  if (!query || isThinking.value) return;

  // 1. 添加用户消息 (附带多语言映射)
  const topic = matchTopic(query);
  const userMsg = {
    id: `USER-${Date.now()}`,
    role: 'user',
    content: (topic && topic.userQuestion && topic.userQuestion[locale.value]) ? topic.userQuestion[locale.value] : query,
    topicKey: topic ? topic.key : '',
    contentMap: topic ? { ...topic.userQuestion } : { zh: query, en: query, ar: query, ku: query },
    timestamp: new Date().toISOString()
  };
  messages.value.push(userMsg);
  inputQuery.value = '';
  scrollToBottom();

  // 判断是否处于人工客服模式
  if (serviceMode.value === 'HUMAN') {
    await handleSendToHumanAgent(query);
    return;
  }

  // 2. 检测用户是否主动要求人工
  const qLower = query.toLowerCase();
  const humanKeywords = ['人工', '转人工', '人工客服', '真人', 'live agent', 'agent', 'human', 'موظف', 'فەرمانبەر'];
  if (humanKeywords.some((k) => qLower.includes(k))) {
    await triggerHumanHandoff('USER_KEYWORD_TRIGGER');
    return;
  }

  // 3. 智能问答检索 (携带当前系统语言)
  isThinking.value = true;
  thinkingText.value = t('chat.retrieving');

  try {
    const historyPayload = messages.value
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await askRagAssistant({
      question: query,
      history: historyPayload,
      userContext: currentUserContext.value,
      lang: locale.value
    });

    thinkingText.value = t('chat.thinking');
    await new Promise((r) => setTimeout(r, 200));

    const aiMsg = {
      id: `AI-${Date.now()}`,
      role: 'assistant',
      content: res.answer,
      contentMap: res.contentMap || (topic ? { ...topic.answer } : {}),
      topicKey: res.topicKey || (topic ? topic.key : ''),
      sources: res.sources || [],
      sourcesMap: res.sourcesMap || {},
      suggestQuestions: res.suggestQuestions || [],
      suggestQuestionsMap: res.suggestQuestionsMap || {},
      timestamp: new Date().toISOString()
    };

    messages.value.push(aiMsg);
    saveMessagesToStorage();
    scrollToBottom();

    if (res.needHumanTransfer) {
      setTimeout(() => {
        ElMessage.info(t('chat.needHumanTip'));
      }, 500);
    }
  } catch (err) {
    console.error('Query Failed:', err);
    messages.value.push({
      id: `ERR-${Date.now()}`,
      role: 'assistant',
      content: 'Network response delayed. Please retry or connect to a live agent.',
      contentMap: {
        zh: '网络响应延迟，请重试或转接 7×24 人工客服。',
        en: 'Network response delayed. Please retry or connect to a 24/7 live agent.',
        ar: 'تأخرت استجابة الشبكة، يرجى إعادة المحاولة أو التحويل لموظف الدعم المباشر.',
        ku: 'وەڵامدانەوەی تۆڕ دواکەوت، تکایە دووبارە هەوڵبدەرەوە یان پەیوەندی بە فەرمانبەر بکە.'
      },
      timestamp: new Date().toISOString()
    });
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
}

// 向人工客服发送消息
async function handleSendToHumanAgent(query) {
  isThinking.value = true;
  thinkingText.value = t('chat.thinking');

  try {
    const res = await sendHumanChatMessage({
      message: query,
      agentId: activeHumanAgent.value?.id || 'AGENT-CS-8092',
      sessionId: `SESSION-${currentUserContext.value.id}`,
      lang: locale.value
    });

    await new Promise((r) => setTimeout(r, 400));

    messages.value.push({
      id: `HUMAN-${Date.now()}`,
      role: 'human_agent',
      agent: res.agent,
      agentNameMap: res.agentNameMap,
      content: res.reply,
      contentMap: res.replyMap || {},
      timestamp: res.timestamp || new Date().toISOString()
    });
    saveMessagesToStorage();
  } catch (err) {
    ElMessage.error(t('common.failed') || 'Error');
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
}

// 一键无缝转接 7x24 人工客服
async function triggerHumanHandoff(reason = 'USER_TRIGGER', targetMsg = null) {
  if (serviceMode.value === 'HUMAN') {
    ElMessage.info(t('chat.humanServing'));
    return;
  }

  isThinking.value = true;
  thinkingText.value = t('chat.retrieving');

  try {
    const historyToSync = messages.value
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }));

    const handoffPayload = {
      sessionId: `SESSION-${currentUserContext.value.id}-${Date.now()}`,
      conversationHistory: historyToSync,
      userContext: currentUserContext.value,
      reason,
      lang: locale.value
    };

    const res = await transferToHuman(handoffPayload);

    serviceMode.value = 'HUMAN';
    activeHumanAgent.value = res.agent;
    currentTicketNo.value = res.ticketNo;

    const bannerText = t('chat.humanBanner');
    const agentName = res.agentNameMap?.[locale.value] || res.agent.name;

    messages.value.push({
      id: `SYS-${Date.now()}`,
      role: 'system',
      ticketNo: res.ticketNo,
      agentBadge: res.agent.badgeNo,
      agentNameMap: res.agentNameMap,
      content: `${bannerText} [${agentName} - ${res.agent.badgeNo}]`
    });

    messages.value.push({
      id: `HUMAN-INIT-${Date.now()}`,
      role: 'human_agent',
      agent: res.agent,
      agentNameMap: res.agentNameMap,
      content: res.initialGreeting,
      contentMap: res.initialGreetingMap || {},
      timestamp: new Date().toISOString()
    });

    ElMessage.success(t('chat.humanBanner'));
    saveMessagesToStorage();
    scrollToBottom();
  } catch (err) {
    console.error('Human handoff error:', err);
    ElMessage.error('Connect timeout, please retry.');
  } finally {
    isThinking.value = false;
  }
}

// 切回 AI 模式
function switchToAiMode() {
  serviceMode.value = 'AI';
  ElMessage.info(t('chat.headerTitle'));
}

// 结束人工服务
function endHumanService() {
  ElMessageBox.confirm(
    t('chat.confirmEndHuman'),
    t('common.confirm') || 'Notice',
    {
      confirmButtonText: t('chat.endAndRate'),
      cancelButtonText: t('common.cancel') || 'Cancel',
      type: 'info'
    }
  ).then(() => {
    serviceMode.value = 'AI';
    isSatisfactionDialogVisible.value = true;
  }).catch(() => {});
}

// 查看政策条文切片全文详情
function viewSourceDetail(source) {
  activeSourceChunk.value = source;
  isSourceDrawerVisible.value = true;
}

// 满意度评价（赞/踩）
async function handleFeedback(msg, type) {
  msg.feedback = type;
  try {
    await submitFeedback({
      messageId: msg.id,
      rating: type
    });
    if (type === 'dislike') {
      ElMessageBox.confirm(
        t('chat.transferDialogDesc'),
        t('chat.transferDialogTitle'),
        {
          confirmButtonText: t('chat.transferNow'),
          cancelButtonText: t('chat.notNow'),
          type: 'warning'
        }
      ).then(() => {
        triggerHumanHandoff('FEEDBACK_DISLIKE', msg);
      }).catch(() => {});
    } else {
      ElMessage.success(t('chat.helpful'));
    }
  } catch (e) {}
}

// 打开评价弹窗
function openSatisfactionDialog() {
  isSatisfactionDialogVisible.value = true;
}

// 提交满意度评价
async function submitSatisfaction() {
  try {
    await submitFeedback({
      ticketNo: currentTicketNo.value,
      agentId: activeHumanAgent.value?.id,
      rating: `STAR_${satisfactionRate.value}`,
      comment: satisfactionComment.value
    });
    ElMessage.success(t('common.success') || 'Success');
    isSatisfactionDialogVisible.value = false;
    satisfactionComment.value = '';
  } catch (err) {
    isSatisfactionDialogVisible.value = false;
  }
}

// 清空历史确认
function clearHistoryConfirm() {
  ElMessageBox.confirm(t('chat.clearConfirm'), t('common.confirm') || 'Confirm', {
    confirmButtonText: t('chat.clearHistory'),
    cancelButtonText: t('common.cancel') || 'Cancel',
    type: 'warning'
  }).then(() => {
    messages.value = [
      {
        id: `MSG-INIT-${Date.now()}`,
        role: 'assistant',
        content: t('chat.initGreeting'),
        contentMap: {
          zh: '您好！我是平台客服助手，支持解答物资配额、户主变更、网点转移、解冻申报等业务办理与政策咨询，请问有什么可以帮您？',
          en: 'Hello! I am your Ration Card assistant. Ask me anything about monthly quotas, change of head, agent transfer, unfreezing accounts and official guidelines.',
          ar: 'مرحباً بكم! أنا المساعد الذكي للبطاقة التموينية، تفضل بطرح استفسارك حول الحصص أو تبديل الوكيل أو تغيير رب الأسرة.',
          ku: 'بەخێربێن! من یاریدەدەری زیرەکی کارتی بەشەخۆراکم، دەتوانیت پرسیار لەسەر بەشەخۆراک، گۆڕینی بریکار و کارتی نوێ بکەیت.'
        },
        timestamp: new Date().toISOString()
      }
    ];
    serviceMode.value = 'AI';
    localStorage.removeItem('rcm_chat_history');
    ElMessage.success(t('common.success'));
  }).catch(() => {});
}

// 本地存储持久化与恢复
function saveMessagesToStorage() {
  try {
    localStorage.setItem('rcm_chat_history', JSON.stringify(messages.value.slice(-20)));
  } catch (e) {}
}

function restoreMessagesFromStorage() {
  try {
    const raw = localStorage.getItem('rcm_chat_history');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        messages.value = parsed;
        // 恢复后即刻按当前系统语言执行多语言热同步
        syncChatMessagesLanguage(locale.value);
      }
    }
  } catch (e) {}
}

// 全局多语言切换事件处理
function handleGlobalLanguageChange(e) {
  if (e?.detail) {
    syncChatMessagesLanguage(e.detail);
  }
}

// 初始化加载知识库概览
async function initKnowledgeBases() {
  try {
    await getKnowledgeBasesList();
  } catch (e) {
    console.warn('Load Knowledge Bases failed:', e);
  }
}

watch(
  () => route.fullPath,
  () => {
    detectAppMode();
  }
);

onMounted(() => {
  detectAppMode();
  restoreMessagesFromStorage();
  initKnowledgeBases();
  window.addEventListener('resize', detectAppMode);
  window.addEventListener('rcm-open-chat', openChatWindow);
  window.addEventListener('rcm-close-chat', closeWindow);
  window.addEventListener('rcm-language-changed', handleGlobalLanguageChange);
});

onUnmounted(() => {
  window.removeEventListener('resize', detectAppMode);
  window.removeEventListener('rcm-open-chat', openChatWindow);
  window.removeEventListener('rcm-close-chat', closeWindow);
  window.removeEventListener('rcm-language-changed', handleGlobalLanguageChange);
});
</script>

<style scoped>
/* 悬浮球弹出动效 */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(20px);
}

/* 对话窗口展开动效 */
.chat-window-enter-active,
.chat-window-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-window-enter-from,
.chat-window-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(24px);
}

/* 输入框微调 */
:deep(.custom-chat-input .el-textarea__inner) {
  border: none;
  font-size: 0.8125rem;
  padding: 0.25rem 0.25rem;
  box-shadow: none !important;
  background-color: transparent !important;
}
:deep(.custom-chat-input .el-textarea__inner:focus) {
  box-shadow: none !important;
}
</style>
