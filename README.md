
Boda Dispatch

A WhatsApp-powered delivery request CRM for boda-boda operators in Nairobi.
Customers request deliveries via WhatsApp, and operators manage them via a web dashboard.

![Dashboard]<img width="1873" height="775" alt="image" src="https://github.com/user-attachments/assets/10a40a0a-5746-453f-a2ea-18afe2827c94" />

---

## Design Decisions

### Conversation State Storage
Conversation state is stored in a dedicated `conversations` table in the SQLite database. Each customer has one row that tracks their current step and collected data as JSON. This ensures the bot picks up exactly where it left off even if the server restarts.

### BD-XXXXX Reference Codes
Reference codes are generated using `Math.random().toString(36).substring(2, 7).toUpperCase()` prefixed with `BD-`. This produces short, readable codes like `BD-7VGLT` that customers can quote when following up.


### Install & Run

1. Clone the repo:
```bash
git clone https://github.com/shanilamalesa/boda-dispatch.git
cd boda-dispatch
```

2. Install dependencies:
```bash
cd server && npm install
cd ../client && npm install
```
3. Set up environment variables:
```bash
cd server
cp .env.example .env
```
Fill in your Meta credentials in `.env`.

4. Start the backend:
```bash
cd server && npm run dev


5. Start the frontend:
```bash
cd client && npm start
```


6. Expose backend with ngrok:
```bash
ngrok http 3001
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend |
| `npm start` | Start frontend |


# Boda Dispatch CRM — Week 12

A WhatsApp-based ride dispatch system for Jetlink Boda. Customers request rides via WhatsApp, dispatchers claim and manage them from a dashboard, and riders are auto-assigned by the system.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 18+

### Installation

1. Clone the repository and install dependencies:
```bash
   cd server
   npm install
```

2. Create a PostgreSQL database and user:
```bash
   psql -U postgres
   CREATE DATABASE boda_dispatch;
   CREATE USER boda_user WITH PASSWORD 'boda1234';
   GRANT ALL ON SCHEMA public TO boda_user;
   ALTER DATABASE boda_dispatch OWNER TO boda_user;
   \q
```

3. Copy `.env.example` to `.env` and fill in your values.

4. Reset the database (creates tables and seeds data):
```bash
   npm run db:reset
```

5. Start the server:
```bash
   npm run dev
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | boda_dispatch |
| `DB_USER` | Database user | boda_user |
| `DB_PASSWORD` | Database password | boda1234 |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | 1h |
| `BCRYPT_ROUNDS` | bcrypt hashing rounds | 12 |
| `META_VERIFY_TOKEN` | WhatsApp webhook verify token | — |
| `META_APP_SECRET` | WhatsApp app secret for HMAC | — |
| `WHATSAPP_TOKEN` | WhatsApp API access token | — |
| `PHONE_NUMBER_ID` | WhatsApp phone number ID | — |

---

## Database Reset

To wipe and rebuild the database with fresh seed data:

```bash
npm run db:reset
```

This runs `db/schema.sql` (creates tables) then `db/seed.sql` (inserts test data).

Seed data includes:
- 1 admin: `admin@jetlink.com` / `password123`
- 2 dispatchers: `dispatcher1@jetlink.com`, `dispatcher2@jetlink.com` / `password123`
- 4 riders (2 online, 2 offline)
- 5 rides in different states

---

## How Claiming Works

When a dispatcher clicks "Claim" on a new ride, the server opens a database transaction. Inside the transaction, it finds the best available rider and locks that rider's row using `FOR UPDATE` — this prevents any other simultaneous claim from picking the same rider. It then updates the ride status to `assigned` and records both the dispatcher and the rider. Finally it commits the transaction, releasing the lock.

If two dispatchers click "Claim" at the exact same moment, the first one gets the lock and completes the assignment. The second one waits until the lock is released, then picks the next best available rider. This means both dispatchers end up with different riders and no double-booking occurs. If no riders are online, the claim fails with a clear error message and the ride stays `new`.

---

## How Auto-Assignment Picks a Rider

When a ride is claimed, the system automatically selects the best available rider using this logic: it only considers riders whose status is `online`, then counts how many active rides (in `assigned` or `in_progress` status) each rider currently has. The rider with the fewest active rides is picked first — this spreads the workload evenly across all online riders.

If two riders have the same number of active rides, the system picks the one who was last assigned a ride longest ago, using `MAX(ride.assigned_at) ASC NULLS FIRST`. Riders with no previous assignments are prioritised. This ensures fair round-robin load balancing without any manual dispatcher input.

---

## How We Tested the Race Condition

To verify that two simultaneous claims cannot double-book a rider, we tested by sending two claim requests to the same ride at the same time from two terminal windows. The `FOR UPDATE` lock on the rider row ensures that only one transaction can proceed at a time — the second waits for the first to commit before it can read the rider table.

We also verified by checking the database after both requests completed — each ride had a different `rider_id`, confirming no double-booking occurred. The state machine provides a second layer of protection: the `WHERE status = 'new'` condition in the claim query means that if a ride was already claimed, the second update affects zero rows and returns a 409 error.

---

## Architecture
server/
config/         ← database connection
routes/         ← URL mapping only
controllers/    ← request/response handling
services/       ← business rules and state machine
repositories/   ← all SQL lives here only
middleware/      ← JWT authentication and role checks
db/
schema.sql      ← table definitions
seed.sql        ← test data


No SQL exists outside of `repositories/`. Verified with:
```bash
grep -r "SELECT " --include="*.js" --exclude-dir=node_modules ./routes ./controllers ./services
```