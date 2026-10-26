<template>
  <div class="agent-analytics-view space-y-4">
    <!-- 库存台账：拆分后的代理端独立大模块 (称重误差与盘盈盘亏统计) -->
    <AgentInventoryOverview />
  </div>
</template>

<script setup>
import AgentInventoryOverview from './components/AgentInventoryOverview.vue';
</script>
