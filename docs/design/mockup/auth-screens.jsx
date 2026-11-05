// Habit Maxxing — auth: login + registro (desktop + mobile)

const { Icon, StreakBadge, Heatmap, HabitIcon, genHeatData, ProgressBar, Logo, hmColors: c } = window;

// ── Shared form atoms ─────────────────────────────────────────────────
function AuthField({ label, icon, type = 'text', placeholder, value, onChange, error, hint, right, big }) {
  const [focus, setFocus] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const isPw = type === 'password';
  const border = error ? c.danger : focus ? c.accent : c.border;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: c.text }}>{label}</span>
        {right}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: big ? '0 14px' : '0 12px', height: big ? 50 : 44, borderRadius: 10,
        background: c.surface, border: `1px solid ${border}`,
        boxShadow: focus && !error ? `0 0 0 3px ${c.accentSoft}` : error ? `0 0 0 3px ${c.dangerSoft}` : 'none',
        transition: 'all .15s ease',
      }}>
        <Icon name={icon} size={16} color={error ? c.danger : focus ? c.accent : c.textLow} />
        <input type={isPw && !show ? 'password' : isPw ? 'text' : type} value={value} placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, fontSize: big ? 16 : 15, color: c.textHi, fontWeight: 500 }} />
        {isPw && (
          <button type="button" onClick={(e) => { e.preventDefault(); setShow(!show); }}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            style={{ width: 32, height: 32, marginRight: -6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textLow, borderRadius: 6 }}>
            <Icon name={show ? 'eyeOff' : 'eye'} size={16} />
          </button>
        )}
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: c.danger }}>
          <Icon name="alert" size={12} /> {error}
        </div>
      )}
      {hint && !error && <div style={{ fontSize: 12, color: c.textLow }}>{hint}</div>}
    </label>
  );
}

function PrimaryBtn({ children, big }) {
  return (
    <button style={{
      height: big ? 52 : 46, borderRadius: 10, width: '100%',
      background: c.accent, color: '#fff', fontSize: big ? 16 : 15, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: `0 8px 24px -8px ${c.accentGlow}`,
    }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hm-accent-hi)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--hm-accent)'}>
      {children} <Icon name="arrowRight" size={15} stroke={2.2} />
    </button>
  );
}

function SocialBtns({ big }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {['Google', 'Apple'].map((p) => (
        <button key={p} style={{
          height: big ? 50 : 44, borderRadius: 10, background: c.surface,
          border: `1px solid ${c.border}`, color: c.text, fontSize: 14, fontWeight: 500,
        }}>{p}</button>
      ))}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: c.textLow, fontSize: 12 }}>
      <div style={{ flex: 1, height: 1, background: c.borderLo }} />
      o con tu email
      <div style={{ flex: 1, height: 1, background: c.borderLo }} />
    </div>
  );
}

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function StrengthMeter({ pw }) {
  const s = pwStrength(pw);
  const labels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
  const color = s <= 1 ? c.danger : s === 2 ? c.warn : c.success;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 4, borderRadius: 2, background: i < s ? color : c.surface2, transition: 'background .2s' }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: pw ? color : c.textLow, fontWeight: 500, width: 70, textAlign: 'right' }}>{pw ? labels[s] : '—'}</span>
    </div>
  );
}

