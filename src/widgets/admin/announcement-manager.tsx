'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import {
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from '@/entities/cms/api/manage-announcement'
import type { Announcement } from '@/entities/cms/api/get-announcement'

const THEME_MAP = {
  dark: { bg: 'bg-black', text: 'text-white', label: '다크 (검정)' },
  light: { bg: 'bg-white border', text: 'text-black', label: '라이트 (흰색)' },
  brand: { bg: 'bg-gray-900', text: 'text-white', label: '브랜드 (짙은 회색)' },
  accent: { bg: 'bg-red-600', text: 'text-white', label: '강조 (빨강)' },
} as const

type ThemeKey = keyof typeof THEME_MAP
type AnnouncementForm = { text_ko: string; text_en: string; link_url: string; theme: ThemeKey; start_at: string; end_at: string }

interface AnnouncementManagerProps {
  announcements: Announcement[]
}

export function AnnouncementManager({ announcements }: AnnouncementManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    text_ko: '',
    text_en: '',
    link_url: '',
    theme: 'dark' as ThemeKey,
    start_at: '',
    end_at: '',
  })

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await createAnnouncement({
        text_ko: form.text_ko,
        text_en: form.text_en || undefined,
        link_url: form.link_url || undefined,
        theme: form.theme,
        start_at: form.start_at || null,
        end_at: form.end_at || null,
      })
      if (!result.success) {
        setError(result.error)
      } else {
        setIsAdding(false)
        setForm({ text_ko: '', text_en: '', link_url: '', theme: 'dark', start_at: '', end_at: '' })
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (item: Announcement) => {
    setLoading(true)
    try {
      const result = await toggleAnnouncement(item.id, !item.is_active)
      if (!result.success) setError(result.error)
      else router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '토글 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지를 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      const result = await deleteAnnouncement(id)
      if (!result.success) setError(result.error)
      else router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '삭제 실패')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async (item: Announcement, data: Partial<Announcement>) => {
    setLoading(true)
    try {
      const result = await updateAnnouncement(item.id, {
        text_ko: data.text_ko,
        text_en: data.text_en ?? undefined,
        link_url: data.link_url,
        theme: data.theme,
        start_at: data.start_at || null,
        end_at: data.end_at || null,
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">상단 공지 바</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">+ 공지 추가</Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">닫기</button>
        </div>
      )}

      {/* 목록 */}
      {announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {editingId === item.id ? (
                <AnnouncementEditForm
                  item={item}
                  onSave={(data) => handleSaveEdit(item, data)}
                  onCancel={() => setEditingId(null)}
                  loading={loading}
                />
              ) : (
                <div className="p-3 sm:p-4">
                  {/* 미리보기 */}
                  <div className={`${THEME_MAP[item.theme]?.bg || 'bg-black'} ${THEME_MAP[item.theme]?.text || 'text-white'} px-4 py-2 text-center text-xs rounded mb-3`}>
                    {item.text_ko}
                    {item.link_url && <span className="ml-1 underline">→</span>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.is_active ? '활성' : '비활성'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {THEME_MAP[item.theme]?.label || item.theme}
                      </span>
                      {(item.start_at || item.end_at) && (
                        <span className="text-[10px] text-gray-400">
                          기간: {item.start_at?.slice(0, 10) || '~'} ~ {item.end_at?.slice(0, 10) || '~'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingId(item.id)} className="text-xs text-blue-600 hover:underline" disabled={loading}>수정</button>
                      <button onClick={() => handleToggle(item)} className="text-xs text-gray-600 hover:underline" disabled={loading}>
                        {item.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:underline" disabled={loading}>삭제</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-8 text-sm text-gray-500">등록된 공지가 없습니다</p>
      )}

      {/* 추가 폼 */}
      {isAdding && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-bold">새 공지 추가</h3>
          <AnnouncementFormFields form={form} onChange={setForm} />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreate} disabled={loading || !form.text_ko.trim()} size="sm">
              {loading ? '추가 중...' : '공지 추가'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>취소</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function AnnouncementFormFields({
  form,
  onChange,
}: {
  form: AnnouncementForm
  onChange: (form: AnnouncementForm) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium mb-1">공지 문구 (한글) *</label>
        <input
          type="text"
          value={form.text_ko}
          onChange={(e) => onChange({ ...form, text_ko: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="예: 전 상품 무료배송 이벤트 진행중!"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium mb-1">공지 문구 (영문)</label>
        <input
          type="text"
          value={form.text_en}
          onChange={(e) => onChange({ ...form, text_en: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="Free shipping on all orders!"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">링크 URL</label>
        <input
          type="text"
          value={form.link_url}
          onChange={(e) => onChange({ ...form, link_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          placeholder="/shop"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">테마</label>
        <select
          value={form.theme}
          onChange={(e) => onChange({ ...form, theme: e.target.value as ThemeKey })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="dark">다크 (검정)</option>
          <option value="light">라이트 (흰색)</option>
          <option value="brand">브랜드 (짙은 회색)</option>
          <option value="accent">강조 (빨강)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">시작일</label>
        <input
          type="datetime-local"
          value={form.start_at}
          onChange={(e) => onChange({ ...form, start_at: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">종료일</label>
        <input
          type="datetime-local"
          value={form.end_at}
          onChange={(e) => onChange({ ...form, end_at: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        />
      </div>
    </div>
  )
}

function AnnouncementEditForm({
  item,
  onSave,
  onCancel,
  loading,
}: {
  item: Announcement
  onSave: (data: Partial<Announcement>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState({
    text_ko: item.text_ko,
    text_en: item.text_en || '',
    link_url: item.link_url || '',
    theme: item.theme,
    start_at: item.start_at?.slice(0, 16) || '',
    end_at: item.end_at?.slice(0, 16) || '',
  })

  return (
    <div className="p-4 space-y-3">
      <AnnouncementFormFields form={form} onChange={setForm} />
      <div className="flex gap-2 pt-2">
        <Button size="sm" disabled={loading} onClick={() => onSave({
          text_ko: form.text_ko,
          text_en: form.text_en,
          link_url: form.link_url || null,
          theme: form.theme as Announcement['theme'],
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
