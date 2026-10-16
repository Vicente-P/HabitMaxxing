// Habit Maxxing — atoms (v2: violet + semantic + theme-aware via CSS vars)
// hmColors values are CSS var() references — they resolve against whichever
// .hm-dark / .hm-light scope they're rendered into, so the same component
// works in both themes side-by-side on the canvas.

const v = (n) => `var(--hm-${n})`;
const hmColors = {
  bg: v('bg'), surface: v('surface'), surface2: v('surface-2'), surface3: v('surface-3'),
  border: v('border'), borderHi: v('border-hi'), borderLo: v('border-lo'),
  textHi: v('text-hi'), text: v('text'), textMid: v('text-mid'), textLow: v('text-low'), textDim: v('text-dim'),

  accent: v('accent'), accentHi: v('accent-hi'), accentLo: v('accent-lo'),
  accentSoft: v('accent-soft'), accentSoftHi: v('accent-soft-hi'),
  accentGlow: v('accent-glow'),

  success: v('success'), successSoft: v('success-soft'),
  warn: v('warn'),       warnSoft: v('warn-soft'),
  danger: v('danger'),   dangerSoft: v('danger-soft'),

  heat: [v('heat-0'), v('heat-1'), v('heat-2'), v('heat-3'), v('heat-4')],

  // Type tokens
  fs: { h1: 28, h2: 20, body: 15, caption: 13, micro: 11 },
  fw: { reg: 400, med: 500, semi: 600, bold: 700 },
  tr: { tight: '-0.02em', tightSm: '-0.01em' },
};

// ── Icon ──────────────────────────────────────────────────────────────
// IMPORTANT: fill/stroke as SVG attributes won't accept var() — so we route
// them through `style` (which IS CSS and resolves var()).
const ICONS = {
  check: 'M4 8l3 3 5-7',
  plus: 'M8 3v10M3 8h10',
  flame: 'M8 1.5c.5 2 2.5 3 2.5 5.5a2.5 2.5 0 0 1-5 0c0-1 .5-1.5 1-2-.5 2 1.5 2 1.5 0 0-1.5-1.5-2.5 0-3.5z',
  zap: 'M9 1L3 9h4l-1 6 6-8H8l1-6z',
  calendar: 'M3 4h10v9H3zM3 6h10M6 2v3M10 2v3',
  target: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  trending: 'M2 11l4-4 3 3 5-6M10 4h3v3',
  trophy: 'M5 2h6v3a3 3 0 1 1-6 0V2zM3 3h2v2a2 2 0 1 1-2 0V3zM11 3h2v2a2 2 0 0 1-2 2V3zM6 11h4v2H6z',
  home: 'M2 8l6-5 6 5v6H2z',
  list: 'M4 4h9M4 8h9M4 12h9M2 4h.01M2 8h.01M2 12h.01',
  bar: 'M3 13V8M7 13V4M11 13V10M3 13h10',
  settings: 'M8 5.5A2.5 2.5 0 1 0 8 10.5 2.5 2.5 0 0 0 8 5.5zM13 8a5.4 5.4 0 0 0-.1-1l1.4-1-1.5-2.5-1.6.6a5 5 0 0 0-1.7-1L9 1.5h-3l-.4 1.6a5 5 0 0 0-1.7 1L2.2 3.5.8 6l1.4 1a5.4 5.4 0 0 0 0 2L.8 10l1.5 2.5 1.6-.6a5 5 0 0 0 1.7 1L6 14.5h3l.4-1.6a5 5 0 0 0 1.7-1l1.6.6 1.5-2.5-1.4-1A5.4 5.4 0 0 0 13 8z',
  arrowRight: 'M3 8h10M9 4l4 4-4 4',
  arrowLeft: 'M13 8H3M7 4 3 8l4 4',
  more: 'M3 8h.01M8 8h.01M13 8h.01',
  search: 'M11 11l3 3M12.5 7a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z',
  close: 'M4 4l8 8M12 4l-8 8',
  edit: 'M11 2l3 3-9 9H2v-3l9-9z',
  trash: 'M3 4h10M5 4V2h6v2M6 4v9M10 4v9M4 4l1 10h6l1-10',
  drops: 'M8 1c2 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2-5 4-8z',
  book: 'M3 3h4a2 2 0 0 1 2 2v8a2 2 0 0 0-2-2H3V3zM13 3H9a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4V3z',
  dumbbell: 'M2 6v4M4 4v8M12 4v8M14 6v4M4 8h8',
  sun: 'M8 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM8 1v1.5M8 13.5V15M2 8h1.5M12.5 8H14M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1',
  moon: 'M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z',
  music: 'M5 12V3l8-2v9M5 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2zM13 10a2 2 0 1 1-2-2 2 2 0 0 1 2 2z',
  bell: 'M4 12V8a4 4 0 0 1 8 0v4l1 2H3l1-2zM6.5 14a1.5 1.5 0 0 0 3 0',
  filter: 'M2 3h12L9 9v5l-2-1V9L2 3z',
  chevDown: 'M4 6l4 4 4-4',
  chevRight: 'M6 4l4 4-4 4',
};

