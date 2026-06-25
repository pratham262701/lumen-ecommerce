import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [], total: 0 })
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/api/cart')
      setCart(data)
    } catch {
      setCart({ items: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await api.post('/api/cart/items', { productId, quantity })
    setCart(data)
  }, [])

  const updateItem = useCallback(async (itemId, quantity) => {
    const { data } = await api.put(`/api/cart/items/${itemId}`, { quantity })
    setCart(data)
  }, [])

  const removeItem = useCallback(async (itemId) => {
    const { data } = await api.delete(`/api/cart/items/${itemId}`)
    setCart(data)
  }, [])

  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, count, loading, refresh, addToCart, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
