-- Add risk_tolerance column to users table
ALTER TABLE users ADD COLUMN risk_tolerance VARCHAR(20) DEFAULT 'moderate' NOT NULL AFTER phone;

-- Create investment_portfolio table
CREATE TABLE investment_portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    investment_type VARCHAR(50) NOT NULL COMMENT 'stocks, bonds, mutual_funds, real_estate, crypto, fixed_deposit, gold',
    name VARCHAR(100) NOT NULL,
    units DECIMAL(12, 4) NOT NULL,
    buy_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) NOT NULL,
    total_invested DECIMAL(12, 2) NOT NULL,
    current_value DECIMAL(12, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX investment_portfolio_user_id_fkey (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create investment_transactions table
CREATE TABLE investment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    portfolio_id INT NOT NULL,
    type VARCHAR(10) NOT NULL COMMENT 'buy, sell',
    units DECIMAL(12, 4) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES investment_portfolio(id) ON DELETE CASCADE,
    INDEX investment_transactions_user_id_fkey (user_id),
    INDEX investment_transactions_portfolio_id_fkey (portfolio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
