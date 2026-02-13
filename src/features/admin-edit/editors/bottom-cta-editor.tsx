'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { getHomeSectionByKey } from '@/entities/cms/api/get-home-sections'
import { updateBottomCta } from '@/entities/cms/api/manage-home-sections'
import { HOME_DEFAULTS } from '@/entities/cms/types/home-sections'
import { StyleToolbar } from './style-toolbar'
import { ImageUploader } from './image-uploader'
import type { BottomCtaData, TextStyle } from '@/entities/cms/types/home-sections'

export function BottomCtaEditor() {
  const router = useRouter()
  const [form, setForm] = useState<BottomCtaData>({ ...HOME_DEFAULTS.bottom_cta })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [showStyles, setShowStyles] = useState(false)

  useEffect(() => {
    getHomeSectionByKey('home_bottom_cta').then(data => {
      if (data) setForm(data as BottomCtaData)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const result = await updateBottomCta(form)
    if (result.success) {
      setMessage('저장 완료')
      router.refresh()
    } else {
      setMessage(result.error)
    }
    setSaving(false)
  }

  const updateStyle = (key: string, style: TextStyle) => {
    setForm(p => ({
      ...p,
      styles: { ...p.styles, [key]: style },
    }))
  }

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">불러오는 중...</div>

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">하단 CTA 섹션을 수정합니다.</p>

      {/* Background Image */}
      <ImageUploader
        label="배경 이미지 (선택)"
        value={form.bgImage || ''}
        onChange={(url) => setForm(p => ({ ...p, bgImage: url || undefined }))}
      />

      <div>
        <label className="block text-xs font-medium mb-1">소제목</label>
        <input type="text" value={form.subheading}
          onChange={(e) => setForm(p => ({ ...p, subheading: e.target.value }))}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="Ready to Level Up?" />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">메인 제목</label>
        <input type="text" value={form.heading}
          onChange={(e) => setForm(p => ({ ...p, heading: e.target.value }))}
          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          placeholder="START YOUR JOURNEY" />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">설명</label>
        <textarea value={form.description}
          onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
          rows={2} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium mb-1">버튼 텍스트</label>
          <input type="text" value={form.buttonText}
            onChange={(e) => setForm(p => ({ ...p, buttonText: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">버튼 링크</label>
          <input type="text" value={form.buttonUrl}
            onChange={(e) => setForm(p => ({ ...p, buttonUrl: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
      </div>

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
          <StyleToolbar label="소제목" value={form.styles?.subheading || {}} onChange={(s) => updateStyle('subheading', s)} />
          <StyleToolbar label="제목" value={form.styles?.heading || {}} onChange={(s) => updateStyle('heading', s)} />
          <StyleToolbar label="설명" value={form.styles?.description || {}} onChange={(s) => updateStyle('description', s)} />
        </div>
      )}

      {message && (
        <p className={`text-xs ${message === '저장 완료' ? 'text-green-600' : 'text-red-500'}`}>{message}</p>
      )}

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? '저장 중...' : '저장'}
      </Button>
    </div>
  )
}
