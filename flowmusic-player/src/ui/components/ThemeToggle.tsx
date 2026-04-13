import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon

  return (
    <button className="theme-toggle" onClick={onToggle} type="button">
      <Icon size={18} />
      <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
    </button>
  )
}