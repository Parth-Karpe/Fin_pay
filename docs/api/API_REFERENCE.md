# FinPay REST API Specification

The FinPay API provides RESTful endpoints documented via OpenAPI 3.0 / Swagger UI at `/docs`.

## Base URL
`/api/v1`

---

## 1. Authentication
- `POST /auth/register`
  - Body: `{ "email": "student@finpay.edu", "password": "...", "full_name": "..." }`
  - Response (201): `{ "access_token": "...", "token_type": "bearer", "user_id": 1, "student_id": 1, ... }`
  - Note: Atomically creates `USERS`, `STUDENTS`, and `WALLETS` records in one transaction.
- `POST /auth/login`
  - Body: `{ "email": "student@finpay.edu", "password": "..." }`
  - Response (200): Returns signed JWT access token.

---

## 2. Student Profile
- `GET /students/me` (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response (200): `{ "student_id": 1, "email": "...", "full_name": "...", "wallet_id": 1, "balance": "500.00", ... }`

---

## 3. Wallet Management
- `GET /wallet` (Protected)
  - Headers: `Authorization: Bearer <token>`
  - Response (200): `{ "wallet_id": 1, "student_id": 1, "balance": "500.00", "updated_at": "..." }`
- `POST /wallet/topup` (Protected)
  - Body: `{ "amount": 50.00 }`
  - Response (200): Returns updated wallet object with new balance.

---

## 4. Merchants & Categories
- `GET /merchant-categories`
  - Response (200): `[ { "category_id": 1, "name": "Campus Canteen & Dining" }, ... ]`
- `GET /merchants`
  - Query Param: `?category_id=1` (Optional)
  - Response (200): `[ { "merchant_id": 1, "name": "Central Cafeteria", "category_id": 1, "category_name": "Campus Canteen & Dining" }, ... ]`
- `GET /merchants/{merchant_id}`
  - Response (200): Returns merchant details.

---

## 5. Payments (makePayment)
- `POST /payments` (Protected)
  - Body: `{ "merchant_id": 1, "amount": 25.50 }`
  - Response (201): `{ "payment_id": 101, "wallet_id": 1, "merchant_id": 1, "merchant_name": "...", "amount": "25.50", "paid_at": "...", "cashback": null }`
  - Behavior:
    - Atomically debits student wallet and inserts payment record.
    - Locks wallet row during execution to prevent concurrent race conditions.
    - Rolls back on failure.
- `GET /payments` (Protected)
  - Response (200): Returns payment history strictly for the authenticated student.
- `GET /payments/{payment_id}` (Protected)
  - Response (200): Returns specific payment detail with ownership verification.

---

## 6. Cashback
- `GET /cashback` (Protected)
  - Response (200): Returns actual cashback records associated with student payments.

---

## 7. Monthly Reconciliation
- `GET /reconciliation/runs` (Protected)
  - Response (200): Returns list of monthly reconciliation executions.
- `POST /reconciliation/runs` (Protected)
  - Body: `{ "month": "2026-11", "status": "COMPLETED", "notes": "..." }`
  - Response (201): Records monthly run. Enforces unique constraint on `month` (YYYY-MM).
