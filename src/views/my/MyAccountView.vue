<template>
  <div class="my-account-view mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-7 space-y-5 text-[#1F3326]"
    @touchstart.passive="startListSwipe" @touchend.passive="endListSwipe" @touchcancel.passive="cancelListSwipe" @click.capture="guardSwipeClick">
    <header v-if="isListPage" class="flex items-center gap-3" data-my-list-header>
      <el-button circle :aria-label="$t('common.back')" @click="closeList"><el-icon class="rtl-mirror-icon"><ArrowLeft /></el-icon></el-button>
      <div class="min-w-0"><h1 class="text-lg font-bold">{{ $t(expandedList === 'applications' ? 'my.applicationHistory' : 'my.notificationCenter') }}</h1><p class="text-xs text-[#8A9A8F]">{{ $t('my.listTotal', { count: listTotal }) }}</p></div>
    </header>
    <template v-if="!isListPage">
    <header class="space-y-1">
      <h1 class="text-xl font-bold">{{ isCitizen ? $t('my.citizenTitle') : $t('my.agentTitle') }}</h1>
      <p class="text-sm text-[#58685D]">{{ isCitizen ? $t('my.citizenSubtitle') : $t('my.agentSubtitle') }}</p>
    </header>

    <section class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm flex items-center gap-4">
      <div class="size-14 shrink-0 rounded-xl bg-[#FDF3E0] text-[#7A5F21] flex items-center justify-center">
        <el-icon :size="28"><User /></el-icon>
      </div>
      <div class="min-w-0 flex-1">
        <div class="font-bold text-lg truncate">{{ displayName }}</div>
        <div class="text-sm text-[#58685D] mt-0.5">
          <bdi dir="ltr">{{ isCitizen ? profile.phone : agentProfile?.phone }}</bdi>
        </div>
      </div>
      <span class="shrink-0 rounded-full bg-[#E2F4E4] px-2.5 py-1 text-xs font-semibold text-[#326445]">
        ● {{ $t(isCitizen ? 'my.verified' : 'my.authorized') }}
      </span>
    </section>

    <template v-if="isCitizen">
      <section class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-bold text-base">{{ $t('my.contactTitle') }}</h2>
          <el-button size="small" @click="openContactDialog"><el-icon class="me-1"><Edit /></el-icon>{{ $t('my.editContact') }}</el-button>
        </div>
        <div class="space-y-3 text-sm">
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Message /></el-icon><div class="min-w-0"><div class="text-xs text-[#8A9A8F]">{{ $t('my.email') }}</div><bdi dir="ltr" class="block break-all">{{ profile.email }}</bdi></div></div>
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Iphone /></el-icon><div><div class="text-xs text-[#8A9A8F]">{{ $t('my.phone') }}</div><bdi dir="ltr">{{ profile.phone }}</bdi></div></div>
          <div class="flex items-start gap-3"><el-icon class="mt-0.5 text-[#326445]"><Location /></el-icon><div><div class="text-xs text-[#8A9A8F]">{{ $t('my.address') }}</div><span>{{ profile.address }}</span></div></div>
        </div>
      </section>
    </template>

    <template v-else>
      <div class="grid grid-cols-3 gap-1 rounded-xl bg-[#EFF5F1] p-1.5">
        <button v-for="tab in agentTabs" :key="tab.key" type="button"
          class="min-w-0 rounded-lg px-1 py-2 text-xs sm:text-sm transition-colors flex flex-col items-center gap-1"
          :class="currentTab === tab.key ? 'bg-white text-[#326445] font-bold shadow-sm' : 'text-[#58685D]'"
          @click="selectTab(tab.key)">
          <span class="relative"><el-icon :size="18"><component :is="tab.icon" /></el-icon><span v-if="notificationStore.hasUnread(tab.key)" class="absolute -top-1 -end-1 size-2 rounded-full bg-red-500 ring-2 ring-white" /></span>
          <span class="truncate max-w-full">{{ $t(`my.${tab.key}`) }}</span>
        </button>
      </div>
    </template>

    </template>
    <section v-if="isCitizen && (!isListPage || expandedList === 'applications')" data-my-list="applications" :class="{ 'my-swipe-list': isListPage }" class="rounded-xl border border-[#D9E5DB] bg-white p-4 sm:p-5 shadow-sm space-y-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <el-icon class="shrink-0 text-[#326445]"><DocumentChecked /></el-icon>
          <div class="min-w-0">
            <h2 class="font-bold">{{ $t('my.applicationHistory') }}</h2>
            <p class="mt-0.5 text-xs text-[#8A9A8F]">{{ $t('my.applicationHistorySubtitle') }}</p>
          </div>
        </div>
        <el-button v-if="!isListPage" size="small" text type="primary" class="shrink-0" @click="openList('applications')">{{ $t('my.viewAll') }}<el-icon class="ms-1 rtl-mirror-icon"><ArrowRight /></el-icon></el-button>
        <el-button v-else size="small" text :aria-expanded="showApplicationFilters" @click="showApplicationFilters = !showApplicationFilters">
          <el-icon class="me-1"><Filter /></el-icon>{{ $t('my.applicationFilterToggle') }}
        </el-button>
      </div>
      <div v-if="isListPage && showApplicationFilters" class="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg bg-[#F8FAF8] p-3">
        <el-select v-model="applicationTypeFilter" :placeholder="$t('my.applicationFilterType')" clearable>
          <el-option :label="$t('my.applicationAnyType')" value="" />
          <el-option v-for="code in applicationSourceCodes" :key="code" :label="$t(`my.applicationTypes.${code}`)" :value="code" />
        </el-select>
        <el-select v-model="applicationStatusFilter" :placeholder="$t('my.applicationFilterStatus')" clearable>
          <el-option :label="$t('my.applicationAnyStatus')" value="" />
          <el-option v-for="status in ['pending', 'approved', 'rejected']" :key="status" :label="$t(`my.applicationStatuses.${status}`)" :value="status" />
        </el-select>
        <el-select v-model="applicationReviewFilter" :placeholder="$t('my.applicationFilterMode')" clearable>
          <el-option :label="$t('my.applicationAnyMode')" value="" />
          <el-option :label="$t('my.automaticReview')" value="automatic" />
          <el-option :label="$t('my.manualReview')" value="manual" />
        </el-select>
        <el-input v-model.trim="applicationSearch" :placeholder="$t('my.applicationSearchNumber')" clearable />
        <div class="sm:col-span-2 flex justify-end"><el-button size="small" text @click="clearApplicationFilters">{{ $t('my.applicationClearFilters') }}</el-button></div>
      </div>
      <div v-if="applicationRecords.length === 0" class="rounded-lg bg-[#F8FAF8] py-6 text-center text-sm text-[#8A9A8F]">{{ $t('my.noApplicationHistory') }}</div>
      <div v-else-if="isListPage && filteredApplicationRecords.length === 0" class="rounded-lg bg-[#F8FAF8] py-6 text-center text-sm text-[#8A9A8F]">{{ $t('my.applicationNoMatches') }}</div>
      <article v-for="record in displayedApplications" :key="record.id" class="application-record rounded-lg border border-[#E9F1EB] bg-[#FCFDFC] p-3 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-[#1F3326]">{{ $t(`my.applicationTypes.${record.sourceCode}`) }}</h3>
          <div class="flex flex-wrap items-center gap-1.5">
            <el-tag size="small" effect="plain">{{ $t(`my.${applicationReviewMode(record)}Review`) }}</el-tag>
            <el-tag size="small" :type="applicationStatusType(record)">{{ $t(`my.applicationStatuses.${applicationStatusKey(record)}`) }}</el-tag>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8A9A8F]">
          <span>{{ $t('my.applicationNumber') }} <bdi dir="ltr" class="font-mono">{{ record.id }}</bdi></span>
          <span dir="ltr">{{ formatDate(record.submittedAt) }}</span>
        </div>
        <p class="text-xs leading-relaxed text-[#58685D] break-words" :class="{ 'line-clamp-2': !isListPage }">{{ applicationResult(record) }}</p>
      </article>
      <p v-if="!isListPage && applicationRecords.length" class="text-xs text-[#8A9A8F]">{{ $t('my.previewCount', { shown: displayedApplications.length, total: applicationRecords.length }) }}</p>
    </section>

    <section v-if="expandedList === 'notifications' || (!isListPage && (isCitizen || currentTab === 'notifications'))" data-my-list="notifications" :class="{ 'my-swipe-list': isListPage }" class="rounded-xl border border-[#D9E5DB] bg-white p-4 sm:p-5 shadow-sm">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-2 min-w-0">
          <el-icon class="shrink-0 text-[#326445]"><Bell /></el-icon>
          <h2 class="font-bold">{{ $t('my.notificationCenter') }}</h2>
          <span v-if="unreadCount" class="inline-flex min-w-6 h-6 items-center justify-center rounded-full bg-[#FDF3E0] px-1.5 text-xs font-bold text-[#7A5F21]" :aria-label="$t('my.unreadCount', { count: unreadCount })">{{ unreadCount }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-1 ms-auto">
          <el-button v-if="unreadCount" size="small" text type="primary" @click="markAllRead">{{ $t('my.markAllRead') }}</el-button>
          <el-button v-if="!isListPage" size="small" text type="primary" @click="openList('notifications')">{{ $t('my.viewAll') }}<el-icon class="ms-1 rtl-mirror-icon"><ArrowRight /></el-icon></el-button>
        </div>
      </div>
      <div v-if="notifications.length === 0" class="py-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noNotifications') }}</div>
      <div v-for="item in displayedNotifications" :key="item.id" class="my-notification border-t border-[#E9F1EB] py-3 first:border-t-0">
        <button type="button" class="w-full text-start flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-[#F8FAF8] transition-colors" @click="openNotification(item)">
          <span class="mt-1 size-2 shrink-0 rounded-full" :class="item.read ? 'bg-[#D9E5DB]' : 'bg-[#C9A13B]'" />
          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5"><span class="font-semibold text-sm">{{ notificationTitle(item, role) }}</span><span class="text-[11px] text-[#8A9A8F] shrink-0" dir="ltr">{{ formatDate(item.createdAt) }}</span></span>
            <span class="block mt-1 text-xs leading-relaxed text-[#58685D]" :class="{ 'line-clamp-2': !isListPage }">{{ notificationBody(item, role) }}</span>
            <span v-if="item.materialStatus === 'submitted'" class="block mt-1 text-xs text-[#326445]">{{ $t('my.materialSubmitted') }}</span>
            <span class="block mt-1 text-xs font-semibold text-[#326445]">{{ $t('my.viewRelated') }}</span>
          </span>
          <el-icon class="rtl-mirror-icon mt-1 text-[#58685D]"><ArrowRight /></el-icon>
        </button>
      </div>
      <p v-if="!isListPage && notifications.length" class="text-xs text-[#8A9A8F]">{{ $t('my.previewCount', { shown: displayedNotifications.length, total: notifications.length }) }}</p>
    </section>

    <nav v-if="isListPage && pageCount > 1" class="flex justify-center py-1" :aria-label="$t('my.pagination')" data-my-pagination @keydown="handlePaginationKey">
      <span class="sr-only" role="status" aria-live="polite">{{ $t('my.pageIndicator', { page: listPage, total: pageCount }) }}</span>
      <button v-for="page in visiblePageIndicators" :key="page" type="button" class="my-page-indicator"
        :class="{ 'is-current': page === listPage }" :aria-current="page === listPage ? 'page' : undefined"
        :aria-label="$t('my.pageIndicator', { page, total: pageCount })" @click="changeListPage(page)"><span /></button>
    </nav>

    <template v-if="!isListPage">
    <section v-if="!isCitizen && currentTab === 'outlets'" class="space-y-3">
      <h2 class="font-bold">{{ $t('my.outletInfo') }}</h2>
      <div v-if="!outlets.length" class="rounded-xl bg-white p-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noOutlets') }}</div>
      <article v-for="outlet in outlets" :key="outlet.id || outlet.centerId" class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm space-y-3 text-sm">
        <div class="flex items-start justify-between gap-3"><div class="font-bold">{{ displayOutletName(outlet) }}</div><el-tag size="small" type="success">{{ outletStatus(outlet) }}</el-tag></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletCode') }}</div><bdi dir="ltr" class="font-mono">{{ outlet.id || outlet.centerId }}</bdi></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.center') }}</div><span>{{ displayCenter(outlet) }}</span></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletPhone') }}</div><bdi dir="ltr">{{ outlet.phone || agentProfile?.phone }}</bdi></div>
          <div><div class="text-xs text-[#8A9A8F]">{{ $t('my.outletAddress') }}</div><span>{{ displayOutletAddress(outlet) }}</span></div>
        </div>
      </article>
    </section>

    <section v-if="!isCitizen && currentTab === 'couriers'" class="rounded-xl border border-[#D9E5DB] bg-white p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 mb-3"><h2 class="font-bold">{{ $t('my.courierManagement') }}</h2><el-button size="small" type="primary" @click="openCourierDialog()"><el-icon class="me-1"><Plus /></el-icon>{{ $t('my.addCourier') }}</el-button></div>
      <div v-if="!couriers.length" class="py-8 text-center text-sm text-[#8A9A8F]">{{ $t('my.noCouriers') }}</div>
      <article v-for="courier in couriers" :key="courier.id" class="border-t border-[#E9F1EB] py-3 flex items-center gap-3">
        <div class="size-10 shrink-0 rounded-full bg-[#EFF5F1] flex items-center justify-center text-[#326445]"><el-icon><Van /></el-icon></div>
        <div class="min-w-0 flex-1 text-sm"><div class="font-semibold">{{ courier.name }} <span class="ms-1 text-xs font-normal" :class="courier.active ? 'text-[#326445]' : 'text-[#8A9A8F]'">{{ $t(courier.active ? 'my.active' : 'my.inactive') }}</span></div><div class="text-xs text-[#58685D]"><bdi dir="ltr">{{ courier.phone }}</bdi> · <bdi dir="ltr">{{ courier.vehicleNo }}</bdi></div></div>
        <el-button size="small" text @click="openCourierDialog(courier)"><el-icon><Edit /></el-icon></el-button>
        <el-button size="small" text type="danger" @click="removeCourier(courier)"><el-icon><Delete /></el-icon></el-button>
      </article>
    </section>

    <section class="rounded-xl border border-[#D9E5DB] bg-white p-4 shadow-sm flex flex-col gap-1">
      <el-button class="w-full !m-0 !justify-start" text @click="openDeviceDialog"><el-icon class="me-2"><Iphone /></el-icon>{{ $t('my.trustedDevices') }}</el-button>
      <el-button class="w-full !m-0 !justify-start" text @click="passwordDialogOpen = true"><el-icon class="me-2"><Lock /></el-icon>{{ $t('my.changePassword') }}</el-button>
      <el-button class="w-full !m-0 !justify-start" text type="danger" @click="handleLogout"><el-icon class="me-2"><SwitchButton /></el-icon>{{ $t('my.logout') }}</el-button>
    </section>

    </template>
    <el-dialog v-model="contactDialogOpen" :title="$t('my.editContact')" width="min(92vw, 440px)" append-to-body>
      <el-form label-position="top" @submit.prevent="saveContact">
        <el-form-item :label="$t('my.email')"><el-input v-model.trim="contactForm.email" type="email" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.phone')"><el-input v-model.trim="contactForm.phone" type="tel" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.address')"><el-input v-model.trim="contactForm.address" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="contactDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="saveContact">{{ $t('my.saveContact') }}</el-button></template>
    </el-dialog>

    <FaceLivenessVerifyDialog
      v-if="isCitizen"
      v-model="faceDialogOpen"
      :title="$t('my.verifyPhoneChange')"
      :target-name="displayName"
      :target-national-id="authStore.userProfile?.cardNo || ''"
      :allow-quick-pass="false"
      @success="onFaceVerified"
      @cancel="contactDialogOpen = true"
    />

    <el-dialog v-model="courierDialogOpen" :title="$t(courierForm.id ? 'my.editCourier' : 'my.addCourier')" width="min(92vw, 440px)" append-to-body>
      <el-form label-position="top" @submit.prevent="saveCourier">
        <el-form-item :label="$t('my.courierName')"><el-input v-model.trim="courierForm.name" /></el-form-item>
        <el-form-item :label="$t('my.phone')"><el-input v-model.trim="courierForm.phone" type="tel" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.vehicleNo')"><el-input v-model.trim="courierForm.vehicleNo" dir="ltr" /></el-form-item>
        <el-form-item :label="$t('my.active')"><el-switch v-model="courierForm.active" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="courierDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="saveCourier">{{ $t('my.saveCourier') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="passwordDialogOpen" :title="$t('my.changePassword')" width="min(92vw, 440px)" append-to-body @closed="resetPasswordForm">
      <el-form label-position="top" @submit.prevent="savePassword">
        <el-form-item :label="$t('my.currentPassword')"><el-input v-model="passwordForm.currentPassword" type="password" show-password autocomplete="current-password" /></el-form-item>
        <el-form-item :label="$t('my.newPassword')"><el-input v-model="passwordForm.newPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item :label="$t('my.confirmPassword')"><el-input v-model="passwordForm.confirmPassword" type="password" show-password autocomplete="new-password" /></el-form-item>
        <el-form-item v-if="isCitizen" :label="$t('my.smsCode')">
          <div class="flex w-full gap-2"><el-input v-model.trim="passwordForm.smsCode" maxlength="6" inputmode="numeric" dir="ltr" /><el-button :disabled="smsCountdown > 0" @click="sendPasswordSms">{{ smsCountdown ? `${smsCountdown}s` : $t('my.sendSms') }}</el-button></div>
          <span v-if="demoSmsCode" class="text-xs text-[#326445]">{{ $t('my.demoSmsCode', { code: demoSmsCode }) }}</span>
        </el-form-item>
        <div class="text-xs text-[#8A9A8F]">{{ $t('my.passwordHint') }}</div>
      </el-form>
      <template #footer><el-button @click="passwordDialogOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="primary" :loading="saving" @click="savePassword">{{ $t('my.changePassword') }}</el-button></template>
    </el-dialog>

    <el-dialog v-model="deviceDialogOpen" :title="$t('my.trustedDevices')" width="min(92vw, 440px)" append-to-body>
      <p class="mb-3 text-xs text-[#8A9A8F]">{{ $t('my.trustedDevicesSubtitle') }}</p>
      <div v-if="!devices.length" class="rounded-lg bg-[#F8FAF8] py-6 text-center text-sm text-[#8A9A8F]">{{ $t('my.deviceEmpty') }}</div>
      <article v-for="device in devices" :key="device.id" class="flex items-center gap-3 border-t border-[#E9F1EB] py-3 first:border-t-0">
        <div class="size-10 shrink-0 rounded-full bg-[#EFF5F1] flex items-center justify-center text-[#326445]"><el-icon><component :is="deviceIcon(device.platform)" /></el-icon></div>
        <div class="min-w-0 flex-1 text-sm">
          <div class="font-semibold flex flex-wrap items-center gap-1.5">
            <span class="truncate">{{ device.name }}</span>
            <el-tag v-if="device.current" size="small" type="success" effect="plain">{{ $t('my.deviceCurrent') }}</el-tag>
          </div>
          <div class="mt-0.5 text-xs text-[#58685D]"><span>{{ device.location }}</span> · <bdi dir="ltr">{{ device.ip }}</bdi></div>
          <div class="mt-0.5 text-[11px] text-[#8A9A8F]"><span>{{ $t('my.deviceLastActive') }}</span> <bdi dir="ltr">{{ formatDeviceTime(device.lastActiveAt) }}</bdi></div>
        </div>
        <el-button v-if="!device.current" size="small" text type="danger" :aria-label="$t('my.deviceDelete')" @click="openDeviceVerify(device)"><el-icon><Delete /></el-icon></el-button>
      </article>
    </el-dialog>

    <el-dialog v-model="deviceVerifyOpen" :title="$t('my.deviceVerifyTitle')" width="min(92vw, 440px)" append-to-body @closed="resetDeviceVerify">
      <div class="space-y-4">
        <p class="text-xs text-[#8A9A8F]">{{ $t('my.deviceVerifyHint') }}</p>
        <div class="rounded-lg bg-[#F8FAF8] p-3 text-sm">
          <div class="font-semibold">{{ pendingDevice?.name }}</div>
          <div class="mt-0.5 text-xs text-[#58685D]"><span>{{ pendingDevice?.location }}</span> · <bdi dir="ltr">{{ pendingDevice?.ip }}</bdi></div>
        </div>
        <div class="grid grid-cols-2 gap-2" role="radiogroup" :aria-label="$t('my.deviceVerifyMethod')">
          <button
            type="button"
            role="radio"
            :aria-checked="deviceVerifyMethod === 'sms'"
            class="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm leading-tight text-center transition-colors"
            :class="deviceVerifyMethod === 'sms' ? 'border-[#326445] bg-[#E2F4E4] font-bold text-[#326445]' : 'border-[#D9E5DB] bg-white text-[#58685D] hover:border-[#A7D9BC]'"
            @click="deviceVerifyMethod = 'sms'"
          >
            <el-icon class="shrink-0"><Iphone /></el-icon><span class="min-w-0">{{ $t('my.deviceVerifyMethodSms') }}</span>
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="deviceVerifyMethod === 'face'"
            class="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-sm leading-tight text-center transition-colors"
            :class="deviceVerifyMethod === 'face' ? 'border-[#326445] bg-[#E2F4E4] font-bold text-[#326445]' : 'border-[#D9E5DB] bg-white text-[#58685D] hover:border-[#A7D9BC]'"
            @click="deviceVerifyMethod = 'face'"
          >
            <el-icon class="shrink-0"><Camera /></el-icon><span class="min-w-0">{{ $t('my.deviceVerifyMethodFace') }}</span>
          </button>
        </div>
        <div v-if="deviceVerifyMethod === 'sms'" class="space-y-1.5">
          <div class="flex w-full gap-2">
            <el-input v-model.trim="deviceSmsCode" maxlength="6" inputmode="numeric" dir="ltr" :placeholder="$t('my.smsCode')" />
            <el-button class="shrink-0" :disabled="deviceSmsCountdown > 0" @click="sendDeviceSms">{{ deviceSmsCountdown ? `${deviceSmsCountdown}s` : $t('my.sendSms') }}</el-button>
          </div>
          <span v-if="deviceDemoSmsCode" class="text-xs text-[#326445]">{{ $t('my.demoSmsCode', { code: deviceDemoSmsCode }) }}</span>
        </div>
        <el-button v-else class="w-full" :type="deviceFaceToken ? 'success' : 'primary'" plain @click="deviceFaceDialogOpen = true">
          <el-icon class="me-2"><Camera /></el-icon>{{ deviceFaceToken ? $t('my.deviceFaceVerified') : $t('my.deviceFaceStart') }}
        </el-button>
      </div>
      <template #footer><el-button @click="deviceVerifyOpen = false">{{ $t('common.cancel') }}</el-button><el-button type="danger" :disabled="!deviceVerified" :loading="saving" @click="confirmDeviceRemoval">{{ $t('my.deviceDelete') }}</el-button></template>
    </el-dialog>

    <FaceLivenessVerifyDialog
      v-model="deviceFaceDialogOpen"
      :title="$t('my.deviceVerifyTitle')"
      :target-name="displayName"
      :target-national-id="authStore.userProfile?.cardNo || ''"
      :allow-quick-pass="false"
      @success="onDeviceFaceVerified"
      @cancel="deviceVerifyOpen = true"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Edit, Message, Iphone, Location, Bell, ArrowLeft, ArrowRight, Van, Plus, Delete, Lock, SwitchButton, Shop, DocumentChecked, Filter, Camera, Monitor } from '@element-plus/icons-vue';
