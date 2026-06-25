# Lumen — Full-Stack E-Commerce

A complete e-commerce application with a **Spring Boot** REST API and a **React** storefront.
Built to be cloned, run, and extended — H2 in-memory database means zero setup to get going,
and a one-line profile switch moves you to MySQL.

> Demo project intended for learning and portfolio use. No real payments are processed.

---

## Features

- Browse products, filter by category, and search
- JWT-based authentication (register / login)
- Per-user shopping cart (add, update quantity, remove)
- Checkout that creates an order and decrements stock
- Order history per user
- Role-based access (`ROLE_USER`, `ROLE_ADMIN`); admins can create/update/delete products
- Seeded demo catalog and demo accounts on first run
- Clean, responsive UI with a deliberate visual identity

## Tech stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Backend   | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security 6, JWT (jjwt) |
| Database  | H2 (default, in-memory) · MySQL (optional profile)                |
| Frontend  | React 18, React Router 6, Vite, Axios                             |
| Build     | Maven (wrapper included), npm                                     |

---

## Project structure

```
ecommerce-fullstack/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/com/example/ecommerce/
│   │   ├── config/          # Security config + data seeder
│   │   ├── controller/      # REST endpoints
│   │   ├── dto/             # Request/response records
│   │   ├── exception/       # Global error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   ├── security/        # JWT filter, token service, user details
│   │   └── service/         # Business logic
│   ├── src/main/resources/application.properties
│   └── mvnw / pom.xml       # Maven wrapper + build
└── frontend/                # React + Vite storefront
    ├── src/
    │   ├── api/             # Axios client (attaches JWT)
    │   ├── context/         # Auth + Cart context providers
    │   ├── components/      # Navbar, ProductCard, ProtectedRoute
    │   └── pages/           # Home, ProductDetail, Cart, Checkout, Orders, Login, Register
    └── vite.config.js       # Dev server + /api proxy to backend
```

---

## Getting started

### Prerequisites

- **Java 17+** (`java -version`)
- **Node.js 18+** and npm (`node -v`)
- No Maven install needed — the included wrapper (`./mvnw`) downloads it automatically.

### 1. Run the backend

```bash
cd backend
./mvnw spring-boot:run          # on Windows: mvnw.cmd spring-boot:run
```

The API starts at **http://localhost:8080**.
The H2 console is at **http://localhost:8080/h2-console** (JDBC URL `jdbc:h2:mem:ecommerce`, user `sa`, no password).

### 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The storefront opens at **http://localhost:5173**. The Vite dev server proxies `/api/*`
calls to the backend, so no CORS configuration is needed during development.

### Demo accounts (seeded automatically)

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | `admin@shop.test` | `admin123` |
| User  | `user@shop.test`  | `user123`  |

You can also click **"Use demo account"** on the login page.

---

## Switching to MySQL

The project ships with the MySQL driver and a ready profile.

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=mysql
```

Configure credentials via environment variables (defaults are `root`/`root`):

```bash
export DB_USER=myuser
export DB_PASSWORD=mypassword
```

The database `ecommerce` is created automatically if it doesn't exist.

---

## Configuration

Backend settings live in `backend/src/main/resources/application.properties` and can be
overridden with environment variables:

| Variable            | Default                       | Purpose                          |
|---------------------|-------------------------------|----------------------------------|
| `JWT_SECRET`        | a placeholder (change this!)  | HMAC signing key (≥ 32 chars)    |
| `JWT_EXPIRATION_MS` | `86400000` (24h)              | Token lifetime in milliseconds   |
| `DB_USER` / `DB_PASSWORD` | `root` / `root`         | MySQL credentials (mysql profile)|

The frontend reads `VITE_API_BASE` from a `.env` file (see `.env.example`). Leave it empty
to use the dev proxy.

---

## API reference

Base path: `/api`. Authenticated routes require an `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint          | Auth | Body                              |
|--------|-------------------|------|-----------------------------------|
| POST   | `/auth/register`  | —    | `{ fullName, email, password }`   |
| POST   | `/auth/login`     | —    | `{ email, password }`             |

Both return `{ token, tokenType, userId, fullName, email, roles }`.

### Products & categories

| Method | Endpoint              | Auth   | Notes                                        |
|--------|-----------------------|--------|----------------------------------------------|
| GET    | `/products`           | —      | Query params: `categoryId`, `search`, `page`, `size` |
| GET    | `/products/{id}`      | —      |                                              |
| POST   | `/products`           | Admin  | Create a product                             |
| PUT    | `/products/{id}`      | Admin  | Update a product                             |
| DELETE | `/products/{id}`      | Admin  | Delete a product                             |
| GET    | `/categories`         | —      |                                              |
| POST   | `/categories`         | Admin  | Create a category                            |

### Cart

| Method | Endpoint                | Auth | Body                       |
|--------|-------------------------|------|----------------------------|
| GET    | `/cart`                 | User |                            |
| POST   | `/cart/items`           | User | `{ productId, quantity }`  |
| PUT    | `/cart/items/{itemId}`  | User | `{ quantity }`             |
| DELETE | `/cart/items/{itemId}`  | User |                            |
| DELETE | `/cart`                 | User | Clear the cart             |

### Orders

| Method | Endpoint           | Auth | Body                    |
|--------|--------------------|------|-------------------------|
| POST   | `/orders/checkout` | User | `{ shippingAddress }`   |
| GET    | `/orders`          | User | Current user's orders   |
| GET    | `/orders/{id}`     | User | Owner or admin only     |

### Quick cURL example

```bash
# Log in and capture the token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@shop.test","password":"user123"}' | sed 's/.*"token":"\([^"]*\)".*/\1/')

# Add a product to the cart
curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

---

## Building for production

```bash
# Backend → runnable jar at backend/target/ecommerce-0.0.1-SNAPSHOT.jar
cd backend && ./mvnw clean package

# Frontend → static assets in frontend/dist/
cd frontend && npm run build
```

Serve `frontend/dist/` with any static host (or behind the Spring app) and point
`VITE_API_BASE` at your deployed API.

---

## Notes & ideas for extension

- Payments are simulated; integrate Stripe for a real flow.
- Add product images upload, reviews, wishlists, or an admin dashboard UI.
- Swap H2 for Postgres by adding the driver and a profile, mirroring the MySQL setup.
- Add integration tests under `backend/src/test`.

## License

MIT — see [LICENSE](LICENSE).
