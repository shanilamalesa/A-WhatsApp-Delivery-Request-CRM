-- Clear existing data (order matters because of foreign keys)
TRUNCATE conversations, messages, rides, riders, users, customers RESTART IDENTITY CASCADE;

-- Admin and dispatchers (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, role) VALUES
('admin@jetlink.com', '$2b$12$fc1ynM7x6BKllXMxJoY6RuAcluGt255RtiYwdyIq8NbnkK.b9gwkG', 'admin'),
('dispatcher1@jetlink.com', '$2b$12$fc1ynM7x6BKllXMxJoY6RuAcluGt255RtiYwdyIq8NbnkK.b9gwkG', 'dispatcher'),
('dispatcher2@jetlink.com', '$2b$12$fc1ynM7x6BKllXMxJoY6RuAcluGt255RtiYwdyIq8NbnkK.b9gwkG', 'dispatcher');

-- Riders (2 online, 2 offline)
INSERT INTO riders (name, phone, status) VALUES
('Peter Kamau', '+254712000001', 'online'),
('James Otieno', '+254712000002', 'online'),
('Mary Wanjiku', '+254712000003', 'offline'),
('Brian Mutua', '+254712000004', 'offline');

-- Customers
INSERT INTO customers (phone, name) VALUES
('+254700000001', 'Alice'),
('+254700000002', 'Bob'),
('+254700000003', 'Carol');

-- Rides in different states
INSERT INTO rides (customer_id, pickup_location, dropoff_location, status) VALUES
(1, 'Yaya Centre', 'Valley Arcade', 'new'),
(2, 'Westgate Mall', 'Kilimani', 'new');

INSERT INTO rides (customer_id, rider_id, dispatcher_id, pickup_location, dropoff_location, status, assigned_at) VALUES
(3, 1, 2, 'Karen Hub', 'Ngong Road', 'assigned', NOW()),
(1, 2, 1, 'Sarit Centre', 'Parklands', 'in_progress', NOW());

INSERT INTO rides (customer_id, rider_id, dispatcher_id, pickup_location, dropoff_location, status, assigned_at) VALUES
(2, 1, 2, 'Junction Mall', 'Lavington', 'completed', NOW() - INTERVAL '2 hours');