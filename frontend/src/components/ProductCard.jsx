import { Link } from 'react-router-dom'

const money = (n) => `$${Number(n).toFixed(2)}`

export default function ProductCard({ product, onAdd }) {
  const out = product.stock <= 0
  return (
    <article className="card">
      <Link to={`/products/${product.id}`} className="card-media">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {out && <span className="badge-out">Sold out</span>}
      </Link>
      <div className="card-body">
        {product.categoryName && <span className="eyebrow">{product.categoryName}</span>}
        <h3 className="card-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="card-foot">
          <span className="price">{money(product.price)}</span>
          <button
            className="btn btn-primary btn-sm"
            disabled={out}
            onClick={() => onAdd(product)}
          >
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