import { useAuthStore } from '../../stores/auth.js';
import { useCitizenStore } from '../../stores/citizen.js';
import { getAgentProfile, getMyAgentCenters } from '../../api/agent.js';
import { getMyProfile, updateMyProfile, changeMyPassword, sendMyPasswordCode, verifyMyPhoneFace, getMyCouriers, createMyCourier, updateMyCourier, deleteMyCourier, getMyDevices, sendMyDeviceCode, verifyMyDeviceFace, deleteMyDevice } from '../../api/my.js';
import { useMyNotificationsStore, notificationUrl, notificationTitle, notificationBody } from '../../stores/myNotifications.js';
import { getSharedTickets } from '../../utils/sharedSession.js';
import FaceLivenessVerifyDialog from '../../components/common/FaceLivenessVerifyDialog.vue';

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const citizenStore = useCitizenStore();
const notificationStore = useMyNotificationsStore();
const role = computed(() => authStore.currentRole);
const isCitizen = computed(() => role.value === 'citizen');
const expandedList = computed(() => route.query.list === 'notifications' ? 'notifications' : isCitizen.value && route.query.list === 'applications' ? 'applications' : '');
const isListPage = computed(() => Boolean(expandedList.value));
const PREVIEW_SIZE = 3;
const PAGE_SIZE = 5;
let previewScroll = 0;
let openedFromPreview = false;
const isAppMode = computed(() => route.query.layout === 'app' || sessionStorage.getItem('rcm_layout_mode') === 'app');
const profile = ref({ email: '', phone: '', address: '' });
const agentProfile = ref(null);
const outlets = ref([]);
const couriers = ref([]);
const notifications = computed(() => [...notificationStore.items].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0)));
const unreadCount = computed(() => notificationStore.unreadCount);
const applicationRecords = ref([]);
const showApplicationFilters = ref(false);
const applicationTypeFilter = ref('');
const applicationStatusFilter = ref('');
const applicationReviewFilter = ref('');
const applicationSearch = ref('');
const currentTab = ref(['notifications', 'outlets', 'couriers'].includes(route.query.tab) ? route.query.tab : 'notifications');
const agentTabs = [
  { key: 'notifications', icon: Bell },
  { key: 'outlets', icon: Shop }, { key: 'couriers', icon: User }
];
const demoIdentity = computed(() => ['usr-cit-01', 'usr-002', 'usr-agt-01', 'usr-003'].includes(authStore.userProfile?.id));
const displayName = computed(() => demoIdentity.value ? t(isCitizen.value ? 'my.demoCitizenName' : 'my.demoAgentName') : (authStore.userProfile?.name || ''));
const contactDialogOpen = ref(false);
const courierDialogOpen = ref(false);
const passwordDialogOpen = ref(false);
const faceDialogOpen = ref(false);
const faceToken = ref('');
const smsCountdown = ref(0);
const demoSmsCode = ref('');
let smsTimer;
const saving = ref(false);
const contactForm = reactive({ email: '', phone: '', address: '' });
const courierForm = reactive({ id: '', name: '', phone: '', vehicleNo: '', active: true });
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '', smsCode: '' });

