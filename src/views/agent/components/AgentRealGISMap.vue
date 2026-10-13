<template>
  <div class="agent-real-gis-map relative bg-slate-900 rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
    <!-- 地图顶端控制与状态信息栏 -->
    <div class="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
      <div class="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="font-bold text-slate-800">伊拉克真实在线地理信息系统 (GIS)</span>
        <el-tag size="small" type="primary" effect="dark" class="scale-90 font-mono">
          {{ targetLocationTitle || '巴格达中心区' }}
        </el-tag>
      </div>

      <!-- 热力图与图层工具栏 -->
      <div class="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md text-xs">
        <button
          class="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1"
          :class="showHeatmap ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          @click="toggleHeatmap"
        >
          <span>🔥 公民分布热力图</span>
        </button>

        <button
          class="px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1"
          :class="showRadiusCircle ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="toggleRadius"
        >
          <span>网格辐射圈</span>
        </button>

        <button
          class="px-2 py-1 rounded-lg text-slate-700 hover:bg-slate-100 font-bold"
          title="复位至巴格达中心"
          @click="resetToBaghdad"
        >
          <el-icon><Aim /></el-icon>
        </button>
      </div>
    </div>

    <!-- 地图右下角热力密度图例 -->
    <div class="absolute bottom-3 right-3 z-[1000] pointer-events-none">
      <div class="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-[11px] shadow-md space-y-1">
        <div class="font-bold text-slate-800 flex items-center justify-between gap-3">
          <span>管辖公民数量热力密度</span>
          <span class="font-mono text-slate-400 text-[10px]">人/网格</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-slate-400">低密</span>
          <div class="w-24 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-emerald-400 via-amber-400 to-rose-600"></div>
          <span class="text-[10px] text-rose-600 font-bold">高密</span>
        </div>
      </div>
    </div>

    <!-- 真实 Leaflet 在线地图容器 (高度根据屏幕自适应) -->
    <div ref="mapContainerRef" class="w-full h-[320px] sm:h-[380px] lg:h-[420px] z-10"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Aim } from '@element-plus/icons-vue';

// 引入 leaflet.heat
let hasLeafletHeat = false;
try {
  import('leaflet.heat').then(() => {
    hasLeafletHeat = true;
    updateHeatmapLayer();
  });
} catch (e) {
  hasLeafletHeat = false;
}

const props = defineProps({
  // 当前定位中心坐标与信息
  centerCoords: {
    type: Object,
    default: () => ({ lat: 33.3152, lng: 44.3661, zoom: 12 })
  },
  // 地点标题描述
  targetLocationTitle: {
    type: String,
    default: '巴格达省'
  },
  // 热力图数据点集合 [[lat, lng, intensity], ...]
  heatPoints: {
    type: Array,
    default: () => []
  },
  // 代理站点标记信息
  agentStations: {
    type: Array,
    default: () => []
  },
  // 当前选中的代理 ID
  selectedAgentId: {
    type: String,
    default: ''
  }
});

const mapContainerRef = ref(null);
let mapInstance = null;
let heatLayerInstance = null;
let markersLayerGroup = null;
let radiusLayerGroup = null;

const showHeatmap = ref(true);
const showRadiusCircle = ref(true);

// 初始化真实在线瓦片地图
const initMap = () => {
  if (!mapContainerRef.value || mapInstance) return;

  const initialLat = props.centerCoords.lat || 33.3152;
  const initialLng = props.centerCoords.lng || 44.3661;
  const initialZoom = props.centerCoords.zoom || 12;

  mapInstance = L.map(mapContainerRef.value, {
    center: [initialLat, initialLng],
    zoom: initialZoom,
    zoomControl: false,
    attributionControl: false
  });

  // 添加平滑缩放控件到左下角
  L.control.zoom({ position: 'bottomleft' }).addTo(mapInstance);

  // 加载高质量伊拉克巴格达在线瓦片 (CartoDB Voyager: 包含地名、水系与街道轮廓)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(mapInstance);

  markersLayerGroup = L.layerGroup().addTo(mapInstance);
  radiusLayerGroup = L.layerGroup().addTo(mapInstance);

  updateHeatmapLayer();
  updateMarkers();
};

// 渲染/更新热力图
const updateHeatmapLayer = () => {
  if (!mapInstance) return;

  if (heatLayerInstance) {
    mapInstance.removeLayer(heatLayerInstance);
    heatLayerInstance = null;
  }

  if (!showHeatmap.value) return;

  const points = props.heatPoints || [];
  if (points.length === 0) return;

  if (typeof L.heatLayer === 'function') {
    heatLayerInstance = L.heatLayer(points, {
      radius: 26,
      blur: 18,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: '#3b82f6',
        0.4: '#10b981',
        0.6: '#eab308',
        0.8: '#f97316',
        1.0: '#ef4444'
      }
    }).addTo(mapInstance);
  } else {
    // Canvas 备用热力圆点渲染
    renderCanvasHeatCircles(points);
  }
};

