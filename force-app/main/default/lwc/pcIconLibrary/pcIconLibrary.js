/**
 * Partner Cloud icon library. 24×24 line icons stored as path data only so
 * they can be rendered declaratively by c-pc-icon (no innerHTML / lwc:dom).
 */
const ICONS = {
  arrowRight: { d: ["M5 12h14", "M13 6l6 6-6 6"] },
  bolt: { d: ["M13 2 3 14h7l-1 8 10-12h-7l1-8Z"] },
  chart: { d: ["M3 3v18h18", "m7 15 4-4 3 3 5-6"] },
  check: { d: ["M20 6 9 17l-5-5"] },
  close: { d: ["M6 6l12 12", "M18 6 6 18"] },
  cloud: {
    d: [
      "M17.5 19H7a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4.75 4.75 0 0 1-.5 9.5Z"
    ]
  },
  doc: {
    d: [
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z",
      "M14 2v6h6",
      "M8 13h8",
      "M8 17h5"
    ]
  },
  dollar: {
    d: ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]
  },
  external: {
    d: [
      "M15 3h6v6",
      "M10 14 21 3",
      "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
    ]
  },
  grid: {
    d: [
      "M4.5 3h4A1.5 1.5 0 0 1 10 4.5v4A1.5 1.5 0 0 1 8.5 10h-4A1.5 1.5 0 0 1 3 8.5v-4A1.5 1.5 0 0 1 4.5 3Z",
      "M15.5 3h4A1.5 1.5 0 0 1 21 4.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 14 8.5v-4A1.5 1.5 0 0 1 15.5 3Z",
      "M15.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4a1.5 1.5 0 0 1 1.5-1.5Z",
      "M4.5 14h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4A1.5 1.5 0 0 1 4.5 14Z"
    ]
  },
  handshake: {
    d: [
      "m11 17 2 2a1 1 0 1 0 3-3",
      "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4",
      "m21 3 1 11h-2",
      "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3",
      "M3 4h8"
    ]
  },
  layers: { d: ["m12 2 9 5-9 5-9-5 9-5Z", "m3 12 9 5 9-5", "m3 17 9 5 9-5"] },
  layout: {
    d: [
      "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
      "M3 9h18",
      "M9 21V9"
    ]
  },
  link: {
    d: [
      "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1",
      "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"
    ]
  },
  linkedin: {
    fill: true,
    d: [
      "M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3ZM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8.65 21 11 21 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3s-2.3 1.57-2.3 3.2V21H9Z"
    ]
  },
  mail: {
    d: [
      "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
      "m3 7 9 6 9-6"
    ]
  },
  megaphone: { d: ["m3 11 18-5v12L3 14v-3Z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"] },
  menu: { d: ["M4 7h16", "M4 12h16", "M4 17h16"] },
  refresh: {
    d: [
      "M3 12a9 9 0 0 1 15-6.7L21 8",
      "M21 3v5h-5",
      "M21 12a9 9 0 0 1-15 6.7L3 16",
      "M3 21v-5h5"
    ]
  },
  shield: { d: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"] },
  spark: {
    d: ["m12 3-1.9 5.8L4 10l5 3.5L7.5 20 12 16l4.5 4L15 13.5 20 10l-6.1-1.2Z"]
  },
  users: {
    d: [
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      "M5 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0Z",
      "M22 21v-2a4 4 0 0 0-3-3.87",
      "M16 3.13A4 4 0 0 1 16 11"
    ]
  }
};

export const ICON_NAMES = Object.freeze(Object.keys(ICONS));

/**
 * Returns `{ fill, paths: [{ key, d }] }` for a named icon, or null if unknown.
 */
export function getIcon(name) {
  const icon = ICONS[name];
  if (!icon) {
    return null;
  }
  return {
    fill: Boolean(icon.fill),
    paths: icon.d.map((d, index) => ({ key: `${name}-${index}`, d }))
  };
}
