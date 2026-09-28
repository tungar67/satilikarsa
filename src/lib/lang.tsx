import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "tr";
export type Text = { en: string; tr: string };

const KEY = "gencel-lang";
const Ctx = createContext<{ lang: Lang; setLang: (lang: Lang) => void } | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "tr" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem(KEY, next);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang outside provider");
  return ctx;
}

export function tx(value: Text, lang: Lang) {
  return value[lang] || value.en;
}

export function text(en: string, tr: string): Text {
  return { en, tr };
}