// 受信设备列表：当前账号已登录设备，删除前需手机号或人脸验证
const devices = ref([]);
const deviceDialogOpen = ref(false);
const deviceVerifyOpen = ref(false);
const deviceFaceDialogOpen = ref(false);
const pendingDevice = ref(null);
const deviceVerifyMethod = ref('sms');
const deviceSmsCode = ref('');
const deviceDemoSmsCode = ref('');
const deviceSmsCountdown = ref(0);
const deviceFaceToken = ref('');
let deviceSmsTimer;
const deviceVerified = computed(() => (deviceVerifyMethod.value === 'sms' ? /^\d{6}$/.test(deviceSmsCode.value) : !!deviceFaceToken.value));

async function loadData() {
  try {
    const [account] = await Promise.all([getMyProfile(), notificationStore.refresh(), isCitizen.value ? citizenStore.fetchFamilies() : Promise.resolve()]);
    profile.value = account;
    if (isCitizen.value) refreshApplicationHistory();
    if (!isCitizen.value) {
      const [agent, sites, people] = await Promise.all([getAgentProfile(), getMyAgentCenters(), getMyCouriers()]);
      agentProfile.value = agent;
      outlets.value = sites;
      couriers.value = people;
    }
  } catch {
    ElMessage.error(t('my.loadFailed'));
  }
}

