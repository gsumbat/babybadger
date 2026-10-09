// Cloud Nursery tokens (Harbor design system). Keep in sync with Harbor tokens.json.
export const color = {
  canvas: '#F3F5F8',
  surface: '#FFFFFF',
  edge: '#E1E6EC',
  line: '#E6EAEF',
  divider: '#EEF1F4',
  lineStrong: '#C3CCD5',
  muted: '#E8ECF1',

  primary: '#47698A', // 5.74:1 on white
  primaryStrong: '#34526E',
  navy: '#22384B',
  primaryTint: '#DCE7F1',
  accent: '#E8B9BE',
  accentTint: '#F3E1E3',

  ink: '#1B2328',
  ink2: '#4B5960',
  quiet: '#6B7980',

  ok: '#1F8A4D',
  okTint: '#DCEEE3',
  okInk: '#1B6B3D',
  warn: '#B7791F',
  warnTint: '#F6E3C6',
  warnInk: '#7A4E0E',
  bad: '#C2412D',
  badTint: '#F6DCD6',
  badInk: '#A1321F',
} as const;

export const font = {
  display: 'Baloo2_800ExtraBold',
  displayBold: 'Baloo2_700Bold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const radius = { card: 24, field: 12, pill: 999, tile: 18 } as const;
export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 28 } as const;
/** Extra space above a section label that starts a new block (KIDS, NEEDS YOU, SITTER…), on top of the Screen's gap,
 * so sections read as separate blocks. Same on every screen (Home set it). Not for labels inside a card or the first
 * thing on a screen. */
export const SECTION_GAP = 14;
/** Height of every filter / choice chip (kid chips, log type chips, sitter and place chips…). */
export const CHIP_HEIGHT = 40;

export const cardShadow = {
  shadowColor: color.edge,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 1,
} as const;
