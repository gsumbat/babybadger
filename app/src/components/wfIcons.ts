// Icons copied from the wireframe HTML (24x24, stroke 1.8, round caps). Keyed by the Feather name the app uses,
// so <Icon name="calendar" /> draws the wireframe's calendar. Anything not listed falls back to Feather.
export const WF_ICONS: Record<string, string> = {
  'chevron-left': '<path d="M15 6l-6 6 6 6"/>',
  'chevron-right': '<path d="M9 6l6 6-6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h0M4.5 12h0M4.5 18h0"/>',
  smartphone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.8c1.8.7 3 2.3 3 4.7"/>',
  'message-square': '<path d="M4 5h16v11H9l-5 4z"/>',
  'credit-card': '<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18M16 15h2"/>',
  'alert-triangle': '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5h0"/>',
  'file-text': '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
  download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19h14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5"/>',
  'edit-2': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  inbox: '<path d="M4 13l2.5-7h11L20 13v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  truck: '<path d="M4 16v-3.5L6 7h12l2 5.5V16zM4 16v2.5M20 16v2.5M7.5 13h0M16.5 13h0"/>',
  coffee: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5"/>',
  camera: '<rect x="3" y="7" width="18" height="13" rx="2.5"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8.5 7l1.5-2.5h4L15.5 7"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  'play-circle': '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
  droplet: '<path d="M3.5 7h17v3a8.5 8.5 0 0 1-17 0z"/><path d="M8 7v3M16 7v3"/>',
  'file-plus': '<path d="M6 3h9l4 4v14H6zM9.5 12h6M9.5 16h6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  phone: '<path d="M5 4h3.5l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 5 2V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  settings: '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.2 3.3-7 7.5-7s7.5 2.8 7.5 7"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
};

export function wfSvg(name: string, color: string, strokeWidth = 1.8) {
  const inner = WF_ICONS[name];
  if (!inner) return null;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
