'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface InstaPost {
  id: string
  image_url: string
  link_url: string
  caption: string
  sort_order: number
}

export default function AdminInstagramPage() {
  const [posts, setPosts] = useState<InstaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ image_url: '', link_url: '', caption: '' })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/admin/instagram')
      .then((r) => r.json())
      .then((d) => { setPosts(d.posts || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url) return
    setSaving(true)
    const res = await fetch('/api/admin/instagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sort_order: posts.length }),
    })
    const data = await res.json()
    if (res.ok) {
      setPosts((prev) => [...prev, data.post])
      setForm({ image_url: '', link_url: '', caption: '' })
      setMessage('추가되었습니다')
    } else {
      setMessage(data.error || '오류 발생')
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await fetch(`/api/admin/instagram/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">인스타그램 피드 관리</h1>
          <p className="text-sm text-gray-500">홈페이지 인스타그램 섹션에 노출될 이미지를 관리합니다</p>
        </div>
        <Link href="https://www.instagram.com" target="_blank" className="text-xs text-pink-500 hover:underline">
          인스타그램 열기 →
        </Link>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm border border-green-200">{message}</div>
      )}

      {/* 추가 폼 */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-bold mb-4">새 게시물 추가</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">이미지 URL *</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://... (직접 업로드된 이미지 URL)"
              required
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">인스타그램 링크 URL</label>
            <input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              placeholder="https://www.instagram.com/p/..."
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">캡션 (선택)</label>
            <input
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="#itero7 #gymwear"
              className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-6 py-2 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '추가'}
          </button>
        </form>
      </div>

      {/* 게시물 그리드 */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">불러오는 중...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400">등록된 게시물이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {posts.map((post) => (
            <div key={post.id} className="group relative">
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                <Image
                  src={post.image_url}
                  alt={post.caption || ''}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white text-xs px-3 py-1 rounded transition-opacity"
                  >
                    삭제
                  </button>
                </div>
              </div>
              {post.caption && (
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{post.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
