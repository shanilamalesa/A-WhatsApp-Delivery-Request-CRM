const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { handleMessage } =  require("../services/bot");
dotenv.config();
const router = express.Router()


const META_APP_SECRET = process.env.META_APP_SECRET;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;


//webhook with meta when regestering
router.get("/", (req, res) =>{
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN){
        console.log("Webhook verified");
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});


// receives messages, verifies signature, extracts phone and text, calls bot
router.post("/", async (req, res) =>{
    console.log("Message received!", JSON.stringify(req.body));
    if (!verifySignature(req)) {
        console.warn("Invalid Webhook signature --- rejecting");
        return res.sendStatus(401);
    }

    res.sendStatus(200);

    try{
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages;
        const contacts = value?.contacts;

        if(!message || message.length === 0) return;

        for (const msg of message){
            const from = msg.from //customers pfone number
            const text = msg.text?.body // actual message text
            if (text) {
                await handleMessage(from, text)
            }
        }
    }catch(err){
        console.error("Error handling webhook:", err);
    }

});


//verify webhook with meta when regestering
function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256']
  if (!signature) return false
  const hash = 'sha256=' + crypto.createHmac('sha256', META_APP_SECRET)
    .update(req.rawBody)
    .digest('hex')
  return hash === signature
}

module.exports = router