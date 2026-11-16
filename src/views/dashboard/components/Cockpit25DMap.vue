<template>
  <div ref="stageEl" class="cockpit-3d-stage" @mouseleave="clearHover">
    <div class="cockpit-3d-plane">
      <svg :viewBox="`0 0 ${width} ${height}`" class="cockpit-3d-svg" role="img" :aria-label="t('cockpit.mapTitle')">
        <defs>
          <path v-for="shape in shapes" :id="'ck-prov-' + shape.code" :key="'def-' + shape.code" :d="shape.path" />
        </defs>
        <g v-for="(layer, index) in extrusionLayers" :key="'layer-' + index" :transform="`translate(0 ${layer.offset})`" :fill="layer.color">
          <use v-for="shape in shapes" :key="'ext-' + index + '-' + shape.code" :href="'#ck-prov-' + shape.code" />
        </g>
        <g fill="#efe4cc">
          <use v-for="shape in shapes" :key="'base-' + shape.code" :href="'#ck-prov-' + shape.code" />
        </g>
        <g
          v-for="shape in shapes"
          :key="shape.code"
          class="cockpit-3d-province"
          :class="{ 'is-hovered': hovered === shape.code || hoveredPoint === shape.code, 'is-selected': selectedCode === shape.code }"
          role="button"
          tabindex="0"
          :aria-label="provinceLabel(shape.code)"
          @mouseenter="hovered = shape.code"
          @mousemove="moveTip($event)"
          @focus="hovered = shape.code"
          @blur="hovered = ''"
          @click="$emit('select', shape.code)"
          @keydown.enter.prevent="$emit('select', shape.code)"
        >
          <use :href="'#ck-prov-' + shape.code" :fill="shape.fill" />
        </g>
        <g
          v-for="marker in markers"
          :key="'point-' + marker.code"
          class="cockpit-3d-point"
          :class="{ 'is-hovered': hoveredPoint === marker.code, 'is-selected': selectedCode === marker.code }"
          :transform="`translate(${marker.x} ${marker.y})`"
          role="button"
          tabindex="0"
          :aria-label="provinceLabel(marker.code)"
          @mouseenter="hoveredPoint = marker.code"
          @mousemove="moveTip($event)"
          @focus="hoveredPoint = marker.code"
          @blur="hoveredPoint = ''"
          @click="$emit('select', marker.code)"
          @keydown.enter.prevent="$emit('select', marker.code)"
        >
          <circle v-if="marker.pulse" class="cockpit-3d-point__pulse" :r="marker.r + 4" />
          <circle class="cockpit-3d-point__halo" :r="marker.r + 2" />
          <circle class="cockpit-3d-point__dot" :r="marker.r" />
          <circle class="cockpit-3d-point__core" :r="Math.max(1.2, marker.r * 0.32)" />
        </g>
      </svg>
    </div>
    <div v-if="activeProvince" class="cockpit-3d-tip" :style="tipStyle">
      <strong>{{ provinceLabel(activeProvince.provinceCode) }}</strong>
      <span>{{ t('cockpit.fieldFulfillment') }}: {{ formatValue(activeProvince.fulfillment, 'percent') }}%</span>
      <span>{{ t('cockpit.fieldAgents') }}: {{ formatValue(activeProvince.agents, 'int') }}</span>
      <span>{{ t('cockpit.fieldSites') }}: {{ formatValue(activeProvince.sites, 'int') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getIraqGeoFeatures } from '../../../mock/data/geoStatsData.js';
import { REVIEW_SCOPE_REGIONS } from '../../../utils/reviewPermission.js';
import {
  cockpitColorForMetric, cockpitFulfillmentColor, cockpitMetricRange, cockpitProvinceValue, formatCockpitValue
} from '../../../utils/nationalCockpit.js';

const props = defineProps({
  provinces: { type: Array, default: () => [] },
  metric: { type: String, default: 'fulfillment' },
  selectedCode: { type: String, default: '' }
});
defineEmits(['select']);

const { t, locale } = useI18n();
const PAD = 26;
const DEPTH = 26;
const LAYERS = 10;
const TILT_Y = 0.92;

const hovered = ref('');
const hoveredPoint = ref('');
const stageEl = ref(null);
const tip = ref({ x: 0, y: 0 });

const features = getIraqGeoFeatures();

function codeForName(name) {
  // GeoJSON uses 哈拉卜贾省 while the permission catalog uses 哈莱卜杰省.
  const canonical = name === '哈拉卜贾省' ? '哈莱卜杰省' : name;
  return REVIEW_SCOPE_REGIONS.find((region) => region.value === canonical)?.code || '';
}

function provinceLabel(code) {
  const region = REVIEW_SCOPE_REGIONS.find((item) => item.code === code);
  return region ? t('systemExtras.' + region.labelKey) : code;
}

function formatValue(value, unit) {
  return formatCockpitValue(value, unit, locale.value);
}

function ringsForGeometry(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return geometry.coordinates.slice(0, 1);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.map((polygon) => polygon[0]).filter(Boolean);
  return [];
}

const bounds = (() => {
  const points = [];
  for (const feature of features) {
    for (const ring of ringsForGeometry(feature.geometry)) {
      for (const point of ring) points.push(point);
    }
  }
  if (!points.length) return { minLng: 38, maxLng: 49, minLat: 29, maxLat: 38 };
  return {
    minLng: Math.min(...points.map((point) => point[0])),
    maxLng: Math.max(...points.map((point) => point[0])),
    minLat: Math.min(...points.map((point) => point[1])),
    maxLat: Math.max(...points.map((point) => point[1]))
  };
})();

const width = 1000;
const scale = (width - PAD * 2) / (bounds.maxLng - bounds.minLng || 1);
const height = Math.round((bounds.maxLat - bounds.minLat) * scale * TILT_Y) + PAD * 2;

function project(point) {
  return [
    PAD + (point[0] - bounds.minLng) * scale,
    PAD + (bounds.maxLat - point[1]) * scale * TILT_Y
  ];
}

function pathForRing(ring) {
  return ring.map((point, index) => {
    const [x, y] = project(point);
    return (index === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2);
  }).join(' ') + ' Z';
}

const shapes = computed(() => {
  const [min, max] = cockpitMetricRange(props.provinces, props.metric);
  return features.map((feature) => {
    const code = codeForName(feature.properties?.provinceName);
    const province = props.provinces.find((item) => item.provinceCode === code);
    const value = province ? cockpitProvinceValue(province, props.metric) : min;
    const ratio = max > min ? (value - min) / (max - min) : 0.5;
    return {
      code,
      path: ringsForGeometry(feature.geometry).map(pathForRing).join(' '),
      fill: props.metric === 'fulfillment' ? cockpitFulfillmentColor(value) : cockpitColorForMetric(ratio, props.metric)
    };
  }).filter((shape) => shape.code && shape.path);
});

const markers = computed(() => {
  const maxAgents = Math.max(...props.provinces.map((province) => Number(province.agents) || 0), 1);
  return props.provinces
    .filter((province) => province.provinceCode && Number.isFinite(Number(province.lat)) && Number.isFinite(Number(province.lng)) && Number(province.lat) !== 0 && Number(province.lng) !== 0)
    .map((province) => {
      const [x, y] = project([Number(province.lng), Number(province.lat)]);
      const ratio = Math.sqrt(Math.min(1, (Number(province.agents) || 0) / maxAgents));
      return { code: province.provinceCode, x, y, r: 4 + ratio * 6, pulse: ratio > 0.66 };
    });
});

const extrusionLayers = Array.from({ length: LAYERS }, (_, index) => {
  const t = index / Math.max(1, LAYERS - 1);
  const offset = Math.round(DEPTH * (1 - t));
  const from = [20, 42, 30];
  const to = [47, 87, 64];
  const color = from.map((channel, channelIndex) => Math.round(channel + (to[channelIndex] - channel) * t));
  return { offset, color: `rgb(${color.join(' ')})` };
});

const activeProvince = computed(() => {
  const code = hoveredPoint.value || hovered.value;
  return props.provinces.find((province) => province.provinceCode === code) || null;
});
const tipStyle = computed(() => ({ left: tip.value.x + 'px', top: tip.value.y + 'px' }));

function clearHover() {
  hovered.value = '';
  hoveredPoint.value = '';
}

function moveTip(event) {
  const rect = stageEl.value?.getBoundingClientRect();
  if (!rect) return;
  tip.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
</script>

<style scoped>
.cockpit-3d-stage { position: relative; display: flex; min-height: clamp(320px, 40vh, 430px); align-items: center; justify-content: center; perspective: 1500px; perspective-origin: 50% 42%; user-select: none; }
.cockpit-3d-stage::before { content: ''; position: absolute; inset: 8% 8%; border-radius: 50%; background: radial-gradient(closest-side, rgba(201, 161, 59, .2), rgba(0, 122, 61, .08) 55%, rgba(0, 122, 61, 0) 74%); filter: blur(14px); pointer-events: none; }
.cockpit-3d-plane { position: relative; width: 100%; max-width: 780px; transform: rotateX(46deg) rotateZ(-9deg); transform-style: preserve-3d; filter: drop-shadow(0 26px 26px rgba(20, 20, 20, .24)); will-change: transform; }
.cockpit-3d-svg { display: block; width: 100%; height: auto; overflow: visible; }
.cockpit-3d-province { cursor: pointer; outline: none; }
.cockpit-3d-province use { stroke: rgba(255, 255, 255, .82); stroke-width: .9; transition: filter .15s ease; vector-effect: non-scaling-stroke; }
.cockpit-3d-province.is-hovered use { stroke: #c9a13b; stroke-width: 1.7; filter: brightness(1.06); }
.cockpit-3d-province.is-selected use { stroke: #ce1126; stroke-width: 2.2; }
.cockpit-3d-point { cursor: pointer; outline: none; }
.cockpit-3d-point__halo { fill: rgba(201, 161, 59, .28); }
.cockpit-3d-point__dot { fill: #c9a13b; stroke: #fff8ea; stroke-width: 1.1; }
.cockpit-3d-point__core { fill: #fff8ea; }
.cockpit-3d-point__pulse { fill: none; stroke: #ce1126; stroke-width: 1; opacity: .5; transform-box: fill-box; transform-origin: center; animation: cockpitPointPulse 2.4s ease-out infinite; pointer-events: none; }
.cockpit-3d-point.is-hovered .cockpit-3d-point__dot, .cockpit-3d-point.is-selected .cockpit-3d-point__dot { fill: #ce1126; }
.cockpit-3d-point.is-hovered .cockpit-3d-point__halo { fill: rgba(206, 17, 38, .25); }
.cockpit-3d-tip { position: absolute; z-index: 6; min-width: 150px; transform: translate(-50%, calc(-100% - 12px)); border: 1px solid rgba(201, 161, 59, .55); border-radius: .5rem; background: rgba(255, 251, 243, .98); padding: .4rem .55rem; box-shadow: 0 12px 26px -18px rgba(20, 20, 20, .9); color: #141414; font-size: .6875rem; pointer-events: none; text-align: start; }
.cockpit-3d-tip strong { display: block; margin-bottom: .1rem; color: #141414; font-size: .75rem; }
.cockpit-3d-tip span { display: block; color: #52675a; line-height: 1.45; }
@keyframes cockpitPointPulse { 0% { transform: scale(.8); opacity: .5; } 100% { transform: scale(1.9); opacity: 0; } }
@media (max-width: 1023px) {
  .cockpit-3d-stage { min-height: clamp(280px, 36vh, 380px); }
}
</style>
