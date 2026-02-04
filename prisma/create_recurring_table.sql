-- Create recurring_expenses table
CREATE TABLE IF NOT EXISTS `recurring_expenses` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `description` TEXT NULL,
  `frequency` VARCHAR(20) NOT NULL,
  `next_occurrence` DATE NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `recurring_expenses_user_id_fkey` (`user_id`),
  INDEX `recurring_expenses_category_id_fkey` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
