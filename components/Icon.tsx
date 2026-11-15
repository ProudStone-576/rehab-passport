// One small inline icon set (24px grid, 1.75 stroke) so the app loads no icon
// library. Icons always sit beside a text label; on their own they need aria-label.
const PATHS = {
  dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  patients: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  library: "M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19M9 7h6",
  evaluation: "M4 20h16M7 16v-5M12 16V6M17 16v-8",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M9.5 9.5a2.5 2.5 0 0 1 4.86.83c0 1.67-2.36 2.17-2.36 3.67M12 17h.01",
  settings: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6L6 18",
  back: "M15 6l-6 6 6 6",
  plus: "M12 5v14M5 12h14",
  phone: "M8 3h8a1.5 1.5 0 0 1 1.5 1.5v15A1.5 1.5 0 0 1 16 21H8a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 8 3M11 18h2",
  print: "M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2M7 14h10v6H7z",
  edit: "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4",
  check: "M5 12.5l4.5 4.5L19 7",
  alert: "M12 9v4M12 17h.01M10.3 4.2L2.8 17.5A2 2 0 0 0 4.5 20.5h15a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M20 20l-4-4",
  calendar: "M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1M4 10h16M8 3v4M16 3v4",
  copy: "M9 9h10v11H9zM5 15V4h10",
  logout: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10",
  activity: "M3 12h4l3-7 4 14 3-7h4",
  arrow: "M9 6l6 6-6 6",
  play: "M8 5v14l11-7z",
  pause: "M8 5h3v14H8zM13 5h3v14h-3z",
  sound: "M5 9v6h4l5 4V5L9 9zM17.5 8.5a5 5 0 0 1 0 7",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, label, size }: { name: IconName; label?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24" width={size ?? 20} height={size ?? 20} fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
