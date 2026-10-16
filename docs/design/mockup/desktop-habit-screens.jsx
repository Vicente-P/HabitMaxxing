// Habit Maxxing — desktop: habit detail + create habit

const { Icon, HabitCheck, StreakBadge, Heatmap, YearHeatmap, WeekDots,
  ProgressBar, ProgressRing, Sparkline, HabitIcon, genHeatData, hmColors: c,
  Sidebar, StatCard } = window;

// ── DETAIL SCREEN ─────────────────────────────────────────────────────
function HabitDetail() {
  const habit = {
    name: 'Meditar 10 min',
    icon: 'drops',
    tint: '#5e8bff',
    streak: 47,
    longest: 62,
    completion: 84,
    total: 312,
    freq: [true, true, true, true, true, true, true], // L-D
  };

  const yearData = genHeatData(7, 371, 0.72);
  const weeklyVolume = [4, 5, 3, 6, 5, 4, 7, 5, 6, 4, 5, 6, 7, 5];

  return (
    <div className="hm-root" style={{ display: 'flex', height: '100%', background: c.bg }}>
      <Sidebar active="habits" />
      <main style={{ flex: 1, overflow: 'auto' }} className="hm-scroll">
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 48px', borderBottom: `1px solid ${c.borderLo}`,
        }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.textMid, fontSize: 13, fontWeight: 500 }}>
            <Icon name="arrowLeft" size={14} />
            Volver
          </button>
          <div style={{ color: c.textDim, fontSize: 13 }}>/</div>
          <div style={{ fontSize: 13, color: c.textMid }}>Hábitos</div>
          <div style={{ color: c.textDim, fontSize: 13 }}>/</div>
          <div style={{ fontSize: 13, color: c.textHi, fontWeight: 500 }}>{habit.name}</div>
          <div style={{ flex: 1 }} />
          <button style={{ padding: '7px 12px', borderRadius: 7, color: c.textMid, fontSize: 13, fontWeight: 500, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="edit" size={13} /> Editar
          </button>
          <button style={{ padding: '7px 12px', borderRadius: 7, color: c.danger, fontSize: 13, fontWeight: 500, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="trash" size={13} /> Eliminar
          </button>
        </div>

        <div style={{ padding: '32px 48px 48px', maxWidth: 1080 }}>
          {/* Hero */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, marginBottom: 36 }}>
            <HabitIcon icon={habit.icon} tint={habit.tint} size={64} radius={16} />
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 34, fontWeight: 700, color: c.textHi, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1, marginBottom: 10 }}>
                {habit.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.accent, fontSize: 14, fontWeight: 600 }}>
                  <Icon name="flame" size={14} fill={c.accent} stroke={0} />
                  {habit.streak} días seguidos
                </div>
                <div style={{ color: c.textDim }}>·</div>
                <div style={{ fontSize: 14, color: c.textMid }}>Binario · Todos los días</div>
                <div style={{ color: c.textDim }}>·</div>
                <div style={{ fontSize: 14, color: c.textMid }}>Creado el 4 de abril</div>
              </div>
            </div>
            <button style={{
              padding: '12px 22px', borderRadius: 10,
              background: c.accent, color: '#fff',
              fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: `0 8px 24px -6px ${c.accentGlow}`,
            }}>
              <Icon name="check" size={16} stroke={2.4} />
              Marcar hoy
            </button>
          </div>

          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            <BigStat label="Racha actual" value={habit.streak} suffix="días" tint={c.accent} icon="flame" />
            <BigStat label="Racha más larga" value={habit.longest} suffix="días" icon="trophy" />
            <BigStat label="Cumplimiento mensual" value={habit.completion + '%'} icon="target" />
            <BigStat label="Total completado" value={habit.total} suffix="veces" icon="trending" />
          </div>

          {/* Heatmap section */}
          <div style={{
            padding: '22px 24px', borderRadius: 14,
            background: c.surface, border: `1px solid ${c.borderLo}`,
            marginBottom: 22,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.textHi }}>Actividad anual</div>
                <div style={{ fontSize: 12, color: c.textLow, marginTop: 2 }}>312 días marcados en los últimos 12 meses</div>
              </div>
              <div style={{ display: 'flex', gap: 4, background: c.surface2, padding: 3, borderRadius: 8 }}>
                {['Año', 'Mes', 'Semana'].map((t, i) => (
                  <button key={t} style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    color: i === 0 ? c.textHi : c.textMid,
                    background: i === 0 ? c.surface3 : 'transparent',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <YearHeatmap data={yearData} cell={11} gap={3} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingLeft: 24 }}>
              <div style={{ fontSize: 11, color: c.textLow }}>Menos</div>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {[0, 1, 2, 3, 4].map((v) => (
                  <div key={v} style={{ width: 11, height: 11, borderRadius: 2, background: c.heat[v] }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: c.textLow }}>Más</div>
            </div>
          </div>

          {/* Bottom row: weekly + frequency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
            <div style={{
              padding: '22px 24px', borderRadius: 14,
              background: c.surface, border: `1px solid ${c.borderLo}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: c.textHi }}>Tendencia · últimas 14 semanas</div>
                <div style={{ fontSize: 12, color: c.success, fontWeight: 600 }}>↑ Mejorando</div>
              </div>
              <Sparkline data={weeklyVolume} width={560} height={84} color={c.accent} />
            </div>
            <div style={{
              padding: '22px 24px', borderRadius: 14,
              background: c.surface, border: `1px solid ${c.borderLo}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.textHi, marginBottom: 16 }}>Frecuencia</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                  <div key={i} style={{
                    flex: 1, padding: '10px 0', borderRadius: 7,
                    textAlign: 'center',
                    background: habit.freq[i] ? c.accentSoft : c.surface2,
                    color: habit.freq[i] ? c.accentHi : c.textLow,
                    fontSize: 13, fontWeight: 600,
                    border: habit.freq[i] ? `1px solid ${c.accent}33` : `1px solid ${c.border}`,
                  }}>{d}</div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: c.textLow }}>
                Todos los días de la semana
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BigStat({ label, value, suffix, tint, icon }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 12,
      background: c.surface, border: `1px solid ${c.borderLo}`,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: c.textMid, fontWeight: 500 }}>{label}</div>
        <Icon name={icon} size={14} color={c.textLow} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: tint || c.textHi, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</div>
        {suffix && <div style={{ fontSize: 13, color: c.textLow }}>{suffix}</div>}
      </div>
    </div>
  );
}

// ── CREATE HABIT ──────────────────────────────────────────────────────
function CreateHabit() {
  const [name, setName] = React.useState('Beber 2L de agua');
  const [type, setType] = React.useState('num');
  const [goal, setGoal] = React.useState(2);
  const [unit, setUnit] = React.useState('L');
  const [icon, setIcon] = React.useState('drops');
  const [tint, setTint] = React.useState('#5e8bff');
  const [days, setDays] = React.useState([true, true, true, true, true, true, true]);

  const colors = ['#7C3AED', '#5e8bff', '#10B981', '#F59E0B', '#F43F5E', '#A78BFA', '#22d3ee'];
  const icons = ['drops', 'flame', 'zap', 'book', 'dumbbell', 'sun', 'moon', 'music', 'target'];
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="hm-root" style={{ display: 'flex', height: '100%', background: c.bg }}>
      <Sidebar active="habits" />
      <main style={{ flex: 1, overflow: 'auto' }} className="hm-scroll">
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '20px 48px', borderBottom: `1px solid ${c.borderLo}`,
        }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.textMid, fontSize: 13, fontWeight: 500 }}>
            <Icon name="arrowLeft" size={14} />
            Volver
          </button>
          <div style={{ color: c.textDim, fontSize: 13 }}>/</div>
          <div style={{ fontSize: 13, color: c.textHi, fontWeight: 500 }}>Nuevo hábito</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36, padding: '32px 48px', maxWidth: 1080 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: c.textHi, letterSpacing: '-0.025em', margin: 0, marginBottom: 6, lineHeight: 1.1 }}>
              Crear nuevo hábito
            </h1>
            <p style={{ fontSize: 14, color: c.textMid, margin: '0 0 32px', maxWidth: 520 }}>
              Define qué quieres trackear y con qué frecuencia. Podrás editarlo después.
            </p>

            {/* Field: name */}
            <Field label="Nombre del hábito">
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '12px 14px', borderRadius: 10,
                background: c.surface, border: `1px solid ${c.border}`,
              }}>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  style={{ flex: 1, fontSize: 15, color: c.textHi, fontWeight: 500 }} />
              </div>
            </Field>

            {/* Field: type */}
            <Field label="Tipo de hábito">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <TypeOption active={type === 'bin'} onClick={() => setType('bin')}
                  title="Binario" desc="Hecho / no hecho" icon="check" />
                <TypeOption active={type === 'num'} onClick={() => setType('num')}
                  title="Numérico" desc="Cantidad medible" icon="trending" />
              </div>
            </Field>

            {/* Field: goal (only num) */}
            {type === 'num' && (
              <Field label="Meta diaria">
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 10,
                    background: c.surface, border: `1px solid ${c.border}`,
                  }}>
                    <input type="number" value={goal} onChange={(e) => setGoal(+e.target.value)}
                      style={{ flex: 1, fontSize: 15, color: c.textHi, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }} />
                  </div>
                  <div style={{
                    width: 120, display: 'flex', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 10,
                    background: c.surface, border: `1px solid ${c.border}`,
                  }}>
                    <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unidad"
                      style={{ flex: 1, fontSize: 15, color: c.textHi, fontWeight: 500 }} />
                  </div>
                </div>
              </Field>
            )}

            {/* Field: frequency */}
            <Field label="Frecuencia" hint="Selecciona los días en que aplica">
              <div style={{ display: 'flex', gap: 7 }}>
                {dayLabels.map((d, i) => {
                  const on = days[i];
                  return (
                    <button key={i} onClick={() => setDays(days.map((x, j) => j === i ? !x : x))}
                      style={{
                        flex: 1, padding: '14px 0', borderRadius: 9,
                        background: on ? c.accentSoft : c.surface,
                        color: on ? c.accentHi : c.textMid,
                        border: on ? `1px solid ${c.accent}66` : `1px solid ${c.border}`,
                        fontSize: 14, fontWeight: 600,
                      }}>{d}</button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {[
                  { label: 'Todos los días', val: [true, true, true, true, true, true, true] },
                  { label: 'Entre semana', val: [true, true, true, true, true, false, false] },
                  { label: 'Fin de semana', val: [false, false, false, false, false, true, true] },
                ].map((p) => (
                  <button key={p.label} onClick={() => setDays(p.val)} style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11.5, color: c.textMid,
                    border: `1px solid ${c.border}`, fontWeight: 500,
                  }}>{p.label}</button>
                ))}
              </div>
            </Field>

            {/* Field: icon + color */}
            <Field label="Apariencia">
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: c.textLow, marginBottom: 8, fontWeight: 500 }}>COLOR</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {colors.map((col) => (
                    <button key={col} onClick={() => setTint(col)} style={{
                      width: 28, height: 28, borderRadius: '50%', background: col,
                      border: tint === col ? `2px solid ${c.textHi}` : `2px solid transparent`,
                      boxShadow: tint === col ? `0 0 0 2px ${c.bg}, 0 0 0 4px ${col}` : 'none',
                      transition: 'all .12s',
                    }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: c.textLow, marginBottom: 8, fontWeight: 500 }}>ICONO</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {icons.map((ic) => (
                    <button key={ic} onClick={() => setIcon(ic)} style={{
                      width: 38, height: 38, borderRadius: 9,
                      background: icon === ic ? `${tint}1f` : c.surface,
                      border: icon === ic ? `1px solid ${tint}66` : `1px solid ${c.border}`,
                      color: icon === ic ? tint : c.textMid,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={ic} size={17} />
                    </button>
                  ))}
                </div>
              </div>
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingTop: 22, borderTop: `1px solid ${c.borderLo}` }}>
              <button style={{
                padding: '11px 20px', borderRadius: 9,
                background: c.accent, color: '#fff',
                fontSize: 14, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: `0 8px 24px -6px ${c.accentGlow}`,
              }}>
                <Icon name="check" size={14} stroke={2.4} />
                Crear hábito
              </button>
              <button style={{
                padding: '11px 20px', borderRadius: 9,
                color: c.textMid, fontSize: 14, fontWeight: 500,
                border: `1px solid ${c.border}`,
              }}>
                Cancelar
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ position: 'sticky', top: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: c.textLow, textTransform: 'uppercase', marginBottom: 12 }}>Vista previa</div>
            <div style={{
              padding: 18, borderRadius: 14,
              background: c.surface, border: `1px solid ${c.borderLo}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <HabitCheck checked={false} color={tint} />
                <HabitIcon icon={icon} tint={tint} size={40} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.textHi, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name || 'Tu hábito'}
                  </div>
                  <div style={{ fontSize: 11, color: c.textLow, marginTop: 3 }}>
                    {type === 'num' ? `${goal} ${unit}` : 'Binario'} ·{' '}
                    {days.every(Boolean) ? 'Todos los días' :
                      days.filter(Boolean).length === 0 ? 'Sin días' :
                        dayLabels.filter((_, i) => days[i]).join(' ')}
                  </div>
                </div>
              </div>
              <Heatmap data={genHeatData(99, 35, 0.5)} cell={9} gap={2} cols={7} />
              <div style={{ fontSize: 11, color: c.textLow, marginTop: 10, textAlign: 'center' }}>
                Así se verá en tu dashboard
              </div>
            </div>

            <div style={{
              marginTop: 14, padding: '12px 14px', borderRadius: 10,
              background: c.accentSoft, border: `1px solid ${c.accent}33`,
              display: 'flex', gap: 10,
            }}>
              <Icon name="zap" size={14} color={c.accent} fill={c.accent} stroke={0} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: c.accentHi }}>+10 XP por crear</div>
                <div style={{ fontSize: 11, color: c.text, marginTop: 3 }}>Suma {days.filter(Boolean).length * 5} XP por cada semana completa.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: c.textLow }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TypeOption({ active, onClick, title, desc, icon }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 16px', borderRadius: 10,
      background: active ? c.accentSoft : c.surface,
      border: active ? `1px solid ${c.accent}66` : `1px solid ${c.border}`,
      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: active ? c.accentSoft : c.surface2,
        border: `1px solid ${active ? c.accent + '66' : c.border}`,
        color: active ? c.accent : c.textMid,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={15} stroke={active ? 2.2 : 1.6} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: active ? c.textHi : c.text }}>{title}</div>
        <div style={{ fontSize: 11, color: c.textLow, marginTop: 2 }}>{desc}</div>
      </div>
    </button>
  );
}

Object.assign(window, { HabitDetail, CreateHabit, Field, TypeOption, BigStat });
