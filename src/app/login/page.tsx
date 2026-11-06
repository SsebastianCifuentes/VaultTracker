"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-800">
      <Link
        className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 sm:left-8 sm:top-8"
        href="/"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Volver al inicio
      </Link>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl"
      />

      <section className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
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
            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-600">
              VAULTTRACKER
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
              {isSignUp ? "Crea tu cuenta" : "Inicia Sesión"}
            </h1>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void (isSignUp ? handleSignUp() : handleLogin());
            }}
          >
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
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
                className="text-sm font-medium text-slate-700"
                htmlFor="password"
              >
                Contraseña
              </label>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border-0 bg-slate-100 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
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
                className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                role="alert"
              >
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p
                aria-live="polite"
                className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                role="status"
              >
                {successMsg}
              </p>
            )}

            <button
              className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Procesando..."
                : isSignUp
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignUp ? "¿Ya tienes cuenta?" : "¿Primera vez aquí?"}{" "}
            <button
              className="font-semibold text-emerald-600 transition hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              disabled={loading}
              onClick={() => {
                setIsSignUp((current) => !current);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              type="button"
            >
              {isSignUp ? "Inicia Sesión" : "Crea tu cuenta"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
