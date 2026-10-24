-- ============================================================================
-- ELECTRICITY BILL MANAGEMENT SYSTEM - SAMPLE DATA
-- ============================================================================

USE electricity_billing;

-- Disable foreign key checks for clean reload
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE bills;
TRUNCATE TABLE meter_readings;
TRUNCATE TABLE tariff_configurations;
TRUNCATE TABLE customers;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Configurable Progressive Tariffs (Sample Educational Tariffs)
INSERT INTO tariff_configurations 
(id, connection_type, slab_1_limit, slab_1_rate, slab_2_limit, slab_2_rate, slab_3_rate, fixed_charge, tax_percentage, subsidy_amount, late_fee_percentage, is_active)
VALUES 
(1, 'RESIDENTIAL', 100.00, 3.00, 200.00, 5.00, 7.00, 50.00, 5.00, 0.00, 2.00, TRUE),
(2, 'COMMERCIAL',  100.00, 5.00, 200.00, 8.00, 11.00, 120.00, 12.00, 0.00, 3.00, TRUE),
(3, 'INDUSTRIAL',  200.00, 6.50, 500.00, 9.50, 13.00, 300.00, 18.00, 0.00, 5.00, TRUE);

-- 2. Insert Sample Customers
INSERT INTO customers 
(id, consumer_number, full_name, email, phone_number, address, connection_type, registration_date, status)
VALUES 
(1, 'CON-1001', 'Rahul Sharma', 'rahul.sharma@example.com', '9876543210', 'Flat 402, Greenfield Apartments, Sector 14, Noida, UP', 'RESIDENTIAL', '2026-01-10', 'ACTIVE'),
(2, 'CON-1002', 'Priya Patel', 'priya.patel@example.com', '9812345678', 'Plot 15, Vasant Vihar, New Delhi', 'RESIDENTIAL', '2026-01-15', 'ACTIVE'),
(3, 'CON-1003', 'Apex Retail Store (Amit Verma)', 'store.apex@example.com', '9723456789', 'Shop 12, City Center Mall, MG Road, Bengaluru, KA', 'COMMERCIAL', '2026-02-01', 'ACTIVE'),
(4, 'CON-1004', 'Vikram Singh', 'vikram.singh@example.com', '9654321098', 'B-24, Model Town, Jaipur, RJ', 'RESIDENTIAL', '2026-02-10', 'ACTIVE'),
(5, 'CON-1005', 'Precision Auto Works (Sunil Rao)', 'contact@precisionauto.example.com', '9543210987', 'Industrial Area Phase 2, Pune, MH', 'INDUSTRIAL', '2026-02-15', 'ACTIVE'),
(6, 'CON-1006', 'Neha Gupta', 'neha.gupta@example.com', '9432109876', 'House 56, Civil Lines, Chandigarh', 'RESIDENTIAL', '2026-03-01', 'INACTIVE');

-- 3. Insert Meter Readings
-- Reading 1: CON-1001 for Sept 2026 (250 units consumed -> 1000 to 1250)
INSERT INTO meter_readings 
(id, customer_id, billing_month, billing_year, reading_date, previous_reading, current_reading, units_consumed, remarks)
VALUES 
(1, 1, 9, 2026, '2026-09-30', 1000.00, 1250.00, 250.00, 'Regular monthly reading'),
(2, 2, 9, 2026, '2026-09-30', 500.00, 680.00, 180.00, 'Regular monthly reading'),
(3, 3, 9, 2026, '2026-09-30', 2100.00, 2450.00, 350.00, 'Commercial meter cycle'),
(4, 4, 9, 2026, '2026-09-30', 800.00, 890.00, 90.00, 'Low consumption cycle'),
(5, 1, 10, 2026, '2026-10-20', 1250.00, 1470.00, 220.00, 'October reading');