function Checkbox({ checked, onChange, children }) {
  return (
    <label onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: c.textMid, lineHeight: 1.45 }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
        background: checked ? c.accent : 'transparent',
        border: `1.5px solid ${checked ? c.accent : c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{checked && <Icon name="check" size={11} color="#fff" stroke={2.6} />}</span>
      <span>{children}</span>
    </label>
  );
}

const authLink = { color: c.accent, fontWeight: 600 };

// ── Desktop brand panel (right side) ─────────────────────────────────
function BrandPanel({ mode }) {
  const data = React.useMemo(() => genHeatData(mode === 'login' ? 7 : 3, 182, 0.7), [mode]);
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', height: '100%',
      background: c.surface, borderLeft: `1px solid ${c.borderLo}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 64px',
    }}>
      <div style={{ position: 'absolute', right: -160, top: -160, width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${c.accentGlow}, transparent 70%)`, opacity: 0.6, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', maxWidth: 440 }}>
        <div className="hm-overline" style={{ color: c.accent, marginBottom: 14 }}>
          {mode === 'login' ? 'Tu racha te espera' : 'Empieza hoy'}
        </div>
        <h2 style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.12, color: c.textHi, letterSpacing: '-0.025em', marginBottom: 14, textWrap: 'pretty' }}>
          {mode === 'login' ? 'Cada día marcado suma. No rompas la cadena.' : 'Pequeños hábitos, todos los días, durante un año.'}
        </h2>
        <p style={{ fontSize: 15, color: c.textMid, margin: '0 0 36px', lineHeight: 1.6, textWrap: 'pretty' }}>
          {mode === 'login' ? 'Vuelve a tu tablero, marca lo de hoy y mira cómo crece tu historial.' : 'Crea tus hábitos, márcalos con un toque y sigue tu progreso con rachas y estadísticas.'}
        </p>
        <div style={{ padding: 20, borderRadius: 14, background: c.bg, border: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <HabitIcon icon="drops" tint="#5e8bff" size={34} radius={9} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.textHi, lineHeight: 1.2 }}>Meditar 10 min</div>
              <div style={{ fontSize: 12, color: c.textLow }}>Últimos 6 meses</div>
            </div>
            <StreakBadge count={47} />
          </div>
          <Heatmap data={data} cols={26} cell={12} gap={3} />
        </div>
      </div>
    </div>
  );
}

// ── Desktop login ─────────────────────────────────────────────────────
function DesktopLogin({ withError }) {
  const [email, setEmail] = React.useState('mateo@correo.com');
  const [pw, setPw] = React.useState(withError ? 'hábito12' : '');
  const [remember, setRemember] = React.useState(true);
  return (
    <div className="hm-root" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', background: c.bg }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 48px' }}>
        <Logo />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <h1 className="hm-h1" style={{ color: c.textHi, marginBottom: 6 }}>Bienvenido de nuevo</h1>
              <div className="hm-caption">Inicia sesión para seguir con tus hábitos.</div>
            </div>
            {withError && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 13px', borderRadius: 10, background: c.dangerSoft, color: c.danger, fontSize: 13, lineHeight: 1.45 }}>
                <Icon name="alert" size={15} style={{ marginTop: 2 }} />
                <span>El email o la contraseña no coinciden. Te quedan 4 intentos.</span>
              </div>
            )}
            <SocialBtns />
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <AuthField label="Email" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" />
              <AuthField label="Contraseña" icon="lock" type="password" value={pw} onChange={setPw} placeholder="••••••••"
                error={withError ? 'Contraseña incorrecta' : null}
                right={<button style={{ fontSize: 13, color: c.accent, fontWeight: 500 }}>¿La olvidaste?</button>} />
              <Checkbox checked={remember} onChange={setRemember}>Mantener sesión iniciada</Checkbox>
            </div>
            <PrimaryBtn>Iniciar sesión</PrimaryBtn>
            <div style={{ fontSize: 14, color: c.textMid, textAlign: 'center' }}>
              ¿No tienes cuenta? <button style={authLink}>Crear cuenta</button>
            </div>
          </div>
        </div>
      </div>
      <BrandPanel mode="login" />
    </div>
  );
}

// ── Desktop signup ────────────────────────────────────────────────────
function DesktopSignup() {
  const [name, setName] = React.useState('Mateo Ruiz');
  const [email, setEmail] = React.useState('mateo@correo');
  const [pw, setPw] = React.useState('Habit2026');
  const [terms, setTerms] = React.useState(false);
  const emailErr = email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? 'Introduce un email válido' : null;
  return (
    <div className="hm-root" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', background: c.bg }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 48px' }}>
        <Logo />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h1 className="hm-h1" style={{ color: c.textHi, marginBottom: 6 }}>Crea tu cuenta</h1>
              <div className="hm-caption">Gratis. Tu primer hábito en menos de un minuto.</div>
            </div>
            <SocialBtns />
            <Divider />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <AuthField label="Nombre" icon="user" value={name} onChange={setName} placeholder="Cómo te llamamos" />
              <AuthField label="Email" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" error={emailErr} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <AuthField label="Contraseña" icon="lock" type="password" value={pw} onChange={setPw} placeholder="Mínimo 8 caracteres" />
                <StrengthMeter pw={pw} />
              </div>
              <Checkbox checked={terms} onChange={setTerms}>
                Acepto los <span style={authLink}>Términos</span> y la <span style={authLink}>Política de privacidad</span>
              </Checkbox>
            </div>
            <PrimaryBtn>Crear cuenta</PrimaryBtn>
            <div style={{ fontSize: 14, color: c.textMid, textAlign: 'center' }}>
              ¿Ya tienes cuenta? <button style={authLink}>Inicia sesión</button>
            </div>
          </div>
        </div>
      </div>
      <BrandPanel mode="signup" />
    </div>
  );
}

// ── Mobile ────────────────────────────────────────────────────────────
function MobileAuthShell({ children }) {
  return (
    <div className="hm-root" style={{ background: c.bg, height: '100%', width: '100%', position: 'relative', paddingTop: 54, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -120, top: -120, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${c.accentGlow}, transparent 70%)`, opacity: 0.5, pointerEvents: 'none' }} />
      <div className="hm-scroll" style={{ position: 'relative', height: '100%', overflowY: 'auto', padding: '20px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function MobileLogin() {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  return (
    <MobileAuthShell>
      <Logo size={30} />
      <div style={{ marginTop: 44, marginBottom: 28 }}>
        <h1 className="hm-h1" style={{ color: c.textHi, marginBottom: 8 }}>Bienvenido de nuevo</h1>
        <div style={{ fontSize: 15, color: c.textMid, lineHeight: 1.5 }}>Tu racha de <span style={{ color: c.warn, fontWeight: 600 }}>47 días</span> te está esperando.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <AuthField big label="Email" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" />
        <AuthField big label="Contraseña" icon="lock" type="password" value={pw} onChange={setPw} placeholder="••••••••"
          right={<button style={{ fontSize: 13, color: c.accent, fontWeight: 500 }}>¿La olvidaste?</button>} />
      </div>
      <PrimaryBtn big>Iniciar sesión</PrimaryBtn>
      <div style={{ margin: '24px 0' }}><Divider /></div>
      <SocialBtns big />
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 14, color: c.textMid, textAlign: 'center', paddingTop: 24 }}>
        ¿No tienes cuenta? <button style={authLink}>Crear cuenta</button>
      </div>
    </MobileAuthShell>
  );
}