function Icon({ name, size = 16, stroke = 1.6, color = 'currentColor', fill = 'none', style }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 16 16"
      style={{
        flexShrink: 0,
        fill, stroke: color, strokeWidth: stroke,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        ...style,
      }}>
      <path d={d} />
    </svg>
  );
}

// ── Checkbox (big, round) ─────────────────────────────────────────────
// On accent (violet — dark) we use a white check; on neutral states the
// stroke comes from the surface bg.
function HabitCheck({ checked, onChange, color = hmColors.accent, size = 28 }) {
  return (
    <button
      onClick={() => onChange && onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: size, height: size, borderRadius: '50%',
        border: checked ? `1.5px solid ${color}` : `1.5px solid ${hmColors.border}`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s ease',
        boxShadow: checked ? `0 0 0 4px ${hmColors.accentSoft}` : 'none',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!checked) e.currentTarget.style.borderColor = hmColors.borderHi; }}
      onMouseLeave={(e) => { if (!checked) e.currentTarget.style.borderColor = hmColors.border; }}
    >
      {checked && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 16 16"
          style={{ fill: 'none', stroke: '#fff', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d={ICONS.check} />
        </svg>
      )}
    </button>
  );
}

// ── Streak badge ──────────────────────────────────────────────────────
// Per spec: racha activa = amber. Uses warn-soft bg + warn fg.
function StreakBadge({ count, size = 'sm' }) {
  const big = size === 'lg';
  const active = count > 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: big ? 6 : 4,
      padding: big ? '6px 10px' : '3px 7px',
      borderRadius: 999,
      background: active ? hmColors.warnSoft : 'transparent',
      color: active ? hmColors.warn : hmColors.textLow,
      fontSize: big ? 14 : 12,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1,
      border: !active ? `1px solid ${hmColors.border}` : 'none',
    }}>
      <Icon name="flame" size={big ? 14 : 11}
        fill={active ? hmColors.warn : 'none'}
        color={active ? hmColors.warn : 'currentColor'}
        stroke={active ? 0 : 1.6} />
      {count}
    </span>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────
function Heatmap({ data, cell = 11, gap = 3, cols = 7, rows, rounded = 2 }) {
  rows = rows || Math.ceil(data.length / cols);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
      {data.map((v, i) => (
        <div key={i} style={{
          width: cell, height: cell, borderRadius: rounded,
          background: hmColors.heat[Math.max(0, Math.min(4, v))],
        }} />
      ))}
    </div>
  );
}

