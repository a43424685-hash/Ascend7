'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { createBanner, updateBanner, deleteBanner } from '@/entities/banner/api/manage-banners'
import type { HeroBanner, CtaButton } from '@/entities/banner/api/get-banners'

interface BannerManagerProps {
  banners: HeroBanner[]
}

export function BannerManager({ banners }: BannerManagerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    titleEn: '',
    subtitle: '',
    subtitleEn: '',
    sortOrder: banners.length,
    startAt: '',
    endAt: '',
    ctaButtons: [{ text: 'SHOP NOW', url: '/shop', style: 'primary' }] as CtaButton[],
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      const file = fileInputRef.current?.files?.[0]
      if (file) formData.append('file', file)
      const mobileFile = mobileFileInputRef.current?.files?.[0]
      if (mobileFile) formData.append('mobileFile', mobileFile)

      formData.append('title', form.title)
      formData.append('titleEn', form.titleEn)
      formData.append('subtitle', form.subtitle)
      formData.append('subtitleEn', form.subtitleEn)
      formData.append('sortOrder', String(form.sortOrder))
      formData.append('startAt', form.startAt)
      formData.append('endAt', form.endAt)
      formData.append('ctaButtons', JSON.stringify(form.ctaButtons.filter(b => b.text.trim())))

      const result = await createBanner(formData)
      if (!result.success) {
        setError(result.error)
      } else {
        setIsAdding(false)
        setPreviewUrl(null)
        setForm({
          title: '', titleEn: '', subtitle: '', subtitleEn: '',
          sortOrder: banners.length + 1, startAt: '', endAt: '',
          ctaButtons: [{ text: 'SHOP NOW', url: '/shop', style: 'primary' }] as CtaButton[],
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (mobileFileInputRef.current) mobileFileInputRef.current.value = ''
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '배너 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (banner: HeroBanner) => {
    setLoading(true)
    try {
      const result = await updateBanner(banner.id, { is_active: !banner.is_active })
      if (!result.success) setError(result.error)
      else router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '상태 변경 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      const result = await deleteBanner(id)
      if (!result.success) setError(result.error)
      else router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async (banner: HeroBanner, data: Partial<HeroBanner> & { start_at?: string | null; end_at?: string | null }) => {
    setLoading(true)
    try {
      const result = await updateBanner(banner.id, {
        title: data.title,
        title_en: data.title_en ?? undefined,
        subtitle: data.subtitle ?? undefined,
        subtitle_en: data.subtitle_en ?? undefined,
        cta_buttons: data.cta_buttons,
        sort_order: data.sort_order,
        start_at: data.start_at,
        end_at: data.end_at,
      })
      if (!result.success) setError(result.error)
      else { setEditingId(null); router.refresh() }
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {banners.length > 0 ? (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {editingId === banner.id ? (
                <BannerEditForm
                  banner={banner}
                  onSave={(data) => handleSaveEdit(banner, data)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0">
                    <Image src={banner.image_url} alt={banner.title || '배너'} fill className="object-cover" sizes="(max-width: 640px) 100vw, 192px" />
                    {banner.image_mobile_url && (
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">모바일 별도</span>
                    )}
                  </div>
                  <div className="flex-1 p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{banner.title || '(제목 없음)'}</p>
                        {banner.subtitle && <p className="text-xs text-gray-500">{banner.subtitle}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {banner.is_active ? '활성' : '비활성'}
                        </span>
                        <span className="text-[10px] text-gray-400">#{banner.sort_order}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-3">
                      {banner.cta_buttons?.length > 0 && (
                        <span>CTA: {banner.cta_buttons.map(b => b.text).join(', ')}</span>
                      )}
                      {(banner.start_at || banner.end_at) && (
                        <span>기간: {banner.start_at?.slice(0, 10) || '~'} ~ {banner.end_at?.slice(0, 10) || '~'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingId(banner.id)} className="text-xs text-blue-600 hover:underline" disabled={loading}>수정</button>
                      <button onClick={() => handleToggle(banner)} className="text-xs text-gray-600 hover:underline" disabled={loading}>
                        {banner.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="text-xs text-red-500 hover:underline" disabled={loading}>삭제</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm mb-2">등록된 배너가 없습니다</p>
          <p className="text-xs text-gray-400">배너를 추가하면 홈페이지에 슬라이드로 표시됩니다</p>
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm mb-2">새 배너 추가</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">데스크탑 이미지 *</label>
              <input ref={fileInputRef} type="file" accept="image/*" required onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setPreviewUrl(URL.createObjectURL(f))
              }} className="w-full text-sm border border-gray-300 rounded p-2" />
              <p className="text-[10px] text-gray-500 mt-1">권장: 1920x800</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">모바일 이미지 (선택)</label>
              <input ref={mobileFileInputRef} type="file" accept="image/*" className="w-full text-sm border border-gray-300 rounded p-2" />
              <p className="text-[10px] text-gray-500 mt-1">권장: 750x1000 (세로형)</p>
            </div>
          </div>

          {previewUrl && (
            <div className="relative w-full h-40 rounded overflow-hidden border">
              <Image src={previewUrl} alt="미리보기" fill className="object-cover" sizes="100vw" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">제목 (한글)</label>
              <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="NEW COLLECTION" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">제목 (영문)</label>
              <input type="text" value={form.titleEn} onChange={(e) => setForm(p => ({ ...p, titleEn: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">부제목 (한글)</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">부제목 (영문)</label>
              <input type="text" value={form.subtitleEn} onChange={(e) => setForm(p => ({ ...p, subtitleEn: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          {/* CTA 버튼 */}
          <div>
            <label className="block text-xs font-medium mb-2">CTA 버튼</label>
            {form.ctaButtons.map((btn, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input type="text" value={btn.text} onChange={(e) => {
                  const updated = [...form.ctaButtons]
                  updated[idx] = { ...btn, text: e.target.value }
                  setForm(p => ({ ...p, ctaButtons: updated }))
                }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="버튼 텍스트" />
                <input type="text" value={btn.url} onChange={(e) => {
                  const updated = [...form.ctaButtons]
                  updated[idx] = { ...btn, url: e.target.value }
                  setForm(p => ({ ...p, ctaButtons: updated }))
                }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="/shop" />
                <select value={btn.style} onChange={(e) => {
                  const updated = [...form.ctaButtons]
                  updated[idx] = { ...btn, style: e.target.value as CtaButton['style'] }
                  setForm(p => ({ ...p, ctaButtons: updated }))
                }} className="px-2 py-1.5 border border-gray-300 rounded text-sm">
                  <option value="primary">채움</option>
                  <option value="outline">테두리</option>
                </select>
                {form.ctaButtons.length > 1 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, ctaButtons: p.ctaButtons.filter((_, i) => i !== idx) }))} className="text-red-500 text-xs">삭제</button>
                )}
              </div>
            ))}
            {form.ctaButtons.length < 3 && (
              <button type="button" onClick={() => setForm(p => ({ ...p, ctaButtons: [...p.ctaButtons, { text: '', url: '/shop', style: 'outline' } as CtaButton] }))} className="text-xs text-blue-600 hover:underline">+ 버튼 추가</button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">순서</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">시작일</label>
              <input type="datetime-local" value={form.startAt} onChange={(e) => setForm(p => ({ ...p, startAt: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">종료일</label>
              <input type="datetime-local" value={form.endAt} onChange={(e) => setForm(p => ({ ...p, endAt: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} size="sm">{loading ? '추가 중...' : '배너 추가'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setIsAdding(false); setPreviewUrl(null) }}>취소</Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">+ 배너 추가</Button>
      )}
    </div>
  )
}

function BannerEditForm({
  banner, onSave, onCancel, loading,
}: {
  banner: HeroBanner
  onSave: (data: Partial<HeroBanner> & { start_at?: string | null; end_at?: string | null }) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    title: banner.title,
    title_en: banner.title_en || '',
    subtitle: banner.subtitle || '',
    subtitle_en: banner.subtitle_en || '',
    sort_order: banner.sort_order,
    start_at: banner.start_at?.slice(0, 16) || '',
    end_at: banner.end_at?.slice(0, 16) || '',
    cta_buttons: (banner.cta_buttons?.length > 0
      ? banner.cta_buttons
      : [{ text: '', url: '/shop', style: 'primary' }]) as CtaButton[],
  })

  return (
    <div className="p-4 space-y-3">
      <div className="relative w-full h-32 rounded overflow-hidden border mb-3">
        <Image src={banner.image_url} alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">제목 (한글)</label>
          <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">제목 (영문)</label>
          <input type="text" value={form.title_en} onChange={(e) => setForm(p => ({ ...p, title_en: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">부제목 (한글)</label>
          <input type="text" value={form.subtitle} onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">부제목 (영문)</label>
          <input type="text" value={form.subtitle_en} onChange={(e) => setForm(p => ({ ...p, subtitle_en: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
      </div>

      {/* CTA 버튼 편집 */}
      <div>
        <label className="block text-xs font-medium mb-2">CTA 버튼</label>
        {form.cta_buttons.map((btn, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input type="text" value={btn.text} onChange={(e) => {
              const updated = [...form.cta_buttons]
              updated[idx] = { ...btn, text: e.target.value }
              setForm(p => ({ ...p, cta_buttons: updated }))
            }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="텍스트" />
            <input type="text" value={btn.url} onChange={(e) => {
              const updated = [...form.cta_buttons]
              updated[idx] = { ...btn, url: e.target.value }
              setForm(p => ({ ...p, cta_buttons: updated }))
            }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="URL" />
            <select value={btn.style} onChange={(e) => {
              const updated = [...form.cta_buttons]
              updated[idx] = { ...btn, style: e.target.value as CtaButton['style'] }
              setForm(p => ({ ...p, cta_buttons: updated }))
            }} className="px-2 py-1.5 border border-gray-300 rounded text-sm">
              <option value="primary">채움</option>
              <option value="outline">테두리</option>
            </select>
            {form.cta_buttons.length > 1 && (
              <button type="button" onClick={() => setForm(p => ({ ...p, cta_buttons: p.cta_buttons.filter((_, i) => i !== idx) }))} className="text-red-500 text-xs">삭제</button>
            )}
          </div>
        ))}
        {form.cta_buttons.length < 3 && (
          <button type="button" onClick={() => setForm(p => ({ ...p, cta_buttons: [...p.cta_buttons, { text: '', url: '/shop', style: 'outline' } as CtaButton] }))} className="text-xs text-blue-600 hover:underline">+ 버튼</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">순서</label>
          <input type="number" value={form.sort_order} onChange={(e) => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">시작일</label>
          <input type="datetime-local" value={form.start_at} onChange={(e) => setForm(p => ({ ...p, start_at: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">종료일</label>
          <input type="datetime-local" value={form.end_at} onChange={(e) => setForm(p => ({ ...p, end_at: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button size="sm" disabled={loading} onClick={() => onSave({
          ...form,
          cta_buttons: form.cta_buttons.filter(b => b.text.trim()),
          start_at: form.start_at || null,
          end_at: form.end_at || null,
        })}>
          {loading ? '저장 중...' : '저장'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>취소</Button>
      </div>
    </div>
  )
}
