'use client'

import { useEditMode } from './edit-mode-provider'

export function EditableSection({
  sectionId,
  label,
  children,
}: {
  sectionId: string
  label: string
  children: React.ReactNode
}) {
  const { editMode, activeSection, openSection } = useEditMode()

  if (!editMode) return <>{children}</>

  const isActive = activeSection === sectionId

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
      onClick={() => openSection(sectionId)}
    >
      {children}

      {/* Hover overlay */}
      <div className={`absolute inset-0 border-2 border-dashed transition-all duration-200 pointer-events-none ${
        isActive
          ? 'border-blue-500 bg-blue-500/5'
          : 'border-transparent group-hover:border-blue-400 group-hover:bg-blue-500/5'
      }`} />

      {/* Section label badge */}
      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[11px] font-bold text-white shadow-lg transition-all duration-200 pointer-events-none z-10 ${
        isActive
          ? 'bg-blue-600 opacity-100'
          : 'bg-black/70 opacity-0 group-hover:opacity-100'
      }`}>
        {label}
      </div>

      {/* Edit icon */}
      <div className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 pointer-events-none z-10 ${
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    </div>
  )
}