const applicationSourceCodes = new Set(['TRF', 'TRM', 'SPL', 'HED', 'UNF', 'DRG']);
const filteredApplicationRecords = computed(() => applicationRecords.value.filter((record) => {
  const mode = applicationReviewMode(record);
  return (!applicationTypeFilter.value || record.sourceCode === applicationTypeFilter.value)
    && (!applicationStatusFilter.value || applicationStatusKey(record) === applicationStatusFilter.value)
    && (!applicationReviewFilter.value || mode === applicationReviewFilter.value)
    && (!applicationSearch.value || String(record.id || '').toLowerCase().includes(applicationSearch.value.toLowerCase()));
}));
const listTotal = computed(() => expandedList.value === 'applications' ? filteredApplicationRecords.value.length : notifications.value.length);
const pageCount = computed(() => Math.max(1, Math.ceil(listTotal.value / PAGE_SIZE)));
const listPage = computed(() => {
  const requested = Number(route.query.page);
  return Math.min(pageCount.value, Number.isSafeInteger(requested) && requested > 0 ? requested : 1);
});
// Keep the indicators within narrow phone screens, even for long histories.
const visiblePageIndicators = computed(() => {
  const count = Math.min(7, pageCount.value);
  const start = Math.max(1, Math.min(listPage.value - 3, pageCount.value - count + 1));
  return Array.from({ length: count }, (_, index) => start + index);
});
const isRtl = computed(() => ['ar', 'ckb', 'ku'].includes(locale.value));
let listSwipe = null;
let suppressClickUntil = 0;

