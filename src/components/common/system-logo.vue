<template>
  <div class="app-logo">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="obBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--logo-color-700)" />
          <stop offset="100%" stop-color="var(--logo-color-400)" />
        </linearGradient>
        <linearGradient id="obGemBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a1a2e" />
          <stop offset="50%" stop-color="#16213e" />
          <stop offset="100%" stop-color="#0f3460" />
        </linearGradient>
        <linearGradient id="obGemShine" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <filter id="obGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Rounded square background -->
      <rect x="8" y="8" width="184" height="184" rx="40" ry="40" fill="url(#obBgGrad)" />

      <g transform="translate(100, 102)" filter="url(#obGlow)">
        <!-- Gem shadow -->
        <polygon points="0,-58 44,-18 0,64 -44,-18" fill="rgba(0,0,0,0.3)" transform="translate(2, 3)" />
        <!-- Main gem body -->
        <polygon points="0,-58 44,-18 0,64 -44,-18" fill="url(#obGemBody)" />
        <!-- Top-left dark facet -->
        <polygon points="0,-58 -44,-18 0,8" fill="#1a1a2e" opacity="0.8" />
        <!-- Top-right lighter facet -->
        <polygon points="0,-58 44,-18 0,8" fill="#16213e" opacity="0.9" />
        <!-- Bottom-left facet -->
        <polygon points="-44,-18 0,64 0,8" fill="#0f3460" opacity="0.7" />
        <!-- Bottom-right facet -->
        <polygon points="44,-18 0,64 0,8" fill="#1a1a2e" opacity="0.6" />
        <!-- Reflective edge highlights -->
        <line x1="0" y1="-58" x2="0" y2="8" stroke="#ffffff" stroke-width="1.2" opacity="0.35" />
        <line x1="0" y1="8" x2="0" y2="64" stroke="#ffffff" stroke-width="0.8" opacity="0.2" />
        <line x1="-44" y1="-18" x2="0" y2="8" stroke="#ffffff" stroke-width="0.6" opacity="0.15" />
        <line x1="44" y1="-18" x2="0" y2="8" stroke="#ffffff" stroke-width="0.6" opacity="0.15" />
        <!-- Top edge highlight -->
        <line x1="0" y1="-58" x2="-44" y2="-18" stroke="#ffffff" stroke-width="1.5" opacity="0.5" />
        <line x1="0" y1="-58" x2="44" y2="-18" stroke="#ffffff" stroke-width="1" opacity="0.3" />
        <!-- Shine glare on top-left facet -->
        <polygon points="0,-58 -30,-26 -10,-10 0,-42" fill="url(#obGemShine)" />
        <!-- Sparkle -->
        <circle cx="-16" cy="-32" r="3" fill="#ffffff" opacity="0.85" />
        <circle cx="-16" cy="-32" r="7" fill="#ffffff" opacity="0.15" />
        <!-- Subtle bottom glow -->
        <ellipse cx="0" cy="58" rx="20" ry="4" fill="rgba(255,255,255,0.15)" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.app-logo {
  --logo-color-300: rgb(var(--primary-300-color));
  --logo-color-400: rgb(var(--primary-400-color));
  --logo-color-500: rgb(var(--primary-500-color));
  --logo-color-600: rgb(var(--primary-600-color));
  --logo-color-700: rgb(var(--primary-700-color));
}
</style>
