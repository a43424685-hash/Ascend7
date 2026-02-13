'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { getHomeSectionByKey } from '@/entities/cms/api/get-home-sections'
import { updateBrandValues } from '@/entities/cms/api/manage-home-sections'
import { HOME_DEFAULTS } from '@/entities/cms/types/home-sections'
import { StyleToolbar } from './style-toolbar'
import { ImageUploader } from './image-uploader'
import type { BrandValue, BrandValuesSection, TextStyle } from '@/entities/cms/types/home-sections'

export function BrandValuesEditor() {
  const router = useRouter()
  const [section, setSection] = useState<BrandValuesSection>({
    items: [...HOME_DEFAULTS.brand_values.items],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showStyles, setShowStyles] = useState(false)

  useEffect(() => {
    getHomeSectionByKey('home_brand_values').then(data => {
      if (!data) return
      // 하위호환: 배열이면 래핑
      if (Array.isArray(data)) {
        setSection({ items: data as BrandValue[] })
      } else if (data && typeof data === 'object') {
        setSection(data as BrandValuesSection)
      }
    }).finally(() => setLoading(false))
  }, [])

  const items = section.items
  const styles = section.styles || {}

  const setItems = (newItems: BrandValue[]) => {
    setSection(prev => ({ ...prev, items: newItems }))
  }

  const updateStyle = (key: 'num' | 'title' | 'desc', style: TextStyle) => {
    setSection(prev => ({
      ...prev,
      styles: { ...prev.styles, [key]: style },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const result = await updateBrandValues(section)
    if (result.success) {
      setMessage('저장 완료')
      router.refresh()
    } else {
      setMessage(result.error)
    }
    setSaving(false)
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">불러오는 중...</div>

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">홈 상단의 4개 브랜드 가치 항목을 수정합니다.</p>

      {/* Background Image */}
      <ImageUploader
        label="배경 이미지 (선택)"
        value={section.bgImage || ''}
        onChange={(url) => setSection(prev => ({ ...prev, bgImage: url || undefined }))}
      />

      {/* Items */}
      {items.map((v, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider">항목 {i + 1}</span>
          <input
            type="text" value={v.num}
            onChange={(e) => {
              const updated = [...items]
              updated[i] = { ...v, num: e.target.value }
              setItems(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="번호 (예: 01)"
          />
          <input
            type="text" value={v.title}
            onChange={(e) => {
              const updated = [...items]
              updated[i] = { ...v, title: e.target.value }
              setItems(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="영문 제목 (예: PERFORMANCE)"
          />
          <input
            type="text" value={v.desc}
            onChange={(e) => {
              const updated = [...items]
              updated[i] = { ...v, desc: e.target.value }
              setItems(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="한글 설명 (예: 고성능 원단)"
          />
        </div>
      ))}

      {/* Style Controls (collapsible) */}
      <button
        type="button"
        onClick={() => setShowStyles(!showStyles)}
        className="w-full text-left text-xs font-medium text-gray-600 flex items-center gap-1 py-1"
      >
        <span className={`transition-transform ${showStyles ? 'rotate-90' : ''}`}>▶</span>
        텍스트 스타일 설정
      </button>

      {showStyles && (
        <div className="space-y-3">
          <StyleToolbar label="번호" value={styles.num || {}} onChange={(s) => updateStyle('num', s)} />
          <StyleToolbar label="제목" value={styles.title || {}} onChange={(s) => updateStyle('title', s)} />
          <StyleToolbar label="설명" value={styles.desc || {}} onChange={(s) => updateStyle('desc', s)} />
        </div>
      )}

      {message && (
        <p className={`text-xs ${message === '저장 완료' ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? '저장 중...' : '저장'}
      </Button>
    </div>
  )
}
