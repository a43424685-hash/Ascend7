'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProduct } from '@/entities/product/api/delete-product'

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('이 상품을 삭제하시겠습니까?\n관련된 옵션, 이미지가 모두 삭제됩니다.')) return
    setLoading(true)
    try {
      const result = await deleteProduct(productId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || '삭제에 실패했습니다.')
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? '...' : '삭제'}
    </button>
  )
}
