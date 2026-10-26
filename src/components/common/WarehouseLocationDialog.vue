<template>
  <el-dialog v-model="visible" :title="t('warehouseLocation.title')" width="min(94vw, 700px)" append-to-body destroy-on-close @opened="renderMap" @close="cleanup">
    <div class="space-y-3 text-start">
      <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
        <strong class="min-w-0 break-words text-[#1F3326]">{{ centerName }}</strong>
        <bdi dir="ltr" class="text-xs text-[#58685D]">{{ center?.warehouseCode || `WH-${center?.centerId || ''}` }}</bdi>
      </div>
      <p v-if="destination?.source === 'demo'" class="rounded-lg border border-[#EAD8AF] bg-[#FFF8E8] p-2.5 text-xs leading-relaxed text-[#7A5F21]" data-testid="warehouse-demo-notice">{{ t('warehouseLocation.demo') }}</p>
      <template v-if="destination">
        <div ref="mapElement" dir="ltr" class="h-60 overflow-hidden rounded-lg border border-[#D9E5DB] bg-[#EAF1E7] sm:h-96" role="region" :aria-label="t('warehouseLocation.title')" :data-lat="destination.lat" :data-lng="destination.lng" />
        <p class="text-xs text-[#58685D]">{{ t('agentDelivery.coordinates') }}: <bdi dir="ltr">{{ destination.lat.toFixed(5) }}, {{ destination.lng.toFixed(5) }}</bdi></p>
        <p class="text-xs leading-relaxed text-[#58685D]">{{ t('warehouseLocation.hint') }}</p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <el-button class="!m-0 w-full min-w-0" :loading="locating || routing" @click="routeFromCurrentLocation"><el-icon class="me-1 shrink-0"><Location /></el-icon><span>{{ t('warehouse.mapUseLocation') }}</span></el-button>
          <el-button class="!m-0 w-full min-w-0" type="primary" plain tag="a" :href="navigationUrl" target="_blank" rel="noopener noreferrer">{{ t('warehouse.mapOpenGoogle') }}</el-button>
        </div>
        <p v-if="status" aria-live="polite" class="text-xs leading-relaxed" :class="locationError || routeError ? 'text-amber-700' : 'text-[#326445]'">{{ status }}</p>
        <p v-if="tileError" class="text-xs text-amber-700" role="status">{{ t('warehouseLocation.tilesUnavailable') }}</p>
      </template>
      <el-empty v-else :description="t('warehouseLocation.missing')" :image-size="60" />
    </div>
    <template #footer><el-button type="primary" @click="visible = false">{{ t('common.close') }}</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Location } from '@element-plus/icons-vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { warehousePosition, warehouseNavigationUrl } from '../../utils/warehouseLocation.js';

const props = defineProps({ modelValue: Boolean, center: Object, centerName: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
const { t, locale } = useI18n();
const visible = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) });
const destination = computed(() => warehousePosition(props.center));
const mapElement = ref(null), origin = ref(null), locating = ref(false), routing = ref(false);
const locationError = ref(false), routeError = ref(false), tileError = ref(false), summary = ref(null);
const navigationUrl = computed(() => warehouseNavigationUrl(destination.value, origin.value));
const status = computed(() => locating.value ? t('warehouseLocation.locating') : routing.value ? t('warehouse.mapRouteLoading') : locationError.value ? t('warehouseLocation.locationDenied') : routeError.value ? t('warehouse.mapRouteUnavailable') : summary.value ? t('warehouse.mapRouteDistance', {
  distance: new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(summary.value.distance / 1000),
  duration: new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(summary.value.duration / 60)
}) : '');
let map, destinationMarker, originMarker, routeLayer, zoom, controller, sizeTimer, generation = 0;
const popup = text => { const node = document.createElement('span'); node.textContent = text; node.dir = document.documentElement.dir; return node; };

function cleanup() {
  generation++;
  controller?.abort(); controller = null;
  clearTimeout(sizeTimer);
  map?.stop(); map?.remove(); map = null; destinationMarker = originMarker = routeLayer = zoom = null;
  locating.value = routing.value = false;
}
function updateLabels() {
  if (!map) return;
  destinationMarker?.setPopupContent(popup(props.centerName));
  originMarker?.setPopupContent(popup(t('warehouseLocation.origin')));
  if (zoom) map.removeControl(zoom);
  zoom = L.control.zoom({ zoomInTitle: t('warehouseLocation.zoomIn'), zoomOutTitle: t('warehouseLocation.zoomOut') }).addTo(map);
}
async function renderMap() {
  cleanup();
  const token = generation;
  origin.value = summary.value = null;
  locationError.value = routeError.value = tileError.value = false;
  await nextTick();
  if (!visible.value || token !== generation || !mapElement.value || !destination.value) return;
  const target = destination.value;
  map = L.map(mapElement.value, { scrollWheelZoom: false, zoomControl: false, zoomAnimation: false, fadeAnimation: false }).setView([target.lat, target.lng], 15);
  const instance = map;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' })
    .on('tileerror', () => { if (instance === map) tileError.value = true; }).addTo(map);
  destinationMarker = L.circleMarker([target.lat, target.lng], { radius: 10, color: '#1F6842', fillColor: '#3E9B68', fillOpacity: 0.95, weight: 3 }).addTo(map).bindPopup(popup(props.centerName));
  updateLabels();
  sizeTimer = setTimeout(() => { if (map === instance) map.invalidateSize(); }, 80);
}
function routeFromCurrentLocation() {
  if (!map || !destination.value) return;
  const token = ++generation;
  controller?.abort();
  locationError.value = routeError.value = false; origin.value = summary.value = null;
  if (routeLayer) map.removeLayer(routeLayer);
  if (originMarker) map.removeLayer(originMarker);
  routeLayer = originMarker = null;
  if (!navigator.geolocation) { locationError.value = true; return; }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    if (!visible.value || !map || token !== generation) return;
    locating.value = false;
    origin.value = { lat: coords.latitude, lng: coords.longitude };
    drawRoute(token);
  }, () => {
    if (token !== generation || !visible.value) return;
    locating.value = false; locationError.value = true;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}
async function drawRoute(token) {
  const start = origin.value, target = destination.value;
  originMarker = L.circleMarker([start.lat, start.lng], { radius: 7, color: '#245A91', fillColor: '#5596D1', fillOpacity: 0.95, weight: 3 }).addTo(map).bindPopup(popup(t('warehouseLocation.origin')));
  controller = new AbortController();
  const activeController = controller;
  const timeout = setTimeout(() => activeController.abort(), 12000);
  routing.value = true;
  try {
    const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`, { signal: activeController.signal });
    if (!response.ok) throw new Error('Route unavailable');
    const route = (await response.json()).routes?.[0];
    if (!route?.geometry?.coordinates?.length || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) throw new Error('Route unavailable');
    if (!map || !visible.value || token !== generation) return;
    routeLayer = L.polyline(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]), { color: '#267A4B', weight: 5, opacity: 0.9 }).addTo(map);
    map.fitBounds(routeLayer.getBounds().pad(0.18), { animate: false });
    summary.value = { distance: route.distance, duration: route.duration };
  } catch {
    if (map && visible.value && token === generation) routeError.value = true;
  } finally {
    clearTimeout(timeout);
    if (token === generation) routing.value = false;
  }
}
watch([() => props.center?.centerId, () => destination.value?.lat, () => destination.value?.lng], () => { if (visible.value) renderMap(); });
watch([locale, () => props.centerName], updateLabels);
onBeforeUnmount(cleanup);
</script>
