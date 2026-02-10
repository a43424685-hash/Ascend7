'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CartStorageItem } from '@/shared/types/cart'

const CART_STORAGE_KEY = 'ascend7_cart'

/**
 * localStorage 기반 장바구니 저장소 관리
 * 최소한의 정보만 저장: variant_id, quantity
 */
export function useCartStorage() {
  const [cartItems, setCartItems] = useState<CartStorageItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // localStorage에서 로드
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // 유효성 검증
        if (Array.isArray(parsed)) {
          setCartItems(
            parsed.filter(
              (item) =>
                item.variant_id &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
            )
          )
        }
      } catch {
        setCartItems([])
      }
    }
    setIsLoaded(true)
  }, [])

  // localStorage에 저장
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 localStorage 저장:', cartItems)
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  const addItem = useCallback((variantId: string, quantity: number = 1) => {
    console.log('🛒 addItem 호출:', { variantId, quantity })
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variant_id === variantId)
      const newCart = existing
        ? prev.map((item) =>
            item.variant_id === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { variant_id: variantId, quantity }]
      
      console.log('🛒 장바구니 업데이트:', { prev, newCart })
      return newCart
    })
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) =>
        prev.filter((item) => item.variant_id !== variantId)
      )
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.variant_id === variantId ? { ...item, quantity } : item
      )
    )
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.variant_id !== variantId)
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    cartItems,
    itemCount,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
}