function startListSwipe(event) {
  listSwipe = null;
  if (!isListPage.value || pageCount.value <= 1 || event.touches.length !== 1
    || !event.target.closest('[data-my-list]')
    || event.target.closest('input, textarea, select, [role="combobox"], [contenteditable="true"]')) return;
  const touch = event.touches[0];
  listSwipe = { id: touch.identifier, x: touch.clientX, y: touch.clientY, time: Date.now() };
}

function cancelListSwipe() { listSwipe = null; }

function endListSwipe(event) {
  const start = listSwipe;
  listSwipe = null;
  if (!start || event.touches.length) return;
  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
  if (!touch) return;
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (Date.now() - start.time > 1000 || Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  suppressClickUntil = Date.now() + 400;
  changeListPage(listPage.value + ((isRtl.value ? dx > 0 : dx < 0) ? 1 : -1));
}

function guardSwipeClick(event) {
  if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
}

async function handlePaginationKey(event) {
  const pagination = event.currentTarget;
  const delta = { ArrowLeft: isRtl.value ? 1 : -1, ArrowRight: isRtl.value ? -1 : 1 }[event.key];
  if (delta === undefined && event.key !== 'Home' && event.key !== 'End') return;
  event.preventDefault();
  await changeListPage(event.key === 'Home' ? 1 : event.key === 'End' ? pageCount.value : listPage.value + delta);
  await nextTick();
  pagination.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
}
const displayedApplications = computed(() => isListPage.value
  ? filteredApplicationRecords.value.slice((listPage.value - 1) * PAGE_SIZE, listPage.value * PAGE_SIZE)
  : applicationRecords.value.slice(0, PREVIEW_SIZE));
const displayedNotifications = computed(() => isListPage.value
  ? notifications.value.slice((listPage.value - 1) * PAGE_SIZE, listPage.value * PAGE_SIZE)
  : notifications.value.slice(0, PREVIEW_SIZE));

function openList(list) {
  previewScroll = document.querySelector('main')?.scrollTop || window.scrollY;
  openedFromPreview = true;
  if (list === 'applications') { clearApplicationFilters(); showApplicationFilters.value = true; }
  router.push({ query: { ...route.query, list, page: undefined } });
}

function closeList() {
  if (openedFromPreview) router.back();
  else router.replace({ query: { ...route.query, list: undefined, page: undefined } });
}

function changeListPage(page) {
  const next = Math.max(1, Math.min(pageCount.value, page));
  return router.replace({ query: { ...route.query, page: next === 1 ? undefined : String(next) } });
}

watch([expandedList, listPage], async ([list], [previousList]) => {
  if (!list && !previousList) return;
  await nextTick();
  const top = list ? 0 : previewScroll;
  if (isAppMode.value) document.querySelector('main')?.scrollTo({ top, behavior: 'instant' });
  window.scrollTo({ top: isAppMode.value ? 0 : top, behavior: 'instant' });
  if (!list) openedFromPreview = false;
});
watch([applicationTypeFilter, applicationStatusFilter, applicationReviewFilter, applicationSearch], () => {
  if (expandedList.value === 'applications' && route.query.page) changeListPage(1);
});

function getApplicationSourceCode(ticket) {
  if (applicationSourceCodes.has(ticket.sourceCode)) return ticket.sourceCode;
  const source = `${ticket.source || ''} ${ticket.categoryType || ''} ${ticket.appType || ''}`.toLowerCase();
  if (/成员.*转移|member transfer|member entry/.test(source)) return 'TRM';
  if (/代理.*转移|agent transfer|transfer agent/.test(source)) return 'TRF';
  if (/分户|split household/.test(source)) return 'SPL';
  if (/变更户主|change head/.test(source)) return 'HED';
  if (/解冻|unfreeze/.test(source)) return 'UNF';
  return '';
}

function refreshApplicationHistory() {
  const cardNo = citizenStore.currentFamily?.rationCardNo || authStore.userProfile?.cardNo || 'RC-10029381';
  applicationRecords.value = getSharedTickets()
    .map((ticket) => ({ ...ticket, sourceCode: getApplicationSourceCode(ticket) }))
    .filter((ticket) => ticket.sourceCode && ticket.cardNo === cardNo)
    .sort((a, b) => new Date(String(b.submittedAt || '').replace(' ', 'T')) - new Date(String(a.submittedAt || '').replace(' ', 'T')));
}

function applicationStatusKey(record) {
  const value = `${record.status || ''} ${record.managerDecision || ''}`.toLowerCase();
  if (/reject|denied|驳回|未通过|不予|مرفوض|رفض|پەسەند نەکرا/.test(value)) return 'rejected';
  if (/approv|passed|通过|核准|生效|办结|批准|تمت الموافقة|مقبول|پەسەندکرا/.test(value)) return 'approved';
  if (/pending|待|review|审核中|قيد|انتظار|پشکنین/.test(value)) return 'pending';
  return 'pending';
}

function applicationStatusType(record) {
  return { approved: 'success', pending: 'warning', rejected: 'danger' }[applicationStatusKey(record)];
}

function applicationReviewMode(record) {
  if (record.reviewMode === 'automatic' || record.reviewMode === 'manual') return record.reviewMode;
  return applicationStatusKey(record) === 'pending' ? 'manual' : 'automatic';
}

function clearApplicationFilters() {
  applicationTypeFilter.value = '';
  applicationStatusFilter.value = '';
  applicationReviewFilter.value = '';
  applicationSearch.value = '';
}

function applicationResult(record) {
  const status = applicationStatusKey(record);
  if (locale.value === 'ar' || locale.value === 'ckb') return t(`my.applicationStatuses.${status}`);
  return record.managerNotes || record.auditNotes || record.managerOpinion || record.staffOpinion || t(`my.applicationStatuses.${status}`);
}

function formatDate(value) {
  if (!value) return '';
  const language = { zh: 'zh-CN', en: 'en-US', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-US';
  return new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(new Date(value));
}

function openContactDialog() {
  Object.assign(contactForm, profile.value);
  faceToken.value = '';
  contactDialogOpen.value = true;
}

async function saveContact() {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email) || !/^\+?[\d\s-]{7,20}$/.test(contactForm.phone) || !contactForm.address.trim()) {
    ElMessage.warning(t('my.invalidProfile'));
    return;
  }
  if (isCitizen.value && contactForm.phone !== profile.value.phone && !faceToken.value) {
    contactDialogOpen.value = false;
    faceDialogOpen.value = true;
    return;
  }
  saving.value = true;
  try {
    profile.value = await updateMyProfile({ ...contactForm, faceToken: faceToken.value });
    faceToken.value = '';
    contactDialogOpen.value = false;
    ElMessage.success(t('my.contactSaved'));
  } catch {
    contactDialogOpen.value = true;
  } finally { saving.value = false; }
}

