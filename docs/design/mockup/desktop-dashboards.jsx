// Habit Maxxing — desktop screens
// 3 dashboard variations + habit detail + create habit

const { Icon, HabitCheck, StreakBadge, Heatmap, YearHeatmap, WeekDots,
  ProgressBar, ProgressRing, Sparkline, HabitIcon, genHeatData, hmColors: c } = window;

// ── Shared chrome ─────────────────────────────────────────────────────
function Logo({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: size, height: size, borderRadius: 6,
        background: `linear-gradient(135deg, ${c.accent}, ${c.accentLo})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 6px 16px -4px ${c.accentGlow}`,
      }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 16 16"
          style={{ fill: 'none', stroke: '#fff', strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
          <path d="M3 9l3 3 7-8" />
        </svg>
      </div>
      <span style={{
        fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em',
        color: c.textHi,
      }}>Habit<span style={{ color: c.accent }}>Maxxing</span></span>
    </div>
  );
}

function SidebarNav({ active = 'today' }) {
  const items = [
    { id: 'today', label: 'Hoy', icon: 'home', count: 5 },
    { id: 'habits', label: 'Hábitos', icon: 'list', count: 8 },
    { id: 'stats', label: 'Estadísticas', icon: 'bar' },
    { id: 'calendar', label: 'Calendario', icon: 'calendar' },
  ];
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 11px', borderRadius: 8,
            color: on ? c.textHi : c.textMid,
            background: on ? c.surface2 : 'transparent',
            fontSize: 14, fontWeight: on ? 600 : 500,
            textAlign: 'left',
            position: 'relative',
          }}>
            {on && <div style={{ position: 'absolute', left: -14, top: 9, bottom: 9, width: 2, background: c.accent, borderRadius: 2 }} />}
            <Icon name={it.icon} size={16} stroke={on ? 2 : 1.6} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.count != null && (
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: on ? c.textMid : c.textLow,
                background: on ? c.surface3 : 'transparent',
                padding: on ? '2px 6px' : 0, borderRadius: 4,
              }}>{it.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function Sidebar({ active }) {
  return (
    <aside style={{
      width: 232, flexShrink: 0, padding: '22px 14px 22px 20px',
      borderRight: `1px solid ${c.borderLo}`,
      display: 'flex', flexDirection: 'column', gap: 22, height: '100%',
    }}>
      <Logo />
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.textLow, padding: '0 11px', marginTop: 4 }}>NAVEGAR</div>
      <SidebarNav active={active} />

      <div style={{ flex: 1 }} />

      {/* Level / XP card */}
      <div style={{
        padding: '14px 14px 12px',
        borderRadius: 12,
        background: `linear-gradient(135deg, ${c.surface2}, ${c.surface})`,
        border: `1px solid ${c.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="zap" size={13} fill={c.accent} stroke={0} color={c.accent} />
            <span style={{ fontSize: 12, fontWeight: 600, color: c.text }}>Nivel 12</span>
          </div>
          <span style={{ fontSize: 11, color: c.textLow, fontVariantNumeric: 'tabular-nums' }}>1,847 XP</span>
        </div>
        <ProgressBar value={62} />
        <div style={{ fontSize: 11, color: c.textLow, marginTop: 7 }}>153 XP para nivel 13</div>
      </div>

      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 11px', borderRadius: 8,
        color: c.textMid, fontSize: 14, fontWeight: 500,
      }}>
        <Icon name="settings" size={16} />
        Configuración
      </button>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px 0', borderTop: `1px solid ${c.borderLo}`, paddingTop: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `linear-gradient(135deg, #7C3AED, #F59E0B)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>MR</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.textHi, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mateo Reyes</div>
          <div style={{ fontSize: 11, color: c.textLow }}>Racha global · 47</div>
        </div>
      </div>
    </aside>
  );
}

// ── Demo data ─────────────────────────────────────────────────────────
// Per-habit tints stay as hex (they're user-chosen identity colors and
// remain constant across light/dark). Palette aligned to the semantic spec.
const HABITS = [
  { id: 'h1', name: 'Meditar 10 min',  icon: 'drops',    tint: '#5e8bff', type: 'bin', streak: 47, weekly: [1,1,1,1,0,1,0], freq: 'Todos los días', done: true },
  { id: 'h2', name: 'Correr 5 km',     icon: 'zap',      tint: '#7C3AED', type: 'num', goal: 5,  unit: 'km', current: 5.2, streak: 12, weekly: [1,0,1,0,1,0,0], freq: 'L · X · V', done: true },
  { id: 'h3', name: 'Leer 20 páginas', icon: 'book',     tint: '#10B981', type: 'num', goal: 20, unit: 'pp', current: 12,  streak: 8,  weekly: [1,1,1,1,1,0,0], freq: 'L–V', done: false },
  { id: 'h4', name: 'Sin azúcar',      icon: 'close',    tint: '#F43F5E', type: 'bin', streak: 3,  weekly: [1,1,1,0,0,0,0], freq: 'Todos los días', done: false },
  { id: 'h5', name: 'Entrenar fuerza', icon: 'dumbbell', tint: '#F59E0B', type: 'bin', streak: 21, weekly: [1,0,1,0,1,1,0], freq: 'L · X · V · S', done: false },
];

const TODAY = { dateStr: 'jueves, 22 de mayo', completed: 2, total: 5 };

// ── DASHBOARD A — Quiet (Linear/Uber) ─────────────────────────────────
function DashboardQuiet() {
  const [habits, setHabits] = React.useState(HABITS);
  const completed = habits.filter((h) => h.done).length;
  const pct = (completed / habits.length) * 100;

  return (
    <div className="hm-root" style={{ display: 'flex', height: '100%', background: c.bg }}>
      <Sidebar active="today" />
      <main style={{ flex: 1, padding: '32px 56px', overflow: 'auto' }} className="hm-scroll">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: c.textLow, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{TODAY.dateStr}</div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', color: c.textHi, margin: 0, lineHeight: 1.05 }}>
              Hábitos de hoy
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.textHi, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ color: c.accent }}>{completed}</span>
                <span style={{ color: c.textLow }}> / {habits.length}</span>
              </div>
              <div style={{ fontSize: 12, color: c.textLow, marginTop: 4 }}>completados</div>
            </div>
            <button style={{
              padding: '10px 16px', borderRadius: 8,
              background: c.accent, color: '#fff',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="plus" size={14} stroke={2.4} />
              Nuevo hábito
            </button>
          </div>
        </div>

        {/* Progress strip */}
        <div style={{ marginBottom: 36 }}>
          <ProgressBar value={pct} height={3} />
        </div>

        {/* Habit list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {habits.map((h, i) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 18,
              padding: '18px 4px',
              borderTop: i === 0 ? `1px solid ${c.borderLo}` : 'none',
              borderBottom: `1px solid ${c.borderLo}`,
            }}>
              <HabitCheck checked={h.done} color={h.tint}
                onChange={(v) => setHabits(habits.map((x) => x.id === h.id ? { ...x, done: v } : x))} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: h.done ? c.textMid : c.textHi, textDecoration: h.done ? 'line-through' : 'none', textDecorationColor: c.textDim, lineHeight: 1.2 }}>{h.name}</div>
                <div style={{ fontSize: 12, color: c.textLow, marginTop: 4 }}>
                  {h.type === 'num' ? `${h.current} / ${h.goal} ${h.unit}` : h.freq}
                </div>
              </div>
              <WeekDots days={h.weekly} />
              <StreakBadge count={h.streak} />
              <button style={{ width: 28, height: 28, borderRadius: 6, color: c.textLow }}>
                <Icon name="more" size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Empty hint at the bottom */}
        <div style={{ marginTop: 24, fontSize: 12, color: c.textLow, textAlign: 'center' }}>
          {habits.length - completed} {habits.length - completed === 1 ? 'hábito restante' : 'hábitos restantes'} para terminar el día
        </div>
      </main>
    </div>
  );
}

// ── DASHBOARD B — Vibrant (SoundCloud accent) ─────────────────────────
function DashboardVibrant() {
  const [habits, setHabits] = React.useState(HABITS);
  const completed = habits.filter((h) => h.done).length;
  const pct = (completed / habits.length) * 100;

  return (
    <div className="hm-root" style={{ display: 'flex', height: '100%', background: c.bg }}>
      <Sidebar active="today" />
      <main style={{ flex: 1, padding: '24px 44px 32px', overflow: 'auto' }} className="hm-scroll">
        {/* Hero level banner */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          padding: '20px 24px', borderRadius: 16, marginBottom: 24,
          background: c.surface,
          border: `1px solid ${c.border}`,
        }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${c.accentGlow}, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `linear-gradient(135deg, ${c.accent}, ${c.accentHi})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: '#fff',
              boxShadow: `0 10px 30px -8px ${c.accentGlow}`,
            }}>12</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: c.accent }}>NIVEL 12</div>
                <div style={{ fontSize: 11, color: c.textLow }}>·</div>
                <div style={{ fontSize: 13, color: c.textMid, fontVariantNumeric: 'tabular-nums' }}>1,847 / 2,000 XP</div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: c.textHi, marginBottom: 12, lineHeight: 1.3 }}>Llevas <span style={{ color: c.accent }}>47 días</span> seguidos cumpliendo al menos un hábito.</div>
              <ProgressBar value={1847} max={2000} height={6} color={c.accent} track={c.surface2} />
            </div>
            <button style={{
              padding: '10px 18px', borderRadius: 8,
              background: c.accent, color: '#fff',
              fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              alignSelf: 'flex-start',
              transition: 'background .15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hm-accent-hi)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--hm-accent)'}>
              <Icon name="plus" size={14} stroke={2.4} />
              Nuevo hábito
            </button>
          </div>
        </div>

        {/* Today header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <h2 className="hm-h2" style={{ color: c.textHi }}>Hábitos de hoy</h2>
            <span style={{ fontSize: 13, color: c.textLow }}>{TODAY.dateStr}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: c.textMid, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: c.success, fontWeight: 600 }}>{completed}</span> de {habits.length} completados
            </div>
            <div style={{ width: 80 }}><ProgressBar value={pct} color={c.success} /></div>
          </div>
        </div>

        {/* Habit cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {habits.map((h) => (
            <div key={h.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 20px', borderRadius: 12,
              background: h.done ? `linear-gradient(90deg, ${h.tint}14, ${c.surface} 60%)` : c.surface,
              border: `1px solid ${h.done ? h.tint + '40' : c.border}`,
              transition: 'all .15s',
            }}>
              <HabitCheck checked={h.done} color={h.tint}
                onChange={(v) => setHabits(habits.map((x) => x.id === h.id ? { ...x, done: v } : x))} />
              <HabitIcon icon={h.icon} tint={h.tint} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.textHi, lineHeight: 1.3 }}>{h.name}</div>
                <div style={{ fontSize: 13, color: c.textMid, marginTop: 3, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span>{h.freq}</span>
                  {h.type === 'num' && (
                    <>
                      <span style={{ color: c.textDim }}>·</span>
                      <span style={{ color: h.done ? h.tint : c.text, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                        {h.current} / {h.goal} {h.unit}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Heatmap data={genHeatData(parseInt(h.id.slice(1)) * 7, 35, 0.65)} cell={8} gap={2} cols={5} />
              <StreakBadge count={h.streak} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── DASHBOARD C — Dense (Spotify/GitHub) ──────────────────────────────
function DashboardDense() {
  const [habits, setHabits] = React.useState(HABITS);
  const completed = habits.filter((h) => h.done).length;

  return (
    <div className="hm-root" style={{ display: 'flex', height: '100%', background: c.bg }}>
      <Sidebar active="today" />
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Center column: habits */}
        <div style={{ flex: 1, padding: '28px 36px 28px 40px', overflow: 'auto', borderRight: `1px solid ${c.borderLo}` }} className="hm-scroll">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: c.textHi, margin: 0 }}>Hábitos de hoy</h1>
              <div style={{ fontSize: 13, color: c.textMid, marginTop: 4 }}>{TODAY.dateStr} · {completed} de {habits.length} completados</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, color: c.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="filter" size={15} />
              </button>
              <button style={{
                padding: '0 14px', height: 34, borderRadius: 8,
                background: c.accent, color: '#fff',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="plus" size={14} stroke={2.4} />
                Nuevo
              </button>
            </div>
          </div>

          {/* Column header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '32px 1fr 110px 120px 60px',
            gap: 16, padding: '0 12px 10px',
            fontSize: 11, fontWeight: 600, color: c.textLow,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            borderBottom: `1px solid ${c.borderLo}`,
          }}>
            <div></div>
            <div>Hábito</div>
            <div>Últimos 35 días</div>
            <div>Esta semana</div>
            <div style={{ textAlign: 'right' }}>Racha</div>
          </div>

          {/* Habits */}
          {habits.map((h) => (
            <div key={h.id} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 110px 120px 60px',
              gap: 16, padding: '14px 12px', alignItems: 'center',
              borderBottom: `1px solid ${c.borderLo}`,
            }}>
              <HabitCheck checked={h.done} color={h.tint} size={24}
                onChange={(v) => setHabits(habits.map((x) => x.id === h.id ? { ...x, done: v } : x))} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <HabitIcon icon={h.icon} tint={h.tint} size={28} radius={7} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.textHi, lineHeight: 1.2 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: c.textLow, marginTop: 2 }}>
                    {h.type === 'num' ? `${h.goal} ${h.unit}` : 'Binario'} · {h.freq}
                  </div>
                </div>
              </div>
              <Heatmap data={genHeatData(parseInt(h.id.slice(1)) * 7, 35, 0.7)} cell={9} gap={2} cols={7} />
              <WeekDots days={h.weekly} />
              <div style={{ textAlign: 'right' }}><StreakBadge count={h.streak} /></div>
            </div>
          ))}
        </div>

        {/* Right column: stats */}
        <aside style={{ width: 280, padding: '28px 24px', overflow: 'auto', flexShrink: 0 }} className="hm-scroll">
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.textLow, textTransform: 'uppercase', marginBottom: 14 }}>Resumen</div>

          {/* Big stat: Level */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <ProgressRing value={92} max={100} size={56} stroke={5}>
                <span style={{ fontSize: 14, fontWeight: 700, color: c.textHi }}>12</span>
              </ProgressRing>
              <div>
                <div style={{ fontSize: 12, color: c.textMid }}>Nivel actual</div>
                <div style={{ fontSize: 19, fontWeight: 700, color: c.textHi, fontVariantNumeric: 'tabular-nums' }}>1,847 XP</div>
                <div style={{ fontSize: 11, color: c.textLow }}>153 para nivel 13</div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            <StatCard label="Racha global" value="47" suffix="días" tint={c.accent} />
            <StatCard label="Más larga" value="62" suffix="días" />
            <StatCard label="Este mes" value="84%" />
            <StatCard label="Total" value="312" suffix="hábitos" />
          </div>

          {/* Weekly chart */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Esta semana</div>
              <div style={{ fontSize: 11, color: c.success, fontWeight: 600 }}>↑ 12%</div>
            </div>
            <Sparkline data={[2, 3, 4, 3, 5, 4, 2]} width={236} height={48} color={c.accent} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: c.textLow }}>
              <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
          </div>

          {/* Best streak now */}
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.textLow, textTransform: 'uppercase', marginBottom: 12 }}>Mejores rachas</div>
          {[
            { name: 'Meditar 10 min', n: 47, tint: '#5e8bff' },
            { name: 'Entrenar fuerza', n: 21, tint: '#F59E0B' },
            { name: 'Correr 5 km', n: 12, tint: '#7C3AED' },
          ].map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: s.tint, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 13, color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.textHi, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}

function StatCard({ label, value, suffix, tint }) {
  return (
    <div style={{
      padding: 12, borderRadius: 10,
      background: c.surface, border: `1px solid ${c.borderLo}`,
    }}>
      <div style={{ fontSize: 11, color: c.textLow, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: tint || c.textHi, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        {suffix && <div style={{ fontSize: 11, color: c.textLow }}>{suffix}</div>}
      </div>
    </div>
  );
}

Object.assign(window, {
  Logo, Sidebar, SidebarNav, StatCard,
  DashboardQuiet, DashboardVibrant, DashboardDense,
  HABITS, TODAY,
});
