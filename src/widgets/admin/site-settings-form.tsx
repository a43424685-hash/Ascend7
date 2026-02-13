'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { updateSiteSettings, uploadSiteImage } from '@/entities/cms/api/manage-site-settings'
import type { SiteSettings } from '@/entities/cms/api/get-site-settings'

interface SiteSettingsFormProps {
  settings: SiteSettings
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const router = useRouter()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const ogInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    site_name: settings.site_name,
    site_description: settings.site_description,
    logo_url: settings.logo_url,
    og_image_url: settings.og_image_url,
  })

  const handleImageUpload = async (file: File, purpose: string): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('purpose', purpose)
    const result = await uploadSiteImage(fd)
    if (result.success) return result.url
    setError(result.error)
    return null
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 로고 파일이 있으면 먼저 업로드
      const logoFile = logoInputRef.current?.files?.[0]
      if (logoFile) {
        const url = await handleImageUpload(logoFile, 'logo')
        if (url) form.logo_url = url
        else { setLoading(false); return }
      }

      // OG 이미지 파일이 있으면 업로드
      const ogFile = ogInputRef.current?.files?.[0]
      if (ogFile) {
        const url = await handleImageUpload(ogFile, 'og-image')
        if (url) form.og_image_url = url
        else { setLoading(false); return }
      }

      const result = await updateSiteSettings(form)
      if (!result.success) {
        setError(result.error)
      } else {
        setSuccess(true)
        if (logoInputRef.current) logoInputRef.current.value = ''
        if (ogInputRef.current) ogInputRef.current.value = ''
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-5">
      <h2 className="text-sm font-bold">브랜딩 설정</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
          설정이 저장되었습니다.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1">사이트명</label>
          <input
            type="text"
            value={form.site_name}
            onChange={(e) => setForm(p => ({ ...p, site_name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="ASCEND7"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">사이트 설명</label>
          <input
            type="text"
            value={form.site_description}
            onChange={(e) => setForm(p => ({ ...p, site_description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="고성능 트레이닝을 위한 프리미엄 짐웨어 브랜드"
          />
        </div>
      </div>

      {/* 로고 */}
      <div>
        <label className="block text-xs font-medium mb-1">로고 이미지</label>
        {form.logo_url && (
          <div className="relative w-40 h-12 mb-2 border rounded overflow-hidden bg-gray-50">
            <Image src={form.logo_url} alt="로고" fill className="object-contain" sizes="160px" />
          </div>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="w-full text-sm border border-gray-300 rounded p-2"
        />
        <p className="text-[10px] text-gray-500 mt-1">투명 배경 PNG 권장 (가로 200px 이상)</p>
      </div>

      {/* OG 이미지 */}
      <div>
        <label className="block text-xs font-medium mb-1">공유 이미지 (OG Image)</label>
        {form.og_image_url && (
          <div className="relative w-full max-w-xs h-32 mb-2 border rounded overflow-hidden">
            <Image src={form.og_image_url} alt="OG" fill className="object-cover" sizes="320px" />
          </div>
        )}
        <input
          ref={ogInputRef}
          type="file"
          accept="image/*"
          className="w-full text-sm border border-gray-300 rounded p-2"
        />
        <p className="text-[10px] text-gray-500 mt-1">SNS 공유 시 표시되는 이미지 (1200x630 권장)</p>
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} disabled={loading} size="sm">
          {loading ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  )
}
