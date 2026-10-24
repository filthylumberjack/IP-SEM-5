-- ============================================================================
-- ELECTRICITY BILL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Target Database: MySQL 8.0+
-- Database Name: electricity_billing
-- ============================================================================

CREATE DATABASE IF NOT EXISTS electricity_billing;
USE electricity_billing;

-- 1. Customers Table
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS meter_readings;
DROP TABLE IF EXISTS tariff_configurations;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consumer_number VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    connection_type VARCHAR(30) NOT NULL DEFAULT 'RESIDENTIAL', -- RESIDENTIAL, COMMERCIAL, INDUSTRIAL
    registration_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_consumer_no (consumer_number),
    INDEX idx_customer_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tariff Configurations Table (Configurable progressive slabs per connection type)
CREATE TABLE tariff_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    connection_type VARCHAR(30) NOT NULL UNIQUE, -- RESIDENTIAL, COMMERCIAL, INDUSTRIAL
    slab_1_limit DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    slab_1_rate DECIMAL(10, 2) NOT NULL DEFAULT 3.00,
    slab_2_limit DECIMAL(10, 2) NOT NULL DEFAULT 200.00,
    slab_2_rate DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    slab_3_rate DECIMAL(10, 2) NOT NULL DEFAULT 7.00,
    fixed_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    tax_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    subsidy_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    late_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Meter Readings Table
CREATE TABLE meter_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    billing_month INT NOT NULL, -- 1 to 12
    billing_year INT NOT NULL,  -- e.g. 2026
    reading_date DATE NOT NULL,
    previous_reading DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    current_reading DECIMAL(12, 2) NOT NULL,
    units_consumed DECIMAL(12, 2) NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meter_readings_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
    CONSTRAINT uq_customer_billing_period UNIQUE (customer_id, billing_month, billing_year),
    INDEX idx_reading_customer (customer_id),
    INDEX idx_reading_period (billing_month, billing_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bills Table
CREATE TABLE bills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    meter_reading_id BIGINT NOT NULL,
    billing_month INT NOT NULL,
    billing_year INT NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    units_consumed DECIMAL(12, 2) NOT NULL,
    energy_charges DECIMAL(12, 2) NOT NULL,
    fixed_charges DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    subsidy_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    late_fee DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PARTIALLY_PAID, PAID, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_bills_meter_reading FOREIGN KEY (meter_reading_id) REFERENCES meter_readings (id) ON DELETE RESTRICT,
    CONSTRAINT uq_bill_customer_period UNIQUE (customer_id, billing_month, billing_year),
    INDEX idx_bill_customer (customer_id),
    INDEX idx_bill_status (status),
    INDEX idx_bill_period (billing_month, billing_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Payments Table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_reference VARCHAR(60) NOT NULL UNIQUE,
    bill_id BIGINT NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- CASH, UPI, NET_BANKING, DEBIT_CARD, CREDIT_CARD
    payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS', -- SUCCESS, FAILED
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE RESTRICT,
    INDEX idx_payment_bill (bill_id),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
