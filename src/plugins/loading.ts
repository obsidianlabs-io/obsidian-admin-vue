// @unocss-include
import { getColorPalette, getRgb } from '@sa/color';
import { DARK_CLASS } from '@/constants/app';
import { localStg } from '@/utils/storage';
import { toggleHtmlClass } from '@/utils/common';
import { $t } from '@/locales';

export function setupLoading() {
  const themeColor = localStg.get('themeColor') || '#646cff';
  const darkMode = localStg.get('darkMode') || false;
  const palette = getColorPalette(themeColor);

  const { r, g, b } = getRgb(themeColor);

  const primaryColor = `--primary-color: ${r} ${g} ${b}`;

  const svgCssVars = Array.from(palette.entries())
    .map(([key, value]) => `--logo-color-${key}: ${value}`)
    .join(';');

  const cssVars = `${primaryColor}; ${svgCssVars}`;

  if (darkMode) {
    toggleHtmlClass(DARK_CLASS).add();
  }

  const loadingClasses = [
    'left-0 top-0',
    'left-0 bottom-0 animate-delay-500',
    'right-0 top-0 animate-delay-1000',
    'right-0 bottom-0 animate-delay-1500'
  ];

  const dot = loadingClasses
    .map(item => {
      return `<div class="absolute w-16px h-16px bg-primary rounded-8px animate-pulse ${item}"></div>`;
    })
    .join('\n');

  const loading = `
<div class="fixed-center flex-col bg-layout" style="${cssVars}">
  <div class="w-128px h-128px">
    ${getLogoSvg()}
  </div>
  <div class="w-56px h-56px my-36px">
    <div class="relative h-full animate-spin">
      ${dot}
    </div>
  </div>
  <h2 class="text-28px font-500 text-primary">${$t('system.title')}</h2>
</div>`;

  const app = document.getElementById('app');

  if (app) {
    app.innerHTML = loading;
  }
}

function getLogoSvg() {
  const logoSvg = `<svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="obLoadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--logo-color-700)" />
            <stop offset="100%" stop-color="var(--logo-color-400)" />
          </linearGradient>
          <linearGradient id="obLoadGemBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1a1a2e" />
            <stop offset="50%" stop-color="#16213e" />
            <stop offset="100%" stop-color="#0f3460" />
          </linearGradient>
          <linearGradient id="obLoadGemShine" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <filter id="obLoadGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect x="8" y="8" width="184" height="184" rx="40" ry="40" fill="url(#obLoadGrad)" />
        <g transform="translate(100, 102)" filter="url(#obLoadGlow)">
          <polygon points="0,-58 44,-18 0,64 -44,-18" fill="rgba(0,0,0,0.3)" transform="translate(2, 3)" />
          <polygon points="0,-58 44,-18 0,64 -44,-18" fill="url(#obLoadGemBody)" />
          <polygon points="0,-58 -44,-18 0,8" fill="#1a1a2e" opacity="0.8" />
          <polygon points="0,-58 44,-18 0,8" fill="#16213e" opacity="0.9" />
          <polygon points="-44,-18 0,64 0,8" fill="#0f3460" opacity="0.7" />
          <polygon points="44,-18 0,64 0,8" fill="#1a1a2e" opacity="0.6" />
          <line x1="0" y1="-58" x2="0" y2="8" stroke="#ffffff" stroke-width="1.2" opacity="0.35" />
          <line x1="0" y1="8" x2="0" y2="64" stroke="#ffffff" stroke-width="0.8" opacity="0.2" />
          <line x1="-44" y1="-18" x2="0" y2="8" stroke="#ffffff" stroke-width="0.6" opacity="0.15" />
          <line x1="44" y1="-18" x2="0" y2="8" stroke="#ffffff" stroke-width="0.6" opacity="0.15" />
          <line x1="0" y1="-58" x2="-44" y2="-18" stroke="#ffffff" stroke-width="1.5" opacity="0.5" />
          <line x1="0" y1="-58" x2="44" y2="-18" stroke="#ffffff" stroke-width="1" opacity="0.3" />
          <polygon points="0,-58 -30,-26 -10,-10 0,-42" fill="url(#obLoadGemShine)" />
          <circle cx="-16" cy="-32" r="3" fill="#ffffff" opacity="0.85" />
          <circle cx="-16" cy="-32" r="7" fill="#ffffff" opacity="0.15" />
          <ellipse cx="0" cy="58" rx="20" ry="4" fill="rgba(255,255,255,0.15)" />
        </g>
      </svg>
  `;

  return logoSvg;
}
