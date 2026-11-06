"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CircleCheck,
  CircleX,
  Wallet,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DemoCategory =
  | "Viajes"
  | "Ocio"
  | "Supermercado"
  | "Restaurantes"
  | "Transporte"
  | "Vivienda/Gastos Comunes"
  | "Pagos";

interface DemoTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: DemoCategory;
}

type RecurringChargeStatus = "upcoming" | "paid" | "ignored";

interface RecurringCharge {
  id: number;
  name: string;
  amount: number;
  daysUntilDue: number;
  category: DemoCategory;
  status: RecurringChargeStatus;
}

const demoCategories: DemoCategory[] = [
  "Viajes",
  "Ocio",
  "Supermercado",
  "Restaurantes",
  "Transporte",
  "Vivienda/Gastos Comunes",
  "Pagos",
];

const categoryEmojis: Record<DemoCategory, string> = {
  Viajes: "✈️",
  Ocio: "🎬",
  Supermercado: "🛒",
  Restaurantes: "🍔",
  Transporte: "🚗",
  "Vivienda/Gastos Comunes": "🏠",
  Pagos: "💸",
};

const initialRecurringCharges: RecurringCharge[] = [
  {
    id: 101,
    name: "Spotify",
    amount: 5490,
    daysUntilDue: 3,
    category: "Ocio",
    status: "upcoming",
  },
  {
    id: 102,
    name: "Arriendo",
    amount: 520000,
    daysUntilDue: 12,
    category: "Vivienda/Gastos Comunes",
    status: "upcoming",
  },
  {
    id: 103,
    name: "Netflix",
    amount: 8990,
    daysUntilDue: 6,
    category: "Ocio",
    status: "upcoming",
  },
];

const demoColors: Record<DemoCategory, string> = {
  Viajes: "#0d9488",
  Ocio: "#8b5cf6",
  Supermercado: "#34d399",
  Restaurantes: "#2dd4bf",
  Transporte: "#06b6d4",
  "Vivienda/Gastos Comunes": "#10b981",
  Pagos: "#059669",
};

