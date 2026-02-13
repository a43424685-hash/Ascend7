'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/shared/lib/supabase/client'

type EditModeContextType = {
  isAdmin: boolean
  editMode: boolean
  activeSection: string | null
  toggleEditMode: () => void
  openSection: (id: string) => void
  closePanel: () => void
}

const EditModeContext = createContext<EditModeContextType>({
  isAdmin: false,
  editMode: false,
  activeSection: null,
  toggleEditMode: () => {},
  openSection: () => {},
  closePanel: () => {},
})

export function useEditMode() {
  return useContext(EditModeContext)
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setIsAdmin(profile?.role === 'admin')
      } catch {
        // ignore
      }
    }
    checkAdmin()
  }, [])

  const toggleEditMode = () => {
    setEditMode(prev => {
      if (prev) setActiveSection(null)
      return !prev
    })
  }

  const openSection = (id: string) => setActiveSection(id)
  const closePanel = () => setActiveSection(null)

  return (
    <EditModeContext.Provider value={{ isAdmin, editMode, activeSection, toggleEditMode, openSection, closePanel }}>
      {children}
    </EditModeContext.Provider>
  )
}
