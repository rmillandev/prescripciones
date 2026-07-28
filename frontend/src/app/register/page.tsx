"use client";

import { useEffect, useState, type SubmitEventHandler } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(ROLE_HOME[user.role] ?? "/");
    }
  }, [user, isLoading, router]);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await register(name, email, password);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No se pudo registrar. Intentalo nuevamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-10 text-[#FFFFFF]">
      <section className="w-full max-w-sm rounded-lg border border-[#1A3A43] bg-[#11252C]/80 p-6 shadow-[0_24px_80px_rgba(0,217,255,0.08)] backdrop-blur">
        <div className="mb-8">
          <p className="text-3xl text-center font-medium text-[#00D9FF]">Prescripciones</p>
          <h1 className="mt-2 text-2xl font-semibold text-center">Crear cuenta</h1>
          <p className="mt-2 text-sm text-center text-[#A7B8BD]">Solo pacientes pueden registrarse</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFFFF]" htmlFor="name">
              Nombre completo
            </label>
            <input
              autoComplete="name"
              className="h-11 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-[#FFFFFF] outline-none transition placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/15"
              id="name"
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              required
              type="text"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFFFF]" htmlFor="email">
              Correo electronico
            </label>
            <input
              autoComplete="email"
              className="h-11 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-[#FFFFFF] outline-none transition placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/15"
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFFFF]" htmlFor="password">
              Contrasena
            </label>
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-md border border-[#1A3A43] bg-black/30 px-3 text-sm text-[#FFFFFF] outline-none transition placeholder:text-[#A7B8BD]/70 focus:border-[#00D9FF] focus:ring-2 focus:ring-[#00D9FF]/15"
              id="password"
              minLength={6}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              type="password"
              value={password}
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="flex h-11 w-full items-center justify-center rounded-md bg-[#00D9FF] px-4 text-sm font-semibold text-[#061418] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-[#1B5060] disabled:text-[#A7B8BD]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#A7B8BD]">
          Ya tenes cuenta?{" "}
          <Link className="font-medium text-[#00D9FF] hover:underline" href="/login">
            Iniciar sesion
          </Link>
        </p>
      </section>
    </main>
  );
}
