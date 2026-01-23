"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "./actions";
import { useTransition } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language/language-context";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const result = await login(data);
      if (result?.error) {
        toast({
          title: "Error",
          description: t("auth.invalidCredentials"),
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier" className="text-slate-200">
          {t("auth.email")}
        </Label>
        <Input
          id="identifier"
          type="text"
          placeholder="you@example.com or username"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20"
          {...register("identifier")}
        />
        {errors.identifier && (
          <p className="text-sm text-red-400">{errors.identifier.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-200">
          {t("auth.password")}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-400/50 focus:ring-amber-400/20"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-red-400">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? t("auth.loggingIn") : t("auth.loginButton")}
      </Button>
    </form>
  );
}

