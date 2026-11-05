import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Parseo inteligente",
    description:
      "Importa cartolas PDF y archivos CSV de Banco Santander. VaultTracker organiza tus movimientos para que no tengas que hacerlo a mano.",
    icon: (
      <>
        <path d="M7 3.75h7.5L19 8.25v12A1.75 1.75 0 0 1 17.25 22h-10A1.75 1.75 0 0 1 5.5 20.25V5.5A1.75 1.75 0 0 1 7.25 3.75Z" />
        <path d="M14 4v5h5M8.5 13h7M8.5 16.5h7" />
      </>
    ),
  },
  {
    number: "02",
    title: "Seguridad de grado bancario",
    description:
      "Tus archivos se procesan en el navegador y tus transacciones se guardan de forma segura en Supabase, asociadas a tu cuenta.",
    icon: (
      <>
        <path d="M12 3.5 19 6v5.75c0 4.25-2.85 7.3-7 8.75-4.15-1.45-7-4.5-7-8.75V6l7-2.5Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    number: "03",
    title: "Métricas en un vistazo",
    description:
      "Entiende tus finanzas con un resumen claro de ingresos, gastos y balance neto a partir de tus movimientos.",
    icon: (
      <>
        <path d="M4.5 19.5V12M10.5 19.5V5M16.5 19.5v-9M22.5 19.5H2" />
        <path d="m3.5 9 5-4 5 4 7-6" />
      </>
    ),
  },
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 ${
        small ? "h-9 w-9" : "h-11 w-11"
      }`}
    >
      <svg
        aria-hidden="true"
        className={small ? "h-5 w-5" : "h-6 w-6"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d="M5 10.5h14v9H5zM8 10.5V7a4 4 0 0 1 8 0v3.5m-4 4v1.5" />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-3xl"
      />

      <header className="relative border-b border-slate-800/80">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8"
        >
          <Link
            aria-label="VaultTracker, inicio"
            className="flex items-center gap-3"
            href="/"
          >
            <BrandMark small />
            <span className="text-sm font-semibold tracking-[0.16em] text-white">
              VAULTTRACKER
            </span>
          </Link>
          <Link
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-500/60 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-32 lg:pt-28">
        <div className="max-w-2xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Claridad para tus decisiones financieras
          </div>
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Toma el control de tu{" "}
            <span className="text-emerald-400">patrimonio financiero.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
            Reúne tus movimientos en un solo lugar. Importa tu cartola y
            convierte tus transacciones en una visión clara de tus ingresos y
            gastos.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              href="/login"
            >
              Comenzar ahora
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </Link>
            <a
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-5 py-3.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              href="#caracteristicas"
            >
              Conoce la plataforma
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-slate-500">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path d="M12 3.5 19 6v5.75c0 4.25-2.85 7.3-7 8.75-4.15-1.45-7-4.5-7-8.75V6l7-2.5Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Tus finanzas personales, siempre bajo tu control
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[2rem] bg-emerald-500/[0.07] blur-2xl"
          />
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/30 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <BrandMark small />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Resumen financiero
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Vista de tus movimientos
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                EJEMPLO
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs text-slate-400">Balance neto</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                $ 482.350
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Calculado desde ingresos y gastos importados
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Ingresos
                </div>
                <p className="mt-3 text-lg font-semibold text-white">$ 850.000</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Gastos
                </div>
                <p className="mt-3 text-lg font-semibold text-white">$ 367.650</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-300">
                  Actividad reciente
                </p>
                <span className="text-[10px] text-slate-500">ÚLTIMOS MOVIMIENTOS</span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-400/10 text-rose-300">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 5v14m-6-6 6 6 6-6" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">
                        Compra con tarjeta
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Movimiento importado
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-300">
                    −$ 24.990
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                      <svg
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 19V5m6 6-6-6-6 6" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-200">
                        Depósito recibido
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Movimiento importado
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-300">
                    +$ 120.000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-title"
        className="relative border-y border-slate-800/80 bg-slate-900/30"
        id="caracteristicas"
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto mb-11 max-w-2xl text-center sm:mb-14">
            <p className="text-sm font-medium text-emerald-400">
              Finanzas más simples
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              id="features-title"
            >
              Todo lo importante, en un solo lugar.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              Menos tiempo ordenando datos. Más claridad para entender cómo se
              mueve tu dinero.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 transition hover:border-emerald-500/30 sm:p-7"
                key={feature.number}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.6"
                      viewBox="0 0 24 24"
                    >
                      {feature.icon}
                    </svg>
                  </span>
                  <span className="text-xs font-medium tracking-widest text-slate-600">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            aria-label="VaultTracker, inicio"
            className="flex items-center gap-3"
            href="/"
          >
            <BrandMark small />
            <span className="text-xs font-semibold tracking-[0.16em] text-slate-300">
              VAULTTRACKER
            </span>
          </Link>
          <p className="text-xs text-slate-500">
            © 2026 VaultTracker. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <a
              className="transition hover:text-emerald-300"
              href="#caracteristicas"
            >
              Características
            </a>
            <Link className="transition hover:text-emerald-300" href="/login">
              Acceder
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
