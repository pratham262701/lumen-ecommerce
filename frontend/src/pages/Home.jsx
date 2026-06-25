import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCat, setActiveCat] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    const params = {}
    if (activeCat) params.categoryId = activeCat
    if (search.trim()) params.search = search.trim()
    const { data } = await api.get('/api/products', { params })
    setProducts(data.content || [])
    setLoading(false)
  }, [activeCat, search])

  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 250) // debounce search
    return () => clearTimeout(t)
  }, [load])

  const handleAdd = async (product) => {
    if (!user) { navigate('/login'); return }
    await addToCart(product.id, 1)
    setToast(`Added "${product.name}" to your cart`)
    setTimeout(() => setToast(''), 2200)
  }

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">New season · free shipping over $75</p>
        <h1 className="hero-title">Things worth keeping on your desk.</h1>
        <p className="hero-sub">A small, curated catalog of electronics, books, and home goods.</p>
        <div className="search">
          <input
            type="search"
            placeholder="Search the catalog…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
      </section>

      <div className="filters">
        <button className={`chip ${!activeCat ? 'chip-on' : ''}`} onClick={() => setActiveCat(null)}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${activeCat === c.id ? 'chip-on' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="empty">No products match your search.</div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={handleAdd} />
          ))}
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