async function onFaceVerified(payload) {
  try {
    const result = await verifyMyPhoneFace({ ...payload, purpose: 'phone-change' });
    if (!result?.token) throw new Error('Missing face verification token');
    faceToken.value = result.token;
    await saveContact();
  } catch {
    contactDialogOpen.value = true;
  }
}

async function selectTab(key) {
  currentTab.value = key;
  try {
    if (key === 'outlets') outlets.value = await getMyAgentCenters();
    if (key === 'couriers') couriers.value = await getMyCouriers();
    if (key === 'outlets' || key === 'couriers') await notificationStore.markSectionRead(key);
  } catch { /* The request layer shows the error. */ }
}

async function markAllRead() {
  const ids = notifications.value.filter(item => !item.read).map(item => item.id);
  if (!ids.length) return;
  try {
    await notificationStore.markRead(ids);
  } catch { /* 请求层负责提示 */ }
}

async function openNotification(item) {
  if (!item.read) {
    try {
      await notificationStore.markRead([item.id]);
    } catch { /* 仍允许查看对应业务 */ }
  }
  if (item.tab) await selectTab(item.tab);
  const target = notificationUrl(item);
  const [path, search] = target.split('?');
  const query = Object.fromEntries(new URLSearchParams(search || ''));
  if (isAppMode.value) query.layout = 'app';
  await router.push({ path, query });
  if (item.type === 'complaint') window.dispatchEvent(new CustomEvent('rcm-open-complaints', { detail: { id: item.complaintId } }));
}

