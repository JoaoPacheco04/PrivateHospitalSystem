import { create } from 'zustand'
import { translations, type Language } from '../locales/translations'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: string) => string
}

const getInitialLang = (): Language => {
  const stored = localStorage.getItem('hospital_lang') as Language
  if (stored === 'pt' || stored === 'en') return stored
  const browserLang = navigator.language?.toLowerCase()
  if (browserLang.startsWith('pt')) return 'pt'
  return 'en'
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLang(),
  setLanguage: (lang: Language) => {
    localStorage.setItem('hospital_lang', lang)
    set({ language: lang })
  },
  toggleLanguage: () => {
    const next = get().language === 'pt' ? 'en' : 'pt'
    localStorage.setItem('hospital_lang', next)
    set({ language: next })
  },
  t: (key: string) => {
    const lang = get().language
    const dict = translations[lang] as Record<string, string>
    return dict[key] ?? key
  },
}))
