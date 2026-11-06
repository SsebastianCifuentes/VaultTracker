"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.7-4.2 6.1v5.1h6.8c4-3.7 6-8.8 6-14.9Z"
      />
      <path
        fill="#FF3D00"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5.1c-1.9 1.3-4.1 2-6.7 2-5.2 0-9.6-3.5-11.2-8.2H5.8v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#4CAF50"
        d="M12.8 27.9a12 12 0 0 1 0-7.8v-5.2H5.8a20 20 0 0 0 0 18.2l7-5.2Z"
      />
      <path
        fill="#1976D2"
        d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8A19.3 19.3 0 0 0 24 4 20 20 0 0 0 5.8 14.9l7 5.2C14.4 15.5 18.8 12 24 12Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 fill-current"
      viewBox="0 0 24 24"
    >
      <path d="M16.37 12.21c.02 2.1 1.84 2.8 1.86 2.81-.02.05-.29 1-.95 1.98-.57.84-1.16 1.68-2.09 1.7-.91.02-1.2-.55-2.24-.55-1.04 0-1.36.53-2.22.57-.89.03-1.57-.91-2.14-1.75-1.17-1.69-2.07-4.77-.86-6.85.6-1.03 1.67-1.68 2.83-1.7.88-.02 1.7.59 2.24.59.53 0 1.53-.73 2.58-.62.44.02 1.68.18 2.48 1.34-.06.04-1.48.86-1.47 2.48ZM14.67 7.1c.47-.57.79-1.36.7-2.14-.68.03-1.5.45-1.99 1.02-.44.5-.82 1.3-.72 2.06.76.06 1.54-.38 2.01-.94Z" />
    </svg>
  );
}

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-20 text-slate-900 sm:px-6 sm:py-24">
      <Link
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:left-8 sm:top-8"
        href="/"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl"
      />

      <section className="relative w-full max-w-[460px]">
        <div className="rounded-[2rem] border border-white bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <ShieldCheck aria-hidden="true" className="h-7 w-7" />
            </div>
            <p className="text-xs font-bold tracking-[0.18em] text-emerald-700">
              VAULTTRACKER
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2rem]">
              {isSignUp ? "Empieza con claridad." : "Bienvenido a VaultTracker"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isSignUp
                ? "Crea tu cuenta y pon tus finanzas en orden."
                : "Entra a tus finanzas y descubre cómo se mueve tu plata."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              type="button"
            >
              <GoogleMark />
              Continuar con Google
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              type="button"
            >
              <AppleMark />
              Continuar con Apple
            </button>
          </div>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">
              O ingresa con tu correo
            </span>
            <span className="h-px flex-1 bg-slate-200" />
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
                className="min-h-12 w-full rounded-xl border-0 bg-slate-100 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
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
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="min-h-12 w-full rounded-xl border-0 bg-slate-100 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
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
                className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-700"
                role="alert"
              >
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <p
                aria-live="polite"
                className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700"
                role="status"
              >
                {successMsg}
              </p>
            )}

            <button
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Procesando..."
                : isSignUp
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
              {!loading && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignUp ? "¿Ya tienes cuenta?" : "¿Primera vez aquí?"}{" "}
            <button
              className="font-semibold text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              disabled={loading}
              onClick={() => {
                setIsSignUp((current) => !current);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              type="button"
            >
              {isSignUp ? "Inicia sesión" : "Crea tu cuenta"}
            </button>
          </p>
        </div>

        <div className="mt-4 flex gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm shadow-slate-200/40">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <LockKeyhole aria-hidden="true" className="h-4 w-4" />
          </span>
          <p className="text-xs leading-5 text-slate-500">
            <span className="font-semibold text-slate-700">
              Conexión 100% segura.
            </span>{" "}
            Solo lectura. Nunca movemos tu plata ni vendemos tus datos. Cifrado
            de extremo a extremo.
          </p>
        </div>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <Sparkles aria-hidden="true" className="h-3 w-3 text-emerald-500" />
          Tus finanzas, más claras y siempre bajo tu control
        </p>
      </section>
    </main>
  );
}
