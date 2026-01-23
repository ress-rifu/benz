"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language/language-context";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "bn" ? "en" : "bn");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium"
      title={language === "bn" ? "Switch to English" : "Switch to Bangla"}
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm">{language === "bn" ? "EN" : "BN"}</span>
    </Button>
  );
}
