<template>
  <div class="agent-hierarchy-gis-map relative bg-[#12241A] rounded-lg border border-[#1F3326] overflow-hidden shadow-lg select-none">
    <!-- 顶部 GIS 地图控制台与图层工具栏 -->
    <div class="absolute top-3 start-3 end-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      <!-- 视角与定位状态指示 -->
      <div class="flex items-center gap-2 pointer-events-auto bg-[#1B3123]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#43554B]/80 text-xs shadow-md">
        <span class="w-2.5 h-2.5 rounded-full bg-[#6FBF92] animate-ping"></span>
        <span class="font-bold text-white tracking-wide">巴格达 GIS 空间网格</span>
        <span class="text-[#8A9A8F] font-mono text-[11px] hidden sm:inline">33.315°N, 44.366°E</span>
        <el-tag size="small" type="primary" effect="dark" class="scale-90 font-mono">
          {{ selectedDistrictName || '全省运营总览' }}
        </el-tag>
      </div>

      <!-- 图层开关与缩放控制按钮 -->
      <div class="flex items-center gap-1.5 pointer-events-auto bg-[#1B3123]/90 backdrop-blur-md p-1 rounded-lg border border-[#43554B]/80 shadow-md">
        <el-tooltip content="区域边界图层" placement="top">
          <button
            class="px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            :class="showDistrictBoundaries ? 'bg-[#326445] text-white' : 'text-[#8A9A8F] hover:text-[#D9E5DB]'"
            @click="showDistrictBoundaries = !showDistrictBoundaries"
          >
            <span>区划</span>
          </button>
        </el-tooltip>

        <el-tooltip content="街道网格覆盖半径 (500~1500m)" placement="top">
          <button
            class="px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            :class="showStreetRadius ? 'bg-[#326445] text-white' : 'text-[#8A9A8F] hover:text-[#D9E5DB]'"
            @click="showStreetRadius = !showStreetRadius"
          >
            <span>网格半径</span>
          </button>
        </el-tooltip>

        <div class="w-px h-3.5 bg-[#43554B] mx-0.5"></div>

        <button
          class="w-6 h-6 rounded-lg text-[#C9DBCE] hover:bg-[#1F3326] flex items-center justify-center text-sm font-bold"
          title="放大"
          @click="zoomIn"
        >
          +
        </button>
        <button
          class="w-6 h-6 rounded-lg text-[#C9DBCE] hover:bg-[#1F3326] flex items-center justify-center text-sm font-bold"
          title="缩小"
          @click="zoomOut"
        >
          -
        </button>
        <button
          class="w-6 h-6 rounded-lg text-[#C9DBCE] hover:bg-[#1F3326] flex items-center justify-center text-xs"
          title="重置视角"
          @click="resetView"
        >
          <el-icon><Refresh /></el-icon>
        </button>
      </div>
    </div>

    <!-- 底部 GIS 图例 (Legend) 与饱和度健康指南 -->
    <div class="absolute bottom-3 start-3 z-20 pointer-events-none">
      <div class="pointer-events-auto bg-[#1B3123]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1F3326] text-[10px] sm:text-xs text-[#C9DBCE] space-y-1 shadow-md max-w-[280px] sm:max-w-none">
        <div class="font-bold text-white flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#5C8A6B]"></span>
          <span>街道代理 1,500 户负荷图例：</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-[#3E9B68] shadow-xs"></span>
            <span>正常 (<1400户)</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-[#D3AF62] shadow-xs"></span>
            <span>临界 (1400~1499户)</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="w-2.5 h-2.5 rounded-full bg-[#C04442] animate-pulse shadow-xs"></span>
            <span class="text-[#D0827F] font-bold">饱和锁定 (1500户)</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 右下角选中的网格卡片速览 -->
    <div
      v-if="hoveredOrActiveStation"
      class="absolute bottom-3 end-3 z-20 pointer-events-none max-w-[240px] sm:max-w-[290px]"
    >
      <div class="pointer-events-auto bg-[#1B3123]/95 backdrop-blur-md p-3 rounded-lg border border-[#5C8A6B]/60 shadow-xl space-y-1.5 text-xs text-[#D9E5DB] animate-fadeIn">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white truncate">{{ hoveredOrActiveStation.storeName }}</span>
          <el-tag
            size="small"
            :type="hoveredOrActiveStation.lockStatus === 'SATURATED_LOCKED' ? 'danger' : (hoveredOrActiveStation.lockStatus === 'WARNING' ? 'warning' : 'success')"
            effect="dark"
            class="scale-90 shrink-0 font-bold"
          >
            {{ hoveredOrActiveStation.householdsCount }} / 1500 户
          </el-tag>
        </div>
        <div class="text-[11px] text-[#8A9A8F] truncate">
          {{ hoveredOrActiveStation.district }} · {{ hoveredOrActiveStation.streetName }}
        </div>
        <div class="flex items-center justify-between text-[10px] text-[#8A9A8F] pt-1 border-t border-[#1F3326]">
          <span>经营人：{{ hoveredOrActiveStation.name }}</span>
          <span class="font-mono text-[#6FBF92]">{{ hoveredOrActiveStation.saturationRate }}%</span>
        </div>
      </div>
    </div>

    <!-- SVG 矢量 GIS 地图画布 (支持缩放与平移变换) -->
    <div
      ref="mapContainerRef"
      class="w-full h-[320px] sm:h-[420px] lg:h-[480px] overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center relative touch-pan-x touch-pan-y"
      @mousedown="startPan"
      @mousemove="onPan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @wheel.prevent="onWheel"
    >
      <svg
        class="w-full h-full transform transition-transform duration-75 origin-center"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})` }"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 1. 背景科技经纬网格线 -->
        <defs>
          <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2A3A30" stroke-width="0.7" opacity="0.6" />
            <circle cx="0" cy="0" r="1" fill="#43554B" />
          </pattern>

          <!-- 径向辐射渐变 (正常) -->
          <radialGradient id="gradNormal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#3E9B68" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3E9B68" stop-opacity="0.0" />
          </radialGradient>

          <!-- 径向辐射渐变 (预警) -->
          <radialGradient id="gradWarning" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D9B567" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#D9B567" stop-opacity="0.0" />
          </radialGradient>

          <!-- 径向辐射渐变 (饱和锁定) -->
          <radialGradient id="gradSaturated" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#C04442" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#C04442" stop-opacity="0.0" />
          </radialGradient>
        </defs>

        <!-- 底层网格背景板 -->
        <rect width="800" height="600" fill="#1A241E" />
        <rect width="800" height="600" fill="url(#gisGrid)" />

        <!-- 2. 底格里斯河水系河流贯通 (底格里斯河从西北向东南纵贯巴格达) -->
        <g class="river-layer opacity-80">
          <path
            d="M 380 0 Q 360 120 400 200 T 370 320 T 420 440 T 490 600"
            fill="none"
            stroke="#2F7A50"
            stroke-width="26"
            stroke-linecap="round"
            opacity="0.25"
          />
          <path
            d="M 380 0 Q 360 120 400 200 T 370 320 T 420 440 T 490 600"
            fill="none"
            stroke="#6FBF92"
            stroke-width="12"
            stroke-linecap="round"
            opacity="0.4"
          />
          <!-- 河流文字标注 -->
          <text x="390" y="80" fill="#6FBF92" font-size="11" font-weight="bold" opacity="0.6" font-family="sans-serif">
            底格里斯河 (Tigris River)
          </text>
        </g>

        <!-- 3. 巴格达城市骨干公路路网 (环线与射线) -->
        <g class="road-network-layer stroke-[#43554B]/60" stroke-width="2" fill="none">
          <!-- 城市内环高架线 -->
          <ellipse cx="400" cy="300" rx="260" ry="200" stroke-dasharray="6,4" opacity="0.4" />
          <ellipse cx="400" cy="300" rx="150" ry="120" stroke="#43554B" stroke-width="2" opacity="0.6" />
          <!-- 机场主干高速公路 (卡尔赫方向) -->
          <line x1="80" y1="420" x2="380" y2="300" stroke="#58685D" stroke-width="3" opacity="0.7" />
          <line x1="400" y1="300" x2="720" y2="180" stroke="#58685D" stroke-width="2.5" opacity="0.7" />
          <line x1="400" y1="300" x2="420" y2="580" stroke="#43554B" stroke-width="2" opacity="0.5" />
        </g>

        <!-- 4. 区域行政边界与网格多边形图层 (District Sectors) -->
        <g v-if="showDistrictBoundaries" class="districts-layer transition-opacity duration-300">
          <!-- 4.1 卡尔赫区 (Al-Karkh - 西岸区域) -->
          <polygon
            points="120,120 370,160 360,460 150,480 90,320"
            fill="#24483A"
            fill-opacity="0.18"
            stroke="#5C8A6B"
            stroke-width="2"
            stroke-dasharray="4,2"
            class="transition-colors hover:fill-opacity-30 cursor-pointer"
            @click="selectDistrict('卡尔赫区')"
          />
          <text x="210" y="160" fill="#AECBB8" font-size="14" font-weight="bold">
            卡尔赫区 (Al-Karkh)
          </text>
          <text x="210" y="180" fill="#7FA48C" font-size="10">
            3个街道代销站 · 4,100户签约
          </text>

          <!-- 4.2 鲁萨法区 (Al-Rusafa - 东岸区域) -->
          <polygon
            points="410,220 540,240 520,520 430,480 390,340"
            fill="#2F5B44"
            fill-opacity="0.15"
            stroke="#3E9B68"
            stroke-width="2"
            stroke-dasharray="4,2"
            class="transition-colors hover:fill-opacity-30 cursor-pointer"
            @click="selectDistrict('鲁萨法区')"
          />
          <text x="440" y="250" fill="#A7D9BC" font-size="13" font-weight="bold">
            鲁萨法区 (Al-Rusafa)
          </text>
          <text x="440" y="270" fill="#6FBF92" font-size="10">
            2个街道代销站 · 1,950户
          </text>

          <!-- 4.3 萨德尔城区 (Sadr City - 东北高密区域) -->
          <polygon
            points="530,90 730,120 710,320 520,280"
            fill="#6B5321"
            fill-opacity="0.18"
            stroke="#C9A13B"
            stroke-width="2"
            stroke-dasharray="4,2"
            class="transition-colors hover:fill-opacity-30 cursor-pointer"
            @click="selectDistrict('萨德尔城区')"
          />
          <text x="560" y="125" fill="#E5CEA1" font-size="13" font-weight="bold">
            萨德尔城区 (Sadr City)
          </text>
          <text x="560" y="145" fill="#DFC08B" font-size="10">
            2个街道代销站 · 1,600户
          </text>
        </g>

        <!-- 5. 街道服务半径与网格覆盖圈 (500~1500m 半径) -->
        <g v-if="showStreetRadius" class="radius-layer pointer-events-none">
          <g v-for="st in allStreetStations" :key="'rad-' + st.id">
            <!-- 覆盖圆圈 -->
            <circle
              :cx="st.gisCoords.x"
              :cy="st.gisCoords.y"
              :r="st.gisCoords.radiusMeters / 10"
              :fill="st.lockStatus === 'SATURATED_LOCKED' ? 'url(#gradSaturated)' : (st.lockStatus === 'WARNING' ? 'url(#gradWarning)' : 'url(#gradNormal)')"
              :stroke="st.lockStatus === 'SATURATED_LOCKED' ? '#C04442' : (st.lockStatus === 'WARNING' ? '#D9B567' : '#3E9B68')"
              stroke-width="1.2"
              stroke-dasharray="3,3"
              opacity="0.8"
            />
            <!-- 范围虚线标记 -->
            <text
              :x="st.gisCoords.x"
              :y="st.gisCoords.y + (st.gisCoords.radiusMeters / 10) + 12"
              fill="#8A9A8F"
              font-size="9"
              text-anchor="middle"
              opacity="0.8"
            >
              网格服务半径 {{ st.gisCoords.radiusMeters }}m
            </text>
          </g>
        </g>

        <!-- 6. 街道代理站点标记点 (Street Station Marker Pins) -->
        <g class="markers-layer">
          <g
            v-for="st in allStreetStations"
            :key="st.id"
            class="station-node cursor-pointer transition-all duration-200"
            :class="{ 'opacity-40': activeStationId && activeStationId !== st.id }"
            @click="handleStationClick(st)"
            @mouseenter="hoveredOrActiveStation = st"
            @mouseleave="onMarkerMouseLeave"
          >
            <!-- 饱和锁定脉冲波动效 (针对 1,500 户网格饱和点) -->
            <g v-if="st.lockStatus === 'SATURATED_LOCKED'">
              <circle
                :cx="st.gisCoords.x"
                :cy="st.gisCoords.y"
                r="22"
                fill="none"
                stroke="#C04442"
                stroke-width="2"
                class="animate-ping origin-center"
              />
              <circle
                :cx="st.gisCoords.x"
                :cy="st.gisCoords.y"
                r="30"
                fill="none"
                stroke="#D0827F"
                stroke-width="1"
                stroke-dasharray="4,4"
                opacity="0.6"
              />
            </g>

            <!-- 选中站点时的聚焦光环 -->
            <circle
              v-if="activeStationId === st.id"
              :cx="st.gisCoords.x"
              :cy="st.gisCoords.y"
              r="24"
              fill="none"
              stroke="#6FBF92"
              stroke-width="3"
              stroke-dasharray="6,2"
              class="animate-spin"
            />

            <!-- 站点外圈底座 -->
            <circle
              :cx="st.gisCoords.x"
              :cy="st.gisCoords.y"
              r="14"
              :fill="st.lockStatus === 'SATURATED_LOCKED' ? '#6E2F2E' : (st.lockStatus === 'WARNING' ? '#6B5321' : '#24483A')"
              :stroke="st.lockStatus === 'SATURATED_LOCKED' ? '#C04442' : (st.lockStatus === 'WARNING' ? '#D9B567' : '#3E9B68')"
              stroke-width="2.5"
            />

            <!-- 站点中心圆点图标 -->
            <circle
              :cx="st.gisCoords.x"
              :cy="st.gisCoords.y"
              r="6"
              :fill="st.lockStatus === 'SATURATED_LOCKED' ? '#E8B7B5' : (st.lockStatus === 'WARNING' ? '#E9D5A3' : '#C7E9D5')"
            />

            <!-- “自己”站点皇冠/星标标识 (FA-00128) -->
            <polygon
              v-if="st.isSelf"
              :points="`${st.gisCoords.x},${st.gisCoords.y - 20} ${st.gisCoords.x - 5},${st.gisCoords.y - 14} ${st.gisCoords.x + 5},${st.gisCoords.y - 14}`"
              fill="#D9B567"
            />

            <!-- 站点名称与户数角标看板 (横幅胶囊) -->
            <g :transform="`translate(${st.gisCoords.x}, ${st.gisCoords.y - 26})`">
              <!-- 背景胶囊 -->
              <rect
                x="-65"
                y="-13"
                width="130"
                height="22"
                rx="6"
                :fill="activeStationId === st.id ? '#24483A' : '#1F3326'"
                :stroke="st.lockStatus === 'SATURATED_LOCKED' ? '#C04442' : (activeStationId === st.id ? '#7FA48C' : '#43554B')"
                stroke-width="1.5"
                class="shadow-sm"
              />

              <!-- 文字内容 -->
              <text
                x="0"
                y="2"
                text-anchor="middle"
                font-size="10"
                font-weight="bold"
                fill="#ffffff"
                font-family="sans-serif"
              >
                {{ st.streetName.replace('街道', '') }}: {{ st.householdsCount }}/1500户
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Refresh } from '@element-plus/icons-vue';

const props = defineProps({
  // 树状层级数据
  hierarchyTree: {
    type: Array,
    default: () => []
  },
  // 当前高亮选中的街道代理 ID
  activeStationId: {
    type: String,
    default: 'FA-00128'
  }
});

const emit = defineEmits(['select-station', 'select-district']);

// 图层开关
const showDistrictBoundaries = ref(true);
const showStreetRadius = ref(true);
const selectedDistrictName = ref('');

// 缩放平移交互
const zoomLevel = ref(1);
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const startMouseX = ref(0);
const startMouseY = ref(0);

// 浮窗状态暂存
const hoveredOrActiveStation = ref(null);

// 提取所有底层的街道代理网点
const allStreetStations = computed(() => {
  const result = [];
  if (!props.hierarchyTree || props.hierarchyTree.length === 0) return result;

  const traverse = (node) => {
    if (node.level === 'STREET' && node.gisCoords) {
      result.push(node);
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };

  props.hierarchyTree.forEach(traverse);
  return result;
});

// 初始化选中的网点数据
const activeStationObj = computed(() => {
  return allStreetStations.value.find((s) => s.id === props.activeStationId) || allStreetStations.value[0];
});

// 监听或重置浮窗卡片
const onMarkerMouseLeave = () => {
  if (props.activeStationId) {
    hoveredOrActiveStation.value = activeStationObj.value;
  } else {
    hoveredOrActiveStation.value = null;
  }
};

const handleStationClick = (st) => {
  hoveredOrActiveStation.value = st;
  emit('select-station', st);
};

const selectDistrict = (districtName) => {
  selectedDistrictName.value = districtName;
  emit('select-district', districtName);
};

// 缩放与平移控制器
const zoomIn = () => {
  if (zoomLevel.value < 2.5) {
    zoomLevel.value = parseFloat((zoomLevel.value + 0.25).toFixed(2));
  }
};

const zoomOut = () => {
  if (zoomLevel.value > 0.75) {
    zoomLevel.value = parseFloat((zoomLevel.value - 0.25).toFixed(2));
  }
};

const resetView = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
  selectedDistrictName.value = '';
};

const onWheel = (e) => {
  if (e.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
};

const startPan = (e) => {
  isPanning.value = true;
  startMouseX.value = e.clientX - panX.value;
  startMouseY.value = e.clientY - panY.value;
};

const onPan = (e) => {
  if (!isPanning.value) return;
  panX.value = e.clientX - startMouseX.value;
  panY.value = e.clientY - startMouseY.value;
};

const endPan = () => {
  isPanning.value = false;
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
