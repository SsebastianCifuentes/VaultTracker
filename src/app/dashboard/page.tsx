"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  assignAutoCategory,
  parseBankCSV,
  parseSantanderPDF,
  TRANSACTION_CATEGORIES,
  type TransactionItem,
} from "@/lib/bankParser";

interface SavedTransaction extends TransactionItem {
  id?: string | number;
}

interface ManualTransactionForm {
  date: string;
  description: string;
  amount: string;
  type: TransactionItem["type"];
  category: (typeof TRANSACTION_CATEGORIES)[number];
}

interface BudgetRecord {
  category: string;
  monthly_limit: number;
}

function getMerchantDomain(description: string) {
  const merchant = description.toLocaleUpperCase("es");
  const knownMerchants: Array<[string, string]> = [
    ["UBER", "uber.com"],
    ["STARBUCKS", "starbucks.com"],
    ["LIDER", "lider.cl"],
    ["MCDONALD", "mcdonalds.com"],
    ["MCDONALDS", "mcdonalds.com"],
    ["NETFLIX", "netflix.com"],
    ["SPOTIFY", "spotify.com"],
    ["JUMBO", "jumbo.cl"],
    ["SANTA ISABEL", "santaisabel.cl"],
    ["COPEC", "copec.cl"],
    ["FALABELLA", "falabella.com"],
    ["AIR CANADA", "aircanada.com"],
    ["LATAM", "latamairlines.com"],
    ["CINEMARK", "cinemark.cl"],
    ["KFC", "kfc.com"],
    ["SODIMAC", "sodimac.cl"],
  ];

  return knownMerchants.find(([name]) => merchant.includes(name))?.[1] ?? null;
}

function MerchantLogo({ description }: { description: string }) {
  const [hasError, setHasError] = useState(false);
  const domain = getMerchantDomain(description);
  const merchantName =
    description
      .split(/[·#-]/)[0]
      ?.trim()
      .replace(/\s+/g, " ") || description.trim();
  const initial = merchantName.charAt(0).toLocaleUpperCase("es") || "?";

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-100 bg-emerald-50 text-sm font-semibold text-emerald-700">
      {domain && !hasError ? (
        // Clearbit domains are resolved dynamically, so use a plain image with a local fallback.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="h-full w-full rounded-full object-cover"
          onError={() => setHasError(true)}
          src={`https://logo.clearbit.com/${domain}`}
        />
      ) : (
        initial
      )}
    </span>
  );
}

const BUDGET_CATEGORIES = [
  "Ocio",
  "Restaurantes",
  "Supermercado",
  "Transporte",
  "Viajes",
] as const;

function getLocalDateString() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getLocalMonthString() {
  return getLocalDateString().slice(0, 7);
}

function createDemoTransactions(): SavedTransaction[] {
  const examples: Array<
    Pick<TransactionItem, "description" | "amount" | "type" | "category">
  > = [
    {
      description: "Uber Eats - Sushi House",
      amount: 24990,
      type: "EXPENSE",
      category: "Restaurantes",
    },
    {
      description: "Coffee House Providencia",
      amount: 7900,
      type: "EXPENSE",
      category: "Restaurantes",
    },
    {
      description: "Jumbo - compra semanal",
      amount: 45680,
      type: "EXPENSE",
      category: "Supermercado",
    },
    {
      description: "Uber viaje a casa",
      amount: 8500,
      type: "EXPENSE",
      category: "Transporte",
    },
    {
      description: "Air Canada - pasaje",
      amount: 258000,
      type: "EXPENSE",
      category: "Viajes",
    },
    {
      description: "ENEL cuenta de luz",
      amount: 36800,
      type: "EXPENSE",
      category: "Vivienda/Gastos Comunes",
    },
    {
      description: "Copec combustible",
      amount: 42000,
      type: "EXPENSE",
      category: "Transporte",
    },
    {
      description: "Steam juegos",
      amount: 11990,
      type: "EXPENSE",
      category: "Ocio",
    },
    {
      description: "Farmacia Cruz Verde",
      amount: 15200,
      type: "EXPENSE",
      category: "Salud",
    },
    {
      description: "Arriendo departamento",
      amount: 420000,
      type: "EXPENSE",
      category: "Vivienda/Gastos Comunes",
    },
    {
      description: "Abono sueldo mensual",
      amount: 1250000,
      type: "INCOME",
      category: "Pagos",
    },
    {
      description: "Traspaso recibido",
      amount: 85000,
      type: "INCOME",
      category: "Pagos",
    },
  ];
  const today = new Date();

  return Array.from({ length: 36 }, (_, index) => {
    const example = examples[index % examples.length];
    const monthOffset = Math.floor(index / examples.length);
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - monthOffset,
      3 + ((index * 5) % 25),
    );
    const dateString = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      ...example,
      id: `demo-${index + 1}`,
      date: dateString,
      description: `${example.description} #${index + 1}`,
      amount: example.amount + monthOffset * (index % 2 === 0 ? 1250 : 2100),
    };
  });
}

function createDemoBudgets(): BudgetRecord[] {
  return [
    { category: "Ocio", monthly_limit: 80000 },
    { category: "Restaurantes", monthly_limit: 150000 },
    { category: "Supermercado", monthly_limit: 250000 },
    { category: "Transporte", monthly_limit: 120000 },
    { category: "Viajes", monthly_limit: 300000 },
  ];
}

function HistorySkeletons() {
  return (
    <div aria-label="Cargando transacciones" className="animate-pulse" role="status">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            className="h-24 rounded-xl border border-slate-200 bg-white"
            key={index}
          />
        ))}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-80 rounded-xl border border-slate-200 bg-white" />
        <div className="h-80 rounded-xl border border-slate-200 bg-white" />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="h-11 bg-slate-50" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            className="h-14 border-t border-slate-200 bg-white"
            key={index}
          >
            <div className="mx-4 mt-5 h-3 w-2/3 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Ocio: "#a78bfa",
  Restaurantes: "#fb7185",
  Supermercado: "#34d399",
  Transporte: "#22d3ee",
  Compras: "#fbbf24",
  Pagos: "#818cf8",
  "Vivienda/Gastos Comunes": "#f97316",
  Viajes: "#2dd4bf",
  Salud: "#f472b6",
  Otros: "#94a3b8",
};

const FILTER_CATEGORIES = [
  "Viajes",
  "Vivienda/Gastos Comunes",
  "Salud",
  "Ocio",
  "Restaurantes",
  "Supermercado",
  "Transporte",
  "Compras",
  "Pagos",
  "Otros",
] as const;

function isTransactionCategory(
  category: unknown,
): category is (typeof TRANSACTION_CATEGORIES)[number] {
  return (
    typeof category === "string" &&
    TRANSACTION_CATEGORIES.some((option) => option === category)
  );
}

