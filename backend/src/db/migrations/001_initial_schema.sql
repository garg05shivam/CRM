
-- UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'SALES',
    'WAREHOUSE',
    'ACCOUNTS'
);

CREATE TYPE customer_type AS ENUM (
    'RETAIL',
    'WHOLESALE',
    'DISTRIBUTOR'
);

CREATE TYPE customer_status AS ENUM (
    'LEAD',
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE stock_movement_type AS ENUM (
    'IN',
    'OUT'
);

CREATE TYPE challan_status AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CANCELLED'
);


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'SALES',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    location TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT warehouses_name_unique UNIQUE (name)
);



CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_name VARCHAR(150) NOT NULL,

    mobile_number VARCHAR(20) NOT NULL,

    email VARCHAR(255),

    business_name VARCHAR(200) NOT NULL,

    gst_number VARCHAR(30),

    customer_type customer_type NOT NULL,

    address TEXT NOT NULL,

    status customer_status NOT NULL DEFAULT 'LEAD',

    follow_up_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_follow_ups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL,

    note TEXT NOT NULL,

    follow_up_date DATE NOT NULL,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_follow_up_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_follow_up_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
);


CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_name VARCHAR(200) NOT NULL,

    sku VARCHAR(100) NOT NULL UNIQUE,

    category VARCHAR(100) NOT NULL,

    unit_price NUMERIC(12, 2) NOT NULL,

    current_stock INTEGER NOT NULL DEFAULT 0,

    minimum_stock_quantity INTEGER NOT NULL DEFAULT 0,

    warehouse_id UUID NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON DELETE RESTRICT,

    CONSTRAINT products_unit_price_positive
        CHECK (unit_price >= 0),

    CONSTRAINT products_stock_non_negative
        CHECK (current_stock >= 0),

    CONSTRAINT products_minimum_stock_non_negative
        CHECK (minimum_stock_quantity >= 0)
);


CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL,

    quantity INTEGER NOT NULL,

    movement_type stock_movement_type NOT NULL,

    reason VARCHAR(255) NOT NULL,

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_stock_movement_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_stock_movement_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT stock_movement_quantity_positive
        CHECK (quantity > 0)
);


CREATE TABLE sales_challans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challan_number VARCHAR(50) NOT NULL UNIQUE,

    customer_id UUID NOT NULL,

    total_quantity INTEGER NOT NULL DEFAULT 0,

    status challan_status NOT NULL DEFAULT 'DRAFT',

    created_by UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_challan_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_challan_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT challan_total_quantity_non_negative
        CHECK (total_quantity >= 0)
);


CREATE TABLE sales_challan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    challan_id UUID NOT NULL,

    product_id UUID NOT NULL,

    product_name_snapshot VARCHAR(200) NOT NULL,

    sku_snapshot VARCHAR(100) NOT NULL,

    unit_price_snapshot NUMERIC(12, 2) NOT NULL,

    quantity INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_challan_item_challan
        FOREIGN KEY (challan_id)
        REFERENCES sales_challans(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_challan_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT,

    CONSTRAINT challan_item_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT challan_item_unit_price_non_negative
        CHECK (unit_price_snapshot >= 0)
);



CREATE INDEX idx_customers_name
    ON customers(customer_name);

CREATE INDEX idx_customers_mobile
    ON customers(mobile_number);

CREATE INDEX idx_customers_status
    ON customers(status);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_products_warehouse
    ON products(warehouse_id);

CREATE INDEX idx_stock_movements_product
    ON stock_movements(product_id);

CREATE INDEX idx_stock_movements_created_at
    ON stock_movements(created_at);

CREATE INDEX idx_challans_customer
    ON sales_challans(customer_id);

CREATE INDEX idx_challans_status
    ON sales_challans(status);

CREATE INDEX idx_challan_items_challan
    ON sales_challan_items(challan_id);
