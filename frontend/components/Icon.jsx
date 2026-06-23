'use client';

const ICON_PATHS = {
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>,
  ruler: <><path d="M21.3 15.3 8.7 2.7a1 1 0 0 0-1.4 0L2.7 7.3a1 1 0 0 0 0 1.4l12.6 12.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z"/><path d="m14.5 12.5-2 2M11.5 9.5l-2 2M8.5 6.5l-2 2"/></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></>,
  lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></>,
  dollar: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2 0 0 0-2.5-1.5c-1.4 0-2.5.7-2.5 1.8 0 2.7 5 1.3 5 4 0 1.1-1.1 1.9-2.5 1.9A2.6 2 0 0 1 9.5 15M12 6v1.5M12 16.5V18"/></>,
  hexagon: <><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"/><path d="m12 7 5 3v4l-5 3-5-3v-4l5-3Z"/></>,
  users: <><circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2 19c0-3 2.5-4.5 6-4.5S14 16 14 19M15 14.6c2.8.2 5 1.7 5 4.4"/></>,
  check: <path d="M20 6 9 17l-5-5"/>,
  checkCircle: <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
  arrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  arrowLeft: <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  chevronRight: <path d="m9 6 6 6-6 6"/>,
  chevronDown: <path d="m6 9 6 6 6-6"/>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  sofa: <><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M3 13a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4H3z"/><path d="M5 17v2M19 17v2"/></>,
  bed: <><path d="M3 9v11M3 13h18a2 2 0 0 1 2 2v5M21 13V9a2 2 0 0 0-2-2H9v6"/><circle cx="6.5" cy="10.5" r="1.5"/></>,
  cooking: <><path d="M4 14h16M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5M12 3v3M8 4.5 9 7M16 4.5 15 7M5 14a7 7 0 0 1 14 0"/></>,
  bath: <><path d="M4 12V5a2 2 0 0 1 4 0v.5M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 20l-1 2M18 20l1 2"/></>,
  sparkle: <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  palette: <><circle cx="12" cy="12" r="9"/><circle cx="8" cy="9" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="9" r="1"/><path d="M12 21a3 3 0 0 1 0-6 2 2 0 0 0 0-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
  folder: <><path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 16-5-5L5 21"/></>,
  swap: <><path d="M17 3l4 4-4 4"/><path d="M21 7H8a4 4 0 0 0-4 4v0"/><path d="M7 21l-4-4 4-4"/><path d="M3 17h13a4 4 0 0 0 4-4v0"/></>,
  compare: <><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/></>,
  bookmark: <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>,
  mic: <><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/></>,
  paperclip: <path d="M21.4 11.05 12.25 20.2a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24l-9.2 9.19a1 1 0 0 1-1.41-1.41l8.49-8.49"/>,
  send: <><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  x: <><path d="M18 6 6 18M6 6l12 12"/></>,
  dots: <><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></>,
  heart: <path d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2-1.8 4-3.6 5.5-5"/>,
  alert: <><path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  shuffle: <><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></>,
  light: <><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z"/></>,
  tile: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
  faucet: <><path d="M3 8h6v3M9 9h6a3 3 0 0 1 3 3M18 12h3M9 11v4a3 3 0 0 0 3 3v0a3 3 0 0 0 3-3"/><rect x="6" y="6" width="3" height="3" rx="0.6"/></>,
  vanity: <><rect x="3" y="4" width="18" height="9" rx="1.5"/><path d="M5 13v7M19 13v7M3 17h18"/><circle cx="9" cy="8.5" r="1.4"/></>,
  arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
  star: <path d="m12 3 2.6 5.6L21 9.5l-4.5 4.3 1.1 6.2L12 17l-5.6 3 1.1-6.2L3 9.5l6.4-.9z"/>,
  message: <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></>,
  store: <><path d="M3 9 4.2 4.5A1 1 0 0 1 5.2 4h13.6a1 1 0 0 1 1 .5L21 9"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"/><path d="M3 9a2.5 2.5 0 0 0 4.5 0 2.5 2.5 0 0 0 4.5 0 2.5 2.5 0 0 0 4.5 0 2.5 2.5 0 0 0 4.5 0"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  wallet: <><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M21 11h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"/></>,
  boxes: <><path d="M12 3 5 6.5 12 10l7-3.5L12 3Z"/><path d="m5 6.5 7 3.5v8l-7-3.5v-8Z"/><path d="m19 6.5-7 3.5v8l7-3.5v-8Z"/></>,
  trendUp: <><path d="M3 16.5 9 11l4 4 8-8"/><path d="M17 7h4v4"/></>,
  sliders: <><path d="M4 6h11M19 6h1M4 12h1M9 12h11M4 18h7M15 18h5"/><circle cx="17" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></>,
  funnel: <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z"/>,
  sort: <><path d="M7 4v16M7 4 4 7M7 4l3 3"/><path d="M17 20V4M17 20l-3-3M17 20l3-3"/></>,
  fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h5"/></>,
  bars: <><path d="M7 16v-4M12 16V8M17 16v-6"/><path d="M3 21h18"/></>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.3"/></>,
  waveform: <><path d="M4 10v4M8 7v10M12 3v18M16 6v12M20 10v4"/></>,
};

export default function Icon({ name, size = 24, stroke = 1.75, color = 'currentColor', style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', ...style }}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
