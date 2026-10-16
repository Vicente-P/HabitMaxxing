// Habit Maxxing — mobile screens (rendered inside IOSDevice frame)

const { Icon, HabitCheck, StreakBadge, Heatmap, YearHeatmap, WeekDots,
  ProgressBar, ProgressRing, Sparkline, HabitIcon, genHeatData,
  hmColors: c, HABITS, TODAY } = window;

// ── Mobile tab bar ────────────────────────────────────────────────────
function MobileTabBar({ active = 'today' }) {
  const tabs = [
    { id: 'today', label: 'Hoy', icon: 'home' },
    { id: 'habits', label: 'Hábitos', icon: 'list' },
    { id: 'add', label: '', icon: 'plus' },
    { id: 'stats', label: 'Stats', icon: 'bar' },
    { id: 'me', label: 'Perfil', icon: 'settings' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 6,
      background: `linear-gradient(180deg, transparent, ${c.bg} 30%)`,
      display: 'flex', justifyContent: 'space-around',
      borderTop: `1px solid ${c.borderLo}`,
      zIndex: 5,
    }}>
      {tabs.map((t) => {
        const isAdd = t.id === 'add';
        const on = t.id === active;
        if (isAdd) {
          return (
            <button key={t.id} style={{
              width: 50, height: 50, marginTop: -16, borderRadius: '50%',
              background: c.accent,
              boxShadow: `0 10px 24px -4px ${c.accentGlow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="plus" size={20} color="#fff" stroke={2.6} />
            </button>
          );
        }
        return (
          <button key={t.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '6px 8px', color: on ? c.accent : c.textLow,
            flex: 1,
          }}>
            <Icon name={t.icon} size={20} stroke={on ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Mobile dashboard ──────────────────────────────────────────────────
function MobileDashboard() {
  const [habits, setHabits] = React.useState(HABITS);
  const completed = habits.filter((h) => h.done).length;
  const pct = (completed / habits.length) * 100;

  return (
    <div className="hm-root" style={{
      background: c.bg, height: '100%', width: '100%',
      position: 'relative', paddingTop: 48,
      overflow: 'hidden',
    }}>
      <div className="hm-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 100 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.accent}, #F59E0B)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>MR</div>
              <div>
                <div style={{ fontSize: 11, color: c.textLow, lineHeight: 1.1 }}>Buen día,</div>
                <div style={{ fontSize: 14, color: c.textHi, fontWeight: 600, lineHeight: 1.1 }}>Mateo</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: c.surface, border: `1px solid ${c.borderLo}`, color: c.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="search" size={16} />
              </button>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: c.surface, border: `1px solid ${c.borderLo}`, color: c.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Icon name="bell" size={16} />
                <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4, background: c.accent }} />
              </button>
            </div>
          </div>

          {/* Hero progress card */}
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '18px 18px 16px', borderRadius: 16,
            background: `linear-gradient(135deg, #1a0f08, ${c.surface})`,
            border: `1px solid ${c.border}`,
            marginBottom: 20,
          }}>
            <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${c.accentGlow}, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
              <ProgressRing value={completed} max={habits.length} size={62} stroke={6}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.textHi, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{completed}/{habits.length}</div>
                </div>
              </ProgressRing>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.accent, textTransform: 'uppercase', marginBottom: 4 }}>Hoy · {TODAY.dateStr.split(',')[0]}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: c.textHi, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                  {pct === 100 ? '¡Día completo!' : `${habits.length - completed} ${habits.length - completed === 1 ? 'hábito por hacer' : 'hábitos por hacer'}`}
                </div>
                <div style={{ fontSize: 12, color: c.textMid, marginTop: 4 }}>Racha global · <span style={{ color: c.accent, fontWeight: 600 }}>47 días</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Today section */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: c.textHi, margin: 0 }}>Hábitos de hoy</h2>
            <button style={{ fontSize: 12, color: c.textMid, fontWeight: 500 }}>Ver todos</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {habits.map((h) => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 13,
                padding: '12px 14px', borderRadius: 12,
                background: c.surface,
                border: `1px solid ${h.done ? h.tint + '40' : c.borderLo}`,
              }}>
                <HabitCheck checked={h.done} color={h.tint} size={26}
                  onChange={(v) => setHabits(habits.map((x) => x.id === h.id ? { ...x, done: v } : x))} />
                <HabitIcon icon={h.icon} tint={h.tint} size={32} radius={8} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.textHi, lineHeight: 1.2 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: c.textLow, marginTop: 2 }}>
                    {h.type === 'num' ? `${h.current} / ${h.goal} ${h.unit}` : h.freq}
                  </div>
                </div>
                <StreakBadge count={h.streak} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <MobileTabBar active="today" />
    </div>
  );
}

