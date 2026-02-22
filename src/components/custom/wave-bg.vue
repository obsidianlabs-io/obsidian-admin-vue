<script lang="ts" setup>
import { computed } from 'vue';
import { getPaletteColorByNumber } from '@sa/color';

defineOptions({ name: 'WaveBg' });

interface Props {
  /** Theme color */
  themeColor: string;
}

const props = defineProps<Props>();

const color100 = computed(() => getPaletteColorByNumber(props.themeColor, 100));
const color200 = computed(() => getPaletteColorByNumber(props.themeColor, 200));
const color300 = computed(() => getPaletteColorByNumber(props.themeColor, 300));
const color500 = computed(() => getPaletteColorByNumber(props.themeColor, 500));
const color700 = computed(() => getPaletteColorByNumber(props.themeColor, 700));
const color900 = computed(() => getPaletteColorByNumber(props.themeColor, 900));
</script>

<template>
  <div class="login-bg absolute-lt z-1 size-full overflow-hidden">
    <!-- Dark gradient base -->
    <div
      class="absolute inset-0"
      :style="{
        background: `linear-gradient(135deg, ${color900} 0%, ${color700} 40%, ${color500} 100%)`
      }"
    />

    <!-- Subtle grid overlay -->
    <div class="grid-overlay absolute inset-0" />

    <!-- Floating geometric shapes -->
    <div class="absolute inset-0">
      <!-- Large diamond -->
      <svg class="geo-shape geo-1" width="120" height="120" viewBox="0 0 120 120">
        <polygon points="60,5 115,60 60,115 5,60" fill="none" :stroke="color300" stroke-width="1" opacity="0.2" />
      </svg>

      <!-- Small diamond -->
      <svg class="geo-shape geo-2" width="60" height="60" viewBox="0 0 60 60">
        <polygon points="30,2 58,30 30,58 2,30" fill="none" :stroke="color200" stroke-width="1" opacity="0.15" />
      </svg>

      <!-- Hexagon -->
      <svg class="geo-shape geo-3" width="100" height="100" viewBox="0 0 100 100">
        <polygon
          points="50,3 93,25 93,75 50,97 7,75 7,25"
          fill="none"
          :stroke="color300"
          stroke-width="1"
          opacity="0.12"
        />
      </svg>

      <!-- Triangle -->
      <svg class="geo-shape geo-4" width="80" height="80" viewBox="0 0 80 80">
        <polygon points="40,5 75,70 5,70" fill="none" :stroke="color200" stroke-width="1" opacity="0.1" />
      </svg>

      <!-- Circle ring -->
      <svg class="geo-shape geo-5" width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="65" fill="none" :stroke="color300" stroke-width="0.8" opacity="0.1" />
      </svg>

      <!-- Small circle -->
      <svg class="geo-shape geo-6" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" :stroke="color200" stroke-width="1" opacity="0.15" />
      </svg>
    </div>

    <!-- Glowing orbs -->
    <div
      class="glow-orb glow-1"
      :style="{ background: `radial-gradient(circle, ${color500}40 0%, transparent 70%)` }"
    />
    <div
      class="glow-orb glow-2"
      :style="{ background: `radial-gradient(circle, ${color300}25 0%, transparent 70%)` }"
    />
    <div
      class="glow-orb glow-3"
      :style="{ background: `radial-gradient(circle, ${color100}20 0%, transparent 70%)` }"
    />

    <!-- Particle dots -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :class="`p-${i}`" :style="{ background: color200 }" />
    </div>
  </div>
</template>

