import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const money = (n) => `$${Number(n).toFixed(2)}`

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setError('Product not found.'))
  }, [id])

  if (error) return <div className="empty">{error} <Link to="/">Back to shop</Link></div>
  if (!product) return <div className="empty">Loading…</div>

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return }
    await addToCart(product.id, qty)
    navigate('/cart')
  }

  return (
    <div className="detail">
      <div className="detail-media">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="detail-info">
        {product.categoryName && <span className="eyebrow">{product.categoryName}</span>}
        <h1>{product.name}</h1>
        <p className="detail-price">{money(product.price)}</p>
        <p className="detail-desc">{product.description}</p>
        <p className={product.stock > 0 ? 'stock-ok' : 'stock-out'}>
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>
        <div className="detail-actions">
          <label className="qty">
            Qty
            <input
              type="number" min="1" max={product.stock} value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
          </label>
          <button className="btn btn-primary" disabled={product.stock <= 0} onClick={handleAdd}>
            Add to cart
          </button>
        </div>
        <Link to="/" className="back-link">← Continue shopping</Link>
      </div>
    </div>
  )
}
