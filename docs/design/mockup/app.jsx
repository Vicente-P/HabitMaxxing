// Habit Maxxing — main app (v2: violet system, focused on direction B)

const {
  DesignCanvas, DCSection, DCArtboard, DCPostIt,
  DashboardVibrant,
  HabitDetail, CreateHabit,
  MobileDashboard, MobileHabitDetail, MobileCreateHabit,
  IOSDevice, hmColors: c,
  DesktopLogin, DesktopSignup, MobileLogin, MobileSignup,
} = window;

// Browser-window chrome — theme-aware via CSS vars.
function DesktopFrame({ children, title = 'habit-maxxing.app/today', theme = 'dark' }) {
  return (
    <div data-hm-theme={theme} style={{
      width: '100%', height: '100%',
      background: 'var(--hm-bg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: 'var(--hm-surface)',
        borderBottom: '1px solid var(--hm-border-lo)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <div style={{
          flex: 1, height: 22, borderRadius: 6,
          background: 'var(--hm-surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'var(--hm-text-mid)',
          fontFamily: 'Inter, sans-serif',
        }}>{title}</div>
        <div style={{ width: 50 }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

function MobileFrame({ children, theme = 'dark' }) {
  return (
    <div data-hm-theme={theme} style={{
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'transparent', padding: 8,
    }}>
      <IOSDevice width={402} height={874} dark={theme === 'dark'}>
        {children}
      </IOSDevice>
    </div>
  );
}

function App() {
  return (
    <DesignCanvas>

      <DCSection id="auth" title="Acceso · Login y registro"
        subtitle="Formulario a la izquierda, panel de marca con heatmap a la derecha. Estados: focus violeta, error rose, fuerza de contraseña semántica.">
        <DCArtboard id="a-login" label="Login · Dark" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/login" theme="dark"><DesktopLogin /></DesktopFrame>
        </DCArtboard>
        <DCArtboard id="a-login-error" label="Login · Error" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/login" theme="dark"><DesktopLogin withError /></DesktopFrame>
        </DCArtboard>
        <DCArtboard id="a-signup" label="Registro · Dark" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/signup" theme="dark"><DesktopSignup /></DesktopFrame>
        </DCArtboard>
        <DCArtboard id="a-signup-light" label="Registro · Light" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/signup" theme="light"><DesktopSignup /></DesktopFrame>
        </DCArtboard>
        <DCArtboard id="a-m-login" label="Login · Mobile" width={420} height={900}>
          <MobileFrame theme="dark"><MobileLogin /></MobileFrame>
        </DCArtboard>
        <DCArtboard id="a-m-signup" label="Registro · Mobile" width={420} height={900}>
          <MobileFrame theme="dark"><MobileSignup /></MobileFrame>
        </DCArtboard>
        <DCArtboard id="a-m-login-light" label="Login · Mobile Light" width={420} height={900}>
          <MobileFrame theme="light"><MobileLogin /></MobileFrame>
        </DCArtboard>
      </DCSection>

      {/* ── SECTION 1 — Sistema final aplicado ────────────────────── */}
      <DCSection id="system" title="Sistema · Violet purple + colores semánticos"
        subtitle="Dirección B refinada. Mismo prototipo en dark y light mode — el sistema responde a ambos sin reescribir nada.">
        <DCArtboard id="dashboard-dark" label="Dashboard · Dark" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/today" theme="dark">
            <DashboardVibrant />
          </DesktopFrame>
        </DCArtboard>
        <DCArtboard id="dashboard-light" label="Dashboard · Light" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/today" theme="light">
            <DashboardVibrant />
          </DesktopFrame>
        </DCArtboard>
      </DCSection>

      {/* ── SECTION 2 — Flujo completo desktop ────────────────────── */}
      <DCSection id="desktop-flow" title="Flujo completo · Desktop"
        subtitle="Detalle del hábito (heatmap anual estilo GitHub) y formulario de creación con vista previa en vivo.">
        <DCArtboard id="d-detail" label="Detalle de hábito" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/habits/meditar" theme="dark">
            <HabitDetail />
          </DesktopFrame>
        </DCArtboard>
        <DCArtboard id="d-create" label="Crear hábito" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/habits/new" theme="dark">
            <CreateHabit />
          </DesktopFrame>
        </DCArtboard>
        <DCArtboard id="d-detail-light" label="Detalle · Light" width={1280} height={820}>
          <DesktopFrame title="habit-maxxing.app/habits/meditar" theme="light">
            <HabitDetail />
          </DesktopFrame>
        </DCArtboard>
      </DCSection>

      {/* ── SECTION 3 — Mobile ────────────────────────────────────── */}
      <DCSection id="mobile-flow" title="Flujo completo · Mobile"
        subtitle="Optimizado para una sola mano. Tab bar inferior, FAB violeta, hit targets ≥ 44px.">
        <DCArtboard id="m-dashboard" label="Dashboard" width={420} height={900}>
          <MobileFrame theme="dark"><MobileDashboard /></MobileFrame>
        </DCArtboard>
        <DCArtboard id="m-detail" label="Detalle" width={420} height={900}>
          <MobileFrame theme="dark"><MobileHabitDetail /></MobileFrame>
        </DCArtboard>
        <DCArtboard id="m-create" label="Crear hábito" width={420} height={900}>
          <MobileFrame theme="dark"><MobileCreateHabit /></MobileFrame>
        </DCArtboard>
        <DCArtboard id="m-dashboard-light" label="Dashboard · Light" width={420} height={900}>
          <MobileFrame theme="light"><MobileDashboard /></MobileFrame>
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