function CategorySpendingBreakdown({
  transactions,
  formatCurrency,
}: {
  transactions: Pick<TransactionItem, "amount" | "category" | "type">[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="mb-5">
      <h4 className="mb-3 text-xs font-medium text-slate-600">
        Gastos por categoría
      </h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {TRANSACTION_CATEGORIES.map((category) => {
          const total = transactions
            .filter(
              (transaction) =>
                transaction.type === "EXPENSE" &&
                transaction.category === category,
            )
            .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

          return (
            <div
              className="rounded-lg border border-slate-200 bg-white p-3"
              key={category}
            >
              <p className="truncate text-[11px] text-slate-500">{category}</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-700">
                {formatCurrency(total)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavedExpenseInsights({
  transactions,
  formatCurrency,
}: {
  transactions: Pick<TransactionItem, "amount" | "category" | "type">[];
  formatCurrency: (amount: number) => string;
}) {
  const expenseDistribution = useMemo(
    () =>
      TRANSACTION_CATEGORIES.map((category) => ({
        category,
        amount: transactions
          .filter(
            (transaction) =>
              transaction.type === "EXPENSE" &&
              transaction.category === category,
          )
          .reduce((total, transaction) => total + Number(transaction.amount), 0),
        fill: CATEGORY_COLORS[category],
      }))
        .filter((entry) => entry.amount > 0)
        .sort((left, right) => right.amount - left.amount),
    [transactions],
  );
  const totalExpenses = expenseDistribution.reduce(
    (total, entry) => total + entry.amount,
    0,
  );
  const topCategories = expenseDistribution.slice(0, 3);

  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <section
        aria-labelledby="expense-chart-title"
        className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div>
          <h3
            className="text-sm font-semibold text-slate-800"
            id="expense-chart-title"
          >
            Distribución de gastos
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Gastos guardados agrupados por categoría
          </p>
        </div>

        {totalExpenses > 0 ? (
          <div className="mt-3 grid items-center gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(10rem,0.9fr)]">
            <div className="h-56 min-w-0">
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    dataKey="amount"
                    innerRadius="58%"
                    nameKey="category"
                    outerRadius="84%"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {expenseDistribution.map((entry) => (
                      <Cell fill={entry.fill} key={entry.category} />
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
              {expenseDistribution.map((entry) => (
                <li
                  className="flex items-center justify-between gap-3 text-xs"
                  key={entry.category}
                >
                  <span className="flex min-w-0 items-center gap-2 text-slate-700">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.fill }}
                    />
                    <span className="truncate">{entry.category}</span>
                  </span>
                  <span className="shrink-0 text-slate-500">
                    {((entry.amount / totalExpenses) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-56 items-center justify-center text-center text-sm text-slate-500">
            Aún no hay gastos guardados para mostrar.
          </div>
        )}
      </section>

      <section
        aria-labelledby="top-expenses-title"
        className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-6"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
          Tus principales rubros
        </p>
        <h3
          className="mt-2 text-lg font-semibold text-slate-800"
          id="top-expenses-title"
        >
          Donde más gastas
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Las tres categorías con mayor gasto acumulado.
        </p>

        {topCategories.length > 0 ? (
          <ol className="mt-5 space-y-3">
            {topCategories.map((entry, index) => (
              <li
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                key={entry.category}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    {index + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-700">
                    {entry.category}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-slate-800">
                  {formatCurrency(entry.amount)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Cuando guardes gastos, aquí verás tus principales rubros.
          </p>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedTransactions, setSavedTransactions] = useState<
    SavedTransaction[]
  >([]);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({});
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);
  const [budgetError, setBudgetError] = useState("");
  const [savingBudgetCategory, setSavingBudgetCategory] = useState<
    string | null
  >(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyError, setHistoryError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedMonth, setSelectedMonth] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingCategoryId, setSavingCategoryId] = useState<
    string | number | null
  >(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | number | null
  >(null);
  const [managementError, setManagementError] = useState("");
  const [managementNotice, setManagementNotice] = useState("");
  const [isSandboxConfirmOpen, setIsSandboxConfirmOpen] = useState(false);
  const [isClearingSandbox, setIsClearingSandbox] = useState(false);
  const [isManualFormOpen, setIsManualFormOpen] = useState(false);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [manualFormError, setManualFormError] = useState("");
  const [manualTransaction, setManualTransaction] =
    useState<ManualTransactionForm>({
      date: "",
      description: "",
      amount: "",
      type: "EXPENSE",
      category: "Otros",
    });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<
    TransactionItem[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoManualIdRef = useRef(0);

  useEffect(
    () => () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    },
    [],
  );

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const fetchSavedTransactions = useCallback(
    async (currentUserId: string) => {
      if (!supabase) {
        throw new Error("Falta configurar la conexión con Supabase.");
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", currentUserId)
        .order("date", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []).map((transaction) => ({
        ...transaction,
        category: isTransactionCategory(transaction.category)
          ? transaction.category
          : assignAutoCategory(transaction.description),
      })) as SavedTransaction[];
    },
    [supabase],
  );

  const fetchBudgets = useCallback(
    async (currentUserId: string) => {
      if (!supabase) {
        throw new Error("Falta configurar la conexión con Supabase.");
      }

      const { data, error } = await supabase
        .from("budgets")
        .select("category, monthly_limit")
        .eq("user_id", currentUserId);

      if (error) {
        throw new Error(error.message);
      }

      return (data ?? []) as BudgetRecord[];
    },
    [supabase],
  );

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (
        new URLSearchParams(window.location.search).get("demo") === "1"
      ) {
        const demoBudgets = createDemoBudgets();
        setIsDemoMode(true);
        setUserEmail("exploracion@vaulttracker.demo");
        setSelectedMonth(getLocalMonthString());
        setSavedTransactions(createDemoTransactions());
        setBudgets(demoBudgets);
        setBudgetDrafts(
          Object.fromEntries(
            demoBudgets.map((budget) => [
              budget.category,
              String(budget.monthly_limit),
            ]),
          ),
        );
        setIsLoadingHistory(false);
        setIsLoadingBudgets(false);
        setLoading(false);
        return;
      }

      if (!supabase) {
        setErrorMsg("Falta configurar la conexión con Supabase.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getUser();

        if (!active) return;

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        if (!data.user) {
          router.replace("/login");
          return;
        }

        setSelectedMonth(getLocalMonthString());
        setUserId(data.user.id);
        setUserEmail(data.user.email ?? null);
        setLoading(false);
      } catch (error) {
        if (!active) return;

        setErrorMsg(
          error instanceof Error
            ? error.message
            : "No se pudo verificar tu sesión. Inténtalo de nuevo.",
        );
        setLoading(false);
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!userId) return;

    const currentUserId = userId;
    let active = true;

    async function loadHistory() {
      try {
        const transactions = await fetchSavedTransactions(currentUserId);
        if (!active) return;

        setHistoryError("");
        setSavedTransactions(transactions);
      } catch (error) {
        if (!active) return;

        setHistoryError(
          error instanceof Error
            ? `No se pudo cargar el historial: ${error.message}`
            : "Ocurrió un error inesperado al cargar el historial.",
        );
      } finally {
        if (active) {
          setIsLoadingHistory(false);
        }
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, [fetchSavedTransactions, userId]);

  useEffect(() => {
    if (!userId) return;

    const currentUserId = userId;
    let active = true;

    async function loadBudgets() {
      try {
        const loadedBudgets = await fetchBudgets(currentUserId);
        if (!active) return;

        setBudgets(loadedBudgets);
        setBudgetDrafts(
          Object.fromEntries(
            loadedBudgets.map((budget) => [
              budget.category,
              String(budget.monthly_limit),
            ]),
          ),
        );
        setBudgetError("");
      } catch (error) {
        if (!active) return;

        setBudgetError(
          error instanceof Error
            ? `No se pudieron cargar los presupuestos: ${error.message}`
            : "Ocurrió un error inesperado al cargar los presupuestos.",
        );
      } finally {
        if (active) {
          setIsLoadingBudgets(false);
        }
      }
    }

    void loadBudgets();

    return () => {
      active = false;
    };
  }, [fetchBudgets, userId]);

  async function handleLogout() {
    if (!supabase) {
      setErrorMsg("Falta configurar la conexión con Supabase.");
      return;
    }

    setLoggingOut(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.replace("/login");
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleSavedCategoryChange(
    transaction: SavedTransaction,
    category: string,
  ) {
    if (category === transaction.category) return;

    if (isDemoMode) {
      setSavedTransactions((currentTransactions) =>
        currentTransactions.map((savedTransaction) =>
          savedTransaction.id === transaction.id
            ? { ...savedTransaction, category }
            : savedTransaction,
        ),
      );
      showManagementNotice("Categoría demo actualizada.");
      return;
    }

    if (!supabase || !userId || transaction.id === undefined) {
      setCategoryError(
        "No se pudo actualizar la categoría de este movimiento.",
      );
      return;
    }

    setSavingCategoryId(transaction.id);
    setCategoryError("");

    try {
      const { error } = await supabase
        .from("transactions")
        .update({ category })
        .eq("id", transaction.id)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error) {
        setCategoryError(
          `No se pudo actualizar la categoría: ${error.message}`,
        );
        return;
      }

      setCategoryError("");
      setSavedTransactions((currentTransactions) =>
        currentTransactions.map((savedTransaction) =>
          savedTransaction.id === transaction.id
            ? { ...savedTransaction, category }
            : savedTransaction,
        ),
      );
      showManagementNotice("Categoría actualizada correctamente.");
    } catch (error) {
      setCategoryError(
        error instanceof Error
          ? `No se pudo actualizar la categoría: ${error.message}`
          : "Ocurrió un error inesperado al actualizar la categoría.",
      );
    } finally {
      setSavingCategoryId(null);
    }
  }

  function showManagementNotice(message: string) {
    setManagementNotice(message);

    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }

    noticeTimeoutRef.current = setTimeout(() => {
      setManagementNotice("");
      noticeTimeoutRef.current = null;
    }, 3500);
  }

  async function handleClearSandboxData() {
    if (isDemoMode) {
      setSavedTransactions([]);
      setHistoryPage(1);
      setIsSandboxConfirmOpen(false);
      showManagementNotice("Datos demo reiniciados.");
      return;
    }

    if (!supabase || !userId) {
      setManagementError(
        "No se pudo verificar tu sesión para borrar los datos de prueba.",
      );
      return;
    }

    setIsClearingSandbox(true);
    setManagementError("");

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("user_id", userId);

      if (error) {
        setManagementError(
          `No se pudieron borrar los datos de prueba: ${error.message}`,
        );
        return;
      }

      setSavedTransactions([]);
      setHistoryPage(1);
      setIsSandboxConfirmOpen(false);
      showManagementNotice("Datos de prueba borrados correctamente.");
    } catch (error) {
      setManagementError(
        error instanceof Error
          ? `No se pudieron borrar los datos de prueba: ${error.message}`
          : "Ocurrió un error inesperado al borrar los datos de prueba.",
      );
    } finally {
      setIsClearingSandbox(false);
    }
  }

  async function handleSaveBudget(category: string) {
    if (isDemoMode) {
      const monthlyLimit = Number(budgetDrafts[category]);
      if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
        setBudgetError("Ingresa un límite mensual mayor que cero.");
        return;
      }

      const budget = { category, monthly_limit: monthlyLimit };
      setBudgets((currentBudgets) => [
        ...currentBudgets.filter((item) => item.category !== category),
        budget,
      ]);
      setBudgetError("");
      showManagementNotice("Presupuesto demo actualizado.");
      return;
    }

    if (!supabase || !userId) {
      setBudgetError(
        "No se pudo verificar tu sesión para guardar el presupuesto.",
      );
      return;
    }

    const monthlyLimit = Number(budgetDrafts[category]);
    if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
      setBudgetError("Ingresa un límite mensual mayor que cero.");
      return;
    }

    setSavingBudgetCategory(category);
    setBudgetError("");

    try {
      const { data, error } = await supabase
        .from("budgets")
        .upsert(
          {
            user_id: userId,
            category,
            monthly_limit: monthlyLimit,
          },
          { onConflict: "user_id,category" },
        )
        .select("category, monthly_limit")
        .single();

      if (error) {
        setBudgetError(`No se pudo guardar el presupuesto: ${error.message}`);
        return;
      }

      const savedBudget = data as BudgetRecord;
      setBudgets((currentBudgets) => [
        ...currentBudgets.filter(
          (budget) => budget.category !== savedBudget.category,
        ),
        savedBudget,
      ]);
      setBudgetDrafts((currentDrafts) => ({
        ...currentDrafts,
        [category]: String(savedBudget.monthly_limit),
      }));
      showManagementNotice(`Presupuesto de ${category} guardado.`);
    } catch (error) {
      setBudgetError(
        error instanceof Error
          ? `No se pudo guardar el presupuesto: ${error.message}`
          : "Ocurrió un error inesperado al guardar el presupuesto.",
      );
    } finally {
      setSavingBudgetCategory(null);
    }
  }

  async function handleDeleteTransaction(transaction: SavedTransaction) {
    if (!isDemoMode && (!supabase || !userId || transaction.id === undefined)) {
      setManagementError(
        "No se pudo eliminar este movimiento: faltan datos de la sesión.",
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Quieres eliminar el movimiento "${transaction.description}"?`,
    );
    if (!confirmed) return;

    setDeletingTransactionId(transaction.id ?? null);
    setManagementError("");

    if (isDemoMode) {
      setSavedTransactions((currentTransactions) =>
        currentTransactions.filter(
          (savedTransaction) => savedTransaction.id !== transaction.id,
        ),
      );
      showManagementNotice("Movimiento demo eliminado.");
      setDeletingTransactionId(null);
      return;
    }

    if (!supabase || !userId || transaction.id === undefined) return;

    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error) {
        setManagementError(
          `No se pudo eliminar el movimiento: ${error.message}`,
        );
        return;
      }

      setSavedTransactions((currentTransactions) =>
        currentTransactions.filter(
          (savedTransaction) => savedTransaction.id !== transaction.id,
        ),
      );
      showManagementNotice("Movimiento eliminado correctamente.");
    } catch (error) {
      setManagementError(
        error instanceof Error
          ? `No se pudo eliminar el movimiento: ${error.message}`
          : "Ocurrió un error inesperado al eliminar el movimiento.",
      );
    } finally {
      setDeletingTransactionId(null);
    }
  }

  async function handleManualTransactionSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!isDemoMode && (!supabase || !userId)) {
      setManualFormError(
        "No se pudo verificar tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    const amount = Number(manualTransaction.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setManualFormError("Ingresa un monto mayor que cero.");
      return;
    }

    if (isDemoMode) {
      const transaction: SavedTransaction = {
        ...manualTransaction,
        id: `demo-manual-${++demoManualIdRef.current}`,
        description: manualTransaction.description.trim(),
        amount,
      };
      setSavedTransactions((currentTransactions) =>
        [transaction, ...currentTransactions].sort((left, right) =>
          right.date.localeCompare(left.date),
        ),
      );
      setIsManualFormOpen(false);
      setManualTransaction({
        date: "",
        description: "",
        amount: "",
        type: "EXPENSE",
        category: "Otros",
      });
      showManagementNotice("Movimiento agregado solo a la sesión demo.");
      return;
    }

    if (!supabase || !userId) {
      setManualFormError(
        "No se pudo verificar tu sesión. Inicia sesión nuevamente.",
      );
      return;
    }

    const currentSupabase = supabase;
    const currentUserId = userId;
    setIsSavingManual(true);
    setManualFormError("");
    setManagementError("");

    try {
      const { data: insertedTransaction, error } = await currentSupabase
        .from("transactions")
        .insert({
          date: manualTransaction.date,
          description: manualTransaction.description.trim(),
          amount,
          type: manualTransaction.type,
          category: manualTransaction.category,
          user_id: currentUserId,
        })
        .select("*")
        .single();

      if (error) {
        setManualFormError(
          `No se pudo guardar el movimiento: ${error.message}`,
        );
        return;
      }

      if (!insertedTransaction) {
        setManualFormError(
          "El movimiento se insertó, pero no se pudo recuperar el registro creado.",
        );
        return;
      }

      const insertedSavedTransaction = {
        ...insertedTransaction,
        category: isTransactionCategory(insertedTransaction.category)
          ? insertedTransaction.category
          : manualTransaction.category,
      } as SavedTransaction;
      setSavedTransactions((currentTransactions) =>
        [insertedSavedTransaction, ...currentTransactions].sort((left, right) =>
          right.date.localeCompare(left.date),
        ),
      );
      try {
        const transactions = await fetchSavedTransactions(currentUserId);
        setSavedTransactions(transactions);
        setHistoryError("");
      } catch (error) {
        setManagementError(
          error instanceof Error
            ? `El movimiento se guardó, pero no se pudo actualizar el historial: ${error.message}`
            : "El movimiento se guardó, pero no se pudo actualizar el historial.",
        );
      }
      setIsManualFormOpen(false);
      setManualTransaction({
        date: "",
        description: "",
        amount: "",
        type: "EXPENSE",
        category: "Otros",
      });
      showManagementNotice("Movimiento guardado correctamente.");
    } catch (error) {
      setManualFormError(
        error instanceof Error
          ? `No se pudo guardar el movimiento: ${error.message}`
          : "Ocurrió un error inesperado al guardar el movimiento.",
      );
    } finally {
      setIsSavingManual(false);
    }
  }

  function openManualTransactionForm() {
    setManualFormError("");
    setManualTransaction((currentTransaction) => ({
      ...currentTransaction,
      date: getLocalDateString(),
    }));
    setIsManualFormOpen(true);
  }

  async function handleSaveToDatabase() {
    if (isDemoMode) {
      setSaveMessage({
        type: "error",
        text: "Los movimientos no se guardan permanentemente en el modo demo.",
      });
      return;
    }

    if (!supabase) {
      setSaveMessage({
        type: "error",
        text: "Falta configurar la conexión con Supabase.",
      });
      return;
    }

    if (parsedTransactions.length === 0 || isSaving) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setSaveMessage({
          type: "error",
          text: `No se pudo verificar tu sesión: ${userError.message}`,
        });
        return;
      }

      if (!data.user) {
        setSaveMessage({
          type: "error",
          text: "Tu sesión expiró. Inicia sesión nuevamente para guardar.",
        });
        router.replace("/login");
        return;
      }

      const sortedDates = parsedTransactions
        .map((transaction) => transaction.date)
        .sort();
      const existingRows: Array<{
        date: string;
        description: string;
        amount: number | string;
      }> = [];
      let rangeStart = 0;
      let hasMoreRows = true;

      while (hasMoreRows) {
        const { data: existingPage, error: existingError } = await supabase
          .from("transactions")
          .select("date, description, amount")
          .eq("user_id", data.user.id)
          .gte("date", sortedDates[0])
          .lte("date", sortedDates[sortedDates.length - 1])
          .range(rangeStart, rangeStart + 999);

        if (existingError) {
          setSaveMessage({
            type: "error",
            text: `No se pudieron comprobar los duplicados: ${existingError.message}`,
          });
          return;
        }

        const page = existingPage ?? [];
        existingRows.push(
          ...(page as Array<{
            date: string;
            description: string;
            amount: number | string;
          }>),
        );
        hasMoreRows = page.length === 1000;
        rangeStart += page.length;
      }

      const transactionKey = (transaction: {
        date: string;
        description: string;
        amount: number | string;
      }) =>
        JSON.stringify([
          transaction.date,
          transaction.description,
          Number(transaction.amount),
        ]);
      const knownTransactions = new Set(existingRows.map(transactionKey));
      let duplicateCount = 0;
      const dataToInsert = parsedTransactions.flatMap((transaction) => {
        const key = transactionKey(transaction);
        if (knownTransactions.has(key)) {
          duplicateCount += 1;
          return [];
        }

        knownTransactions.add(key);
        return [{ ...transaction, user_id: data.user.id }];
      });

      if (dataToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from("transactions")
          .insert(dataToInsert);

        if (insertError) {
          setSaveMessage({
            type: "error",
            text: `No se pudieron guardar las transacciones: ${insertError.message}`,
          });
          return;
        }
      }

      if (dataToInsert.length === 0 && duplicateCount === 0) {
        setSaveMessage({
          type: "error",
          text: "No se encontraron transacciones para guardar.",
        });
        return;
      }

      setIsLoadingHistory(true);
      try {
        const transactions = await fetchSavedTransactions(data.user.id);
        setHistoryError("");
        setSavedTransactions(transactions);
      } catch (error) {
        setHistoryError(
          error instanceof Error
            ? `No se pudo cargar el historial: ${error.message}`
            : "Ocurrió un error inesperado al cargar el historial.",
        );
      } finally {
        setIsLoadingHistory(false);
      }
      setParsedTransactions([]);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileError("");
      const savedSummary =
        dataToInsert.length === 0
          ? "No se guardaron transacciones nuevas."
          : `${dataToInsert.length} ${
              dataToInsert.length === 1
                ? "transacción guardada exitosamente"
                : "transacciones guardadas exitosamente"
            }`;
      const duplicateSummary =
        duplicateCount === 0
          ? ""
          : `${duplicateCount} ${
              duplicateCount === 1
                ? "transacción existente omitida"
                : "transacciones existentes omitidas"
            }`;
      const saveSummary = [savedSummary, duplicateSummary]
        .filter(Boolean)
        .join("; ");
      setSaveMessage(null);
      showManagementNotice(saveSummary);
    } catch (error) {
      setSaveMessage({
        type: "error",
        text:
          error instanceof Error
            ? `No se pudieron guardar las transacciones: ${error.message}`
            : "Ocurrió un error inesperado al guardar las transacciones.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function selectFile(selectedFile: File | undefined) {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "pdf") {
      setFile(null);
      setParsedTransactions([]);
      setFileError("Formato no válido. Selecciona un archivo CSV o PDF.");
      setSaveMessage(null);
      return;
    }

    setFile(selectedFile);
    setFileError("");
    setParsedTransactions([]);
    setSaveMessage(null);
  }

  async function handleProcessFile() {
    if (!file || isUploading) return;

    setIsUploading(true);
    setFileError("");
    setSaveMessage(null);
    setParsedTransactions([]);

    try {
      let transactions: TransactionItem[];

      if (file.name.toLowerCase().endsWith(".csv")) {
        const fileContent = await file.text();
        transactions = parseBankCSV(fileContent);
      } else {
        transactions = await parseSantanderPDF(
          new Uint8Array(await file.arrayBuffer()),
        );
      }

      setParsedTransactions(transactions);

      if (transactions.length === 0) {
        setFileError(
          "No se encontraron transacciones válidas. Revisa el formato de la cartola.",
        );
      }
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al procesar el archivo.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / 1024).toFixed(1)} KB`;
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const totalExpenses = parsedTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalIncome = parsedTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const availableMonths = Array.from(
    new Set(
      [
        ...savedTransactions
          .map((transaction) => transaction.date.slice(0, 7))
          .filter((month) => /^\d{4}-\d{2}$/.test(month)),
        ...(selectedMonth === "Todos" ? [] : [selectedMonth]),
      ],
    ),
  ).sort((left, right) => right.localeCompare(left));
  const selectedPeriodTransactions =
    selectedMonth === "Todos"
      ? savedTransactions
      : savedTransactions.filter(
          (transaction) => transaction.date.slice(0, 7) === selectedMonth,
        );
  const monthlySpending = selectedPeriodTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] ?? 0) + Number(transaction.amount);
      return totals;
    }, {});
  const filteredTransactions = savedTransactions.filter((transaction) => {
    const matchesCategory =
      selectedCategory === "Todas" ||
      transaction.category === selectedCategory;
    const matchesType =
      selectedType === "Todos" || transaction.type === selectedType;
    const matchesMonth =
      selectedMonth === "Todos" ||
      transaction.date.slice(0, 7) === selectedMonth;
    const matchesSearch = transaction.description
      .toLocaleLowerCase("es")
      .includes(searchQuery.trim().toLocaleLowerCase("es"));

    return matchesCategory && matchesType && matchesMonth && matchesSearch;
  });
  const historyPageSize = 10;
  const historyPageCount = Math.max(
    1,
    Math.ceil(filteredTransactions.length / historyPageSize),
  );
  const currentHistoryPage = Math.min(historyPage, historyPageCount);
  const paginatedTransactions = filteredTransactions.slice(
    (currentHistoryPage - 1) * historyPageSize,
    currentHistoryPage * historyPageSize,
  );
  const firstVisibleTransaction =
    filteredTransactions.length === 0
      ? 0
      : (currentHistoryPage - 1) * historyPageSize + 1;
  const lastVisibleTransaction = Math.min(
    currentHistoryPage * historyPageSize,
    filteredTransactions.length,
  );
  const pageNumberStart = Math.max(1, currentHistoryPage - 2);
  const pageNumberEnd = Math.min(historyPageCount, pageNumberStart + 4);
  const visiblePageNumbers = Array.from(
    { length: pageNumberEnd - pageNumberStart + 1 },
    (_, index) => pageNumberStart + index,
  );
  const savedTotalExpenses = filteredTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const savedTotalIncome = filteredTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const savedNetBalance = savedTotalIncome - savedTotalExpenses;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800">
        <div
          aria-label="Verificando sesión"
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500"
          role="status"
        />
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-800">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl shadow-slate-200/50 sm:p-8">
          <p
            aria-live="polite"
            className="text-sm text-rose-700"
            role="alert"
          >
            {errorMsg || "No se pudo verificar tu sesión."}
          </p>
          <button
            className="mt-5 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            onClick={() => router.replace("/login")}
            type="button"
          >
            Ir al inicio de sesión
          </button>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white/95">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <Link
            aria-label="VaultTracker, volver al inicio"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
            href="/"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-600">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10.5h14v9H5zM8 10.5V7a4 4 0 0 1 8 0v3.5m-4 4v1.5"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-[0.16em] text-slate-800">
              VAULTTRACKER
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {isDemoMode ? "Modo exploración" : userEmail}
            </span>
            {isDemoMode ? (
              <Link
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500/50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                href="/"
              >
                Salir de demo
              </Link>
            ) : (
              <button
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500/50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                type="button"
              >
                {loggingOut ? "Cerrando..." : "Cerrar sesión"}
              </button>
            )}
          </div>
        </nav>
        <p className="px-4 pb-3 text-right text-xs text-slate-600 sm:hidden">
          {isDemoMode ? "Modo exploración" : userEmail}
        </p>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {isDemoMode && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-emerald-800">
              <span className="font-semibold text-emerald-700">
                Estás en el Modo Demo Interactivo.
              </span>{" "}
              Los cambios no se guardarán permanentemente.
            </p>
            <Link
              className="shrink-0 text-sm font-semibold text-emerald-700 underline decoration-emerald-500/40 underline-offset-4 transition hover:text-emerald-700"
              href="/login"
            >
              Crear cuenta real
            </Link>
          </div>
        )}

        {managementNotice && (
          <div
            aria-live="polite"
            className="fixed right-4 top-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-700 shadow-2xl shadow-slate-200/50"
            role="status"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            <span>{managementNotice}</span>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">Resumen</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-800">
              Tu espacio financiero
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Administra y revisa tu información financiera desde un solo lugar.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:max-w-xs">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Período financiero
              </span>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setHistoryPage(1);
                }}
                value={selectedMonth}
              >
                <option value="Todos">Todos los tiempos</option>
                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {new Intl.DateTimeFormat("es-CL", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(`${month}-01T00:00:00Z`))}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="self-start rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700/80 transition hover:border-rose-500/50 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-wait disabled:opacity-50 sm:self-end"
              disabled={isClearingSandbox || savedTransactions.length === 0}
              onClick={() => setIsSandboxConfirmOpen(true)}
              type="button"
            >
              Borrar datos de prueba
            </button>
          </div>
        </div>

        {errorMsg && (
          <p
            aria-live="polite"
            className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {errorMsg}
          </p>
        )}

        {saveMessage && (
          <p
            aria-live="polite"
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              saveMessage.type === "success"
                ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
            role={saveMessage.type === "success" ? "status" : "alert"}
          >
            {saveMessage.text}
          </p>
        )}

        <section
          aria-labelledby="statements-title"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10"
        >
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-xl font-semibold text-slate-800"
              id="statements-title"
            >
              Cartolas bancarias
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Carga una cartola bancaria para preparar sus movimientos
              financieros.
            </p>

            <input
              accept=".csv,.pdf"
              className="sr-only"
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
              ref={fileInputRef}
              type="file"
            />

            <div
              className={`mt-6 rounded-2xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                selectFile(event.dataTransfer.files[0]);
              }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-emerald-600">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3"
                  />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">
                Arrastra tu cartola y suéltala aquí
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Formatos admitidos: CSV o PDF
              </p>
              <button
                className="mt-5 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-500/50 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Seleccionar archivo
              </button>
            </div>

            {fileError && (
              <p
                aria-live="polite"
                className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {fileError}
              </p>
            )}

            {file && (
              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                    onClick={() => {
                      setFile(null);
                      setFileError("");
                      setParsedTransactions([]);
                    }}
                    type="button"
                  >
                    Descartar
                  </button>
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isUploading}
                    onClick={handleProcessFile}
                    type="button"
                  >
                    {isUploading ? "Procesando..." : "Procesar Cartola"}
                  </button>
                </div>
              </div>
            )}

            <p className="mt-5 text-center text-xs text-slate-500">
              Las cartolas CSV y PDF de Banco Santander se procesan localmente
              para mostrar una vista previa.
            </p>

            {parsedTransactions.length > 0 && (
              <section
                aria-labelledby="transactions-title"
                className="mt-10"
              >
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3
                      className="text-lg font-semibold text-slate-800"
                      id="transactions-title"
                    >
                      Vista previa de transacciones
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {parsedTransactions.length}{" "}
                      {parsedTransactions.length === 1
                        ? "transacción encontrada"
                        : "transacciones encontradas"}
                    </p>
                  </div>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-rose-700">
                      Total Gastos
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-emerald-700">
                      Total Pagos
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-slate-600">
                      Balance Net
                    </p>
                    <p
                      className={`mt-2 text-2xl font-semibold tracking-tight ${
                        netBalance < 0 ? "text-rose-700" : "text-slate-800"
                      }`}
                    >
                      {formatCurrency(netBalance)}
                    </p>
                  </div>
                </div>

                <CategorySpendingBreakdown
                  formatCurrency={formatCurrency}
                  transactions={parsedTransactions}
                />

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                    <thead className="bg-white text-xs uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-medium" scope="col">
                          Fecha
                        </th>
                        <th className="px-4 py-3 font-medium" scope="col">
                          Descripción
                        </th>
                        <th className="px-4 py-3 font-medium" scope="col">
                          Categoría
                        </th>
                        <th className="px-4 py-3 font-medium" scope="col">
                          Tipo
                        </th>
                        <th
                          className="px-4 py-3 text-right font-medium"
                          scope="col"
                        >
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedTransactions.map((transaction, index) => (
                        <tr
                          className="text-slate-700"
                          key={`${transaction.date}-${index}`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {transaction.date}
                          </td>
                          <td className="min-w-48 px-4 py-3">
                            {transaction.description}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <select
                              aria-label={`Categoría de ${transaction.description}`}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              onChange={(event) => {
                                const category = event.target.value;
                                setParsedTransactions((currentTransactions) =>
                                  currentTransactions.map(
                                    (currentTransaction, currentIndex) =>
                                      currentIndex === index
                                        ? { ...currentTransaction, category }
                                        : currentTransaction,
                                  ),
                                );
                              }}
                              value={transaction.category}
                            >
                              {TRANSACTION_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                transaction.type === "INCOME"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {transaction.type === "INCOME"
                                ? "Abono / Pago"
                                : "Compra / Gasto"}
                            </span>
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                              transaction.type === "EXPENSE"
                                ? "text-rose-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {formatCurrency(transaction.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 flex flex-col items-start gap-2 sm:items-end">
                  <button
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSaving}
                    onClick={() => void handleSaveToDatabase()}
                    type="button"
                  >
                    {isSaving ? "Guardando..." : "Guardar en Base de Datos"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </section>

        <section
          aria-labelledby="budgets-title"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8"
        >
          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-600">
              Planifica tus gastos
            </p>
            <h2
              className="mt-1 text-xl font-semibold text-slate-800"
              id="budgets-title"
            >
              Presupuestos Mensuales
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Define límites para tus categorías principales y monitorea el
              gasto del período seleccionado.
            </p>
          </div>

          {budgetError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {budgetError}
            </p>
          )}

          {isLoadingBudgets ? (
            <div
              aria-label="Cargando presupuestos"
              className="flex min-h-32 items-center justify-center"
              role="status"
            >
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
            </div>
          ) : (
            <>
              {selectedMonth === "Todos" && (
                <p className="mb-5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
                  Selecciona un mes en el período financiero para ver el
                  progreso mensual. Los límites se pueden editar en cualquier
                  período.
                </p>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {BUDGET_CATEGORIES.map((category) => {
                  const budget = budgets.find(
                    (savedBudget) => savedBudget.category === category,
                  );
                  const monthlyLimit = Number(budget?.monthly_limit ?? 0);
                  const spent = monthlySpending[category] ?? 0;
                  const ratio =
                    monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;
                  const progressColor =
                    ratio < 75
                      ? "bg-emerald-400"
                      : ratio <= 95
                        ? "bg-amber-400"
                        : "bg-rose-400";
                  const progressTextColor =
                    ratio < 75
                      ? "text-emerald-700"
                      : ratio <= 95
                        ? "text-amber-700"
                        : "text-rose-700";

                  return (
                    <article
                      className="rounded-xl border border-slate-200 bg-white p-4"
                      key={category}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <label
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                            htmlFor={`budget-${category}`}
                          >
                            {category}
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-white px-3 text-sm text-slate-500">
                              $
                            </span>
                            <input
                              className="min-w-0 flex-1 rounded-r-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              id={`budget-${category}`}
                              min="1"
                              onChange={(event) =>
                                setBudgetDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [category]: event.target.value,
                                }))
                              }
                              placeholder="Límite mensual"
                              step="1"
                              type="number"
                              value={
                                budgetDrafts[category] ??
                                (budget ? String(budget.monthly_limit) : "")
                              }
                            />
                          </div>
                        </div>
                        <button
                          className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:border-emerald-400/60 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-wait disabled:opacity-50"
                          disabled={
                            savingBudgetCategory !== null ||
                            !budgetDrafts[category]
                          }
                          onClick={() => void handleSaveBudget(category)}
                          type="button"
                        >
                          {savingBudgetCategory === category
                            ? "Guardando..."
                            : budget
                              ? "Actualizar"
                              : "Guardar"}
                        </button>
                      </div>

                      {budget && selectedMonth !== "Todos" && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                            <span className="text-slate-600">
                              Gastado: {formatCurrency(spent)} de{" "}
                              {formatCurrency(monthlyLimit)}
                            </span>
                            <span
                              className={`font-semibold ${progressTextColor}`}
                            >
                              {ratio.toFixed(0)}%
                            </span>
                          </div>
                          <div
                            aria-label={`${category}: ${ratio.toFixed(0)}% del presupuesto utilizado`}
                            aria-valuemax={100}
                            aria-valuemin={0}
                            aria-valuenow={Math.min(ratio, 100)}
                            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
                            role="progressbar"
                          >
                            <div
                              className={`h-full rounded-full transition-all ${progressColor}`}
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <section
          aria-labelledby="history-title"
          className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-10"
        >
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">
                Tus movimientos
              </p>
              <h2
                className="mt-1 text-xl font-semibold text-slate-800"
                id="history-title"
              >
                Historial de Movimientos
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Consulta las transacciones guardadas en tu cuenta.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              {savedTransactions.length > 0 && (
                <p className="text-xs text-slate-500">
                  {savedTransactions.length}{" "}
                  {savedTransactions.length === 1
                    ? "movimiento guardado"
                    : "movimientos guardados"}
                </p>
              )}
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={openManualTransactionForm}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Agregar Movimiento Manual
              </button>
            </div>
          </div>

          {historyError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {historyError}
            </p>
          )}

          {categoryError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {categoryError}
            </p>
          )}

          {managementError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              role="alert"
            >
              {managementError}
            </p>
          )}

          {isLoadingHistory ? (
            <HistorySkeletons />
          ) : !historyError && savedTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v12.5A2.75 2.75 0 0 1 16.25 21h-8.5A2.75 2.75 0 0 1 5 18.25V5.75Z" />
                  <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
                </svg>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                Aún no tienes movimientos guardados
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Importa y guarda una cartola bancaria para consultar aquí tus
                transacciones.
              </p>
            </div>
          ) : !historyError ? (
            <>
              <section
                aria-label="Filtros de transacciones"
                className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Filtrar movimientos
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Los resúmenes y gráficos se actualizan con los resultados.
                    </p>
                  </div>
                  <button
                    className="self-start text-xs font-medium text-emerald-700 transition hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:self-auto"
                    onClick={() => {
                      setSelectedCategory("Todas");
                      setSelectedType("Todos");
                      setSelectedMonth("Todos");
                      setSearchQuery("");
                      setHistoryPage(1);
                    }}
                    type="button"
                  >
                    Limpiar filtros
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Categoría
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) =>
                        {
                          setSelectedCategory(event.target.value);
                          setHistoryPage(1);
                        }
                      }
                      value={selectedCategory}
                    >
                      <option value="Todas">Todas</option>
                      {FILTER_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Tipo
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) => {
                        setSelectedType(event.target.value);
                        setHistoryPage(1);
                      }}
                      value={selectedType}
                    >
                      <option value="Todos">Todos</option>
                      <option value="INCOME">Ingresos</option>
                      <option value="EXPENSE">Gastos</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Buscar descripción
                    </span>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setHistoryPage(1);
                      }}
                      placeholder="Ej. supermercado"
                      type="search"
                      value={searchQuery}
                    />
                  </label>
                </div>
                <p
                  aria-live="polite"
                  className="mt-3 text-xs text-slate-500"
                  role="status"
                >
                  {filteredTransactions.length}{" "}
                  {filteredTransactions.length === 1
                    ? "movimiento coincide"
                    : "movimientos coinciden"}
                </p>
              </section>

              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-rose-700">
                    Total Gastos
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
                    {formatCurrency(savedTotalExpenses)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-emerald-700">
                    Total Pagos/Abonos
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">
                    {formatCurrency(savedTotalIncome)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-600">
                    Balance General
                  </p>
                  <p
                    className={`mt-2 text-2xl font-semibold tracking-tight ${
                      savedNetBalance < 0 ? "text-rose-700" : "text-slate-800"
                    }`}
                  >
                    {formatCurrency(savedNetBalance)}
                  </p>
                </div>
              </div>

              <CategorySpendingBreakdown
                formatCurrency={formatCurrency}
                transactions={filteredTransactions}
              />

              <SavedExpenseInsights
                formatCurrency={formatCurrency}
                transactions={filteredTransactions}
              />

              <div className="max-h-[34rem] space-y-2 overflow-auto">
                {paginatedTransactions.map((transaction, index) => (
                  <article
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm shadow-slate-200/40 transition hover:border-emerald-100 sm:gap-4 sm:p-4"
                    key={
                      transaction.id ??
                      `${transaction.date}-${transaction.description}-${index}`
                    }
                  >
                    <MerchantLogo description={transaction.description} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {transaction.description}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {transaction.date}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <select
                          aria-label={`Categoría de ${transaction.description}`}
                          className="max-w-44 rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
                          disabled={savingCategoryId !== null}
                          onChange={(event) =>
                            void handleSavedCategoryChange(
                              transaction,
                              event.target.value,
                            )
                          }
                          value={
                            isTransactionCategory(transaction.category)
                              ? transaction.category
                              : assignAutoCategory(transaction.description)
                          }
                        >
                          {TRANSACTION_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                            transaction.type === "INCOME"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {transaction.type === "INCOME" ? "Ingreso" : "Gasto"}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p
                        className={`whitespace-nowrap text-sm font-semibold sm:text-base ${
                          transaction.type === "INCOME"
                            ? "text-emerald-600"
                            : "text-slate-800"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "−"}
                        {formatCurrency(Number(transaction.amount))}
                      </p>
                      <button
                        aria-label={`Eliminar ${transaction.description}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-wait disabled:opacity-50"
                        disabled={
                          deletingTransactionId === transaction.id ||
                          transaction.id === undefined
                        }
                        onClick={() =>
                          void handleDeleteTransaction(transaction)
                        }
                        type="button"
                      >
                        {deletingTransactionId === transaction.id ? (
                          <span
                            aria-label="Eliminando"
                            className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-rose-500"
                            role="status"
                          />
                        ) : (
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
                            <path d="M3.5 6.5h17M9 6.5V4h6v2.5m3.5 0-.8 13.1a1.5 1.5 0 0 1-1.5 1.4H7.8a1.5 1.5 0 0 1-1.5-1.4L5.5 6.5m4 4v6m5-6v6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </article>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    No hay movimientos que coincidan con los filtros.
                  </p>
                )}
              </div>

              {filteredTransactions.length > 0 && (
                <nav
                  aria-label="Paginación del historial"
                  className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-xs text-slate-500">
                    Mostrando {firstVisibleTransaction}–{lastVisibleTransaction} de{" "}
                    {filteredTransactions.length} movimientos
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-emerald-500/50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={currentHistoryPage === 1}
                      onClick={() =>
                        setHistoryPage(Math.max(1, currentHistoryPage - 1))
                      }
                      type="button"
                    >
                      Anterior
                    </button>
                    {visiblePageNumbers.map((pageNumber) => (
                      <button
                        aria-current={
                          pageNumber === currentHistoryPage ? "page" : undefined
                        }
                        aria-label={`Página ${pageNumber}`}
                        className={`h-9 min-w-9 rounded-lg border px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                          pageNumber === currentHistoryPage
                            ? "border-emerald-500 bg-emerald-500 text-slate-950"
                            : "border-slate-200 text-slate-700 hover:border-emerald-500/50 hover:text-slate-800"
                        }`}
                        key={pageNumber}
                        onClick={() => setHistoryPage(pageNumber)}
                        type="button"
                      >
                        {pageNumber}
                      </button>
                    ))}
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-emerald-500/50 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={currentHistoryPage === historyPageCount}
                      onClick={() =>
                        setHistoryPage(
                          Math.min(historyPageCount, currentHistoryPage + 1),
                        )
                      }
                      type="button"
                    >
                      Siguiente
                    </button>
                  </div>
                </nav>
              )}
            </>
          ) : null}
        </section>

        {isManualFormOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isSavingManual) {
                setIsManualFormOpen(false);
              }
            }}
          >
            <section
              aria-labelledby="manual-transaction-title"
              aria-modal="true"
              className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-black/50 sm:p-8"
              role="dialog"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-emerald-600">
                    Registro manual
                  </p>
                  <h2
                    className="mt-1 text-xl font-semibold text-slate-800"
                    id="manual-transaction-title"
                  >
                    Agregar movimiento
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Registra un gasto o ingreso en tu historial.
                  </p>
                </div>
                <button
                  aria-label="Cerrar formulario"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
                  disabled={isSavingManual}
                  onClick={() => setIsManualFormOpen(false)}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) =>
                  void handleManualTransactionSubmit(event)
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Fecha
                    </span>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) =>
                        setManualTransaction((currentTransaction) => ({
                          ...currentTransaction,
                          date: event.target.value,
                        }))
                      }
                      required
                      type="date"
                      value={manualTransaction.date}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Tipo
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) =>
                        setManualTransaction((currentTransaction) => ({
                          ...currentTransaction,
                          type:
                            event.target.value === "INCOME"
                              ? "INCOME"
                              : "EXPENSE",
                        }))
                      }
                      value={manualTransaction.type}
                    >
                      <option value="EXPENSE">Gasto</option>
                      <option value="INCOME">Ingreso</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Descripción
                  </span>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    maxLength={160}
                    onChange={(event) =>
                      setManualTransaction((currentTransaction) => ({
                        ...currentTransaction,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Ej. Compra de supermercado"
                    required
                    value={manualTransaction.description}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Monto (CLP)
                    </span>
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      min="1"
                      onChange={(event) =>
                        setManualTransaction((currentTransaction) => ({
                          ...currentTransaction,
                          amount: event.target.value,
                        }))
                      }
                      placeholder="0"
                      required
                      step="1"
                      type="number"
                      value={manualTransaction.amount}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                      Categoría
                    </span>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(event) =>
                        setManualTransaction((currentTransaction) => {
                          const category = event.target.value;
                          return {
                            ...currentTransaction,
                            category: isTransactionCategory(category)
                              ? category
                              : "Otros",
                          };
                        })
                      }
                      value={manualTransaction.category}
                    >
                      {TRANSACTION_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {manualFormError && (
                  <p
                    aria-live="polite"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    role="alert"
                  >
                    {manualFormError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
                    disabled={isSavingManual}
                    onClick={() => setIsManualFormOpen(false)}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-wait disabled:opacity-60"
                    disabled={isSavingManual}
                    type="submit"
                  >
                    {isSavingManual ? "Guardando..." : "Guardar movimiento"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {isSandboxConfirmOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isClearingSandbox) {
                setIsSandboxConfirmOpen(false);
              }
            }}
          >
            <section
              aria-labelledby="sandbox-confirm-title"
              aria-modal="true"
              className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl shadow-black/50 sm:p-7"
              role="alertdialog"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13.1a2 2 0 0 0-3.4 0Z" />
                </svg>
              </div>
              <h2
                className="mt-4 text-lg font-semibold text-slate-800"
                id="sandbox-confirm-title"
              >
                ¿Borrar los datos de prueba?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Se eliminarán permanentemente las{" "}
                <span className="font-medium text-slate-700">
                  {savedTransactions.length} transacciones
                </span>{" "}
                de tu cuenta. Esta acción no se puede deshacer y no modificará
                tus presupuestos.
              </p>

              {managementError && (
                <p
                  aria-live="polite"
                  className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  role="alert"
                >
                  {managementError}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-50"
                  disabled={isClearingSandbox}
                  onClick={() => setIsSandboxConfirmOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-rose-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-wait disabled:opacity-60"
                  disabled={isClearingSandbox}
                  onClick={() => void handleClearSandboxData()}
                  type="button"
                >
                  {isClearingSandbox ? "Borrando..." : "Sí, borrar datos"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
