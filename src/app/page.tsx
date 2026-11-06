"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SmartLogo from "@/components/SmartLogo";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CreditCard,
  FileUp,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type MovementCategory = "Comida" | "Supermercado" | "Transporte" | "Ingresos";
type CategoryFilter = "Todos" | MovementCategory;

interface Movement {
  id: number;
  merchant: string;
  initial: string;
  domain?: string;
  date: string;
  detail: string;
  amount: number;
  category: MovementCategory;
  kind: "income" | "expense";
}

const movements: Movement[] = [
  {
    id: 1,
    merchant: "McDonald's",
    initial: "M",
    domain: "mcdonalds.com",
    date: "Hoy, 12:42",
    detail: "Restaurante · Tarjeta débito",
    amount: -8990,
    category: "Comida",
    kind: "expense",
  },
  {
    id: 2,
    merchant: "Starbucks",
    initial: "S",
    domain: "starbucks.com",
    date: "Ayer, 09:18",
    detail: "Cafetería · Tarjeta débito",
    amount: -5490,
    category: "Comida",
    kind: "expense",
  },
  {
    id: 3,
    merchant: "Lider",
    initial: "L",
    domain: "lider.cl",
    date: "Ayer, 18:07",
    detail: "Supermercado · Tarjeta crédito",
    amount: -62490,
    category: "Supermercado",
    kind: "expense",
  },
  {
    id: 4,
    merchant: "Uber",
    initial: "U",
    domain: "uber.com",
    date: "05 nov, 20:31",
    detail: "Transporte · Tarjeta débito",
    amount: -7350,
    category: "Transporte",
    kind: "expense",
  },
  {
    id: 5,
    merchant: "Abono de sueldo",
    initial: "A",
    date: "01 nov, 08:02",
    detail: "Ingreso · Cuenta corriente",
    amount: 1250000,
    category: "Ingresos",
    kind: "income",
  },
];

const filters: CategoryFilter[] = [
  "Todos",
  "Comida",
  "Supermercado",
  "Transporte",
  "Ingresos",
];

const banks = [
  { name: "Santander", domain: "www.santander.cl", initial: "S" },
  { name: "Banco de Chile", domain: "bancochile.cl" },
  { name: "BancoEstado", domain: "www.bancoestado.cl", initial: "BE" },
  { name: "Bci", domain: "www.bci.cl", initial: "B" },
  {
    name: "Scotiabank",
    domain: "www.scotiabankchile.cl",
    initial: "S",
  },
  { name: "Falabella", domain: "bancofalabella.cl" },
];

function BrandMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-900/10">
      <svg
        aria-hidden="true"
        className="h-9 w-9"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        viewBox="0 0 64 64"
      >
        <path d="M32 12C20 12 16 18 16 28V38C16 48 32 54 32 54C32 54 48 48 48 38V28C48 18 44 12 32 12Z" />
        <path d="M25 36L30 31L34 35L39 28" />
        <path d="M35 28H39V32" />
      </svg>
    </span>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function Home() {
  const reduceMotion = useReducedMotion();
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>("Todos");
  const visibleMovements = useMemo(
    () =>
      selectedFilter === "Todos"
        ? movements
        : movements.filter((movement) => movement.category === selectedFilter),
    [selectedFilter],
  );

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-800">
      <header className="relative z-10 border-b border-slate-100 bg-white/90">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8"
        >
          <Link aria-label="VaultTracker, inicio" className="flex items-center gap-3" href="/">
            <BrandMark />
            <span className="text-sm font-bold tracking-[0.12em] text-slate-800">
              VAULTTRACKER
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600 sm:inline-flex"
              href="#como-funciona"
            >
              Cómo funciona
            </a>
            <Link
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              href="/login"
            >
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      <section
        className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-28"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(148,163,184,0.2) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "right 16px top 0",
        }}
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative z-10 max-w-2xl bg-white/90 py-3 pr-2"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            Tus finanzas, por fin en orden
          </div>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-slate-800 sm:text-6xl lg:text-7xl">
            Todas tus finanzas{" "}
            <span className="text-emerald-500">centralizadas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
            Conecta tus movimientos en un solo lugar. Importa tu cartola y
            descubre con claridad cómo se mueve tu dinero.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.div
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
                href="/login"
              >
                Comenzar gratis
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </motion.div>
            <a
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              href="#movimientos"
            >
              Ver cómo funciona
            </a>
          </div>
          <div className="mt-7 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-500" />
            Seguro, privado y siempre bajo tu control
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.15, duration: 0.65, ease: "easeOut" }}
          className="relative mx-auto h-[360px] w-full max-w-[500px] sm:h-[420px]"
        >
          <motion.div
            aria-hidden="true"
            className="absolute left-[8%] top-[12%] h-56 w-[82%] rotate-[-10deg] rounded-3xl bg-gradient-to-br from-rose-500 to-red-700 p-6 text-white shadow-2xl shadow-red-900/20 sm:h-64"
            animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/75">Santander</p>
                <p className="mt-1 text-[10px] tracking-wide text-white/55">Cuenta vista</p>
              </div>
              <span className="text-xl font-bold italic tracking-tight">Santander</span>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <span className="h-8 w-10 rounded-md border border-white/30 bg-white/15" />
              <span className="text-sm tracking-[0.25em] text-white/80">
                •••• &nbsp; •••• &nbsp; •••• &nbsp; 4821
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/65">
              <span>Cuenta principal</span>
              <span>VISA</span>
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="absolute bottom-[7%] right-[4%] h-56 w-[78%] rotate-[8deg] rounded-3xl border border-white/80 bg-gradient-to-br from-emerald-400 to-emerald-600 p-6 text-white shadow-2xl shadow-emerald-900/20 sm:h-64"
            animate={reduceMotion ? undefined : { y: [0, 9, 0] }}
            transition={{
              delay: 0.4,
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/75">VaultTracker</p>
                <p className="mt-1 text-[10px] text-white/60">Tu resumen financiero</p>
              </div>
              <CreditCard aria-hidden="true" className="h-6 w-6 text-white/80" />
            </div>
            <div className="mt-10 text-[10px] uppercase tracking-widest text-white/65">
              Balance disponible
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              $2.410.700
            </p>
            <div className="mt-4 flex items-center justify-between text-[10px] text-white/75">
              <span>Movimientos sincronizados</span>
              <span>•• 08</span>
            </div>
          </motion.div>

          <motion.div
            aria-hidden="true"
            className="absolute right-0 top-[4%] rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-300/40"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Todo al día</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Resumen actualizado</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section aria-labelledby="banks-heading" className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8">
          <p
            className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
            id="banks-heading"
          >
            Bancos soportados para importación
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {banks.map((bank, index) => (
              <motion.div
                key={bank.name}
                className="relative flex items-center justify-center gap-2.5"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
              >
                <SmartLogo
                  domain={bank.domain}
                  name={bank.name}
                  initial={bank.initial}
                  className="h-10 w-10 rounded-full border border-slate-200"
                />
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      index === 0 ? "text-slate-700" : "text-slate-400"
                    }`}
                  >
                    {bank.name}
                  </p>
                  {index > 0 && (
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                      Próximamente
                    </p>
                  )}
                  {index === 0 && (
                    <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-600">
                      Disponible
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="movements-heading"
        className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20"
        id="movimientos"
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <FileUp aria-hidden="true" className="h-3.5 w-3.5" />
            Simple desde el primer día
          </div>
          <h2
            className="text-3xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-4xl"
            id="movements-heading"
          >
            Entiende tus gastos sin perderte en los detalles.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Tus compras e ingresos, organizados automáticamente en una vista
            clara. Sin hojas de cálculo ni trabajo manual.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Importa tu cartola Santander en segundos",
              "Encuentra tus movimientos por categoría",
              "Mantén el control de tu balance",
            ].map((item) => (
              <li className="flex items-center gap-3 text-sm text-slate-600" key={item}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check aria-hidden="true" className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
            href="/login"
          >
            Explorar mi dashboard
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          className="rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-200/50 sm:p-7"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55 }}
        >
          <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">Saldo bancario</p>
              <motion.p
                className="mt-2 text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl"
                initial={reduceMotion ? false : { opacity: 0.4, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
              >
                $2.410.700
              </motion.p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Actualizado
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtrar movimientos por categoría">
            {filters.map((filter) => (
              <motion.button
                aria-pressed={selectedFilter === filter}
                className={`rounded-full px-3.5 py-2 text-xs font-medium transition ${
                  selectedFilter === filter
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                type="button"
                whileHover={reduceMotion ? undefined : { scale: 1.04 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {visibleMovements.map((movement, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 py-4"
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                key={movement.id}
                transition={{ delay: index * 0.035, duration: 0.25 }}
                whileHover={reduceMotion ? undefined : { x: 3 }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {movement.domain ? (
                    <SmartLogo
                      domain={movement.domain}
                      name={
                        movement.merchant === "McDonald's"
                          ? "McDonalds"
                          : movement.merchant
                      }
                      className="h-10 w-10 rounded-full border border-slate-100"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700"
                    >
                      {movement.initial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {movement.merchant}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {movement.detail}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`text-sm font-semibold ${
                      movement.kind === "income"
                        ? "text-emerald-600"
                        : "text-slate-800"
                    }`}
                  >
                    {movement.kind === "income" ? "+" : "−"}
                    {formatCurrency(movement.amount)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{movement.date}</p>
                </div>
              </motion.div>
            ))}
            {visibleMovements.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No hay movimientos en esta categoría.
              </p>
            )}
          </div>

          <div className="mt-2 border-t border-slate-100 pt-4 text-center">
            <span className="text-xs text-slate-400">
              Vista de ejemplo · tus movimientos solo tú puedes verlos
            </span>
          </div>
        </motion.div>
      </section>

      <section className="bg-emerald-50/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-12 text-center sm:px-8 md:flex-row md:text-left">
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-800 sm:text-2xl">
              Dale claridad a tus finanzas.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Empieza gratis y organiza tus movimientos hoy.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-600"
            href="/login"
          >
            Crear cuenta gratis
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link
            aria-label="VaultTracker, inicio"
            className="flex items-center gap-3"
            href="/"
          >
            <BrandMark />
            <span className="text-xs font-bold tracking-[0.14em] text-slate-700">
              VAULTTRACKER
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            © 2026 VaultTracker. Todos los derechos reservados.
          </p>
          <Link
            className="text-xs font-medium text-slate-500 transition hover:text-emerald-600"
            href="/login"
          >
            Acceder
          </Link>
        </div>
      </footer>
    </main>
  );
}
