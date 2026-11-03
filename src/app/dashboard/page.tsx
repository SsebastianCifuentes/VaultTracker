"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, []);

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

  function selectFile(selectedFile: File | undefined) {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (extension !== "csv" && extension !== "pdf") {
      setFile(null);
      setFileError("Formato no válido. Selecciona un archivo CSV o PDF.");
      return;
    }

    setFile(selectedFile);
    setFileError("");
  }

  function handleProcessFile() {
    if (!file || isUploading) return;

    setIsUploading(true);
    console.log(file);
    setIsUploading(false);
  }

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(size / 1024).toFixed(1)} KB`;
  }

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
              El parser de cartolas se conectará aquí en el siguiente paso.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
