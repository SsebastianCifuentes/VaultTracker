"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

const demoCategories: DemoCategory[] = [
  "Viajes",
  "Ocio",
  "Supermercado",
  "Restaurantes",
  "Transporte",
  "Vivienda/Gastos Comunes",
  "Pagos",
];

const demoColors: Record<DemoCategory, string> = {
  Viajes: "#2dd4bf",
  Ocio: "#a78bfa",
  Supermercado: "#34d399",
  Restaurantes: "#fb7185",
  Transporte: "#22d3ee",
  "Vivienda/Gastos Comunes": "#f97316",
  Pagos: "#818cf8",
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
  const [transactions, setTransactions] = useState(initialDemoTransactions);
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
          amount: transactions
            .filter(
              (transaction) =>
                transaction.type === "EXPENSE" &&
                transaction.category === category,
            )
            .reduce((total, transaction) => total + transaction.amount, 0),
        }))
        .filter((entry) => entry.amount > 0),
    [transactions],
  );
  const totalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const budgetSpending = transactions
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
    }, {});

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  }

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
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.07] px-5 py-3.5 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/60 hover:bg-emerald-400/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
              href="#demo-interactivo"
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
            </a>
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
        aria-labelledby="interactive-demo-title"
        className="relative border-y border-slate-800/80 bg-slate-900/35"
        id="demo-interactivo"
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-medium text-emerald-400">
              Explora con datos de ejemplo
            </p>
            <h2
              className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              id="interactive-demo-title"
            >
              Prueba el potencial de VaultTracker
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
              Filtra movimientos, cambia categorías y ajusta tus límites. Todo
              lo que ves es interactivo y ocurre en esta página.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl shadow-black/20 sm:p-7 lg:p-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Resumen de noviembre
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Datos ficticios · prueba los controles para explorar
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400">
                Categoría
                <select
                  className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-rose-500/15 bg-rose-500/[0.04] p-4">
                <p className="text-xs font-medium text-rose-300">
                  Total Gastos
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </article>
              <article className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
                <p className="text-xs font-medium text-emerald-300">
                  Total Pagos
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatCurrency(totalIncome)}
                </p>
              </article>
              <article className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Balance Neto
                </p>
                <p
                  className={`mt-2 text-xl font-semibold ${
                    netBalance < 0 ? "text-rose-300" : "text-white"
                  }`}
                >
                  {formatCurrency(netBalance)}
                </p>
              </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">
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
                          nameKey="category"
                          outerRadius="84%"
                          paddingAngle={3}
                          stroke="none"
                        >
                          {expenseDistribution.map((entry) => (
                            <Cell
                              fill={demoColors[entry.category]}
                              fillOpacity={
                                selectedCategory === "Todas" ||
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
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "0.75rem",
                            color: "#e2e8f0",
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
                          <button
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
                          >
                            <span className="flex min-w-0 items-center gap-2 text-slate-300">
                              <span
                                aria-hidden="true"
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: demoColors[entry.category],
                                }}
                              />
                              <span className="truncate">{entry.category}</span>
                            </span>
                            <span className="shrink-0 text-slate-500">
                              {((entry.amount / allExpenses) * 100).toFixed(0)}%
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>

              <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
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

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-900 text-[10px] uppercase tracking-wide text-slate-500">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredTransactions.map((transaction) => (
                        <tr className="text-slate-300" key={transaction.id}>
                          <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                            {transaction.date}
                          </td>
                          <td className="min-w-36 px-3 py-3">
                            <span className="block truncate">
                              {transaction.description}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <select
                              aria-label={`Categoría de ${transaction.description}`}
                              className="max-w-40 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200 outline-none focus:border-emerald-500"
                              onChange={(event) => {
                                const category =
                                  demoCategories.find(
                                    (option) => option === event.target.value,
                                  ) ?? "Ocio";
                                setTransactions((currentTransactions) =>
                                  currentTransactions.map((currentTransaction) =>
                                    currentTransaction.id === transaction.id
                                      ? { ...currentTransaction, category }
                                      : currentTransaction,
                                  ),
                                );
                              }}
                              value={transaction.category}
                            >
                              {demoCategories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td
                            className={`whitespace-nowrap px-3 py-3 text-right font-medium ${
                              transaction.type === "INCOME"
                                ? "text-emerald-300"
                                : "text-slate-200"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "−"}
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td
                            className="px-3 py-8 text-center text-slate-500"
                            colSpan={4}
                          >
                            No hay movimientos en esta categoría.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>

            <article className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white">
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
                        ? "text-emerald-300"
                        : progress <= 95
                          ? "text-amber-300"
                          : "text-rose-300";

                    return (
                      <div
                        className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                        key={category}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-slate-200">
                            {category}
                          </span>
                          <span
                            className={`text-xs font-semibold ${progressTextColor}`}
                          >
                            {progress.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Gastado {formatCurrency(spent)}</span>
                          <span>Límite {formatCurrency(limit)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${progressColor}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
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
                      </div>
                    );
                  },
                )}
              </div>
            </article>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-5 text-center sm:flex-row sm:text-left">
              <p className="text-sm text-slate-400">
                ¿Quieres usarlo con tus cartolas reales?
              </p>
              <Link
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
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
