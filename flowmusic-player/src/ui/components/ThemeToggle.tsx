interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button className="theme-toggle" onClick={onToggle}>
      {theme === 'dark' ? '☀ Modo claro' : '🌙 Modo oscuro'}
    </button>
  )
}