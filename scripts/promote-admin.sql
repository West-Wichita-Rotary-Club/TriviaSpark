-- Quick script to promote user 'mark' to admin role
-- Run this against the SQLite database to bootstrap admin access

-- First, get the Admin role ID
-- UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1) WHERE username = 'mark';

-- Or to see all users and their current roles:
-- SELECT u.username, u.email, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id;

-- To manually promote any user to admin:
UPDATE users SET role_id = (SELECT id
FROM roles
WHERE name = 'Admin' LIMIT 1
) WHERE username = 'mark';
