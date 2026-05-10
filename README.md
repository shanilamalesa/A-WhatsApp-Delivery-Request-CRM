
Boda Dispatch

A WhatsApp-powered delivery request CRM for boda-boda operators in Nairobi.
Customers request deliveries via WhatsApp, and operators manage them via a web dashboard.

---

## Design Decisions

### Conversation State Storage
Conversation state is stored in a dedicated `conversations` table in the SQLite database. Each customer has one row that tracks their current step and collected data as JSON. This ensures the bot picks up exactly where it left off even if the server restarts.

### BD-XXXXX Reference Codes
Reference codes are generated using `Math.random().toString(36).substring(2, 7).toUpperCase()` prefixed with `BD-`. This produces short, readable codes like `BD-7VGLT` that customers can quote when following up.