function MobileSignup() {
  const [name, setName] = React.useState('Mateo');
  const [email, setEmail] = React.useState('mateo@correo.com');
  const [pw, setPw] = React.useState('habit');
  const [terms, setTerms] = React.useState(true);
  return (
    <MobileAuthShell>
      <button style={{ width: 44, height: 44, marginLeft: -10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textMid }}>
        <Icon name="arrowLeft" size={18} />
      </button>
      <div style={{ marginTop: 12, marginBottom: 24 }}>
        <h1 className="hm-h1" style={{ color: c.textHi, marginBottom: 8 }}>Crea tu cuenta</h1>
        <div style={{ fontSize: 15, color: c.textMid, lineHeight: 1.5 }}>Gratis. Tu primer hábito en menos de un minuto.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <AuthField big label="Nombre" icon="user" value={name} onChange={setName} placeholder="Cómo te llamamos" />
        <AuthField big label="Email" icon="mail" type="email" value={email} onChange={setEmail} placeholder="tu@correo.com" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AuthField big label="Contraseña" icon="lock" type="password" value={pw} onChange={setPw} placeholder="Mínimo 8 caracteres" />
          <StrengthMeter pw={pw} />
        </div>
        <Checkbox checked={terms} onChange={setTerms}>
          Acepto los <span style={authLink}>Términos</span> y la <span style={authLink}>Política de privacidad</span>
        </Checkbox>
      </div>
      <PrimaryBtn big>Crear cuenta</PrimaryBtn>
      <div style={{ margin: '22px 0' }}><Divider /></div>
      <SocialBtns big />
      <div style={{ fontSize: 14, color: c.textMid, textAlign: 'center', paddingTop: 24 }}>
        ¿Ya tienes cuenta? <button style={authLink}>Inicia sesión</button>
      </div>
    </MobileAuthShell>
  );
}

Object.assign(window, { DesktopLogin, DesktopSignup, MobileLogin, MobileSignup, AuthField });
