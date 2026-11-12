export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'cms_theme';

let mediaListenerAttached = false;

export function getStoredThemePreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
  } catch {
    // ignore storage access issues
  }
  return 'light';
}

export function resolveEffectiveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'system' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function applyEffectiveClasses(effective: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', effective === 'dark');
  root.setAttribute('data-theme', effective);
  root.style.colorScheme = effective;
}

export function applyThemePreference(theme: ThemeMode): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }

  applyEffectiveClasses(resolveEffectiveTheme(theme));

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    !mediaListenerAttached
  ) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const current = getStoredThemePreference();
      if (current === 'system') {
        applyEffectiveClasses(resolveEffectiveTheme('system'));
      }
    };
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler);
      mediaListenerAttached = true;
    }
  }
}

export function initThemePreference(): ThemeMode {
  const stored = getStoredThemePreference();
  applyThemePreference(stored);
  return stored;
}

