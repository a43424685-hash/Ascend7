'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { CartStorageItem } from '@/shared/types/cart'

const CART_STORAGE_KEY = 'ascend7_cart'

type CartContextType = {
  cartItems: CartStorageItem[]
  itemCount: number
  isLoaded: boolean
  addItem: (variantId: string, quantity?: number) => void
  updateQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartStorageItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // localStorage에서 로드
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
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
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }
  }, [cartItems, isLoaded])

  const addItem = useCallback((variantId: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.variant_id === variantId)
      return existing
        ? prev.map((item) =>
            item.variant_id === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { variant_id: variantId, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.variant_id !== variantId))
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.variant_id === variantId ? { ...item, quantity } : item
      )
    )
  }, [])

  const removeItem = useCallback((variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.variant_id !== variantId))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        isLoaded,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
