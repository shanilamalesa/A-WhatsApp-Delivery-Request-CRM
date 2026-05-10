const db = require("./index");

function getConversation(customer_id){
    return db.prepare( "SELECT * FROM conversations WHERE customer_id = ?").get(customer_id);   
}

function upsertConversation (customer_id, state, data){
    return db.prepare("INSERT INTO conversations (customer_id, state, data) VALUES (?, ?, ?) ON CONFLICT(customer_id) DO UPDATE SET state = ?, data = ?, updated_at = CURRENT_TIMESTAMP").run(customer_id, state, data, state, data);
}

module.exports = { getConversation, upsertConversation};