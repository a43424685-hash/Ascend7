'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/shared/ui/button'
import { getAllBanners } from '@/entities/banner/api/get-banners'
import { updateBanner } from '@/entities/banner/api/manage-banners'
import { uploadCmsImage } from '@/entities/cms/api/upload-cms-image'
import { StyleToolbar } from './style-toolbar'
import type { HeroBanner } from '@/entities/banner/api/get-banners'
import type { HeroBannerTextStyle } from '@/entities/cms/types/home-sections'

export function HeroBannerEditor() {
  const router = useRouter()
  const [banners, setBanners] = useState<HeroBanner[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [textStyle, setTextStyle] = useState<HeroBannerTextStyle>({})
  const [ctaButtons, setCtaButtons] = useState<Array<{ text: string; url: string; style: string }>>([])

  useEffect(() => {
    getAllBanners().then(data => {
      setBanners(data)
      if (data.length > 0) loadBanner(data[0])
    }).finally(() => setLoading(false))
  }, [])

  const loadBanner = (banner: HeroBanner) => {
    setTitle(banner.title || '')
    setSubtitle(banner.subtitle || '')
    setTextStyle(banner.text_style || {})
    setCtaButtons(
      banner.cta_buttons?.map(c => ({ text: c.text, url: c.url, style: c.style })) || []
    )
    setMessage(null)
  }

  const selectBanner = (idx: number) => {
    setSelectedIdx(idx)
    if (banners[idx]) loadBanner(banners[idx])
  }

  const banner = banners[selectedIdx]

  const handleSave = async () => {
    if (!banner) return
    setSaving(true)
    setMessage(null)

    const result = await updateBanner(banner.id, {
      title,
      subtitle,
      text_style: textStyle as unknown as Record<string, unknown>,
      cta_buttons: ctaButtons,
    })

    if (result.success) {
      setMessage('저장 완료')
      const updated = await getAllBanners()
      setBanners(updated)
      router.refresh()
    } else {
      setMessage(result.error)
    }
    setSaving(false)
  }

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (!banner) return
    setMessage(null)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('prefix', 'banners')
      const url = await uploadCmsImage(formData)

      const updateData = type === 'desktop'
        ? { image_url: url }
        : { image_mobile_url: url }

      const result = await updateBanner(banner.id, updateData)
      if (result.success) {
        const updated = await getAllBanners()
        setBanners(updated)
        setMessage('이미지 업로드 완료')
        router.refresh()
      } else {
        setMessage(result.error)
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '업로드 실패')
    }
  }

  // ─── Position Drag ───
  const previewRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100))
    setTextStyle(prev => ({
      ...prev,
      contentPosition: { x: Math.round(x), y: Math.round(y) },
    }))
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    handleDragMove(e.clientX, e.clientY)
  }, [dragging, handleDragMove])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }, [dragging, handleDragMove])

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">불러오는 중...</div>

  if (banners.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-gray-500">등록된 배너가 없습니다.</p>
        <a href="/admin/banners" className="block w-full text-center px-4 py-3 bg-black text-white text-sm rounded hover:bg-gray-900 transition-colors">
          배너 추가하러 가기
        </a>
      </div>
    )
  }

  const pos = textStyle.contentPosition || { x: 50, y: 50 }

  return (
    <div className="space-y-4">
      {/* Banner Selector */}
      {banners.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => selectBanner(i)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded border transition-colors ${
                i === selectedIdx ? 'bg-black text-white border-black' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              배너 {i + 1}
            </button>
          ))}
        </div>
      )}

      {banner && (
        <>
          {/* Position Preview (Draggable) */}
          <div>
            <label className="block text-xs font-medium mb-1">텍스트 위치 (드래그로 이동)</label>
            <div
              ref={previewRef}
              className="relative w-full aspect-[16/9] bg-gray-900 rounded overflow-hidden cursor-crosshair select-none touch-none"
              onMouseDown={() => setDragging(true)}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDragging(false)}
              onMouseLeave={() => setDragging(false)}
              onTouchStart={() => setDragging(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setDragging(false)}
            >
              {banner.image_url && (
                <Image src={banner.image_url} alt="" fill className="object-cover opacity-60" sizes="400px" />
              )}
              {/* Position indicator + text preview */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="text-center text-white">
                  <p className="text-sm font-bold drop-shadow truncate max-w-[200px]">{title || '제목'}</p>
                  <p className="text-[10px] drop-shadow truncate max-w-[160px]">{subtitle || '부제목'}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white mx-auto mt-1 shadow-lg" />
              </div>
              <span className="absolute bottom-1 right-2 text-[9px] text-white/60 font-mono">
                X: {pos.x}% Y: {pos.y}%
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">데스크탑 이미지</label>
              <label className="block w-full text-center px-2 py-1.5 border border-dashed border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                변경
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(f, 'desktop')
                  e.target.value = ''
                }} />
              </label>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">모바일 이미지</label>
              <label className="block w-full text-center px-2 py-1.5 border border-dashed border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50 transition-colors">
                변경
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleImageUpload(f, 'mobile')
                  e.target.value = ''
                }} />
              </label>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <label className="block text-xs font-medium mb-1">제목</label>
            <input type="text" value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">부제목</label>
            <input type="text" value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
          </div>

          {/* Title Style */}
          <StyleToolbar
            label="제목"
            value={textStyle.titleStyle || {}}
            onChange={(s) => setTextStyle(prev => ({ ...prev, titleStyle: s }))}
          />

          {/* Subtitle Style */}
          <StyleToolbar
            label="부제목"
            value={textStyle.subtitleStyle || {}}
            onChange={(s) => setTextStyle(prev => ({ ...prev, subtitleStyle: s }))}
          />

          {/* Overlay Opacity */}
          <div>
            <label className="block text-xs font-medium mb-1">
              오버레이 투명도: {textStyle.overlayOpacity ?? 40}%
            </label>
            <input
              type="range" min="0" max="100"
              value={textStyle.overlayOpacity ?? 40}
              onChange={(e) => setTextStyle(prev => ({ ...prev, overlayOpacity: parseInt(e.target.value) }))}
              className="w-full accent-black"
            />
          </div>

          {/* CTA Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium">CTA 버튼</label>
              <button type="button"
                onClick={() => setCtaButtons(prev => [...prev, { text: '', url: '', style: 'primary' }])}
                className="text-xs text-blue-600 hover:underline"
              >
                + 추가
              </button>
            </div>
            {ctaButtons.map((cta, i) => (
              <div key={i} className="flex gap-1 mb-2">
                <input type="text" value={cta.text}
                  onChange={(e) => {
                    const updated = [...ctaButtons]
                    updated[i] = { ...cta, text: e.target.value }
                    setCtaButtons(updated)
                  }}
                  placeholder="텍스트"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                <input type="text" value={cta.url}
                  onChange={(e) => {
                    const updated = [...ctaButtons]
                    updated[i] = { ...cta, url: e.target.value }
                    setCtaButtons(updated)
                  }}
                  placeholder="링크"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs" />
                <select value={cta.style}
                  onChange={(e) => {
                    const updated = [...ctaButtons]
                    updated[i] = { ...cta, style: e.target.value }
                    setCtaButtons(updated)
                  }}
                  className="px-1 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="primary">채움</option>
                  <option value="outline">테두리</option>
                </select>
                <button type="button"
                  onClick={() => setCtaButtons(prev => prev.filter((_, j) => j !== i))}
                  className="px-2 py-1 text-red-500 text-xs hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Save */}
          {message && (
            <p className={`text-xs ${
              message === '저장 완료' || message === '이미지 업로드 완료' ? 'text-green-600' : 'text-red-500'
            }`}>
              {message}
            </p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? '저장 중...' : '저장'}
            </Button>
            <a
              href="/admin/banners"
              className="px-4 py-2 border border-gray-300 rounded text-xs text-center hover:bg-gray-50 flex items-center"
            >
              전체 관리
            </a>
          </div>
        </>
      )}
    </div>
  )
}