function displayOutletName(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoOutletName') : (outlet.name || outlet.centerName || '');
}

function displayCenter(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoCenterName') : (outlet.centerName || '');
}

function displayOutletAddress(outlet) {
  return outlet.id === 'FA-00128' ? t('my.demoAgentAddress') : (outlet.address || profile.value.address);
}

function outletStatus(outlet) {
  return /注销|停用|Cancel|Inactive/i.test(outlet.status || '') ? t('my.outletInactive') : t('my.outletActive');
}

function openCourierDialog(courier) {
  Object.assign(courierForm, courier || { id: '', name: '', phone: '', vehicleNo: '', active: true });
  courierDialogOpen.value = true;
}

async function saveCourier() {
  if (!courierForm.name.trim() || !/^\+?[\d\s-]{7,20}$/.test(courierForm.phone)) {
    ElMessage.warning(t('my.invalidCourier'));
    return;
  }
  saving.value = true;
  try {
    const payload = { name: courierForm.name, phone: courierForm.phone, vehicleNo: courierForm.vehicleNo, active: courierForm.active };
    if (courierForm.id) await updateMyCourier(courierForm.id, payload);
    else await createMyCourier(payload);
    couriers.value = await getMyCouriers();
    await notificationStore.refresh();
    courierDialogOpen.value = false;
    ElMessage.success(t('my.courierSaved'));
  } catch { /* 请求层负责提示 */ }
  finally { saving.value = false; }
}

