USE `ip_std6730202122`;
CREATE TABLE IF NOT EXISTS `employees` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `name` VARCHAR(100) NOT NULL,
 `position` VARCHAR(100) NOT NULL,
 `status` ENUM('Active','On Leave') NOT NULL DEFAULT 'Active',
 `salary` DECIMAL(12,2) UNSIGNED NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO employees (name,position,status,salary)
SELECT 'Chakhin Pinyo','Software Engineer','Active',45000.00
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE name='Chakhin Pinyo');