// Big year-view heatmap, GitHub-style
function YearHeatmap({ data, cell = 11, gap = 3, monthLabels = true }) {
  const weeks = 53;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return (
    <div>
      {monthLabels && (
        <div style={{ display: 'flex', gap: 0, marginBottom: 6, paddingLeft: 24, color: hmColors.textLow, fontSize: 11 }}>
          {months.map((m) => (
            <div key={m} style={{ width: (weeks / 12) * (cell + gap), color: hmColors.textLow }}>{m}</div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ display: 'grid', gridTemplateRows: `repeat(7, ${cell}px)`, gap, color: hmColors.textLow, fontSize: 10 }}>
          <div></div><div>Lu</div><div></div><div>Mi</div><div></div><div>Vi</div><div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, ${cell}px)`, gap }}>
          {Array.from({ length: weeks * 7 }, (_, i) => {
            const week = i % weeks;
            const day = Math.floor(i / weeks);
            const idx = week * 7 + day;
            const val = data[idx] || 0;
            return (
              <div key={i} style={{
                width: cell, height: cell, borderRadius: 2,
                background: hmColors.heat[Math.max(0, Math.min(4, val))],
                gridColumn: week + 1, gridRow: day + 1,
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Weekly dots (compact) ─────────────────────────────────────────────
function WeekDots({ days }) {
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {days.map((done, i) => (
        <div key={i} style={{
          width: 18, height: 24, borderRadius: 5,
          background: done ? hmColors.heat[4] : hmColors.heat[0],
          color: done ? '#fff' : hmColors.textLow,
          fontSize: 9.5, fontWeight: 700,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: 3,
        }}>{labels[i]}</div>
      ))}
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────
function ProgressBar({ value, max = 100, height = 4, color = hmColors.accent, track = hmColors.surface2 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ height, background: track, borderRadius: height, overflow: 'hidden', width: '100%' }}>
      <div style={{
        width: pct + '%', height: '100%',
        background: color, borderRadius: height,
        transition: 'width .35s ease',
      }} />
    </div>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────
// Stroke attributes go through `style` so var() resolves.
function ProgressRing({ value, max = 100, size = 64, stroke = 6, color = hmColors.accent, track = hmColors.surface2, children }) {
  const r = (size - stroke) / 2;
  const cir = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} style={{ fill: 'none', stroke: track, strokeWidth: stroke }} />
        <circle cx={size / 2} cy={size / 2} r={r}
          style={{
            fill: 'none', stroke: color, strokeWidth: stroke,
            strokeDasharray: cir, strokeDashoffset: cir * (1 - pct),
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset .35s ease',
          }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────
// gradient stop colors → style attr so var() works.
let sparkSeq = 0;
function Sparkline({ data, width = 120, height = 32, color = hmColors.accent, fill = true }) {
  const id = React.useMemo(() => `spark-grad-${++sparkSeq}`, []);
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => [i * step, height - ((d - min) / span) * (height - 4) - 2]);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.32 }} />
              <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <path d={areaPath} style={{ fill: `url(#${id})` }} />
        </>
      )}
      <path d={linePath}
        style={{ fill: 'none', stroke: color, strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
    </svg>
  );
}

// ── Habit icon (colored square with glyph) ────────────────────────────
// `tint` is per-habit color (real hex) — these are user-chosen and stay
// constant across light/dark so a habit keeps its identity.
function HabitIcon({ icon = 'flame', tint = '#7C3AED', size = 36, radius = 9 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, ${tint}33, ${tint}1a)`,
      border: `1px solid ${tint}40`,
      color: tint,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={Math.round(size * 0.5)} stroke={1.8} />
    </div>
  );
}

// ── Demo data helpers ─────────────────────────────────────────────────
function genHeatData(seed = 1, days = 371, density = 0.6) {
  let s = seed * 9301 + 49297;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const out = [];
  for (let i = 0; i < days; i++) {
    const r = rand();
    if (r < 1 - density) out.push(0);
    else if (r < 1 - density + 0.1) out.push(1);
    else if (r < 1 - density + 0.25) out.push(2);
    else if (r < 1 - density + 0.45) out.push(3);
    else out.push(4);
  }
  return out;
}

Object.assign(window, {
  hmColors, Icon, HabitCheck, StreakBadge, Heatmap, YearHeatmap,
  WeekDots, ProgressBar, ProgressRing, Sparkline, HabitIcon, genHeatData,
});
