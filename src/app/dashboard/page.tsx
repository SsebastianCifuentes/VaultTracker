"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
      <h4 className="mb-3 text-xs font-medium text-slate-400">
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
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
              key={category}
            >
              <p className="truncate text-[11px] text-slate-500">{category}</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-200">
                {formatCurrency(total)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savedTransactions, setSavedTransactions] = useState<
    SavedTransaction[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [savingCategoryId, setSavingCategoryId] = useState<
    string | number | null
  >(null);
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

  useEffect(() => {
    let active = true;

    async function checkSession() {
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
        .eq("user_id", userId);

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

  async function handleSaveToDatabase() {
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

      const dataToInsert = parsedTransactions.map((transaction) => ({
        ...transaction,
        category: transaction.category,
        user_id: data.user.id,
      }));
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
      setSaveMessage({
        type: "success",
        text: `${dataToInsert.length} ${
          dataToInsert.length === 1 ? "transacción guardada" : "transacciones guardadas"
        } correctamente en tu cuenta.`,
      });
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
  const savedTotalExpenses = savedTransactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const savedTotalIncome = savedTransactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const savedNetBalance = savedTotalIncome - savedTotalExpenses;
  const filteredSavedTransactions = savedTransactions.filter((transaction) =>
    transaction.description
      .toLocaleLowerCase("es")
      .includes(historySearch.trim().toLocaleLowerCase("es")),
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <div
          aria-label="Verificando sesión"
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500"
          role="status"
        />
      </main>
    );
  }

  if (!userEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
        <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
          <p
            aria-live="polite"
            className="text-sm text-rose-300"
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/90">
        <nav
          aria-label="Navegación principal"
          className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
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
            <span className="text-sm font-semibold tracking-[0.16em] text-white">
              VAULTTRACKER
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {userEmail}
            </span>
            <button
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-500/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loggingOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              {loggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </nav>
        <p className="px-4 pb-3 text-right text-xs text-slate-400 sm:hidden">
          {userEmail}
        </p>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-emerald-400">Resumen</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Tu espacio financiero
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Administra y revisa tu información financiera desde un solo lugar.
          </p>
        </div>

        {errorMsg && (
          <p
            aria-live="polite"
            className="mb-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
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
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            }`}
            role={saveMessage.type === "success" ? "status" : "alert"}
          >
            {saveMessage.text}
          </p>
        )}

        <section
          aria-labelledby="statements-title"
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 sm:p-10"
        >
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-xl font-semibold text-white"
              id="statements-title"
            >
              Cartolas bancarias
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
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
              className={`mt-6 rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-10 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-950/20"
                  : "border-slate-700 bg-slate-950/40"
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
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
              <p className="mt-4 text-sm font-medium text-slate-200">
                Arrastra tu cartola y suéltala aquí
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Formatos admitidos: CSV o PDF
              </p>
              <button
                className="mt-5 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                Seleccionar archivo
              </button>
            </div>

            {fileError && (
              <p
                aria-live="polite"
                className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                role="alert"
              >
                {fileError}
              </p>
            )}

            {file && (
              <div className="mt-5 flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
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
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="text-lg font-semibold text-white"
                      id="transactions-title"
                    >
                      Vista previa de transacciones
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {parsedTransactions.length}{" "}
                      {parsedTransactions.length === 1
                        ? "transacción encontrada"
                        : "transacciones encontradas"}
                    </p>
                  </div>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                    <p className="text-xs font-medium text-rose-300">
                      Total Gastos
                    </p>
                    <p className="mt-2 text-lg font-semibold text-rose-200">
                      {formatCurrency(totalExpenses)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-xs font-medium text-emerald-300">
                      Total Pagos
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-200">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Balance Net
                    </p>
                    <p
                      className={`mt-2 text-lg font-semibold ${
                        netBalance < 0 ? "text-rose-200" : "text-white"
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

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                    <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-400">
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
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                      {parsedTransactions.map((transaction, index) => (
                        <tr
                          className="text-slate-300"
                          key={`${transaction.date}-${index}`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                            {transaction.date}
                          </td>
                          <td className="min-w-48 px-4 py-3">
                            {transaction.description}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <select
                              aria-label={`Categoría de ${transaction.description}`}
                              className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-rose-500/10 text-rose-300"
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
                                ? "text-rose-300"
                                : "text-emerald-300"
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
                    className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
          aria-labelledby="history-title"
          className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20 sm:p-10"
        >
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Tus movimientos
              </p>
              <h2
                className="mt-1 text-xl font-semibold text-white"
                id="history-title"
              >
                Historial de Movimientos
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Consulta las transacciones guardadas en tu cuenta.
              </p>
            </div>
            {savedTransactions.length > 0 && (
              <p className="text-xs text-slate-500">
                {savedTransactions.length}{" "}
                {savedTransactions.length === 1
                  ? "movimiento guardado"
                  : "movimientos guardados"}
              </p>
            )}
          </div>

          {historyError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              role="alert"
            >
              {historyError}
            </p>
          )}

          {categoryError && (
            <p
              aria-live="polite"
              className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              role="alert"
            >
              {categoryError}
            </p>
          )}

          {isLoadingHistory ? (
            <div
              aria-label="Cargando historial"
              className="flex min-h-40 items-center justify-center"
              role="status"
            >
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500" />
            </div>
          ) : !historyError && savedTransactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-5 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-400">
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
              <h3 className="mt-4 text-sm font-semibold text-slate-200">
                Aún no tienes movimientos guardados
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Importa y guarda una cartola bancaria para consultar aquí tus
                transacciones.
              </p>
            </div>
          ) : !historyError ? (
            <>
              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                  <p className="text-xs font-medium text-rose-300">
                    Total Gastos
                  </p>
                  <p className="mt-2 text-lg font-semibold text-rose-200">
                    {formatCurrency(savedTotalExpenses)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-xs font-medium text-emerald-300">
                    Total Pagos/Abonos
                  </p>
                  <p className="mt-2 text-lg font-semibold text-emerald-200">
                    {formatCurrency(savedTotalIncome)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Balance General
                  </p>
                  <p
                    className={`mt-2 text-lg font-semibold ${
                      savedNetBalance < 0 ? "text-rose-200" : "text-white"
                    }`}
                  >
                    {formatCurrency(savedNetBalance)}
                  </p>
                </div>
              </div>

              <CategorySpendingBreakdown
                formatCurrency={formatCurrency}
                transactions={savedTransactions}
              />

              <label className="mb-4 block">
                <span className="sr-only">
                  Buscar transacción por descripción
                </span>
                <span className="relative block">
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                  <input
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    onChange={(event) => setHistorySearch(event.target.value)}
                    placeholder="Buscar por descripción..."
                    type="search"
                    value={historySearch}
                  />
                </span>
              </label>

              <div className="max-h-[28rem] overflow-auto rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                  <thead className="sticky top-0 bg-slate-950 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 font-medium" scope="col">
                        Fecha
                      </th>
                      <th className="px-4 py-3 font-medium" scope="col">
                        Descripción
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium" scope="col">
                        Categoría
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 font-medium" scope="col">
                        Tipo
                      </th>
                      <th
                        className="whitespace-nowrap px-4 py-3 text-right font-medium"
                        scope="col"
                      >
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900">
                    {filteredSavedTransactions.map((transaction, index) => (
                      <tr
                        className="text-slate-300"
                        key={
                          transaction.id ??
                          `${transaction.date}-${transaction.description}-${index}`
                        }
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                          {transaction.date}
                        </td>
                        <td className="min-w-48 px-4 py-3">
                          {transaction.description}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <select
                            aria-label={`Categoría de ${transaction.description}`}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-60"
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
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              transaction.type === "INCOME"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-rose-500/10 text-rose-300"
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
                              ? "text-rose-300"
                              : "text-emerald-300"
                          }`}
                        >
                          {formatCurrency(Number(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                    {filteredSavedTransactions.length === 0 && (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-sm text-slate-500"
                          colSpan={5}
                        >
                          No hay movimientos que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
