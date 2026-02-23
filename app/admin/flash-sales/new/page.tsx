'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProductsForSelect } from '@/entities/product/api/get-products-for-select'
import { formatPrice } from '@/shared/lib/utils'

export default function NewFlashSalePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  const [title, setTitle] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [endAt, setEndAt] = useState('')
  const [maxQuantity, setMaxQuantity] = useState('')

  useEffect(() => {
    getProductsForSelect().then(data => {
      setProducts(data)
      setLoadingProducts(false)
    })
  }, [])

  const colors = selectedProduct
    ? [...new Set(selectedProduct.variants.map((v: any) => v.color).filter(Boolean))].sort() as string[]
    : []

  const sizes = selectedProduct
    ? [...new Set(
        selectedProduct.variants
          .filter((v: any) => !selectedColor || v.color === selectedColor)
          .map((v: any) => v.size)
          .filter(Boolean)
      )].sort() as string[]
    : []

  useEffect(() => {
    if (!selectedProduct) { setSelectedVariant(null); return }
    const variant = selectedProduct.variants.find((v: any) => {
      const colorMatch = !selectedColor || v.color === selectedColor
      const sizeMatch = !selectedSize || v.size === selectedSize
      return colorMatch && sizeMatch
    }) ?? null
    setSelectedVariant(variant)
    if (variant) setSalePrice(String(variant.price))
  }, [selectedProduct, selectedColor, selectedSize])

  const handleProductChange = (slug: string) => {
    const product = products.find(p => p.slug === slug) ?? null
    setSelectedProduct(product)
    setSelectedColor('')
    setSelectedSize('')
    setSelectedVariant(null)
    setSalePrice('')
    if (product) setTitle(product.name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    setLoading(true)

    try {
      const res = await fetch('/api/admin/flash-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          product_slug: selectedProduct.slug,
          variant_sku: selectedVariant?.sku ?? null,
          sale_price: parseInt(salePrice),
          original_price: selectedVariant?.price ?? parseInt(salePrice),
          end_at: endAt,
          max_quantity: maxQuantity ? parseInt(maxQuantity) : null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || '저장 실패')
        return
      }

      router.push('/admin/flash-sales')
      router.refresh()
    } catch {
      alert('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/flash-sales" className="text-sm text-gray-500 hover:text-black">← 목록</Link>
        <h1 className="text-xl font-bold">플래시 세일 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 상품 선택 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">상품 선택 *</label>
          <select
            value={selectedProduct?.slug ?? ''}
            onChange={e => handleProductChange(e.target.value)}
            required
            disabled={loadingProducts}
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black bg-white"
          >
            <option value="">{loadingProducts ? '불러오는 중...' : '상품을 선택하세요'}</option>
            {products.map(p => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 색상 선택 */}
        {selectedProduct && colors.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">색상</label>
            <select
              value={selectedColor}
              onChange={e => { setSelectedColor(e.target.value); setSelectedSize('') }}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black bg-white"
            >
              <option value="">전체 색상</option>
              {colors.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* 사이즈 선택 */}
        {selectedProduct && sizes.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">사이즈</label>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black bg-white"
            >
              <option value="">전체 사이즈</option>
              {sizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* 선택된 variant 정보 */}
        {selectedVariant && (
          <div className="bg-gray-50 border border-gray-200 rounded-sm px-4 py-3 text-xs space-y-1">
            <p className="font-medium text-gray-800">선택된 옵션 정보</p>
            <p className="text-gray-500">SKU: <span className="text-gray-800 font-mono">{selectedVariant.sku}</span></p>
            <p className="text-gray-500">원가: <span className="text-gray-800">{formatPrice(selectedVariant.price)}</span></p>
            <p className="text-gray-500">재고: <span className={selectedVariant.stock <= 0 ? 'text-red-600 font-bold' : 'text-gray-800'}>{selectedVariant.stock}개</span></p>
          </div>
        )}

        {/* 세일 제목 */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">세일 제목 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="예: 오늘만 특가! 후드집업 40% 할인"
            className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </div>

        {/* 가격 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              원가 (원){selectedVariant && <span className="text-gray-400 ml-1">· 자동입력</span>}
            </label>
            <input
              type="number"
              value={selectedVariant?.price ?? ''}
              readOnly
              placeholder="89000"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">세일 가격 (원) *</label>
            <input
              type="number"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              required
              placeholder="53400"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 할인율 미리보기 */}
        {selectedVariant && salePrice && parseInt(salePrice) < selectedVariant.price && (
          <p className="text-xs text-red-600 font-medium">
            ⚡ 할인율: {Math.round((1 - parseInt(salePrice) / selectedVariant.price) * 100)}% OFF
          </p>
        )}

        {/* 종료 시간 / 최대 수량 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">종료 일시 *</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={e => setEndAt(e.target.value)}
              required
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">최대 수량 (빈칸=무제한)</label>
            <input
              type="number"
              value={maxQuantity}
              onChange={e => setMaxQuantity(e.target.value)}
              placeholder="100"
              className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedProduct}
          className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? '저장 중...' : '플래시 세일 추가'}
        </button>
      </form>
    </div>
  )
}
