'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/shared/lib/utils'

export const dynamic = 'force-dynamic'

interface Sale {
  id: string
  title: string
  sale_price: number
  original_price: number
  discount_percent: number
  end_at: string
  max_quantity: number | null
  sold_quantity: number
  is_active: boolean
  product: { id: string; name: string; slug: string } | null
  variant: { id: string; color: string; size: string } | null
}

export default function AdminFlashSalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchSales = async () => {
    const res = await fetch('/api/admin/flash-sales')
    if (res.ok) {
      const data = await res.json()
      setSales(data)
    }
    setLoading(false)
  }

  useEffect(() => { fetchSales() }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 타임딜을 삭제하시겠습니까?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/flash-sales/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSales(prev => prev.filter(s => s.id !== id))
      } else {
        alert('삭제 실패')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const now = new Date()

  if (loading) {
    return <div className="text-sm text-gray-400 py-12 text-center">불러오는 중...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">플래시 세일 관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">타임딜 / 한정 수량 세일 관리</p>
        </div>
        <Link
          href="/admin/flash-sales/new"
          className="bg-black text-white text-sm px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          + 플래시 세일 추가
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400 mb-2">등록된 플래시 세일이 없습니다</p>
          <Link href="/admin/flash-sales/new" className="text-sm underline">추가하기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => {
            const product = Array.isArray(sale.product) ? (sale.product as any)[0] : sale.product
            const variant = Array.isArray(sale.variant) ? (sale.variant as any)[0] : sale.variant
            const endAt = new Date(sale.end_at)
            const isExpired = endAt < now
            const isActive = sale.is_active && !isExpired

            return (
              <div key={sale.id} className="border border-gray-200 p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 font-medium ${
                      isActive ? 'bg-green-100 text-green-700' :
                      isExpired ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {isActive ? '진행 중' : isExpired ? '종료' : '비활성'}
                    </span>
                    <h3 className="font-semibold text-sm truncate">{sale.title}</h3>
                  </div>
                  {product && (
                    <p className="text-xs text-gray-500 mb-1">
                      {product.name}
                      {variant && ` — ${variant.color} / ${variant.size}`}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      <span className="font-semibold text-red-600">{formatPrice(sale.sale_price)}</span>
                      <span className="line-through ml-1">{formatPrice(sale.original_price)}</span>
                      <span className="text-yellow-600 ml-1">-{sale.discount_percent}%</span>
                    </span>
                    <span>|</span>
                    <span>
                      {sale.max_quantity !== null ? `${sale.sold_quantity}/${sale.max_quantity}개 판매` : '무제한'}
                    </span>
                    <span>|</span>
                    <span>종료: {endAt.toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/flash-sales/${sale.id}/edit`}
                    className="text-xs px-3 py-1.5 border border-gray-300 hover:border-black hover:text-black text-gray-600 transition-colors"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => handleDelete(sale.id, sale.title)}
                    disabled={deletingId === sale.id}
                    className="text-xs px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === sale.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
