'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createEvent, updateEvent, deleteEvent } from '@/entities/event/api/manage-events'
import type { EventItem } from '@/entities/event/api/get-events'
import { RichTextEditor } from '@/shared/ui/rich-text-editor'

interface EventManagerProps {
  items: EventItem[]
}

function formatDate(str: string) {
  return str.slice(0, 10)
}

export function EventManager({ items }: EventManagerProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    content: '',
    link_url: '',
    coupon_code: '',
    sort_order: items.length,
    starts_at: '',
    ends_at: '',
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
    const formData = new FormData()
    const file = fileInputRef.current?.files?.[0]
    if (file) formData.append('file', file)
    formData.append('title', form.title)
    formData.append('content', form.content)
    formData.append('link_url', form.link_url)
    formData.append('coupon_code', form.coupon_code)
    formData.append('sort_order', String(form.sort_order))
    formData.append('starts_at', form.starts_at)
    formData.append('ends_at', form.ends_at)

    await run(() => createEvent(formData))
    setIsAdding(false)
    setPreviewUrl(null)
    setForm({ title: '', content: '', link_url: '', coupon_code: '', sort_order: items.length + 1, starts_at: '', ends_at: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleToggle = async (item: EventItem) => {
    await run(() => updateEvent(item.id, { is_active: !item.is_active }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 이벤트를 삭제하시겠습니까?')) return
    await run(() => deleteEvent(id))
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {/* 이벤트 목록 */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-white border rounded-lg overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
              {editingId === item.id ? (
                <EventEditForm
                  item={item}
                  onSave={async (data) => {
                    await run(() => updateEvent(item.id, data))
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <div className="flex flex-col sm:flex-row">
                  {item.image_url && (
                    <div className="relative w-full sm:w-48 h-32 sm:h-auto shrink-0">
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 192px" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm">{item.title}</p>
                        {item.content && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400 mt-2 mb-3">
                      {item.coupon_code && (
                        <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-mono font-medium">{item.coupon_code}</span>
                      )}
                      {item.link_url && <span>링크: {item.link_url}</span>}
                      {(item.starts_at || item.ends_at) && (
                        <span>{item.starts_at ? formatDate(item.starts_at) : '~'} ~ {item.ends_at ? formatDate(item.ends_at) : '~'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditingId(item.id)} disabled={loading} className="text-xs text-blue-600 hover:underline">수정</button>
                      <button onClick={() => handleToggle(item)} disabled={loading} className="text-xs text-gray-600 hover:underline">
                        {item.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button onClick={() => handleDelete(item.id)} disabled={loading} className="text-xs text-red-500 hover:underline">삭제</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500 text-sm mb-1">등록된 이벤트가 없습니다</p>
          <p className="text-xs text-gray-400">이벤트를 추가하면 홈페이지에 표시됩니다</p>
        </div>
      )}

      {/* 추가 폼 */}
      {isAdding ? (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="font-semibold text-sm">이벤트 추가</h3>

          <div>
            <label className="block text-xs font-medium mb-1">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              required
              placeholder="이벤트 제목"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">내용</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => setForm(p => ({ ...p, content: html }))}
              minHeight={120}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">이미지 (선택)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setPreviewUrl(URL.createObjectURL(f))
              }}
              className="w-full text-sm border border-gray-300 rounded p-2"
            />
          </div>

          {previewUrl && (
            <div className="relative w-full h-40 rounded overflow-hidden border">
              <Image src={previewUrl} alt="미리보기" fill className="object-cover" sizes="100vw" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">링크 URL (선택)</label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))}
                placeholder="/shop 또는 https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">할인 쿠폰 코드 (선택)</label>
              <input
                type="text"
                value={form.coupon_code}
                onChange={(e) => setForm(p => ({ ...p, coupon_code: e.target.value.toUpperCase() }))}
                placeholder="예: SUMMER2025"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">시작일</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm(p => ({ ...p, starts_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">종료일</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm(p => ({ ...p, ends_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">순서</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? '등록 중...' : '이벤트 등록'}
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setPreviewUrl(null) }}
              className="px-5 py-2 border border-gray-300 text-xs rounded hover:border-black"
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
          + 이벤트 추가
        </button>
      )}
    </div>
  )
}

function EventEditForm({
  item, onSave, onCancel, loading,
}: {
  item: EventItem
  onSave: (data: Partial<EventItem>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    title: item.title,
    content: item.content || '',
    link_url: item.link_url || '',
    coupon_code: item.coupon_code || '',
    sort_order: item.sort_order,
    starts_at: item.starts_at?.slice(0, 16) || '',
    ends_at: item.ends_at?.slice(0, 16) || '',
  })

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1">제목</label>
        <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">내용</label>
        <RichTextEditor
          value={form.content}
          onChange={(html) => setForm(p => ({ ...p, content: html }))}
          minHeight={100}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">링크 URL</label>
          <input type="text" value={form.link_url} onChange={(e) => setForm(p => ({ ...p, link_url: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">쿠폰 코드</label>
          <input type="text" value={form.coupon_code} onChange={(e) => setForm(p => ({ ...p, coupon_code: e.target.value.toUpperCase() }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">시작일</label>
          <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm(p => ({ ...p, starts_at: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">종료일</label>
          <input type="datetime-local" value={form.ends_at} onChange={(e) => setForm(p => ({ ...p, ends_at: e.target.value }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">순서</label>
          <input type="number" value={form.sort_order} onChange={(e) => setForm(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          disabled={loading}
          onClick={() => onSave({
            title: form.title,
            content: form.content || null,
            link_url: form.link_url || null,
            coupon_code: form.coupon_code || null,
            sort_order: form.sort_order,
            starts_at: form.starts_at || null,
            ends_at: form.ends_at || null,
          })}
          className="px-4 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
        <button onClick={onCancel} className="px-4 py-1.5 border border-gray-300 text-xs rounded hover:border-black">취소</button>
      </div>
    </div>
  )
}