// Canvas/SVG 备用热力点图层
const renderCanvasHeatCircles = (points) => {
  if (!mapInstance) return;
  const group = L.layerGroup();
  points.forEach(([lat, lng, val]) => {
    const color = val > 0.8 ? '#ef4444' : (val > 0.5 ? '#f59e0b' : '#10b981');
    const circle = L.circleMarker([lat, lng], {
      radius: 12 + val * 10,
      fillColor: color,
      fillOpacity: 0.35,
      stroke: false
    });
    group.addLayer(circle);
  });
  heatLayerInstance = group.addTo(mapInstance);
};

// 渲染代理站点定位 Marker 与服务半径圈
const updateMarkers = () => {
  if (!mapInstance || !markersLayerGroup || !radiusLayerGroup) return;

  markersLayerGroup.clearLayers();
  radiusLayerGroup.clearLayers();

  props.agentStations.forEach((station) => {
    if (!station.gisCoords || !station.gisCoords.lat) return;

    const lat = station.gisCoords.lat;
    const lng = station.gisCoords.lng;
    const isSelected = station.id === props.selectedAgentId;

    // 1. 站点服务半径圈 (500~1500m)
    if (showRadiusCircle.value) {
      const radiusCircle = L.circle([lat, lng], {
        radius: station.gisCoords.radiusMeters || 800,
        color: station.lockStatus === 'SATURATED_LOCKED' ? '#ef4444' : (isSelected ? '#2563eb' : '#10b981'),
        fillColor: station.lockStatus === 'SATURATED_LOCKED' ? '#f87171' : (isSelected ? '#3b82f6' : '#34d399'),
        fillOpacity: isSelected ? 0.25 : 0.12,
        weight: isSelected ? 2.5 : 1.2,
        dashArray: '4,4'
      });
      radiusLayerGroup.addLayer(radiusCircle);
    }

    // 2. 自定义站点 HTML Marker 图标
    const isLocked = station.lockStatus === 'SATURATED_LOCKED';
    const markerColor = isLocked ? '#ef4444' : (isSelected ? '#2563eb' : '#059669');

    const customIcon = L.divIcon({
      className: 'agent-custom-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isLocked ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(239, 68, 68, 0.4); animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>' : ''}
          <div style="width: ${isSelected ? '24px' : '18px'}; height: ${isSelected ? '24px' : '18px'}; border-radius: 50%; background: ${markerColor}; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: bold;">
            ${isSelected ? '★' : ''}
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    // 弹出信息气泡
    marker.bindPopup(`
      <div style="font-size: 12px; font-family: sans-serif; line-height: 1.4; padding: 2px;">
        <strong style="color: #0f172a; font-size: 13px;">${station.storeName || station.name}</strong>
        <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${station.district} · ${station.streetName}</div>
        <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: ${isLocked ? '#dc2626' : '#2563eb'};">${station.householdsCount || 0} / 1,500 户</span>
          <span style="font-size: 11px; background: #f1f5f9; padding: 1px 6px; border-radius: 4px;">${station.status || '正常'}</span>
        </div>
      </div>
    `);

    markersLayerGroup.addLayer(marker);
  });
};

// 平滑自动飞行定位至选定坐标
const flyToCoords = (lat, lng, zoom = 14) => {
  if (!mapInstance) return;
  mapInstance.flyTo([lat, lng], zoom, {
    duration: 1.2,
    easeLinearity: 0.25
  });
};

const toggleHeatmap = () => {
  showHeatmap.value = !showHeatmap.value;
  updateHeatmapLayer();
};

const toggleRadius = () => {
  showRadiusCircle.value = !showRadiusCircle.value;
  updateMarkers();
};

const resetToBaghdad = () => {
  flyToCoords(33.3152, 44.3661, 12);
};

// 监听选中的坐标变动，自动定位
watch(
  () => props.centerCoords,
  (coords) => {
    if (coords && coords.lat && coords.lng) {
      nextTick(() => {
        flyToCoords(coords.lat, coords.lng, coords.zoom || 14);
      });
    }
  },
  { deep: true }
);

watch(() => props.heatPoints, () => {
  updateHeatmapLayer();
}, { deep: true });

watch([() => props.agentStations, () => props.selectedAgentId], () => {
  updateMarkers();
}, { deep: true });

onMounted(() => {
  nextTick(() => {
    initMap();
  });
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});

defineExpose({
  flyToCoords
});
</script>

<style>
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.agent-custom-pin {
  background: transparent;
  border: none;
}
</style>