const initialDemoTransactions: DemoTransaction[] = [
  {
    id: 1,
    date: "06 nov",
    description: "Air Canada · pasaje",
    amount: 248900,
    type: "EXPENSE",
    category: "Viajes",
  },
  {
    id: 2,
    date: "05 nov",
    description: "Uber · viaje a casa",
    amount: 8900,
    type: "EXPENSE",
    category: "Transporte",
  },
  {
    id: 3,
    date: "04 nov",
    description: "Jumbo · compra semanal",
    amount: 58450,
    type: "EXPENSE",
    category: "Supermercado",
  },
  {
    id: 4,
    date: "03 nov",
    description: "Copec · combustible",
    amount: 42000,
    type: "EXPENSE",
    category: "Transporte",
  },
  {
    id: 5,
    date: "02 nov",
    description: "Uber Eats · almuerzo",
    amount: 18400,
    type: "EXPENSE",
    category: "Restaurantes",
  },
  {
    id: 6,
    date: "01 nov",
    description: "Abono de sueldo",
    amount: 1250000,
    type: "INCOME",
    category: "Pagos",
  },
  {
    id: 7,
    date: "31 oct",
    description: "Cinemark · entradas",
    amount: 14500,
    type: "EXPENSE",
    category: "Ocio",
  },
  {
    id: 8,
    date: "30 oct",
    description: "Enel · cuenta de luz",
    amount: 32800,
    type: "EXPENSE",
    category: "Vivienda/Gastos Comunes",
  },
  {
    id: 9,
    date: "29 oct",
    description: "Restaurante Sandoz",
    amount: 26700,
    type: "EXPENSE",
    category: "Restaurantes",
  },
];

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
      className={`flex items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-900/10 ${
        small ? "h-9 w-9" : "h-11 w-11"
      }`}
    >
      <svg
        aria-hidden="true"
        className={small ? "h-8 w-8" : "h-10 w-10"}
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        viewBox="0 0 64 64"
      >
        <path
          d="M32 12C20 12 16 18 16 28V38C16 48 32 54 32 54C32 54 48 48 48 38V28C48 18 44 12 32 12Z"
        />
        <path d="M25 36L30 31L34 35L39 28" />
        <path d="M35 28H39V32" />
      </svg>
    </span>
  );
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [transactions, setTransactions] = useState(initialDemoTransactions);
  const [recurringCharges, setRecurringCharges] = useState(
    initialRecurringCharges,
  );
  const [hoveredCategory, setHoveredCategory] = useState<DemoCategory | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<
    "Todas" | DemoCategory
  >("Todas");
  const [budgetLimits, setBudgetLimits] = useState({
    Ocio: 80000,
    Restaurantes: 120000,
    Supermercado: 220000,
  });

  const filteredTransactions = useMemo(
    () =>
      selectedCategory === "Todas"
        ? transactions
        : transactions.filter(
            (transaction) => transaction.category === selectedCategory,
          ),
    [selectedCategory, transactions],
  );
  const expenseDistribution = useMemo(
    () =>
      demoCategories
        .filter((category) => category !== "Pagos")
        .map((category) => ({
          category,
          amount: filteredTransactions
            .filter(
              (transaction) =>
                transaction.type === "EXPENSE" &&
                transaction.category === category,
            )
            .reduce((total, transaction) => total + transaction.amount, 0),
        }))
        .filter((entry) => entry.amount > 0),
    [filteredTransactions],
  );
  const totalExpenses = useMemo(
    () =>
      filteredTransactions
        .filter((transaction) => transaction.type === "EXPENSE")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [filteredTransactions],
  );
  const totalIncome = useMemo(
    () =>
      filteredTransactions
        .filter((transaction) => transaction.type === "INCOME")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [filteredTransactions],
  );
  const openingBalance = 650000;
  const netBalance = openingBalance + totalIncome - totalExpenses;
  const upcomingCharges = recurringCharges.filter(
    (charge) => charge.status === "upcoming",
  );
  const budgetSpending = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.type === "EXPENSE" &&
            (transaction.category === "Ocio" ||
              transaction.category === "Restaurantes" ||
              transaction.category === "Supermercado"),
        )
        .reduce<Record<string, number>>((totals, transaction) => {
          totals[transaction.category] =
            (totals[transaction.category] ?? 0) + transaction.amount;
          return totals;
        }, {}),
    [filteredTransactions],
  );

  function updateTransactionCategory(id: number, category: DemoCategory) {
    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === id ? { ...transaction, category } : transaction,
      ),
    );
  }

  function removeTransaction(id: number) {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== id),
    );
  }

  function updateRecurringCharge(
    charge: RecurringCharge,
    status: Exclude<RecurringChargeStatus, "upcoming">,
  ) {
    setRecurringCharges((currentCharges) =>
      currentCharges.map((currentCharge) =>
        currentCharge.id === charge.id
          ? { ...currentCharge, status }
          : currentCharge,
      ),
    );

    if (status === "paid") {
      setTransactions((currentTransactions) => [
        {
          id:
            Math.max(0, ...currentTransactions.map((transaction) => transaction.id)) +
            1,
          date: "Hoy",
          description: `${charge.name} · cobro recurrente`,
          amount: charge.amount,
          type: "EXPENSE",
          category: charge.category,
        },
        ...currentTransactions,
      ]);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-3xl"
      />

      <header className="relative border-b border-slate-200">
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
            <span className="text-sm font-semibold tracking-[0.16em] text-slate-900">
              VAULTTRACKER
            </span>
          </Link>
          <Link
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500/60 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-32 lg:pt-28"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-medium text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Claridad para tus decisiones financieras
          </div>
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Toma el control de tu{" "}
            <span className="text-emerald-600">patrimonio financiero.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
            Reúne tus movimientos en un solo lugar. Importa tu cartola y
            convierte tus transacciones en una visión clara de tus ingresos y
            gastos.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
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
            </motion.div>
            <motion.a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50/70 px-5 py-3.5 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300/60 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              href="#demo-interactivo"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              Explorar resumen interactivo
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
                <path d="M12 5v14m-7-7 7 7 7-7" />
              </svg>
            </motion.a>
            <motion.a
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              href="#caracteristicas"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            >
              Conoce la plataforma
            </motion.a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-xs text-slate-500">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-emerald-600"
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
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative mx-auto w-full max-w-xl lg:ml-auto"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          transition={{ delay: 0.28, duration: 0.6, ease: "easeOut" }}
        >
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[2rem] bg-emerald-50/60 blur-2xl"
          />
          <div className="relative rounded-2xl border border-slate-100/80 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <BrandMark small />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Resumen financiero
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Vista de tus movimientos
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
                EJEMPLO
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs text-slate-500">Balance neto</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                $ 482.350
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Calculado desde ingresos y gastos importados
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Ingresos
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">$ 850.000</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Gastos
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">$ 367.650</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-700">
                  Actividad reciente
                </p>
                <span className="text-[10px] text-slate-500">ÚLTIMOS MOVIMIENTOS</span>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
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
                      <p className="truncate text-xs font-medium text-slate-700">
                        Compra con tarjeta
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Movimiento importado
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-700">
                    −$ 24.990
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
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
                      <p className="truncate text-xs font-medium text-slate-700">
                        Depósito recibido
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Movimiento importado
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-700">
                    +$ 120.000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        aria-labelledby="interactive-demo-title"
        className="relative border-y border-slate-200 bg-emerald-50/40"
        id="demo-interactivo"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <motion.div
            className="mx-auto mb-10 max-w-3xl text-center"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-emerald-600">
              Explora con datos de ejemplo
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
              id="interactive-demo-title"
            >
              Prueba el potencial de VaultTracker
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Filtra movimientos, cambia categorías y ajusta tus límites. Todo
              lo que ves es interactivo y ocurre en esta página.
            </p>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xl shadow-slate-200/50 ring-1 ring-emerald-100/60"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
              <div aria-hidden="true" className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium tracking-wide text-slate-500 sm:text-xs">
                <Wallet aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
                VaultTracker · Vista previa interactiva
              </div>
              <span aria-hidden="true" className="w-10" />
            </div>
            <div className="p-4 sm:p-7 lg:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Resumen de noviembre
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Datos ficticios · prueba los controles para explorar
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                Categoría
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value === "Todas"
                        ? "Todas"
                        : (event.target.value as DemoCategory),
                    )
                  }
                  value={selectedCategory}
                >
                  <option value="Todas">Todas</option>
                  {demoCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <motion.article
                className="rounded-xl border border-slate-100/80 bg-white p-4 shadow-sm shadow-slate-200/50"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-500">Saldo Inicial</p>
                  <Wallet aria-hidden="true" className="h-4 w-4 text-slate-500" />
                </div>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xl font-semibold text-slate-900"
                  initial={shouldReduceMotion ? false : { opacity: 0.6, y: 4 }}
                  key={openingBalance}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(openingBalance)}
                </motion.p>
              </motion.article>
              <motion.article
                className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm shadow-slate-200/50"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-emerald-800">Ingresos (+)</p>
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                </div>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xl font-semibold text-slate-900"
                  initial={shouldReduceMotion ? false : { opacity: 0.6, y: 4 }}
                  key={totalIncome}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(totalIncome)}
                </motion.p>
              </motion.article>
              <motion.article
                className="rounded-xl border border-rose-100 bg-white p-4 shadow-sm shadow-slate-200/50"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-rose-700">Gastos (-)</p>
                  <ArrowDownRight aria-hidden="true" className="h-4 w-4 text-rose-400" />
                </div>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xl font-semibold text-slate-900"
                  initial={shouldReduceMotion ? false : { opacity: 0.6, y: 4 }}
                  key={totalExpenses}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(totalExpenses)}
                </motion.p>
              </motion.article>
              <motion.article
                className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm shadow-slate-200/50"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-700">Balance Resultante</p>
                  <Wallet aria-hidden="true" className="h-4 w-4 text-emerald-600" />
                </div>
                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 text-xl font-semibold ${
                    netBalance < 0 ? "text-rose-700" : "text-slate-900"
                  }`}
                  initial={shouldReduceMotion ? false : { opacity: 0.6, y: 4 }}
                  key={netBalance}
                  transition={{ duration: 0.2 }}
                >
                  {formatCurrency(netBalance)}
                </motion.p>
              </motion.article>
            </div>

            <motion.article
              className="mb-5 rounded-xl border border-emerald-500/15 bg-white p-4 sm:p-5"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35 }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <CalendarClock aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Próximos cobros y suscripciones
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Marca un cobro como pagado para incluirlo en tu flujo
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
                  {upcomingCharges.length} pendientes
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {upcomingCharges.map((charge) => (
                  <motion.div
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/40"
                    key={charge.id}
                    layout={!shouldReduceMotion}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.015 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
                        {categoryEmojis[charge.category]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {charge.name}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatCurrency(charge.amount)} · vence en{" "}
                          {charge.daysUntilDue} días
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <motion.button
                        aria-label={`Marcar ${charge.name} como pagado`}
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-emerald-100 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-400"
                        onClick={() => updateRecurringCharge(charge, "paid")}
                        title="Marcar pagado"
                        type="button"
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.12 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                      >
                        <CircleCheck aria-hidden="true" className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        aria-label={`Ignorar cobro de ${charge.name}`}
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-400"
                        onClick={() => updateRecurringCharge(charge, "ignored")}
                        title="Ignorar cobro"
                        type="button"
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.12 }}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                      >
                        <CircleX aria-hidden="true" className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
                {upcomingCharges.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-500 md:col-span-2 xl:col-span-3">
                    Ya revisaste todos los cobros de ejemplo.
                  </p>
                )}
              </div>
            </motion.article>

            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <motion.article
                className="rounded-xl border border-slate-100/80 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Distribución de gastos
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Selecciona un segmento para filtrar los movimientos
                  </p>
                </div>
                <div className="mt-2 grid items-center gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(8rem,0.9fr)]">
                  <div className="h-56 min-w-0">
                    <ResponsiveContainer height="100%" width="100%">
                      <PieChart>
                        <Pie
                          data={expenseDistribution}
                          dataKey="amount"
                          innerRadius="57%"
                          isAnimationActive={!shouldReduceMotion}
                          nameKey="category"
                          outerRadius={hoveredCategory ? "88%" : "84%"}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {expenseDistribution.map((entry) => (
                            <Cell
                              fill={demoColors[entry.category]}
                              fillOpacity={
                                hoveredCategory
                                  ? hoveredCategory === entry.category
                                    ? 1
                                    : 0.45
                                  : selectedCategory === "Todas" ||
                                      selectedCategory === entry.category
                                  ? 1
                                  : 0.35
                              }
                              key={entry.category}
                              onClick={() =>
                                setSelectedCategory((currentCategory) =>
                                  currentCategory === entry.category
                                    ? "Todas"
                                    : entry.category,
                                )
                              }
                              onMouseEnter={() =>
                                setHoveredCategory(entry.category)
                              }
                              onMouseLeave={() => setHoveredCategory(null)}
                              stroke={
                                hoveredCategory === entry.category
                                  ? "#334155"
                                  : "none"
                              }
                              strokeWidth={hoveredCategory === entry.category ? 2 : 0}
                              style={{
                                cursor: "pointer",
                                transition: shouldReduceMotion
                                  ? undefined
                                  : "fill-opacity 180ms ease, stroke-width 180ms ease",
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "0.75rem",
                            color: "#334155",
                          }}
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            String(name),
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2.5">
                    {expenseDistribution.map((entry) => {
                      const allExpenses = expenseDistribution.reduce(
                        (total, category) => total + category.amount,
                        0,
                      );
                      return (
                        <li key={entry.category}>
                          <motion.button
                            aria-pressed={selectedCategory === entry.category}
                            className="flex w-full items-center justify-between gap-2 text-left text-xs"
                            onClick={() =>
                              setSelectedCategory((currentCategory) =>
                                currentCategory === entry.category
                                  ? "Todas"
                                  : entry.category,
                              )
                            }
                            type="button"
                            onMouseEnter={() =>
                              setHoveredCategory(entry.category)
                            }
                            onMouseLeave={() => setHoveredCategory(null)}
                            whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                          >
                            <span className="flex min-w-0 items-center gap-2 text-slate-700">
                              <span
                                aria-hidden="true"
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: demoColors[entry.category],
                                }}
                              />
                              <span aria-hidden="true">
                                {categoryEmojis[entry.category]}
                              </span>
                              <span className="truncate">{entry.category}</span>
                            </span>
                            <span className="shrink-0 text-slate-500">
                              {((entry.amount / allExpenses) * 100).toFixed(0)}%
                            </span>
                          </motion.button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.article>

              <motion.article
                className="rounded-xl border border-slate-100/80 bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
              >
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Movimientos recientes
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Cambia la categoría de una fila para actualizar el gráfico
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {filteredTransactions.length} movimientos
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-3 font-medium" scope="col">
                          Fecha
                        </th>
                        <th className="px-3 py-3 font-medium" scope="col">
                          Descripción
                        </th>
                        <th className="px-3 py-3 font-medium" scope="col">
                          Categoría
                        </th>
                        <th
                          className="whitespace-nowrap px-3 py-3 text-right font-medium"
                          scope="col"
                        >
                          Monto
                        </th>
                        <th className="px-3 py-3" scope="col">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTransactions.map((transaction) => (
                        <motion.tr
                          className="text-slate-700"
                          key={transaction.id}
                          whileHover={shouldReduceMotion ? undefined : { scale: 1.005, backgroundColor: "rgba(236, 253, 245, 0.9)" }}
                          whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                            {transaction.date}
                          </td>
                          <td className="min-w-36 px-3 py-3">
                            <span className="block truncate">
                              {transaction.description}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <motion.button
                                aria-label={`Filtrar por ${transaction.category}`}
                                aria-pressed={
                                  selectedCategory === transaction.category
                                }
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] transition ${
                                  selectedCategory === transaction.category
                                    ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                                    : "border-slate-200 bg-slate-100 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                                }`}
                                onClick={() =>
                                  setSelectedCategory((currentCategory) =>
                                    currentCategory === transaction.category
                                      ? "Todas"
                                      : transaction.category,
                                  )
                                }
                                type="button"
                                whileHover={
                                  shouldReduceMotion ? undefined : { scale: 1.06 }
                                }
                                whileTap={
                                  shouldReduceMotion ? undefined : { scale: 0.94 }
                                }
                              >
                                <span aria-hidden="true">
                                  {categoryEmojis[transaction.category]}
                                </span>
                                {transaction.category}
                              </motion.button>
                              <select
                                aria-label={`Editar categoría de ${transaction.description}`}
                                className="max-w-36 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] text-slate-700 outline-none focus:border-emerald-500"
                                onChange={(event) => {
                                  const category =
                                    demoCategories.find(
                                      (option) => option === event.target.value,
                                    ) ?? "Ocio";
                                  updateTransactionCategory(
                                    transaction.id,
                                    category,
                                  );
                                }}
                                value={transaction.category}
                              >
                                {demoCategories.map((category) => (
                                  <option key={category} value={category}>
                                    {categoryEmojis[category]} {category}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-3 text-right font-medium ${
                              transaction.type === "INCOME"
                                ? "text-emerald-800"
                                : "text-slate-700"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "−"}
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right">
                            <motion.button
                              aria-label={`Eliminar ${transaction.description} de la demo`}
                              className="rounded-md p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                              onClick={() => removeTransaction(transaction.id)}
                              title={`Eliminar ${transaction.description}`}
                              type="button"
                              whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
                              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                            >
                              <svg
                                aria-hidden="true"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.7"
                                viewBox="0 0 24 24"
                              >
                                <path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" />
                              </svg>
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-8 text-center text-slate-500"
                            colSpan={5}
                          >
                            No hay movimientos en esta categoría.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.article>
            </div>

            <article className="mt-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Metas de presupuesto
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Ajusta los límites y observa cómo cambia tu progreso
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["Ocio", "Restaurantes", "Supermercado"] as const).map(
                  (category) => {
                    const spent = budgetSpending[category] ?? 0;
                    const limit = budgetLimits[category];
                    const progress = limit > 0 ? (spent / limit) * 100 : 0;
                    const progressColor =
                      progress < 75
                        ? "bg-emerald-400"
                        : progress <= 95
                          ? "bg-amber-400"
                          : "bg-rose-400";
                    const progressTextColor =
                      progress < 75
                        ? "text-emerald-800"
                        : progress <= 95
                          ? "text-amber-700"
                          : "text-rose-700";

                    return (
                      <motion.div
                        className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40"
                        key={category}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-700">
                            {category}
                          </span>
                          <motion.span
                            animate={{ opacity: 1 }}
                            className={`text-xs font-semibold ${progressTextColor}`}
                            initial={shouldReduceMotion ? false : { opacity: 0.55 }}
                            key={`${category}-${progress.toFixed(0)}`}
                            transition={{ duration: 0.2 }}
                          >
                            {progress.toFixed(0)}%
                          </motion.span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Gastado {formatCurrency(spent)}</span>
                          <span>Límite {formatCurrency(limit)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            className={`h-full rounded-full transition-all ${progressColor}`}
                            initial={false}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </div>
                        <label className="mt-3 block">
                          <span className="sr-only">
                            Ajustar límite de {category}
                          </span>
                          <input
                            aria-label={`Límite mensual de ${category}`}
                            className="h-1.5 w-full cursor-pointer accent-emerald-400"
                            max="400000"
                            min="20000"
                            onChange={(event) =>
                              setBudgetLimits((currentLimits) => ({
                                ...currentLimits,
                                [category]: Number(event.target.value),
                              }))
                            }
                            step="5000"
                            type="range"
                            value={limit}
                          />
                        </label>
                      </motion.div>
                    );
                  },
                )}
              </div>
            </article>

            <motion.div
              className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-5 text-center sm:flex-row sm:text-left"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.005 }}
            >
              <p className="text-sm text-slate-500">
                ¿Quieres usarlo con tus cartolas reales?
              </p>
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
                href="/login"
              >
                Crear cuenta / Iniciar sesión
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
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        aria-labelledby="features-title"
        className="relative border-y border-slate-200 bg-slate-50"
        id="caracteristicas"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <motion.div
            className="mx-auto mb-11 max-w-2xl text-center sm:mb-14"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-emerald-600">
              Finanzas más simples
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
              id="features-title"
            >
              Todo lo importante, en un solo lugar.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              Menos tiempo ordenando datos. Más claridad para entender cómo se
              mueve tu dinero.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-emerald-500/30 sm:p-7"
                key={feature.number}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.12, duration: 0.45 }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-600">
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
                  <span className="text-xs font-medium tracking-widest text-slate-500">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.section>

      <footer className="relative">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            aria-label="VaultTracker, inicio"
            className="flex items-center gap-3"
            href="/"
          >
            <BrandMark small />
            <span className="text-xs font-semibold tracking-[0.16em] text-slate-700">
              VAULTTRACKER
            </span>
          </Link>
          <p className="text-xs text-slate-500">
            © 2026 VaultTracker. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <a
              className="transition hover:text-emerald-800"
              href="#caracteristicas"
            >
              Características
            </a>
            <Link className="transition hover:text-emerald-800" href="/login">
              Acceder
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
