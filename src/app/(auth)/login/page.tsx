"use client";

import { LoginForm } from "./login-form";
import { useLanguage } from "@/lib/language/language-context";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function LoginPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-md p-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Benz Automobile
            </h1>
            <p className="text-slate-400 mt-2">{t("auth.login")}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

