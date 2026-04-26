import { createI18n } from 'vue-i18n'
import ja from './locales/ja'
import en from './locales/en'
import ko from './locales/ko'
import zhTW from './locales/zh-TW'
import zhCN from './locales/zh-CN'
import fr from './locales/fr'
import it from './locales/it'
import de from './locales/de'
import es from './locales/es'
import pt from './locales/pt'
import nl from './locales/nl'

export type SupportedLocale =
  | 'en'
  | 'ja'
  | 'ko'
  | 'zh-TW'
  | 'zh-CN'
  | 'fr'
  | 'it'
  | 'de'
  | 'es'
  | 'pt'
  | 'nl'

export const SUPPORTED_LOCALES: ReadonlyArray<{ code: SupportedLocale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
]

const STORAGE_KEY = 'kbdinfo:locale'

const isSupported = (s: string): s is SupportedLocale =>
  SUPPORTED_LOCALES.some((l) => l.code === s)

// ブラウザ言語を SupportedLocale に正規化する。
// 中国語は `zh-Hant` / `zh-Hans` 等の variant を見て繁体/簡体に振り分ける。
const normalizeLocale = (raw: string): SupportedLocale | null => {
  if (!raw) return null
  const lower = raw.toLowerCase()

  // 中国語の繁体・簡体振り分け
  if (lower.startsWith('zh')) {
    if (
      lower.includes('hant') ||
      lower === 'zh-tw' ||
      lower === 'zh-hk' ||
      lower === 'zh-mo'
    ) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }

  // 完全一致（en, ja, ko, fr, it, de, es, pt, nl）
  const head = raw.split('-')[0]
  if (isSupported(head)) return head as SupportedLocale

  return null
}

export const detectBrowserLocale = (): SupportedLocale => {
  // 優先順: localStorage > navigator.languages > navigator.language > 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isSupported(stored)) return stored
  } catch {
    /* ignore */
  }

  const candidates: string[] =
    typeof navigator !== 'undefined' && navigator.languages?.length
      ? [...navigator.languages]
      : typeof navigator !== 'undefined' && navigator.language
        ? [navigator.language]
        : []

  for (const cand of candidates) {
    const matched = normalizeLocale(cand)
    if (matched) return matched
  }
  return 'en'
}

export const persistLocale = (locale: SupportedLocale): void => {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    /* ignore */
  }
}

const messages = {
  en,
  ja,
  ko,
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  fr,
  it,
  de,
  es,
  pt,
  nl,
}

export const i18n = createI18n({
  legacy: false,
  locale: detectBrowserLocale(),
  fallbackLocale: 'en',
  messages,
})

// Vue 外（Pinia ストア等）から翻訳したい場合用
export const t = (key: string, named?: Record<string, unknown>): string =>
  i18n.global.t(key, named ?? {})
