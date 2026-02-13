'use client'

import { useEditMode } from './edit-mode-provider'
import { BrandValuesEditor } from './editors/brand-values-editor'
import { PhilosophyEditor } from './editors/philosophy-editor'
import { BottomCtaEditor } from './editors/bottom-cta-editor'
import { HeroBannerEditor } from './editors/hero-banner-editor'

const SECTION_EDITORS: Record<string, { label: string; Component: React.ComponentType }> = {
  'hero-banner': { label: '히어로 배너', Component: HeroBannerEditor },
  'brand-values': { label: '브랜드 가치', Component: BrandValuesEditor },
  'philosophy': { label: '브랜드 철학', Component: PhilosophyEditor },
  'bottom-cta': { label: '하단 CTA', Component: BottomCtaEditor },
}

export function EditPanel() {
  const { editMode, activeSection, closePanel } = useEditMode()

  if (!editMode || !activeSection) return null

  const section = SECTION_EDITORS[activeSection]
  if (!section) return null

  const { Component } = section

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[9990]"
        onClick={closePanel}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[9991] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <h2 className="text-sm font-bold tracking-wide">{section.label} 편집</h2>
          <button
            onClick={closePanel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto p-5">
          <Component />
        </div>
      </div>
    </>
  )
}
