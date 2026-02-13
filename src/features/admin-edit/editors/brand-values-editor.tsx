'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { getHomeSectionByKey } from '@/entities/cms/api/get-home-sections'
import { updateBrandValues } from '@/entities/cms/api/manage-home-sections'
import { HOME_DEFAULTS } from '@/entities/cms/types/home-sections'
import type { BrandValue } from '@/entities/cms/types/home-sections'

export function BrandValuesEditor() {
  const router = useRouter()
  const [values, setValues] = useState<BrandValue[]>([...HOME_DEFAULTS.brand_values])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getHomeSectionByKey('home_brand_values').then(data => {
      if (data && Array.isArray(data)) setValues(data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const result = await updateBrandValues(values)
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

      {values.map((v, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider">항목 {i + 1}</span>
          <input
            type="text"
            value={v.num}
            onChange={(e) => {
              const updated = [...values]
              updated[i] = { ...v, num: e.target.value }
              setValues(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="번호 (예: 01)"
          />
          <input
            type="text"
            value={v.title}
            onChange={(e) => {
              const updated = [...values]
              updated[i] = { ...v, title: e.target.value }
              setValues(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="영문 제목 (예: PERFORMANCE)"
          />
          <input
            type="text"
            value={v.desc}
            onChange={(e) => {
              const updated = [...values]
              updated[i] = { ...v, desc: e.target.value }
              setValues(updated)
            }}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            placeholder="한글 설명 (예: 고성능 원단)"
          />
        </div>
      ))}

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