<style scoped>
.grid-overlay {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* Geometric shapes positioning & animation */
.geo-shape {
  position: absolute;
}

.geo-1 {
  top: 8%;
  right: 12%;
  animation: float-rotate 20s ease-in-out infinite;
}

.geo-2 {
  bottom: 25%;
  left: 8%;
  animation: float-rotate 15s ease-in-out infinite reverse;
}

.geo-3 {
  top: 55%;
  right: 5%;
  animation: float-rotate 25s ease-in-out infinite;
  animation-delay: -5s;
}

.geo-4 {
  top: 15%;
  left: 15%;
  animation: float-rotate 18s ease-in-out infinite;
  animation-delay: -8s;
}

.geo-5 {
  bottom: 10%;
  right: 20%;
  animation: float-rotate 30s ease-in-out infinite reverse;
  animation-delay: -3s;
}

.geo-6 {
  top: 40%;
  left: 5%;
  animation: float-rotate 12s ease-in-out infinite;
  animation-delay: -6s;
}

@keyframes float-rotate {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) rotate(5deg);
  }
  50% {
    transform: translateY(-8px) rotate(-3deg);
  }
  75% {
    transform: translateY(-20px) rotate(4deg);
  }
}

/* Glowing orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
}

.glow-1 {
  width: 500px;
  height: 500px;
  top: -10%;
  right: -5%;
  animation: pulse-drift 15s ease-in-out infinite;
}

.glow-2 {
  width: 400px;
  height: 400px;
  bottom: -10%;
  left: -5%;
  animation: pulse-drift 20s ease-in-out infinite reverse;
  animation-delay: -5s;
}

.glow-3 {
  width: 300px;
  height: 300px;
  top: 40%;
  left: 30%;
  animation: pulse-drift 18s ease-in-out infinite;
  animation-delay: -10s;
}

@keyframes pulse-drift {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  33% {
    transform: translate(30px, -20px) scale(1.1);
    opacity: 0.8;
  }
  66% {
    transform: translate(-20px, 15px) scale(0.95);
    opacity: 0.5;
  }
}

/* Floating particles */
.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0;
  animation: rise 10s ease-in infinite;
}

.p-1 {
  left: 5%;
  animation-delay: 0s;
  animation-duration: 12s;
}
.p-2 {
  left: 10%;
  animation-delay: 1.5s;
  animation-duration: 10s;
}
.p-3 {
  left: 18%;
  animation-delay: 3s;
  animation-duration: 14s;
}
.p-4 {
  left: 25%;
  animation-delay: 0.5s;
  animation-duration: 11s;
}
.p-5 {
  left: 32%;
  animation-delay: 2s;
  animation-duration: 13s;
}
.p-6 {
  left: 40%;
  animation-delay: 4s;
  animation-duration: 9s;
}
.p-7 {
  left: 48%;
  animation-delay: 1s;
  animation-duration: 15s;
}
.p-8 {
  left: 55%;
  animation-delay: 3.5s;
  animation-duration: 10s;
}
.p-9 {
  left: 62%;
  animation-delay: 0.8s;
  animation-duration: 12s;
}
.p-10 {
  left: 70%;
  animation-delay: 2.5s;
  animation-duration: 11s;
}
.p-11 {
  left: 76%;
  animation-delay: 4.5s;
  animation-duration: 14s;
}
.p-12 {
  left: 82%;
  animation-delay: 1.2s;
  animation-duration: 10s;
}
.p-13 {
  left: 88%;
  animation-delay: 3.2s;
  animation-duration: 13s;
}
.p-14 {
  left: 93%;
  animation-delay: 0.3s;
  animation-duration: 12s;
}
.p-15 {
  left: 15%;
  animation-delay: 5s;
  animation-duration: 11s;
}
.p-16 {
  left: 35%;
  animation-delay: 6s;
  animation-duration: 9s;
}
.p-17 {
  left: 52%;
  animation-delay: 7s;
  animation-duration: 13s;
}
.p-18 {
  left: 68%;
  animation-delay: 5.5s;
  animation-duration: 10s;
}
.p-19 {
  left: 85%;
  animation-delay: 6.5s;
  animation-duration: 12s;
}
.p-20 {
  left: 45%;
  animation-delay: 8s;
  animation-duration: 14s;
}

@keyframes rise {
  0% {
    bottom: -5%;
    opacity: 0;
    transform: scale(0.5);
  }
  10% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.25;
    transform: scale(1);
  }
  90% {
    opacity: 0.1;
  }
  100% {
    bottom: 105%;
    opacity: 0;
    transform: scale(0.3);
  }
}
</style>
