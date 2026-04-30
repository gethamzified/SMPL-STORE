// src/components/ThemeSwitcher.tsx
'use client'

import { Button } from "@/components/ui/button"
import { setTheme } from "@/app/actions/theme"
import { Moon, Sun } from "lucide-react"

export function ThemeSwitcher() {
  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={() => setTheme('light')}>
        <Sun className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setTheme('dark')}>
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
