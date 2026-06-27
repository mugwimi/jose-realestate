import { useState, useEffect } from 'react'
import { themes } from '../theme'

export function useTheme() {
  const [mode, setMode] = useState(function () {
    const saved = localStorage.getItem('jose-realestate-theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(function () {
    localStorage.setItem('jose-realestate-theme', mode)
    document.body.style.background = themes[mode].bg
  }, [mode])

  function toggleTheme() {
    setMode(function (prev) {
      return prev === 'dark' ? 'light' : 'dark'
    })
  }

  return { mode, theme: themes[mode], toggleTheme }
}