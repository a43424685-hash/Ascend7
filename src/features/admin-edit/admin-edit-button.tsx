'use client'

import { useEditMode } from './edit-mode-provider'

export function AdminEditButton() {
  const { isAdmin, editMode, toggleEditMode } = useEditMode()

  if (!isAdmin) return null

  return (
    <button
      onClick={toggleEditMode}
      className={`fixed bottom-24 right-6 z-[9999] w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
        editMode
          ? 'bg-blue-600 text-white scale-110 ring-4 ring-blue-200/50'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
      title={editMode ? '편집 모드 끄기' : '페이지 편집'}
    >
      {editMode ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )}
    </button>
  )
}
