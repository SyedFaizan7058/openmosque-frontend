import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'openmosque-ui-theme'

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Applies (or removes) the `dark` class on `<html>` based on a theme
 * preference — `system` resolves against the OS setting at call time. */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // localStorage unavailable (private mode, blocked storage) — fall through.
  }
  // Was `'system'` — with no theme toggle anywhere in the UI yet, that
  // silently rendered the whole app in dark mode for any visitor whose
  // OS/browser prefers dark, which is what was actually happening here.
  // Defaulting to `'light'` makes the app's real, designed light theme the
  // one visitors see until a theme switcher ships and a user explicitly
  // opts into `'dark'` or `'system'`.
  return 'light'
}

interface UIState {
  sidebarCollapsed: boolean
  mobileMenuOpen: boolean
  theme: Theme
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
}

const initialTheme = getInitialTheme()
applyThemeToDocument(initialTheme)

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  theme: initialTheme,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setTheme: (theme) => {
    applyThemeToDocument(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Per-viewer convenience only — safe to silently drop if unavailable.
    }
    set({ theme })
  },
}))

export const selectSidebarCollapsed = (s: UIState) => s.sidebarCollapsed
export const selectMobileMenuOpen = (s: UIState) => s.mobileMenuOpen
export const selectTheme = (s: UIState) => s.theme
