//this  file sends messages to Meta's API.

//Line 1-3 — bring in axios, dotenv, and load the .env file
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

//read our secret token and phone number ID from .env
const WHATSAPP_TOKEN = process.env.META_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

//async — marks a function as one that contains waiting operations
//await — wait here until this specific operation finishes
async function sendMessage (to, body){
    await axios.post(
         `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
         {
            messaging_product: "whatsapp",
            to: to,
            type: "text",
            text: { body: body}
         },
         {
            headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`}
         }
    )
}

module.exports = sendMessage