'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  createLookbookItem,
  updateLookbookItem,
  deleteLookbookItem,
} from '@/entities/lookbook/api/manage-lookbook'
import type { LookbookItem } from '@/entities/lookbook/api/get-lookbook'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'

interface LookbookManagerProps {
  items: LookbookItem[]
}

export function LookbookManager({ items }: LookbookManagerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    link_url: '',
    tags: '',
    sort_order: items.length,
  })

  const run = async (fn: () => Promise<{ success: boolean; error?: string }>) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      if (!result.success) setError(result.error || '오류가 발생했습니다.')
      else router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return setError('이미지를 선택해주세요.')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('link_url', form.link_url)
    formData.append('tags', form.tags)
    formData.append('sort_order', String(form.sort_order))

    await run(() => createLookbookItem(formData))
    if (!error) {
      setIsAdding(false)
      setPreviewUrl(null)
      setForm({ title: '', description: '', link_url: '', tags: '', sort_order: items.length + 1 })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 룩북 항목을 삭제하시겠습니까?')) return
    await run(() => deleteLookbookItem(id))
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    await run(() => updateLookbookItem(id, { is_active: !isActive }))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {/* 아이템 목록 */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-white border rounded-lg overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
              {editingId === item.id ? (
                <LookbookEditForm
                  item={item}
                  onSave={async (data) => {
                    await run(() => updateLookbookItem(item.id, data))
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <>
                  <div className="relative aspect-square">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {!item.is_active && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                        <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded">숨김</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                    {item.tags?.length > 0 && (
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {item.tags.map(t => `#${t}`).join(' ')}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setEditingId(item.id)}
                        disabled={loading}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleToggle(item.id, item.is_active)}
                        disabled={loading}
                        className="text-[10px] text-gray-500 hover:underline"
                      >
                        {item.is_active ? '숨기기' : '공개'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={loading}
                        className="text-[10px] text-red-500 hover:underline ml-auto"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">등록된 룩북이 없습니다</p>
          <p className="text-xs text-gray-400">이미지를 업로드해 룩북을 구성하세요</p>
        </div>
      )}

      {/* 추가 폼 */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm">룩북 항목 추가</h3>

          <div>
            <label className="block text-xs font-medium mb-1">이미지 *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              required
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setPreviewUrl(URL.createObjectURL(f))
              }}
              className="w-full text-sm border border-gray-300 rounded p-2"
            />
            <p className="text-[10px] text-gray-500 mt-1">권장: 정사각형 비율 (1:1)</p>
          </div>

          {previewUrl && (
            <div className="relative w-32 h-32 rounded overflow-hidden border">
              <Image src={previewUrl} alt="미리보기" fill className="object-cover" sizes="128px" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                required
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="SUMMER LOOK 2025"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">링크 URL (선택)</label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="/shop?category=tops"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">설명 (선택)</label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm(p => ({ ...p, description: html }))}
                minHeight={80}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">태그 (쉼표 구분)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                placeholder="여름, 캐주얼, 반팔"
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
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? '업로드 중...' : '추가'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setPreviewUrl(null) }}
              className="px-4 py-2 border border-gray-300 text-xs rounded hover:border-black"
            >
              취소
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 border border-gray-300 text-xs rounded hover:border-black transition-colors"
        >
          + 항목 추가
        </button>
      )}
    </div>
  )
}

function LookbookEditForm({
  item, onSave, onCancel, loading,
}: {
  item: LookbookItem
  onSave: (data: Partial<LookbookItem>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    title: item.title,
    description: item.description || '',
    link_url: item.link_url || '',
    tags: item.tags?.join(', ') || '',
    sort_order: item.sort_order,
  })

  return (
    <div className="p-3 space-y-2">
      <div>
        <label className="block text-[10px] font-medium mb-0.5">제목</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium mb-0.5">설명</label>
        <RichTextEditor
          value={form.description}
          onChange={(html) => setForm(p => ({ ...p, description: html }))}
          minHeight={80}
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium mb-0.5">링크</label>
        <input
          type="text"
          value={form.link_url}
          onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium mb-0.5">태그 (쉼표 구분)</label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm(p => ({ ...p, tags: e.target.value }))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium mb-0.5">순서</label>
        <input
          type="number"
          value={form.sort_order}
          onChange={(e) => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={loading}
          onClick={() => onSave({
            title: form.title,
            description: form.description || null,
            link_url: form.link_url || null,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            sort_order: form.sort_order,
          })}
          className="px-3 py-1 bg-black text-white text-[10px] rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '...' : '저장'}
        </button>
        <button onClick={onCancel} className="px-3 py-1 border border-gray-300 text-[10px] rounded hover:border-black">
          취소
        </button>
      </div>
    </div>
  )
}