-- 4. Insert Bills
-- Calculation for Bill 1 (Customer 1, 250 units residential):
-- Energy charge: (100*3) + (100*5) + (50*7) = 300 + 500 + 350 = 1150.00
-- Fixed charges: 50.00
-- Subtotal: 1200.00
-- Tax (5% of 1200): 60.00
-- Total: 1260.00
-- Payment: Fully paid (1260.00)
INSERT INTO bills 
(id, bill_number, customer_id, meter_reading_id, billing_month, billing_year, bill_date, due_date, units_consumed, energy_charges, fixed_charges, tax_amount, subsidy_amount, late_fee, total_amount, paid_amount, outstanding_balance, status)
VALUES 
(1, 'BILL-202609-0001', 1, 1, 9, 2026, '2026-10-01', '2026-10-15', 250.00, 1150.00, 50.00, 60.00, 0.00, 0.00, 1260.00, 1260.00, 0.00, 'PAID');

-- Calculation for Bill 2 (Customer 2, 180 units residential):
-- Energy charge: (100*3) + (80*5) = 300 + 400 = 700.00
-- Fixed charges: 50.00
-- Subtotal: 750.00
-- Tax (5% of 750): 37.50
-- Total: 787.50
-- Paid: 400.00, Outstanding: 387.50 -> PARTIALLY_PAID
INSERT INTO bills 
(id, bill_number, customer_id, meter_reading_id, billing_month, billing_year, bill_date, due_date, units_consumed, energy_charges, fixed_charges, tax_amount, subsidy_amount, late_fee, total_amount, paid_amount, outstanding_balance, status)
VALUES 
(2, 'BILL-202609-0002', 2, 2, 9, 2026, '2026-10-01', '2026-10-15', 180.00, 700.00, 50.00, 37.50, 0.00, 0.00, 787.50, 400.00, 387.50, 'PARTIALLY_PAID');

-- Calculation for Bill 3 (Customer 3, 350 units commercial):
-- Energy charge: (100*5) + (100*8) + (150*11) = 500 + 800 + 1650 = 2950.00
-- Fixed charges: 120.00
-- Subtotal: 3070.00
-- Tax (12% of 3070): 368.40
-- Total: 3438.40
-- Status: PENDING, Paid: 0.00
INSERT INTO bills 
(id, bill_number, customer_id, meter_reading_id, billing_month, billing_year, bill_date, due_date, units_consumed, energy_charges, fixed_charges, tax_amount, subsidy_amount, late_fee, total_amount, paid_amount, outstanding_balance, status)
VALUES 
(3, 'BILL-202609-0003', 3, 3, 9, 2026, '2026-10-01', '2026-10-15', 350.00, 2950.00, 120.00, 368.40, 0.00, 0.00, 3438.40, 0.00, 3438.40, 'PENDING');

-- Calculation for Bill 4 (Customer 4, 90 units residential):
-- Energy charge: 90 * 3 = 270.00
-- Fixed charges: 50.00
-- Subtotal: 320.00
-- Tax (5% of 320): 16.00
-- Total: 336.00
-- Past due date -> OVERDUE, Paid: 0.00
INSERT INTO bills 
(id, bill_number, customer_id, meter_reading_id, billing_month, billing_year, bill_date, due_date, units_consumed, energy_charges, fixed_charges, tax_amount, subsidy_amount, late_fee, total_amount, paid_amount, outstanding_balance, status)
VALUES 
(4, 'BILL-202609-0004', 4, 4, 9, 2026, '2026-09-01', '2026-09-15', 90.00, 270.00, 50.00, 16.00, 0.00, 15.00, 351.00, 0.00, 351.00, 'OVERDUE');

-- 5. Insert Payments
INSERT INTO payments 
(id, transaction_reference, bill_id, amount_paid, payment_date, payment_method, payment_status, remarks)
VALUES 
(1, 'TXN-20261005-001', 1, 1260.00, '2026-10-05', 'UPI', 'SUCCESS', 'Full payment via GPay UPI'),
(2, 'TXN-20261008-002', 2, 400.00, '2026-10-08', 'NET_BANKING', 'SUCCESS', 'First installment via HDFC NetBanking');
