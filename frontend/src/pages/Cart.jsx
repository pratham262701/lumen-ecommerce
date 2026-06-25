import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const money = (n) => `$${Number(n).toFixed(2)}`

export default function Cart() {
  const { cart, updateItem, removeItem, loading } = useCart()
  const navigate = useNavigate()

  if (loading) return <div className="empty">Loading your cart…</div>

  if (!cart.items.length) {
    return (
      <div className="empty">
        <p>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary">Browse the shop</Link>
      </div>
    )
  }

  return (
    <div className="cart">
      <h1>Your cart</h1>
      <ul className="cart-list">
        {cart.items.map((item) => (
          <li key={item.id} className="cart-row">
            <img src={item.imageUrl} alt={item.productName} className="cart-thumb" />
            <div className="cart-meta">
              <span className="cart-name">{item.productName}</span>
              <span className="cart-unit">{money(item.unitPrice)} each</span>
            </div>
            <div className="cart-qty">
              <button onClick={() => updateItem(item.id, item.quantity - 1)} aria-label="Decrease">−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateItem(item.id, item.quantity + 1)} aria-label="Increase">+</button>
            </div>
            <span className="cart-line">{money(item.lineTotal)}</span>
            <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label="Remove">✕</button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <strong>{money(cart.total)}</strong>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
          Proceed to checkout
        </button>
      </div>
    </div>
  )
}
