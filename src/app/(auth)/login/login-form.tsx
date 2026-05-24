"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "./actions";
import { useTransition, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language/language-context";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email / Username Field */}
      <div className="space-y-1.5">
        <Label htmlFor="identifier" className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          {t("auth.email")}
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors pointer-events-none" />
          <Input
            id="identifier"
            type="text"
            placeholder="you@example.com or username"
            className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500/60 focus:ring-amber-500/10 focus-visible:ring-amber-500/20 focus-visible:ring-offset-0 focus-visible:border-amber-500/60 rounded-xl h-11 pl-11 pr-4 text-base md:text-sm transition-all duration-200"
            {...register("identifier")}
          />
        </div>
        {errors.identifier && (
          <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{errors.identifier.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
            {t("auth.password")}
          </Label>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500/60 focus:ring-amber-500/10 focus-visible:ring-amber-500/20 focus-visible:ring-offset-0 focus-visible:border-amber-500/60 rounded-xl h-11 pl-11 pr-11 text-base md:text-sm transition-all duration-200"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-500 mt-1 font-medium pl-1">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 active:scale-[0.98] transition-all duration-200 rounded-xl h-11 flex items-center justify-center gap-2 group mt-2"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            {t("auth.loggingIn")}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {t("auth.loginButton")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        )}
      </Button>
    </form>
  );
}


