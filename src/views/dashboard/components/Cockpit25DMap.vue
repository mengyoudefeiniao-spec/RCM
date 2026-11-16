<template>
  <div ref="stageEl" class="cockpit-3d-stage" @mouseleave="hovered = ''">
    <div class="cockpit-3d-plane">
      <svg :viewBox="`0 0 ${width} ${height}`" class="cockpit-3d-svg" role="img" :aria-label="t('cockpit.mapTitle')">
        <defs>
          <path v-for="shape in shapes" :id="'ck-prov-' + shape.code" :key="'def-' + shape.code" :d="shape.path" />
        </defs>
        <g v-for="(layer, index) in extrusionLayers" :key="'layer-' + index" :transform="`translate(0 ${layer.offset})`" :fill="layer.color">
          <use v-for="shape in shapes" :key="'ext-' + index + '-' + shape.code" :href="'#ck-prov-' + shape.code" />
        </g>
        <g fill="#C9DED0">
          <use v-for="shape in shapes" :key="'base-' + shape.code" :href="'#ck-prov-' + shape.code" />
        </g>
        <g
          v-for="shape in shapes"
          :key="shape.code"
          class="cockpit-3d-province"
          :class="{ 'is-hovered': hovered === shape.code, 'is-selected': selectedCode === shape.code }"
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
      </svg>
    </div>
    <div v-if="hoveredShape" class="cockpit-3d-tip" :style="tipStyle">
      <strong>{{ provinceLabel(hoveredShape.code) }}</strong>
      <span>{{ t('cockpit.mapMetrics.' + metric) }}: {{ hoveredValue }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getIraqGeoFeatures } from '../../../mock/data/geoStatsData.js';
import { REVIEW_SCOPE_REGIONS } from '../../../utils/reviewPermission.js';
import {
  cockpitColor, cockpitMetricRange, cockpitProvinceValue, formatCockpitValue
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
      fill: cockpitColor(ratio)
    };
  }).filter((shape) => shape.code && shape.path);
});

const extrusionLayers = Array.from({ length: LAYERS }, (_, index) => {
  const t = index / Math.max(1, LAYERS - 1);
  const offset = Math.round(DEPTH * (1 - t));
  const from = [20, 42, 30];
  const to = [47, 87, 64];
  const color = from.map((channel, channelIndex) => Math.round(channel + (to[channelIndex] - channel) * t));
  return { offset, color: `rgb(${color.join(' ')})` };
});

const hoveredShape = computed(() => shapes.value.find((shape) => shape.code === hovered.value) || null);
const hoveredValue = computed(() => {
  const province = props.provinces.find((item) => item.provinceCode === hovered.value);
  const value = province ? cockpitProvinceValue(province, props.metric) : 0;
  return formatCockpitValue(value, props.metric === 'fulfillment' ? 'percent' : 'int', locale.value) + (props.metric === 'fulfillment' ? '%' : '');
});
const tipStyle = computed(() => ({ left: tip.value.x + 'px', top: tip.value.y + 'px' }));

function moveTip(event) {
  const rect = stageEl.value?.getBoundingClientRect();
  if (!rect) return;
  tip.value = { x: event.clientX - rect.left, y: event.clientY - rect.top };
}
</script>

<style scoped>
.cockpit-3d-stage { position: relative; display: flex; min-height: clamp(320px, 40vh, 430px); align-items: center; justify-content: center; perspective: 1500px; perspective-origin: 50% 42%; user-select: none; }
.cockpit-3d-stage::before { content: ''; position: absolute; inset: 10% 9%; border-radius: 50%; background: radial-gradient(closest-side, rgba(47, 122, 80, .2), rgba(47, 122, 80, 0) 72%); filter: blur(14px); pointer-events: none; }
.cockpit-3d-plane { position: relative; width: 100%; max-width: 780px; transform: rotateX(46deg) rotateZ(-9deg); transform-style: preserve-3d; filter: drop-shadow(0 26px 26px rgba(31, 51, 38, .22)); will-change: transform; }
.cockpit-3d-svg { display: block; width: 100%; height: auto; overflow: visible; }
.cockpit-3d-province { cursor: pointer; outline: none; }
.cockpit-3d-province use { stroke: rgba(255, 255, 255, .82); stroke-width: .9; transition: filter .15s ease; vector-effect: non-scaling-stroke; }
.cockpit-3d-province.is-hovered use { stroke: #f3d9a4; stroke-width: 1.7; filter: brightness(1.07); }
.cockpit-3d-province.is-selected use { stroke: #1f3326; stroke-width: 2.2; }
.cockpit-3d-tip { position: absolute; z-index: 6; min-width: 120px; transform: translate(-50%, calc(-100% - 10px)); border: 1px solid #d9e5db; border-radius: .5rem; background: rgba(255, 255, 255, .97); padding: .4rem .55rem; box-shadow: 0 10px 24px -18px rgba(31, 51, 38, .9); color: #1f3326; font-size: .6875rem; pointer-events: none; text-align: center; }
.cockpit-3d-tip strong { display: block; font-size: .75rem; }
.cockpit-3d-tip span { color: #52675a; }
@media (max-width: 1023px) {
  .cockpit-3d-stage { min-height: clamp(280px, 36vh, 380px); }
}
</style>
