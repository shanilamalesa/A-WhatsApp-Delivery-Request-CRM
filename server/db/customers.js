//this file finds and cretaes customers in the database


//importing db file, so we can open file path to database
const db = require("./index");


function findByPhone(phone){
    return db.prepare( "SELECT * FROM customers WHERE phone = ?").get(phone);
}

function createCustomer(phone, name){
    const result = db.prepare("INSERT INTO customers (phone, name) VALUES (?, ?)").run(phone, name);
    //returns the row just created and complete customres objects with all columns
    return findByPhone(phone);
}

//exporting the two function
module.exports = { findByPhone, createCustomer};