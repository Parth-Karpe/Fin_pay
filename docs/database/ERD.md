# FinPay Database Design & Entity Relationship Specification

## 1. Relational Entities (3NF Normalized)

As specified in the approved Lab 4 Detailed Design (`FinPay_Lab4_Detailed_Design_Filled(1).docx`), FinPay uses one relational database as the single source of truth across eight normalized entities.

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "1 : 0..1"
    STUDENTS ||--|| WALLETS : "1 : 1"
    WALLETS ||--o{ PAYMENTS : "1 : N"
    MERCHANT_CATEGORIES ||--o{ MERCHANTS : "1 : N"
    MERCHANTS ||--o{ PAYMENTS : "1 : N"
    PAYMENTS ||--o| CASHBACK : "1 : 0..1"
    RECONCILIATION_RUNS {
        int run_id PK
        string month UK
        datetime run_at
        string status
        text notes
    }

    USERS {
        int user_id PK
        string email UK
        string password_hash
        boolean is_active
        datetime created_at
    }

    STUDENTS {
        int student_id PK
        int user_id FK,UK
        string full_name
        datetime created_at
    }

    WALLETS {
        int wallet_id PK
        int student_id FK,UK
        numeric balance
        datetime updated_at
    }

    MERCHANT_CATEGORIES {
        int category_id PK
        string name UK
    }

    MERCHANTS {
        int merchant_id PK
        int category_id FK
        string name
    }

    PAYMENTS {
        int payment_id PK
        int wallet_id FK
        int merchant_id FK
        numeric amount
        datetime paid_at
    }

    CASHBACK {
        int cashback_id PK
        int payment_id FK,UK
        numeric amount
        datetime created_at
    }
```

## 2. Table Definitions & Constraints

### 2.1 USERS
- `user_id`: Primary Key (Autoincrement).
- `email`: VARCHAR(255) UNIQUE NOT NULL (Index).
- `password_hash`: VARCHAR(255) NOT NULL (Never exposed via API).
- `is_active`: BOOLEAN DEFAULT TRUE NOT NULL.
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().

### 2.2 STUDENTS
- `student_id`: Primary Key (Autoincrement).
- `user_id`: Foreign Key referencing `users.user_id` UNIQUE NOT NULL (1:0..1).
- `full_name`: VARCHAR(255) NOT NULL.
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().

### 2.3 WALLETS
- `wallet_id`: Primary Key (Autoincrement).
- `student_id`: Foreign Key referencing `students.student_id` UNIQUE NOT NULL (1:1).
- `balance`: NUMERIC(12, 2) NOT NULL DEFAULT 0.00.
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().

### 2.4 MERCHANT_CATEGORIES
- `category_id`: Primary Key (Autoincrement).
- `name`: VARCHAR(100) UNIQUE NOT NULL.

### 2.5 MERCHANTS
- `merchant_id`: Primary Key (Autoincrement).
- `category_id`: Foreign Key referencing `merchant_categories.category_id` NOT NULL.
- `name`: VARCHAR(255) NOT NULL.

### 2.6 PAYMENTS
- `payment_id`: Primary Key (Autoincrement).
- `wallet_id`: Foreign Key referencing `wallets.wallet_id` NOT NULL.
- `merchant_id`: Foreign Key referencing `merchants.merchant_id` NOT NULL.
- `amount`: NUMERIC(12, 2) NOT NULL (`CHECK (amount > 0)`).
- `paid_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().

### 2.7 CASHBACK
- `cashback_id`: Primary Key (Autoincrement).
- `payment_id`: Foreign Key referencing `payments.payment_id` UNIQUE NOT NULL (1:0..1).
- `amount`: NUMERIC(12, 2) NOT NULL (`CHECK (amount >= 0)`).
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().

### 2.8 RECONCILIATION_RUNS
- `run_id`: Primary Key (Autoincrement).
- `month`: VARCHAR(7) UNIQUE NOT NULL (Format: `YYYY-MM`).
- `run_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW().
- `status`: VARCHAR(50) NOT NULL.
- `notes`: TEXT NULL.
