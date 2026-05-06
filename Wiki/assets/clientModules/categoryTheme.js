import topicMap from '../../topics/topic-map.json';

const CATEGORY_COLORS = Object.fromEntries(
  topicMap.mappings.map(({ category, color }) => [category, color ?? '#ffffff'])
);

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function mix(hex, target, t) {
  const c = hexToRgb(hex);
  const d = hexToRgb(target);
  if (!c || !d) return hex;
  return '#' + [c.r + (d.r - c.r) * t, c.g + (d.g - c.g) * t, c.b + (d.b - c.b) * t]
    .map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function applyCategory(pathname) {
  const segs = pathname.replace(/^\/wiki/, '').split('/').filter(Boolean);
  const seg  = segs[0] === 'mock' ? segs[1] : segs[0];
  const color = seg ? CATEGORY_COLORS[seg] : null;
  const root = document.documentElement;

  if (color) {
    const rgb = hexToRgb(color);
    root.style.setProperty('--ifm-color-primary',           color);
    root.style.setProperty('--ifm-color-primary-dark',      mix(color, '#000000', 0.10));
    root.style.setProperty('--ifm-color-primary-darker',    mix(color, '#000000', 0.15));
    root.style.setProperty('--ifm-color-primary-darkest',   mix(color, '#000000', 0.25));
    root.style.setProperty('--ifm-color-primary-light',     mix(color, '#ffffff', 0.08));
    root.style.setProperty('--ifm-color-primary-lighter',   mix(color, '#ffffff', 0.15));
    root.style.setProperty('--ifm-color-primary-lightest',  mix(color, '#ffffff', 0.30));
    if (rgb) {
      root.style.setProperty('--ifm-color-primary-alpha-10', `rgba(${rgb.r},${rgb.g},${rgb.b},0.1)`);
      root.style.setProperty('--ifm-color-primary-alpha-07', `rgba(${rgb.r},${rgb.g},${rgb.b},0.07)`);
    }
  } else {
    [
      '--ifm-color-primary', '--ifm-color-primary-dark', '--ifm-color-primary-darker',
      '--ifm-color-primary-darkest', '--ifm-color-primary-light', '--ifm-color-primary-lighter',
      '--ifm-color-primary-lightest', '--ifm-color-primary-alpha-10', '--ifm-color-primary-alpha-07',
    ].forEach(p => root.style.removeProperty(p));
  }
}

export function onRouteUpdate({ location }) {
  applyCategory(location.pathname);
}
