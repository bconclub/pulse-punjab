/**
 * Pulse of Punjab — design system.
 * Premium dark "election-night" theme: deep slate canvas, saffron/azure accents.
 * Tokens are consumed across every component so the look stays consistent.
 */

export const colors = {
  bg: '#0A0E15',
  bgElev: '#0F1521',
  surface: '#141C2A',
  surface2: '#1B2536',
  surface3: '#22304A',
  border: '#26334A',
  border2: '#33425E',

  text: '#EAF0F8',
  textDim: '#9FB0C7',
  faint: '#6B7B93',

  accent: '#F5A623', // saffron / amber — primary
  accentDim: 'rgba(245,166,35,0.16)',
  azure: '#3D9BE0',
  azureDim: 'rgba(61,155,224,0.16)',
  green: '#34D399',
  greenDim: 'rgba(52,211,153,0.16)',
  red: '#F2545B',

  mapBg: '#0B1018',
  white: '#FFFFFF',
};

/** Party colors brightened for legibility on the dark map. */
export const party: Record<string, string> = {
  AAP: '#2A93D6',
  INC: '#79C7EE',
  SAD: '#6E8BCB',
  BJP: '#F5A623',
  BSP: '#8685EC',
  IND: '#9AA7BD',
};

/** Phase (priority) colors — P1 frontline, P2 mobilization, P3 conversion. */
export const phase: Record<string, string> = {
  P1: '#3D9BE0',
  P2: '#F5A623',
  P3: '#34D399',
};

/** Engagement heat ramp — dim→bright, tuned to read on the dark canvas. */
export const HEAT_RAMP = [
  '#16304A', '#1A466E', '#1E5D92', '#2277BB',
  '#2A93D6', '#46ABE6', '#7CC6F0', '#B3E0FA',
];

/** Youth-density ramp — dim→mint, low youth recedes, high youth glows. */
export const YOUTH_RAMP = [
  '#12341F', '#16512F', '#1C7043', '#249060',
  '#3BB07D', '#62CDA0', '#9BE3C4',
];

/** Age-band segment colors for the detail sheet stacked bar. */
export const AGE_COLORS = [
  '#7CC6F0', '#46ABE6', '#2A93D6', '#2277BB', '#1E5D92', '#1A466E', '#7C8AA3',
];

export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };

export const space = (n: number) => n * 4;

export const font = {
  // Inter loaded via expo-font; falls back to system if unavailable.
  ui: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Sora_700Bold',
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
};

export const theme = { colors, party, phase, radius, space, font, shadow };
export default theme;
