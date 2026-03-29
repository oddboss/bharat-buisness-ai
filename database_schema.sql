-- LIVE ERP DATABASE SCHEMA
-- This schema supports real-time data ingestion across all modules.

-- 1. INVENTORY MODULE
CREATE TABLE inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    current_stock INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    unit_price DECIMAL(12, 2),
    supplier_name VARCHAR(255),
    warehouse_location VARCHAR(100),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SALES & CRM MODULE
CREATE TABLE sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, shipped, paid, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sales_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES inventory_products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(15, 2)
);

-- 3. ACCOUNTING MODULE (Tally-style)
CREATE TABLE accounting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
    parent_id UUID REFERENCES accounting_accounts(id),
    current_balance DECIMAL(15, 2) DEFAULT 0
);

CREATE TABLE accounting_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE DEFAULT CURRENT_DATE,
    description TEXT,
    reference_type VARCHAR(50), -- Invoice, Receipt, Payment, Journal
    reference_id UUID, -- Links to sales_orders, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE accounting_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES accounting_transactions(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounting_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    entry_date DATE DEFAULT CURRENT_DATE
);

-- 4. EMPLOYEES MODULE
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(15, 2),
    status VARCHAR(20) DEFAULT 'active'
);

-- 5. AI FORECASTING METADATA
CREATE TABLE ai_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_module VARCHAR(50), -- sales, inventory
    forecast_date DATE,
    predicted_value DECIMAL(15, 2),
    confidence_score DECIMAL(5, 2),
    model_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
