import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'

const money = (n) => `$${Number(n).toFixed(2)}`

export default function Checkout() {
  const { cart, refresh } = useCart()
  const [address, setAddress] = useState('')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const placeOrder = async () => {
    if (!address.trim()) { setError('Please enter a shipping address.'); return }
    setPlacing(true); setError('')
    try {
      const { data } = await api.post('/api/orders/checkout', { shippingAddress: address })
      await refresh()
      navigate('/orders', { state: { justOrdered: data.id } })
    } catch (e) {
      setError(e.response?.data?.message || 'Could not place the order.')
    } finally {
      setPlacing(false)
    }
  }

  if (!cart.items.length) {
    return <div className="empty">Your cart is empty — nothing to check out.</div>
  }

  return (
    <div className="checkout">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <section className="panel">
          <h2>Shipping address</h2>
          <textarea
            rows="4"
            placeholder="Name, street, city, postal code"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={placing} onClick={placeOrder}>
            {placing ? 'Placing order…' : `Pay ${money(cart.total)}`}
          </button>
          <p className="muted">This is a demo — no real payment is processed.</p>
        </section>
        <aside className="panel order-recap">
          <h2>Order summary</h2>
          <ul>
            {cart.items.map((i) => (
              <li key={i.id}>
                <span>{i.quantity} × {i.productName}</span>
                <span>{money(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Total</span><strong>{money(cart.total)}</strong>
          </div>
        </aside>
      </div>
    </div>
  )
}
