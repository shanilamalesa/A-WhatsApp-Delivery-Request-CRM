//importing db file, so we can open file path to database
const db = require("./index");

//Save every message (sent or received) 
function logMessage(customer_id, direction, content){
    db.prepare("INSERT INTO messages (customer_id, direction, content) VALUES (?, ?, ?)").run(customer_id, direction, content);

}

//fetches all the message belong to a customer
function getMessageByCustomer(customer_id){
    return db.prepare( "SELECT * FROM messages WHERE customer_id = ?").all(customer_id);
}


module.exports = {logMessage, getMessageByCustomer};