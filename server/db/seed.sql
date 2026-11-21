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

-- Sample WhatsApp chat history (shown in the dashboard detail panel)
INSERT INTO messages (customer_id, direction, content, created_at) VALUES
(1, 'inbound',  'Hi', NOW() - INTERVAL '30 minutes'),
(1, 'outbound', 'Hello! Welcome to Boda Dispatch 🛵 Where should we pick up your package from?', NOW() - INTERVAL '30 minutes'),
(1, 'inbound',  'Yaya Centre', NOW() - INTERVAL '29 minutes'),
(1, 'outbound', 'Got it! Where should we deliver to?', NOW() - INTERVAL '29 minutes'),
(1, 'inbound',  'Valley Arcade', NOW() - INTERVAL '28 minutes'),
(1, 'outbound', 'Request received! Your ride #1 has been created. A dispatcher will assign a rider shortly.', NOW() - INTERVAL '27 minutes'),
(2, 'inbound',  'Hello', NOW() - INTERVAL '20 minutes'),
(2, 'outbound', 'Hello! Welcome to Boda Dispatch 🛵 Where should we pick up your package from?', NOW() - INTERVAL '20 minutes'),
(2, 'inbound',  'Westgate Mall', NOW() - INTERVAL '19 minutes'),
(2, 'outbound', 'Got it! Where should we deliver to?', NOW() - INTERVAL '19 minutes'),
(2, 'inbound',  'Kilimani', NOW() - INTERVAL '18 minutes'),
(2, 'outbound', 'Request received! Your ride #2 has been created. A dispatcher will assign a rider shortly.', NOW() - INTERVAL '17 minutes'),
(3, 'inbound',  'Hi, I need a delivery', NOW() - INTERVAL '50 minutes'),
(3, 'outbound', 'Hello! Welcome to Boda Dispatch 🛵 Where should we pick up your package from?', NOW() - INTERVAL '50 minutes'),
(3, 'inbound',  'Karen Hub', NOW() - INTERVAL '49 minutes'),
(3, 'outbound', 'Got it! Where should we deliver to?', NOW() - INTERVAL '49 minutes'),
(3, 'inbound',  'Ngong Road', NOW() - INTERVAL '48 minutes'),
(3, 'outbound', 'Request received! Your ride #3 has been created. A dispatcher will assign a rider shortly.', NOW() - INTERVAL '47 minutes');