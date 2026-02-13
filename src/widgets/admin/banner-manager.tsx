'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { createBanner, updateBanner, deleteBanner } from '@/entities/banner/api/manage-banners'
import type { HeroBanner } from '@/entities/banner/api/get-banners'

interface BannerManagerProps {
  banners: HeroBanner[]
}

export function BannerManager({ banners }: BannerManagerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    linkUrl: '/shop',
    linkText: 'SHOP NOW',
    sortOrder: banners.length,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      const file = fileInputRef.current?.files?.[0]
      if (file) formData.append('file', file)
      formData.append('title', form.title)
      formData.append('subtitle', form.subtitle)
      formData.append('linkUrl', form.linkUrl)
      formData.append('linkText', form.linkText)
      formData.append('sortOrder', String(form.sortOrder))

      await createBanner(formData)
      setIsAdding(false)
      setPreviewUrl(null)
      setForm({ title: '', subtitle: '', linkUrl: '/shop', linkText: 'SHOP NOW', sortOrder: banners.length + 1 })
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '배너 생성 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (banner: HeroBanner) => {
    setLoading(true)
    try {
      await updateBanner(banner.id, { is_active: !banner.is_active })
      router.refresh()
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
      await deleteBanner(id)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async (banner: HeroBanner, data: Partial<HeroBanner>) => {
    setLoading(true)
    try {
      await updateBanner(banner.id, {
        title: data.title,
        subtitle: data.subtitle ?? undefined,
        link_url: data.link_url ?? undefined,
        link_text: data.link_text ?? undefined,
        sort_order: data.sort_order,
      })
      setEditingId(null)
      router.refresh()
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

      {/* Banner List */}
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
                    <Image
                      src={banner.image_url}
                      alt={banner.title || '배너'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 192px"
                    />
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
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      {banner.link_url && <span>링크: {banner.link_url}</span>}
                      {banner.link_text && <span>· {banner.link_text}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(banner.id)}
                        className="text-xs text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleToggle(banner)}
                        className="text-xs text-gray-600 hover:underline"
                        disabled={loading}
                      >
                        {banner.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-xs text-red-500 hover:underline"
                        disabled={loading}
                      >
                        삭제
                      </button>
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

      {/* Add Form */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm mb-2">새 배너 추가</h3>

          <div>
            <label className="block text-xs font-medium mb-1">배너 이미지 *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full text-sm border border-gray-300 rounded p-2"
            />
            <p className="text-[10px] text-gray-500 mt-1">권장: 1920x800 이상, 가로형 이미지</p>
            {previewUrl && (
              <div className="relative w-full h-40 mt-2 rounded overflow-hidden border">
                <Image src={previewUrl} alt="미리보기" fill className="object-cover" sizes="100vw" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">제목</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="예: NEW COLLECTION"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">부제목</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="예: 2026 S/S 컬렉션 출시"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">링크 URL</label>
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => setForm(p => ({ ...p, linkUrl: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="/shop"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">버튼 텍스트</label>
              <input
                type="text"
                value={form.linkText}
                onChange={(e) => setForm(p => ({ ...p, linkText: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="SHOP NOW"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">순서</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} size="sm">
              {loading ? '추가 중...' : '배너 추가'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setIsAdding(false); setPreviewUrl(null) }}>
              취소
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
          + 배너 추가
        </Button>
      )}
    </div>
  )
}

function BannerEditForm({
  banner,
  onSave,
  onCancel,
  loading,
}: {
  banner: HeroBanner
  onSave: (data: Partial<HeroBanner>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    title: banner.title,
    subtitle: banner.subtitle || '',
    link_url: banner.link_url || '',
    link_text: banner.link_text || '',
    sort_order: banner.sort_order,
  })

  return (
    <div className="p-4 space-y-3">
      <div className="relative w-full h-32 rounded overflow-hidden border mb-3">
        <Image src={banner.image_url} alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">부제목</label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">링크 URL</label>
          <input
            type="text"
            value={form.link_url}
            onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">버튼 텍스트</label>
          <input
            type="text"
            value={form.link_text}
            onChange={(e) => setForm(p => ({ ...p, link_text: e.target.value }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">순서</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" disabled={loading} onClick={() => onSave(form)}>
          {loading ? '저장 중...' : '저장'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>취소</Button>
      </div>
    </div>
  )
}
