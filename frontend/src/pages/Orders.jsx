import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import api from '../api/client'

const money = (n) => `$${Number(n).toFixed(2)}`
const fmtDate = (iso) => new Date(iso).toLocaleString()

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const justOrdered = location.state?.justOrdered

  useEffect(() => {
    api.get('/api/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="empty">Loading your orders…</div>

  if (!orders.length) {
    return (
      <div className="empty">
        <p>You haven't placed any orders yet.</p>
        <Link to="/" className="btn btn-primary">Start shopping</Link>
      </div>
    )
  }

  return (
    <div className="orders">
      <h1>Your orders</h1>
      {justOrdered && <div className="banner-success">Order #{justOrdered} placed. Thank you!</div>}
      {orders.map((o) => (
        <article key={o.id} className={`order ${o.id === justOrdered ? 'order-new' : ''}`}>
          <header className="order-head">
            <div>
              <strong>Order #{o.id}</strong>
              <span className="muted"> · {fmtDate(o.createdAt)}</span>
            </div>
            <span className={`status status-${o.status.toLowerCase()}`}>{o.status}</span>
          </header>
          <ul className="order-items">
            {o.items.map((it, idx) => (
              <li key={idx}>
                <span>{it.quantity} × {it.productName}</span>
                <span>{money(it.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <footer className="order-foot">
            <span>Shipping to: {o.shippingAddress}</span>
            <strong>{money(o.total)}</strong>
          </footer>
        </article>
      ))}
    </div>
  )
}
