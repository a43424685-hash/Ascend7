'use client'

import type { TextStyle } from '@/entities/cms/types/home-sections'

const FONT_SIZES = [
  { label: '아주 작게', value: '12px' },
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '20px' },
  { label: '아주 크게', value: '24px' },
  { label: '특대', value: '32px' },
  { label: '제목(소)', value: '40px' },
  { label: '제목(중)', value: '48px' },
  { label: '제목(대)', value: '64px' },
  { label: '제목(특대)', value: '80px' },
]

const FONT_WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'ExtraBold', value: '800' },
  { label: 'Black', value: '900' },
]

interface StyleToolbarProps {
  label: string
  value: TextStyle
  onChange: (style: TextStyle) => void
}

export function StyleToolbar({ label, value, onChange }: StyleToolbarProps) {
  const update = (key: keyof TextStyle, val: string) => {
    onChange({ ...value, [key]: val || undefined })
  }

  return (
    <div className="space-y-2 border border-gray-200 rounded-lg p-3">
      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{label} 스타일</span>

      <div className="flex gap-2">
        <select
          value={value.fontSize || ''}
          onChange={(e) => update('fontSize', e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
        >
          <option value="">크기 기본</option>
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={value.fontWeight || ''}
          onChange={(e) => update('fontWeight', e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
        >
          <option value="">굵기 기본</option>
          {FONT_WEIGHTS.map(w => (
            <option key={w.value} value={w.value}>{w.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1 flex-1">
          <label className="text-[10px] text-gray-500 shrink-0">색상</label>
          <input
            type="color"
            value={value.color || '#000000'}
            onChange={(e) => update('color', e.target.value)}
            className="w-7 h-6 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value.color || ''}
            onChange={(e) => update('color', e.target.value)}
            placeholder="#000000"
            className="w-20 px-1 py-1 border border-gray-300 rounded text-xs"
          />
        </div>

        <div className="flex border border-gray-300 rounded overflow-hidden">
          {(['left', 'center', 'right'] as const).map(align => (
            <button
              key={align}
              type="button"
              onClick={() => update('textAlign', align)}
              className={`px-2 py-1 text-xs transition-colors ${
                value.textAlign === align ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