// ── Mobile habit detail ───────────────────────────────────────────────
function MobileHabitDetail() {
  const habit = {
    name: 'Meditar 10 min',
    icon: 'drops',
    tint: '#5e8bff',
    streak: 47, longest: 62, completion: 84, total: 312,
  };
  // 6-month compact heatmap (26 weeks × 7 days)
  const sixMo = genHeatData(7, 26 * 7, 0.72);

  return (
    <div className="hm-root" style={{
      background: c.bg, height: '100%', width: '100%',
      position: 'relative', paddingTop: 48,
      overflow: 'hidden',
    }}>
      <div className="hm-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 110 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px 12px',
        }}>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: c.surface, border: `1px solid ${c.borderLo}`, color: c.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrowLeft" size={16} />
          </button>
          <div style={{ fontSize: 13, color: c.textMid }}>Detalle</div>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: c.surface, border: `1px solid ${c.borderLo}`, color: c.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="more" size={18} />
          </button>
        </div>

        {/* Hero */}
        <div style={{
          margin: '8px 20px 18px', padding: 20, borderRadius: 16,
          background: `linear-gradient(135deg, ${habit.tint}1a, ${c.surface} 70%)`,
          border: `1px solid ${habit.tint}33`,
        }}>
          <HabitIcon icon={habit.icon} tint={habit.tint} size={48} radius={12} />
          <h1 style={{ fontSize: 24, fontWeight: 700, color: c.textHi, margin: '12px 0 8px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{habit.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="flame" size={13} fill={c.accent} stroke={0} color={c.accent} />
            <span style={{ fontSize: 13, color: c.accent, fontWeight: 600 }}>{habit.streak} días seguidos</span>
            <span style={{ color: c.textDim }}>·</span>
            <span style={{ fontSize: 13, color: c.textMid }}>Todos los días</span>
          </div>
        </div>

        {/* Big check button */}
        <div style={{ padding: '0 20px 22px' }}>
          <button style={{
            width: '100%', padding: '15px 0', borderRadius: 12,
            background: c.accent, color: '#fff',
            fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: `0 12px 30px -8px ${c.accentGlow}`,
          }}>
            <Icon name="check" size={17} stroke={2.6} />
            Marcar hoy como hecho
          </button>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '0 20px 22px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <MobileStat label="Racha actual" value={habit.streak} suffix="días" tint={c.accent} />
            <MobileStat label="Más larga" value={habit.longest} suffix="días" />
            <MobileStat label="Este mes" value={habit.completion + '%'} />
            <MobileStat label="Total" value={habit.total} suffix="veces" />
          </div>
        </div>

        {/* Heatmap section */}
        <div style={{ padding: '0 20px 22px' }}>
          <div style={{
            padding: '16px 16px 18px', borderRadius: 14,
            background: c.surface, border: `1px solid ${c.borderLo}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.textHi }}>Últimos 6 meses</div>
              <button style={{ fontSize: 11, color: c.textMid, fontWeight: 500 }}>Ver año →</button>
            </div>
            {/* Compact heatmap: 26 weeks × 7 days */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(26, 1fr)`, gap: 2, gridAutoFlow: 'column', gridTemplateRows: `repeat(7, 9px)` }}>
              {sixMo.map((v, i) => {
                const week = Math.floor(i / 7);
                const day = i % 7;
                return (
                  <div key={i} style={{
                    height: 9, borderRadius: 2,
                    background: c.heat[Math.max(0, Math.min(4, v))],
                    gridColumn: week + 1, gridRow: day + 1,
                  }} />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: c.textLow }}>
              <span>Dic</span><span>Feb</span><span>Abr</span><span>May</span>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.textLow, textTransform: 'uppercase', marginBottom: 10 }}>Frecuencia</div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} style={{
                flex: 1, padding: '11px 0', borderRadius: 8,
                textAlign: 'center',
                background: c.accentSoft, color: c.accentHi,
                border: `1px solid ${c.accent}33`,
                fontSize: 13, fontWeight: 600,
              }}>{d}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStat({ label, value, suffix, tint }) {
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 11,
      background: c.surface, border: `1px solid ${c.borderLo}`,
    }}>
      <div style={{ fontSize: 11, color: c.textLow, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: tint || c.textHi, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</div>
        {suffix && <div style={{ fontSize: 11, color: c.textLow }}>{suffix}</div>}
      </div>
    </div>
  );
}

