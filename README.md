
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