async function removeCourier(courier) {
  try {
    await ElMessageBox.confirm(t('my.deleteCourierConfirm'), t('my.deleteCourier'), { type: 'warning' });
    await deleteMyCourier(courier.id);
    couriers.value = await getMyCouriers();
    await notificationStore.refresh();
    ElMessage.success(t('my.courierDeleted'));
  } catch { /* 用户取消或请求层已提示 */ }
}

function resetPasswordForm() {
  Object.assign(passwordForm, { currentPassword: '', newPassword: '', confirmPassword: '', smsCode: '' });
  demoSmsCode.value = '';
}

async function sendPasswordSms() {
  try {
    const result = await sendMyPasswordCode();
    demoSmsCode.value = import.meta.env.VITE_APP_MOCK_MODE === 'true' ? (result.demoCode || '') : '';
    smsCountdown.value = 60;
    clearInterval(smsTimer);
    smsTimer = setInterval(() => { if (--smsCountdown.value <= 0) clearInterval(smsTimer); }, 1000);
    ElMessage.success(t('my.smsSent'));
  } catch { /* The request layer shows the error. */ }
}

async function savePassword() {
  if (passwordForm.newPassword.length < 8) return ElMessage.warning(t('my.passwordTooShort'));
  if (passwordForm.newPassword !== passwordForm.confirmPassword) return ElMessage.warning(t('my.passwordMismatch'));
  if (isCitizen.value && !/^\d{6}$/.test(passwordForm.smsCode)) return ElMessage.warning(t('my.invalidSmsCode'));
  saving.value = true;
  try {
    await changeMyPassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword, smsCode: passwordForm.smsCode });
    passwordDialogOpen.value = false;
    resetPasswordForm();
    ElMessage.success(t('my.passwordChanged'));
  } catch { /* 请求层负责提示 */ }
  finally { saving.value = false; }
}

function deviceIcon(platform) {
  return platform === 'ios' || platform === 'android' ? Iphone : Monitor;
}

function formatDeviceTime(value) {
  if (!value) return '';
  const language = { zh: 'zh-CN', en: 'en-US', ar: 'ar-IQ', ckb: 'ckb-IQ' }[locale.value] || 'en-US';
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
}

async function openDeviceDialog() {
  deviceDialogOpen.value = true;
  try {
    devices.value = await getMyDevices();
  } catch { /* 请求层负责提示 */ }
}

function openDeviceVerify(device) {
  pendingDevice.value = device;
  deviceVerifyMethod.value = 'sms';
  deviceSmsCode.value = '';
  deviceDemoSmsCode.value = '';
  deviceFaceToken.value = '';
  deviceVerifyOpen.value = true;
}

function resetDeviceVerify() {
  clearInterval(deviceSmsTimer);
  deviceVerifyOpen.value = false;
  pendingDevice.value = null;
  deviceVerifyMethod.value = 'sms';
  deviceSmsCode.value = '';
  deviceDemoSmsCode.value = '';
  deviceSmsCountdown.value = 0;
  deviceFaceToken.value = '';
}

async function sendDeviceSms() {
  try {
    const result = await sendMyDeviceCode();
    deviceDemoSmsCode.value = import.meta.env.VITE_APP_MOCK_MODE === 'true' ? (result.demoCode || '') : '';
    deviceSmsCountdown.value = 60;
    clearInterval(deviceSmsTimer);
    deviceSmsTimer = setInterval(() => { if (--deviceSmsCountdown.value <= 0) clearInterval(deviceSmsTimer); }, 1000);
    ElMessage.success(t('my.smsSent'));
  } catch { /* 请求层负责提示 */ }
}

async function onDeviceFaceVerified(payload) {
  try {
    const result = await verifyMyDeviceFace({ ...payload, purpose: 'device-remove' });
    if (!result?.token) throw new Error('Missing face verification token');
    deviceFaceToken.value = result.token;
    deviceVerifyOpen.value = true;
  } catch {
    deviceVerifyOpen.value = true;
  }
}

async function confirmDeviceRemoval() {
  if (!pendingDevice.value || !deviceVerified.value) return;
  saving.value = true;
  try {
    const payload = deviceVerifyMethod.value === 'sms' ? { smsCode: deviceSmsCode.value } : { faceToken: deviceFaceToken.value };
    await deleteMyDevice(pendingDevice.value.id, payload);
    devices.value = await getMyDevices();
    resetDeviceVerify();
    ElMessage.success(t('my.deviceRemoveSuccess'));
  } catch { /* 请求层负责提示 */ }
  finally { saving.value = false; }
}

async function handleLogout() {
  await authStore.logout();
  await router.replace('/login');
}

onMounted(async () => {
  await loadData();
  window.addEventListener('storage', refreshApplicationHistory);
  if (route.query.tab === 'outlets' || route.query.tab === 'couriers') await selectTab(route.query.tab);
});
watch(role, loadData);
watch(() => route.query.tab, (tab) => { if (agentTabs.some(item => item.key === tab)) selectTab(tab); });
onBeforeUnmount(() => {
  clearInterval(smsTimer);
  clearInterval(deviceSmsTimer);
  window.removeEventListener('storage', refreshApplicationHistory);
});
</script>

<style scoped>
.my-swipe-list { touch-action: pan-y pinch-zoom; }
.my-page-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 44px;
  padding: 0 3px;
  cursor: pointer;
  border-radius: 8px;
}
.my-page-indicator span {
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #d1d5d8;
  transition: background-color 160ms;
}
.my-page-indicator.is-current span { background: #0067c0; }
.my-page-indicator:focus-visible { outline: 2px solid #0067c0; outline-offset: -2px; }
</style>
