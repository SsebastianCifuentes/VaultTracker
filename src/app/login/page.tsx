"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setErrorMsg("Falta configurar la conexión con Supabase.");
      return null;
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password) {
      setErrorMsg("Escribe tu correo y contraseña para crear una cuenta.");
      setSuccessMsg("");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg(
        "Cuenta creada. Revisa tu correo para confirmar la dirección.",
      );
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <section className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
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
                d="M5 10.5h14v9H5zM8 10.5V7a4 4 0 0 1 8 0v3.5m-4 4v1.5"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold tracking-[0.2em] text-emerald-400">
            VAULTTRACKER
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Tu patrimonio, bajo control.
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Inicia sesión o crea una cuenta para continuar.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-200"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                id="password"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>

            {errorMsg && (
              <p
                aria-live="polite"
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
                role="alert"
              >
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p
                aria-live="polite"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                role="status"
              >
                {successMsg}
              </p>
            )}

            <button
              className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Procesando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">¿Primera vez aquí?</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            className="w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-500/50 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={() => void handleSignUp()}
            type="button"
          >
            Crear una cuenta
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Tus datos financieros permanecen protegidos y privados.
        </p>
      </section>
    </main>
  );
}
