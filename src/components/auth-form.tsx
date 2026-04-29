"use client";

import { useTransition, useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthResult } from "@/app/(auth)/actions";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (formData: FormData) => Promise<AuthResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (!result) return;
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if ("confirmEmail" in result) {
        setConfirmEmail(result.email);
      }
    });
  }

  if (confirmEmail) {
    return (
      <div className="space-y-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div className="space-y-2">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              Cadastro recebido — falta confirmar seu e-mail
            </p>
            <p className="text-muted-foreground">
              Enviamos um link para{" "}
              <span className="font-medium text-foreground">{confirmEmail}</span>.
              Abra a mensagem e clique em <span className="font-medium">Confirm your email</span>{" "}
              para liberar seu acesso.
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Não achou o e-mail?</span>{" "}
              Confira a caixa de <span className="font-medium">Spam</span> ou{" "}
              <span className="font-medium">Promoções</span>. O remetente é{" "}
              <span className="font-mono text-xs">noreply@mail.app.supabase.io</span>.
            </p>
            <p className="text-muted-foreground">
              Depois de confirmar, volte aqui e faça login normalmente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {mode === "signup" && (
        <p className="text-xs text-muted-foreground">
          Após criar a conta, vamos enviar um e-mail de confirmação.
          Verifique também sua caixa de spam.
        </p>
      )}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Aguarde..."
          : mode === "login"
            ? "Entrar"
            : "Criar conta"}
      </Button>
    </form>
  );
}
