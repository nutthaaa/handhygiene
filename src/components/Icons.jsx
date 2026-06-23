export function Icon({ name, size = 24 }) {
  const paths = {
    home: <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    department: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M9 21v-5h6v5"/></>,
    moments: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    staff: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6"/><circle cx="17" cy="9" r="2"/><path d="M15.5 15c3.2 0 4.8 1.7 5 5"/></>,
    trend: <><path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    alert: <><path d="M12 3 2.7 19h18.6L12 3Z"/><path d="M12 9v4M12 16h.01"/></>,
    report: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></>,
    location: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
    form: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    refresh: <><path d="M20 6v5h-5"/><path d="M18.5 16a8 8 0 1 1 .5-9l1 4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    hand: <><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5"/><path d="M10 9V3.5a1.5 1.5 0 0 1 3 0V9"/><path d="M13 9V5a1.5 1.5 0 0 1 3 0v6"/><path d="M16 10V7a1.5 1.5 0 0 1 3 0v7c0 5-3 8-7 8-3 0-5-1-7-4l-2-3a1.7 1.7 0 0 1 2.7-2l1.3 1.3"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
