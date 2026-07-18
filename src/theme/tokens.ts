/**
 * Efir design tokens — «прямой эфир / on air».
 * Студийный тёмный фон + один тёплый on-air акцент (коралл→магента).
 * Все цвета/радиусы/шрифты только отсюда. Никаких хардкод-значений в компонентах.
 */

export const colors = {
  // Поверхности — студийная темнота с лёгким теплом
  bg: '#0B0D10',
  bgElevated: '#101318',
  surface: '#14171C',
  surfaceHi: '#1B1F26',
  border: '#23272F',
  borderHi: '#30353F',

  // Текст
  text: '#F2F4F7',
  textMuted: '#9BA1AC',
  textFaint: '#5B616B',

  // On-air акцент (единственный)
  accent: '#FF5A3C',
  accentHi: '#FF8563',
  accentDim: '#3A1C16',
  accentGlow: 'rgba(255,90,60,0.35)',

  // Градиент «сигнала»
  signalFrom: '#FF5A3C',
  signalTo: '#FF3D6E',

  // Служебные
  live: '#FF5A3C', // индикатор «в эфире»
  danger: '#FF3B30', // выйти из звонка
  success: '#2FD98B',
  onAccent: '#160A07',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

// Базовая сетка 4px
export const space = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16,
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
  x12: 48,
  x16: 64,
} as const;

export const font = {
  display: 'SpaceGrotesk',
  displayBold: 'SpaceGroteskBold',
  body: 'Inter',
  medium: 'InterMedium',
  semibold: 'InterSemiBold',
  bold: 'InterBold',
  mono: 'SpaceMono',
  monoBold: 'SpaceMonoBold',
} as const;

export const type = {
  hero: { fontFamily: font.displayBold, fontSize: 40, lineHeight: 44, letterSpacing: -0.5 },
  h1: { fontFamily: font.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontFamily: font.semibold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22 },
  bodyMed: { fontFamily: font.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: font.semibold, fontSize: 13, lineHeight: 16, letterSpacing: 0.2 },
  caption: { fontFamily: font.body, fontSize: 12, lineHeight: 16, color: colors.textMuted },
  // Позывной / код комнаты — моно, как настройка частоты
  callsign: { fontFamily: font.monoBold, fontSize: 22, letterSpacing: 4 },
  eyebrow: { fontFamily: font.monoBold, fontSize: 11, letterSpacing: 3 },
} as const;

export const duration = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;
