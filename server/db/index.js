//door to my Database

//package that talks to sqlite
const Database = require("better-sqlite3");
//built in Node moodule for building files paths
const path = require("path");

//opening  Database file (boda.db) in the server
const db = new Database(path.join(__dirname, "..", "boda.db"));


//runs SQL that doesn't return anything , for creating tables.
db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL UNIQUE,
        name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    

    CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        reference TEXT NOT NULL UNIQUE,
        pickup_location TEXT NOT NULL,
        dropoff_location TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        recipient_phone TEXT NOT NULL,
        package_description TEXT NOT NULL,
        urgency TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_rider TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        direction TEXT NOT NULL,
        content TEXT  NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL UNIQUE,
        state TEXT NOT NULL DEFAULT 'start',
        data TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`)

module.exports = db