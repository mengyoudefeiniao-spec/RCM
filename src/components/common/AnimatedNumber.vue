<template>
  <span ref="numberRef" class="font-mono font-bold tracking-tight inline-block">
    {{ displayValue }}
  </span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps({
  value: {
    type: Number,
    required: true,
    default: 0
  },
  duration: {
    type: Number,
    default: 1.2
  },
  decimals: {
    type: Number,
    default: 0
  },
  formatThousands: {
    type: Boolean,
    default: true
  }
});

const numberRef = ref(null);
const displayValue = ref('0');
const tweened = ref({ val: 0 });

function updateDisplay() {
  let numStr = tweened.value.val.toFixed(props.decimals);
  if (props.formatThousands) {
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    numStr = parts.join('.');
  }
  displayValue.value = numStr;
}

function animateNumber(targetVal) {
  gsap.killTweensOf(tweened.value);
  gsap.to(tweened.value, {
    val: targetVal,
    duration: props.duration,
    ease: 'power2.out',
    onUpdate: updateDisplay
  });
}

onMounted(() => {
  animateNumber(props.value);
});

watch(
  () => props.value,
  (newVal) => {
    animateNumber(newVal);
  }
);
</script>
