import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="nav-inner container">
        <Link to="/" className="brand">
          <span className="brand-mark">◆</span> Lumen
        </Link>
        <nav className="nav-links">
          <Link to="/">Shop</Link>
          {user && <Link to="/orders">Orders</Link>}
          <Link to="/cart" className="cart-link">
            Cart
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          {user ? (
            <div className="nav-user">
              <span className="nav-hello">Hi, {user.fullName.split(' ')[0]}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  )
}