// ── Mobile create habit ───────────────────────────────────────────────
function MobileCreateHabit() {
  const [name, setName] = React.useState('Beber 2L de agua');
  const [type, setType] = React.useState('num');
  const [icon, setIcon] = React.useState('drops');
  const [tint, setTint] = React.useState('#5e8bff');
  const [days, setDays] = React.useState([true, true, true, true, true, true, true]);

  const colors = ['#7C3AED', '#5e8bff', '#10B981', '#F59E0B', '#F43F5E', '#A78BFA'];
  const icons = ['drops', 'flame', 'zap', 'book', 'dumbbell', 'sun', 'moon', 'music'];

  return (
    <div className="hm-root" style={{
      background: c.bg, height: '100%', width: '100%',
      position: 'relative', paddingTop: 48,
      overflow: 'hidden',
    }}>
      <div className="hm-scroll" style={{ height: '100%', overflowY: 'auto', paddingBottom: 120 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px 8px',
        }}>
          <button style={{ fontSize: 14, color: c.textMid }}>Cancelar</button>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.textHi }}>Nuevo hábito</div>
          <button style={{ fontSize: 14, color: c.accent, fontWeight: 600 }}>Crear</button>
        </div>

        {/* Preview pill */}
        <div style={{ padding: '16px 20px 20px' }}>
          <div style={{
            padding: '16px 14px', borderRadius: 14,
            background: `linear-gradient(135deg, ${tint}1a, ${c.surface})`,
            border: `1px solid ${tint}33`,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <HabitIcon icon={icon} tint={tint} size={44} radius={12} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: c.textHi, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name || 'Tu hábito'}
              </div>
              <div style={{ fontSize: 11, color: c.textLow, marginTop: 3 }}>Vista previa</div>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ padding: '0 20px' }}>
          {/* Name */}
          <MobField label="Nombre">
            <div style={{ padding: '13px 14px', borderRadius: 11, background: c.surface, border: `1px solid ${c.border}` }}>
              <input value={name} onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', fontSize: 15, color: c.textHi, fontWeight: 500 }} />
            </div>
          </MobField>

          {/* Type segmented */}
          <MobField label="Tipo">
            <div style={{ display: 'flex', background: c.surface, padding: 3, borderRadius: 10, border: `1px solid ${c.border}` }}>
              {[{ id: 'bin', t: 'Binario' }, { id: 'num', t: 'Numérico' }].map((o) => (
                <button key={o.id} onClick={() => setType(o.id)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8,
                  background: type === o.id ? c.surface3 : 'transparent',
                  color: type === o.id ? c.textHi : c.textMid,
                  fontSize: 13, fontWeight: 600,
                }}>{o.t}</button>
              ))}
            </div>
          </MobField>

          {/* Meta if numeric */}
          {type === 'num' && (
            <MobField label="Meta diaria">
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '13px 14px', borderRadius: 11, background: c.surface, border: `1px solid ${c.border}` }}>
                  <input type="number" defaultValue={2} style={{ width: '100%', fontSize: 15, color: c.textHi, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }} />
                </div>
                <div style={{ width: 110, padding: '13px 14px', borderRadius: 11, background: c.surface, border: `1px solid ${c.border}` }}>
                  <input defaultValue="L" placeholder="unidad" style={{ width: '100%', fontSize: 15, color: c.textHi, fontWeight: 500 }} />
                </div>
              </div>
            </MobField>
          )}

          {/* Frequency */}
          <MobField label="Frecuencia">
            <div style={{ display: 'flex', gap: 5 }}>
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => {
                const on = days[i];
                return (
                  <button key={i} onClick={() => setDays(days.map((x, j) => j === i ? !x : x))} style={{
                    flex: 1, padding: '12px 0', borderRadius: 9,
                    background: on ? c.accentSoft : c.surface,
                    color: on ? c.accentHi : c.textMid,
                    border: on ? `1px solid ${c.accent}66` : `1px solid ${c.border}`,
                    fontSize: 13, fontWeight: 600,
                  }}>{d}</button>
                );
              })}
            </div>
          </MobField>

          {/* Color */}
          <MobField label="Color">
            <div style={{ display: 'flex', gap: 11 }}>
              {colors.map((col) => (
                <button key={col} onClick={() => setTint(col)} style={{
                  width: 30, height: 30, borderRadius: '50%', background: col,
                  border: tint === col ? `2px solid ${c.textHi}` : `2px solid transparent`,
                  boxShadow: tint === col ? `0 0 0 2px ${c.bg}, 0 0 0 4px ${col}` : 'none',
                }} />
              ))}
            </div>
          </MobField>

          {/* Icon */}
          <MobField label="Icono">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
              {icons.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)} style={{
                  aspectRatio: '1', borderRadius: 9,
                  background: icon === ic ? `${tint}1f` : c.surface,
                  border: icon === ic ? `1px solid ${tint}66` : `1px solid ${c.border}`,
                  color: icon === ic ? tint : c.textMid,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </MobField>

          {/* XP hint */}
          <div style={{
            marginTop: 8, padding: '12px 14px', borderRadius: 11,
            background: c.accentSoft, border: `1px solid ${c.accent}33`,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <Icon name="zap" size={14} color={c.accent} fill={c.accent} stroke={0} style={{ marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: c.accentHi }}>+10 XP por crear</div>
              <div style={{ fontSize: 11, color: c.text, marginTop: 3 }}>Suma 5 XP por cada día que lo cumplas.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobField({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: c.textMid, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { MobileDashboard, MobileHabitDetail, MobileCreateHabit, MobileTabBar });
