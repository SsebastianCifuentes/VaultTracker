"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
          <div className="mx-auto flex max-w-2xl flex-col items-center py-8 text-center sm:py-12">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
              <svg
                aria-hidden="true"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Zm7 0v4h4m-9 4h6m-6 4h6"
                />
              </svg>
            </div>
            <h2
              className="text-xl font-semibold text-white"
              id="statements-title"
            >
              Cartolas bancarias
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
              Aquí podrás cargar tus cartolas para procesar y organizar tus
              movimientos financieros. El módulo de carga estará disponible
              próximamente.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Módulo en preparación
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
